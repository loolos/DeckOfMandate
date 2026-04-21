import {
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  type Level2StartDraft,
} from "../app/level2Transition";
import {
  applyRemovedIndicesToLevel3Draft,
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
} from "../levels/sunking/chapter3Transition";
import { gameReducer, type GameAction } from "../app/gameReducer";
import { createInitialState } from "../app/initialState";
import { getChapter2StandaloneDraft } from "../data/levelBootstrap";
import { getLevelDef, isLevelId, type LevelId } from "../data/levels";
import { EVENT_SLOT_ORDER, type SlotId } from "../levels/types/event";
import type { GameState } from "../types/game";

/** Magic header bytes identifying a DeckOfMandate run code (binary format). */
export const RUN_CODE_MAGIC = [0xdc, 0x02] as const;

/** Legacy v1 header (level id encoded as single bit); still accepted by {@link decodeSession}. */
const RUN_CODE_MAGIC_V1 = [0xdc, 0x01] as const;

/** Action tag space; values are stable on-wire identifiers and must not change. */
const ACTION_TAG = {
  PLAY_CARD: 0x01,
  END_YEAR: 0x02,
  SOLVE_EVENT: 0x03,
  PICK_NANTES_TOLERANCE: 0x04,
  PICK_NANTES_CRACKDOWN: 0x05,
  PICK_LOCAL_WAR_ATTACK: 0x06,
  PICK_LOCAL_WAR_APPEASE: 0x07,
  SCRIPTED_EVENT_ATTACK: 0x08,
  CRACKDOWN_TARGET: 0x09,
  CRACKDOWN_CANCEL: 0x0a,
  CONFIRM_RETENTION: 0x0b,
  PICK_SUCCESSION_CRISIS: 0x0c,
  PICK_UTRECHT_TREATY: 0x0d,
  PICK_DUAL_FRONT_CRISIS: 0x0e,
} as const;

/** Action types that we never persist into the run code. */
const SKIPPED_ACTION_TYPES = new Set<GameAction["type"]>(["HYDRATE", "NEW_GAME", "APPEND_LOG_INFO"]);

export function shouldRecordAction(action: GameAction): boolean {
  return !SKIPPED_ACTION_TYPES.has(action.type);
}

/**
 * One play-through that begins from a deterministic initial state. A session is one or two of these
 * back-to-back: e.g. a Chapter-1 run followed by a Chapter-2 continuity run after refit.
 *
 * Chapter 2 runs (both standalone and continuity) start from a `Level2StartDraft` that lets the
 * player remove some carryover cards in the refit UI; we always serialize those removed indices
 * (computed against the deterministic `carryoverCards` order from
 * `createStandaloneLevel2Draft(seed)` or `createContinuityLevel2Draft(prevState, seed)`).
 */
export type RunRecord = {
  level: LevelId;
  mode: "standalone" | "continuity";
  seed: number;
  /** Deck-refit removals for chapter-2-style starts; empty when not used. */
  removedIndices: number[];
  actions: GameAction[];
};

export type SessionRecord = RunRecord[];

/** Whether removed-index bytes are written/read for this run (deck refit). */
function writesRefitRemovals(level: LevelId, mode: "standalone" | "continuity"): boolean {
  const b = getLevelDef(level).bootstrap;
  if (b === "chapter2Standalone") return true;
  if (b === "chapter3Standalone") return mode === "standalone";
  return level === "thirdMandate" && mode === "continuity";
}

const LEVEL_ID_BY_BIT_V1: readonly LevelId[] = ["firstMandate", "secondMandate"];

function bitToLevelV1(bit: 0 | 1): LevelId {
  return LEVEL_ID_BY_BIT_V1[bit]!;
}

function writeUtf8LevelId(w: ByteWriter, id: string): void {
  const enc = new TextEncoder().encode(id);
  w.pushVarUint(enc.length);
  for (const b of enc) w.pushU8(b);
}

function readUtf8LevelId(r: ByteReader): string {
  const len = r.readVarUint();
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = r.readU8();
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function slotToByte(slot: SlotId): number {
  const idx = EVENT_SLOT_ORDER.indexOf(slot);
  if (idx < 0) throw new Error(`runCode: unknown slot ${slot}`);
  return idx;
}

function byteToSlot(byte: number): SlotId {
  const slot = EVENT_SLOT_ORDER[byte];
  if (!slot) throw new Error(`runCode: byte ${byte} out of slot range`);
  return slot;
}

class ByteWriter {
  private buf: number[] = [];
  pushU8(v: number): void {
    if (v < 0 || v > 0xff || !Number.isInteger(v)) throw new Error(`runCode: bad u8 ${v}`);
    this.buf.push(v);
  }
  pushU32LE(v: number): void {
    const u = v >>> 0;
    this.buf.push(u & 0xff, (u >>> 8) & 0xff, (u >>> 16) & 0xff, (u >>> 24) & 0xff);
  }
  pushVarUint(v: number): void {
    if (v < 0 || !Number.isInteger(v)) throw new Error(`runCode: bad varuint ${v}`);
    let n = v;
    while (n >= 0x80) {
      this.buf.push((n & 0x7f) | 0x80);
      n = Math.floor(n / 0x80);
    }
    this.buf.push(n & 0x7f);
  }
  pushBytes(bs: readonly number[]): void {
    for (const b of bs) this.pushU8(b);
  }
  toBytes(): Uint8Array {
    return new Uint8Array(this.buf);
  }
}

class ByteReader {
  private pos = 0;
  constructor(private readonly bytes: Uint8Array) {}
  remaining(): number {
    return this.bytes.length - this.pos;
  }
  readU8(): number {
    if (this.pos >= this.bytes.length) throw new Error("runCode: unexpected end of stream");
    return this.bytes[this.pos++]!;
  }
  readU32LE(): number {
    const a = this.readU8();
    const b = this.readU8();
    const c = this.readU8();
    const d = this.readU8();
    return ((a | (b << 8) | (c << 16) | (d << 24)) >>> 0);
  }
  readVarUint(): number {
    let result = 0;
    let shift = 0;
    while (true) {
      const byte = this.readU8();
      result += (byte & 0x7f) * Math.pow(2, shift);
      if ((byte & 0x80) === 0) return result;
      shift += 7;
      if (shift > 35) throw new Error("runCode: varuint too long");
    }
  }
}

function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) {
    s += b.toString(16).padStart(2, "0");
  }
  return s;
}

function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/\s+/g, "").toLowerCase();
  if (cleaned.length === 0) throw new Error("runCode: empty input");
  if (cleaned.length % 2 !== 0) throw new Error("runCode: hex length must be even");
  if (!/^[0-9a-f]*$/.test(cleaned)) throw new Error("runCode: invalid hex characters");
  const out = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function writeAction(w: ByteWriter, a: GameAction): void {
  switch (a.type) {
    case "PLAY_CARD":
      w.pushU8(ACTION_TAG.PLAY_CARD);
      w.pushU8(a.handIndex & 0xff);
      return;
    case "END_YEAR":
      w.pushU8(ACTION_TAG.END_YEAR);
      return;
    case "SOLVE_EVENT":
      w.pushU8(ACTION_TAG.SOLVE_EVENT);
      w.pushU8(slotToByte(a.slot));
      return;
    case "PICK_NANTES_TOLERANCE":
      w.pushU8(ACTION_TAG.PICK_NANTES_TOLERANCE);
      w.pushU8(slotToByte(a.slot));
      return;
    case "PICK_NANTES_CRACKDOWN":
      w.pushU8(ACTION_TAG.PICK_NANTES_CRACKDOWN);
      w.pushU8(slotToByte(a.slot));
      return;
    case "PICK_LOCAL_WAR_ATTACK":
      w.pushU8(ACTION_TAG.PICK_LOCAL_WAR_ATTACK);
      w.pushU8(slotToByte(a.slot));
      return;
    case "PICK_LOCAL_WAR_APPEASE":
      w.pushU8(ACTION_TAG.PICK_LOCAL_WAR_APPEASE);
      w.pushU8(slotToByte(a.slot));
      return;
    case "SCRIPTED_EVENT_ATTACK":
      w.pushU8(ACTION_TAG.SCRIPTED_EVENT_ATTACK);
      w.pushU8(slotToByte(a.slot));
      return;
    case "CRACKDOWN_TARGET":
      w.pushU8(ACTION_TAG.CRACKDOWN_TARGET);
      w.pushU8(slotToByte(a.slot));
      return;
    case "CRACKDOWN_CANCEL":
      w.pushU8(ACTION_TAG.CRACKDOWN_CANCEL);
      return;
    case "PICK_SUCCESSION_CRISIS":
      w.pushU8(ACTION_TAG.PICK_SUCCESSION_CRISIS);
      w.pushU8(slotToByte(a.slot));
      w.pushU8(a.pay ? 1 : 0);
      return;
    case "PICK_UTRECHT_TREATY":
      w.pushU8(ACTION_TAG.PICK_UTRECHT_TREATY);
      w.pushU8(slotToByte(a.slot));
      w.pushU8(a.endWar ? 1 : 0);
      return;
    case "PICK_DUAL_FRONT_CRISIS":
      w.pushU8(ACTION_TAG.PICK_DUAL_FRONT_CRISIS);
      w.pushU8(slotToByte(a.slot));
      w.pushU8(a.expandWar ? 1 : 0);
      return;
    case "CONFIRM_RETENTION": {
      w.pushU8(ACTION_TAG.CONFIRM_RETENTION);
      // Retained ids are decoded against the live hand at replay time; encode as a bitmask
      // over the hand. We must therefore know the hand layout the encoder snapshot used.
      // The encoder caller passes an `extraContext`; we store the bitmask plus the hand size.
      const meta = (a as RetentionEncodedAction).__retentionMeta;
      if (!meta) throw new Error("runCode: CONFIRM_RETENTION requires __retentionMeta on encode");
      w.pushU8(meta.handLength & 0xff);
      const byteCount = Math.ceil(meta.handLength / 8);
      const bitmask = new Uint8Array(byteCount);
      for (const idx of meta.keepIndices) {
        if (idx < 0 || idx >= meta.handLength) {
          throw new Error(`runCode: retention index ${idx} out of range`);
        }
        bitmask[idx >> 3]! |= 1 << (idx & 7);
      }
      for (const b of bitmask) w.pushU8(b);
      return;
    }
    case "HYDRATE":
    case "NEW_GAME":
    case "APPEND_LOG_INFO":
      throw new Error(`runCode: cannot encode skipped action ${a.type}`);
    default: {
      const _never: never = a;
      throw new Error(`runCode: unknown action ${(_never as { type: string }).type}`);
    }
  }
}

/**
 * Encode-time annotation that lets us serialize CONFIRM_RETENTION as a bitmask over the
 * exact hand layout that was on-screen when the action fired (instance ids are not stable
 * across replays from a different starting state, but indices into the live hand are).
 */
type RetentionEncodedAction = GameAction & {
  __retentionMeta?: {
    handLength: number;
    keepIndices: number[];
  };
};

/**
 * Wrap a CONFIRM_RETENTION action so it can be encoded later. Call this AT DISPATCH TIME, with
 * the pre-dispatch state (whose `hand` is what the player saw).
 */
export function annotateConfirmRetention(
  action: Extract<GameAction, { type: "CONFIRM_RETENTION" }>,
  preDispatchState: GameState,
): GameAction {
  const handLength = preDispatchState.hand.length;
  const indexById = new Map<string, number>();
  preDispatchState.hand.forEach((id, i) => indexById.set(id, i));
  const keepIndices: number[] = [];
  for (const id of action.keepIds) {
    const idx = indexById.get(id);
    if (idx === undefined) {
      // Skipping unknown ids matches the reducer's own validation: it would refuse the action.
      // We still emit a (now invalid) record so replay surfaces the divergence loudly.
      continue;
    }
    keepIndices.push(idx);
  }
  keepIndices.sort((a, b) => a - b);
  const annotated: RetentionEncodedAction = { ...action, __retentionMeta: { handLength, keepIndices } };
  return annotated;
}

function readAction(r: ByteReader, currentHand: readonly string[]): GameAction {
  const tag = r.readU8();
  switch (tag) {
    case ACTION_TAG.PLAY_CARD:
      return { type: "PLAY_CARD", handIndex: r.readU8() };
    case ACTION_TAG.END_YEAR:
      return { type: "END_YEAR" };
    case ACTION_TAG.SOLVE_EVENT:
      return { type: "SOLVE_EVENT", slot: byteToSlot(r.readU8()) };
    case ACTION_TAG.PICK_NANTES_TOLERANCE:
      return { type: "PICK_NANTES_TOLERANCE", slot: byteToSlot(r.readU8()) };
    case ACTION_TAG.PICK_NANTES_CRACKDOWN:
      return { type: "PICK_NANTES_CRACKDOWN", slot: byteToSlot(r.readU8()) };
    case ACTION_TAG.PICK_LOCAL_WAR_ATTACK:
      return { type: "PICK_LOCAL_WAR_ATTACK", slot: byteToSlot(r.readU8()) };
    case ACTION_TAG.PICK_LOCAL_WAR_APPEASE:
      return { type: "PICK_LOCAL_WAR_APPEASE", slot: byteToSlot(r.readU8()) };
    case ACTION_TAG.SCRIPTED_EVENT_ATTACK:
      return { type: "SCRIPTED_EVENT_ATTACK", slot: byteToSlot(r.readU8()) };
    case ACTION_TAG.CRACKDOWN_TARGET:
      return { type: "CRACKDOWN_TARGET", slot: byteToSlot(r.readU8()) };
    case ACTION_TAG.CRACKDOWN_CANCEL:
      return { type: "CRACKDOWN_CANCEL" };
    case ACTION_TAG.PICK_SUCCESSION_CRISIS:
      return { type: "PICK_SUCCESSION_CRISIS", slot: byteToSlot(r.readU8()), pay: r.readU8() !== 0 };
    case ACTION_TAG.PICK_UTRECHT_TREATY:
      return { type: "PICK_UTRECHT_TREATY", slot: byteToSlot(r.readU8()), endWar: r.readU8() !== 0 };
    case ACTION_TAG.PICK_DUAL_FRONT_CRISIS:
      return { type: "PICK_DUAL_FRONT_CRISIS", slot: byteToSlot(r.readU8()), expandWar: r.readU8() !== 0 };
    case ACTION_TAG.CONFIRM_RETENTION: {
      const handLength = r.readU8();
      const byteCount = Math.ceil(handLength / 8);
      const keepIndices: number[] = [];
      for (let bi = 0; bi < byteCount; bi++) {
        const byte = r.readU8();
        for (let b = 0; b < 8; b++) {
          if ((byte >> b) & 1) {
            const idx = bi * 8 + b;
            if (idx < handLength) keepIndices.push(idx);
          }
        }
      }
      const keepIds = keepIndices
        .map((idx) => currentHand[idx])
        .filter((id): id is string => typeof id === "string");
      return { type: "CONFIRM_RETENTION", keepIds };
    }
    default:
      throw new Error(`runCode: unknown action tag 0x${tag.toString(16)}`);
  }
}

function writeRunRecord(w: ByteWriter, run: RunRecord): void {
  const cont = run.mode === "continuity" ? 1 : 0;
  w.pushU8(cont);
  writeUtf8LevelId(w, run.level);
  w.pushU32LE(run.seed >>> 0);
  if (writesRefitRemovals(run.level, run.mode)) {
    w.pushU8(run.removedIndices.length & 0xff);
    for (const idx of run.removedIndices) {
      w.pushU8(idx & 0xff);
    }
  }
  w.pushVarUint(run.actions.length);
  for (const a of run.actions) {
    writeAction(w, a);
  }
}

function readRunRecordV2(r: ByteReader, prevRunFinalState: GameState | null): {
  record: RunRecord;
  finalState: GameState;
} {
  const mode: "standalone" | "continuity" = r.readU8() !== 0 ? "continuity" : "standalone";
  const level = readUtf8LevelId(r);
  if (!isLevelId(level)) {
    throw new Error(`runCode: unknown level id ${level}`);
  }
  const seed = r.readU32LE();
  let removedIndices: number[] = [];
  if (writesRefitRemovals(level, mode)) {
    const count = r.readU8();
    for (let i = 0; i < count; i++) removedIndices.push(r.readU8());
  }
  if (mode === "continuity" && !writesRefitRemovals(level, mode)) {
    throw new Error("runCode: continuity mode is only valid for chapter-2-style levels");
  }
  if (mode === "continuity" && !prevRunFinalState) {
    throw new Error("runCode: continuity run requires a previous run");
  }

  let state = startStateFor(level, mode, seed, removedIndices, prevRunFinalState);
  const actionCount = r.readVarUint();
  const actions: GameAction[] = [];
  for (let i = 0; i < actionCount; i++) {
    const action = readAction(r, state.hand);
    actions.push(action);
    state = gameReducer(state, action);
  }
  const record: RunRecord = { level, mode, seed, removedIndices, actions };
  return { record, finalState: state };
}

function readRunRecordV1(r: ByteReader, prevRunFinalState: GameState | null): {
  record: RunRecord;
  finalState: GameState;
} {
  const flags = r.readU8();
  const levelBit = (flags & 0b01) as 0 | 1;
  const mode: "standalone" | "continuity" = (flags & 0b10) !== 0 ? "continuity" : "standalone";
  const level = bitToLevelV1(levelBit);
  const seed = r.readU32LE();
  let removedIndices: number[] = [];
  if (mode === "continuity" && level !== "secondMandate") {
    throw new Error("runCode: continuity mode is only valid for secondMandate");
  }
  if (mode === "continuity" && !prevRunFinalState) {
    throw new Error("runCode: continuity run requires a previous run");
  }
  if (level === "secondMandate") {
    const count = r.readU8();
    for (let i = 0; i < count; i++) removedIndices.push(r.readU8());
  }

  let state = startStateFor(level, mode, seed, removedIndices, prevRunFinalState);
  const actionCount = r.readVarUint();
  const actions: GameAction[] = [];
  for (let i = 0; i < actionCount; i++) {
    const action = readAction(r, state.hand);
    actions.push(action);
    state = gameReducer(state, action);
  }
  const record: RunRecord = { level, mode, seed, removedIndices, actions };
  return { record, finalState: state };
}

function startStateFor(
  level: LevelId,
  mode: "standalone" | "continuity",
  seed: number,
  removedIndices: readonly number[],
  prevFinalState: GameState | null,
): GameState {
  if (mode === "continuity") {
    if (!prevFinalState) throw new Error("runCode: continuity needs prev state");
    if (level === "thirdMandate") {
      const baseDraft = createContinuityLevel3Draft(prevFinalState, seed);
      const draft = applyRemovedIndicesToLevel3Draft(baseDraft, removedIndices);
      return buildLevel3StateFromDraft(draft);
    }
    const baseDraft = createContinuityLevel2Draft(prevFinalState, seed);
    const draft: Level2StartDraft = applyRemovedIndices(baseDraft, removedIndices);
    return buildLevel2StateFromDraft(draft);
  }
  const chapter2Draft = getChapter2StandaloneDraft(level, seed);
  if (chapter2Draft) {
    return buildLevel2StateFromDraft(applyRemovedIndices(chapter2Draft, removedIndices));
  }
  return createInitialState(seed, level);
}

function applyRemovedIndices(draft: Level2StartDraft, removedIndices: readonly number[]): Level2StartDraft {
  const removedIds: string[] = [];
  for (const idx of removedIndices) {
    const card = draft.carryoverCards[idx];
    if (!card) throw new Error(`runCode: removedIndex ${idx} out of range`);
    removedIds.push(card.instanceId);
  }
  return { ...draft, removedCarryoverIds: removedIds };
}

export function encodeSession(session: SessionRecord): string {
  if (session.length === 0) return "";
  const w = new ByteWriter();
  w.pushU8(RUN_CODE_MAGIC[0]);
  w.pushU8(RUN_CODE_MAGIC[1]);
  w.pushU8(session.length & 0xff);
  for (const run of session) {
    writeRunRecord(w, run);
  }
  return bytesToHex(w.toBytes());
}

export type DecodeResult = {
  session: SessionRecord;
  finalState: GameState;
};

export function decodeSession(hex: string): DecodeResult {
  const bytes = hexToBytes(hex);
  const r = new ByteReader(bytes);
  const m0 = r.readU8();
  const m1 = r.readU8();
  const v2 = m0 === RUN_CODE_MAGIC[0] && m1 === RUN_CODE_MAGIC[1];
  const v1 = m0 === RUN_CODE_MAGIC_V1[0] && m1 === RUN_CODE_MAGIC_V1[1];
  if (!v1 && !v2) {
    throw new Error("runCode: bad magic / version");
  }
  const runCount = r.readU8();
  if (runCount < 1 || runCount > 3) {
    throw new Error(`runCode: unsupported runCount ${runCount}`);
  }
  const session: RunRecord[] = [];
  let prevFinal: GameState | null = null;
  for (let i = 0; i < runCount; i++) {
    const decoded: { record: RunRecord; finalState: GameState } = v2
      ? readRunRecordV2(r, prevFinal)
      : readRunRecordV1(r, prevFinal);
    session.push(decoded.record);
    prevFinal = decoded.finalState;
  }
  if (r.remaining() !== 0) {
    throw new Error(`runCode: ${r.remaining()} trailing byte(s)`);
  }
  if (!prevFinal) throw new Error("runCode: empty session");
  return { session, finalState: prevFinal };
}

/** Replay an in-memory SessionRecord (without an intermediate hex round-trip). */
export function replaySession(session: SessionRecord): GameState {
  let prevFinal: GameState | null = null;
  for (const run of session) {
    const removed = writesRefitRemovals(run.level, run.mode) ? run.removedIndices : [];
    let state = startStateFor(run.level, run.mode, run.seed, removed, prevFinal);
    for (const action of run.actions) {
      state = gameReducer(state, action);
    }
    prevFinal = state;
  }
  if (!prevFinal) throw new Error("runCode: empty session");
  return prevFinal;
}

/** Helper: validate that a string is a level id we know about. */
export function isKnownLevelId(x: unknown): x is LevelId {
  return isLevelId(x);
}

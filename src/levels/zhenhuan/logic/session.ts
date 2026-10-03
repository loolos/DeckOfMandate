/**
 * 甄嬛传 sessions: one continuous play-through, 第一关 and (after 进入第二关) 第二关, like the Sun King
 * campaign's session of chapter records (design-stage2.md §3.2). The 第二关 record keeps its own seed
 * and a carry-over snapshot (清誉 / 圣宠), so replaying it never depends on replaying 第一关.
 *
 * Run codes: `ZH1-` (第一关 only, unchanged) and `ZH2-` (a session that reached 第二关).
 */
import { replay, type ZhAction, type ZhState } from "./engine";
import {
  clearSave as clearStage1Save,
  decodeAction,
  decodeRunCode as decodeStage1,
  encodeAction,
  encodeRunCode as encodeStage1,
  loadSave as loadStage1Save,
  saveAtTurnStart as saveStage1,
} from "./persistence";
import { newStage2, replay2, type Carry, type Z2Action, type Z2State } from "./stage2Engine";
import type { StoryId2 } from "../data/stage2Content";

export type Stage1Record = { readonly seed: number; readonly actions: readonly ZhAction[] };

export type Session =
  | { readonly stage: 1; readonly state: ZhState }
  | { readonly stage: 2; readonly state: Z2State; readonly stage1: Stage1Record | null };

export type Stage2Session = Extract<Session, { stage: 2 }>;

const SAVE2_KEY = "deck-of-mandate.zhenhuan.save.v2";
const RUN_CODE2_PREFIX = "ZH2-";

function encodeAction2(a: Z2Action): string {
  switch (a.type) {
    case "playCard":
      return `p${a.cardUid}`;
    case "chooseStory":
      return `s${a.storyId}.${a.optionId}`;
    case "removeStatus":
      return `r${a.statusUid}`;
    case "cancelPending":
      return "x";
    case "endTurn":
      return "e";
    case "explainTag":
      throw new Error("explainTag is never recorded");
  }
}

function decodeAction2(raw: string): Z2Action {
  const head = raw[0];
  const body = raw.slice(1);
  switch (head) {
    case "p":
      return { type: "playCard", cardUid: body };
    case "s": {
      const [storyId, optionId] = body.split(".");
      if (!storyId || !optionId) throw new Error(`未知操作：${raw}`);
      return { type: "chooseStory", storyId: storyId as StoryId2, optionId };
    }
    case "r":
      return { type: "removeStatus", statusUid: body };
    case "x":
      return { type: "cancelPending" };
    case "e":
      return { type: "endTurn" };
    default:
      throw new Error(`未知操作：${raw}`);
  }
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Text body: `1 <seed> <actions…> | 2 <seed> <q|-> <s|-> <actions…>`. */
function sessionBody(stage1: Stage1Record | null, s2: { seed: number; carry: Carry | null; actions: readonly Z2Action[] }): string {
  const parts: string[] = [];
  if (stage1) parts.push(["1", String(stage1.seed), ...stage1.actions.map(encodeAction)].join(" "));
  const carry = s2.carry ? [String(s2.carry.qingyu), String(s2.carry.shengchong)] : ["-", "-"];
  parts.push(["2", String(s2.seed), ...carry, ...s2.actions.map(encodeAction2)].join(" "));
  return parts.join(" | ");
}

type ParsedSession = { stage1: Stage1Record | null; seed: number; carry: Carry | null; actions: Z2Action[] };

function parseBody(body: string): ParsedSession {
  let stage1: Stage1Record | null = null;
  let stage2: ParsedSession | null = null;
  for (const part of body.split("|").map((p) => p.trim()).filter(Boolean)) {
    const [tag, seedText, ...rest] = part.split(" ").filter(Boolean);
    const seed = Number(seedText);
    if (!Number.isInteger(seed)) throw new Error("对局码格式错误");
    if (tag === "1") stage1 = { seed, actions: rest.map(decodeAction) };
    else if (tag === "2") {
      const [q, sc, ...acts] = rest;
      const carry = q === "-" || q == null ? null : { qingyu: Number(q), shengchong: Number(sc) };
      if (carry && (!Number.isInteger(carry.qingyu) || !Number.isInteger(carry.shengchong))) throw new Error("对局码格式错误");
      stage2 = { stage1: null, seed, carry, actions: acts.map(decodeAction2) };
    } else throw new Error("对局码格式错误");
  }
  if (!stage2) throw new Error("对局码格式错误");
  return { ...stage2, stage1 };
}

export function encodeSessionCode(session: Session): string {
  if (session.stage === 1) return encodeStage1(session.state);
  const st = session.state;
  return RUN_CODE2_PREFIX + toBase64Url(sessionBody(session.stage1, { seed: st.seed, carry: st.carry, actions: st.actions }));
}

export function decodeSessionCode(code: string): { ok: true; session: Session } | { ok: false; error: string } {
  const trimmed = code.trim();
  if (trimmed.startsWith(RUN_CODE2_PREFIX)) {
    try {
      const p = parseBody(fromBase64Url(trimmed.slice(RUN_CODE2_PREFIX.length)));
      if (p.stage1) replay(p.stage1.seed, p.stage1.actions); // validates the 第一关 part
      return { ok: true, session: { stage: 2, state: replay2(p.seed, p.carry, p.actions), stage1: p.stage1 } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "对局码格式错误" };
    }
  }
  const r = decodeStage1(trimmed);
  return r.ok ? { ok: true, session: { stage: 1, state: r.state } } : r;
}

/** 第一关 won → 第二关 with the carried 清誉 / 圣宠. */
export function continueToStage2(stage1: ZhState, seed: number): Stage2Session {
  const carry: Carry = { qingyu: stage1.qingyu, shengchong: stage1.shengchong };
  return { stage: 2, state: newStage2(seed, carry), stage1: { seed: stage1.seed, actions: stage1.actions } };
}

export function startStage2Standalone(seed: number): Stage2Session {
  return { stage: 2, state: newStage2(seed, null), stage1: null };
}

/** Autosave at turn start. Only one save exists at a time (the latest play-through). */
export function saveSession(session: Session): void {
  if (session.stage === 1) {
    clearSave2();
    saveStage1(session.state);
    return;
  }
  const st = session.state;
  const body = sessionBody(session.stage1, { seed: st.seed, carry: st.carry, actions: st.actions.slice(0, st.turnStartActionCount) });
  try {
    clearStage1Save();
    localStorage.setItem(SAVE2_KEY, body);
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SAVE2_KEY);
    if (raw) {
      const p = parseBody(raw);
      const state = replay2(p.seed, p.carry, p.actions);
      if (state.outcome === "playing") return { stage: 2, state, stage1: p.stage1 };
    }
  } catch {
    clearSave2();
  }
  const s1 = loadStage1Save();
  return s1 ? { stage: 1, state: s1 } : null;
}

function clearSave2(): void {
  try {
    localStorage.removeItem(SAVE2_KEY);
  } catch {
    /* ignore */
  }
}

export function clearSession(): void {
  clearSave2();
  clearStage1Save();
}

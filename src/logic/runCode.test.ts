import { describe, expect, it } from "vitest";
import { gameReducer, type GameAction } from "../app/gameReducer";
import { createInitialState } from "../app/initialState";
import {
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
} from "../app/level2Transition";
import type { GameState } from "../types/game";
import {
  annotateConfirmRetention,
  decodeSession,
  encodeSession,
  replaySession,
  shouldRecordAction,
  type RunRecord,
  type SessionRecord,
} from "./runCode";

/** Apply an action while annotating CONFIRM_RETENTION with the encoder hint. */
function dispatchAndRecord(
  state: GameState,
  action: GameAction,
  recorded: GameAction[],
): GameState {
  const next = gameReducer(state, action);
  if (shouldRecordAction(action)) {
    const stored = action.type === "CONFIRM_RETENTION" ? annotateConfirmRetention(action, state) : action;
    recorded.push(stored);
  }
  return next;
}

/** Compare game states ignoring the action log (which is recreated on replay anyway). */
function expectEquivalent(a: GameState, b: GameState): void {
  const stripLog = (s: GameState): Omit<GameState, "actionLog"> => {
    const { actionLog: _ignored, ...rest } = s;
    return rest;
  };
  expect(stripLog(a)).toEqual(stripLog(b));
}

describe("runCode", () => {
  it("encodes and decodes a fresh standalone first-mandate session with no actions", () => {
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: 12345, removedIndices: [], actions: [] },
    ];
    const hex = encodeSession(session);
    expect(hex).toMatch(/^[0-9a-f]+$/);
    const decoded = decodeSession(hex);
    expect(decoded.session).toEqual(session);
    expect(decoded.finalState.runSeed).toBe(createInitialState(12345, "firstMandate").runSeed);
  });

  it("round-trips a chapter-1 run through several END_YEAR turns", () => {
    const seed = 0xa1b2c3d4 >>> 0;
    let state = createInitialState(seed, "firstMandate");
    const recorded: GameAction[] = [];
    for (let turn = 0; turn < 4; turn++) {
      state = dispatchAndRecord(state, { type: "END_YEAR" }, recorded);
      if (state.phase === "retention") {
        state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds: [] }, recorded);
      }
      if (state.outcome !== "playing") break;
    }
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: recorded },
    ];
    const hex = encodeSession(session);
    const decoded = decodeSession(hex);
    expectEquivalent(decoded.finalState, state);
    expect(replaySession(session)).toBeDefined();
    expectEquivalent(replaySession(session), state);
  });

  it("round-trips PLAY_CARD actions in a chapter-1 run", () => {
    const seed = 99_001;
    let state = createInitialState(seed, "firstMandate");
    const recorded: GameAction[] = [];
    let cards = 0;
    for (let i = 0; i < state.hand.length && cards < 2; i++) {
      const before = state;
      state = dispatchAndRecord(state, { type: "PLAY_CARD", handIndex: 0 }, recorded);
      if (state !== before) cards++;
      if (state.pendingInteraction) {
        state = dispatchAndRecord(state, { type: "CRACKDOWN_CANCEL" }, recorded);
      }
    }
    state = dispatchAndRecord(state, { type: "END_YEAR" }, recorded);
    if (state.phase === "retention") {
      state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds: [] }, recorded);
    }
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: recorded },
    ];
    expectEquivalent(replaySession(session), state);
    expectEquivalent(decodeSession(encodeSession(session)).finalState, state);
  });

  it("CONFIRM_RETENTION bitmask preserves the selected indices through encode/decode", () => {
    // The natural reducer flow rarely triggers retention from a single END_YEAR (hand size
    // is usually <= legitimacy). For the bitmask path we hand-craft the action with explicit
    // index metadata and assert the decoder rebuilds the same indices using the same hand.
    const seed = 0xfeed;
    const start = createInitialState(seed, "firstMandate");
    expect(start.hand.length).toBeGreaterThanOrEqual(2);
    const handSnapshot: GameState = { ...start, hand: [...start.hand] };
    const keepIds = [start.hand[0]!, start.hand[start.hand.length - 1]!];
    const annotated = annotateConfirmRetention(
      { type: "CONFIRM_RETENTION", keepIds },
      handSnapshot,
    );
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: [annotated] },
    ];
    const decoded = decodeSession(encodeSession(session));
    const decodedAction = decoded.session[0]!.actions[0]!;
    expect(decodedAction.type).toBe("CONFIRM_RETENTION");
    if (decodedAction.type === "CONFIRM_RETENTION") {
      expect(decodedAction.keepIds.length).toBe(keepIds.length);
      // Indices preserved → since the start state's hand is identical (no preceding actions),
      // decoded keepIds must match the originals exactly.
      expect(new Set(decodedAction.keepIds)).toEqual(new Set(keepIds));
    }
  });

  it("encodes and decodes a standalone secondMandate session", () => {
    const seed = 22_222;
    let state = buildLevel2StateFromDraft(createStandaloneLevel2Draft(seed));
    const recorded: GameAction[] = [];
    state = dispatchAndRecord(state, { type: "END_YEAR" }, recorded);
    if (state.phase === "retention") {
      state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds: [] }, recorded);
    }
    const session: SessionRecord = [
      { level: "secondMandate", mode: "standalone", seed, removedIndices: [], actions: recorded },
    ];
    expectEquivalent(decodeSession(encodeSession(session)).finalState, state);
    expectEquivalent(replaySession(session), state);
  });

  it("encodes and decodes a chapter-1 + chapter-2-continuity session", () => {
    const seed1 = 0x11_22_33_44 >>> 0;
    let state = createInitialState(seed1, "firstMandate");
    const recorded1: GameAction[] = [];
    for (let i = 0; i < 3 && state.outcome === "playing"; i++) {
      state = dispatchAndRecord(state, { type: "END_YEAR" }, recorded1);
      if (state.phase === "retention") {
        state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds: [] }, recorded1);
      }
    }
    const chapter1End = state;

    const seed2 = 0xdead_beef >>> 0;
    const baseDraft = createContinuityLevel2Draft(chapter1End, seed2);
    // Remove the first one or two carryover cards to exercise the removedIndices encoding.
    const removedIndices = baseDraft.carryoverCards.length >= 2 ? [0, 1] : [0];
    const removedIds = removedIndices.map((idx) => baseDraft.carryoverCards[idx]!.instanceId);
    const draft = { ...baseDraft, removedCarryoverIds: removedIds };
    let state2 = buildLevel2StateFromDraft(draft);
    const recorded2: GameAction[] = [];
    for (let i = 0; i < 2 && state2.outcome === "playing"; i++) {
      state2 = dispatchAndRecord(state2, { type: "END_YEAR" }, recorded2);
      if (state2.phase === "retention") {
        state2 = dispatchAndRecord(state2, { type: "CONFIRM_RETENTION", keepIds: [] }, recorded2);
      }
    }

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: seed1, removedIndices: [], actions: recorded1 },
      {
        level: "secondMandate",
        mode: "continuity",
        seed: seed2,
        removedIndices,
        actions: recorded2,
      },
    ];
    expectEquivalent(replaySession(session), state2);
    expectEquivalent(decodeSession(encodeSession(session)).finalState, state2);
  });

  it("rejects malformed hex input", () => {
    expect(() => decodeSession("")).toThrow();
    expect(() => decodeSession("zzz")).toThrow();
    expect(() => decodeSession("abc")).toThrow(); // odd length
    expect(() => decodeSession("0000")).toThrow(); // wrong magic
  });

  it("rejects extra trailing bytes", () => {
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: 1, removedIndices: [], actions: [] },
    ];
    const hex = encodeSession(session);
    expect(() => decodeSession(hex + "ff")).toThrow(/trailing/);
  });

  it("preserves the seed exactly across encode/decode", () => {
    const seeds = [0, 1, 0x7fffffff, 0xffffffff, 0x9e3779b9];
    for (const s of seeds) {
      const session: SessionRecord = [
        { level: "firstMandate", mode: "standalone", seed: s >>> 0, removedIndices: [], actions: [] },
      ];
      const round: RunRecord = decodeSession(encodeSession(session)).session[0]!;
      expect(round.seed).toBe(s >>> 0);
    }
  });

  it("does not record HYDRATE / NEW_GAME / APPEND_LOG_INFO actions", () => {
    expect(shouldRecordAction({ type: "HYDRATE", state: createInitialState(1) })).toBe(false);
    expect(shouldRecordAction({ type: "NEW_GAME" })).toBe(false);
    expect(
      shouldRecordAction({ type: "APPEND_LOG_INFO", infoKey: "firstMandateInflationActivated" }),
    ).toBe(false);
    expect(shouldRecordAction({ type: "END_YEAR" })).toBe(true);
  });
});

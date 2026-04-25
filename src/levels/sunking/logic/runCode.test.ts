import { describe, expect, it } from "vitest";
import { gameReducer, type GameAction } from "../../../app/gameReducer";
import { createInitialState } from "../../../app/initialState";
import {
  buildLevel2StateFromDraft,
  buildLevel3StateFromDraft,
  createContinuityLevel2Draft,
  createContinuityLevel3Draft,
  createStandaloneLevel2Draft,
  createStandaloneLevel3Draft,
} from "../../../app/levelTransitions";
import type { GameState } from "../../../types/game";
import {
  annotateConfirmRetention,
  decodeSession,
  encodeSession,
  replaySession,
  shouldRecordAction,
  type RunRecord,
  type SessionRecord,
} from "../../../logic/runCode";

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

function expectReloadable(hex: string, expectedState?: GameState, cycles = 3): void {
  let currentHex = hex;
  const expected = expectedState ?? decodeSession(currentHex).finalState;
  for (let i = 0; i < cycles; i++) {
    const decoded = decodeSession(currentHex);
    expectEquivalent(decoded.finalState, expected);
    currentHex = encodeSession(decoded.session);
  }
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

  it("can re-encode a decoded session containing CONFIRM_RETENTION (regression)", () => {
    const seed = 0x5eed;
    let state = createInitialState(seed, "firstMandate");
    const recorded: GameAction[] = [];
    let guard = 0;
    while (state.phase !== "retention" && state.outcome === "playing" && guard < 12) {
      state = dispatchAndRecord(state, { type: "END_YEAR" }, recorded);
      guard++;
    }
    expect(state.phase).toBe("retention");
    const keepIds = state.hand.slice(0, Math.min(1, state.hand.length));
    state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds }, recorded);

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: recorded },
    ];
    const firstHex = encodeSession(session);
    const decodedOnce = decodeSession(firstHex);

    expect(() => encodeSession(decodedOnce.session)).not.toThrow();
    const decodedTwice = decodeSession(encodeSession(decodedOnce.session));
    expectEquivalent(decodedTwice.finalState, state);
  });

  it("reloads varied generated load codes repeatedly", () => {
    const cases: Array<{ name: string; session: SessionRecord; finalState: GameState }> = [];

    {
      const seed = 0x1001;
      const finalState = createInitialState(seed, "firstMandate");
      cases.push({
        name: "fresh first mandate",
        session: [{ level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: [] }],
        finalState,
      });
    }

    {
      const seed = 0x1002;
      let state = createInitialState(seed, "firstMandate");
      const actions: GameAction[] = [];
      for (let i = 0; i < 7 && state.outcome === "playing"; i++) {
        state = dispatchAndRecord(state, { type: "END_YEAR" }, actions);
        if (state.phase === "retention") {
          const keepIds = state.hand.slice(0, Math.min(1, state.hand.length));
          state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds }, actions);
        }
      }
      cases.push({
        name: "mid first mandate with retention",
        session: [{ level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions }],
        finalState: state,
      });
    }

    {
      const seed = 0x2001;
      const baseDraft = createStandaloneLevel2Draft(seed);
      const removedIndices = [0, 2].filter((idx) => idx < baseDraft.carryoverCards.length);
      const removedIds = removedIndices.map((idx) => baseDraft.carryoverCards[idx]!.instanceId);
      let state = buildLevel2StateFromDraft({ ...baseDraft, removedCarryoverIds: removedIds });
      const actions: GameAction[] = [];
      for (let i = 0; i < 4 && state.outcome === "playing"; i++) {
        state = dispatchAndRecord(state, { type: "END_YEAR" }, actions);
        if (state.phase === "retention") {
          state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds: [] }, actions);
        }
      }
      cases.push({
        name: "standalone second mandate refit",
        session: [{ level: "secondMandate", mode: "standalone", seed, removedIndices, actions }],
        finalState: state,
      });
    }

    {
      const seed = 0x3001;
      const baseDraft = createStandaloneLevel3Draft(seed);
      const removedIndices = [1, 3].filter((idx) => idx < baseDraft.carryoverCards.length);
      const removedIds = removedIndices.map((idx) => baseDraft.carryoverCards[idx]!.instanceId);
      let state = buildLevel3StateFromDraft({ ...baseDraft, removedCarryoverIds: removedIds });
      const actions: GameAction[] = [];
      for (let i = 0; i < 3 && state.outcome === "playing"; i++) {
        state = dispatchAndRecord(state, { type: "END_YEAR" }, actions);
        if (state.phase === "retention") {
          state = dispatchAndRecord(state, { type: "CONFIRM_RETENTION", keepIds: [] }, actions);
        }
      }
      cases.push({
        name: "standalone third mandate refit",
        session: [{ level: "thirdMandate", mode: "standalone", seed, removedIndices, actions }],
        finalState: state,
      });
    }

    {
      const seed1 = 0x4001;
      let state1 = createInitialState(seed1, "firstMandate");
      const actions1: GameAction[] = [];
      for (let i = 0; i < 5 && state1.outcome === "playing"; i++) {
        state1 = dispatchAndRecord(state1, { type: "END_YEAR" }, actions1);
        if (state1.phase === "retention") {
          state1 = dispatchAndRecord(state1, { type: "CONFIRM_RETENTION", keepIds: [] }, actions1);
        }
      }

      const seed2 = 0x4002;
      const baseDraft2 = createContinuityLevel2Draft(state1, seed2);
      const removedIndices2 = [0].filter((idx) => idx < baseDraft2.carryoverCards.length);
      const removedIds2 = removedIndices2.map((idx) => baseDraft2.carryoverCards[idx]!.instanceId);
      let state2 = buildLevel2StateFromDraft({ ...baseDraft2, removedCarryoverIds: removedIds2 });
      const actions2: GameAction[] = [];
      for (let i = 0; i < 4 && state2.outcome === "playing"; i++) {
        state2 = dispatchAndRecord(state2, { type: "END_YEAR" }, actions2);
        if (state2.phase === "retention") {
          state2 = dispatchAndRecord(state2, { type: "CONFIRM_RETENTION", keepIds: [] }, actions2);
        }
      }

      const seed3 = 0x4003;
      const baseDraft3 = createContinuityLevel3Draft(state2, seed3);
      const removedIndices3 = [0].filter((idx) => idx < baseDraft3.carryoverCards.length);
      const removedIds3 = removedIndices3.map((idx) => baseDraft3.carryoverCards[idx]!.instanceId);
      let state3 = buildLevel3StateFromDraft({ ...baseDraft3, removedCarryoverIds: removedIds3 });
      const actions3: GameAction[] = [];
      state3 = dispatchAndRecord(state3, { type: "END_YEAR" }, actions3);
      if (state3.phase === "retention") {
        state3 = dispatchAndRecord(state3, { type: "CONFIRM_RETENTION", keepIds: [] }, actions3);
      }

      cases.push({
        name: "first-to-third continuity",
        session: [
          { level: "firstMandate", mode: "standalone", seed: seed1, removedIndices: [], actions: actions1 },
          { level: "secondMandate", mode: "continuity", seed: seed2, removedIndices: removedIndices2, actions: actions2 },
          { level: "thirdMandate", mode: "continuity", seed: seed3, removedIndices: removedIndices3, actions: actions3 },
        ],
        finalState: state3,
      });
    }

    expect(cases).toHaveLength(5);
    for (const c of cases) {
      const hex = encodeSession(c.session);
      expect(hex.length, c.name).toBeGreaterThan(0);
      expectReloadable(hex, c.finalState);
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

  it("accepts hex with 0x prefix and non-hex separators (same bytes as plain hex)", () => {
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: 0x10030003 >>> 0, removedIndices: [], actions: [] },
    ];
    const plain = encodeSession(session);
    const spaced = plain.match(/.{1,2}/g)!.join(" ");
    expect(decodeSession(`0x${plain}`).session).toEqual(decodeSession(plain).session);
    expect(decodeSession(spaced).session).toEqual(decodeSession(plain).session);
  });

  it("decodes a long firstMandate session hex (regression)", () => {
    const hex =
      "dc0201000c66697273744d616e646174650c64746d100300030102030001000100020b03050103090001010101020300010102";
    const decoded = decodeSession(hex);
    expect(decoded.session[0]?.level).toBe("firstMandate");
    expect(decoded.session[0]?.actions.length).toBeGreaterThan(0);
  });

  /**
   * Mirrors the old Game.tsx bug: recording used `gameReducer(state, a)` with a stale `state`
   * for every action in the same event tick. After PLAY_CARD (crackdown), CRACKDOWN_CANCEL must
   * be predicted from the post-play state or it is wrongly treated as a no-op and omitted.
   */
  it("chains predicted state when recording crackdown play + cancel (regression)", () => {
    let found: { seed: number; s0: GameState } | null = null;
    for (let seed = 0; seed < 50_000; seed++) {
      const s0 = createInitialState(seed, "firstMandate");
      const id0 = s0.hand[0];
      if (!id0) continue;
      const inst = s0.cardsById[id0];
      if (!inst || inst.templateId !== "crackdown") continue;
      const s1 = gameReducer(s0, { type: "PLAY_CARD", handIndex: 0 });
      if (s1 === s0 || s1.pendingInteraction?.type !== "crackdownPick") continue;
      const s2 = gameReducer(s1, { type: "CRACKDOWN_CANCEL" });
      if (s2 !== s1) {
        found = { seed, s0 };
        break;
      }
    }
    if (!found) {
      throw new Error("expected a seed with crackdown at index 0 and cancellable pick");
    }
    const { seed, s0 } = found!;
    const play: GameAction = { type: "PLAY_CARD", handIndex: 0 };
    const cancel: GameAction = { type: "CRACKDOWN_CANCEL" };

    const staleRecorded: GameAction[] = [];
    if (shouldRecordAction(play)) {
      const n1 = gameReducer(s0, play);
      if (n1 !== s0) staleRecorded.push(play);
    }
    if (shouldRecordAction(cancel)) {
      const n2 = gameReducer(s0, cancel);
      if (n2 !== s0) staleRecorded.push(cancel);
    }
    expect(staleRecorded.length).toBe(1);

    let pending = s0;
    const chainedRecorded: GameAction[] = [];
    for (const a of [play, cancel]) {
      const next = gameReducer(pending, a);
      if (shouldRecordAction(a) && next !== pending) {
        chainedRecorded.push(a);
      }
      pending = next;
    }
    expect(chainedRecorded).toEqual([play, cancel]);

    const sessionStale: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: staleRecorded },
    ];
    const sessionChained: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: chainedRecorded },
    ];
    expect(() => replaySession(sessionStale)).not.toThrow();
    expect(() => replaySession(sessionChained)).not.toThrow();
    const finalStale = replaySession(sessionStale);
    const finalChained = replaySession(sessionChained);
    const finalExpected = gameReducer(gameReducer(s0, play), cancel);
    expectEquivalent(finalChained, finalExpected);
    expectEquivalent(finalStale, gameReducer(s0, play));
  });
});

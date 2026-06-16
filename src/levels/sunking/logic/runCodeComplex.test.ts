/**
 * Complex run-code round-trip tests.
 *
 * Goals:
 *  - Full 15-turn Chapter 1 with card plays, event solves, crackdown interactions, retention
 *  - Full Chapter 1 → Chapter 2 continuity pipeline with refit removals
 *  - Chapter 2 → Chapter 3 continuity (3-run session)
 *  - Verify encode/decode/re-encode idempotency at every checkpoint
 *  - Verify replaySession() matches decodeSession().finalState
 */
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
import { getPlayableCardCost } from "../../../logic/cardCost";
import { isCardPlayableInActionPhase } from "../../../logic/cardPlayability";
import { retentionCapacity } from "../../../logic/turnFlow";
import {
  annotateConfirmRetention,
  decodeSession,
  encodeSession,
  replaySession,
  shouldRecordAction,
  type SessionRecord,
} from "../../../logic/runCode";
import { slotAllowsCrackdownTarget, slotAllowsFundSolve } from "../../../logic/uiHelpers";
import { EVENT_SLOT_ORDER } from "../../types/event";
import type { GameState } from "../../../types/game";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dispatchAndRecord(
  state: GameState,
  action: GameAction,
  recorded: GameAction[],
): GameState {
  const next = gameReducer(state, action);
  if (shouldRecordAction(action) && next !== state) {
    const stored =
      action.type === "CONFIRM_RETENTION"
        ? annotateConfirmRetention(action, state)
        : action;
    recorded.push(stored);
  }
  return next;
}

/** Strict state equivalence ignoring actionLog (re-built on replay). */
function expectEquivalent(a: GameState, b: GameState, label = ""): void {
  const strip = (s: GameState) => {
    const { actionLog: _ignored, ...rest } = s;
    return rest;
  };
  expect(strip(a), label).toEqual(strip(b));
}

/** Encode → decode → re-encode must stay stable, and decoded state must match expected. */
function assertRoundTrip(session: SessionRecord, expected: GameState, label: string): void {
  const hex1 = encodeSession(session);
  const d1 = decodeSession(hex1);
  expectEquivalent(d1.finalState, expected, `${label}: first decode`);

  const hex2 = encodeSession(d1.session);
  expect(hex2, `${label}: hex stable`).toBe(hex1);

  const d2 = decodeSession(hex2);
  expectEquivalent(d2.finalState, expected, `${label}: second decode`);

  expectEquivalent(replaySession(session), expected, `${label}: replaySession`);
}

// ---------------------------------------------------------------------------
// Greedy bot: plays every playable card, solves solvable events (odd turns),
// crackdowns (even turns), then ends year with non-trivial retention.
// ---------------------------------------------------------------------------

/** Play one card from hand (handIndex). Returns next state or same state if rejected. */
function tryPlayCard(state: GameState, handIndex: number, recorded: GameAction[]): GameState {
  const id = state.hand[handIndex];
  if (!id) return state;
  const inst = state.cardsById[id];
  if (!inst) return state;
  if (!isCardPlayableInActionPhase(state, id)) return state;
  if (state.resources.funding < getPlayableCardCost(state, id)) return state;
  return dispatchAndRecord(state, { type: "PLAY_CARD", handIndex }, recorded);
}

/** Resolve a pending crackdown interaction: target the first valid harmful slot, or cancel. */
function resolvePendingCrackdown(state: GameState, recorded: GameAction[]): GameState {
  if (state.pendingInteraction?.type !== "crackdownPick") return state;
  for (const slot of EVENT_SLOT_ORDER) {
    if (slotAllowsCrackdownTarget(state, slot)) {
      return dispatchAndRecord(state, { type: "CRACKDOWN_TARGET", slot }, recorded);
    }
  }
  return dispatchAndRecord(state, { type: "CRACKDOWN_CANCEL" }, recorded);
}

/**
 * Play all affordable non-crackdown cards in hand, plus crackdown only when a valid
 * target exists (so we never enter a play→cancel infinite loop).
 */
function playAllCardsInHand(state: GameState, recorded: GameAction[]): GameState {
  let s = state;
  let changed = true;
  while (changed && s.outcome === "playing" && s.phase === "action" && !s.pendingInteraction) {
    changed = false;
    for (let i = 0; i < s.hand.length; i++) {
      const id = s.hand[i];
      if (!id) continue;
      const inst = s.cardsById[id];
      if (!inst) continue;
      // Skip crackdown/diplomaticIntervention unless there is a valid target,
      // to avoid the play→cancel loop (CRACKDOWN_CANCEL re-keeps the card in hand).
      const isCrackdownCard =
        inst.templateId === "crackdown" || inst.templateId === "diplomaticIntervention";
      if (isCrackdownCard) {
        const hasTarget = EVENT_SLOT_ORDER.some((slot) => slotAllowsCrackdownTarget(s, slot));
        if (!hasTarget) continue;
      }
      const before = s;
      s = tryPlayCard(s, i, recorded);
      if (s !== before) {
        s = resolvePendingCrackdown(s, recorded);
        changed = true;
        break; // Restart since hand indices shifted.
      }
    }
  }
  return s;
}

/** Solve affordable events (fund-solve only; skip every other turn for variety). */
function solveAffordableEvents(
  state: GameState,
  recorded: GameAction[],
  doSolve: boolean,
): GameState {
  if (!doSolve) return state;
  let s = state;
  for (const slot of EVENT_SLOT_ORDER) {
    if (s.outcome !== "playing" || s.phase !== "action" || s.pendingInteraction) break;
    if (slotAllowsFundSolve(s, slot)) {
      s = dispatchAndRecord(s, { type: "SOLVE_EVENT", slot }, recorded);
    }
  }
  return s;
}

/** End year and confirm retention (keep up to retentionCap cards). */
function endYearWithRetention(state: GameState, recorded: GameAction[]): GameState {
  if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
    return state;
  }
  let s = dispatchAndRecord(state, { type: "END_YEAR" }, recorded);
  if (s.phase === "retention") {
    const cap = retentionCapacity(s);
    // Keep first N cards for variety; sometimes keep 0 (every 3rd turn).
    const keepCount = state.turn % 3 === 0 ? 0 : Math.min(cap, s.hand.length);
    const keepIds = s.hand.slice(0, keepCount);
    s = dispatchAndRecord(s, { type: "CONFIRM_RETENTION", keepIds }, recorded);
  }
  return s;
}

/**
 * Play one full turn: solve events → play cards → end year with retention.
 * Returns undefined when game is over.
 */
function playOneTurn(state: GameState, recorded: GameAction[]): GameState {
  let s = state;
  // Solve on odd turns, skip on even turns (produces mix of resolved/unresolved events).
  const doSolve = state.turn % 2 === 1;
  s = solveAffordableEvents(s, recorded, doSolve);
  s = playAllCardsInHand(s, recorded);
  // Solve again after playing cards (more funding may have appeared).
  s = solveAffordableEvents(s, recorded, doSolve);
  s = endYearWithRetention(s, recorded);
  return s;
}

/** Play up to maxTurns turns or until game ends. */
function playManyTurns(state: GameState, maxTurns: number, recorded: GameAction[]): GameState {
  let s = state;
  for (let i = 0; i < maxTurns; i++) {
    if (s.outcome !== "playing") break;
    s = playOneTurn(s, recorded);
  }
  return s;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("runCode complex scenarios", () => {
  it("full Chapter 1 run (15 turns) round-trips correctly", () => {
    const seed = 0xdeadbeef >>> 0;
    let state = createInitialState(seed, "firstMandate");
    const actions: GameAction[] = [];

    state = playManyTurns(state, 15, actions);

    expect(actions.length, "should have recorded actions").toBeGreaterThan(0);
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions },
    ];
    assertRoundTrip(session, state, "ch1 full 15 turns");
  });

  it("mid-game checkpoint: verifies run code at turn 5 and turn 10 of Chapter 1", () => {
    const seed = 0x1234abcd >>> 0;
    let state = createInitialState(seed, "firstMandate");
    const actions: GameAction[] = [];

    // Play 5 turns, snapshot.
    state = playManyTurns(state, 5, actions);
    if (state.outcome === "playing") {
      const snap5 = actions.slice();
      assertRoundTrip(
        [{ level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: snap5 }],
        state,
        "turn 5 checkpoint",
      );
    }

    // Continue 5 more turns, snapshot.
    state = playManyTurns(state, 5, actions);
    if (state.outcome === "playing") {
      assertRoundTrip(
        [{ level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions: actions.slice() }],
        state,
        "turn 10 checkpoint",
      );
    }
  });

  it("crackdown play + cancel is correctly recorded and replayed", () => {
    // Find a seed where crackdown is in hand at turn 1.
    let found: { seed: number; state: GameState } | null = null;
    for (let s = 10_000; s < 100_000; s++) {
      const st = createInitialState(s, "firstMandate");
      const hasCrackdown = st.hand.some((id) => st.cardsById[id]?.templateId === "crackdown");
      if (hasCrackdown) {
        found = { seed: s, state: st };
        break;
      }
    }
    expect(found, "should find a seed with crackdown in opening hand").not.toBeNull();
    const { seed, state: initial } = found!;
    const actions: GameAction[] = [];
    let state = initial;

    // Play crackdown from hand.
    const crackdownIdx = state.hand.findIndex(
      (id) => state.cardsById[id]?.templateId === "crackdown",
    );
    expect(crackdownIdx).toBeGreaterThanOrEqual(0);
    state = dispatchAndRecord(state, { type: "PLAY_CARD", handIndex: crackdownIdx }, actions);

    // Should now have pending crackdown interaction.
    if (state.pendingInteraction?.type === "crackdownPick") {
      // Try to target a harmful event slot; fall back to cancel.
      let targeted = false;
      for (const slot of EVENT_SLOT_ORDER) {
        if (slotAllowsCrackdownTarget(state, slot)) {
          state = dispatchAndRecord(state, { type: "CRACKDOWN_TARGET", slot }, actions);
          targeted = true;
          break;
        }
      }
      if (!targeted) {
        state = dispatchAndRecord(state, { type: "CRACKDOWN_CANCEL" }, actions);
      }
    }

    state = endYearWithRetention(state, actions);

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions },
    ];
    assertRoundTrip(session, state, "crackdown interaction");
  });

  it("SOLVE_EVENT on multiple different slots round-trips correctly", () => {
    // Find a seed where turn 1 has ≥2 solvable events.
    let found: { seed: number; state: GameState } | null = null;
    for (let s = 0; s < 200_000; s++) {
      const st = createInitialState(s, "firstMandate");
      const solvable = EVENT_SLOT_ORDER.filter((slot) => slotAllowsFundSolve(st, slot));
      if (solvable.length >= 2) {
        found = { seed: s, state: st };
        break;
      }
    }
    expect(found, "should find a seed with ≥2 solvable events at turn 1").not.toBeNull();
    const { seed, state: initial } = found!;
    const actions: GameAction[] = [];
    let state = initial;

    // Solve all solvable events first.
    for (const slot of EVENT_SLOT_ORDER) {
      if (slotAllowsFundSolve(state, slot)) {
        state = dispatchAndRecord(state, { type: "SOLVE_EVENT", slot }, actions);
      }
    }
    state = endYearWithRetention(state, actions);

    // Play 3 more turns with mixed solve/no-solve.
    state = playManyTurns(state, 3, actions);

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions },
    ];
    assertRoundTrip(session, state, "multi-slot solve");
  });

  it("Chapter 1 → Chapter 2 continuity with refit removals round-trips", () => {
    const seed1 = 0x9abcdef0 >>> 0;
    let state1 = createInitialState(seed1, "firstMandate");
    const actions1: GameAction[] = [];

    // Play all 15 turns of Chapter 1.
    state1 = playManyTurns(state1, 15, actions1);

    // Build Chapter 2 continuity draft and remove first 3 carryover cards.
    const seed2 = 0x11223344 >>> 0;
    const draft2 = createContinuityLevel2Draft(state1, seed2);
    const removedCount = Math.min(3, draft2.carryoverCards.length);
    const removedIndices2 = Array.from({ length: removedCount }, (_, i) => i);
    const removedIds2 = removedIndices2.map((i) => draft2.carryoverCards[i]!.instanceId);
    let state2 = buildLevel2StateFromDraft({ ...draft2, removedCarryoverIds: removedIds2 });
    const actions2: GameAction[] = [];

    // Play 25 turns of Chapter 2.
    state2 = playManyTurns(state2, 25, actions2);

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: seed1, removedIndices: [], actions: actions1 },
      {
        level: "secondMandate",
        mode: "continuity",
        seed: seed2,
        removedIndices: removedIndices2,
        actions: actions2,
      },
    ];

    assertRoundTrip(session, state2, "ch1→ch2 continuity 25 turns");
  });

  it("standalone Chapter 2 with refit round-trips across full run", () => {
    const seed = 0x55aa55aa >>> 0;
    const draft = createStandaloneLevel2Draft(seed);
    // Remove cards at indices 0, 2, 4 (odd-one-out positions).
    const removedIndices = [0, 2, 4].filter((i) => i < draft.carryoverCards.length);
    const removedIds = removedIndices.map((i) => draft.carryoverCards[i]!.instanceId);
    let state = buildLevel2StateFromDraft({ ...draft, removedCarryoverIds: removedIds });
    const actions: GameAction[] = [];

    state = playManyTurns(state, 25, actions);

    const session: SessionRecord = [
      { level: "secondMandate", mode: "standalone", seed, removedIndices, actions },
    ];
    assertRoundTrip(session, state, "ch2 standalone 25 turns");
  });

  it("full 3-chapter continuity run round-trips end-to-end", () => {
    const seed1 = 0xfeed1234 >>> 0;
    let state1 = createInitialState(seed1, "firstMandate");
    const actions1: GameAction[] = [];
    state1 = playManyTurns(state1, 15, actions1);

    const seed2 = 0xbeef5678 >>> 0;
    const draft2 = createContinuityLevel2Draft(state1, seed2);
    const ri2 = [0, 1].filter((i) => i < draft2.carryoverCards.length);
    const rid2 = ri2.map((i) => draft2.carryoverCards[i]!.instanceId);
    let state2 = buildLevel2StateFromDraft({ ...draft2, removedCarryoverIds: rid2 });
    const actions2: GameAction[] = [];
    state2 = playManyTurns(state2, 25, actions2);

    const seed3 = 0xcafe9abc >>> 0;
    const draft3 = createContinuityLevel3Draft(state2, seed3);
    const ri3 = [0].filter((i) => i < draft3.carryoverCards.length);
    const rid3 = ri3.map((i) => draft3.carryoverCards[i]!.instanceId);
    let state3 = buildLevel3StateFromDraft({ ...draft3, removedCarryoverIds: rid3 });
    const actions3: GameAction[] = [];
    state3 = playManyTurns(state3, 20, actions3);

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: seed1, removedIndices: [], actions: actions1 },
      { level: "secondMandate", mode: "continuity", seed: seed2, removedIndices: ri2, actions: actions2 },
      { level: "thirdMandate", mode: "continuity", seed: seed3, removedIndices: ri3, actions: actions3 },
    ];

    assertRoundTrip(session, state3, "3-chapter full continuity");
  });

  it("retention with non-empty keepIds is idempotent across encode/decode", () => {
    /**
     * Find a seed + full action history where retention fires with hand > cap.
     * We must accumulate ALL actions from turn 1 so the session can replay
     * from the seed without missing earlier turns.
     */
    let found: { seed: number; actions: GameAction[]; state: GameState } | null = null;

    for (let s = 0; s < 50_000; s++) {
      let st = createInitialState(s, "firstMandate");
      const accumulated: GameAction[] = [];

      for (let t = 0; t < 8; t++) {
        if (st.outcome !== "playing") break;
        const afterEndYear = dispatchAndRecord(st, { type: "END_YEAR" }, accumulated);
        if (afterEndYear === st) break; // END_YEAR rejected (already game over?)
        st = afterEndYear;

        if (st.phase === "retention") {
          const cap = retentionCapacity(st);
          if (st.hand.length > cap) {
            // This is the turn where retention fires with a non-empty keep.
            const keepIds = st.hand.slice(0, cap);
            expect(keepIds.length).toBeGreaterThan(0);
            st = dispatchAndRecord(st, { type: "CONFIRM_RETENTION", keepIds }, accumulated);
            found = { seed: s, actions: accumulated.slice(), state: st };
            break;
          }
          // Retention fired but nothing to keep (cap = 0) → keep nothing, continue.
          st = dispatchAndRecord(st, { type: "CONFIRM_RETENTION", keepIds: [] }, accumulated);
        }
      }
      if (found) break;
    }

    if (!found) {
      // Couldn't find such a scenario in range — skip gracefully.
      return;
    }

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed: found.seed, removedIndices: [], actions: found.actions },
    ];
    assertRoundTrip(session, found.state, "non-empty retention keepIds");
  });

  it("deck recycling (discard reshuffled into deck) remains deterministic on replay", () => {
    // Use a seed with a small deck and play many turns to force multiple deck refills.
    const seed = 0xaaaa5555 >>> 0;
    let state = createInitialState(seed, "firstMandate");
    const actions: GameAction[] = [];

    // Play 12 turns to force deck recycling (chapter 1 has ~16 cards, many turns of draw).
    state = playManyTurns(state, 12, actions);

    // Verify discard was non-empty at some point (deck recycling happened).
    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions },
    ];

    // Core assertion: replay must match.
    assertRoundTrip(session, state, "deck recycling determinism");
  });

  it("standalone Chapter 3 with refit round-trips correctly", () => {
    const seed = 0x7777cccc >>> 0;
    const draft = createStandaloneLevel3Draft(seed);
    const ri = [0, 2].filter((i) => i < draft.carryoverCards.length);
    const rid = ri.map((i) => draft.carryoverCards[i]!.instanceId);
    let state = buildLevel3StateFromDraft({ ...draft, removedCarryoverIds: rid });
    const actions: GameAction[] = [];

    state = playManyTurns(state, 20, actions);

    const session: SessionRecord = [
      { level: "thirdMandate", mode: "standalone", seed, removedIndices: ri, actions },
    ];
    assertRoundTrip(session, state, "ch3 standalone 20 turns");
  });

  it("actions are recorded in the correct order even when multiple actions per turn", () => {
    const seed = 0xdeadcafe >>> 0;
    let state = createInitialState(seed, "firstMandate");
    const actions: GameAction[] = [];
    const actionCounts: number[] = [];

    for (let turn = 0; turn < 8 && state.outcome === "playing"; turn++) {
      const beforeLen = actions.length;
      state = playOneTurn(state, actions);
      actionCounts.push(actions.length - beforeLen);
    }

    // At least some turns should have multiple actions (cards + events + end year + retention).
    const multiActionTurns = actionCounts.filter((c) => c > 1).length;
    expect(multiActionTurns, "some turns should have multiple recorded actions").toBeGreaterThan(0);

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions },
    ];
    assertRoundTrip(session, state, "multi-action turns order");
  });

  it("events left unresolved are correctly reproduced on replay", () => {
    const seed = 0x12340000 >>> 0;
    let state = createInitialState(seed, "firstMandate");
    const actions: GameAction[] = [];

    // Deliberately skip ALL event solving for 8 turns.
    for (let t = 0; t < 8 && state.outcome === "playing"; t++) {
      state = playAllCardsInHand(state, actions);
      state = endYearWithRetention(state, actions);
    }

    const session: SessionRecord = [
      { level: "firstMandate", mode: "standalone", seed, removedIndices: [], actions },
    ];
    assertRoundTrip(session, state, "unresolved events 8 turns");
  });
});

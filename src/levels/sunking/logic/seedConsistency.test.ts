/**
 * Regression test for the seed-mismatch bug:
 * When Math.random() was called twice (once to preview next.runSeed, once in dispatchSafe),
 * the stored seed differed from the actual game seed, causing all actions to diverge in replay.
 */
import { describe, it, expect } from "vitest";
import { gameReducer } from "../../../app/gameReducer";
import { createInitialState } from "../../../app/initialState";
import { annotateConfirmRetention, decodeSession, encodeSession, shouldRecordAction } from "../../../logic/runCode";
import { retentionCapacity } from "../../../logic/turnFlow";
import type { GameAction } from "../../../app/gameReducer";
import type { GameState } from "../../../types/game";

function dispatchAndRecord(state: GameState, action: GameAction, recorded: GameAction[]): GameState {
  const next = gameReducer(state, action);
  if (shouldRecordAction(action) && next !== state) {
    const stored = action.type === "CONFIRM_RETENTION" ? annotateConfirmRetention(action, state) : action;
    recorded.push(stored);
  }
  return next;
}

function playTurns(initialState: GameState, turns: number, recorded: GameAction[]): GameState {
  let s = initialState;
  for (let t = 0; t < turns && s.outcome === "playing"; t++) {
    s = dispatchAndRecord(s, { type: "END_YEAR" }, recorded);
    if (s.phase === "retention") {
      const cap = retentionCapacity(s);
      const keepIds = s.hand.slice(0, cap);
      s = dispatchAndRecord(s, { type: "CONFIRM_RETENTION", keepIds }, recorded);
    }
  }
  return s;
}

describe("seed consistency regression test", () => {
  it("two calls to createInitialState(undefined) produce DIFFERENT seeds (demonstrating the bug)", () => {
    // This proves the bug: calling the reducer twice with undefined seed gives different runSeeds
    const dummyState = createInitialState(12345, "firstMandate");
    const result1 = gameReducer(dummyState, { type: "NEW_GAME" });
    const result2 = gameReducer(dummyState, { type: "NEW_GAME" });
    // Two separate calls should almost certainly produce different seeds
    // (if this ever fails it's a Math.random collision, not a test bug)
    expect(result1.runSeed).not.toBe(result2.runSeed);
    console.log("Bug confirmed: result1.runSeed =", result1.runSeed.toString(16), "result2.runSeed =", result2.runSeed.toString(16));
  });

  it("replay with the correct seed matches the live game exactly", () => {
    // Simulate what beginConfiguredRun does AFTER the fix:
    // dispatchSafe is called once, and we read runSeed from the result.
    const dummyPrev = createInitialState(1, "firstMandate");
    const liveGameState = gameReducer(dummyPrev, { type: "NEW_GAME" });
    const actualSeed = liveGameState.runSeed;

    // Verify: the actualSeed used by the game produces the same initial state
    const replayStart = createInitialState(actualSeed, "firstMandate");
    expect(replayStart.runSeed).toBe(actualSeed);
    expect(replayStart.hand).toEqual(liveGameState.hand);
    expect(replayStart.deck).toEqual(liveGameState.deck);
    expect(replayStart.resources).toEqual(liveGameState.resources);
  });

  it("before the fix: storing the WRONG seed (from separate gameReducer call) causes replay to diverge", () => {
    const dummyPrev = createInitialState(1, "firstMandate");
    const actualLiveState = gameReducer(dummyPrev, { type: "NEW_GAME" });
    const wrongStoredSeed = gameReducer(dummyPrev, { type: "NEW_GAME" }).runSeed; // different seed!

    expect(wrongStoredSeed).not.toBe(actualLiveState.runSeed);

    const wrongReplayStart = createInitialState(wrongStoredSeed, "firstMandate");
    // Hands differ because different seeds → different deck shuffles
    const handsMatch = JSON.stringify(wrongReplayStart.hand) === JSON.stringify(actualLiveState.hand);
    console.log("Wrong seed replay - hands match:", handsMatch, "(expected false → divergence)");
    // They almost certainly differ (could theoretically match by chance but extremely unlikely)
    expect(handsMatch).toBe(false);
  });

  it("full Ch1 session round-trips perfectly when seed is stored correctly", () => {
    // Simulate the correct behavior after the fix
    const dummyPrev = createInitialState(1, "firstMandate");
    const liveGameInitial = gameReducer(dummyPrev, { type: "NEW_GAME" });
    const correctSeed = liveGameInitial.runSeed;

    // Play several turns recording actions
    const recorded: GameAction[] = [];
    const finalLive = playTurns(liveGameInitial, 8, recorded);

    // Build and encode the session with the CORRECT seed
    const session = [{ level: "firstMandate" as const, mode: "standalone" as const, seed: correctSeed, removedIndices: [], actions: recorded }];
    const hex = encodeSession(session);
    const decoded = decodeSession(hex);

    expect(decoded.finalState.turn).toBe(finalLive.turn);
    expect(decoded.finalState.resources).toEqual(finalLive.resources);
    expect(decoded.finalState.outcome).toBe(finalLive.outcome);
    console.log("Correct-seed replay: turn", decoded.finalState.turn, "resources", decoded.finalState.resources);
  });

  it("full Ch1 session with WRONG seed (simulating old bug) diverges immediately", () => {
    const dummyPrev = createInitialState(1, "firstMandate");
    const liveGameInitial = gameReducer(dummyPrev, { type: "NEW_GAME" });
    const wrongSeed = gameReducer(dummyPrev, { type: "NEW_GAME" }).runSeed; // second call = different seed

    // Play turns recording actions against the ACTUAL live game state
    const recorded: GameAction[] = [];
    playTurns(liveGameInitial, 8, recorded);

    // Encode with the WRONG seed (what the old bug did)
    const session = [{ level: "firstMandate" as const, mode: "standalone" as const, seed: wrongSeed, removedIndices: [], actions: recorded }];
    const hex = encodeSession(session);
    const decoded = decodeSession(hex);

    // Count how many recorded actions are rejected in replay
    let replayState = createInitialState(wrongSeed, "firstMandate");
    let rejectedCount = 0;
    for (const action of recorded) {
      const before = replayState;
      replayState = gameReducer(replayState, action);
      if (replayState === before) rejectedCount++;
    }

    console.log("Wrong-seed replay: rejected", rejectedCount, "of", recorded.length, "actions");
    // At least some actions should be rejected when seed is wrong
    expect(rejectedCount).toBeGreaterThan(0);
    expect(decoded.finalState.turn).not.toBe(gameReducer(createInitialState(wrongSeed, "firstMandate"), { type: "NEW_GAME" }).turn);
  });
});

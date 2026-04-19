import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { getLevelDef } from "../data/levels";
import {
  simulateFirstMandateBatch,
  simulateFirstMandateRun,
  simulateFirstToSecondCampaignBatch,
  simulateSecondMandateStandaloneBatch,
  simulateSecondMandateStandaloneRun,
} from "./aiStrategySimulation";

describe("aiStrategySimulation", () => {
  it("finishes a deterministic first-mandate run", () => {
    const run = simulateFirstMandateRun(202_604);
    expect(run.outcome).not.toBe("playing");
    expect(run.endTurn).toBeGreaterThan(0);
    expect(run.endTurn).toBeLessThanOrEqual(getLevelDef("firstMandate").turnLimit);
  });

  it("keeps the benchmark summary stable for first mandate", () => {
    const report = simulateFirstMandateBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 13.615,
        "averageEndTurnOnLoss": 13.615,
        "averageEndTurnOnWin": 13.614,
        "averageEndingResources": {
          "funding": 0.01,
          "legitimacy": 4.31,
          "power": 5.355,
          "treasuryStat": 4.785,
        },
        "levelId": "firstMandate",
        "losses": 156,
        "runCount": 200,
        "strategyId": "event-first-retain-royal-funding-and-intervention",
        "winRate": 0.22,
        "wins": 44,
      }
    `);
  });

  it("does not mutate createInitialState defaults while simulating", () => {
    const before = createInitialState(777, "firstMandate");
    const copy = structuredClone(before);
    simulateFirstMandateRun(778);
    expect(before).toEqual(copy);
  });

  it("finishes a deterministic second-mandate standalone run with strategy I", () => {
    const run = simulateSecondMandateStandaloneRun(202_605);
    expect(run.outcome).not.toBe("playing");
    expect(run.endTurn).toBeGreaterThan(0);
    expect(run.endTurn).toBeLessThanOrEqual(getLevelDef("secondMandate").turnLimit);
  });

  it("keeps strategy I standalone chapter-2 benchmark stable", () => {
    const report = simulateSecondMandateStandaloneBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 11.21,
        "averageEndTurnOnLoss": 9.888,
        "averageEndTurnOnWin": 22.476,
        "averageEndingResources": {
          "funding": 0.105,
          "legitimacy": 3.605,
          "power": 0.95,
          "treasuryStat": 3.235,
        },
        "levelId": "secondMandate",
        "losses": 179,
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.105,
        "wins": 21,
      }
    `);
  });

  it("keeps strategy I first-to-second campaign benchmark stable", () => {
    const report = simulateFirstToSecondCampaignBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageChapter1EndTurn": 13.615,
        "averageChapter2EndTurnOnReached": 18.727,
        "averageChapter2EndTurnOnWin": 24.737,
        "chapter1Losses": 156,
        "chapter1WinRate": 0.22,
        "chapter1Wins": 44,
        "chapter2Losses": 25,
        "chapter2Runs": 44,
        "chapter2WinRateAfterCarryover": 0.4318,
        "chapter2Wins": 19,
        "fullCampaignWinRate": 0.095,
        "fullCampaignWins": 19,
        "runCount": 200,
        "strategyId": "a-strategy-i",
      }
    `);
  });
});

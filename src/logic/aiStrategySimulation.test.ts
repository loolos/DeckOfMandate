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
        "averageEndTurn": 13.585,
        "averageEndTurnOnLoss": 13.583,
        "averageEndTurnOnWin": 13.591,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 4.285,
          "power": 5.32,
          "treasuryStat": 4.76,
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
        "averageEndTurn": 9.105,
        "averageEndTurnOnLoss": 8.637,
        "averageEndTurnOnWin": 22,
        "averageEndingResources": {
          "funding": 0.24,
          "legitimacy": 2.715,
          "power": 2.33,
          "treasuryStat": 1.445,
        },
        "levelId": "secondMandate",
        "losses": 193,
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.035,
        "wins": 7,
      }
    `);
  });

  it("keeps strategy I first-to-second campaign benchmark stable", () => {
    const report = simulateFirstToSecondCampaignBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageChapter1EndTurn": 13.585,
        "averageChapter2EndTurnOnReached": 15.091,
        "averageChapter2EndTurnOnWin": 23.375,
        "chapter1Losses": 156,
        "chapter1WinRate": 0.22,
        "chapter1Wins": 44,
        "chapter2Losses": 36,
        "chapter2Runs": 44,
        "chapter2WinRateAfterCarryover": 0.1818,
        "chapter2Wins": 8,
        "fullCampaignWinRate": 0.04,
        "fullCampaignWins": 8,
        "runCount": 200,
        "strategyId": "a-strategy-i",
      }
    `);
  });
});

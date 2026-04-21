import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { getLevelDef, getTurnLimitForRun } from "../data/levels";
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
    expect(run.endTurn).toBeLessThanOrEqual(
      getTurnLimitForRun("firstMandate", getLevelDef("firstMandate").calendarStartYear),
    );
  });

  it("keeps the benchmark summary stable for first mandate", () => {
    const report = simulateFirstMandateBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 13.62,
        "averageEndTurnOnLoss": 13.622,
        "averageEndTurnOnWin": 13.614,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 4.31,
          "power": 5.355,
          "treasuryStat": 4.79,
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
    expect(run.endTurn).toBeLessThanOrEqual(
      getTurnLimitForRun("secondMandate", getLevelDef("secondMandate").calendarStartYear),
    );
  });

  it("keeps strategy I standalone chapter-2 benchmark stable", () => {
    const report = simulateSecondMandateStandaloneBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 12.54,
        "averageEndTurnOnLoss": 12.54,
        "averageEndTurnOnWin": null,
        "averageEndingResources": {
          "funding": 0.15,
          "legitimacy": 3.135,
          "power": 0.385,
          "treasuryStat": 2.74,
        },
        "levelId": "secondMandate",
        "losses": 200,
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0,
        "wins": 0,
      }
    `);
  });

  it("keeps strategy I first-to-second campaign benchmark stable", () => {
    const report = simulateFirstToSecondCampaignBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageChapter1EndTurn": 13.62,
        "averageChapter2EndTurnOnReached": 15.614,
        "averageChapter2EndTurnOnWin": 25,
        "chapter1Losses": 156,
        "chapter1WinRate": 0.22,
        "chapter1Wins": 44,
        "chapter2Losses": 43,
        "chapter2Runs": 44,
        "chapter2WinRateAfterCarryover": 0.0227,
        "chapter2Wins": 1,
        "fullCampaignWinRate": 0.005,
        "fullCampaignWins": 1,
        "runCount": 200,
        "strategyId": "a-strategy-i",
      }
    `);
  });
});

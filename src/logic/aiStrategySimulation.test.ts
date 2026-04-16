import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { getLevelDef } from "../data/levels";
import { simulateFirstMandateBatch, simulateFirstMandateRun } from "./aiStrategySimulation";

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
        "averageEndTurn": 12.22,
        "averageEndTurnOnLoss": 11.885,
        "averageEndTurnOnWin": 13.8,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 2.85,
          "power": 4.78,
          "treasuryStat": 5.62,
        },
        "levelId": "firstMandate",
        "losses": 165,
        "runCount": 200,
        "strategyId": "event-first-retain-royal-funding-and-intervention",
        "winRate": 0.175,
        "wins": 35,
      }
    `);
  });

  it("does not mutate createInitialState defaults while simulating", () => {
    const before = createInitialState(777, "firstMandate");
    const copy = structuredClone(before);
    simulateFirstMandateRun(778);
    expect(before).toEqual(copy);
  });
});

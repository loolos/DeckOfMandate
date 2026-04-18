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
        "averageEndTurn": 13.23,
        "averageEndTurnOnLoss": 13.201,
        "averageEndTurnOnWin": 13.295,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 4.01,
          "power": 5.44,
          "treasuryStat": 5.53,
        },
        "levelId": "firstMandate",
        "losses": 139,
        "runCount": 200,
        "strategyId": "event-first-retain-royal-funding-and-intervention",
        "winRate": 0.305,
        "wins": 61,
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

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
        "averageEndTurn": 11.83,
        "averageEndTurnOnLoss": 10.424,
        "averageEndTurnOnWin": 12.108,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 4.45,
          "power": 5.08,
          "treasuryStat": 5.64,
        },
        "levelId": "firstMandate",
        "losses": 33,
        "runCount": 200,
        "strategyId": "event-first-retain-royal-funding-and-intervention",
        "winRate": 0.835,
        "wins": 167,
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

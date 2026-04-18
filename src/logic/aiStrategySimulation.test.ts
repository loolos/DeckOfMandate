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
});

import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { getLevelDef, getTurnLimitForRun } from "../../../data/levels";
import {
  classifyThirdMandateEndState,
  simulateFirstMandateBatch,
  simulateFirstMandateRun,
  simulateFirstToSecondCampaignBatch,
  simulateFirstToThirdCampaignBatch,
  simulateFirstToThirdCampaignRun,
  simulateMenuStandaloneChaptersBatch,
  simulateSecondMandateStandaloneBatch,
  simulateSecondMandateStandaloneRun,
  simulateThirdMandateStandaloneBatch,
  simulateThirdMandateStandaloneRun,
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
        "averageEndTurn": 13.74,
        "averageEndTurnOnLoss": 13.817,
        "averageEndTurnOnWin": 13.323,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 4.12,
          "power": 5.13,
          "treasuryStat": 4.845,
        },
        "levelId": "firstMandate",
        "losses": 169,
        "runCount": 200,
        "strategyId": "event-first-retain-royal-funding-and-intervention",
        "winRate": 0.155,
        "wins": 31,
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

  it("finishes a deterministic third-mandate standalone run with strategy I", () => {
    const run = simulateThirdMandateStandaloneRun(202_606);
    expect(run.outcome).not.toBe("playing");
    expect(run.endTurn).toBeGreaterThan(0);
    expect(run.endTurn).toBeLessThanOrEqual(
      getTurnLimitForRun("thirdMandate", getLevelDef("thirdMandate").calendarStartYear),
    );
  });

  it("keeps strategy I standalone chapter-2 benchmark stable", () => {
    const report = simulateSecondMandateStandaloneBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 13.31,
        "averageEndTurnOnLoss": 13.152,
        "averageEndTurnOnWin": 23.667,
        "averageEndingResources": {
          "funding": 0.125,
          "legitimacy": 3.47,
          "power": 0.445,
          "treasuryStat": 2.99,
        },
        "levelId": "secondMandate",
        "losses": 197,
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.015,
        "wins": 3,
      }
    `);
  });

  it("keeps strategy I standalone chapter-3 (main menu) benchmark stable", () => {
    const report = simulateThirdMandateStandaloneBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 19.68,
        "averageEndTurnOnLoss": 14.182,
        "averageEndTurnOnWin": 20,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 5.165,
          "power": 15.005,
          "treasuryStat": 16.24,
        },
        "levelId": "thirdMandate",
        "losses": 11,
        "outcomeBreakdown": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 1,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 10,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0,
          "victoryUtrechtBourbon": 2,
          "victoryUtrechtCompromise": 144,
          "victoryUtrechtHabsburg": 43,
        },
        "outcomeBreakdownRates": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0.005,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 0.05,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0,
          "victoryUtrechtBourbon": 0.01,
          "victoryUtrechtCompromise": 0.72,
          "victoryUtrechtHabsburg": 0.215,
        },
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.945,
        "wins": 189,
      }
    `);
  });

  it("sums standalone chapter-3 outcome breakdown to runCount", () => {
    const report = simulateThirdMandateStandaloneBatch({ seedStart: 1, runCount: 200 });
    const sum = Object.values(report.outcomeBreakdown).reduce((a, b) => a + b, 0);
    expect(sum).toBe(report.runCount);
  });

  it("classifies third-mandate end states for outcome analytics", () => {
    const base = createInitialState(1, "thirdMandate");
    expect(
      classifyThirdMandateEndState({
        ...base,
        outcome: "victory",
        utrechtSettlementTier: "compromise",
        successionTrack: 2,
        warEnded: true,
      }),
    ).toBe("victoryUtrechtCompromise");
    expect(
      classifyThirdMandateEndState({
        ...base,
        outcome: "victory",
        utrechtSettlementTier: null,
        successionTrack: 10,
        warEnded: false,
      }),
    ).toBe("victorySuccessionTrackCap10");
    expect(
      classifyThirdMandateEndState({
        ...base,
        outcome: "defeatLegitimacy",
        resources: { ...base.resources, power: 0, legitimacy: 3 },
      }),
    ).toBe("defeatLegitimacyPower");
    expect(
      classifyThirdMandateEndState({
        ...base,
        outcome: "defeatLegitimacy",
        resources: { ...base.resources, power: 3, legitimacy: 0 },
      }),
    ).toBe("defeatLegitimacyLegitimacy");
    expect(
      classifyThirdMandateEndState({
        ...base,
        outcome: "defeatLegitimacy",
        resources: { ...base.resources, power: 0, legitimacy: 0 },
      }),
    ).toBe("defeatLegitimacyBoth");
    expect(classifyThirdMandateEndState({ ...base, outcome: "defeatSuccession" })).toBe("defeatSuccession");
  });

  it("menu standalone chapters batch matches individual chapter batches", () => {
    const menu = simulateMenuStandaloneChaptersBatch({ seedStart: 1, runCount: 200 });
    expect(menu.runCount).toBe(200);
    expect(menu.seedStart).toBe(1);
    expect(menu.firstMandate).toEqual(simulateFirstMandateBatch({ seedStart: 1, runCount: 200 }));
    expect(menu.secondMandateStandalone).toEqual(
      simulateSecondMandateStandaloneBatch({ seedStart: 1, runCount: 200 }),
    );
    expect(menu.thirdMandateStandalone).toEqual(
      simulateThirdMandateStandaloneBatch({ seedStart: 1, runCount: 200 }),
    );
  });

  it("reaches and completes chapter 3 when carryover wins chapter 2", () => {
    let pick: number | null = null;
    let firstReach: ReturnType<typeof simulateFirstToThirdCampaignRun> | null = null;
    for (let s = 1; s <= 200; s++) {
      const r = simulateFirstToThirdCampaignRun(s);
      if (r.thirdOutcome !== null) {
        pick = s;
        firstReach = r;
        expect(r.thirdOutcome).not.toBe("playing");
        expect(r.thirdEndTurn).toBeGreaterThan(0);
        expect(r.thirdEndTurn).toBeLessThanOrEqual(
          getTurnLimitForRun("thirdMandate", getLevelDef("thirdMandate").calendarStartYear),
        );
        break;
      }
    }
    expect(pick, "expected at least one seed in 1..200 to reach chapter 3").not.toBeNull();
    expect(simulateFirstToThirdCampaignRun(pick!)).toEqual(firstReach);
  });

  it("keeps strategy I first-to-second campaign benchmark stable", () => {
    const report = simulateFirstToSecondCampaignBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageChapter1EndTurn": 13.74,
        "averageChapter2EndTurnOnReached": 15.516,
        "averageChapter2EndTurnOnWin": 23.5,
        "chapter1Losses": 169,
        "chapter1WinRate": 0.155,
        "chapter1Wins": 31,
        "chapter2Losses": 29,
        "chapter2Runs": 31,
        "chapter2WinRateAfterCarryover": 0.0645,
        "chapter2Wins": 2,
        "fullCampaignWinRate": 0.01,
        "fullCampaignWins": 2,
        "runCount": 200,
        "strategyId": "a-strategy-i",
      }
    `);
  });

  it("sums first-to-third chapter-3 outcome breakdown to chapter3Runs", () => {
    const report = simulateFirstToThirdCampaignBatch({ seedStart: 1, runCount: 200 });
    const sum = Object.values(report.chapter3OutcomeBreakdown).reduce((a, b) => a + b, 0);
    expect(sum).toBe(report.chapter3Runs);
  });

  it("keeps strategy I first-to-third campaign benchmark stable", () => {
    const report = simulateFirstToThirdCampaignBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageChapter1EndTurn": 13.74,
        "averageChapter2EndTurnOnReached": 15.516,
        "averageChapter2EndTurnOnWin": 23.5,
        "averageChapter3EndTurnOnReached": 17.5,
        "averageChapter3EndTurnOnWin": 24,
        "chapter1Losses": 169,
        "chapter1WinRate": 0.155,
        "chapter1Wins": 31,
        "chapter2Losses": 29,
        "chapter2Runs": 31,
        "chapter2WinRateAfterCarryover": 0.0645,
        "chapter2Wins": 2,
        "chapter3Losses": 1,
        "chapter3OutcomeBreakdown": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 1,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0,
          "victoryUtrechtBourbon": 0,
          "victoryUtrechtCompromise": 0,
          "victoryUtrechtHabsburg": 1,
        },
        "chapter3OutcomeBreakdownRates": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 0.5,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0,
          "victoryUtrechtBourbon": 0,
          "victoryUtrechtCompromise": 0,
          "victoryUtrechtHabsburg": 0.5,
        },
        "chapter3Runs": 2,
        "chapter3WinRateAfterCarryover": 0.5,
        "chapter3Wins": 1,
        "fullCampaignWinRate": 0.005,
        "fullCampaignWins": 1,
        "runCount": 200,
        "strategyId": "a-strategy-i",
      }
    `);
  });
});

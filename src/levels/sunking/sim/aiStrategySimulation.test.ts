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
  simulateSecondToThirdCampaignBatch,
  simulateSecondToThirdCampaignRun,
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
        "averageEndTurn": 13.34,
        "averageEndTurnOnLoss": 13.806,
        "averageEndTurnOnWin": 12.892,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 4.395,
          "power": 5.78,
          "treasuryStat": 5.96,
        },
        "levelId": "firstMandate",
        "losses": 98,
        "runCount": 200,
        "strategyId": "event-first-retain-royal-funding-and-intervention",
        "winRate": 0.51,
        "wins": 102,
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
        "averageEndTurn": 23.64,
        "averageEndTurnOnLoss": 24.701,
        "averageEndTurnOnWin": 22.641,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 8.635,
          "power": 7.52,
          "treasuryStat": 9.315,
        },
        "levelId": "secondMandate",
        "losses": 97,
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.515,
        "wins": 103,
      }
    `);
  });

  it("keeps strategy I standalone chapter-3 (main menu) benchmark stable", () => {
    const report = simulateThirdMandateStandaloneBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 16.81,
        "averageEndTurnOnLoss": 12.091,
        "averageEndTurnOnWin": 18.141,
        "averageEndingResources": {
          "funding": 0.715,
          "legitimacy": 4.89,
          "power": 13.185,
          "treasuryStat": 15.59,
        },
        "levelId": "thirdMandate",
        "losses": 44,
        "outcomeBreakdown": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 44,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 0,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 21,
          "victoryUtrechtBourbon": 1,
          "victoryUtrechtCompromise": 88,
          "victoryUtrechtHabsburg": 46,
        },
        "outcomeBreakdownRates": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0.22,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 0,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0.105,
          "victoryUtrechtBourbon": 0.005,
          "victoryUtrechtCompromise": 0.44,
          "victoryUtrechtHabsburg": 0.23,
        },
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.78,
        "wins": 156,
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

  it("keeps first-to-third carryover reachability deterministic for seeds 1..200", () => {
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
    if (pick === null) {
      for (let s = 1; s <= 200; s++) {
        expect(simulateFirstToThirdCampaignRun(s).thirdOutcome).toBeNull();
      }
      return;
    }
    expect(simulateFirstToThirdCampaignRun(pick)).toEqual(firstReach);
  });

  it("keeps strategy I first-to-second campaign benchmark stable", () => {
    const report = simulateFirstToSecondCampaignBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageChapter1EndTurn": 13.34,
        "averageChapter2EndTurnOnReached": 20.882,
        "averageChapter2EndTurnOnWin": 25.818,
        "chapter1Losses": 98,
        "chapter1WinRate": 0.51,
        "chapter1Wins": 102,
        "chapter2Losses": 69,
        "chapter2Runs": 102,
        "chapter2WinRateAfterCarryover": 0.3235,
        "chapter2Wins": 33,
        "fullCampaignWinRate": 0.165,
        "fullCampaignWins": 33,
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
        "averageChapter1EndTurn": 13.34,
        "averageChapter2EndTurnOnReached": 20.882,
        "averageChapter2EndTurnOnWin": 25.818,
        "averageChapter2EndingResourcesOnWin": {
          "funding": 0,
          "legitimacy": 11.333,
          "power": 6.121,
          "treasuryStat": 8.909,
        },
        "averageChapter3EndTurnOnReached": 11.333,
        "averageChapter3EndTurnOnWin": 21.25,
        "chapter1Losses": 98,
        "chapter1OutcomeBreakdown": {
          "defeatLegitimacy": 15,
          "defeatSuccession": 0,
          "defeatTime": 83,
          "other": 0,
          "victory": 102,
        },
        "chapter1OutcomeBreakdownRates": {
          "defeatLegitimacy": 0.075,
          "defeatSuccession": 0,
          "defeatTime": 0.415,
          "other": 0,
          "victory": 0.51,
        },
        "chapter1WinRate": 0.51,
        "chapter1Wins": 102,
        "chapter2Losses": 69,
        "chapter2OutcomeBreakdown": {
          "defeatLegitimacy": 54,
          "defeatSuccession": 0,
          "defeatTime": 15,
          "other": 0,
          "victory": 33,
        },
        "chapter2OutcomeBreakdownRates": {
          "defeatLegitimacy": 0.5294,
          "defeatSuccession": 0,
          "defeatTime": 0.1471,
          "other": 0,
          "victory": 0.3235,
        },
        "chapter2Runs": 102,
        "chapter2WinRateAfterCarryover": 0.3235,
        "chapter2Wins": 33,
        "chapter3Losses": 29,
        "chapter3OutcomeBreakdown": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 3,
          "defeatLegitimacyPower": 2,
          "defeatSuccession": 24,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 1,
          "victoryUtrechtBourbon": 0,
          "victoryUtrechtCompromise": 1,
          "victoryUtrechtHabsburg": 2,
        },
        "chapter3OutcomeBreakdownRates": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0.0909,
          "defeatLegitimacyPower": 0.0606,
          "defeatSuccession": 0.7273,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0.0303,
          "victoryUtrechtBourbon": 0,
          "victoryUtrechtCompromise": 0.0303,
          "victoryUtrechtHabsburg": 0.0606,
        },
        "chapter3Runs": 33,
        "chapter3WinRateAfterCarryover": 0.1212,
        "chapter3Wins": 4,
        "fullCampaignWinRate": 0.02,
        "fullCampaignWins": 4,
        "runCount": 200,
        "strategyId": "a-strategy-i",
      }
    `);
  });

  it("keeps second-to-third campaign accounting consistent", () => {
    const report = simulateSecondToThirdCampaignBatch({ seedStart: 1, runCount: 200 });
    expect(report.chapter2Wins + report.chapter2Losses).toBe(report.runCount);
    expect(report.chapter3Runs).toBe(report.chapter2Wins);
    expect(report.chapter3Wins + report.chapter3Losses).toBe(report.chapter3Runs);
    expect(report.fullCampaignWins).toBe(report.chapter3Wins);
    const sum = Object.values(report.chapter3OutcomeBreakdown).reduce((a, b) => a + b, 0);
    expect(sum).toBe(report.chapter3Runs);
  });

  it("keeps second-to-third campaign run deterministic", () => {
    const run = simulateSecondToThirdCampaignRun(2_026_0423);
    expect(run).toEqual(simulateSecondToThirdCampaignRun(2_026_0423));
  });
});

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
        "averageEndTurn": 13.875,
        "averageEndTurnOnLoss": 14.679,
        "averageEndTurnOnWin": 12.912,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 4.735,
          "power": 5.605,
          "treasuryStat": 6,
        },
        "levelId": "firstMandate",
        "losses": 109,
        "runCount": 200,
        "strategyId": "event-first-retain-royal-funding-and-intervention",
        "winRate": 0.455,
        "wins": 91,
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
        "averageEndTurn": 23.66,
        "averageEndTurnOnLoss": 24.374,
        "averageEndTurnOnWin": 22.694,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 12.025,
          "power": 9.005,
          "treasuryStat": 9.305,
        },
        "levelId": "secondMandate",
        "losses": 115,
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.425,
        "wins": 85,
      }
    `);
  });

  it("keeps strategy I standalone chapter-3 (main menu) benchmark stable", () => {
    const report = simulateThirdMandateStandaloneBatch({ seedStart: 1, runCount: 200 });
    expect(report).toMatchInlineSnapshot(`
      {
        "averageEndTurn": 17.655,
        "averageEndTurnOnLoss": 11.52,
        "averageEndTurnOnWin": 19.7,
        "averageEndingResources": {
          "funding": 0,
          "legitimacy": 11.115,
          "power": 16.415,
          "treasuryStat": 19.245,
        },
        "levelId": "thirdMandate",
        "losses": 50,
        "outcomeBreakdown": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 50,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 3,
          "victoryUtrechtBourbon": 1,
          "victoryUtrechtCompromise": 49,
          "victoryUtrechtHabsburg": 97,
        },
        "outcomeBreakdownRates": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0,
          "defeatLegitimacyPower": 0,
          "defeatSuccession": 0.25,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0.015,
          "victoryUtrechtBourbon": 0.005,
          "victoryUtrechtCompromise": 0.245,
          "victoryUtrechtHabsburg": 0.485,
        },
        "runCount": 200,
        "startMode": "standalone",
        "strategyId": "a-strategy-i",
        "winRate": 0.75,
        "wins": 150,
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
        "averageChapter1EndTurn": 13.875,
        "averageChapter2EndTurnOnReached": 20.593,
        "averageChapter2EndTurnOnWin": 25.714,
        "chapter1Losses": 109,
        "chapter1WinRate": 0.455,
        "chapter1Wins": 91,
        "chapter2Losses": 70,
        "chapter2Runs": 91,
        "chapter2WinRateAfterCarryover": 0.2308,
        "chapter2Wins": 21,
        "fullCampaignWinRate": 0.105,
        "fullCampaignWins": 21,
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
        "averageChapter1EndTurn": 13.875,
        "averageChapter2EndTurnOnReached": 20.593,
        "averageChapter2EndTurnOnWin": 25.714,
        "averageChapter2EndingResourcesOnWin": {
          "funding": 0,
          "legitimacy": 13.524,
          "power": 5.857,
          "treasuryStat": 7.857,
        },
        "averageChapter3EndTurnOnReached": 7.905,
        "averageChapter3EndTurnOnWin": null,
        "chapter1Losses": 109,
        "chapter1OutcomeBreakdown": {
          "defeatLegitimacy": 5,
          "defeatSuccession": 0,
          "defeatTime": 104,
          "other": 0,
          "victory": 91,
        },
        "chapter1OutcomeBreakdownRates": {
          "defeatLegitimacy": 0.025,
          "defeatSuccession": 0,
          "defeatTime": 0.52,
          "other": 0,
          "victory": 0.455,
        },
        "chapter1WinRate": 0.455,
        "chapter1Wins": 91,
        "chapter2Losses": 70,
        "chapter2OutcomeBreakdown": {
          "defeatLegitimacy": 54,
          "defeatSuccession": 0,
          "defeatTime": 16,
          "other": 0,
          "victory": 21,
        },
        "chapter2OutcomeBreakdownRates": {
          "defeatLegitimacy": 0.5934,
          "defeatSuccession": 0,
          "defeatTime": 0.1758,
          "other": 0,
          "victory": 0.2308,
        },
        "chapter2Runs": 91,
        "chapter2WinRateAfterCarryover": 0.2308,
        "chapter2Wins": 21,
        "chapter3Losses": 21,
        "chapter3OutcomeBreakdown": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0,
          "defeatLegitimacyPower": 1,
          "defeatSuccession": 20,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0,
          "victoryUtrechtBourbon": 0,
          "victoryUtrechtCompromise": 0,
          "victoryUtrechtHabsburg": 0,
        },
        "chapter3OutcomeBreakdownRates": {
          "defeatLegitimacyBoth": 0,
          "defeatLegitimacyLegitimacy": 0,
          "defeatLegitimacyPower": 0.0476,
          "defeatSuccession": 0.9524,
          "other": 0,
          "victoryCalendarNoUtrecht": 0,
          "victorySuccessionTrackCap10": 0,
          "victoryUtrechtBourbon": 0,
          "victoryUtrechtCompromise": 0,
          "victoryUtrechtHabsburg": 0,
        },
        "chapter3Runs": 21,
        "chapter3WinRateAfterCarryover": 0,
        "chapter3Wins": 0,
        "fullCampaignWinRate": 0,
        "fullCampaignWins": 0,
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

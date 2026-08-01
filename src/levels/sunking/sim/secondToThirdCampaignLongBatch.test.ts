import { describe, expect, it } from "vitest";
import { getLevelDef, getTurnLimitForRun } from "../../../data/levels";
import { simulateSecondToThirdCampaignBatch } from "./aiStrategySimulation";
import {
  expectPlausibleEndTurn,
  expectSmokeBaseline,
  expectThirdMandateBreakdown,
  report,
  resolveBatchOptions,
} from "./batchTestHarness";

import "../../../test/setupLevels";

const SMOKE_RUNS = 150;

/** Recorded outcome of seeds 1..150; see `expectSmokeBaseline`. */
const SMOKE_BASELINE = {
  chapter2Wins: 77,
  chapter3Runs: 77,
  chapter3Wins: 13,
  fullCampaignWins: 13,
  chapter3OutcomeBreakdown: {
    victorySuccessionTrackCap10: 2,
    victoryUtrechtBourbon: 0,
    victoryUtrechtCompromise: 2,
    victoryUtrechtHabsburg: 9,
    victoryCalendarNoUtrecht: 0,
    defeatSuccession: 60,
    defeatLegitimacyPower: 0,
    defeatLegitimacyLegitimacy: 4,
    defeatLegitimacyBoth: 0,
    other: 0,
  },
  averageChapter2EndTurn: 23.64,
  averageChapter3EndTurnOnReached: 13.506,
};

/** Longest run a chapter can last (continuity starts can only shorten it). */
function maxTurns(levelId: string): number {
  return getTurnLimitForRun(levelId, getLevelDef(levelId).calendarStartYear);
}

describe("second-to-third campaign batch", () => {
  it(
    "carries a chapter-2 win into chapter 3 and keeps that path clearable",
    () => {
      const { seedStart, runCount, verbose } = resolveBatchOptions({
        longEnv: "VITEST_LONG_SECOND_TO_THIRD",
        seedEnv: "VITEST_SECOND_TO_THIRD_BATCH_SEED",
        runsEnv: "VITEST_SECOND_TO_THIRD_BATCH_RUNS",
        smokeRuns: SMOKE_RUNS,
        longRuns: 5_000,
      });
      const r = simulateSecondToThirdCampaignBatch({ seedStart, runCount });

      expect(r.runCount).toBe(runCount);

      // Every seed plays chapter 2; only its winners go on to chapter 3.
      expect(r.chapter2Wins + r.chapter2Losses).toBe(runCount);
      expect(r.chapter3Runs).toBe(r.chapter2Wins);
      expect(r.chapter3Wins + r.chapter3Losses).toBe(r.chapter3Runs);
      expect(r.fullCampaignWins).toBe(r.chapter3Wins);

      expectThirdMandateBreakdown(
        r.chapter3OutcomeBreakdown,
        r.chapter3OutcomeBreakdownRates,
        r.chapter3Runs,
        "chapter3OutcomeBreakdown",
      );

      expectPlausibleEndTurn(r.averageChapter2EndTurn, maxTurns("secondMandate"), "averageChapter2EndTurn");
      expectPlausibleEndTurn(r.averageChapter3EndTurnOnReached, maxTurns("thirdMandate"), "averageChapter3EndTurnOnReached");

      expect(r.chapter3Runs, "chapter 2 standalone must be clearable").toBeGreaterThan(0);
      expect(r.fullCampaignWins, "the 2→3 carryover path must stay clearable").toBeGreaterThan(0);

      expectSmokeBaseline(
        { seedStart, runCount, verbose },
        SMOKE_RUNS,
        {
          chapter2Wins: r.chapter2Wins,
          chapter3Runs: r.chapter3Runs,
          chapter3Wins: r.chapter3Wins,
          fullCampaignWins: r.fullCampaignWins,
          chapter3OutcomeBreakdown: r.chapter3OutcomeBreakdown,
          averageChapter2EndTurn: r.averageChapter2EndTurn,
          averageChapter3EndTurnOnReached: r.averageChapter3EndTurnOnReached,
        },
        SMOKE_BASELINE,
      );

      report(verbose, "\n=== second -> third (a-strategy-i) ===");
      report(verbose, `seeds: ${seedStart}..${seedStart + runCount - 1} (${runCount} runs)`);
      report(verbose, `chapter2WinRate: ${(r.chapter2WinRate * 100).toFixed(2)}%`);
      report(
        verbose,
        `chapter3WinRateAfterCarryover: ${
          r.chapter3WinRateAfterCarryover == null ? "n/a" : `${(r.chapter3WinRateAfterCarryover * 100).toFixed(2)}%`
        }`,
      );
      report(verbose, `fullCampaignWinRate: ${(r.fullCampaignWinRate * 100).toFixed(2)}%`);
      report(verbose, `chapter2Wins: ${r.chapter2Wins}`);
      report(verbose, `chapter3Runs: ${r.chapter3Runs} (wins ${r.chapter3Wins})`);
      report(verbose, `averageChapter2EndTurn: ${r.averageChapter2EndTurn}`);
      report(verbose, `averageChapter3EndTurnOnReached: ${r.averageChapter3EndTurnOnReached ?? "n/a"}`);
      report(verbose, `averageChapter3EndTurnOnWin: ${r.averageChapter3EndTurnOnWin ?? "n/a"}`);
      const b = r.chapter3OutcomeBreakdown;
      const br = r.chapter3OutcomeBreakdownRates;
      report(verbose, "chapter3 outcome mix (over reached ch3 runs):");
      report(
        verbose,
        `  track+10 (no Utrecht): ${b.victorySuccessionTrackCap10} (${(br.victorySuccessionTrackCap10 * 100).toFixed(2)}%)`,
      );
      report(
        verbose,
        `  Utrecht bourbon / compromise / habsburg: ${b.victoryUtrechtBourbon} / ${b.victoryUtrechtCompromise} / ${b.victoryUtrechtHabsburg}`,
      );
      report(verbose, `  calendar win (no Utrecht): ${b.victoryCalendarNoUtrecht}`);
      report(verbose, `  defeat track -10: ${b.defeatSuccession}`);
      report(
        verbose,
        `  defeat leg. (power / leg / both): ${b.defeatLegitimacyPower} / ${b.defeatLegitimacyLegitimacy} / ${b.defeatLegitimacyBoth}\n`,
      );
    },
    180_000,
  );
});

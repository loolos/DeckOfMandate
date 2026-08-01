import { describe, expect, it } from "vitest";
import { getLevelDef, getTurnLimitForRun } from "../../../data/levels";
import { simulateFirstToThirdCampaignBatch } from "./aiStrategySimulation";
import {
  expectOutcomeAccounting,
  expectPlausibleEndTurn,
  expectRatesMatchCounts,
  expectSmokeBaseline,
  expectThirdMandateBreakdown,
  report,
  resolveBatchOptions,
} from "./batchTestHarness";

import "../../../test/setupLevels";

const SMOKE_RUNS = 150;

/** Recorded outcome of seeds 1..150; see `expectSmokeBaseline`. */
const SMOKE_BASELINE = {
  chapter1Wins: 75,
  chapter2Runs: 75,
  chapter2Wins: 25,
  chapter3Runs: 25,
  chapter3Wins: 3,
  fullCampaignWins: 3,
  chapter1OutcomeBreakdown: { victory: 75, defeatLegitimacy: 12, defeatTime: 63, defeatSuccession: 0, other: 0 },
  chapter2OutcomeBreakdown: { victory: 25, defeatLegitimacy: 38, defeatTime: 12, defeatSuccession: 0, other: 0 },
  chapter3OutcomeBreakdown: {
    victorySuccessionTrackCap10: 1,
    victoryUtrechtBourbon: 0,
    victoryUtrechtCompromise: 0,
    victoryUtrechtHabsburg: 2,
    victoryCalendarNoUtrecht: 0,
    defeatSuccession: 18,
    defeatLegitimacyPower: 2,
    defeatLegitimacyLegitimacy: 2,
    defeatLegitimacyBoth: 0,
    other: 0,
  },
  averageChapter1EndTurn: 13.307,
  averageChapter2EndTurnOnReached: 21.027,
  averageChapter3EndTurnOnReached: 11.28,
};

/** Longest run a chapter can last (continuity starts can only shorten it). */
function maxTurns(levelId: string): number {
  return getTurnLimitForRun(levelId, getLevelDef(levelId).calendarStartYear);
}

describe("first-to-third campaign batch", () => {
  it(
    "plays the full 1→3 campaign and keeps it clearable",
    () => {
      const { seedStart, runCount, verbose } = resolveBatchOptions({
        longEnv: "VITEST_LONG_THIRD",
        seedEnv: "VITEST_THIRD_BATCH_SEED",
        runsEnv: "VITEST_THIRD_BATCH_RUNS",
        smokeRuns: SMOKE_RUNS,
        longRuns: 5_000,
      });
      const r = simulateFirstToThirdCampaignBatch({ seedStart, runCount });

      expect(r.runCount).toBe(runCount);

      // Chapter 1 runs for every seed; chapters 2 and 3 only for runs that got there.
      expectOutcomeAccounting(r.chapter1OutcomeBreakdown, runCount, "chapter1OutcomeBreakdown");
      expectRatesMatchCounts(
        r.chapter1OutcomeBreakdown,
        r.chapter1OutcomeBreakdownRates,
        runCount,
        "chapter1OutcomeBreakdownRates",
      );
      expectOutcomeAccounting(r.chapter2OutcomeBreakdown, r.chapter2Runs, "chapter2OutcomeBreakdown");
      expectRatesMatchCounts(
        r.chapter2OutcomeBreakdown,
        r.chapter2OutcomeBreakdownRates,
        r.chapter2Runs,
        "chapter2OutcomeBreakdownRates",
      );
      expectThirdMandateBreakdown(
        r.chapter3OutcomeBreakdown,
        r.chapter3OutcomeBreakdownRates,
        r.chapter3Runs,
        "chapter3OutcomeBreakdown",
      );

      // A run only reaches the next chapter by winning the previous one.
      expect(r.chapter1Wins).toBe(r.chapter1OutcomeBreakdown.victory);
      expect(r.chapter2Runs).toBe(r.chapter1Wins);
      expect(r.chapter3Runs).toBe(r.chapter2Wins);
      expect(r.fullCampaignWins).toBe(r.chapter3Wins);
      expect(r.chapter3Runs).toBeLessThanOrEqual(r.chapter2Runs);
      expect(r.chapter2Runs).toBeLessThanOrEqual(runCount);

      expectPlausibleEndTurn(r.averageChapter1EndTurn, maxTurns("firstMandate"), "averageChapter1EndTurn");
      expectPlausibleEndTurn(r.averageChapter2EndTurnOnReached, maxTurns("secondMandate"), "averageChapter2EndTurnOnReached");
      expectPlausibleEndTurn(r.averageChapter3EndTurnOnReached, maxTurns("thirdMandate"), "averageChapter3EndTurnOnReached");

      // The point of this batch: the campaign must stay winnable end to end.
      expect(r.chapter2Runs, "chapter 1 must be clearable").toBeGreaterThan(0);
      expect(r.chapter3Runs, "chapter 2 must be clearable from a chapter-1 carryover").toBeGreaterThan(0);
      expect(r.fullCampaignWins, "the full 1→3 campaign must stay clearable").toBeGreaterThan(0);

      expectSmokeBaseline(
        { seedStart, runCount, verbose },
        SMOKE_RUNS,
        {
          chapter1Wins: r.chapter1Wins,
          chapter2Runs: r.chapter2Runs,
          chapter2Wins: r.chapter2Wins,
          chapter3Runs: r.chapter3Runs,
          chapter3Wins: r.chapter3Wins,
          fullCampaignWins: r.fullCampaignWins,
          chapter1OutcomeBreakdown: r.chapter1OutcomeBreakdown,
          chapter2OutcomeBreakdown: r.chapter2OutcomeBreakdown,
          chapter3OutcomeBreakdown: r.chapter3OutcomeBreakdown,
          averageChapter1EndTurn: r.averageChapter1EndTurn,
          averageChapter2EndTurnOnReached: r.averageChapter2EndTurnOnReached,
          averageChapter3EndTurnOnReached: r.averageChapter3EndTurnOnReached,
        },
        SMOKE_BASELINE,
      );

      report(verbose, "\n=== first -> second -> third (a-strategy-i) ===");
      report(verbose, `seeds: ${seedStart}..${seedStart + runCount - 1} (${runCount} runs)`);
      report(verbose, `chapter1WinRate: ${(r.chapter1WinRate * 100).toFixed(2)}%`);
      report(
        verbose,
        `chapter2WinRateAfterCarryover: ${
          r.chapter2WinRateAfterCarryover == null ? "n/a" : `${(r.chapter2WinRateAfterCarryover * 100).toFixed(2)}%`
        }`,
      );
      report(
        verbose,
        `chapter3WinRateAfterCarryover: ${
          r.chapter3WinRateAfterCarryover == null ? "n/a" : `${(r.chapter3WinRateAfterCarryover * 100).toFixed(2)}%`
        }`,
      );
      report(verbose, `fullCampaignWinRate: ${(r.fullCampaignWinRate * 100).toFixed(2)}%`);
      report(verbose, `chapter1Wins: ${r.chapter1Wins}`);
      const c1 = r.chapter1OutcomeBreakdown;
      const c1r = r.chapter1OutcomeBreakdownRates;
      report(verbose, "chapter1 outcome mix (over all runs):");
      report(verbose, `  victory: ${c1.victory} (${(c1r.victory * 100).toFixed(2)}%)`);
      report(verbose, `  defeat legitimacy: ${c1.defeatLegitimacy} (${(c1r.defeatLegitimacy * 100).toFixed(2)}%)`);
      report(verbose, `  defeat time: ${c1.defeatTime} (${(c1r.defeatTime * 100).toFixed(2)}%)`);
      report(verbose, `  defeat succession: ${c1.defeatSuccession} (${(c1r.defeatSuccession * 100).toFixed(2)}%)`);
      report(verbose, `  other: ${c1.other} (${(c1r.other * 100).toFixed(2)}%)`);
      report(verbose, `chapter2Runs: ${r.chapter2Runs} (wins ${r.chapter2Wins})`);
      const c2 = r.chapter2OutcomeBreakdown;
      const c2r = r.chapter2OutcomeBreakdownRates;
      report(verbose, `chapter2 outcome mix (over ${r.chapter2Runs} runs that reached ch2):`);
      report(verbose, `  victory: ${c2.victory} (${(c2r.victory * 100).toFixed(2)}%)`);
      report(verbose, `  defeat legitimacy: ${c2.defeatLegitimacy} (${(c2r.defeatLegitimacy * 100).toFixed(2)}%)`);
      report(verbose, `  defeat time: ${c2.defeatTime} (${(c2r.defeatTime * 100).toFixed(2)}%)`);
      report(verbose, `  defeat succession: ${c2.defeatSuccession} (${(c2r.defeatSuccession * 100).toFixed(2)}%)`);
      report(verbose, `  other: ${c2.other} (${(c2r.other * 100).toFixed(2)}%)`);
      report(verbose, `chapter3Runs: ${r.chapter3Runs} (wins ${r.chapter3Wins})`);
      report(verbose, `fullCampaignWins: ${r.fullCampaignWins}`);
      report(verbose, "funnel (share over total runs):");
      report(verbose, `  reached ch2: ${r.chapter2Runs} (${((r.chapter2Runs / runCount) * 100).toFixed(2)}%)`);
      report(verbose, `  reached ch3: ${r.chapter3Runs} (${((r.chapter3Runs / runCount) * 100).toFixed(2)}%)`);
      report(verbose, `  full wins: ${r.fullCampaignWins} (${((r.fullCampaignWins / runCount) * 100).toFixed(2)}%)`);
      report(verbose, `averageChapter1EndTurn: ${r.averageChapter1EndTurn}`);
      report(verbose, `averageChapter2EndTurnOnReached: ${r.averageChapter2EndTurnOnReached ?? "n/a"}`);
      const c2res = r.averageChapter2EndingResourcesOnWin;
      report(
        verbose,
        `averageChapter2EndingResourcesOnWin: ${
          c2res
            ? `treasury=${c2res.treasuryStat}, funding=${c2res.funding}, power=${c2res.power}, legitimacy=${c2res.legitimacy}`
            : "n/a"
        }`,
      );
      report(verbose, `averageChapter3EndTurnOnReached: ${r.averageChapter3EndTurnOnReached ?? "n/a"}`);
      report(verbose, `averageChapter3EndTurnOnWin: ${r.averageChapter3EndTurnOnWin ?? "n/a"}`);
      const b = r.chapter3OutcomeBreakdown;
      const br = r.chapter3OutcomeBreakdownRates;
      report(verbose, `chapter3 outcome mix (over ${r.chapter3Runs} runs that reached ch3):`);
      report(
        verbose,
        `  victory track +10 (no Utrecht): ${b.victorySuccessionTrackCap10} (${(br.victorySuccessionTrackCap10 * 100).toFixed(2)}%)`,
      );
      report(verbose, `  victory Utrecht bourbon: ${b.victoryUtrechtBourbon} (${(br.victoryUtrechtBourbon * 100).toFixed(2)}%)`);
      report(
        verbose,
        `  victory Utrecht compromise: ${b.victoryUtrechtCompromise} (${(br.victoryUtrechtCompromise * 100).toFixed(2)}%)`,
      );
      report(verbose, `  victory Utrecht habsburg: ${b.victoryUtrechtHabsburg} (${(br.victoryUtrechtHabsburg * 100).toFixed(2)}%)`);
      report(
        verbose,
        `  victory calendar (no Utrecht): ${b.victoryCalendarNoUtrecht} (${(br.victoryCalendarNoUtrecht * 100).toFixed(2)}%)`,
      );
      report(verbose, `  defeat track −10: ${b.defeatSuccession} (${(br.defeatSuccession * 100).toFixed(2)}%)`);
      report(verbose, `  defeat legitimacy (power≤0): ${b.defeatLegitimacyPower} (${(br.defeatLegitimacyPower * 100).toFixed(2)}%)`);
      report(
        verbose,
        `  defeat legitimacy (legitimacy≤0): ${b.defeatLegitimacyLegitimacy} (${(br.defeatLegitimacyLegitimacy * 100).toFixed(2)}%)`,
      );
      report(verbose, `  defeat legitimacy (both): ${b.defeatLegitimacyBoth} (${(br.defeatLegitimacyBoth * 100).toFixed(2)}%)`);
      report(verbose, `  other: ${b.other} (${(br.other * 100).toFixed(2)}%)\n`);
    },
    180_000,
  );
});

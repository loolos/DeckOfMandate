import { describe, expect, it } from "vitest";
import { simulateSecondToThirdCampaignBatch } from "./aiStrategySimulation";

const longEnabled = process.env.VITEST_LONG_SECOND_TO_THIRD === "1";

describe.skipIf(!longEnabled)("second-to-third campaign (long batch)", () => {
  it(
    "large batch: prints report",
    () => {
      const seedStart = Number(process.env.VITEST_SECOND_TO_THIRD_BATCH_SEED) || 1;
      const runCount = Number(process.env.VITEST_SECOND_TO_THIRD_BATCH_RUNS) || 5_000;
      const report = simulateSecondToThirdCampaignBatch({ seedStart, runCount });
      console.log("\n=== second -> third (a-strategy-i) ===");
      console.log(`seeds: ${seedStart}..${seedStart + runCount - 1} (${runCount} runs)`);
      console.log(`chapter2WinRate: ${(report.chapter2WinRate * 100).toFixed(2)}%`);
      console.log(
        `chapter3WinRateAfterCarryover: ${
          report.chapter3WinRateAfterCarryover == null
            ? "n/a"
            : `${(report.chapter3WinRateAfterCarryover * 100).toFixed(2)}%`
        }`,
      );
      console.log(`fullCampaignWinRate: ${(report.fullCampaignWinRate * 100).toFixed(2)}%`);
      console.log(`chapter2Wins: ${report.chapter2Wins}`);
      console.log(`chapter3Runs: ${report.chapter3Runs} (wins ${report.chapter3Wins})`);
      console.log(`averageChapter2EndTurn: ${report.averageChapter2EndTurn}`);
      console.log(`averageChapter3EndTurnOnReached: ${report.averageChapter3EndTurnOnReached ?? "n/a"}`);
      console.log(`averageChapter3EndTurnOnWin: ${report.averageChapter3EndTurnOnWin ?? "n/a"}`);
      const b = report.chapter3OutcomeBreakdown;
      const br = report.chapter3OutcomeBreakdownRates;
      console.log("chapter3 outcome mix (over reached ch3 runs):");
      console.log(
        `  track+10 (no Utrecht): ${b.victorySuccessionTrackCap10} (${(br.victorySuccessionTrackCap10 * 100).toFixed(2)}%)`,
      );
      console.log(
        `  Utrecht bourbon / compromise / habsburg: ${b.victoryUtrechtBourbon} / ${b.victoryUtrechtCompromise} / ${b.victoryUtrechtHabsburg}`,
      );
      console.log(`  calendar win (no Utrecht): ${b.victoryCalendarNoUtrecht}`);
      console.log(`  defeat track -10: ${b.defeatSuccession}`);
      console.log(
        `  defeat leg. (power / leg / both): ${b.defeatLegitimacyPower} / ${b.defeatLegitimacyLegitimacy} / ${b.defeatLegitimacyBoth}\n`,
      );
      expect(report.runCount).toBe(runCount);
    },
    120_000,
  );
});

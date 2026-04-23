import { describe, expect, it } from "vitest";
import { simulateFirstToThirdCampaignBatch } from "./aiStrategySimulation";

const longEnabled = process.env.VITEST_LONG_THIRD === "1";

describe.skipIf(!longEnabled)("first-to-third campaign (long batch)", () => {
  it(
    "large batch: prints report",
    () => {
    const seedStart = Number(process.env.VITEST_THIRD_BATCH_SEED) || 1;
    const runCount = Number(process.env.VITEST_THIRD_BATCH_RUNS) || 5_000;
    const report = simulateFirstToThirdCampaignBatch({ seedStart, runCount });
    console.log("\n=== first -> second -> third (a-strategy-i) ===");
    console.log(`seeds: ${seedStart}..${seedStart + runCount - 1} (${runCount} runs)`);
    console.log(`chapter1WinRate: ${(report.chapter1WinRate * 100).toFixed(2)}%`);
    console.log(
      `chapter2WinRateAfterCarryover: ${
        report.chapter2WinRateAfterCarryover == null
          ? "n/a"
          : `${(report.chapter2WinRateAfterCarryover * 100).toFixed(2)}%`
      }`,
    );
    console.log(
      `chapter3WinRateAfterCarryover: ${
        report.chapter3WinRateAfterCarryover == null
          ? "n/a"
          : `${(report.chapter3WinRateAfterCarryover * 100).toFixed(2)}%`
      }`,
    );
    console.log(`fullCampaignWinRate: ${(report.fullCampaignWinRate * 100).toFixed(2)}%`);
    console.log(`chapter1Wins: ${report.chapter1Wins}`);
    console.log(`chapter2Runs: ${report.chapter2Runs} (wins ${report.chapter2Wins})`);
    console.log(`chapter3Runs: ${report.chapter3Runs} (wins ${report.chapter3Wins})`);
    console.log(`fullCampaignWins: ${report.fullCampaignWins}`);
    console.log(`averageChapter1EndTurn: ${report.averageChapter1EndTurn}`);
    console.log(`averageChapter2EndTurnOnReached: ${report.averageChapter2EndTurnOnReached ?? "n/a"}`);
    console.log(`averageChapter3EndTurnOnReached: ${report.averageChapter3EndTurnOnReached ?? "n/a"}`);
    console.log(`averageChapter3EndTurnOnWin: ${report.averageChapter3EndTurnOnWin ?? "n/a"}`);
    const b = report.chapter3OutcomeBreakdown;
    const br = report.chapter3OutcomeBreakdownRates;
    const denom = report.chapter3Runs;
    console.log(`chapter3 outcome mix (over ${denom} runs that reached ch3):`);
    console.log(`  track+10 (no Utrecht): ${b.victorySuccessionTrackCap10} (${denom ? (br.victorySuccessionTrackCap10 * 100).toFixed(2) : "0"}%)`);
    console.log(`  Utrecht bourbon / compromise / habsburg: ${b.victoryUtrechtBourbon} / ${b.victoryUtrechtCompromise} / ${b.victoryUtrechtHabsburg}`);
    console.log(`  calendar win (no Utrecht): ${b.victoryCalendarNoUtrecht}`);
    console.log(`  defeat track −10: ${b.defeatSuccession}`);
    console.log(`  defeat leg. (power / leg / both): ${b.defeatLegitimacyPower} / ${b.defeatLegitimacyLegitimacy} / ${b.defeatLegitimacyBoth}\n`);
    expect(report.runCount).toBe(runCount);
    },
    120_000,
  );
});

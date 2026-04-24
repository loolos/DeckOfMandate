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
    const c1 = report.chapter1OutcomeBreakdown;
    const c1r = report.chapter1OutcomeBreakdownRates;
    console.log("chapter1 outcome mix (over all runs):");
    console.log(`  victory: ${c1.victory} (${(c1r.victory * 100).toFixed(2)}%)`);
    console.log(
      `  defeat legitimacy: ${c1.defeatLegitimacy} (${(c1r.defeatLegitimacy * 100).toFixed(2)}%)`,
    );
    console.log(`  defeat time: ${c1.defeatTime} (${(c1r.defeatTime * 100).toFixed(2)}%)`);
    console.log(`  defeat succession: ${c1.defeatSuccession} (${(c1r.defeatSuccession * 100).toFixed(2)}%)`);
    console.log(`  other: ${c1.other} (${(c1r.other * 100).toFixed(2)}%)`);
    console.log(`chapter2Runs: ${report.chapter2Runs} (wins ${report.chapter2Wins})`);
    const c2 = report.chapter2OutcomeBreakdown;
    const c2r = report.chapter2OutcomeBreakdownRates;
    console.log(`chapter2 outcome mix (over ${report.chapter2Runs} runs that reached ch2):`);
    console.log(`  victory: ${c2.victory} (${(c2r.victory * 100).toFixed(2)}%)`);
    console.log(
      `  defeat legitimacy: ${c2.defeatLegitimacy} (${(c2r.defeatLegitimacy * 100).toFixed(2)}%)`,
    );
    console.log(`  defeat time: ${c2.defeatTime} (${(c2r.defeatTime * 100).toFixed(2)}%)`);
    console.log(`  defeat succession: ${c2.defeatSuccession} (${(c2r.defeatSuccession * 100).toFixed(2)}%)`);
    console.log(`  other: ${c2.other} (${(c2r.other * 100).toFixed(2)}%)`);
    console.log(`chapter3Runs: ${report.chapter3Runs} (wins ${report.chapter3Wins})`);
    console.log(`fullCampaignWins: ${report.fullCampaignWins}`);
    console.log("funnel (share over total runs):");
    console.log(`  reached ch2: ${report.chapter2Runs} (${((report.chapter2Runs / runCount) * 100).toFixed(2)}%)`);
    console.log(`  reached ch3: ${report.chapter3Runs} (${((report.chapter3Runs / runCount) * 100).toFixed(2)}%)`);
    console.log(
      `  full wins: ${report.fullCampaignWins} (${((report.fullCampaignWins / runCount) * 100).toFixed(2)}%)`,
    );
    console.log(`averageChapter1EndTurn: ${report.averageChapter1EndTurn}`);
    console.log(`averageChapter2EndTurnOnReached: ${report.averageChapter2EndTurnOnReached ?? "n/a"}`);
    const c2res = report.averageChapter2EndingResourcesOnWin;
    console.log(
      `averageChapter2EndingResourcesOnWin: ${
        c2res
          ? `treasury=${c2res.treasuryStat}, funding=${c2res.funding}, power=${c2res.power}, legitimacy=${c2res.legitimacy}`
          : "n/a"
      }`,
    );
    console.log(`averageChapter3EndTurnOnReached: ${report.averageChapter3EndTurnOnReached ?? "n/a"}`);
    console.log(`averageChapter3EndTurnOnWin: ${report.averageChapter3EndTurnOnWin ?? "n/a"}`);
    const b = report.chapter3OutcomeBreakdown;
    const br = report.chapter3OutcomeBreakdownRates;
    const denom = report.chapter3Runs;
    console.log(`chapter3 outcome mix (over ${denom} runs that reached ch3):`);
    console.log(
      `  victory track +10 (no Utrecht): ${b.victorySuccessionTrackCap10} (${(br.victorySuccessionTrackCap10 * 100).toFixed(2)}%)`,
    );
    console.log(`  victory Utrecht bourbon: ${b.victoryUtrechtBourbon} (${(br.victoryUtrechtBourbon * 100).toFixed(2)}%)`);
    console.log(
      `  victory Utrecht compromise: ${b.victoryUtrechtCompromise} (${(br.victoryUtrechtCompromise * 100).toFixed(2)}%)`,
    );
    console.log(`  victory Utrecht habsburg: ${b.victoryUtrechtHabsburg} (${(br.victoryUtrechtHabsburg * 100).toFixed(2)}%)`);
    console.log(
      `  victory calendar (no Utrecht): ${b.victoryCalendarNoUtrecht} (${(br.victoryCalendarNoUtrecht * 100).toFixed(2)}%)`,
    );
    console.log(`  defeat track −10: ${b.defeatSuccession} (${(br.defeatSuccession * 100).toFixed(2)}%)`);
    console.log(
      `  defeat legitimacy (power≤0): ${b.defeatLegitimacyPower} (${(br.defeatLegitimacyPower * 100).toFixed(2)}%)`,
    );
    console.log(
      `  defeat legitimacy (legitimacy≤0): ${b.defeatLegitimacyLegitimacy} (${(br.defeatLegitimacyLegitimacy * 100).toFixed(2)}%)`,
    );
    console.log(
      `  defeat legitimacy (both): ${b.defeatLegitimacyBoth} (${(br.defeatLegitimacyBoth * 100).toFixed(2)}%)`,
    );
    console.log(`  other: ${b.other} (${(br.other * 100).toFixed(2)}%)\n`);
    expect(report.runCount).toBe(runCount);
    },
    120_000,
  );
});

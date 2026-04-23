import { describe, expect, it } from "vitest";
import { simulateMenuStandaloneChaptersBatch } from "./aiStrategySimulation";

const longEnabled = process.env.VITEST_MENU_STANDALONE_LONG === "1";

describe.skipIf(!longEnabled)("menu standalone chapters (long batch)", () => {
  it(
    "menu standalone: prints chapter 1–3 win rates",
    () => {
    const seedStart = Number(process.env.VITEST_MENU_BATCH_SEED) || 1;
    const runCount = Number(process.env.VITEST_MENU_BATCH_RUNS) || 5_000;
    const menu = simulateMenuStandaloneChaptersBatch({ seedStart, runCount });
    const ch1 = menu.firstMandate;
    const ch2 = menu.secondMandateStandalone;
    const ch3 = menu.thirdMandateStandalone;

    console.log("\n=== main menu: standalone chapters (same seeds each) ===");
    console.log(`seeds: ${seedStart}..${seedStart + runCount - 1} (${runCount} runs per chapter)`);
    console.log("");
    console.log("[chapter 1] firstMandate — legacy bot");
    console.log(`  winRate: ${(ch1.winRate * 100).toFixed(2)}% (${ch1.wins} / ${ch1.runCount})`);
    console.log(`  averageEndTurn: ${ch1.averageEndTurn}`);
    console.log("");
    console.log("[chapter 2] secondMandate standalone — strategy I");
    console.log(`  winRate: ${(ch2.winRate * 100).toFixed(2)}% (${ch2.wins} / ${ch2.runCount})`);
    console.log(`  averageEndTurn: ${ch2.averageEndTurn}`);
    console.log("");
    console.log("[chapter 3] thirdMandate standalone — strategy I");
    console.log(`  winRate: ${(ch3.winRate * 100).toFixed(2)}% (${ch3.wins} / ${ch3.runCount})`);
    console.log(`  averageEndTurn: ${ch3.averageEndTurn}`);
    const b = ch3.outcomeBreakdown;
    const br = ch3.outcomeBreakdownRates;
    console.log("  outcome mix (counts / share of ch3 runs):");
    console.log(`    victory track +10 (no Utrecht row): ${b.victorySuccessionTrackCap10} (${(br.victorySuccessionTrackCap10 * 100).toFixed(2)}%)`);
    console.log(`    victory Utrecht — bourbon: ${b.victoryUtrechtBourbon} (${(br.victoryUtrechtBourbon * 100).toFixed(2)}%)`);
    console.log(`    victory Utrecht — compromise: ${b.victoryUtrechtCompromise} (${(br.victoryUtrechtCompromise * 100).toFixed(2)}%)`);
    console.log(`    victory Utrecht — habsburg: ${b.victoryUtrechtHabsburg} (${(br.victoryUtrechtHabsburg * 100).toFixed(2)}%)`);
    console.log(`    victory calendar (no Utrecht): ${b.victoryCalendarNoUtrecht} (${(br.victoryCalendarNoUtrecht * 100).toFixed(2)}%)`);
    console.log(`    defeat succession track −10: ${b.defeatSuccession} (${(br.defeatSuccession * 100).toFixed(2)}%)`);
    console.log(
      `    defeat legitimacy (power≤0 only): ${b.defeatLegitimacyPower} (${(br.defeatLegitimacyPower * 100).toFixed(2)}%)`,
    );
    console.log(
      `    defeat legitimacy (legitimacy≤0 only): ${b.defeatLegitimacyLegitimacy} (${(br.defeatLegitimacyLegitimacy * 100).toFixed(2)}%)`,
    );
    console.log(`    defeat legitimacy (both): ${b.defeatLegitimacyBoth} (${(br.defeatLegitimacyBoth * 100).toFixed(2)}%)`);
    console.log(`    other: ${b.other} (${(br.other * 100).toFixed(2)}%)\n`);

    expect(menu.runCount).toBe(runCount);
    expect(ch1.runCount).toBe(runCount);
    expect(ch2.runCount).toBe(runCount);
    expect(ch3.runCount).toBe(runCount);
    },
    120_000,
  );
});

import { describe, expect, it } from "vitest";
import { getLevelDef, getTurnLimitForRun } from "../../../data/levels";
import { simulateMenuStandaloneChaptersBatch } from "./aiStrategySimulation";
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
  firstMandate: { wins: 75, averageEndTurn: 13.307 },
  secondMandateStandalone: { wins: 77, averageEndTurn: 23.64 },
  thirdMandateStandalone: {
    wins: 121,
    averageEndTurn: 16.94,
    outcomeBreakdown: {
      victorySuccessionTrackCap10: 17,
      victoryUtrechtBourbon: 1,
      victoryUtrechtCompromise: 68,
      victoryUtrechtHabsburg: 35,
      victoryCalendarNoUtrecht: 0,
      defeatSuccession: 0,
      defeatLegitimacyPower: 0,
      defeatLegitimacyLegitimacy: 29,
      defeatLegitimacyBoth: 0,
      other: 0,
    },
  },
};

type ChapterBatch = {
  levelId: string;
  runCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageEndTurn: number;
};

/** Each chapter must be reachable and beatable when started straight from the menu. */
function expectPlayableChapter(batch: ChapterBatch, expectedRuns: number): void {
  const { levelId } = batch;
  expect(batch.runCount, `${levelId}: every seed must produce a run`).toBe(expectedRuns);
  expect(batch.wins + batch.losses, `${levelId}: every run must end won or lost`).toBe(expectedRuns);
  expect(batch.winRate, `${levelId}: win rate must match wins`).toBeCloseTo(batch.wins / expectedRuns, 4);
  expect(batch.wins, `${levelId} must be clearable from the menu`).toBeGreaterThan(0);
  expect(batch.losses, `${levelId} must still be losable (a chapter nobody can lose is a rules bug)`).toBeGreaterThan(0);
  expectPlausibleEndTurn(
    batch.averageEndTurn,
    getTurnLimitForRun(levelId, getLevelDef(levelId).calendarStartYear),
    `${levelId}.averageEndTurn`,
  );
}

describe("menu standalone chapters batch", () => {
  it(
    "keeps every chapter playable as a standalone menu start",
    () => {
      const { seedStart, runCount, verbose } = resolveBatchOptions({
        longEnv: "VITEST_MENU_STANDALONE_LONG",
        seedEnv: "VITEST_MENU_BATCH_SEED",
        runsEnv: "VITEST_MENU_BATCH_RUNS",
        smokeRuns: SMOKE_RUNS,
        longRuns: 5_000,
      });
      const menu = simulateMenuStandaloneChaptersBatch({ seedStart, runCount });
      const ch1 = menu.firstMandate;
      const ch2 = menu.secondMandateStandalone;
      const ch3 = menu.thirdMandateStandalone;

      expect(menu.runCount).toBe(runCount);
      expect(menu.seedStart).toBe(seedStart);
      expectPlayableChapter(ch1, runCount);
      expectPlayableChapter(ch2, runCount);
      expectPlayableChapter(ch3, runCount);
      expectThirdMandateBreakdown(
        ch3.outcomeBreakdown,
        ch3.outcomeBreakdownRates,
        runCount,
        "thirdMandateStandalone.outcomeBreakdown",
      );

      expectSmokeBaseline(
        { seedStart, runCount, verbose },
        SMOKE_RUNS,
        {
          firstMandate: { wins: ch1.wins, averageEndTurn: ch1.averageEndTurn },
          secondMandateStandalone: { wins: ch2.wins, averageEndTurn: ch2.averageEndTurn },
          thirdMandateStandalone: {
            wins: ch3.wins,
            averageEndTurn: ch3.averageEndTurn,
            outcomeBreakdown: ch3.outcomeBreakdown,
          },
        },
        SMOKE_BASELINE,
      );

      report(verbose, "\n=== main menu: standalone chapters (same seeds each) ===");
      report(verbose, `seeds: ${seedStart}..${seedStart + runCount - 1} (${runCount} runs per chapter)`);
      report(verbose, "");
      report(verbose, "[chapter 1] firstMandate — legacy bot");
      report(verbose, `  winRate: ${(ch1.winRate * 100).toFixed(2)}% (${ch1.wins} / ${ch1.runCount})`);
      report(verbose, `  averageEndTurn: ${ch1.averageEndTurn}`);
      report(verbose, "");
      report(verbose, "[chapter 2] secondMandate standalone — strategy I");
      report(verbose, `  winRate: ${(ch2.winRate * 100).toFixed(2)}% (${ch2.wins} / ${ch2.runCount})`);
      report(verbose, `  averageEndTurn: ${ch2.averageEndTurn}`);
      report(verbose, "");
      report(verbose, "[chapter 3] thirdMandate standalone — strategy I");
      report(verbose, `  winRate: ${(ch3.winRate * 100).toFixed(2)}% (${ch3.wins} / ${ch3.runCount})`);
      report(verbose, `  averageEndTurn: ${ch3.averageEndTurn}`);
      const b = ch3.outcomeBreakdown;
      const br = ch3.outcomeBreakdownRates;
      report(verbose, "  outcome mix (counts / share of ch3 runs):");
      report(
        verbose,
        `    victory track +10 (no Utrecht row): ${b.victorySuccessionTrackCap10} (${(br.victorySuccessionTrackCap10 * 100).toFixed(2)}%)`,
      );
      report(verbose, `    victory Utrecht — bourbon: ${b.victoryUtrechtBourbon} (${(br.victoryUtrechtBourbon * 100).toFixed(2)}%)`);
      report(
        verbose,
        `    victory Utrecht — compromise: ${b.victoryUtrechtCompromise} (${(br.victoryUtrechtCompromise * 100).toFixed(2)}%)`,
      );
      report(verbose, `    victory Utrecht — habsburg: ${b.victoryUtrechtHabsburg} (${(br.victoryUtrechtHabsburg * 100).toFixed(2)}%)`);
      report(
        verbose,
        `    victory calendar (no Utrecht): ${b.victoryCalendarNoUtrecht} (${(br.victoryCalendarNoUtrecht * 100).toFixed(2)}%)`,
      );
      report(verbose, `    defeat succession track −10: ${b.defeatSuccession} (${(br.defeatSuccession * 100).toFixed(2)}%)`);
      report(
        verbose,
        `    defeat legitimacy (power≤0 only): ${b.defeatLegitimacyPower} (${(br.defeatLegitimacyPower * 100).toFixed(2)}%)`,
      );
      report(
        verbose,
        `    defeat legitimacy (legitimacy≤0 only): ${b.defeatLegitimacyLegitimacy} (${(br.defeatLegitimacyLegitimacy * 100).toFixed(2)}%)`,
      );
      report(verbose, `    defeat legitimacy (both): ${b.defeatLegitimacyBoth} (${(br.defeatLegitimacyBoth * 100).toFixed(2)}%)`);
      report(verbose, `    other: ${b.other} (${(br.other * 100).toFixed(2)}%)\n`);
    },
    180_000,
  );
});

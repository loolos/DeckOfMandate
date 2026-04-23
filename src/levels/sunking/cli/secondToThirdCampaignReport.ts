import { simulateSecondToThirdCampaignBatch } from "../sim/aiStrategySimulation";

type CliOptions = {
  seedStart: number;
  runCount: number;
};

function parseCliOptions(args: readonly string[]): CliOptions {
  const options: CliOptions = {
    seedStart: 1,
    runCount: 1000,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--seed-start" && next) {
      options.seedStart = Number(next);
      i++;
      continue;
    }
    if (arg === "--runs" && next) {
      options.runCount = Number(next);
      i++;
      continue;
    }
  }
  if (!Number.isInteger(options.seedStart) || options.seedStart <= 0) {
    throw new Error("--seed-start must be a positive integer");
  }
  if (!Number.isInteger(options.runCount) || options.runCount <= 0) {
    throw new Error("--runs must be a positive integer");
  }
  return options;
}

function printReport() {
  const options = parseCliOptions(process.argv.slice(2));
  const report = simulateSecondToThirdCampaignBatch({
    seedStart: options.seedStart,
    runCount: options.runCount,
  });
  console.log("=== second -> third campaign (a-strategy-i) ===");
  console.log(`seeds: ${options.seedStart}..${options.seedStart + options.runCount - 1}`);
  console.log(`runs: ${options.runCount}`);
  console.log(`chapter2WinRate: ${(report.chapter2WinRate * 100).toFixed(2)}%`);
  console.log(
    `chapter3WinRateAfterCarryover: ${
      report.chapter3WinRateAfterCarryover == null
        ? "n/a"
        : `${(report.chapter3WinRateAfterCarryover * 100).toFixed(2)}%`
    }`,
  );
  console.log(`fullCampaignWinRate: ${(report.fullCampaignWinRate * 100).toFixed(2)}%`);
  console.log(`chapter3Runs: ${report.chapter3Runs}`);
  console.log(`chapter3Wins: ${report.chapter3Wins}`);
  const b = report.chapter3OutcomeBreakdown;
  const br = report.chapter3OutcomeBreakdownRates;
  console.log("chapter3 outcome mix (counts / share of reached chapter3):");
  console.log(
    `  track+10 (no Utrecht): ${b.victorySuccessionTrackCap10} (${(br.victorySuccessionTrackCap10 * 100).toFixed(2)}%)`,
  );
  console.log(
    `  Utrecht bourbon / compromise / habsburg: ${b.victoryUtrechtBourbon} / ${b.victoryUtrechtCompromise} / ${b.victoryUtrechtHabsburg}`,
  );
  console.log(`  calendar win (no Utrecht): ${b.victoryCalendarNoUtrecht} (${(br.victoryCalendarNoUtrecht * 100).toFixed(2)}%)`);
  console.log(`  defeat track -10: ${b.defeatSuccession} (${(br.defeatSuccession * 100).toFixed(2)}%)`);
  console.log(
    `  defeat leg. (power / leg / both): ${b.defeatLegitimacyPower} / ${b.defeatLegitimacyLegitimacy} / ${b.defeatLegitimacyBoth}`,
  );
}

printReport();

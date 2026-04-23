import { simulateFirstMandateBatch } from "../../campaignAiStrategySimulation";

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
  const report = simulateFirstMandateBatch({
    seedStart: options.seedStart,
    runCount: options.runCount,
  });
  console.log("=== firstMandate AI strategy report ===");
  console.log(`strategy: ${report.strategyId}`);
  console.log(`seeds: ${options.seedStart}..${options.seedStart + options.runCount - 1}`);
  console.log(`runs: ${report.runCount}`);
  console.log(`wins: ${report.wins}`);
  console.log(`losses: ${report.losses}`);
  console.log(`winRate: ${(report.winRate * 100).toFixed(2)}%`);
  console.log(`averageEndTurn: ${report.averageEndTurn}`);
  console.log(`averageEndTurnOnWin: ${report.averageEndTurnOnWin ?? "n/a"}`);
  console.log(`averageEndTurnOnLoss: ${report.averageEndTurnOnLoss ?? "n/a"}`);
  console.log("averageEndingResources:");
  console.log(`  treasuryStat: ${report.averageEndingResources.treasuryStat}`);
  console.log(`  power: ${report.averageEndingResources.power}`);
  console.log(`  legitimacy: ${report.averageEndingResources.legitimacy}`);
  console.log(`  funding: ${report.averageEndingResources.funding}`);
}

printReport();

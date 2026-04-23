import {
  simulateFirstToSecondCampaignBatch,
  simulateSecondMandateStandaloneBatch,
} from "../../campaignAiStrategySimulation";

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
  const second = simulateSecondMandateStandaloneBatch({
    seedStart: options.seedStart,
    runCount: options.runCount,
  });
  const campaign = simulateFirstToSecondCampaignBatch({
    seedStart: options.seedStart,
    runCount: options.runCount,
  });
  console.log("=== a-strategy-i report ===");
  console.log(`seeds: ${options.seedStart}..${options.seedStart + options.runCount - 1}`);
  console.log(`runs: ${options.runCount}`);
  console.log("");
  console.log("[scenario A] second mandate only (standalone)");
  console.log(`wins: ${second.wins}`);
  console.log(`losses: ${second.losses}`);
  console.log(`winRate: ${(second.winRate * 100).toFixed(2)}%`);
  console.log(`averageEndTurn: ${second.averageEndTurn}`);
  console.log(`averageEndTurnOnWin: ${second.averageEndTurnOnWin ?? "n/a"}`);
  console.log(`averageEndTurnOnLoss: ${second.averageEndTurnOnLoss ?? "n/a"}`);
  console.log("");
  console.log("[scenario B] first mandate -> second mandate campaign");
  console.log(`chapter1WinRate: ${(campaign.chapter1WinRate * 100).toFixed(2)}%`);
  console.log(
    `chapter2WinRateAfterCarryover: ${
      campaign.chapter2WinRateAfterCarryover == null
        ? "n/a"
        : `${(campaign.chapter2WinRateAfterCarryover * 100).toFixed(2)}%`
    }`,
  );
  console.log(`fullCampaignWinRate: ${(campaign.fullCampaignWinRate * 100).toFixed(2)}%`);
  console.log(`chapter2Runs: ${campaign.chapter2Runs}`);
  console.log(`chapter2Wins: ${campaign.chapter2Wins}`);
}

printReport();

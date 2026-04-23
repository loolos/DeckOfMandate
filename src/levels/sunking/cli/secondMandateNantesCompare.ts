import {
  simulateFirstToSecondCampaignBatch,
  simulateSecondMandateStandaloneBatch,
  type NantesChoice,
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

function pct(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

function printReport() {
  const cli = parseCliOptions(process.argv.slice(2));
  const choices: NantesChoice[] = ["crackdown", "tolerance"];
  console.log("=== nantes-choice compare report ===");
  console.log(`seeds: ${cli.seedStart}..${cli.seedStart + cli.runCount - 1}`);
  console.log(`runs: ${cli.runCount}`);
  console.log("");

  console.log("[scenario A] second mandate only (standalone)");
  const standaloneRows: Array<{
    choice: NantesChoice;
    wins: number;
    losses: number;
    winRate: number;
    avgEnd: number;
    avgEndOnWin: number | null;
    avgEndOnLoss: number | null;
  }> = [];
  for (const choice of choices) {
    const r = simulateSecondMandateStandaloneBatch({
      seedStart: cli.seedStart,
      runCount: cli.runCount,
      nantesChoice: choice,
    });
    standaloneRows.push({
      choice,
      wins: r.wins,
      losses: r.losses,
      winRate: r.winRate,
      avgEnd: r.averageEndTurn,
      avgEndOnWin: r.averageEndTurnOnWin,
      avgEndOnLoss: r.averageEndTurnOnLoss,
    });
  }
  for (const row of standaloneRows) {
    console.log(
      `  nantesChoice=${row.choice.padEnd(10)} | winRate=${pct(row.winRate).padStart(7)} | wins=${String(
        row.wins,
      ).padStart(4)} losses=${String(row.losses).padStart(4)} | avgEnd=${row.avgEnd.toFixed(3)} | avgEndOnWin=${
        row.avgEndOnWin?.toFixed(3) ?? "n/a"
      } | avgEndOnLoss=${row.avgEndOnLoss?.toFixed(3) ?? "n/a"}`,
    );
  }
  if (standaloneRows.length === 2) {
    const row0 = standaloneRows[0];
    const row1 = standaloneRows[1];
    if (row0 && row1) {
      const delta = row1.winRate - row0.winRate;
      console.log(`  delta(tolerance - crackdown): ${(delta * 100).toFixed(2)} pts`);
    }
  }
  console.log("");

  console.log("[scenario B] first mandate -> second mandate campaign");
  const campaignRows: Array<{
    choice: NantesChoice;
    chapter1WinRate: number;
    chapter2WinRateAfterCarryover: number | null;
    fullCampaignWinRate: number;
    chapter2Runs: number;
    chapter2Wins: number;
  }> = [];
  for (const choice of choices) {
    const r = simulateFirstToSecondCampaignBatch({
      seedStart: cli.seedStart,
      runCount: cli.runCount,
      nantesChoice: choice,
    });
    campaignRows.push({
      choice,
      chapter1WinRate: r.chapter1WinRate,
      chapter2WinRateAfterCarryover: r.chapter2WinRateAfterCarryover,
      fullCampaignWinRate: r.fullCampaignWinRate,
      chapter2Runs: r.chapter2Runs,
      chapter2Wins: r.chapter2Wins,
    });
  }
  for (const row of campaignRows) {
    const carry =
      row.chapter2WinRateAfterCarryover == null ? "n/a" : pct(row.chapter2WinRateAfterCarryover);
    console.log(
      `  nantesChoice=${row.choice.padEnd(10)} | ch1WinRate=${pct(row.chapter1WinRate).padStart(
        7,
      )} | ch2AfterCarry=${carry.padStart(7)} | fullCampaign=${pct(row.fullCampaignWinRate).padStart(
        7,
      )} | ch2Runs=${row.chapter2Runs} ch2Wins=${row.chapter2Wins}`,
    );
  }
  if (campaignRows.length === 2) {
    const row0 = campaignRows[0];
    const row1 = campaignRows[1];
    if (row0 && row1) {
      if (row0.chapter2WinRateAfterCarryover != null && row1.chapter2WinRateAfterCarryover != null) {
        const delta = row1.chapter2WinRateAfterCarryover - row0.chapter2WinRateAfterCarryover;
        console.log(`  delta ch2AfterCarry(tolerance - crackdown): ${(delta * 100).toFixed(2)} pts`);
      }
      const fullDelta = row1.fullCampaignWinRate - row0.fullCampaignWinRate;
      console.log(`  delta fullCampaign(tolerance - crackdown): ${(fullDelta * 100).toFixed(2)} pts`);
    }
  }
}

printReport();

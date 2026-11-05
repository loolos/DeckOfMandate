/**
 * Sun King AI strategy simulation: batch entry points (one run per seed, aggregated into reports).
 * The pieces live in `./aiStrategy/`: `policy` (which actions the AI picks), `refit` (between-chapter
 * deck changes), `runs` (one full run per seed) and `reports` (result types and tallies).
 */
import type { GameState, Resources } from "../../../types/game";
import { LEGACY_STRATEGY_ID, STRATEGY_I_ID } from "./aiStrategy/policy";
import {
  type CampaignBatchReport,
  type CampaignRunResult,
  type MenuStandaloneChaptersBatchReport,
  type NantesChoice,
  type SecondMandateBatchReport,
  type SecondToThirdCampaignBatchReport,
  type SecondToThirdCampaignRunResult,
  type StrategyBatchReport,
  type StrategyOptions,
  type StrategyRunResult,
  type ThirdMandateBatchReport,
  type ThreeChapterCampaignBatchReport,
  type ThreeChapterCampaignRunResult,
  average,
  averageNullable,
  bumpThirdMandateBreakdown,
  emptyThirdMandateOutcomeBreakdown,
  round,
  tallyThirdMandateOutcomeBreakdown,
  thirdMandateOutcomeRates,
} from "./aiStrategy/reports";
import {
  simulateFirstMandateRun,
  simulateFirstToSecondCampaignRun,
  simulateFirstToThirdCampaignRun,
  simulateSecondMandateStandaloneRun,
  simulateSecondToThirdCampaignRun,
  simulateThirdMandateStandaloneEndState,
} from "./aiStrategy/runs";

export { pickRetentionIdsForSimplePolicy } from "./aiStrategy/policy";
export {
  type NantesChoice,
  type StrategyOptions,
  type StrategyRunResult,
  type StrategyBatchReport,
  type SecondMandateBatchReport,
  type ThirdMandateTerminalKind,
  type ThirdMandateOutcomeBreakdownCounts,
  type ThirdMandateOutcomeBreakdownRates,
  classifyThirdMandateEndState,
  type ThirdMandateBatchReport,
  type MenuStandaloneChaptersBatchReport,
  type CampaignRunResult,
  type CampaignBatchReport,
  type ThreeChapterCampaignRunResult,
  type ThreeChapterCampaignBatchReport,
  type SecondToThirdCampaignRunResult,
  type SecondToThirdCampaignBatchReport,
} from "./aiStrategy/reports";
export {
  simulateFirstMandateRun,
  simulateSecondMandateStandaloneRun,
  simulateFirstMandateEndState,
  simulateSecondMandateStandaloneEndState,
  simulateThirdMandateStandaloneEndState,
  simulateThirdMandateStandaloneRun,
  simulateFirstToSecondCampaignRun,
  simulateFirstToThirdCampaignRun,
  simulateSecondToThirdCampaignRun,
} from "./aiStrategy/runs";

// ---------------------------------------------------------------- batches

export function simulateFirstMandateBatch(options?: {
  seedStart?: number;
  runCount?: number;
}): StrategyBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const runs: StrategyRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateFirstMandateRun(seedStart + i));
  }
  const wins = runs.filter((r) => r.outcome === "victory");
  const losses = runs.filter((r) => r.outcome !== "victory");
  return {
    levelId: "firstMandate",
    strategyId: LEGACY_STRATEGY_ID,
    runCount,
    wins: wins.length,
    losses: losses.length,
    winRate: round(wins.length / runCount, 4),
    averageEndTurn: round(average(runs.map((r) => r.endTurn)), 3),
    averageEndTurnOnWin: wins.length ? round(average(wins.map((r) => r.endTurn)), 3) : null,
    averageEndTurnOnLoss: losses.length ? round(average(losses.map((r) => r.endTurn)), 3) : null,
    averageEndingResources: {
      treasuryStat: round(average(runs.map((r) => r.endingResources.treasuryStat)), 3),
      funding: round(average(runs.map((r) => r.endingResources.funding)), 3),
      power: round(average(runs.map((r) => r.endingResources.power)), 3),
      legitimacy: round(average(runs.map((r) => r.endingResources.legitimacy)), 3),
    },
  };
}

export function simulateSecondMandateStandaloneBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): SecondMandateBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const strategyOptions: StrategyOptions = {};
  if (options?.nantesChoice) strategyOptions.nantesChoice = options.nantesChoice;
  const runs: StrategyRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateSecondMandateStandaloneRun(seedStart + i, strategyOptions));
  }
  const wins = runs.filter((r) => r.outcome === "victory");
  const losses = runs.filter((r) => r.outcome !== "victory");
  return {
    levelId: "secondMandate",
    startMode: "standalone",
    strategyId: STRATEGY_I_ID,
    runCount,
    wins: wins.length,
    losses: losses.length,
    winRate: round(wins.length / runCount, 4),
    averageEndTurn: round(average(runs.map((r) => r.endTurn)), 3),
    averageEndTurnOnWin: wins.length ? round(average(wins.map((r) => r.endTurn)), 3) : null,
    averageEndTurnOnLoss: losses.length ? round(average(losses.map((r) => r.endTurn)), 3) : null,
    averageEndingResources: {
      treasuryStat: round(average(runs.map((r) => r.endingResources.treasuryStat)), 3),
      funding: round(average(runs.map((r) => r.endingResources.funding)), 3),
      power: round(average(runs.map((r) => r.endingResources.power)), 3),
      legitimacy: round(average(runs.map((r) => r.endingResources.legitimacy)), 3),
    },
  };
}

export function simulateThirdMandateStandaloneBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): ThirdMandateBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const strategyOptions: StrategyOptions = {};
  if (options?.nantesChoice) strategyOptions.nantesChoice = options.nantesChoice;
  const runs: StrategyRunResult[] = [];
  const endStates: GameState[] = [];
  for (let i = 0; i < runCount; i++) {
    const seed = seedStart + i;
    const s = simulateThirdMandateStandaloneEndState(seed, strategyOptions);
    endStates.push(s);
    runs.push({
      seed,
      outcome: s.outcome,
      endTurn: s.turn,
      endingResources: { ...s.resources },
    });
  }
  const wins = runs.filter((r) => r.outcome === "victory");
  const losses = runs.filter((r) => r.outcome !== "victory");
  const outcomeBreakdown = tallyThirdMandateOutcomeBreakdown(endStates);
  const outcomeBreakdownRates = thirdMandateOutcomeRates(outcomeBreakdown, runCount);
  return {
    levelId: "thirdMandate",
    startMode: "standalone",
    strategyId: STRATEGY_I_ID,
    runCount,
    wins: wins.length,
    losses: losses.length,
    winRate: round(wins.length / runCount, 4),
    averageEndTurn: round(average(runs.map((r) => r.endTurn)), 3),
    averageEndTurnOnWin: wins.length ? round(average(wins.map((r) => r.endTurn)), 3) : null,
    averageEndTurnOnLoss: losses.length ? round(average(losses.map((r) => r.endTurn)), 3) : null,
    averageEndingResources: {
      treasuryStat: round(average(runs.map((r) => r.endingResources.treasuryStat)), 3),
      funding: round(average(runs.map((r) => r.endingResources.funding)), 3),
      power: round(average(runs.map((r) => r.endingResources.power)), 3),
      legitimacy: round(average(runs.map((r) => r.endingResources.legitimacy)), 3),
    },
    outcomeBreakdown,
    outcomeBreakdownRates,
  };
}

/**
 * Simulates each Sun King chapter as loaded from the main menu (standalone starts),
 * using the same contiguous seed range for every chapter (`seedStart` … `seedStart + runCount - 1`).
 * Chapter 1 uses the legacy bot; chapters 2–3 use strategy I (same as existing standalone sims).
 */
export function simulateMenuStandaloneChaptersBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): MenuStandaloneChaptersBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const batchOpts = { seedStart, runCount, nantesChoice: options?.nantesChoice };
  return {
    runCount,
    seedStart,
    firstMandate: simulateFirstMandateBatch(batchOpts),
    secondMandateStandalone: simulateSecondMandateStandaloneBatch(batchOpts),
    thirdMandateStandalone: simulateThirdMandateStandaloneBatch(batchOpts),
  };
}

export function simulateFirstToSecondCampaignBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): CampaignBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const strategyOptions: StrategyOptions = {};
  if (options?.nantesChoice) strategyOptions.nantesChoice = options.nantesChoice;
  const runs: CampaignRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateFirstToSecondCampaignRun(seedStart + i, strategyOptions));
  }
  const chapter1Wins = runs.filter((r) => r.firstOutcome === "victory");
  const chapter2Runs = runs.filter((r) => r.secondOutcome !== null);
  const chapter2Wins = chapter2Runs.filter((r) => r.secondOutcome === "victory");
  return {
    strategyId: STRATEGY_I_ID,
    runCount,
    chapter1Wins: chapter1Wins.length,
    chapter1Losses: runCount - chapter1Wins.length,
    chapter1WinRate: round(chapter1Wins.length / runCount, 4),
    chapter2Runs: chapter2Runs.length,
    chapter2Wins: chapter2Wins.length,
    chapter2Losses: chapter2Runs.length - chapter2Wins.length,
    chapter2WinRateAfterCarryover:
      chapter2Runs.length > 0 ? round(chapter2Wins.length / chapter2Runs.length, 4) : null,
    fullCampaignWins: chapter2Wins.length,
    fullCampaignWinRate: round(chapter2Wins.length / runCount, 4),
    averageChapter1EndTurn: round(average(runs.map((r) => r.firstEndTurn)), 3),
    averageChapter2EndTurnOnReached:
      chapter2Runs.length > 0 ? round(average(chapter2Runs.map((r) => r.secondEndTurn ?? 0)), 3) : null,
    averageChapter2EndTurnOnWin:
      chapter2Wins.length > 0 ? round(average(chapter2Wins.map((r) => r.secondEndTurn ?? 0)), 3) : null,
  };
}

export function simulateFirstToThirdCampaignBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): ThreeChapterCampaignBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const strategyOptions: StrategyOptions = {};
  if (options?.nantesChoice) strategyOptions.nantesChoice = options.nantesChoice;
  const runs: ThreeChapterCampaignRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateFirstToThirdCampaignRun(seedStart + i, strategyOptions));
  }
  const chapter1Wins = runs.filter((r) => r.firstOutcome === "victory");
  const chapter1OutcomeBreakdown = {
    victory: 0,
    defeatLegitimacy: 0,
    defeatTime: 0,
    defeatSuccession: 0,
    other: 0,
  };
  for (const r of runs) {
    switch (r.firstOutcome) {
      case "victory":
        chapter1OutcomeBreakdown.victory += 1;
        break;
      case "defeatLegitimacy":
        chapter1OutcomeBreakdown.defeatLegitimacy += 1;
        break;
      case "defeatTime":
        chapter1OutcomeBreakdown.defeatTime += 1;
        break;
      case "defeatSuccession":
        chapter1OutcomeBreakdown.defeatSuccession += 1;
        break;
      default:
        chapter1OutcomeBreakdown.other += 1;
        break;
    }
  }
  const chapter1OutcomeBreakdownRates = {
    victory: round(chapter1OutcomeBreakdown.victory / runCount, 4),
    defeatLegitimacy: round(chapter1OutcomeBreakdown.defeatLegitimacy / runCount, 4),
    defeatTime: round(chapter1OutcomeBreakdown.defeatTime / runCount, 4),
    defeatSuccession: round(chapter1OutcomeBreakdown.defeatSuccession / runCount, 4),
    other: round(chapter1OutcomeBreakdown.other / runCount, 4),
  };
  const chapter2Runs = runs.filter((r) => r.secondOutcome !== null);
  const chapter2Wins = chapter2Runs.filter((r) => r.secondOutcome === "victory");
  const chapter2OutcomeBreakdown = {
    victory: 0,
    defeatLegitimacy: 0,
    defeatTime: 0,
    defeatSuccession: 0,
    other: 0,
  };
  for (const r of chapter2Runs) {
    switch (r.secondOutcome) {
      case "victory":
        chapter2OutcomeBreakdown.victory += 1;
        break;
      case "defeatLegitimacy":
        chapter2OutcomeBreakdown.defeatLegitimacy += 1;
        break;
      case "defeatTime":
        chapter2OutcomeBreakdown.defeatTime += 1;
        break;
      case "defeatSuccession":
        chapter2OutcomeBreakdown.defeatSuccession += 1;
        break;
      default:
        chapter2OutcomeBreakdown.other += 1;
        break;
    }
  }
  const chapter2Denom = chapter2Runs.length;
  const chapter2OutcomeBreakdownRates = {
    victory: chapter2Denom > 0 ? round(chapter2OutcomeBreakdown.victory / chapter2Denom, 4) : 0,
    defeatLegitimacy: chapter2Denom > 0 ? round(chapter2OutcomeBreakdown.defeatLegitimacy / chapter2Denom, 4) : 0,
    defeatTime: chapter2Denom > 0 ? round(chapter2OutcomeBreakdown.defeatTime / chapter2Denom, 4) : 0,
    defeatSuccession: chapter2Denom > 0 ? round(chapter2OutcomeBreakdown.defeatSuccession / chapter2Denom, 4) : 0,
    other: chapter2Denom > 0 ? round(chapter2OutcomeBreakdown.other / chapter2Denom, 4) : 0,
  };
  const chapter3Runs = runs.filter((r) => r.thirdOutcome !== null);
  const chapter3Wins = chapter3Runs.filter((r) => r.thirdOutcome === "victory");
  const chapter3OutcomeBreakdown = emptyThirdMandateOutcomeBreakdown();
  for (const r of runs) {
    if (r.thirdTerminalKind !== null) {
      bumpThirdMandateBreakdown(chapter3OutcomeBreakdown, r.thirdTerminalKind);
    }
  }
  const chapter3OutcomeBreakdownRates = thirdMandateOutcomeRates(
    chapter3OutcomeBreakdown,
    chapter3Runs.length,
  );
  const chapter2WinResources = chapter2Wins
    .map((r) => r.secondEndResources)
    .filter((v): v is Resources => v !== null);
  const avgChapter2EndReached = averageNullable(chapter2Runs.map((r) => r.secondEndTurn));
  const avgChapter2EndWin = averageNullable(chapter2Wins.map((r) => r.secondEndTurn));
  const avgChapter3EndReached = averageNullable(chapter3Runs.map((r) => r.thirdEndTurn));
  const avgChapter3EndWin = averageNullable(chapter3Wins.map((r) => r.thirdEndTurn));
  return {
    strategyId: STRATEGY_I_ID,
    runCount,
    chapter1Wins: chapter1Wins.length,
    chapter1Losses: runCount - chapter1Wins.length,
    chapter1WinRate: round(chapter1Wins.length / runCount, 4),
    chapter1OutcomeBreakdown,
    chapter1OutcomeBreakdownRates,
    chapter2Runs: chapter2Runs.length,
    chapter2Wins: chapter2Wins.length,
    chapter2Losses: chapter2Runs.length - chapter2Wins.length,
    chapter2WinRateAfterCarryover:
      chapter2Runs.length > 0 ? round(chapter2Wins.length / chapter2Runs.length, 4) : null,
    chapter2OutcomeBreakdown,
    chapter2OutcomeBreakdownRates,
    chapter3Runs: chapter3Runs.length,
    chapter3Wins: chapter3Wins.length,
    chapter3Losses: chapter3Runs.length - chapter3Wins.length,
    chapter3WinRateAfterCarryover:
      chapter3Runs.length > 0 ? round(chapter3Wins.length / chapter3Runs.length, 4) : null,
    chapter3OutcomeBreakdown,
    chapter3OutcomeBreakdownRates,
    fullCampaignWins: chapter3Wins.length,
    fullCampaignWinRate: round(chapter3Wins.length / runCount, 4),
    averageChapter1EndTurn: round(average(runs.map((r) => r.firstEndTurn)), 3),
    averageChapter2EndTurnOnReached: avgChapter2EndReached !== null ? round(avgChapter2EndReached, 3) : null,
    averageChapter2EndTurnOnWin: avgChapter2EndWin !== null ? round(avgChapter2EndWin, 3) : null,
    averageChapter2EndingResourcesOnWin:
      chapter2WinResources.length > 0
        ? {
            treasuryStat: round(average(chapter2WinResources.map((r) => r.treasuryStat)), 3),
            funding: round(average(chapter2WinResources.map((r) => r.funding)), 3),
            power: round(average(chapter2WinResources.map((r) => r.power)), 3),
            legitimacy: round(average(chapter2WinResources.map((r) => r.legitimacy)), 3),
          }
        : null,
    averageChapter3EndTurnOnReached: avgChapter3EndReached !== null ? round(avgChapter3EndReached, 3) : null,
    averageChapter3EndTurnOnWin: avgChapter3EndWin !== null ? round(avgChapter3EndWin, 3) : null,
  };
}

export function simulateSecondToThirdCampaignBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): SecondToThirdCampaignBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const strategyOptions: StrategyOptions = {};
  if (options?.nantesChoice) strategyOptions.nantesChoice = options.nantesChoice;
  const runs: SecondToThirdCampaignRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateSecondToThirdCampaignRun(seedStart + i, strategyOptions));
  }
  const chapter2Wins = runs.filter((r) => r.secondOutcome === "victory");
  const chapter3Runs = runs.filter((r) => r.thirdOutcome !== null);
  const chapter3Wins = chapter3Runs.filter((r) => r.thirdOutcome === "victory");
  const chapter3OutcomeBreakdown = emptyThirdMandateOutcomeBreakdown();
  for (const r of runs) {
    if (r.thirdTerminalKind !== null) {
      bumpThirdMandateBreakdown(chapter3OutcomeBreakdown, r.thirdTerminalKind);
    }
  }
  const chapter3OutcomeBreakdownRates = thirdMandateOutcomeRates(
    chapter3OutcomeBreakdown,
    chapter3Runs.length,
  );
  return {
    strategyId: STRATEGY_I_ID,
    runCount,
    chapter2Wins: chapter2Wins.length,
    chapter2Losses: runCount - chapter2Wins.length,
    chapter2WinRate: round(chapter2Wins.length / runCount, 4),
    chapter3Runs: chapter3Runs.length,
    chapter3Wins: chapter3Wins.length,
    chapter3Losses: chapter3Runs.length - chapter3Wins.length,
    chapter3WinRateAfterCarryover:
      chapter3Runs.length > 0 ? round(chapter3Wins.length / chapter3Runs.length, 4) : null,
    chapter3OutcomeBreakdown,
    chapter3OutcomeBreakdownRates,
    fullCampaignWins: chapter3Wins.length,
    fullCampaignWinRate: round(chapter3Wins.length / runCount, 4),
    averageChapter2EndTurn: round(average(runs.map((r) => r.secondEndTurn)), 3),
    averageChapter3EndTurnOnReached:
      chapter3Runs.length > 0 ? round(average(chapter3Runs.map((r) => r.thirdEndTurn ?? 0)), 3) : null,
    averageChapter3EndTurnOnWin:
      chapter3Wins.length > 0 ? round(average(chapter3Wins.map((r) => r.thirdEndTurn ?? 0)), 3) : null,
  };
}

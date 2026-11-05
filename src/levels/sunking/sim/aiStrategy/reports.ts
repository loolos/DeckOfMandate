import type { GameOutcome, GameState, Resources } from "../../../../types/game";
import { LEGACY_STRATEGY_ID, STRATEGY_I_ID } from "./policy";

// ---------------------------------------------------------------- report types

export type NantesChoice = "crackdown" | "tolerance";

export type StrategyOptions = {
  nantesChoice?: NantesChoice;
};

export type StrategyRunResult = {
  seed: number;
  outcome: GameOutcome;
  endTurn: number;
  endingResources: Resources;
};

export type StrategyBatchReport = {
  levelId: "firstMandate";
  strategyId: typeof LEGACY_STRATEGY_ID;
  runCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageEndTurn: number;
  averageEndTurnOnWin: number | null;
  averageEndTurnOnLoss: number | null;
  averageEndingResources: Resources;
};

export type SecondMandateBatchReport = {
  levelId: "secondMandate";
  startMode: "standalone";
  strategyId: typeof STRATEGY_I_ID;
  runCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageEndTurn: number;
  averageEndTurnOnWin: number | null;
  averageEndTurnOnLoss: number | null;
  averageEndingResources: Resources;
};

/** Chapter-3 terminal bucket for analytics (standalone or carryover). */
export type ThirdMandateTerminalKind =
  /** `victory` with succession track +10 and no Utrecht row (military / track cap while war still on). */
  | "victorySuccessionTrackCap10"
  /** `victory` after Utrecht ended war — tier frozen at signing time. */
  | "victoryUtrechtBourbon"
  | "victoryUtrechtCompromise"
  | "victoryUtrechtHabsburg"
  /** `victory` at calendar without Utrecht settlement (track in (−10, +10), open-track tier). */
  | "victoryCalendarNoUtrecht"
  | "defeatSuccession"
  | "defeatLegitimacyPower"
  | "defeatLegitimacyLegitimacy"
  | "defeatLegitimacyBoth"
  | "other";

/** Raw counts for `thirdMandate` end states (sum over a batch equals `runCount` when every run is chapter 3). */
export type ThirdMandateOutcomeBreakdownCounts = {
  victorySuccessionTrackCap10: number;
  victoryUtrechtBourbon: number;
  victoryUtrechtCompromise: number;
  victoryUtrechtHabsburg: number;
  victoryCalendarNoUtrecht: number;
  defeatSuccession: number;
  defeatLegitimacyPower: number;
  defeatLegitimacyLegitimacy: number;
  defeatLegitimacyBoth: number;
  other: number;
};

export type ThirdMandateOutcomeBreakdownRates = {
  victorySuccessionTrackCap10: number;
  victoryUtrechtBourbon: number;
  victoryUtrechtCompromise: number;
  victoryUtrechtHabsburg: number;
  victoryCalendarNoUtrecht: number;
  defeatSuccession: number;
  defeatLegitimacyPower: number;
  defeatLegitimacyLegitimacy: number;
  defeatLegitimacyBoth: number;
  other: number;
};

export function emptyThirdMandateOutcomeBreakdown(): ThirdMandateOutcomeBreakdownCounts {
  return {
    victorySuccessionTrackCap10: 0,
    victoryUtrechtBourbon: 0,
    victoryUtrechtCompromise: 0,
    victoryUtrechtHabsburg: 0,
    victoryCalendarNoUtrecht: 0,
    defeatSuccession: 0,
    defeatLegitimacyPower: 0,
    defeatLegitimacyLegitimacy: 0,
    defeatLegitimacyBoth: 0,
    other: 0,
  };
}

export function thirdMandateOutcomeRates(
  counts: ThirdMandateOutcomeBreakdownCounts,
  denominator: number,
): ThirdMandateOutcomeBreakdownRates {
  if (denominator <= 0) {
    return {
      victorySuccessionTrackCap10: 0,
      victoryUtrechtBourbon: 0,
      victoryUtrechtCompromise: 0,
      victoryUtrechtHabsburg: 0,
      victoryCalendarNoUtrecht: 0,
      defeatSuccession: 0,
      defeatLegitimacyPower: 0,
      defeatLegitimacyLegitimacy: 0,
      defeatLegitimacyBoth: 0,
      other: 0,
    };
  }
  const r = (n: number) => round(n / denominator, 4);
  return {
    victorySuccessionTrackCap10: r(counts.victorySuccessionTrackCap10),
    victoryUtrechtBourbon: r(counts.victoryUtrechtBourbon),
    victoryUtrechtCompromise: r(counts.victoryUtrechtCompromise),
    victoryUtrechtHabsburg: r(counts.victoryUtrechtHabsburg),
    victoryCalendarNoUtrecht: r(counts.victoryCalendarNoUtrecht),
    defeatSuccession: r(counts.defeatSuccession),
    defeatLegitimacyPower: r(counts.defeatLegitimacyPower),
    defeatLegitimacyLegitimacy: r(counts.defeatLegitimacyLegitimacy),
    defeatLegitimacyBoth: r(counts.defeatLegitimacyBoth),
    other: r(counts.other),
  };
}

export function bumpThirdMandateBreakdown(
  acc: ThirdMandateOutcomeBreakdownCounts,
  kind: ThirdMandateTerminalKind,
): void {
  switch (kind) {
    case "victorySuccessionTrackCap10":
      acc.victorySuccessionTrackCap10 += 1;
      break;
    case "victoryUtrechtBourbon":
      acc.victoryUtrechtBourbon += 1;
      break;
    case "victoryUtrechtCompromise":
      acc.victoryUtrechtCompromise += 1;
      break;
    case "victoryUtrechtHabsburg":
      acc.victoryUtrechtHabsburg += 1;
      break;
    case "victoryCalendarNoUtrecht":
      acc.victoryCalendarNoUtrecht += 1;
      break;
    case "defeatSuccession":
      acc.defeatSuccession += 1;
      break;
    case "defeatLegitimacyPower":
      acc.defeatLegitimacyPower += 1;
      break;
    case "defeatLegitimacyLegitimacy":
      acc.defeatLegitimacyLegitimacy += 1;
      break;
    case "defeatLegitimacyBoth":
      acc.defeatLegitimacyBoth += 1;
      break;
    case "other":
      acc.other += 1;
      break;
    default: {
      const _never: never = kind;
      void _never;
      acc.other += 1;
    }
  }
}

/**
 * Classifies a terminal (non-`playing`) chapter-3 state for win/loss analytics.
 * Utrecht buckets take precedence over track-cap when `utrechtSettlementTier` is set (signing at +10 counts as Utrecht bourbon).
 */
export function classifyThirdMandateEndState(state: GameState): ThirdMandateTerminalKind {
  if (state.levelId !== "thirdMandate") {
    throw new Error("classifyThirdMandateEndState: expected levelId thirdMandate");
  }
  switch (state.outcome) {
    case "playing":
      return "other";
    case "defeatSuccession":
      return "defeatSuccession";
    case "defeatTime":
      return "other";
    case "defeatLegitimacy": {
      const p = state.resources.power <= 0;
      const l = state.resources.legitimacy <= 0;
      if (p && l) return "defeatLegitimacyBoth";
      if (p) return "defeatLegitimacyPower";
      return "defeatLegitimacyLegitimacy";
    }
    case "victory": {
      const ut = state.utrechtSettlementTier;
      if (ut === "bourbon") return "victoryUtrechtBourbon";
      if (ut === "compromise") return "victoryUtrechtCompromise";
      if (ut === "habsburg") return "victoryUtrechtHabsburg";
      if (state.successionTrack >= 10) return "victorySuccessionTrackCap10";
      return "victoryCalendarNoUtrecht";
    }
    default: {
      const _never: never = state.outcome;
      return _never;
    }
  }
}

export function tallyThirdMandateOutcomeBreakdown(states: readonly GameState[]): ThirdMandateOutcomeBreakdownCounts {
  const acc = emptyThirdMandateOutcomeBreakdown();
  for (const s of states) {
    bumpThirdMandateBreakdown(acc, classifyThirdMandateEndState(s));
  }
  return acc;
}

/** Main-menu chapter 3 (standalone draft), same bot policy as chapter 2 standalone. */
export type ThirdMandateBatchReport = {
  levelId: "thirdMandate";
  startMode: "standalone";
  strategyId: typeof STRATEGY_I_ID;
  runCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageEndTurn: number;
  averageEndTurnOnWin: number | null;
  averageEndTurnOnLoss: number | null;
  averageEndingResources: Resources;
  outcomeBreakdown: ThirdMandateOutcomeBreakdownCounts;
  outcomeBreakdownRates: ThirdMandateOutcomeBreakdownRates;
};

/** Win rates for Sun King levels loaded from the menu (no campaign carryover), same seed range each. */
export type MenuStandaloneChaptersBatchReport = {
  runCount: number;
  seedStart: number;
  firstMandate: StrategyBatchReport;
  secondMandateStandalone: SecondMandateBatchReport;
  thirdMandateStandalone: ThirdMandateBatchReport;
};

export type CampaignRunResult = {
  seed: number;
  firstOutcome: GameOutcome;
  firstEndTurn: number;
  secondOutcome: GameOutcome | null;
  secondEndTurn: number | null;
  secondEndResources?: Resources;
};

export type CampaignBatchReport = {
  strategyId: typeof STRATEGY_I_ID;
  runCount: number;
  chapter1Wins: number;
  chapter1Losses: number;
  chapter1WinRate: number;
  chapter2Runs: number;
  chapter2Wins: number;
  chapter2Losses: number;
  chapter2WinRateAfterCarryover: number | null;
  fullCampaignWins: number;
  fullCampaignWinRate: number;
  averageChapter1EndTurn: number;
  averageChapter2EndTurnOnReached: number | null;
  averageChapter2EndTurnOnWin: number | null;
};

export type ThreeChapterCampaignRunResult = {
  seed: number;
  firstOutcome: GameOutcome;
  firstEndTurn: number;
  secondOutcome: GameOutcome | null;
  secondEndTurn: number | null;
  secondEndResources: Resources | null;
  thirdOutcome: GameOutcome | null;
  thirdEndTurn: number | null;
  /** Set when chapter 3 was reached; derived from the terminal `GameState`. */
  thirdTerminalKind: ThirdMandateTerminalKind | null;
};

export type ThreeChapterCampaignBatchReport = {
  strategyId: typeof STRATEGY_I_ID;
  runCount: number;
  chapter1Wins: number;
  chapter1Losses: number;
  chapter1WinRate: number;
  chapter1OutcomeBreakdown: {
    victory: number;
    defeatLegitimacy: number;
    defeatTime: number;
    defeatSuccession: number;
    other: number;
  };
  chapter1OutcomeBreakdownRates: {
    victory: number;
    defeatLegitimacy: number;
    defeatTime: number;
    defeatSuccession: number;
    other: number;
  };
  chapter2Runs: number;
  chapter2Wins: number;
  chapter2Losses: number;
  chapter2WinRateAfterCarryover: number | null;
  chapter2OutcomeBreakdown: {
    victory: number;
    defeatLegitimacy: number;
    defeatTime: number;
    defeatSuccession: number;
    other: number;
  };
  chapter2OutcomeBreakdownRates: {
    victory: number;
    defeatLegitimacy: number;
    defeatTime: number;
    defeatSuccession: number;
    other: number;
  };
  chapter3Runs: number;
  chapter3Wins: number;
  chapter3Losses: number;
  chapter3WinRateAfterCarryover: number | null;
  /** Counts over runs that reached chapter 3 only (`chapter3Runs`). */
  chapter3OutcomeBreakdown: ThirdMandateOutcomeBreakdownCounts;
  chapter3OutcomeBreakdownRates: ThirdMandateOutcomeBreakdownRates;
  fullCampaignWins: number;
  fullCampaignWinRate: number;
  averageChapter1EndTurn: number;
  averageChapter2EndTurnOnReached: number | null;
  averageChapter2EndTurnOnWin: number | null;
  averageChapter2EndingResourcesOnWin: Resources | null;
  averageChapter3EndTurnOnReached: number | null;
  averageChapter3EndTurnOnWin: number | null;
};

export type SecondToThirdCampaignRunResult = {
  seed: number;
  secondOutcome: GameOutcome;
  secondEndTurn: number;
  thirdOutcome: GameOutcome | null;
  thirdEndTurn: number | null;
  /** Set when chapter 3 was reached; derived from the terminal `GameState`. */
  thirdTerminalKind: ThirdMandateTerminalKind | null;
};

export type SecondToThirdCampaignBatchReport = {
  strategyId: typeof STRATEGY_I_ID;
  runCount: number;
  chapter2Wins: number;
  chapter2Losses: number;
  chapter2WinRate: number;
  chapter3Runs: number;
  chapter3Wins: number;
  chapter3Losses: number;
  chapter3WinRateAfterCarryover: number | null;
  /** Counts over runs that reached chapter 3 only (`chapter3Runs`). */
  chapter3OutcomeBreakdown: ThirdMandateOutcomeBreakdownCounts;
  chapter3OutcomeBreakdownRates: ThirdMandateOutcomeBreakdownRates;
  fullCampaignWins: number;
  fullCampaignWinRate: number;
  averageChapter2EndTurn: number;
  averageChapter3EndTurnOnReached: number | null;
  averageChapter3EndTurnOnWin: number | null;
};

// ---------------------------------------------------------------- stats helpers

export function round(value: number, digits: number): number {
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

export function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

export function averageNullable(values: readonly (number | null | undefined)[]): number | null {
  const filtered = values.filter((n): n is number => n != null);
  if (filtered.length === 0) return null;
  return average(filtered);
}

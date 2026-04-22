import type { GameState } from "./game";

/**
 * Subset of `GameState` fields that encode Sun King chapter carryover, scripted row, or
 * chapter-3 succession / Habsburg rules. A future multi-campaign build may merge these per pack.
 */
const _SUN_KING_GAME_STATE_KEYS = [
  "nantesPolicyCarryover",
  "warOfDevolutionAttacked",
  "nymwegenSettlementAchieved",
  "huguenotResurgenceCounter",
  "successionTrack",
  "opponentStrength",
  "opponentHabsburgUnlocked",
  "warEnded",
  "utrechtTreatyCountdown",
  "opponentDeck",
  "opponentHand",
  "opponentDiscard",
  "opponentCostDiscountThisTurn",
  "opponentNextTurnDrawModifier",
  "opponentLastPlayedTemplateIds",
  "successionOutcomeTier",
  "utrechtSettlementTier",
] as const satisfies readonly (keyof GameState)[];

export type SunKingCampaignGameStateKeys = (typeof _SUN_KING_GAME_STATE_KEYS)[number];
export type SunKingCampaignGameStateSlice = Pick<GameState, SunKingCampaignGameStateKeys>;

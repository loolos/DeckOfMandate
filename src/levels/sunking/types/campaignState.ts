import type { GameState } from "../../../types/game";

/** Set when chapter 3 ends on the calendar without hitting ±10 on the succession track. */
export type SuccessionIntervalTier = "habsburg" | "compromise" | "bourbon";

/** After a scripted military choice; each year’s draw may roll drawPenaltyProbability for drawPenaltyDelta (clamped with power). */
export type AntiFrenchLeagueState = {
  untilTurn: number;
  drawPenaltyProbability: number;
  drawPenaltyDelta: number;
};

/** Set when the player resolves `revocationNantes` in chapter 2; drives chapter-3 standalone/carryover setup. */
export type NantesPolicyCarryover = "tolerance" | "crackdown";

/**
 * Subset of `GameState` fields that encode Sun King chapter carryover, scripted row, or
 * chapter-3 succession / Habsburg rules. These fields are declared by this campaign via
 * `./gameStateAugmentation.ts`; the framework `GameState` core knows nothing about them.
 */
const _SUN_KING_GAME_STATE_KEYS = [
  "nantesPolicyCarryover",
  "warOfDevolutionAttacked",
  "nymwegenSettlementAchieved",
  "huguenotResurgenceCounter",
  "successionTrack",
  "opponentStrength",
  "greatPowerEncirclementStrengthApplied",
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

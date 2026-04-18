import type { GameState } from "../types/game";

export const ANTI_FRENCH_SENTIMENT_TRIGGER_SUM = 20;
const ANTI_FRENCH_SENTIMENT_COST_STEP = 5;

function sumPowerAndTreasury(state: GameState): number {
  return state.resources.power + state.resources.treasuryStat;
}

export function antiFrenchSentimentActive(state: GameState): boolean {
  return state.levelId === "secondMandate" && sumPowerAndTreasury(state) > ANTI_FRENCH_SENTIMENT_TRIGGER_SUM;
}

/**
 * While active, every full +5 above (power+treasury)=20 increases all funding-based event solve costs by +1.
 */
export function antiFrenchSentimentEventSolveCostPenalty(state: GameState): number {
  if (!antiFrenchSentimentActive(state)) return 0;
  const overflow = sumPowerAndTreasury(state) - ANTI_FRENCH_SENTIMENT_TRIGGER_SUM;
  return Math.floor(overflow / ANTI_FRENCH_SENTIMENT_COST_STEP);
}

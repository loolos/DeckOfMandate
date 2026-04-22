import type { GameState } from "../../../types/game";

export const ANTI_FRENCH_SENTIMENT_TRIGGER_SUM = 20;
const ANTI_FRENCH_SENTIMENT_COST_STEP = 5;

function sumPowerAndTreasury(state: GameState): number {
  return state.resources.power + state.resources.treasuryStat;
}

export function antiFrenchSentimentActive(state: GameState): boolean {
  return state.levelId === "secondMandate" && sumPowerAndTreasury(state) > ANTI_FRENCH_SENTIMENT_TRIGGER_SUM;
}

/**
 * While active, costs increase immediately at >20 (+1), then gain another +1 for each additional full +5.
 */
export function antiFrenchSentimentEventSolveCostPenalty(state: GameState): number {
  if (!antiFrenchSentimentActive(state)) return 0;
  const overflow = sumPowerAndTreasury(state) - ANTI_FRENCH_SENTIMENT_TRIGGER_SUM;
  return Math.ceil(overflow / ANTI_FRENCH_SENTIMENT_COST_STEP);
}

function antiFrenchContainmentCardsInLibrary(state: GameState): number {
  const pool = [...state.deck, ...state.hand, ...state.discard];
  let count = 0;
  for (const id of pool) {
    if (state.cardsById[id]?.templateId === "antiFrenchContainment") count += 1;
  }
  return count;
}

export function antiFrenchSentimentEmotionValue(state: GameState): number {
  if (!antiFrenchSentimentActive(state)) return 0;
  return antiFrenchContainmentCardsInLibrary(state);
}

export function antiFrenchSentimentRyswickSurcharge(state: GameState): number {
  return antiFrenchSentimentEmotionValue(state) * 2;
}

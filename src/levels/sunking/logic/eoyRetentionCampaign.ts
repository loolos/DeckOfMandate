import { applyEffects } from "../../../logic/applyEffects";
import type { GameState } from "../../../types/game";

/** Injects anti-french containment into the deck when sentiment is active (Sun King chapter 2+). */
export function applyAntiFrenchContainmentDeckAfterRetentionYear(state: GameState): GameState {
  if (!state.playerStatuses.some((st) => st.templateId === "antiFrenchSentiment")) {
    return state;
  }
  return applyEffects(state, [{ kind: "addCardsToDeck", templateId: "antiFrenchContainment", count: 1 }]);
}

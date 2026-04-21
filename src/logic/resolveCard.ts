import { getCardTemplate } from "../data/cards";
import type { CardTemplateId } from "../levels/types/card";
import type { GameState } from "../types/game";
import { applyEffects, enforceLegitimacy } from "./applyEffects";

/** Crackdown has no automated effect list — handled by interaction flow. */
export function applyPlayedCardEffects(state: GameState, templateId: CardTemplateId): GameState {
  if (templateId === "crackdown" || templateId === "diplomaticIntervention") return state;
  const t = getCardTemplate(templateId);
  let s = applyEffects(state, t.effects);
  s = enforceLegitimacy(s);
  return s;
}

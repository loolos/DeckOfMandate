import { getCardTemplate } from "../data/cards";
import type { GameState } from "../types/game";
import type { CardTag } from "../levels/types/tags";
import { isInflationEnabled } from "./cardCost";

function isTemplateInflationGatedInFirstMandate(templateId: string): boolean {
  return templateId === "reform" || templateId === "ceremony" || templateId === "development";
}

/** While a `jansenistReservation` sits immediately to the right in hand order, this card gains the Defiance tag (unplayable). */
function hasDefianceFromJansenistNeighbor(state: GameState, cardInstanceId: string): boolean {
  const idx = state.hand.indexOf(cardInstanceId);
  if (idx < 0 || idx >= state.hand.length - 1) return false;
  const rightId = state.hand[idx + 1];
  if (!rightId) return false;
  return state.cardsById[rightId]?.templateId === "jansenistReservation";
}

export function getCardTagsForInstance(state: GameState, cardInstanceId: string): readonly CardTag[] {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return [];
  let tags: readonly CardTag[] = getCardTemplate(inst.templateId).tags;
  if (state.levelId === "firstMandate" && !isInflationEnabled(state) && isTemplateInflationGatedInFirstMandate(inst.templateId)) {
    tags = tags.filter((tag: CardTag) => tag !== "inflation");
  }
  if (hasDefianceFromJansenistNeighbor(state, cardInstanceId)) {
    tags = [...tags, "defiance"];
  }
  return tags;
}

export function hasCardTag(state: GameState, cardInstanceId: string, tag: CardTag): boolean {
  return getCardTagsForInstance(state, cardInstanceId).includes(tag);
}

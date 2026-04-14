import { getCardTemplate } from "../data/cards";
import type { GameState } from "../types/game";
import type { CardTag } from "../types/tags";
import { isInflationEnabled } from "./cardCost";

function isTemplateInflationGatedInFirstMandate(templateId: string): boolean {
  return templateId === "reform" || templateId === "ceremony" || templateId === "development";
}

export function getCardTagsForInstance(state: GameState, cardInstanceId: string): readonly CardTag[] {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return [];
  const baseTags = getCardTemplate(inst.templateId).tags;
  if (state.levelId !== "firstMandate" || isInflationEnabled(state)) return baseTags;
  if (!isTemplateInflationGatedInFirstMandate(inst.templateId)) return baseTags;
  return baseTags.filter((tag) => tag !== "inflation");
}

export function hasCardTag(state: GameState, cardInstanceId: string, tag: CardTag): boolean {
  return getCardTagsForInstance(state, cardInstanceId).includes(tag);
}

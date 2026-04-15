import type { CardTemplateId } from "../types/card";
import type { GameState } from "../types/game";
import { createInitialCardUseState } from "./cardUsage";

function makeGeneratedCardId(state: GameState, templateId: CardTemplateId, offset: number): string {
  let seq = Object.keys(state.cardsById).length + offset;
  let id = `gen_${templateId}_${seq}`;
  while (state.cardsById[id]) {
    seq += 1;
    id = `gen_${templateId}_${seq}`;
  }
  return id;
}

export function addCardsToDeck(state: GameState, templateId: CardTemplateId, count: number): GameState {
  if (count <= 0) return state;
  const cardsById = { ...state.cardsById };
  const cardUsesById = { ...state.cardUsesById };
  const addedIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = makeGeneratedCardId({ ...state, cardsById }, templateId, i);
    cardsById[id] = { instanceId: id, templateId };
    const usage = createInitialCardUseState(state.levelId, templateId);
    if (usage) cardUsesById[id] = usage;
    addedIds.push(id);
  }
  return {
    ...state,
    cardsById,
    cardUsesById,
    deck: [...addedIds, ...state.deck],
  };
}

export function addCardsToHand(state: GameState, templateId: CardTemplateId, count: number): GameState {
  if (count <= 0) return state;
  const cardsById = { ...state.cardsById };
  const cardUsesById = { ...state.cardUsesById };
  const addedIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = makeGeneratedCardId({ ...state, cardsById }, templateId, i);
    cardsById[id] = { instanceId: id, templateId };
    const usage = createInitialCardUseState(state.levelId, templateId);
    if (usage) cardUsesById[id] = usage;
    addedIds.push(id);
  }
  return {
    ...state,
    cardsById,
    cardUsesById,
    hand: [...state.hand, ...addedIds],
  };
}

export function applyOnDrawCardEffects(state: GameState, drawnCardId: string): GameState {
  const inst = state.cardsById[drawnCardId];
  if (!inst) return state;
  if (inst.templateId !== "fiscalBurden") return state;
  return {
    ...state,
    resources: {
      ...state.resources,
      funding: Math.max(0, state.resources.funding - 1),
    },
  };
}

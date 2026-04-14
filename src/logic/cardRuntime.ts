import type { CardTemplateId } from "../types/card";
import type { GameState } from "../types/game";

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
  const addedIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = makeGeneratedCardId({ ...state, cardsById }, templateId, i);
    cardsById[id] = { instanceId: id, templateId };
    addedIds.push(id);
  }
  return {
    ...state,
    cardsById,
    deck: [...addedIds, ...state.deck],
  };
}

export function addCardsToHand(state: GameState, templateId: CardTemplateId, count: number): GameState {
  if (count <= 0) return state;
  const cardsById = { ...state.cardsById };
  const addedIds: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = makeGeneratedCardId({ ...state, cardsById }, templateId, i);
    cardsById[id] = { instanceId: id, templateId };
    addedIds.push(id);
  }
  return {
    ...state,
    cardsById,
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

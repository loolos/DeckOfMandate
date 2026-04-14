import { getCardTemplate } from "../data/cards";
import type { GameState } from "../types/game";

function isInflationEnabled(state: GameState): boolean {
  return state.levelId === "secondMandate";
}

function isInflationCard(state: GameState, cardInstanceId: string): boolean {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return false;
  return getCardTemplate(inst.templateId).tags.includes("inflation");
}

export function getCardInflationDelta(state: GameState, cardInstanceId: string): number {
  if (!isInflationEnabled(state)) return 0;
  if (!isInflationCard(state, cardInstanceId)) return 0;
  return Math.max(0, state.cardInflationById[cardInstanceId] ?? 0);
}

export function getPlayableCardCost(state: GameState, cardInstanceId: string): number {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return 0;
  const base = getCardTemplate(inst.templateId).cost;
  return base + getCardInflationDelta(state, cardInstanceId);
}

export function applyInflationFromDeckRefill(state: GameState, movedCardIds: readonly string[]): GameState {
  if (!isInflationEnabled(state) || movedCardIds.length === 0) return state;
  let nextMap: Record<string, number> | null = null;
  for (const id of movedCardIds) {
    if (!isInflationCard(state, id)) continue;
    if (!nextMap) nextMap = { ...state.cardInflationById };
    nextMap[id] = (nextMap[id] ?? 0) + 1;
  }
  if (!nextMap) return state;
  return { ...state, cardInflationById: nextMap };
}

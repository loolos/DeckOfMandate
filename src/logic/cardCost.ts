import { getCardTemplate } from "../data/cards";
import { appendActionLog } from "./actionLog";
import type { GameState } from "../types/game";

const FIRST_CHAPTER_INFLATION_THRESHOLD = 14;

export function isInflationEnabled(state: GameState): boolean {
  if (state.levelId === "secondMandate") return true;
  if (state.levelId !== "firstMandate") return false;
  const pressureScore =
    state.resources.power + state.resources.treasuryStat + state.resources.legitimacy;
  return pressureScore >= FIRST_CHAPTER_INFLATION_THRESHOLD;
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
  const nextState = { ...state, cardInflationById: nextMap };
  if (
    nextState.levelId === "firstMandate" &&
    !nextState.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === "firstMandateInflationActivated")
  ) {
    return appendActionLog(nextState, { kind: "info", infoKey: "firstMandateInflationActivated" });
  }
  return nextState;
}

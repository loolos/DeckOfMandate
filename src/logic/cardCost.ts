import { getCardTemplate } from "../data/cards";
import { appendActionLog } from "./actionLog";
import { hasCardTag } from "./cardTags";
import type { GameState } from "../types/game";

const FIRST_CHAPTER_INFLATION_THRESHOLD = 12;

export function isInflationEnabled(state: GameState): boolean {
  if (state.levelId === "secondMandate") return true;
  if (state.levelId !== "firstMandate") return false;
  const pressureScore =
    state.resources.power + state.resources.treasuryStat + state.resources.legitimacy;
  return pressureScore >= FIRST_CHAPTER_INFLATION_THRESHOLD;
}

function isInflationCard(state: GameState, cardInstanceId: string): boolean {
  return hasCardTag(state, cardInstanceId, "inflation");
}

export function getCardInflationDelta(state: GameState, cardInstanceId: string): number {
  if (!isInflationEnabled(state)) return 0;
  if (!isInflationCard(state, cardInstanceId)) return 0;
  return Math.max(0, state.cardInflationById[cardInstanceId] ?? 0);
}

export function getPlayableCardCost(state: GameState, cardInstanceId: string): number {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return 0;
  if (inst.templateId === "antiFrenchContainment") {
    return Math.max(1, Math.floor(state.europeAlertProgress / 2));
  }
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

export function appendInflationActivationLogIfNeeded(prev: GameState, next: GameState): GameState {
  if (prev.levelId !== "firstMandate" || next.levelId !== "firstMandate") return next;
  if (isInflationEnabled(prev) || !isInflationEnabled(next)) return next;
  if (next.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === "firstMandateInflationActivated")) {
    return next;
  }
  return appendActionLog(next, { kind: "info", infoKey: "firstMandateInflationActivated" });
}

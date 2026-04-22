import { getCardTemplate } from "../../../data/cards";
import { getLevelDef } from "../../../data/levels";
import { appendActionLog } from "./actionLog";
import { hasCardTag } from "./cardTags";
import type { GameState } from "../../../types/game";

export function isInflationEnabled(state: GameState): boolean {
  const inf = getLevelDef(state.levelId).features.inflation;
  if (inf.kind === "always") return true;
  if (inf.kind === "off") return false;
  const pressureScore =
    state.resources.power + state.resources.treasuryStat + state.resources.legitimacy;
  return pressureScore >= inf.threshold;
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
  if (inst.templateId === "fiscalBurden") {
    return Math.floor(state.resources.treasuryStat / 5) + 1;
  }
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
  if (prev.levelId !== next.levelId) return next;
  const logKey = getLevelDef(next.levelId).features.inflationActivationLogKey;
  if (!logKey) return next;
  if (isInflationEnabled(prev) || !isInflationEnabled(next)) return next;
  if (next.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === logKey)) {
    return next;
  }
  return appendActionLog(next, { kind: "info", infoKey: logKey });
}

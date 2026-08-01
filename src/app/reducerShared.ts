/** Reducer helpers shared by the engine reducer and campaign reducer-bridge handlers. */
import { getCardTemplate } from "../data/cards";
import { appendActionLog } from "../logic/actionLog";
import { hasCardTag } from "../logic/cardTags";
import { limitedUseCardDepletionPenalty, purgeCampaignCardSideTables } from "../levels/campaignLogicBundle";
import type { GameState } from "../types/game";

export function removeHand(state: GameState, instanceId: string): GameState {
  return { ...state, hand: state.hand.filter((id) => id !== instanceId) };
}

export function isPlayingActionPhase(state: GameState): boolean {
  return state.outcome === "playing" && state.phase === "action";
}

export function isPlayingActionPhaseWithoutPendingInteraction(state: GameState): boolean {
  return isPlayingActionPhase(state) && !state.pendingInteraction;
}

export function isTemporaryCardInstance(state: GameState, instanceId: string): boolean {
  return hasCardTag(state, instanceId, "temp");
}

export function purgeExtraCardsIfLevelEnded(state: GameState): GameState {
  if (state.outcome === "playing") return state;
  const isExtraCardId = (id: string): boolean => {
    const inst = state.cardsById[id];
    if (!inst) return false;
    return getCardTemplate(inst.templateId).tags.includes("extra");
  };
  const nextCardsById = Object.fromEntries(
    Object.entries(state.cardsById).filter(([id]) => !isExtraCardId(id)),
  );
  const purged: GameState = {
    ...state,
    hand: state.hand.filter((id) => !isExtraCardId(id)),
    deck: state.deck.filter((id) => !isExtraCardId(id)),
    discard: state.discard.filter((id) => !isExtraCardId(id)),
    cardsById: nextCardsById,
  };
  return purgeCampaignCardSideTables(purged, isExtraCardId);
}

export function pushDiscard(state: GameState, instanceId: string): GameState {
  if (isTemporaryCardInstance(state, instanceId)) return state;
  return { ...state, discard: [...state.discard, instanceId] };
}

export function consumeLimitedUseCard(
  state: GameState,
  instanceId: string,
): { state: GameState; exhausted: boolean } {
  const usage = state.cardUsesById[instanceId];
  if (!usage) return { state, exhausted: false };
  const cardUsesById = { ...state.cardUsesById };
  const nextRemaining = Math.max(0, usage.remaining - 1);
  if (nextRemaining > 0) {
    cardUsesById[instanceId] = { ...usage, remaining: nextRemaining };
    return { state: { ...state, cardUsesById }, exhausted: false };
  }
  delete cardUsesById[instanceId];
  let s: GameState = { ...state, cardUsesById };
  const depleted = limitedUseCardDepletionPenalty(s, instanceId);
  s = depleted.state;
  if (depleted.infoKey) {
    s = appendActionLog(s, { kind: "info", infoKey: depleted.infoKey });
  }
  return { state: s, exhausted: true };
}

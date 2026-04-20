import type { CardTemplateId } from "../levels/types/card";
import type { GameState } from "../types/game";
import type { PlayerStatusInstance } from "../levels/types/status";
import { appendActionLog } from "./actionLog";
import { createInitialCardUseState } from "./cardUsage";
import { rngNext, rngNextInt } from "./rng";

function makeGeneratedCardId(state: GameState, templateId: CardTemplateId, offset: number): string {
  let seq = Object.keys(state.cardsById).length + offset;
  let id = `gen_${templateId}_${seq}`;
  while (state.cardsById[id]) {
    seq += 1;
    id = `gen_${templateId}_${seq}`;
  }
  return id;
}

function insertCardsIntoDeckAtRandomPositions(
  rng: GameState["rng"],
  deck: readonly string[],
  addedIds: readonly string[]
): { rng: GameState["rng"]; deck: string[] } {
  let nextRng = rng;
  const nextDeck = [...deck];
  for (const id of addedIds) {
    const [r2, idx] = rngNextInt(nextRng, nextDeck.length + 1);
    nextRng = r2;
    nextDeck.splice(idx, 0, id);
  }
  return { rng: nextRng, deck: nextDeck };
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
  const inserted = insertCardsIntoDeckAtRandomPositions(state.rng, state.deck, addedIds);
  return {
    ...state,
    rng: inserted.rng,
    cardsById,
    cardUsesById,
    deck: inserted.deck,
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

/**
 * Removes every instance of `templateId` from `cardsById`, hand, deck, discard,
 * and any associated per-instance metadata (uses, inflation).
 *
 * Used when a card class needs to be wiped from the run entirely (e.g. ending
 * the Huguenot suppression chain).
 */
export function removeCardsEverywhere(state: GameState, templateId: CardTemplateId): GameState {
  const toRemove = new Set<string>();
  for (const id in state.cardsById) {
    if (state.cardsById[id]?.templateId === templateId) {
      toRemove.add(id);
    }
  }
  if (toRemove.size === 0) return state;
  const cardsById = { ...state.cardsById };
  const cardInflationById = { ...state.cardInflationById };
  const cardUsesById = { ...state.cardUsesById };
  for (const id of toRemove) {
    delete cardsById[id];
    delete cardInflationById[id];
    delete cardUsesById[id];
  }
  return {
    ...state,
    hand: state.hand.filter((id) => !toRemove.has(id)),
    deck: state.deck.filter((id) => !toRemove.has(id)),
    discard: state.discard.filter((id) => !toRemove.has(id)),
    cardsById,
    cardUsesById,
    cardInflationById,
  };
}

/** Counts cards of `templateId` that are currently in play (deck + hand + discard). */
export function countCardsInPlay(state: GameState, templateId: CardTemplateId): number {
  let count = 0;
  const tally = (id: string): void => {
    if (state.cardsById[id]?.templateId === templateId) count += 1;
  };
  state.hand.forEach(tally);
  state.deck.forEach(tally);
  state.discard.forEach(tally);
  return count;
}

/**
 * Removes any `templateId` instances that exist in `cardsById` but are not
 * present in any zone (deck/hand/discard). Keeps `cardsById` from accumulating
 * orphan records after a card is consumed without being pushed to discard.
 */
function pruneOrphanCards(state: GameState, templateId: CardTemplateId): GameState {
  const live = new Set<string>([...state.hand, ...state.deck, ...state.discard]);
  const orphans: string[] = [];
  for (const id in state.cardsById) {
    if (state.cardsById[id]?.templateId !== templateId) continue;
    if (!live.has(id)) orphans.push(id);
  }
  if (orphans.length === 0) return state;
  const cardsById = { ...state.cardsById };
  const cardInflationById = { ...state.cardInflationById };
  const cardUsesById = { ...state.cardUsesById };
  for (const id of orphans) {
    delete cardsById[id];
    delete cardInflationById[id];
    delete cardUsesById[id];
  }
  return { ...state, cardsById, cardInflationById, cardUsesById };
}

/**
 * Strict invariant: the `huguenotContainment` status's `turnsRemaining` MUST
 * equal the number of `suppressHuguenots` cards that exist in the player's
 * deck/hand/discard at all times.
 *
 * This helper resyncs both sides whenever they drift:
 *  - if no status exists, any leftover suppress cards are wiped (defensive).
 *  - if status exists but no suppress cards remain, the status is removed,
 *    the resurgence counter is reset, and orphan card records are pruned.
 *  - otherwise `turnsRemaining` is overwritten to match the live card count
 *    and orphan records are pruned.
 *
 * Call this after any operation that touches either side (adding cards,
 * playing a suppress card, hydrating a save, etc.).
 */
export function enforceHuguenotContainmentInvariant(state: GameState): GameState {
  const status = state.playerStatuses.find((p) => p.templateId === "huguenotContainment");
  const cardCount = countCardsInPlay(state, "suppressHuguenots");
  if (!status) {
    if (cardCount === 0) return state;
    return removeCardsEverywhere(state, "suppressHuguenots");
  }
  if (cardCount === 0) {
    const cleaned = removeCardsEverywhere(state, "suppressHuguenots");
    return {
      ...cleaned,
      playerStatuses: cleaned.playerStatuses.filter(
        (p) => p.templateId !== "huguenotContainment",
      ),
      huguenotResurgenceCounter: 0,
    };
  }
  const pruned = pruneOrphanCards(state, "suppressHuguenots");
  if (status.turnsRemaining === cardCount) return pruned;
  const playerStatuses: PlayerStatusInstance[] = pruned.playerStatuses.map((p) =>
    p.instanceId === status.instanceId ? { ...p, turnsRemaining: cardCount } : p,
  );
  return { ...pruned, playerStatuses };
}

export function applyOnDrawCardEffects(state: GameState, drawnCardId: string): GameState {
  const inst = state.cardsById[drawnCardId];
  if (!inst) return state;
  if (inst.templateId === "fiscalBurden") {
    const nextState = {
      ...state,
      resources: {
        ...state.resources,
        funding: Math.max(0, state.resources.funding - 1),
      },
    };
    return appendActionLog(nextState, { kind: "info", infoKey: "cardDraw.fiscalBurdenTriggered" });
  }
  if (inst.templateId === "antiFrenchContainment") {
    const [rng, u] = rngNext(state.rng);
    if (u < 0.5) {
      const nextState = {
        ...state,
        rng,
        resources: {
          ...state.resources,
          power: Math.max(0, state.resources.power - 1),
        },
      };
      return appendActionLog(nextState, { kind: "info", infoKey: "cardDraw.antiFrenchContainmentPowerLoss" });
    }
    const nextState = {
      ...state,
      rng,
      resources: {
        ...state.resources,
        legitimacy: Math.max(0, state.resources.legitimacy - 1),
      },
    };
    return appendActionLog(nextState, { kind: "info", infoKey: "cardDraw.antiFrenchContainmentLegitimacyLoss" });
  }
  return state;
}

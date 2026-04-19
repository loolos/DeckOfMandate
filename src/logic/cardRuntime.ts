import type { CardTemplateId } from "../types/card";
import type { GameState } from "../types/game";
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

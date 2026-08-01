import { getLevelContent } from "../../data/levelContent";
import {
  registerLevelInitialStateHooks,
  type OpeningShuffleContext,
  type OpeningShuffleResult,
} from "../../data/levelInitialStateRegistry";
import { insertCardsIntoDeckAtRandomPositions } from "../../logic/cardRuntime";
import { registerNantesStarterCardsForThirdMandate } from "../../logic/thirdMandateStart";
import { shuffle } from "../../logic/rng";
import type { CardInstance } from "../types/card";
import { THIRD_MANDATE_LEVEL_ID } from "./logic/thirdMandateConstants";

function thirdMandateRefitConfig() {
  const cfg = getLevelContent(THIRD_MANDATE_LEVEL_ID).refit;
  if (!cfg) throw new Error("initialState: thirdMandate.refit is required");
  return cfg;
}

function thirdMandateRefitNewCards() {
  const newCards = thirdMandateRefitConfig().newCardsTemplateOrder;
  if (!newCards.length) {
    throw new Error("initialState: thirdMandate.refit.newCardsTemplateOrder is required");
  }
  return newCards;
}

function thirdMandateShuffleOpening(ctx: OpeningShuffleContext): OpeningShuffleResult {
  const ch3RefitOrder = thirdMandateRefitNewCards();
  const cardsById: Record<string, CardInstance> = { ...ctx.cardsById };
  const ch3Ids: string[] = [];
  for (let i = 0; i < ch3RefitOrder.length; i++) {
    const templateId = ch3RefitOrder[i]!;
    const instanceId = `ch3_hand_${i}_${templateId}`;
    cardsById[instanceId] = { instanceId, templateId };
    ch3Ids.push(instanceId);
  }
  const nantesIds = registerNantesStarterCardsForThirdMandate(
    cardsById,
    ctx.campaignFields.nantesPolicyCarryover!,
  );
  const coreIds = ctx.deckOrder.map((c) => c.instanceId);
  const fullPool = [...coreIds, ...ch3Ids];
  const [rng2, shuffledIds] = shuffle(ctx.rng, fullPool);
  const initialHandIds = shuffledIds.slice(0, 2);
  let deckFromShuffle = shuffledIds.slice(2);
  const inserted = insertCardsIntoDeckAtRandomPositions(rng2, deckFromShuffle, nantesIds);
  return {
    rng: inserted.rng,
    cardsById,
    initialHandIds,
    deckInstanceIds: inserted.deck,
  };
}

export function registerSunkingInitialStateHooks(): void {
  registerLevelInitialStateHooks(THIRD_MANDATE_LEVEL_ID, {
    adjustDefaultStarterDeckOrder: (order) => order.filter((id) => id !== "funding" && id !== "crackdown"),
    shuffleOpeningDeckAndHand: thirdMandateShuffleOpening,
  });
}

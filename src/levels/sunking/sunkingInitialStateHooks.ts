import { getCardTemplate } from "../../data/cards";
import { getLevelContent } from "../../data/levelContent";
import {
  registerLevelInitialStateHooks,
  type OpeningShuffleContext,
  type OpeningShuffleResult,
} from "../../data/levelInitialStateRegistry";
import { insertCardsIntoDeckAtRandomPositions } from "../../logic/cardRuntime";
import { registerNantesStarterCardsForThirdMandate, resolveThirdMandateNantesPolicy } from "../../logic/thirdMandateStart";
import { shuffle } from "../../logic/rng";
import type { CardInstance } from "../types/card";
import { SUNKING_CH2_ID } from "./chapter2Transition";
import { THIRD_MANDATE_LEVEL_ID } from "./logic/thirdMandateConstants";

const STANDALONE_CH3_INFLATION_TARGET_COST = 4;

function thirdMandateShuffleOpening(ctx: OpeningShuffleContext): OpeningShuffleResult {
  const ch3RefitOrder = getLevelContent(THIRD_MANDATE_LEVEL_ID).chapter3RefitStartingHandOrder;
  if (!ch3RefitOrder?.length) {
    throw new Error("initialState: thirdMandate.chapter3RefitStartingHandOrder is required");
  }
  const cardsById: Record<string, CardInstance> = { ...ctx.cardsById };
  const ch3Ids: string[] = [];
  for (let i = 0; i < ch3RefitOrder.length; i++) {
    const templateId = ch3RefitOrder[i]!;
    const instanceId = `ch3_hand_${i}_${templateId}`;
    cardsById[instanceId] = { instanceId, templateId };
    ch3Ids.push(instanceId);
  }
  const nantesIds = registerNantesStarterCardsForThirdMandate(cardsById, ctx.nantesPolicyCarryover!);
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

function thirdMandateOpeningInflation(cardsById: Record<string, CardInstance>): Record<string, number> {
  const cardInflationById: Record<string, number> = {};
  for (const id of Object.keys(cardsById)) {
    const t = cardsById[id]?.templateId;
    if (t && getCardTemplate(t).tags.includes("inflation")) {
      cardInflationById[id] = Math.max(0, STANDALONE_CH3_INFLATION_TARGET_COST - getCardTemplate(t).cost);
    }
  }
  return cardInflationById;
}

export function registerSunkingInitialStateHooks(): void {
  registerLevelInitialStateHooks(SUNKING_CH2_ID, {
    defaultWarOfDevolutionAttackedWhenUnset: () => true,
  });

  registerLevelInitialStateHooks(THIRD_MANDATE_LEVEL_ID, {
    resolveNantesPolicyCarryover: (raw) => resolveThirdMandateNantesPolicy(raw ?? null),
    adjustDefaultStarterDeckOrder: (order) => order.filter((id) => id !== "funding" && id !== "crackdown"),
    shuffleOpeningDeckAndHand: thirdMandateShuffleOpening,
    seedOpeningCardInflationById: thirdMandateOpeningInflation,
  });
}

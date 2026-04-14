import { getCardTemplate } from "../data/cards";
import { getLevelContent } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
import { computeEuropeAlertDrawPenalty } from "../logic/europeAlert";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../types/card";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../types/event";
import type { GameState, Resources } from "../types/game";

export const LEVEL2_FIXED_NEW_IDS = [
  "grainRelief",
  "taxRebalance",
  "diplomaticCongress",
] as const;
export type Level2StartMode = "standalone" | "continuity";

export type Level2CarryoverCard = {
  instanceId: string;
  templateId: CardTemplateId;
  inflationDelta: number;
};

export type Level2StandaloneDraft = {
  mode: "standalone";
  seed?: number;
  calendarStartYear: number;
  resources: Resources;
  warOfDevolutionAttacked: boolean;
  europeAlert: boolean;
  carryoverCards: readonly Level2CarryoverCard[];
  removedCarryoverIds: readonly string[];
};

export type Level2ContinuityDraft = {
  mode: "continuity";
  seed?: number;
  calendarStartYear: number;
  resources: Resources;
  warOfDevolutionAttacked: boolean;
  europeAlert: boolean;
  carryoverCards: readonly Level2CarryoverCard[];
  removedCarryoverIds: readonly string[];
};

export type Level2StartDraft = Level2StandaloneDraft | Level2ContinuityDraft;

export type Level2Validation = {
  totalCards: number;
  totalNewCards: number;
  adjustableChanges: number;
  maxAdjustableChanges: number;
  isValid: boolean;
};

export const LEVEL2_CONTINUITY_MAX_REMOVALS = 3;

export function createStandaloneLevel2Draft(seed?: number): Level2StandaloneDraft {
  const level = getLevelDef("secondMandate");
  const carryoverCards = getLevelContent("firstMandate").starterDeckTemplateOrder
    .filter((templateId) => templateId !== "development")
    .map((templateId, i) => ({
      instanceId: `standalone_old_${i}_${templateId}`,
      templateId,
      inflationDelta: templateId === "reform" || templateId === "ceremony" ? 1 : 0,
    }));
  return {
    mode: "standalone",
    seed,
    calendarStartYear: level.calendarStartYear,
    resources: {
      ...level.startingResources,
      treasuryStat: 7,
      power: 7,
      legitimacy: 5,
    },
    // Standalone chapter-2 starts are treated as if the player chose the prior war branch.
    warOfDevolutionAttacked: true,
    europeAlert: true,
    carryoverCards,
    removedCarryoverIds: [],
  };
}

function buildContinuityCarryoverCards(from: GameState): Level2CarryoverCard[] {
  const orderedPoolIds = [...from.deck, ...from.discard, ...from.hand];
  const seen = new Set<string>();
  const out: Level2CarryoverCard[] = [];
  const appendIfEligible = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const inst = from.cardsById[id];
    if (!inst) return;
    if (getCardTemplate(inst.templateId).tags.includes("temp")) return;
    out.push({
      instanceId: id,
      templateId: inst.templateId,
      inflationDelta: Math.max(0, from.cardInflationById[id] ?? 0),
    });
  };
  for (const id of orderedPoolIds) {
    appendIfEligible(id);
  }
  for (const id of Object.keys(from.cardsById)) {
    appendIfEligible(id);
  }
  return out;
}

export function createContinuityLevel2Draft(from: GameState, seed?: number): Level2ContinuityDraft {
  const carryoverCalendarStartYear = from.calendarStartYear + from.turn - 1;
  const inheritedResources: Resources = {
    treasuryStat: from.resources.treasuryStat,
    power: from.resources.power,
    legitimacy: from.resources.legitimacy + (from.warOfDevolutionAttacked ? 1 : 0),
    funding: 0,
  };
  const carryoverCards = buildContinuityCarryoverCards(from);
  return {
    mode: "continuity",
    seed,
    calendarStartYear: carryoverCalendarStartYear,
    resources: inheritedResources,
    warOfDevolutionAttacked: from.warOfDevolutionAttacked,
    europeAlert: from.warOfDevolutionAttacked,
    carryoverCards,
    removedCarryoverIds: [],
  };
}

export function toggleContinuityCardRemoval<T extends Level2StartDraft>(
  draft: T,
  instanceId: string,
): T {
  if (!draft.carryoverCards.some((card) => card.instanceId === instanceId)) return draft;
  const removed = new Set(draft.removedCarryoverIds);
  if (removed.has(instanceId)) {
    removed.delete(instanceId);
    return { ...draft, removedCarryoverIds: [...removed] } as T;
  }
  if (removed.size >= LEVEL2_CONTINUITY_MAX_REMOVALS) return draft;
  removed.add(instanceId);
  return { ...draft, removedCarryoverIds: [...removed] } as T;
}

export function validateLevel2ContinuityRefit(draft: Level2StartDraft): Level2Validation {
  const uniqueRemoved = new Set(draft.removedCarryoverIds);
  const removedCards = uniqueRemoved.size;
  const keptCarryover = draft.carryoverCards.length - removedCards;
  const totalCards = keptCarryover + LEVEL2_FIXED_NEW_IDS.length;
  return {
    totalCards,
    totalNewCards: LEVEL2_FIXED_NEW_IDS.length,
    adjustableChanges: removedCards,
    maxAdjustableChanges: LEVEL2_CONTINUITY_MAX_REMOVALS,
    isValid: removedCards <= LEVEL2_CONTINUITY_MAX_REMOVALS && keptCarryover > 0,
  };
}

export function validateLevel2Draft(draft: Level2StartDraft): Level2Validation {
  return validateLevel2ContinuityRefit(draft);
}

export function buildLevel2StateFromDraft(draft: Level2StartDraft): GameState {
  return buildContinuityLevel2State(draft);
}

function buildContinuityLevel2State(draft: Level2StartDraft): GameState {
  const runSeed = ((draft.seed ?? Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 0x9e3779b9;
  let rng = createRngFromSeed(runSeed);
  const removed = new Set(draft.removedCarryoverIds);
  const keptCards = draft.carryoverCards.filter((card) => !removed.has(card.instanceId));
  const deckOrder: Array<{ instanceId: string; templateId: CardTemplateId }> = keptCards.map((card) => ({
    instanceId: card.instanceId,
    templateId: card.templateId,
  }));
  const occupied = new Set(deckOrder.map((card) => card.instanceId));
  for (const id of LEVEL2_FIXED_NEW_IDS) {
    let counter = 1;
    let instanceId = `chapter2_new_${id}_${counter}`;
    while (occupied.has(instanceId)) {
      counter += 1;
      instanceId = `chapter2_new_${id}_${counter}`;
    }
    occupied.add(instanceId);
    deckOrder.push({ instanceId, templateId: id });
  }
  const [rng2, shuffled] = shuffle(rng, deckOrder);
  rng = rng2;

  const cardsById: Record<string, CardInstance> = {};
  for (const c of shuffled) {
    cardsById[c.instanceId] = { instanceId: c.instanceId, templateId: c.templateId };
  }
  const cardInflationById: Record<string, number> = {};
  for (const card of keptCards) {
    if (card.inflationDelta > 0) {
      cardInflationById[card.instanceId] = card.inflationDelta;
    }
  }
  const europeAlertDrawPenalty = draft.europeAlert
    ? computeEuropeAlertDrawPenalty(draft.resources.power)
    : 0;

  const base: GameState = {
    levelId: "secondMandate",
    calendarStartYear: draft.calendarStartYear,
    runSeed,
    rng,
    turn: 1,
    phase: "action",
    outcome: "playing",
    pendingInteraction: null,
    nextIds: { event: 0, status: 0, log: 0 },
    resources: draft.resources,
    nextTurnDrawModifier: 0,
    scheduledDrawModifiers: [],
    deck: shuffled.map((c) => c.instanceId),
    discard: [],
    hand: [],
    cardsById,
    cardInflationById,
    slots: { ...EMPTY_EVENT_SLOTS },
    pendingMajorCrisis: { ...EMPTY_PENDING_MAJOR_CRISIS },
    playerStatuses: [],
    antiFrenchLeague: null,
    warOfDevolutionAttacked: draft.warOfDevolutionAttacked,
    europeAlert: draft.europeAlert,
    europeAlertDrawPenalty,
    nymwegenSettlementAchieved: false,
    proceduralEventSequence: [],
    actionLog: [],
  };

  return beginYear(base);
}

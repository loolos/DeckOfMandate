import { getCardTemplate } from "../../data/cards";
import { getLevelContent, getLevelDef } from "../../data/levelRegistry";
import { appendActionLog } from "../../logic/actionLog";
import { insertCardsIntoDeckAtRandomPositions } from "../../logic/cardRuntime";
import { createInitialCardUseState } from "../../logic/cardUsage";
import { THIRD_MANDATE_LEVEL_ID } from "../../logic/thirdMandateConstants";
import { registerNantesStarterCardsForThirdMandate, resolveThirdMandateNantesPolicy } from "../../logic/thirdMandateStart";
import { createRngFromSeed, shuffle } from "../../logic/rng";
import { calendarYearForTurn } from "../../logic/scriptedCalendar";
import { beginYear } from "../../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../types/card";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../types/event";
import type { GameState, NantesPolicyCarryover, Resources } from "../../types/game";
import { LEVEL3_STARTING_HAND_TEMPLATE_ORDER } from "./chapters/thirdMandate";
import {
  createDeckRefitCarryoverSnapshot,
  LEVEL2_CONTINUITY_MAX_REMOVALS,
  SUNKING_CH2_ID,
  type Level2CarryoverCard,
  type Level2Validation,
} from "./chapter2Transition";

export const LEVEL3_CONTINUITY_MAX_REMOVALS = LEVEL2_CONTINUITY_MAX_REMOVALS;
export type Level3CarryoverCard = Level2CarryoverCard;

const LEVEL3_HAND_NEW_COUNT = LEVEL3_STARTING_HAND_TEMPLATE_ORDER.length;
const STANDALONE_CH3_REMOVED_TEMPLATES = new Set<CardTemplateId>(["funding", "crackdown"]);
const STANDALONE_CH3_INFLATION_TARGET_COST = 4;

export type Level3StandaloneDraft = {
  mode: "standalone";
  seed?: number;
  calendarStartYear: number;
  resources: Resources;
  warOfDevolutionAttacked: boolean;
  nantesPolicyCarryover: NantesPolicyCarryover | null;
  carryoverCards: readonly Level3CarryoverCard[];
  removedCarryoverIds: readonly string[];
};

export type Level3ContinuityDraft = {
  mode: "continuity";
  seed?: number;
  calendarStartYear: number;
  resources: Resources;
  warOfDevolutionAttacked: boolean;
  nantesPolicyCarryover: NantesPolicyCarryover | null;
  carryoverCards: readonly Level3CarryoverCard[];
  removedCarryoverIds: readonly string[];
};

export type Level3StartDraft = Level3StandaloneDraft | Level3ContinuityDraft;

/** Synthetic chapter-2-equivalent library for main-menu chapter 3 (same removal rules as continuity). */
export function createStandaloneLevel3Draft(seed?: number): Level3StandaloneDraft {
  const level = getLevelDef(THIRD_MANDATE_LEVEL_ID);
  const ch2Templates = getLevelContent(SUNKING_CH2_ID).starterDeckTemplateOrder;
  const carryoverCards: Level3CarryoverCard[] = ch2Templates
    .filter((templateId) => !STANDALONE_CH3_REMOVED_TEMPLATES.has(templateId))
    .map((templateId, i) => {
      const tmpl = getCardTemplate(templateId);
      const targetInflationDelta = tmpl.tags.includes("inflation")
        ? Math.max(0, STANDALONE_CH3_INFLATION_TARGET_COST - tmpl.cost)
        : 0;
      const usage = createInitialCardUseState(THIRD_MANDATE_LEVEL_ID, templateId);
      const standaloneRoyalUses =
        templateId === "funding" || templateId === "crackdown" || templateId === "development" ? 1 : null;
      return {
        instanceId: `standalone_ch3_old_${i}_${templateId}`,
        templateId,
        inflationDelta: targetInflationDelta,
        remainingUses: standaloneRoyalUses ?? usage?.remaining ?? null,
        totalUses: standaloneRoyalUses ?? usage?.total ?? null,
      };
    });
  return {
    mode: "standalone",
    seed,
    calendarStartYear: level.calendarStartYear,
    resources: { ...level.startingResources },
    warOfDevolutionAttacked: true,
    nantesPolicyCarryover: null,
    carryoverCards,
    removedCarryoverIds: [],
  };
}

export function createContinuityLevel3Draft(from: GameState, seed?: number): Level3ContinuityDraft {
  if (from.levelId !== SUNKING_CH2_ID) {
    throw new Error("chapter3Transition: expected chapter 2 (secondMandate) end state");
  }
  const carryoverCalendarStartYear = calendarYearForTurn(from.levelId, from.calendarStartYear, from.turn);
  const inheritedResources: Resources = {
    treasuryStat: from.resources.treasuryStat,
    power: from.resources.power,
    legitimacy: from.resources.legitimacy + (from.warOfDevolutionAttacked ? 1 : 0),
    funding: 0,
  };
  const carryoverCards = createDeckRefitCarryoverSnapshot(from);
  return {
    mode: "continuity",
    seed,
    calendarStartYear: carryoverCalendarStartYear,
    resources: inheritedResources,
    warOfDevolutionAttacked: from.warOfDevolutionAttacked,
    nantesPolicyCarryover: from.nantesPolicyCarryover,
    carryoverCards,
    removedCarryoverIds: [],
  };
}

export function validateLevel3Draft(draft: Level3StartDraft): Level2Validation {
  const uniqueRemoved = new Set(draft.removedCarryoverIds);
  const removedCards = uniqueRemoved.size;
  const keptCarryover = draft.carryoverCards.length - removedCards;
  const totalCards = keptCarryover + LEVEL3_HAND_NEW_COUNT;
  return {
    totalCards,
    totalNewCards: LEVEL3_HAND_NEW_COUNT,
    adjustableChanges: removedCards,
    maxAdjustableChanges: LEVEL3_CONTINUITY_MAX_REMOVALS,
    isValid: removedCards <= LEVEL3_CONTINUITY_MAX_REMOVALS && keptCarryover > 0,
  };
}

export function applyRemovedIndicesToLevel3Draft(
  draft: Level3StartDraft,
  removedIndices: readonly number[],
): Level3StartDraft {
  const removedIds: string[] = [];
  for (const idx of removedIndices) {
    const card = draft.carryoverCards[idx];
    if (!card) throw new Error(`chapter3Transition: removedIndex ${idx} out of range`);
    removedIds.push(card.instanceId);
  }
  return { ...draft, removedCarryoverIds: removedIds };
}

export function buildLevel3StateFromDraft(draft: Level3StartDraft): GameState {
  const runSeed = ((draft.seed ?? Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 0x9e3779b9;
  let rng = createRngFromSeed(runSeed);
  const removed = new Set(draft.removedCarryoverIds);
  const keptCards = draft.carryoverCards.filter((card) => !removed.has(card.instanceId));
  const policy = resolveThirdMandateNantesPolicy(draft.nantesPolicyCarryover);

  const cardsById: Record<string, CardInstance> = {};
  for (const card of keptCards) {
    cardsById[card.instanceId] = { instanceId: card.instanceId, templateId: card.templateId };
  }

  const ch3Ids: string[] = [];
  for (let i = 0; i < LEVEL3_STARTING_HAND_TEMPLATE_ORDER.length; i++) {
    const templateId = LEVEL3_STARTING_HAND_TEMPLATE_ORDER[i]! as CardTemplateId;
    const instanceId = `ch3_hand_${i}_${templateId}`;
    cardsById[instanceId] = { instanceId, templateId };
    ch3Ids.push(instanceId);
  }

  const nantesIds = registerNantesStarterCardsForThirdMandate(cardsById, policy);
  const carryoverIds = keptCards.map((c) => c.instanceId);
  const fullPool = [...carryoverIds, ...ch3Ids];
  const [rng2, shuffledIds] = shuffle(rng, fullPool);
  rng = rng2;
  const handIds = shuffledIds.slice(0, 2);
  const deckFromShuffle = shuffledIds.slice(2);
  const inserted = insertCardsIntoDeckAtRandomPositions(rng, deckFromShuffle, nantesIds);
  rng = inserted.rng;
  const deckIds = inserted.deck;

  const cardInflationById: Record<string, number> = {};
  const cardUsesById: GameState["cardUsesById"] = {};
  for (const card of keptCards) {
    if (card.inflationDelta > 0) {
      cardInflationById[card.instanceId] = card.inflationDelta;
    }
    const usage = createInitialCardUseState(THIRD_MANDATE_LEVEL_ID, card.templateId, card.remainingUses ?? undefined);
    if (usage) {
      const total = card.totalUses ?? usage.total;
      const remaining = Math.max(0, Math.min(total, card.remainingUses ?? usage.remaining));
      cardUsesById[card.instanceId] = { total, remaining };
    }
  }
  for (const id of ch3Ids) {
    const inst = cardsById[id]!;
    const usage = createInitialCardUseState(THIRD_MANDATE_LEVEL_ID, inst.templateId);
    if (usage) {
      cardUsesById[id] = usage;
    }
  }

  if (draft.mode === "standalone") {
    for (const card of keptCards) {
      const id = card.instanceId;
      const tid = cardsById[id]?.templateId;
      if (!tid || !getCardTemplate(tid).tags.includes("inflation")) continue;
      const targetDelta = Math.max(0, STANDALONE_CH3_INFLATION_TARGET_COST - getCardTemplate(tid).cost);
      cardInflationById[id] = Math.max(cardInflationById[id] ?? 0, targetDelta);
    }
  }

  const base: GameState = {
    levelId: THIRD_MANDATE_LEVEL_ID,
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
    deck: deckIds,
    discard: [],
    hand: handIds,
    cardsById,
    cardUsesById,
    cardInflationById,
    slots: { ...EMPTY_EVENT_SLOTS },
    pendingMajorCrisis: { ...EMPTY_PENDING_MAJOR_CRISIS },
    nantesPolicyCarryover: policy,
    playerStatuses: [],
    antiFrenchLeague: null,
    warOfDevolutionAttacked: draft.warOfDevolutionAttacked,
    europeAlert: false,
    europeAlertPowerLoss: 0,
    europeAlertProgress: 0,
    nymwegenSettlementAchieved: false,
    huguenotResurgenceCounter: 0,
    proceduralEventSequence: [],
    actionLog: [],
    successionTrack: 0,
    opponentStrength: 2,
    opponentHabsburgUnlocked: false,
    warEnded: false,
    utrechtTreatyCountdown: null,
    opponentDeck: [],
    opponentHand: [],
    opponentDiscard: [],
    opponentCostDiscountThisTurn: 0,
    opponentNextTurnDrawModifier: 0,
    opponentLastPlayedTemplateIds: [],
    successionOutcomeTier: null,
  };

  if (draft.mode === "continuity") {
    return beginYear(appendActionLog(base, { kind: "info", infoKey: "chapter3ContinuityIntro" }));
  }
  return beginYear(base);
}

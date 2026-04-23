import { getCardTemplate } from "../../data/cards";
import { getLevelContent, getLevelDef } from "../../data/levelRegistry";
import { appendActionLog } from "./logic/actionLog";
import { insertCardsIntoDeckAtRandomPositions } from "../../logic/cardRuntime";
import { createInitialCardUseState } from "../../logic/cardUsage";
import { THIRD_MANDATE_LEVEL_ID } from "../../logic/thirdMandateConstants";
import { registerNantesStarterCardsForThirdMandate, resolveThirdMandateNantesPolicy } from "../../logic/thirdMandateStart";
import { createRngFromSeed, shuffle } from "../../logic/rng";
import { calendarYearForTurn } from "../../logic/scriptedCalendar";
import { unlockHabsburgOpponentForContinuityChapterStart } from "../../logic/opponentHabsburg";
import { beginYear } from "../../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../types/card";
import type { LevelRefitConfig, StandaloneCarryoverTemplateOverride } from "../types/refit";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../types/event";
import type { GameState, Resources } from "../../types/game";
import {
  CONTINUITY_REFIT_MAX_CARD_REMOVALS,
  type Level3CarryoverCard,
  type Level3ContinuityDraft,
  type Level3StandaloneDraft,
  type Level3StartDraft,
} from "../../types/continuity";
import {
  createDeckRefitCarryoverSnapshot,
  SUNKING_CH2_ID,
  type Level2Validation,
} from "./chapter2Transition";

/** Sun King chapter 3 level id (same as `THIRD_MANDATE_LEVEL_ID`). */
export const SUNKING_CH3_ID = THIRD_MANDATE_LEVEL_ID;

export const LEVEL3_CONTINUITY_MAX_REMOVALS = CONTINUITY_REFIT_MAX_CARD_REMOVALS;

function level3RefitConfig(): LevelRefitConfig {
  const cfg = getLevelContent(THIRD_MANDATE_LEVEL_ID).refit;
  if (!cfg) throw new Error("levelRegistry: thirdMandate.refit is required");
  return cfg;
}

export function getLevel3RefitNewCardsTemplateOrder(): readonly CardTemplateId[] {
  return level3RefitConfig().newCardsTemplateOrder;
}

export function getLevel3RefitNewCardsLabelKey(): string {
  return level3RefitConfig().newCardsLabelKey ?? "menu.refit.newCardsChapter3";
}

function standaloneInflationDeltaFromConfig(templateId: CardTemplateId): number {
  const source = level3RefitConfig().standaloneCarryoverSource;
  const targetInflationCost = source?.inflationTargetCostByTag?.inflation;
  if (targetInflationCost == null) return 0;
  const tmpl = getCardTemplate(templateId);
  if (!tmpl.tags.includes("inflation")) return 0;
  return Math.max(0, targetInflationCost - tmpl.cost);
}

function applyStandaloneCarryoverOverride(
  override: StandaloneCarryoverTemplateOverride | undefined,
  fallbackInflationDelta: number,
  fallbackUsage: { remaining: number; total: number } | null,
): { inflationDelta: number; remainingUses: number | null; totalUses: number | null } {
  const inflationDelta = Math.max(0, override?.inflationDelta ?? fallbackInflationDelta);
  const remainingUses = override?.remainingUses ?? fallbackUsage?.remaining ?? null;
  const totalUses = override?.totalUses ?? fallbackUsage?.total ?? null;
  return { inflationDelta, remainingUses, totalUses };
}

export type {
  Level3CarryoverCard,
  Level3ContinuityDraft,
  Level3StandaloneDraft,
  Level3StartDraft,
};

/** Synthetic chapter-2-equivalent library for main-menu chapter 3 (same removal rules as continuity). */
export function createStandaloneLevel3Draft(seed?: number): Level3StandaloneDraft {
  const level = getLevelDef(THIRD_MANDATE_LEVEL_ID);
  const refit = level3RefitConfig();
  const source = refit.standaloneCarryoverSource;
  if (!source) throw new Error("levelRegistry: thirdMandate.refit.standaloneCarryoverSource is required");
  const excludes = new Set(source.excludeTemplateIds ?? []);
  const sourceTemplates = getLevelContent(source.levelId).starterDeckTemplateOrder;
  const carryoverCards: Level3CarryoverCard[] = sourceTemplates
    .filter((templateId) => !excludes.has(templateId))
    .map((templateId, i) => {
      const targetInflationDelta = standaloneInflationDeltaFromConfig(templateId);
      const usage = createInitialCardUseState(THIRD_MANDATE_LEVEL_ID, templateId);
      const override = source.templateOverrides?.[templateId];
      const next = applyStandaloneCarryoverOverride(
        override,
        targetInflationDelta,
        usage ? { remaining: usage.remaining, total: usage.total } : null,
      );
      return {
        instanceId: `${source.instanceIdPrefix}${i}_${templateId}`,
        templateId,
        inflationDelta: next.inflationDelta,
        remainingUses: next.remainingUses,
        totalUses: next.totalUses,
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
  const inheritedResources: Resources = { ...from.resources };
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
  const newCards = getLevel3RefitNewCardsTemplateOrder();
  const uniqueRemoved = new Set(draft.removedCarryoverIds);
  const removedCards = uniqueRemoved.size;
  const keptCarryover = draft.carryoverCards.length - removedCards;
  const totalCards = keptCarryover + newCards.length;
  return {
    totalCards,
    totalNewCards: newCards.length,
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
  const refitOrder = getLevel3RefitNewCardsTemplateOrder();
  for (let i = 0; i < refitOrder.length; i++) {
    const templateId = refitOrder[i]!;
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
    if (card.totalUses != null && card.remainingUses != null) {
      const total = Math.max(0, card.totalUses);
      const remaining = Math.max(0, Math.min(total, card.remainingUses));
      cardUsesById[card.instanceId] = { total, remaining };
      continue;
    }
    const usage = createInitialCardUseState(THIRD_MANDATE_LEVEL_ID, card.templateId);
    if (usage) cardUsesById[card.instanceId] = usage;
  }
  for (const id of ch3Ids) {
    const inst = cardsById[id]!;
    const usage = createInitialCardUseState(THIRD_MANDATE_LEVEL_ID, inst.templateId);
    if (usage) {
      cardUsesById[id] = usage;
    }
  }

  const opponentStrengthPreUnlock = draft.mode === "continuity" ? 2 : 3;

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
    nextTurnFundingIncomeModifier: 0,
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
    proceduralEventPoolOrder: [],
    actionLog: [],
    successionTrack: 0,
    opponentStrength: opponentStrengthPreUnlock,
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
    utrechtSettlementTier: null,
  };

  if (draft.mode === "continuity") {
    const withOpponent = unlockHabsburgOpponentForContinuityChapterStart(base);
    return beginYear(appendActionLog(withOpponent, { kind: "info", infoKey: "chapter3ContinuityIntro" }));
  }
  return beginYear(base);
}

import { getCardTemplate } from "../../data/cards";
import { getLevelContent, getLevelDef } from "../../data/levelRegistry";
import { appendActionLog } from "./logic/actionLog";
import { createInitialCardUseState } from "../../logic/cardUsage";
import { computeEuropeAlertPowerLoss } from "../../logic/europeAlert";
import { calendarYearForTurn } from "../../logic/scriptedCalendar";
import { createRngFromSeed, shuffle } from "../../logic/rng";
import { beginYear } from "../../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../types/card";
import type { LevelRefitConfig, StandaloneCarryoverTemplateOverride } from "../types/refit";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../types/event";
import type { GameState, Resources } from "../../types/game";
import {
  CONTINUITY_REFIT_MAX_CARD_REMOVALS,
  type Level2CarryoverCard,
  type Level2ContinuityDraft,
  type Level2StandaloneDraft,
  type Level2StartDraft,
  type Level2StartMode,
  type Level2Validation,
} from "../../types/continuity";

export const SUNKING_CH1_ID = "firstMandate";
export const SUNKING_CH2_ID = "secondMandate";

export type {
  Level2CarryoverCard,
  Level2ContinuityDraft,
  Level2StandaloneDraft,
  Level2StartDraft,
  Level2StartMode,
  Level2Validation,
};

export const LEVEL2_CONTINUITY_MAX_REMOVALS = CONTINUITY_REFIT_MAX_CARD_REMOVALS;

function level2RefitConfig(): LevelRefitConfig {
  const cfg = getLevelContent(SUNKING_CH2_ID).refit;
  if (!cfg) throw new Error("levelRegistry: secondMandate.refit is required");
  return cfg;
}

export function getLevel2RefitNewCardsTemplateOrder(): readonly CardTemplateId[] {
  return level2RefitConfig().newCardsTemplateOrder;
}

export function getLevel2RefitNewCardsLabelKey(): string {
  return level2RefitConfig().newCardsLabelKey ?? "menu.refit.newCards";
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

export function createStandaloneLevel2Draft(seed?: number): Level2StandaloneDraft {
  const level = getLevelDef(SUNKING_CH2_ID);
  const refit = level2RefitConfig();
  const source = refit.standaloneCarryoverSource;
  if (!source) throw new Error("levelRegistry: secondMandate.refit.standaloneCarryoverSource is required");
  const excludes = new Set(source.excludeTemplateIds ?? []);
  const carryoverCards = getLevelContent(source.levelId).starterDeckTemplateOrder
    .filter((templateId) => !excludes.has(templateId))
    .map((templateId, i) => {
      const usage = createInitialCardUseState(SUNKING_CH2_ID, templateId);
      const override = source.templateOverrides?.[templateId];
      const next = applyStandaloneCarryoverOverride(
        override,
        0,
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
    resources: { ...(level.standaloneStartingResources ?? level.startingResources) },
    warOfDevolutionAttacked: true,
    europeAlert: true,
    carryoverCards,
    removedCarryoverIds: [],
  };
}

export function createDeckRefitCarryoverSnapshot(from: GameState): Level2CarryoverCard[] {
  const orderedPoolIds = [...from.deck, ...from.discard, ...from.hand];
  const seen = new Set<string>();
  const out: Level2CarryoverCard[] = [];
  const appendIfEligible = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const inst = from.cardsById[id];
    if (!inst) return;
    const tags = getCardTemplate(inst.templateId).tags;
    if (tags.includes("temp") || tags.includes("extra")) return;
    out.push({
      instanceId: id,
      templateId: inst.templateId,
      inflationDelta: Math.max(0, from.cardInflationById[id] ?? 0),
      remainingUses: from.cardUsesById[id]?.remaining ?? createInitialCardUseState(from.levelId, inst.templateId)?.remaining ?? null,
      totalUses: from.cardUsesById[id]?.total ?? createInitialCardUseState(from.levelId, inst.templateId)?.total ?? null,
    });
  };
  for (const id of orderedPoolIds) {
    appendIfEligible(id);
  }
  return out;
}

export function createContinuityLevel2Draft(from: GameState, seed?: number): Level2ContinuityDraft {
  const carryoverCalendarStartYear = calendarYearForTurn(from.levelId, from.calendarStartYear, from.turn);
  const inheritedResources: Resources = {
    treasuryStat: from.resources.treasuryStat,
    power: from.resources.power,
    legitimacy: from.resources.legitimacy,
    funding: from.resources.funding,
  };
  const carryoverCards = createDeckRefitCarryoverSnapshot(from);
  return {
    mode: "continuity",
    seed,
    calendarStartYear: carryoverCalendarStartYear,
    resources: inheritedResources,
    warOfDevolutionAttacked: from.warOfDevolutionAttacked,
    europeAlert: true,
    carryoverCards,
    removedCarryoverIds: [],
  };
}

/** Shared shape for chapter 2 / 3 deck-refit toggles (remove up to 3 carryover cards). */
export type DeckRefitDraft = {
  carryoverCards: readonly { instanceId: string }[];
  removedCarryoverIds: readonly string[];
};

export function toggleContinuityCardRemoval<T extends DeckRefitDraft>(draft: T, instanceId: string): T {
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
  const newCards = getLevel2RefitNewCardsTemplateOrder();
  const uniqueRemoved = new Set(draft.removedCarryoverIds);
  const removedCards = uniqueRemoved.size;
  const keptCarryover = draft.carryoverCards.length - removedCards;
  const totalCards = keptCarryover + newCards.length;
  return {
    totalCards,
    totalNewCards: newCards.length,
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
  const newCards = getLevel2RefitNewCardsTemplateOrder();
  const deckOrder: Array<{ instanceId: string; templateId: CardTemplateId }> = keptCards.map((card) => ({
    instanceId: card.instanceId,
    templateId: card.templateId,
  }));
  const occupied = new Set(deckOrder.map((card) => card.instanceId));
  for (const id of newCards) {
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
    const usage = createInitialCardUseState(SUNKING_CH2_ID, card.templateId);
    if (usage) cardUsesById[card.instanceId] = usage;
  }
  const europeAlertPowerLoss = computeEuropeAlertPowerLoss(draft.resources.power);
  const europeAlertProgress =
    draft.mode === "continuity" && !draft.warOfDevolutionAttacked ? 1 : 3;
  const resources = draft.resources;

  const base: GameState = {
    levelId: SUNKING_CH2_ID,
    calendarStartYear: draft.calendarStartYear,
    runSeed,
    rng,
    turn: 1,
    phase: "action",
    outcome: "playing",
    pendingInteraction: null,
    nextIds: { event: 0, status: 0, log: 0 },
    resources,
    nextTurnDrawModifier: 0,
    nextTurnFundingIncomeModifier: 0,
    scheduledDrawModifiers: [],
    deck: shuffled.map((c) => c.instanceId),
    discard: [],
    hand: [],
    cardsById,
    cardUsesById,
    cardInflationById,
    slots: { ...EMPTY_EVENT_SLOTS },
    pendingMajorCrisis: { ...EMPTY_PENDING_MAJOR_CRISIS },
    nantesPolicyCarryover: null,
    playerStatuses: [],
    antiFrenchLeague: null,
    warOfDevolutionAttacked: draft.warOfDevolutionAttacked,
    europeAlert: true,
    europeAlertPowerLoss,
    europeAlertProgress,
    nymwegenSettlementAchieved: false,
    huguenotResurgenceCounter: 0,
    proceduralEventSequence: [],
    proceduralEventPoolOrder: [],
    actionLog: [],
    successionTrack: 0,
    opponentStrength: 3,
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
  const europeAlertIntroKey =
    draft.mode === "continuity" && !draft.warOfDevolutionAttacked
      ? "chapter2EuropeAlertContinuityLow"
      : "chapter2EuropeAlertOn";
  const withEuropeAlertIntro = appendActionLog(base, {
    kind: "info",
    infoKey: europeAlertIntroKey,
  });
  return beginYear(withEuropeAlertIntro);
}

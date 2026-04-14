import { getCardTemplate } from "../data/cards";
import { getLevelContent } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
import { computeEuropeAlertDrawPenalty } from "../logic/europeAlert";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../types/card";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../types/event";
import type { GameState, Resources } from "../types/game";
import { createInitialState } from "./initialState";

export const LEVEL2_ADJUSTABLE_IDS = ["funding", "crackdown", "reform", "ceremony"] as const;
export const LEVEL2_NEW_IDS = [
  "grainRelief",
  "taxRebalance",
  "diplomaticCongress",
  "patronageOffice",
] as const;
const LEVEL2_REFIT_ORDER = [...LEVEL2_ADJUSTABLE_IDS, ...LEVEL2_NEW_IDS] as const;

export type Level2RefitCardId = (typeof LEVEL2_REFIT_ORDER)[number];
export type Level2StartMode = "standalone" | "continuity";

export type Level2RefitCounts = Record<Level2RefitCardId, number>;

export type Level2CarryoverCard = {
  instanceId: string;
  templateId: CardTemplateId;
  inflationDelta: number;
};

export type Level2RefitRules = {
  minDeckSize: number;
  maxDeckSize: number;
  maxAddedPerBaseCard: number;
  maxTotalAdjustableChanges: number;
  maxPerNewCard: number;
  maxTotalNewCards: number;
};

export type Level2StandaloneDraft = {
  mode: "standalone";
  seed?: number;
  calendarStartYear: number;
  resources: Resources;
  warOfDevolutionAttacked: boolean;
  europeAlert: boolean;
  baseCounts: Level2RefitCounts;
  counts: Level2RefitCounts;
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

export const LEVEL2_REFIT_RULES: Level2RefitRules = {
  minDeckSize: 12,
  maxDeckSize: 18,
  maxAddedPerBaseCard: 2,
  maxTotalAdjustableChanges: 3,
  maxPerNewCard: 2,
  maxTotalNewCards: 4,
};

export const LEVEL2_CONTINUITY_MAX_REMOVALS = 3;

function zeroCounts(): Level2RefitCounts {
  return {
    funding: 0,
    crackdown: 0,
    reform: 0,
    ceremony: 0,
    grainRelief: 0,
    taxRebalance: 0,
    diplomaticCongress: 0,
    patronageOffice: 0,
  };
}

function countTemplates(templates: readonly CardTemplateId[]): Level2RefitCounts {
  const next = zeroCounts();
  for (const id of templates) {
    if (id === "development") continue;
    if (id in next) {
      next[id as Level2RefitCardId] += 1;
    }
  }
  return next;
}

function baselineFromFirstChapterDeck(): Level2RefitCounts {
  const templates = getLevelContent("firstMandate").starterDeckTemplateOrder;
  return countTemplates(templates);
}

function withDefaultRecommendedAdds(base: Level2RefitCounts): Level2RefitCounts {
  return {
    ...base,
    grainRelief: 1,
    taxRebalance: 1,
    diplomaticCongress: 1,
  };
}

function ensureAdjustableMinimum(base: Level2RefitCounts): Level2RefitCounts {
  const next = { ...base };
  for (const id of LEVEL2_ADJUSTABLE_IDS) {
    if (next[id] < 1) next[id] = 1;
  }
  return next;
}

export function createStandaloneLevel2Draft(seed?: number): Level2StandaloneDraft {
  const level = getLevelDef("secondMandate");
  const baseCounts = ensureAdjustableMinimum(baselineFromFirstChapterDeck());
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
    baseCounts,
    counts: withDefaultRecommendedAdds(baseCounts),
  };
}

function buildContinuityCarryoverCards(from: GameState): Level2CarryoverCard[] {
  const orderedPoolIds = [...from.deck, ...from.discard, ...from.hand];
  const seen = new Set<string>();
  const out: Level2CarryoverCard[] = [];
  for (const id of orderedPoolIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const inst = from.cardsById[id];
    if (!inst) continue;
    if (getCardTemplate(inst.templateId).tags.includes("temp")) continue;
    out.push({
      instanceId: id,
      templateId: inst.templateId,
      inflationDelta: Math.max(0, from.cardInflationById[id] ?? 0),
    });
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

export function buildHistoricalPreset(baseCounts: Level2RefitCounts): Level2RefitCounts {
  return withDefaultRecommendedAdds(baseCounts);
}

export function buildWarPreset(baseCounts: Level2RefitCounts): Level2RefitCounts {
  return {
    ...baseCounts,
    diplomaticCongress: 1,
    patronageOffice: 1,
    taxRebalance: 1,
  };
}

export function toggleContinuityCardRemoval(
  draft: Level2ContinuityDraft,
  instanceId: string,
): Level2ContinuityDraft {
  if (!draft.carryoverCards.some((card) => card.instanceId === instanceId)) return draft;
  const removed = new Set(draft.removedCarryoverIds);
  if (removed.has(instanceId)) {
    removed.delete(instanceId);
    return { ...draft, removedCarryoverIds: [...removed] };
  }
  if (removed.size >= LEVEL2_CONTINUITY_MAX_REMOVALS) return draft;
  removed.add(instanceId);
  return { ...draft, removedCarryoverIds: [...removed] };
}

export function updateRefitCount(
  counts: Level2RefitCounts,
  baseCounts: Level2RefitCounts,
  id: Level2RefitCardId,
  delta: number,
): Level2RefitCounts {
  const next = { ...counts };
  const raw = counts[id] + delta;
  if ((LEVEL2_ADJUSTABLE_IDS as readonly string[]).includes(id)) {
    const min = 1;
    const max = baseCounts[id] + LEVEL2_REFIT_RULES.maxAddedPerBaseCard;
    const clamped = Math.max(min, Math.min(max, raw));
    next[id] = clamped;
    if (
      computeAdjustableChanges(next, baseCounts) > LEVEL2_REFIT_RULES.maxTotalAdjustableChanges
    ) {
      return counts;
    }
    return next;
  }
  const min = 0;
  const max = LEVEL2_REFIT_RULES.maxPerNewCard;
  next[id] = Math.max(min, Math.min(max, raw));
  return next;
}

function computeAdjustableChanges(
  counts: Level2RefitCounts,
  baseCounts: Level2RefitCounts,
): number {
  let changed = 0;
  for (const id of LEVEL2_ADJUSTABLE_IDS) {
    changed += Math.abs(counts[id] - baseCounts[id]);
  }
  return changed;
}

export function validateLevel2Refit(
  counts: Level2RefitCounts,
  baseCountsInput?: Level2RefitCounts,
): Level2Validation {
  const baseCounts = baseCountsInput ?? ensureAdjustableMinimum(baselineFromFirstChapterDeck());
  let totalCards = 0;
  let totalNewCards = 0;
  for (const id of LEVEL2_REFIT_ORDER) {
    totalCards += counts[id];
  }
  for (const id of LEVEL2_NEW_IDS) {
    totalNewCards += counts[id];
  }
  const totalValid =
    totalCards >= LEVEL2_REFIT_RULES.minDeckSize && totalCards <= LEVEL2_REFIT_RULES.maxDeckSize;
  const newValid = totalNewCards <= LEVEL2_REFIT_RULES.maxTotalNewCards;
  const adjustableChanges = computeAdjustableChanges(counts, baseCounts);
  const adjustableValid = adjustableChanges <= LEVEL2_REFIT_RULES.maxTotalAdjustableChanges;
  return {
    totalCards,
    totalNewCards,
    adjustableChanges,
    maxAdjustableChanges: LEVEL2_REFIT_RULES.maxTotalAdjustableChanges,
    isValid: totalValid && newValid && adjustableValid,
  };
}

export function validateLevel2ContinuityRefit(draft: Level2ContinuityDraft): Level2Validation {
  const uniqueRemoved = new Set(draft.removedCarryoverIds);
  const removedCards = uniqueRemoved.size;
  const totalCards = draft.carryoverCards.length - removedCards;
  return {
    totalCards,
    totalNewCards: 0,
    adjustableChanges: removedCards,
    maxAdjustableChanges: LEVEL2_CONTINUITY_MAX_REMOVALS,
    isValid: removedCards <= LEVEL2_CONTINUITY_MAX_REMOVALS && totalCards > 0,
  };
}

export function validateLevel2Draft(draft: Level2StartDraft): Level2Validation {
  if (draft.mode === "continuity") return validateLevel2ContinuityRefit(draft);
  return validateLevel2Refit(draft.counts, draft.baseCounts);
}

export function buildDeckOrderFromRefit(counts: Level2RefitCounts): CardTemplateId[] {
  const out: CardTemplateId[] = [];
  for (const id of LEVEL2_REFIT_ORDER) {
    for (let i = 0; i < counts[id]; i++) out.push(id);
  }
  return out;
}

export function buildLevel2StateFromDraft(draft: Level2StartDraft): GameState {
  if (draft.mode === "standalone") {
    return createInitialState(draft.seed, "secondMandate", {
      calendarStartYearOverride: draft.calendarStartYear,
      starterDeckTemplateOrder: buildDeckOrderFromRefit(draft.counts),
      startingResourcesOverride: draft.resources,
      warOfDevolutionAttacked: draft.warOfDevolutionAttacked,
      europeAlert: draft.europeAlert,
    });
  }
  return buildContinuityLevel2State(draft);
}

function buildContinuityLevel2State(draft: Level2ContinuityDraft): GameState {
  const runSeed = ((draft.seed ?? Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 0x9e3779b9;
  let rng = createRngFromSeed(runSeed);
  const removed = new Set(draft.removedCarryoverIds);
  const keptCards = draft.carryoverCards.filter((card) => !removed.has(card.instanceId));
  const deckOrder = keptCards.map((card) => ({
    instanceId: card.instanceId,
    templateId: card.templateId,
  }));
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

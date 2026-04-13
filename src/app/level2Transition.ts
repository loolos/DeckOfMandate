import { createInitialState } from "./initialState";
import { getLevelContent } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
import type { CardTemplateId } from "../types/card";
import type { GameState, Resources } from "../types/game";

export const LEVEL2_ADJUSTABLE_IDS = ["funding", "crackdown", "reform", "ceremony"] as const;
export const LEVEL2_NEW_IDS = [
  "grainRelief",
  "taxRebalance",
  "diplomaticCongress",
  "patronageOffice",
  "warBond",
] as const;
const LEVEL2_REFIT_ORDER = [...LEVEL2_ADJUSTABLE_IDS, ...LEVEL2_NEW_IDS] as const;

export type Level2RefitCardId = (typeof LEVEL2_REFIT_ORDER)[number];
export type Level2StartMode = "standalone" | "continuity";

export type Level2RefitCounts = Record<Level2RefitCardId, number>;

export type Level2RefitRules = {
  minDeckSize: number;
  maxDeckSize: number;
  maxAddedPerBaseCard: number;
  maxTotalAdjustableChanges: number;
  maxPerNewCard: number;
  maxTotalNewCards: number;
};

export type Level2StartDraft = {
  mode: Level2StartMode;
  seed?: number;
  calendarStartYear: number;
  resources: Resources;
  warOfDevolutionAttacked: boolean;
  europeAlert: boolean;
  baseCounts: Level2RefitCounts;
  counts: Level2RefitCounts;
};

export type Level2Validation = {
  totalCards: number;
  totalNewCards: number;
  adjustableChanges: number;
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
    warBond: 0,
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

export function createStandaloneLevel2Draft(seed?: number): Level2StartDraft {
  const level = getLevelDef("secondMandate");
  const baseCounts = ensureAdjustableMinimum(baselineFromFirstChapterDeck());
  return {
    mode: "standalone",
    seed,
    calendarStartYear: level.calendarStartYear,
    resources: { ...level.startingResources },
    warOfDevolutionAttacked: false,
    europeAlert: false,
    baseCounts,
    counts: withDefaultRecommendedAdds(baseCounts),
  };
}

export function createContinuityLevel2Draft(from: GameState, seed?: number): Level2StartDraft {
  const carryoverCalendarStartYear = from.calendarStartYear + from.turn - 1;
  const inheritedResources: Resources = {
    treasuryStat: from.resources.treasuryStat,
    power: from.resources.power,
    legitimacy: from.resources.legitimacy + (from.warOfDevolutionAttacked ? 1 : 0),
    funding: 0,
  };
  const baseCounts = ensureAdjustableMinimum(
    countTemplates(Object.values(from.cardsById).map((x) => x.templateId)),
  );
  return {
    mode: "continuity",
    seed,
    calendarStartYear: carryoverCalendarStartYear,
    resources: inheritedResources,
    warOfDevolutionAttacked: from.warOfDevolutionAttacked,
    europeAlert: from.warOfDevolutionAttacked,
    baseCounts,
    counts: withDefaultRecommendedAdds(baseCounts),
  };
}

export function buildHistoricalPreset(baseCounts: Level2RefitCounts): Level2RefitCounts {
  return withDefaultRecommendedAdds(baseCounts);
}

export function buildWarPreset(baseCounts: Level2RefitCounts): Level2RefitCounts {
  return {
    ...baseCounts,
    diplomaticCongress: 2,
    warBond: 2,
  };
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
    isValid: totalValid && newValid && adjustableValid,
  };
}

export function buildDeckOrderFromRefit(counts: Level2RefitCounts): CardTemplateId[] {
  const out: CardTemplateId[] = [];
  for (const id of LEVEL2_REFIT_ORDER) {
    for (let i = 0; i < counts[id]; i++) out.push(id);
  }
  return out;
}

export function buildLevel2StateFromDraft(draft: Level2StartDraft): GameState {
  return createInitialState(draft.seed, "secondMandate", {
    calendarStartYearOverride: draft.calendarStartYear,
    starterDeckTemplateOrder: buildDeckOrderFromRefit(draft.counts),
    startingResourcesOverride: draft.resources,
    warOfDevolutionAttacked: draft.warOfDevolutionAttacked,
    europeAlert: draft.europeAlert,
  });
}

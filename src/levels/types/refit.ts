import type { CardTag } from "./tags";
import type { CardTemplateId } from "./card";

/**
 * Standalone refit: where to synthesize adjustable carryover cards from.
 * Continuity refit still snapshots from the previous run state.
 */
export type StandaloneCarryoverSource = {
  /** Source level whose starter deck templates are used as synthetic carryover. */
  levelId: string;
  /** Instance id prefix used when creating synthetic carryover cards. */
  instanceIdPrefix: string;
  /** Optional templates excluded from standalone carryover synthesis. */
  excludeTemplateIds?: readonly CardTemplateId[];
  /** Optional target effective cost by tag, e.g. `{ inflation: 4 }`. */
  inflationTargetCostByTag?: Partial<Record<CardTag, number>>;
  /** Optional per-template overrides on synthesized carryover cards. */
  templateOverrides?: Partial<Record<CardTemplateId, StandaloneCarryoverTemplateOverride>>;
};

export type StandaloneCarryoverTemplateOverride = {
  inflationDelta?: number;
  remainingUses?: number | null;
  totalUses?: number | null;
};

/** Unified chapter refit configuration for both standalone and continuity entries. */
export type LevelRefitConfig = {
  /** New cards always added by this chapter's refit flow (standalone and continuity). */
  newCardsTemplateOrder: readonly CardTemplateId[];
  /** Optional i18n key for the "new cards" section label in refit UI. */
  newCardsLabelKey?: string;
  /** Optional max removable carryover cards in refit UI/validation. */
  maxAdjustableRemovals?: number;
  /** Standalone-only synthetic carryover configuration. */
  standaloneCarryoverSource?: StandaloneCarryoverSource;
};

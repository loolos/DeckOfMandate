import type { CardTemplateId } from "../levels/types/card";
import type { NantesPolicyCarryover, Resources } from "./game";

/** Max carryover cards the player may remove when refitting between chapters (neutral UI constant). */
export const CONTINUITY_REFIT_MAX_CARD_REMOVALS = 3;

export type Level2StartMode = "standalone" | "continuity";

export type Level2CarryoverCard = {
  instanceId: string;
  templateId: CardTemplateId;
  inflationDelta: number;
  remainingUses: number | null;
  totalUses: number | null;
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

export type Level3CarryoverCard = Level2CarryoverCard;

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

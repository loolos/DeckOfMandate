/**
 * Sun King level-configuration types. These used to live in `src/data/levelTypes.ts`;
 * they describe rules only this campaign has (Europe Alert, inflation, succession war,
 * scripted historical rows, chapter refit) and are attached to `LevelDef` / `LevelContent`
 * through `./levelDefAugmentation.ts`.
 */
import type { CardTemplateId } from "../../types/card";
import type { EventTemplateId, SlotId } from "../../types/event";
import type { LevelRefitConfig } from "../../types/refit";
import type { LogInfoKey, Resources } from "../../../types/game";
import type { NantesPolicyCarryover, SuccessionIntervalTier } from "./campaignState";

/** Locale keys for the end-of-run narrative (shown in the game-over modal). */
export type LevelEndingCopyKeys = {
  victoryBodyKey: string;
  /** Chapter 3: victory body copy by Utrecht settlement tier (`bourbon` | `compromise` | `habsburg`). */
  victoryBodyByTierKeys?: Partial<Record<SuccessionIntervalTier, string>>;
  victoryWarDevolutionExtraKey: string;
  /** Chapter 3 continuity: first-mandate War of Devolution branch epilogue copy. */
  continuityWarOfDevolutionBodyKeys?: {
    attacked: string;
    restrained: string;
  };
  /** Chapter 3 continuity: second-mandate Edict of Nantes branch epilogue copy. */
  continuityNantesPolicyBodyKeys?: Partial<Record<NantesPolicyCarryover, string>>;
  /** Chapter 3: Louis XIV legacy branch epilogue copy from the 1715 event choice. */
  chapter3LouisXivLegacyBodyKeys?: {
    regencyCustody: string;
    youngKingDirectRule: string;
  };
  defeatBodyKey: string;
  /** Chapter 2: defeat-at-time-limit copy when huguenot containment still remains. */
  defeatTimeWithHuguenotContainmentBodyKey?: string;
  /** Chapter 3: shown on victory when the succession track reached +10 (instant win). */
  victorySuccessionTrackCapBodyKey?: string;
  /** Chapter 3: shown on `defeatSuccession` when the track reached −10 (not used for legitimacy defeat). */
  defeatSuccessionTrackFloorBodyKey?: string;
};

export type VictoryRule =
  | { kind: "resourceTargets" }
  | {
      kind: "gated";
      earliestCalendarYear: number;
      minLegitimacy: number;
    }
  /** Chapter 3: succession track ±10 instant outcomes; last playable calendar year = calendarEndExclusiveYear - 1. */
  | {
      kind: "successionWar";
      calendarEndExclusiveYear: number;
    };

/** How inflation applies to card costs for this level. */
export type InflationRule =
  | { kind: "always" }
  | { kind: "pressureThreshold"; threshold: number }
  | { kind: "off" };

export type LevelFeatures = {
  europeAlertMechanics: boolean;
  inflation: InflationRule;
  /** Logged once when inflation first becomes enabled (pressure-threshold chapters). */
  inflationActivationLogKey?: LogInfoKey;
};

export type SlotEscalation = {
  from: EventTemplateId;
  to: EventTemplateId;
};

export type ScriptedCalendarAttackConfig = {
  fundingCost: number;
  powerDelta: number;
  extraTreasuryProbability: number;
  extraTreasuryDelta: number;
};

export type ScriptedCalendarAntiCoalitionConfig = {
  drawPenaltyProbability: number;
  drawPenaltyDelta: number;
  activeYearsAfterAttack: number | null;
};

export type ScriptedCalendarEventConfig = {
  templateId: EventTemplateId;
  presenceStartYear: number;
  presenceEndYear: number;
  overflowSlot?: SlotId;
  attack?: ScriptedCalendarAttackConfig;
  antiCoalition?: ScriptedCalendarAntiCoalitionConfig;
  requiresWarOfDevolutionAttacked?: boolean;
};

export type LevelOpeningConfig = {
  /** Injected at the start of the procedural sequence on turn 1 (non-standalone chapter 2). */
  turnOnePrefix: readonly EventTemplateId[];
  /** Injected when {@link LevelOpeningConfig.standaloneCarryoverIdPrefix} matches deck instance ids (standalone ch2). */
  standaloneTurnOnePrefix?: readonly EventTemplateId[];
  /** Detect standalone chapter-2 starts (e.g. `standalone_old_`). */
  standaloneCarryoverIdPrefix: string;
};

export type LevelProceduralConfig = {
  /** When all slots empty on turn 1, request this many procedural draws (first mandate: 2). */
  firstTurnEmptyBoardCount?: number;
  /** Standalone ch2 turn 1: at least this many when all empty (second mandate: 3). */
  firstTurnStandaloneEmptyBoardMin?: number;
  /** Optional cap for all-empty procedural refill during early turns. */
  earlyTurnAllEmptyBoardMax?: {
    untilTurnInclusive: number;
    maxCount: number;
  };
};

/** Post-victory CTA: open the campaign continuity refit draft from the shell. */
export type PostVictoryContinuity = {
  continueLabelKey: string;
  draftKind: "level2FromPrior" | "level3FromPrior";
};

export type SunkingWinTargets = {
  treasuryStat: number;
  power: number;
  legitimacy: number;
};

export type SunkingLevelContentFields = {
  slotEscalations: readonly SlotEscalation[];
  eoyEscalationSchedulers: readonly EventTemplateId[];
  scriptedCalendarEvents: readonly ScriptedCalendarEventConfig[];
  opening: LevelOpeningConfig;
  procedural: LevelProceduralConfig;
  /** Optional chapter refit config (new cards + standalone synthetic carryover source). */
  refit?: LevelRefitConfig;
  /**
   * Optional per-template limited-use defaults used by the "remaining uses (X/Y)" badge.
   * Keep campaign-specific balances in chapter files instead of hardcoding in shared logic.
   */
  limitedUseByTemplateId?: Partial<Record<CardTemplateId, { totalUses: number; defaultRemainingUses?: number }>>;
  /**
   * When an unresolved event with this template id is on the board, render it with the
   * opponent-hand UI (deck + last play). Omit for levels without that row.
   */
  opponentBoardEventTemplateId?: EventTemplateId;
};

export type SunkingLevelDefFields = {
  ending: LevelEndingCopyKeys;
  standaloneStartingResources?: Resources;
  winTargets: SunkingWinTargets;
  features: LevelFeatures;
  victoryRule: VictoryRule;
  /** Optional override for the in-run targets panel (otherwise `ui.targets`). */
  targetsUiKey?: string;
  /** If set, victory modal shows one button that opens the matching continuity refit flow. */
  postVictoryContinuity?: PostVictoryContinuity;
};

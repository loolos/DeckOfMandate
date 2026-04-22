import type { CardTemplateId } from "../levels/types/card";
import type { EventTemplateId, SlotId } from "../levels/types/event";
import type { Resources } from "../types/game";
import type { LogInfoKey } from "../types/game";

/** Must match {@link import("../locales").LocaleId}. */
export type LevelLocaleId = "en" | "zh" | "fr";

/** Locale keys for the end-of-run narrative (shown in the game-over modal). */
export type LevelEndingCopyKeys = {
  victoryBodyKey: string;
  /** Chapter 3: victory body copy by Utrecht settlement tier (`bourbon` | `compromise` | `habsburg`). */
  victoryBodyByTierKeys?: Partial<Record<import("../types/game").SuccessionIntervalTier, string>>;
  victoryWarDevolutionExtraKey: string;
  defeatBodyKey: string;
  /** Chapter 3: shown on victory when the succession track reached +10 (instant win). */
  victorySuccessionTrackCapBodyKey?: string;
  /** Chapter 3: shown on `defeatSuccession` when the track reached −10 (not used for legitimacy defeat). */
  defeatSuccessionTrackFloorBodyKey?: string;
};

export type TurnLimitRule =
  | { kind: "fixed"; turnLimit: number }
  | { kind: "calendarEnd"; endYear: number };

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

export type LevelBootstrapKind = "initial" | "chapter2Standalone" | "chapter3Standalone";

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
  /** Injected when {@link standaloneCarryoverIdPrefix} matches deck instance ids (standalone ch2). */
  standaloneTurnOnePrefix?: readonly EventTemplateId[];
  /** Detect standalone chapter-2 starts (e.g. `standalone_old_`). */
  standaloneCarryoverIdPrefix: string;
};

export type LevelProceduralConfig = {
  /** When all slots empty on turn 1, request this many procedural draws (first mandate: 2). */
  firstTurnEmptyBoardCount?: number;
  /** Standalone ch2 turn 1: at least this many when all empty (second mandate: 3). */
  firstTurnStandaloneEmptyBoardMin?: number;
};

/**
 * Per-level playable content: deck composition, event roll pool, and escalation rules.
 * Event/card *templates* stay in `events.ts` / `cards.ts`; levels only wire ids.
 */
export type LevelContent = {
  starterDeckTemplateOrder: readonly CardTemplateId[];
  rollableEventIds: readonly EventTemplateId[];
  slotEscalations: readonly SlotEscalation[];
  eoyEscalationSchedulers: readonly EventTemplateId[];
  scriptedCalendarEvents: readonly ScriptedCalendarEventConfig[];
  opening: LevelOpeningConfig;
  procedural: LevelProceduralConfig;
  /**
   * When set (e.g. chapter 3), templates for new cards in continuity/standalone refit UI and shuffle pool.
   */
  chapter3RefitStartingHandOrder?: readonly CardTemplateId[];
  /**
   * When an unresolved event with this template id is on the board, render it with the
   * opponent-hand UI (deck + last play). Campaign-specific; omit for levels without that row.
   */
  opponentBoardEventTemplateId?: EventTemplateId;
};

export type LevelFeatures = {
  europeAlertMechanics: boolean;
  inflation: InflationRule;
  /** Logged once when inflation first becomes enabled (pressure-threshold chapters). */
  inflationActivationLogKey?: LogInfoKey;
};

/** Post-victory CTA: open the campaign continuity refit draft from the shell. */
export type PostVictoryContinuity = {
  continueLabelKey: string;
  draftKind: "level2FromPrior" | "level3FromPrior";
};

export type LevelDef = {
  id: string;
  /** Locales for which this level provides translated strings; others fall back (see i18n). */
  supportedLocales: readonly LevelLocaleId[];
  nameKey: string;
  introTitleKey: string;
  introBodyKey: string;
  ending: LevelEndingCopyKeys;
  calendarStartYear: number;
  /**
   * Calendar years advanced per completed player turn (scenario timeline).
   * Drives displayed calendar year, gated victory years, calendar-end turn limits, and chapter carryover year.
   */
  yearsPerTurn: number;
  /**
   * i18n key for the turn counter next to the calendar (default `banner.turn`).
   * Set per campaign when turns map to years/months/etc.
   */
  turnBannerKey?: string;
  /** Optional one-line hint under goals, e.g. that one turn equals one calendar year. */
  timeStepHintKey?: string;
  startingResources: Resources;
  standaloneStartingResources?: Resources;
  winTargets: {
    treasuryStat: number;
    power: number;
    legitimacy: number;
  };
  turnLimitRule: TurnLimitRule;
  features: LevelFeatures;
  victoryRule: VictoryRule;
  bootstrap: LevelBootstrapKind;
  /** Core UI key for the level brief on the start menu. */
  menuBriefKey: string;
  /** Optional override for the in-run targets panel (otherwise `ui.targets`). */
  targetsUiKey?: string;
  /** If set, victory modal shows one button that opens the matching continuity refit flow. */
  postVictoryContinuity?: PostVictoryContinuity;
};

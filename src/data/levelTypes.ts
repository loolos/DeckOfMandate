import type { CardTemplateId } from "../levels/types/card";
import type { EventTemplateId } from "../levels/types/event";
import type { Resources } from "../types/game";

/** Must match {@link import("../locales").LocaleId}. */
export type LevelLocaleId = "en" | "zh" | "fr";

export type TurnLimitRule =
  | { kind: "fixed"; turnLimit: number }
  | { kind: "calendarEnd"; endYear: number };

/**
 * How a new run for this level is created. The framework knows only `initial`
 * (fresh run from the level's own starting layout); campaign packs merge their own
 * bootstrap kinds — chapter continuations, prologues, … — into this registry.
 */
export interface CampaignLevelBootstrapRegistry {}
export type LevelBootstrapKind = "initial" | (keyof CampaignLevelBootstrapRegistry & string);

/**
 * Per-level rule fields owned by the campaign: victory conditions, feature flags,
 * ending copy, and any other pack-specific level metadata. Merged via `declare module`.
 */
export interface CampaignLevelDefFields {}

/**
 * Per-level content wiring owned by the campaign: scripted rows, escalation tables,
 * refit configs, and similar. Merged via `declare module`.
 */
export interface CampaignLevelContentFields {}

/**
 * Per-level playable content: deck composition and event roll pool are framework-level
 * concepts; everything else a campaign needs comes from {@link CampaignLevelContentFields}.
 * Event/card *templates* ship with the campaign; levels only wire ids.
 */
export type LevelContent = {
  starterDeckTemplateOrder: readonly CardTemplateId[];
  rollableEventIds: readonly EventTemplateId[];
} & CampaignLevelContentFields;

export type LevelDef = {
  id: string;
  /** Locales for which this level provides translated strings; others fall back (see i18n). */
  supportedLocales: readonly LevelLocaleId[];
  nameKey: string;
  introTitleKey: string;
  introBodyKey: string;
  calendarStartYear: number;
  /**
   * Calendar years advanced per completed player turn (scenario timeline).
   * Drives displayed calendar year, calendar-end turn limits, and chapter carryover year.
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
  turnLimitRule: TurnLimitRule;
  bootstrap: LevelBootstrapKind;
  /** Core UI key for the level brief on the start menu. */
  menuBriefKey: string;
} & CampaignLevelDefFields;

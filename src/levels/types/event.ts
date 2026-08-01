import type { Effect } from "./effect";

/** Registry of event template ids; campaign packs merge their ids in via `declare module`. */
export interface EventTemplateIdRegistry {}
export type EventTemplateId = keyof EventTemplateIdRegistry & string;

/** Campaign packs merge their event solve shapes (keyed by `kind`) into this registry. */
export interface CampaignEventSolveRegistry {}
export type EventSolve = CampaignEventSolveRegistry[keyof CampaignEventSolveRegistry];

/** Fixed event columns (max 10); procedural random rolls only fill {@link PROCEDURAL_EVENT_SLOT_ORDER}. */
export const EVENT_SLOT_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

export type SlotId = (typeof EVENT_SLOT_ORDER)[number];

/** Each beginYear random fill only targets A–C; D–J stay empty unless scripted calendar or overflow places there. */
export const PROCEDURAL_EVENT_SLOT_ORDER: readonly SlotId[] = ["A", "B", "C"];

export const EMPTY_EVENT_SLOTS: Record<SlotId, null> = Object.fromEntries(
  EVENT_SLOT_ORDER.map((id) => [id, null]),
) as Record<SlotId, null>;

export const EMPTY_PENDING_MAJOR_CRISIS: Record<SlotId, boolean> = Object.fromEntries(
  EVENT_SLOT_ORDER.map((id) => [id, false]),
) as Record<SlotId, boolean>;

/** Campaign packs merge extra event-template metadata fields into this interface. */
export interface CampaignEventTemplateFields {}

export type EventTemplate = {
  id: EventTemplateId;
  weight: number;
  harmful: boolean;
  titleKey: string;
  /**
   * Historical-background copy key (`event.<id>.history`). Rendered as flavor above the
   * mechanics text; every event must provide it (enforced by `contentCompleteness.test.ts`).
   */
  historyKey: string;
  /** Mechanics-only rules text (`event.<id>.desc`): costs, penalties, and outcomes. */
  descriptionKey: string;
  solve: EventSolve;
  /** Applied in {@link EVENT_SLOT_ORDER} at event resolution if still active and harmful. */
  penaltiesIfUnresolved: Effect[];
  /**
   * If set to "continued", a harmful unresolved crisis stays on the slot after end-of-year
   * handling (penalties and/or engine scheduling). Otherwise the slot is cleared after that
   * strike so the next year rolls a new event there.
   */
  crisisPersistence?: "continued";
  /** For continued events with a finite duration, unresolved instances auto-expire after this many year-end checks. */
  continuedDurationTurns?: number;
  /** Lightweight semantic tags for event-level rules/UI (e.g. anti-French coalition pressure). */
  tags?: readonly EventTag[];
} & CampaignEventTemplateFields;

/** Registry of event tags; campaign packs merge their tags in via `declare module`. */
export interface EventTagRegistry {}
export type EventTag = keyof EventTagRegistry & string;

export type EventInstance = {
  instanceId: string;
  templateId: EventTemplateId;
  /** True after this turn's solve action (funding, targeted card, or scripted choice). */
  resolved: boolean;
  /** Remaining cycles/counters for finite events (e.g., League of Augsburg remaining solves). */
  remainingTurns?: number;
};

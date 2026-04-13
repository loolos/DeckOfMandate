import type { Effect } from "./effect";

export type EventTemplateId =
  | "budgetStrain"
  | "publicUnrest"
  | "administrativeDelay"
  | "tradeOpportunity"
  | "politicalGridlock"
  | "powerVacuum"
  | "majorCrisis";

export type EventSolve =
  | { kind: "funding"; amount: number }
  | { kind: "fundingOrCrackdown"; amount: number }
  | { kind: "crackdownOnly" };

/** Fixed event columns (max 10); engine fills from the start of this list only. */
export const EVENT_SLOT_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

export type SlotId = (typeof EVENT_SLOT_ORDER)[number];

export const EMPTY_EVENT_SLOTS: Record<SlotId, null> = Object.fromEntries(
  EVENT_SLOT_ORDER.map((id) => [id, null]),
) as Record<SlotId, null>;

export const EMPTY_PENDING_MAJOR_CRISIS: Record<SlotId, boolean> = Object.fromEntries(
  EVENT_SLOT_ORDER.map((id) => [id, false]),
) as Record<SlotId, boolean>;

export type EventTemplate = {
  id: EventTemplateId;
  weight: number;
  harmful: boolean;
  titleKey: string;
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
};

export type EventInstance = {
  instanceId: string;
  templateId: EventTemplateId;
  /** True after funding solve or Crackdown (card or event option) this turn. */
  resolved: boolean;
};

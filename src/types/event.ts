import type { Effect } from "./effect";

export type EventTemplateId =
  | "budgetStrain"
  | "publicUnrest"
  | "administrativeDelay"
  | "tradeOpportunity"
  | "politicalGridlock"
  | "powerVacuum"
  | "majorCrisis"
  | "warOfDevolution"
  | "nymwegenSettlement"
  | "revocationNantes"
  | "leagueOfAugsburg"
  | "nineYearsWar"
  | "ryswickPeace"
  | "versaillesExpenditure"
  | "nobleResentment"
  | "provincialNoncompliance"
  | "risingGrainPrices"
  | "taxResistance"
  | "frontierGarrisons"
  | "tradeDisruption"
  | "embargoCoalition"
  | "mercenaryRaiders"
  | "courtScandal"
  | "militaryPrestige"
  | "commercialExpansion"
  | "talentedAdministrator"
  | "warWeariness"
  | "expansionRemembered"
  | "cautiousCrown"
  | "jansenistTension"
  | "arminianTension"
  | "huguenotTension"
  | "localWar"
  | "jesuitPatronage";

export type EventSolve =
  | { kind: "funding"; amount: number }
  | { kind: "fundingOrCrackdown"; amount: number }
  | { kind: "nantesPolicyChoice" }
  | { kind: "crackdownOnly" }
  | { kind: "localWarChoice" }
  /** Balance numbers come from level `scriptedCalendarEvents` (matched by template id). */
  | { kind: "scriptedAttack" };

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

export type EventTemplate = {
  id: EventTemplateId;
  weight: number;
  harmful: boolean;
  titleKey: string;
  descriptionKey: string;
  solve: EventSolve;
  /** Applied when player resolves this event through the funding path. */
  onFundSolveEffects?: readonly Effect[];
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
};

export type EventInstance = {
  instanceId: string;
  templateId: EventTemplateId;
  /** True after funding solve or Crackdown (card or event option) this turn. */
  resolved: boolean;
  /** Remaining cycles/counters for finite events (e.g., League of Augsburg remaining solves). */
  remainingTurns?: number;
};

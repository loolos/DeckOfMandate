import type { Effect } from "./effect";

export type EventTemplateId =
  | "budgetStrain"
  | "publicUnrest"
  | "administrativeDelay"
  | "tradeOpportunity"
  | "powerVacuum"
  | "majorCrisis";

export type EventSolve =
  | { kind: "funding"; amount: number }
  | { kind: "fundingOrCrackdown"; amount: number }
  | { kind: "crackdownOnly" };

export type EventTemplate = {
  id: EventTemplateId;
  weight: number;
  harmful: boolean;
  titleKey: string;
  descriptionKey: string;
  solve: EventSolve;
  /** Applied in slot order A then B at event resolution if still active and harmful. */
  penaltiesIfUnresolved: Effect[];
  /**
   * If set to "continued", a harmful unresolved crisis stays on the slot after end-of-year
   * handling (penalties and/or engine scheduling). Otherwise the slot is cleared after that
   * strike so the next year rolls a new event there.
   */
  crisisPersistence?: "continued";
};

export type SlotId = "A" | "B";

export type EventInstance = {
  instanceId: string;
  templateId: EventTemplateId;
  /** True after funding solve or Crackdown (card or event option) this turn. */
  resolved: boolean;
};

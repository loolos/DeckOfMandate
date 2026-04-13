import type { StatusTemplateId } from "./status";

export type ResourceStat = "treasuryStat" | "power" | "legitimacy";

/** Typed effects used by cards and event resolution (no string DSL). */
export type Effect =
  | { kind: "modResource"; resource: ResourceStat; delta: number }
  | { kind: "gainFunding"; amount: number }
  | { kind: "drawCards"; count: number }
  | { kind: "scheduleNextTurnDrawModifier"; delta: number }
  | { kind: "addPlayerStatus"; templateId: StatusTemplateId; turns: number };

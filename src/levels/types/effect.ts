import type { CardTemplateId } from "./card";
import type { StatusTemplateId } from "./status";

export type ResourceStat = "treasuryStat" | "power" | "legitimacy";
export type CardPlacement = "deckRandom" | "deckTop" | "deckBottom" | "discard";

/** Typed effects used by cards and event resolution (no string DSL). */
export type Effect =
  | { kind: "modResource"; resource: ResourceStat; delta: number }
  | { kind: "modSuccessionTrack"; delta: number }
  | { kind: "gainFunding"; amount: number }
  | { kind: "drawCards"; count: number }
  | { kind: "scheduleNextTurnDrawModifier"; delta: number }
  /** Chapter 3 opponent phase only: adjusts opponent's next `beginYear` draw count (base 2). */
  | { kind: "opponentNextTurnDrawModifier"; delta: number }
  | { kind: "scheduleDrawModifiers"; deltas: number[] }
  | { kind: "addPlayerStatus"; templateId: StatusTemplateId; turns: number }
  | { kind: "addCardsToDeck"; templateId: CardTemplateId; count: number; placement?: CardPlacement };

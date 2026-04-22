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
  /** Applied at next `beginYear` when computing treasury→funding income (then reset with draw modifier). */
  | { kind: "scheduleNextTurnFundingIncomeModifier"; delta: number }
  /** Chapter 3 opponent phase only: adjusts opponent's next `beginYear` draw count (base 1). */
  | { kind: "opponentNextTurnDrawModifier"; delta: number }
  /** Chapter 3: immediately discard `count` random cards from the Habsburg opponent's hand (played-card phase). */
  | { kind: "opponentHandDiscardNow"; count: number }
  /** Chapter 3: adjusts Habsburg opponent cost budget (`opponentStrength`). */
  | { kind: "modOpponentStrength"; delta: number }
  | { kind: "scheduleDrawModifiers"; deltas: number[] }
  | { kind: "addPlayerStatus"; templateId: StatusTemplateId; turns: number }
  | { kind: "addCardsToDeck"; templateId: CardTemplateId; count: number; placement?: CardPlacement };

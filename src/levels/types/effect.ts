import type { CardTemplateId } from "./card";
import type { StatusTemplateId } from "./status";

/** Registry of resource-stat names; campaign packs merge their resource keys in via `declare module`. */
export interface ResourceStatRegistry {}
export type ResourceStat = keyof ResourceStatRegistry & string;

export type CardPlacement = "deckRandom" | "deckTop" | "deckBottom" | "discard";

/** Campaign packs merge their effect shapes (keyed by `kind`) into this registry. */
export interface CampaignEffectRegistry {}

/** Typed effects used by cards and event resolution (no string DSL). */
export type Effect =
  | { kind: "modResource"; resource: ResourceStat; delta: number }
  | { kind: "drawCards"; count: number }
  | { kind: "scheduleNextTurnDrawModifier"; delta: number }
  | { kind: "scheduleDrawModifiers"; deltas: number[] }
  | { kind: "addPlayerStatus"; templateId: StatusTemplateId; turns: number }
  | { kind: "addCardsToDeck"; templateId: CardTemplateId; count: number; placement?: CardPlacement }
  | CampaignEffectRegistry[keyof CampaignEffectRegistry];

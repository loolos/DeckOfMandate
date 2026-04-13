import type { CardTemplateId } from "../types/card";
import type { EventTemplateId } from "../types/event";
import type { Resources } from "../types/game";

type ResourceKey = keyof Resources;

const CARD_ICONS: Record<CardTemplateId, string> = {
  funding: "💰",
  crackdown: "🛡️",
  reform: "📜",
  ceremony: "🎎",
  development: "🏗️",
};

const EVENT_ICONS: Record<EventTemplateId, string> = {
  budgetStrain: "📉",
  publicUnrest: "🔥",
  administrativeDelay: "🗂️",
  tradeOpportunity: "🤝",
  politicalGridlock: "🧱",
  powerVacuum: "🕳️",
  majorCrisis: "🚨",
};

const RESOURCE_ICONS: Record<ResourceKey, string> = {
  treasuryStat: "🏛️",
  funding: "💰",
  power: "⚡",
  legitimacy: "👑",
};

function withIcon(icon: string, label: string): string {
  return `${icon} ${label}`;
}

export function getResourceIcon(resource: ResourceKey): string {
  return RESOURCE_ICONS[resource];
}

export function cardLabelWithIcon(id: CardTemplateId, label: string): string {
  return withIcon(CARD_ICONS[id], label);
}

export function eventLabelWithIcon(id: EventTemplateId, label: string): string {
  return withIcon(EVENT_ICONS[id], label);
}

export function resourceLabelWithIcon(resource: ResourceKey, label: string): string {
  return withIcon(RESOURCE_ICONS[resource], label);
}

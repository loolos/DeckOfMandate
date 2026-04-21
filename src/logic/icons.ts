import type { CardTemplateId } from "../levels/types/card";
import type { EventTemplateId } from "../levels/types/event";
import type { Resources } from "../types/game";

type ResourceKey = keyof Resources;

const CARD_ICONS: Record<CardTemplateId, string> = {
  funding: "💰",
  crackdown: "🛡️",
  diplomaticIntervention: "🕊️",
  fiscalBurden: "⛓️",
  antiFrenchContainment: "🧷",
  reform: "📜",
  ceremony: "🎎",
  development: "🏗️",
  grainRelief: "🌾",
  taxRebalance: "🧾",
  diplomaticCongress: "🕊️",
  suppressHuguenots: "⚔️",
  religiousTensionCard: "⛪",
  jansenistReservation: "📖",
  jesuitCollege: "🎓",
  bourbonMarriageProclamation: "💒",
  grandAllianceInfiltrationDiplomacy: "🕵️",
  italianTheaterTroopRedeploy: "🗡️",
  habsburgGrandAllianceLevy: "⚔️",
  habsburgImperialCustomsDelay: "📋",
  habsburgImperialLegitimacyNote: "📜",
  habsburgLowCountriesAgitation: "🗺️",
};

const EVENT_ICONS: Record<EventTemplateId, string> = {
  budgetStrain: "📉",
  publicUnrest: "🔥",
  administrativeDelay: "🗂️",
  tradeOpportunity: "🤝",
  politicalGridlock: "🧱",
  powerVacuum: "🕳️",
  majorCrisis: "🚨",
  warOfDevolution: "⚔️",
  nymwegenSettlement: "🤝",
  revocationNantes: "⛪",
  leagueOfAugsburg: "🛡️",
  nineYearsWar: "⚔️",
  ryswickPeace: "📜",
  versaillesExpenditure: "🏰",
  nobleResentment: "😠",
  provincialNoncompliance: "🗄️",
  risingGrainPrices: "🌾",
  taxResistance: "🧨",
  frontierGarrisons: "🪖",
  tradeDisruption: "🚢",
  embargoCoalition: "⛔",
  mercenaryRaiders: "🏴‍☠️",
  courtScandal: "🎭",
  militaryPrestige: "🎖️",
  commercialExpansion: "📈",
  talentedAdministrator: "🧠",
  warWeariness: "🥀",
  expansionRemembered: "🦅",
  cautiousCrown: "👑",
  jansenistTension: "✝️",
  arminianTension: "📖",
  huguenotTension: "🕯️",
  localWar: "⚔️",
  jesuitPatronage: "📚",
  successionCrisis: "👑",
  opponentHabsburg: "🦅",
  utrechtTreaty: "📜",
  bavarianCourtRealignment: "🏰",
  portugueseTariffNegotiation: "⚓",
  imperialElectorsMood: "🗳️",
  localizedSuccessionWar: "⚔️",
  dualFrontCrisis: "⚔️",
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

/** Card-type emoji only (for compact / narrow layouts). */
export function getCardTypeEmoji(id: CardTemplateId): string {
  return CARD_ICONS[id];
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

/** Habsburg opponent-phase budget / card cost as repeated emoji (one pip per point). */
export function opponentBudgetEmojiPips(n: number): string {
  const k = Math.max(0, Math.min(12, Math.floor(Number.isFinite(n) ? n : 0)));
  if (k === 0) return "○";
  return "🪙".repeat(k);
}

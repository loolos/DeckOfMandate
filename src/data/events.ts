import { EVENT_SLOT_ORDER, type EventTemplate, type EventTemplateId } from "../types/event";
import type { GameState } from "../types/game";
import { antiFrenchSentimentEventSolveCostPenalty, antiFrenchSentimentRyswickSurcharge } from "../logic/antiFrenchSentiment";
import { nymwegenSettlementFundingCost } from "../logic/europeAlert";

const EUROPE_ALERT_SUPPLEMENTAL_EVENT_IDS: readonly EventTemplateId[] = [
  "frontierGarrisons",
  "tradeDisruption",
  "embargoCoalition",
  "mercenaryRaiders",
  "localWar",
];

export function isEuropeAlertSupplementalEvent(id: EventTemplateId): boolean {
  return EUROPE_ALERT_SUPPLEMENTAL_EVENT_IDS.includes(id);
}

export const eventTemplates: Record<EventTemplateId, EventTemplate> = {
  budgetStrain: {
    id: "budgetStrain",
    weight: 3,
    harmful: true,
    titleKey: "event.budgetStrain.name",
    descriptionKey: "event.budgetStrain.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "treasuryStat", delta: -1 }],
  },
  publicUnrest: {
    id: "publicUnrest",
    weight: 3,
    harmful: true,
    titleKey: "event.publicUnrest.name",
    descriptionKey: "event.publicUnrest.desc",
    solve: { kind: "crackdownOnly" },
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "legitimacy", delta: -1 }],
  },
  administrativeDelay: {
    id: "administrativeDelay",
    weight: 2,
    harmful: true,
    titleKey: "event.administrativeDelay.name",
    descriptionKey: "event.administrativeDelay.desc",
    solve: { kind: "funding", amount: 1 },
    penaltiesIfUnresolved: [{ kind: "scheduleNextTurnDrawModifier", delta: -1 }],
  },
  tradeOpportunity: {
    id: "tradeOpportunity",
    weight: 2,
    harmful: false,
    titleKey: "event.tradeOpportunity.name",
    descriptionKey: "event.tradeOpportunity.desc",
    solve: { kind: "funding", amount: 1 },
    onFundSolveEffects: [{ kind: "modResource", resource: "treasuryStat", delta: 1 }],
    penaltiesIfUnresolved: [],
  },
  politicalGridlock: {
    id: "politicalGridlock",
    weight: 2,
    harmful: true,
    titleKey: "event.politicalGridlock.name",
    descriptionKey: "event.politicalGridlock.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [{ kind: "addPlayerStatus", templateId: "powerLeak", turns: 3 }],
  },
  powerVacuum: {
    id: "powerVacuum",
    weight: 1,
    harmful: true,
    crisisPersistence: "continued",
    titleKey: "event.powerVacuum.name",
    descriptionKey: "event.powerVacuum.desc",
    solve: { kind: "fundingOrCrackdown", amount: 2 },
    /** Engine: unresolved vacuum on a slot schedules Major Crisis on that slot next Event phase. */
    penaltiesIfUnresolved: [],
  },
  majorCrisis: {
    id: "majorCrisis",
    weight: 0,
    harmful: true,
    crisisPersistence: "continued",
    titleKey: "event.majorCrisis.name",
    descriptionKey: "event.majorCrisis.desc",
    solve: { kind: "crackdownOnly" },
    penaltiesIfUnresolved: [
      { kind: "modResource", resource: "legitimacy", delta: -1 },
      { kind: "scheduleNextTurnDrawModifier", delta: -1 },
    ],
  },
  warOfDevolution: {
    id: "warOfDevolution",
    weight: 0,
    harmful: false,
    titleKey: "event.warOfDevolution.name",
    descriptionKey: "event.warOfDevolution.desc",
    solve: { kind: "scriptedAttack" },
    penaltiesIfUnresolved: [],
  },
  nymwegenSettlement: {
    id: "nymwegenSettlement",
    weight: 0,
    harmful: false,
    crisisPersistence: "continued",
    titleKey: "event.nymwegenSettlement.name",
    descriptionKey: "event.nymwegenSettlement.desc",
    solve: { kind: "funding", amount: 6 },
    onFundSolveEffects: [
      { kind: "modResource", resource: "power", delta: -2 },
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
      { kind: "modResource", resource: "legitimacy", delta: -1 },
    ],
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "power", delta: -1 }],
  },
  revocationNantes: {
    id: "revocationNantes",
    weight: 0,
    harmful: false,
    crisisPersistence: "continued",
    titleKey: "event.revocationNantes.name",
    descriptionKey: "event.revocationNantes.desc",
    solve: { kind: "nantesPolicyChoice" },
    penaltiesIfUnresolved: [{ kind: "scheduleNextTurnDrawModifier", delta: -2 }],
  },
  leagueOfAugsburg: {
    id: "leagueOfAugsburg",
    weight: 0,
    harmful: false,
    titleKey: "event.leagueOfAugsburg.name",
    descriptionKey: "event.leagueOfAugsburg.desc",
    solve: { kind: "fundingOrCrackdown", amount: 2 },
    crisisPersistence: "continued",
    continuedDurationTurns: 3,
    penaltiesIfUnresolved: [],
  },
  nineYearsWar: {
    id: "nineYearsWar",
    weight: 0,
    harmful: false,
    crisisPersistence: "continued",
    titleKey: "event.nineYearsWar.name",
    descriptionKey: "event.nineYearsWar.desc",
    solve: { kind: "fundingOrCrackdown", amount: 2 },
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "legitimacy", delta: -1 }],
  },
  ryswickPeace: {
    id: "ryswickPeace",
    weight: 0,
    harmful: false,
    crisisPersistence: "continued",
    titleKey: "event.ryswickPeace.name",
    descriptionKey: "event.ryswickPeace.desc",
    solve: { kind: "funding", amount: 1 },
    onFundSolveEffects: [{ kind: "modResource", resource: "legitimacy", delta: 1 }],
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "legitimacy", delta: -1 }],
  },
  versaillesExpenditure: {
    id: "versaillesExpenditure",
    weight: 3,
    harmful: true,
    titleKey: "event.versaillesExpenditure.name",
    descriptionKey: "event.versaillesExpenditure.desc",
    solve: { kind: "fundingOrCrackdown", amount: 3 },
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "treasuryStat", delta: -2 }],
  },
  nobleResentment: {
    id: "nobleResentment",
    weight: 2,
    harmful: true,
    titleKey: "event.nobleResentment.name",
    descriptionKey: "event.nobleResentment.desc",
    solve: { kind: "fundingOrCrackdown", amount: 2 },
    penaltiesIfUnresolved: [{ kind: "addPlayerStatus", templateId: "powerLeak", turns: 3 }],
  },
  provincialNoncompliance: {
    id: "provincialNoncompliance",
    weight: 2,
    harmful: true,
    titleKey: "event.provincialNoncompliance.name",
    descriptionKey: "event.provincialNoncompliance.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [{ kind: "scheduleDrawModifiers", deltas: [-2, -1, -1] }],
  },
  risingGrainPrices: {
    id: "risingGrainPrices",
    weight: 3,
    harmful: true,
    titleKey: "event.risingGrainPrices.name",
    descriptionKey: "event.risingGrainPrices.desc",
    solve: { kind: "fundingOrCrackdown", amount: 3 },
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "legitimacy", delta: -2 }],
  },
  taxResistance: {
    id: "taxResistance",
    weight: 2,
    harmful: true,
    titleKey: "event.taxResistance.name",
    descriptionKey: "event.taxResistance.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
      { kind: "modResource", resource: "legitimacy", delta: -1 },
    ],
  },
  frontierGarrisons: {
    id: "frontierGarrisons",
    weight: 2,
    harmful: true,
    titleKey: "event.frontierGarrisons.name",
    descriptionKey: "event.frontierGarrisons.desc",
    solve: { kind: "funding", amount: 3 },
    penaltiesIfUnresolved: [
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
      { kind: "scheduleNextTurnDrawModifier", delta: -1 },
    ],
  },
  tradeDisruption: {
    id: "tradeDisruption",
    weight: 1,
    harmful: true,
    titleKey: "event.tradeDisruption.name",
    descriptionKey: "event.tradeDisruption.desc",
    solve: { kind: "funding", amount: 1 },
    penaltiesIfUnresolved: [{ kind: "scheduleNextTurnDrawModifier", delta: -2 }],
  },
  embargoCoalition: {
    id: "embargoCoalition",
    weight: 1,
    harmful: true,
    titleKey: "event.embargoCoalition.name",
    descriptionKey: "event.embargoCoalition.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
      { kind: "scheduleNextTurnDrawModifier", delta: -1 },
    ],
  },
  mercenaryRaiders: {
    id: "mercenaryRaiders",
    weight: 1,
    harmful: true,
    titleKey: "event.mercenaryRaiders.name",
    descriptionKey: "event.mercenaryRaiders.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [
      { kind: "modResource", resource: "power", delta: -1 },
      { kind: "modResource", resource: "legitimacy", delta: -1 },
    ],
  },
  courtScandal: {
    id: "courtScandal",
    weight: 1,
    harmful: true,
    titleKey: "event.courtScandal.name",
    descriptionKey: "event.courtScandal.desc",
    solve: { kind: "funding", amount: 3 },
    penaltiesIfUnresolved: [
      { kind: "modResource", resource: "legitimacy", delta: -1 },
      { kind: "addPlayerStatus", templateId: "royalBan", turns: 1 },
    ],
  },
  militaryPrestige: {
    id: "militaryPrestige",
    weight: 1,
    harmful: false,
    titleKey: "event.militaryPrestige.name",
    descriptionKey: "event.militaryPrestige.desc",
    solve: { kind: "funding", amount: 2 },
    onFundSolveEffects: [{ kind: "modResource", resource: "legitimacy", delta: 1 }],
    penaltiesIfUnresolved: [],
  },
  commercialExpansion: {
    id: "commercialExpansion",
    weight: 2,
    harmful: false,
    titleKey: "event.commercialExpansion.name",
    descriptionKey: "event.commercialExpansion.desc",
    solve: { kind: "funding", amount: 2 },
    onFundSolveEffects: [{ kind: "modResource", resource: "treasuryStat", delta: 1 }],
    penaltiesIfUnresolved: [],
  },
  talentedAdministrator: {
    id: "talentedAdministrator",
    weight: 1,
    harmful: false,
    titleKey: "event.talentedAdministrator.name",
    descriptionKey: "event.talentedAdministrator.desc",
    solve: { kind: "funding", amount: 2 },
    onFundSolveEffects: [{ kind: "modResource", resource: "power", delta: 1 }],
    penaltiesIfUnresolved: [],
  },
  warWeariness: {
    id: "warWeariness",
    weight: 2,
    harmful: true,
    titleKey: "event.warWeariness.name",
    descriptionKey: "event.warWeariness.desc",
    solve: { kind: "fundingOrCrackdown", amount: 3 },
    penaltiesIfUnresolved: [
      { kind: "modResource", resource: "legitimacy", delta: -1 },
      { kind: "addPlayerStatus", templateId: "powerLeak", turns: 2 },
    ],
  },
  grainReliefCrisis: {
    id: "grainReliefCrisis",
    weight: 0,
    harmful: false,
    titleKey: "event.grainReliefCrisis.name",
    descriptionKey: "event.grainReliefCrisis.desc",
    solve: { kind: "funding", amount: 2 },
    onFundSolveEffects: [{ kind: "modResource", resource: "legitimacy", delta: 2 }],
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "legitimacy", delta: -2 }],
  },
  expansionRemembered: {
    id: "expansionRemembered",
    weight: 0,
    harmful: false,
    titleKey: "event.expansionRemembered.name",
    descriptionKey: "event.expansionRemembered.desc",
    solve: { kind: "funding", amount: 2 },
    onFundSolveEffects: [{ kind: "addCardsToDeck", templateId: "fiscalBurden", count: 2 }],
    penaltiesIfUnresolved: [{ kind: "addCardsToDeck", templateId: "fiscalBurden", count: 3 }],
  },
  cautiousCrown: {
    id: "cautiousCrown",
    weight: 0,
    harmful: false,
    titleKey: "event.cautiousCrown.name",
    descriptionKey: "event.cautiousCrown.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "power", delta: -1 }],
  },
  religiousTension: {
    id: "religiousTension",
    weight: 0,
    harmful: true,
    titleKey: "event.religiousTension.name",
    descriptionKey: "event.religiousTension.desc",
    solve: { kind: "funding", amount: 2 },
    penaltiesIfUnresolved: [{ kind: "modResource", resource: "legitimacy", delta: -1 }],
  },
  localWar: {
    id: "localWar",
    weight: 0,
    harmful: false,
    crisisPersistence: "continued",
    titleKey: "event.localWar.name",
    descriptionKey: "event.localWar.desc",
    solve: { kind: "localWarChoice" },
    penaltiesIfUnresolved: [],
  },
};

/** Weighted roll pool is per-level; see `levelContent.ts` (`rollableEventIds`). */

export function getEventTemplate(id: EventTemplateId): EventTemplate {
  return eventTemplates[id];
}

export function getEventRollWeight(state: GameState, id: EventTemplateId): number {
  void state;
  return eventTemplates[id].weight;
}

export function getEventSolveFundingAmount(state: GameState, id: EventTemplateId): number | null {
  const tmpl = eventTemplates[id];
  if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown") return null;
  const antiFrenchPenalty = isEuropeAlertSupplementalEvent(id) ? antiFrenchSentimentEventSolveCostPenalty(state) : 0;
  if (id === "nymwegenSettlement") {
    return nymwegenSettlementFundingCost(state.europeAlertProgress) + antiFrenchPenalty;
  }
  if (id === "ryswickPeace") {
    const nineYearsWarActive = EVENT_SLOT_ORDER.some((slot) => state.slots[slot]?.templateId === "nineYearsWar");
    const warSurcharge = nineYearsWarActive ? 4 : 0;
    return state.europeAlertProgress + 2 + antiFrenchPenalty + warSurcharge + antiFrenchSentimentRyswickSurcharge(state);
  }
  if (id === "nineYearsWar") {
    return Math.floor(state.europeAlertProgress / 2) + 1;
  }
  return tmpl.solve.amount + antiFrenchPenalty;
}

/** Continued crises persist or transform; all other harmful crises clear after their EOY strike. */
export function isContinuedCrisis(tmpl: EventTemplate): boolean {
  return tmpl.crisisPersistence === "continued";
}

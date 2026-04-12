import type { EventTemplate, EventTemplateId } from "../types/event";

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
    penaltiesIfUnresolved: [],
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
};

/** Pool entries used for weighted rolls (Major Crisis is transform-only). */
export const rollableEventIds: EventTemplateId[] = [
  "budgetStrain",
  "publicUnrest",
  "administrativeDelay",
  "tradeOpportunity",
  "powerVacuum",
];

export function getEventTemplate(id: EventTemplateId): EventTemplate {
  return eventTemplates[id];
}

/** Continued crises persist or transform; all other harmful crises clear after their EOY strike. */
export function isContinuedCrisis(tmpl: EventTemplate): boolean {
  return tmpl.crisisPersistence === "continued";
}

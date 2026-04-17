import type { EventTemplateId } from "../types/event";

const HISTORICAL_EVENT_IDS = new Set<EventTemplateId>([
  "warOfDevolution",
  "expansionRemembered",
  "cautiousCrown",
  "nymwegenSettlement",
  "revocationNantes",
  "grainReliefCrisis",
  "leagueOfAugsburg",
  "nineYearsWar",
  "ryswickPeace",
]);

export function isHistoricalEventTemplateId(id: EventTemplateId): boolean {
  return HISTORICAL_EVENT_IDS.has(id);
}

import {
  EVENT_SLOT_ORDER,
  type EventTemplate,
  type EventTemplateId,
  type SlotId,
} from "../levels/types/event";
import { THIRD_MANDATE_LEVEL_ID } from "../logic/thirdMandateConstants";
import type { GameState } from "../types/game";
import { antiFrenchSentimentEventSolveCostPenalty, antiFrenchSentimentRyswickSurcharge } from "../logic/antiFrenchSentiment";
import { nymwegenSettlementFundingCost } from "../logic/europeAlert";
import { eventTemplates } from "./loadEventTemplates";

export { eventTemplates } from "./loadEventTemplates";

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

/** Chapter-3 random pool: only roll once succession track has moved off 0. */
const CH3_SUCCESSION_GATED_ROLL_EVENT_IDS: readonly EventTemplateId[] = [
  "bavarianCourtRealignment",
  "portugueseTariffNegotiation",
  "imperialElectorsMood",
  "localizedSuccessionWar",
];

export function isCh3SuccessionGatedRollEvent(id: EventTemplateId): boolean {
  return CH3_SUCCESSION_GATED_ROLL_EVENT_IDS.includes(id);
}

export function getEventTemplate(id: EventTemplateId): EventTemplate {
  const t = eventTemplates[id];
  if (t === undefined) throw new Error(`Unknown event template: ${String(id)}`);
  return t;
}

export function getEventRollWeight(state: GameState, id: EventTemplateId): number {
  const base = getEventTemplate(id).weight;
  if (
    state.levelId === THIRD_MANDATE_LEVEL_ID &&
    isCh3SuccessionGatedRollEvent(id) &&
    (state.successionTrack === 0 || state.warEnded)
  ) {
    return 0;
  }
  return base;
}

/** Procedural queue may contain gated ids from an older turn; discard while track is still 0 or after Utrecht ends the war. */
export function shouldDiscardCh3SuccessionGatedProceduralHead(state: GameState, id: EventTemplateId): boolean {
  if (state.levelId !== THIRD_MANDATE_LEVEL_ID || !isCh3SuccessionGatedRollEvent(id)) return false;
  return state.successionTrack === 0 || state.warEnded;
}

export function getEventSolveFundingAmount(state: GameState, id: EventTemplateId): number | null {
  const tmpl = eventTemplates[id];
  if (tmpl.solve.kind === "fundingTreasuryQuarterCeil") {
    return Math.max(0, Math.ceil(state.resources.treasuryStat / 4));
  }
  if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown") return null;
  const antiFrenchPenalty = isEuropeAlertSupplementalEvent(id) ? antiFrenchSentimentEventSolveCostPenalty(state) : 0;
  if (id === "nymwegenSettlement") {
    return nymwegenSettlementFundingCost(state.europeAlertProgress) + antiFrenchPenalty;
  }
  if (id === "ryswickPeace") {
    const nineYearsWarActive = EVENT_SLOT_ORDER.some(
      (slot: SlotId) => state.slots[slot]?.templateId === "nineYearsWar",
    );
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

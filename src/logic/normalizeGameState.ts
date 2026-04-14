import { defaultLevelId, getLevelDef, isLevelId } from "../data/levels";
import { computeEuropeAlertDrawPenalty } from "./europeAlert";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS, EVENT_SLOT_ORDER, type SlotId } from "../types/event";
import type { GameState } from "../types/game";

function ensureFullSlotMaps(s: GameState): GameState {
  const slotsIn = s.slots as Partial<Record<SlotId, GameState["slots"]["A"]>> | undefined;
  const pmIn = s.pendingMajorCrisis as Partial<Record<SlotId, boolean>> | undefined;
  if (!slotsIn || !pmIn) return s;
  let need = false;
  for (const id of EVENT_SLOT_ORDER) {
    if (slotsIn[id] === undefined || pmIn[id] === undefined) {
      need = true;
      break;
    }
  }
  if (!need) return s;
  const slots: GameState["slots"] = { ...EMPTY_EVENT_SLOTS };
  const pendingMajorCrisis: GameState["pendingMajorCrisis"] = { ...EMPTY_PENDING_MAJOR_CRISIS };
  for (const id of EVENT_SLOT_ORDER) {
    slots[id] = slotsIn[id] ?? null;
    pendingMajorCrisis[id] = pmIn[id] ?? false;
  }
  return { ...s, slots, pendingMajorCrisis };
}

/** Fill defaults for fields added after older saves / external HYDRATE payloads. */
export function normalizeGameState(state: GameState): GameState {
  let s: GameState = isLevelId(state.levelId) ? state : { ...state, levelId: defaultLevelId };
  s = ensureFullSlotMaps(s);
  if (!Array.isArray(s.playerStatuses)) {
    s = { ...s, playerStatuses: [] };
  }
  const eventId = typeof s.nextIds?.event === "number" ? s.nextIds.event : 0;
  const statusId = typeof s.nextIds?.status === "number" ? s.nextIds.status : 0;
  const logId = typeof s.nextIds?.log === "number" ? s.nextIds.log : 0;
  s = { ...s, nextIds: { event: eventId, status: statusId, log: logId } };
  if (!Array.isArray(s.actionLog)) {
    s = { ...s, actionLog: [] };
  }
  if (s.antiFrenchLeague === undefined) {
    s = { ...s, antiFrenchLeague: null };
  }
  if (s.warOfDevolutionAttacked === undefined) {
    s = { ...s, warOfDevolutionAttacked: false };
  }
  if (s.europeAlert === undefined) {
    s = { ...s, europeAlert: false };
  }
  if (s.europeAlertDrawPenalty === undefined) {
    // Migration fallback for older saves: derive from current power if Europe Alert is active.
    s = {
      ...s,
      europeAlertDrawPenalty: s.europeAlert ? computeEuropeAlertDrawPenalty(s.resources.power) : 0,
    };
  }
  if (s.nymwegenSettlementAchieved === undefined) {
    s = { ...s, nymwegenSettlementAchieved: false };
  }
  if (typeof s.calendarStartYear !== "number") {
    s = { ...s, calendarStartYear: getLevelDef(s.levelId).calendarStartYear };
  }
  if (!Array.isArray(s.scheduledDrawModifiers)) {
    s = { ...s, scheduledDrawModifiers: [] };
  }
  return s;
}

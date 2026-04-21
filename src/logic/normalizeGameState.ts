import { getDefaultLevelId, getLevelDef, isLevelId } from "../data/levels";
import { enforceHuguenotContainmentInvariant } from "./cardRuntime";
import { normalizeCardUsesById } from "./cardUsage";
import { computeEuropeAlertPowerLoss } from "./europeAlert";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS, EVENT_SLOT_ORDER, type SlotId } from "../levels/types/event";
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
  let s: GameState = isLevelId(state.levelId) ? state : { ...state, levelId: getDefaultLevelId() };
  s = ensureFullSlotMaps(s);
  if (!Array.isArray(s.playerStatuses)) {
    s = { ...s, playerStatuses: [] };
  }
  if (s.nantesPolicyCarryover !== "tolerance" && s.nantesPolicyCarryover !== "crackdown") {
    s = { ...s, nantesPolicyCarryover: null };
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
    s = { ...s, europeAlert: getLevelDef(s.levelId).features.europeAlertMechanics };
  }
  if (s.europeAlertPowerLoss === undefined) {
    const legacyDrawPenalty =
      typeof (s as GameState & { europeAlertDrawPenalty?: unknown }).europeAlertDrawPenalty === "number"
        ? Math.max(0, (s as GameState & { europeAlertDrawPenalty: number }).europeAlertDrawPenalty)
        : undefined;
    // Migration fallback for older saves: reuse legacy value when present; otherwise derive from current power.
    s = {
      ...s,
      europeAlertPowerLoss: legacyDrawPenalty ?? (s.europeAlert ? computeEuropeAlertPowerLoss(s.resources.power) : 0),
    };
  }
  if (s.europeAlertProgress === undefined) {
    const mechanics = getLevelDef(s.levelId).features.europeAlertMechanics;
    const defaultProgress =
      !s.europeAlert ? 0 : mechanics ? (s.warOfDevolutionAttacked ? 3 : 1) : 3;
    s = { ...s, europeAlertProgress: defaultProgress };
  } else {
    const clamped = s.europeAlert ? Math.min(10, Math.max(1, Math.floor(s.europeAlertProgress))) : 0;
    if (clamped !== s.europeAlertProgress) {
      s = { ...s, europeAlertProgress: clamped };
    }
  }
  if (s.nymwegenSettlementAchieved === undefined) {
    s = { ...s, nymwegenSettlementAchieved: false };
  }
  if (typeof s.huguenotResurgenceCounter !== "number" || !Number.isFinite(s.huguenotResurgenceCounter)) {
    s = { ...s, huguenotResurgenceCounter: 0 };
  }
  if (typeof s.calendarStartYear !== "number") {
    s = { ...s, calendarStartYear: getLevelDef(s.levelId).calendarStartYear };
  }
  if (!Array.isArray(s.scheduledDrawModifiers)) {
    s = { ...s, scheduledDrawModifiers: [] };
  }
  if (!Array.isArray(s.proceduralEventSequence)) {
    s = { ...s, proceduralEventSequence: [] };
  }
  if (typeof s.successionTrack !== "number" || !Number.isFinite(s.successionTrack)) {
    s = { ...s, successionTrack: 0 };
  } else {
    s = { ...s, successionTrack: Math.max(-10, Math.min(10, Math.floor(s.successionTrack))) };
  }
  if (typeof s.opponentStrength !== "number" || !Number.isFinite(s.opponentStrength)) {
    s = { ...s, opponentStrength: 2 };
  }
  if (typeof s.opponentHabsburgUnlocked !== "boolean") {
    s = { ...s, opponentHabsburgUnlocked: false };
  }
  if (typeof s.warEnded !== "boolean") {
    s = { ...s, warEnded: false };
  }
  if (s.utrechtTreatyCountdown !== null && (typeof s.utrechtTreatyCountdown !== "number" || !Number.isFinite(s.utrechtTreatyCountdown))) {
    s = { ...s, utrechtTreatyCountdown: null };
  }
  if (!Array.isArray(s.opponentDeck)) {
    s = { ...s, opponentDeck: [] };
  }
  if (!Array.isArray(s.opponentHand)) {
    s = { ...s, opponentHand: [] };
  }
  if (!Array.isArray(s.opponentDiscard)) {
    s = { ...s, opponentDiscard: [] };
  }
  if (typeof s.opponentCostDiscountThisTurn !== "number" || !Number.isFinite(s.opponentCostDiscountThisTurn)) {
    s = { ...s, opponentCostDiscountThisTurn: 0 };
  }
  if (typeof s.opponentNextTurnDrawModifier !== "number" || !Number.isFinite(s.opponentNextTurnDrawModifier)) {
    s = { ...s, opponentNextTurnDrawModifier: 0 };
  }
  if (!Array.isArray(s.opponentLastPlayedTemplateIds)) {
    s = { ...s, opponentLastPlayedTemplateIds: [] };
  }
  if (s.successionOutcomeTier != null && s.successionOutcomeTier !== "habsburg" && s.successionOutcomeTier !== "compromise" && s.successionOutcomeTier !== "bourbon") {
    s = { ...s, successionOutcomeTier: null };
  }
  if (s.successionOutcomeTier === undefined) {
    s = { ...s, successionOutcomeTier: null };
  }
  if (
    s.utrechtSettlementTier != null &&
    s.utrechtSettlementTier !== "habsburg" &&
    s.utrechtSettlementTier !== "compromise" &&
    s.utrechtSettlementTier !== "bourbon"
  ) {
    s = { ...s, utrechtSettlementTier: null };
  }
  if (s.utrechtSettlementTier === undefined) {
    s = { ...s, utrechtSettlementTier: null };
  }
  if (!s.cardUsesById || typeof s.cardUsesById !== "object") {
    s = { ...s, cardUsesById: {} };
  }
  const normalizedCardUsesById = normalizeCardUsesById(s);
  const sameCardUseKeys =
    Object.keys(normalizedCardUsesById).length === Object.keys(s.cardUsesById).length &&
    Object.keys(normalizedCardUsesById).every((id) => {
      const left = normalizedCardUsesById[id];
      const right = s.cardUsesById[id];
      return !!left && !!right && left.remaining === right.remaining && left.total === right.total;
    });
  if (!sameCardUseKeys) {
    s = { ...s, cardUsesById: normalizedCardUsesById };
  }
  if (!s.cardInflationById || typeof s.cardInflationById !== "object") {
    s = { ...s, cardInflationById: {} };
  }
  s = enforceHuguenotContainmentInvariant(s);
  return s;
}

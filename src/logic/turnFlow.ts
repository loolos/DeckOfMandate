import { getEventRollWeight } from "../data/events";
import { getLevelContent } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
import type { CardTemplateId } from "../types/card";
import { appendActionLog } from "./actionLog";
import {
  EVENT_SLOT_ORDER,
  PROCEDURAL_EVENT_SLOT_ORDER,
  type EventInstance,
  type SlotId,
} from "../types/event";
import type { GameState } from "../types/game";
import type { PlayerStatusInstance } from "../types/status";
import { applyOnDrawCardEffects } from "./cardRuntime";
import { applyInflationFromDeckRefill } from "./cardCost";
import { drawUpToPower } from "./draw";
import { drawAttemptsFromPower } from "./drawScaling";
import { applyScriptedCalendarPhase, rollAntiFrenchLeagueDrawAdjustment } from "./scriptedCalendar";
import { rngNext, shuffle } from "./rng";

/** First calendar turn on which a full empty-board roll may produce three events (turns 1–5 never triple). */
export const FIRST_TURN_ELIGIBLE_FOR_TRIPLE_EVENTS = 6;

/** When every event slot is empty, P(three new events) for turn >= {@link FIRST_TURN_ELIGIBLE_FOR_TRIPLE_EVENTS}. */
export const PROB_TRIPLE_EVENTS = 0.1;

/** When every event slot is empty, P(only slot A is filled); remaining probability is two events (A+B). */
export const PROB_SINGLE_EVENT_WHEN_ALL_EMPTY = 0.3;
export const PROB_EUROPE_ALERT_SUPPLEMENTAL_EVENT = 0.5;

const EUROPE_ALERT_SUPPLEMENTAL_POOL = ["frontierGarrisons", "tradeDisruption"] as const;
const RELIGIOUS_TENSION_TRIGGER_PROBABILITY = 0.3;
const PROCEDURAL_SEQUENCE_LOW_WATERMARK = 3;
const SECOND_MANDATE_EARLIEST_VICTORY_YEAR = 1696;
const FIRST_MANDATE_OPENING_EVENTS: readonly EventInstance["templateId"][] = [
  "tradeOpportunity",
  "administrativeDelay",
];

function buildProceduralSequenceBlock(state: GameState): [GameState["rng"], EventInstance["templateId"][]] {
  const pool = getLevelContent(state.levelId).rollableEventIds;
  const expanded: EventInstance["templateId"][] = [];
  for (const id of pool) {
    const weight = Math.max(0, Math.floor(getEventRollWeight(state, id)));
    for (let i = 0; i < weight; i++) expanded.push(id);
  }
  if (expanded.length === 0) return [state.rng, []];
  return shuffle(state.rng, expanded);
}

function buildOpeningSequencePrefix(state: GameState): EventInstance["templateId"][] {
  if (state.levelId !== "firstMandate" || state.turn !== 1) return [];
  return [...FIRST_MANDATE_OPENING_EVENTS];
}

function ensureProceduralSequence(state: GameState, minRemaining: number): GameState {
  let s = state;
  while (s.proceduralEventSequence.length < minRemaining) {
    const isFirstBlock = s.proceduralEventSequence.length === 0;
    const [rng, block] = buildProceduralSequenceBlock(s);
    const prefix = isFirstBlock ? buildOpeningSequencePrefix(s) : [];
    const withPrefix = prefix.length > 0 ? [...prefix, ...block.filter((id) => !prefix.includes(id))] : block;
    s = { ...s, rng, proceduralEventSequence: [...s.proceduralEventSequence, ...withPrefix] };
    if (withPrefix.length === 0) break;
  }
  return s;
}

function drawFromProceduralSequence(
  state: GameState,
  count: number,
): [GameState, EventInstance["templateId"][]] {
  let s = ensureProceduralSequence(state, Math.max(count, PROCEDURAL_SEQUENCE_LOW_WATERMARK));
  const picked: EventInstance["templateId"][] = [];
  const used = new Set<EventInstance["templateId"]>();
  while (picked.length < count) {
    s = ensureProceduralSequence(s, 1);
    if (s.proceduralEventSequence.length === 0) break;
    const [head, ...rest] = s.proceduralEventSequence;
    s = { ...s, proceduralEventSequence: rest };
    if (!head) continue;
    if (used.has(head)) continue;
    picked.push(head);
    used.add(head);
  }
  if (s.proceduralEventSequence.length < PROCEDURAL_SEQUENCE_LOW_WATERMARK) {
    s = ensureProceduralSequence(s, PROCEDURAL_SEQUENCE_LOW_WATERMARK);
  }
  return [s, picked];
}

function placeEventTemplateOnSlot(state: GameState, slot: SlotId, templateId: EventInstance["templateId"]): GameState {
  const instance: EventInstance = {
    instanceId: `evt_${state.nextIds.event}`,
    templateId,
    resolved: false,
  };
  return {
    ...state,
    nextIds: { ...state.nextIds, event: state.nextIds.event + 1 },
    slots: { ...state.slots, [slot]: instance },
  };
}

function applyScheduledTransforms(state: GameState): GameState {
  const escalations = getLevelContent(state.levelId).slotEscalations;
  let st = state;
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = st.slots[slot];
    if (!st.pendingMajorCrisis[slot] || !ev || ev.resolved) continue;
    for (const esc of escalations) {
      if (ev.templateId !== esc.from) continue;
      const instance: EventInstance = {
        instanceId: `evt_${st.nextIds.event}`,
        templateId: esc.to,
        resolved: false,
      };
      st = {
        ...st,
        nextIds: { ...st.nextIds, event: st.nextIds.event + 1 },
        slots: { ...st.slots, [slot]: instance },
        pendingMajorCrisis: { ...st.pendingMajorCrisis, [slot]: false },
      };
      break;
    }
  }
  return st;
}

function clearResolvedSlots(state: GameState): GameState {
  const slots = { ...state.slots };
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = slots[slot];
    if (ev?.resolved) slots[slot] = null;
  }
  return { ...state, slots };
}

function allSlotsEmpty(st: GameState): boolean {
  return EVENT_SLOT_ORDER.every((id) => !st.slots[id]);
}

function desiredProceduralEventCountWhenAllEmpty(state: GameState, roll: number): number {
  if (state.levelId === "firstMandate" && state.turn === 1) return 2;
  if (state.turn < FIRST_TURN_ELIGIBLE_FOR_TRIPLE_EVENTS) {
    return roll < PROB_SINGLE_EVENT_WHEN_ALL_EMPTY ? 1 : 2;
  }
  if (roll < PROB_TRIPLE_EVENTS) return 3;
  if (roll < PROB_TRIPLE_EVENTS + PROB_SINGLE_EVENT_WHEN_ALL_EMPTY) return 1;
  return 2;
}

function fillEmptySlots(state: GameState): GameState {
  let st = state;
  if (allSlotsEmpty(st)) {
    const [rng, u] = rngNext(st.rng);
    st = { ...st, rng };
    const count = desiredProceduralEventCountWhenAllEmpty(st, u);
    const [afterDraw, picked] = drawFromProceduralSequence(st, count);
    st = afterDraw;
    for (let i = 0; i < picked.length; i++) {
      const slot = PROCEDURAL_EVENT_SLOT_ORDER[i];
      if (!slot) break;
      st = placeEventTemplateOnSlot(st, slot, picked[i]!);
    }
    return st;
  }
  for (const slot of PROCEDURAL_EVENT_SLOT_ORDER) {
    if (st.slots[slot]) continue;
    const [afterDraw, picked] = drawFromProceduralSequence(st, 1);
    st = afterDraw;
    const templateId = picked[0];
    if (!templateId) break;
    st = placeEventTemplateOnSlot(st, slot, templateId);
  }
  return st;
}

function runEventPhase(state: GameState): GameState {
  let s = applyScheduledTransforms(state);
  s = clearResolvedSlots(s);
  s = applyScriptedCalendarPhase(s);
  s = fillEmptySlots(s);
  s = maybeAddEuropeAlertSupplementalEvent(s);
  s = maybeAddReligiousTensionEvent(s);
  return s;
}

export function maybeAddEuropeAlertSupplementalEvent(state: GameState): GameState {
  if (!state.europeAlert || state.levelId !== "secondMandate") return state;
  const target = EVENT_SLOT_ORDER.find((slot) => !state.slots[slot]);
  if (!target) return state;
  let s = state;
  const [rngRoll, uRoll] = rngNext(s.rng);
  s = { ...s, rng: rngRoll };
  if (uRoll >= PROB_EUROPE_ALERT_SUPPLEMENTAL_EVENT) return s;
  const [rngPick, uPick] = rngNext(s.rng);
  s = { ...s, rng: rngPick };
  const templateId = EUROPE_ALERT_SUPPLEMENTAL_POOL[uPick < 0.5 ? 0 : 1];
  const instance: EventInstance = {
    instanceId: `evt_${s.nextIds.event}`,
    templateId,
    resolved: false,
  };
  return {
    ...s,
    nextIds: { ...s.nextIds, event: s.nextIds.event + 1 },
    slots: { ...s.slots, [target]: instance },
  };
}

function sumDrawAttemptsStatusDelta(statuses: readonly PlayerStatusInstance[]): number {
  let sum = 0;
  for (const p of statuses) {
    if (p.kind === "drawAttemptsDelta") sum += p.delta ?? 0;
  }
  return sum;
}

function applyBeginYearResourceStatusEffects(state: GameState): GameState {
  let s = state;
  for (const p of s.playerStatuses) {
    if (p.kind !== "beginYearResourceDelta" || !p.resource) continue;
    const delta = p.delta ?? 0;
    if (delta === 0) continue;
    const next = s.resources[p.resource] + delta;
    s = {
      ...s,
      resources: {
        ...s.resources,
        [p.resource]: p.resource === "legitimacy" ? next : Math.max(0, next),
      },
    };
  }
  return s;
}

export function retentionCapacity(state: GameState): number {
  let bonus = 0;
  for (const p of state.playerStatuses) {
    if (p.kind === "retentionCapacityDelta") bonus += p.delta ?? 0;
  }
  return Math.max(0, state.resources.legitimacy + bonus);
}

function tickPlayerStatusesAfterDraw(statuses: readonly PlayerStatusInstance[]): PlayerStatusInstance[] {
  return statuses
    .map((p) => {
      if (p.templateId === "religiousTolerance" || p.templateId === "huguenotContainment") return p;
      return { ...p, turnsRemaining: p.turnsRemaining - 1 };
    })
    .filter((p) => p.turnsRemaining > 0);
}

/** Start-of-year pipeline: Income → Draw → Event roll (transforms, clear, fill). */
export function beginYear(state: GameState): GameState {
  if (state.outcome !== "playing") return state;
  let s: GameState = { ...state, pendingInteraction: null };
  let league = s.antiFrenchLeague;
  if (league && s.turn > league.untilTurn) {
    league = null;
  }
  s = { ...s, antiFrenchLeague: league };
  s = applyBeginYearResourceStatusEffects(s);
  s = {
    ...s,
    resources: {
      ...s.resources,
      funding: s.resources.funding + s.resources.treasuryStat,
    },
  };
  const scheduledDrawModifier = s.scheduledDrawModifiers[0] ?? 0;
  s = { ...s, scheduledDrawModifiers: s.scheduledDrawModifiers.slice(1) };
  const statusDrawDelta = sumDrawAttemptsStatusDelta(s.playerStatuses);
  const baseAttempts = drawAttemptsFromPower(s.resources.power);
  let attempts = Math.max(1, baseAttempts + s.nextTurnDrawModifier + scheduledDrawModifier + statusDrawDelta);
  const coalition = rollAntiFrenchLeagueDrawAdjustment(s.antiFrenchLeague, s.turn, s.rng);
  s = { ...s, rng: coalition.rng };
  if (coalition.adjustment < 0 && s.antiFrenchLeague && s.turn <= s.antiFrenchLeague.untilTurn) {
    const probabilityPct = Math.round(s.antiFrenchLeague.drawPenaltyProbability * 100);
    s = appendActionLog(s, { kind: "antiFrenchLeagueDraw", probabilityPct });
  }
  attempts = Math.max(1, attempts + coalition.adjustment);
  s = { ...s, nextTurnDrawModifier: 0 };
  const drawn = drawUpToPower(s.rng, s.hand, s.deck, s.discard, attempts);
  s = {
    ...s,
    rng: drawn.rng,
    hand: drawn.hand,
    deck: drawn.deck,
    discard: drawn.discard,
  };
  s = applyInflationFromDeckRefill(s, drawn.refilledCardIds);
  if (drawn.drawnCardIds.length > 0) {
    const drawnTemplateIds = drawn.drawnCardIds
      .map((id) => s.cardsById[id]?.templateId)
      .filter((id): id is CardTemplateId => Boolean(id));
    s = appendActionLog(s, {
      kind: "drawCards",
      cardTemplateIds: drawnTemplateIds,
    });
  }
  if (drawn.discardedCardIds.length > 0) {
    const discardedTemplateIds = drawn.discardedCardIds
      .map((id) => s.cardsById[id]?.templateId)
      .filter((id): id is CardTemplateId => Boolean(id));
    s = appendActionLog(s, {
      kind: "drawOverflowDiscarded",
      cardTemplateIds: discardedTemplateIds,
    });
  }
  for (const cardId of drawn.drawnCardIds) {
    s = applyOnDrawCardEffects(s, cardId);
  }
  s = { ...s, playerStatuses: tickPlayerStatusesAfterDraw(s.playerStatuses) };
  s = runEventPhase(s);
  return { ...s, phase: "action" };
}

export function evaluateVictory(state: GameState): GameState {
  const t = getLevelDef(state.levelId).winTargets;
  const { treasuryStat, power, legitimacy } = state.resources;
  const currentYear = state.calendarStartYear + state.turn - 1;
  const reachedSecondMandateVictoryYear =
    state.levelId !== "secondMandate" || currentYear >= SECOND_MANDATE_EARLIEST_VICTORY_YEAR;
  const chapterObjectiveSatisfied =
    state.levelId !== "secondMandate" ||
    (!state.europeAlert &&
      state.nymwegenSettlementAchieved &&
      !state.playerStatuses.some((s) => s.templateId === "huguenotContainment"));
  if (
    treasuryStat >= t.treasuryStat &&
    power >= t.power &&
    legitimacy >= t.legitimacy &&
    reachedSecondMandateVictoryYear &&
    chapterObjectiveSatisfied
  ) {
    return { ...state, phase: "gameOver", outcome: "victory" };
  }
  return state;
}

export function evaluateTimeDefeat(state: GameState): GameState {
  if (state.outcome !== "playing") return state;
  if (state.turn === getLevelDef(state.levelId).turnLimit) {
    return { ...state, phase: "gameOver", outcome: "defeatTime" };
  }
  return state;
}
export function maybeAddReligiousTensionEvent(state: GameState): GameState {
  if (!state.playerStatuses.some((s) => s.templateId === "religiousTolerance")) return state;
  const alreadyOnBoard = EVENT_SLOT_ORDER.some((slot) => state.slots[slot]?.templateId === "religiousTension");
  if (alreadyOnBoard) return state;
  const target = EVENT_SLOT_ORDER.find((slot) => !state.slots[slot]);
  if (!target) return state;
  let s = state;
  const [rngRoll, uRoll] = rngNext(s.rng);
  s = { ...s, rng: rngRoll };
  if (uRoll >= RELIGIOUS_TENSION_TRIGGER_PROBABILITY) return s;
  const instance: EventInstance = {
    instanceId: `evt_${s.nextIds.event}`,
    templateId: "religiousTension",
    resolved: false,
  };
  return {
    ...s,
    nextIds: { ...s.nextIds, event: s.nextIds.event + 1 },
    slots: { ...s.slots, [target]: instance },
  };
}

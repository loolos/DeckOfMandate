import { getEventRollWeight } from "../data/events";
import { getLevelContent } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
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
import { drawUpToPower } from "./draw";
import { applyScriptedCalendarPhase, rollAntiFrenchLeagueDrawAdjustment } from "./scriptedCalendar";
import { pickWeightedIndex, rngNext } from "./rng";

/** First calendar turn on which a full empty-board roll may produce three events (turns 1–5 never triple). */
export const FIRST_TURN_ELIGIBLE_FOR_TRIPLE_EVENTS = 6;

/** When every event slot is empty, P(three new events) for turn >= {@link FIRST_TURN_ELIGIBLE_FOR_TRIPLE_EVENTS}. */
export const PROB_TRIPLE_EVENTS = 0.1;

/** When every event slot is empty, P(only slot A is filled); remaining probability is two events (A+B). */
export const PROB_SINGLE_EVENT_WHEN_ALL_EMPTY = 0.3;

export function rollNewEventForSlot(state: GameState, slot: SlotId): GameState {
  const pool = getLevelContent(state.levelId).rollableEventIds;
  const weights = pool.map((id) => getEventRollWeight(state, id));
  const [rng, idx] = pickWeightedIndex(state.rng, weights);
  const templateId = pool[idx]!;
  const instance: EventInstance = {
    instanceId: `evt_${state.nextIds.event}`,
    templateId,
    resolved: false,
  };
  return {
    ...state,
    rng,
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

function fillEmptySlots(state: GameState): GameState {
  let st = state;
  if (allSlotsEmpty(st)) {
    const [rng, u] = rngNext(st.rng);
    st = { ...st, rng };
    if (st.turn < FIRST_TURN_ELIGIBLE_FOR_TRIPLE_EVENTS) {
      if (u < PROB_SINGLE_EVENT_WHEN_ALL_EMPTY) return rollNewEventForSlot(st, "A");
      st = rollNewEventForSlot(st, "A");
      return rollNewEventForSlot(st, "B");
    }
    if (u < PROB_TRIPLE_EVENTS) {
      st = rollNewEventForSlot(st, "A");
      st = rollNewEventForSlot(st, "B");
      return rollNewEventForSlot(st, "C");
    }
    if (u < PROB_TRIPLE_EVENTS + PROB_SINGLE_EVENT_WHEN_ALL_EMPTY) return rollNewEventForSlot(st, "A");
    st = rollNewEventForSlot(st, "A");
    return rollNewEventForSlot(st, "B");
  }
  for (const slot of PROCEDURAL_EVENT_SLOT_ORDER) {
    if (!st.slots[slot]) st = rollNewEventForSlot(st, slot);
  }
  return st;
}

function runEventPhase(state: GameState): GameState {
  let s = applyScheduledTransforms(state);
  s = clearResolvedSlots(s);
  s = applyScriptedCalendarPhase(s);
  s = fillEmptySlots(s);
  return s;
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
    .map((p) => ({ ...p, turnsRemaining: p.turnsRemaining - 1 }))
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
  const statusDrawDelta = sumDrawAttemptsStatusDelta(s.playerStatuses);
  const europeAlertPenalty = s.europeAlert ? Math.max(0, s.europeAlertDrawPenalty) : 0;
  let attempts = Math.max(1, s.resources.power + s.nextTurnDrawModifier + statusDrawDelta - europeAlertPenalty);
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
  if (
    treasuryStat >= t.treasuryStat &&
    power >= t.power &&
    legitimacy >= t.legitimacy
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

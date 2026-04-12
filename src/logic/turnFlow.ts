import { getEventTemplate, rollableEventIds } from "../data/events";
import { getLevelDef } from "../data/levels";
import type { EventInstance, SlotId } from "../types/event";
import type { GameState } from "../types/game";
import { drawUpToPower } from "./draw";
import { pickWeightedIndex } from "./rng";

const SLOTS: SlotId[] = ["A", "B"];

export function rollNewEventForSlot(state: GameState, slot: SlotId): GameState {
  const weights = rollableEventIds.map((id) => getEventTemplate(id).weight);
  const [rng, idx] = pickWeightedIndex(state.rng, weights);
  const templateId = rollableEventIds[idx]!;
  const instance: EventInstance = {
    instanceId: `evt_${state.nextIds.event}`,
    templateId,
    resolved: false,
  };
  return {
    ...state,
    rng,
    nextIds: { event: state.nextIds.event + 1 },
    slots: { ...state.slots, [slot]: instance },
  };
}

function applyScheduledTransforms(state: GameState): GameState {
  let st = state;
  for (const slot of SLOTS) {
    const ev = st.slots[slot];
    if (
      st.pendingMajorCrisis[slot] &&
      ev &&
      !ev.resolved &&
      ev.templateId === "powerVacuum"
    ) {
      const instance: EventInstance = {
        instanceId: `evt_${st.nextIds.event}`,
        templateId: "majorCrisis",
        resolved: false,
      };
      st = {
        ...st,
        nextIds: { event: st.nextIds.event + 1 },
        slots: { ...st.slots, [slot]: instance },
        pendingMajorCrisis: { ...st.pendingMajorCrisis, [slot]: false },
      };
    }
  }
  return st;
}

function clearResolvedSlots(state: GameState): GameState {
  const slots = { ...state.slots };
  for (const slot of SLOTS) {
    const ev = slots[slot];
    if (ev?.resolved) slots[slot] = null;
  }
  return { ...state, slots };
}

function fillEmptySlots(state: GameState): GameState {
  let st = state;
  for (const slot of SLOTS) {
    if (!st.slots[slot]) st = rollNewEventForSlot(st, slot);
  }
  return st;
}

function runEventPhase(state: GameState): GameState {
  let s = applyScheduledTransforms(state);
  s = clearResolvedSlots(s);
  s = fillEmptySlots(s);
  return s;
}

/** Start-of-year pipeline: Income → Draw → Event roll (transforms, clear, fill). */
export function beginYear(state: GameState): GameState {
  if (state.outcome !== "playing") return state;
  let s: GameState = { ...state, pendingInteraction: null };
  s = {
    ...s,
    resources: {
      ...s.resources,
      funding: s.resources.funding + s.resources.treasuryStat,
    },
  };
  const attempts = Math.max(1, s.resources.power + s.nextTurnDrawModifier);
  s = { ...s, nextTurnDrawModifier: 0 };
  const drawn = drawUpToPower(s.rng, s.hand, s.deck, s.discard, attempts);
  s = { ...s, rng: drawn.rng, hand: drawn.hand, deck: drawn.deck, discard: drawn.discard };
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

import { getEventTemplate } from "../data/events";
import type { SlotId } from "../levels/types/event";
import type { GameState } from "../types/game";

export function markSlotResolved(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev) return state;
  return {
    ...state,
    slots: { ...state.slots, [slot]: { ...ev, resolved: true } },
  };
}

export function markSlotResolvedWithLeagueProgress(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev) return state;
  if (ev.templateId !== "leagueOfAugsburg") return markSlotResolved(state, slot);
  const totalNeeded = getEventTemplate("leagueOfAugsburg").continuedDurationTurns ?? 3;
  const remainingAfterSolve = Math.max(0, (ev.remainingTurns ?? totalNeeded) - 1);
  return {
    ...state,
    slots: {
      ...state.slots,
      [slot]: { ...ev, resolved: true, remainingTurns: remainingAfterSolve },
    },
  };
}

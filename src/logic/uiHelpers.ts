import { getEventTemplate } from "../data/events";
import type { SlotId } from "../types/event";
import type { GameState } from "../types/game";

export function slotAllowsFundSolve(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action" || state.pendingInteraction) return false;
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind === "crackdownOnly") return false;
  if (tmpl.solve.kind === "funding") {
    return state.resources.funding >= tmpl.solve.amount;
  }
  if (tmpl.solve.kind === "fundingOrCrackdown") {
    return state.resources.funding >= tmpl.solve.amount;
  }
  return false;
}

export function slotAllowsCrackdownTarget(state: GameState, slot: SlotId): boolean {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  return getEventTemplate(ev.templateId).harmful;
}

export function fundSolveLabelAmount(state: GameState, slot: SlotId): number | null {
  const ev = state.slots[slot];
  if (!ev) return null;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind === "funding") return tmpl.solve.amount;
  if (tmpl.solve.kind === "fundingOrCrackdown") return tmpl.solve.amount;
  return null;
}

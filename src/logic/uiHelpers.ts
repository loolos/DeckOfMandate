import { getEventTemplate } from "../data/events";
import { findScriptedCalendarConfig } from "./scriptedCalendar";
import type { SlotId } from "../types/event";
import type { GameState } from "../types/game";

/** Funding path is affordable (ignores pending UI like Crackdown target pick). */
export function slotFundSolveAffordable(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action") return false;
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

/** True when the player may execute a funding solve (not during Crackdown target selection). */
export function slotAllowsFundSolve(state: GameState, slot: SlotId): boolean {
  if (state.pendingInteraction) return false;
  return slotFundSolveAffordable(state, slot);
}

export function slotScriptedAttackAffordable(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action") return false;
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind !== "scriptedAttack") return false;
  const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
  if (!cfg) return false;
  return state.resources.funding >= cfg.attack.fundingCost;
}

export function slotAllowsScriptedAttack(state: GameState, slot: SlotId): boolean {
  if (state.pendingInteraction) return false;
  return slotScriptedAttackAffordable(state, slot);
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
  if (tmpl.solve.kind === "scriptedAttack") {
    const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
    return cfg?.attack.fundingCost ?? null;
  }
  return null;
}

import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { antiFrenchSentimentEventSolveCostPenalty } from "./antiFrenchSentiment";
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
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    return amount !== null && state.resources.funding >= amount;
  }
  if (tmpl.solve.kind === "fundingOrCrackdown") {
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    return amount !== null && state.resources.funding >= amount;
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
  if (!cfg?.attack) return false;
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
  if (tmpl.solve.kind === "funding") return getEventSolveFundingAmount(state, ev.templateId);
  if (tmpl.solve.kind === "fundingOrCrackdown") return getEventSolveFundingAmount(state, ev.templateId);
  if (tmpl.solve.kind === "scriptedAttack") {
    const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
    return cfg?.attack?.fundingCost ?? null;
  }
  if (tmpl.solve.kind === "localWarChoice") {
    return Math.floor(state.europeAlertProgress / 2) + antiFrenchSentimentEventSolveCostPenalty(state);
  }
  return null;
}

import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { antiFrenchSentimentEventSolveCostPenalty } from "./antiFrenchSentiment";
import { findScriptedCalendarConfig } from "./scriptedCalendar";
import { getPlayableCardCost } from "./cardCost";
import { isCardPlayableInActionPhase } from "./cardPlayability";
import type { SlotId } from "../levels/types/event";
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
  if (tmpl.solve.kind === "fundingTreasuryQuarterCeil") {
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
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.crackdownImmune) return false;
  return tmpl.harmful;
}

export function fundSolveLabelAmount(state: GameState, slot: SlotId): number | null {
  const ev = state.slots[slot];
  if (!ev) return null;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind === "funding") return getEventSolveFundingAmount(state, ev.templateId);
  if (tmpl.solve.kind === "fundingOrCrackdown") return getEventSolveFundingAmount(state, ev.templateId);
  if (tmpl.solve.kind === "fundingTreasuryQuarterCeil") return getEventSolveFundingAmount(state, ev.templateId);
  if (tmpl.solve.kind === "scriptedAttack") {
    const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
    return cfg?.attack?.fundingCost ?? null;
  }
  if (tmpl.solve.kind === "localWarChoice") {
    return Math.floor(state.europeAlertProgress / 2) + antiFrenchSentimentEventSolveCostPenalty(state);
  }
  return null;
}

function hasPlayableCrackdownCard(state: GameState): boolean {
  if (state.phase !== "action" || state.outcome !== "playing" || state.pendingInteraction) return false;
  for (const cardInstanceId of state.hand) {
    const inst = state.cardsById[cardInstanceId];
    if (!inst) continue;
    if (inst.templateId !== "crackdown" && inst.templateId !== "diplomaticIntervention") continue;
    if (!isCardPlayableInActionPhase(state, cardInstanceId)) continue;
    if (state.resources.funding < getPlayableCardCost(state, cardInstanceId)) continue;
    return true;
  }
  return false;
}

/** True when this event can be solved by paying Funding at some point (amount known), including when current Funding is short. */
function hasFundingSolvePath(state: GameState, slot: SlotId): boolean {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown" && tmpl.solve.kind !== "fundingTreasuryQuarterCeil") {
    return false;
  }
  return getEventSolveFundingAmount(state, ev.templateId) !== null;
}

/** True when a scripted-calendar attack solve exists for this slot, including when current Funding is short of the attack cost. */
function hasScriptedAttackSolvePath(state: GameState, slot: SlotId): boolean {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind !== "scriptedAttack") return false;
  const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
  return !!cfg?.attack;
}

function hasFurtherFeasibleEventAction(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action" || state.outcome !== "playing") return false;
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  if (state.pendingInteraction?.type === "crackdownPick") {
    return slotAllowsCrackdownTarget(state, slot);
  }
  const tmpl = getEventTemplate(ev.templateId);
  if (
    tmpl.solve.kind === "nantesPolicyChoice" ||
    tmpl.solve.kind === "localWarChoice" ||
    tmpl.solve.kind === "successionCrisisChoice" ||
    tmpl.solve.kind === "utrechtTreatyChoice" ||
    tmpl.solve.kind === "dualFrontCrisisChoice"
  ) {
    return true;
  }
  if (hasFundingSolvePath(state, slot) || hasScriptedAttackSolvePath(state, slot)) return true;
  if (!slotAllowsCrackdownTarget(state, slot)) return false;
  return hasPlayableCrackdownCard(state);
}

/**
 * True when this turn's event is already handled or currently has no feasible next action.
 */
export function slotIsHandledOrNoFurtherAction(state: GameState, slot: SlotId): boolean {
  const ev = state.slots[slot];
  if (!ev) return false;
  if (ev.resolved) return true;
  return !hasFurtherFeasibleEventAction(state, slot);
}

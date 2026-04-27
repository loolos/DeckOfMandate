import { getEventSolveFundingAmount, getEventTemplate } from "../../../data/events";
import { appendActionLog } from "../../../logic/actionLog";
import { applyEffects, enforceLegitimacy } from "../../../logic/applyEffects";
import { appendInflationActivationLogIfNeeded } from "../../../logic/cardCost";
import { markSlotResolvedWithLeagueProgress } from "../../../logic/eventSlotOps";
import { opponentImmediateExtraDraw } from "../../../logic/opponentHabsburg";
import { rngNext } from "../../../logic/rng";
import type { GameState } from "../../../types/game";
import type { EventTemplate } from "../../types/event";
import { EVENT_SLOT_ORDER, type EventTemplateId, type SlotId } from "../../types/event";

function markSlotResolvedWithNineYearsWarPersistence(
  state: GameState,
  slot: SlotId,
  keepOnBoard: boolean,
): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.templateId !== "nineYearsWar") return state;
  return {
    ...state,
    slots: {
      ...state.slots,
      [slot]: { ...ev, resolved: true, remainingTurns: keepOnBoard ? undefined : 0 },
    },
  };
}

function removeEventsByTemplate(
  state: GameState,
  templateId: EventTemplateId,
): { state: GameState; removedCount: number } {
  const slots = { ...state.slots };
  let removedCount = 0;
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = slots[slot];
    if (!ev) continue;
    if (ev.templateId !== templateId) continue;
    slots[slot] = null;
    removedCount += 1;
  }
  return {
    state: removedCount > 0 ? { ...state, slots } : state,
    removedCount,
  };
}

function isFundingSolveKind(kind: EventTemplate["solve"]["kind"]): boolean {
  return kind === "funding" || kind === "fundingTreasuryQuarterCeil" || kind === "fundingOrCrackdown";
}

function stateAfterFundingPaid(state: GameState, fundingPaid: number): GameState {
  return {
    ...state,
    resources: { ...state.resources, funding: state.resources.funding - fundingPaid },
  };
}

/** Crackdown path or funding solve for `nineYearsWar`. */
export function attemptNineYearsWarCampaign(
  state: GameState,
  slot: SlotId,
  method: "funding" | "intervention",
  fundingPaid: number,
): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "nineYearsWar") return state;
  const [rng, u] = rngNext(state.rng);
  const roll = Math.floor(u * 9) + 1;
  let s: GameState = { ...state, rng };
  if (roll === 1) {
    s = { ...s, slots: { ...s.slots, [slot]: null } };
    s = applyEffects(s, [
      { kind: "modResource", resource: "legitimacy", delta: 1 },
      { kind: "gainFunding", amount: 3 },
    ]);
    s = appendActionLog(s, {
      kind: "eventNineYearsWarAttempt",
      slot,
      method,
      fundingPaid,
      roll,
      outcome: "majorVictory",
    });
    return enforceLegitimacy(s);
  }
  if (roll >= 6) {
    s = applyEffects(s, [{ kind: "modResource", resource: "legitimacy", delta: 1 }]);
  }
  s = markSlotResolvedWithNineYearsWarPersistence(s, slot, true);
  s = appendActionLog(s, {
    kind: "eventNineYearsWarAttempt",
    slot,
    method,
    fundingPaid,
    roll,
    outcome: roll <= 5 ? "stalemate" : "minorGains",
  });
  return enforceLegitimacy(s);
}

/** Sun King funding / treasury-quarter / funding-or-crackdown event resolution (engine dispatch). */
export function performFundSolve(preSolveState: GameState, slot: SlotId): GameState {
  const ev = preSolveState.slots[slot];
  if (!ev || ev.resolved) return preSolveState;
  const tmpl = getEventTemplate(ev.templateId);
  if (!isFundingSolveKind(tmpl.solve.kind)) {
    return preSolveState;
  }
  const fundingAmount = getEventSolveFundingAmount(preSolveState, ev.templateId);
  if (fundingAmount === null) return preSolveState;
  const fundingPaid = fundingAmount;
  let s = stateAfterFundingPaid(preSolveState, fundingPaid);
  if (ev.templateId === "nineYearsWar") {
    return attemptNineYearsWarCampaign(s, slot, "funding", fundingPaid);
  }
  if (ev.templateId === "localizedSuccessionWar") {
    const [rng, roll] = rngNext(s.rng);
    s = { ...s, rng };
    const deltas = [-1, 0, 1, 2] as const;
    const idx = Math.min(3, Math.floor(roll * 4));
    const successionDelta = deltas[idx]!;
    s = applyEffects(s, [{ kind: "modSuccessionTrack", delta: successionDelta }]);
    if (s.outcome !== "playing") return appendInflationActivationLogIfNeeded(preSolveState, s);
    s = enforceLegitimacy(s);
    if (s.outcome !== "playing") return appendInflationActivationLogIfNeeded(preSolveState, s);
    s = markSlotResolvedWithLeagueProgress(s, slot);
    s = appendActionLog(s, {
      kind: "eventLocalizedSuccessionWarResolve",
      slot,
      fundingPaid,
      successionDelta,
    });
    return appendInflationActivationLogIfNeeded(preSolveState, s);
  }
  let treasuryGain = 0;
  if (tmpl.onFundSolveEffects && tmpl.onFundSolveEffects.length > 0) {
    for (const effect of tmpl.onFundSolveEffects) {
      if (effect.kind === "modResource" && effect.resource === "treasuryStat" && effect.delta > 0) {
        treasuryGain += effect.delta;
      }
    }
    s = applyEffects(s, tmpl.onFundSolveEffects);
  }
  if (
    (ev.templateId === "bavarianCourtRealignment" || ev.templateId === "imperialElectorsMood") &&
    s.outcome === "playing"
  ) {
    s = opponentImmediateExtraDraw(s, 1);
  }
  if (ev.templateId === "nymwegenSettlement") {
    s = {
      ...s,
      nymwegenSettlementAchieved: true,
    };
  }
  if (ev.templateId === "ryswickPeace") {
    s = {
      ...s,
      europeAlert: false,
      europeAlertProgress: 0,
    };
    const removed = removeEventsByTemplate(s, "nineYearsWar");
    s = removed.state;
    if (removed.removedCount > 0) {
      s = appendActionLog(s, { kind: "eventNineYearsWarEndedByRyswick", removedCount: removed.removedCount });
    }
  }
  s = markSlotResolvedWithLeagueProgress(s, slot);
  s = enforceLegitimacy(s);
  s = appendActionLog(s, {
    kind: "eventFundSolved",
    slot,
    templateId: ev.templateId,
    fundingPaid,
    treasuryGain,
  });
  return s;
}

/**
 * Sun King reducer-action handlers that used to live inline in the engine reducer:
 * funding solves, scripted attacks, and the Crackdown target/cancel flow.
 * Wired into `campaignReducerBridgeImpl`.
 */
import {
  consumeLimitedUseCard,
  isPlayingActionPhaseWithoutPendingInteraction,
  pushDiscard,
  removeHand,
} from "../../../app/reducerShared";
import { getTurnLimitForRun } from "../../../data/levels";
import { markSlotResolved } from "../../../logic/eventSlotOps";
import { rngNext } from "../../../logic/rng";
import type { GameState } from "../../../types/game";
import type { SlotId } from "../../types/event";
import { appendActionLog } from "./actionLog";
import { enforceLegitimacy } from "./applyEffects";
import { appendInflationActivationLogIfNeeded } from "./cardCost";
import { stateAfterHarmfulEventCrackdown } from "./crackdownHarmfulSolve";
import { getEventSolveFundingAmount, getEventTemplate } from "./eventTemplateApi";
import { performFundSolve } from "./fundSolve";
import { applyScriptedAttackCampaignFlags } from "./scriptedAttackFollowup";
import { coalitionUntilTurn, findScriptedCalendarConfig } from "./scriptedCalendar";

function isCrackdownTarget(state: GameState, slot: SlotId): boolean {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.crackdownImmune) return false;
  return tmpl.harmful;
}

function canFundSolve(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action") return false;
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind === "crackdownOnly") return false;
  if (tmpl.solve.kind === "nantesPolicyChoice") return false;
  if (tmpl.solve.kind === "funding") {
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    return amount !== null && state.resources.funding >= amount;
  }
  if (tmpl.solve.kind === "fundingTreasuryQuarterCeil") {
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    return amount !== null && state.resources.funding >= amount;
  }
  if (tmpl.solve.kind === "fundingOrCrackdown") {
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    return amount !== null && state.resources.funding >= amount;
  }
  return false;
}

function canScriptedAttack(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action" || state.pendingInteraction?.type === "crackdownPick") return false;
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind !== "scriptedAttack") return false;
  const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
  if (!cfg?.attack) return false;
  return state.resources.funding >= cfg.attack.fundingCost;
}

function performScriptedAttack(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return state;
  const tmpl = getEventTemplate(ev.templateId);
  if (tmpl.solve.kind !== "scriptedAttack") return state;
  const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
  if (!cfg?.attack || !cfg.antiCoalition) return state;
  const cost = cfg.attack.fundingCost;
  if (state.resources.funding < cost) return state;

  let s: GameState = {
    ...state,
    resources: {
      ...state.resources,
      funding: state.resources.funding - cost,
      power: state.resources.power + cfg.attack.powerDelta,
    },
  };

  let treasuryGain = 0;
  const [rng1, u] = rngNext(s.rng);
  s = { ...s, rng: rng1 };
  if (u < cfg.attack.extraTreasuryProbability) {
    treasuryGain = cfg.attack.extraTreasuryDelta;
    s = {
      ...s,
      resources: {
        ...s.resources,
        treasuryStat: s.resources.treasuryStat + treasuryGain,
      },
    };
  }

  const turnLimit = getTurnLimitForRun(s.levelId, s.calendarStartYear);
  const untilTurn = coalitionUntilTurn(s.turn, cfg, turnLimit);
  s = {
    ...s,
    antiFrenchLeague: {
      untilTurn,
      drawPenaltyProbability: cfg.antiCoalition.drawPenaltyProbability,
      drawPenaltyDelta: cfg.antiCoalition.drawPenaltyDelta,
    },
  };

  s = markSlotResolved(s, slot);
  s = applyScriptedAttackCampaignFlags(s, ev.templateId);
  s = enforceLegitimacy(s);
  s = appendActionLog(s, {
    kind: "eventScriptedAttack",
    slot,
    templateId: ev.templateId,
    fundingPaid: cost,
    treasuryGain,
    powerDelta: cfg.attack.powerDelta,
    extraTreasuryProbabilityPct: Math.round(cfg.attack.extraTreasuryProbability * 100),
  });
  return s;
}

export function handleSolveEventAction(state: GameState, slot: SlotId): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
    return state;
  }
  if (!canFundSolve(state, slot)) return state;
  return appendInflationActivationLogIfNeeded(state, performFundSolve(state, slot));
}

export function handleScriptedEventAttackAction(state: GameState, slot: SlotId): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
    return state;
  }
  if (!canScriptedAttack(state, slot)) return state;
  return appendInflationActivationLogIfNeeded(state, performScriptedAttack(state, slot));
}

export function handleCrackdownTargetAction(state: GameState, slot: SlotId): GameState {
  const p = state.pendingInteraction;
  if (!p || p.type !== "crackdownPick") return state;
  if (!isCrackdownTarget(state, slot)) return state;
  const cleared = state.slots[slot];
  if (!cleared) return state;
  let s = stateAfterHarmfulEventCrackdown(state, slot, cleared.templateId, p.fundingPaid);
  s = removeHand(s, p.cardInstanceId);
  const consumed = consumeLimitedUseCard(s, p.cardInstanceId);
  s = consumed.state;
  if (!consumed.exhausted) {
    s = pushDiscard(s, p.cardInstanceId);
  }
  s = { ...s, pendingInteraction: null };
  s = enforceLegitimacy(s);
  s = appendActionLog(s, {
    kind: "eventCrackdownSolved",
    slot,
    harmfulEventTemplateId: cleared.templateId,
    fundingPaid: p.fundingPaid,
  });
  return appendInflationActivationLogIfNeeded(state, s);
}

export function handleCrackdownCancelAction(state: GameState): GameState {
  const p = state.pendingInteraction;
  if (!p || p.type !== "crackdownPick") return state;
  return appendInflationActivationLogIfNeeded(
    state,
    appendActionLog(
      {
        ...state,
        resources: { ...state.resources, funding: state.resources.funding + p.fundingPaid },
        pendingInteraction: null,
      },
      { kind: "crackdownCancelled", refund: p.fundingPaid },
    ),
  );
}

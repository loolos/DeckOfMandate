import { getCardTemplate } from "../data/cards";
import { getEventTemplate } from "../data/events";
import type { LevelId } from "../data/levels";
import { appendActionLog } from "../logic/actionLog";
import { enforceLegitimacy } from "../logic/applyEffects";
import { normalizeGameState } from "../logic/normalizeGameState";
import { applyPlayedCardEffects } from "../logic/resolveCard";
import { resolveEndOfYearPenalties } from "../logic/resolveEvents";
import { beginYear, evaluateTimeDefeat, evaluateVictory } from "../logic/turnFlow";
import type { SlotId } from "../types/event";
import type { GameState } from "../types/game";
import { createInitialState } from "./initialState";

export type GameAction =
  | { type: "NEW_GAME"; seed?: number; levelId?: LevelId }
  | { type: "HYDRATE"; state: GameState }
  | { type: "PLAY_CARD"; handIndex: number }
  | { type: "END_YEAR" }
  | { type: "SOLVE_EVENT"; slot: SlotId }
  | { type: "CRACKDOWN_TARGET"; slot: SlotId }
  | { type: "CRACKDOWN_CANCEL" }
  | { type: "CONFIRM_RETENTION"; keepIds: readonly string[] };

function removeHand(state: GameState, instanceId: string): GameState {
  return { ...state, hand: state.hand.filter((id) => id !== instanceId) };
}

function pushDiscard(state: GameState, instanceId: string): GameState {
  return { ...state, discard: [...state.discard, instanceId] };
}

function markSlotResolved(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev) return state;
  return {
    ...state,
    slots: { ...state.slots, [slot]: { ...ev, resolved: true } },
  };
}

function isCrackdownTarget(state: GameState, slot: SlotId): boolean {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
  return tmpl.harmful;
}

function canFundSolve(state: GameState, slot: SlotId): boolean {
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

/** After funding is cleared: keep chosen cards, discard the rest, then EOY penalties, then win / time / next year. */
function completeYearAfterRetention(state: GameState, keepIds: readonly string[]): GameState {
  const keep = new Set(keepIds);
  const discardIds = state.hand.filter((id) => !keep.has(id));
  let s: GameState = {
    ...state,
    hand: [...keepIds],
    discard: [...state.discard, ...discardIds],
    phase: "action",
  };
  s = resolveEndOfYearPenalties(s);
  if (s.outcome !== "playing") return s;
  s = evaluateVictory(s);
  if (s.outcome === "victory") return s;
  s = evaluateTimeDefeat(s);
  if (s.outcome === "defeatTime") return s;
  s = { ...s, turn: s.turn + 1 };
  s = beginYear(s);
  return s;
}

function performFundSolve(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return state;
  const tmpl = getEventTemplate(ev.templateId);
  let s = state;
  if (tmpl.solve.kind === "funding") {
    s = {
      ...s,
      resources: { ...s.resources, funding: s.resources.funding - tmpl.solve.amount },
    };
  } else if (tmpl.solve.kind === "fundingOrCrackdown") {
    s = {
      ...s,
      resources: { ...s.resources, funding: s.resources.funding - tmpl.solve.amount },
    };
  } else {
    return state;
  }
  if (tmpl.id === "tradeOpportunity") {
    s = {
      ...s,
      resources: {
        ...s.resources,
        treasuryStat: s.resources.treasuryStat + 1,
      },
    };
  }
  s = markSlotResolved(s, slot);
  s = enforceLegitimacy(s);
  const fundingPaid =
    tmpl.solve.kind === "funding" || tmpl.solve.kind === "fundingOrCrackdown" ? tmpl.solve.amount : 0;
  const treasuryGain = tmpl.id === "tradeOpportunity" ? 1 : 0;
  s = appendActionLog(s, {
    kind: "eventFundSolved",
    slot,
    templateId: ev.templateId,
    fundingPaid,
    treasuryGain,
  });
  return s;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return normalizeGameState(action.state);
    case "NEW_GAME":
      return createInitialState(action.seed, action.levelId ?? state.levelId);
    case "PLAY_CARD": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
        return state;
      }
      const id = state.hand[action.handIndex];
      if (!id) return state;
      const inst = state.cardsById[id];
      if (!inst) return state;
      const tmpl = getCardTemplate(inst.templateId);
      if (state.resources.funding < tmpl.cost) return state;
      const paid = {
        ...state,
        resources: { ...state.resources, funding: state.resources.funding - tmpl.cost },
      };
      if (inst.templateId === "crackdown") {
        return appendActionLog(
          {
            ...paid,
            pendingInteraction: { type: "crackdownPick", cardInstanceId: id, fundingPaid: tmpl.cost },
          },
          { kind: "crackdownPickPrompt" },
        );
      }
      let s = applyPlayedCardEffects(paid, inst.templateId);
      s = removeHand(s, id);
      s = pushDiscard(s, id);
      s = enforceLegitimacy(s);
      s = appendActionLog(s, {
        kind: "cardPlayed",
        templateId: inst.templateId,
        fundingCost: tmpl.cost,
        effects: tmpl.effects,
      });
      return s;
    }
    case "SOLVE_EVENT": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
        return state;
      }
      if (!canFundSolve(state, action.slot)) return state;
      return performFundSolve(state, action.slot);
    }
    case "CRACKDOWN_TARGET": {
      const p = state.pendingInteraction;
      if (!p || p.type !== "crackdownPick") return state;
      if (!isCrackdownTarget(state, action.slot)) return state;
      const cleared = state.slots[action.slot];
      if (!cleared) return state;
      let s = markSlotResolved(state, action.slot);
      s = removeHand(s, p.cardInstanceId);
      s = pushDiscard(s, p.cardInstanceId);
      s = { ...s, pendingInteraction: null };
      s = enforceLegitimacy(s);
      s = appendActionLog(s, {
        kind: "eventCrackdownSolved",
        slot: action.slot,
        harmfulEventTemplateId: cleared.templateId,
        fundingPaid: p.fundingPaid,
      });
      return s;
    }
    case "CRACKDOWN_CANCEL": {
      const p = state.pendingInteraction;
      if (!p || p.type !== "crackdownPick") return state;
      return appendActionLog(
        {
          ...state,
          resources: { ...state.resources, funding: state.resources.funding + p.fundingPaid },
          pendingInteraction: null,
        },
        { kind: "crackdownCancelled", refund: p.fundingPaid },
      );
    }
    case "END_YEAR": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
        return state;
      }
      if (state.resources.legitimacy <= 0) {
        return { ...state, phase: "gameOver", outcome: "defeatLegitimacy" };
      }
      let s = { ...state, resources: { ...state.resources, funding: 0 } };
      s = evaluateVictory(s);
      if (s.outcome === "victory") return s;
      if (s.hand.length <= s.resources.legitimacy) {
        return completeYearAfterRetention(s, s.hand);
      }
      return { ...s, phase: "retention" };
    }
    case "CONFIRM_RETENTION": {
      if (state.outcome !== "playing" || state.phase !== "retention") return state;
      const keep = new Set(action.keepIds);
      if (keep.size !== action.keepIds.length) return state;
      for (const id of action.keepIds) {
        if (!state.hand.includes(id)) return state;
      }
      if (action.keepIds.length > state.resources.legitimacy) return state;
      return completeYearAfterRetention(state, action.keepIds);
    }
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

import { getCardTemplate } from "../data/cards";
import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { getChapter2StandaloneDraft } from "../data/levelBootstrap";
import { getTurnLimitForRun, type LevelId } from "../data/levels";
import { appendActionLog } from "../logic/actionLog";
import { applyEffects, enforceLegitimacy } from "../logic/applyEffects";
import { isCardPlayableInActionPhase } from "../logic/cardPlayability";
import { hasCardTag } from "../logic/cardTags";
import { enforceHuguenotContainmentInvariant } from "../logic/cardRuntime";
import { appendInflationActivationLogIfNeeded, getPlayableCardCost } from "../logic/cardCost";
import { limitedUseCardDepletionPenalty } from "../logic/limitedUseCardDepletion";
import { normalizeGameState } from "../logic/normalizeGameState";
import { applyPlayedCardEffects } from "../logic/resolveCard";
import { resolveEndOfYearPenalties } from "../logic/resolveEvents";
import { coalitionUntilTurn, findScriptedCalendarConfig } from "../logic/scriptedCalendar";
import { rngNext } from "../logic/rng";
import { opponentEndYearPlayPhase, opponentImmediateExtraDraw } from "../logic/opponentHabsburg";
import { beginYear, evaluateTimeDefeat, evaluateVictory, retentionCapacity } from "../logic/turnFlow";
import { markSlotResolved, markSlotResolvedWithLeagueProgress } from "../logic/eventSlotOps";
import { antiFrenchSentimentEventSolveCostPenalty } from "../logic/antiFrenchSentiment";
import type { SlotId } from "../levels/types/event";
import type { GameState } from "../types/game";
import type { LogInfoKey } from "../types/game";
import {
  applySunkingPlayCardExtras,
  attemptNineYearsWarCampaign,
  performFundSolve,
} from "../levels/campaignLogicBundle";
import { tryCampaignReducerBridge } from "../levels/campaignReducerBridge";
import { createInitialState } from "./initialState";
import { buildLevel2StateFromDraft } from "./levelTransitions";

export type GameAction =
  | { type: "NEW_GAME"; seed?: number; levelId?: LevelId }
  | { type: "HYDRATE"; state: GameState }
  | { type: "PLAY_CARD"; handIndex: number }
  | { type: "END_YEAR" }
  | { type: "SOLVE_EVENT"; slot: SlotId }
  | { type: "PICK_NANTES_TOLERANCE"; slot: SlotId }
  | { type: "PICK_NANTES_CRACKDOWN"; slot: SlotId }
  | { type: "PICK_LOCAL_WAR_ATTACK"; slot: SlotId }
  | { type: "PICK_LOCAL_WAR_APPEASE"; slot: SlotId }
  | { type: "SCRIPTED_EVENT_ATTACK"; slot: SlotId }
  | { type: "CRACKDOWN_TARGET"; slot: SlotId }
  | { type: "CRACKDOWN_CANCEL" }
  | { type: "APPEND_LOG_INFO"; infoKey: LogInfoKey }
  | { type: "CONFIRM_RETENTION"; keepIds: readonly string[] }
  | { type: "PICK_SUCCESSION_CRISIS"; slot: SlotId; pay: boolean }
  | { type: "PICK_UTRECHT_TREATY"; slot: SlotId; endWar: boolean }
  | { type: "PICK_DUAL_FRONT_CRISIS"; slot: SlotId; expandWar: boolean }
  | { type: "PICK_LOUIS_XIV_LEGACY"; slot: SlotId; directRule: boolean };

function removeHand(state: GameState, instanceId: string): GameState {
  return { ...state, hand: state.hand.filter((id) => id !== instanceId) };
}

function isTemporaryCardInstance(state: GameState, instanceId: string): boolean {
  return hasCardTag(state, instanceId, "temp");
}

function purgeExtraCardsIfLevelEnded(state: GameState): GameState {
  if (state.outcome === "playing") return state;
  const isExtraCardId = (id: string): boolean => {
    const inst = state.cardsById[id];
    if (!inst) return false;
    return getCardTemplate(inst.templateId).tags.includes("extra");
  };
  const nextCardsById = Object.fromEntries(
    Object.entries(state.cardsById).filter(([id]) => !isExtraCardId(id)),
  );
  const nextCardInflationById = Object.fromEntries(
    Object.entries(state.cardInflationById).filter(([id]) => !isExtraCardId(id)),
  );
  return {
    ...state,
    hand: state.hand.filter((id) => !isExtraCardId(id)),
    deck: state.deck.filter((id) => !isExtraCardId(id)),
    discard: state.discard.filter((id) => !isExtraCardId(id)),
    cardsById: nextCardsById,
    cardInflationById: nextCardInflationById,
  };
}

function pushDiscard(state: GameState, instanceId: string): GameState {
  if (isTemporaryCardInstance(state, instanceId)) return state;
  return { ...state, discard: [...state.discard, instanceId] };
}

function consumeLimitedUseCard(
  state: GameState,
  instanceId: string,
): { state: GameState; exhausted: boolean } {
  const usage = state.cardUsesById[instanceId];
  if (!usage) return { state, exhausted: false };
  const cardUsesById = { ...state.cardUsesById };
  const nextRemaining = Math.max(0, usage.remaining - 1);
  if (nextRemaining > 0) {
    cardUsesById[instanceId] = { ...usage, remaining: nextRemaining };
    return { state: { ...state, cardUsesById }, exhausted: false };
  }
  delete cardUsesById[instanceId];
  let s: GameState = { ...state, cardUsesById };
  const depleted = limitedUseCardDepletionPenalty(s, instanceId);
  s = depleted.state;
  if (depleted.infoKey) {
    s = appendActionLog(s, { kind: "info", infoKey: depleted.infoKey });
  }
  return { state: s, exhausted: true };
}

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

function canLocalWarAttack(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action" || state.pendingInteraction?.type === "crackdownPick") return false;
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "localWar") return false;
  const cost = Math.floor(state.europeAlertProgress / 2) + antiFrenchSentimentEventSolveCostPenalty(state);
  return state.resources.funding >= cost;
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
  if (ev.templateId === "warOfDevolution") {
    s = { ...s, warOfDevolutionAttacked: true };
  }
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

function performLocalWarAttack(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "localWar") return state;
  const cost = Math.floor(state.europeAlertProgress / 2) + antiFrenchSentimentEventSolveCostPenalty(state);
  if (state.resources.funding < cost) return state;
  let powerDelta = 0;
  let legitimacyDelta = 0;
  let s: GameState = {
    ...state,
    resources: {
      ...state.resources,
      funding: state.resources.funding - cost,
    },
  };
  const [rng, roll] = rngNext(s.rng);
  s = { ...s, rng };
  if (roll < 1 / 3) {
    powerDelta = 1;
    legitimacyDelta = 1;
    s = {
      ...s,
      resources: {
        ...s.resources,
        power: s.resources.power + 1,
        legitimacy: s.resources.legitimacy + 1,
      },
    };
  } else if (roll >= 2 / 3) {
    powerDelta = -1;
    s = {
      ...s,
      resources: {
        ...s.resources,
        power: Math.max(0, s.resources.power - 1),
      },
    };
  }
  s = markSlotResolved(s, slot);
  s = enforceLegitimacy(s);
  return appendActionLog(s, {
    kind: "eventLocalWarChoice",
    slot,
    templateId: "localWar",
    choice: "attack",
    fundingPaid: cost,
    powerDelta,
    legitimacyDelta,
  });
}

function performLocalWarAppease(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "localWar") return state;
  let s: GameState = applyEffects(state, [{ kind: "modResource", resource: "legitimacy", delta: -1 }]);
  s = markSlotResolved(s, slot);
  s = enforceLegitimacy(s);
  return appendActionLog(s, {
    kind: "eventLocalWarChoice",
    slot,
    templateId: "localWar",
    choice: "appease",
    fundingPaid: 0,
    powerDelta: 0,
    legitimacyDelta: -1,
  });
}

/** After funding is cleared: keep chosen cards, discard the rest, then EOY penalties, then win / time / next year. */
function completeYearAfterRetention(state: GameState, keepIds: readonly string[]): GameState {
  const retainedIds = keepIds.filter((id) => !isTemporaryCardInstance(state, id));
  const keep = new Set(retainedIds);
  const discardIds = state.hand.filter((id) => !keep.has(id) && !isTemporaryCardInstance(state, id));
  let s: GameState = {
    ...state,
    hand: [...retainedIds],
    discard: [...state.discard, ...discardIds],
    phase: "action",
  };
  if (s.playerStatuses.some((st) => st.templateId === "antiFrenchSentiment")) {
    s = applyEffects(s, [{ kind: "addCardsToDeck", templateId: "antiFrenchContainment", count: 1 }]);
  }
  s = resolveEndOfYearPenalties(s);
  if (s.outcome !== "playing") return purgeExtraCardsIfLevelEnded(s);
  s = opponentEndYearPlayPhase(s);
  if (s.outcome !== "playing") return purgeExtraCardsIfLevelEnded(s);
  s = evaluateVictory(s);
  if (s.outcome === "victory") return purgeExtraCardsIfLevelEnded(s);
  s = evaluateTimeDefeat(s);
  if (s.outcome === "defeatTime") return purgeExtraCardsIfLevelEnded(s);
  s = { ...s, turn: s.turn + 1 };
  s = beginYear(s);
  return s;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const bridged = tryCampaignReducerBridge(state, action);
  if (bridged) return bridged;
  switch (action.type) {
    case "HYDRATE":
      return normalizeGameState(action.state);
    case "NEW_GAME": {
      const nextLevelId = action.levelId ?? state.levelId;
      const chapter2Draft = getChapter2StandaloneDraft(nextLevelId, action.seed);
      if (chapter2Draft) {
        return buildLevel2StateFromDraft(chapter2Draft);
      }
      return createInitialState(action.seed, nextLevelId);
    }
    case "APPEND_LOG_INFO":
      return appendActionLog(state, { kind: "info", infoKey: action.infoKey });
    case "PLAY_CARD": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
        return state;
      }
      const id = state.hand[action.handIndex];
      if (!id) return state;
      const inst = state.cardsById[id];
      if (!inst) return state;
      if (!isCardPlayableInActionPhase(state, id)) return state;
      const tmpl = getCardTemplate(inst.templateId);
      const cost = getPlayableCardCost(state, id);
      if (state.resources.funding < cost) return state;
      const paid = {
        ...state,
        resources: { ...state.resources, funding: state.resources.funding - cost },
      };
      if (inst.templateId === "crackdown" || inst.templateId === "diplomaticIntervention") {
        return appendActionLog(
          {
            ...paid,
            pendingInteraction: { type: "crackdownPick", cardInstanceId: id, fundingPaid: cost },
          },
          { kind: "crackdownPickPrompt" },
        );
      }
      if (hasCardTag(paid, id, "consume")) {
        const hadHuguenotContainment = paid.playerStatuses.some((p) => p.templateId === "huguenotContainment");
        let s: GameState = removeHand(paid, id);
        if (inst.templateId === "suppressHuguenots") {
          s = enforceHuguenotContainmentInvariant(s);
        }
        s = appendActionLog(s, {
          kind: "cardPlayed",
          templateId: inst.templateId,
          fundingCost: cost,
          effects: tmpl.effects,
        });
        if (
          inst.templateId === "suppressHuguenots" &&
          hadHuguenotContainment &&
          !s.playerStatuses.some((p) => p.templateId === "huguenotContainment")
        ) {
          s = appendActionLog(s, { kind: "info", infoKey: "huguenotContainmentCleared" });
        }
        return s;
      }
      let s = applyPlayedCardEffects(paid, inst.templateId);
      s = applySunkingPlayCardExtras(s, inst.templateId);
      s = removeHand(s, id);
      const consumed = consumeLimitedUseCard(s, id);
      s = consumed.state;
      if (!consumed.exhausted) {
        s = pushDiscard(s, id);
      }
      s = enforceLegitimacy(s);
      s = appendActionLog(s, {
        kind: "cardPlayed",
        templateId: inst.templateId,
        fundingCost: cost,
        effects: tmpl.effects,
      });
      return appendInflationActivationLogIfNeeded(state, s);
    }
    case "SOLVE_EVENT": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
        return state;
      }
      if (!canFundSolve(state, action.slot)) return state;
      return appendInflationActivationLogIfNeeded(state, performFundSolve(state, action.slot));
    }
    case "PICK_NANTES_TOLERANCE":
    case "PICK_NANTES_CRACKDOWN": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      return state;
    }
    case "PICK_LOCAL_WAR_ATTACK": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      if (!canLocalWarAttack(state, action.slot)) return state;
      return appendInflationActivationLogIfNeeded(state, performLocalWarAttack(state, action.slot));
    }
    case "PICK_LOCAL_WAR_APPEASE": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      const ev = state.slots[action.slot];
      if (!ev || ev.resolved || ev.templateId !== "localWar") return state;
      return appendInflationActivationLogIfNeeded(state, performLocalWarAppease(state, action.slot));
    }
    case "SCRIPTED_EVENT_ATTACK": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
        return state;
      }
      if (!canScriptedAttack(state, action.slot)) return state;
      return appendInflationActivationLogIfNeeded(state, performScriptedAttack(state, action.slot));
    }
    case "CRACKDOWN_TARGET": {
      const p = state.pendingInteraction;
      if (!p || p.type !== "crackdownPick") return state;
      if (!isCrackdownTarget(state, action.slot)) return state;
      const cleared = state.slots[action.slot];
      if (!cleared) return state;
      let s =
        cleared.templateId === "nineYearsWar"
          ? attemptNineYearsWarCampaign(state, action.slot, "intervention", p.fundingPaid)
          : markSlotResolvedWithLeagueProgress(state, action.slot);
      if (cleared.templateId === "imperialElectorsMood") {
        s = opponentImmediateExtraDraw(s, 1);
      }
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
        slot: action.slot,
        harmfulEventTemplateId: cleared.templateId,
        fundingPaid: p.fundingPaid,
      });
      return appendInflationActivationLogIfNeeded(state, s);
    }
    case "CRACKDOWN_CANCEL": {
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
    case "END_YEAR": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) {
        return state;
      }
      if (
        state.resources.legitimacy <= 0 ||
        state.resources.power <= 0
      ) {
        return purgeExtraCardsIfLevelEnded({ ...state, phase: "gameOver", outcome: "defeatLegitimacy" });
      }
      let s = { ...state, resources: { ...state.resources, funding: 0 } };
      s = evaluateVictory(s);
      if (s.outcome === "victory") {
        return appendInflationActivationLogIfNeeded(state, purgeExtraCardsIfLevelEnded(s));
      }
      const cap = retentionCapacity(s);
      if (s.hand.length <= cap) {
        return appendInflationActivationLogIfNeeded(state, completeYearAfterRetention(s, s.hand));
      }
      return appendInflationActivationLogIfNeeded(state, { ...s, phase: "retention" });
    }
    case "CONFIRM_RETENTION": {
      if (state.outcome !== "playing" || state.phase !== "retention") return state;
      const keep = new Set(action.keepIds);
      if (keep.size !== action.keepIds.length) return state;
      for (const id of action.keepIds) {
        if (!state.hand.includes(id)) return state;
      }
      if (action.keepIds.length > retentionCapacity(state)) return state;
      return appendInflationActivationLogIfNeeded(state, completeYearAfterRetention(state, action.keepIds));
    }
    case "PICK_SUCCESSION_CRISIS":
    case "PICK_UTRECHT_TREATY":
    case "PICK_DUAL_FRONT_CRISIS":
    case "PICK_LOUIS_XIV_LEGACY": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      return state;
    }
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

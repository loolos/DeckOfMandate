import { getCardTemplate } from "../data/cards";
import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { getChapter2StandaloneDraft, getChapter3StandaloneDraft } from "../data/levelBootstrap";
import { getTurnLimitForRun, type LevelId } from "../data/levels";
import { appendActionLog } from "../logic/actionLog";
import { enforceLegitimacy } from "../logic/applyEffects";
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
import { opponentEndYearPlayPhase } from "../logic/opponentHabsburg";
import { beginYear, evaluateTimeDefeat, evaluateVictory, retentionCapacity } from "../logic/turnFlow";
import { markSlotResolved } from "../logic/eventSlotOps";
import type { SlotId } from "../levels/types/event";
import type { GameState } from "../types/game";
import type { LogInfoKey } from "../types/game";
import {
  applyAntiFrenchContainmentDeckAfterRetentionYear,
  applyCampaignPlayCardExtras,
  applyScriptedAttackCampaignFlags,
  cardPlayOpensCrackdownPicker,
  maybeAppendHuguenotContainmentClearedLog,
  performFundSolve,
  shouldEnforceCampaignConsumeInvariant,
  stateAfterHarmfulEventCrackdown,
} from "../levels/campaignLogicBundle";
import { tryCampaignReducerBridge } from "../levels/campaignReducerBridge";
import { createInitialState } from "./initialState";
import { buildLevel2StateFromDraft, buildLevel3StateFromDraft } from "./levelTransitions";

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

function isPlayingActionPhase(state: GameState): boolean {
  return state.outcome === "playing" && state.phase === "action";
}

function isPlayingActionPhaseWithoutPendingInteraction(state: GameState): boolean {
  return isPlayingActionPhase(state) && !state.pendingInteraction;
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
  s = applyAntiFrenchContainmentDeckAfterRetentionYear(s);
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

function handlePlayCard(state: GameState, action: Extract<GameAction, { type: "PLAY_CARD" }>): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
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
  if (cardPlayOpensCrackdownPicker(inst.templateId)) {
    return appendActionLog(
      {
        ...paid,
        pendingInteraction: { type: "crackdownPick", cardInstanceId: id, fundingPaid: cost },
      },
      { kind: "crackdownPickPrompt" },
    );
  }
  if (hasCardTag(paid, id, "consume")) {
    let s: GameState = removeHand(paid, id);
    if (shouldEnforceCampaignConsumeInvariant(inst.templateId)) {
      s = enforceHuguenotContainmentInvariant(s);
    }
    s = appendActionLog(s, {
      kind: "cardPlayed",
      templateId: inst.templateId,
      fundingCost: cost,
      effects: tmpl.effects,
    });
    s = maybeAppendHuguenotContainmentClearedLog(paid, s, inst.templateId);
    return s;
  }
  let s = applyPlayedCardEffects(paid, inst.templateId);
  s = applyCampaignPlayCardExtras(s, inst.templateId);
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

function handleSolveEvent(state: GameState, action: Extract<GameAction, { type: "SOLVE_EVENT" }>): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
    return state;
  }
  if (!canFundSolve(state, action.slot)) return state;
  return appendInflationActivationLogIfNeeded(state, performFundSolve(state, action.slot));
}

function handleScriptedEventAttack(
  state: GameState,
  action: Extract<GameAction, { type: "SCRIPTED_EVENT_ATTACK" }>,
): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
    return state;
  }
  if (!canScriptedAttack(state, action.slot)) return state;
  return appendInflationActivationLogIfNeeded(state, performScriptedAttack(state, action.slot));
}

function handleCrackdownTarget(
  state: GameState,
  action: Extract<GameAction, { type: "CRACKDOWN_TARGET" }>,
): GameState {
  const p = state.pendingInteraction;
  if (!p || p.type !== "crackdownPick") return state;
  if (!isCrackdownTarget(state, action.slot)) return state;
  const cleared = state.slots[action.slot];
  if (!cleared) return state;
  let s = stateAfterHarmfulEventCrackdown(state, action.slot, cleared.templateId, p.fundingPaid);
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

function handleEndYear(state: GameState): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
    return state;
  }
  if (state.resources.legitimacy <= 0 || state.resources.power <= 0) {
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

function handleConfirmRetention(
  state: GameState,
  action: Extract<GameAction, { type: "CONFIRM_RETENTION" }>,
): GameState {
  if (state.outcome !== "playing" || state.phase !== "retention") return state;
  const keep = new Set(action.keepIds);
  if (keep.size !== action.keepIds.length) return state;
  for (const id of action.keepIds) {
    if (!state.hand.includes(id)) return state;
  }
  if (action.keepIds.length > retentionCapacity(state)) return state;
  return appendInflationActivationLogIfNeeded(state, completeYearAfterRetention(state, action.keepIds));
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
      const chapter3Draft = getChapter3StandaloneDraft(nextLevelId, action.seed);
      if (chapter3Draft) {
        return buildLevel3StateFromDraft(chapter3Draft);
      }
      return createInitialState(action.seed, nextLevelId);
    }
    case "APPEND_LOG_INFO":
      return appendActionLog(state, { kind: "info", infoKey: action.infoKey });
    case "PLAY_CARD":
      return handlePlayCard(state, action);
    case "SOLVE_EVENT":
      return handleSolveEvent(state, action);
    case "PICK_NANTES_TOLERANCE":
    case "PICK_NANTES_CRACKDOWN": {
      if (!isPlayingActionPhaseWithoutPendingInteraction(state)) return state;
      return state;
    }
    case "PICK_LOCAL_WAR_ATTACK":
    case "PICK_LOCAL_WAR_APPEASE":
      return state;
    case "SCRIPTED_EVENT_ATTACK":
      return handleScriptedEventAttack(state, action);
    case "CRACKDOWN_TARGET":
      return handleCrackdownTarget(state, action);
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
    case "END_YEAR":
      return handleEndYear(state);
    case "CONFIRM_RETENTION":
      return handleConfirmRetention(state, action);
    case "PICK_SUCCESSION_CRISIS":
    case "PICK_UTRECHT_TREATY":
    case "PICK_DUAL_FRONT_CRISIS":
    case "PICK_LOUIS_XIV_LEGACY": {
      if (!isPlayingActionPhaseWithoutPendingInteraction(state)) return state;
      return state;
    }
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

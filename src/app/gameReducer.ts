import { getCardTemplate } from "../data/cards";
import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { getChapter2StandaloneDraft } from "../data/levelBootstrap";
import { getTurnLimitForRun, type LevelId } from "../data/levels";
import { appendActionLog } from "../logic/actionLog";
import { applyEffects, enforceLegitimacy } from "../logic/applyEffects";
import { isCardPlayableInActionPhase } from "../logic/cardPlayability";
import { hasCardTag } from "../logic/cardTags";
import { addCardsToHand, enforceHuguenotContainmentInvariant } from "../logic/cardRuntime";
import { appendInflationActivationLogIfNeeded, getPlayableCardCost } from "../logic/cardCost";
import { normalizeGameState } from "../logic/normalizeGameState";
import { applyPlayedCardEffects } from "../logic/resolveCard";
import { resolveEndOfYearPenalties } from "../logic/resolveEvents";
import { coalitionUntilTurn, findScriptedCalendarConfig } from "../logic/scriptedCalendar";
import { rngNext } from "../logic/rng";
import {
  completeSuccessionCrisisAndRevealOpponent,
  opponentEndYearPlayPhase,
  stateAfterUtrechtTreatyEndsWar,
} from "../logic/opponentHabsburg";
import { beginYear, evaluateTimeDefeat, evaluateVictory, retentionCapacity } from "../logic/turnFlow";
import { THIRD_MANDATE_LEVEL_ID } from "../logic/thirdMandateConstants";
import { antiFrenchSentimentEventSolveCostPenalty } from "../logic/antiFrenchSentiment";
import { EVENT_SLOT_ORDER, type EventTemplateId } from "../levels/types/event";
import type { SlotId } from "../levels/types/event";
import type { GameState } from "../types/game";
import type { LogInfoKey } from "../types/game";
import { createInitialState } from "./initialState";
import { buildLevel2StateFromDraft } from "./level2Transition";

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
  | { type: "PICK_DUAL_FRONT_CRISIS"; slot: SlotId; expandWar: boolean };

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
  const inst = state.cardsById[instanceId];
  let s: GameState = { ...state, cardUsesById };
  let infoKey: LogInfoKey | null = null;
  if (inst?.templateId === "crackdown") {
    s = {
      ...s,
      resources: {
        ...s.resources,
        power: Math.max(0, s.resources.power - 1),
      },
    };
    infoKey = "cardUse.depleted.crackdownPenalty";
  } else if (inst?.templateId === "funding") {
    s = {
      ...s,
      resources: {
        ...s.resources,
        treasuryStat: Math.max(0, s.resources.treasuryStat - 1),
      },
    };
    infoKey = "cardUse.depleted.fundingPenalty";
  } else if (inst?.templateId === "diplomaticIntervention") {
    infoKey = "cardUse.depleted.diplomaticIntervention";
  }
  if (infoKey) {
    s = appendActionLog(s, { kind: "info", infoKey });
  }
  return { state: s, exhausted: true };
}

function markSlotResolved(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev) return state;
  return {
    ...state,
    slots: { ...state.slots, [slot]: { ...ev, resolved: true } },
  };
}

function markSlotResolvedWithLeagueProgress(state: GameState, slot: SlotId): GameState {
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

function resolveFirstUnresolvedEventByTemplate(
  state: GameState,
  templateId: EventTemplateId,
): GameState {
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    if (ev.templateId !== templateId) continue;
    return markSlotResolved(state, slot);
  }
  return state;
}

function clearEventsByTemplate(state: GameState, templateId: EventTemplateId): GameState {
  let changed = false;
  const slots = { ...state.slots };
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = slots[slot];
    if (!ev) continue;
    if (ev.templateId !== templateId) continue;
    slots[slot] = null;
    changed = true;
  }
  if (!changed) return state;
  return { ...state, slots };
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

function performSuccessionCrisisPick(state: GameState, slot: SlotId, pay: boolean): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "successionCrisis" || state.levelId !== THIRD_MANDATE_LEVEL_ID) {
    return state;
  }
  let s = state;
  if (pay) {
    if (s.resources.funding < 3) return state;
    s = { ...s, resources: { ...s.resources, funding: s.resources.funding - 3 } };
    s = applyEffects(s, [{ kind: "modSuccessionTrack", delta: 1 }]);
  } else {
    s = applyEffects(s, [{ kind: "modSuccessionTrack", delta: -1 }]);
  }
  if (s.outcome !== "playing") return s;
  s = completeSuccessionCrisisAndRevealOpponent(s, slot);
  return appendInflationActivationLogIfNeeded(state, s);
}

function performUtrechtTreatyPick(state: GameState, slot: SlotId, endWar: boolean): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "utrechtTreaty" || state.levelId !== THIRD_MANDATE_LEVEL_ID) {
    return state;
  }
  if (endWar) {
    return stateAfterUtrechtTreatyEndsWar(state, slot);
  }
  return state;
}

function performDualFrontCrisisPick(state: GameState, slot: SlotId, expandWar: boolean): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "dualFrontCrisis" || state.levelId !== THIRD_MANDATE_LEVEL_ID) {
    return state;
  }
  let s = state;
  if (expandWar) {
    s = applyEffects(s, [
      { kind: "modOpponentStrength", delta: 1 },
      { kind: "modSuccessionTrack", delta: 1 },
      { kind: "modResource", resource: "legitimacy", delta: -1 },
      { kind: "addCardsToDeck", templateId: "fiscalBurden", count: 3 },
    ]);
  } else {
    s = applyEffects(s, [
      { kind: "modOpponentStrength", delta: 1 },
      { kind: "modSuccessionTrack", delta: -3 },
    ]);
  }
  if (s.outcome !== "playing") return s;
  s = enforceLegitimacy(s);
  if (s.outcome !== "playing") return s;
  s = markSlotResolvedWithLeagueProgress(s, slot);
  return appendActionLog(s, { kind: "eventDualFrontCrisisChoice", slot, expandWar });
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

function performFundSolve(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return state;
  const tmpl = getEventTemplate(ev.templateId);
  const fundingAmount = getEventSolveFundingAmount(state, ev.templateId);
  let s = state;
  if (tmpl.solve.kind === "funding" || tmpl.solve.kind === "fundingTreasuryQuarterCeil") {
    if (fundingAmount === null) return state;
    s = {
      ...s,
      resources: { ...s.resources, funding: s.resources.funding - fundingAmount },
    };
  } else if (tmpl.solve.kind === "fundingOrCrackdown") {
    if (fundingAmount === null) return state;
    s = {
      ...s,
      resources: { ...s.resources, funding: s.resources.funding - fundingAmount },
    };
  } else {
    return state;
  }
  if (ev.templateId === "nineYearsWar") {
    const [rng, roll] = rngNext(s.rng);
    s = { ...s, rng };
    const decisiveVictory = roll < 1 / 9;
    const limitedGains = roll >= 5 / 9;
    let legitimacyDelta = 0;
    if (limitedGains && !decisiveVictory) {
      legitimacyDelta = 1;
      s = applyEffects(s, [{ kind: "modResource", resource: "legitimacy", delta: 1 }]);
    }
    s = markSlotResolvedWithNineYearsWarPersistence(s, slot, !decisiveVictory);
    s = enforceLegitimacy(s);
    return appendActionLog(s, {
      kind: "eventNineYearsWarCampaign",
      slot,
      fundingPaid: fundingAmount ?? 0,
      viaIntervention: false,
      outcome: decisiveVictory ? "decisiveVictory" : limitedGains ? "limitedGains" : "stalemate",
      legitimacyDelta,
    });
  }
  if (ev.templateId === "localizedSuccessionWar") {
    const [rng, roll] = rngNext(s.rng);
    s = { ...s, rng };
    const deltas = [-1, 0, 1, 2] as const;
    const idx = Math.min(3, Math.floor(roll * 4));
    const successionDelta = deltas[idx]!;
    s = applyEffects(s, [{ kind: "modSuccessionTrack", delta: successionDelta }]);
    if (s.outcome !== "playing") return appendInflationActivationLogIfNeeded(state, s);
    s = enforceLegitimacy(s);
    if (s.outcome !== "playing") return appendInflationActivationLogIfNeeded(state, s);
    s = markSlotResolvedWithLeagueProgress(s, slot);
    s = appendActionLog(s, {
      kind: "eventLocalizedSuccessionWarResolve",
      slot,
      fundingPaid: fundingAmount ?? 0,
      successionDelta,
    });
    return appendInflationActivationLogIfNeeded(state, s);
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
    s = clearEventsByTemplate(s, "nineYearsWar");
  }
  s = markSlotResolvedWithLeagueProgress(s, slot);
  s = enforceLegitimacy(s);
  const fundingPaid =
    tmpl.solve.kind === "funding" ||
    tmpl.solve.kind === "fundingTreasuryQuarterCeil" ||
    tmpl.solve.kind === "fundingOrCrackdown"
      ? (fundingAmount ?? 0)
      : 0;
  s = appendActionLog(s, {
    kind: "eventFundSolved",
    slot,
    templateId: ev.templateId,
    fundingPaid,
    treasuryGain,
  });
  return s;
}

function addUniqueStatus(state: GameState, templateId: "religiousTolerance" | "huguenotContainment"): GameState {
  const existing = state.playerStatuses.find((s) => s.templateId === templateId);
  if (existing) return state;
  return applyEffects(state, [{ kind: "addPlayerStatus", templateId, turns: 99 }]);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
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
        let s: GameState = removeHand(paid, id);
        if (inst.templateId === "suppressHuguenots") {
          s = enforceHuguenotContainmentInvariant(s);
        }
        return appendActionLog(s, {
          kind: "cardPlayed",
          templateId: inst.templateId,
          fundingCost: cost,
          effects: tmpl.effects,
        });
      }
      let s = applyPlayedCardEffects(paid, inst.templateId);
      if (inst.templateId === "grandAllianceInfiltrationDiplomacy") {
        s = { ...s, opponentCostDiscountThisTurn: 1 };
      }
      if (inst.templateId === "grainRelief") {
        s = resolveFirstUnresolvedEventByTemplate(s, "risingGrainPrices");
      }
      if (inst.templateId === "diplomaticCongress") {
        s = addCardsToHand(s, "diplomaticIntervention", 1);
      }
      if (inst.templateId === "jesuitCollege") {
        s = resolveFirstUnresolvedEventByTemplate(s, "jansenistTension");
      }
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
    case "PICK_NANTES_TOLERANCE": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      const ev = state.slots[action.slot];
      if (!ev || ev.resolved || ev.templateId !== "revocationNantes") return state;
      let s: GameState = applyEffects(state, [{ kind: "modResource", resource: "legitimacy", delta: -1 }]);
      s = addUniqueStatus(s, "religiousTolerance");
      s = markSlotResolved(s, action.slot);
      s = appendActionLog(s, { kind: "info", infoKey: "nantesPolicy.toleranceNoFontainebleau" });
      s = { ...s, nantesPolicyCarryover: "tolerance" };
      s = enforceLegitimacy(s);
      return appendInflationActivationLogIfNeeded(state, s);
    }
    case "PICK_NANTES_CRACKDOWN": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      const ev = state.slots[action.slot];
      if (!ev || ev.resolved || ev.templateId !== "revocationNantes") return state;
      let s: GameState = addUniqueStatus(state, "huguenotContainment");
      s = { ...s, huguenotResurgenceCounter: 0 };
      s = applyEffects(s, [{ kind: "addCardsToDeck", templateId: "suppressHuguenots", count: 3 }]);
      // Resync `turnsRemaining` to the live count of suppressHuguenots cards so
      // the status's number is always equal to the cards currently in play
      // (e.g. if some prior crackdown branch already added cards/status).
      s = enforceHuguenotContainmentInvariant(s);
      s = markSlotResolved(s, action.slot);
      s = appendActionLog(s, { kind: "info", infoKey: "nantesPolicy.crackdownFontainebleauIssued" });
      s = { ...s, nantesPolicyCarryover: "crackdown" };
      return appendInflationActivationLogIfNeeded(state, s);
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
      let s = markSlotResolvedWithLeagueProgress(state, action.slot);
      if (cleared.templateId === "imperialElectorsMood") {
        s = applyEffects(s, [{ kind: "opponentNextTurnDrawModifier", delta: 1 }]);
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
    case "PICK_SUCCESSION_CRISIS": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      return appendInflationActivationLogIfNeeded(state, performSuccessionCrisisPick(state, action.slot, action.pay));
    }
    case "PICK_UTRECHT_TREATY": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      return appendInflationActivationLogIfNeeded(state, performUtrechtTreatyPick(state, action.slot, action.endWar));
    }
    case "PICK_DUAL_FRONT_CRISIS": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      return appendInflationActivationLogIfNeeded(
        state,
        performDualFrontCrisisPick(state, action.slot, action.expandWar),
      );
    }
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

import { getCardTemplate } from "../data/cards";
import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { getLevelDef, type LevelId } from "../data/levels";
import { appendActionLog } from "../logic/actionLog";
import { applyEffects, enforceLegitimacy } from "../logic/applyEffects";
import { hasCardTag } from "../logic/cardTags";
import { addCardsToHand } from "../logic/cardRuntime";
import { appendInflationActivationLogIfNeeded, getPlayableCardCost } from "../logic/cardCost";
import { normalizeGameState } from "../logic/normalizeGameState";
import { applyPlayedCardEffects } from "../logic/resolveCard";
import { resolveEndOfYearPenalties } from "../logic/resolveEvents";
import { coalitionUntilTurn, findScriptedCalendarConfig } from "../logic/scriptedCalendar";
import { rngNext } from "../logic/rng";
import { beginYear, evaluateTimeDefeat, evaluateVictory, retentionCapacity } from "../logic/turnFlow";
import { antiFrenchSentimentEventSolveCostPenalty } from "../logic/antiFrenchSentiment";
import type { CardTemplateId } from "../types/card";
import { EVENT_SLOT_ORDER, type EventTemplateId } from "../types/event";
import type { SlotId } from "../types/event";
import type { GameState } from "../types/game";
import type { LogInfoKey } from "../types/game";
import { createInitialState } from "./initialState";

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
  | { type: "CONFIRM_RETENTION"; keepIds: readonly string[] };

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

function isCrackdownTarget(state: GameState, slot: SlotId): boolean {
  const ev = state.slots[slot];
  if (!ev || ev.resolved) return false;
  const tmpl = getEventTemplate(ev.templateId);
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
  return state.resources.funding >= state.europeAlertProgress;
}

function isCardPlayableUnderStatuses(state: GameState, cardInstanceId: string): boolean {
  for (const st of state.playerStatuses) {
    if (st.kind !== "blockCardTag") continue;
    if (!st.blockedTag) continue;
    if (hasCardTag(state, cardInstanceId, st.blockedTag)) return false;
  }
  return true;
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

  const turnLimit = getLevelDef(s.levelId).turnLimit;
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
  const cost = state.europeAlertProgress + antiFrenchSentimentEventSolveCostPenalty(state);
  if (state.resources.funding < cost) return state;
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
    s = {
      ...s,
      resources: {
        ...s.resources,
        power: s.resources.power + 1,
        legitimacy: s.resources.legitimacy + 1,
      },
    };
  } else if (roll >= 2 / 3) {
    s = {
      ...s,
      resources: {
        ...s.resources,
        power: Math.max(0, s.resources.power - 1),
      },
    };
  }
  s = markSlotResolved(s, slot);
  return enforceLegitimacy(s);
}

function performLocalWarAppease(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "localWar") return state;
  let s: GameState = applyEffects(state, [{ kind: "modResource", resource: "legitimacy", delta: -1 }]);
  s = markSlotResolved(s, slot);
  return enforceLegitimacy(s);
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
  if (tmpl.solve.kind === "funding") {
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
  }
  s = markSlotResolvedWithLeagueProgress(s, slot);
  s = enforceLegitimacy(s);
  const fundingPaid =
    tmpl.solve.kind === "funding" || tmpl.solve.kind === "fundingOrCrackdown" ? (fundingAmount ?? 0) : 0;
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

function setStatusTurns(
  state: GameState,
  templateId: "religiousTolerance" | "huguenotContainment",
  turnsRemaining: number,
): GameState {
  return {
    ...state,
    playerStatuses: state.playerStatuses.map((st) =>
      st.templateId === templateId ? { ...st, turnsRemaining } : st,
    ),
  };
}

function removeCardsEverywhere(state: GameState, templateId: CardTemplateId): GameState {
  const toRemove = new Set(
    Object.values(state.cardsById)
      .filter((c) => c.templateId === templateId)
      .map((c) => c.instanceId),
  );
  if (toRemove.size === 0) return state;
  const cardInflationById = { ...state.cardInflationById };
  const cardUsesById = { ...state.cardUsesById };
  for (const id of toRemove) {
    delete cardInflationById[id];
    delete cardUsesById[id];
  }
  return {
    ...state,
    hand: state.hand.filter((id) => !toRemove.has(id)),
    deck: state.deck.filter((id) => !toRemove.has(id)),
    discard: state.discard.filter((id) => !toRemove.has(id)),
    cardUsesById,
    cardInflationById,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "HYDRATE":
      return normalizeGameState(action.state);
    case "NEW_GAME":
      return createInitialState(action.seed, action.levelId ?? state.levelId);
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
      if (!isCardPlayableUnderStatuses(state, id)) return state;
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
      if (inst.templateId === "fiscalBurden") {
        const removed = removeHand(paid, id);
        return appendActionLog(removed, {
          kind: "cardPlayed",
          templateId: inst.templateId,
          fundingCost: cost,
          effects: tmpl.effects,
        });
      }
      if (inst.templateId === "antiFrenchContainment") {
        const removed = removeHand(paid, id);
        return appendActionLog(removed, {
          kind: "cardPlayed",
          templateId: inst.templateId,
          fundingCost: cost,
          effects: tmpl.effects,
        });
      }
      if (inst.templateId === "suppressHuguenots") {
        const removed = removeHand(paid, id);
        let s: GameState = removed;
        const status = s.playerStatuses.find((st) => st.templateId === "huguenotContainment");
        if (status) {
          const next = Math.max(0, status.turnsRemaining - 1);
          s = {
            ...s,
            playerStatuses:
              next > 0
                ? s.playerStatuses.map((st) =>
                    st.instanceId === status.instanceId ? { ...st, turnsRemaining: next } : st,
                  )
                : s.playerStatuses.filter((st) => st.instanceId !== status.instanceId),
          };
          if (next === 0) {
            s = removeCardsEverywhere(s, "suppressHuguenots");
          }
        }
        s = appendActionLog(s, {
          kind: "cardPlayed",
          templateId: inst.templateId,
          fundingCost: cost,
          effects: tmpl.effects,
        });
        return s;
      }
      let s = applyPlayedCardEffects(paid, inst.templateId);
      if (inst.templateId === "grainRelief") {
        s = resolveFirstUnresolvedEventByTemplate(s, "risingGrainPrices");
      }
      if (inst.templateId === "diplomaticCongress") {
        s = addCardsToHand(s, "diplomaticIntervention", 1);
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
      s = enforceLegitimacy(s);
      return appendInflationActivationLogIfNeeded(state, s);
    }
    case "PICK_NANTES_CRACKDOWN": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return state;
      const ev = state.slots[action.slot];
      if (!ev || ev.resolved || ev.templateId !== "revocationNantes") return state;
      let s: GameState = addUniqueStatus(state, "huguenotContainment");
      s = setStatusTurns(s, "huguenotContainment", 3);
      s = applyEffects(s, [{ kind: "addCardsToDeck", templateId: "suppressHuguenots", count: 3 }]);
      s = markSlotResolved(s, action.slot);
      return s;
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
        state.resources.treasuryStat <= 0 ||
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
    default: {
      const _never: never = action;
      return _never;
    }
  }
}

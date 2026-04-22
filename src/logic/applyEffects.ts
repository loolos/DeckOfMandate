import { getStatusTemplate } from "../data/statusTemplates";
import type { CardTemplateId } from "../levels/types/card";
import type { Effect } from "../levels/types/effect";
import type { GameState } from "../types/game";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";
import type { PlayerStatusInstance } from "../levels/types/status";
import { appendActionLog } from "./actionLog";
import { addGeneratedCards, applyOnDrawCardEffects } from "./cardRuntime";
import { applyInflationFromDeckRefill } from "./cardCost";
import { drawUpToPower } from "./draw";
import { shuffle } from "./rng";

export function enforceLegitimacy(s: GameState): GameState {
  if (s.resources.legitimacy <= 0 || s.resources.power <= 0) {
    return { ...s, phase: "gameOver", outcome: "defeatLegitimacy" };
  }
  return s;
}

/** Instant win/loss on succession track at ±10 (chapter 3). */
export function enforceSuccessionImmediateOutcome(s: GameState): GameState {
  if (s.levelId !== THIRD_MANDATE_LEVEL_ID || s.outcome !== "playing") return s;
  if (s.resources.power <= 0 || s.resources.legitimacy <= 0) {
    return { ...s, phase: "gameOver", outcome: "defeatLegitimacy" };
  }
  if (s.warEnded) return s;
  if (s.successionTrack >= 10) {
    return { ...s, phase: "gameOver", outcome: "victory", successionOutcomeTier: null };
  }
  if (s.successionTrack <= -10) {
    return { ...s, phase: "gameOver", outcome: "defeatSuccession", successionOutcomeTier: null };
  }
  return s;
}

export function applyEffect(state: GameState, e: Effect): GameState {
  switch (e.kind) {
    case "modResource": {
      const r = { ...state.resources };
      const cur = r[e.resource];
      const next = cur + e.delta;
      if (e.resource === "legitimacy") {
        r[e.resource] = next;
      } else {
        r[e.resource] = Math.max(0, next);
      }
      return { ...state, resources: r };
    }
    case "modSuccessionTrack": {
      if (state.levelId === THIRD_MANDATE_LEVEL_ID && state.warEnded) {
        return state;
      }
      const successionTrack = Math.max(-10, Math.min(10, state.successionTrack + e.delta));
      return enforceSuccessionImmediateOutcome({ ...state, successionTrack });
    }
    case "gainFunding":
      return {
        ...state,
        resources: { ...state.resources, funding: state.resources.funding + e.amount },
      };
    case "drawCards": {
      let s = state;
      const drawn = drawUpToPower(s.rng, s.hand, s.deck, s.discard, e.count);
      s = { ...s, rng: drawn.rng, hand: drawn.hand, deck: drawn.deck, discard: drawn.discard };
      s = applyInflationFromDeckRefill(s, drawn.refilledCardIds);
      if (drawn.discardedCardIds.length > 0) {
        const discardedTemplateIds = drawn.discardedCardIds
          .map((id) => s.cardsById[id]?.templateId)
          .filter((id): id is CardTemplateId => Boolean(id));
        s = appendActionLog(s, {
          kind: "drawOverflowDiscarded",
          cardTemplateIds: discardedTemplateIds,
        });
      }
      for (const cardId of drawn.drawnCardIds) {
        s = applyOnDrawCardEffects(s, cardId);
      }
      return s;
    }
    case "scheduleNextTurnDrawModifier":
      return {
        ...state,
        nextTurnDrawModifier: state.nextTurnDrawModifier + e.delta,
      };
    case "scheduleNextTurnFundingIncomeModifier":
      return {
        ...state,
        nextTurnFundingIncomeModifier: state.nextTurnFundingIncomeModifier + e.delta,
      };
    case "opponentNextTurnDrawModifier":
      return {
        ...state,
        opponentNextTurnDrawModifier: state.opponentNextTurnDrawModifier + e.delta,
      };
    case "opponentHandDiscardNow": {
      const n = Math.max(0, Math.floor(e.count));
      if (n === 0) return state;
      if (state.levelId !== THIRD_MANDATE_LEVEL_ID || !state.opponentHabsburgUnlocked || state.warEnded) {
        return state;
      }
      if (state.opponentHand.length === 0) return state;
      const take = Math.min(n, state.opponentHand.length);
      const [rng2, shuffled] = shuffle(state.rng, state.opponentHand);
      return {
        ...state,
        rng: rng2,
        opponentHand: shuffled.slice(take),
        opponentDiscard: [...state.opponentDiscard, ...shuffled.slice(0, take)],
      };
    }
    case "modOpponentStrength":
      return {
        ...state,
        opponentStrength: Math.max(1, state.opponentStrength + e.delta),
      };
    case "scheduleDrawModifiers":
      return {
        ...state,
        scheduledDrawModifiers: [...state.scheduledDrawModifiers, ...e.deltas],
      };
    case "addPlayerStatus": {
      const tmpl = getStatusTemplate(e.templateId);
      const instanceId = `st_${state.nextIds.status}`;
      const row: PlayerStatusInstance = {
        instanceId,
        templateId: e.templateId,
        kind: tmpl.kind,
        delta: tmpl.delta,
        resource: tmpl.resource,
        blockedTag: tmpl.blockedTag,
        turnsRemaining: e.turns,
      };
      return {
        ...state,
        playerStatuses: [...state.playerStatuses, row],
        nextIds: { ...state.nextIds, status: state.nextIds.status + 1 },
      };
    }
    case "addCardsToDeck":
      return addGeneratedCards(state, e.templateId, e.count, e.placement ?? "deckRandom");
    default: {
      const _exhaustive: never = e;
      return _exhaustive;
    }
  }
}

export function applyEffects(state: GameState, list: readonly Effect[]): GameState {
  let s = state;
  for (const e of list) {
    s = applyEffect(s, e);
    s = enforceSuccessionImmediateOutcome(s);
    if (s.outcome !== "playing") return s;
    s = enforceLegitimacy(s);
    if (s.outcome !== "playing") return s;
  }
  return s;
}

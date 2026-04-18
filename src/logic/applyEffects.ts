import { getStatusTemplate } from "../data/statusTemplates";
import type { CardTemplateId } from "../types/card";
import type { Effect } from "../types/effect";
import type { GameState } from "../types/game";
import type { PlayerStatusInstance } from "../types/status";
import { appendActionLog } from "./actionLog";
import { addCardsToDeck, applyOnDrawCardEffects } from "./cardRuntime";
import { applyInflationFromDeckRefill } from "./cardCost";
import { drawUpToPower } from "./draw";

export function enforceLegitimacy(s: GameState): GameState {
  if (
    s.resources.legitimacy <= 0 ||
    s.resources.treasuryStat <= 0 ||
    s.resources.power <= 0
  ) {
    return { ...s, phase: "gameOver", outcome: "defeatLegitimacy" };
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
      return addCardsToDeck(state, e.templateId, e.count);
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
    s = enforceLegitimacy(s);
    if (s.outcome !== "playing") return s;
  }
  return s;
}

import { getStatusTemplate } from "../data/statusTemplates";
import type { Effect } from "../types/effect";
import type { GameState } from "../types/game";
import type { PlayerStatusInstance } from "../types/status";
import { tryDrawOne } from "./draw";

export function enforceLegitimacy(s: GameState): GameState {
  if (s.resources.legitimacy <= 0) {
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
      for (let i = 0; i < e.count; i++) {
        const d = tryDrawOne(s.rng, s.hand, s.deck, s.discard);
        s = { ...s, rng: d.rng, hand: d.hand, deck: d.deck, discard: d.discard };
      }
      return s;
    }
    case "scheduleNextTurnDrawModifier":
      return {
        ...state,
        nextTurnDrawModifier: state.nextTurnDrawModifier + e.delta,
      };
    case "addPlayerStatus": {
      const tmpl = getStatusTemplate(e.templateId);
      const instanceId = `st_${state.nextIds.status}`;
      const row: PlayerStatusInstance = {
        instanceId,
        templateId: e.templateId,
        kind: tmpl.kind,
        delta: tmpl.delta,
        blockedTag: tmpl.blockedTag,
        turnsRemaining: e.turns,
      };
      return {
        ...state,
        playerStatuses: [...state.playerStatuses, row],
        nextIds: { ...state.nextIds, status: state.nextIds.status + 1 },
      };
    }
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

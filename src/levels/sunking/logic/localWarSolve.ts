import { appendActionLog } from "../../../logic/actionLog";
import { applyEffects, enforceLegitimacy } from "../../../logic/applyEffects";
import { markSlotResolved } from "../../../logic/eventSlotOps";
import { rngNext } from "../../../logic/rng";
import type { GameState } from "../../../types/game";
import type { SlotId } from "../../types/event";
import { antiFrenchSentimentEventSolveCostPenalty } from "./antiFrenchSentiment";

const LOCAL_WAR_TEMPLATE = "localWar" as const;

export function canLocalWarAttack(state: GameState, slot: SlotId): boolean {
  if (state.phase !== "action" || state.pendingInteraction?.type === "crackdownPick") return false;
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== LOCAL_WAR_TEMPLATE) return false;
  const cost = Math.floor(state.europeAlertProgress / 2) + antiFrenchSentimentEventSolveCostPenalty(state);
  return state.resources.funding >= cost;
}

export function performLocalWarAttack(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== LOCAL_WAR_TEMPLATE) return state;
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
    templateId: LOCAL_WAR_TEMPLATE,
    choice: "attack",
    fundingPaid: cost,
    powerDelta,
    legitimacyDelta,
  });
}

export function performLocalWarAppease(state: GameState, slot: SlotId): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== LOCAL_WAR_TEMPLATE) return state;
  let s: GameState = applyEffects(state, [{ kind: "modResource", resource: "legitimacy", delta: -1 }]);
  s = markSlotResolved(s, slot);
  s = enforceLegitimacy(s);
  return appendActionLog(s, {
    kind: "eventLocalWarChoice",
    slot,
    templateId: LOCAL_WAR_TEMPLATE,
    choice: "appease",
    fundingPaid: 0,
    powerDelta: 0,
    legitimacyDelta: -1,
  });
}

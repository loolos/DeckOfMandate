import type { GameAction } from "../../../app/gameReducer";
import { appendActionLog } from "../../../logic/actionLog";
import { applyEffects, enforceLegitimacy } from "../../../logic/applyEffects";
import { appendInflationActivationLogIfNeeded } from "../../../logic/cardCost";
import { enforceHuguenotContainmentInvariant } from "../../../logic/cardRuntime";
import { markSlotResolved, markSlotResolvedWithLeagueProgress } from "../../../logic/eventSlotOps";
import {
  completeSuccessionCrisisAndRevealOpponent,
  stateAfterUtrechtTreatyEndsWar,
} from "../../../logic/opponentHabsburg";
import type { GameState } from "../../../types/game";
import type { SlotId } from "../../types/event";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";
import { canLocalWarAttack, performLocalWarAppease, performLocalWarAttack } from "./localWarSolve";

function addUniqueStatus(
  state: GameState,
  templateId: "religiousTolerance" | "huguenotContainment",
): GameState {
  const existing = state.playerStatuses.find((s) => s.templateId === templateId);
  if (existing) return state;
  return applyEffects(state, [{ kind: "addPlayerStatus", templateId, turns: 99 }]);
}

function performPickNantesTolerance(state: GameState, slot: SlotId): GameState {
  let s: GameState = applyEffects(state, [{ kind: "modResource", resource: "legitimacy", delta: -1 }]);
  s = addUniqueStatus(s, "religiousTolerance");
  s = markSlotResolved(s, slot);
  s = appendActionLog(s, { kind: "info", infoKey: "nantesPolicy.toleranceNoFontainebleau" });
  s = { ...s, nantesPolicyCarryover: "tolerance" };
  s = enforceLegitimacy(s);
  return s;
}

function performPickNantesCrackdown(state: GameState, slot: SlotId): GameState {
  let s: GameState = addUniqueStatus(state, "huguenotContainment");
  s = { ...s, huguenotResurgenceCounter: 0 };
  s = applyEffects(s, [{ kind: "addCardsToDeck", templateId: "suppressHuguenots", count: 3 }]);
  s = enforceHuguenotContainmentInvariant(s);
  s = markSlotResolved(s, slot);
  s = appendActionLog(s, { kind: "info", infoKey: "nantesPolicy.crackdownFontainebleauIssued" });
  s = { ...s, nantesPolicyCarryover: "crackdown" };
  return s;
}

function performSuccessionCrisisPick(state: GameState, slot: SlotId, pay: boolean): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "successionCrisis") {
    return state;
  }
  let s = state;
  const fundingPaid = pay ? 3 : 0;
  const successionDelta: 1 | -1 = pay ? 1 : -1;
  if (pay) {
    if (s.resources.funding < 3) return state;
    s = { ...s, resources: { ...s.resources, funding: s.resources.funding - 3 } };
    s = applyEffects(s, [{ kind: "modSuccessionTrack", delta: 1 }]);
  } else {
    s = applyEffects(s, [{ kind: "modSuccessionTrack", delta: -1 }]);
  }
  const crisisLog = {
    kind: "eventSuccessionCrisisChoice" as const,
    slot,
    pay,
    fundingPaid,
    successionDelta,
  };
  if (s.outcome !== "playing") {
    return appendActionLog(s, crisisLog);
  }
  s = completeSuccessionCrisisAndRevealOpponent(s, slot);
  s = appendActionLog(s, crisisLog);
  return s;
}

function performUtrechtTreatyPick(state: GameState, slot: SlotId, endWar: boolean): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "utrechtTreaty") {
    return state;
  }
  if (endWar) {
    return stateAfterUtrechtTreatyEndsWar(state, slot);
  }
  return state;
}

function performDualFrontCrisisPick(state: GameState, slot: SlotId, expandWar: boolean): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "dualFrontCrisis") {
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

function performLouisXivLegacyPick(state: GameState, slot: SlotId, directRule: boolean): GameState {
  const ev = state.slots[slot];
  if (!ev || ev.resolved || ev.templateId !== "louisXivLegacy1715") {
    return state;
  }
  let s = state;
  if (directRule) {
    s = applyEffects(s, [
      { kind: "modResource", resource: "power", delta: 1 },
      { kind: "addCardsToDeck", templateId: "fiscalBurden", count: 3 },
      { kind: "addPlayerStatus", templateId: "minorRegencyDoubt", turns: 99 },
    ]);
  } else {
    s = applyEffects(s, [
      { kind: "modResource", resource: "power", delta: -1 },
      { kind: "modResource", resource: "legitimacy", delta: -1 },
      { kind: "addCardsToDeck", templateId: "fiscalBurden", count: 1 },
    ]);
  }
  if (s.outcome !== "playing") return s;
  s = enforceLegitimacy(s);
  if (s.outcome !== "playing") return s;
  s = markSlotResolvedWithLeagueProgress(s, slot);
  return appendActionLog(s, { kind: "eventLouisXivLegacyChoice", slot, directRule });
}

function canHandleActionPhasePick(state: GameState): boolean {
  return state.outcome === "playing" && state.phase === "action" && !state.pendingInteraction;
}

type BridgeRule = {
  canHandle: (action: GameAction) => boolean;
  apply: (state: GameState, action: GameAction) => GameState | null;
};

const BRIDGE_RULES: readonly BridgeRule[] = [
  {
    canHandle: (action) => action.type === "PICK_NANTES_TOLERANCE",
    apply: (state, action) => {
      if (action.type !== "PICK_NANTES_TOLERANCE") return null;
      if (!canHandleActionPhasePick(state)) return null;
      const ev = state.slots[action.slot];
      if (!ev || ev.resolved || ev.templateId !== "revocationNantes") return null;
      return appendInflationActivationLogIfNeeded(state, performPickNantesTolerance(state, action.slot));
    },
  },
  {
    canHandle: (action) => action.type === "PICK_NANTES_CRACKDOWN",
    apply: (state, action) => {
      if (action.type !== "PICK_NANTES_CRACKDOWN") return null;
      if (!canHandleActionPhasePick(state)) return null;
      const ev = state.slots[action.slot];
      if (!ev || ev.resolved || ev.templateId !== "revocationNantes") return null;
      return appendInflationActivationLogIfNeeded(state, performPickNantesCrackdown(state, action.slot));
    },
  },
  {
    canHandle: (action) => action.type === "PICK_LOCAL_WAR_ATTACK",
    apply: (state, action) => {
      if (action.type !== "PICK_LOCAL_WAR_ATTACK") return null;
      if (!canHandleActionPhasePick(state)) return null;
      if (!canLocalWarAttack(state, action.slot)) return null;
      return appendInflationActivationLogIfNeeded(state, performLocalWarAttack(state, action.slot));
    },
  },
  {
    canHandle: (action) => action.type === "PICK_LOCAL_WAR_APPEASE",
    apply: (state, action) => {
      if (action.type !== "PICK_LOCAL_WAR_APPEASE") return null;
      if (!canHandleActionPhasePick(state)) return null;
      const ev = state.slots[action.slot];
      if (!ev || ev.resolved || ev.templateId !== "localWar") return null;
      return appendInflationActivationLogIfNeeded(state, performLocalWarAppease(state, action.slot));
    },
  },
  {
    canHandle: (action) => action.type === "PICK_SUCCESSION_CRISIS",
    apply: (state, action) => {
      if (action.type !== "PICK_SUCCESSION_CRISIS") return null;
      if (state.levelId !== THIRD_MANDATE_LEVEL_ID) return null;
      if (!canHandleActionPhasePick(state)) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performSuccessionCrisisPick(state, action.slot, action.pay),
      );
    },
  },
  {
    canHandle: (action) => action.type === "PICK_UTRECHT_TREATY",
    apply: (state, action) => {
      if (action.type !== "PICK_UTRECHT_TREATY") return null;
      if (state.levelId !== THIRD_MANDATE_LEVEL_ID) return null;
      if (!canHandleActionPhasePick(state)) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performUtrechtTreatyPick(state, action.slot, action.endWar),
      );
    },
  },
  {
    canHandle: (action) => action.type === "PICK_DUAL_FRONT_CRISIS",
    apply: (state, action) => {
      if (action.type !== "PICK_DUAL_FRONT_CRISIS") return null;
      if (state.levelId !== THIRD_MANDATE_LEVEL_ID) return null;
      if (!canHandleActionPhasePick(state)) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performDualFrontCrisisPick(state, action.slot, action.expandWar),
      );
    },
  },
  {
    canHandle: (action) => action.type === "PICK_LOUIS_XIV_LEGACY",
    apply: (state, action) => {
      if (action.type !== "PICK_LOUIS_XIV_LEGACY") return null;
      if (state.levelId !== THIRD_MANDATE_LEVEL_ID) return null;
      if (!canHandleActionPhasePick(state)) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performLouisXivLegacyPick(state, action.slot, action.directRule),
      );
    },
  },
];

/** Sun King campaign reducer slice; return null to defer to the core reducer. */
export function trySunkingCampaignReducerBridge(state: GameState, action: GameAction): GameState | null {
  for (const rule of BRIDGE_RULES) {
    if (!rule.canHandle(action)) continue;
    return rule.apply(state, action);
  }
  return null;
}

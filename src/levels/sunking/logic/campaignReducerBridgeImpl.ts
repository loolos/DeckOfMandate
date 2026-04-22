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

const SUNKING_LEVEL_IDS = new Set(["firstMandate", "secondMandate", "thirdMandate"]);

function isSunkingLevel(levelId: string): boolean {
  return SUNKING_LEVEL_IDS.has(levelId);
}

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

/** Sun King campaign reducer slice; return null to defer to the core reducer. */
export function trySunkingCampaignReducerBridge(state: GameState, action: GameAction): GameState | null {
  if (action.type === "PICK_NANTES_TOLERANCE" || action.type === "PICK_NANTES_CRACKDOWN") {
    if (!isSunkingLevel(state.levelId)) return null;
    if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return null;
    const ev = state.slots[action.slot];
    if (!ev || ev.resolved || ev.templateId !== "revocationNantes") return null;
    if (action.type === "PICK_NANTES_TOLERANCE") {
      return appendInflationActivationLogIfNeeded(state, performPickNantesTolerance(state, action.slot));
    }
    return appendInflationActivationLogIfNeeded(state, performPickNantesCrackdown(state, action.slot));
  }

  if (state.levelId !== THIRD_MANDATE_LEVEL_ID) return null;
  switch (action.type) {
    case "PICK_SUCCESSION_CRISIS": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performSuccessionCrisisPick(state, action.slot, action.pay),
      );
    }
    case "PICK_UTRECHT_TREATY": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performUtrechtTreatyPick(state, action.slot, action.endWar),
      );
    }
    case "PICK_DUAL_FRONT_CRISIS": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performDualFrontCrisisPick(state, action.slot, action.expandWar),
      );
    }
    case "PICK_LOUIS_XIV_LEGACY": {
      if (state.outcome !== "playing" || state.phase !== "action" || state.pendingInteraction) return null;
      return appendInflationActivationLogIfNeeded(
        state,
        performLouisXivLegacyPick(state, action.slot, action.directRule),
      );
    }
    default:
      return null;
  }
}

import type { GameAction } from "../../../../app/gameReducer";
import type { GameState } from "../../../../types/game";
import { EVENT_SLOT_ORDER, type SlotId } from "../../../types/event";

type ThirdMandateCardPriorityContext = {
  unresolvedHarmful: boolean;
  unresolvedRisingGrain: boolean;
  hasContainmentStatus: boolean;
  canFundingUnlockHarmfulSolve: boolean;
};

function firstUnresolvedSlotByTemplate(state: GameState, templateId: string): SlotId | null {
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    if (ev.templateId === templateId) return slot;
  }
  return null;
}

function countFiscalBurdenInstances(state: GameState): number {
  let n = 0;
  for (const inst of Object.values(state.cardsById)) {
    if (inst?.templateId === "fiscalBurden") n += 1;
  }
  return n;
}

export function pickThirdMandateChoiceActions(state: GameState): GameAction[] {
  if (state.levelId !== "thirdMandate") return [];
  const { power, legitimacy } = state.resources;

  const successionSlot = firstUnresolvedSlotByTemplate(state, "successionCrisis");
  if (successionSlot) {
    const pay = state.resources.funding >= 3;
    return [{ type: "PICK_SUCCESSION_CRISIS", slot: successionSlot, pay }];
  }

  const dualSlot = firstUnresolvedSlotByTemplate(state, "dualFrontCrisis");
  if (dualSlot) {
    const expandWar = legitimacy >= 2;
    return [{ type: "PICK_DUAL_FRONT_CRISIS", slot: dualSlot, expandWar }];
  }

  const legacySlot = firstUnresolvedSlotByTemplate(state, "louisXivLegacy1715");
  if (legacySlot) {
    const burdens = countFiscalBurdenInstances(state);
    const directRule = power <= 2 || (power <= 3 && legitimacy <= 4) || (burdens < 3 && legitimacy >= 7);
    return [{ type: "PICK_LOUIS_XIV_LEGACY", slot: legacySlot, directRule }];
  }

  const utrechtSlot = firstUnresolvedSlotByTemplate(state, "utrechtTreaty");
  if (utrechtSlot) {
    // For win-rate optimization, lock settlement immediately once Utrecht appears:
    // this removes opponent pressure and stops late-track collapses.
    return [{ type: "PICK_UTRECHT_TREATY", slot: utrechtSlot, endWar: true }];
  }

  return [];
}

export function cardPlayPriorityThirdMandate(
  state: GameState,
  cardInstanceId: string,
  context: ThirdMandateCardPriorityContext,
): number {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return 1_000;
  const tmpl = inst.templateId;
  const tr = state.successionTrack;
  const burdens = countFiscalBurdenInstances(state);
  const { unresolvedHarmful, unresolvedRisingGrain, hasContainmentStatus, canFundingUnlockHarmfulSolve } = context;

  switch (tmpl) {
    case "bourbonMarriageProclamation":
      return tr < 6 ? 3 : 20;
    case "grandAllianceInfiltrationDiplomacy":
      return tr < 5 ? 4 : 18;
    case "italianTheaterTroopRedeploy":
      return tr < 5 && burdens < 12 ? 5 : 22;
    case "usurpationEdict":
      return tr <= 2 && state.resources.legitimacy >= 6 ? 6 : 38;
    case "funding":
      if (canFundingUnlockHarmfulSolve) return 1;
      if (unresolvedHarmful) return 10;
      return 16;
    case "crackdown":
    case "diplomaticIntervention":
      return unresolvedHarmful ? (state.resources.power <= 2 ? 7 : 2) : 70;
    case "grainRelief":
      return unresolvedRisingGrain ? 2 : state.resources.legitimacy <= 6 ? 4 : 22;
    case "diplomaticCongress":
      return state.resources.power < 6 ? 2 : state.resources.power < 8 ? 4 : 24;
    case "taxRebalance":
      return state.resources.treasuryStat < 3 ? 5 : state.resources.treasuryStat < 5 ? 12 : 35;
    case "development":
      return state.resources.treasuryStat < 5 ? 3 : state.resources.treasuryStat < 7 ? 6 : 24;
    case "reform":
      return state.resources.power < 5 ? 2 : state.resources.power < 7 ? 5 : 24;
    case "ceremony":
      return state.resources.legitimacy < 6 ? 3 : state.resources.legitimacy < 9 ? 7 : 26;
    case "suppressHuguenots":
      return hasContainmentStatus ? 7 : 90;
    case "jesuitCollege": {
      const jansenistSlot = firstUnresolvedSlotByTemplate(state, "jansenistTension");
      if (jansenistSlot) return 2;
      return state.resources.legitimacy < 9 ? 5 : 12;
    }
    default:
      return 30;
  }
}

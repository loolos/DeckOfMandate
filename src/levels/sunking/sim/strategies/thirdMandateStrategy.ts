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
    // Expanding costs 1 legitimacy immediately; with a thin buffer that risks
    // the legitimacy defeat more than −3 track risks the succession defeat.
    const expandWar = legitimacy >= 4;
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
  const nearDefeatTrack = tr <= -6;
  const highPressure = unresolvedHarmful || nearDefeatTrack;
  switch (tmpl) {
    case "bourbonMarriageProclamation":
      if (nearDefeatTrack) return 0;
      return tr < 6 ? 2 : 20;
    case "grandAllianceInfiltrationDiplomacy":
      if (nearDefeatTrack) return 1;
      return tr < 5 ? 3 : 18;
    case "italianTheaterTroopRedeploy":
      if (nearDefeatTrack && burdens < 14) return 3;
      return tr < 5 && burdens < 12 ? 5 : 22;
    case "usurpationEdict": {
      // legitimacyCrisis bleeds 1 legitimacy per year for two years; require a
      // buffer and never stack a second edict while one crisis is running.
      const hasLegitimacyCrisis = state.playerStatuses.some((st) => st.templateId === "legitimacyCrisis");
      if (hasLegitimacyCrisis) return 38;
      if (nearDefeatTrack && state.resources.legitimacy >= 4) return 4;
      return tr <= 2 && state.resources.legitimacy >= 5 ? 6 : 38;
    }
    case "funding":
      if (canFundingUnlockHarmfulSolve) return 1;
      if (highPressure) return 8;
      return 16;
    case "crackdown":
    case "diplomaticIntervention":
      return unresolvedHarmful ? (state.resources.power <= 2 ? 7 : 2) : 70;
    case "grainRelief":
      if (state.resources.legitimacy <= 5) return 1;
      return unresolvedRisingGrain ? 2 : state.resources.legitimacy <= 7 ? 4 : 22;
    case "diplomaticCongress":
      if (nearDefeatTrack) return state.resources.power < 7 ? 2 : 6;
      return state.resources.power < 6 ? 2 : state.resources.power < 8 ? 4 : 24;
    case "taxRebalance":
      // Draw-penalty side effect slows deck cycling; only for real treasury emergencies.
      return state.resources.treasuryStat < 3 ? 5 : state.resources.treasuryStat < 5 ? 12 : 35;
    case "development": {
      // Treasury is next year's funding income: during the war, income pays for
      // both event solves and succession-contest plays, so build it up early.
      const atWar = state.opponentHabsburgUnlocked && !state.warEnded;
      if (state.resources.treasuryStat < 7) return 3;
      if (atWar && state.resources.treasuryStat < 13) return 8;
      return 24;
    }
    case "reform": {
      // Power feeds draw attempts (breakpoints at 7 and 11); more draws cycle
      // succession cards back faster. Reform also replaces itself with a draw.
      const atWar = state.opponentHabsburgUnlocked && !state.warEnded;
      if (state.resources.power < 5) return 2;
      if (state.resources.power < 7) return 5;
      if (atWar && state.resources.power < 11) return 9;
      return 24;
    }
    case "ceremony":
      if (state.resources.legitimacy <= 6) return 1;
      return state.resources.legitimacy < 9 ? 4 : 26;
    case "suppressHuguenots":
      return hasContainmentStatus ? 7 : 90;
    case "jesuitCollege": {
      if (state.resources.legitimacy <= 4) return 1;
      const jansenistSlot = firstUnresolvedSlotByTemplate(state, "jansenistTension");
      if (jansenistSlot) return 2;
      return state.resources.legitimacy < 9 ? 5 : 12;
    }
    default:
      return 30;
  }
}

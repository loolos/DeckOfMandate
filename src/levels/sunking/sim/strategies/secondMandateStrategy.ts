import { antiFrenchSentimentEventSolveCostPenalty } from "../../../../logic/antiFrenchSentiment";
import { getPlayableCardCost } from "../../../../logic/cardCost";
import type { GameAction } from "../../../../app/gameReducer";
import type { GameState } from "../../../../types/game";
import { getLevelDef } from "../../../../data/levels";
import { currentCalendarYear } from "../../../../logic/scriptedCalendar";
import { EVENT_SLOT_ORDER, type SlotId } from "../../../types/event";

export type SecondMandateChoiceOptions = {
  nantesChoice?: "crackdown" | "tolerance";
};

type SecondMandateCardPriorityContext = {
  unresolvedHarmful: boolean;
  unresolvedRyswickPeace: boolean;
  unresolvedRisingGrain: boolean;
  hasContainmentStatus: boolean;
  canFundingUnlockHarmfulSolve: boolean;
  canFundingUnlockRyswick: boolean;
};

function firstUnresolvedSlotByTemplate(state: GameState, templateId: string): SlotId | null {
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    if (ev.templateId === templateId) return slot;
  }
  return null;
}

/** Gated chapter-2 win is available on the next `END_YEAR` (calendar + flags + min legitimacy). */
function secondMandateGatedVictoryReady(state: GameState): boolean {
  if (state.levelId !== "secondMandate") return false;
  const vr = getLevelDef("secondMandate").victoryRule;
  if (vr.kind !== "gated") return false;
  if (currentCalendarYear(state) < vr.earliestCalendarYear) return false;
  if (state.europeAlert) return false;
  if (state.playerStatuses.some((s) => s.templateId === "huguenotContainment")) return false;
  return state.resources.legitimacy >= vr.minLegitimacy;
}

export function pickSecondMandateChoiceActions(
  state: GameState,
  options: SecondMandateChoiceOptions = {},
): GameAction[] {
  if (state.levelId !== "secondMandate") return [];
  const nantesSlot = firstUnresolvedSlotByTemplate(state, "revocationNantes");
  if (nantesSlot) {
    const choice =
      options.nantesChoice ??
      // Prefer tolerance for long-run consistency; only switch to crackdown when legitimacy is fragile.
      (state.resources.legitimacy <= 4 ? "crackdown" : "tolerance");
    if (choice === "tolerance") {
      return [{ type: "PICK_NANTES_TOLERANCE", slot: nantesSlot }];
    }
    return [{ type: "PICK_NANTES_CRACKDOWN", slot: nantesSlot }];
  }
  const localWarSlot = firstUnresolvedSlotByTemplate(state, "localWar");
  if (localWarSlot) {
    const cost = Math.floor(state.europeAlertProgress / 2) + antiFrenchSentimentEventSolveCostPenalty(state);
    if (state.resources.funding >= cost) {
      // Attack can randomly drop power by 1; avoid coin-flip defeat when power is already at 1.
      if (state.resources.power <= 1 && state.resources.legitimacy > 1) {
        return [{ type: "PICK_LOCAL_WAR_APPEASE", slot: localWarSlot }];
      }
      return [{ type: "PICK_LOCAL_WAR_ATTACK", slot: localWarSlot }];
    }
    const canPlayFundingCardNow = state.hand.some((id) => {
      const inst = state.cardsById[id];
      if (!inst || inst.templateId !== "funding") return false;
      return state.resources.funding >= getPlayableCardCost(state, id);
    });
    if (canPlayFundingCardNow) {
      return [];
    }
    return [{ type: "PICK_LOCAL_WAR_APPEASE", slot: localWarSlot }];
  }
  return [];
}

export function cardPlayPrioritySecondMandate(
  state: GameState,
  cardInstanceId: string,
  context: SecondMandateCardPriorityContext,
): number {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return 1_000;
  const tmpl = inst.templateId;
  const {
    unresolvedHarmful,
    unresolvedRyswickPeace,
    unresolvedRisingGrain,
    hasContainmentStatus,
    canFundingUnlockHarmfulSolve,
    canFundingUnlockRyswick,
  } = context;
  const treasury = state.resources.treasuryStat;
  const power = state.resources.power;
  const legitimacy = state.resources.legitimacy;
  const hasUrgentStabilizationNeed = unresolvedHarmful || power <= 4 || legitimacy <= 5;
  const vr = getLevelDef("secondMandate").victoryRule;
  /** Slightly raise `development` / `taxRebalance` ceiling only when win is already locked and board is clean. */
  const treasuryPushCeiling =
    state.levelId === "secondMandate" &&
    vr.kind === "gated" &&
    secondMandateGatedVictoryReady(state) &&
    !unresolvedHarmful &&
    !unresolvedRyswickPeace &&
    !unresolvedRisingGrain &&
    currentCalendarYear(state) >= vr.earliestCalendarYear + 3 &&
    legitimacy >= 8 &&
    power >= 6
      ? 9
      : 8;
  const shouldPushTreasury = !hasUrgentStabilizationNeed && treasury < treasuryPushCeiling;
  switch (tmpl) {
    case "funding":
      if (canFundingUnlockRyswick) return 0;
      if (canFundingUnlockHarmfulSolve) return 1;
      if (unresolvedRyswickPeace) return 8;
      if (unresolvedHarmful) return 10;
      return 16;
    case "crackdown":
    case "diplomaticIntervention":
      return unresolvedHarmful ? (state.resources.power <= 2 ? 7 : 2) : 70;
    case "grainRelief":
      if (state.resources.legitimacy <= 4) return 1;
      return unresolvedRisingGrain ? 2 : state.resources.legitimacy <= 6 ? 4 : 22;
    case "diplomaticCongress":
      return state.resources.power < 6 ? 2 : state.resources.power < 8 ? 4 : 24;
    case "taxRebalance":
      if (shouldPushTreasury && treasury < 6) return 2;
      if (shouldPushTreasury && treasury < treasuryPushCeiling) return 4;
      return treasury < 3 ? 5 : treasury < 5 ? 12 : 35;
    case "development":
      if (shouldPushTreasury && treasury < 6) return 1;
      if (shouldPushTreasury && treasury < treasuryPushCeiling) return 3;
      return treasury < 5 ? 3 : treasury < 7 ? 6 : 24;
    case "reform":
      return state.resources.power < 5 ? 2 : state.resources.power < 7 ? 5 : 24;
    case "ceremony":
      if (legitimacy <= 4) return 1;
      return legitimacy < 6 ? 3 : legitimacy < 9 ? 7 : 26;
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

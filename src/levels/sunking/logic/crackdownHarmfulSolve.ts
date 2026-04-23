import { markSlotResolvedWithLeagueProgress } from "../../../logic/eventSlotOps";
import { opponentImmediateExtraDraw } from "../../../logic/opponentHabsburg";
import type { GameState } from "../../../types/game";
import type { EventTemplateId } from "../../types/event";
import type { SlotId } from "../../types/event";
import { attemptNineYearsWarCampaign } from "./fundSolve";

/**
 * Sun King: harmful-event resolution when the player uses crackdown / diplomatic intervention.
 */
export function stateAfterHarmfulEventCrackdown(
  state: GameState,
  slot: SlotId,
  clearedTemplateId: EventTemplateId,
  fundingPaid: number,
): GameState {
  let s =
    clearedTemplateId === "nineYearsWar"
      ? attemptNineYearsWarCampaign(state, slot, "intervention", fundingPaid)
      : markSlotResolvedWithLeagueProgress(state, slot);
  if (clearedTemplateId === "imperialElectorsMood") {
    s = opponentImmediateExtraDraw(s, 1);
  }
  return s;
}

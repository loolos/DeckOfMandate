import { getEventTemplate } from "../../../data/events";
import { applyEffects } from "../../../logic/applyEffects";
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
  if (clearedTemplateId === "nineYearsWar") {
    return attemptNineYearsWarCampaign(state, slot, "intervention", fundingPaid);
  }
  const tmpl = getEventTemplate(clearedTemplateId);
  let s = state;
  if (tmpl.onFundSolveEffects && tmpl.onFundSolveEffects.length > 0) {
    s = applyEffects(s, tmpl.onFundSolveEffects);
  }
  if (
    (clearedTemplateId === "bavarianCourtRealignment" || clearedTemplateId === "imperialElectorsMood") &&
    s.outcome === "playing"
  ) {
    s = opponentImmediateExtraDraw(s, 1);
  }
  s = markSlotResolvedWithLeagueProgress(s, slot);
  return s;
}

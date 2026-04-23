import type { EventTemplateId } from "../../types/event";
import type { GameState } from "../../../types/game";

/** Campaign flags applied after a successful scripted-calendar attack resolves a slot. */
export function applyScriptedAttackCampaignFlags(state: GameState, templateId: EventTemplateId): GameState {
  if (templateId === "warOfDevolution") {
    return { ...state, warOfDevolutionAttacked: true };
  }
  return state;
}

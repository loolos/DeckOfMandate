import { getEventTemplate } from "../../../data/events";
import type { SlotId } from "../../types/event";
import type { GameState } from "../../../types/game";
import { appendActionLog } from "./actionLog";
import { applyEffects, enforceLegitimacy } from "../../../logic/applyEffects";
import {
  completeSuccessionCrisisAndRevealOpponent,
  stateAfterUtrechtTreatyEndsWar,
} from "./opponentHabsburg";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

export function handleThirdMandateSuccessionCrisisAtEoy(
  state: GameState,
  slot: SlotId,
): { state: GameState; handled: boolean } {
  const ev = state.slots[slot];
  if (!ev || state.levelId !== THIRD_MANDATE_LEVEL_ID || ev.templateId !== "successionCrisis") {
    return { state, handled: false };
  }
  const tmpl = getEventTemplate(ev.templateId);
  let s = appendActionLog(state, {
    kind: "eventYearEndPenalty",
    slot,
    templateId: ev.templateId,
    effects: tmpl.penaltiesIfUnresolved,
  });
  s = applyEffects(s, tmpl.penaltiesIfUnresolved);
  s = enforceLegitimacy(s);
  if (s.outcome !== "playing") return { state: s, handled: true };
  s = completeSuccessionCrisisAndRevealOpponent(s, slot);
  return { state: s, handled: true };
}

export function handleThirdMandateUtrechtAtEoy(
  state: GameState,
  slot: SlotId,
): { state: GameState; handled: boolean } {
  const ev = state.slots[slot];
  if (!ev || state.levelId !== THIRD_MANDATE_LEVEL_ID || ev.templateId !== "utrechtTreaty") {
    return { state, handled: false };
  }
  const raw = state.utrechtTreatyCountdown ?? 6;
  const next = raw - 1;
  if (next <= 0) {
    return { state: stateAfterUtrechtTreatyEndsWar(state, slot), handled: true };
  }
  return { state: { ...state, utrechtTreatyCountdown: next }, handled: true };
}

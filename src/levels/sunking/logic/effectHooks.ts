import type { GameState } from "../../../types/game";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

/** Instant win/loss on succession track at ±10 (chapter 3). */
export function enforceSuccessionImmediateOutcomeHook(s: GameState): GameState {
  if (s.levelId !== THIRD_MANDATE_LEVEL_ID || s.outcome !== "playing") return s;
  if (s.resources.power <= 0 || s.resources.legitimacy <= 0) {
    return { ...s, phase: "gameOver", outcome: "defeatLegitimacy" };
  }
  if (s.warEnded) return s;
  if (s.successionTrack >= 10) {
    return { ...s, phase: "gameOver", outcome: "victory", successionOutcomeTier: null };
  }
  if (s.successionTrack <= -10) {
    return { ...s, phase: "gameOver", outcome: "defeatSuccession", successionOutcomeTier: null };
  }
  return s;
}

export function canApplyOpponentHandDiscardNow(state: GameState): boolean {
  return state.levelId === THIRD_MANDATE_LEVEL_ID && state.opponentHabsburgUnlocked && !state.warEnded;
}

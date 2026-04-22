import type { GameState } from "../../../types/game";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

/** Chapter 3 post-Utrecht: succession track no longer moves from card/effects while `warEnded`. */
export function shouldBlockModSuccessionTrackWhenWarEnded(state: GameState): boolean {
  return state.levelId === THIRD_MANDATE_LEVEL_ID && state.warEnded;
}

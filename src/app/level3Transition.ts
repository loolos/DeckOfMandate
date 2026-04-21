import type { GameState } from "../types/game";
import { createInitialState } from "./initialState";

export const SUNKING_CH3_ID = "thirdMandate" as const;

/** Continue from chapter 2 victory; unresolved Nantes event defaults to crackdown for chapter 3. */
export function buildLevel3StateFromChapter2(ch2End: GameState, seed?: number): GameState {
  const policy = ch2End.nantesPolicyCarryover ?? "crackdown";
  return createInitialState(seed, SUNKING_CH3_ID, { nantesPolicyCarryover: policy });
}

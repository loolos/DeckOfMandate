import type { GameState } from "../types/game";
import {
  applyRemovedIndicesToLevel3Draft,
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
  createStandaloneLevel3Draft,
  LEVEL3_CONTINUITY_MAX_REMOVALS,
  validateLevel3Draft,
  type Level3ContinuityDraft,
  type Level3StandaloneDraft,
  type Level3StartDraft,
} from "../levels/sunking/chapter3Transition";

export {
  applyRemovedIndicesToLevel3Draft,
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
  createStandaloneLevel3Draft,
  LEVEL3_CONTINUITY_MAX_REMOVALS,
  validateLevel3Draft,
  type Level3ContinuityDraft,
  type Level3StandaloneDraft,
  type Level3StartDraft,
};

export const SUNKING_CH3_ID = "thirdMandate" as const;

/** Continue from chapter 2 victory: inherit deck snapshot, resources, calendar anchor; six new cards go to the opening hand. */
export function buildLevel3StateFromChapter2(ch2End: GameState, seed?: number): GameState {
  const draft = createContinuityLevel3Draft(ch2End, seed);
  return buildLevel3StateFromDraft(draft);
}

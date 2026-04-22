import type { GameState } from "../types/game";
import type { Level3ContinuityDraft, Level3StandaloneDraft, Level3StartDraft } from "../types/continuity";
import {
  applyRemovedIndicesToLevel3Draft,
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
  createStandaloneLevel3Draft,
  LEVEL3_CONTINUITY_MAX_REMOVALS,
  validateLevel3Draft,
} from "../levels/campaignChapterTransitions";

export type { Level3ContinuityDraft, Level3StandaloneDraft, Level3StartDraft };
export {
  applyRemovedIndicesToLevel3Draft,
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
  createStandaloneLevel3Draft,
  LEVEL3_CONTINUITY_MAX_REMOVALS,
  validateLevel3Draft,
};

export const SUNKING_CH3_ID = "thirdMandate" as const;

/** Continue from chapter 2 victory: inherit deck snapshot, resources, calendar anchor; six new chapter-3 cards shuffle into the full library. */
export function buildLevel3StateFromChapter2(ch2End: GameState, seed?: number): GameState {
  const draft = createContinuityLevel3Draft(ch2End, seed);
  return buildLevel3StateFromDraft(draft);
}

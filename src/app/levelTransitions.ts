/**
 * App-facing chapter transition API (chapters 2–3). Implementation lives under
 * `src/levels/campaignChapterTransitions.ts` → sunking chapter modules.
 */
import type { GameState } from "../types/game";
import {
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
} from "../levels/campaignChapterTransitions";

export type {
  Level2CarryoverCard,
  Level2ContinuityDraft,
  Level2StandaloneDraft,
  Level2StartDraft,
  Level2StartMode,
  Level2Validation,
} from "../types/continuity";
export { CONTINUITY_REFIT_MAX_CARD_REMOVALS as LEVEL2_CONTINUITY_MAX_REMOVALS } from "../types/continuity";
export {
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
  getLevel2RefitNewCardsLabelKey,
  getLevel2RefitNewCardsTemplateOrder,
  SUNKING_CH1_ID,
  SUNKING_CH2_ID,
  toggleContinuityCardRemoval,
  validateLevel2ContinuityRefit,
  validateLevel2Draft,
} from "../levels/campaignChapterTransitions";

export type { Level3ContinuityDraft, Level3StandaloneDraft, Level3StartDraft } from "../types/continuity";
export {
  applyRemovedIndicesToLevel3Draft,
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
  createStandaloneLevel3Draft,
  getLevel3RefitNewCardsLabelKey,
  getLevel3RefitNewCardsTemplateOrder,
  LEVEL3_CONTINUITY_MAX_REMOVALS,
  SUNKING_CH3_ID,
  validateLevel3Draft,
} from "../levels/campaignChapterTransitions";

/** Continue from chapter 2 victory: inherit deck snapshot, resources, calendar anchor; six new chapter-3 cards shuffle into the full library. */
export function buildLevel3StateFromChapter2(ch2End: GameState, seed?: number): GameState {
  const draft = createContinuityLevel3Draft(ch2End, seed);
  return buildLevel3StateFromDraft(draft);
}

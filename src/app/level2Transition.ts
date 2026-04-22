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
  LEVEL2_FIXED_NEW_IDS,
  SUNKING_CH1_ID,
  SUNKING_CH2_ID,
  toggleContinuityCardRemoval,
  validateLevel2ContinuityRefit,
  validateLevel2Draft,
} from "../levels/campaignChapterTransitions";

/**
 * Single import path for campaign-specific logic used by `src/logic` façades.
 * Re-exports Sun King implementations from `./sunking/logic/*` (glob-merge can extend this later).
 */
export { appendActionLog, MAX_ACTION_LOG, type ActionLogPayload } from "./sunking/logic/actionLog";
export {
  cardLabelWithIcon,
  eventLabelWithIcon,
  getCardTypeEmoji,
  getResourceIcon,
  opponentBudgetEmojiPips,
  resourceLabelWithIcon,
} from "./sunking/logic/icons";
export { isHistoricalEventTemplateId } from "./sunking/logic/eventTags";
export {
  chooseOpponentPlay,
  completeSuccessionCrisisAndRevealOpponent,
  initOpponentHabsburgPool,
  unlockHabsburgOpponentForContinuityChapterStart,
  opponentBeginYearDrawPhase,
  opponentDrawFromDeck,
  opponentEndYearPlayPhase,
  opponentImmediateExtraDraw,
  opponentTemplatesToAppliedEffects,
  stateAfterUtrechtTreatyEndsWar,
  utrechtTreatySituationTier,
} from "./sunking/logic/opponentHabsburg";
export {
  handleThirdMandateSuccessionCrisisAtEoy,
  handleThirdMandateUtrechtAtEoy,
} from "./sunking/logic/resolveEventsHooks";
export {
  canApplyOpponentHandDiscardNow,
  enforceSuccessionImmediateOutcomeHook,
} from "./sunking/logic/effectHooks";
export { onScriptedCalendarPlacement } from "./sunking/logic/scriptedCalendarHooks";
export {
  ANTI_FRENCH_SENTIMENT_TRIGGER_SUM,
  antiFrenchSentimentActive,
  antiFrenchSentimentEmotionValue,
  antiFrenchSentimentEventSolveCostPenalty,
  antiFrenchSentimentRyswickSurcharge,
} from "./sunking/logic/antiFrenchSentiment";
export {
  registerNantesStarterCardsForThirdMandate,
  resolveThirdMandateNantesPolicy,
} from "./sunking/logic/thirdMandateStart";
export { OPPONENT_AI_NEAR_WIN_THRESHOLD, THIRD_MANDATE_LEVEL_ID } from "./sunking/logic/thirdMandateConstants";
export { limitedUseCardDepletionPenalty } from "./sunking/logic/limitedUseCardDepletion";
export { shouldBlockModSuccessionTrackWhenWarEnded } from "./sunking/logic/applyEffectsSuccessionGate";
export {
  cardPlayOpensCrackdownPicker,
  shouldEnforceCampaignConsumeInvariant,
  shouldDeferPlayedCardEffectApplication,
} from "./sunking/logic/playedCardTemplatePolicy";
export {
  applySunkingPlayCardExtras as applyCampaignPlayCardExtras,
  maybeAppendHuguenotContainmentClearedLog,
} from "./sunking/logic/playCardExtras";
export { applyScriptedAttackCampaignFlags } from "./sunking/logic/scriptedAttackFollowup";
export { stateAfterHarmfulEventCrackdown } from "./sunking/logic/crackdownHarmfulSolve";
export { applyAntiFrenchContainmentDeckAfterRetentionYear } from "./sunking/logic/eoyRetentionCampaign";
export { attemptNineYearsWarCampaign, performFundSolve } from "./sunking/logic/fundSolve";
export {
  maybeAddEuropeAlertSupplementalEventHook,
  maybeAddReligiousTensionEventHook,
  maybeAdjustEuropeAlertProgressAtYearStartHook,
  maybeTriggerHuguenotResurgenceHook,
  syncAntiFrenchSentimentStatusHook,
} from "./sunking/logic/turnFlowHooks";

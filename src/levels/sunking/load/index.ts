/** Unified SunKing package entry (registration + templates + locales + logic). */
import "../registerCampaign";

export { registerSunking } from "../registerCampaign";
export { cardTemplates as sunkingCardTemplates } from "../templates/cards";
export { eventTemplates as sunkingEventTemplates } from "../templates/events";
export { statusTemplates as sunkingStatusTemplates } from "../templates/statusTemplates";
export { sunkingMessagesEn, sunkingMessagesFr, sunkingMessagesZh } from "../sunkingLocales";
export { sunkingMessages, sunkingTemplates } from "./content";

export { appendActionLog, MAX_ACTION_LOG } from "../logic/actionLog";
export type { ActionLogPayload } from "../logic/actionLog";
export {
  cardLabelWithIcon,
  eventLabelWithIcon,
  getCardTypeEmoji,
  getResourceIcon,
  opponentBudgetEmojiPips,
  resourceLabelWithIcon,
} from "../logic/icons";
export { isHistoricalEventTemplateId } from "../logic/eventTags";
export {
  OPPONENT_AI_NEAR_WIN_THRESHOLD,
  THIRD_MANDATE_LEVEL_ID,
} from "../logic/thirdMandateConstants";
export {
  registerNantesStarterCardsForThirdMandate,
  resolveThirdMandateNantesPolicy,
} from "../logic/thirdMandateStart";
export {
  ANTI_FRENCH_SENTIMENT_TRIGGER_SUM,
  antiFrenchSentimentActive,
  antiFrenchSentimentEmotionValue,
  antiFrenchSentimentEventSolveCostPenalty,
  antiFrenchSentimentRyswickSurcharge,
} from "../logic/antiFrenchSentiment";
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
} from "../logic/opponentHabsburg";

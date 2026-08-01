/**
 * Builds the Sun King slice of a fresh `GameState` (every field declared in
 * `../types/gameStateAugmentation.ts`). The framework `createInitialState` owns only the
 * campaign-neutral core and merges whatever this returns.
 */
import { getCardTemplate } from "../../../data/cards";
import type { InitialStateOptions } from "../../../data/initialStateTypes";
import { getLevelContent } from "../../../data/levelContent";
import { getLevelDef, type LevelId } from "../../../data/levels";
import type { CampaignGameStateFields, Resources } from "../../../types/game";
import type { CardInstance } from "../../types/card";
import { EMPTY_PENDING_MAJOR_CRISIS } from "../../types/event";
import { SUNKING_CH2_ID } from "../chapter2Transition";
import { computeEuropeAlertPowerLoss } from "./europeAlert";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";
import { resolveThirdMandateNantesPolicy } from "./thirdMandateStart";

/** Chapter 2 standalone runs assume the chapter-1 military branch was taken. */
function defaultWarOfDevolutionAttacked(levelId: LevelId): boolean {
  return levelId === SUNKING_CH2_ID;
}

/** Chapter 3 standalone carryover inflates `inflation`-tagged cards up to this cost. */
function standaloneInflationTargetCost(levelId: LevelId): number | null {
  if (levelId !== THIRD_MANDATE_LEVEL_ID) return null;
  return getLevelContent(levelId).refit?.standaloneCarryoverSource?.inflationTargetCostByTag?.inflation ?? null;
}

export function buildSunkingInitialStateFields(
  levelId: LevelId,
  resources: Resources,
  options: InitialStateOptions | undefined,
): CampaignGameStateFields {
  const defaultEuropeAlert = getLevelDef(levelId).features.europeAlertMechanics;
  const europeAlert = options?.europeAlert ?? defaultEuropeAlert;
  const warOfDevolutionAttacked = options?.warOfDevolutionAttacked ?? defaultWarOfDevolutionAttacked(levelId);
  const europeAlertPowerLoss =
    options?.europeAlertPowerLoss ?? (europeAlert ? computeEuropeAlertPowerLoss(resources.power) : 0);
  const europeAlertProgress =
    options?.europeAlertProgress !== undefined
      ? options.europeAlertProgress
      : !europeAlert
        ? 0
        : defaultEuropeAlert
          ? warOfDevolutionAttacked
            ? 3
            : 1
          : 3;
  const nantesPolicyCarryover =
    levelId === THIRD_MANDATE_LEVEL_ID
      ? resolveThirdMandateNantesPolicy(options?.nantesPolicyCarryover ?? null)
      : null;

  return {
    nantesPolicyCarryover,
    antiFrenchLeague: null,
    warOfDevolutionAttacked,
    europeAlert,
    europeAlertPowerLoss,
    europeAlertProgress,
    nymwegenSettlementAchieved: false,
    huguenotResurgenceCounter: 0,
    nextTurnFundingIncomeModifier: 0,
    cardInflationById: {},
    pendingMajorCrisis: { ...EMPTY_PENDING_MAJOR_CRISIS },
    successionTrack: 0,
    opponentStrength: 3,
    greatPowerEncirclementHighPressureApplied: false,
    opponentHabsburgUnlocked: false,
    warEnded: false,
    utrechtTreatyCountdown: null,
    opponentDeck: [],
    opponentHand: [],
    opponentDiscard: [],
    opponentCostDiscountThisTurn: 0,
    opponentNextTurnDrawModifier: 0,
    opponentLastPlayedTemplateIds: [],
    successionOutcomeTier: null,
    utrechtSettlementTier: null,
  };
}

/**
 * Second pass, after the opening library is finalized: seeds per-instance inflation stacks,
 * which depend on the shuffled `cardsById`.
 */
export function finalizeSunkingInitialStateFields(
  fields: CampaignGameStateFields,
  levelId: LevelId,
  cardsById: Record<string, CardInstance>,
): CampaignGameStateFields {
  const targetCost = standaloneInflationTargetCost(levelId);
  if (targetCost == null) return fields;
  const cardInflationById: Record<string, number> = { ...fields.cardInflationById };
  for (const id of Object.keys(cardsById)) {
    const templateId = cardsById[id]?.templateId;
    if (!templateId) continue;
    const tmpl = getCardTemplate(templateId);
    if (!tmpl.tags.includes("inflation")) continue;
    cardInflationById[id] = Math.max(0, targetCost - tmpl.cost);
  }
  return { ...fields, cardInflationById };
}

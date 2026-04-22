import type { InitialStateOptions } from "../data/initialStateTypes";
import { getLevelInitialStateHooks } from "../data/levelInitialStateRegistry";
import { getLevelContent } from "../data/levelContent";
import { getDefaultLevelId, getLevelDef } from "../data/levels";
import { buildDefaultCardUsesById } from "../logic/cardUsage";
import { computeEuropeAlertPowerLoss } from "../logic/europeAlert";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../levels/types/card";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../levels/types/event";
import type { GameState, NantesPolicyCarryover } from "../types/game";

export type { InitialStateOptions } from "../data/initialStateTypes";

export function createInitialState(
  seed?: number,
  levelId = getDefaultLevelId(),
  options?: InitialStateOptions,
): GameState {
  const level = getLevelDef(levelId);
  const hooks = getLevelInitialStateHooks(levelId);
  const runSeed = ((seed ?? Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 0x9e3779b9;
  let rng = createRngFromSeed(runSeed);
  const baseResources = { ...level.startingResources, ...options?.startingResourcesOverride };
  const defaultEuropeAlert = level.features.europeAlertMechanics;
  const europeAlert = options?.europeAlert ?? defaultEuropeAlert;
  const warOfDevolutionAttacked =
    options?.warOfDevolutionAttacked ?? hooks?.defaultWarOfDevolutionAttackedWhenUnset?.() ?? false;
  const europeAlertPowerLoss =
    options?.europeAlertPowerLoss ?? (europeAlert ? computeEuropeAlertPowerLoss(baseResources.power) : 0);
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
  const resources = baseResources;

  const nantesPolicyCarryover: NantesPolicyCarryover | null =
    hooks?.resolveNantesPolicyCarryover?.(options?.nantesPolicyCarryover ?? null) ?? null;

  let starterDeckTemplateOrder =
    options?.starterDeckTemplateOrder ?? getLevelContent(levelId).starterDeckTemplateOrder;
  if (!options?.starterDeckTemplateOrder && hooks?.adjustDefaultStarterDeckOrder) {
    starterDeckTemplateOrder = hooks.adjustDefaultStarterDeckOrder(starterDeckTemplateOrder);
  }
  const deckOrder = starterDeckTemplateOrder.map((templateId, i) => ({
    instanceId: `${templateId}__${i}`,
    templateId: templateId as CardTemplateId,
  }));

  let cardsById: Record<string, CardInstance> = {};
  for (const c of deckOrder) {
    cardsById[c.instanceId] = { instanceId: c.instanceId, templateId: c.templateId };
  }

  let initialHandIds: string[] = [];
  let deckInstanceIds: string[];

  if (hooks?.shuffleOpeningDeckAndHand) {
    const opened = hooks.shuffleOpeningDeckAndHand({
      rng,
      levelId,
      deckOrder,
      cardsById,
      nantesPolicyCarryover,
      options,
    });
    rng = opened.rng;
    cardsById = opened.cardsById;
    initialHandIds = opened.initialHandIds;
    deckInstanceIds = opened.deckInstanceIds;
  } else {
    const [rng2, shuffled] = shuffle(rng, deckOrder);
    rng = rng2;
    deckInstanceIds = shuffled.map((c) => c.instanceId);
  }

  const cardUsesById = buildDefaultCardUsesById(levelId, cardsById);

  const cardInflationById: Record<string, number> = {
    ...(hooks?.seedOpeningCardInflationById?.(cardsById) ?? {}),
  };

  const base: GameState = {
    levelId,
    calendarStartYear: options?.calendarStartYearOverride ?? level.calendarStartYear,
    runSeed,
    rng,
    turn: 1,
    phase: "action",
    outcome: "playing",
    pendingInteraction: null,
    nextIds: { event: 0, status: 0, log: 0 },
    resources,
    nextTurnDrawModifier: 0,
    nextTurnFundingIncomeModifier: 0,
    scheduledDrawModifiers: [],
    deck: deckInstanceIds,
    discard: [],
    hand: initialHandIds,
    cardsById,
    cardUsesById,
    cardInflationById,
    slots: { ...EMPTY_EVENT_SLOTS },
    pendingMajorCrisis: { ...EMPTY_PENDING_MAJOR_CRISIS },
    nantesPolicyCarryover,
    playerStatuses: [],
    antiFrenchLeague: null,
    warOfDevolutionAttacked,
    europeAlert,
    europeAlertPowerLoss,
    europeAlertProgress,
    nymwegenSettlementAchieved: false,
    huguenotResurgenceCounter: 0,
    proceduralEventSequence: [],
    proceduralEventPoolOrder: [],
    actionLog: [],
    successionTrack: 0,
    opponentStrength: 3,
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

  return beginYear(base);
}

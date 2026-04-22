import { getCardTemplate } from "../data/cards";
import { getLevelContent } from "../data/levelContent";
import { getDefaultLevelId, getLevelDef } from "../data/levels";
import { buildDefaultCardUsesById } from "../logic/cardUsage";
import { insertCardsIntoDeckAtRandomPositions } from "../logic/cardRuntime";
import { computeEuropeAlertPowerLoss } from "../logic/europeAlert";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../levels/types/card";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../levels/types/event";
import { registerNantesStarterCardsForThirdMandate, resolveThirdMandateNantesPolicy } from "../logic/thirdMandateStart";
import { THIRD_MANDATE_LEVEL_ID } from "../logic/thirdMandateConstants";
import type { GameState, NantesPolicyCarryover, Resources } from "../types/game";

type InitialStateOptions = {
  starterDeckTemplateOrder?: readonly CardTemplateId[];
  startingResourcesOverride?: Partial<Resources>;
  calendarStartYearOverride?: number;
  warOfDevolutionAttacked?: boolean;
  europeAlert?: boolean;
  europeAlertPowerLoss?: number;
  europeAlertProgress?: number;
  /** Chapter 3: mirrors chapter 2’s Nantes branch; omitted or null defaults to crackdown (镇压). */
  nantesPolicyCarryover?: NantesPolicyCarryover | null;
};
const STANDALONE_CH3_INFLATION_TARGET_COST = 4;

export function createInitialState(
  seed?: number,
  levelId = getDefaultLevelId(),
  options?: InitialStateOptions,
): GameState {
  const level = getLevelDef(levelId);
  const runSeed = ((seed ?? Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 0x9e3779b9;
  let rng = createRngFromSeed(runSeed);
  const baseResources = { ...level.startingResources, ...options?.startingResourcesOverride };
  const defaultEuropeAlert = level.features.europeAlertMechanics;
  const europeAlert = options?.europeAlert ?? defaultEuropeAlert;
  const warOfDevolutionAttacked =
    options?.warOfDevolutionAttacked ?? (levelId === "secondMandate" ? true : false);
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
    levelId === THIRD_MANDATE_LEVEL_ID
      ? resolveThirdMandateNantesPolicy(options?.nantesPolicyCarryover ?? null)
      : null;

  let starterDeckTemplateOrder =
    options?.starterDeckTemplateOrder ?? getLevelContent(levelId).starterDeckTemplateOrder;
  if (levelId === THIRD_MANDATE_LEVEL_ID && !options?.starterDeckTemplateOrder) {
    starterDeckTemplateOrder = starterDeckTemplateOrder.filter(
      (id) => id !== "funding" && id !== "crackdown",
    );
  }
  const deckOrder = starterDeckTemplateOrder.map((templateId, i) => ({
    instanceId: `${templateId}__${i}`,
    templateId: templateId as CardTemplateId,
  }));

  const cardsById: Record<string, CardInstance> = {};
  for (const c of deckOrder) {
    cardsById[c.instanceId] = { instanceId: c.instanceId, templateId: c.templateId };
  }

  let initialHandIds: string[] = [];
  let deckInstanceIds: string[];

  if (levelId === THIRD_MANDATE_LEVEL_ID) {
    const ch3RefitOrder = getLevelContent(THIRD_MANDATE_LEVEL_ID).chapter3RefitStartingHandOrder;
    if (!ch3RefitOrder?.length) {
      throw new Error("initialState: thirdMandate.chapter3RefitStartingHandOrder is required");
    }
    const ch3Ids: string[] = [];
    for (let i = 0; i < ch3RefitOrder.length; i++) {
      const templateId = ch3RefitOrder[i]!;
      const instanceId = `ch3_hand_${i}_${templateId}`;
      cardsById[instanceId] = { instanceId, templateId };
      ch3Ids.push(instanceId);
    }
    const nantesIds = registerNantesStarterCardsForThirdMandate(cardsById, nantesPolicyCarryover!);
    const coreIds = deckOrder.map((c) => c.instanceId);
    const fullPool = [...coreIds, ...ch3Ids];
    const [rng2, shuffledIds] = shuffle(rng, fullPool);
    rng = rng2;
    initialHandIds = shuffledIds.slice(0, 2);
    let deckFromShuffle = shuffledIds.slice(2);
    const inserted = insertCardsIntoDeckAtRandomPositions(rng, deckFromShuffle, nantesIds);
    rng = inserted.rng;
    deckInstanceIds = inserted.deck;
  } else {
    const [rng2, shuffled] = shuffle(rng, deckOrder);
    rng = rng2;
    deckInstanceIds = shuffled.map((c) => c.instanceId);
  }

  const cardUsesById = buildDefaultCardUsesById(levelId, cardsById);

  const cardInflationById: Record<string, number> = {};
  if (levelId === THIRD_MANDATE_LEVEL_ID) {
    for (const id of Object.keys(cardsById)) {
      const t = cardsById[id]?.templateId;
      if (t && getCardTemplate(t).tags.includes("inflation")) {
        cardInflationById[id] = Math.max(0, STANDALONE_CH3_INFLATION_TARGET_COST - getCardTemplate(t).cost);
      }
    }
  }

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

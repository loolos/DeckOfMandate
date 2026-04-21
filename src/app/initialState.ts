import { getLevelContent } from "../data/levelContent";
import { getDefaultLevelId, getLevelDef } from "../data/levels";
import { buildDefaultCardUsesById } from "../logic/cardUsage";
import { computeEuropeAlertPowerLoss } from "../logic/europeAlert";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../levels/types/card";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../levels/types/event";
import { applyThirdMandateNantesStartingEffects, resolveThirdMandateNantesPolicy } from "../logic/thirdMandateStart";
import type { GameState, NantesPolicyCarryover, Resources } from "../types/game";

const THIRD_MANDATE_LEVEL_ID = "thirdMandate";

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

  const starterDeckTemplateOrder =
    options?.starterDeckTemplateOrder ?? getLevelContent(levelId).starterDeckTemplateOrder;
  const deckOrder = starterDeckTemplateOrder.map((templateId, i) => ({
    instanceId: `${templateId}__${i}`,
    templateId: templateId as CardTemplateId,
  }));
  const [rng2, shuffled] = shuffle(rng, deckOrder);
  rng = rng2;

  const cardsById: Record<string, CardInstance> = {};
  for (const c of shuffled) {
    cardsById[c.instanceId] = { instanceId: c.instanceId, templateId: c.templateId };
  }
  const cardUsesById = buildDefaultCardUsesById(levelId, cardsById);

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
    scheduledDrawModifiers: [],
    deck: shuffled.map((c) => c.instanceId),
    discard: [],
    hand: [],
    cardsById,
    cardUsesById,
    cardInflationById: {},
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
    actionLog: [],
  };

  let ready = base;
  if (levelId === THIRD_MANDATE_LEVEL_ID) {
    ready = applyThirdMandateNantesStartingEffects(base, nantesPolicyCarryover!);
  }

  return beginYear(ready);
}

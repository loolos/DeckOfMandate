import { getLevelContent } from "../data/levelContent";
import { defaultLevelId, getLevelDef } from "../data/levels";
import { computeEuropeAlertDrawPenalty } from "../logic/europeAlert";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../types/card";
import { EMPTY_EVENT_SLOTS, EMPTY_PENDING_MAJOR_CRISIS } from "../types/event";
import type { GameState, Resources } from "../types/game";

type InitialStateOptions = {
  starterDeckTemplateOrder?: readonly CardTemplateId[];
  startingResourcesOverride?: Partial<Resources>;
  calendarStartYearOverride?: number;
  warOfDevolutionAttacked?: boolean;
  europeAlert?: boolean;
  europeAlertDrawPenalty?: number;
};

export function createInitialState(
  seed?: number,
  levelId = defaultLevelId,
  options?: InitialStateOptions,
): GameState {
  const level = getLevelDef(levelId);
  const runSeed = ((seed ?? Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 0x9e3779b9;
  let rng = createRngFromSeed(runSeed);
  const resources = { ...level.startingResources, ...options?.startingResourcesOverride };
  const europeAlert = options?.europeAlert ?? false;
  const europeAlertDrawPenalty =
    options?.europeAlertDrawPenalty ??
    (europeAlert ? computeEuropeAlertDrawPenalty(resources.power) : 0);

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
    slots: { ...EMPTY_EVENT_SLOTS },
    pendingMajorCrisis: { ...EMPTY_PENDING_MAJOR_CRISIS },
    playerStatuses: [],
    antiFrenchLeague: null,
    warOfDevolutionAttacked: options?.warOfDevolutionAttacked ?? false,
    europeAlert,
    europeAlertDrawPenalty,
    nymwegenSettlementAchieved: false,
    proceduralEventSequence: [],
    actionLog: [],
  };

  return beginYear(base);
}

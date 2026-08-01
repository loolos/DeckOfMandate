import type { InitialStateOptions } from "../data/initialStateTypes";
import { getLevelInitialStateHooks } from "../data/levelInitialStateRegistry";
import { getLevelContent } from "../data/levelContent";
import { getDefaultLevelId, getLevelDef } from "../data/levels";
import { buildDefaultCardUsesById } from "../logic/cardUsage";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import {
  buildCampaignInitialStateFields,
  finalizeCampaignInitialStateFields,
} from "../levels/campaignLogicBundle";
import type { CardInstance, CardTemplateId } from "../levels/types/card";
import { EMPTY_EVENT_SLOTS } from "../levels/types/event";
import type { GameState } from "../types/game";

export type { InitialStateOptions } from "../data/initialStateTypes";

export function createInitialState(
  seed?: number,
  levelId = getDefaultLevelId(),
  options?: InitialStateOptions,
): GameState {
  const level = getLevelDef(levelId);
  const hooks = getLevelInitialStateHooks(levelId);
  const rawSeed = (seed ?? Math.floor(Math.random() * 0x7fffffff + 1)) >>> 0;
  const runSeed = rawSeed === 0 ? 0x9e3779b9 : rawSeed;
  let rng = createRngFromSeed(runSeed);
  const resources = { ...level.startingResources, ...options?.startingResourcesOverride };

  let campaignFields = buildCampaignInitialStateFields(levelId, resources, options);

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
      campaignFields,
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
  campaignFields = finalizeCampaignInitialStateFields(campaignFields, levelId, cardsById);

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
    deck: deckInstanceIds,
    discard: [],
    hand: initialHandIds,
    cardsById,
    cardUsesById,
    slots: { ...EMPTY_EVENT_SLOTS },
    playerStatuses: [],
    proceduralEventSequence: [],
    proceduralEventPoolOrder: [],
    actionLog: [],
    ...campaignFields,
  };

  return beginYear(base);
}

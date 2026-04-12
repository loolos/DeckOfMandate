import { starterDeckTemplateOrder } from "../data/cards";
import { defaultLevelId, getLevelDef } from "../data/levels";
import { createRngFromSeed, shuffle } from "../logic/rng";
import { beginYear } from "../logic/turnFlow";
import type { CardInstance, CardTemplateId } from "../types/card";
import type { GameState } from "../types/game";

export function createInitialState(seed?: number, levelId = defaultLevelId): GameState {
  const level = getLevelDef(levelId);
  const runSeed = ((seed ?? Math.floor(Math.random() * 0x7fffffff)) >>> 0) || 0x9e3779b9;
  let rng = createRngFromSeed(runSeed);

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
    runSeed,
    rng,
    turn: 1,
    phase: "action",
    outcome: "playing",
    pendingInteraction: null,
    nextIds: { event: 0 },
    resources: { ...level.startingResources },
    nextTurnDrawModifier: 0,
    deck: shuffled.map((c) => c.instanceId),
    discard: [],
    hand: [],
    cardsById,
    slots: { A: null, B: null },
    pendingMajorCrisis: { A: false, B: false },
  };

  return beginYear(base);
}

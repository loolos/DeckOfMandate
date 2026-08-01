import type { CardInstance, CardTemplateId } from "../levels/types/card";
import type { InitialStateOptions } from "./initialStateTypes";
import type { LevelId } from "./levels";
import type { CampaignGameStateFields, RngSerialized } from "../types/game";

export type OpeningShuffleContext = {
  rng: RngSerialized;
  levelId: LevelId;
  deckOrder: readonly { instanceId: string; templateId: CardTemplateId }[];
  cardsById: Record<string, CardInstance>;
  /** This run's campaign state slice (already built); chapter carryover markers live here. */
  campaignFields: CampaignGameStateFields;
  options: InitialStateOptions | undefined;
};

export type OpeningShuffleResult = {
  rng: RngSerialized;
  cardsById: Record<string, CardInstance>;
  initialHandIds: string[];
  deckInstanceIds: string[];
};

export type LevelInitialStateHooks = {
  /** When there is no `starterDeckTemplateOrder` override, transform the level content order. */
  adjustDefaultStarterDeckOrder?: (order: readonly CardTemplateId[]) => readonly CardTemplateId[];
  /** Replace default shuffle when present. */
  shuffleOpeningDeckAndHand?: (ctx: OpeningShuffleContext) => OpeningShuffleResult;
};

const hooksByLevelId: Partial<Record<string, LevelInitialStateHooks>> = {};

export function registerLevelInitialStateHooks(levelId: string, hooks: LevelInitialStateHooks): void {
  hooksByLevelId[levelId] = hooks;
}

export function getLevelInitialStateHooks(levelId: string): LevelInitialStateHooks | undefined {
  return hooksByLevelId[levelId];
}

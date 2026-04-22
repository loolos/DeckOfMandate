import type { CardInstance, CardTemplateId } from "../levels/types/card";
import type { InitialStateOptions } from "./initialStateTypes";
import type { LevelId } from "./levels";
import type { NantesPolicyCarryover, RngSerialized } from "../types/game";

export type OpeningShuffleContext = {
  rng: RngSerialized;
  levelId: LevelId;
  deckOrder: readonly { instanceId: string; templateId: CardTemplateId }[];
  cardsById: Record<string, CardInstance>;
  nantesPolicyCarryover: NantesPolicyCarryover | null;
  options: InitialStateOptions | undefined;
};

export type OpeningShuffleResult = {
  rng: RngSerialized;
  cardsById: Record<string, CardInstance>;
  initialHandIds: string[];
  deckInstanceIds: string[];
};

export type LevelInitialStateHooks = {
  /** When `options.warOfDevolutionAttacked` is omitted, use this default (otherwise `false`). */
  defaultWarOfDevolutionAttackedWhenUnset?: () => boolean;
  /** Chapter 3 Nantes branch resolution; omit for levels that do not use `nantesPolicyCarryover`. */
  resolveNantesPolicyCarryover?: (
    raw: NantesPolicyCarryover | null | undefined,
  ) => NantesPolicyCarryover | null;
  /** When there is no `starterDeckTemplateOrder` override, transform the level content order. */
  adjustDefaultStarterDeckOrder?: (order: readonly CardTemplateId[]) => readonly CardTemplateId[];
  /** Replace default shuffle when present. */
  shuffleOpeningDeckAndHand?: (ctx: OpeningShuffleContext) => OpeningShuffleResult;
  /** After `cardsById` is finalized for the opening library. */
  seedOpeningCardInflationById?: (cardsById: Record<string, CardInstance>) => Record<string, number>;
};

const hooksByLevelId: Partial<Record<string, LevelInitialStateHooks>> = {};

export function registerLevelInitialStateHooks(levelId: string, hooks: LevelInitialStateHooks): void {
  hooksByLevelId[levelId] = hooks;
}

export function getLevelInitialStateHooks(levelId: string): LevelInitialStateHooks | undefined {
  return hooksByLevelId[levelId];
}

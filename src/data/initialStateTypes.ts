import type { CardTemplateId } from "../levels/types/card";
import type { Resources } from "../types/game";

/**
 * Campaign packs merge their new-run options (chapter carryover markers, pressure flags, …)
 * into this interface via `declare module`; the framework only knows the core three.
 */
export interface CampaignInitialStateOptions {}

export type InitialStateOptions = {
  starterDeckTemplateOrder?: readonly CardTemplateId[];
  startingResourcesOverride?: Partial<Resources>;
  calendarStartYearOverride?: number;
} & CampaignInitialStateOptions;

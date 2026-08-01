import type { CardTemplateId } from "../levels/types/card";
import type { Resources } from "../types/game";
import type { NantesPolicyCarryover } from "../levels/campaignStateTypes";

export type InitialStateOptions = {
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

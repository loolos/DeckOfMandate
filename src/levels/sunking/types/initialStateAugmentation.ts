/**
 * Sun King new-run options merged into the framework `InitialStateOptions`.
 * Consumed by `../logic/initialStateFields.ts` when it builds this campaign's state slice.
 */
import type { NantesPolicyCarryover } from "./campaignState";

declare module "../../../data/initialStateTypes" {
  interface CampaignInitialStateOptions {
    warOfDevolutionAttacked?: boolean;
    europeAlert?: boolean;
    europeAlertPowerLoss?: number;
    europeAlertProgress?: number;
    /** Chapter 3: mirrors chapter 2’s Nantes branch; omitted or null defaults to crackdown (镇压). */
    nantesPolicyCarryover?: NantesPolicyCarryover | null;
  }
}

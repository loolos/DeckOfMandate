import type { MessageKey } from "./en";
import { messagesFrCore } from "./fr.core";
import { campaignMessagesFr } from "../levels/load";

/** Bundle français : cœur + campagne Roi-Soleil. */
export const messagesFr: Record<MessageKey, string> = {
  ...messagesFrCore,
  ...campaignMessagesFr,
};

import type { MessageKey } from "./en";
import { messagesFrCore } from "./fr.core";
import { sunkingMessagesFr } from "../levels/sunking/sunkingLocales";

/** Bundle français : cœur + campagne Roi-Soleil. */
export const messagesFr: Record<MessageKey, string> = {
  ...messagesFrCore,
  ...sunkingMessagesFr,
};

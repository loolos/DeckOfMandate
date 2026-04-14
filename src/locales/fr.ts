import type { MessageKey } from "./en";
import { messagesFrCore } from "./fr.core";
import { messagesFrFirstMandate } from "./levels/firstMandate/fr";
import { messagesFrSecondMandate } from "./levels/secondMandate/fr";

/** Bundle français fusionné : cœur + niveau `firstMandate` + niveau `secondMandate`. */
export const messagesFr: Record<MessageKey, string> = {
  ...messagesFrCore,
  ...messagesFrFirstMandate,
  ...messagesFrSecondMandate,
};

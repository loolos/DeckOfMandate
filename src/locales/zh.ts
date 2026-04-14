import type { MessageKey } from "./en";
import { messagesZhCore } from "./zh.core";
import { messagesZhFirstMandate } from "./levels/firstMandate/zh";
import { messagesZhSecondMandate } from "./levels/secondMandate/zh";

/** Merged Chinese bundle: {@link messagesZhCore} + level `firstMandate`. */
export const messagesZh: Record<MessageKey, string> = {
  ...messagesZhCore,
  ...messagesZhFirstMandate,
  ...messagesZhSecondMandate,
};

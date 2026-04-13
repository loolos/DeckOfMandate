import type { MessageKey } from "./en";
import { messagesZhCore } from "./zh.core";
import { messagesZhFirstMandate } from "./levels/firstMandate/zh";

/** Merged Chinese bundle: {@link messagesZhCore} + level `firstMandate`. */
export const messagesZh: Record<MessageKey, string> = {
  ...messagesZhCore,
  ...messagesZhFirstMandate,
};

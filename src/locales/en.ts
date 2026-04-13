import { messagesEnCore } from "./en.core";
import { messagesEnFirstMandate } from "./levels/firstMandate/en";

/** Merged English bundle: {@link messagesEnCore} + level `firstMandate`. */
export const messagesEn = {
  ...messagesEnCore,
  ...messagesEnFirstMandate,
} as const;

export type MessageKey = keyof typeof messagesEn;

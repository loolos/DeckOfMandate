import { messagesEnCore } from "./en.core";
import { messagesEnFirstMandate } from "./levels/firstMandate/en";
import { messagesEnSecondMandate } from "./levels/secondMandate/en";

/** Merged English bundle: {@link messagesEnCore} + level `firstMandate`. */
export const messagesEn = {
  ...messagesEnCore,
  ...messagesEnFirstMandate,
  ...messagesEnSecondMandate,
} as const;

export type MessageKey = keyof typeof messagesEn;

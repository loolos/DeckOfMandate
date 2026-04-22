import { messagesEnCore } from "./en.core";
import { campaignMessagesEn } from "../levels/load";

/** Merged English bundle: framework core + merged campaign messages from `src/levels/load/content`. */
export const messagesEn = {
  ...messagesEnCore,
  ...campaignMessagesEn,
};

export type MessageKey = keyof typeof messagesEn;

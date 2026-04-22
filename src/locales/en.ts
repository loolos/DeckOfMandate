import { messagesEnCore } from "./en.core";
import { campaignMessagesEn } from "../levels/load";

/** Merged English bundle: framework core + Sun King campaign (see `src/levels/sunking`). */
export const messagesEn = {
  ...messagesEnCore,
  ...campaignMessagesEn,
};

export type MessageKey = keyof typeof messagesEn;

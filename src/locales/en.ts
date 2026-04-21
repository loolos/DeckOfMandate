import { messagesEnCore } from "./en.core";
import { sunkingMessagesEn } from "../levels/sunking/sunkingLocales";

/** Merged English bundle: framework core + Sun King campaign (see `src/levels/sunking`). */
export const messagesEn = {
  ...messagesEnCore,
  ...sunkingMessagesEn,
};

export type MessageKey = keyof typeof messagesEn;

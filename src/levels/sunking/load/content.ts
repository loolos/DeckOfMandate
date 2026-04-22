import { cardTemplates } from "../templates/cards";
import { eventTemplates } from "../templates/events";
import { statusTemplates } from "../templates/statusTemplates";
import { sunkingMessagesEn, sunkingMessagesFr, sunkingMessagesZh } from "../sunkingLocales";

/** Canonical shape merged by levels/load/content from each campaign levels (name)/load/content.ts */
export const templates = {
  cards: cardTemplates,
  events: eventTemplates,
  statuses: statusTemplates,
} as const;

export const messages = {
  en: sunkingMessagesEn,
  fr: sunkingMessagesFr,
  zh: sunkingMessagesZh,
} as const;

/** @deprecated Prefer templates — kept for sunking package re-exports */
export const sunkingTemplates = templates;
/** @deprecated Prefer messages */
export const sunkingMessages = messages;

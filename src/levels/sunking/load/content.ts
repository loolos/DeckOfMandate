import { cardTemplates } from "../templates/cards";
import { eventTemplates } from "../templates/events";
import { statusTemplates } from "../templates/statusTemplates";
import { sunkingMessagesEn, sunkingMessagesFr, sunkingMessagesZh } from "../sunkingLocales";

export const sunkingTemplates = {
  cards: cardTemplates,
  events: eventTemplates,
  statuses: statusTemplates,
} as const;

export const sunkingMessages = {
  en: sunkingMessagesEn,
  fr: sunkingMessagesFr,
  zh: sunkingMessagesZh,
} as const;

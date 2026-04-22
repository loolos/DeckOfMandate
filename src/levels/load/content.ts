import type { CardTemplate } from "../types/card";
import type { EventTemplate } from "../types/event";
import type { StatusTemplate } from "../types/status";

type CampaignMessages = Readonly<Record<string, string>>;

type TemplatesExport = {
  readonly cards: Readonly<Record<string, CardTemplate>>;
  readonly events: Readonly<Record<string, EventTemplate>>;
  readonly statuses: Readonly<Record<string, StatusTemplate>>;
};

type MessagesExport = {
  readonly en: CampaignMessages;
  readonly fr: CampaignMessages;
  readonly zh: CampaignMessages;
};

type LevelLoadContentModule = {
  templates: TemplatesExport;
  messages: MessagesExport;
};

const contentModules = import.meta.glob<LevelLoadContentModule>("../*/load/content.ts", {
  eager: true,
});

const sortedPaths = Object.keys(contentModules).sort();

function mergeCampaignContent(): {
  cardTemplates: Record<string, CardTemplate>;
  eventTemplates: Record<string, EventTemplate>;
  statusTemplates: Record<string, StatusTemplate>;
  campaignMessagesEn: Record<string, string>;
  campaignMessagesFr: Record<string, string>;
  campaignMessagesZh: Record<string, string>;
} {
  const cards: Record<string, CardTemplate> = {};
  const events: Record<string, EventTemplate> = {};
  const statuses: Record<string, StatusTemplate> = {};
  const en: Record<string, string> = {};
  const fr: Record<string, string> = {};
  const zh: Record<string, string> = {};

  for (const path of sortedPaths) {
    const mod = contentModules[path];
    if (!mod?.templates || !mod?.messages) {
      console.warn(`[levels/load/content] skip "${path}": expected { templates, messages }`);
      continue;
    }
    Object.assign(cards, mod.templates.cards);
    Object.assign(events, mod.templates.events);
    Object.assign(statuses, mod.templates.statuses);
    Object.assign(en, mod.messages.en);
    Object.assign(fr, mod.messages.fr);
    Object.assign(zh, mod.messages.zh);
  }

  return {
    cardTemplates: cards,
    eventTemplates: events,
    statusTemplates: statuses,
    campaignMessagesEn: en,
    campaignMessagesFr: fr,
    campaignMessagesZh: zh,
  };
}

const merged = mergeCampaignContent();

export const cardTemplates = merged.cardTemplates;
export const eventTemplates = merged.eventTemplates;
export const statusTemplates = merged.statusTemplates;

/** Typed as current primary campaign messages so `MessageKey` in locales stays narrow. */
export const campaignMessagesEn = merged.campaignMessagesEn as typeof import("../sunking/sunkingLocales").sunkingMessagesEn;
export const campaignMessagesFr = merged.campaignMessagesFr as typeof import("../sunking/sunkingLocales").sunkingMessagesFr;
export const campaignMessagesZh = merged.campaignMessagesZh as typeof import("../sunking/sunkingLocales").sunkingMessagesZh;

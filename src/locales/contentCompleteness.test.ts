import { describe, expect, it } from "vitest";
import { messagesEn } from "./en";
import { messagesFr } from "./fr";
import { messagesZh } from "./zh";
import { cardTemplates } from "../data/cards";
import { eventTemplates } from "../data/events";
import { statusTemplates } from "../data/statusTemplates";
import { CARD_TAGS } from "../levels/types/tags";

/**
 * Content-completeness guard: every player-facing content entry (card, event, status,
 * tag, resource) must ship BOTH a historical-background text and a mechanics text, in
 * every locale. This is the dedicated mechanism that keeps history and rules copy from
 * drifting apart as new content is added:
 *
 * - Cards:    `card.<id>.background` (history) + `card.<id>.desc` (mechanics)
 * - Events:   `event.<id>.history`  + `event.<id>.desc` (wired via template `historyKey`)
 * - Statuses: `status.<id>.history` + template `descKey` (mechanics, even when delta is 0)
 * - Card tags: `card.tag.<tag>` + `log.info.cardTag.<tag>` (mechanics)
 *              + `log.info.cardTag.<tag>.history` (history)
 * - Resources: `resource.<key>` + `resource.<key>.hint` (mechanics) + `resource.<key>.history`
 *
 * Mechanics copy must stay mechanics-only: no "背景：/Context:" blocks and no backticked
 * engine identifiers leaking into player text.
 */

const bundles = {
  en: messagesEn,
  zh: messagesZh,
  fr: messagesFr,
} as const;

type LocaleId = keyof typeof bundles;
const LOCALES = Object.keys(bundles) as LocaleId[];

/** zh packs meaning densely; latin locales need more characters for a real sentence. */
const MIN_HISTORY_LEN: Record<LocaleId, number> = { en: 30, zh: 16, fr: 30 };

const FORBIDDEN_IN_DESC: readonly RegExp[] = [
  /背景：/,
  /机制上/,
  /机制简述/,
  /Context:\s/,
  /Contexte\s?:/,
  /Mechanically[,:]/,
  /Côté mécanique/,
  /`/,
];
const FORBIDDEN_IN_HISTORY: readonly RegExp[] = [/`/, /机制：/, /Mechanic:\s/, /Mécanique\s?:/];

function raw(locale: LocaleId, key: string): string | undefined {
  return (bundles[locale] as Record<string, string>)[key];
}

function expectPresent(locale: LocaleId, key: string): string {
  const value = raw(locale, key);
  expect(value, `missing or empty "${key}" in ${locale}`).toBeTruthy();
  return value ?? "";
}

function expectHistory(locale: LocaleId, key: string) {
  const value = expectPresent(locale, key);
  expect(
    value.trim().length,
    `"${key}" in ${locale} is too short to be a real historical background (got "${value}")`,
  ).toBeGreaterThanOrEqual(MIN_HISTORY_LEN[locale]);
  for (const re of FORBIDDEN_IN_HISTORY) {
    expect(re.test(value), `"${key}" in ${locale} mixes mechanics markers into history (${re})`).toBe(false);
  }
}

function expectMechanics(locale: LocaleId, key: string) {
  const value = expectPresent(locale, key);
  for (const re of FORBIDDEN_IN_DESC) {
    expect(re.test(value), `"${key}" in ${locale} mixes history/engine markers into mechanics (${re})`).toBe(false);
  }
}

describe("content completeness: history + mechanics per entry, all locales", () => {
  it("every card template has a real background (history) and a clean mechanics desc", () => {
    for (const tmpl of Object.values(cardTemplates)) {
      for (const locale of LOCALES) {
        expectHistory(locale, tmpl.backgroundKey);
        expectMechanics(locale, tmpl.descriptionKey);
      }
    }
  });

  it("every event template has a real history text and a clean mechanics desc", () => {
    for (const tmpl of Object.values(eventTemplates)) {
      for (const locale of LOCALES) {
        expectHistory(locale, tmpl.historyKey);
        expectMechanics(locale, tmpl.descriptionKey);
      }
    }
  });

  it("every status template has a name, history, and mechanics desc", () => {
    for (const tmpl of Object.values(statusTemplates)) {
      for (const locale of LOCALES) {
        expectPresent(locale, tmpl.titleKey);
        expectHistory(locale, tmpl.historyKey);
        expectMechanics(locale, tmpl.descKey);
      }
    }
  });

  it("synthetic status-bar rows (Europe Alert, Anti-French League) have hint + history", () => {
    for (const base of ["status.europeAlert", "status.antiFrenchLeague"]) {
      for (const locale of LOCALES) {
        expectPresent(locale, `${base}.name`);
        expectMechanics(locale, `${base}.hint`);
        expectHistory(locale, `${base}.history`);
      }
    }
  });

  it("every card tag has a name, a mechanics note, and a history note", () => {
    for (const tag of CARD_TAGS) {
      for (const locale of LOCALES) {
        expectPresent(locale, `card.tag.${tag}`);
        expectMechanics(locale, `log.info.cardTag.${tag}`);
        expectHistory(locale, `log.info.cardTag.${tag}.history`);
      }
    }
  });

  it("the Remaining-uses hand tag has a mechanics note and a history note", () => {
    for (const locale of LOCALES) {
      expectPresent(locale, "card.tag.remainingUses");
      expectMechanics(locale, "log.info.cardUse.remainingUses");
      expectHistory(locale, "log.info.cardUse.remainingUses.history");
    }
  });

  it("event tags/badges have explanations (anti-French alliance also has history context)", () => {
    for (const locale of LOCALES) {
      // Content tag: combined note must exist; it carries both history and mechanics.
      expectPresent(locale, "ui.eventTag.antiFrenchAlliance");
      expectPresent(locale, "log.info.eventTag.antiFrenchAlliance");
      // Framework badges (state markers): mechanics-only notes by design.
      for (const badge of ["harmful", "opportunity", "historical", "continued", "resolved"]) {
        expectPresent(locale, `log.info.eventTag.${badge}`);
      }
    }
  });

  it("every resource has a name, a mechanics hint, and a history text", () => {
    for (const key of ["treasuryStat", "funding", "power", "legitimacy"]) {
      for (const locale of LOCALES) {
        expectPresent(locale, `resource.${key}`);
        expectPresent(locale, `resource.${key}.hint`);
        expectHistory(locale, `resource.${key}.history`);
      }
    }
  });
});

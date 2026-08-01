import { describe, expect, it } from "vitest";
import { messagesEn } from "../../../locales/en";
import { messagesZh } from "../../../locales/zh";
import { messagesFr } from "../../../locales/fr";
import { CARD_TAGS } from "../templates/tags";

const bundles = {
  en: messagesEn,
  zh: messagesZh,
  fr: messagesFr,
} as const;

describe("tag info log entries", () => {
  it("provides an explanation log entry for every card tag in all locales", () => {
    for (const tag of CARD_TAGS) {
      const key = `log.info.cardTag.${tag}` as const;
      for (const [locale, bundle] of Object.entries(bundles)) {
        expect(bundle[key], `missing ${key} in ${locale}`).toBeTruthy();
      }
    }
  });

  it("provides an explanation log entry for the Remaining-use hand tag in all locales", () => {
    const key = "log.info.cardUse.remainingUses" as const;
    for (const [locale, bundle] of Object.entries(bundles)) {
      expect(bundle[key], `missing ${key} in ${locale}`).toBeTruthy();
    }
  });
});

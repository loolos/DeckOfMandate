import { describe, expect, it } from "vitest";
import { messagesEnCore } from "./en.core";
import { messagesZhCore } from "./zh.core";
import { messagesFrCore } from "./fr.core";
import { CARD_TAGS } from "../levels/types/tags";

const bundles = {
  en: messagesEnCore,
  zh: messagesZhCore,
  fr: messagesFrCore,
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

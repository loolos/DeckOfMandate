import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createInitialState } from "../app/initialState";
import { I18nProvider, type LocaleId } from "../locales";
import { Hand } from "./Hand";

import "../test/setupLevels";

function withStoredLocale<T>(locale: LocaleId, run: () => T): T {
  const global = globalThis as typeof globalThis & { window?: unknown; localStorage?: unknown };
  const previousWindow = Object.getOwnPropertyDescriptor(global, "window");
  const previousLocalStorage = Object.getOwnPropertyDescriptor(global, "localStorage");
  const localStorage = {
    getItem: (key: string) => (key === "deck-of-mandate.locale" ? locale : null),
    setItem: () => undefined,
    removeItem: () => undefined,
  };
  const mediaQueryList = {
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  };

  Object.defineProperty(global, "window", {
    configurable: true,
    value: {
      localStorage,
      matchMedia: () => mediaQueryList,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
    },
  });
  Object.defineProperty(global, "localStorage", {
    configurable: true,
    value: localStorage,
  });

  try {
    return run();
  } finally {
    if (previousWindow) {
      Object.defineProperty(global, "window", previousWindow);
    } else {
      delete (global as { window?: unknown }).window;
    }
    if (previousLocalStorage) {
      Object.defineProperty(global, "localStorage", previousLocalStorage);
    } else {
      delete (global as { localStorage?: unknown }).localStorage;
    }
  }
}

function renderFundingCardHand(locale: LocaleId): string {
  return withStoredLocale(locale, () => {
    const state = createInitialState(20_001, "firstMandate");
    const fundingId = Object.keys(state.cardsById).find((id) => state.cardsById[id]?.templateId === "funding");
    expect(fundingId).toBeDefined();
    const stateWithFundingCard = {
      ...state,
      hand: [fundingId!],
    };

    return renderToStaticMarkup(
      <I18nProvider>
        <Hand state={stateWithFundingCard} dispatch={() => undefined} />
      </I18nProvider>,
    );
  });
}

describe("Hand", () => {
  it("adds localized hover text to resource emoji in hand cards", () => {
    const state = createInitialState(20_001, "firstMandate");

    const html = renderToStaticMarkup(
      <I18nProvider>
        <Hand state={state} dispatch={() => undefined} />
      </I18nProvider>,
    );

    expect(html).toContain('title="Pays cards &amp; events."');
  });

  it("adds localized hover text to card emoji in all supported languages", () => {
    const htmlEn = renderFundingCardHand("en");
    const htmlFr = renderFundingCardHand("fr");
    const htmlZh = renderFundingCardHand("zh");

    expect(htmlEn).toContain('title="Royal Levy — Gain +1 Funding this turn');
    expect(htmlEn).toContain('data-tooltip="Royal Levy — Gain +1 Funding this turn');
    expect(htmlFr).toContain('title="Prélèvement royal — Gagnez +1 Financement ce tour');
    expect(htmlFr).toContain('data-tooltip="Prélèvement royal — Gagnez +1 Financement ce tour');
    expect(htmlZh).toContain('title="王室征收 — 本回合 +1 经费');
    expect(htmlZh).toContain('data-tooltip="王室征收 — 本回合 +1 经费');
  });
});

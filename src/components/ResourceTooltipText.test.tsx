import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider, type LocaleId } from "../locales";
import type { Resources } from "../types/game";
import { ResourceTooltipText } from "./ResourceTooltipText";

const RESOURCES: Resources = {
  funding: 5,
  treasuryStat: 3,
  power: 4,
  legitimacy: 2,
};

function withStoredLocale<T>(locale: LocaleId, run: () => T): T {
  const global = globalThis as typeof globalThis & { window?: unknown; localStorage?: unknown };
  const previousWindow = Object.getOwnPropertyDescriptor(global, "window");
  const previousLocalStorage = Object.getOwnPropertyDescriptor(global, "localStorage");
  const localStorage = {
    getItem: (key: string) => (key === "deck-of-mandate.locale" ? locale : null),
    setItem: () => undefined,
    removeItem: () => undefined,
  };

  Object.defineProperty(global, "window", {
    configurable: true,
    value: { localStorage },
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

function renderText(locale: LocaleId, text: string): string {
  return withStoredLocale(locale, () =>
    renderToStaticMarkup(
      <I18nProvider>
        <ResourceTooltipText text={text} resources={RESOURCES} />
      </I18nProvider>,
    ),
  );
}

describe("ResourceTooltipText", () => {
  it("renders resource emoji hover text in all supported locales", () => {
    const htmlEn = renderText("en", "💰5 · ⚡+1 · 👑-1 · 🏛️+1");
    const htmlFr = renderText("fr", "💰5 · ⚡+1 · 👑-1 · 🏛️+1");
    const htmlZh = renderText("zh", "💰5 · ⚡+1 · 👑-1 · 🏛️+1");

    expect(htmlEn).toContain('title="Pays cards &amp; events."');
    expect(htmlEn).toContain('title="Now drawing 3; gain +1 at 7, lose −1 at 3."');
    expect(htmlEn).toContain('title="Sets your end-of-turn hand retention cap; 0 ends the run."');
    expect(htmlEn).toContain('title="Sets how much Funding you gain each turn."');
    expect(htmlFr).toContain('title="Paie les cartes et les événements."');
    expect(htmlFr).toContain('title="Pioche actuelle : 3 ; +1 à 7, −1 à 3."');
    expect(htmlFr).toContain('title="Détermine la limite de conservation en fin de tour ; 0 met fin à la partie."');
    expect(htmlFr).toContain('title="Détermine le Financement gagné à chaque tour."');
    expect(htmlZh).toContain('title="用于打牌与事件处理"');
    expect(htmlZh).toContain('title="目前抽 3 张；到 7 时多 1 张，降到 3 时少 1 张。"');
    expect(htmlZh).toContain('title="决定回合末可保留手牌上限；归零即败。"');
    expect(htmlZh).toContain('title="决定每回合可获得的经费。"');
  });

  it("does not label the royal-tag crown as legitimacy", () => {
    const html = renderText("en", "🚫👑×2");

    expect(html).not.toContain("Sets your end-of-turn hand retention cap");
  });
});

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider, type LocaleId } from "../locales";
import type { Resources } from "../types/game";
import { ResourceBar } from "./ResourceBar";

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

function renderResourceBar(locale: LocaleId = "en"): string {
  return withStoredLocale(locale, () =>
    renderToStaticMarkup(
      <I18nProvider>
        <ResourceBar resources={RESOURCES} />
      </I18nProvider>,
    ),
  );
}

describe("ResourceBar", () => {
  it("adds localized English hover text to resource emoji", () => {
    const html = renderResourceBar("en");

    expect(html).toContain('title="Pays cards &amp; events."');
    expect(html).toContain('title="Sets how much Funding you gain each turn."');
    expect(html).toContain('title="Now drawing 3; gain +1 at 7, lose −1 at 3."');
    expect(html).toContain('title="Sets your end-of-turn hand retention cap; 0 ends the run."');
  });

  it("uses the currently selected Chinese locale for resource emoji hover text", () => {
    const html = renderResourceBar("zh");

    expect(html).toContain('title="用于打牌与事件处理"');
    expect(html).toContain('title="决定每回合可获得的经费。"');
    expect(html).toContain('title="目前抽 3 张；到 7 时多 1 张，降到 3 时少 1 张。"');
    expect(html).toContain('title="决定回合末可保留手牌上限；归零即败。"');
  });
});

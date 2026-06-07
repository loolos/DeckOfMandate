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
  it("renders resource emoji hover text in the selected Chinese locale", () => {
    const html = renderText("zh", "💰5 · ⚡+1 · 👑-1");

    expect(html).toContain('title="用于打牌与事件处理"');
    expect(html).toContain('title="目前抽 3 张；到 7 时多 1 张，降到 3 时少 1 张。"');
    expect(html).toContain('title="决定回合末可保留手牌上限；归零即败。"');
  });

  it("does not label the royal-tag crown as legitimacy", () => {
    const html = renderText("en", "🚫👑×2");

    expect(html).not.toContain("Sets your end-of-turn hand retention cap");
  });
});

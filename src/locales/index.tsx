import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MessageKey } from "./en";
import { messagesEn } from "./en";
import { messagesFr } from "./fr";
import { messagesZh } from "./zh";

export type LocaleId = "en" | "zh" | "fr";

const STORAGE_KEY = "deck-of-mandate.locale";

const bundles: Record<LocaleId, Record<MessageKey, string>> = {
  en: messagesEn,
  fr: messagesFr,
  zh: messagesZh,
};

/** First visits (no stored choice) always start in English until the player switches language. */
export const DEFAULT_LOCALE: LocaleId = "en";

function readStoredLocale(): LocaleId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "zh" || raw === "en" || raw === "fr") return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

function storeLocale(locale: LocaleId) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function formatMessage(
  template: string,
  vars: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`,
  );
}

export type I18nContextValue = {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(() =>
    typeof window === "undefined" ? DEFAULT_LOCALE : readStoredLocale(),
  );

  useLayoutEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : locale === "fr" ? "fr" : "en";
  }, [locale]);

  const setLocale = useCallback((next: LocaleId) => {
    setLocaleState(next);
    storeLocale(next);
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const bundle = bundles[locale];
    return {
      locale,
      setLocale,
      t: (key, vars) => formatMessage(bundle[key], vars),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export type { MessageKey };

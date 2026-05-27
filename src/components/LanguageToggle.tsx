import { useI18n } from "../locales";
import { useForcedSmallScreenMode } from "../logic/useSmallScreen";
import styles from "../app/Game.module.css";
import { useId } from "react";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  const [forcedSmallScreen, setForcedSmallScreen] = useForcedSmallScreenMode();
  const languageSelectId = useId();
  return (
    <div className={styles.langToggle}>
      <div className={styles.langToggleRow}>
        <label className={styles.langToggleLabel} htmlFor={languageSelectId}>
          <span className={styles.langToggleIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9z" />
            </svg>
          </span>
          <span>{t("ui.language")}</span>
        </label>
        <select
          id={languageSelectId}
          className={styles.langToggleSelect}
          value={locale}
          onChange={(e) => {
            const next = e.target.value;
            if (next === "en" || next === "zh" || next === "fr") {
              setLocale(next);
            }
          }}
        >
          <option value="en">{t("ui.lang.en")}</option>
          <option value="zh">{t("ui.lang.zh")}</option>
          <option value="fr">{t("ui.lang.fr")}</option>
        </select>
      </div>
      <label className={styles.smallScreenModeToggle}>
        <input
          type="checkbox"
          checked={forcedSmallScreen}
          onChange={(e) => setForcedSmallScreen(e.target.checked)}
        />
        <span>{t("ui.smallScreenMode")}</span>
      </label>
    </div>
  );
}

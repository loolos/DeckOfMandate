import { useI18n } from "../locales";
import { useForcedSmallScreenMode } from "../logic/useSmallScreen";
import styles from "../app/Game.module.css";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  const [forcedSmallScreen, setForcedSmallScreen] = useForcedSmallScreenMode();
  return (
    <div className={styles.langToggle}>
      <div className={styles.langToggleRow}>
        <span className={styles.langToggleLabel}>{t("ui.language")}</span>
        <button
          type="button"
          className={styles.btn}
          disabled={locale === "en"}
          onClick={() => setLocale("en")}
        >
          {t("ui.lang.en")}
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={locale === "zh"}
          onClick={() => setLocale("zh")}
        >
          {t("ui.lang.zh")}
        </button>
        <button
          type="button"
          className={styles.btn}
          disabled={locale === "fr"}
          onClick={() => setLocale("fr")}
        >
          {t("ui.lang.fr")}
        </button>
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

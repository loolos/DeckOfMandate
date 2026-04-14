import { useI18n } from "../locales";
import styles from "../app/Game.module.css";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className={styles.langToggle}>
      <span>{t("ui.language")}</span>
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
  );
}

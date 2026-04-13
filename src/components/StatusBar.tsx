import styles from "../app/Game.module.css";
import { getStatusTemplate } from "../data/statusTemplates";
import { useI18n } from "../locales";
import type { PlayerStatusInstance } from "../types/status";

export function StatusBar({
  statuses,
  coalitionActive,
  coalitionProbabilityPct,
  europeAlertActive,
}: {
  statuses: readonly PlayerStatusInstance[];
  /** Anti-French League pressure (scripted war follow-up); draw risk is rolled each year in engine. */
  coalitionActive?: boolean;
  /** Rounded percent; shown in status hint (from `antiFrenchLeague.drawPenaltyProbability`). */
  coalitionProbabilityPct?: number;
  /** Chapter 2 continuity marker that increases selected war-pressure event weights. */
  europeAlertActive?: boolean;
}) {
  const { t } = useI18n();
  if (statuses.length === 0 && !coalitionActive && !europeAlertActive) {
    return <div className={styles.statusBarEmpty}>{t("ui.statuses.empty")}</div>;
  }
  const pct = coalitionProbabilityPct ?? 0;
  return (
    <ul className={styles.statusList}>
      {europeAlertActive ? (
        <li key="europeAlert" className={styles.statusRow}>
          <span className={styles.statusTitle}>{t("status.europeAlert.name")}</span>
          <span className={styles.statusMeta}>{t("status.europeAlert.hint")}</span>
        </li>
      ) : null}
      {coalitionActive ? (
        <li key="antiFrenchLeague" className={styles.statusRow}>
          <span className={styles.statusTitle}>{t("status.antiFrenchLeague.name")}</span>
          <span className={styles.statusMeta}>{t("status.antiFrenchLeague.hint", { pct })}</span>
        </li>
      ) : null}
      {statuses.map((row) => {
        const tmpl = getStatusTemplate(row.templateId);
        return (
          <li key={row.instanceId} className={styles.statusRow}>
            <span className={styles.statusTitle}>{t(tmpl.titleKey)}</span>
            <span className={styles.statusMeta}>{t("ui.statusTurnsRemaining", { n: row.turnsRemaining })}</span>
          </li>
        );
      })}
    </ul>
  );
}

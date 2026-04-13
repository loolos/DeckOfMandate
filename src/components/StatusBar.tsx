import styles from "../app/Game.module.css";
import { getStatusTemplate } from "../data/statusTemplates";
import { useI18n } from "../locales";
import type { PlayerStatusInstance } from "../types/status";

export function StatusBar({ statuses }: { statuses: readonly PlayerStatusInstance[] }) {
  const { t } = useI18n();
  if (statuses.length === 0) {
    return <div className={styles.statusBarEmpty}>{t("ui.statuses.empty")}</div>;
  }
  return (
    <ul className={styles.statusList}>
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

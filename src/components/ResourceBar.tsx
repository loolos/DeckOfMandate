import type { Resources } from "../types/game";
import { useI18n, type MessageKey } from "../locales";
import styles from "../app/Game.module.css";

const RESOURCE_ROWS: { key: keyof Resources; labelKey: MessageKey; hintKey: MessageKey }[] = [
  { key: "treasuryStat", labelKey: "resource.treasuryStat", hintKey: "resource.treasuryStat.hint" },
  { key: "funding", labelKey: "resource.funding", hintKey: "resource.funding.hint" },
  { key: "power", labelKey: "resource.power", hintKey: "resource.power.hint" },
  { key: "legitimacy", labelKey: "resource.legitimacy", hintKey: "resource.legitimacy.hint" },
];

export function ResourceBar({ resources }: { resources: Resources }) {
  const { t } = useI18n();
  return (
    <div className={styles.resources}>
      {RESOURCE_ROWS.map((it) => (
        <div key={it.key} className={styles.stat}>
          <div className={styles.statLabel}>{t(it.labelKey)}</div>
          <div className={styles.statValue}>{resources[it.key]}</div>
          <div className={styles.statHint}>{t(it.hintKey)}</div>
        </div>
      ))}
    </div>
  );
}

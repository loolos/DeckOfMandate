import styles from "../app/Game.module.css";
import { useI18n } from "../locales";
import type { QuickFrameRow } from "../logic/quickOutcomeFrame";

export function OutcomeQuickFrame({ rows }: { rows: readonly QuickFrameRow[] }) {
  const { t } = useI18n();
  return (
    <div className={styles.outcomeQuickFrame}>
      {rows.map((r, i) => (
        <div key={i} className={styles.quickFrameRow}>
          <span className={styles.quickFrameLabel}>{t(r.labelKey)}</span>
          <span className={`${styles.quickFrameValue} ${r.muted ? styles.quickFrameMuted : ""}`}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

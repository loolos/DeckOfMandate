import styles from "../app/Game.module.css";
import { useI18n } from "../locales";
import type { QuickFrameRow } from "../logic/quickOutcomeFrame";
import type { Resources } from "../types/game";
import { ResourceTooltipText } from "./ResourceTooltipText";

export function OutcomeQuickFrame({ rows, resources }: { rows: readonly QuickFrameRow[]; resources?: Resources }) {
  const { t } = useI18n();
  return (
    <div className={styles.outcomeQuickFrame}>
      {rows.map((r, i) => (
        <div key={i} className={styles.quickFrameRow}>
          <span className={styles.quickFrameLabel}>{t(r.labelKey)}</span>
          <span className={`${styles.quickFrameValue} ${r.muted ? styles.quickFrameMuted : ""}`}>
            <ResourceTooltipText text={r.value} resources={resources} />
          </span>
        </div>
      ))}
    </div>
  );
}

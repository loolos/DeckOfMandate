import { useEffect, useState } from "react";
import styles from "../app/Game.module.css";
import { useI18n } from "../locales";
import { useSmallScreen } from "../logic/useSmallScreen";
import type { CampaignStatusRow } from "../levels/campaignUiRegistry";

/** Renders campaign-derived status rows (see `buildCampaignStatusRows`); owns only list chrome and mobile expand/collapse. */
export function StatusBar({ rows }: { rows: readonly CampaignStatusRow[] }) {
  const { t } = useI18n();
  const isSmallScreen = useSmallScreen();
  const [expandedStatusId, setExpandedStatusId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSmallScreen) setExpandedStatusId(null);
  }, [isSmallScreen]);

  useEffect(() => {
    if (expandedStatusId && !rows.some((row) => row.id === expandedStatusId)) {
      setExpandedStatusId(null);
    }
  }, [expandedStatusId, rows]);

  if (rows.length === 0) {
    return <div className={styles.statusBarEmpty}>{t("ui.statuses.empty")}</div>;
  }

  return (
    <ul className={styles.statusList}>
      {rows.map((row) => {
        const showDetails = !isSmallScreen || expandedStatusId === row.id;
        const rowCls = [
          styles.statusRow,
          isSmallScreen && !showDetails && styles.statusRowMobileCompact,
          isSmallScreen && showDetails && styles.statusRowMobileExpanded,
        ]
          .filter(Boolean)
          .join(" ");

        const progressBar = row.progress ? (
          <span className={row.progress.trackClassName} aria-hidden="true">
            <span
              className={row.progress.fillClassName}
              style={{ width: `${Math.max(0, Math.min(100, row.progress.pct))}%` }}
            />
          </span>
        ) : null;

        if (!isSmallScreen) {
          return (
            <li key={row.id} className={rowCls}>
              <span className={styles.statusTitle}>{row.title}</span>
              <span className={styles.statusMeta}>{row.meta}</span>
              {progressBar}
              {row.detail ? <span className={styles.statusDetail}>{row.detail}</span> : null}
            </li>
          );
        }

        return (
          <li
            key={row.id}
            className={rowCls}
            role="button"
            tabIndex={0}
            aria-expanded={showDetails ? "true" : "false"}
            onClick={() => setExpandedStatusId((prev) => (prev === row.id ? null : row.id))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpandedStatusId((prev) => (prev === row.id ? null : row.id));
              }
            }}
          >
            <span className={styles.statusTitle}>{row.title}</span>
            <span className={`${styles.statusMeta} ${styles.statusCompactMeta}`}>
              {showDetails && row.hideMetaWhenExpandedOnMobile ? "" : showDetails ? row.meta : row.compactMeta}
            </span>
            {progressBar}
            {showDetails && row.detail ? <span className={styles.statusDetail}>{row.detail}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

import { useEffect, useMemo, useState } from "react";
import styles from "../app/Game.module.css";
import { getStatusTemplate } from "../data/statusTemplates";
import { useI18n, type MessageKey } from "../locales";
import { useSmallScreen } from "../logic/useSmallScreen";
import type { PlayerStatusInstance } from "../types/status";

type StatusViewRow = {
  id: string;
  title: string;
  compactMeta: string;
  meta: string;
  detail?: string;
  hideMetaWhenExpandedOnMobile?: boolean;
};

function signedValue(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}

function statusDetail(
  status: PlayerStatusInstance,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
): string {
  if (status.kind === "drawAttemptsDelta") {
    return t("ui.statusDetail.drawAttemptsDelta", { delta: signedValue(status.delta ?? 0) });
  }
  if (status.kind === "retentionCapacityDelta") {
    return t("ui.statusDetail.retentionCapacityDelta", { delta: signedValue(status.delta ?? 0) });
  }
  if (status.kind === "beginYearResourceDelta") {
    const resource = status.resource ?? "legitimacy";
    return t("ui.statusDetail.beginYearResourceDelta", {
      resource: t(`resource.${resource}` as MessageKey),
      delta: signedValue(status.delta ?? 0),
    });
  }
  const tagKey = `card.tag.${status.blockedTag ?? "royal"}` as MessageKey;
  return t("ui.statusDetail.blockCardTag", { tag: t(tagKey) });
}

export function StatusBar({
  statuses,
  coalitionActive,
  coalitionProbabilityPct,
  europeAlertActive,
  europeAlertPowerLoss,
}: {
  statuses: readonly PlayerStatusInstance[];
  /** Anti-French League pressure (scripted war follow-up); draw risk is rolled each year in engine. */
  coalitionActive?: boolean;
  /** Rounded percent; shown in status hint (from `antiFrenchLeague.drawPenaltyProbability`). */
  coalitionProbabilityPct?: number;
  /** Chapter 2 continuity marker that increases selected war-pressure event weights. */
  europeAlertActive?: boolean;
  /** Immediate power loss applied when Europe Alert is activated at chapter start. */
  europeAlertPowerLoss?: number;
}) {
  const { t } = useI18n();
  const isSmallScreen = useSmallScreen();
  const [expandedStatusId, setExpandedStatusId] = useState<string | null>(null);
  const pct = coalitionProbabilityPct ?? 0;

  const rows = useMemo<StatusViewRow[]>(() => {
    const next: StatusViewRow[] = [];
    if (europeAlertActive) {
      const hint = t("status.europeAlert.hint", { n: europeAlertPowerLoss ?? 0 });
      const history = t("status.europeAlert.history");
      next.push({
        id: "europeAlert",
        title: t("status.europeAlert.name"),
        compactMeta: "",
        meta: "",
        detail: `${hint} ${history}`.trim(),
        hideMetaWhenExpandedOnMobile: true,
      });
    }
    if (coalitionActive) {
      const hint = t("status.antiFrenchLeague.hint", { pct });
      const history = t("status.antiFrenchLeague.history");
      next.push({
        id: "antiFrenchLeague",
        title: t("status.antiFrenchLeague.name"),
        compactMeta: hint,
        meta: hint,
        detail: `${hint} ${history}`.trim(),
      });
    }
    for (const row of statuses) {
      const tmpl = getStatusTemplate(row.templateId);
      const turnsText =
        row.templateId === "religiousTolerance"
          || row.templateId === "antiFrenchSentiment"
          ? t("ui.statusPermanent")
          : row.templateId === "huguenotContainment"
            ? t("ui.statusHuguenotRemaining", { n: row.turnsRemaining })
            : t("ui.statusTurnsRemaining", { n: row.turnsRemaining });
      const history = tmpl.historyKey ? t(tmpl.historyKey) : "";
      const effectDetail = statusDetail(row, t);
      next.push({
        id: row.instanceId,
        title: t(tmpl.titleKey),
        compactMeta: turnsText,
        meta: turnsText,
        detail:
          row.templateId === "huguenotContainment"
            ? `${effectDetail} ${history} ${t("status.huguenotContainment.hint")}`.trim()
            : `${effectDetail} ${history}`.trim(),
      });
    }
    return next;
  }, [coalitionActive, europeAlertActive, europeAlertPowerLoss, pct, statuses, t]);

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

        if (!isSmallScreen) {
          return (
            <li key={row.id} className={rowCls}>
              <span className={styles.statusTitle}>{row.title}</span>
              <span className={styles.statusMeta}>{row.meta}</span>
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
            {showDetails && row.detail ? <span className={styles.statusDetail}>{row.detail}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

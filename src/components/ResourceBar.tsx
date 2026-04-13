import type { Resources } from "../types/game";
import { resourceLabelWithIcon } from "../logic/icons";
import { useI18n, type MessageKey } from "../locales";
import styles from "../app/Game.module.css";

const FUNDING_ROW = {
  key: "funding" as const,
  labelKey: "resource.funding" as const,
  hintKey: "resource.funding.hint" as const,
};

const OTHER_RESOURCE_ROWS: { key: keyof Resources; labelKey: MessageKey; hintKey: MessageKey }[] = [
  { key: "treasuryStat", labelKey: "resource.treasuryStat", hintKey: "resource.treasuryStat.hint" },
  { key: "power", labelKey: "resource.power", hintKey: "resource.power.hint" },
  { key: "legitimacy", labelKey: "resource.legitimacy", hintKey: "resource.legitimacy.hint" },
];

export function ResourceBar({ resources }: { resources: Resources }) {
  const { t } = useI18n();
  return (
    <div className={styles.resourceStack}>
      <div className={styles.fundingHighlight}>
        <div className={styles.fundingHighlightLabel}>
          {resourceLabelWithIcon(FUNDING_ROW.key, t(FUNDING_ROW.labelKey))}
        </div>
        <div className={styles.fundingHighlightValue}>{resources.funding}</div>
        <div className={styles.fundingHighlightHint}>{t(FUNDING_ROW.hintKey)}</div>
      </div>
      <div className={styles.resourceSecondary}>
        {OTHER_RESOURCE_ROWS.map((it) => (
          <div key={it.key} className={styles.stat}>
            <div className={styles.statLabel}>{resourceLabelWithIcon(it.key, t(it.labelKey))}</div>
            <div className={styles.statValue}>{resources[it.key]}</div>
            <div className={styles.statHint}>{t(it.hintKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

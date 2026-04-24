import { useEffect, useState } from "react";
import type { Resources } from "../types/game";
import { getResourceIcon, resourceLabelWithIcon } from "../logic/icons";
import { drawAttemptsFromPower } from "../logic/drawScaling";
import { useSmallScreen } from "../logic/useSmallScreen";
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

/** One-line mobile summary; extend when `Resources` gains fields (scrolls horizontally). */
const MOBILE_COMPACT_ORDER = ["funding", "treasuryStat", "power", "legitimacy"] as const satisfies readonly (keyof Resources)[];

const LABEL_FOR_KEY: Record<keyof Resources, MessageKey> = {
  funding: "resource.funding",
  treasuryStat: "resource.treasuryStat",
  power: "resource.power",
  legitimacy: "resource.legitimacy",
};

function powerThresholdForDraw(draws: number): number {
  if (draws <= 1) return 1;
  return 1 + ((draws - 1) * draws) / 2;
}

export function ResourceBar({ resources }: { resources: Resources }) {
  const { t } = useI18n();
  const isSmallScreen = useSmallScreen();
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const powerDraws = drawAttemptsFromPower(resources.power);
  const nextPower = powerThresholdForDraw(powerDraws + 1);
  const dropPower = powerDraws <= 1 ? null : powerThresholdForDraw(powerDraws) - 1;
  const powerHint =
    dropPower === null
      ? t("resource.power.hint.min", { current: powerDraws, next: nextPower })
      : t("resource.power.hint", { current: powerDraws, next: nextPower, prev: dropPower });

  useEffect(() => {
    if (!isSmallScreen) setMobileExpanded(false);
  }, [isSmallScreen]);

  const detailStack = (
    <div
      className={
        isSmallScreen && mobileExpanded
          ? `${styles.resourceStack} ${styles.resourceStackMobileHints}`
          : styles.resourceStack
      }
    >
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
            <div className={styles.statHint}>{it.key === "power" ? powerHint : t(it.hintKey)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isSmallScreen) {
    return detailStack;
  }

  const compactAria = MOBILE_COMPACT_ORDER.map((key) => `${t(LABEL_FOR_KEY[key])} ${resources[key]}`).join(", ");

  if (!mobileExpanded) {
    return (
      <div className={styles.resourceBarMobileWrap}>
        <button
          type="button"
          className={styles.resourceMobileCompact}
          onClick={() => setMobileExpanded(true)}
          aria-expanded="false"
          aria-label={`${compactAria}. ${t("ui.resourceMobileExpand")}`}
        >
          <div className={styles.resourceMobileCompactRow}>
            {MOBILE_COMPACT_ORDER.map((key) => (
              <span
                key={key}
                className={styles.resourceMobileChip}
                title={`${resourceLabelWithIcon(key, t(LABEL_FOR_KEY[key]))}: ${resources[key]}`}
              >
                <span className={styles.resourceMobileChipIcon} aria-hidden>
                  {getResourceIcon(key)}
                </span>
                <span className={styles.resourceMobileChipVal}>{resources[key]}</span>
              </span>
            ))}
          </div>
          <div className={styles.resourceMobileCompactHint}>{t("ui.resourceMobileExpand")}</div>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.resourceBarMobileWrap}>
      <button
        type="button"
        className={styles.resourceMobileCollapseBar}
        onClick={() => setMobileExpanded(false)}
        aria-expanded="true"
      >
        {t("ui.resourceMobileCollapse")}
      </button>
      {detailStack}
    </div>
  );
}

import { useState } from "react";
import { getCardTemplate } from "../data/cards";
import type { GameAction } from "../app/gameReducer";
import { OutcomeQuickFrame } from "./OutcomeQuickFrame";
import { buildCardQuickFrameRows } from "../logic/quickOutcomeFrame";
import { cardLabelWithIcon, getCardTypeEmoji } from "../logic/icons";
import { useSmallScreen } from "../logic/useSmallScreen";
import type { GameState } from "../types/game";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import styles from "../app/Game.module.css";

export function Hand({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const { t } = useI18n();
  const isSmallScreen = useSmallScreen();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const crackPick = state.pendingInteraction?.type === "crackdownPick" ? state.pendingInteraction : null;
  const canPlay =
    state.outcome === "playing" && state.phase === "action" && !state.pendingInteraction;

  const blockedRoyal =
    state.playerStatuses.some((st) => st.kind === "blockCardTag" && st.blockedTag === "royal");

  return (
    <div className={styles.hand}>
      {state.hand.map((id, index) => {
        const inst = state.cardsById[id];
        if (!inst) return null;
        const tmpl = getCardTemplate(inst.templateId);
        const affordable = state.resources.funding >= tmpl.cost;
        const blockedByStatus = blockedRoyal && tmpl.tags.includes("royal");
        const playable = canPlay && affordable && !blockedByStatus;
        const title = cardLabelWithIcon(inst.templateId, t(tmpl.titleKey as MessageKey));
        const quickRows = buildCardQuickFrameRows(tmpl);
        const compactSummary = quickRows.map((row) => row.value).join(" · ");
        const showDetails = !isSmallScreen || expandedCardId === id || (crackPick && id === crackPick.cardInstanceId);
        const body = isSmallScreen ? (
          showDetails ? (
            <>
              <div className={styles.cardTitle}>{title}</div>
              <div className={styles.compactSummary}>{compactSummary}</div>
              <div className={styles.compactDetails}>
                <OutcomeQuickFrame rows={quickRows} />
                <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
                <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
              </div>
            </>
          ) : (
            <div className={styles.cardMobileStrip}>
              <span className={styles.cardMobileTypeEmoji} aria-hidden>
                {getCardTypeEmoji(inst.templateId)}
              </span>
              <div className={styles.cardMobileStripTitle}>{title}</div>
              <div className={styles.cardMobileChipCol}>
                {quickRows.map((row, i) => (
                  <span key={i} className={styles.cardMobileChipLine}>
                    {row.value}
                  </span>
                ))}
              </div>
            </div>
          )
        ) : (
          <>
            <div className={styles.cardTitle}>{title}</div>
            <OutcomeQuickFrame rows={quickRows} />
            <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
            <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
          </>
        );

        const mobileHandWidthCls =
          isSmallScreen && (showDetails || (crackPick && id === crackPick.cardInstanceId))
            ? styles.cardHandMobileExpanded
            : isSmallScreen
              ? styles.cardHandMobileNarrow
              : "";

        const cardClassName = [styles.card, mobileHandWidthCls, isSmallScreen && !playable && styles.cardDisabled]
          .filter(Boolean)
          .join(" ");

        if (crackPick && id === crackPick.cardInstanceId) {
          return (
            <div key={id} className={[styles.card, styles.cardPendingCrackdown, mobileHandWidthCls].filter(Boolean).join(" ")}>
              {body}
              <div className={styles.cardPendingCrackdownActions}>
                <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={() => dispatch({ type: "CRACKDOWN_CANCEL" })}>
                  {t("ui.cancel")}
                </button>
              </div>
            </div>
          );
        }

        const onMobileTap = () => setExpandedCardId((prev) => (prev === id ? null : id));

        if (isSmallScreen) {
          return (
            <div
              key={id}
              className={cardClassName}
              role="button"
              tabIndex={0}
              aria-disabled={!playable ? "true" : undefined}
              aria-expanded={showDetails ? "true" : "false"}
              onClick={onMobileTap}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onMobileTap();
                }
              }}
            >
              {body}
              {showDetails ? (
                <div className={styles.cardMobileActions} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={!playable}
                    onClick={() => dispatch({ type: "PLAY_CARD", handIndex: index })}
                  >
                    {t("ui.playThisCard")}
                  </button>
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <button
            key={id}
            type="button"
            className={cardClassName}
            disabled={!playable}
            onClick={() => dispatch({ type: "PLAY_CARD", handIndex: index })}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}

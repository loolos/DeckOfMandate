import { useEffect, useRef, useState } from "react";
import { getCardTemplate } from "../data/cards";
import type { GameAction } from "../app/gameReducer";
import { OutcomeQuickFrame } from "./OutcomeQuickFrame";
import { buildCardQuickFrameRows } from "../logic/quickOutcomeFrame";
import { cardLabelWithIcon, getCardTypeEmoji } from "../logic/icons";
import { useSmallScreen } from "../logic/useSmallScreen";
import type { GameState } from "../types/game";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import { getPlayableCardCost } from "../logic/cardCost";
import { getCardTagsForInstance, hasCardTag } from "../logic/cardTags";
import { getCardUseStateForInstance } from "../logic/cardUsage";
import type { CardTag } from "../types/tags";
import type { LogInfoKey } from "../types/game";
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
  const collapseDelayMs = 450;
  const lastTapRef = useRef<{ id: string; at: number } | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const crackPick = state.pendingInteraction?.type === "crackdownPick" ? state.pendingInteraction : null;
  const canPlay =
    state.outcome === "playing" && state.phase === "action" && !state.pendingInteraction;

  const blockedRoyal =
    state.playerStatuses.some((st) => st.kind === "blockCardTag" && st.blockedTag === "royal");

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.hand}>
      {state.hand.map((id, index) => {
        const inst = state.cardsById[id];
        if (!inst) return null;
        const tmpl = getCardTemplate(inst.templateId);
        const cost = getPlayableCardCost(state, id);
        const affordable = state.resources.funding >= cost;
        const blockedByStatus = blockedRoyal && hasCardTag(state, id, "royal");
        const playable = canPlay && affordable && !blockedByStatus;
        const title = cardLabelWithIcon(inst.templateId, t(tmpl.titleKey as MessageKey));
        const quickRows = buildCardQuickFrameRows(tmpl, cost);
        const compactSummary = quickRows.map((row) => row.value).join(" · ");
        const showDetails = !isSmallScreen || expandedCardId === id || (crackPick && id === crackPick.cardInstanceId);
        const explainCardTag = (tag: CardTag) =>
          dispatch({
            type: "APPEND_LOG_INFO",
            infoKey: `cardTag.${tag}` as LogInfoKey,
          });
        const tags = getCardTagsForInstance(state, id);
        const cardUse = getCardUseStateForInstance(state, id);
        const tagChips =
          tags.length > 0 || cardUse ? (
            <div className={styles.badges}>
              {cardUse ? (
                <button
                  key={`${id}_remaining_uses`}
                  type="button"
                  className={`${styles.badge} ${styles.tagButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({
                      type: "APPEND_LOG_INFO",
                      infoKey: "cardUse.remainingUses",
                    });
                  }}
                >
                  {t("card.tag.remainingUses", {
                    remaining: cardUse.remaining,
                    total: cardUse.total,
                  })}
                </button>
              ) : null}
              {tags.map((tag) => (
                <button
                  key={`${id}_${tag}`}
                  type="button"
                  className={`${styles.badge} ${styles.tagButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    explainCardTag(tag);
                  }}
                >
                  {t(`card.tag.${tag}` as MessageKey)}
                </button>
              ))}
            </div>
          ) : null;
        const body = isSmallScreen ? (
          showDetails ? (
            <>
              <div className={styles.cardTitle}>{title}</div>
              {tagChips}
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
            {tagChips}
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
        const playCard = () => dispatch({ type: "PLAY_CARD", handIndex: index });

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

        const onMobileTap = () => {
          const now = Date.now();
          const prev = lastTapRef.current;
          const isRapidSecondTap = prev && prev.id === id && now - prev.at <= collapseDelayMs;

          if (collapseTimerRef.current !== null) {
            window.clearTimeout(collapseTimerRef.current);
            collapseTimerRef.current = null;
          }

          if (isRapidSecondTap) {
            lastTapRef.current = null;
            if (playable) playCard();
            return;
          }

          lastTapRef.current = { id, at: now };

          if (!showDetails) {
            setExpandedCardId(id);
            return;
          }

          // On expanded cards, defer collapse briefly so a quick second tap can count as "double-tap to play".
          collapseTimerRef.current = window.setTimeout(() => {
            setExpandedCardId((existing) => (existing === id ? null : existing));
            if (lastTapRef.current?.id === id) lastTapRef.current = null;
            collapseTimerRef.current = null;
          }, collapseDelayMs);
        };

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
                    onClick={playCard}
                  >
                    {t("ui.playThisCard")}
                  </button>
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <div
            key={id}
            className={cardClassName}
            role="button"
            tabIndex={0}
            aria-disabled={!playable ? "true" : undefined}
            onDoubleClick={() => {
              if (playable) playCard();
            }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && playable) {
                e.preventDefault();
                playCard();
              }
            }}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}

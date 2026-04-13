import { useRef, useState } from "react";
import { getCardTemplate } from "../data/cards";
import type { GameAction } from "../app/gameReducer";
import { OutcomeQuickFrame } from "./OutcomeQuickFrame";
import { buildCardQuickFrameRows } from "../logic/quickOutcomeFrame";
import { cardLabelWithIcon } from "../logic/icons";
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
  const lastTapRef = useRef<{ id: string; at: number } | null>(null);
  const crackPick = state.pendingInteraction?.type === "crackdownPick" ? state.pendingInteraction : null;
  const canPlay =
    state.outcome === "playing" && state.phase === "action" && !state.pendingInteraction;

  return (
    <div className={styles.hand}>
      {state.hand.map((id, index) => {
        const inst = state.cardsById[id];
        if (!inst) return null;
        const tmpl = getCardTemplate(inst.templateId);
        const affordable = state.resources.funding >= tmpl.cost;
        const playable = canPlay && affordable;
        const title = cardLabelWithIcon(inst.templateId, t(tmpl.titleKey as MessageKey));
        const quickRows = buildCardQuickFrameRows(tmpl);
        const compactSummary = quickRows.map((row) => row.value).join(" · ");
        const showDetails = !isSmallScreen || expandedCardId === id || (crackPick && id === crackPick.cardInstanceId);
        const body = isSmallScreen ? (
          <>
            <div className={styles.cardTitle}>{title}</div>
            <div className={styles.compactSummary}>{compactSummary}</div>
            {showDetails ? (
              <div className={styles.compactDetails}>
                <OutcomeQuickFrame rows={quickRows} />
                <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
                <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
              </div>
            ) : (
              <div className={styles.compactHint}>{t("ui.mobileCardTapHint")}</div>
            )}
          </>
        ) : (
          <>
            <div className={styles.cardTitle}>{title}</div>
            <OutcomeQuickFrame rows={quickRows} />
            <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
            <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
          </>
        );

        if (crackPick && id === crackPick.cardInstanceId) {
          return (
            <div key={id} className={`${styles.card} ${styles.cardPendingCrackdown}`}>
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
          const lastTap = lastTapRef.current;
          if (playable && lastTap?.id === id && now - lastTap.at <= 360) {
            lastTapRef.current = null;
            dispatch({ type: "PLAY_CARD", handIndex: index });
            return;
          }
          lastTapRef.current = { id, at: now };
          setExpandedCardId((prev) => (prev === id ? null : id));
        };

        return (
          <button
            key={id}
            type="button"
            className={`${styles.card} ${isSmallScreen && !playable ? styles.cardDisabled : ""}`}
            disabled={!isSmallScreen && !playable}
            aria-disabled={isSmallScreen && !playable ? "true" : undefined}
            onClick={isSmallScreen ? onMobileTap : () => dispatch({ type: "PLAY_CARD", handIndex: index })}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}

import { getCardTemplate } from "../data/cards";
import type { GameAction } from "../app/gameReducer";
import { OutcomeQuickFrame } from "./OutcomeQuickFrame";
import { buildCardQuickFrameRows } from "../logic/quickOutcomeFrame";
import { cardLabelWithIcon } from "../logic/icons";
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
  const canPlay =
    state.outcome === "playing" && state.phase === "action" && !state.pendingInteraction;

  return (
    <div className={styles.hand}>
      {state.hand.map((id, index) => {
        const inst = state.cardsById[id];
        if (!inst) return null;
        const tmpl = getCardTemplate(inst.templateId);
        const affordable = state.resources.funding >= tmpl.cost;
        const title = cardLabelWithIcon(inst.templateId, t(tmpl.titleKey as MessageKey));
        return (
          <button
            key={id}
            type="button"
            className={styles.card}
            disabled={!canPlay || !affordable}
            onClick={() => dispatch({ type: "PLAY_CARD", handIndex: index })}
          >
            <div className={styles.cardTitle}>{title}</div>
            <OutcomeQuickFrame rows={buildCardQuickFrameRows(tmpl)} />
            <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
            <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
          </button>
        );
      })}
    </div>
  );
}

import { getEventTemplate } from "../data/events";
import type { GameAction } from "../app/gameReducer";
import { fundSolveLabelAmount, slotAllowsCrackdownTarget, slotAllowsFundSolve } from "../logic/uiHelpers";
import type { GameState } from "../types/game";
import type { SlotId } from "../types/event";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import styles from "../app/Game.module.css";

export function EventPanel({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const { t } = useI18n();
  const slots: SlotId[] = ["A", "B"];
  const pending = state.pendingInteraction?.type === "crackdownPick";

  return (
    <div className={styles.events}>
      {slots.map((slot) => {
        const ev = state.slots[slot];
        const tmpl = ev ? getEventTemplate(ev.templateId) : null;
        const title = tmpl ? t(tmpl.titleKey as MessageKey) : "—";
        const desc = tmpl ? t(tmpl.descriptionKey as MessageKey) : "";
        const canFund = slotAllowsFundSolve(state, slot);
        const amount = fundSolveLabelAmount(state, slot);
        const crack = slotAllowsCrackdownTarget(state, slot) && pending;
        const solveKind = tmpl?.solve.kind;

        return (
          <div key={slot} className={styles.eventCard}>
            <div className={styles.badges}>
              <span className={styles.badge}>{t("ui.slot", { slot })}</span>
              {tmpl ? (
                tmpl.harmful ? (
                  <span className={`${styles.badge} ${styles.badgeHarm}`}>{t("ui.harmful")}</span>
                ) : (
                  <span className={`${styles.badge} ${styles.badgeOk}`}>{t("ui.opportunity")}</span>
                )
              ) : null}
              {ev?.resolved ? (
                <span className={`${styles.badge} ${styles.badgeOk}`}>{t("ui.resolved")}</span>
              ) : null}
            </div>
            <div className={styles.eventTitle}>{title}</div>
            <div className={styles.eventBody}>{desc || (!ev ? "—" : "")}</div>
            <div className={styles.actions}>
              {ev && !ev.resolved && solveKind === "funding" && amount !== null ? (
                <button
                  type="button"
                  className={styles.btn}
                  disabled={!canFund}
                  onClick={() => dispatch({ type: "SOLVE_EVENT", slot })}
                >
                  {t("ui.solve", { cost: amount })}
                </button>
              ) : null}
              {ev && !ev.resolved && solveKind === "fundingOrCrackdown" && amount !== null ? (
                <button
                  type="button"
                  className={styles.btn}
                  disabled={!canFund}
                  onClick={() => dispatch({ type: "SOLVE_EVENT", slot })}
                >
                  {t("ui.solveFundingOrCrackdown", { cost: amount })}
                </button>
              ) : null}
              {ev && !ev.resolved && solveKind === "crackdownOnly" && !pending ? (
                <span className={styles.badge}>{t("ui.solveCrackdown")}</span>
              ) : null}
              {crack ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => dispatch({ type: "CRACKDOWN_TARGET", slot })}
                >
                  {t("ui.solveCrackdown")}
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

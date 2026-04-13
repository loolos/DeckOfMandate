import { getEventTemplate } from "../data/events";
import type { GameAction } from "../app/gameReducer";
import { OutcomeQuickFrame } from "./OutcomeQuickFrame";
import { buildEventQuickFrameRows, buildScriptedEventQuickFrameRows } from "../logic/quickOutcomeFrame";
import { eventLabelWithIcon, getResourceIcon } from "../logic/icons";
import {
  fundSolveLabelAmount,
  slotAllowsCrackdownTarget,
  slotAllowsFundSolve,
  slotAllowsScriptedAttack,
  slotFundSolveAffordable,
  slotScriptedAttackAffordable,
} from "../logic/uiHelpers";
import type { GameState } from "../types/game";
import { EVENT_SLOT_ORDER } from "../types/event";
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
  const visibleSlots = EVENT_SLOT_ORDER.filter((slot) => state.slots[slot] != null);
  const pending = state.pendingInteraction?.type === "crackdownPick";

  if (visibleSlots.length === 0) return null;

  return (
    <div className={styles.events}>
      {visibleSlots.map((slot) => {
        const ev = state.slots[slot]!;
        const tmpl = getEventTemplate(ev.templateId);
        const title = eventLabelWithIcon(tmpl.id, t(tmpl.titleKey as MessageKey));
        const desc = t(tmpl.descriptionKey as MessageKey);
        const affordable = slotFundSolveAffordable(state, slot);
        const canClickFund = slotAllowsFundSolve(state, slot);
        const scriptedAffordable = slotScriptedAttackAffordable(state, slot);
        const canClickScripted = slotAllowsScriptedAttack(state, slot);
        const amount = fundSolveLabelAmount(state, slot);
        const crack = slotAllowsCrackdownTarget(state, slot) && pending;
        const solveKind = tmpl.solve.kind;

        return (
          <div key={slot} className={styles.eventCard} data-crack-candidate={crack ? "true" : undefined}>
            <div className={styles.badges}>
              {tmpl.harmful ? (
                <span className={`${styles.badge} ${styles.badgeHarm}`}>{t("ui.harmful")}</span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeOk}`}>{t("ui.opportunity")}</span>
              )}
              {ev.resolved ? (
                <span className={`${styles.badge} ${styles.badgeOk}`}>{t("ui.resolved")}</span>
              ) : null}
            </div>
            <div className={styles.eventTitle}>{title}</div>
            <div className={styles.eventBody}>{desc}</div>
            <OutcomeQuickFrame
              rows={buildScriptedEventQuickFrameRows(state.levelId, tmpl) ?? buildEventQuickFrameRows(tmpl)}
            />
            <div className={styles.actions}>
              {!ev.resolved && solveKind === "scriptedAttack" && amount !== null ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  disabled={!scriptedAffordable || !canClickScripted}
                  onClick={() => dispatch({ type: "SCRIPTED_EVENT_ATTACK", slot })}
                >
                  {t("ui.scriptedAttack", { cost: `${getResourceIcon("funding")} ${amount}` })}
                </button>
              ) : null}
              {!ev.resolved && solveKind === "funding" && amount !== null ? (
                <button
                  type="button"
                  className={styles.btn}
                  disabled={!affordable || !canClickFund}
                  onClick={() => dispatch({ type: "SOLVE_EVENT", slot })}
                >
                  {t("ui.solve", { cost: `${getResourceIcon("funding")} ${amount}` })}
                </button>
              ) : null}
              {!ev.resolved && solveKind === "fundingOrCrackdown" && amount !== null ? (
                <button
                  type="button"
                  className={styles.btn}
                  disabled={!affordable || !canClickFund}
                  onClick={() => dispatch({ type: "SOLVE_EVENT", slot })}
                >
                  {t("ui.solveFundingOrCrackdown", { cost: `${getResourceIcon("funding")} ${amount}` })}
                </button>
              ) : null}
              {!ev.resolved && solveKind === "crackdownOnly" && !pending ? (
                <span className={styles.eventCardCrackdownHint}>{t("ui.solveCrackdown")}</span>
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

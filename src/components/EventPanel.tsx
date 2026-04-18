import { getEventTemplate } from "../data/events";
import { useState } from "react";
import type { GameAction } from "../app/gameReducer";
import { OutcomeQuickFrame } from "./OutcomeQuickFrame";
import { buildEventQuickFrameRows, buildScriptedEventQuickFrameRows } from "../logic/quickOutcomeFrame";
import { eventLabelWithIcon, getResourceIcon } from "../logic/icons";
import { useSmallScreen } from "../logic/useSmallScreen";
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
import { isHistoricalEventTemplateId } from "../logic/eventTags";

export function EventPanel({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const { t } = useI18n();
  const isSmallScreen = useSmallScreen();
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
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
        const quickRows = buildScriptedEventQuickFrameRows(state.levelId, tmpl) ?? buildEventQuickFrameRows(tmpl);
        const compactSummary = quickRows.map((row) => row.value).join(" · ");
        const showDetails = !isSmallScreen || expandedSlot === slot || crack;
        const toggleCard = () => setExpandedSlot((prev) => (prev === slot ? null : slot));
        const logEventTag = (
          infoKey:
            | "eventTag.harmful"
            | "eventTag.opportunity"
            | "eventTag.historical"
            | "eventTag.continued"
            | "eventTag.resolved",
        ) =>
          dispatch({ type: "APPEND_LOG_INFO", infoKey });
        const historical = isHistoricalEventTemplateId(tmpl.id);

        return (
          <div
            key={slot}
            className={`${styles.eventCard} ${isSmallScreen && !showDetails ? styles.eventCardCollapsed : ""}`}
            data-crack-candidate={crack ? "true" : undefined}
            onClick={isSmallScreen ? toggleCard : undefined}
            role={isSmallScreen ? "button" : undefined}
            tabIndex={isSmallScreen ? 0 : undefined}
            onKeyDown={
              isSmallScreen
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCard();
                    }
                  }
                : undefined
            }
          >
            <div className={styles.eventTitle}>{title}</div>
            {isSmallScreen ? <div className={styles.compactSummary}>{compactSummary}</div> : null}
            {!isSmallScreen || showDetails ? (
              <>
                <div className={styles.badges}>
                  {historical ? (
                    <button
                      type="button"
                      className={`${styles.badge} ${styles.badgeOk} ${styles.tagButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        logEventTag("eventTag.historical");
                      }}
                    >
                      {t("ui.historical")}
                    </button>
                  ) : tmpl.harmful ? (
                    <button
                      type="button"
                      className={`${styles.badge} ${styles.badgeHarm} ${styles.tagButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        logEventTag("eventTag.harmful");
                      }}
                    >
                      {t("ui.harmful")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.badge} ${styles.badgeOk} ${styles.tagButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        logEventTag("eventTag.opportunity");
                      }}
                    >
                      {t("ui.opportunity")}
                    </button>
                  )}
                  {tmpl.crisisPersistence === "continued" ? (
                    <button
                      type="button"
                      className={`${styles.badge} ${styles.badgeHarm} ${styles.tagButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        logEventTag("eventTag.continued");
                      }}
                    >
                      {t("ui.continued")}
                    </button>
                  ) : null}
                  {ev.resolved ? (
                    <button
                      type="button"
                      className={`${styles.badge} ${styles.badgeOk} ${styles.tagButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        logEventTag("eventTag.resolved");
                      }}
                    >
                      {t("ui.resolved")}
                    </button>
                  ) : null}
                </div>
                <div className={styles.eventBody}>{desc}</div>
                <OutcomeQuickFrame rows={quickRows} />
                <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
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
                  {!ev.resolved && solveKind === "nantesPolicyChoice" ? (
                    <>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={Boolean(state.pendingInteraction)}
                        onClick={() => dispatch({ type: "PICK_NANTES_TOLERANCE", slot })}
                      >
                        {t("ui.nantesTolerance")}
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={Boolean(state.pendingInteraction)}
                        onClick={() => dispatch({ type: "PICK_NANTES_CRACKDOWN", slot })}
                      >
                        {t("ui.nantesCrackdown")}
                      </button>
                    </>
                  ) : null}
                  {!ev.resolved && solveKind === "localWarChoice" ? (
                    <>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={Boolean(state.pendingInteraction) || state.resources.funding < state.europeAlertProgress}
                        onClick={() => dispatch({ type: "PICK_LOCAL_WAR_ATTACK", slot })}
                      >
                        {t("ui.localWarAttack", {
                          cost: `${getResourceIcon("funding")} ${state.europeAlertProgress}`,
                        })}
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={Boolean(state.pendingInteraction)}
                        onClick={() => dispatch({ type: "PICK_LOCAL_WAR_APPEASE", slot })}
                      >
                        {t("ui.localWarAppease")}
                      </button>
                    </>
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
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

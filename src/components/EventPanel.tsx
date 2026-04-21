import { getCardTemplate } from "../data/cards";
import { getEventTemplate } from "../data/events";
import { useState } from "react";
import type { GameAction } from "../app/gameReducer";
import { OutcomeQuickFrame } from "./OutcomeQuickFrame";
import {
  buildEventQuickFrameRows,
  buildScriptedEventQuickFrameRows,
  formatEffectChips,
} from "../logic/quickOutcomeFrame";
import { opponentTemplatesToAppliedEffects } from "../logic/opponentHabsburg";
import { cardLabelWithIcon, eventLabelWithIcon, getResourceIcon } from "../logic/icons";
import { useSmallScreen } from "../logic/useSmallScreen";
import {
  fundSolveLabelAmount,
  slotIsHandledOrNoFurtherAction,
  slotAllowsCrackdownTarget,
  slotAllowsFundSolve,
  slotAllowsScriptedAttack,
  slotFundSolveAffordable,
  slotScriptedAttackAffordable,
} from "../logic/uiHelpers";
import type { GameState } from "../types/game";
import { EVENT_SLOT_ORDER } from "../levels/types/event";
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
        if (ev.templateId === "opponentHabsburg") {
          const title = eventLabelWithIcon(tmpl.id, t(tmpl.titleKey as MessageKey));
          const intro = t(tmpl.descriptionKey as MessageKey);
          const showDetails = !isSmallScreen || expandedSlot === slot;
          const toggleCard = () => setExpandedSlot((prev) => (prev === slot ? null : slot));
          const lastIds = state.opponentLastPlayedTemplateIds;
          const lastAppliedFx = formatEffectChips(opponentTemplatesToAppliedEffects(lastIds));
          return (
            <div
              key={slot}
              className={`${styles.eventCard} ${isSmallScreen && !showDetails ? styles.eventCardCollapsed : ""}`}
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
              <div className={styles.badges}>
                <span className={`${styles.badge} ${styles.badgeOk}`}>
                  {t("ui.opponentEvent.strengthTag", { n: state.opponentStrength })}
                </span>
              </div>
              {isSmallScreen ? (
                <div className={styles.compactSummary}>{t("ui.opponentEvent.currentHand")}</div>
              ) : null}
              {!isSmallScreen || showDetails ? (
                <>
                  <div className={styles.eventBody}>{intro}</div>
                  <div className={styles.opponentHabsburgSections}>
                    <div>
                      <h3 className={styles.statusSectionTitle}>{t("ui.opponentEvent.currentHand")}</h3>
                      {state.opponentHand.length === 0 ? (
                        <p className={styles.statusDetail}>{t("ui.opponentEvent.handEmpty")}</p>
                      ) : (
                        <ul className={styles.opponentHandList}>
                          {state.opponentHand.map((cid) => {
                            const inst = state.cardsById[cid];
                            if (!inst) return null;
                            const ct = getCardTemplate(inst.templateId);
                            return (
                              <li key={cid}>
                                <strong>{cardLabelWithIcon(inst.templateId, t(ct.titleKey as MessageKey))}</strong>
                                {" · "}
                                {t("ui.opponentStrength")}: {ct.opponentCost ?? 0} ·{" "}
                                {formatEffectChips(opponentTemplatesToAppliedEffects([inst.templateId]))}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    <div>
                      <h3 className={styles.statusSectionTitle}>{t("ui.opponentEvent.lastPlay")}</h3>
                      {lastIds.length === 0 ? (
                        <p className={styles.statusDetail}>{t("ui.opponentEvent.lastPlayNone")}</p>
                      ) : (
                        <>
                          <p className={styles.statusDetail}>
                            {t("ui.opponentEvent.lastPlayCombinedFx", { fx: lastAppliedFx })}
                          </p>
                          {lastIds.map((tid) => {
                            const ct = getCardTemplate(tid);
                            const histKey = `card.${tid}.opponentHistory` as MessageKey;
                            const singleFx = formatEffectChips(opponentTemplatesToAppliedEffects([tid]));
                            return (
                              <div key={tid} className={styles.opponentLastPlayBlock}>
                                <div className={styles.eventTitle}>
                                  {cardLabelWithIcon(tid, t(ct.titleKey as MessageKey))}
                                </div>
                                <p className={styles.statusDetail}>
                                  {t("ui.opponentEvent.effectSummary", { fx: singleFx })}
                                </p>
                                <p className={styles.eventBody}>{t(histKey)}</p>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          );
        }
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
        const handledOrNoFurtherAction = slotIsHandledOrNoFurtherAction(state, slot);
        const handledMark = handledOrNoFurtherAction ? " 🆗" : "";
        const compactSummaryWithHandledMark = `${compactSummary}${handledMark}`;
        const descWithHandledMark = `${desc}${handledMark}`;
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
            {isSmallScreen ? <div className={styles.compactSummary}>{compactSummaryWithHandledMark}</div> : null}
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
                      {ev.remainingTurns != null
                        ? tmpl.id === "leagueOfAugsburg"
                          ? t("ui.remainingTurns", { n: ev.remainingTurns })
                          : t("ui.continuedTurns", { n: ev.remainingTurns })
                        : t("ui.continued")}
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
                  {!ev.resolved && solveKind === "fundingTreasuryQuarterCeil" && amount !== null ? (
                    <button
                      type="button"
                      className={styles.btn}
                      disabled={!affordable || !canClickFund}
                      onClick={() => dispatch({ type: "SOLVE_EVENT", slot })}
                    >
                      {t("ui.solve", { cost: `${getResourceIcon("funding")} ${amount}` })}
                    </button>
                  ) : null}
                  {!ev.resolved && solveKind === "successionCrisisChoice" ? (
                    <>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        disabled={Boolean(state.pendingInteraction) || state.resources.funding < 3}
                        onClick={() => dispatch({ type: "PICK_SUCCESSION_CRISIS", slot, pay: true })}
                      >
                        {t("ui.successionCrisisPay")}
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={Boolean(state.pendingInteraction)}
                        onClick={() => dispatch({ type: "PICK_SUCCESSION_CRISIS", slot, pay: false })}
                      >
                        {t("ui.successionCrisisDecline")}
                      </button>
                    </>
                  ) : null}
                  {!ev.resolved && solveKind === "utrechtTreatyChoice" ? (
                    <>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        disabled={Boolean(state.pendingInteraction)}
                        onClick={() => dispatch({ type: "PICK_UTRECHT_TREATY", slot, endWar: true })}
                      >
                        {t("ui.utrechtEndWar")}
                      </button>
                      <button
                        type="button"
                        className={styles.btn}
                        disabled={Boolean(state.pendingInteraction)}
                        onClick={() => dispatch({ type: "PICK_UTRECHT_TREATY", slot, endWar: false })}
                      >
                        {t("ui.utrechtWait", { n: state.utrechtTreatyCountdown ?? 6 })}
                      </button>
                    </>
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
                        disabled={Boolean(state.pendingInteraction) || amount == null || state.resources.funding < amount}
                        onClick={() => dispatch({ type: "PICK_LOCAL_WAR_ATTACK", slot })}
                      >
                        {t("ui.localWarAttack", {
                          cost: `${getResourceIcon("funding")} ${amount ?? state.europeAlertProgress}`,
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
                <div className={styles.eventBody}>{descWithHandledMark}</div>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

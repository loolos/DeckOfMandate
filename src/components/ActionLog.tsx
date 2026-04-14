import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { getCardTemplate } from "../data/cards";
import { getEventTemplate } from "../data/events";
import { cardLabelWithIcon, eventLabelWithIcon, resourceLabelWithIcon } from "../logic/icons";
import { formatEffectLogLine } from "../logic/formatEffectLog";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import { useSmallScreen } from "../logic/useSmallScreen";
import type { ActionLogEntry } from "../types/game";
import type { CardTemplateId } from "../types/card";
import type { EventTemplateId } from "../types/event";
import styles from "../app/Game.module.css";

const STICKY_PX = 48;

function cardTitleKey(id: CardTemplateId): MessageKey {
  return getCardTemplate(id).titleKey as MessageKey;
}

function eventTitleKey(id: EventTemplateId): MessageKey {
  return getEventTemplate(id).titleKey as MessageKey;
}

function renderEntry(e: ActionLogEntry, t: (key: MessageKey, vars?: Record<string, string | number>) => string) {
  const fundingLabel = resourceLabelWithIcon("funding", t("resource.funding"));
  switch (e.kind) {
    case "cardPlayed":
      return (
        <div>
          <div className={styles.actionLogHead}>
            {t("log.cardPlayed.title", {
              turn: e.turn,
              card: cardLabelWithIcon(e.templateId, t(cardTitleKey(e.templateId))),
              cost: e.fundingCost,
              funding: fundingLabel,
            })}
          </div>
          {e.effects.length > 0 ? (
            <>
              <div className={styles.actionLogSubMuted}>{t("log.cardPlayed.effectsLabel")}</div>
              {e.effects.map((fx, i) => (
                <div key={i} className={styles.actionLogSub}>
                  {formatEffectLogLine(fx, t)}
                </div>
              ))}
            </>
          ) : (
            <div className={styles.actionLogSub}>{t("log.cardPlayed.noEffects")}</div>
          )}
        </div>
      );
    case "eventFundSolved": {
      const treasury =
        e.treasuryGain > 0 ? t("log.eventFundSolved.treasury", { gain: e.treasuryGain }) : "";
      return (
        <div className={styles.actionLogHead}>
          {t("log.eventFundSolved", {
            turn: e.turn,
            slot: e.slot,
            event: eventLabelWithIcon(e.templateId, t(eventTitleKey(e.templateId))),
            paid: e.fundingPaid,
            funding: fundingLabel,
            treasury,
          })}
        </div>
      );
    }
    case "eventCrackdownSolved":
      return (
        <div className={styles.actionLogHead}>
          {t("log.eventCrackdownSolved", {
            turn: e.turn,
            slot: e.slot,
            event: eventLabelWithIcon(e.harmfulEventTemplateId, t(eventTitleKey(e.harmfulEventTemplateId))),
            paid: e.fundingPaid,
            funding: fundingLabel,
          })}
        </div>
      );
    case "eventYearEndPenalty":
      return (
        <div>
          <div className={styles.actionLogHead}>
            {t("log.eventYearEndPenalty.title", {
              turn: e.turn,
              slot: e.slot,
              event: eventLabelWithIcon(e.templateId, t(eventTitleKey(e.templateId))),
            })}
          </div>
          {e.effects.length > 0 ? (
            <>
              <div className={styles.actionLogSubMuted}>{t("log.eventYearEndPenalty.effectsLabel")}</div>
              {e.effects.map((fx, i) => (
                <div key={i} className={styles.actionLogSub}>
                  {formatEffectLogLine(fx, t)}
                </div>
              ))}
            </>
          ) : null}
        </div>
      );
    case "eventPowerVacuumScheduled":
      return (
        <div className={styles.actionLogHead}>
          {t("log.eventPowerVacuumScheduled", {
            turn: e.turn,
            slot: e.slot,
            event: eventLabelWithIcon(e.templateId, t(eventTitleKey(e.templateId))),
          })}
        </div>
      );
    case "crackdownCancelled":
      return (
        <div className={styles.actionLogHead}>
          {t("log.crackdownCancelled", {
            turn: e.turn,
            refund: e.refund,
            funding: fundingLabel,
          })}
        </div>
      );
    case "crackdownPickPrompt":
      return (
        <div className={styles.actionLogHead}>
          {t("log.crackdownPickPrompt", { turn: e.turn })}
        </div>
      );
    case "eventScriptedAttack": {
      if (e.templateId === "warOfDevolution") {
        const powerDelta = e.powerDelta ?? 0;
        const rollPct = e.extraTreasuryProbabilityPct ?? 0;
        return (
          <div>
            <div className={styles.actionLogHead}>
              {t("log.eventScriptedAttack.war.title", {
                turn: e.turn,
                slot: e.slot,
                event: eventLabelWithIcon(e.templateId, t(eventTitleKey(e.templateId))),
              })}
            </div>
            <div className={styles.actionLogSub}>
              {t("log.eventScriptedAttack.war.summary", {
                paid: e.fundingPaid,
                funding: fundingLabel,
                powerDelta,
                power: resourceLabelWithIcon("power", t("resource.power")),
              })}
            </div>
            <div className={styles.actionLogSub}>
              {e.treasuryGain > 0
                ? t("log.eventScriptedAttack.war.treasuryYes", {
                    gain: e.treasuryGain,
                    treasury: resourceLabelWithIcon("treasuryStat", t("resource.treasuryStat")),
                    rollPct,
                  })
                : t("log.eventScriptedAttack.war.treasuryNo", { rollPct })}
            </div>
            <div className={styles.actionLogSubMuted}>{t("log.eventScriptedAttack.war.coalitionNote")}</div>
          </div>
        );
      }
      const treasury =
        e.treasuryGain > 0 ? t("log.eventFundSolved.treasury", { gain: e.treasuryGain }) : "";
      return (
        <div className={styles.actionLogHead}>
          {t("log.eventScriptedAttack.generic", {
            turn: e.turn,
            slot: e.slot,
            event: eventLabelWithIcon(e.templateId, t(eventTitleKey(e.templateId))),
            paid: e.fundingPaid,
            funding: fundingLabel,
            treasury,
          })}
        </div>
      );
    }
    case "antiFrenchLeagueDraw":
      return (
        <div>
          <div className={styles.actionLogHead}>
            {t("log.antiFrenchLeagueDraw.title", { turn: e.turn, pct: e.probabilityPct })}
          </div>
          <div className={styles.actionLogSubMuted}>{t("log.antiFrenchLeagueDraw.history")}</div>
        </div>
      );
    case "drawOverflowDiscarded": {
      const cardList = e.cardTemplateIds
        .map((id) => cardLabelWithIcon(id, t(cardTitleKey(id))))
        .join("、");
      return (
        <div className={styles.actionLogHead}>
          {t("log.drawOverflowDiscarded.title", {
            turn: e.turn,
            count: e.cardTemplateIds.length,
            cards: cardList,
          })}
        </div>
      );
    }
    case "info":
      return <div className={styles.actionLogHead}>{t(`log.info.${e.infoKey}` as MessageKey, { turn: e.turn })}</div>;
    default: {
      const _never: never = e;
      return _never;
    }
  }
}

export function ActionLog({
  entries,
  showMobileTapGuide,
}: {
  entries: readonly ActionLogEntry[];
  /** Action phase only — small-screen card/event tap hint lives in the log once. */
  showMobileTapGuide?: boolean;
}) {
  const { t } = useI18n();
  const isSmallScreen = useSmallScreen();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [followTail, setFollowTail] = useState(true);
  const lastEntryId = entries.length > 0 ? entries[entries.length - 1]!.id : "";

  const onScroll = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setFollowTail(dist < STICKY_PX);
  }, []);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || !followTail) return;
    el.scrollTop = el.scrollHeight;
  }, [entries.length, lastEntryId, followTail]);

  return (
    <section className={`${styles.panel} ${styles.actionLogSection}`} aria-label={t("ui.actionLog")}>
      <h2 className={styles.actionLogHeading}>{t("ui.actionLog")}</h2>
      <div
        ref={wrapRef}
        className={styles.actionLogScroll}
        onScroll={onScroll}
        tabIndex={0}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {isSmallScreen && showMobileTapGuide ? (
          <div className={styles.actionLogRow}>
            <p className={styles.actionLogEmpty} style={{ marginTop: 0 }}>
              {t("ui.mobileLogTapHint")}
            </p>
          </div>
        ) : null}
        {entries.length === 0 ? (
          <p className={styles.actionLogEmpty}>{t("ui.actionLog.empty")}</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className={styles.actionLogRow}>
              {renderEntry(e, t)}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { getCardTemplate } from "../data/cards";
import { getEventTemplate } from "../data/events";
import { formatEffectLogLine } from "../logic/formatEffectLog";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
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
  const fundingLabel = t("resource.funding");
  switch (e.kind) {
    case "cardPlayed":
      return (
        <div>
          <div className={styles.actionLogHead}>
            {t("log.cardPlayed.title", {
              turn: e.turn,
              card: t(cardTitleKey(e.templateId)),
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
            event: t(eventTitleKey(e.templateId)),
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
            event: t(eventTitleKey(e.harmfulEventTemplateId)),
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
              event: t(eventTitleKey(e.templateId)),
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
            event: t(eventTitleKey(e.templateId)),
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
    default: {
      const _never: never = e;
      return _never;
    }
  }
}

export function ActionLog({ entries }: { entries: readonly ActionLogEntry[] }) {
  const { t } = useI18n();
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

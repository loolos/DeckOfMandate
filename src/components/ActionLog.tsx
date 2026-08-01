import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { renderCampaignLogEntry } from "../levels/campaignUiRegistry";
import { useI18n } from "../locales";
import { useSmallScreen } from "../logic/useSmallScreen";
import type { ActionLogEntry } from "../types/game";
import styles from "../app/Game.module.css";

const STICKY_PX = 48;

export function ActionLog({
  entries,
  showMobileTapGuide,
  forceScrollToken,
  flashToken,
}: {
  entries: readonly ActionLogEntry[];
  /** Action phase only — small-screen card/event tap hint lives in the log once. */
  showMobileTapGuide?: boolean;
  /** External trigger that should forcibly scroll the log tail (e.g. after end-of-turn clicks). */
  forceScrollToken?: number;
  /** External trigger that briefly highlights the log panel when tags append explanatory entries. */
  flashToken?: number;
}) {
  const { t } = useI18n();
  const isSmallScreen = useSmallScreen();
  const wrapRef = useRef<HTMLDivElement>(null);
  const flashRafRef = useRef<number | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const [followTail, setFollowTail] = useState(true);
  const [flashActive, setFlashActive] = useState(false);
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

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setFollowTail(true);
  }, [forceScrollToken]);

  useEffect(() => {
    if (!flashToken) return;
    if (flashRafRef.current !== null) {
      window.cancelAnimationFrame(flashRafRef.current);
      flashRafRef.current = null;
    }
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    setFlashActive(false);
    flashRafRef.current = window.requestAnimationFrame(() => {
      flashRafRef.current = null;
      setFlashActive(true);
      flashTimerRef.current = window.setTimeout(() => {
        setFlashActive(false);
        flashTimerRef.current = null;
      }, 2200);
    });
  }, [flashToken]);

  useEffect(() => {
    return () => {
      if (flashRafRef.current !== null) window.cancelAnimationFrame(flashRafRef.current);
      if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
    };
  }, []);

  const logScroll = (
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
            {renderCampaignLogEntry(e, t)}
          </div>
        ))
      )}
    </div>
  );

  return (
    <section
      className={`${styles.panel} ${styles.actionLogSection} ${flashActive ? styles.actionLogFlash : ""}`}
      id="tutorial-action-log"
      aria-label={t("ui.actionLog")}
    >
      <h2 className={styles.actionLogHeading}>{t("ui.actionLog")}</h2>
      {isSmallScreen ? (
        logScroll
      ) : (
        <div className={styles.actionLogResizable} title={t("ui.actionLogResizeHint")}>
          {logScroll}
        </div>
      )}
    </section>
  );
}

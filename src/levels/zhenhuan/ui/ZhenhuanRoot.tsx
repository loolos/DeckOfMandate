import { useCallback, useEffect, useMemo, useState } from "react";
import { CampaignSwitcher } from "../../../components/CampaignSwitcher";
import { RunCodePanel } from "../../../components/RunCodePanel";
import { CAMPAIGN_TITLE, CHAPTER } from "../data/content";
import { STAGE2 } from "../data/stage2Content";
import { newGame, reduce, type ZhAction } from "../logic/engine";
import {
  clearSession,
  continueToStage2,
  decodeSessionCode,
  encodeSessionCode,
  loadSession,
  saveSession,
  startStage2Standalone,
  type Session,
} from "../logic/session";
import { newStage2, reduce2, type Z2Action } from "../logic/stage2Engine";
import { backdropUrl } from "./art";
import { Backdrop } from "./common";
import { CompactModeToggle } from "./CompactModeToggle";
import { RulesSummary } from "./RulesSummary";
import { Stage2Game, Stage2Rules } from "./Stage2Game";
import { ZhenhuanGame } from "./ZhenhuanGame";
import styles from "./zhenhuan.module.css";

/** Same pacing as the Sun King level intro: backdrop alone first, then the panel fades in. */
const INTRO_DELAY_MS = 1000;

function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647) + 1;
}

export function ZhenhuanRoot() {
  const [session, setSession] = useState<Session | null>(null);
  const [showRules, setShowRules] = useState(false);
  /** A level has just started: only the backdrop shows until the delay passes. */
  const [introPending, setIntroPending] = useState(false);
  const [introFade, setIntroFade] = useState(false);
  const [saved, setSaved] = useState<Session | null>(() => loadSession());
  const [seedText, setSeedText] = useState("");

  const seedTrimmed = seedText.trim();
  const seedInvalid = seedTrimmed !== "" && !Number.isInteger(Number(seedTrimmed));
  const chosenSeed = () => (seedTrimmed === "" ? randomSeed() : Number(seedTrimmed));

  const dispatch1 = useCallback((action: ZhAction) => {
    setSession((g) => (g?.stage === 1 ? { stage: 1, state: reduce(g.state, action) } : g));
  }, []);
  const dispatch2 = useCallback((action: Z2Action) => {
    setSession((g) => (g?.stage === 2 ? { ...g, state: reduce2(g.state, action) } : g));
  }, []);

  // Autosave point is the start of the current turn; a finished run clears the save
  // (a won 第一关 keeps nothing: continuing creates the 第二关 save).
  useEffect(() => {
    if (!session) return;
    if (session.state.outcome === "playing") saveSession(session);
    else clearSession();
  }, [session]);

  const runCode = useMemo(() => (session ? encodeSessionCode(session) : ""), [session]);

  useEffect(() => {
    if (!introPending) return;
    const id = window.setTimeout(() => {
      setIntroPending(false);
      setIntroFade(true);
      setShowRules(true);
    }, INTRO_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [introPending]);

  const open = (next: Session, rules: boolean) => {
    setSession(next);
    setShowRules(false);
    setIntroPending(rules);
    setIntroFade(false);
  };

  const onShowRules = (show: boolean) => {
    setShowRules(show);
    if (!show) setIntroFade(false);
  };

  const loadCode = (raw: string): { ok: true } | { ok: false; error: string } => {
    const result = decodeSessionCode(raw);
    if (!result.ok) return { ok: false, error: result.error };
    open(result.session, false);
    return { ok: true };
  };

  const backToMenu = () => {
    setSaved(loadSession());
    setSession(null);
    setShowRules(false);
    setIntroPending(false);
    setIntroFade(false);
  };

  if (session?.stage === 1) {
    const st = session.state;
    return (
      <div className={styles.root}>
        <Backdrop src={backdropUrl(1)} />
        {introPending ? null : (
          <div className={introFade ? styles.introFade : undefined}>
            <ZhenhuanGame
              state={st}
              dispatch={dispatch1}
              showRules={showRules}
              onShowRules={onShowRules}
              onRestart={() => open({ stage: 1, state: newGame(randomSeed()) }, true)}
              onMenu={backToMenu}
              onLoadCode={loadCode}
              onNextStage={st.outcome === "won" ? () => open(continueToStage2(st, randomSeed()), true) : undefined}
            />
          </div>
        )}
      </div>
    );
  }

  if (session?.stage === 2) {
    return (
      <div className={styles.root}>
        <Backdrop src={backdropUrl(2)} />
        {introPending ? null : (
          <div className={introFade ? styles.introFade : undefined}>
            <Stage2Game
              state={session.state}
              dispatch={dispatch2}
              runCode={runCode}
              showRules={showRules}
              onShowRules={onShowRules}
              onRestart={() => {
                // Same carry-over (and 第一关 record) as this run, new seed.
                const seed = randomSeed();
                open({ stage: 2, state: newStage2(seed, session.state.carry), stage1: session.stage1 }, true);
              }}
              onMenu={backToMenu}
              onLoadCode={loadCode}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <Backdrop src={backdropUrl(1)} variant="menu" />
      <div className={styles.menuScreen}>
        <div className={styles.menuPanel} role="dialog" aria-labelledby="zh-menu-title">
          <h1 id="zh-menu-title" className={styles.menuTitle}>
            {CAMPAIGN_TITLE}
          </h1>
          <CampaignSwitcher labelClassName={styles.menuLabel} selectClassName={styles.menuInput} />
          <CompactModeToggle />
          <p className={styles.menuHint}>
            {CHAPTER.title}：从答应起步，在晋封考验中晋为常在，并坚持到第 {CHAPTER.totalTurns} 回合。通关后可接着进入{STAGE2.title}。
          </p>
          <details>
            <summary className={styles.muted}>规则概要 · 第一关</summary>
            <RulesSummary />
          </details>
          <details>
            <summary className={styles.muted}>规则概要 · 第二关</summary>
            <Stage2Rules />
          </details>
          <label className={styles.menuLabel} htmlFor="zh-seed">
            随机种子（可选）
          </label>
          <input
            id="zh-seed"
            className={styles.menuInput}
            inputMode="numeric"
            autoComplete="off"
            placeholder="留空则随机"
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
          />
          {seedInvalid ? <p className={styles.menuError}>种子必须是整数。</p> : null}
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={seedInvalid}
            onClick={() => open({ stage: 1, state: newGame(chosenSeed()) }, true)}
          >
            开始新对局（第一关）
          </button>
          <button type="button" className={styles.btn} disabled={seedInvalid} onClick={() => open(startStage2Standalone(chosenSeed()), true)}>
            直接开始第二关（清誉 / 圣宠 {STAGE2.standaloneQingyu}）
          </button>
          {saved ? (
            <button type="button" className={styles.btn} onClick={() => open(saved, false)}>
              继续存档（{saved.stage === 2 ? "第二关" : "第一关"} 第 {saved.state.turn} 回合开始）
            </button>
          ) : null}
          <RunCodePanel variant="startMenu" code="" onLoad={loadCode} />
        </div>
      </div>
    </div>
  );
}

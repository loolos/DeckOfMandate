import { useCallback, useEffect, useMemo, useState } from "react";
import { CampaignSwitcher } from "../../../components/CampaignSwitcher";
import { RunCodePanel } from "../../../components/RunCodePanel";
import { CAMPAIGN_TITLE, CHAPTER } from "../data/content";
import { STAGE2 } from "../data/stage2Content";
import { STAGE3 } from "../data/stage3Content";
import { newGame, reduce, type ZhAction } from "../logic/engine";
import {
  clearSession,
  continueToStage2,
  continueToStage3,
  decodeSessionCode,
  encodeSessionCode,
  loadSession,
  saveSession,
  startStage2Standalone,
  startStage3Standalone,
  type Session,
} from "../logic/session";
import { newStage2, reduce2, type Z2Action } from "../logic/stage2Engine";
import { newStage3, reduce3, type Z3Action } from "../logic/stage3Engine";
import { backdropUrl } from "./art";
import { Backdrop } from "./common";
import { CompactModeToggle } from "./CompactModeToggle";
import { Stage2Game } from "./Stage2Game";
import { Stage3Game } from "./Stage3Game";
import { musicMood } from "./music";
import { MusicToggle, useBgm } from "./useBgm";
import { ZhenhuanGame } from "./ZhenhuanGame";
import styles from "./zhenhuan.module.css";

/** Same pacing as the Sun King level intro: backdrop alone first, then the panel fades in. */
const INTRO_DELAY_MS = 1000;
/** Start menu: backdrop alone first (same pacing as Sun King), then the panel fades in. */
const MENU_DELAY_MS = 2000;

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
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuStage, setMenuStage] = useState<1 | 2 | 3>(1);

  const seedTrimmed = seedText.trim();
  const seedInvalid = seedTrimmed !== "" && !Number.isInteger(Number(seedTrimmed));
  const chosenSeed = () => (seedTrimmed === "" ? randomSeed() : Number(seedTrimmed));

  const dispatch1 = useCallback((action: ZhAction) => {
    setSession((g) => (g?.stage === 1 ? { stage: 1, state: reduce(g.state, action) } : g));
  }, []);
  const dispatch2 = useCallback((action: Z2Action) => {
    setSession((g) => (g?.stage === 2 ? { ...g, state: reduce2(g.state, action) } : g));
  }, []);
  const dispatch3 = useCallback((action: Z3Action) => {
    setSession((g) => (g?.stage === 3 ? { ...g, state: reduce3(g.state, action) } : g));
  }, []);

  // Autosave point is the start of the current turn; a finished run clears the save
  // (a won 第一关 keeps nothing: continuing creates the 第二关 save).
  useEffect(() => {
    if (!session) return;
    if (session.state.outcome === "playing") saveSession(session);
    else clearSession();
  }, [session]);

  useBgm(musicMood(session));

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

  const onMenuScreen = session === null;
  useEffect(() => {
    if (!onMenuScreen) return;
    setMenuVisible(false);
    const id = window.setTimeout(() => setMenuVisible(true), MENU_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [onMenuScreen]);

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
              onNextStage={session.state.outcome === "won" ? () => open(continueToStage3(session, randomSeed()), true) : undefined}
            />
          </div>
        )}
      </div>
    );
  }

  if (session?.stage === 3) {
    return (
      <div className={styles.root}>
        <Backdrop src={backdropUrl(3)} />
        {introPending ? null : (
          <div className={introFade ? styles.introFade : undefined}>
            <Stage3Game
              state={session.state}
              dispatch={dispatch3}
              runCode={runCode}
              showRules={showRules}
              onShowRules={onShowRules}
              onRestart={() => {
                // Same carry-over (and earlier records) as this run, new seed.
                const seed = randomSeed();
                open({ ...session, state: newStage3(seed, session.state.carry) }, true);
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
      <div className={styles.menuScreen} aria-busy={!menuVisible}>
        {menuVisible ? (
        <div className={`${styles.menuPanel} ${styles.introFade}`} role="dialog" aria-labelledby="zh-menu-title">
          <h1 id="zh-menu-title" className={styles.menuTitle}>
            {CAMPAIGN_TITLE}
          </h1>
          <CampaignSwitcher labelClassName={styles.menuLabel} selectClassName={styles.menuInput} />
          <CompactModeToggle />
          <MusicToggle />
          <label className={styles.menuLabel} htmlFor="zh-level">
            选择关卡
          </label>
          <select
            id="zh-level"
            className={styles.menuInput}
            value={menuStage}
            onChange={(e) => setMenuStage(e.target.value === "3" ? 3 : e.target.value === "2" ? 2 : 1)}
          >
            <option value={1}>{CHAPTER.title}</option>
            <option value={2}>{STAGE2.title}</option>
            <option value={3}>{STAGE3.title}</option>
          </select>
          <p className={styles.menuHint}>
            {menuStage === 1
              ? `${CHAPTER.title}：甄嬛初入宫门，位分低微，宫里的一切规矩、人心与风波，都要她一一去面对。`
              : menuStage === 2
                ? `${STAGE2.title}：甄嬛渐得圣宠，也入了宠冠六宫的华妃的眼。翊坤宫的锋芒，从此冲着她而来。`
                : `${STAGE3.title}：华妃倒了，皇后的笑意却一日深过一日。从碎玉轩到甘露寺，再从凌云峰回到紫禁城。`}
          </p>
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
            onClick={() =>
              open(
                menuStage === 1 ? { stage: 1, state: newGame(chosenSeed()) } : menuStage === 2 ? startStage2Standalone(chosenSeed()) : startStage3Standalone(chosenSeed()),
                true,
              )
            }
          >
            开始关卡
          </button>
          {saved ? (
            <button type="button" className={styles.btn} onClick={() => open(saved, false)}>
              继续存档（{["", "第一关", "第二关", "第三关"][saved.stage]} 第 {saved.state.turn} 回合开始）
            </button>
          ) : null}
          <RunCodePanel variant="startMenu" code="" onLoad={loadCode} />
        </div>
        ) : null}
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { CampaignSwitcher } from "../../../components/CampaignSwitcher";
import { RunCodePanel } from "../../../components/RunCodePanel";
import { CHAPTER } from "../data/content";
import { newGame, reduce, type ZhAction, type ZhState } from "../logic/engine";
import { clearSave, decodeRunCode, loadSave, saveAtTurnStart } from "../logic/persistence";
import { CompactModeToggle } from "./CompactModeToggle";
import { RulesSummary } from "./RulesSummary";
import { ZhenhuanGame } from "./ZhenhuanGame";
import styles from "./zhenhuan.module.css";

function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647) + 1;
}

export function ZhenhuanRoot() {
  const [game, setGame] = useState<ZhState | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [savedGame, setSavedGame] = useState<ZhState | null>(() => loadSave());
  const [seedText, setSeedText] = useState("");

  const seedTrimmed = seedText.trim();
  const seedInvalid = seedTrimmed !== "" && !Number.isInteger(Number(seedTrimmed));

  const dispatch = useCallback((action: ZhAction) => {
    setGame((g) => (g ? reduce(g, action) : g));
  }, []);

  // Autosave point is the start of the current turn (writing it again mid-turn is a no-op);
  // a finished run clears the save.
  useEffect(() => {
    if (!game) return;
    if (game.outcome === "playing") saveAtTurnStart(game);
    else clearSave();
  }, [game]);

  const start = (seed: number) => {
    setGame(newGame(seed));
    setShowRules(true);
  };

  const backToMenu = () => {
    setSavedGame(loadSave());
    setGame(null);
    setShowRules(false);
  };

  if (game) {
    return (
      <div className={styles.root}>
        <ZhenhuanGame
          state={game}
          dispatch={dispatch}
          showRules={showRules}
          onShowRules={setShowRules}
          onRestart={() => start(randomSeed())}
          onMenu={backToMenu}
          onLoadState={(s) => {
            setGame(s);
            setShowRules(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.menuScreen}>
        <div className={styles.menuPanel} role="dialog" aria-labelledby="zh-menu-title">
          <h1 id="zh-menu-title" className={styles.menuTitle}>
            甄嬛传
          </h1>
          <CampaignSwitcher labelClassName={styles.menuLabel} selectClassName={styles.menuInput} />
          <CompactModeToggle />
          <p className={styles.menuHint}>{CHAPTER.title}：从答应起步，在晋封考验中晋为常在，并坚持到第 {CHAPTER.totalTurns} 回合。</p>
          <details>
            <summary className={styles.muted}>规则概要</summary>
            <RulesSummary />
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
            onClick={() => start(seedTrimmed === "" ? randomSeed() : Number(seedTrimmed))}
          >
            开始新对局
          </button>
          {savedGame ? (
            <button type="button" className={styles.btn} onClick={() => setGame(savedGame)}>
              继续存档（第 {savedGame.turn} 回合开始）
            </button>
          ) : null}
          <RunCodePanel
            variant="startMenu"
            code=""
            onLoad={(raw) => {
              const result = decodeRunCode(raw);
              if (!result.ok) return { ok: false, error: result.error };
              setGame(result.state);
              return { ok: true };
            }}
          />
        </div>
      </div>
    </div>
  );
}

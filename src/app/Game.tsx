import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import startMenuBackdropUrl from "../img/maintheme.webp";
import { ActionLog } from "../components/ActionLog";
import { EventPanel } from "../components/EventPanel";
import { Hand } from "../components/Hand";
import { LanguageToggle } from "../components/LanguageToggle";
import { LevelTutorialOverlay } from "../components/LevelTutorialOverlay";
import { ResourceBar } from "../components/ResourceBar";
import { RunCodePanel } from "../components/RunCodePanel";
import { StatusBar } from "../components/StatusBar";
import { getCardTemplate } from "../data/cards";
import {
  getDefaultLevelId,
  getLevelDef,
  getRegisteredLevelIds,
  getTurnLimitForRun,
  isLevelId,
  type LevelId,
} from "../data/levels";
import { cardLabelWithIcon } from "../logic/icons";
import { normalizeGameState } from "../logic/normalizeGameState";
import { currentCalendarYear } from "../logic/scriptedCalendar";
import {
  buildCampaignOutcomeCopy,
  buildCampaignRetentionCapLabel,
  buildCampaignStatusRows,
  buildCampaignTargetsLine,
  getCampaignLevelTheme,
  getCampaignPreRunScreen,
  getCampaignRunContinuation,
  type CampaignPreRunConfirm,
  type CampaignPreRunRequest,
} from "../levels/campaignUiRegistry";
import { slotIsHandledOrNoFurtherAction } from "../logic/uiHelpers";
import { loadGame, saveGame } from "../logic/saveLoad";
import { readTutorialOnLevelEntry, writeTutorialOnLevelEntry } from "../logic/tutorialPref";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import type { GameState } from "../types/game";
import { EVENT_SLOT_ORDER } from "../levels/types/event";
import { gameReducer, type GameAction } from "./gameReducer";
import { createInitialState } from "./initialState";
import styles from "./Game.module.css";
import { retentionCapacity } from "../logic/turnFlow";
import {
  annotateConfirmRetention,
  decodeSession,
  encodeSession,
  shouldRecordAction,
  type RunRecord,
  type SessionRecord,
} from "../logic/runCode";

/** Start menu only — from `src/img/main.png` via `npm run compress:menu` → maintheme.webp */
const START_MENU_BACKDROP_STYLE: CSSProperties = {
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.45)), url(${startMenuBackdropUrl})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};


const GRID_SPLIT_STORAGE_KEY = "deckOfMandate_ui_gridSplit";
const GRID_WIDE_MEDIA = "(min-width: 900px)";
/** Cold-open splash: show backdrop only, then reveal the main menu panel. */
const ENTRY_MAIN_MENU_DELAY_MS = 2000;
/** Level intro: show backdrop for 1s, then fade intro panel in for 2s. */
const LEVEL_INTRO_CONTENT_DELAY_MS = 1000;

function clampGridSplit(n: number): number {
  return Math.min(0.72, Math.max(0.28, n));
}

function readInitialGridSplit(): number {
  if (typeof window === "undefined") return 0.5;
  try {
    const raw = localStorage.getItem(GRID_SPLIT_STORAGE_KEY);
    if (raw == null) return 0.5;
    const v = Number(raw);
    if (!Number.isFinite(v)) return 0.5;
    return clampGridSplit(v);
  } catch {
    return 0.5;
  }
}

type PendingNewRun = { seed?: number; levelId: LevelId };

function levelDefHasIntro(def: ReturnType<typeof getLevelDef>): def is ReturnType<typeof getLevelDef> & {
  introTitleKey: MessageKey;
  introBodyKey: MessageKey;
} {
  return "introTitleKey" in def && "introBodyKey" in def;
}

function isValidSave(x: unknown): x is GameState {
  if (!x || typeof x !== "object") return false;
  const o = x as Partial<GameState>;
  return (
    typeof o.runSeed === "number" &&
    typeof o.turn === "number" &&
    typeof o.phase === "string" &&
    Array.isArray(o.hand) &&
    typeof o.resources === "object" &&
    o.resources != null
  );
}

function normalizeLoadedSave(state: GameState): GameState {
  return normalizeGameState(state);
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.isContentEditable
  );
}

function isTagExplanationAction(action: GameAction): boolean {
  if (action.type !== "APPEND_LOG_INFO") return false;
  return (
    action.infoKey.startsWith("cardTag.") ||
    action.infoKey.startsWith("eventTag.") ||
    action.infoKey === "cardUse.remainingUses"
  );
}

/** Fresh run until the player leaves the start menu (avoids showing “resume” as the default entry). */
function initFreshForStartMenu(): GameState {
  return createInitialState();
}

function hasValidStoredSave(): boolean {
  const loaded = loadGame();
  return Boolean(loaded && isValidSave(loaded));
}

export function Game() {
  const { t, locale } = useI18n();
  const [state, dispatch] = useReducer(gameReducer, undefined, initFreshForStartMenu);
  const [retain, setRetain] = useState<Record<string, boolean>>({});
  const hadSaveOnLaunch = useMemo(() => hasValidStoredSave(), []);
  const [startMenuOpen, setStartMenuOpen] = useState(true);
  const [entryMainMenuVisible, setEntryMainMenuVisible] = useState(false);
  const [menuLevelId, setMenuLevelId] = useState<LevelId>(() => getDefaultLevelId());
  const [menuSeedText, setMenuSeedText] = useState("");
  const [pendingNewRun, setPendingNewRun] = useState<PendingNewRun | null>(null);
  const [pendingHydrateState, setPendingHydrateState] = useState<GameState | null>(null);
  const [pendingIntroLevelId, setPendingIntroLevelId] = useState<LevelId | null>(null);
  const [levelIntroOpen, setLevelIntroOpen] = useState(false);
  const [levelIntroContentVisible, setLevelIntroContentVisible] = useState(false);
  const [tutorialOnEntryMenu, setTutorialOnEntryMenu] = useState(() => readTutorialOnLevelEntry());
  const [pendingLevelTutorial, setPendingLevelTutorial] = useState(false);
  const [preRunRequest, setPreRunRequest] = useState<CampaignPreRunRequest | null>(null);
  const [preRunNeedsIntroOnConfirm, setPreRunNeedsIntroOnConfirm] = useState(true);
  const [gridSplit, setGridSplit] = useState(readInitialGridSplit);
  const [wideGameGrid, setWideGameGrid] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(GRID_WIDE_MEDIA).matches : false,
  );
  const [logForceScrollToken, setLogForceScrollToken] = useState(0);
  const [logFlashToken, setLogFlashToken] = useState(0);
  const [handResetToken, setHandResetToken] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const handScrollRef = useRef<HTMLDivElement>(null);
  const gridColumnDragRef = useRef<{ startX: number; startSplit: number; width: number } | null>(null);
  const gridSplitRef = useRef(gridSplit);
  gridSplitRef.current = gridSplit;
  const sessionRef = useRef<SessionRecord>([]);
  /** Predicted state for the next action — chains across multiple dispatches in one event before React re-renders. */
  const pendingStateRef = useRef(state);
  pendingStateRef.current = state;
  const [codeHex, setCodeHex] = useState("");

  useEffect(() => {
    eventsScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
    handScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
  }, [state.turn]);

  const resetHandViewport = useCallback(() => {
    handScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        handScrollRef.current?.scrollTo({ left: 0, behavior: "auto" });
      });
    }
  }, []);

  const refreshCodeHex = useCallback(() => {
    setCodeHex(encodeSession(sessionRef.current));
  }, []);

  const startStandaloneSession = useCallback(
    (level: LevelId, seed: number, removedIndices: number[] = []) => {
      // Only campaign-bootstrapped levels carry recorded card removals from their pre-run screen.
      const needsPreRunScreen = getLevelDef(level).bootstrap !== "initial";
      const record: RunRecord = {
        level,
        mode: "standalone",
        seed: seed >>> 0,
        removedIndices: needsPreRunScreen ? removedIndices : [],
        actions: [],
      };
      sessionRef.current = [record];
      refreshCodeHex();
    },
    [refreshCodeHex],
  );

  const appendContinuityChapterSession = useCallback(
    (targetLevelId: LevelId, seed: number, removedIndices: number[], calendarStartYear: number, continuitySnapshot: import("../logic/runCode").ContinuitySnapshot) => {
      sessionRef.current = [
        ...sessionRef.current,
        {
          level: targetLevelId,
          mode: "continuity",
          seed: seed >>> 0,
          removedIndices,
          actions: [],
          calendarStartYear,
          continuitySnapshot,
        },
      ];
      refreshCodeHex();
    },
    [refreshCodeHex],
  );

  const clearSession = useCallback(() => {
    sessionRef.current = [];
    refreshCodeHex();
  }, [refreshCodeHex]);

  const menuSeedTrimmed = menuSeedText.trim();
  const menuSeedParsed =
    menuSeedTrimmed === "" ? ("empty" as const) : Number.isFinite(Number(menuSeedTrimmed)) ? Number(menuSeedTrimmed) : ("invalid" as const);
  const selectedMenuLevelDef = useMemo(() => getLevelDef(menuLevelId), [menuLevelId]);

  useEffect(() => {
    if (startMenuOpen) return;
    saveGame(state);
  }, [state, startMenuOpen]);

  useEffect(() => {
    const id = window.setTimeout(() => setEntryMainMenuVisible(true), ENTRY_MAIN_MENU_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!levelIntroOpen) {
      setLevelIntroContentVisible(false);
      return;
    }
    setLevelIntroContentVisible(false);
    const id = window.setTimeout(() => setLevelIntroContentVisible(true), LEVEL_INTRO_CONTENT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [levelIntroOpen, pendingIntroLevelId]);

  const level = useMemo(() => getLevelDef(state.levelId), [state.levelId]);
  const statusRows = useMemo(() => buildCampaignStatusRows(state, t), [state, t]);
  const runContinuation = useMemo(
    () => (state.outcome === "victory" ? getCampaignRunContinuation(state) : null),
    [state],
  );
  const outcomeCopy = useMemo(
    () => (state.outcome === "playing" ? null : buildCampaignOutcomeCopy(state, t)),
    [state, t],
  );
  const runTurnLimit = useMemo(
    () => getTurnLimitForRun(state.levelId, state.calendarStartYear),
    [state.levelId, state.calendarStartYear],
  );

  const displayCalendarYear = useMemo(() => currentCalendarYear(state), [state]);

  useEffect(() => {
    if (state.phase !== "retention") return;
    const next: Record<string, boolean> = {};
    for (const id of state.hand) next[id] = false;
    setRetain(next);
  }, [state.phase, state.hand]);

  useEffect(() => {
    if (!pendingLevelTutorial) return;
    if (state.outcome !== "playing" || state.phase !== "action") {
      setPendingLevelTutorial(false);
    }
  }, [state.outcome, state.phase, pendingLevelTutorial]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(GRID_WIDE_MEDIA);
    const onChange = (event: MediaQueryListEvent) => {
      setWideGameGrid(event.matches);
    };
    setWideGameGrid(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const persistGridSplit = useCallback(() => {
    try {
      localStorage.setItem(GRID_SPLIT_STORAGE_KEY, String(gridSplitRef.current));
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const onGridColumnPointerDown = useCallback((e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const g = gridRef.current;
    if (!g) return;
    gridColumnDragRef.current = {
      startX: e.clientX,
      startSplit: gridSplitRef.current,
      width: g.getBoundingClientRect().width,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onGridColumnPointerMove = useCallback((e: PointerEvent<HTMLButtonElement>) => {
    const d = gridColumnDragRef.current;
    if (!d) return;
    const handle = 10;
    const gapApprox = 32;
    const track = Math.max(160, d.width - handle - gapApprox);
    const delta = e.clientX - d.startX;
    const next = clampGridSplit(d.startSplit + delta / track);
    gridSplitRef.current = next;
    setGridSplit(next);
  }, []);

  const onGridColumnPointerUp = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (gridColumnDragRef.current == null) return;
      gridColumnDragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* not captured */
      }
      persistGridSplit();
    },
    [persistGridSplit],
  );

  const onGridColumnPointerCancel = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (gridColumnDragRef.current == null) return;
      gridColumnDragRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      persistGridSplit();
    },
    [persistGridSplit],
  );

  const canEndYear =
    state.outcome === "playing" &&
    state.phase === "action" &&
    !state.pendingInteraction;

  const selectedIds = Object.entries(retain)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const canConfirmRetention =
    state.phase === "retention" &&
    selectedIds.length <= retentionCapacity(state) &&
    selectedIds.every((id) => state.hand.includes(id));
  const retentionCap = state.phase === "retention" ? retentionCapacity(state) : 0;
  const retentionKeepCount = selectedIds.length;
  const retentionDiscardCount = Math.max(state.hand.length - retentionKeepCount, 0);
  const retentionOverLimit = Math.max(retentionKeepCount - retentionCap, 0);
  const retentionSelectionLegal = state.phase === "retention" && retentionOverLimit === 0;

  const dispatchSafe = (a: GameAction) => {
    const before = pendingStateRef.current;
    const next = gameReducer(before, a);
    if (shouldRecordAction(a) && next !== before) {
      const head = sessionRef.current[sessionRef.current.length - 1];
      if (head) {
        const recorded =
          a.type === "CONFIRM_RETENTION" ? annotateConfirmRetention(a, before) : a;
        head.actions.push(recorded);
        refreshCodeHex();
      }
    }
    if (a.type === "END_YEAR" || a.type === "CONFIRM_RETENTION") {
      setLogForceScrollToken((prev) => prev + 1);
      setHandResetToken((prev) => prev + 1);
    }
    if (isTagExplanationAction(a)) {
      setLogFlashToken((prev) => prev + 1);
    }
    pendingStateRef.current = next;
    dispatch(a);
    if (a.type === "END_YEAR" || a.type === "CONFIRM_RETENTION") {
      resetHandViewport();
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== " " && event.code !== "Space") return;
      if (isTypingTarget(event.target)) return;
      if (!canEndYear) return;
      event.preventDefault();
      dispatchSafe({ type: "END_YEAR" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canEndYear, dispatchSafe]);

  const restartCurrentLevelRun = useCallback(() => {
    const currentLevelDef = getLevelDef(state.levelId);
    if (currentLevelDef.bootstrap !== "initial") {
      setPendingHydrateState(null);
      setPendingNewRun({ levelId: state.levelId });
      setPendingIntroLevelId(state.levelId);
      setLevelIntroOpen(true);
      return;
    }
    dispatchSafe({ type: "NEW_GAME" });
    startStandaloneSession(pendingStateRef.current.levelId, pendingStateRef.current.runSeed);
  }, [state, startStandaloneSession]);

  const loadFromCode = useCallback(
    (rawHex: string): { ok: true } | { ok: false; error: string } => {
      let decoded;
      try {
        decoded = decodeSession(rawHex);
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
      try {
        sessionRef.current = decoded.session.map((run) => ({
          ...run,
          actions: [...run.actions],
        })) as SessionRecord;
        setCodeHex(encodeSession(sessionRef.current));
        setPendingLevelTutorial(false);
        setPendingHydrateState(null);
        setPendingIntroLevelId(null);
        setPreRunRequest(null);
        setLevelIntroOpen(false);
        setPendingNewRun(null);
        dispatch({ type: "HYDRATE", state: decoded.finalState });
        setStartMenuOpen(false);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
    [],
  );

  const dismissLevelTutorial = useCallback(() => {
    setPendingLevelTutorial(false);
  }, []);

  const beginConfiguredRun = (
    seed: number | undefined,
    levelId: LevelId,
    introAlreadyShownForThisStart = false,
  ) => {
    setPendingHydrateState(null);
    setPendingIntroLevelId(null);
    if (getLevelDef(levelId).bootstrap !== "initial") {
      setPreRunRequest({ kind: "standaloneStart", levelId, seed });
      setPreRunNeedsIntroOnConfirm(!introAlreadyShownForThisStart);
      setLevelIntroOpen(false);
      setPendingNewRun(null);
      return;
    }
    setPendingLevelTutorial(tutorialOnEntryMenu);
    dispatchSafe({ type: "NEW_GAME", seed, levelId });
    startStandaloneSession(pendingStateRef.current.levelId, pendingStateRef.current.runSeed);
    setStartMenuOpen(false);
    setLevelIntroOpen(false);
    setPendingNewRun(null);
  };

  const requestRunStart = useCallback(
    (levelId: LevelId, seed: number | undefined) => {
      const def = getLevelDef(levelId);
      if (levelDefHasIntro(def)) {
        setPendingNewRun({ seed, levelId });
        setPendingHydrateState(null);
        setPendingIntroLevelId(levelId);
        setLevelIntroOpen(true);
        return;
      }
      beginConfiguredRun(seed, levelId);
    },
    [beginConfiguredRun],
  );

  const requestStartFromMenu = () => {
    const seed = menuSeedParsed === "empty" ? undefined : (menuSeedParsed as number);
    const def = getLevelDef(menuLevelId);
    if (levelDefHasIntro(def)) {
      requestRunStart(menuLevelId, seed);
    } else {
      beginConfiguredRun(seed, menuLevelId);
    }
  };

  const confirmLevelIntro = () => {
    if (pendingHydrateState && pendingIntroLevelId) {
      setPendingLevelTutorial(tutorialOnEntryMenu);
      dispatchSafe({ type: "HYDRATE", state: pendingHydrateState });
      setStartMenuOpen(false);
      setPreRunRequest(null);
      setLevelIntroOpen(false);
      setPendingHydrateState(null);
      setPendingIntroLevelId(null);
      setPendingNewRun(null);
      return;
    }
    if (!pendingNewRun) return;
    beginConfiguredRun(pendingNewRun.seed, pendingNewRun.levelId, true);
  };

  const resumeFromStoredSave = () => {
    setPendingLevelTutorial(false);
    setPendingHydrateState(null);
    setPendingIntroLevelId(null);
    setPreRunRequest(null);
    const loaded = loadGame();
    if (!loaded || !isValidSave(loaded)) return;
    dispatchSafe({ type: "HYDRATE", state: normalizeLoadedSave(loaded as GameState) });
    // The local-storage save is just a state snapshot; we have no recoverable action history,
    // so the run code is intentionally cleared on resume.
    clearSession();
    setStartMenuOpen(false);
  };

  const confirmPreRun = useCallback(
    (result: CampaignPreRunConfirm) => {
      const nextState = result.state;
      const removedIndices = [...result.removedIndices];
      if (result.continuitySnapshot) {
        appendContinuityChapterSession(
          nextState.levelId,
          nextState.runSeed,
          removedIndices,
          nextState.calendarStartYear,
          result.continuitySnapshot,
        );
      } else {
        startStandaloneSession(nextState.levelId, nextState.runSeed, removedIndices);
      }
      setPreRunRequest(null);
      setPendingNewRun(null);
      if (levelDefHasIntro(getLevelDef(nextState.levelId)) && preRunNeedsIntroOnConfirm) {
        setPendingHydrateState(nextState);
        setPendingIntroLevelId(nextState.levelId);
        setLevelIntroOpen(true);
        setStartMenuOpen(false);
        return;
      }
      setPendingLevelTutorial(tutorialOnEntryMenu);
      dispatchSafe({ type: "HYDRATE", state: nextState });
      setStartMenuOpen(false);
      setLevelIntroOpen(false);
      setPendingHydrateState(null);
      setPendingIntroLevelId(null);
    },
    [
      appendContinuityChapterSession,
      dispatchSafe,
      preRunNeedsIntroOnConfirm,
      startStandaloneSession,
      tutorialOnEntryMenu,
    ],
  );

  const cancelPreRun = useCallback(() => {
    setPreRunRequest(null);
    setStartMenuOpen(true);
  }, []);

  /** Post-victory CTA: hand the finished run to the campaign's pre-run screen. */
  const openRunContinuation = useCallback(() => {
    setPreRunRequest({ kind: "continueFromRun", state });
    setPreRunNeedsIntroOnConfirm(true);
    setPendingNewRun(null);
  }, [state]);

  const introLevelDef =
    levelIntroOpen && pendingIntroLevelId && levelDefHasIntro(getLevelDef(pendingIntroLevelId))
      ? getLevelDef(pendingIntroLevelId)
      : null;

  const introTheme = getCampaignLevelTheme(introLevelDef?.id);
  const introGlass = introTheme?.glass ?? false;

  const levelIntro = introLevelDef ? (
    <div
      className={styles.levelIntroScreen}
      style={introTheme?.backdropStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-intro-title"
    >
      {levelIntroContentVisible ? (
        <div
          className={[styles.modal, introGlass && styles.modalGlass, styles.levelIntroMainFade]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.levelIntroHeader}>
            <h2 id="level-intro-title" className={styles.levelIntroTitle}>
              {t(introLevelDef.introTitleKey as MessageKey)}
            </h2>
            <LanguageToggle />
          </div>
          <div className={styles.levelIntroBody}>{t(introLevelDef.introBodyKey as MessageKey)}</div>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={confirmLevelIntro}>
            {t("menu.introContinue")}
          </button>
        </div>
      ) : null}
    </div>
  ) : null;

  const PreRunScreen = getCampaignPreRunScreen();
  const preRunScreenNode =
    preRunRequest && PreRunScreen ? (
      <PreRunScreen request={preRunRequest} onConfirm={confirmPreRun} onCancel={cancelPreRun} />
    ) : null;

  const startMenu = (
    <div
      className={styles.startMenuScreen}
      style={START_MENU_BACKDROP_STYLE}
      aria-busy={!entryMainMenuVisible}
    >
      {entryMainMenuVisible ? (
        <div
          className={`${styles.modal} ${styles.modalGlass} ${styles.startMenuMainFade}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-menu-title"
        >
          <div className={styles.startMenuHeader}>
            <h2 id="start-menu-title" className={styles.startMenuTitle}>
              {t("menu.title")}
            </h2>
            <LanguageToggle />
          </div>
          <div className={styles.startMenuForm}>
          <label className={styles.startMenuLabel} htmlFor="start-menu-level">
            {t("menu.levelLabel")}
          </label>
          <select
            id="start-menu-level"
            className={styles.startMenuSelect}
            value={menuLevelId}
            onChange={(e) => {
              const v = e.target.value;
              if (isLevelId(v)) setMenuLevelId(v);
            }}
          >
            {getRegisteredLevelIds().map((id) => {
              const def = getLevelDef(id);
              return (
                <option key={id} value={id}>
                  {t(def.nameKey as MessageKey)}
                </option>
              );
            })}
          </select>
          {!selectedMenuLevelDef.supportedLocales.includes(locale) ? (
            <p className={styles.startMenuError} role="status">
              {t("ui.levelLocaleFallback")}
            </p>
          ) : null}
          <p className={styles.startMenuMuted}>{t(selectedMenuLevelDef.menuBriefKey as MessageKey)}</p>
          <label className={styles.startMenuLabel} htmlFor="start-menu-seed">
            {t("menu.seedLabel")}
          </label>
          <input
            id="start-menu-seed"
            type="text"
            className={styles.startMenuInput}
            inputMode="numeric"
            autoComplete="off"
            placeholder={t("menu.seedPlaceholder")}
            value={menuSeedText}
            onChange={(e) => setMenuSeedText(e.target.value)}
          />
          {menuSeedParsed === "invalid" ? (
            <p className={styles.startMenuError} role="alert">
              {t("menu.seedInvalid")}
            </p>
          ) : (
            <p className={styles.startMenuMuted}>{t("menu.seedHint")}</p>
          )}
          <label className={styles.startMenuTutorial}>
            <input
              type="checkbox"
              checked={tutorialOnEntryMenu}
              onChange={(e) => {
                const next = e.target.checked;
                setTutorialOnEntryMenu(next);
                writeTutorialOnLevelEntry(next);
              }}
            />
            <span>
              {t("menu.tutorialOnLevelEntry")}
              <span className={styles.startMenuTutorialHint}>{t("menu.tutorialOnLevelEntryHint")}</span>
            </span>
          </label>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={menuSeedParsed === "invalid"}
            onClick={requestStartFromMenu}
          >
            {t("menu.startConfigured")}
          </button>
          <RunCodePanel variant="startMenu" code="" onLoad={loadFromCode} />
        </div>
          {hadSaveOnLaunch ? (
            <div className={styles.startMenuResume}>
              <button type="button" className={styles.btn} onClick={resumeFromStoredSave}>
                {t("menu.resumeSave")}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (levelIntro) {
    return levelIntro;
  }

  if (startMenuOpen) {
    return preRunScreenNode ?? startMenu;
  }

  if (preRunScreenNode) {
    return preRunScreenNode;
  }

  const showLevelTutorial =
    pendingLevelTutorial && state.outcome === "playing" && state.phase === "action";

  const hasEventsPanel =
    EVENT_SLOT_ORDER.some((id) => state.slots[id] != null) || state.pendingInteraction != null;
  const visibleEventCount = EVENT_SLOT_ORDER.filter((id) => state.slots[id] != null).length;
  const unresolvedEventCount = EVENT_SLOT_ORDER.filter((id) => {
    if (state.slots[id] == null) return false;
    return !slotIsHandledOrNoFurtherAction(state, id);
  }).length;
  const gridTemplateColumns =
    wideGameGrid && hasEventsPanel ? `${gridSplit * 2}fr 10px ${(1 - gridSplit) * 2}fr` : "1fr";

  const playTheme = getCampaignLevelTheme(state.levelId);
  const glassPlayShell = playTheme?.glass ?? false;

  return (
    <div
      className={[styles.playShell, glassPlayShell && styles.playShellThemed].filter(Boolean).join(" ")}
      style={playTheme?.backdropStyle}
    >
    <div className={styles.root}>
      {showLevelTutorial ? (
        <LevelTutorialOverlay open={showLevelTutorial} onDismiss={dismissLevelTutorial} />
      ) : null}

      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>{t("app.title")}</h1>
          <p>{t(level.nameKey as MessageKey)}</p>
          <div className={styles.banner}>
            {displayCalendarYear}
            <span style={{ marginLeft: "0.65rem", color: "var(--muted)", fontSize: "0.95rem" }}>
              {t((level.turnBannerKey ?? "banner.turn") as MessageKey, {
                turn: state.turn,
                limit: runTurnLimit,
              })}
            </span>
          </div>
          <div className={styles.targets} id="tutorial-targets">
            {buildCampaignTargetsLine(state, runTurnLimit, t)}
          </div>
          {level.timeStepHintKey ? (
            <p className={styles.timeStepHint}>{t(level.timeStepHintKey as MessageKey)}</p>
          ) : null}
        </div>
        <LanguageToggle />
      </header>

      <p className={styles.help}>{t("help.short")}</p>

      <div ref={gridRef} className={styles.grid} style={{ gridTemplateColumns }}>
        <section className={styles.panel} id="tutorial-resources">
          <h2>{t("ui.resources")}</h2>
          <ResourceBar resources={state.resources} />
          <h3 className={styles.statusSectionTitle}>{t("ui.statuses")}</h3>
          <StatusBar rows={statusRows} />
        </section>

        {wideGameGrid && hasEventsPanel ? (
          <button
            type="button"
            className={styles.columnResizer}
            aria-label={t("ui.columnResizeHint")}
            onPointerDown={onGridColumnPointerDown}
            onPointerMove={onGridColumnPointerMove}
            onPointerUp={onGridColumnPointerUp}
            onPointerCancel={onGridColumnPointerCancel}
          />
        ) : null}

        {hasEventsPanel ? (
          <section className={`${styles.panel} ${styles.eventsPanel}`} id="tutorial-events">
            <h2>{t("ui.eventsWithCounts", { total: visibleEventCount, unresolved: unresolvedEventCount })}</h2>
            <div className={styles.eventsResizable} title={t("ui.eventsResizeHint")}>
              <EventPanel state={state} dispatch={dispatchSafe} scrollContainerRef={eventsScrollRef} />
            </div>
          </section>
        ) : null}
      </div>

      <section className={`${styles.panel} ${styles.handPanel}`} id="tutorial-hand">
        <h2>{t("ui.handWithCount", { n: state.hand.length, funding: state.resources.funding })}</h2>
        <div className={styles.handResizable} title={t("ui.handResizeHint")}>
          <Hand key={handResetToken} state={state} dispatch={dispatchSafe} scrollContainerRef={handScrollRef} />
        </div>
      </section>

      {state.phase === "action" && state.outcome === "playing" ? (
        <div style={{ display: "flex", justifyContent: "center", margin: "0.75rem 0" }}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={!canEndYear}
            onClick={() => dispatchSafe({ type: "END_YEAR" })}
          >
            📜 {t("ui.endTurn")}
          </button>
        </div>
      ) : null}

      <ActionLog
        entries={state.actionLog}
        showMobileTapGuide={state.outcome === "playing" && state.phase === "action"}
        forceScrollToken={logForceScrollToken}
        flashToken={logFlashToken}
      />

      <div className={styles.footerRow}>
        <div className={styles.piles}>
          <span>
            {t("ui.deck")}: {state.deck.length}
          </span>
          <span>
            {t("ui.discard")}: {state.discard.length}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className={styles.btn} onClick={() => restartCurrentLevelRun()}>
            {t("ui.newGame")}
          </button>
        </div>
      </div>

      <p className={styles.help}>
        {state.phase === "action" && state.outcome === "playing"
          ? t("phase.action")
          : state.phase === "retention"
            ? t("phase.retention")
            : t("phase.gameOver")}
      </p>

      <RunCodePanel variant={glassPlayShell ? "inGameGlass" : "inGame"} code={codeHex} onLoad={loadFromCode} />

      {state.phase === "retention" && state.outcome === "playing" ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={[styles.modal, glassPlayShell && styles.modalGlass].filter(Boolean).join(" ")}>
            <h3>{t("phase.retention")}</h3>
            <p className={styles.help}>
              {buildCampaignRetentionCapLabel(state, retentionCapacity(state), t)}
            </p>
            <p className={retentionSelectionLegal ? styles.retainLegalityOk : styles.retainLegalityBad}>
              {t("ui.retentionLegalitySummary", {
                cap: retentionCap,
                keep: retentionKeepCount,
                discard: retentionDiscardCount,
              })}
              {retentionOverLimit > 0 ? ` ${t("ui.retentionLegalityOverflow", { over: retentionOverLimit })}` : ""}
            </p>
            <div className={styles.retainList}>
              {state.hand.map((id) => {
                const inst = state.cardsById[id];
                if (!inst) return null;
                return (
                  <div key={id} className={styles.retainRow}>
                    <input
                      id={`keep-${id}`}
                      type="checkbox"
                      checked={Boolean(retain[id])}
                      onChange={(e) => setRetain((prev) => ({ ...prev, [id]: e.target.checked }))}
                    />
                    <label htmlFor={`keep-${id}`}>
                      {cardLabelWithIcon(
                        state.cardsById[id]!.templateId,
                        t(getCardTemplate(state.cardsById[id]!.templateId).titleKey as MessageKey),
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!canConfirmRetention}
              onClick={() => dispatchSafe({ type: "CONFIRM_RETENTION", keepIds: selectedIds })}
            >
              {t("ui.confirmRetention")}
            </button>
          </div>
        </div>
      ) : null}

      {state.outcome !== "playing" ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={[styles.modal, glassPlayShell && styles.modalGlass].filter(Boolean).join(" ")}>
            <div className={styles.gameOver}>
              <h2>{outcomeCopy?.headline}</h2>
              {outcomeCopy && outcomeCopy.paragraphs.length > 0 ? (
                <div className={styles.gameOverBody}>
                  {outcomeCopy.paragraphs.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : null}
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => restartCurrentLevelRun()}>
                {t("ui.newGame")}
              </button>
              {runContinuation ? (
                <button type="button" className={styles.btn} onClick={openRunContinuation}>
                  {t(runContinuation.continueLabelKey as MessageKey)}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </div>
  );
}

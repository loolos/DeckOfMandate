import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ActionLog } from "../components/ActionLog";
import { EventPanel } from "../components/EventPanel";
import { Hand } from "../components/Hand";
import { LanguageToggle } from "../components/LanguageToggle";
import { LevelTutorialOverlay } from "../components/LevelTutorialOverlay";
import { OutcomeQuickFrame } from "../components/OutcomeQuickFrame";
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
  type LevelEndingCopyKeys,
  type LevelId,
} from "../data/levels";
import { cardLabelWithIcon, resourceLabelWithIcon } from "../logic/icons";
import { normalizeGameState } from "../logic/normalizeGameState";
import { currentCalendarYear } from "../logic/scriptedCalendar";
import { antiFrenchSentimentEmotionValue } from "../logic/antiFrenchSentiment";
import { loadGame, saveGame } from "../logic/saveLoad";
import { readTutorialOnLevelEntry, writeTutorialOnLevelEntry } from "../logic/tutorialPref";
import { buildCardQuickFrameRows } from "../logic/quickOutcomeFrame";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import type { GameState } from "../types/game";
import type { CardTag } from "../levels/types/tags";
import { EVENT_SLOT_ORDER } from "../levels/types/event";
import { gameReducer, type GameAction } from "./gameReducer";
import { createInitialState } from "./initialState";
import {
  LEVEL2_CONTINUITY_MAX_REMOVALS,
  LEVEL2_FIXED_NEW_IDS,
  SUNKING_CH1_ID,
  SUNKING_CH2_ID,
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
  toggleContinuityCardRemoval,
  validateLevel2Draft,
  type Level2CarryoverCard,
  type Level2StartDraft,
} from "./level2Transition";
import {
  buildLevel3StateFromDraft,
  createContinuityLevel3Draft,
  createStandaloneLevel3Draft,
  validateLevel3Draft,
  SUNKING_CH3_ID,
  type Level3StartDraft,
} from "./level3Transition";
import { LEVEL3_STARTING_HAND_TEMPLATE_ORDER } from "../levels/sunking/chapters/thirdMandate";
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

type PendingNewRun = { seed?: number; levelId: LevelId };

function levelDefHasIntro(def: ReturnType<typeof getLevelDef>): def is ReturnType<typeof getLevelDef> & {
  introTitleKey: MessageKey;
  introBodyKey: MessageKey;
} {
  return "introTitleKey" in def && "introBodyKey" in def;
}

function levelEndingKeys(def: ReturnType<typeof getLevelDef>): LevelEndingCopyKeys | undefined {
  return "ending" in def ? def.ending : undefined;
}

function displayRefitTags(_mode: Level2StartDraft["mode"], tags: readonly CardTag[]): readonly CardTag[] {
  return tags;
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

/** Fresh run until the player leaves the start menu (avoids showing “resume” as the default entry). */
function initFreshForStartMenu(): GameState {
  return createInitialState();
}

function hasValidStoredSave(): boolean {
  const loaded = loadGame();
  return Boolean(loaded && isValidSave(loaded));
}

function cloneLevel2Draft(draft: Level2StartDraft): Level2StartDraft {
  return {
    ...draft,
    resources: { ...draft.resources },
    carryoverCards: draft.carryoverCards.map((card) => ({ ...card })),
    removedCarryoverIds: [...draft.removedCarryoverIds],
  };
}

function cloneLevel3Draft(draft: Level3StartDraft): Level3StartDraft {
  return {
    ...draft,
    resources: { ...draft.resources },
    carryoverCards: draft.carryoverCards.map((card) => ({ ...card })),
    removedCarryoverIds: [...draft.removedCarryoverIds],
  };
}

export function Game() {
  const { t, locale } = useI18n();
  const [state, dispatch] = useReducer(gameReducer, undefined, initFreshForStartMenu);
  const [retain, setRetain] = useState<Record<string, boolean>>({});
  const hadSaveOnLaunch = useMemo(() => hasValidStoredSave(), []);
  const [startMenuOpen, setStartMenuOpen] = useState(true);
  const [menuLevelId, setMenuLevelId] = useState<LevelId>(() => getDefaultLevelId());
  const [menuSeedText, setMenuSeedText] = useState("");
  const [pendingNewRun, setPendingNewRun] = useState<PendingNewRun | null>(null);
  const [pendingHydrateState, setPendingHydrateState] = useState<GameState | null>(null);
  const [pendingIntroLevelId, setPendingIntroLevelId] = useState<LevelId | null>(null);
  const [levelIntroOpen, setLevelIntroOpen] = useState(false);
  const [tutorialOnEntryMenu, setTutorialOnEntryMenu] = useState(() => readTutorialOnLevelEntry());
  const [pendingLevelTutorial, setPendingLevelTutorial] = useState(false);
  const [level2Draft, setLevel2Draft] = useState<Level2StartDraft | null>(null);
  const [level2DraftInitial, setLevel2DraftInitial] = useState<Level2StartDraft | null>(null);
  const [level3Draft, setLevel3Draft] = useState<Level3StartDraft | null>(null);
  const [level3DraftInitial, setLevel3DraftInitial] = useState<Level3StartDraft | null>(null);
  const [expandedRefitCardId, setExpandedRefitCardId] = useState<string | null>(null);
  const [isSmallRefitViewport, setIsSmallRefitViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 800px)").matches : false,
  );
  const mobileRefitRowLastTapAt = useRef<Record<string, number>>({});
  const sessionRef = useRef<SessionRecord>([]);
  /** Predicted state for the next action — chains across multiple dispatches in one event before React re-renders. */
  const pendingStateRef = useRef(state);
  pendingStateRef.current = state;
  const [codeHex, setCodeHex] = useState("");

  const refreshCodeHex = useCallback(() => {
    setCodeHex(encodeSession(sessionRef.current));
  }, []);

  const startStandaloneSession = useCallback(
    (level: LevelId, seed: number, removedIndices: number[] = []) => {
      const b = getLevelDef(level).bootstrap;
      const needsRefit = b === "chapter2Standalone" || b === "chapter3Standalone";
      const record: RunRecord = {
        level,
        mode: "standalone",
        seed: seed >>> 0,
        removedIndices: needsRefit ? removedIndices : [],
        actions: [],
      };
      sessionRef.current = [record];
      refreshCodeHex();
    },
    [refreshCodeHex],
  );

  const appendContinuitySession = useCallback(
    (seed: number, removedIndices: number[]) => {
      sessionRef.current = [
        ...sessionRef.current,
        {
          level: SUNKING_CH2_ID,
          mode: "continuity",
          seed: seed >>> 0,
          removedIndices,
          actions: [],
        },
      ];
      refreshCodeHex();
    },
    [refreshCodeHex],
  );

  const appendChapter3ContinuitySession = useCallback(
    (seed: number, removedIndices: number[]) => {
      sessionRef.current = [
        ...sessionRef.current,
        {
          level: SUNKING_CH3_ID,
          mode: "continuity",
          seed: seed >>> 0,
          removedIndices,
          actions: [],
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

  const level = useMemo(() => getLevelDef(state.levelId), [state.levelId]);
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
    if (level2Draft || level3Draft) return;
    setExpandedRefitCardId(null);
  }, [level2Draft, level3Draft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 800px)");
    const onChange = (event: MediaQueryListEvent) => {
      setIsSmallRefitViewport(event.matches);
    };
    setIsSmallRefitViewport(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

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
    pendingStateRef.current = next;
    dispatch(a);
  };

  const restartCurrentLevelRun = useCallback(() => {
    const next = gameReducer(state, { type: "NEW_GAME" });
    dispatch({ type: "NEW_GAME" });
    startStandaloneSession(next.levelId, next.runSeed);
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
        setLevel2Draft(null);
        setLevel2DraftInitial(null);
        setLevel3Draft(null);
        setLevel3DraftInitial(null);
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

  const openLevel2Refit = (draft: Level2StartDraft) => {
    const snapshot = cloneLevel2Draft(draft);
    setLevel2Draft(snapshot);
    setLevel2DraftInitial(cloneLevel2Draft(snapshot));
  };

  const resetLevel2Refit = () => {
    if (!level2DraftInitial) return;
    setLevel2Draft(cloneLevel2Draft(level2DraftInitial));
    setExpandedRefitCardId(null);
  };

  const toggleRefitRemoval = useCallback((cardId: string) => {
    setLevel2Draft((prev) => (prev ? toggleContinuityCardRemoval(prev, cardId) : prev));
  }, []);

  const toggleRefitRemovalLevel3 = useCallback((cardId: string) => {
    setLevel3Draft((prev) => (prev ? toggleContinuityCardRemoval(prev, cardId) : prev));
  }, []);

  const maybeToggleRemovalBySmallScreenDoubleTap = useCallback(
    (cardId: string) => {
      if (!isSmallRefitViewport) return;
      const now = Date.now();
      const lastTapAt = mobileRefitRowLastTapAt.current[cardId] ?? 0;
      mobileRefitRowLastTapAt.current[cardId] = now;
      if (now - lastTapAt <= 320) {
        mobileRefitRowLastTapAt.current[cardId] = 0;
        toggleRefitRemoval(cardId);
      }
    },
    [isSmallRefitViewport, toggleRefitRemoval],
  );

  const maybeToggleRemovalBySmallScreenDoubleTapLevel3 = useCallback(
    (cardId: string) => {
      if (!isSmallRefitViewport) return;
      const now = Date.now();
      const lastTapAt = mobileRefitRowLastTapAt.current[cardId] ?? 0;
      mobileRefitRowLastTapAt.current[cardId] = now;
      if (now - lastTapAt <= 320) {
        mobileRefitRowLastTapAt.current[cardId] = 0;
        toggleRefitRemovalLevel3(cardId);
      }
    },
    [isSmallRefitViewport, toggleRefitRemovalLevel3],
  );

  const beginConfiguredRun = (seed: number | undefined, levelId: LevelId) => {
    setPendingHydrateState(null);
    setPendingIntroLevelId(null);
    if (getLevelDef(levelId).bootstrap === "chapter2Standalone") {
      openLevel2Refit(createStandaloneLevel2Draft(seed));
      setLevelIntroOpen(false);
      setPendingNewRun(null);
      return;
    }
    if (getLevelDef(levelId).bootstrap === "chapter3Standalone") {
      const snapshot = cloneLevel3Draft(createStandaloneLevel3Draft(seed));
      setLevel3Draft(snapshot);
      setLevel3DraftInitial(cloneLevel3Draft(snapshot));
      setExpandedRefitCardId(null);
      setLevelIntroOpen(false);
      setPendingNewRun(null);
      return;
    }
    setPendingLevelTutorial(tutorialOnEntryMenu);
    const next = gameReducer(state, { type: "NEW_GAME", seed, levelId });
    dispatchSafe({ type: "NEW_GAME", seed, levelId });
    startStandaloneSession(next.levelId, next.runSeed);
    setStartMenuOpen(false);
    setLevelIntroOpen(false);
    setPendingNewRun(null);
  };

  const requestStartFromMenu = () => {
    const seed = menuSeedParsed === "empty" ? undefined : (menuSeedParsed as number);
    const def = getLevelDef(menuLevelId);
    if (levelDefHasIntro(def)) {
      setPendingNewRun({ seed, levelId: menuLevelId });
      setPendingHydrateState(null);
      setPendingIntroLevelId(menuLevelId);
      setLevelIntroOpen(true);
    } else {
      beginConfiguredRun(seed, menuLevelId);
    }
  };

  const confirmLevelIntro = () => {
    if (pendingHydrateState && pendingIntroLevelId) {
      setPendingLevelTutorial(tutorialOnEntryMenu);
      dispatchSafe({ type: "HYDRATE", state: pendingHydrateState });
      setStartMenuOpen(false);
      setLevel2Draft(null);
      setLevel2DraftInitial(null);
      setLevel3Draft(null);
      setLevel3DraftInitial(null);
      setLevelIntroOpen(false);
      setPendingHydrateState(null);
      setPendingIntroLevelId(null);
      setPendingNewRun(null);
      return;
    }
    if (!pendingNewRun) return;
    beginConfiguredRun(pendingNewRun.seed, pendingNewRun.levelId);
  };

  const resumeFromStoredSave = () => {
    setPendingLevelTutorial(false);
    setPendingHydrateState(null);
    setPendingIntroLevelId(null);
    setLevel2Draft(null);
    setLevel2DraftInitial(null);
    setLevel3Draft(null);
    setLevel3DraftInitial(null);
    const loaded = loadGame();
    if (!loaded || !isValidSave(loaded)) return;
    dispatchSafe({ type: "HYDRATE", state: normalizeLoadedSave(loaded as GameState) });
    // The local-storage save is just a state snapshot; we have no recoverable action history,
    // so the run code is intentionally cleared on resume.
    clearSession();
    setStartMenuOpen(false);
  };

  const level2Validation = useMemo(() => (level2Draft ? validateLevel2Draft(level2Draft) : null), [level2Draft]);
  const level3Validation = useMemo(() => (level3Draft ? validateLevel3Draft(level3Draft) : null), [level3Draft]);

  const confirmLevel2Refit = () => {
    if (!level2Draft) return;
    const v = validateLevel2Draft(level2Draft);
    if (!v.isValid) return;
    const nextState = buildLevel2StateFromDraft(level2Draft);
    const carryover = level2Draft.carryoverCards;
    const removedSet = new Set(level2Draft.removedCarryoverIds);
    const removedIndices: number[] = [];
    carryover.forEach((card, idx) => {
      if (removedSet.has(card.instanceId)) removedIndices.push(idx);
    });
    if (level2Draft.mode === "continuity") {
      appendContinuitySession(nextState.runSeed, removedIndices);
    } else {
      startStandaloneSession(SUNKING_CH2_ID, nextState.runSeed, removedIndices);
    }
    setLevel2Draft(null);
    setLevel2DraftInitial(null);
    setPendingNewRun(null);
    const def = getLevelDef(nextState.levelId);
    if (levelDefHasIntro(def)) {
      setPendingHydrateState(nextState);
      setPendingIntroLevelId(nextState.levelId);
      setLevelIntroOpen(true);
      return;
    }
    setPendingLevelTutorial(tutorialOnEntryMenu);
    dispatchSafe({ type: "HYDRATE", state: nextState });
    setStartMenuOpen(false);
    setLevelIntroOpen(false);
    setPendingHydrateState(null);
    setPendingIntroLevelId(null);
  };

  const openChapter2Continuity = () => {
    openLevel2Refit(createContinuityLevel2Draft(state));
  };

  const openChapter3Continuity = () => {
    const snapshot = cloneLevel3Draft(createContinuityLevel3Draft(state));
    setLevel3Draft(snapshot);
    setLevel3DraftInitial(cloneLevel3Draft(snapshot));
    setExpandedRefitCardId(null);
    setPendingNewRun(null);
  };

  const resetLevel3Refit = () => {
    if (!level3DraftInitial) return;
    setLevel3Draft(cloneLevel3Draft(level3DraftInitial));
    setExpandedRefitCardId(null);
  };

  const confirmLevel3Refit = () => {
    if (!level3Draft) return;
    const v = validateLevel3Draft(level3Draft);
    if (!v.isValid) return;
    const nextState = buildLevel3StateFromDraft(level3Draft);
    const carryover = level3Draft.carryoverCards;
    const removedSet = new Set(level3Draft.removedCarryoverIds);
    const removedIndices: number[] = [];
    carryover.forEach((card, idx) => {
      if (removedSet.has(card.instanceId)) removedIndices.push(idx);
    });
    if (level3Draft.mode === "continuity") {
      appendChapter3ContinuitySession(nextState.runSeed, removedIndices);
    } else {
      startStandaloneSession(SUNKING_CH3_ID, nextState.runSeed, removedIndices);
    }
    setLevel3Draft(null);
    setLevel3DraftInitial(null);
    setPendingNewRun(null);
    const def = getLevelDef(nextState.levelId);
    if (levelDefHasIntro(def)) {
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
  };

  const introLevelDef =
    levelIntroOpen && pendingIntroLevelId && levelDefHasIntro(getLevelDef(pendingIntroLevelId))
      ? getLevelDef(pendingIntroLevelId)
      : null;

  const levelIntro = introLevelDef ? (
    <div className={styles.levelIntroScreen} role="dialog" aria-modal="true" aria-labelledby="level-intro-title">
      <div className={styles.modal}>
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
    </div>
  ) : null;

  const renderContinuityCardRow = (card: Level2CarryoverCard) => {
    if (!level2Draft) return null;
    const tmpl = getCardTemplate(card.templateId);
    const visibleTags = displayRefitTags(level2Draft.mode, tmpl.tags);
    const visibleInflationDelta = card.inflationDelta;
    const effectiveCost = tmpl.cost + visibleInflationDelta;
    const title = cardLabelWithIcon(card.templateId, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl, effectiveCost);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const expanded = expandedRefitCardId === card.instanceId;
    const removed = level2Draft.removedCarryoverIds.includes(card.instanceId);
    const tagChips =
      visibleTags.length > 0 || (card.remainingUses != null && card.totalUses != null) ? (
        <div className={styles.badgeRow}>
          {card.remainingUses != null && card.totalUses != null ? (
            <span key={`${card.instanceId}_remaining_uses`} className={`${styles.badge} ${styles.tagButton}`}>
              {t("card.tag.remainingUses", {
                remaining: card.remainingUses,
                total: card.totalUses,
              })}
            </span>
          ) : null}
          {visibleTags.map((tag) => (
            <span key={`${card.instanceId}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={card.instanceId}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId));
          }
        }}
        onDoubleClick={() => {
          if (!isSmallRefitViewport) return;
          toggleRefitRemoval(card.instanceId);
        }}
        onTouchEnd={() => maybeToggleRemovalBySmallScreenDoubleTap(card.instanceId)}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>{compactSummary}</span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
        <div
          className={styles.retainCounterControls}
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <label className={styles.startMenuMuted} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <input
              type="checkbox"
              checked={removed}
              onChange={() => toggleRefitRemoval(card.instanceId)}
            />
            {t("menu.refit.removeToggle")}
          </label>
        </div>
      </div>
    );
  };

  const renderFixedNewCardPreviewRow = (id: (typeof LEVEL2_FIXED_NEW_IDS)[number]) => {
    if (!level2Draft) return null;
    const tmpl = getCardTemplate(id);
    const visibleTags = displayRefitTags(level2Draft.mode, tmpl.tags);
    const title = cardLabelWithIcon(id, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const rowId = `preview-${id}`;
    const expanded = expandedRefitCardId === rowId;
    const tagChips =
      visibleTags.length > 0 ? (
        <div className={styles.badgeRow}>
          {visibleTags.map((tag) => (
            <span key={`${rowId}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={id}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === rowId ? null : rowId))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === rowId ? null : rowId));
          }
        }}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>{compactSummary}</span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderLevel3RefitCardRow = (card: Level2CarryoverCard) => {
    if (!level3Draft) return null;
    const tmpl = getCardTemplate(card.templateId);
    const visibleTags = displayRefitTags("continuity", tmpl.tags);
    const visibleInflationDelta = card.inflationDelta;
    const effectiveCost = tmpl.cost + visibleInflationDelta;
    const title = cardLabelWithIcon(card.templateId, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl, effectiveCost);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const expanded = expandedRefitCardId === card.instanceId;
    const removed = level3Draft.removedCarryoverIds.includes(card.instanceId);
    const tagChips =
      visibleTags.length > 0 || (card.remainingUses != null && card.totalUses != null) ? (
        <div className={styles.badgeRow}>
          {card.remainingUses != null && card.totalUses != null ? (
            <span key={`${card.instanceId}_remaining_uses`} className={`${styles.badge} ${styles.tagButton}`}>
              {t("card.tag.remainingUses", {
                remaining: card.remainingUses,
                total: card.totalUses,
              })}
            </span>
          ) : null}
          {visibleTags.map((tag) => (
            <span key={`${card.instanceId}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={card.instanceId}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === card.instanceId ? null : card.instanceId));
          }
        }}
        onDoubleClick={() => {
          if (!isSmallRefitViewport) return;
          toggleRefitRemovalLevel3(card.instanceId);
        }}
        onTouchEnd={() => maybeToggleRemovalBySmallScreenDoubleTapLevel3(card.instanceId)}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>{compactSummary}</span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
        <div
          className={styles.retainCounterControls}
          onClick={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <label className={styles.startMenuMuted} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <input
              type="checkbox"
              checked={removed}
              onChange={() => toggleRefitRemovalLevel3(card.instanceId)}
            />
            {t("menu.refit.removeToggle")}
          </label>
        </div>
      </div>
    );
  };

  const renderLevel3FixedNewCardPreviewRow = (templateId: (typeof LEVEL3_STARTING_HAND_TEMPLATE_ORDER)[number], rowKey: string) => {
    if (!level3Draft) return null;
    const tmpl = getCardTemplate(templateId);
    const visibleTags = displayRefitTags("continuity", tmpl.tags);
    const title = cardLabelWithIcon(templateId, t(tmpl.titleKey as MessageKey));
    const quickRows = buildCardQuickFrameRows(tmpl);
    const compactSummary = quickRows.map((row) => row.value).join(" · ");
    const expanded = expandedRefitCardId === rowKey;
    const tagChips =
      visibleTags.length > 0 ? (
        <div className={styles.badgeRow}>
          {visibleTags.map((tag) => (
            <span key={`${rowKey}_${tag}`} className={`${styles.badge} ${styles.tagButton}`}>
              {t(`card.tag.${tag}` as MessageKey)}
            </span>
          ))}
        </div>
      ) : null;
    return (
      <div
        key={rowKey}
        className={[styles.retainRow, styles.refitRow, expanded && styles.refitRowExpanded].filter(Boolean).join(" ")}
        role="button"
        tabIndex={0}
        aria-expanded={expanded ? "true" : "false"}
        onClick={() => setExpandedRefitCardId((prev) => (prev === rowKey ? null : rowKey))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedRefitCardId((prev) => (prev === rowKey ? null : rowKey));
          }
        }}
      >
        <div className={styles.retainCardInfo}>
          <span className={styles.retainCardTitle}>{title}</span>
          <span className={styles.retainCardSummary}>{compactSummary}</span>
          {tagChips}
          {expanded ? (
            <div className={styles.retainCardDetails}>
              <OutcomeQuickFrame rows={quickRows} />
              <div className={styles.cardBg}>{t(tmpl.backgroundKey as MessageKey)}</div>
              <div className={styles.cardDesc}>{t(tmpl.descriptionKey as MessageKey)}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const level3RefitScreen = level3Draft ? (
    <div className={styles.startMenuScreen} role="dialog" aria-modal="true" aria-labelledby="level3-refit-title">
      <div className={styles.modal}>
        <div className={styles.startMenuHeader}>
          <h2 id="level3-refit-title" className={styles.startMenuTitle}>
            {t("menu.refit.titleChapter3")}
          </h2>
          <LanguageToggle />
        </div>
        <div className={styles.startMenuForm}>
          <p className={styles.startMenuMuted}>{t("menu.refit.subtitle")}</p>
          <p className={styles.startMenuMuted}>
            {level3Draft.mode === "continuity"
              ? t("menu.refit.mode.continuityChapter3")
              : t("menu.refit.mode.standaloneChapter3")}
          </p>
          <p className={styles.startMenuMuted}>
            {t("menu.refit.resources", {
              treasury: level3Draft.resources.treasuryStat,
              power: level3Draft.resources.power,
              legitimacy: level3Draft.resources.legitimacy,
            })}
          </p>
          <p className={styles.startMenuMuted}>{t("menu.refit.startYear", { year: level3Draft.calendarStartYear })}</p>
          <>
            <h3 className={styles.statusSectionTitle}>{t("menu.refit.adjustable")}</h3>
            <p className={styles.startMenuMuted}>
              {t("menu.refit.continuityRuleChapter3", { max: LEVEL2_CONTINUITY_MAX_REMOVALS })}
            </p>
            {isSmallRefitViewport ? (
              <p className={styles.startMenuMuted}>{t("menu.refit.mobileDoubleToggleHint")}</p>
            ) : null}
            {level3Draft.carryoverCards.map((card) => renderLevel3RefitCardRow(card))}
            <h3 className={styles.statusSectionTitle}>{t("menu.refit.newCardsChapter3")}</h3>
            {LEVEL3_STARTING_HAND_TEMPLATE_ORDER.map((id, idx) =>
              renderLevel3FixedNewCardPreviewRow(id, `preview-ch3-${idx}-${id}`),
            )}
          </>
          {level3Validation ? (
            <>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.totalCards.simple", { current: level3Validation.totalCards })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.newCardTotal", {
                  current: level3Validation.totalNewCards,
                  max: LEVEL3_STARTING_HAND_TEMPLATE_ORDER.length,
                })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.baseAdjustTotal", {
                  current: level3Validation.adjustableChanges,
                  max: level3Validation.maxAdjustableChanges,
                })}
              </p>
              {!level3Validation.isValid ? (
                <p className={styles.startMenuError}>{t("menu.refit.invalid")}</p>
              ) : null}
            </>
          ) : null}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className={styles.btn} onClick={resetLevel3Refit}>
              {t("menu.refit.reset")}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!level3Validation?.isValid}
              onClick={confirmLevel3Refit}
            >
              {t("menu.refit.startChapter3")}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                setLevel3Draft(null);
                setLevel3DraftInitial(null);
              }}
            >
              {t("menu.refit.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const level2RefitScreen = level2Draft ? (
    <div className={styles.startMenuScreen} role="dialog" aria-modal="true" aria-labelledby="level2-refit-title">
      <div className={styles.modal}>
        <div className={styles.startMenuHeader}>
          <h2 id="level2-refit-title" className={styles.startMenuTitle}>
            {t("menu.refit.title")}
          </h2>
          <LanguageToggle />
        </div>
        <div className={styles.startMenuForm}>
          <p className={styles.startMenuMuted}>{t("menu.refit.subtitle")}</p>
          <p className={styles.startMenuMuted}>
            {level2Draft.mode === "continuity"
              ? t("menu.refit.mode.continuity")
              : t("menu.refit.mode.standalone")}
          </p>
          <p className={styles.startMenuMuted}>
            {t("menu.refit.resources", {
              treasury: level2Draft.resources.treasuryStat,
              power: level2Draft.resources.power,
              legitimacy: level2Draft.resources.legitimacy,
            })}
          </p>
          <p className={styles.startMenuMuted}>
            {t("menu.refit.startYear", { year: level2Draft.calendarStartYear })}
          </p>
          <p className={styles.startMenuMuted}>
            {level2Draft.mode === "continuity" && !level2Draft.warOfDevolutionAttacked
              ? t("menu.refit.europeAlertOnLow")
              : t("menu.refit.europeAlertOn")}
          </p>
          <>
            <h3 className={styles.statusSectionTitle}>{t("menu.refit.adjustable")}</h3>
            <p className={styles.startMenuMuted}>
              {t("menu.refit.continuityRule", { max: LEVEL2_CONTINUITY_MAX_REMOVALS })}
            </p>
            {isSmallRefitViewport ? (
              <p className={styles.startMenuMuted}>{t("menu.refit.mobileDoubleToggleHint")}</p>
            ) : null}
            {level2Draft.carryoverCards.map((card) => renderContinuityCardRow(card))}
            <h3 className={styles.statusSectionTitle}>{t("menu.refit.newCards")}</h3>
            {LEVEL2_FIXED_NEW_IDS.map((id) => renderFixedNewCardPreviewRow(id))}
          </>
          {level2Validation ? (
            <>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.totalCards.simple", { current: level2Validation.totalCards })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.newCardTotal", {
                  current: level2Validation.totalNewCards,
                  max: LEVEL2_FIXED_NEW_IDS.length,
                })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.baseAdjustTotal", {
                  current: level2Validation.adjustableChanges,
                  max: level2Validation.maxAdjustableChanges,
                })}
              </p>
              {!level2Validation.isValid ? (
                <p className={styles.startMenuError}>{t("menu.refit.invalid")}</p>
              ) : null}
            </>
          ) : null}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className={styles.btn} onClick={resetLevel2Refit}>
              {t("menu.refit.reset")}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!level2Validation?.isValid}
              onClick={confirmLevel2Refit}
            >
              {t("menu.refit.start")}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                setLevel2Draft(null);
                setLevel2DraftInitial(null);
              }}
            >
              {t("menu.refit.back")}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const startMenu = (
    <div className={styles.startMenuScreen} role="dialog" aria-modal="true" aria-labelledby="start-menu-title">
      <div className={styles.modal}>
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
    </div>
  );

  if (levelIntro) {
    return levelIntro;
  }

  if (startMenuOpen) {
    return level2RefitScreen ?? level3RefitScreen ?? startMenu;
  }

  if (level2Draft) {
    return level2RefitScreen;
  }

  if (level3Draft) {
    return level3RefitScreen;
  }

  const showLevelTutorial =
    pendingLevelTutorial && state.outcome === "playing" && state.phase === "action";

  return (
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
            {level.targetsUiKey
              ? t(level.targetsUiKey as MessageKey, {
                  limit: runTurnLimit,
                  tT: level.winTargets.treasuryStat,
                  tP: level.winTargets.power,
                  tL: level.winTargets.legitimacy,
                })
              : t("ui.targets", {
                  limit: runTurnLimit,
                  tT: level.winTargets.treasuryStat,
                  tP: level.winTargets.power,
                  tL: level.winTargets.legitimacy,
                })}
          </div>
          {level.timeStepHintKey ? (
            <p className={styles.timeStepHint}>{t(level.timeStepHintKey as MessageKey)}</p>
          ) : null}
        </div>
        <LanguageToggle />
      </header>

      <p className={styles.help}>{t("help.short")}</p>

      <div className={styles.grid}>
        <section className={styles.panel} id="tutorial-resources">
          <h2>{t("ui.resources")}</h2>
          <ResourceBar resources={state.resources} />
          <h3 className={styles.statusSectionTitle}>{t("ui.statuses")}</h3>
          <StatusBar
            statuses={state.playerStatuses}
            levelId={state.levelId}
            europeAlertActive={state.europeAlert && state.outcome === "playing"}
            europeAlertPowerLoss={state.europeAlertPowerLoss}
            europeAlertProgress={state.europeAlertProgress}
            antiFrenchSentimentEmotion={antiFrenchSentimentEmotionValue(state)}
            coalitionActive={
              !!state.antiFrenchLeague &&
              state.turn <= state.antiFrenchLeague.untilTurn &&
              state.outcome === "playing"
            }
            coalitionProbabilityPct={
              state.antiFrenchLeague
                ? Math.round(state.antiFrenchLeague.drawPenaltyProbability * 100)
                : undefined
            }
            successionTrack={
              state.levelId === SUNKING_CH3_ID && state.outcome === "playing" && !state.warEnded
                ? state.successionTrack
                : undefined
            }
          />
        </section>

        {EVENT_SLOT_ORDER.some((id) => state.slots[id] != null) ||
        state.pendingInteraction?.type === "crackdownPick" ? (
          <section className={`${styles.panel} ${styles.eventsPanel}`} id="tutorial-events">
            <h2>{t("ui.events")}</h2>
            <div className={styles.eventsResizable} title={t("ui.eventsResizeHint")}>
              <EventPanel state={state} dispatch={dispatchSafe} />
            </div>
          </section>
        ) : null}
      </div>

      <section className={`${styles.panel} ${styles.handPanel}`} id="tutorial-hand">
        <h2>{t("ui.hand")}</h2>
        <Hand state={state} dispatch={dispatchSafe} />
      </section>

      <ActionLog
        entries={state.actionLog}
        showMobileTapGuide={state.outcome === "playing" && state.phase === "action"}
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
          {state.phase === "action" && state.outcome === "playing" ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!canEndYear}
              onClick={() => dispatchSafe({ type: "END_YEAR" })}
            >
              {t("ui.endTurn")}
            </button>
          ) : null}
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

      <RunCodePanel code={codeHex} onLoad={loadFromCode} />

      {state.phase === "retention" && state.outcome === "playing" ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3>{t("phase.retention")}</h3>
            <p className={styles.help}>
              {resourceLabelWithIcon("legitimacy", t("resource.legitimacy"))}:{" "}
              {retentionCapacity(state)}
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
          <div className={styles.modal}>
            <div className={styles.gameOver}>
              <h2>
                {state.outcome === "victory"
                  ? t("outcome.victory")
                  : state.outcome === "defeatLegitimacy"
                    ? t("outcome.defeatLegitimacy")
                    : state.outcome === "defeatSuccession"
                      ? t("outcome.defeatSuccession")
                      : t("outcome.defeatTime")}
              </h2>
              {(() => {
                const ending = levelEndingKeys(getLevelDef(state.levelId));
                if (!ending) return null;
                if (state.outcome === "victory") {
                  const successionTrackCapVictory =
                    state.levelId === SUNKING_CH3_ID &&
                    state.successionTrack >= 10 &&
                    ending.victorySuccessionTrackCapBodyKey != null;
                  const settlementTier = state.utrechtSettlementTier ?? state.successionOutcomeTier;
                  const chapter3TierVictoryKey =
                    state.levelId === SUNKING_CH3_ID &&
                    !successionTrackCapVictory &&
                    settlementTier &&
                    ending.victoryBodyByTierKeys?.[settlementTier]
                      ? ending.victoryBodyByTierKeys[settlementTier]
                      : null;
                  const victoryMainKey =
                    successionTrackCapVictory && ending.victorySuccessionTrackCapBodyKey
                      ? ending.victorySuccessionTrackCapBodyKey
                      : chapter3TierVictoryKey ?? ending.victoryBodyKey;
                  return (
                    <div className={styles.gameOverBody}>
                      {state.levelId === SUNKING_CH3_ID &&
                      !successionTrackCapVictory &&
                      settlementTier ? (
                        <p>{t(`outcome.utrechtVictoryEpilogue.${settlementTier}` as MessageKey)}</p>
                      ) : state.levelId === SUNKING_CH3_ID &&
                        !successionTrackCapVictory &&
                        settlementTier ? (
                        <p>{t(`outcome.successionTier.${settlementTier}` as MessageKey)}</p>
                      ) : null}
                      <p>{t(victoryMainKey as MessageKey)}</p>
                      {state.levelId === SUNKING_CH3_ID &&
                      !successionTrackCapVictory &&
                      state.successionOutcomeTier ? (
                        <p>
                          {t(
                            `outcome.successionCalendar1720Extra.${state.utrechtSettlementTier ?? state.successionOutcomeTier}` as MessageKey,
                          )}
                        </p>
                      ) : null}
                      {state.warOfDevolutionAttacked ? (
                        <p>{t(ending.victoryWarDevolutionExtraKey as MessageKey)}</p>
                      ) : null}
                    </div>
                  );
                }
                const defeatMainKey =
                  state.levelId === SUNKING_CH3_ID &&
                  state.outcome === "defeatSuccession" &&
                  ending.defeatSuccessionTrackFloorBodyKey
                    ? ending.defeatSuccessionTrackFloorBodyKey
                    : ending.defeatBodyKey;
                return (
                  <div className={styles.gameOverBody}>
                    <p>{t(defeatMainKey as MessageKey)}</p>
                  </div>
                );
              })()}
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => restartCurrentLevelRun()}>
                {t("ui.newGame")}
              </button>
              {state.outcome === "victory" && state.levelId === SUNKING_CH1_ID ? (
                <button type="button" className={styles.btn} onClick={openChapter2Continuity}>
                  {t("menu.continueChapter2")}
                </button>
              ) : null}
              {state.outcome === "victory" && state.levelId === SUNKING_CH2_ID ? (
                <button type="button" className={styles.btn} onClick={openChapter3Continuity}>
                  {t("menu.continueChapter3")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

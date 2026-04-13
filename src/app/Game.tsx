import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { ActionLog } from "../components/ActionLog";
import { EventPanel } from "../components/EventPanel";
import { Hand } from "../components/Hand";
import { LanguageToggle } from "../components/LanguageToggle";
import { LevelTutorialOverlay } from "../components/LevelTutorialOverlay";
import { ResourceBar } from "../components/ResourceBar";
import { StatusBar } from "../components/StatusBar";
import { getCardTemplate } from "../data/cards";
import {
  defaultLevelId,
  getLevelDef,
  isLevelId,
  levelDefs,
  type LevelEndingCopyKeys,
  type LevelId,
} from "../data/levels";
import { cardLabelWithIcon, resourceLabelWithIcon } from "../logic/icons";
import { normalizeGameState } from "../logic/normalizeGameState";
import { loadGame, saveGame } from "../logic/saveLoad";
import { readTutorialOnLevelEntry, writeTutorialOnLevelEntry } from "../logic/tutorialPref";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import type { GameState } from "../types/game";
import { EVENT_SLOT_ORDER } from "../types/event";
import { gameReducer, type GameAction } from "./gameReducer";
import { createInitialState } from "./initialState";
import {
  LEVEL2_ADJUSTABLE_IDS,
  LEVEL2_NEW_IDS,
  LEVEL2_REFIT_RULES,
  buildHistoricalPreset,
  buildLevel2StateFromDraft,
  buildWarPreset,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
  updateRefitCount,
  validateLevel2Refit,
  type Level2StartDraft,
} from "./level2Transition";
import styles from "./Game.module.css";

type PendingNewRun = { seed?: number; levelId: LevelId };

function levelDefHasIntro(def: (typeof levelDefs)[LevelId]): def is (typeof levelDefs)[LevelId] & {
  introTitleKey: MessageKey;
  introBodyKey: MessageKey;
} {
  return "introTitleKey" in def && "introBodyKey" in def;
}

function levelEndingKeys(def: (typeof levelDefs)[LevelId]): LevelEndingCopyKeys | undefined {
  return "ending" in def ? def.ending : undefined;
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

export function Game() {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(gameReducer, undefined, initFreshForStartMenu);
  const [retain, setRetain] = useState<Record<string, boolean>>({});
  const hadSaveOnLaunch = useMemo(() => hasValidStoredSave(), []);
  const [startMenuOpen, setStartMenuOpen] = useState(true);
  const [menuLevelId, setMenuLevelId] = useState<LevelId>(defaultLevelId);
  const [menuSeedText, setMenuSeedText] = useState("");
  const [pendingNewRun, setPendingNewRun] = useState<PendingNewRun | null>(null);
  const [levelIntroOpen, setLevelIntroOpen] = useState(false);
  const [tutorialOnEntryMenu, setTutorialOnEntryMenu] = useState(() => readTutorialOnLevelEntry());
  const [pendingLevelTutorial, setPendingLevelTutorial] = useState(false);
  const [level2Draft, setLevel2Draft] = useState<Level2StartDraft | null>(null);

  const menuSeedTrimmed = menuSeedText.trim();
  const menuSeedParsed =
    menuSeedTrimmed === "" ? ("empty" as const) : Number.isFinite(Number(menuSeedTrimmed)) ? Number(menuSeedTrimmed) : ("invalid" as const);

  useEffect(() => {
    if (startMenuOpen) return;
    saveGame(state);
  }, [state, startMenuOpen]);

  const level = useMemo(() => getLevelDef(state.levelId), [state.levelId]);

  const year = useMemo(
    () => state.calendarStartYear + state.turn - 1,
    [state.calendarStartYear, state.turn],
  );

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

  const canEndYear =
    state.outcome === "playing" &&
    state.phase === "action" &&
    !state.pendingInteraction;

  const selectedIds = Object.entries(retain)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const canConfirmRetention =
    state.phase === "retention" &&
    selectedIds.length <= state.resources.legitimacy &&
    selectedIds.every((id) => state.hand.includes(id));

  const dispatchSafe = (a: GameAction) => dispatch(a);

  const dismissLevelTutorial = useCallback(() => {
    setPendingLevelTutorial(false);
  }, []);

  const beginConfiguredRun = (seed: number | undefined, levelId: LevelId) => {
    if (levelId === "secondMandate") {
      setLevel2Draft(createStandaloneLevel2Draft(seed));
      setLevelIntroOpen(false);
      setPendingNewRun(null);
      return;
    }
    setPendingLevelTutorial(tutorialOnEntryMenu);
    dispatchSafe({ type: "NEW_GAME", seed, levelId });
    setStartMenuOpen(false);
    setLevelIntroOpen(false);
    setPendingNewRun(null);
  };

  const requestStartFromMenu = () => {
    const seed = menuSeedParsed === "empty" ? undefined : (menuSeedParsed as number);
    const def = getLevelDef(menuLevelId);
    if (levelDefHasIntro(def)) {
      setPendingNewRun({ seed, levelId: menuLevelId });
      setLevelIntroOpen(true);
    } else {
      beginConfiguredRun(seed, menuLevelId);
    }
  };

  const confirmLevelIntro = () => {
    if (!pendingNewRun) return;
    beginConfiguredRun(pendingNewRun.seed, pendingNewRun.levelId);
  };

  const resumeFromStoredSave = () => {
    setPendingLevelTutorial(false);
    setLevel2Draft(null);
    const loaded = loadGame();
    if (!loaded || !isValidSave(loaded)) return;
    dispatchSafe({ type: "HYDRATE", state: normalizeLoadedSave(loaded as GameState) });
    setStartMenuOpen(false);
  };

  const level2Validation = useMemo(
    () =>
      level2Draft ? validateLevel2Refit(level2Draft.counts, level2Draft.baseCounts) : null,
    [level2Draft],
  );

  const confirmLevel2Refit = () => {
    if (!level2Draft) return;
    const v = validateLevel2Refit(level2Draft.counts, level2Draft.baseCounts);
    if (!v.isValid) return;
    const nextState = buildLevel2StateFromDraft(level2Draft);
    setPendingLevelTutorial(tutorialOnEntryMenu);
    dispatchSafe({ type: "HYDRATE", state: nextState });
    setStartMenuOpen(false);
    setLevel2Draft(null);
    setLevelIntroOpen(false);
    setPendingNewRun(null);
  };

  const openChapter2Continuity = () => {
    setLevel2Draft(createContinuityLevel2Draft(state));
  };

  const introLevelDef =
    levelIntroOpen && pendingNewRun && levelDefHasIntro(getLevelDef(pendingNewRun.levelId))
      ? getLevelDef(pendingNewRun.levelId)
      : null;

  const levelIntro = introLevelDef ? (
    <div className={styles.levelIntroScreen} role="dialog" aria-modal="true" aria-labelledby="level-intro-title">
      <div className={styles.modal}>
        <div className={styles.levelIntroHeader}>
          <h2 id="level-intro-title" className={styles.levelIntroTitle}>
            {t(introLevelDef.introTitleKey)}
          </h2>
          <LanguageToggle />
        </div>
        <div className={styles.levelIntroBody}>{t(introLevelDef.introBodyKey)}</div>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={confirmLevelIntro}>
          {t("menu.introContinue")}
        </button>
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
            {level2Draft.europeAlert
              ? t("menu.refit.europeAlertOn")
              : t("menu.refit.europeAlertOff")}
          </p>
          <h3 className={styles.statusSectionTitle}>{t("menu.refit.adjustable")}</h3>
          {LEVEL2_ADJUSTABLE_IDS.map((id) => {
            const min = 1;
            const max = level2Draft.baseCounts[id] + LEVEL2_REFIT_RULES.maxAddedPerBaseCard;
            return (
              <div key={id} className={styles.retainRow}>
                <span>{cardLabelWithIcon(id, t(getCardTemplate(id).titleKey as MessageKey))}</span>
                <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() =>
                      setLevel2Draft((prev) =>
                        prev
                          ? { ...prev, counts: updateRefitCount(prev.counts, prev.baseCounts, id, -1) }
                          : prev,
                      )
                    }
                  >
                    -
                  </button>
                  <span>
                    {level2Draft.counts[id]} ({min}–{max})
                  </span>
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() =>
                      setLevel2Draft((prev) =>
                        prev
                          ? { ...prev, counts: updateRefitCount(prev.counts, prev.baseCounts, id, +1) }
                          : prev,
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          <h3 className={styles.statusSectionTitle}>{t("menu.refit.newCards")}</h3>
          {LEVEL2_NEW_IDS.map((id) => (
            <div key={id} className={styles.retainRow}>
              <span>{cardLabelWithIcon(id, t(getCardTemplate(id).titleKey as MessageKey))}</span>
              <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() =>
                    setLevel2Draft((prev) =>
                      prev ? { ...prev, counts: updateRefitCount(prev.counts, prev.baseCounts, id, -1) } : prev,
                    )
                  }
                >
                  -
                </button>
                <span>
                  {level2Draft.counts[id]} (0–{LEVEL2_REFIT_RULES.maxPerNewCard})
                </span>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() =>
                    setLevel2Draft((prev) =>
                      prev ? { ...prev, counts: updateRefitCount(prev.counts, prev.baseCounts, id, +1) } : prev,
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
          {level2Validation ? (
            <>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.totalCards", {
                  current: level2Validation.totalCards,
                  min: LEVEL2_REFIT_RULES.minDeckSize,
                  max: LEVEL2_REFIT_RULES.maxDeckSize,
                })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.newCardTotal", {
                  current: level2Validation.totalNewCards,
                  max: LEVEL2_REFIT_RULES.maxTotalNewCards,
                })}
              </p>
              <p className={styles.startMenuMuted}>
                {t("menu.refit.baseAdjustTotal", {
                  current: level2Validation.adjustableChanges,
                  max: LEVEL2_REFIT_RULES.maxTotalAdjustableChanges,
                })}
              </p>
              {!level2Validation.isValid ? (
                <p className={styles.startMenuError}>{t("menu.refit.invalid")}</p>
              ) : null}
            </>
          ) : null}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className={styles.btn}
              onClick={() =>
                setLevel2Draft((prev) =>
                  prev ? { ...prev, counts: buildHistoricalPreset(prev.baseCounts) } : prev,
                )
              }
            >
              {t("menu.refit.presetHistorical")}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() =>
                setLevel2Draft((prev) => (prev ? { ...prev, counts: buildWarPreset(prev.baseCounts) } : prev))
              }
            >
              {t("menu.refit.presetWar")}
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() =>
                setLevel2Draft((prev) => (prev ? { ...prev, counts: { ...prev.baseCounts } } : prev))
              }
            >
              {t("menu.refit.reset")}
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!level2Validation?.isValid}
              onClick={confirmLevel2Refit}
            >
              {t("menu.refit.start")}
            </button>
            <button type="button" className={styles.btn} onClick={() => setLevel2Draft(null)}>
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
            {(Object.keys(levelDefs) as LevelId[]).map((id) => {
              const def = getLevelDef(id);
              return (
                <option key={id} value={id}>
                  {t(def.nameKey as MessageKey)}
                </option>
              );
            })}
          </select>
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

  if (startMenuOpen) {
    return levelIntro ?? level2RefitScreen ?? startMenu;
  }

  if (level2Draft) {
    return level2RefitScreen;
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
            {year}
            <span style={{ marginLeft: "0.65rem", color: "var(--muted)", fontSize: "0.95rem" }}>
              {t("banner.turn", { turn: state.turn, limit: level.turnLimit })}
            </span>
          </div>
          <div className={styles.targets} id="tutorial-targets">
            {t("ui.targets", {
              limit: level.turnLimit,
              tT: level.winTargets.treasuryStat,
              tP: level.winTargets.power,
              tL: level.winTargets.legitimacy,
            })}
          </div>
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
            europeAlertActive={state.europeAlert && state.outcome === "playing"}
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
          <button type="button" className={styles.btn} onClick={() => dispatchSafe({ type: "NEW_GAME" })}>
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

      {state.phase === "retention" && state.outcome === "playing" ? (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3>{t("phase.retention")}</h3>
            <p className={styles.help}>
              {resourceLabelWithIcon("legitimacy", t("resource.legitimacy"))}: {state.resources.legitimacy}
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
                    : t("outcome.defeatTime")}
              </h2>
              {(() => {
                const ending = levelEndingKeys(getLevelDef(state.levelId));
                if (!ending) return null;
                if (state.outcome === "victory") {
                  return (
                    <div className={styles.gameOverBody}>
                      <p>{t(ending.victoryBodyKey as MessageKey)}</p>
                      {state.warOfDevolutionAttacked ? (
                        <p>{t(ending.victoryWarDevolutionExtraKey as MessageKey)}</p>
                      ) : null}
                    </div>
                  );
                }
                return (
                  <div className={styles.gameOverBody}>
                    <p>{t(ending.defeatBodyKey as MessageKey)}</p>
                  </div>
                );
              })()}
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => dispatchSafe({ type: "NEW_GAME" })}>
                {t("ui.newGame")}
              </button>
              {state.outcome === "victory" && state.levelId === "firstMandate" ? (
                <button type="button" className={styles.btn} onClick={openChapter2Continuity}>
                  {t("menu.continueChapter2")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useReducer, useState } from "react";
import { createInitialState } from "./initialState";
import { gameReducer, type GameAction } from "./gameReducer";
import { normalizeGameState } from "../logic/normalizeGameState";
import { loadGame, saveGame } from "../logic/saveLoad";
import type { GameState } from "../types/game";
import { getLevelDef } from "../data/levels";
import { ActionLog } from "../components/ActionLog";
import { EventPanel } from "../components/EventPanel";
import { Hand } from "../components/Hand";
import { LanguageToggle } from "../components/LanguageToggle";
import { ResourceBar } from "../components/ResourceBar";
import { StatusBar } from "../components/StatusBar";
import { getCardTemplate } from "../data/cards";
import type { MessageKey } from "../locales";
import { useI18n } from "../locales";
import styles from "./Game.module.css";

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

function initFromStorage(): GameState {
  const loaded = loadGame();
  if (loaded && isValidSave(loaded)) return normalizeLoadedSave(loaded as GameState);
  return createInitialState();
}

export function Game() {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(gameReducer, undefined, initFromStorage);
  const [retain, setRetain] = useState<Record<string, boolean>>({});

  useEffect(() => {
    saveGame(state);
  }, [state]);

  const level = useMemo(() => getLevelDef(state.levelId), [state.levelId]);

  const year = useMemo(
    () => level.calendarStartYear + state.turn - 1,
    [level.calendarStartYear, state.turn],
  );

  useEffect(() => {
    if (state.phase !== "retention") return;
    const next: Record<string, boolean> = {};
    for (const id of state.hand) next[id] = false;
    setRetain(next);
  }, [state.phase, state.hand]);

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

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>{t("app.title")}</h1>
          <p>{t("app.subtitle")}</p>
          <div className={styles.banner}>
            {year}
            <span style={{ marginLeft: "0.65rem", color: "var(--muted)", fontSize: "0.95rem" }}>
              {t("banner.turn", { turn: state.turn, limit: level.turnLimit })}
            </span>
          </div>
          <div className={styles.targets}>
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

      {state.pendingInteraction?.type === "crackdownPick" ? (
        <div className={styles.panel} style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <strong>{t("ui.selectCrackdownTarget")}</strong>
            <button type="button" className={styles.btn} onClick={() => dispatchSafe({ type: "CRACKDOWN_CANCEL" })}>
              {t("ui.cancel")}
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles.grid}>
        <section className={styles.panel}>
          <h2>{t("ui.resources")}</h2>
          <ResourceBar resources={state.resources} />
          <h3 className={styles.statusSectionTitle}>{t("ui.statuses")}</h3>
          <StatusBar statuses={state.playerStatuses} />
        </section>

        <section className={styles.panel}>
          <h2>{t("ui.events")}</h2>
          <EventPanel state={state} dispatch={dispatchSafe} />
        </section>
      </div>

      <section className={styles.panel} style={{ marginTop: "1rem" }}>
        <h2>{t("ui.hand")}</h2>
        <Hand state={state} dispatch={dispatchSafe} />
      </section>

      <ActionLog entries={state.actionLog} />

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
              {t("resource.legitimacy")}: {state.resources.legitimacy}
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
                      {t(getCardTemplate(state.cardsById[id]!.templateId).titleKey as MessageKey)}
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
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => dispatchSafe({ type: "NEW_GAME" })}>
                {t("ui.newGame")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

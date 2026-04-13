import { getLevelContent, type ScriptedCalendarEventConfig } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
import { EVENT_SLOT_ORDER, type EventInstance, type EventTemplateId, type SlotId } from "../types/event";
import type { AntiFrenchLeagueState, GameState } from "../types/game";
import { rngNext } from "./rng";

export function currentCalendarYear(state: GameState): number {
  return getLevelDef(state.levelId).calendarStartYear + state.turn - 1;
}

export function findScriptedCalendarConfig(
  levelId: GameState["levelId"],
  templateId: ScriptedCalendarEventConfig["templateId"],
): ScriptedCalendarEventConfig | undefined {
  return getLevelContent(levelId).scriptedCalendarEvents.find((r) => r.templateId === templateId);
}

/** Last turn (inclusive) on which beginYear may apply the anti-coalition draw roll after an attack on `attackTurn`. */
export function coalitionUntilTurn(
  attackTurn: number,
  cfg: ScriptedCalendarEventConfig,
  turnLimit: number,
): number {
  if (!cfg.antiCoalition) return turnLimit;
  const n = cfg.antiCoalition.activeYearsAfterAttack;
  if (n === null) return turnLimit;
  return attackTurn + n;
}

export function rollAntiFrenchLeagueDrawAdjustment(
  league: AntiFrenchLeagueState | null,
  currentTurn: number,
  rng: GameState["rng"],
): { rng: GameState["rng"]; adjustment: number } {
  if (!league || currentTurn > league.untilTurn) return { rng, adjustment: 0 };
  const [r, u] = rngNext(rng);
  if (u < league.drawPenaltyProbability) {
    return { rng: r, adjustment: league.drawPenaltyDelta };
  }
  return { rng: r, adjustment: 0 };
}

function placeScriptedEvent(state: GameState, templateId: EventTemplateId, slot: SlotId): GameState {
  const instance: EventInstance = {
    instanceId: `evt_${state.nextIds.event}`,
    templateId,
    resolved: false,
  };
  return {
    ...state,
    nextIds: { ...state.nextIds, event: state.nextIds.event + 1 },
    slots: { ...state.slots, [slot]: instance },
  };
}

/**
 * Expire unresolved scripted rows past their window; inject on the calendar start year if missing.
 * Runs after resolved slots are cleared, before random fill.
 */
export function applyScriptedCalendarPhase(state: GameState): GameState {
  const scripts = getLevelContent(state.levelId).scriptedCalendarEvents.filter((cfg) => {
    if (cfg.requiresWarOfDevolutionAttacked === undefined) return true;
    return cfg.requiresWarOfDevolutionAttacked === state.warOfDevolutionAttacked;
  });
  const year = currentCalendarYear(state);
  let s = state;

  for (const slot of EVENT_SLOT_ORDER) {
    const ev = s.slots[slot];
    if (!ev || ev.resolved) continue;
    const cfg = scripts.find((c) => c.templateId === ev.templateId);
    if (cfg && year > cfg.presenceEndYear) {
      s = { ...s, slots: { ...s.slots, [slot]: null } };
    }
  }

  for (const cfg of scripts) {
    if (year !== cfg.presenceStartYear) continue;
    const exists = EVENT_SLOT_ORDER.some((sl) => {
      const e = s.slots[sl];
      return e?.templateId === cfg.templateId;
    });
    if (exists) continue;

    let target: SlotId | null = null;
    for (const sl of EVENT_SLOT_ORDER) {
      if (!s.slots[sl]) {
        target = sl;
        break;
      }
    }
    if (!target) {
      target = cfg.overflowSlot ?? "C";
    }
    s = placeScriptedEvent(s, cfg.templateId, target);
  }

  return s;
}

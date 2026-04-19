import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { levelContentByLevelId } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
import { EMPTY_EVENT_SLOTS } from "../types/event";
import type { GameState } from "../types/game";
import {
  applyScriptedCalendarPhase,
  currentCalendarYear,
  rollAntiFrenchLeagueDrawAdjustment,
} from "./scriptedCalendar";

function stateAtTurn(turn: number): GameState {
  const s0 = createInitialState(42);
  return { ...s0, turn, phase: "action", slots: { ...EMPTY_EVENT_SLOTS } };
}

describe("scriptedCalendar", () => {
  it("currentCalendarYear matches level calendarStartYear + turn - 1", () => {
    const s = stateAtTurn(7);
    expect(currentCalendarYear(s)).toBe(getLevelDef("firstMandate").calendarStartYear + 6);
  });

  it("currentCalendarYear respects per-run calendar override", () => {
    const s = { ...stateAtTurn(3), calendarStartYear: 1701 };
    expect(currentCalendarYear(s)).toBe(1703);
  });

  it("injects scripted row on presenceStartYear from level config", () => {
    const cfg = levelContentByLevelId.firstMandate.scriptedCalendarEvents[0]!;
    const cal = getLevelDef("firstMandate").calendarStartYear;
    const turn = cfg.presenceStartYear - cal + 1;
    const s = applyScriptedCalendarPhase(stateAtTurn(turn));
    const placed = Object.values(s.slots).find((e) => e?.templateId === cfg.templateId);
    expect(placed).toBeDefined();
  });

  it("injects nine years war on fixed year 1689 and writes historical log entry", () => {
    const cfg = levelContentByLevelId.secondMandate.scriptedCalendarEvents.find(
      (it) => it.templateId === "nineYearsWar",
    );
    if (!cfg) throw new Error("missing nineYearsWar scripted config");
    const cal = getLevelDef("secondMandate").calendarStartYear;
    const turn = cfg.presenceStartYear - cal + 1;
    const s0 = createInitialState(4242, "secondMandate");
    const s1 = applyScriptedCalendarPhase({ ...s0, turn, phase: "action", slots: { ...EMPTY_EVENT_SLOTS } });
    const placed = Object.values(s1.slots).find((e) => e?.templateId === "nineYearsWar");
    expect(placed).toBeDefined();
    expect(s1.actionLog.some((entry) => entry.kind === "eventNineYearsWarBegins")).toBe(true);
  });

  it("clears unresolved scripted row after presenceEndYear", () => {
    const cfg = levelContentByLevelId.firstMandate.scriptedCalendarEvents[0]!;
    const cal = getLevelDef("firstMandate").calendarStartYear;
    const turnPast = cfg.presenceEndYear - cal + 2;
    let s = stateAtTurn(turnPast);
    s = {
      ...s,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "x", templateId: cfg.templateId, resolved: false },
      },
    };
    const out = applyScriptedCalendarPhase(s);
    expect(out.slots.A).toBeNull();
  });

  it("rollAntiFrenchLeagueDrawAdjustment respects probability 0 vs 1", () => {
    let rng: GameState["rng"] = { state: 0xdeadbeef };
    const off = rollAntiFrenchLeagueDrawAdjustment(
      { untilTurn: 99, drawPenaltyProbability: 0, drawPenaltyDelta: -1 },
      1,
      rng,
    );
    expect(off.adjustment).toBe(0);
    rng = off.rng;
    const on = rollAntiFrenchLeagueDrawAdjustment(
      { untilTurn: 99, drawPenaltyProbability: 1, drawPenaltyDelta: -1 },
      1,
      rng,
    );
    expect(on.adjustment).toBe(-1);
  });
});

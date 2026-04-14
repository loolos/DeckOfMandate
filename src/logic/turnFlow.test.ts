import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import type { CardInstance } from "../types/card";
import { EMPTY_EVENT_SLOTS } from "../types/event";
import type { GameState } from "../types/game";
import { beginYear, retentionCapacity } from "./turnFlow";

describe("beginYear + playerStatuses", () => {
  it("applies drawAttemptsDelta to attempts then decrements turnsRemaining", () => {
    const started = createInitialState(42_424);
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "funding" },
      c1: { instanceId: "c1", templateId: "funding" },
      c2: { instanceId: "c2", templateId: "funding" },
      c3: { instanceId: "c3", templateId: "funding" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 3, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["c0", "c1", "c2", "c3"],
      discard: [],
      cardsById,
      playerStatuses: [
        {
          instanceId: "st_x",
          templateId: "powerLeak",
          kind: "drawAttemptsDelta",
          delta: -1,
          turnsRemaining: 2,
        },
      ],
    };
    const s1 = beginYear(s0);
    expect(s1.hand.length).toBe(2);
    expect(s1.deck.length).toBe(2);
    expect(s1.playerStatuses).toHaveLength(1);
    expect(s1.playerStatuses[0]!.turnsRemaining).toBe(1);
  });

  it("clamps draw attempts to at least 1 when statuses would zero out power", () => {
    const started = createInitialState(99_001);
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "funding" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 1, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["c0"],
      discard: [],
      cardsById,
      playerStatuses: [
        {
          instanceId: "st_y",
          templateId: "powerLeak",
          kind: "drawAttemptsDelta",
          delta: -1,
          turnsRemaining: 1,
        },
      ],
    };
    const s1 = beginYear(s0);
    expect(s1.hand.length).toBe(1);
    expect(s1.playerStatuses).toHaveLength(0);
  });

  it("applies beginYear resource delta statuses before draw and consumes one turn", () => {
    const started = createInitialState(55_001);
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "funding" },
      c1: { instanceId: "c1", templateId: "funding" },
      c2: { instanceId: "c2", templateId: "funding" },
      c3: { instanceId: "c3", templateId: "funding" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 2, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["c0", "c1", "c2", "c3"],
      discard: [],
      cardsById,
      playerStatuses: [
        {
          instanceId: "st_draw_boost",
          templateId: "grainReliefDrawBoost",
          kind: "drawAttemptsDelta",
          delta: 1,
          turnsRemaining: 1,
        },
        {
          instanceId: "st_legit_boost",
          templateId: "grainReliefLegitimacyBoost",
          kind: "beginYearResourceDelta",
          resource: "legitimacy",
          delta: 1,
          turnsRemaining: 1,
        },
      ],
    };
    const s1 = beginYear(s0);
    expect(s1.resources.legitimacy).toBe(3);
    expect(s1.hand.length).toBe(3);
    expect(s1.playerStatuses).toHaveLength(0);
  });

  it("applies fixed Europe Alert draw reduction from chapter-start power", () => {
    const started = createInitialState(55_002);
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "funding" },
      c1: { instanceId: "c1", templateId: "funding" },
      c2: { instanceId: "c2", templateId: "funding" },
      c3: { instanceId: "c3", templateId: "funding" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 4, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["c0", "c1", "c2", "c3"],
      discard: [],
      cardsById,
      playerStatuses: [],
      europeAlert: true,
      europeAlertDrawPenalty: 2,
      antiFrenchLeague: null,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand.length).toBe(2);
  });

  it("reduces funding by 1 when fiscal burden is drawn", () => {
    const started = createInitialState(55_777);
    const cardsById: Record<string, CardInstance> = {
      b0: { instanceId: "b0", templateId: "fiscalBurden" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 1, funding: 0, power: 1, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["b0"],
      discard: [],
      cardsById,
      playerStatuses: [],
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand).toContain("b0");
    expect(s1.resources.funding).toBe(0);
  });

  it("appends antiFrenchLeagueDraw to action log when coalition hazard triggers", () => {
    const started = createInitialState(11_111);
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "funding" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 2, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["c0"],
      discard: [],
      cardsById,
      playerStatuses: [],
      antiFrenchLeague: {
        untilTurn: 99,
        drawPenaltyProbability: 1,
        drawPenaltyDelta: -1,
      },
    };
    const s1 = beginYear(s0);
    const hits = s1.actionLog.filter((e) => e.kind === "antiFrenchLeagueDraw");
    expect(hits.length).toBeGreaterThanOrEqual(1);
    const last = hits[hits.length - 1]!;
    expect(last.kind).toBe("antiFrenchLeagueDraw");
    if (last.kind === "antiFrenchLeagueDraw") {
      expect(last.probabilityPct).toBe(100);
    }
  });

  it("does not roll random events into D–J when A–C are occupied (procedural slots only)", () => {
    const started = createInitialState(123_456);
    const unresolved = { resolved: false as const };
    const s0: GameState = {
      ...started,
      turn: 6,
      phase: "action",
      outcome: "playing",
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "evt_hold_a", templateId: "budgetStrain", ...unresolved },
        B: { instanceId: "evt_hold_b", templateId: "publicUnrest", ...unresolved },
        C: { instanceId: "evt_hold_c", templateId: "tradeOpportunity", ...unresolved },
      },
    };
    const s1 = beginYear(s0);
    expect(s1.slots.D).toBeNull();
    expect(s1.slots.J).toBeNull();
  });

  it("retentionCapacity includes temporary retention boost statuses", () => {
    const started = createInitialState(202_406);
    const s0: GameState = {
      ...started,
      resources: { ...started.resources, legitimacy: 2 },
      playerStatuses: [
        {
          instanceId: "st_ret",
          templateId: "retentionBoost",
          kind: "retentionCapacityDelta",
          delta: 1,
          turnsRemaining: 2,
        },
      ],
    };
    expect(retentionCapacity(s0)).toBe(3);
  });
});

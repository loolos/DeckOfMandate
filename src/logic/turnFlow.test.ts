import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import type { CardInstance } from "../types/card";
import { EMPTY_EVENT_SLOTS } from "../types/event";
import type { GameState } from "../types/game";
import {
  beginYear,
  maybeAddEuropeAlertSupplementalEvent,
  maybeAddReligiousTensionEvent,
  retentionCapacity,
} from "./turnFlow";

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

  it("chapter 2 reshuffle applies inflation stack to inflation-tag cards", () => {
    const started = createInitialState(55_778, "secondMandate");
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "ceremony" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 1, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: [],
      discard: ["c0"],
      cardsById,
      playerStatuses: [],
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand).toContain("c0");
    expect(s1.cardInflationById.c0).toBe(1);
  });

  it("chapter 1 reshuffle below pressure threshold does not apply inflation stacks", () => {
    const started = createInitialState(55_779, "firstMandate");
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "ceremony" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 1, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: [],
      discard: ["c0"],
      cardsById,
      playerStatuses: [],
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand).toContain("c0");
    expect(s1.cardInflationById.c0).toBeUndefined();
  });

  it("chapter 1 reshuffle at pressure threshold applies inflation stacks", () => {
    const started = createInitialState(55_780, "firstMandate");
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "ceremony" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 6, funding: 0, power: 6, legitimacy: 6 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: [],
      discard: ["c0"],
      cardsById,
      playerStatuses: [],
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand).toContain("c0");
    expect(s1.cardInflationById.c0).toBe(1);
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

  it("adds a europe-alert supplemental frontier/trade event with 50% yearly gate", () => {
    const started = createInitialState(902_010, "secondMandate");
    const pickState = (() => {
      for (let st = 1; st < 2_000_000; st++) {
        const s0 = { ...started, rng: { state: st }, europeAlert: true, slots: { ...EMPTY_EVENT_SLOTS } };
        const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
        const injected = Object.values(s1.slots).find(
          (ev) => ev?.templateId === "frontierGarrisons" || ev?.templateId === "tradeDisruption",
        );
        if (injected) {
          return st;
        }
      }
      throw new Error("failed to find deterministic rng state for supplemental event");
    })();
    const s0: GameState = {
      ...started,
      rng: { state: pickState },
      europeAlert: true,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
    const injected = Object.values(s1.slots).find(
      (ev) => ev?.templateId === "frontierGarrisons" || ev?.templateId === "tradeDisruption",
    );
    expect(injected).toBeTruthy();
  });

  it("does not add frontier/trade supplemental events without europe alert", () => {
    const started = createInitialState(902_011, "secondMandate");
    const s0: GameState = {
      ...started,
      europeAlert: false,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
    expect(s1.slots.A).toBeNull();
    expect(s1.slots.B).toBeNull();
    expect(s1.slots.C).toBeNull();
  });

  it("can inject supplemental frontier/trade event outside A-C when procedural slots are full", () => {
    const started = createInitialState(902_012, "secondMandate");
    const unresolved = { resolved: false as const };
    const pickState = (() => {
      for (let st = 1; st < 2_000_000; st++) {
        const s0: GameState = {
          ...started,
          rng: { state: st },
          europeAlert: true,
          slots: {
            ...EMPTY_EVENT_SLOTS,
            A: { instanceId: "evt_hold_a", templateId: "versaillesExpenditure", ...unresolved },
            B: { instanceId: "evt_hold_b", templateId: "nobleResentment", ...unresolved },
            C: { instanceId: "evt_hold_c", templateId: "warWeariness", ...unresolved },
          },
        };
        const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
        if (s1.slots.D?.templateId === "frontierGarrisons" || s1.slots.D?.templateId === "tradeDisruption") {
          return st;
        }
      }
      throw new Error("failed to find deterministic rng state for D-slot supplemental event");
    })();
    const s0: GameState = {
      ...started,
      rng: { state: pickState },
      europeAlert: true,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "evt_hold_a", templateId: "versaillesExpenditure", ...unresolved },
        B: { instanceId: "evt_hold_b", templateId: "nobleResentment", ...unresolved },
        C: { instanceId: "evt_hold_c", templateId: "warWeariness", ...unresolved },
      },
    };
    const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
    expect(["frontierGarrisons", "tradeDisruption"]).toContain(s1.slots.D?.templateId);
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

  it("religious tolerance can inject religious tension with 30% gate", () => {
    const started = createInitialState(444_001, "secondMandate");
    const pickState = (() => {
      for (let st = 1; st < 2_000_000; st++) {
        const s0 = {
          ...started,
          rng: { state: st },
          slots: { ...EMPTY_EVENT_SLOTS },
          playerStatuses: [
            {
              instanceId: "st_rt",
              templateId: "religiousTolerance" as const,
              kind: "drawAttemptsDelta" as const,
              delta: 0,
              turnsRemaining: 99,
            },
          ],
        };
        const s1 = maybeAddReligiousTensionEvent(s0);
        if (Object.values(s1.slots).some((ev) => ev?.templateId === "religiousTension")) return st;
      }
      throw new Error("failed to find rng state for religious tension injection");
    })();
    const s0: GameState = {
      ...started,
      rng: { state: pickState },
      slots: { ...EMPTY_EVENT_SLOTS },
      playerStatuses: [
        {
          instanceId: "st_rt",
          templateId: "religiousTolerance",
          kind: "drawAttemptsDelta",
          delta: 0,
          turnsRemaining: 99,
        },
      ],
    };
    const s1 = maybeAddReligiousTensionEvent(s0);
    expect(Object.values(s1.slots).some((ev) => ev?.templateId === "religiousTension")).toBe(true);
  });

  it("religious tolerance and containment statuses do not auto-expire at beginYear", () => {
    const started = createInitialState(444_002, "secondMandate");
    const s0: GameState = {
      ...started,
      resources: { ...started.resources, power: 1 },
      hand: [],
      playerStatuses: [
        {
          instanceId: "st_rt",
          templateId: "religiousTolerance",
          kind: "drawAttemptsDelta",
          delta: 0,
          turnsRemaining: 99,
        },
        {
          instanceId: "st_hg",
          templateId: "huguenotContainment",
          kind: "drawAttemptsDelta",
          delta: 0,
          turnsRemaining: 3,
        },
      ],
    };
    const s1 = beginYear(s0);
    expect(s1.playerStatuses.find((s) => s.templateId === "religiousTolerance")?.turnsRemaining).toBe(99);
    expect(s1.playerStatuses.find((s) => s.templateId === "huguenotContainment")?.turnsRemaining).toBe(3);
  });
});

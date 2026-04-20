import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { buildLevel2StateFromDraft, createStandaloneLevel2Draft } from "../app/level2Transition";
import type { CardInstance } from "../types/card";
import { EMPTY_EVENT_SLOTS } from "../types/event";
import type { GameState } from "../types/game";
import {
  beginYear,
  desiredProceduralEventCountWhenAllEmpty,
  maybeAddEuropeAlertSupplementalEvent,
  maybeAddReligiousTensionEvent,
  retentionCapacity,
} from "./turnFlow";

describe("desiredProceduralEventCountWhenAllEmpty", () => {
  it("returns exactly one event when treasury+power+legitimacy is 5 or less", () => {
    const s0 = createInitialState(101_001, "secondMandate");
    const state: GameState = {
      ...s0,
      levelId: "secondMandate",
      turn: 3,
      resources: { ...s0.resources, treasuryStat: 1, power: 2, legitimacy: 2 },
    };
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.0)).toBe(1);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.99)).toBe(1);
  });

  it("uses 40%/55%/5% for sums in (5, 15]", () => {
    const s0 = createInitialState(101_002, "secondMandate");
    const state: GameState = {
      ...s0,
      levelId: "secondMandate",
      turn: 3,
      resources: { ...s0.resources, treasuryStat: 5, power: 4, legitimacy: 1 },
    };
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.39)).toBe(1);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.4)).toBe(2);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.94)).toBe(2);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.951)).toBe(3);
  });

  it("uses 15%/50%/30%/5% for sums in (15, 30]", () => {
    const s0 = createInitialState(101_003, "secondMandate");
    const state: GameState = {
      ...s0,
      levelId: "secondMandate",
      turn: 3,
      resources: { ...s0.resources, treasuryStat: 10, power: 8, legitimacy: 2 },
    };
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.14)).toBe(1);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.15)).toBe(2);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.64)).toBe(2);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.65)).toBe(3);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.94)).toBe(3);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.95)).toBe(4);
  });

  it("uses 40%/50%/10% for sums above 30", () => {
    const s0 = createInitialState(101_004, "secondMandate");
    const state: GameState = {
      ...s0,
      levelId: "secondMandate",
      turn: 3,
      resources: { ...s0.resources, treasuryStat: 12, power: 11, legitimacy: 8 },
    };
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.39)).toBe(2);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.4)).toBe(3);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.89)).toBe(3);
    expect(desiredProceduralEventCountWhenAllEmpty(state, 0.9)).toBe(4);
  });
});

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
    expect(s1.hand.length).toBe(1);
    expect(s1.deck.length).toBe(3);
    const drawLog = s1.actionLog.find((e) => e.kind === "drawCards");
    expect(drawLog).toBeTruthy();
    if (drawLog?.kind === "drawCards") {
      expect(drawLog.cardTemplateIds).toHaveLength(2);
      expect(drawLog.cardTemplateIds).toContain("funding");
    }
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

  it("does not apply extra draw reduction from Europe Alert during beginYear", () => {
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
      europeAlertPowerLoss: 2,
      antiFrenchLeague: null,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand.length).toBe(3);
  });

  it("Europe Alert no longer reduces treasury-to-funding income", () => {
    const started = createInitialState(55_003, "secondMandate");
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      turn: 3,
      resources: { treasuryStat: 4, funding: 0, power: 1, legitimacy: 2 },
      hand: [],
      deck: [],
      discard: [],
      cardsById: {},
      playerStatuses: [],
      europeAlert: true,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.resources.funding).toBe(4);
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
    expect(
      s1.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === "cardDraw.fiscalBurdenTriggered"),
    ).toBe(true);
  });

  it("when anti-french containment is drawn, it randomly reduces power or legitimacy by 1", () => {
    const started = createInitialState(55_779, "secondMandate");
    const cardsById: Record<string, CardInstance> = {
      a0: { instanceId: "a0", templateId: "antiFrenchContainment" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      rng: { state: 1 },
      resources: { treasuryStat: 1, funding: 0, power: 2, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["a0"],
      discard: [],
      cardsById,
      playerStatuses: [],
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand).toContain("a0");
    const powerDropped = s1.resources.power === 1 && s1.resources.legitimacy === 2;
    const legitimacyDropped = s1.resources.power === 2 && s1.resources.legitimacy === 1;
    expect(powerDropped || legitimacyDropped).toBe(true);
    expect(
      s1.actionLog.some(
        (entry) =>
          entry.kind === "info" &&
          (entry.infoKey === "cardDraw.antiFrenchContainmentPowerLoss" ||
            entry.infoKey === "cardDraw.antiFrenchContainmentLegitimacyLoss"),
      ),
    ).toBe(true);
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
      resources: { treasuryStat: 5, funding: 0, power: 5, legitimacy: 4 },
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

  it("forces first-mandate year-1 opening events to trade opportunity + administrative delay", () => {
    const s0 = createInitialState(424_242, "firstMandate");
    expect(s0.turn).toBe(1);
    expect(s0.slots.A?.templateId).toBe("tradeOpportunity");
    expect(s0.slots.B?.templateId).toBe("administrativeDelay");
  });

  it("forces standalone second-mandate year-1 opening events to versailles expenditure + tax resistance", () => {
    const draft = createStandaloneLevel2Draft(424_243);
    const s0 = buildLevel2StateFromDraft(draft);
    expect(s0.turn).toBe(1);
    expect(s0.slots.A?.templateId).toBe("versaillesExpenditure");
    expect(s0.slots.B?.templateId).toBe("taxResistance");
  });

  it("keeps standalone second-mandate year-1 opening fixed to exactly two events", () => {
    const draft = createStandaloneLevel2Draft(424_244);
    const s0 = buildLevel2StateFromDraft(draft);
    expect(s0.turn).toBe(1);
    const occupiedSlots = Object.values(s0.slots).filter((slot) => slot !== null);
    expect(occupiedSlots).toHaveLength(2);
    expect(s0.slots.C).toBeNull();
    expect(s0.slots.D).toBeNull();
    expect(s0.slots.E).toBeNull();
    expect(s0.slots.F).toBeNull();
    expect(s0.slots.G).toBeNull();
    expect(s0.slots.H).toBeNull();
    expect(s0.slots.I).toBeNull();
    expect(s0.slots.J).toBeNull();
  });

  it("does not place duplicate procedural templates within the same all-empty refill", () => {
    const started = createInitialState(9_090, "secondMandate");
    const pickState = (() => {
      for (let st = 1; st < 2_000_000; st++) {
        const s0: GameState = {
          ...started,
          turn: 8,
          rng: { state: st },
          proceduralEventSequence: [],
          slots: { ...EMPTY_EVENT_SLOTS },
        };
        const s1 = beginYear(s0);
        if (s1.slots.C) return st;
      }
      throw new Error("failed to find deterministic rng state for triple refill");
    })();
    const s0: GameState = {
      ...started,
      turn: 8,
      rng: { state: pickState },
      proceduralEventSequence: [],
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    const ids = [s1.slots.A?.templateId, s1.slots.B?.templateId, s1.slots.C?.templateId].filter(Boolean);
    expect(ids.length).toBe(3);
    expect(new Set(ids).size).toBe(3);
  });

  it("adds a europe-alert supplemental event when progress-gated roll succeeds", () => {
    const started = createInitialState(902_010, "secondMandate");
    const supplementalPool = ["frontierGarrisons", "tradeDisruption", "embargoCoalition", "mercenaryRaiders", "localWar"];
    const pickState = (() => {
      for (let st = 1; st < 2_000_000; st++) {
        const s0 = {
          ...started,
          rng: { state: st },
          europeAlert: true,
          europeAlertProgress: 5,
          slots: { ...EMPTY_EVENT_SLOTS },
        };
        const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
        const injected = Object.values(s1.slots).find((ev) => supplementalPool.includes(ev?.templateId ?? ""));
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
      europeAlertProgress: 5,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
    const injected = Object.values(s1.slots).find((ev) => supplementalPool.includes(ev?.templateId ?? ""));
    expect(injected).toBeTruthy();
  });

  it("does not add europe-alert supplemental events without europe alert", () => {
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

  it("can inject supplemental europe-alert event outside A-C when procedural slots are full", () => {
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
        if (
          ["frontierGarrisons", "tradeDisruption", "embargoCoalition", "mercenaryRaiders", "localWar"].includes(
            s1.slots.D?.templateId ?? "",
          )
        ) {
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
    expect(["frontierGarrisons", "tradeDisruption", "embargoCoalition", "mercenaryRaiders", "localWar"]).toContain(
      s1.slots.D?.templateId,
    );
  });

  it("guarantees at least one europe-alert event at progress 6+", () => {
    const started = createInitialState(902_015, "secondMandate");
    const s0: GameState = {
      ...started,
      rng: { state: 17 },
      europeAlert: true,
      europeAlertProgress: 6,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
    const injectedCount = Object.values(s1.slots).filter((ev) => !!ev).length;
    expect(injectedCount).toBeGreaterThanOrEqual(1);
  });

  it("can add two europe-alert events at progress 10", () => {
    const started = createInitialState(902_016, "secondMandate");
    const s0: GameState = {
      ...started,
      rng: { state: 12345 },
      europeAlert: true,
      europeAlertProgress: 10,
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = maybeAddEuropeAlertSupplementalEvent(s0);
    const injectedCount = Object.values(s1.slots).filter((ev) => !!ev).length;
    expect(injectedCount).toBe(2);
  });

  it("reduces begin-year funding income by 2 (min 0) while local war is unresolved", () => {
    const started = createInitialState(902_019, "secondMandate");
    const s0: GameState = {
      ...started,
      resources: { ...started.resources, funding: 0, treasuryStat: 1 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "evt_local_war", templateId: "localWar", resolved: false },
      },
    };
    const s1 = beginYear(s0);
    expect(s1.resources.funding).toBe(0);
  });

  it("adjusts europe-alert progress up at begin-year and writes a log entry when k>0 roll passes", () => {
    const started = createInitialState(902_017, "secondMandate");
    const s0: GameState = {
      ...started,
      rng: { state: 11 },
      europeAlert: true,
      europeAlertProgress: 3,
      resources: { ...started.resources, treasuryStat: 12, power: 12, legitimacy: 12 },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.europeAlertProgress).toBe(4);
    expect(
      s1.actionLog.some(
        (entry) =>
          entry.kind === "europeAlertProgressShift"
          && entry.from === 3
          && entry.to === 4
          && entry.pressureDeltaK > 0,
      ),
    ).toBe(true);
  });

  it("adjusts europe-alert progress down at begin-year and writes a log entry when k<0 roll passes", () => {
    const started = createInitialState(902_018, "secondMandate");
    const s0: GameState = {
      ...started,
      rng: { state: 11 },
      europeAlert: true,
      europeAlertProgress: 6,
      resources: { ...started.resources, treasuryStat: 1, power: 1, legitimacy: 1 },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.europeAlertProgress).toBe(5);
    expect(
      s1.actionLog.some(
        (entry) =>
          entry.kind === "europeAlertProgressShift"
          && entry.from === 6
          && entry.to === 5
          && entry.pressureDeltaK < 0,
      ),
    ).toBe(true);
  });

  it("adds anti-french sentiment status when treasury+power > 20", () => {
    const started = createInitialState(902_013, "secondMandate");
    const s0: GameState = {
      ...started,
      resources: { ...started.resources, treasuryStat: 12, power: 10 },
      slots: { ...EMPTY_EVENT_SLOTS },
      proceduralEventSequence: [],
    };
    const s1 = beginYear(s0);
    expect(s1.playerStatuses.some((st) => st.templateId === "antiFrenchSentiment")).toBe(true);
    expect(
      s1.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === "antiFrenchSentimentActivated"),
    ).toBe(true);
  });

  it("removes anti-french sentiment when treasury+power <= 20 and appends end-history log", () => {
    const started = createInitialState(902_014, "secondMandate");
    const s0: GameState = {
      ...started,
      resources: { ...started.resources, treasuryStat: 8, power: 9 },
      slots: { ...EMPTY_EVENT_SLOTS },
      playerStatuses: [
        {
          instanceId: "st_af",
          templateId: "antiFrenchSentiment",
          kind: "drawAttemptsDelta",
          delta: 0,
          turnsRemaining: 99,
        },
      ],
    };
    const s1 = beginYear(s0);
    expect(s1.playerStatuses.some((st) => st.templateId === "antiFrenchSentiment")).toBe(false);
    expect(s1.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === "antiFrenchSentimentEnded")).toBe(
      true,
    );
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

  it("religious tolerance can inject each confessional tension branch at 15%", () => {
    const started = createInitialState(444_001, "secondMandate");
    const pickStateFor = (targetTemplateId: "jansenistTension" | "arminianTension" | "huguenotTension") => {
      for (let st = 1; st < 3_000_000; st++) {
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
        if (Object.values(s1.slots).some((ev) => ev?.templateId === targetTemplateId)) return st;
      }
      throw new Error(`failed to find rng state for ${targetTemplateId} injection`);
    };
    const targets: readonly ("jansenistTension" | "arminianTension" | "huguenotTension")[] = [
      "jansenistTension",
      "arminianTension",
      "huguenotTension",
    ];
    for (const targetTemplateId of targets) {
      const s0: GameState = {
        ...started,
        rng: { state: pickStateFor(targetTemplateId) },
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
      expect(Object.values(s1.slots).some((ev) => ev?.templateId === targetTemplateId)).toBe(true);
    }
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

  it("when draw attempts exceed hand cap, remaining undrawn cards are discarded and logged", () => {
    const started = createInitialState(55_781, "firstMandate");
    const cardsById: Record<string, CardInstance> = {
      h0: { instanceId: "h0", templateId: "funding" },
      h1: { instanceId: "h1", templateId: "funding" },
      h2: { instanceId: "h2", templateId: "funding" },
      h3: { instanceId: "h3", templateId: "funding" },
      h4: { instanceId: "h4", templateId: "funding" },
      h5: { instanceId: "h5", templateId: "funding" },
      h6: { instanceId: "h6", templateId: "funding" },
      h7: { instanceId: "h7", templateId: "funding" },
      h8: { instanceId: "h8", templateId: "funding" },
      h9: { instanceId: "h9", templateId: "funding" },
      h10: { instanceId: "h10", templateId: "funding" },
      d0: { instanceId: "d0", templateId: "ceremony" },
      d1: { instanceId: "d1", templateId: "development" },
      d2: { instanceId: "d2", templateId: "reform" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 3, legitimacy: 3 },
      nextTurnDrawModifier: 0,
      hand: ["h0", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10"],
      deck: ["d0", "d1", "d2"],
      discard: [],
      cardsById,
      playerStatuses: [],
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const s1 = beginYear(s0);
    expect(s1.hand).toHaveLength(12);
    expect(s1.hand).toContain("d0");
    expect(s1.discard).toEqual(["d1"]);
    const overflowEntry = s1.actionLog.find((e) => e.kind === "drawOverflowDiscarded");
    expect(overflowEntry).toBeTruthy();
    if (overflowEntry?.kind === "drawOverflowDiscarded") {
      expect(overflowEntry.cardTemplateIds).toEqual(["development"]);
    }
  });
});

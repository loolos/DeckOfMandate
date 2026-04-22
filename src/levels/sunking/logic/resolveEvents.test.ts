import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { EMPTY_EVENT_SLOTS } from "../../types/event";
import { resolveEndOfYearPenalties } from "../../../logic/resolveEvents";

describe("resolveEndOfYearPenalties", () => {
  it("clears instant harmful slots after strike so next year can roll fresh", () => {
    const base = createInitialState(777);
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e1", templateId: "budgetStrain" as const, resolved: false },
      },
    };
    const treasuryBefore = s0.resources.treasuryStat;
    const n0 = s0.actionLog.length;
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.slots.A).toBeNull();
    expect(s1.resources.treasuryStat).toBe(treasuryBefore - 1);
    expect(s1.actionLog.length).toBe(n0 + 1);
    expect(s1.actionLog[s1.actionLog.length - 1]!.kind).toBe("eventYearEndPenalty");
  });

  it("keeps continued major crisis on the slot after strike", () => {
    const base = createInitialState(888);
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e1", templateId: "majorCrisis" as const, resolved: false },
      },
    };
    const legBefore = s0.resources.legitimacy;
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.slots.A).toEqual(s0.slots.A);
    expect(s1.resources.legitimacy).toBe(legBefore - 1);
  });

  it("political gridlock unresolved adds timed draw penalty status", () => {
    const base = createInitialState(1122);
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e1", templateId: "politicalGridlock" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.slots.A).toBeNull();
    expect(s1.playerStatuses).toHaveLength(1);
    expect(s1.playerStatuses[0]!.templateId).toBe("powerLeak");
    expect(s1.playerStatuses[0]!.turnsRemaining).toBe(3);
  });

  it("keeps power vacuum and sets pending major crisis", () => {
    const base = createInitialState(999);
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e1", templateId: "powerVacuum" as const, resolved: false },
      },
    };
    const n0 = s0.actionLog.length;
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.slots.A).toEqual(s0.slots.A);
    expect(s1.pendingMajorCrisis.A).toBe(true);
    expect(s1.actionLog.length).toBe(n0 + 1);
    expect(s1.actionLog[s1.actionLog.length - 1]!.kind).toBe("eventPowerVacuumScheduled");
  });

  it("expansion remembered unresolved adds three fiscal burden cards to deck", () => {
    const base = createInitialState(4_242, "secondMandate");
    const beforeCardCount = Object.keys(base.cardsById).length;
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_expansion", templateId: "expansionRemembered" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    const burdenIds = Object.values(s1.cardsById)
      .filter((c) => c.templateId === "fiscalBurden")
      .map((c) => c.instanceId);
    expect(Object.keys(s1.cardsById).length).toBe(beforeCardCount + 3);
    expect(burdenIds.length).toBe(3);
    expect(s1.deck).toEqual(expect.arrayContaining(burdenIds));
  });

  it("clears unresolved opportunity events at year end by default", () => {
    const base = createInitialState(5_001);
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_trade", templateId: "tradeOpportunity" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.slots.A).toBeNull();
  });

  it("keeps unresolved continued opportunity events on the slot", () => {
    const base = createInitialState(5_002, "secondMandate");
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_local_war", templateId: "localWar" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.slots.A).toEqual(s0.slots.A);
  });

  it("keeps unresolved ryswick peace and applies legitimacy -1 each year", () => {
    const base = createInitialState(5_003, "secondMandate");
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_ryswick", templateId: "ryswickPeace" as const, resolved: false },
      },
    };
    const legBefore = s0.resources.legitimacy;
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.slots.A).toEqual(s0.slots.A);
    expect(s1.resources.legitimacy).toBe(legBefore - 1);
  });

  it("nine years war unresolved applies legitimacy -1 and adds one fiscal burden", () => {
    const base = createInitialState(5_031, "secondMandate");
    const beforeCardCount = Object.keys(base.cardsById).length;
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_nine", templateId: "nineYearsWar" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    const burdenCount = Object.values(s1.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    expect(s1.resources.legitimacy).toBe(s0.resources.legitimacy - 1);
    expect(Object.keys(s1.cardsById).length).toBe(beforeCardCount + 1);
    expect(burdenCount).toBe(1);
    expect(s1.slots.A).toEqual(s0.slots.A);
  });

  it("nine years war still adds one fiscal burden even if handled this turn", () => {
    const base = createInitialState(5_032, "secondMandate");
    const beforeCardCount = Object.keys(base.cardsById).length;
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_nine", templateId: "nineYearsWar" as const, resolved: true, remainingTurns: 1 },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.resources.legitimacy).toBe(s0.resources.legitimacy);
    expect(Object.keys(s1.cardsById).length).toBe(beforeCardCount + 1);
  });

  it("league of augsburg unresolved applies power/treasury penalty without consuming remaining solves", () => {
    const base = createInitialState(5_004, "secondMandate");
    const s0 = {
      ...base,
      resources: { ...base.resources, funding: 6, power: 5, treasuryStat: 4 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: {
          instanceId: "e_augsburg",
          templateId: "leagueOfAugsburg" as const,
          resolved: false,
          remainingTurns: 3,
        },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.resources.funding).toBe(6);
    expect(s1.resources.power).toBe(4);
    expect(s1.resources.treasuryStat).toBe(3);
    expect(s1.slots.A?.templateId).toBe("leagueOfAugsburg");
    expect(s1.slots.A?.remainingTurns).toBe(3);
  });

  it("third mandate unresolved utrecht treaty decrements countdown by one each year", () => {
    const base = createInitialState(5_100, "thirdMandate");
    const s0 = {
      ...base,
      utrechtTreatyCountdown: 6,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_utrecht", templateId: "utrechtTreaty" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.utrechtTreatyCountdown).toBe(5);
    expect(s1.warEnded).toBe(false);
    expect(s1.slots.A?.templateId).toBe("utrechtTreaty");
  });

  it("third mandate unresolved utrecht treaty auto-ends war when countdown reaches zero", () => {
    const base = createInitialState(5_101, "thirdMandate");
    const s0 = {
      ...base,
      utrechtTreatyCountdown: 1,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_utrecht", templateId: "utrechtTreaty" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.utrechtTreatyCountdown).toBeNull();
    expect(s1.warEnded).toBe(true);
    expect(s1.slots.A).toBeNull();
    expect(s1.opponentHabsburgUnlocked).toBe(false);
    expect(s1.utrechtSettlementTier).toBe("compromise");
    expect(s1.opponentHand.length).toBe(0);
    expect(s1.opponentDeck.length).toBe(0);
    expect(s1.actionLog.some((e) => e.kind === "utrechtPeaceSettlement" && e.tier === "compromise")).toBe(true);
  });

  it("third mandate utrecht countdown zero also clears opponent row and sets tier from track", () => {
    const base = createInitialState(5_102, "thirdMandate");
    const s0 = {
      ...base,
      successionTrack: 6,
      utrechtTreatyCountdown: 1,
      opponentHabsburgUnlocked: true,
      opponentHand: ["c1"],
      opponentDeck: ["c2"],
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_utrecht", templateId: "utrechtTreaty" as const, resolved: false },
        B: {
          instanceId: "e_opp",
          templateId: "opponentHabsburg" as const,
          resolved: true,
        },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.warEnded).toBe(true);
    expect(s1.slots.A).toBeNull();
    expect(s1.slots.B).toBeNull();
    expect(s1.utrechtSettlementTier).toBe("bourbon");
  });

  it("third mandate unresolved louis xiv legacy applies regency-custody fallback at year end", () => {
    const base = createInitialState(5_103, "thirdMandate");
    const beforeCardCount = Object.keys(base.cardsById).length;
    const s0 = {
      ...base,
      resources: { ...base.resources, power: 8, legitimacy: 9 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_legacy", templateId: "louisXivLegacy1715" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    const burdenCount = Object.values(s1.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    expect(s1.resources.power).toBe(7);
    expect(s1.resources.legitimacy).toBe(8);
    expect(Object.keys(s1.cardsById).length).toBe(beforeCardCount + 1);
    expect(burdenCount).toBe(1);
    expect(s1.slots.A).toBeNull();
  });

  it("nine years war still adds fiscal burden at year end when present", () => {
    const base = createInitialState(5_005, "secondMandate");
    const beforeCards = Object.keys(base.cardsById).length;
    const s0 = {
      ...base,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_nine", templateId: "nineYearsWar" as const, resolved: false },
      },
    };
    const s1 = resolveEndOfYearPenalties(s0);
    expect(s1.resources.legitimacy).toBe(base.resources.legitimacy - 1);
    expect(Object.keys(s1.cardsById).length).toBe(beforeCards + 1);
    expect(s1.actionLog.some((entry) => entry.kind === "eventNineYearsWarFiscalBurden")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { EMPTY_EVENT_SLOTS } from "../types/event";
import { resolveEndOfYearPenalties } from "./resolveEvents";

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
});

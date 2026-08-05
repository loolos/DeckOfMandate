/**
 * The chapter-3 encirclement ladder: core resources above 45 / 60 / 75 / 90 are worth
 * +1 / +2 / +3 / +4 Habsburg opponent strength while the rival row is on the board, and the
 * rungs above the first also give the rival +1 / +2 / +3 cards at each begin-year draw.
 */
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { EMPTY_EVENT_SLOTS } from "../../types/event";
import type { GameState } from "../../../types/game";
import { greatPowerEncirclementDrawBonus, greatPowerEncirclementTier } from "./greatPowerEncirclement";
import { syncGreatPowerEncirclementStatusHook } from "./turnFlowHooks";

const BASE_STRENGTH = 3;

/** Chapter-3 state with the rival row present and the given core-resource split. */
function withRival(treasuryStat: number, power: number, legitimacy: number): GameState {
  const base = createInitialState(555_001, "thirdMandate");
  return {
    ...base,
    resources: { ...base.resources, treasuryStat, power, legitimacy },
    opponentStrength: BASE_STRENGTH,
    opponentHabsburgUnlocked: true,
    slots: {
      ...EMPTY_EVENT_SLOTS,
      D: { instanceId: "evt_opp_habsburg", templateId: "opponentHabsburg", resolved: true },
    },
    playerStatuses: [],
    greatPowerEncirclementStrengthApplied: 0,
  };
}

/** Split a target sum across the three core resources. */
function atSum(sum: number): GameState {
  const each = Math.floor(sum / 3);
  return withRival(each, each, sum - 2 * each);
}

describe("greatPowerEncirclementTier", () => {
  it.each([
    [0, 0],
    [45, 0],
    [46, 1],
    [60, 1],
    [61, 2],
    [75, 2],
    [76, 3],
    [90, 3],
    [91, 4],
    [200, 4],
  ])("sum %i is worth +%i opponent strength", (sum, tier) => {
    expect(greatPowerEncirclementTier(sum)).toBe(tier);
  });
});

describe("syncGreatPowerEncirclementStatusHook", () => {
  it.each([
    [45, 0],
    [46, 1],
    [61, 2],
    [76, 3],
    [91, 4],
  ])("a fresh run at sum %i lands on +%i", (sum, expectedBump) => {
    const next = syncGreatPowerEncirclementStatusHook(atSum(sum));
    expect(next.opponentStrength).toBe(BASE_STRENGTH + expectedBump);
    expect(next.greatPowerEncirclementStrengthApplied).toBe(expectedBump);
    expect(next.playerStatuses.some((p) => p.templateId === "greatPowerEncirclement")).toBe(
      expectedBump > 0,
    );
  });

  it("climbs one tier at a time without ever double-charging a tier", () => {
    let s = atSum(46);
    s = syncGreatPowerEncirclementStatusHook(s);
    expect(s.opponentStrength).toBe(BASE_STRENGTH + 1);

    // Same tier again: no further bump.
    s = syncGreatPowerEncirclementStatusHook(s);
    expect(s.opponentStrength).toBe(BASE_STRENGTH + 1);

    for (const [sum, bump] of [
      [61, 2],
      [76, 3],
      [91, 4],
    ] as const) {
      const raised = atSum(sum);
      s = syncGreatPowerEncirclementStatusHook({
        ...s,
        resources: raised.resources,
      });
      expect(s.opponentStrength).toBe(BASE_STRENGTH + bump);
      expect(s.greatPowerEncirclementStrengthApplied).toBe(bump);
    }

    // Top of the ladder holds.
    s = syncGreatPowerEncirclementStatusHook(s);
    expect(s.opponentStrength).toBe(BASE_STRENGTH + 4);
  });

  it("does not give strength back when the player spends below a threshold", () => {
    let s = syncGreatPowerEncirclementStatusHook(atSum(91));
    expect(s.opponentStrength).toBe(BASE_STRENGTH + 4);

    const spentDown = atSum(46);
    s = syncGreatPowerEncirclementStatusHook({ ...s, resources: spentDown.resources });
    expect(s.opponentStrength).toBe(BASE_STRENGTH + 4);
    expect(s.greatPowerEncirclementStrengthApplied).toBe(4);
  });

  it("clears the status and the ladder when the rival row leaves the board", () => {
    const held = syncGreatPowerEncirclementStatusHook(atSum(76));
    expect(held.greatPowerEncirclementStrengthApplied).toBe(3);

    const afterUtrecht = syncGreatPowerEncirclementStatusHook({
      ...held,
      slots: { ...EMPTY_EVENT_SLOTS },
    });
    expect(afterUtrecht.playerStatuses.some((p) => p.templateId === "greatPowerEncirclement")).toBe(false);
    expect(afterUtrecht.greatPowerEncirclementStrengthApplied).toBe(0);
  });

  it("stays out of chapters that have no Habsburg rival", () => {
    const chapter2: GameState = { ...atSum(91), levelId: "secondMandate" };
    const next = syncGreatPowerEncirclementStatusHook(chapter2);
    expect(next.opponentStrength).toBe(BASE_STRENGTH);
    expect(next.playerStatuses).toHaveLength(0);
  });
});

describe("greatPowerEncirclementDrawBonus", () => {
  it.each([
    [45, 0],
    [46, 0],
    [60, 0],
    [61, 1],
    [75, 1],
    [76, 2],
    [90, 2],
    [91, 3],
    [200, 3],
  ])("sum %i is worth +%i Habsburg draws", (sum, bonus) => {
    const held = syncGreatPowerEncirclementStatusHook(atSum(sum));
    expect(greatPowerEncirclementDrawBonus(held)).toBe(bonus);
  });

  it("is zero without the status, however high the core-resource sum", () => {
    expect(greatPowerEncirclementDrawBonus(atSum(200))).toBe(0);
  });

  it("does not give draws back when the player spends below a threshold", () => {
    const held = syncGreatPowerEncirclementStatusHook(atSum(91));
    expect(greatPowerEncirclementDrawBonus(held)).toBe(3);

    const spentDown: GameState = { ...held, resources: atSum(46).resources };
    expect(greatPowerEncirclementDrawBonus(spentDown)).toBe(3);
  });

  it("counts a rung reached during the player's turn before the next status sync", () => {
    const held = syncGreatPowerEncirclementStatusHook(atSum(46));
    expect(greatPowerEncirclementDrawBonus(held)).toBe(0);

    // Resources climb after the event phase already synced; the draw phase runs first next year.
    const grown: GameState = { ...held, resources: atSum(76).resources };
    expect(grown.greatPowerEncirclementStrengthApplied).toBe(1);
    expect(greatPowerEncirclementDrawBonus(grown)).toBe(2);
  });

  it("stops once the rival row leaves the board at Utrecht", () => {
    const held = syncGreatPowerEncirclementStatusHook(atSum(91));
    const afterUtrecht = syncGreatPowerEncirclementStatusHook({ ...held, slots: { ...EMPTY_EVENT_SLOTS } });
    expect(greatPowerEncirclementDrawBonus(afterUtrecht)).toBe(0);
  });
});

/**
 * End-to-end coverage for delayed effects — event penalties, card effects and opponent
 * cards that only bite on the *following* year. Template-shape assertions live in
 * `secondMandateBalance.test.ts`; these tests run the real year pipeline
 * (`resolveEndOfYearPenalties` -> `beginYear`) so a delayed effect that is granted but
 * never consumed — the `courtScandal` / `royalBan` bug — fails here.
 */
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { EMPTY_EVENT_SLOTS, type EventTemplateId } from "../../types/event";
import type { GameState } from "../../../types/game";
import { isCardPlayableInActionPhase } from "./cardPlayability";
import { resolveEndOfYearPenalties } from "./resolveEvents";
import { beginYear } from "./turnFlow";

/** Roomy deck + high power so draw deltas are visible instead of hitting the `min 1` floor. */
function baseState(): GameState {
  const base = createInitialState(4_242, "secondMandate");
  return {
    ...base,
    turn: 3,
    resources: { ...base.resources, power: 8, legitimacy: 8, treasuryStat: 5 },
    hand: [],
    deck: Object.keys(base.cardsById),
    discard: [],
    slots: { ...EMPTY_EVENT_SLOTS },
  };
}

function withUnresolved(state: GameState, templateId: EventTemplateId): GameState {
  return {
    ...state,
    slots: { ...EMPTY_EVENT_SLOTS, A: { instanceId: "e_delayed", templateId, resolved: false } },
  };
}

/** One full year boundary, with a fresh deck so draw counts never hit an empty deck. */
function endYearThenBeginNext(state: GameState): GameState {
  const afterStrike = resolveEndOfYearPenalties(state);
  return beginYear({
    ...afterStrike,
    turn: afterStrike.turn + 1,
    hand: [],
    deck: Object.keys(afterStrike.cardsById),
    discard: [],
  });
}

/** Same, but clears the board first so only the penalty already in flight is measured. */
function quietYear(state: GameState): GameState {
  return endYearThenBeginNext({ ...state, slots: { ...EMPTY_EVENT_SLOTS } });
}

describe("delayed unresolved-event penalties", () => {
  const control = quietYear(baseState()).hand.length;

  it("draws the control hand size with an empty board", () => {
    expect(control).toBeGreaterThan(2);
  });

  it.each([
    ["administrativeDelay", -1],
    ["majorCrisis", -1],
    ["revocationNantes", -2],
    ["frontierGarrisons", -1],
    ["tradeDisruption", -2],
    ["embargoCoalition", -1],
    ["provincialNoncompliance", -2],
    ["politicalGridlock", -1],
    ["nobleResentment", -1],
    ["warWeariness", -1],
  ] as const)("%s costs %i draw attempts the year after it is ignored", (templateId, delta) => {
    const start = withUnresolved(baseState(), templateId);
    // The penalty lands as a visible status at year end...
    expect(resolveEndOfYearPenalties(start).playerStatuses.some((p) => p.kind === "drawAttemptsDelta")).toBe(true);
    // ...and that status is what the next year's draw actually consumes.
    expect(endYearThenBeginNext(start).hand.length).toBe(control + delta);
  });

  it("provincialNoncompliance runs -2 / -1 / -1 over three years, then stops", () => {
    let s = endYearThenBeginNext(withUnresolved(baseState(), "provincialNoncompliance"));
    const drawn: number[] = [s.hand.length - control];
    for (let year = 0; year < 3; year++) {
      s = quietYear(s);
      drawn.push(s.hand.length - control);
    }
    expect(drawn).toEqual([-2, -1, -1, 0]);
  });

  it("politicalGridlock keeps power leak running for three years", () => {
    let s = endYearThenBeginNext(withUnresolved(baseState(), "politicalGridlock"));
    const drawn: number[] = [s.hand.length - control];
    for (let year = 0; year < 3; year++) {
      s = quietYear(s);
      drawn.push(s.hand.length - control);
    }
    expect(drawn).toEqual([-1, -1, -1, 0]);
  });

  it("courtScandal blocks royal cards through the whole next action phase", () => {
    const royalCardId = "tmp_royal_reform";
    const start = baseState();
    const withRoyalCard: GameState = {
      ...start,
      cardsById: {
        ...start.cardsById,
        [royalCardId]: { instanceId: royalCardId, templateId: "reform" as const },
      },
    };
    const next = endYearThenBeginNext(withUnresolved(withRoyalCard, "courtScandal"));

    expect(next.phase).toBe("action");
    const ban = next.playerStatuses.find((p) => p.templateId === "royalBan");
    expect(ban?.turnsRemaining).toBe(1);
    expect(isCardPlayableInActionPhase(next, royalCardId)).toBe(false);

    // ...and it is gone by the action phase of the year after that.
    const later = quietYear(next);
    expect(later.playerStatuses.some((p) => p.templateId === "royalBan")).toBe(false);
    expect(isCardPlayableInActionPhase(later, royalCardId)).toBe(true);
  });

  it("localWar left unresolved cuts next year's funding income by 2", () => {
    const start = baseState();
    const ignored = endYearThenBeginNext(withUnresolved(start, "localWar"));
    const control2 = quietYear(start);
    expect(ignored.resources.funding).toBe(control2.resources.funding - 2);
  });

  it("powerVacuum left unresolved escalates the slot next event phase", () => {
    const firstMandateBase: GameState = { ...baseState(), levelId: "firstMandate" };
    const afterStrike = resolveEndOfYearPenalties(withUnresolved(firstMandateBase, "powerVacuum"));
    expect(afterStrike.pendingMajorCrisis.A).toBe(true);
    const next = beginYear({ ...afterStrike, turn: afterStrike.turn + 1, hand: [] });
    expect(next.slots.A?.templateId).toBe("majorCrisis");
  });
});

describe("delayed card and opponent effects", () => {
  const control = quietYear(baseState()).hand.length;

  it("usurpationMobilization from usurpationEdict adds a draw next year", () => {
    const start = baseState();
    const withStatus: GameState = {
      ...start,
      playerStatuses: [
        {
          instanceId: "st_mobilization",
          templateId: "usurpationMobilization",
          kind: "drawAttemptsDelta",
          delta: 1,
          turnsRemaining: 1,
        },
      ],
    };
    const next = quietYear(withStatus);
    expect(next.hand.length).toBe(control + 1);
    // One turn only.
    expect(next.playerStatuses.some((p) => p.templateId === "usurpationMobilization")).toBe(false);
  });

  it("supplyLineSqueeze stacks cut next year's funding income, flooring at 0", () => {
    const start: GameState = { ...baseState(), resources: { ...baseState().resources, funding: 0, treasuryStat: 3 } };
    const squeeze = (instanceId: string) =>
      ({
        instanceId,
        templateId: "supplyLineSqueeze" as const,
        kind: "beginYearFundingIncomeDelta" as const,
        delta: -1,
        turnsRemaining: 1,
      });

    expect(quietYear(start).resources.funding).toBe(3);
    expect(quietYear({ ...start, playerStatuses: [squeeze("st_a"), squeeze("st_b")] }).resources.funding).toBe(1);
    // Income never goes negative and never eats funding the player already holds.
    const heavy = {
      ...start,
      resources: { ...start.resources, funding: 2, treasuryStat: 1 },
      playerStatuses: [squeeze("st_a"), squeeze("st_b"), squeeze("st_c")],
    };
    expect(quietYear(heavy).resources.funding).toBe(2);
  });
});

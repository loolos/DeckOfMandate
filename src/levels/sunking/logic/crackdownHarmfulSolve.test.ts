import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import type { GameState } from "../../../types/game";
import { stateAfterHarmfulEventCrackdown } from "./crackdownHarmfulSolve";

function slotState(
  templateId: "frontierGarrisons" | "embargoCoalition" | "versaillesExpenditure",
  europeAlertProgress: number,
): GameState {
  const base = createInitialState(77_701, "secondMandate");
  return {
    ...base,
    europeAlert: true,
    europeAlertProgress,
    slots: {
      ...base.slots,
      A: {
        instanceId: "ev_crack_test",
        templateId,
        resolved: false,
      },
    },
  };
}

describe("stateAfterHarmfulEventCrackdown", () => {
  it("applies modEuropeAlertProgress when resolving frontier garrisons via intervention", () => {
    const before = slotState("frontierGarrisons", 6);
    const after = stateAfterHarmfulEventCrackdown(before, "A", "frontierGarrisons", 1);
    expect(after.europeAlertProgress).toBe(5);
    expect(after.slots.A?.resolved).toBe(true);
  });

  it("applies modEuropeAlertProgress when resolving embargo coalition via intervention", () => {
    const before = slotState("embargoCoalition", 4);
    const after = stateAfterHarmfulEventCrackdown(before, "A", "embargoCoalition", 1);
    expect(after.europeAlertProgress).toBe(3);
    expect(after.slots.A?.resolved).toBe(true);
  });

  it("does not change europe alert progress for events without onFundSolveEffects", () => {
    const before = slotState("versaillesExpenditure", 5);
    const after = stateAfterHarmfulEventCrackdown(before, "A", "versaillesExpenditure", 1);
    expect(after.europeAlertProgress).toBe(5);
    expect(after.slots.A?.resolved).toBe(true);
  });
});

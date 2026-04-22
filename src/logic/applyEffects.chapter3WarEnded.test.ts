import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { applyEffects, enforceSuccessionImmediateOutcome } from "./applyEffects";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

describe("chapter 3 after Utrecht (warEnded)", () => {
  it("ignores modSuccessionTrack while keeping other effects", () => {
    const base = createInitialState(52_001, THIRD_MANDATE_LEVEL_ID);
    const s = { ...base, successionTrack: 2, warEnded: true, resources: { ...base.resources, funding: 0 } };
    const after = applyEffects(s, [
      { kind: "modSuccessionTrack", delta: 5 },
      { kind: "gainFunding", amount: 3 },
    ]);
    expect(after.successionTrack).toBe(2);
    expect(after.resources.funding).toBe(3);
  });

  it("does not apply succession track instant defeat when frozen at -10", () => {
    const base = createInitialState(52_002, THIRD_MANDATE_LEVEL_ID);
    const s = {
      ...base,
      successionTrack: -10,
      warEnded: true,
      resources: { ...base.resources, power: 5, legitimacy: 5 },
    };
    const after = enforceSuccessionImmediateOutcome(s);
    expect(after.outcome).toBe("playing");
    expect(after.phase).toBe(base.phase);
  });
});

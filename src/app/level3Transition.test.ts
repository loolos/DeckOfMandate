import { describe, expect, it } from "vitest";
import { createInitialState } from "./initialState";
import { SUNKING_CH3_ID, buildLevel3StateFromChapter2 } from "./level3Transition";

describe("level3Transition / thirdMandate Nantes carryover", () => {
  it("standalone third mandate defaults to crackdown (Jansenist reservation cards)", () => {
    const st = createInitialState(12_345, SUNKING_CH3_ID);
    expect(st.nantesPolicyCarryover).toBe("crackdown");
    expect(st.playerStatuses.some((s) => s.templateId === "huguenotContainment")).toBe(false);
    expect(st.playerStatuses.some((s) => s.templateId === "religiousTolerance")).toBe(false);
    const jr = Object.values(st.cardsById).filter((c) => c.templateId === "jansenistReservation").length;
    expect(jr).toBe(4);
  });

  it("standalone third mandate can start on tolerance branch (religious tension cards)", () => {
    const st = createInitialState(12_346, SUNKING_CH3_ID, { nantesPolicyCarryover: "tolerance" });
    expect(st.nantesPolicyCarryover).toBe("tolerance");
    const rt = Object.values(st.cardsById).filter((c) => c.templateId === "religiousTensionCard").length;
    expect(rt).toBe(4);
    expect(st.resources.legitimacy).toBe(10);
  });

  it("continuity from chapter 2 uses recorded nantes policy", () => {
    const ch2Like = {
      ...createInitialState(99, "secondMandate"),
      nantesPolicyCarryover: "tolerance" as const,
    };
    const st = buildLevel3StateFromChapter2(ch2Like, 100);
    expect(st.nantesPolicyCarryover).toBe("tolerance");
    expect(Object.values(st.cardsById).filter((c) => c.templateId === "religiousTensionCard").length).toBe(4);
  });

  it("continuity defaults to crackdown when chapter 2 never resolved Nantes", () => {
    const ch2Like = {
      ...createInitialState(101, "secondMandate"),
      nantesPolicyCarryover: null,
    };
    const st = buildLevel3StateFromChapter2(ch2Like, 102);
    expect(st.nantesPolicyCarryover).toBe("crackdown");
    expect(Object.values(st.cardsById).filter((c) => c.templateId === "jansenistReservation").length).toBe(4);
  });
});

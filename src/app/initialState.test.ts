import { describe, expect, it } from "vitest";
import { getLevelDef } from "../data/levels";
import { createInitialState } from "./initialState";

describe("createInitialState", () => {
  it("uses level def calendar and stable resources; beginYear adds treasury-based funding income", () => {
    const st = createInitialState(10_001, "firstMandate");
    const def = getLevelDef("firstMandate");
    expect(st.levelId).toBe("firstMandate");
    expect(st.calendarStartYear).toBe(def.calendarStartYear);
    expect(st.resources.treasuryStat).toBe(def.startingResources.treasuryStat);
    expect(st.resources.power).toBe(def.startingResources.power);
    expect(st.resources.legitimacy).toBe(def.startingResources.legitimacy);
    const income = Math.max(0, def.startingResources.treasuryStat);
    expect(st.resources.funding).toBe(def.startingResources.funding + income);
  });

  it("applies startingResourcesOverride then beginYear income on treasury", () => {
    const st = createInitialState(10_002, "firstMandate", {
      startingResourcesOverride: { funding: 9 },
    });
    const def = getLevelDef("firstMandate");
    const income = Math.max(0, def.startingResources.treasuryStat);
    expect(st.resources.funding).toBe(9 + income);
    expect(st.resources.power).toBe(def.startingResources.power);
  });

  it("defaults warOfDevolutionAttacked to false outside chapter-2 hook", () => {
    const st = createInitialState(10_003, "firstMandate");
    expect(st.warOfDevolutionAttacked).toBe(false);
  });

  it("registers chapter-2 default war branch via campaign hooks", () => {
    const st = createInitialState(10_004, "secondMandate");
    expect(st.warOfDevolutionAttacked).toBe(true);
  });

  it("allows overriding warOfDevolutionAttacked on chapter 2", () => {
    const st = createInitialState(10_005, "secondMandate", { warOfDevolutionAttacked: false });
    expect(st.warOfDevolutionAttacked).toBe(false);
  });
});

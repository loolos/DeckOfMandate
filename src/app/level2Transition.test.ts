import { describe, expect, it } from "vitest";
import { createInitialState } from "./initialState";
import {
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
  validateLevel2Refit,
} from "./level2Transition";

describe("level2Transition", () => {
  it("creates a valid standalone chapter 2 draft with recommended new cards", () => {
    const draft = createStandaloneLevel2Draft(123);
    const v = validateLevel2Refit(draft.counts);
    expect(draft.mode).toBe("standalone");
    expect(draft.resources.treasuryStat).toBe(3);
    expect(draft.counts.grainRelief).toBe(1);
    expect(draft.counts.taxRebalance).toBe(1);
    expect(draft.counts.diplomaticCongress).toBe(1);
    expect(v.isValid).toBe(true);
  });

  it("creates continuity draft with war branch inheritance and europe alert", () => {
    const chapter1Win = {
      ...createInitialState(777, "firstMandate"),
      warOfDevolutionAttacked: true,
      resources: {
        treasuryStat: 4,
        funding: 0,
        power: 4,
        legitimacy: 5,
      },
    };
    const draft = createContinuityLevel2Draft(chapter1Win);
    expect(draft.mode).toBe("continuity");
    expect(draft.warOfDevolutionAttacked).toBe(true);
    expect(draft.europeAlert).toBe(true);
    expect(draft.resources.treasuryStat).toBe(4);
    expect(draft.resources.power).toBe(4);
    expect(draft.resources.legitimacy).toBe(6);
  });

  it("builds a playable chapter 2 state from refit counts", () => {
    const draft = createStandaloneLevel2Draft(321);
    draft.counts.warBond = 1;
    const st = buildLevel2StateFromDraft(draft);
    expect(st.levelId).toBe("secondMandate");
    expect(st.resources.treasuryStat).toBe(3);
    expect(st.resources.power).toBe(3);
    expect(st.resources.legitimacy).toBe(3);
    const allTemplateIds = Object.values(st.cardsById).map((c) => c.templateId);
    expect(allTemplateIds.includes("development")).toBe(false);
    expect(allTemplateIds.includes("warBond")).toBe(true);
  });
});

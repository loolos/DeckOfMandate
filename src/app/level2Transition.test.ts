import { describe, expect, it } from "vitest";
import { createInitialState } from "./initialState";
import {
  LEVEL2_CONTINUITY_MAX_REMOVALS,
  LEVEL2_REFIT_RULES,
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
  toggleContinuityCardRemoval,
  validateLevel2ContinuityRefit,
  validateLevel2Draft,
  updateRefitCount,
  validateLevel2Refit,
} from "./level2Transition";

describe("level2Transition", () => {
  it("creates a valid standalone chapter 2 draft with recommended new cards", () => {
    const draft = createStandaloneLevel2Draft(123);
    const v = validateLevel2Refit(draft.counts);
    expect(draft.mode).toBe("standalone");
    expect(draft.calendarStartYear).toBe(1676);
    expect(draft.warOfDevolutionAttacked).toBe(true);
    expect(draft.europeAlert).toBe(true);
    expect(draft.resources.treasuryStat).toBe(7);
    expect(draft.resources.power).toBe(7);
    expect(draft.resources.legitimacy).toBe(5);
    expect(draft.counts.grainRelief).toBe(1);
    expect(draft.counts.taxRebalance).toBe(1);
    expect(draft.counts.diplomaticCongress).toBe(1);
    expect(v.isValid).toBe(true);
  });

  it("creates continuity draft with war branch inheritance and europe alert", () => {
    const chapter1Win = {
      ...createInitialState(777, "firstMandate"),
      turn: 12,
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
    expect(draft.calendarStartYear).toBe(1672);
    expect(draft.carryoverCards.length).toBeGreaterThan(0);
    expect(draft.removedCarryoverIds).toEqual([]);
  });

  it("limits adjustable carryover changes to three cards", () => {
    const draft = createStandaloneLevel2Draft(456);
    const counts1 = updateRefitCount(draft.counts, draft.baseCounts, "funding", +1);
    const counts2 = updateRefitCount(counts1, draft.baseCounts, "reform", +1);
    const counts3 = updateRefitCount(counts2, draft.baseCounts, "ceremony", +1);
    const counts4 = updateRefitCount(counts3, draft.baseCounts, "crackdown", +1);
    const v3 = validateLevel2Refit(counts3, draft.baseCounts);
    const v4 = validateLevel2Refit(counts4, draft.baseCounts);
    expect(v3.adjustableChanges).toBe(LEVEL2_REFIT_RULES.maxTotalAdjustableChanges);
    expect(v3.isValid).toBe(true);
    expect(counts4).toEqual(counts3);
    expect(v4.isValid).toBe(true);
  });

  it("builds a playable chapter 2 state from refit counts", () => {
    const draft = createStandaloneLevel2Draft(321);
    draft.counts.patronageOffice = 1;
    const st = buildLevel2StateFromDraft(draft);
    expect(st.levelId).toBe("secondMandate");
    expect(st.calendarStartYear).toBe(1676);
    expect(st.resources.treasuryStat).toBe(7);
    expect(st.resources.power).toBe(7);
    expect(st.resources.legitimacy).toBe(5);
    const allTemplateIds = Object.values(st.cardsById).map((c) => c.templateId);
    expect(allTemplateIds.includes("development")).toBe(false);
    expect(allTemplateIds.includes("patronageOffice")).toBe(true);
    expect(allTemplateIds.includes("diplomaticIntervention")).toBe(false);
    expect(allTemplateIds.includes("diplomaticCongress")).toBe(true);
  });

  it("continuity refit removes cards per-instance up to the configured cap", () => {
    const chapter1Win = createInitialState(778, "firstMandate");
    const draft = createContinuityLevel2Draft(chapter1Win);
    if (draft.carryoverCards.length < 4) throw new Error("expected at least 4 carryover cards");
    let d = draft;
    for (let i = 0; i < LEVEL2_CONTINUITY_MAX_REMOVALS; i++) {
      d = toggleContinuityCardRemoval(d, d.carryoverCards[i]!.instanceId);
    }
    const blocked = toggleContinuityCardRemoval(d, d.carryoverCards[LEVEL2_CONTINUITY_MAX_REMOVALS]!.instanceId);
    expect(blocked.removedCarryoverIds.length).toBe(LEVEL2_CONTINUITY_MAX_REMOVALS);
    const v = validateLevel2ContinuityRefit(blocked);
    expect(v.adjustableChanges).toBe(LEVEL2_CONTINUITY_MAX_REMOVALS);
    expect(v.maxAdjustableChanges).toBe(LEVEL2_CONTINUITY_MAX_REMOVALS);
    expect(v.isValid).toBe(true);
  });

  it("continuity chapter 2 state keeps per-instance inflation for retained cards", () => {
    const chapter1Win = createInitialState(779, "firstMandate");
    const poolIds = [...chapter1Win.deck, ...chapter1Win.discard, ...chapter1Win.hand];
    const first = poolIds[0];
    const second = poolIds[1];
    if (!first || !second) throw new Error("expected at least two pool cards");
    const withInflation = {
      ...chapter1Win,
      cardInflationById: {
        ...chapter1Win.cardInflationById,
        [first]: 2,
        [second]: 1,
      },
    };
    const draft0 = createContinuityLevel2Draft(withInflation, 8800);
    const keepInflated = draft0.carryoverCards.find((c) => c.instanceId === first);
    const removeInflated = draft0.carryoverCards.find((c) => c.instanceId === second);
    if (!keepInflated || !removeInflated) throw new Error("expected inflation cards in carryover");
    let draft = draft0;
    draft = toggleContinuityCardRemoval(draft, removeInflated.instanceId);
    const st = buildLevel2StateFromDraft(draft);
    expect(st.levelId).toBe("secondMandate");
    expect(st.cardsById[keepInflated.instanceId]?.templateId).toBe(keepInflated.templateId);
    expect(st.cardInflationById[keepInflated.instanceId]).toBe(2);
    expect(st.cardsById[removeInflated.instanceId]).toBeUndefined();
    expect(st.cardInflationById[removeInflated.instanceId]).toBeUndefined();
  });

  it("validateLevel2Draft supports both standalone and continuity flows", () => {
    const standalone = createStandaloneLevel2Draft(901);
    const continuity = createContinuityLevel2Draft(createInitialState(902, "firstMandate"));
    const vStandalone = validateLevel2Draft(standalone);
    const vContinuity = validateLevel2Draft(continuity);
    expect(vStandalone.isValid).toBe(true);
    expect(vContinuity.isValid).toBe(true);
    expect(vStandalone.maxAdjustableChanges).toBe(LEVEL2_REFIT_RULES.maxTotalAdjustableChanges);
    expect(vContinuity.maxAdjustableChanges).toBe(LEVEL2_CONTINUITY_MAX_REMOVALS);
  });
});

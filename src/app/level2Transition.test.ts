import { describe, expect, it } from "vitest";
import { createInitialState } from "./initialState";
import {
  LEVEL2_CONTINUITY_MAX_REMOVALS,
  LEVEL2_FIXED_NEW_IDS,
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
  toggleContinuityCardRemoval,
  validateLevel2ContinuityRefit,
  validateLevel2Draft,
} from "./level2Transition";

describe("level2Transition", () => {
  it("creates a valid standalone chapter 2 draft with chapter-1 carryover cards", () => {
    const draft = createStandaloneLevel2Draft(123);
    const v = validateLevel2Draft(draft);
    expect(draft.mode).toBe("standalone");
    expect(draft.calendarStartYear).toBe(1676);
    expect(draft.warOfDevolutionAttacked).toBe(true);
    expect(draft.europeAlert).toBe(true);
    expect(draft.resources.treasuryStat).toBe(7);
    expect(draft.resources.power).toBe(7);
    expect(draft.resources.legitimacy).toBe(5);
    expect(draft.carryoverCards.length).toBe(11);
    expect(draft.carryoverCards.some((card) => card.templateId === "development")).toBe(false);
    const standaloneReform = draft.carryoverCards.find((card) => card.templateId === "reform");
    const standaloneCeremony = draft.carryoverCards.find((card) => card.templateId === "ceremony");
    const standaloneFunding = draft.carryoverCards.find((card) => card.templateId === "funding");
    const standaloneCrackdown = draft.carryoverCards.find((card) => card.templateId === "crackdown");
    expect(standaloneReform?.inflationDelta).toBe(1);
    expect(standaloneCeremony?.inflationDelta).toBe(1);
    expect(standaloneFunding?.remainingUses).toBe(1);
    expect(standaloneCrackdown?.remainingUses).toBe(1);
    expect(standaloneFunding?.totalUses).toBe(1);
    expect(standaloneCrackdown?.totalUses).toBe(1);
    expect(draft.removedCarryoverIds).toEqual([]);
    expect(v.totalNewCards).toBe(LEVEL2_FIXED_NEW_IDS.length);
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

  it("continuity draft keeps remaining uses from chapter 1 cards", () => {
    const chapter1Win = createInitialState(7788, "firstMandate");
    const targetId = chapter1Win.deck.find((id) => chapter1Win.cardsById[id]?.templateId === "crackdown");
    if (!targetId) throw new Error("expected crackdown card");
    const withAdjustedUses = {
      ...chapter1Win,
      cardUsesById: {
        ...chapter1Win.cardUsesById,
        [targetId]: { total: 3, remaining: 1 },
      },
    };
    const draft = createContinuityLevel2Draft(withAdjustedUses);
    const carried = draft.carryoverCards.find((card) => card.instanceId === targetId);
    expect(carried?.remainingUses).toBe(1);
    expect(carried?.totalUses).toBe(3);
  });

  it("builds a playable chapter 2 state from standalone removals", () => {
    const draft = createStandaloneLevel2Draft(321);
    draft.removedCarryoverIds = [draft.carryoverCards[0]!.instanceId];
    const st = buildLevel2StateFromDraft(draft);
    expect(st.levelId).toBe("secondMandate");
    expect(st.calendarStartYear).toBe(1676);
    expect(st.resources.treasuryStat).toBe(7);
    expect(st.resources.power).toBe(4);
    expect(st.resources.legitimacy).toBe(5);
    expect(st.europeAlertPowerLoss).toBe(3);
    const allTemplateIds = Object.values(st.cardsById).map((c) => c.templateId);
    expect(allTemplateIds.includes("development")).toBe(false);
    const reformInstanceId = Object.keys(st.cardsById).find((id) => st.cardsById[id]?.templateId === "reform");
    const ceremonyInstanceId = Object.keys(st.cardsById).find((id) => st.cardsById[id]?.templateId === "ceremony");
    if (!reformInstanceId || !ceremonyInstanceId) throw new Error("expected reform and ceremony in standalone deck");
    expect(st.cardInflationById[reformInstanceId]).toBe(1);
    expect(st.cardInflationById[ceremonyInstanceId]).toBe(1);
    expect((allTemplateIds as string[]).includes("patronageOffice")).toBe(false);
    expect(allTemplateIds.includes("diplomaticIntervention")).toBe(false);
    for (const id of LEVEL2_FIXED_NEW_IDS) {
      expect(allTemplateIds.includes(id)).toBe(true);
    }
    expect(st.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === "chapter2EuropeAlertOn")).toBe(true);
  });

  it("writes a chapter-start Europe Alert status note into action log", () => {
    const chapter1Win = {
      ...createInitialState(42, "firstMandate"),
      warOfDevolutionAttacked: false,
    };
    const draft = createContinuityLevel2Draft(chapter1Win, 4242);
    expect(draft.europeAlert).toBe(false);
    const st = buildLevel2StateFromDraft(draft);
    expect(st.actionLog.some((entry) => entry.kind === "info" && entry.infoKey === "chapter2EuropeAlertOff")).toBe(true);
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
    const allTemplateIds = Object.values(st.cardsById).map((c) => c.templateId);
    for (const id of LEVEL2_FIXED_NEW_IDS) {
      expect(allTemplateIds.includes(id)).toBe(true);
    }
  });

  it("standalone chapter 2 keeps royal limited-use cards at 1/1", () => {
    const draft = createStandaloneLevel2Draft(2_024);
    const st = buildLevel2StateFromDraft(draft);
    const fundingId = Object.keys(st.cardsById).find((id) => st.cardsById[id]?.templateId === "funding");
    const crackdownId = Object.keys(st.cardsById).find((id) => st.cardsById[id]?.templateId === "crackdown");
    if (!fundingId || !crackdownId) throw new Error("expected funding and crackdown in standalone deck");
    expect(st.cardUsesById[fundingId]).toEqual({ remaining: 1, total: 1 });
    expect(st.cardUsesById[crackdownId]).toEqual({ remaining: 1, total: 1 });
  });

  it("includes non-temp cards still present in cardsById even if they are outside deck/discard/hand", () => {
    const chapter1Win = createInitialState(1_903, "firstMandate");
    const offPoolId = "off_pool_development";
    const sourceDevelopment = Object.values(chapter1Win.cardsById).find((card) => card.templateId === "development");
    if (!sourceDevelopment) throw new Error("expected development card");
    const withOffPoolCard = {
      ...chapter1Win,
      cardsById: {
        ...chapter1Win.cardsById,
        [offPoolId]: { instanceId: offPoolId, templateId: sourceDevelopment.templateId },
      },
      cardInflationById: {
        ...chapter1Win.cardInflationById,
        [offPoolId]: 2,
      },
    };
    const draft = createContinuityLevel2Draft(withOffPoolCard);
    const carried = draft.carryoverCards.find((card) => card.instanceId === offPoolId);
    expect(carried).toBeDefined();
    expect(carried?.templateId).toBe("development");
    expect(carried?.inflationDelta).toBe(2);
  });

  it("validateLevel2Draft supports both standalone and continuity flows", () => {
    const standalone = createStandaloneLevel2Draft(901);
    const continuity = createContinuityLevel2Draft(createInitialState(902, "firstMandate"));
    const vStandalone = validateLevel2Draft(standalone);
    const vContinuity = validateLevel2Draft(continuity);
    expect(vStandalone.isValid).toBe(true);
    expect(vContinuity.isValid).toBe(true);
    expect(vStandalone.totalNewCards).toBe(LEVEL2_FIXED_NEW_IDS.length);
    expect(vContinuity.totalNewCards).toBe(LEVEL2_FIXED_NEW_IDS.length);
    expect(vContinuity.maxAdjustableChanges).toBe(LEVEL2_CONTINUITY_MAX_REMOVALS);
  });
});

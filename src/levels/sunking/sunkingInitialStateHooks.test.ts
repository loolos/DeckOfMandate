import { describe, expect, it } from "vitest";
import { getCardTemplate } from "../../data/cards";
import { getLevelContent } from "../../data/levelRegistry";
import {
  createContinuityLevel3Draft,
  createDeckRefitCarryoverSnapshot,
  createStandaloneLevel3Draft,
  SUNKING_CH3_ID,
  validateLevel3Draft,
} from "../campaignChapterTransitions";
import { createInitialState } from "../../app/initialState";
import { buildLevel3StateFromChapter2 } from "../../app/levelTransitions";

describe("Sun King initialState hooks (chapter 3)", () => {
  it("standalone chapter 3 draft uses a full chapter-2-sized carryover pool for refit", () => {
    const draft = createStandaloneLevel3Draft(50_001);
    expect(draft.mode).toBe("standalone");
    const ch2Content = getLevelContent("secondMandate");
    const removedInStandalone = new Set(
      getLevelContent("thirdMandate").refit?.standaloneCarryoverSource?.excludeTemplateIds ?? [],
    );
    const expectedCarryoverCount = ch2Content.starterDeckTemplateOrder.filter((id) => !removedInStandalone.has(id)).length;
    expect(draft.carryoverCards.length).toBe(expectedCarryoverCount);
    expect(draft.carryoverCards.some((c) => c.templateId === "funding" || c.templateId === "crackdown")).toBe(false);
    expect(validateLevel3Draft(draft).isValid).toBe(true);
  });

  it("standalone third mandate excludes royal levy/crackdown and seeds opening inflation so target cards start at cost 4", () => {
    const st = createInitialState(12_399, SUNKING_CH3_ID);
    const allTemplates = [...st.deck, ...st.hand, ...st.discard].map((id) => st.cardsById[id]?.templateId);
    expect(allTemplates.some((t) => t === "funding" || t === "crackdown")).toBe(false);
    const openingInflationTargets = new Set(["reform", "ceremony", "grainRelief", "taxRebalance"]);
    for (const [cardId, delta] of Object.entries(st.cardInflationById)) {
      const tid = st.cardsById[cardId]?.templateId;
      if (!tid || !openingInflationTargets.has(tid)) continue;
      const tmpl = getCardTemplate(tid);
      expect(tmpl.cost + delta).toBe(4);
    }
  });

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

  it("continuity merges carryover and eight chapter-3 cards in the opening shuffle, then inserts four Nantes cards at random deck positions", () => {
    const baseCh2 = createInitialState(777, "secondMandate");
    const ch2 = {
      ...baseCh2,
      resources: {
        ...baseCh2.resources,
        treasuryStat: 6,
        power: 5,
        legitimacy: 4,
        funding: 2,
      },
    };
    const carryoverCount = createDeckRefitCarryoverSnapshot(ch2).length;
    const draft = createContinuityLevel3Draft(ch2);
    expect(draft.resources.funding).toBe(ch2.resources.funding);
    const st = buildLevel3StateFromChapter2(ch2, 888);
    const allIds = [...st.deck, ...st.discard, ...st.hand];
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(allIds.length).toBe(carryoverCount + 8 + 4);
    expect(Object.values(st.cardsById).filter((c) => c.templateId === "bourbonMarriageProclamation").length).toBe(2);
    expect(Object.values(st.cardsById).filter((c) => c.templateId === "usurpationEdict").length).toBe(2);
    expect(Object.values(st.cardsById).filter((c) => c.templateId === "jansenistReservation").length).toBe(4);
    expect(st.resources.treasuryStat).toBe(ch2.resources.treasuryStat);
    expect(st.resources.power).toBe(ch2.resources.power);
    expect(st.resources.legitimacy).toBe(ch2.resources.legitimacy);
    // Draft carries over chapter-2 funding; first beginYear adds treasury-based income.
    expect(st.resources.funding).toBe(ch2.resources.funding + ch2.resources.treasuryStat);
  });
});

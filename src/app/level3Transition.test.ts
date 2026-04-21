import { describe, expect, it } from "vitest";
import { getCardTemplate } from "../data/cards";
import { getLevelContent } from "../data/levelRegistry";
import {
  createStandaloneLevel3Draft,
  validateLevel3Draft,
} from "../levels/sunking/chapter3Transition";
import { createInitialState } from "./initialState";
import { SUNKING_CH3_ID, buildLevel3StateFromChapter2 } from "./level3Transition";

describe("level3Transition / thirdMandate Nantes carryover", () => {
  it("standalone chapter 3 draft uses a full chapter-2-sized carryover pool for refit", () => {
    const draft = createStandaloneLevel3Draft(50_001);
    expect(draft.mode).toBe("standalone");
    const ch2Count = getLevelContent("secondMandate").starterDeckTemplateOrder.length;
    expect(draft.carryoverCards.length).toBe(ch2Count - 7);
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

  it("continuity inherits chapter 2 deck instance ids and adds six opening-hand cards", () => {
    const ch2 = createInitialState(777, "secondMandate");
    const poolIds = new Set([...ch2.deck, ...ch2.discard, ...ch2.hand]);
    const st = buildLevel3StateFromChapter2(ch2, 888);
    expect(st.hand.filter((id) => id.startsWith("ch3_hand_")).length).toBe(6);
    for (const id of st.deck) {
      if (poolIds.has(id)) continue;
      const tmpl = st.cardsById[id]?.templateId;
      expect(tmpl === "jansenistReservation" || tmpl === "religiousTensionCard").toBe(true);
    }
    expect(st.deck.length + st.hand.length).toBe(poolIds.size + 6 + 4);
    expect(st.resources.treasuryStat).toBe(ch2.resources.treasuryStat);
  });
});

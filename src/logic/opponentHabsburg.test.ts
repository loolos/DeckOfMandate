import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import type { GameState } from "../types/game";
import {
  chooseOpponentPlay,
  initOpponentHabsburgPool,
  opponentBeginYearDrawPhase,
  opponentEndYearPlayPhase,
  utrechtTreatySituationTier,
} from "./opponentHabsburg";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

describe("opponentHabsburg AI", () => {
  it("returns null when opponent not unlocked", () => {
    const st = createInitialState(1, THIRD_MANDATE_LEVEL_ID);
    expect(chooseOpponentPlay(st)).toBeNull();
  });

  it("with budget 2 and two cost-1 cards, plays both in template-id / instance-id order", () => {
    const base = createInitialState(42, THIRD_MANDATE_LEVEL_ID);
    const opp1 = "opp_t_1";
    const opp2 = "opp_t_2";
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      opponentHand: [opp2, opp1],
      opponentStrength: 2,
      opponentCostDiscountThisTurn: 0,
      opponentLastPlayedTemplateIds: [],
      cardsById: {
        ...base.cardsById,
        [opp1]: { instanceId: opp1, templateId: "habsburgImperialLegitimacyNote" },
        [opp2]: { instanceId: opp2, templateId: "habsburgImperialLegitimacyNote" },
      },
    };
    const pick = chooseOpponentPlay(st);
    expect(pick).toEqual([opp1, opp2]);
  });

  it("draws one opponent card at begin-year after the rival is unlocked", () => {
    const base = createInitialState(7, THIRD_MANDATE_LEVEL_ID);
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      opponentDeck: ["opp_a", "opp_b", "opp_c"],
      opponentHand: [],
      cardsById: {
        ...base.cardsById,
        opp_a: { instanceId: "opp_a", templateId: "habsburgImperialLegitimacyNote" },
        opp_b: { instanceId: "opp_b", templateId: "habsburgLowCountriesAgitation" },
        opp_c: { instanceId: "opp_c", templateId: "habsburgGrandAllianceLevy" },
      },
    };

    const next = opponentBeginYearDrawPhase(st);
    expect(next.opponentHand).toEqual(["opp_a"]);
    expect(next.opponentDeck).toEqual(["opp_b", "opp_c"]);
  });

  it("Low Countries agitation lowers succession, power, and legitimacy", () => {
    const base = createInitialState(104, THIRD_MANDATE_LEVEL_ID);
    const agId = "opp_ag_test";
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      opponentHand: [agId],
      opponentDeck: [],
      opponentDiscard: [],
      opponentStrength: 2,
      opponentCostDiscountThisTurn: 0,
      opponentLastPlayedTemplateIds: [],
      cardsById: {
        ...base.cardsById,
        [agId]: { instanceId: agId, templateId: "habsburgLowCountriesAgitation" },
      },
    };
    const next = opponentEndYearPlayPhase(st);
    expect(next.successionTrack).toBe(base.successionTrack - 1);
    expect(next.resources.power).toBe(base.resources.power - 1);
    expect(next.resources.legitimacy).toBe(base.resources.legitimacy - 1);
    expect(next.opponentDiscard).toEqual([agId]);
  });

  it("Grand Alliance levy adds one Fiscal Burden to the player deck at a random position", () => {
    const base = createInitialState(99, THIRD_MANDATE_LEVEL_ID);
    const levyId = "opp_levy_test";
    const burdenBefore = Object.values(base.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      opponentHand: [levyId],
      opponentDeck: [],
      opponentDiscard: [],
      opponentStrength: 2,
      opponentCostDiscountThisTurn: 0,
      opponentLastPlayedTemplateIds: [],
      cardsById: {
        ...base.cardsById,
        [levyId]: { instanceId: levyId, templateId: "habsburgGrandAllianceLevy" },
      },
    };
    const next = opponentEndYearPlayPhase(st);
    const burdenAfter = Object.values(next.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    expect(burdenAfter).toBe(burdenBefore + 1);
    expect(next.deck.some((id) => next.cardsById[id]?.templateId === "fiscalBurden")).toBe(true);
    expect(next.opponentHand).toEqual([]);
    expect(next.opponentDiscard).toEqual([levyId]);
  });

  it("Imperial customs delay cuts treasury, adds Fiscal Burden, and schedules −1 draw next year", () => {
    const base = createInitialState(101, THIRD_MANDATE_LEVEL_ID);
    const customsId = "opp_customs_test";
    const burdenBefore = Object.values(base.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    const treasuryBefore = base.resources.treasuryStat;
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      opponentHand: [customsId],
      opponentDeck: [],
      opponentDiscard: [],
      opponentStrength: 2,
      opponentCostDiscountThisTurn: 0,
      opponentLastPlayedTemplateIds: [],
      nextTurnDrawModifier: 0,
      cardsById: {
        ...base.cardsById,
        [customsId]: { instanceId: customsId, templateId: "habsburgImperialCustomsDelay" },
      },
    };
    const next = opponentEndYearPlayPhase(st);
    expect(next.resources.treasuryStat).toBe(treasuryBefore - 1);
    const burdenAfter = Object.values(next.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    expect(burdenAfter).toBe(burdenBefore + 1);
    expect(next.deck.some((id) => next.cardsById[id]?.templateId === "fiscalBurden")).toBe(true);
    expect(next.nextTurnDrawModifier).toBe(-1);
    expect(next.opponentHand).toEqual([]);
    expect(next.opponentDiscard).toEqual([customsId]);
  });

  it("Imperial legitimacy note lowers succession track and schedules −1 opponent draw next year", () => {
    const base = createInitialState(102, THIRD_MANDATE_LEVEL_ID);
    const noteId = "opp_note_test";
    const trackBefore = base.successionTrack;
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      opponentHand: [noteId],
      opponentDeck: [],
      opponentDiscard: [],
      opponentStrength: 2,
      opponentCostDiscountThisTurn: 0,
      opponentNextTurnDrawModifier: 0,
      opponentLastPlayedTemplateIds: [],
      cardsById: {
        ...base.cardsById,
        [noteId]: { instanceId: noteId, templateId: "habsburgImperialLegitimacyNote" },
      },
    };
    const next = opponentEndYearPlayPhase(st);
    expect(next.successionTrack).toBe(trackBefore - 1);
    expect(next.opponentNextTurnDrawModifier).toBe(-1);
    expect(next.opponentDiscard).toEqual([noteId]);
  });

  it("opponent begin-year draw uses opponentNextTurnDrawModifier (e.g. 0 cards when base 1 and modifier is −1)", () => {
    const base = createInitialState(103, THIRD_MANDATE_LEVEL_ID);
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      opponentNextTurnDrawModifier: -1,
      opponentDeck: ["opp_x", "opp_y", "opp_z"],
      opponentHand: [],
      cardsById: {
        ...base.cardsById,
        opp_x: { instanceId: "opp_x", templateId: "habsburgImperialLegitimacyNote" },
        opp_y: { instanceId: "opp_y", templateId: "habsburgImperialLegitimacyNote" },
        opp_z: { instanceId: "opp_z", templateId: "habsburgGrandAllianceLevy" },
      },
    };
    const next = opponentBeginYearDrawPhase(st);
    expect(next.opponentHand).toEqual([]);
    expect(next.opponentDeck).toEqual(["opp_x", "opp_y", "opp_z"]);
    expect(next.opponentNextTurnDrawModifier).toBe(0);
  });

  it("begin year skips opponent draw after Utrecht ends war", () => {
    const base = createInitialState(104, THIRD_MANDATE_LEVEL_ID);
    const st: GameState = {
      ...base,
      opponentHabsburgUnlocked: true,
      warEnded: true,
      opponentDeck: ["opp_x"],
      opponentHand: [],
      cardsById: {
        ...base.cardsById,
        opp_x: { instanceId: "opp_x", templateId: "habsburgImperialLegitimacyNote" },
      },
    };
    const next = opponentBeginYearDrawPhase(st);
    expect(next.opponentHand).toEqual([]);
    expect(next.opponentDeck).toEqual(["opp_x"]);
  });

  it("initOpponentHabsburgPool preserves opponentNextTurnDrawModifier and starts with 2 opponent cards in hand", () => {
    const base = createInitialState(55_002, THIRD_MANDATE_LEVEL_ID);
    const st: GameState = {
      ...base,
      opponentNextTurnDrawModifier: 1,
      opponentHabsburgUnlocked: false,
    };
    const next = initOpponentHabsburgPool(st);
    expect(next.opponentNextTurnDrawModifier).toBe(1);
    expect(next.opponentHabsburgUnlocked).toBe(true);
    expect(next.opponentHand).toHaveLength(2);
    expect(next.opponentDeck).toHaveLength(6);
  });
});

describe("utrechtTreatySituationTier", () => {
  it("maps track bands for treaty epilogue", () => {
    expect(utrechtTreatySituationTier(10)).toBe("bourbon");
    expect(utrechtTreatySituationTier(4)).toBe("bourbon");
    expect(utrechtTreatySituationTier(3)).toBe("compromise");
    expect(utrechtTreatySituationTier(-3)).toBe("compromise");
    expect(utrechtTreatySituationTier(-4)).toBe("habsburg");
  });
});

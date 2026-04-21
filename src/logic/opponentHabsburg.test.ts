import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import type { GameState } from "../types/game";
import {
  chooseOpponentPlay,
  opponentBeginYearDrawPhase,
  opponentEndYearPlayPhase,
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

  it("draws two opponent cards at begin-year after the rival is unlocked", () => {
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
    expect(next.opponentHand).toEqual(["opp_a", "opp_b"]);
    expect(next.opponentDeck).toEqual(["opp_c"]);
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
});

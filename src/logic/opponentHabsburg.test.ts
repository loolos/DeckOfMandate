import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import type { GameState } from "../types/game";
import { chooseOpponentPlay } from "./opponentHabsburg";
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
});

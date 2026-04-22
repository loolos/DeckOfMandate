import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { hasCardTag } from "../../../logic/cardTags";
import { isCardPlayableInActionPhase } from "../../../logic/cardPlayability";
import type { GameState } from "../../../types/game";

describe("cardPlayability / defiance (Jansenist neighbor)", () => {
  it("gives Defiance tag to the card left of Reservation of Conscience; that card cannot be played", () => {
    const base = createInitialState(42, "thirdMandate");
    const left = "test_left";
    const jr = "test_jr";
    const state: GameState = {
      ...base,
      hand: [left, jr],
      cardsById: {
        ...base.cardsById,
        [left]: { instanceId: left, templateId: "funding" },
        [jr]: { instanceId: jr, templateId: "jansenistReservation" },
      },
    };
    expect(hasCardTag(state, left, "defiance")).toBe(true);
    expect(hasCardTag(state, jr, "defiance")).toBe(false);
    expect(isCardPlayableInActionPhase(state, left)).toBe(false);
    expect(isCardPlayableInActionPhase(state, jr)).toBe(true);
  });

  it("does not grant Defiance when Jansenist is to the left", () => {
    const base = createInitialState(43, "thirdMandate");
    const jr = "test_jr";
    const right = "test_right";
    const state: GameState = {
      ...base,
      hand: [jr, right],
      cardsById: {
        ...base.cardsById,
        [jr]: { instanceId: jr, templateId: "jansenistReservation" },
        [right]: { instanceId: right, templateId: "funding" },
      },
    };
    expect(hasCardTag(state, right, "defiance")).toBe(false);
    expect(isCardPlayableInActionPhase(state, right)).toBe(true);
  });
});

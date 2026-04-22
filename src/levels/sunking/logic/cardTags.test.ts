import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { getCardTagsForInstance, hasCardTag } from "../../../logic/cardTags";

describe("cardTags", () => {
  it("hides chapter-1 inflation tag before pressure threshold", () => {
    const state = createInitialState(3001, "firstMandate");
    const reformId = state.deck.find((id) => state.cardsById[id]?.templateId === "reform");
    if (!reformId) throw new Error("missing reform card in firstMandate starter deck");
    expect(hasCardTag(state, reformId, "inflation")).toBe(false);
    expect(getCardTagsForInstance(state, reformId)).not.toContain("inflation");
  });

  it("shows chapter-1 inflation tag after pressure threshold", () => {
    const base = createInitialState(3002, "firstMandate");
    const reformId = base.deck.find((id) => base.cardsById[id]?.templateId === "reform");
    if (!reformId) throw new Error("missing reform card in firstMandate starter deck");
    const state = {
      ...base,
      resources: { ...base.resources, power: 5, treasuryStat: 5, legitimacy: 4 },
    };
    expect(hasCardTag(state, reformId, "inflation")).toBe(true);
    expect(getCardTagsForInstance(state, reformId)).toContain("inflation");
  });
});

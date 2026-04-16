import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { createRngFromSeed } from "./rng";
import { addCardsToDeck } from "./cardRuntime";

describe("addCardsToDeck", () => {
  it("inserts generated cards into random deck positions (not fixed to deck top)", () => {
    const base = createInitialState(2026, "secondMandate");
    const withSeedA = { ...base, rng: createRngFromSeed(11) };
    const withSeedB = { ...base, rng: createRngFromSeed(29) };

    const a = addCardsToDeck(withSeedA, "fiscalBurden", 3);
    const b = addCardsToDeck(withSeedB, "fiscalBurden", 3);

    const addedA = Object.values(a.cardsById)
      .filter((c) => c.templateId === "fiscalBurden")
      .map((c) => c.instanceId)
      .filter((id) => !base.cardsById[id]);

    const addedB = Object.values(b.cardsById)
      .filter((c) => c.templateId === "fiscalBurden")
      .map((c) => c.instanceId)
      .filter((id) => !base.cardsById[id]);

    expect(addedA).toHaveLength(3);
    expect(addedB).toHaveLength(3);
    expect(a.deck).toEqual(expect.arrayContaining(addedA));
    expect(b.deck).toEqual(expect.arrayContaining(addedB));
    expect(a.deck).not.toEqual(b.deck);
  });
});

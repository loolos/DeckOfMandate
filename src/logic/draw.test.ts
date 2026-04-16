import { describe, expect, it } from "vitest";
import { createRngFromSeed, shuffle } from "./rng";
import { refillDeckFromDiscard } from "./draw";

describe("refillDeckFromDiscard", () => {
  it("keeps deck/discard unchanged when deck is not empty", () => {
    const rng = createRngFromSeed(101);
    const [nextRng, deck, discard, refilled] = refillDeckFromDiscard(rng, ["d0"], ["x0", "x1"]);
    expect(nextRng).toEqual(rng);
    expect(deck).toEqual(["d0"]);
    expect(discard).toEqual(["x0", "x1"]);
    expect(refilled).toEqual([]);
  });

  it("always changes order on refill when discard has multiple cards", () => {
    const discard = ["c0", "c1", "c2"];
    let pickedSeed: number | null = null;
    for (let seed = 1; seed <= 200_000; seed++) {
      const [, shuffled] = shuffle(createRngFromSeed(seed), discard);
      const sameOrder = shuffled.every((id, i) => id === discard[i]);
      if (sameOrder) {
        pickedSeed = seed;
        break;
      }
    }
    expect(pickedSeed).not.toBeNull();
    const [_, deckAfter, discardAfter, refilled] = refillDeckFromDiscard(createRngFromSeed(pickedSeed!), [], [...discard]);
    expect(deckAfter).not.toEqual(discard);
    expect(discardAfter).toEqual([]);
    expect(refilled).toEqual(discard);
  });
});

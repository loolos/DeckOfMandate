import { describe, expect, it } from "vitest";
import { createRngFromSeed, pickWeightedIndex, rngNext, shuffle } from "./rng";

describe("rng", () => {
  it("produces identical float sequences for the same seed state", () => {
    const take = (seed: number, n: number) => {
      let r = createRngFromSeed(seed);
      const out: number[] = [];
      for (let i = 0; i < n; i++) {
        const [nr, x] = rngNext(r);
        r = nr;
        out.push(x);
      }
      return out;
    };
    expect(take(12345, 12)).toEqual(take(12345, 12));
    expect(take(12345, 4)).not.toEqual(take(99999, 4));
  });

  it("pickWeightedIndex respects numeric weights", () => {
    let r = createRngFromSeed(7);
    const counts = [0, 0, 0];
    for (let i = 0; i < 6000; i++) {
      const [nr, idx] = pickWeightedIndex(r, [3, 2, 1]);
      r = nr;
      counts[idx]!++;
    }
    expect(counts[0]! > counts[1]! && counts[1]! > counts[2]!).toBe(true);
  });

  it("shuffle is deterministic given rng state", () => {
    const r0 = createRngFromSeed(2026);
    const items = ["a", "b", "c", "d", "e"];
    const [r1, a] = shuffle(r0, items);
    const [r2, b] = shuffle(createRngFromSeed(2026), items);
    expect(a).toEqual(b);
    expect(r1.state).toEqual(r2.state);
  });
});

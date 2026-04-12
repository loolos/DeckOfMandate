import type { RngSerialized } from "../types/game";

/** Mulberry32 — deterministic, small state. */
export function rngNext(rng: RngSerialized): [RngSerialized, number] {
  let a = (rng.state + 0x6d2b79f5) | 0;
  const t = Math.imul(a ^ (a >>> 15), a | 1);
  const u = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
  return [{ state: a >>> 0 }, u / 4294967296];
}

export function rngNextInt(rng: RngSerialized, maxExclusive: number): [RngSerialized, number] {
  if (maxExclusive <= 0) {
    throw new Error("rngNextInt: maxExclusive must be > 0");
  }
  const [r, f] = rngNext(rng);
  return [r, Math.floor(f * maxExclusive)];
}

export function shuffle<T>(rng: RngSerialized, items: readonly T[]): [RngSerialized, T[]] {
  let r = rng;
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const [r2, j] = rngNextInt(r, i + 1);
    r = r2;
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return [r, arr];
}

export function pickWeightedIndex(rng: RngSerialized, weights: readonly number[]): [RngSerialized, number] {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) throw new Error("pickWeightedIndex: total weight must be > 0");
  const [r1, x] = rngNext(rng);
  let t = x * total;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i]!;
    if (w <= 0) continue;
    t -= w;
    if (t < 0) return [r1, i];
  }
  return [r1, weights.length - 1];
}

export function createRngFromSeed(runSeed: number): RngSerialized {
  let s = runSeed | 0;
  if (s === 0) s = 0x9e3779b9;
  s = s >>> 0;
  // Warm up a few steps so nearby seeds diverge.
  let r: RngSerialized = { state: s };
  for (let i = 0; i < 16; i++) {
    r = rngNext(r)[0];
  }
  return r;
}

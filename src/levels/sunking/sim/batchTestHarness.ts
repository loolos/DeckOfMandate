/**
 * Shared setup for the AI batch simulations.
 *
 * These run a small deterministic smoke batch as part of the normal suite so that a
 * regression in the campaign rules fails CI, and scale up to the full balance-tuning
 * batches (with printed reports) when the matching env var is set — that heavy mode is
 * what `npm run test:ai:*` uses.
 */
import { expect } from "vitest";
import type {
  ThirdMandateOutcomeBreakdownCounts,
  ThirdMandateOutcomeBreakdownRates,
} from "./aiStrategySimulation";

export type BatchOptions = {
  seedStart: number;
  runCount: number;
  /** True in the opt-in heavy mode: print the full report for balance work. */
  verbose: boolean;
};

export function resolveBatchOptions(cfg: {
  longEnv: string;
  seedEnv: string;
  runsEnv: string;
  /** Fast default used by the normal suite. */
  smokeRuns: number;
  /** Default when the heavy mode is switched on. */
  longRuns: number;
}): BatchOptions {
  const verbose = process.env[cfg.longEnv] === "1";
  const seedStart = Number(process.env[cfg.seedEnv]) || 1;
  const requestedRuns = Number(process.env[cfg.runsEnv]);
  const runCount =
    Number.isFinite(requestedRuns) && requestedRuns > 0
      ? requestedRuns
      : verbose
        ? cfg.longRuns
        : cfg.smokeRuns;
  return { seedStart, runCount, verbose };
}

/** `console.log` in heavy mode only, so the normal suite stays quiet. */
export function report(verbose: boolean, line: string): void {
  if (verbose) console.log(line);
}

function sum(values: readonly number[]): number {
  return values.reduce((total, n) => total + n, 0);
}

/** Every simulated run must land in exactly one outcome bucket — no run may vanish. */
export function expectOutcomeAccounting(
  counts: Record<string, number>,
  expectedTotal: number,
  label: string,
): void {
  for (const [key, count] of Object.entries(counts)) {
    expect(Number.isInteger(count), `${label}.${key} must be a whole count`).toBe(true);
    expect(count, `${label}.${key} must not be negative`).toBeGreaterThanOrEqual(0);
  }
  expect(sum(Object.values(counts)), `${label} counts must account for every run`).toBe(expectedTotal);
}

/** Reported rates must be the shares implied by the counts (0 when nothing reached that stage). */
export function expectRatesMatchCounts(
  counts: Record<string, number>,
  rates: Record<string, number>,
  denominator: number,
  label: string,
): void {
  for (const [key, count] of Object.entries(counts)) {
    const rate = rates[key];
    expect(rate, `${label}.${key} must report a rate`).toBeTypeOf("number");
    const expected = denominator > 0 ? count / denominator : 0;
    expect(rate!, `${label}.${key} rate must match its count`).toBeCloseTo(expected, 4);
  }
}

export function expectThirdMandateBreakdown(
  counts: ThirdMandateOutcomeBreakdownCounts,
  rates: ThirdMandateOutcomeBreakdownRates,
  chapter3Runs: number,
  label: string,
): void {
  expectOutcomeAccounting(counts as unknown as Record<string, number>, chapter3Runs, label);
  expectRatesMatchCounts(
    counts as unknown as Record<string, number>,
    rates as unknown as Record<string, number>,
    chapter3Runs,
    label,
  );
  // "other" means the terminal state matched no known chapter-3 ending: always a rules bug.
  expect(counts.other, `${label}: every chapter-3 ending must be classified`).toBe(0);
}

/**
 * Pins the exact aggregate outcome of the default smoke batch.
 *
 * These simulations are fully deterministic for a seed range, so the recorded numbers are a
 * behavioural fingerprint of the campaign rules: any change to card, event, or turn logic
 * moves them. Only checked when the batch runs at its default seed and size — the heavy
 * env-var mode skips it. When a rules or balance change is intentional, re-record the
 * numbers from the failure output.
 */
export function expectSmokeBaseline(
  options: BatchOptions,
  smokeRuns: number,
  actual: unknown,
  baseline: unknown,
): void {
  if (options.verbose || options.seedStart !== 1 || options.runCount !== smokeRuns) return;
  expect(
    actual,
    "deterministic smoke-batch outcome changed — a rules/balance change moved these numbers; "
      + "re-record the baseline if that was intended",
  ).toEqual(baseline);
}

/** Average end turns must be real numbers inside the level's playable window. */
export function expectPlausibleEndTurn(
  value: number | null,
  turnLimit: number,
  label: string,
): void {
  if (value === null) return;
  expect(Number.isFinite(value), `${label} must be a finite turn number`).toBe(true);
  expect(value, `${label} must be at least turn 1`).toBeGreaterThanOrEqual(1);
  expect(value, `${label} must stay within the level turn limit`).toBeLessThanOrEqual(turnLimit);
}

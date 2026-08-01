import { describe, expect, it } from "vitest";
import { getCardTemplate } from "../../../data/cards";
import type { CardTemplateId } from "../../types/card";
import { simulateFirstMandateEndState } from "../../../logic/aiStrategySimulation";
import { expectSmokeBaseline, report, resolveBatchOptions } from "../sim/batchTestHarness";

import "../../../test/setupLevels";

type AuditSummary = {
  seed: number;
  outcome: string;
  inflationByTemplate: Record<CardTemplateId, number>;
  /** Instances that accrued inflation but whose template has no `inflation` tag. */
  untaggedInflated: CardTemplateId[];
  /** Inflation values that went negative (stacks may only accumulate). */
  negativeDeltas: number;
};

const TARGET_TEMPLATES = ["development", "reform", "ceremony"] as const;

const SMOKE_RUNS = 150;

/** Recorded outcome of seeds 1..150; see `expectSmokeBaseline`. */
const SMOKE_BASELINE = { totalInflationStacks: 693, victories: 75 };

function runAudit(seedStart: number, runCount: number): AuditSummary[] {
  const runs: AuditSummary[] = [];
  for (let i = 0; i < runCount; i++) {
    const seed = seedStart + i;
    const endState = simulateFirstMandateEndState(seed);
    const inflationByTemplate: Record<CardTemplateId, number> = {} as Record<CardTemplateId, number>;
    const untaggedInflated: CardTemplateId[] = [];
    let negativeDeltas = 0;
    for (const id of Object.keys(endState.cardsById)) {
      const inst = endState.cardsById[id];
      if (!inst) continue;
      const raw = endState.cardInflationById[id] ?? 0;
      if (raw < 0) negativeDeltas++;
      const delta = Math.max(0, raw);
      inflationByTemplate[inst.templateId] = (inflationByTemplate[inst.templateId] ?? 0) + delta;
      if (delta > 0 && !getCardTemplate(inst.templateId).tags.includes("inflation")) {
        untaggedInflated.push(inst.templateId);
      }
    }
    runs.push({ seed, outcome: endState.outcome, inflationByTemplate, untaggedInflated, negativeDeltas });
  }
  return runs;
}

describe("firstMandate inflation audit", () => {
  it("only charges inflation to inflation-tagged cards, and never un-charges it", () => {
    const { seedStart, runCount, verbose } = resolveBatchOptions({
      longEnv: "AI_INFLATION_AUDIT",
      seedEnv: "AI_INFLATION_SEED_START",
      runsEnv: "AI_INFLATION_RUNS",
      smokeRuns: SMOKE_RUNS,
      longRuns: 1_000,
    });
    const runs = runAudit(seedStart, runCount);
    const victories = runs.filter((run) => run.outcome === "victory");

    expect(runs).toHaveLength(runCount);

    // Chapter 1 activates inflation past a pressure threshold, and only for tagged cards.
    const offenders = [...new Set(runs.flatMap((run) => run.untaggedInflated))];
    expect(offenders, "inflation may only accrue on cards tagged `inflation`").toEqual([]);
    expect(
      runs.reduce((total, run) => total + run.negativeDeltas, 0),
      "inflation stacks may never go negative",
    ).toBe(0);

    // Some run in the batch must actually reach the threshold, or this audit proves nothing.
    const totalInflation = runs.reduce(
      (total, run) => total + Object.values(run.inflationByTemplate).reduce((s, n) => s + n, 0),
      0,
    );
    expect(totalInflation, "the batch must exercise chapter-1 inflation at least once").toBeGreaterThan(0);
    expect(victories.length, "the batch must contain winnable runs to audit carryover from").toBeGreaterThan(0);

    expectSmokeBaseline(
      { seedStart, runCount, verbose },
      SMOKE_RUNS,
      { totalInflationStacks: totalInflation, victories: victories.length },
      SMOKE_BASELINE,
    );

    report(verbose, "=== firstMandate victory-only inflation audit ===");
    report(verbose, `seeds: ${seedStart}..${seedStart + runCount - 1}`);
    report(verbose, `runs: ${runs.length}`);
    report(verbose, `victories: ${victories.length}`);
    for (const templateId of TARGET_TEMPLATES) {
      const deltas = victories.map((run) => run.inflationByTemplate[templateId] ?? 0);
      const total = deltas.reduce((sum, n) => sum + n, 0);
      const avg = victories.length > 0 ? total / victories.length : 0;
      const max = deltas.length > 0 ? Math.max(...deltas) : 0;
      const buckets = new Map<number, number>();
      for (const delta of deltas) {
        buckets.set(delta, (buckets.get(delta) ?? 0) + 1);
      }
      report(verbose, `${templateId}: avg=${avg.toFixed(3)}, max=${max}, total=${total}`);
      report(verbose, `distribution(${templateId}):`);
      for (const [delta, count] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
        report(verbose, `  +${delta}: ${count}`);
      }
    }
  }, 180_000);
});

import { describe, expect, it } from "vitest";
import { simulateFirstMandateEndState } from "./aiStrategySimulation";
import type { CardTemplateId } from "../types/card";

type AuditSummary = {
  seed: number;
  outcome: string;
  inflationByTemplate: Record<CardTemplateId, number>;
};

const TARGET_TEMPLATES = ["development", "reform", "ceremony"] as const;

function runAudit(seedStart: number, runCount: number): AuditSummary[] {
  const runs: AuditSummary[] = [];
  for (let i = 0; i < runCount; i++) {
    const seed = seedStart + i;
    const endState = simulateFirstMandateEndState(seed);
    const inflationByTemplate: Record<CardTemplateId, number> = {} as Record<CardTemplateId, number>;
    for (const id of Object.keys(endState.cardsById)) {
      const inst = endState.cardsById[id];
      if (!inst) continue;
      const delta = Math.max(0, endState.cardInflationById[id] ?? 0);
      inflationByTemplate[inst.templateId] = (inflationByTemplate[inst.templateId] ?? 0) + delta;
    }
    runs.push({
      seed,
      outcome: endState.outcome,
      inflationByTemplate,
    });
  }
  return runs;
}

describe("firstMandate inflation audit", () => {
  const enabled = process.env.AI_INFLATION_AUDIT === "1";
  const auditIt = enabled ? it : it.skip;

  auditIt("runs configurable batch and prints carryover inflation stats", () => {
    const seedStart = Number(process.env.AI_INFLATION_SEED_START ?? 1);
    const runCount = Number(process.env.AI_INFLATION_RUNS ?? 1000);
    const runs = runAudit(seedStart, runCount);
    const victories = runs.filter((run) => run.outcome === "victory");

    console.log("=== firstMandate victory-only inflation audit ===");
    console.log(`seeds: ${seedStart}..${seedStart + runCount - 1}`);
    console.log(`runs: ${runs.length}`);
    console.log(`victories: ${victories.length}`);
    for (const templateId of TARGET_TEMPLATES) {
      const deltas = victories.map((run) => run.inflationByTemplate[templateId] ?? 0);
      const total = deltas.reduce((sum, n) => sum + n, 0);
      const avg = victories.length > 0 ? total / victories.length : 0;
      const max = deltas.length > 0 ? Math.max(...deltas) : 0;
      const buckets = new Map<number, number>();
      for (const delta of deltas) {
        buckets.set(delta, (buckets.get(delta) ?? 0) + 1);
      }
      console.log(`${templateId}: avg=${avg.toFixed(3)}, max=${max}, total=${total}`);
      console.log(`distribution(${templateId}):`);
      for (const [delta, count] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
        console.log(`  +${delta}: ${count}`);
      }
    }

    expect(runs).toHaveLength(runCount);
  });
});

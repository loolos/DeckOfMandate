/**
 * Runs a larger first→second→third campaign batch under Vitest (Vite resolves level glob).
 * Usage: node scripts/runFirstToThirdCampaignBatch.mjs [seedStart] [runCount]
 * Defaults: seedStart=1, runCount=5000
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const seedStart = Number(process.argv[2]) || 1;
const runCount = Number(process.argv[3]) || 5_000;

if (!Number.isInteger(seedStart) || seedStart < 1) {
  console.error("seedStart must be a positive integer");
  process.exit(1);
}
if (!Number.isInteger(runCount) || runCount < 1) {
  console.error("runCount must be a positive integer");
  process.exit(1);
}

const vitestCliPath = fileURLToPath(new URL("../node_modules/vitest/vitest.mjs", import.meta.url));
const testFile = "src/levels/sunking/sim/thirdCampaignLongBatch.test.ts";

const run = spawnSync(
  process.execPath,
  [vitestCliPath, "run", testFile, "--testNamePattern", "large batch"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      VITEST_LONG_THIRD: "1",
      VITEST_THIRD_BATCH_SEED: String(seedStart),
      VITEST_THIRD_BATCH_RUNS: String(runCount),
    },
  },
);

process.exit(run.status ?? 1);

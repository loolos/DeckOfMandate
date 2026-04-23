/**
 * Prints win rates for Sun King chapters 1–3 as loaded from the main menu (standalone),
 * using the same seed range for each chapter.
 * Usage: node scripts/runMenuStandaloneChaptersBatch.mjs [seedStart] [runCount]
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
const testFile = "src/levels/sunking/sim/menuStandaloneChaptersLongBatch.test.ts";

const run = spawnSync(
  process.execPath,
  [vitestCliPath, "run", testFile, "--testNamePattern", "menu standalone"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      VITEST_MENU_STANDALONE_LONG: "1",
      VITEST_MENU_BATCH_SEED: String(seedStart),
      VITEST_MENU_BATCH_RUNS: String(runCount),
    },
  },
);

process.exit(run.status ?? 1);

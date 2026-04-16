import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const passthroughArgs = process.argv.slice(2);
const filteredArgs = passthroughArgs.filter((arg) => arg !== "--runInBand");

if (passthroughArgs.length !== filteredArgs.length) {
  console.warn("[test] Ignoring Jest-only flag --runInBand; forwarding remaining args to Vitest.");
}

const vitestCliPath = fileURLToPath(new URL("../node_modules/vitest/vitest.mjs", import.meta.url));
const run = spawnSync(process.execPath, [vitestCliPath, "run", ...filteredArgs], {
  stdio: "inherit",
});

process.exit(run.status ?? 1);

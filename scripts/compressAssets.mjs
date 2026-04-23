/**
 * Image compression for shipped game assets (sharp).
 *
 * Usage:
 *   node scripts/compressAssets.mjs           # run all jobs
 *   node scripts/compressAssets.mjs menu     # start menu from src/img/main.png
 *   node scripts/compressAssets.mjs sunking  # Sun King backdrop only
 *   node scripts/compressAssets.mjs --help
 *
 * Requires: npm install (sharp is a devDependency).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const HELP = `compressAssets — shrink images for the repo

  node scripts/compressAssets.mjs [command]

Commands:
  (default)   Run all compression jobs
  menu        Start menu backdrop (~200 KiB WebP from main.png)
  sunking     Sun King full-screen backdrop (~200 KiB WebP)
  --help      Show this message

Start menu:
  Source:  src/img/main.png  (or Main.png on case-insensitive FS)
  Output:  src/img/maintheme.webp

Sun King:
  Source:  src/levels/sunking/assets/sk.png | sk.png.png
  Output:  src/levels/sunking/assets/sunkingCampaignBackdrop.webp
`;

/** @param {import("sharp").Sharp} pipeline */
async function encodeWebp(pipeline, quality) {
  return pipeline.clone().webp({ quality, effort: 5 }).toBuffer();
}

/**
 * Resize + binary-search WebP quality to stay under byteCeiling.
 * @param {{ input: string; output: string; byteCeiling: number; maxWidths: number[] }} opts
 */
async function compressToWebpUnderCeiling(opts) {
  const { input, output, byteCeiling, maxWidths } = opts;
  const outDir = path.dirname(output);
  fs.mkdirSync(outDir, { recursive: true });

  const meta = await sharp(input).metadata();
  const srcW = meta.width ?? 0;
  const srcH = meta.height ?? 0;

  for (const maxW of maxWidths) {
    let pipeline = sharp(input).rotate();
    if (srcW > maxW || srcH > maxW) {
      pipeline = pipeline.resize({
        width: srcW >= srcH ? maxW : undefined,
        height: srcH > srcW ? maxW : undefined,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    let best = null;
    for (let q = 88; q >= 28; q -= 2) {
      const buf = await encodeWebp(pipeline, q);
      if (buf.length <= byteCeiling) {
        best = { buf, q };
        break;
      }
    }
    if (best) {
      fs.writeFileSync(output, best.buf);
      console.log(
        `[compress] ${path.relative(root, input)} → ${path.relative(root, output)} — ${best.buf.length} bytes (~${(best.buf.length / 1024).toFixed(1)} KiB), maxSide≤${maxW}, webp q ${best.q}`,
      );
      return;
    }
  }

  const last = await sharp(input)
    .rotate()
    .resize({ width: 960, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 28, effort: 5 })
    .toBuffer();
  fs.writeFileSync(output, last);
  console.warn(
    `[compress] Could not reach target with quality ≥28; wrote fallback (${last.length} bytes) → ${path.relative(root, output)}`,
  );
}

function resolveFirstExisting(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * @param {{ strict?: boolean }} opts strict: exit false on missing source; else skip with log
 */
async function jobMainMenuBackdrop(opts = {}) {
  const { strict = false } = opts;
  const imgDir = path.join(root, "src", "img");
  const candidates = [path.join(imgDir, "main.png"), path.join(imgDir, "Main.png")];
  const output = path.join(imgDir, "maintheme.webp");
  const targetBytes = 200 * 1024;
  const byteCeiling = Math.floor(targetBytes * 1.02);

  const input = resolveFirstExisting(candidates);
  if (!input) {
    const msg = `[compress:menu] Missing source (skipped). Tried:\n${candidates.join("\n")}`;
    if (strict) {
      console.error(msg);
      return false;
    }
    console.log(msg);
    return true;
  }

  await compressToWebpUnderCeiling({
    input,
    output,
    byteCeiling,
    maxWidths: [1920, 1680, 1440, 1280, 1120],
  });
  return true;
}

/**
 * @param {{ strict?: boolean }} opts strict: exit false on missing source; else skip with log
 */
async function jobSunkingBackdrop(opts = {}) {
  const { strict = false } = opts;
  const outDir = path.join(root, "src", "levels", "sunking", "assets");
  const candidates = [path.join(outDir, "sk.png"), path.join(outDir, "sk.png.png")];
  const output = path.join(outDir, "sunkingCampaignBackdrop.webp");
  const targetBytes = 200 * 1024;
  const byteCeiling = Math.floor(targetBytes * 1.02);

  const input = resolveFirstExisting(candidates);
  if (!input) {
    const msg = `[compress:sunking] Missing source (skipped). Tried:\n${candidates.join("\n")}`;
    if (strict) {
      console.error(msg);
      return false;
    }
    console.log(msg);
    return true;
  }

  await compressToWebpUnderCeiling({
    input,
    output,
    byteCeiling,
    maxWidths: [1920, 1680, 1440, 1280, 1120],
  });
  return true;
}

const JOBS = {
  menu: { name: "Start menu backdrop", run: jobMainMenuBackdrop },
  sunking: { name: "Sun King backdrop", run: jobSunkingBackdrop },
};

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    return;
  }

  const command = argv[0]?.toLowerCase();
  const runAll = !command || command === "all";

  /** @type {string[]} */
  const keys = runAll ? Object.keys(JOBS) : [command];

  for (const key of keys) {
    const job = JOBS[key];
    if (!job) {
      console.error(`Unknown command: ${command}\n\n${HELP}`);
      process.exit(1);
    }
    const ok = await job.run({ strict: !runAll });
    if (ok === false) process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

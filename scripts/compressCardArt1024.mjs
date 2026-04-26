/**
 * Compress card art to WebP under a byte ceiling.
 * Always resizes to fixed width 1024px and keeps source aspect ratio.
 *
 * Usage:
 *   node scripts/compressCardArt1024.mjs path/to/source.png
 *   node scripts/compressCardArt1024.mjs a.png b.jpg -o out/card.webp
 *   node scripts/compressCardArt1024.mjs src/levels/sunking/assets/card-crackdown-preview.png --max-kb 100
 *
 * Flags:
 *   -o, --output <file>   Single input only: write here (default: <basename>.card1024.webp next to source)
 *   --max-kb <n>          Max output size in KiB (default: 100)
 *   -h, --help
 *
 * Requires: sharp (devDependency).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const FIXED_WIDTH = 1024;

const HELP = `compressCardArt1024 — WebP compression for card art (fixed width 1024, ≤100 KiB)

  node scripts/compressCardArt1024.mjs <image> [more-images...] [options]

Options:
  -o, --output <file>     Output path (only when exactly one input file)
  --max-kb <n>            Default: 100
  -h, --help

Examples:
  node scripts/compressCardArt1024.mjs src/levels/sunking/assets/card-crackdown-preview.png
  node scripts/compressCardArt1024.mjs art/raw.png -o public/cards/crackdown.webp
  node scripts/compressCardArt1024.mjs art/Funding.png art/Reform.png --max-kb 100
`;

/**
 * @param {import("sharp").Sharp} pipeline
 * @param {number} quality
 */
async function toWebpBuffer(pipeline, quality) {
  return pipeline
    .clone()
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
}

/**
 * @param {{ pipeline: import("sharp").Sharp; maxBytes: number; minQuality?: number }} opts
 * @returns {Promise<{ buf: Buffer; quality: number } | null>}
 */
async function encodeWebpUnderCeiling(opts) {
  const { pipeline, maxBytes, minQuality = 18 } = opts;
  let best = /** @type {{ buf: Buffer; quality: number } | null} */ (null);
  for (let q = 90; q >= minQuality; q -= 2) {
    const buf = await toWebpBuffer(pipeline, q);
    if (buf.length <= maxBytes) {
      return { buf, quality: q };
    }
    if (!best || buf.length < best.buf.length) best = { buf, quality: q };
  }
  const last = await toWebpBuffer(pipeline, minQuality);
  if (last.length <= maxBytes) return { buf: last, quality: minQuality };
  return best;
}

/**
 * @param {{ input: string; output: string; maxBytes: number }} opts
 */
async function compressOne(opts) {
  const { input, output, maxBytes } = opts;
  const base = sharp(input).rotate();
  const pipeline = base.resize({
    width: FIXED_WIDTH,
    fit: "inside",
    withoutEnlargement: false,
  });

  let result = await encodeWebpUnderCeiling({ pipeline, maxBytes });
  if (!result || result.buf.length > maxBytes) {
    const grey = pipeline.clone().grayscale();
    result = await encodeWebpUnderCeiling({ pipeline: grey, maxBytes, minQuality: 14 });
  }

  if (!result) {
    throw new Error(`Failed to encode ${input}`);
  }

  if (result.buf.length > maxBytes) {
    throw new Error(
      `Still ${result.buf.length} bytes (> ${maxBytes}) at webp q=${result.quality} for ${input}. Try a flatter / less noisy source, lower resolution source before upscale, or raise --max-kb.`,
    );
  }

  const outDir = path.dirname(output);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(output, result.buf);
  const relIn = path.relative(root, input);
  const relOut = path.relative(root, output);
  const outMeta = await sharp(result.buf).metadata();
  console.log(
    `[card1024] ${relIn} → ${relOut}  ${outMeta.width}×${outMeta.height}  ${result.buf.length} B (~${(result.buf.length / 1024).toFixed(1)} KiB)  webp q=${result.quality}  width=${FIXED_WIDTH}`,
  );
}

function parseArgs(argv) {
  /** @type {string[]} */
  const files = [];
  let output = null;
  let maxKb = 100;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") return { help: true };
    if (a === "-o" || a === "--output") {
      output = argv[++i];
      if (!output) throw new Error(`${a} requires a path`);
      continue;
    }
    if (a === "--max-kb") {
      maxKb = Number(argv[++i]);
      if (!Number.isFinite(maxKb) || maxKb <= 0) throw new Error(`Invalid --max-kb`);
      continue;
    }
    if (a.startsWith("-")) throw new Error(`Unknown option: ${a}`);
    files.push(path.isAbsolute(a) ? a : path.join(process.cwd(), a));
  }

  return { files, output, maxKb, help: false };
}

async function main() {
  const raw = process.argv.slice(2);
  let parsed;
  try {
    parsed = parseArgs(raw);
  } catch (e) {
    console.error(String(e));
    console.error("\n" + HELP);
    process.exit(1);
    return;
  }

  if (parsed.help || raw.length === 0) {
    console.log(HELP);
    if (raw.length === 0) process.exit(1);
    return;
  }

  const { files, output, maxKb } = parsed;
  if (files.length === 0) {
    console.error(HELP);
    process.exit(1);
    return;
  }

  if (output && files.length !== 1) {
    console.error("-o / --output requires exactly one input file.");
    process.exit(1);
    return;
  }

  const maxBytes = Math.floor(maxKb * 1024);

  for (const input of files) {
    if (!fs.existsSync(input)) {
      console.error(`Missing file: ${input}`);
      process.exit(1);
    }
    const ext = path.extname(input);
    const baseName = path.basename(input, ext);
    const out =
      output ??
      path.join(path.dirname(input), `${baseName}.card1024.webp`);

    await compressOne({ input, output: out, maxBytes });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

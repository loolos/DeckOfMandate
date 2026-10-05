/**
 * Cut the light caption strip ("文件 s14.png" ...) that ChatGPT sometimes adds under a generated
 * image, then optionally center-crop to a target aspect ratio.
 *
 * Usage:
 *   node scripts/trimArtBar.mjs art-inbox/s14.png -o out.png --ratio 4:3
 *   node scripts/trimArtBar.mjs art-inbox/*.png --in-place --ratio 4:3
 *   node scripts/trimArtBar.mjs art-inbox/*.png --dry-run
 *
 * Flags:
 *   -o, --output <file>   Single input only
 *   --in-place            Overwrite each input
 *   --ratio <w:h>         Center-crop after trimming (4:3 for cards / events / stories, 16:9 for backdrops)
 *   --dry-run             Only report what would be cut
 *
 * A strip row is one where ≥ 85% of the pixels are light (all channels ≥ 215); the few dark
 * pixels of the caption text are tolerated. Requires: sharp (devDependency).
 */
import path from "node:path";
import sharp from "sharp";

const MIN_BAR = 8; // px; shorter runs are treated as part of the picture
const MAX_BAR_FRACTION = 0.25; // never cut more than a quarter of the image

function isStripRow(data, width, channels, y) {
  let light = 0;
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels;
    if (Math.min(data[i], data[i + 1], data[i + 2]) >= 215) light++;
  }
  return light / width >= 0.85;
}

/** Height of the light strip at the bottom of the raw pixels (0 if none). */
export function findBottomBar(data, width, height, channels) {
  const limit = Math.floor(height * MAX_BAR_FRACTION);
  let h = 0;
  while (h < limit && isStripRow(data, width, channels, height - 1 - h)) h++;
  return h >= MIN_BAR ? h : 0;
}

function parseRatio(s) {
  const m = /^(\d+):(\d+)$/.exec(s ?? "");
  if (!m) throw new Error(`bad --ratio: ${s}`);
  return Number(m[1]) / Number(m[2]);
}

async function trimOne(file, opts) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bar = findBottomBar(data, info.width, info.height, info.channels);
  let width = info.width;
  let height = info.height - bar;
  let left = 0;
  let top = 0;
  if (opts.ratio) {
    const target = opts.ratio;
    if (width / height > target) {
      const w = Math.round(height * target);
      left = Math.floor((width - w) / 2);
      width = w;
    } else {
      const h = Math.round(width / target);
      top = Math.floor((height - h) / 2);
      height = h;
    }
  }
  console.log(`${path.basename(file)}: ${info.width}x${info.height}, bar ${bar}px → ${width}x${height}`);
  if (opts.dryRun || (!opts.output && !opts.inPlace)) return;
  if (bar === 0 && !opts.ratio) return;
  const out = await sharp(file).extract({ left, top, width, height }).png().toBuffer();
  await sharp(out).toFile(opts.output ?? file);
}

if (path.resolve(process.argv[1] ?? "") === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const files = [];
  const opts = { inPlace: false, dryRun: false, output: undefined, ratio: undefined };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-o" || a === "--output") opts.output = args[++i];
    else if (a === "--in-place") opts.inPlace = true;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "-h" || a === "--help") {
      console.log("usage: node scripts/trimArtBar.mjs <image...> [-o out | --in-place] [--ratio 4:3] [--dry-run]");
      process.exit(0);
    }
    else if (a === "--ratio") opts.ratio = parseRatio(args[++i]);
    else files.push(a);
  }
  if (!files.length || (opts.output && files.length > 1)) {
    console.error("usage: node scripts/trimArtBar.mjs <image...> [-o out | --in-place] [--ratio 4:3] [--dry-run]");
    process.exit(1);
  }
  for (const f of files) await trimOne(f, opts);
}

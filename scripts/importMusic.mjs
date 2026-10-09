/**
 * Move AI-generated background music from music-inbox/ (M01.mp3 ...) into
 * src/levels/zhenhuan/assets/music/<mood>.<ext>, then rewrite the status table in
 * music-inbox/README.md so it shows what has been uploaded and what is in the game.
 *
 * Usage:
 *   node scripts/importMusic.mjs            import everything in the inbox, refresh the table
 *   node scripts/importMusic.mjs --status   only refresh the table
 *
 * .wav is converted to 128 kbps mp3 (needs ffmpeg); durations are read with ffprobe when present.
 * Spec: src/levels/zhenhuan/docs/music-prompts.md (30–40 s, ≤ 1 MB).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const INBOX = "music-inbox";
const MUSIC_DIR = "src/levels/zhenhuan/assets/music";
const README = path.join(INBOX, "README.md");
const EXTS = ["mp3", "m4a", "ogg", "wav"];
const TRACKS = [
  ["M01", "calm", "日常欢快"],
  ["M02", "tension", "紧张"],
  ["M03", "sorrow", "哀婉"],
  ["M04", "climax", "高潮"],
  ["M05", "tender", "柔情"],
];
const MAX_BYTES = 1024 * 1024;
const MIN_SECONDS = 30;
const MAX_SECONDS = 45;

function has(cmd) {
  try {
    execFileSync(cmd, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function duration(file) {
  if (!has("ffprobe")) return null;
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString();
  const n = Number(out.trim());
  return Number.isFinite(n) ? n : null;
}

/** `M1.MP3` / `m01.mp3` / `M01 (1).mp3` → ["M01", "mp3"]; anything else → null. */
function parseInboxName(name) {
  const m = /^m0*(\d+)\b.*\.([a-z0-9]+)$/i.exec(name);
  if (!m) return null;
  return [`M${m[1].padStart(2, "0")}`, m[2].toLowerCase()];
}

function importAll() {
  const notes = [];
  for (const name of fs.readdirSync(INBOX).sort()) {
    if (name === "README.md" || name.startsWith(".")) continue;
    const parsed = parseInboxName(name);
    const track = parsed && TRACKS.find(([id]) => id === parsed[0]);
    if (!track || !EXTS.includes(parsed[1])) {
      notes.push(`跳过 ${name}：文件名应为 M01–M05，格式 ${EXTS.join(" / ")}`);
      continue;
    }
    const src = path.join(INBOX, name);
    const ext = parsed[1] === "wav" ? "mp3" : parsed[1];
    const dest = path.join(MUSIC_DIR, `${track[1]}.${ext}`);
    if (parsed[1] === "wav" && !has("ffmpeg")) {
      notes.push(`跳过 ${name}：wav 需要 ffmpeg 转成 mp3`);
      continue;
    }
    for (const e of EXTS) {
      const old = path.join(MUSIC_DIR, `${track[1]}.${e}`);
      if (fs.existsSync(old)) fs.rmSync(old);
    }
    if (parsed[1] === "wav") {
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-codec:a", "libmp3lame", "-b:a", "128k", dest]);
      fs.rmSync(src);
    } else {
      fs.renameSync(src, dest);
    }
    notes.push(`${name} → ${dest}`);
  }
  return notes;
}

function statusTable() {
  const inbox = fs.readdirSync(INBOX).filter((n) => n !== "README.md" && !n.startsWith("."));
  const rows = TRACKS.map(([id, mood, label]) => {
    const file = EXTS.map((e) => `${mood}.${e}`).find((f) => fs.existsSync(path.join(MUSIC_DIR, f)));
    const waiting = inbox.filter((n) => parseInboxName(n)?.[0] === id);
    if (!file) return `| ${id} | ${label} | ${waiting.length ? "📥 已上传，待处理" : "⬜ 未上传"} | — | — | — |`;
    const full = path.join(MUSIC_DIR, file);
    const kb = Math.round(fs.statSync(full).size / 1024);
    const sec = duration(full);
    const warn = [];
    if (kb * 1024 > MAX_BYTES) warn.push("超过 1 MB");
    if (sec != null && (sec < MIN_SECONDS || sec > MAX_SECONDS)) warn.push(`时长不在 ${MIN_SECONDS}–${MAX_SECONDS} 秒`);
    const state = waiting.length ? "📥 已入库，收件箱有新版本待处理" : "✅ 已入库";
    return `| ${id} | ${label} | ${state} | \`${file}\` | ${kb} KB${sec != null ? ` · ${sec.toFixed(1)} 秒` : ""} | ${warn.join("；") || "—"} |`;
  });
  const unknown = inbox.filter((n) => !parseInboxName(n));
  return [
    "| 编号 | 情绪 | 状态 | 游戏文件 | 大小 · 时长 | 问题 |",
    "|---|---|---|---|---|---|",
    ...rows,
    ...(unknown.length ? ["", `无法识别的文件：${unknown.map((n) => `\`${n}\``).join("、")}`] : []),
  ].join("\n");
}

function writeStatus() {
  const text = fs.readFileSync(README, "utf8");
  const start = "<!-- status:start -->";
  const end = "<!-- status:end -->";
  const next = text.replace(new RegExp(`${start}[\\s\\S]*${end}`), `${start}\n${statusTable()}\n${end}`);
  fs.writeFileSync(README, next);
}

if (!process.argv.includes("--status")) for (const line of importAll()) console.log(line);
writeStatus();
console.log(statusTable());

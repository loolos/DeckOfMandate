/**
 * Fill sunking shell FR from EN where FR had no explicit override (old fr.core used ...messagesEnCore).
 * Run after splitShellLocales.mjs if needed: node scripts/alignShellFrToEn.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseObjectBody(body) {
  /** @type {Record<string, string>} */
  const out = {};
  let i = 0;
  const len = body.length;
  const skipWs = () => {
    while (i < len && /\s/.test(body[i])) i++;
  };
  const readString = () => {
    if (body[i] !== '"') throw new Error(`Expected opening quote at offset ${i}`);
    i++;
    let s = "";
    while (i < len) {
      const c = body[i++];
      if (c === "\\") {
        if (i >= len) throw new Error("Unclosed escape");
        s += c + body[i++];
        continue;
      }
      if (c === '"') return s;
      s += c;
    }
    throw new Error("Unclosed string");
  };
  while (true) {
    skipWs();
    if (i >= len) break;
    const key = readString();
    skipWs();
    if (body[i] !== ":") throw new Error(`Expected : after key ${key} at ${i}`);
    i++;
    skipWs();
    const val = readString();
    out[key] = val;
    skipWs();
    if (i < len && body[i] === ",") i++;
  }
  return out;
}

function loadShellExport(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const m = text.match(/=\s*\{([\s\S]*)\}\s*as const/);
  if (!m) throw new Error(`No shell object in ${filePath}`);
  return parseObjectBody(m[1]);
}

const enPath = path.join(root, "src/levels/sunking/locales/shellContent.en.ts");
const frPath = path.join(root, "src/levels/sunking/locales/shellContent.fr.ts");
const en = loadShellExport(enPath);
const fr = loadShellExport(frPath);
const merged = { ...en, ...fr };
fs.writeFileSync(
  frPath,
  `/** Texte shell partagé campagne Roi-Soleil (extrait de fr.core.ts). Clés sans override FR explicite reprennent l’anglais (comme l’ancien spread). Fusionné via sunkingLocales. */\nexport const sunkingShellContentFr = ${JSON.stringify(merged, null, 2)} as const;\n`,
  "utf8",
);
console.log("FR shell keys:", Object.keys(merged).length, "(en was", Object.keys(en).length + ")");

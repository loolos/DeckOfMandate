/**
 * Split Sun King narrative keys from *.core.ts into sunking shellContent.*.ts
 * Run: node scripts/splitShellLocales.mjs
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

function extractCoreObject(filePath, exportRe) {
  const text = fs.readFileSync(filePath, "utf8");
  const m = text.match(exportRe);
  if (!m) throw new Error(`No object in ${filePath}`);
  return parseObjectBody(m[1]);
}

function shouldMoveKey(k) {
  if (k === "app.subtitle") return true;
  if (k.startsWith("ui.solve")) return true;
  if (k.startsWith("ui.scriptedAttack")) return true;
  if (k.startsWith("ui.nantes")) return true;
  if (k.startsWith("ui.localWar")) return true;
  if (k.startsWith("ui.successionCrisis")) return true;
  if (k === "ui.utrechtEndWar") return true;
  if (k.startsWith("ui.dualFrontCrisis")) return true;
  if (k.startsWith("ui.louisXivLegacy")) return true;
  if (k === "ui.successionTrack") return true;
  if (k.startsWith("ui.successionStatus")) return true;
  if (k.startsWith("ui.opponentEvent")) return true;
  if (k === "ui.opponentHabsburg" || k === "ui.opponentStrength") return true;
  if (k === "log.crackdownPickPrompt") return true;
  if (k.startsWith("menu.continueChapter")) return true;
  if (k.startsWith("menu.refit.")) return true;
  if (k.startsWith("outcome.")) return true;
  if (
    k === "log.effect.opponentHandDiscardNow" ||
    k === "log.effect.modSuccessionTrack" ||
    k === "log.effect.modOpponentStrength"
  )
    return true;
  if (k.startsWith("log.opponentHabsburg")) return true;
  if (k.startsWith("log.eventFundSolved")) return true;
  if (k.startsWith("log.eventCrackdownSolved")) return true;
  if (k.startsWith("log.eventYearEndPenalty")) return true;
  if (k === "log.eventPowerVacuumScheduled") return true;
  if (k === "log.crackdownCancelled") return true;
  if (k.startsWith("log.eventScriptedAttack")) return true;
  if (k.startsWith("log.eventLocalWarChoice")) return true;
  if (k.startsWith("log.eventDualFrontCrisis")) return true;
  if (k.startsWith("log.eventLouisXivLegacy")) return true;
  if (k.startsWith("log.eventSuccessionCrisisChoice")) return true;
  if (k.startsWith("log.eventLocalizedSuccessionWar")) return true;
  if (k.startsWith("log.eventNineYearsWarCampaign")) return true;
  if (k.startsWith("log.eventNineYearsWarFiscalBurden")) return true;
  if (k.startsWith("log.huguenotResurgence")) return true;
  if (k === "log.europeAlertProgressShift") return true;
  if (k.startsWith("log.info.chapter2")) return true;
  if (k.startsWith("log.info.chapter3")) return true;
  if (k.startsWith("log.info.antiFrench")) return true;
  if (k.startsWith("log.info.cardTag")) return true;
  if (k.startsWith("log.info.cardUse")) return true;
  if (k.startsWith("log.info.cardDraw")) return true;
  if (k.startsWith("log.info.nantesPolicy")) return true;
  if (k === "help.short") return true;
  return false;
}

function extractFrOverrides(frPath) {
  const text = fs.readFileSync(frPath, "utf8");
  const m = text.match(/export const messagesFrCore[^=]*= \{([\s\S]*)\};/);
  if (!m) throw new Error("fr.core parse");
  let inner = m[1];
  inner = inner.replace(/\.\.\.\s*messagesEnCore\s*,?\s*/g, "");
  return parseObjectBody(inner);
}

const enFull = extractCoreObject(
  path.join(root, "src/locales/en.core.ts"),
  /export const messagesEnCore = \{([\s\S]*)\} as const;/,
);
const zhFull = extractCoreObject(
  path.join(root, "src/locales/zh.core.ts"),
  /export const messagesZhCore = \{([\s\S]*)\} as const;/,
);
const frFull = extractFrOverrides(path.join(root, "src/locales/fr.core.ts"));

function split(full) {
  const move = {};
  const keep = {};
  for (const [k, v] of Object.entries(full)) {
    if (shouldMoveKey(k)) move[k] = v;
    else keep[k] = v;
  }
  return { move, keep };
}

const en = split(enFull);
const zh = split(zhFull);
const frSplit = split(frFull);

const shellEnPath = path.join(root, "src/levels/sunking/locales/shellContent.en.ts");
const shellZhPath = path.join(root, "src/levels/sunking/locales/shellContent.zh.ts");
const shellFrPath = path.join(root, "src/levels/sunking/locales/shellContent.fr.ts");

fs.writeFileSync(
  shellEnPath,
  `/** Sun King shared shell copy (was in locales/en.core.ts). Merged via sunkingLocales. */\nexport const sunkingShellContentEn = ${JSON.stringify(en.move, null, 2)} as const;\n`,
  "utf8",
);
fs.writeFileSync(
  shellZhPath,
  `/** 太阳王战役共享壳层文案（原 zh.core.ts 片段）。经 sunkingLocales 合并注入。 */\nexport const sunkingShellContentZh = ${JSON.stringify(zh.move, null, 2)} as const;\n`,
  "utf8",
);
/** FR `fr.core` often inherited EN via `...messagesEnCore`; fill missing moved keys from EN. */
const frMoveFilled = { ...en.move };
Object.assign(frMoveFilled, frSplit.move);
fs.writeFileSync(
  shellFrPath,
  `/** Texte shell partagé campagne Roi-Soleil (extrait de fr.core.ts). Fusionné via sunkingLocales. */\nexport const sunkingShellContentFr = ${JSON.stringify(frMoveFilled, null, 2)} as const;\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(root, "src/locales/en.core.ts"),
  `/** Framework shell — campaign narrative merged from src/levels/load (per-campaign locales). */\nexport const messagesEnCore = ${JSON.stringify(en.keep, null, 2)} as const;\n`,
  "utf8",
);

fs.writeFileSync(
  path.join(root, "src/locales/zh.core.ts"),
  `/** 框架壳层 — 战役叙事由各战役目录 locales 经 src/levels/load 合并注入。 */\nexport const messagesZhCore = ${JSON.stringify(zh.keep, null, 2)} as const;\n`,
  "utf8",
);

const frOverrideLines = [];
for (const k of Object.keys(frSplit.keep).sort()) {
  if (frSplit.keep[k] === en.keep[k]) continue;
  frOverrideLines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(frSplit.keep[k])},`);
}
const frOut =
  `import { messagesEnCore } from "./en.core";

/**
 * Bundle français principal.
 * Fallback anglais pour les clés non encore localisées.
 */
export const messagesFrCore: Record<keyof typeof messagesEnCore, string> = {
  ...messagesEnCore,
${frOverrideLines.join("\n")}
};
`;
fs.writeFileSync(path.join(root, "src/locales/fr.core.ts"), frOut, "utf8");

console.log("Moved keys:", Object.keys(en.move).length);
console.log("En keep:", Object.keys(en.keep).length);

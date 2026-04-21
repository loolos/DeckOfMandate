import { sunkingCoreGameContentEn } from "./locales/coreGameContent.en";
import { sunkingCoreGameContentFr } from "./locales/coreGameContent.fr";
import { sunkingCoreGameContentZh } from "./locales/coreGameContent.zh";
import { messagesEnFirstMandate } from "./locales/firstMandate.en";
import { messagesFrFirstMandate } from "./locales/firstMandate.fr";
import { messagesZhFirstMandate } from "./locales/firstMandate.zh";
import { messagesEnSecondMandate } from "./locales/secondMandate.en";
import { messagesFrSecondMandate } from "./locales/secondMandate.fr";
import { messagesZhSecondMandate } from "./locales/secondMandate.zh";
import { messagesEnThirdMandate } from "./locales/thirdMandate.en";
import { messagesFrThirdMandate } from "./locales/thirdMandate.fr";
import { messagesZhThirdMandate } from "./locales/thirdMandate.zh";

/** Keys moved out of `*.core.ts` so campaign copy lives with the Sun King pack. */
const sunkingExtraEn: Record<string, string> = {
  "menu.levelBrief.firstMandate":
    "1661–1675, early Sun King era: centralize royal power and expand while pressure is still manageable.",
  "menu.levelBrief.secondMandate":
    "1676–1700, mid Sun King era: hold hegemony as religious conflict and coalition pressure intensify.",
  "menu.levelBrief.thirdMandate":
    "1701–1720, War of the Spanish Succession era: coalition war, dynastic rivalry, and contested legitimacy (placeholder goals).",
  "ui.targets.firstMandate":
    "Level goals — within {limit} turns (each turn advances one calendar year): Treasury ≥ {tT}, Power ≥ {tP}, Legitimacy ≥ {tL}.",
  "ui.targets.secondMandate":
    "Level goals — within {limit} turns (each ≈ one calendar year): calendar year ≥ 1696; Europe Alert cleared; no “Contain Huguenot Remnants” status (harsh crackdown path must be fully wound down); Legitimacy ≥ 6.",
  "ui.targets.thirdMandate":
    "Level goals — within {limit} turns (each turn advances one calendar year): Treasury ≥ {tT}, Power ≥ {tP}, Legitimacy ≥ {tL}. Chapter 2’s Edict of Nantes choice injects 4 Religious Tension cards (tolerance) or 4 Reservation of Conscience cards (crackdown); menu start defaults to crackdown.",
  "banner.turn.sunKingAnnual": "Turn {turn} / {limit} — each step is one calendar year",
  "levelTime.sunKing.oneTurnOneYear": "Timeline: one full turn corresponds to one year on the scenario calendar.",
  "log.info.firstMandateInflationActivated":
    "[Turn {turn}] As Colbert-style reforms and Versailles court politics scale up together, the stronger the royal machine gets, the more expensive it is to keep running. Chapter 1 inflation is now active: from now on, only cards with the “Inflation” tag gain extra cost when they cycle from discard back into deck.",
};

const sunkingExtraFr: Record<string, string> = {
  "menu.levelBrief.firstMandate":
    "1661–1675, début de l’ère du Roi-Soleil : consolidez l’autorité royale et l’expansion sous pression maîtrisable.",
  "menu.levelBrief.secondMandate":
    "1676–1700, milieu de l’ère du Roi-Soleil : maintenez l’hégémonie sous forte pression religieuse et géopolitique.",
  "menu.levelBrief.thirdMandate":
    "1701–1720, ère de la guerre de Succession d’Espagne : coalition, rivalité dynastique et légitimité contestée (objectifs de placeholder).",
  "ui.targets.firstMandate":
    "Objectifs du niveau — en {limit} tours (chaque tour avance d’une année calendaire) : Trésor ≥ {tT}, Pouvoir ≥ {tP}, Légitimité ≥ {tL}.",
  "ui.targets.secondMandate":
    "Objectifs du niveau — en {limit} tours (chaque tour ≈ une année calendaire) : année calendaire ≥ 1696 ; Alerte Europe levée ; pas de statut « Contenir les restes huguenots » (la voie de la répression forte doit être entièrement close) ; Légitimité ≥ 6.",
  "ui.targets.thirdMandate":
    "Objectifs du niveau — en {limit} tours (chaque tour avance d’une année calendaire) : Trésor ≥ {tT}, Pouvoir ≥ {tP}, Légitimité ≥ {tL}. Le choix sur l’édit de Nantes au Chapitre 2 injecte 4 cartes Tension religieuse (tolérance) ou 4 Réserve de conscience (répression) ; démarrer depuis le menu applique par défaut la répression.",
  "banner.turn.sunKingAnnual": "Tour {turn} / {limit} — chaque pas vaut une année calendaire",
  "levelTime.sunKing.oneTurnOneYear": "Échelle : un tour complet correspond à une année sur le calendrier du scénario.",
  "log.info.firstMandateInflationActivated":
    "[Tour {turn}] Les réformes à la Colbert et la cour de Versailles grossissent ensemble : plus la machine royale est forte, plus elle coûte à faire tourner. L’inflation du Chapitre 1 est active : désormais, seules les cartes avec le tag « Inflation » prennent un coût supplémentaire quand elles reviennent du défausse vers le deck.",
};

const sunkingExtraZh: Record<string, string> = {
  "menu.levelBrief.firstMandate": "1661–1675（太阳王前期）：巩固王权、稳步扩张，在可控压力下建立统治基础。",
  "menu.levelBrief.secondMandate": "1676–1700（太阳王中期）：在宗教与对外高压并行下，维持霸权并避免国家失序。",
  "menu.levelBrief.thirdMandate":
    "1701–1720（西班牙王位继承战争时期）：联盟战争、王朝竞争与合法性拉锯（占位目标）。",
  "ui.targets.firstMandate":
    "关卡目标 — {limit} 回合内（每回合推进 1 个历法年）：财政 ≥ {tT}，权力 ≥ {tP}，合法性 ≥ {tL}。",
  "ui.targets.secondMandate":
    "关卡目标 — {limit} 回合内（每回合约 1 个历法年）：历法年份 ≥ 1696；「欧洲警觉」已结束；不存在「遏制胡格诺-剩余势力」状态（严厉镇压分支须完全收尾）；合法性 ≥ 6。",
  "ui.targets.thirdMandate":
    "关卡目标 — {limit} 回合内（每回合推进 1 个历法年）：财政 ≥ {tT}，权力 ≥ {tP}，合法性 ≥ {tL}。第二关《南特敕令》分支在开局向牌库注入 4 张「宗教冲突」（宽容）或 4 张「良心保留」（镇压）；主菜单直开默认镇压。",
  "banner.turn.sunKingAnnual": "第 {turn} / {limit} 回合 — 每步对应 1 个历法年",
  "levelTime.sunKing.oneTurnOneYear": "时间尺度：一个完整回合对应剧本时间线上的一个历法年。",
  "log.info.firstMandateInflationActivated":
    "[第 {turn} 年] 科尔贝尔改革与凡尔赛宫廷同步扩张，王权机器越强，维持它的行政与仪式成本也越高。已触发第一关「卡牌通胀」：此后仅带「通胀」标签的牌，在从弃牌堆洗回抽牌堆时才会叠加费用。",
};

export const sunkingMessagesEn = {
  ...messagesEnFirstMandate,
  ...messagesEnSecondMandate,
  ...messagesEnThirdMandate,
  ...sunkingCoreGameContentEn,
  ...sunkingExtraEn,
} as const;

export const sunkingMessagesFr = {
  ...messagesFrFirstMandate,
  ...messagesFrSecondMandate,
  ...messagesFrThirdMandate,
  ...sunkingCoreGameContentFr,
  ...sunkingExtraFr,
} as const;

export const sunkingMessagesZh = {
  ...messagesZhFirstMandate,
  ...messagesZhSecondMandate,
  ...messagesZhThirdMandate,
  ...sunkingCoreGameContentZh,
  ...sunkingExtraZh,
} as const;

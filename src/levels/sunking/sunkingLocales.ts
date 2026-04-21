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
    "1701–1720 — War of the Spanish Succession: wills and battle lines from Madrid to the North Sea, where Bourbon and Habsburg claims reshaped Europe.",
  "ui.targets.firstMandate":
    "Level goals — within {limit} turns (each turn advances one calendar year): Treasury ≥ {tT}, Power ≥ {tP}, Legitimacy ≥ {tL}.",
  "ui.targets.secondMandate":
    "Level goals — within {limit} turns (each ≈ one calendar year): calendar year ≥ 1696; Europe Alert cleared; no “Contain Huguenot Remnants” status (harsh crackdown path must be fully wound down); Legitimacy ≥ 6.",
  "ui.targets.thirdMandate":
    "Chapter 3 — within {limit} years: push the succession track to +10 for an immediate win, or survive to 1720 for a tiered settlement. You lose immediately at −10 on the track, or if Power or Legitimacy reaches 0 (checked at once whenever the score moves). The Habsburg side starts with 2 cards in hand and draws 2 at each year-end before playing. Edict of Nantes branch still injects 4 Religious Tension or 4 Reservation of Conscience; menu start defaults to crackdown. Standalone chapter-3 removes Royal levy / Royal intervention from the opening pool, and Reform / Tax Rebalance / Grain Relief / Versailles Ceremony all open at cost 4 from inflation.",
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
    "1701–1720 — guerre de Succession d’Espagne : testaments et fronts, de Madrid à la Manche, où s’affrontent prétentions bourboniennes et habsbourgeoises.",
  "ui.targets.firstMandate":
    "Objectifs du niveau — en {limit} tours (chaque tour avance d’une année calendaire) : Trésor ≥ {tT}, Pouvoir ≥ {tP}, Légitimité ≥ {tL}.",
  "ui.targets.secondMandate":
    "Objectifs du niveau — en {limit} tours (chaque tour ≈ une année calendaire) : année calendaire ≥ 1696 ; Alerte Europe levée ; pas de statut « Contenir les restes huguenots » (la voie de la répression forte doit être entièrement close) ; Légitimité ≥ 6.",
  "ui.targets.thirdMandate":
    "Chapitre 3 — en {limit} ans : menez la piste de succession à +10 pour une victoire immédiate, ou tenez jusqu’en 1720 pour un règlement par paliers. Défaite immédiate à −10 sur la piste, ou si le Pouvoir ou la Légitimité atteint 0 (contrôle dès que les scores bougent). Le camp habsbourgeois commence avec 2 cartes en main et pioche 2 en fin d’année avant de jouer. La branche sur l’édit de Nantes injecte encore 4 Tension religieuse ou 4 Réserve de conscience ; démarrage menu = répression par défaut. Un chapitre 3 lancé depuis le menu retire la Levée royale / l’Intervention royale du pool d’ouverture ; Réforme / Rééquilibrage fiscal / Secours grainier / Cérémonie de Versailles commencent tous à un coût de 4 via l’inflation.",
  "banner.turn.sunKingAnnual": "Tour {turn} / {limit} — chaque pas vaut une année calendaire",
  "levelTime.sunKing.oneTurnOneYear": "Échelle : un tour complet correspond à une année sur le calendrier du scénario.",
  "log.info.firstMandateInflationActivated":
    "[Tour {turn}] Les réformes à la Colbert et la cour de Versailles grossissent ensemble : plus la machine royale est forte, plus elle coûte à faire tourner. L’inflation du Chapitre 1 est active : désormais, seules les cartes avec le tag « Inflation » prennent un coût supplémentaire quand elles reviennent du défausse vers le deck.",
};

const sunkingExtraZh: Record<string, string> = {
  "menu.levelBrief.firstMandate": "1661–1675（太阳王前期）：巩固王权、稳步扩张，在可控压力下建立统治基础。",
  "menu.levelBrief.secondMandate": "1676–1700（太阳王中期）：在宗教与对外高压并行下，维持霸权并避免国家失序。",
  "menu.levelBrief.thirdMandate":
    "1701–1720（西班牙王位继承战争时期）：马德里的遗嘱与北海风向之间，波旁与哈布斯堡在欧洲地图上重划继业边界。",
  "ui.targets.firstMandate":
    "关卡目标 — {limit} 回合内（每回合推进 1 个历法年）：财政 ≥ {tT}，权力 ≥ {tP}，合法性 ≥ {tL}。",
  "ui.targets.secondMandate":
    "关卡目标 — {limit} 回合内（每回合约 1 个历法年）：历法年份 ≥ 1696；「欧洲警觉」已结束；不存在「遏制胡格诺-剩余势力」状态（严厉镇压分支须完全收尾）；合法性 ≥ 6。",
  "ui.targets.thirdMandate":
    "第三关 — {limit} 年内：王位争夺进度到 +10 立即胜利，或坚持到 1720 年按档位结算。进度 −10，或权力/合法性任一归零，均立即失败（数值变动时即刻判定）。哈布斯堡阵营起手持有 2 张牌，每年年末对手阶段先摸 2 张再出牌。《南特敕令》分支仍注入 4 张「宗教冲突」或 4 张「良心保留」；主菜单直开默认镇压。主菜单直接进入第三关时，开局牌池移除「王室征收」「王室干预」；「行政整编」「税制重估」「粮食赈济」「凡尔赛庆典」开局都因通胀按 4 费起算。",
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

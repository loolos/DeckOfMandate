import { sunkingCoreGameContentEn } from "./locales/coreGameContent.en";
import { sunkingCoreGameContentFr } from "./locales/coreGameContent.fr";
import { sunkingCoreGameContentZh } from "./locales/coreGameContent.zh";
import { sunkingShellContentEn } from "./locales/shellContent.en";
import { sunkingShellContentFr } from "./locales/shellContent.fr";
import { sunkingShellContentZh } from "./locales/shellContent.zh";
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
    "Chapter 3 — within {limit} years: reach +10 on the succession track for an immediate win, or survive to 1720 for a tiered settlement. You lose immediately at −10 on the track, or if Power or Legitimacy reaches 0 (checked whenever those values change).",
  "banner.turn.sunKingAnnual": "Turn {turn} / {limit} — each step is one calendar year",
  "levelTime.sunKing.oneTurnOneYear": "Timeline: one full turn corresponds to one year on the scenario calendar.",
  "log.info.firstMandateInflationActivated":
    "[Turn {turn}] As Colbert-style reforms and Versailles court politics scale up together, the stronger the royal machine gets, the more expensive it is to keep running. Chapter 1 inflation is now active: from now on, only cards with the “Inflation” tag gain extra cost when they cycle from discard back into deck.",
  "ui.resolved": "Resolved",
  "ui.harmful": "Harmful",
  "ui.opportunity": "Opportunity",
  "ui.historical": "Historical",
  "ui.continued": "Continued",
  "ui.continuedTurns": "Continued {n}",
  "ui.remainingTurns": "Remaining {n}",
  "log.info.eventTag.harmful":
    "[Turn {turn}] Tag note “Harmful”: if unresolved at year end, this event applies penalties.",
  "log.info.eventTag.opportunity":
    "[Turn {turn}] Tag note “Opportunity”: this is an optional upside event and usually has no penalty if ignored.",
  "log.info.eventTag.historical":
    "[Turn {turn}] Tag note “Historical”: this event is based on real history and has no extra gameplay effect by itself.",
  "log.info.eventTag.continued":
    "[Turn {turn}] Tag note “Continued”: if unresolved, this event remains into the next year and repeats its negative effects.",
  "log.info.eventTag.resolved":
    "[Turn {turn}] Tag note “Resolved”: this event has already been handled this year and will not apply year-end penalties.",
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
    "Chapitre 3 — en {limit} ans : atteignez +10 sur la piste de succession pour une victoire immédiate, ou tenez jusqu’en 1720 pour un règlement par paliers. Défaite immédiate à −10 sur la piste, ou si le Pouvoir ou la Légitimité atteint 0 (vérifié dès que ces valeurs changent).",
  "banner.turn.sunKingAnnual": "Tour {turn} / {limit} — chaque pas vaut une année calendaire",
  "levelTime.sunKing.oneTurnOneYear": "Échelle : un tour complet correspond à une année sur le calendrier du scénario.",
  "log.info.firstMandateInflationActivated":
    "[Tour {turn}] Les réformes à la Colbert et la cour de Versailles grossissent ensemble : plus la machine royale est forte, plus elle coûte à faire tourner. L’inflation du Chapitre 1 est active : désormais, seules les cartes avec le tag « Inflation » prennent un coût supplémentaire quand elles reviennent du défausse vers le deck.",
  "ui.resolved": "Résolu",
  "ui.harmful": "Néfaste",
  "ui.opportunity": "Opportunité",
  "ui.historical": "Historique",
  "ui.continued": "Continu",
  "ui.continuedTurns": "Continu {n}",
  "ui.remainingTurns": "Restant {n}",
  "log.info.eventTag.harmful":
    "[Tour {turn}] Note de tag « Néfaste » : s’il n’est pas résolu en fin d’année, cet événement applique des pénalités.",
  "log.info.eventTag.opportunity":
    "[Tour {turn}] Note de tag « Opportunité » : c’est un événement d’opportunité, généralement sans pénalité s’il est ignoré.",
  "log.info.eventTag.historical":
    "[Tour {turn}] Note de tag « Historique » : cet événement renvoie à un fait historique réel et ce tag n'ajoute aucun effet de jeu.",
  "log.info.eventTag.continued":
    "[Tour {turn}] Note de tag « Continu » : non résolu, cet événement reste l’année suivante et répète ses effets négatifs.",
  "log.info.eventTag.resolved":
    "[Tour {turn}] Note de tag « Résolu » : cet événement a déjà été traité cette année et n’appliquera plus de pénalités de fin d’année.",
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
    "第三关 — {limit} 年内：王位争夺进度到 +10 立即胜利，或坚持到 1720 年按档位结算。进度 −10，或权力/合法性任一归零，均立即失败（数值变动时即刻判定）。",
  "banner.turn.sunKingAnnual": "第 {turn} / {limit} 回合 — 每步对应 1 个历法年",
  "levelTime.sunKing.oneTurnOneYear": "时间尺度：一个完整回合对应剧本时间线上的一个历法年。",
  "log.info.firstMandateInflationActivated":
    "[第 {turn} 年] 科尔贝尔改革与凡尔赛宫廷同步扩张，王权机器越强，维持它的行政与仪式成本也越高。已触发第一关「卡牌通胀」：此后仅带「通胀」标签的牌，在从弃牌堆洗回抽牌堆时才会叠加费用。",
  "ui.resolved": "已处理",
  "ui.harmful": "有害",
  "ui.opportunity": "机遇",
  "ui.historical": "史实",
  "ui.continued": "持续",
  "ui.continuedTurns": "持续{n}",
  "ui.remainingTurns": "剩余{n}",
  "log.info.eventTag.harmful": "[第 {turn} 年] 标签说明「有害」：若年末仍未解决，会触发惩罚。",
  "log.info.eventTag.opportunity": "[第 {turn} 年] 标签说明「机遇」：属于可投资机会，不处理通常不会受到惩罚。",
  "log.info.eventTag.historical":
    "[第 {turn} 年] 标签说明「史实」：该事件基于历史真实发生，用于叙事说明，本标签本身不附带额外机制效果。",
  "log.info.eventTag.continued":
    "[第 {turn} 年] 标签说明「持续」：事件若未解决会保留到下一年，并重复结算其负面后果。",
  "log.info.eventTag.resolved": "[第 {turn} 年] 标签说明「已解决」：该事件已在本年被处理，不会在年末触发惩罚。",
};

export const sunkingMessagesEn = {
  ...messagesEnFirstMandate,
  ...messagesEnSecondMandate,
  ...messagesEnThirdMandate,
  ...sunkingCoreGameContentEn,
  ...sunkingShellContentEn,
  ...sunkingExtraEn,
} as const;

export const sunkingMessagesFr = {
  ...messagesFrFirstMandate,
  ...messagesFrSecondMandate,
  ...messagesFrThirdMandate,
  ...sunkingCoreGameContentFr,
  ...sunkingShellContentFr,
  ...sunkingExtraFr,
} as const;

export const sunkingMessagesZh = {
  ...messagesZhFirstMandate,
  ...messagesZhSecondMandate,
  ...messagesZhThirdMandate,
  ...sunkingCoreGameContentZh,
  ...sunkingShellContentZh,
  ...sunkingExtraZh,
} as const;

/**
 * 中文文案：关卡 `secondMandate`（荣光之重，法兰西 1676–1700）。
 */
export const messagesZhSecondMandate = {
  "level.gloryUnderStrain.name": "荣光之重",
  "level.gloryUnderStrain.introTitle": "法兰西，1676 — 在高压下维持霸权",
  "level.gloryUnderStrain.introBody":
    "扩张时代已经结束，支付代价的时代开始了。到 1676 年，路易十四面对的是一个更强大却也更脆弱的王权：凡尔赛仍在展示荣耀，但宫廷礼制、战争动员与财政汲取都需要持续投入。每一分新增权威都伴随维护成本，每一次行政迟滞都可能扩大为地方消极执行。\n\n宗教问题让这种压力更尖锐。1598 年，亨利四世在法国宗教战争后颁布《南特敕令》：它并未实现宗教平等，却建立了一种可治理的妥协——在保留天主教国教地位的同时，给予胡格诺派有限礼拜权、民事保障与若干安全空间。这种安排以“可共存”取代“绝对胜利”，帮助王国暂时走出长期内战。\n\n而在本章，这一妥协开始瓦解。强推宗教一致性，短期可能强化王权，却也可能长期侵蚀信任、激化抵抗并消耗国家能力；选择宽容，能降低眼前暴力，却会反复遭遇政治反弹。对外，列强会把国内裂痕视为战略机会；对内，税负与粮价压力会把教义争端迅速转化为社会不稳。你的任务不是回到旧平衡，而是在危险转型中继续统治：守住合法性，管理“信仰与服从”的冲突，并让法国在随后的大战中不至于失序。",
  "level.gloryUnderStrain.ending.victory":
    "王权挺过了高压年代。法国仍具威势，国家在外交围堵与战争财政下没有陷入合法性崩解。",
  "level.gloryUnderStrain.ending.victoryWarDevolutionExtra":
    "欧洲仍记得你早年的强势进攻。邻国从未完全放下戒心，但你在战后修复中守住了王权中枢。",
  "level.gloryUnderStrain.ending.defeat":
    "霸权成本最终压垮了体制。财政失衡、社会不安与外交围堵超出了宫廷控制，王冠变得虚弱而孤立。",
  "status.europeAlert.name": "欧洲警觉",
  "status.europeAlert.hint":
    "对外冲突压力持续（战争疲劳权重 +1）；且每回合固定少抽 {n} 张。欧洲警觉下每年还可能额外出现边境驻军/海贸受阻。",
  "status.europeAlert.history":
    "法国早期扩张刺激了欧陆列强的长期戒备，外交与军事压力转入制度化阶段。",
  "event.nymwegenSettlement.name": "奈梅亨和约",
  "event.nymwegenSettlement.desc":
    "这是必须尽快收束的长期事件：支付 6 经费可达成和约（权力 -3、合法性 -2），并结束「欧洲警觉」；若不处理，每年权力 -1。",
  "event.revocationNantes.name": "撤销南特敕令",
  "event.revocationNantes.desc":
    "1598 年亨利四世颁布《南特敕令》，原为在宗教战争后恢复秩序：在保持天主教国教地位的前提下，给予法国新教徒（胡格诺派）有限礼拜自由、民事权利与若干安全保障。如今王权决定撤销它。此事件带「持续」标签：若不处理，将每回合额外少抽 2 张，且事件会保留在列表中。处理时二选一：\n- 宗教宽容：立刻合法性 -1，并获得永久状态「宗教宽容」（每回合 30% 概率触发「宗教矛盾」事件，需支付 2 经费，否则合法性 -1）。\n- 严厉镇压：无立刻数值变化，但获得状态「遏制胡格诺-剩余势力 3」，并向抽牌堆加入 3 张临时牌「镇压胡格诺派」（费用 3）。每打出 1 张，「剩余势力」-1；降到 0 时，移除该状态并清除抽牌堆/弃牌堆/手牌中的全部「镇压胡格诺派」。注意：该状态存在时，第二关无法胜利。",
  "event.leagueOfAugsburg.name": "奥格斯堡同盟形成",
  "event.leagueOfAugsburg.desc":
    "欧洲列强开始系统围堵法国。支付 2 经费（或王室干预）压制升级，否则将承受「权力流失」3 回合。",
  "event.nineYearsWar.name": "九年战争",
  "event.nineYearsWar.desc":
    "大战压力全面到来。支付 2 经费（或王室干预）稳住局势；若未处理，将持续侵蚀财政与抽牌能力。",
  "event.ryswickPeace.name": "里斯维克和约",
  "event.ryswickPeace.desc":
    "和约提供秩序重建窗口。投入 1 经费可获得合法性 +1。",
  "event.versaillesExpenditure.name": "凡尔赛开支",
  "event.versaillesExpenditure.desc":
    "宫廷排场再次超预算。支付 3 经费（或王室干预），否则财政 -2。",
  "event.nobleResentment.name": "贵族怨气",
  "event.nobleResentment.desc":
    "宫廷与地方精英抵触情绪升高。支付 2 经费或王室干预，否则获得「权力流失」3 回合。",
  "event.provincialNoncompliance.name": "地方消极执行",
  "event.provincialNoncompliance.desc":
    "地方官僚拖延政令。支付 2 经费，否则下一年抽牌 -2，之后两年每年抽牌 -1。",
  "event.risingGrainPrices.name": "粮价上涨",
  "event.risingGrainPrices.desc":
    "粮价推动社会不稳。支付 3 经费（或王室干预），否则合法性 -2。",
  "event.taxResistance.name": "税收反弹",
  "event.taxResistance.desc":
    "地方与社群抵制新税。支付 2 经费或王室干预，否则财政 -1 且合法性 -1。",
  "event.frontierGarrisons.name": "边境驻军消耗",
  "event.frontierGarrisons.desc": "边防驻军持续消耗国库。支付 3 经费，否则财政 -1 且下一回合抽牌受罚。",
  "event.tradeDisruption.name": "海贸受阻",
  "event.tradeDisruption.desc":
    "航路受扰影响施政节奏。支付 1 经费，否则下一回合抽牌修正 -2。",
  "event.courtScandal.name": "宫廷丑闻",
  "event.courtScandal.desc":
    "宫廷派系丑闻动摇威望。支付 3 经费处理；若不处理，立刻合法性 -1，且下一回合无法打出王室牌。",
  "event.militaryPrestige.name": "军事声望",
  "event.militaryPrestige.desc": "可将军功转化为统治威望。投入 2 经费，合法性 +1。",
  "event.commercialExpansion.name": "商业扩张",
  "event.commercialExpansion.desc": "商人请求政策支持。投入 2 经费，财政 +1。",
  "event.talentedAdministrator.name": "能臣举荐",
  "event.talentedAdministrator.desc": "可提拔能干官员。投入 2 经费，权力 +1。",
  "event.warWeariness.name": "战争疲劳",
  "event.warWeariness.desc":
    "长期战争削弱民意与服从。支付 3 经费或王室干预，否则合法性 -1 并获得「权力流失」2 回合。",
  "event.grainReliefCrisis.name": "赈济迟滞",
  "event.grainReliefCrisis.desc":
    "粮食调配迟滞导致社会压力升级。支付 2 经费可稳住局势并获得合法性 +2；若放任将损失合法性 -2。",
  "event.expansionRemembered.name": "扩张余震",
  "event.expansionRemembered.desc":
    "早年的强势扩张余波未散。支付 2 经费可压制风险并向抽牌堆加入 2 张「财政负担」；若不处理，则加入 3 张「财政负担」。",
  "event.cautiousCrown.name": "谨慎王权",
  "event.cautiousCrown.desc": "此前克制路线带来有限缓冲。支付 2 经费处理；若不处理，每年权力 -1。",
  "card.grainRelief.name": "粮食赈济",
  "card.grainRelief.background": "赈济与粮食调拨先压住民怨，再争取改革时间。",
  "card.grainRelief.desc":
    "获得「赈济调度」与「赈济信任」各 1 回合（下回合：抽牌 +1，合法性 +1）。若存在未解决的「粮价上涨」，则立即解决其中一个。",
  "card.taxRebalance.name": "税制重估",
  "card.taxRebalance.background": "重配税负与征收口径，让财政在高压期保持流动。",
  "card.taxRebalance.desc": "财政 +1，并获得「抽牌受限」2 回合（每回合抽牌 -1）。",
  "card.diplomaticCongress.name": "外交会议",
  "card.diplomaticCongress.background": "通过使节与会议换取喘息，减轻短期外部压力。",
  "card.diplomaticCongress.desc": "权力 +1。向手牌加入 1 张额外的「外交干预」。",
  "card.diplomaticIntervention.name": "外交干预",
  "card.diplomaticIntervention.background": "通过使节施压与条约操作解决危机，而非直接动用王室强制力。",
  "card.diplomaticIntervention.desc":
    "额外牌。解决一个有害事件（不能选殖民贸易机遇），且不带王室标签；「剩余」用尽后无额外惩罚，仅会从牌库循环中移除。不会出现在过关整编中，本关结束后会移除。",
} as const;

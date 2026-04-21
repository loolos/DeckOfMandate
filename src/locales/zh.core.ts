/** Shared UI / engine strings — campaign copy lives in `src/levels/sunking/locales`. */
export const messagesZhCore = {
  "app.title": "Deck of Mandate",
  "app.subtitle": "旭日",
  "menu.introContinue": "进入游戏",
  "banner.turn": "第 {turn} / {limit} 年",
  "phase.action": "行动阶段：打出卡牌、处理事件，然后结束本回合。",
  "phase.retention": "回合末：选择要保留的手牌（至多等于合法性）。",
  "phase.gameOver": "本局结束。",
  "resource.treasuryStat": "财政（能力）",
  "resource.treasuryStat.hint": "每回合经费",
  "resource.funding": "剩余经费",
  "resource.funding.hint": "用于打牌与事件处理",
  "resource.power": "权力",
  "resource.power.hint":
    "抽牌按权力阈值阶梯增长（1/2/4/7/11/16…）：达到下一阈值才多 1 次；低于当前阈值就少 1 次。展开资源详情可看完整规则与示例。",
  "resource.legitimacy": "合法性",
  "resource.legitimacy.hint": "回合末保留上限；归零即败",
  "ui.resources": "资源",
  "ui.resourceMobileExpand": "点击查看完整名称与说明。",
  "ui.resourceMobileCollapse": "点击收起资源详情",
  "ui.endTurn": "结束本回合",
  "ui.solve": "处理（{cost} 经费）",
  "ui.solveCrackdown": "以干预解决",
  "ui.solveFundingOrCrackdown": "支付 {cost} 或使用干预",
  "ui.scriptedAttack": "进攻（{cost}）",
  "ui.nantesTolerance": "宗教宽容",
  "ui.nantesCrackdown": "严厉镇压",
  "ui.localWarAttack": "进攻（{cost}）",
  "ui.localWarAppease": "绥靖",
  "ui.successionCrisisPay": "支付 3 经费 — 王位争夺进度 +1",
  "ui.successionCrisisDecline": "不支付 — 起始进度 −1",
  "ui.utrechtEndWar": "结束王位继承战争（和约）",
  "ui.utrechtWait": "暂不结束（谈判窗口剩余 {n} 回合）",
  "ui.dualFrontCrisis.concede": "暂时让步 — 王位争夺进度 −3；对手费用上限 +1",
  "ui.dualFrontCrisis.escalate": "扩大战争 — 王位争夺进度 +1，合法性 −1，向抽牌堆加入 3 张财政负担；对手费用上限 +1",
  "ui.successionTrack": "王位争夺进度",
  "ui.successionStatus.title": "西班牙王位继承之争",
  "ui.successionStatus.detail":
    "哈布斯堡（奥地利系）与法国所支持的波旁支系，在欧洲诸条约与战场之间争夺西班牙遗产与海权；这是大同盟战争的焦点之一。",
  "ui.opponentEvent.currentHand": "对手当前手牌",
  "ui.opponentEvent.handEmpty": "当前尚无对手手牌。",
  "ui.opponentEvent.lastPlay": "上一回合对手出牌（上年年末）",
  "ui.opponentEvent.lastPlayNone": "上一对手阶段未出牌。",
  "ui.opponentEvent.effectSummary": "盘面效果：{fx}",
  "ui.opponentEvent.strengthTag": "实力{n}",
  "ui.opponentEvent.lastPlayCombinedFx": "上年末合计：{fx}",
  "ui.opponentEvent.lastPlayCardBlurb": "{history} 局内效果：{fx}",
  "ui.opponentHabsburg": "对手：哈布斯堡",
  "ui.opponentStrength": "对手费用上限",
  "ui.resolved": "已处理",
  "ui.harmful": "有害",
  "ui.opportunity": "机遇",
  "ui.historical": "史实",
  "ui.continued": "持续",
  "ui.continuedTurns": "持续{n}",
  "ui.remainingTurns": "剩余{n}",
  "ui.deck": "牌库",
  "ui.discard": "弃牌堆",
  "ui.quickFrame.cost": "费用",
  "ui.quickFrame.onPlay": "打出时",
  "ui.quickFrame.pay": "解决需",
  "ui.quickFrame.ifSolved": "解决后",
  "ui.quickFrame.yearEnd": "年末仍占位",
  "ui.hand": "手牌",
  "ui.events": "事件",
  "ui.eventsResizeHint": "拖动右下角可调整事件区域高度。",
  "ui.mobileLogTapHint": "小屏操作：事件、状态与手牌单击可展开详情；略缩图或详细图里双击手牌即可出牌。",
  "ui.playThisCard": "打出这张牌",
  "log.crackdownPickPrompt":
    "[第 {turn} 年] 选择要用「干预」解决的有害事件（不能选殖民贸易机遇）。",
  "ui.cancel": "取消",
  "ui.confirmRetention": "确认保留",
  "ui.newGame": "新开一局",
  "menu.title": "主菜单",
  "menu.resumeSave": "读取本地存档",
  "menu.levelLabel": "关卡",
  "menu.seedLabel": "随机种子（可选）",
  "menu.seedPlaceholder": "留空则随机",
  "menu.seedHint": "留空会随机生成种子；相同种子可复现开局牌库与事件。",
  "menu.seedInvalid": "请输入有效的有限数字。",
  "menu.startConfigured": "开始",
  "menu.runCodeLoad": "从对局码加载",
  "menu.continueChapter2": "进入第二关",
  "menu.continueChapter3": "进入第三关",
  "menu.refit.title": "过章卡池整编",
  "menu.refit.subtitle": "将第一关牌组重构为第二关高压治理牌组。",
  "menu.refit.adjustable": "继承基础牌",
  "menu.refit.newCards": "第二关新增牌",
  "menu.refit.mode.standalone": "模式：主菜单直开第二关",
  "menu.refit.mode.continuity": "模式：承接第一关胜利",
  "menu.refit.resources": "开局资源 — 财政 {treasury}，权力 {power}，合法性 {legitimacy}",
  "menu.refit.startYear": "第二关起始年份：{year}",
  "menu.refit.europeAlertOn":
    "欧洲警觉：开启（进度条开局为 3/10。进度 1-5 时，额外事件概率=进度×20%；进度 6-10 时至少触发 1 个，且第二个事件概率=(进度-5)×20%）。",
  "menu.refit.europeAlertOnLow":
    "欧洲警觉：开启（承接局且第一关未发动遗产战争军事进攻：进度条从 1/10 起；年度额外事件判定规则同上）。",
  "menu.refit.europeAlertOff": "欧洲警觉：关闭（标准第二关压力）。",
  "menu.refit.totalCards": "总牌数：{current}（需在 {min}–{max}）",
  "menu.refit.totalCards.simple": "删牌后总牌数：{current}",
  "menu.refit.newCardTotal": "新增牌数量：{current} / {max}",
  "menu.refit.baseAdjustTotal": "继承基础牌调整量：{current} / {max}",
  "menu.refit.continuityRule": "整编规则：只能删除第一关旧卡 0–{max} 张；第二关三张新卡固定各 +1。",
  "menu.refit.mobileDoubleToggleHint": "小屏模式可双击卡牌行，直接切换“删除这张牌”。",
  "menu.refit.removeToggle": "删除这张牌",
  "menu.refit.invalid": "当前构筑未满足规则。",
  "menu.refit.start": "开始第二关",
  "menu.refit.titleChapter3": "第三关牌库整编",
  "menu.refit.mode.continuityChapter3": "模式：承接第二关胜利",
  "menu.refit.mode.standaloneChapter3": "模式：主菜单直开第三关",
  "menu.refit.continuityRuleChapter3":
    "仅从第二关幸存牌库中移除 0–{max} 张牌。六张新牌加入起手手牌（见下）；其余牌洗入抽牌堆。",
  "menu.refit.newCardsChapter3": "新牌（起手手牌）",
  "menu.refit.startChapter3": "开始第三关",
  "menu.refit.back": "返回",
  "menu.refit.reset": "重置到进入整编时",
  "menu.refit.presetHistorical": "历史推荐构筑",
  "menu.refit.presetWar": "战争压力构筑",
  "menu.tutorialOnLevelEntry": "进入关卡时显示界面教程",
  "menu.tutorialOnLevelEntryHint": "以英文分步高亮说明目标、资源、事件与手牌；默认关闭。",
  "ui.statuses": "持续状态",
  "ui.statuses.empty": "暂无持续效果。",
  "ui.statusTurnsRemaining": "剩余 {n} 回合",
  "ui.statusPermanent": "永久",
  "ui.statusHuguenotRemaining": "剩余势力 {n}",
  "ui.statusDetail.drawAttemptsDelta": "每回合抽牌次数修正 {delta}。",
  "ui.statusDetail.retentionCapacityDelta": "回合末可保留手牌上限修正 {delta}。",
  "ui.statusDetail.beginYearResourceDelta": "回合开始时：{resource} {delta}。",
  "ui.statusDetail.blockCardTag": "带有“{tag}”标签的手牌不可打出。",
  "ui.actionLog": "行动记录",
  "ui.actionLog.empty": "本局尚无效果记录。",
  "ui.targets": "关卡目标 — {limit} 回合内：财政 {tT}，权力 {tP}，合法性 {tL}",
  "ui.levelLocaleFallback":
    "该关卡尚未完全提供当前界面语言版本；关卡专属文案可能回退显示为英语。",
  "ui.language": "语言",
  "ui.lang.en": "English",
  "ui.lang.zh": "中文",
  "ui.lang.fr": "Français",
  "outcome.victory": "胜利 — 政权稳固。",
  "outcome.defeatLegitimacy": "失败 — 核心资源崩溃。",
  "outcome.defeatTime": "失败 — 时限内未达成目标。",
  "outcome.defeatSuccession": "失败 — 王位争夺进度跌至谷底。",
  "outcome.successionTier.bourbon": "结局：波旁系在最终账面上占优。",
  "outcome.successionTier.compromise": "结局：双方主张形成妥协均势。",
  "outcome.successionTier.habsburg": "结局：哈布斯堡系在最终账面上占优。",
  "outcome.utrechtVictoryEpilogue.bourbon":
    "《乌得勒支和约》系列安排落地后，公开交战让位于条文：欧洲在防止法西合并的前提下接受波旁留驻马德里，法国以让渡最坏的合并想象换取可辩护的王朝成果。",
  "outcome.utrechtVictoryEpilogue.compromise":
    "和约并未给出单方完胜：遗产被条约重新切块，各方在承认与颜面之间折衷——法国保住西班牙继承的底线空间，却也背负长期均势约束。",
  "outcome.utrechtVictoryEpilogue.habsburg":
    "纸面和平折射大同盟压力：波旁虽保西班牙王位，却须在帝国法统与海上秩序前吞下更多让步；继承战的账单将以战略绳套的形式延续。",
  "log.cardPlayed.title": "[第 {turn} 年] {card} — 支付 {cost} {funding}。",
  "log.cardPlayed.effectsLabel": "效果：",
  "log.cardPlayed.noEffects": "无列表效果。",
  "log.effect.modResource": "{resource} {delta}",
  "log.effect.gainFunding": "{funding} +{amount}",
  "log.effect.drawCards": "抽牌 {count}",
  "log.effect.scheduleNextTurnDrawModifier": "下一年抽牌修正 {delta}",
  "log.effect.opponentNextTurnDrawModifier": "对手下一年摸牌修正 {delta}",
  "log.effect.scheduleDrawModifiers": "后续多年抽牌修正 {deltas}",
  "log.effect.setCardTagBlocked": "禁用 {tag} 牌（{turns} 回合）",
  "log.effect.addPlayerStatus": "{status}（{turns} 回合）",
  "log.effect.addCardsToDeck": "向抽牌堆加入 {count} 张{card}",
  "log.effect.modSuccessionTrack": "王位争夺进度 {delta}",
  "log.effect.modOpponentStrength": "哈布斯堡对手费用上限 {delta}",
  "log.opponentHabsburgPlay.title":
    "[第 {turn} 年] 哈布斯堡阶段：打出合计 {cost} 点对手费用（已减免 {discount}）。",
  "log.opponentHabsburgPlay.cardsLine": "打出：{cards}。",
  "log.opponentHabsburgDraw.title": "[第 {turn} 年] 哈布斯堡摸牌 {n} 张。",
  "log.eventFundSolved": "[第 {turn} 年] {event}。已支付 {paid} {funding}。{treasury}",
  "log.eventFundSolved.treasury": "财政 +{gain}。",
  "log.eventCrackdownSolved": "[第 {turn} 年] 以干预清除 {event}（已花费 {paid} {funding}）。",
  "log.eventYearEndPenalty.title": "[第 {turn} 年] 年末：{event} 未处理。",
  "log.eventYearEndPenalty.effectsLabel": "惩罚：",
  "log.eventPowerVacuumScheduled": "[第 {turn} 年] 年末：{event} — 下一年将升级为王权危机。",
  "log.crackdownCancelled": "[第 {turn} 年] 已取消干预；退回 {refund} {funding}。",
  "log.eventScriptedAttack.generic":
    "[第 {turn} 年] {event} — 采取军事进攻。已支付 {paid} {funding}。{treasury}",
  "log.eventLocalWarChoice.attack":
    "[第 {turn} 年] {event} — 选择进攻，支付 {paid} {funding}；后果：{outcome}。",
  "log.eventLocalWarChoice.appease":
    "[第 {turn} 年] {event} — 选择绥靖；后果：{legitimacy} -1。",
  "log.eventDualFrontCrisis.concede":
    "[第 {turn} 年] {event} — 选择暂时让步；王位争夺进度 −3；对手费用上限 +1。",
  "log.eventDualFrontCrisis.escalate":
    "[第 {turn} 年] {event} — 选择扩大战争；王位争夺进度 +1，合法性 −1，向抽牌堆加入 3 张财政负担；对手费用上限 +1。",
  "log.eventSuccessionCrisisChoice.payTitle":
    "[第 {turn} 年] {event} — 已支付 {paid} {funding}；{track} +1。",
  "log.eventSuccessionCrisisChoice.payHistory":
    "各邦宫廷在遗嘱、谱系与均势上角力：支付代表在外交、津贴与法理论述上为波旁主张抢先占位，在哈布斯堡对手常压登场之前，先买下一轮国际舆论与承认空间。",
  "log.eventSuccessionCrisisChoice.declineTitle":
    "[第 {turn} 年] {event} — 未支付；{track} −1。",
  "log.eventSuccessionCrisisChoice.declineHistory":
    "当国库与政治决心不愿为「纸面战争」先押筹码时，维也纳与大同盟的合法性叙事先于凡尔赛设调：你仍要争夺西属遗产，但本年纪录从更被动的承认气候开场。",
  "log.eventLocalizedSuccessionWar.title":
    "[第 {turn} 年] {event}。已支付 {paid} {funding}。{track} {delta}（随机）。",
  "log.eventLocalizedSuccessionWar.narrative.m1":
    "大同盟在当面占上风：佛兰德或莱茵线失一要垒、掩护线动摇——有布伦海姆（1704）、拉米利（1706）后法方在低地受挫之势，只是规模较小。",
  "log.eventLocalizedSuccessionWar.narrative.z0":
    "自低地至意大利再度僵持；并列攻城与血肉对耗，如马尔普拉凯（1709）般惨胜难跟进，主战线几无改色。",
  "log.eventLocalizedSuccessionWar.narrative.p1":
    "波旁守住了当面：解围或补线，波河或略有寸进，本季尚算能交代。",
  "log.eventLocalizedSuccessionWar.narrative.p2":
    "本季战果报捷：大围城得胜、野战中击退主力并获辎重，或伊比利亚内线更利腓力五世——对西班牙王座的军事支撑明显加分。",
  "log.eventLocalWarChoice.attackOutcome.success":
    "{power} +1，{legitimacy} +1。前线捷报短暂提振宫廷威望，边境诸邦也暂缓试探法国底线。",
  "log.eventLocalWarChoice.attackOutcome.stalemate":
    "战果有限，本年无额外资源变化。围城与补给线拉锯重演了“大战间隙小战”的消耗逻辑，声势有余而收益不足。",
  "log.eventLocalWarChoice.attackOutcome.setback":
    "{power} -1。突袭受挫后，地方军政协调暴露裂缝，列强更确信法国难以长期维持高压动员。",
  "log.eventNineYearsWarCampaign.title":
    "[第 {turn} 年] {event}：以「{method}」推进战事（支付 {paid} {funding}）——{outcome}。",
  "log.eventNineYearsWarCampaign.method.funding": "经费",
  "log.eventNineYearsWarCampaign.method.intervention": "干预",
  "log.eventNineYearsWarCampaign.outcome.decisiveVictory":
    "决定性胜利，战争压力终结。自莱茵到低地的战线终于松动，奥格斯堡同盟短期内难再组织同等强度的协同攻势。",
  "log.eventNineYearsWarCampaign.outcome.stalemate":
    "僵持不下，前线局势未改。欧洲均势博弈继续把冲突拖入财政与信用的耐力战，谁都无法迅速脱身。",
  "log.eventNineYearsWarCampaign.outcome.limitedGains":
    "取得局部战果，{legitimacy} +1。局部胜利稳住了国内观感，但尚不足以改写九年战争的长期消耗格局。",
  "log.eventNineYearsWarCampaign.history":
    "史实背景：九年战争（1688–1697）从莱茵兰、低地到海上战场全面延伸，长期动员几乎压垮各国财政。",
  "log.eventNineYearsWarFiscalBurden.title":
    "[第 {turn} 年] {event} 在年末仍未结束：向抽牌堆加入 1 张 {card}。",
  "log.eventNineYearsWarFiscalBurden.history":
    "史实背景：长期战争需要反复举债、拖欠与加税，财政负担会持续累积并反噬治理能力。",
  "log.huguenotResurgence.title":
    "[第 {turn} 年] 「遏制胡格诺-剩余势力」仍在场：胡格诺地下网络借宽容与逃亡渠道重新结社。向抽牌堆加入 {addedCount} 张「{card}」，剩余势力变为 {remainingStacks}。",
  "log.huguenotResurgence.history":
    "史实背景：1685 年《枫丹白露敕令》颁布后，胡格诺派被迫地下化或外逃，但其聚会、印刷与互助网络在乡野与边境反复重建，每隔数年就需新一轮镇压才能压住。",
  "log.drawCards.title": "[第 {turn} 年] 本回合抓取 {count} 张牌：{cards}。",
  "log.drawOverflowDiscarded.title":
    "[第 {turn} 年] 手牌已达上限；将剩余未摸的 {count} 张牌直接置入弃牌堆：{cards}。",
  "log.europeAlertProgressShift":
    "[第 {turn} 年] 欧洲警觉进度调整 {from}→{to}（k={k}，触发概率 {pct}%）。",
  "log.info.chapter2EuropeAlertOn":
    "[第 {turn} 年] 遗产战争与随后的外交摊牌（如 1668 年前后《亚琛和约》缔结之际）已让欧陆诸国切身感到路易十四在低地与继承问题上的决心：停战并未消解疑惧，荷兰、帝国与海上强国之间的串联从临时应急转向更长久的相互戒备——「欧洲警觉」在此刻已是宫廷间心照不宣的现实。",
  "log.info.chapter2EuropeAlertContinuityLow":
    "[第 {turn} 年] 法国在遗产与边境争端中更多依靠外交斡旋与边境威慑，而未把欧陆拖入全面军事摊牌；邻国仍紧盯凡尔赛的每一步，使节、军备与贸易杠杆暗中加码，但那种因大战惨败或领土剧变而瞬间抬高的围堵烈度尚未到来——戒备像余烬，而非燎原之火（「欧洲警觉」仍以较低烈度笼罩边境）。",
  "log.info.chapter2EuropeAlertOff":
    "[第 {turn} 年] 在这一叙事起点上，外部对法兰西的牵制尚未聚合成制度化围堵：和约与密约仍在试探，反法大同盟的动员逻辑尚未成为欧陆日常，宫廷文书里更多是观望而非摊牌。",
  "log.info.chapter3ContinuityIntro":
    "[第 {turn} 年] 第三关开局：继承第二关的资源、历法年与幸存牌库；另有六张新牌加入起手手牌。历法进入 1701 年时将按脚本出现王位继承危机。",
  "log.info.antiFrenchSentimentActivated":
    "[第 {turn} 年]「反法情绪」升温：当“权力+财政”大于 20 时，「欧洲警觉」相关且需经费解决的事件费用会先 +1，之后每再多满 5 点再 +1。该状态会显示「情绪x」（x=当前整个牌库中「反法遏制」数量）；且在状态持续期间，「里斯维克和约」费用还会额外 +2x。",
  "log.info.antiFrenchSentimentEnded":
    "[第 {turn} 年]「反法情绪」缓和：当“权力+财政”回到 20 或以下时，由该状态带来的额外事件费用加成被取消。",
  "log.info.cardTag.royal": "[第 {turn} 年] 标签说明「王室」：该牌属于王室工具，部分事件只能靠此类手段处理。",
  "log.info.cardTag.temp": "[第 {turn} 年] 标签说明「临时」：该牌通常为一次性应急工具，打出后不会进入弃牌堆循环。",
  "log.info.cardTag.extra":
    "[第 {turn} 年] 标签说明「额外」：该牌由其他效果临时加入，不会出现在过关整编中，并会在本关结束时从牌堆移除。",
  "log.info.cardTag.inflation":
    "[第 {turn} 年] 标签说明「通胀」：当卡牌通胀机制生效后，该牌每次经过洗牌回抽都会叠加费用。",
  "log.info.cardTag.defiance":
    "[第 {turn} 年] 标签说明「抗命」：当手牌中紧邻右侧为「良心保留」时，本牌获得抗命且不可打出。",
  "log.info.cardTag.consume":
    "[第 {turn} 年] 标签说明「消耗」：打出后从牌库循环中移除，不会进入弃牌堆，也不会再被洗回抽牌堆。",
  "log.info.cardTag.opponent":
    "[第 {turn} 年] 标签说明「对手」：该牌仅用于哈布斯堡对手阶段，不能从玩家手牌打出。",
  "log.info.cardUse.remainingUses": "[第 {turn} 年] 标签说明「剩余」：该卡可用次数为 X/Y；每次打出会消耗 1 次，用尽后将从牌库循环中移除。",
  "log.info.cardUse.depleted.crackdownPenalty":
    "[第 {turn} 年]「王室干预」次数耗尽，已从牌库循环中移除；王室强制力受损，权力 -1。",
  "log.info.cardUse.depleted.fundingPenalty":
    "[第 {turn} 年]「王室征收」次数耗尽，已从牌库循环中移除；非常规筹资渠道枯竭，财政 -1。",
  "log.info.cardUse.depleted.diplomaticIntervention":
    "[第 {turn} 年]「外交干预」次数耗尽（0/3），已从牌库循环中移除（无额外惩罚）。",
  "log.info.cardDraw.fiscalBurdenTriggered":
    "[第 {turn} 年] 抓到「财政负担」并触发：剩余经费 -1。",
  "log.info.cardDraw.antiFrenchContainmentPowerLoss":
    "[第 {turn} 年] 抓到「反法遏制」并触发：权力 -1。",
  "log.info.cardDraw.antiFrenchContainmentLegitimacyLoss":
    "[第 {turn} 年] 抓到「反法遏制」并触发：合法性 -1。",
  "log.info.nantesPolicy.toleranceNoFontainebleau":
    "[第 {turn} 年] 你选择了宗教宽容路线：宫廷暂不颁布 1685 年《枫丹白露敕令》式的全面撤保政策，地方紧张有所缓和，但宗派争议将长期回潮。",
  "log.info.nantesPolicy.crackdownFontainebleauIssued":
    "[第 {turn} 年] 你选择了严厉镇压路线：王权转向《枫丹白露敕令》式政策，撤销新教群体既有保障并强化驱逐与改宗压力，短期服从上升但长期治理成本加重。",
  "log.info.eventTag.harmful": "[第 {turn} 年] 标签说明「有害」：若年末仍未解决，会触发惩罚。",
  "log.info.eventTag.opportunity": "[第 {turn} 年] 标签说明「机遇」：属于可投资机会，不处理通常不会受到惩罚。",
  "log.info.eventTag.historical":
    "[第 {turn} 年] 标签说明「史实」：该事件基于历史真实发生，用于叙事说明，本标签本身不附带额外机制效果。",
  "log.info.eventTag.continued":
    "[第 {turn} 年] 标签说明「持续」：事件若未解决会保留到下一年，并重复结算其负面后果。",
  "log.info.eventTag.resolved": "[第 {turn} 年] 标签说明「已解决」：该事件已在本年被处理，不会在年末触发惩罚。",
  "help.short":
    "财政决定每回合转入的经费；经费用于打牌与事件处理。权力决定抽牌次数。合法性决定回合末可保留手牌数。未处理的有害事件依次结算。",
  "runCode.label": "对局码",
  "runCode.charCount": "{count} 字符",
  "runCode.copy": "复制",
  "runCode.copied": "已复制",
  "runCode.loadPlaceholder": "粘贴一段十六进制对局码以加载…",
  "runCode.load": "加载",
  "runCode.invalid": "无效的对局码：{error}",
} as const;

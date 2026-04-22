/**
 * 中文文案：关卡 `firstMandate`（旭日，法兰西 1661–1675）。
 * 与 {@link messagesEnFirstMandate} 键一致，供 `zh.ts` 合并。
 */
export const messagesZhFirstMandate = {
  "level.risingSun.name": "旭日",
  "level.risingSun.introTitle": "法兰西，1661 — 太阳王的时代开启",
  "level.risingSun.introBody":
    "1661 年马扎然去世后，路易十四亲政并拒绝再设首席大臣。法国成为欧洲最雄心勃勃的君主国：科尔贝尔整顿财政与制造业、官僚扩张、把大贵族拴在凡尔赛的宫廷文化。\n\n对外则是战争与外交——遗产战争，再到七十年代与荷兰等国的更大冲突。荣光昂贵：宫廷、军队与不安的巴黎，压在耀眼的王冠之下。\n\n你执掌这段早期岁月：集权、筹资、改革，在合法性崩溃或时限用尽之前挺过危机。",
  "level.risingSun.ending.victory":
    "路易十四巩固了王权，使大贵族就范。王室官员如今能在各省落实政令，税收、贸易与制造业则稳步充实国库。凡尔赛的宫廷礼仪把野心驯成服从，把彼此争锋的精英拴在君主制之下。法国比以往更强、更富、更集权。欧陆诸国开始带着戒心观望——在太阳王的治下，一个新的欧陆巨人正在升起。",
  "level.risingSun.ending.victoryWarDevolutionExtra":
    "西属尼德兰与弗朗什孔泰方向的征战，呼应 1667–1668 年的速胜：边塞棱堡易手，银钱与赔款流入王室账目。但法军推进的震撼也催生了英荷瑞三国同盟——英格兰的舰队、荷兰的账房、瑞典的担保——提醒每一位大臣：地图上的每一寸收获，都将在使馆与条约桌上被同样激烈地讨价还价。",
  "level.risingSun.ending.defeat":
    "王权在债务、动荡与抗拒下崩塌。各省漠视巴黎，大贵族重拾私权，官员拖延或拒绝国王的敕令。税源萎缩，骚动蔓延城乡。虚弱的流言引来外邦算计与国内密谋。中央集权的梦想尚未完成便碎裂，法兰西退回分裂的疆场，王冠一年比一年更少被畏惧。",
  "event.warOfDevolution.name": "遗产战争",
  "event.warOfDevolution.desc":
    "1667 年，路易十四以王后玛丽·泰蕾兹的继承权为名，对西属尼德兰与弗朗什孔泰提出“遗产权”主张并发动战争。法军在沃邦式攻城体系与后勤组织支持下推进迅速，迫使西班牙在 1668 年接受《亚琛和约》，法国取得多座边境要塞，但这场速胜也直接刺激英格兰、荷兰与瑞典结成三国同盟，欧洲开始更系统地制衡法国扩张。机制上：你可选择发动攻势获取阶段收益，但会提高后续反法协同压力；若不进攻，该议题会持续占位到 1669 年。",
  "status.antiFrenchLeague.name": "反法同盟压力",
  "status.antiFrenchLeague.hint": "每年：{pct}% 几率本年少抽 1 张牌（仍至少抽 1）。",
  "status.antiFrenchLeague.history": "法国扩张引发列强制衡，外交围堵转化为长期战争压力。",
  "log.eventScriptedAttack.war.title":
    "[第 {turn} 年] {event} — 西属尼德兰与弗朗什孔泰方向开战。",
  "log.eventScriptedAttack.war.summary":
    "法军推进「遗产」主张（史实 1667–1668）。已支付 {paid} {funding}。{power} +{powerDelta}。",
  "log.eventScriptedAttack.war.treasuryYes":
    "低地与弗朗什孔泰战区的占领征收与赎城赔款阶段性回流王室账目（额外财政判定为 {rollPct}%）：{treasury} +{gain}。",
  "log.eventScriptedAttack.war.treasuryNo":
    "低地与弗朗什孔泰战区的占领征收与赎城赔款未如预期回流（额外财政判定 {rollPct}% 未成功）。",
  "log.eventScriptedAttack.war.coalitionNote":
    "法军速胜震动伦敦、海牙与斯德哥尔摩，推动英荷瑞走向三国同盟式围堵——此后数年，外交牵制可能不时压缩你的施政余地。",
  "log.antiFrenchLeagueDraw.title":
    "[第 {turn} 年] 反法协调生效：{pct}% 判定命中——本年少抽 1 张牌（仍至少 1）。",
  "log.antiFrenchLeagueDraw.history":
    "使节、津贴与边境上的威慑，呼应遗产战争后欧洲对路易扩张的联合反应（可参考 1668 年《亚琛和约》前后的外交牵制）。",
} as const;

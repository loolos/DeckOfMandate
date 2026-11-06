// statuses
import type { CardId3 } from "./cards";
import { type Delta3, STAGE3 } from "./level";

export type StatusId3 =
  | "liuyanChanshen"
  | "ermuLingtong"
  | "wochuangJingyang"
  | "baoyangZaishen"
  | "zhushiTuotie"
  | "shenhuaiLongyi"
  | "duanfeiXianghu"
  | "jingfeiZhiyi"
  | "songxingBieyi"
  | "chenyuanYiduan"
  | "fuyaoTiaoyang"
  | "qinseHeming"
  | "xinGuirenZhangyi"
  | "fuxiongMengchen"
  | "lingrongDeXiang"
  | "shitaiBihu"
  | "hanzheng"
  | "jingji"
  | "xiangyouYiyun"
  | "xinruZhishui"
  | "jingfeiZhouji"
  | "weiNverChengxia"
  | "diyunYinghuai"
  | "meizhuangDadian"
  | "yishiWucuo"
  | "dayaQifei"
  | "dayaGuaerjia"
  | "dayaQifeiLizi"
  | "yanxianHuansi"
  | "xianhuaChuanKai"
  | "bingzhongXinyou"
  | "jinxiLeikua";

export type StatusDef3 = {
  readonly id: StatusId3;
  readonly name: string;
  readonly emoji: string;
  readonly tag: "negative" | "positive";
  readonly duration: number;
  readonly permanent?: boolean;
  readonly unremovable?: boolean;
  readonly drawModifier: number;
  readonly playCap?: number;
  readonly playBonus?: number;
  readonly blocksCards?: readonly CardId3[];
  readonly noSummon?: boolean;
  /** Applied at the end of every turn it is in effect (寒疾缠身). */
  readonly turnEnd?: readonly Delta3[];
  readonly effectText: string;
  readonly flavor: string;
  /** Before this turn the player only sees the veiled text (盟友状态的效果日后才揭晓). */
  readonly veiled?: { readonly untilTurn: number; readonly effectText: string; readonly flavor: string };
  /** From this turn on the status shows a different story text (效果文字不变). */
  readonly lateFlavor?: { readonly fromTurn: number; readonly flavor: string };
  /** 被废出宫、还不知道胧月下落时（见 longyueHidden3）换用的剧情文字。 */
  readonly longyueHiddenFlavor?: string;
};

/** What the player is shown of a status on `turn`. */
export function statusText3(def: StatusDef3, turn: number, longyueHidden = false): { effectText: string; flavor: string } {
  if (def.veiled && turn < def.veiled.untilTurn) return def.veiled;
  if (longyueHidden && def.longyueHiddenFlavor) return { effectText: def.effectText, flavor: def.longyueHiddenFlavor };
  if (def.lateFlavor && turn >= def.lateFlavor.fromTurn) return { effectText: def.effectText, flavor: def.lateFlavor.flavor };
  return def;
}

/** 打压 leaves one of these per rival: her next crisis needs one fewer 解牌. */
function daya(id: StatusId3, rivalName: string, flavor: string): StatusDef3 {
  return {
    id,
    name: `打压·${rivalName}`,
    emoji: "⚔️",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: `${rivalName}的危机下次出现时少需要 1 张解牌。用掉后消失。`,
    flavor,
  };
}

export const STATUSES3: Record<StatusId3, StatusDef3> = {
  xianhuaChuanKai: {
    id: "xianhuaChuanKai",
    name: "闲话传开",
    emoji: "🗣️",
    tag: "negative",
    duration: 2,
    drawModifier: -1,
    effectText: "未来 2 回合，每回合抓牌数 -1（至少抓 1 张）。多个实例分别计时、效果叠加。",
    flavor: "碎玉轩里的闲话传到了别的宫里，走到哪儿都有人指指点点，你也没了往日的从容。",
  },
  yanxianHuansi: {
    id: "yanxianHuansi",
    name: "眼线环伺",
    emoji: "👀",
    tag: "negative",
    duration: 2,
    drawModifier: -1,
    effectText: "未来 2 回合，每回合抓牌数 -1（至少抓 1 张）。多个实例分别计时、效果叠加。",
    flavor: "院墙外总有人影晃动，说话做事都得提着几分小心，哪还有心思多想别的。",
  },
  liuyanChanshen: {
    id: "liuyanChanshen",
    name: "流言缠身",
    emoji: "🗯️",
    tag: "negative",
    duration: 3,
    drawModifier: -1,
    effectText: "未来 3 回合，每回合抓牌数 -1。多个实例分别计时、效果叠加。",
    flavor: "宫里的闲话越传越离谱，连走动见人都要多几分小心。",
  },
  ermuLingtong: {
    id: "ermuLingtong",
    name: "耳目灵通",
    emoji: "👂",
    tag: "positive",
    duration: 2,
    drawModifier: 1,
    effectText: "未来 2 回合，每回合抓牌数 +1。多个实例分别计时、效果叠加。",
    flavor: "赏下去的银子换来了几双眼睛，各宫的动静渐渐传到你耳边。",
  },
  wochuangJingyang: {
    id: "wochuangJingyang",
    name: "卧床静养",
    emoji: "🛏️",
    tag: "negative",
    duration: 2,
    unremovable: true,
    drawModifier: 0,
    playCap: 1,
    noSummon: true,
    effectText: "未来 2 回合，每回合最多打出 1 张牌（出牌 +1 的效果仍然有效），也不能侍寝；结束时身子恢复为 1。不可移除。",
    flavor: "身子已亏空到了极处，太医嘱咐须得卧床好生将养。",
  },
  baoyangZaishen: {
    id: "baoyangZaishen",
    name: "抱恙在身",
    emoji: "🤒",
    tag: "negative",
    duration: 2,
    drawModifier: 0,
    blocksCards: ["yirongZhengsu", "jinyanShenxing"],
    noSummon: true,
    effectText: "未来 2 回合，不能打出【仪容整肃】和【谨言慎行】，也不能侍寝。",
    flavor: "身子一阵阵发虚，连起身梳妆都勉强，太医嘱咐这几日不宜操劳，更不可侍寝。",
  },
  diyunYinghuai: {
    id: "diyunYinghuai",
    name: "笛韵萦怀",
    emoji: "🎐",
    tag: "positive",
    duration: 1,
    drawModifier: 1,
    effectText: "下回合抓牌数 +1。多个实例效果叠加。",
    flavor: "他把你的难处都记在了心上，转头便着手替你一件件周旋，那笛声似还萦在耳畔，心上也松快了几分。",
  },
  meizhuangDadian: {
    id: "meizhuangDadian",
    name: "眉庄打点",
    emoji: "🌸",
    tag: "positive",
    duration: 3,
    drawModifier: 1,
    effectText: "未来 3 回合，每回合抓牌数 +1。多个实例分别计时、效果叠加。",
    flavor: "眉庄托了沈家的人，在宫里宫外四处替你打点，日子渐渐宽裕了些。",
  },
  zhushiTuotie: {
    id: "zhushiTuotie",
    name: "诸事妥帖",
    emoji: "🗝️",
    tag: "positive",
    duration: 1,
    drawModifier: 0,
    playBonus: 1,
    effectText: "下回合出牌上限 +1。多个实例效果叠加。",
    flavor: "琐碎事槿汐都替你料理妥当了，你只管腾出手来应付要紧的。",
  },
  shenhuaiLongyi: {
    id: "shenhuaiLongyi",
    name: "身怀龙裔",
    emoji: "👶",
    tag: "positive",
    duration: 0,
    permanent: true,
    unremovable: true,
    drawModifier: 0,
    effectText: "不再出现召幸。第一幕没有伤胎类事件，孩子一定能平安出生。",
    flavor: "太医跪地道喜：小主有喜了。你抚着小腹，一时竟不知该喜还是该忧。",
    lateFlavor: {
      fromTurn: STAGE3.act3Start,
      flavor: "腹中这个孩子并不是皇上的，可万万不能叫皇上知道，只能让他深信不疑，这是他的骨肉。月份、脉案、人前人后的一言一行，都不能出半点差错。",
    },
  },
  duanfeiXianghu: {
    id: "duanfeiXianghu",
    name: "端妃相护",
    emoji: "🍵",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: "景仁宫对质时，皇后呈上的把柄 -1。",
    flavor: "端妃说话不多，可景仁宫那一套，她早就看透了。",
    veiled: { untilTurn: 10, effectText: "日后或许用得上。", flavor: "端妃说话不多，临走只叮嘱你一句：「景仁宫那边，凡事多留个心。」" },
  },
  jingfeiZhiyi: {
    id: "jingfeiZhiyi",
    name: "敬妃之谊",
    emoji: "🧵",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: "【宫中来信】离场时另 🌱身子 +1（无论是否把握）。",
    flavor: "敬妃膝下无子，最盼着你的孩子。她托人捎话：胧月有她看顾，你只管保重自己。",
    longyueHiddenFlavor: "敬妃没有忘了你。她托人捎话：山中清苦，你只管保重自己，宫里的事，她会替你留心。",
    veiled: { untilTurn: 11, effectText: "日后或许用得上。", flavor: "敬妃拉着你的手说，往后有什么难处，只管来咸福宫找她。" },
  },
  xinGuirenZhangyi: {
    id: "xinGuirenZhangyi",
    name: "欣贵人解围",
    emoji: "🗣️",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: "下一次齐妃或祺贵人的危机没化解时免罚（事件仍可化解、打压）。用掉后消失。",
    flavor: "欣贵人快人快语，最看不惯齐妃那副样子，真遇上事，她总肯替你说上几句。",
  },
  fuxiongMengchen: {
    id: "fuxiongMengchen",
    name: "父兄蒙尘",
    emoji: "📜",
    tag: "negative",
    duration: 0,
    permanent: true,
    unremovable: true,
    drawModifier: 0,
    effectText: "第 8 回合【甄远道下狱】每个选项的代价再加重一档。不可移除。",
    flavor: "鄂敏的折子递上去了，前朝上下都在议论甄家的事，只怕父兄的处境要更难了。",
  },
  dayaQifei: daya("dayaQifei", "齐妃", "齐妃在众人面前下不来台，往后见了你都收敛了许多。"),
  dayaGuaerjia: daya("dayaGuaerjia", "祺贵人", "祺贵人吃了一回亏，在人前不敢再那么张扬。"),
  /** 栗糕清苦之后：齐妃的把柄落在皇后手里，打压不再用掉。 */
  dayaQifeiLizi: {
    id: "dayaQifeiLizi",
    name: "打压·齐妃",
    emoji: "⚔️",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: "齐妃的危机每次出现都少需要 1 张解牌，不会用掉；景仁宫对质时，齐妃的指控少一桩。",
    flavor: "那盘栗子糕之后，齐妃见了你总是远远避开，在人前再不敢多说一句。",
    veiled: { untilTurn: 10, effectText: "齐妃的危机每次出现都少需要 1 张解牌，不会用掉。日后或许还用得上。", flavor: "那盘栗子糕之后，齐妃见了你总是远远避开，在人前再不敢多说一句。" },
  },
  lingrongDeXiang: {
    id: "lingrongDeXiang",
    name: "暗香盈袖",
    emoji: "🎶",
    tag: "positive",
    duration: 0,
    permanent: true,
    unremovable: true,
    drawModifier: 0,
    effectText: "第 13 回合起，每 3 回合末 🌱身子 +1，直至回宫。",
    flavor: "陵容亲手调的一盒香，闻着清清淡淡的，附的话只说心中有愧，盼姐姐平安。你收在了案头。",
  },
  shitaiBihu: {
    id: "shitaiBihu",
    name: "佛门庇荫",
    emoji: "🍵",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: "下一次危机事件没化解时免罚（静白刁难仍算没化解）。用掉后消失。",
    flavor: "静岸师太嘴上不说，心里却是护着你的，真遇上为难事，她总会替你拦上一拦。",
    lateFlavor: {
      fromTurn: STAGE3.templeLastTurn + 1,
      flavor: "上了凌云峰，静白的手伸不到这里了。山下这份庇护还在，师太没有忘了你，真遇上为难事，仍会托人替你拦上一拦。",
    },
  },
  hanzheng: {
    id: "hanzheng",
    name: "寒疾缠身",
    emoji: "🥶",
    tag: "negative",
    duration: 2,
    drawModifier: 0,
    turnEnd: [{ resource: "shenzi", amount: -1 }],
    effectText: "未来 2 回合，每回合末 🌱身子 -1。多个实例分别计时、效果叠加。",
    flavor: "山上的风灌进单薄的衣裳，骨头缝里都是冷的。",
  },
  jingji: {
    id: "jingji",
    name: "惊悸",
    emoji: "🐺",
    tag: "negative",
    duration: 2,
    drawModifier: 0,
    blocksCards: ["chanyuXiushen"],
    effectText: "未来 2 回合，不能打出【禅语修身】。",
    flavor: "夜里一点动静，你就惊得坐起来，再也静不下心念经。",
  },
  xiangyouYiyun: {
    id: "xiangyouYiyun",
    name: "香油疑云",
    emoji: "📿",
    tag: "negative",
    duration: 3,
    drawModifier: 0,
    turnEnd: [{ resource: "qingyu", amount: -1 }],
    effectText: "未来 3 回合，每回合末 🪷清誉 -1。多个实例分别计时、效果叠加。",
    flavor: "功德箱的事没人替你说清，寺里上上下下看你的眼神都带了几分疑。",
  },
  xinruZhishui: {
    id: "xinruZhishui",
    name: "心如止水",
    emoji: "📖",
    tag: "positive",
    duration: 3,
    drawModifier: 1,
    effectText: "未来 3 回合，每回合抓牌数 +1。",
    flavor: "一卷经抄完，心里那些翻来覆去的念头，竟也平了。",
  },
  songxingBieyi: {
    id: "songxingBieyi",
    name: "临别笛声",
    emoji: "🍃",
    tag: "positive",
    duration: 3,
    drawModifier: 1,
    effectText: "未来 3 回合，每回合抓牌数 +1。",
    flavor: "他走后，山风里似乎还留着那支笛子的余音，叫人心里踏实了些。",
  },
  chenyuanYiduan: {
    id: "chenyuanYiduan",
    name: "尘缘已断",
    emoji: "✂️",
    tag: "positive",
    duration: 2,
    drawModifier: 1,
    effectText: "未来 2 回合，每回合抓牌数 +1。",
    flavor: "青丝落尽，从前的牵挂也像随着断了，心里空明了许多。",
  },
  fuyaoTiaoyang: {
    id: "fuyaoTiaoyang",
    name: "敷药调养",
    emoji: "🌿",
    tag: "positive",
    duration: 2,
    drawModifier: 0,
    turnEnd: [{ resource: "shenzi", amount: 1 }],
    effectText: "未来 2 回合，每回合末 🌱身子 +1。",
    flavor: "冻裂的手敷上了药，隔夜便不那么疼了，人也松快了些。",
  },
  qinseHeming: {
    id: "qinseHeming",
    name: "长相思守",
    emoji: "🎼",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 1,
    effectText: "此后每回合抓牌数 +1。",
    flavor: "他走了，那一夜的琴声笛声却还留在心里。你比从前更稳，日子再难，也撑得住。",
    veiled: { untilTurn: 26, effectText: "山中月夜，琴笛相和，庚帖并放，你的心里多了几分笃定。", flavor: "往后无论如何，这些都是你的底气。" },
  },
  jingfeiZhouji: {
    id: "jingfeiZhouji",
    name: "敬妃周济",
    emoji: "🧺",
    tag: "positive",
    duration: 1,
    drawModifier: 1,
    effectText: "下回合抓牌数 +1。",
    flavor: "敬妃托温太医捎上山的衣物药材和米面，替你把山居的日子打点得宽裕了些。",
  },
  bingzhongXinyou: {
    id: "bingzhongXinyou",
    name: "挂念成忧",
    emoji: "😮‍💨",
    tag: "negative",
    duration: 1,
    drawModifier: -1,
    effectText: "下回合，抓牌数 -1（至少抓 1 张）。",
    flavor: "他为照顾你病倒了，你坐立难安，满心都是清凉台那头的动静。",
  },
  jinxiLeikua: {
    id: "jinxiLeikua",
    name: "槿汐累倒",
    emoji: "🥱",
    tag: "negative",
    duration: 2,
    drawModifier: 0,
    blocksCards: ["jinxiXiangzhu"],
    effectText: "未来 2 回合，不能打出【槿汐相助】。",
    flavor: "槿汐连着几夜没合眼，累倒了，得歇上几日才能再近身伺候。",
  },
  weiNverChengxia: {
    id: "weiNverChengxia",
    name: "慈烛长明",
    emoji: "🕯️",
    tag: "positive",
    duration: 2,
    drawModifier: 0,
    turnEnd: [{ resource: "qingyu", amount: 1 }],
    effectText: "未来 2 回合，每回合末 🪷清誉 +1。",
    flavor: "你看着胧月的小像，看了很久，把那口气重新提了起来。槿汐在一旁默默添了一盏灯。",
  },
  yishiWucuo: {
    id: "yishiWucuo",
    name: "滴水不漏",
    emoji: "🪵",
    tag: "positive",
    duration: 1,
    drawModifier: 1,
    effectText: "下回合抓牌数 +1。",
    flavor: "活儿干得挑不出毛病，静白一时也找不到由头。",
  },
};

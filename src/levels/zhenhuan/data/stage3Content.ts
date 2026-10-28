/**
 * 甄嬛传 · 第三关「青灯凤阙」 content. Rules come from `../docs/design-stage3.md`; keep mechanic text in sync with it.
 * Palace cards keep their 第一 / 第二关 names, emoji and flavor; their matches here cover all three acts
 * (an act's events never show up in another act, so one table is enough).
 */
import { CARDS as STAGE1_CARDS, RANKS, type RankId, type ResourceInfo } from "./content";
import { CARDS2, LINGRONG_EVENT, LINGRONG_SUMMON, SHENZI, lingrongTier, summonInterval, type LingrongOutcome, type LingrongTier } from "./stage2Content";

export { RANKS, SHENZI, lingrongTier, summonInterval, type LingrongTier, type RankId };

// ---------------------------------------------------------------- level

export type Resource3 = "qingyu" | "shengchong" | "shenzi";
export type Delta3 = { readonly resource: Resource3; readonly amount: number };
export type Act = 1 | 2 | 3;

export const RESOURCE3_LABEL: Record<Resource3, string> = { qingyu: "清誉", shengchong: "圣宠", shenzi: "身子" };
export const RESOURCE3_EMOJI: Record<Resource3, string> = { qingyu: "🪷", shengchong: "👑", shenzi: "🌱" };

export const STAGE3 = {
  title: "第三关 · 青灯凤阙（试玩版）",
  totalTurns: 33,
  /** 第二幕（甘露寺）从这一回合开始。 */
  act2Start: 11,
  /** 第三幕（移花接木）从这一回合开始。 */
  act3Start: 26,
  confrontTurn: 10,
  /** 寺中阶段（静白嚣张计数、静白刁难）到这一回合为止。 */
  templeLastTurn: 18,
  /** 单独开始第三关：嫔、已有孕。 */
  standaloneRank: "pin" as RankId,
  standalonePregnant: true,
  standaloneQingyu: 15,
  standaloneShengchong: 15,
  standaloneShenzi: 4,
  /** 单独开始第三关：从第二关的 6 种把柄里随机带入几种。 */
  standaloneSecrets: 4,
  /** 第 13、16……31 回合末【暗香盈袖】🌱+1。 */
  fragranceTurns: [13, 16, 19, 22, 25, 28, 31] as readonly number[],
  /** 🌟完美：三步在这一回合之前完成。 */
  perfectBefore: 31,
};

export const ACT_TITLE: Record<Act, string> = { 1: "第一幕 · 凤仪之下", 2: "第二幕 · 青灯古佛", 3: "第三幕 · 移花接木" };

/** 修行身份（第二、三幕）：比答应还低。 */
export const XIUXING = { name: "修行", draw: 2, plays: 1, cap: 8 };

/** 召幸门槛（同第二关的贵人 / 嫔）。 */
export const SUMMON_THRESHOLD3 = 8;

export const RESOURCE_INFO3: Record<Resource3, ResourceInfo> = {
  qingyu: {
    lore: "宫里宫外，人人都在看你的言行。名声一坏，便再没有回头的路。",
    rules: ["降到 0 立即失败。", "第一幕上限随位分（贵人 15、嫔 18）；进寺后上限 8。"],
  },
  shengchong: {
    lore: "皇上的恩宠。出宫之后，它就被留在了紫禁城里。",
    rules: ["第一幕降到 0 立即失败；达到 8 才有召幸，越高召幸越勤。", "第二、三幕冻结不显示；移花接木的「偶遇」完成时按出宫时的数值恢复。"],
  },
  shenzi: {
    lore: "凤体康泰，方能承雨露、育龙裔。到了寺里，它就是你的命。",
    rules: [
      "范围 0–6。侍寝后按身子 ÷ 5 判定有喜（≥ 5 必定有孕）。",
      "第一幕降到 0 须卧床静养；第二幕降到 0 病死寺中（失败）；第三幕降到 0 小产（失败）。",
    ],
  },
};

export const PLAYS_INFO3: ResourceInfo = {
  lore: "一日里能办的事有限，先办哪件、留哪件，全凭你拿主意。",
  rules: [
    "第一幕由位分决定（贵人 2、嫔 3）；进寺后修行身份只能打 1 张。",
    "【静观其变】【静心忍耐】【果郡王相助】本回合 +1；【槿汐相助】的【诸事妥帖】下回合 +1。",
  ],
};

export const DOUBT = { start: 1, max: 5 };

// ---------------------------------------------------------------- cards

export type CardId3 =
  | "yirongZhengsu"
  | "jinyanShenxing"
  | "wenTaiyiZhenzhi"
  | "shoulongRenxin"
  | "jingguanQibian"
  | "meizhuangXiangzhu"
  | "lingrongXiangzhu"
  | "jinxiXiangzhu"
  | "guojunwangXiangzhu"
  | "chanyuXiushen"
  | "jingchaiBuqun"
  | "jingxinRennai"
  | "yiwuGengtie"
  | "yiwuDi"
  | "yiwuPifeng"
  | "yiwuDipu"
  | "yiwuTonghua"
  | "yiwuHehua"
 ;

export type RelicId = "yiwuGengtie" | "yiwuDi" | "yiwuPifeng" | "yiwuDipu" | "yiwuTonghua" | "yiwuHehua";
/** 舟覆后果郡王相助变成的遗物，按先后取用（有的剧情选择才有）。 */
export const RELICS: readonly RelicId[] = ["yiwuGengtie", "yiwuDi", "yiwuPifeng", "yiwuHehua", "yiwuDipu", "yiwuTonghua"];

export type CardDef3 = {
  readonly id: CardId3;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly base: readonly Delta3[];
  readonly baseDraw: number;
  readonly baseStatus?: StatusId3;
  /** This turn's play limit +N. */
  readonly extraPlays?: number;
  readonly matches: readonly EventId3[];
  readonly rulesText: readonly string[];
  readonly rulesCompact?: string;
  /** 第二幕起这张牌的效果换成另一套（眉庄相助）。 */
  readonly templeRulesText?: readonly string[];
  readonly templeRulesCompact?: string;
};

/** 这张牌在第 `act` 幕的说明文字。 */
export function cardRules3(def: CardDef3, act: Act): { rulesText: readonly string[]; rulesCompact: string | undefined } {
  return act >= 2 && def.templeRulesText ? { rulesText: def.templeRulesText, rulesCompact: def.templeRulesCompact } : { rulesText: def.rulesText, rulesCompact: def.rulesCompact };
}

function palace(id: Exclude<CardId3, "lingrongXiangzhu" | "jinxiXiangzhu" | "guojunwangXiangzhu" | "chanyuXiushen" | "jingchaiBuqun" | "jingxinRennai" | RelicId>, o: Partial<CardDef3>): CardDef3 {
  const c = STAGE1_CARDS[id];
  return { id, name: c.name, emoji: c.emoji, flavor: c.flavor, base: c.base, baseDraw: c.baseDraw, baseStatus: c.baseStatus as StatusId3 | undefined, matches: [], rulesText: c.rulesText, ...o };
}

const RELIC_RULES = ["打出即焚毁，没有别的效果。"];

/** 移花接木开始（引驾）之后才在遗物上显示，之前不剧透。 */
export const RELIC_DOUBT_RULE = "引驾之后、回宫之前，每回合末手里每有 1 件遗物，📜疑点 +1。";

export const CARDS3: Record<CardId3, CardDef3> = {
  yirongZhengsu: palace("yirongZhengsu", {
    matches: ["huanghouShangshi", "liyiShiwu", "wangyeXiantan", "kuairenKuaiyu", "sanAgeYaochong", "xinrenZhengchong", "yuhuayuanXin"],
  }),
  jinyanShenxing: palace("jinyanShenxing", {
    matches: [
      "huanghouShangshi",
      "taihouChuixun",
      "gongzhongLiuyan",
      "wangyeXiantan",
      "yanqingTanbing",
      "xianfuXianhua",
      "qifeiXunxin",
      "xinrenZhengchong",
      "jingrenHoushang",
      "xieliGongwu",
      "jiayanXianyi",
      "yuhuayuanXin",
      "yuhuayuanQi",
      "xianfuQi",
      "yanqingQi",
    ],
  }),
  wenTaiyiZhenzhi: palace("wenTaiyiZhenzhi", {
    base: [],
    matches: ["liyiShiwu", "yanqingTanbing", "antaiBupin", "yanqingDuan", "yanqingQi", "shanzhongCaiyao", "yebanJingrao", "jingrenLairen"],
    rulesText: ["移除 1 个【负面】状态；没有负面状态时身子 +1。"],
    rulesCompact: "🧹负面 / 🌱+1",
  }),
  shoulongRenxin: palace("shoulongRenxin", {
    matches: ["gongzhongLiuyan", "neiwufuDiaonan", "suiyuxuanXianhua", "kuairenKuaiyu", "emingCanben", "shanghuaXiaoju", "yuhuayuanXin", "xianfuJing", "yanqingDuan"],
    rulesCompact: "👂×2 📦→🎴+1",
  }),
  jingguanQibian: palace("jingguanQibian", { extraPlays: 1, rulesCompact: "🎴+2 🀄+1", matches: ["sanAgeYaochong", "jiayanXianyi", "yuhuayuanQi", "xianfuQi", "yanqingDuan"] }),
  meizhuangXiangzhu: palace("meizhuangXiangzhu", {
    flavor: "闲月阁的风雪里，眉姐姐没有倒下。如今她洗冤复位，风浪再大，仍是第一个站到你身边的人。",
    matches: [
      "taihouChuixun",
      "gongzhongLiuyan",
      "neiwufuDiaonan",
      "xianfuXianhua",
      "qifeiXunxin",
      "emingCanben",
      "xieliGongwu",
      "shanghuaXiaoju",
      "xianfuJing",
      "xianfuQi",
      "gongzhongLaixin",
      "tanhuoLiangmi",
    ],
    baseDraw: 1,
    rulesText: ["清誉 +1；抽 1 张牌（眉庄冤屈洗刷，复了位分）。", "联动：它解决的机会事件，事件奖励翻倍（自身基础效果不翻倍）。"],
    rulesCompact: "🪷+1 🎴+1 🎁×2",
    templeRulesText: ["未来 3 回合，每回合抓牌 +1（她托家里人帮忙打点）。", "联动：它解决的机会事件，事件奖励翻倍。"],
    templeRulesCompact: "⏳🎴+1×3 🎁×2",
  }),
  lingrongXiangzhu: {
    ...CARDS2.lingrongXiangzhu,
    flavor: "安妹妹还是那样轻声细语。这些年的风雨里，她陪你走过一程，如今姐妹间是亲是疏，端看你如何待她。",
    matches: [
      "huanghouShangshi",
      "gongzhongLiuyan",
      "neiwufuDiaonan",
      "liyiShiwu",
      "wangyeXiantan",
      "yanqingTanbing",
      "xianfuXianhua",
      "kuairenKuaiyu",
      "antaiBupin",
      "jiayanXianyi",
      "shanghuaXiaoju",
    ],
  } as CardDef3,
  jinxiXiangzhu: {
    ...CARDS2.jinxiXiangzhu,
    baseStatus: "zhushiTuotie",
    rulesCompact: "🗝️⏭️🀄+1",
    matches: [
      "gongzhongLiuyan",
      "neiwufuDiaonan",
      "suiyuxuanXianhua",
      "qifeiXunxin",
      "jingrenHoushang",
      "antaiBupin",
      "yuhuayuanQi",
      "xianfuJing",
      "yanqingQi",
      "tanhuoLiangmi",
      "fazuoCuhuo",
      "gongzhongLaixin",
      "foqianGongdeng",
      "wutouXiangyou",
      "xianrenKuitan",
      "moyanYuanshou",
      "jingrenLairen",
    ],
  } as CardDef3,
  guojunwangXiangzhu: {
    id: "guojunwangXiangzhu",
    name: "果郡王相助",
    emoji: "🎐",
    flavor: "允礼总在你最难的时候出现，笑意淡淡的，像是一切都不值一提。",
    base: [],
    baseDraw: 1,
    baseStatus: "diyunYinghuai",
    extraPlays: 1,
    matches: ["wangyeXiantan", "tanhuoLiangmi", "shanzhongCaiyao", "yuexiaDuitan", "yebanJingrao"],
    rulesText: ["抽 1 张牌；本回合出牌 +1；下回合抓牌 +1。"],
    rulesCompact: "🎴+1 🀄+1 ⏭️🎴+1",
  },
  chanyuXiushen: {
    id: "chanyuXiushen",
    name: "禅语修身",
    emoji: "🙏",
    flavor: "青灯黄卷，一字一句地念下去，心也就慢慢静了。",
    base: [{ resource: "qingyu", amount: 1 }],
    baseDraw: 0,
    matches: ["foqianGongdeng", "jinganChuilian", "chanfangChaojing", "wutouXiangyou", "xianrenKuitan", "yuexiaDuitan", "jingrenLairen"],
    rulesText: ["清誉 +1。"],
  },
  jingchaiBuqun: {
    id: "jingchaiBuqun",
    name: "荆钗布裙",
    emoji: "🪵",
    flavor: "卸了钗环，换上粗布衣裳。从前那个莞嫔，好像从没来过这里。",
    base: [],
    baseDraw: 0,
    matches: ["tanhuoLiangmi", "fazuoCuhuo", "jinganChuilian", "shanzhongCaiyao", "moyanYuanshou"],
    rulesText: ["无基础效果。", "联动：用它化解危机时，下回合抓牌 +1（静白一时挑不出错）。"],
    rulesCompact: "⚡→🎴+1",
  },
  jingxinRennai: {
    id: "jingxinRennai",
    name: "静心忍耐",
    emoji: "🍃",
    flavor: "忍得一时，熬得一日。寺中岁月漫长，只要心不乱，总有熬出头的时候。",
    base: [],
    baseDraw: 1,
    extraPlays: 1,
    matches: ["fazuoCuhuo", "yebanJingrao", "chanfangChaojing"],
    rulesText: ["抽 1 张牌；本回合出牌 +1。"],
    rulesCompact: "🎴+1 🀄+1",
  },
  yiwuGengtie: {
    id: "yiwuGengtie",
    name: "果郡王遗物",
    emoji: "🎐",
    flavor: "一张合婚庚帖。庚帖上写的是「嬛嬛」。他从来只唤你自己的名字。",
    base: [],
    baseDraw: 0,
    matches: [],
    rulesText: RELIC_RULES,
    rulesCompact: "🕯️🔥",
  },
  yiwuDi: {
    id: "yiwuDi",
    name: "果郡王遗物",
    emoji: "🎐",
    flavor: "一支长相思笛。笛子还是那支笛子，只是吹笛的人不在了，再没有人来和上一曲。",
    base: [],
    baseDraw: 0,
    matches: [],
    rulesText: RELIC_RULES,
    rulesCompact: "🕯️🔥",
  },
  yiwuPifeng: {
    id: "yiwuPifeng",
    name: "果郡王遗物",
    emoji: "🎐",
    flavor: "一件旧日披风。踏雪问疾那夜，他把这件披风披在了你身上。",
    base: [],
    baseDraw: 0,
    matches: [],
    rulesText: RELIC_RULES,
    rulesCompact: "🕯️🔥",
  },
  yiwuDipu: {
    id: "yiwuDipu",
    name: "果郡王遗物",
    emoji: "🎐",
    flavor: "一卷旧笛谱。桐花台那晚他随手写在谱子上的曲子，你一直没有还他。",
    base: [],
    baseDraw: 0,
    matches: [],
    rulesText: RELIC_RULES,
    rulesCompact: "🕯️🔥",
  },
  yiwuTonghua: {
    id: "yiwuTonghua",
    name: "果郡王遗物",
    emoji: "🎐",
    flavor: "一枝桐花。桐花台上他折了一枝递给你，你没有接，他便放在了石桌上。",
    base: [],
    baseDraw: 0,
    matches: [],
    rulesText: RELIC_RULES,
    rulesCompact: "🕯️🔥",
  },
  yiwuHehua: {
    id: "yiwuHehua",
    name: "果郡王遗物",
    emoji: "🎐",
    flavor: "一包合欢花籽。他说在安栖观外种了一片合欢，等开了花，请你去看。",
    base: [],
    baseDraw: 0,
    matches: [],
    rulesText: RELIC_RULES,
    rulesCompact: "🕯️🔥",
  },
};

export const RELIC_TEXT: Record<RelicId, string> = {
  yiwuGengtie: "你把庚帖凑近烛火。「嬛嬛」两个字卷起来，黑了，散了。你没有哭。",
  yiwuDi: "笛子投进火盆，噼啪响了几声。长相思，摧心肝。你在心里替他吹完了最后一句。",
  yiwuPifeng: "披风烧得很慢，一点一点地，像是舍不得走。",
  yiwuDipu: "谱子卷起了边，那支没有名字的曲子，在火里一个音一个音地没了。",
  yiwuTonghua: "桐花早已干枯，一碰就碎。火舌卷过去，只剩一缕淡淡的香。",
  yiwuHehua: "花籽在火里炸开一声轻响。安栖观外的合欢，再也没有人等它开花了。",
};

/** 第一幕牌库：第二关因【惜别】离场的眉庄 / 温太医回来了，各 2 张。 */
export const STAGE3_ACT1_DECK: readonly CardId3[] = [
  "yirongZhengsu",
  "yirongZhengsu",
  "jinyanShenxing",
  "jinyanShenxing",
  "shoulongRenxin",
  "shoulongRenxin",
  "jingguanQibian",
  "jingguanQibian",
  "meizhuangXiangzhu",
  "meizhuangXiangzhu",
  "wenTaiyiZhenzhi",
  "wenTaiyiZhenzhi",
  "jinxiXiangzhu",
  "jinxiXiangzhu",
  "lingrongXiangzhu",
  "lingrongXiangzhu",
  "lingrongXiangzhu",
];

/** 第二幕寺中牌库（第 11 回合开局；第一幕的果郡王相助另带进来）。被废出宫时槿汐只剩 1 张。 */
export const STAGE3_TEMPLE_DECK: readonly CardId3[] = [
  "chanyuXiushen",
  "chanyuXiushen",
  "jingchaiBuqun",
  "jingchaiBuqun",
  "jingxinRennai",
  "jingxinRennai",
  "jinxiXiangzhu",
  "jinxiXiangzhu",
  "meizhuangXiangzhu",
  "wenTaiyiZhenzhi",
];

// ---------------------------------------------------------------- statuses

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
  | "yuandaoBuji"
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
};

/** What the player is shown of a status on `turn`. */
export function statusText3(def: StatusDef3, turn: number): { effectText: string; flavor: string } {
  return def.veiled && turn < def.veiled.untilTurn ? def.veiled : def;
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
    name: "琴瑟同心",
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
    duration: 3,
    drawModifier: 1,
    effectText: "未来 3 回合，每回合抓牌数 +1。",
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
  yuandaoBuji: {
    id: "yuandaoBuji",
    name: "远道补给",
    emoji: "📦",
    tag: "positive",
    duration: 3,
    drawModifier: 0,
    turnEnd: [{ resource: "shenzi", amount: 1 }],
    effectText: "未来 3 回合，每回合末 🌱身子 +1。",
    flavor: "眉庄人在宫里，却托温实初把药材、棉衣和米面一样样捎上了山，替你调养身子。",
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

// ---------------------------------------------------------------- 把柄（隐藏）

export type HuanghouId = "jingrenHoushang" | "xieliGongwu" | "antaiBupin" | "jiayanXianyi" | "shanghuaXiaoju";

/** 第二关里用陵容解决、会带进第三关的 6 种私事。 */
export type Stage2SecretId = "shiqinNeiqing" | "zhuangshenNonggui" | "sitanSiqiu" | "jierenYaochong" | "kuitanGongwei" | "qiuziXinqie";
export const STAGE2_SECRETS: readonly Stage2SecretId[] = ["shiqinNeiqing", "zhuangshenNonggui", "sitanSiqiu", "jierenYaochong", "kuitanGongwei", "qiuziXinqie"];

export type SecretId =
  | Stage2SecretId
  | "wangyeZengwu"
  | "guyiYuanyan"
  | "xinlengZhiyu"
  | "yuzhongShuxin"
  | "qiciBuyong"
  | "xijianSiyu"
  | "chuyanDingzhuang"
  | "shanduShide"
  | "yuanwangJunfu"
  | "dingmanZhonggong"
  | `enshang.${HuanghouId}`;

export type SecretDef = {
  readonly name: string;
  readonly emoji: string;
  /** 对质时的指控（齐妃、祺贵人之口）。 */
  readonly line: string;
  /** 同一桩事由宫人、小太监说出的版本；对质里轮流使用，保证每次都有宫人开口。 */
  readonly servant?: string;
  /** 只有陵容在场：甄嬛从这几条里明白是她。 */
  readonly lingrong: boolean;
  /** 这件事当初是怎么来的（对质时标在皇后的问话下面）。 */
  readonly hint: string;
};

export const SECRETS: Record<SecretId, SecretDef> = {
  shiqinNeiqing: { name: "侍寝内情", emoji: "🌙", lingrong: true, line: "祺贵人拿帕子拭着眼角：「那晚敬事房明明翻的是莞嫔的牌子，进养心殿的却是旁人。莞嫔称病，转头让别人替了去，这是欺瞒圣上，混淆宫闱。」", servant: "敬事房的小太监跪着说：「那晚翻的是莞嫔的牌子，进养心殿的却不是她。称病，转头让旁人顶替，这是欺瞒圣上，混淆宫闱。」", hint: "第二关里，你曾让陵容代你侍寝。" },
  zhuangshenNonggui: { name: "装神弄鬼", emoji: "👻", lingrong: true, line: "祺贵人颤声道：「嫔妾听说，那夜丽嫔姐姐宫里有人扮作余莺儿的冤魂哭诉，后来才知是人装的。在宫里装神弄鬼，吓得嫔御失魂，这是扰乱宫闱，欺君不敬。」", servant: "景仁宫的小宫女道：「丽嫔娘娘那夜见的‘余莺儿’，是有人扮的。莞嫔在宫里装神弄鬼，吓得嫔御失魂落魄，这是扰乱宫闱，欺君不敬。」", hint: "丽嫔惊梦那夜，扮余莺儿的冤魂吓她，是陵容帮你办的。" },
  sitanSiqiu: { name: "私探死囚", emoji: "🥀", lingrong: true, line: "齐妃一拍扶手：「余氏临死前，碎玉轩派人去冷宫见过她，旁人都不让进。私见待罪的宫人，难免叫人疑心是在替她传话、灭口，有碍皇上明察。」", servant: "冷宫的老嬷嬷低着头：「余氏临死前，碎玉轩来过人，说是探视，旁人一概不让近前。私见待罪的宫人，难免叫人疑心是在替她传话、灭口，有碍皇上明察。」", hint: "余莺儿临死前，你让陵容去冷宫探视过她。" },
  jierenYaochong: { name: "借人邀宠", emoji: "🌺", lingrong: true, line: "祺贵人轻轻一笑：「那支曲子唱得巧，皇上偏偏就往碎玉轩去了。借旁人的曲子邀宠，把皇上引到自己宫里，这是算计圣驾。」", servant: "御前的小太监说：「那晚皇上本是要往别处去的，偏有一支曲子从碎玉轩飘出来，皇上就改了道。借旁人的曲子邀宠，把圣驾引到自己宫里，这是算计圣驾。」", hint: "欢宜香浓那回，你借陵容的曲子把皇上引到了碎玉轩。" },
  kuitanGongwei: { name: "窥探宫闱", emoji: "👁️", lingrong: true, line: "齐妃冷哼一声：「各宫的宫女往哪儿走，碎玉轩的人比内务府还清楚。私下打探各宫动静，窥探宫闱，有违宫规！」", servant: "内务府的小太监说：「各宫的宫女往哪儿走，碎玉轩的人比奴才还清楚。私下打探各宫动静，这是窥探宫闱，有违宫规。」", hint: "隔墙有耳那回，各宫的动静是陵容替你打探的。" },
  qiuziXinqie: { name: "求子心切", emoji: "🙏", lingrong: true, line: "祺贵人掩口道：「嫔妾听宝华殿的人说，莞嫔在佛前跪了半日，嘴里念的竟是求子。身为嫔御私下谋求子嗣，是觊觎圣恩。」", servant: "宝华殿的小宫女道：「莞嫔在佛前跪了半日，嘴里念的不是平安，是求子。身为嫔御，私下谋求子嗣，这是怀着心思觊觎圣恩。」", hint: "在宝华殿祈福时，你在佛前求的是子嗣。" },
  wangyeZengwu: { name: "王爷赠物", emoji: "🎐", lingrong: true, line: "齐妃冷笑一声：「桐花台那日，十七爷与莞嫔说了好一会子话，宫里好些人都瞧见了。妃嫔私下与亲王说话，内外无别，辱及天家体面。」", servant: "桐花台旁当差的小太监说：「奴才那日远远瞧见，十七爷与莞嫔在台上说了好一会子话。妃嫔私下与亲王说话，内外无别，辱及天家体面。」", hint: "桐花台初遇果郡王，你与他说了好一会儿话。" },
  guyiYuanyan: { name: "故衣怨言", emoji: "👗", lingrong: true, line: "齐妃扬声道：「莞嫔穿了一回旧衣，便说皇上看的从来不是自己。这是怨怼君上，对皇上的恩宠不知足。」", servant: "碎玉轩外洒扫的小宫女低声道：「奴婢听见主子对人说，皇上看的从来不是她……这是怨怼君上，对圣恩不知足。」", hint: "纯元故衣之后，你对陵容说过皇上看的从来不是你。" },
  xinlengZhiyu: { name: "心冷之语", emoji: "💔", lingrong: true, line: "祺贵人接过话头：「莞嫔私下说过‘心冷’二字。对着皇上的恩宠说心冷，这是不敬，是怨怼。」", servant: "碎玉轩外洒扫的小太监低着头：「奴才听见莞嫔私下说过‘心冷’二字。对着皇上的恩宠说心冷，这是不敬，是怨怼。」", hint: "菀菀类卿之后，你对陵容说过心冷的话。" },
  yuzhongShuxin: { name: "狱中书信", emoji: "📜", lingrong: true, line: "齐妃道：「甄大人下狱后，碎玉轩托人往狱里递过一封信。私通狱中钦犯，信里写了什么，皇上不妨问问。」", servant: "内务府的小太监说：「甄大人下狱后，碎玉轩托人往狱里递过一封信。私通狱中的钦犯，不知写了些什么，皇上不妨问问。」", hint: "父亲下狱后，你曾托人往狱里递过一封信。" },
  qiciBuyong: { name: "弃赐不用", emoji: "🍲", lingrong: true, line: "祺贵人道：「皇后娘娘亲赐的安胎补品，莞嫔一口没动，倒是喂了花。辜负中宫的赏赐，既是不敬皇后，也不爱惜皇嗣。」", servant: "景仁宫的小宫女说：「皇后娘娘亲赐的安胎补品，莞嫔一口没动，倒是喂了花。辜负中宫的赏赐，这是对皇后不敬，也不爱惜皇嗣。」", hint: "皇后送来的安胎补品，你一口也没有用。" },
  xijianSiyu: { name: "席间私语", emoji: "🏮", lingrong: true, line: "祺贵人撇着嘴：「赏花那日，莞嫔和人说了好些各宫的长短。背地里议论妃嫔，搬弄是非，这是扰得后宫不和。」", servant: "赏花那日在旁伺候的小宫女说：「莞嫔和人说了好些各宫的长短，奴婢听得真真的。背地里议论妃嫔、搬弄是非，这是扰得后宫不和。」", hint: "赏花小聚上，你与人议论过各宫的长短。" },
  chuyanDingzhuang: { name: "出言顶撞", emoji: "🗣️", lingrong: false, line: "齐妃红着眼眶抢着开口：「皇上，那日请安，臣妾不过提醒莞嫔几句宫里的规矩，她当着众姐妹的面顶撞臣妾，一句不让。臣妾好歹是妃位，这般目无尊卑，往后六宫还怎么服众！」", servant: "景仁宫的小宫女道：「那日请安，齐妃娘娘提点了莞嫔几句，奴婢亲眼见莞嫔当着众人顶撞回去，一句不让。这是目无尊卑。」", hint: "齐妃寻衅的事没有压下去，你当面顶过她。" },
  shanduShide: { name: "善妒失德", emoji: "🐍", lingrong: false, line: "祺贵人哭着道：「前些日子嫔妾不过说了句话，莞嫔便当着众人的面给嫔妾脸色看。嫔妾是新人，怕是容不下嫔妾，这是善妒，有违后宫和睦。」", servant: "御花园的小太监说：「那日祺小主刚说了一句话，莞嫔当着众人就给了脸色。容不下新人，这是善妒，有违后宫和睦。」", hint: "祺贵人争宠的事没有压下去，你给过她脸色。" },
  yuanwangJunfu: { name: "怨望君父", emoji: "⛓️", lingrong: false, line: "祺贵人又道：「嫔妾的父亲在前朝当差，早前上过一道折子，参的正是甄大人。后来听说，莞嫔私下里说，甄大人这案子是冤在皇上。怨怼圣裁，这是对皇上不满，近乎大不敬。」", servant: "前朝传话的小太监战战兢兢：「鄂大人参了甄大人的本之后，奴才听人传，莞嫔私下说甄大人这案子是冤在皇上。怨怼圣裁，近乎大不敬。」", hint: "鄂敏参本的事没有压下去，你为父亲的案子流露过怨望。" },
  dingmanZhonggong: { name: "怠慢中宫", emoji: "🏮", lingrong: false, line: "皇后端着茶盏，笑吟吟地说：「那日晨省，本宫问起碎玉轩的饮食起居，妹妹只含糊应了两句，连头也没抬。本宫一片心意，倒被妹妹当成了客套。」", servant: "景仁宫的小宫女道：「那日晨省，皇后娘娘问起碎玉轩近况，莞嫔答得极敷衍，连眼皮都没抬。这是怠慢中宫。」", hint: "皇后在晨省上问起碎玉轩近况，你没有好好应对。" },
  "enshang.jingrenHoushang": { name: "恩赏为凭·云锦步摇", emoji: "🎁", lingrong: false, line: "祺贵人捏着帕子道：「皇后娘娘赏了一支点翠步摇、一匹云锦，那是妃位的份例、宫里的贡品。莞嫔收下转头就戴着去给太后请安，这是不知分寸，僭越位分。」", servant: "寿康宫外当差的小宫女说：「莞嫔戴着皇后娘娘赏的点翠步摇、穿着云锦来给太后请安。那是妃位的份例，这是不知分寸，僭越位分。」", hint: "你收下了景仁宫赏的云锦和点翠步摇。" },
  "enshang.xieliGongwu": { name: "恩赏为凭·协理宫务", emoji: "📜", lingrong: false, line: "齐妃接口：「皇后娘娘体恤，让她帮着打理宫务，她倒真把六宫当成了自己的，越权专擅，眼里没有皇后。」", servant: "景仁宫的小太监说：「皇后娘娘让莞嫔帮着打理宫务，她却连各宫的份例都自己做了主，奴才们不敢不依。这是越权专擅，眼里没有皇后。」", hint: "" },
  "enshang.antaiBupin": { name: "恩赏为凭·安胎补品", emoji: "🍲", lingrong: false, line: "景仁宫的小宫女道：「皇后娘娘亲自吩咐送去的安胎补品，莞嫔没让太医验过就用了。皇嗣是何等要紧的事，她半点不防备，这是不慎重皇嗣。」", servant: "碎玉轩的小厨房当差的宫人说：「景仁宫送来的补品，没经太医验看就端到了主子跟前。皇嗣要紧，这是不慎重皇嗣。」", hint: "你收下了景仁宫送来的安胎补品。" },
  "enshang.jiayanXianyi": { name: "恩赏为凭·家宴献艺", emoji: "🎵", lingrong: false, line: "祺贵人掩口笑道：「皇后娘娘说家宴缺个助兴的，莞嫔便应下了，当着皇上的面献了一曲。那一曲是弹给谁听的？刻意献艺争宠，成什么体统。」", servant: "家宴上伺候的小宫女说：「皇后娘娘一提家宴助兴，莞嫔就当众献了艺，一曲弹完，皇上的眼睛就没离开过她。这是刻意献艺争宠。」", hint: "你应了皇后的话，在家宴上当众献艺。" },
  "enshang.shanghuaXiaoju": { name: "恩赏为凭·赏花小聚", emoji: "🏮", lingrong: false, line: "皇后端着茶盏，淡淡说了一句：「那日赏花小聚，本宫特意让陵容陪妹妹去，妹妹坦然受了，席上却一直在揣度各宫的心思。窥测宫闱，可不是小事。」", servant: "赏花那日在旁伺候的小宫女说：「莞嫔席上不怎么说话，只一个劲儿打量各宫的神色。这是窥测宫闱。」", hint: "你随皇后赏花，席上留心过各宫的神色。" },
};

/** 端妃相护：被她挡下的那一桩，指控照常提出，她在一旁出言替你辩护。 */
export const DUANFEI_DEFENSE: Record<string, string> = {
  shiqinNeiqing: "那几日她身子不好，本宫是知道的。这种事翻出来，也无趣。",
  zhuangshenNonggui: "丽嫔那场惊梦，太医早断了是心病。这么多年的旧事，该翻篇了。",
  sitanSiqiu: "余氏是死是活，宫里人心里都有数。她临去前有个故人探视，算不得罪过。",
  jierenYaochong: "皇上去哪一宫，是皇上的心思。曲子好不好听，不是妃嫔的罪。",
  kuitanGongwei: "宫里谁不留心几分动静？不留心的，在这宫里活不到今天。",
  qiuziXinqie: "在佛前求个子嗣，本宫当年也求过。这算什么罪？",
  wangyeZengwu: "桐花台人来人往，说几句话便是罪过，那宫里没一个干净的。",
  guyiYuanyan: "一件旧衣裳，谁都可能一时说错话，何必追着不放。",
  xinlengZhiyu: "产后伤心，说几句丧气话，本宫也说过。",
  yuzhongShuxin: "做女儿的递一封家书，皇上若要追究，倒显得不近人情。",
  qiciBuyong: "补品入口前验一验，是规矩，不是罪。",
  xijianSiyu: "席间闲话，各宫都说，若都要追究，这景仁宫今日怕是坐不下。",
  chuyanDingzhuang: "齐妃的嘴，宫里谁不知道？被顶一句，算不得大事。",
  shanduShide: "新人看不看脸色，是祺贵人自己的心思，何必拿来告状。",
  yuanwangJunfu: "父亲下了狱，女儿心里有怨，是人之常情。皇上也是做父亲的人。",
};
/** 没有专门对应的把柄时，端妃的通用说法。 */
export const DUANFEI_DEFAULT: readonly string[] = [
  "这些话都是风闻，本宫不信。",
  "皇后娘娘，这件事不妨到此为止吧。",
  "宫里的事查来查去，查不出什么，反倒伤了和气。",
];

/** 怨怼的陵容编出来的那一条（甄嬛知道是假的，却也知道只有陵容编得出来）。 */
export const FABRICATED_SECRET = "齐妃扬声道：「还有一桩：莞嫔私下说过，这宫里的位分，迟早都是她的。口出狂言，这是觊觎中宫，目无皇上。」";
export const FABRICATED_HINT = "这话你从未说过。";

// ---------------------------------------------------------------- 盟友 / 对头

export type AllyId = "duanfei" | "jingfei" | "xin";
export type RivalId = "qifei" | "guaerjia";

export const ALLIES: Record<AllyId, { name: string; status: StatusId3 }> = {
  duanfei: { name: "端妃", status: "duanfeiXianghu" },
  jingfei: { name: "敬妃", status: "jingfeiZhiyi" },
  xin: { name: "欣贵人", status: "xinGuirenZhangyi" },
};

export const RIVALS: Record<RivalId, { name: string }> = { qifei: { name: "齐妃" }, guaerjia: { name: "祺贵人" } };

/** The 打压 status each rival leaves behind. */
export const SUPPRESS_STATUS: Record<RivalId, StatusId3> = { qifei: "dayaQifei", guaerjia: "dayaGuaerjia" };

export type PairId = "yuhuayuan" | "xianfu" | "yanqing";

export const PAIRS: Record<PairId, { name: string; emoji: string; opportunity: OpportunityId3; crisis: CrisisId3; shared: CardId3; ally: AllyId; rival: RivalId }> = {
  yuhuayuan: {
    name: "御花园赏花",
    emoji: "🌸",
    opportunity: "yuhuayuanXin",
    crisis: "yuhuayuanQi",
    shared: "jinyanShenxing",
    ally: "xin",
    rival: "qifei",
  },
  xianfu: {
    name: "咸福宫托付",
    emoji: "🧵",
    opportunity: "xianfuJing",
    crisis: "xianfuQi",
    shared: "meizhuangXiangzhu",
    ally: "jingfei",
    rival: "guaerjia",
  },
  yanqing: {
    name: "延庆殿夜话",
    emoji: "🍵",
    opportunity: "yanqingDuan",
    crisis: "yanqingQi",
    shared: "wenTaiyiZhenzhi",
    ally: "duanfei",
    rival: "qifei",
  },
};

// ---------------------------------------------------------------- events

export type OpportunityId3 =
  | "huanghouShangshi"
  | "taihouChuixun"
  | "wangyeXiantan"
  | "qingmaiBaoxi"
  | "yanqingTanbing"
  | "xianfuXianhua"
  | "kuairenKuaiyu"
  | "yuhuayuanXin"
  | "xianfuJing"
  | "yanqingDuan"
  | "foqianGongdeng"
  | "gongzhongLaixin"
  | "jinganChuilian"
  | "shanzhongCaiyao"
  | "chanfangChaojing"
  | "moyanYuanshou"
  | "yuexiaDuitan";

export type CrisisId3 =
  | "gongzhongLiuyan"
  | "neiwufuDiaonan"
  | "liyiShiwu"
  | "suiyuxuanXianhua"
  | "qifeiXunxin"
  | "sanAgeYaochong"
  | "xinrenZhengchong"
  | "emingCanben"
  | "yuhuayuanQi"
  | "xianfuQi"
  | "yanqingQi"
  | "tanhuoLiangmi"
  | "fazuoCuhuo"
  | "wutouXiangyou"
  | "yebanJingrao"
  | "xianrenKuitan"
  | "jingrenLairen";

export type EventId3 = OpportunityId3 | CrisisId3 | HuanghouId;
export type EventKind3 = "opportunity" | "crisis" | "huanghou";

export const EVENT_KIND3_LABEL: Record<EventKind3, string> = { opportunity: "机会", crisis: "危机", huanghou: "皇后" };

export type EventDef3 = {
  readonly id: EventId3;
  readonly kind: EventKind3;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  /** Opportunity reward; 皇后事件: what the default (accepting) gives. */
  readonly reward: readonly Delta3[];
  readonly cardReward?: Partial<Record<CardId3, readonly Delta3[]>>;
  readonly penalty: readonly Delta3[];
  readonly penaltyStatus?: StatusId3;
  /** 双牌: any two of these cards in one turn (请脉报喜). */
  readonly double?: readonly CardId3[];
  /** 盟友事件: the first time it is taken, the ally's status. */
  readonly ally?: AllyId;
  /** 对头事件 and whose. */
  readonly rival?: RivalId;
  /** 对头事件: two matching cards in one turn to resolve. */
  readonly needTwo?: boolean;
  /** 对头事件没化解、欣贵人替你挡下惩罚时的日志。 */
  readonly xinCover?: string;
  /** 需两张解牌的危机只凑了一张时的惩罚（不写则按完整惩罚）。 */
  readonly halfPenalty?: readonly Delta3[];
  /** 危机被化解时也要付的代价（断炭缺粮：熬过去也伤身子）。 */
  readonly resolveCost?: readonly Delta3[];
  /** 同上：惩罚状态只持续这么多回合。 */
  readonly halfStatusTurns?: number;
  /** 对头事件: resolving with this card is 打压. */
  readonly suppressCard?: CardId3;
  /** 对头事件 unresolved: 皇后 is told (hidden 把柄). */
  readonly secret?: SecretId;
  /** 陵容 resolved it: she notes this (hidden 把柄). */
  readonly lingrongSecret?: SecretId;
  readonly pair?: PairId;
  /** 🧹 静白刁难（寺中）. */
  readonly jingbai?: boolean;
  /** Only on 凌云峰 (from 肺痨之诬 on) / only in 寺中. */
  readonly place?: "temple" | "peak";
  readonly resolvedText: string;
  readonly unresolvedText: string;
  readonly resolvedStory: Partial<Record<CardId3, string>>;
  /** 凌云峰 text (断炭缺粮 / 师太 / 莫言 change their story on the mountain). */
  readonly peakFlavor?: string;
  readonly note?: string;
};

const NO: readonly Delta3[] = [];
const q = (n: number): Delta3 => ({ resource: "qingyu", amount: n });
const sc = (n: number): Delta3 => ({ resource: "shengchong", amount: n });
const sz = (n: number): Delta3 => ({ resource: "shenzi", amount: n });

export const EVENTS3: Record<EventId3, EventDef3> = {
  // ---- 第一幕 · 机会
  huanghouShangshi: {
    id: "huanghouShangshi",
    kind: "opportunity",
    name: "中宫垂青",
    emoji: "🏮",
    flavor: "景仁宫晨省，皇后当着众人的面温温地问起碎玉轩近来可好，又问饮食起居，一桩桩问得比谁都细。",
    reward: [sc(1)],
    penalty: NO,
    secret: "dingmanZhonggong",
    resolvedText: "圣宠 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      yirongZhengsu: "你穿了身素净的月白衣裳，鬓边只簪一朵绒花，进退一丝不乱。皇后拉着你的手说了好些体己话，又在皇上跟前提了你一句。你谢了恩，只觉得她掌心很凉。",
      jinyanShenxing: "皇后问起六宫近事，你只拣些无关痛痒的回话，一句也不多。皇后笑着说你懂事，端起茶盏，半晌没有再开口。",
    },
  },
  taihouChuixun: {
    id: "taihouChuixun",
    kind: "opportunity",
    name: "太后垂询",
    emoji: "🪭",
    flavor: "寿康宫请你过去说说话。太后近来身子不大好，却还惦记着碎玉轩。",
    reward: [q(1)],
    penalty: NO,
    resolvedText: "清誉 +1（眉庄解决时翻倍）；有【敬妃之谊】时另身子 +1",
    unresolvedText: "有【敬妃之谊】时仍身子 +1，事件消失",
    resolvedStory: {
      jinyanShenxing: "太后问你近来读什么书，你答得谦逊稳妥。太后捻着佛珠，说这孩子沉静。",
      meizhuangXiangzhu: "眉庄陪你一同前去。太后问起闲月阁那一年，眉庄只淡淡说：「都过去了，多亏嬛儿。」转头又把你夸了一遍。你们一唱一和，太后听得开怀，赏了你们一人一串佛珠。",
    },
  },
  wangyeXiantan: {
    id: "wangyeXiantan",
    kind: "opportunity",
    name: "王爷闲谈",
    emoji: "🎐",
    flavor: "果郡王进宫给太后请安，在御花园的回廊下又遇见了你。他说起塞外的风沙，说起江南的烟雨。",
    reward: [q(1)],
    penalty: NO,
    lingrongSecret: "wangyeZengwu",
    resolvedText: "清誉 +1",
    unresolvedText: "无额外效果，事件消失",
    note: "第 5 回合【桐花台初遇】之后洗入机会池。",
    resolvedStory: {
      jinyanShenxing: "你只与他说了几句诗文，便以礼告退。他站在廊下看你走远，没有再说话。",
      yirongZhengsu: "你理了理鬓边的珠花，与他说了几句闲话。他笑着说，宫里难得有人肯听他讲这些。",
      guojunwangXiangzhu: "他递给你一卷手抄的诗集，说是在外头游历时随手记下的。你翻了两页，字迹潇洒，像他这个人。",
    },
  },
  qingmaiBaoxi: {
    id: "qingmaiBaoxi",
    kind: "opportunity",
    name: "请脉报喜",
    emoji: "💗",
    flavor: "你近来总是懒懒的，闻不得油腥，晨起时还常犯恶心。碎玉轩的人看在眼里，太医院也派了人来请脉。",
    reward: NO,
    penalty: NO,
    double: ["wenTaiyiZhenzhi", "shoulongRenxin", "jinyanShenxing"],
    resolvedText: "太医确诊喜脉，晋为嫔",
    unresolvedText: "这回没能稳妥报喜：洗回机会牌池，下次再来",
    note: "只在贵人有孕时洗入。同一回合打出温太医相助、收拢人心、谨言慎行中任意 2 张，方能顺利晋封。",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初诊了又诊，才敢跪下道喜。消息传到养心殿，皇上当即下旨晋你为嫔。",
      shoulongRenxin: "你早早打点了太医院，来请脉的太医一句也不敢含糊。皇上当即下旨晋你为嫔。",
      jinyanShenxing: "你沉住气，等太医确诊了才让人去报喜。皇上大喜，当即下旨晋你为嫔。",
    },
  },
  yanqingTanbing: {
    id: "yanqingTanbing",
    kind: "opportunity",
    name: "延庆殿探病",
    emoji: "🍵",
    flavor: "端妃旧疾缠身，延庆殿里终年弥漫着药味。你常去陪她说话，听她断断续续讲些宫里的旧事。",
    reward: [q(1)],
    penalty: NO,
    ally: "duanfei",
    resolvedText: "清誉 +1；第一次把握时获得【端妃相护】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初替端妃换了一张方子。端妃喝了药，靠在榻上看了你许久，才说：「皇后那里，你要当心。」",
      jinyanShenxing: "你陪端妃坐了一下午，说的都是些闲话。临走时她握了握你的手，那手凉得像冰。",
    },
  },
  xianfuXianhua: {
    id: "xianfuXianhua",
    kind: "opportunity",
    name: "咸福宫闲话",
    emoji: "🧵",
    flavor: "敬妃膝下无子，最盼着你的孩子。她做了一双小小的虎头鞋送来。",
    reward: [q(1)],
    penalty: NO,
    ally: "jingfei",
    resolvedText: "清誉 +1；第一次把握时获得【敬妃之谊】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      meizhuangXiangzhu: "眉庄陪你去咸福宫回礼。敬妃抱着你送的小衣裳，眼圈都红了：「往后这孩子，我也替你看顾着。」",
      jinyanShenxing: "你亲自去咸福宫道谢，与敬妃说了半日孩子的事。她说话慢慢的，叫人心里踏实。",
    },
  },
  kuairenKuaiyu: {
    id: "kuairenKuaiyu",
    kind: "opportunity",
    name: "快人快语",
    emoji: "🗣️",
    flavor: "欣贵人看不惯齐妃，常替你抱不平。这日她又跑来碎玉轩，一进门就嚷着要喝你这里的茶。",
    reward: [sc(1)],
    penalty: NO,
    ally: "xin",
    resolvedText: "圣宠 +1；第一次把握时获得【欣贵人解围】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      shoulongRenxin: "你让小允子备了她最爱吃的点心。欣贵人吃得高兴，拍着胸脯说往后谁敢欺负你，她第一个不答应。",
      yirongZhengsu: "你陪她去御花园走了一圈，正遇上皇上。欣贵人一张嘴把皇上逗笑了，皇上顺口夸了你一句。",
    },
  },
  yuhuayuanXin: {
    id: "yuhuayuanXin",
    kind: "opportunity",
    name: "御花园赏花·欣贵人邀游",
    emoji: "🌸",
    flavor: "欣贵人兴冲冲邀你同游御花园，说牡丹开得正好。不巧走到半路，远远瞧见齐妃也带着人在园子里赏花。",
    reward: [sc(1)],
    penalty: NO,
    ally: "xin",
    pair: "yuhuayuan",
    resolvedText: "圣宠 +1；第一次把握时获得【欣贵人解围】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jinyanShenxing: "齐妃走远了，欣贵人挽着你笑：「你那一句不软不硬，我接得可痛快。早该有人治治她了。」两人在花下一直说到日头西斜。",
      yirongZhengsu: "你陪欣贵人在花下走了一圈，说说笑笑，倒把方才的不快都忘了。",
      shoulongRenxin: "你让宫人给欣贵人送去一盆开得正好的芍药，她高兴得当天就来回礼。",
    },
  },
  xianfuJing: {
    id: "xianfuJing",
    kind: "opportunity",
    name: "咸福宫托付·敬妃求助",
    emoji: "🧵",
    flavor: "敬妃请你帮着拟一份宫务条陈，说你识字明理，比她自己写得好。",
    reward: [q(1)],
    penalty: NO,
    ally: "jingfei",
    pair: "xianfu",
    resolvedText: "清誉 +1；第一次把握时获得【敬妃之谊】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      meizhuangXiangzhu: "眉庄陪你在咸福宫把条陈一字一字斟酌定了。敬妃拉着你们俩的手说：「往后咸福宫的门，你们随时来。」",
      shoulongRenxin: "你托小允子去内务府问清了各处的规矩，条陈写得周周全全。敬妃拿着看了三遍。",
      jinxiXiangzhu: "槿汐对宫里的规矩比谁都熟，一条一条替你核过。敬妃说，这份情她记下了。",
    },
  },
  yanqingDuan: {
    id: "yanqingDuan",
    kind: "opportunity",
    name: "延庆殿夜话·端妃旧话",
    emoji: "🍵",
    flavor: "夜里你去延庆殿探望端妃。她屏退了所有宫人，只留一盏孤灯，几次欲言又止，像是有积压多年的话要对你说。",
    reward: [q(1)],
    penalty: NO,
    ally: "duanfei",
    pair: "yanqing",
    resolvedText: "清誉 +1；第一次把握时获得【端妃相护】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初诊完脉，便退到殿外守着。门一关上，端妃才慢慢说起景仁宫的旧事，说一句，停一停。她说，如今的皇后和故去的纯元皇后原是同父异母的姐妹，姐姐是嫡出，她是庶出，姐姐去后，她才一步步坐上了凤位。",
      shoulongRenxin: "你让小允子守着殿门。端妃这才开口，说起纯元皇后当年的事，说到一半，停住了。末了她轻轻补了一句：「如今的皇后，是纯元皇后同父异母的庶妹。」",
      jingguanQibian: "你只是静静坐着，不催也不问。端妃看了你很久，终于说：「皇后这个人，从来不是表面上那样。她和纯元皇后是同父异母的姐妹，姐姐是嫡出，她是庶出。姐姐在时，她不过是跟在后头的庶妹。」",
    },
  },
  // ---- 第一幕 · 危机
  gongzhongLiuyan: {
    id: "gongzhongLiuyan",
    kind: "crisis",
    name: "蜚语盈廊",
    emoji: "🗣️",
    flavor: "华妃倒了，宫里的闲话却没少。这几日不知是谁起的头，都在说碎玉轩恩宠太盛、手段太巧，一传十，十传百。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "liuyanChanshen",
    resolveCost: [q(-1)],
    resolvedText: "移除事件；化解也要清誉 -1",
    unresolvedText: "未来 3 回合每回合抓牌 -1",
    resolvedStory: {
      jinyanShenxing: "你闭门不出，见了谁都只说些天气花草。流言找不到新的话柄，几日便散了。",
      meizhuangXiangzhu: "眉庄在各宫走动，不急不恼，只说一句：「我是被流言害过的人，最知道它怎么起。」她顺藤摸瓜寻出了嚼舌根的宫女，当着众人处置了。流言一夜之间没了声息。",
      shoulongRenxin: "你让小允子拿了些碎银子，在各宫的宫人间打点了一圈。流言渐渐没人再提。",
      jinxiXiangzhu: "槿汐暗中寻到了传话的源头，把几个碎嘴的宫人敲打了一番。流言没了下文。",
    },
  },
  neiwufuDiaonan: {
    id: "neiwufuDiaonan",
    kind: "crisis",
    name: "内务府刁难",
    emoji: "📦",
    flavor: "这个月的份例迟迟没有送来，去问时，内务府的人只说账目还没理清，让碎玉轩再等等。",
    reward: NO,
    penalty: [q(-1)],
    resolveCost: [sc(-1)],
    resolvedText: "移除事件；化解也要圣宠 -1",
    unresolvedText: "清誉 -1",
    note: "用收拢人心解决时额外抽 1 张。",
    resolvedStory: {
      shoulongRenxin: "小允子拿了银子去内务府打点，当天下午份例便一样不少地送到了碎玉轩。",
      meizhuangXiangzhu: "眉庄想起闲月阁那个冬天，炭火也是这样被克扣的，冷笑道：「这套把戏，我早领教过。」她把自己宫里的份例分了一半送来，又让采月去敲打内务府，没过两日便补齐了。",
      jinxiXiangzhu: "槿汐拿着份例单子去内务府对账，一笔一笔说得清清楚楚，管事太监只得赔着笑补齐。",
    },
  },
  liyiShiwu: {
    id: "liyiShiwu",
    kind: "crisis",
    name: "仪态微瑕",
    emoji: "🎎",
    flavor: "景仁宫请安时，你一时头晕，起身时碰翻了案上的茶盏，滚烫的茶水溅在手背上，红了一片，满殿的人都看了过来。",
    reward: NO,
    penalty: [q(-1), sc(-1)],
    resolvedText: "移除事件",
    unresolvedText: "清誉 -1、圣宠 -1",
    note: "用陵容相助解决时，她会送来舒痕胶（🧴）；有害时改为未来 2 回合不能打仪容整肃、谨言慎行，不能侍寝，不伤胎。",
    resolvedStory: {
      yirongZhengsu: "你当即整好衣饰、从容请罪，礼数周全得挑不出错处。",
      wenTaiyiZhenzhi: "温实初替你出了一张脉案，说你那几日头晕乏力。众人这才知道你是抱病强撑。",
    },
  },
  suiyuxuanXianhua: {
    id: "suiyuxuanXianhua",
    kind: "crisis",
    name: "碎玉轩闲话",
    emoji: "🗣️",
    flavor: "碎玉轩里有人嚼舌根，说小主如今眼里只有皇上，待下人越发冷淡了。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "xianhuaChuanKai",
    halfStatusTurns: 1,
    needTwo: true,
    resolveCost: [q(-1)],
    resolvedText: "移除事件；需打出两张解牌；化解也要清誉 -1",
    unresolvedText: "未来 2 回合每回合抓牌 -1（至少 1 张）；只打出一张解牌则只持续 1 回合",
    resolvedStory: {
      jinxiXiangzhu: "槿汐把碎玉轩上下叫到一处，不轻不重地说了几句。往后再没人敢乱说话。",
      shoulongRenxin: "你赏了碎玉轩上下每人一个月的月钱。宫人们感恩戴德，闲话也就没了。",
    },
  },
  qifeiXunxin: {
    id: "qifeiXunxin",
    kind: "crisis",
    name: "齐妃寻衅",
    emoji: "🌰",
    xinCover: "齐妃那句讥讽还没落地，欣贵人先笑出了声：「齐妃姐姐这话酸的，莫不是昨夜没睡好？」满殿的人都低头憋着笑，齐妃脸上挂不住，那桩事也就这么揭过去了。",
    flavor: "景仁宫请安时，齐妃当着众人的面讥讽你：「莞嫔如今可是皇上心尖上的人了。」",
    reward: NO,
    penalty: [q(-2)],
    penaltyStatus: "liuyanChanshen",
    rival: "qifei",
    needTwo: true,
    suppressCard: "jinyanShenxing",
    secret: "chuyanDingzhuang",
    resolveCost: [sz(-1)],
    resolvedText: "移除事件；两张解牌含谨言慎行即打压齐妃，获得【打压·齐妃】；化解也要身子 -1",
    unresolvedText: "清誉 -2、未来 3 回合每回合抓牌 -1",
    resolvedStory: {
      jinyanShenxing: "你笑着回了一句：「娘娘说笑了，三阿哥的功课，皇上才是放在心尖上的。」齐妃一时下不来台，再没敢开口。",
      meizhuangXiangzhu: "眉庄不咸不淡地接过话头，把齐妃的话轻轻挡了回去。",
      jinxiXiangzhu: "槿汐适时上前回话，说皇后宫里的茶凉了，替你把话岔开了。",
    },
  },
  sanAgeYaochong: {
    id: "sanAgeYaochong",
    kind: "crisis",
    name: "三阿哥邀宠",
    emoji: "📚",
    xinCover: "欣贵人见皇上连着几日都在长春宫，大大方方进去请安，借口自己公主的功课求皇上指点，三言两语又把话头引回了六宫，齐妃的小算盘没能得逞。",
    flavor: "齐妃拿三阿哥的功课做由头，把皇上请进了长春宫，一连几日都没放人出来，六宫的风向悄悄变了。",
    reward: NO,
    penalty: [sc(-2)],
    rival: "qifei",
    needTwo: true,
    suppressCard: "yirongZhengsu",
    resolveCost: [q(-1)],
    resolvedText: "移除事件；两张解牌含仪容整肃即打压齐妃，获得【打压·齐妃】；化解也要清誉 -1",
    unresolvedText: "圣宠 -2",
    resolvedStory: {
      yirongZhengsu: "你换了一身新裁的衣裳，在皇上回养心殿的路上候着。皇上远远看见，便不往长春宫去了。",
      jingguanQibian: "你按兵不动。三阿哥的功课本就不好，皇上考了几回，自己便没了兴致。",
    },
  },
  xinrenZhengchong: {
    id: "xinrenZhengchong",
    kind: "crisis",
    name: "新人争宠",
    emoji: "💃",
    xinCover: "欣贵人在一旁看得直撇嘴，当着皇上的面说：「新人鲜亮，咱们这些老人也不差呀。」又拉着你坐到皇上近前，祺贵人那点抢风头的心思，白费了。",
    flavor: "祺贵人新近入宫，在御花园里“偶遇”了皇上，笑得比花还艳，皇上当晚便翻了她的牌子。",
    reward: NO,
    penalty: [sc(-2)],
    rival: "guaerjia",
    needTwo: true,
    suppressCard: "yirongZhengsu",
    secret: "shanduShide",
    resolvedText: "移除事件；两张解牌含仪容整肃即打压祺贵人，获得【打压·祺贵人】",
    unresolvedText: "圣宠 -2",
    resolvedStory: {
      yirongZhengsu: "你在同一处园子里赏花，一身素净，倒衬得祺贵人过于艳丽。皇上看了你们一眼，携了你的手走了。",
      jinyanShenxing: "你不争不抢，只在皇上跟前提了一句祺贵人年轻活泼。皇上笑笑，倒觉得你大度。",
    },
  },
  emingCanben: {
    id: "emingCanben",
    kind: "crisis",
    name: "鄂敏参本",
    emoji: "📜",
    xinCover: "欣贵人在殿上直言：「甄大人的事前朝自有公断，哪有拿后宫姐妹的家世说嘴的道理。」祺贵人被噎得说不出话，那道折子的分量也就轻了几分。",
    flavor: "祺贵人的父亲鄂敏在前朝递了一道折子，参甄远道平日文字轻狂、结交不慎，字字句句都冲着甄家而来。",
    reward: NO,
    penalty: [q(-4)],
    halfPenalty: [q(-1)],
    resolveCost: [q(-1)],
    penaltyStatus: "fuxiongMengchen",
    rival: "guaerjia",
    needTwo: true,
    suppressCard: "shoulongRenxin",
    secret: "yuanwangJunfu",
    resolvedText: "移除事件；化解也要清誉 -1；两张解牌含收拢人心即打压祺贵人，获得【打压·祺贵人】",
    unresolvedText: "清誉 -4、获得【父兄蒙尘】；只打出一张解牌则清誉 -1、仍获得【父兄蒙尘】",
    note: "第 5 回合起洗入危机池，甄远道下狱后不再出现。",
    resolvedStory: {
      shoulongRenxin: "你托人在前朝周旋，鄂敏的折子被压了下来，留中不发。",
      meizhuangXiangzhu: "眉庄托沈家在前朝替甄家说了几句话，折子到底没掀起什么风浪。",
    },
  },
  yuhuayuanQi: {
    id: "yuhuayuanQi",
    kind: "crisis",
    name: "御花园赏花·齐妃讥讽",
    emoji: "🌸",
    xinCover: "欣贵人嗓门一提，笑着堵了回去：「齐妃姐姐这是羡慕咱们说话投缘吧？风光不风光的，姐姐先把三阿哥的功课看紧些。」满园宫人都憋着笑，齐妃讪讪地走了。",
    flavor: "齐妃带着宫人在御花园里迎面撞上你和欣贵人，上下打量了你一番，阴阳怪气地说：「莞嫔如今有欣贵人作陪，好大的风光。只是这宫里的风光，从来都是一阵一阵的。」当着满园宫人的面，句句带刺。",
    reward: NO,
    penalty: [q(-2)],
    rival: "qifei",
    needTwo: true,
    pair: "yuhuayuan",
    resolvedText: "移除事件；与【御花园赏花·欣贵人邀游】相连",
    unresolvedText: "清誉 -2；【御花园赏花·欣贵人邀游】随之作废",
    resolvedStory: {
      jinyanShenxing: "你只淡淡回了一句「娘娘教训的是」，欣贵人立刻接过话头，三言两语说得齐妃面红耳赤，拂袖走了。",
      jingguanQibian: "你不接她的话，只顾着赏花。齐妃自讨没趣，悻悻地走了。",
      jinxiXiangzhu: "槿汐上前行了个礼，说皇后正找齐妃娘娘，齐妃只得走了。",
    },
  },
  xianfuQi: {
    id: "xianfuQi",
    kind: "crisis",
    name: "咸福宫托付·祺贵人告状",
    emoji: "🧵",
    xinCover: "欣贵人立刻替你分辩：「敬妃姐姐托人写条陈，是帮忙，哪里谈得上越权？祺贵人要是看不惯，下回也替敬妃姐姐写一份呀。」皇后听了，只好笑着把这事放下。",
    flavor: "祺贵人在皇后面前告了你一状，说你一个后宫嫔御，竟越权替敬妃拟宫务条陈，「眼里怕是没有中宫了」。",
    reward: NO,
    penalty: [q(-2)],
    rival: "guaerjia",
    needTwo: true,
    pair: "xianfu",
    resolvedText: "移除事件；与【咸福宫托付·敬妃求助】相连",
    unresolvedText: "清誉 -2；【咸福宫托付·敬妃求助】随之作废",
    resolvedStory: {
      meizhuangXiangzhu: "皇后召你去问越权的事，眉庄陪着同去。她把条陈一页页摊开：「这是敬妃娘娘的意思，嫔妾们不过代笔。」祺贵人被问得答不上话来。",
      jinyanShenxing: "你在皇后面前只说是替敬妃抄写，一个字也没多说。皇后挑不出错，只得罢了。",
      jingguanQibian: "你按下不动，等皇后自己去问敬妃。敬妃一句话，便把这事揭过去了。",
    },
  },
  yanqingQi: {
    id: "yanqingQi",
    kind: "crisis",
    name: "延庆殿夜话·齐妃探病",
    emoji: "🍵",
    xinCover: "欣贵人恰巧也来看端妃，一进门便大着嗓门道：「齐妃姐姐也来了？正好，一起坐下说说话。」她拉着齐妃东拉西扯，齐妃探不出半点口风，只能悻悻地回去复命。",
    flavor: "齐妃奉皇后之命来延庆殿“探病”，正撞见你和端妃说话，眼神在你们两人之间转了好几个来回。",
    reward: NO,
    penalty: [q(-2)],
    rival: "qifei",
    needTwo: true,
    pair: "yanqing",
    resolvedText: "移除事件；与【延庆殿夜话·端妃旧话】相连",
    unresolvedText: "清誉 -2；【延庆殿夜话·端妃旧话】随之作废",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初提着药箱进来，说该给端妃请脉了，病人须得静养。齐妃坐不住，客客气气地被请了出去。",
      jinxiXiangzhu: "槿汐引着齐妃去偏殿喝茶，絮絮叨叨说了好些闲话，齐妃什么也没听着。",
      jinyanShenxing: "你只说是来给端妃送药的，说完便告退。齐妃回去，什么也说不出来。",
    },
  },
  // ---- 第一幕 · 皇后事件（恩赏：默认收下，暗留把柄；打出列出的牌换一份赏赐，不留把柄）
  jingrenHoushang: {
    id: "jingrenHoushang",
    kind: "huanghou",
    needTwo: true,
    name: "景仁宫厚赏",
    emoji: "🎁",
    flavor: "景仁宫的剪秋亲自送来几匹云锦和一支点翠步摇，说是皇后特意挑的，给碎玉轩添喜，言语间满是体恤。",
    reward: [sc(1)],
    penalty: NO,
    cardReward: { jinyanShenxing: [q(1)], jinxiXiangzhu: [sz(1)] },
    resolvedText: "同回合打出两张匹配牌；谨言慎行：清誉 +1；槿汐相助：身子 +1",
    unresolvedText: "圣宠 +1",
    resolvedStory: {
      jinyanShenxing: "你说嫔妾福薄，受不起这样的厚赏，只收下了一匹素缎。皇后笑着说你太过谨慎，这话传到寿康宫，太后倒夸你知道分寸。",
      jinxiXiangzhu: "槿汐替你回了话，说小主素来不爱鲜亮的颜色。皇后便改赏了几盒燕窝，槿汐把燕窝收进小厨房，每日炖好了给你送去。",
    },
  },
  xieliGongwu: {
    id: "xieliGongwu",
    kind: "huanghou",
    needTwo: true,
    name: "协理宫务",
    emoji: "📜",
    flavor: "皇后说六宫琐事繁杂，一人照应不过来，请你帮着打理一二，语气和气得叫人不好推辞。",
    reward: [q(1)],
    penalty: NO,
    cardReward: { jinyanShenxing: [sc(1)], meizhuangXiangzhu: [sz(1)] },
    resolvedText: "同回合打出两张匹配牌；谨言慎行：圣宠 +1；眉庄相助：身子 +1",
    unresolvedText: "清誉 +1",
    resolvedStory: {
      jinyanShenxing: "你推说自己年轻，不懂这些，怕误了娘娘的事。皇上听说了，倒夸你不揽权、识大体。",
      meizhuangXiangzhu: "眉庄替你说了几句，说你身子要紧，不如由她来帮衬。皇后笑着应了，你也落得清闲，好好歇了几日。",
    },
  },
  antaiBupin: {
    id: "antaiBupin",
    kind: "huanghou",
    name: "安胎补品",
    emoji: "🍲",
    flavor: "景仁宫送来一盅安胎的补品，剪秋说是皇后亲手吩咐小厨房炖的。",
    reward: [q(1)],
    penalty: NO,
    lingrongSecret: "qiciBuyong",
    cardReward: { wenTaiyiZhenzhi: [sz(1)], jinxiXiangzhu: [sz(1)] },
    resolvedText: "温太医相助或槿汐相助：身子 +1",
    unresolvedText: "清誉 +1",
    note: "只在有孕时出现。",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初照例看过才让你用。补品并无不妥，他又添了两味药，另开了一张安胎的方子。",
      jinxiXiangzhu: "槿汐谢了赏，替你收下，转头吩咐小厨房另炖了一盅清润的，说小主这几日胃口淡，补品先温着，换着用。",
    },
  },
  jiayanXianyi: {
    id: "jiayanXianyi",
    kind: "huanghou",
    needTwo: true,
    name: "家宴献艺",
    emoji: "🎵",
    flavor: "家宴将近，皇后特意把你唤去，说皇上最爱听你弹琴，请你在席上弹一曲，也好让太后高兴高兴。",
    reward: [sc(1)],
    penalty: NO,
    lingrongSecret: "jierenYaochong",
    cardReward: { jingguanQibian: [q(1)], jinyanShenxing: [sz(1)] },
    resolvedText: "同回合打出两张匹配牌；静观其变：清誉 +1；谨言慎行：身子 +1",
    unresolvedText: "圣宠 +1",
    resolvedStory: {
      jingguanQibian: "你推说指上的伤还没好，只在席间安安静静地坐着。太后看在眼里，说你稳重。",
      jinyanShenxing: "你说近来身子乏，不宜劳神，请皇后另择他人。皇后点点头，说你懂事。你早早回宫歇下了。",
    },
  },
  shanghuaXiaoju: {
    id: "shanghuaXiaoju",
    kind: "huanghou",
    name: "赏花小聚",
    emoji: "🏮",
    flavor: "皇后召各宫去御花园赏花，特意吩咐让陵容陪你同去，说你们姐妹一向亲厚。",
    reward: [q(1)],
    penalty: NO,
    lingrongSecret: "xijianSiyu",
    cardReward: { shoulongRenxin: [sz(1)], meizhuangXiangzhu: [sc(1)] },
    resolvedText: "收拢人心：身子 +1；眉庄相助：圣宠 +1",
    unresolvedText: "清誉 +1",
    resolvedStory: {
      shoulongRenxin: "你托人告了假，说身子不适，在屋里安安静静歇了一日。第二日让小允子给各宫送了些点心赔礼。",
      meizhuangXiangzhu: "眉庄陪你去坐了一会儿，便借口要去太后宫里，把你一起带了出来。正巧皇上也来寿康宫请安，留你们说了好一会儿话。",
    },
  },
  // ---- 第二、三幕 · 机会
  foqianGongdeng: {
    id: "foqianGongdeng",
    kind: "opportunity",
    name: "佛前供灯",
    emoji: "🕯️",
    flavor: "大殿里的长明灯要人夜夜添油，一盏一盏数过去，足有三四十盏。这活儿清苦，却也清净，正好让人把心事沉下来。",
    reward: NO,
    penalty: NO,
    resolvedText: "下回合出牌 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      chanyuXiushen: "你跪在佛前，一盏一盏地添灯油。灯火映着佛像的脸，慈悲又遥远。",
      jinxiXiangzhu: "槿汐陪你在佛前跪了一夜。天亮时，几个小尼姑偷偷看你，眼里少了些轻慢。",
    },
  },
  gongzhongLaixin: {
    id: "gongzhongLaixin",
    kind: "opportunity",
    name: "宫中来信",
    emoji: "✉️",
    flavor: "有人托山下的小贩捎来一封信。信封上没有落款，你却认得那字迹——笔锋瘦劲，收尾处总带一点倔强，是沈眉庄的手笔。",
    reward: [q(1)],
    penalty: NO,
    resolvedText: "清誉 +1（眉庄解决时翻倍）；有【敬妃之谊】时另身子 +1",
    unresolvedText: "有【敬妃之谊】时仍身子 +1，事件消失",
    resolvedStory: {
      meizhuangXiangzhu:
        "你拆开信，是眉庄的字迹，写得很长，足足三页。她说：「宫里一切都好，你不必挂心，只管保重自己。」信末又添一句：「胧月的事，我时时托人打听，一有准信，立刻写给你。」包袱里是厚实的冬衣和几包药材，药包上还压着一张她亲笔写的服法。你读到最后，眼眶发热，把信折了又折，贴身收好。",
      jinxiXiangzhu:
        "槿汐托人去山下取了信，一路藏在怀里带回来，还带着她的体温。你拆开一看，是眉庄的字迹，劈头便问你冷不冷、病好了没有，说宫里一切都好，叫你千万保重。末了一句：「胧月的事，我时时托人打听，一有准信，立刻写给你。」槿汐在一旁抹着眼泪，说：「娘娘，眉庄小主心里一直惦记着您呢。」",
    },
  },
  jinganChuilian: {
    id: "jinganChuilian",
    kind: "opportunity",
    name: "慈云覆荫",
    emoji: "🍵",
    flavor: "静岸师太在廊下遇见你，停下来问了一句：「近来可还住得惯？」",
    peakFlavor: "静岸师太拄着拐杖，一步一步爬上了凌云峰，说是放心不下，要亲眼来看看你的病好些没有。",
    reward: NO,
    penalty: NO,
    resolvedText: "下一次危机未化解时免罚",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      chanyuXiushen: "你与师太说了几句禅理。师太点点头：「你倒是有慧根。」此后静白再刁难你，师太总会拦一拦。",
      jingchaiBuqun: "你挽着袖子在井边洗衣，手冻得通红。师太看了你半晌，叹了口气，吩咐人给你添一床被子。",
    },
  },
  shanzhongCaiyao: {
    id: "shanzhongCaiyao",
    kind: "opportunity",
    name: "山中采药",
    emoji: "🌿",
    flavor: "后山坡上长着些野生草药，你蹲下身辨认，有几样竟是从前温实初教过你的，叶子的纹路至今还记得。",
    reward: [sz(1)],
    penalty: NO,
    resolvedText: "身子 +1；移除 1 个负面状态",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi: "你照着温实初写的方子采了几味药，熬了一碗喝下，夜里总算睡得安稳了。",
      jingchaiBuqun: "你背着竹篓在山里走了大半日，采回一篓草药。手上划了好几道口子，心里却松快了些。",
      guojunwangXiangzhu: "他陪你在山里走了一下午，认得的草药比你还多。回来时，他手里还多了一束野花。",
    },
  },
  chanfangChaojing: {
    id: "chanfangChaojing",
    kind: "opportunity",
    name: "禅房抄经",
    emoji: "📖",
    flavor: "师太把一卷《金刚经》和笔墨放到你案上，说：「不急着抄完，一笔一画抄下来，心也就静了。」",
    reward: NO,
    penalty: NO,
    resolvedText: "未来 3 回合，每回合抓牌 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      chanyuXiushen: "你一笔一画地抄，抄到「一切有为法，如梦幻泡影」，笔停了很久。",
      jingxinRennai: "你抄了一夜，烛花爆了又爆，手腕酸了，心里那些翻来覆去的念头却慢慢空了下来。",
    },
  },
  moyanYuanshou: {
    id: "moyanYuanshou",
    kind: "opportunity",
    name: "默然分劳",
    emoji: "🤲",
    flavor: "寺里的莫言师父看不惯静白，悄悄走过来：「这活儿我替你担半天。」",
    peakFlavor: "莫言师父背着一捆柴、一袋米，沿着陡峭的山路一声不吭地上了凌云峰，放下东西就要走。",
    reward: NO,
    penalty: NO,
    resolvedText: "本回合出牌 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jingchaiBuqun: "你与她并肩干了一会儿活。她话不多，手脚却麻利，剩下的半天，你总算能喘口气。",
      jinxiXiangzhu: "槿汐谢过莫言，两人分着担了活计，你这一日难得清闲。",
    },
  },
  yuexiaDuitan: {
    id: "yuexiaDuitan",
    kind: "opportunity",
    name: "月下对谈",
    emoji: "🌙",
    flavor: "他又来了。凌云峰的夜里月亮很大，照得山路一片白，他提着一盏灯笼站在院门外，说是路过，却不肯走。",
    reward: NO,
    cardReward: { chanyuXiushen: [q(1)] },
    penalty: NO,
    place: "peak",
    resolvedText: "果郡王解决：抽 1 张；禅语修身解决：清誉 +1",
    unresolvedText: "无额外效果，事件消失",
    note: "凌云峰起加入；第三幕移出。",
    resolvedStory: {
      guojunwangXiangzhu: "你们坐在石阶上说了半夜的话。他说起小时候的事，你笑了，那是你出宫以后第一次笑。",
      chanyuXiushen: "你与他谈禅，他听得认真。发乎情，止乎礼，这样就够了。",
    },
  },
  // ---- 第二、三幕 · 危机
  tanhuoLiangmi: {
    id: "tanhuoLiangmi",
    kind: "crisis",
    name: "断炭缺粮",
    emoji: "🔥",
    flavor: "静白又克扣了你屋里的炭火，说寺里清苦，修行之人不该贪暖，转身却让自己屋里的炭盆烧得旺旺的。",
    peakFlavor: "大雪封了山路，凌云峰上缺炭少粮，屋里的水缸结了一层冰，被褥又薄又潮，冷得像冰窖。",
    reward: NO,
    penalty: [sz(-1)],
    resolveCost: [sz(-1)],
    penaltyStatus: "hanzheng",
    jingbai: true,
    needTwo: true,
    halfStatusTurns: 1,
    resolvedText: "移除事件；需打出两张解牌；熬过去也要身子 -1",
    unresolvedText: "身子 -1，未来 2 回合每回合末身子 -1；只打出一张解牌则只持续 1 回合",
    note: "寺中算静白刁难（🧹）；凌云峰上是风雪断粮。",
    resolvedStory: {
      jingchaiBuqun: "你自己上山拾了一捆柴，手上磨出了血泡。屋里总算有了点暖气。",
      jinxiXiangzhu: "槿汐不知从哪里弄来半篓炭，只说是跟厨房的师父讨的。",
      meizhuangXiangzhu: "眉庄托人送来的包裹里，有炭、有米，还有一件厚厚的棉袍。",
      guojunwangXiangzhu: "阿晋趁夜送来两大车炭和米，说是王爷的意思，别的一句也不肯多说。",
    },
  },
  fazuoCuhuo: {
    id: "fazuoCuhuo",
    kind: "crisis",
    name: "杂役磋磨",
    emoji: "🪣",
    flavor: "静白说你念经时偷懒，罚你一日之内挑满后院七八口水缸，再劈完一院子的柴，不干完不许吃饭。",
    reward: NO,
    penalty: [sz(-2), q(-1)],
    halfPenalty: [sz(-1), q(-1)],
    resolveCost: [q(-1)],
    needTwo: true,
    jingbai: true,
    place: "temple",
    resolvedText: "移除事件；需打出两张解牌；化解也要清誉 -1",
    unresolvedText: "身子 -2、清誉 -1（挑水劈柴，累倒在井边）；只打出一张解牌则身子 -1、清誉 -1",
    resolvedStory: {
      jingchaiBuqun: "你一声不吭地把活干完了，干得又快又好。静白挑了半天，没找出错来。",
      jinxiXiangzhu: "槿汐抢着替你挑了一半的水。她年纪大了，回来时腰都直不起来。",
      jingxinRennai: "你咬着牙，一桶一桶地挑。挑到最后，竟也不觉得累了。",
    },
  },
  wutouXiangyou: {
    id: "wutouXiangyou",
    kind: "crisis",
    name: "功德箱失窃",
    emoji: "📿",
    flavor: "功德箱里少了几吊香油钱，静白一口咬定是你拿的，当着满寺的师父要你给个交代。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "xiangyouYiyun",
    resolveCost: [q(-1)],
    jingbai: true,
    place: "temple",
    resolvedText: "移除事件；化解也要清誉 -1",
    unresolvedText: "未来 3 回合每回合末清誉 -1",
    resolvedStory: {
      chanyuXiushen: "你在佛前跪下，平平静静地说：「佛祖在上，弟子没有。」师太看了你一眼，叫静白去查别处。",
      jinxiXiangzhu: "槿汐站出来作证，说那日小主一直在屋里抄经，她寸步不离地守着。",
    },
  },
  yebanJingrao: {
    id: "yebanJingrao",
    kind: "crisis",
    name: "夜半惊扰",
    emoji: "🐺",
    flavor: "半夜里山上起了狼嚎，一声比一声近，窗纸被风吹得簌簌直响，你再难入睡。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "jingji",
    needTwo: true,
    halfStatusTurns: 1,
    place: "peak",
    resolveCost: [q(-1)],
    resolvedText: "移除事件；需打出两张解牌；化解也要清誉 -1",
    unresolvedText: "未来 2 回合不能打出禅语修身；只打出一张解牌则只持续 1 回合",
    resolvedStory: {
      jingxinRennai: "你把油灯拨亮了些，坐着念了一夜的经。天亮时，狼嚎声也远了。",
      wenTaiyiZhenzhi: "你照着温实初留下的方子煎了一碗安神药，喝下去便睡着了。",
      guojunwangXiangzhu: "他在你门外守了一夜。第二天一早，你推门出去，看见他靠着廊柱睡着了。",
    },
  },
  xianrenKuitan: {
    id: "xianrenKuitan",
    kind: "crisis",
    name: "耳目窥伺",
    emoji: "👀",
    flavor: "这几日，有几个寺里的小尼姑总在凌云峰的院墙外转悠，探头探脑，窃窃私语，像是受了什么人的差遣。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "yanxianHuansi",
    place: "peak",
    resolvedText: "移除事件",
    unresolvedText: "未来 2 回合每回合抓牌 -1（至少 1 张）；本回合若打出过果郡王相助，再清誉 -1（被撞见）",
    resolvedStory: {
      chanyuXiushen: "你开门请她们进来喝茶，念了一段经给她们听。她们听得无趣，便不再来了。",
      jinxiXiangzhu: "槿汐拿着扫帚迎了出去，笑着问她们是来扫地的还是来看热闹的，几句话就把人打发走了。",
    },
  },
  jingrenLairen: {
    id: "jingrenLairen",
    kind: "crisis",
    name: "景仁宫来人",
    emoji: "🏵️",
    flavor: "景仁宫的人借着送香油钱的名头上了山，眼睛一直往你身上瞟，还一再问起你近来都见过什么人。",
    reward: NO,
    penalty: NO,
    resolvedText: "移除事件",
    unresolvedText: "疑点 +1",
    note: "只在陵容怨怼退场时出现：她还在替皇后打听你的消息。",
    resolvedStory: {
      jinxiXiangzhu: "槿汐迎上去，说小主病着，见不得风。来人在门外站了半日，只好走了。",
      chanyuXiushen: "你隔着门静静念经，木鱼声不紧不慢，来人在门外站了许久，一句话也没问出来。",
      wenTaiyiZhenzhi: "温实初恰好来请脉，当着来人的面说你身子虚寒，开了几服补药。",
    },
  },
};

export const ACT1_OPPORTUNITIES: readonly OpportunityId3[] = [
  "huanghouShangshi",
  "huanghouShangshi",
  "taihouChuixun",
  "taihouChuixun",
  "yanqingTanbing",
  "xianfuXianhua",
  "kuairenKuaiyu",
  "yuhuayuanXin",
  "xianfuJing",
  "yanqingDuan",
];
export const ACT1_CRISES: readonly CrisisId3[] = [
  "gongzhongLiuyan",
  "gongzhongLiuyan",
  "neiwufuDiaonan",
  "neiwufuDiaonan",
  "liyiShiwu",
  "suiyuxuanXianhua",
  "suiyuxuanXianhua",
  "qifeiXunxin",
  "sanAgeYaochong",
  "xinrenZhengchong",
  "yuhuayuanQi",
  "xianfuQi",
  "yanqingQi",
];
export const HUANGHOU_EVENTS: readonly HuanghouId[] = ["jingrenHoushang", "xieliGongwu", "antaiBupin", "jiayanXianyi", "shanghuaXiaoju"];

export const TEMPLE_OPPORTUNITIES: readonly OpportunityId3[] = [
  "foqianGongdeng",
  "foqianGongdeng",
  "gongzhongLaixin",
  "gongzhongLaixin",
  "jinganChuilian",
  "shanzhongCaiyao",
  "chanfangChaojing",
  "moyanYuanshou",
  "moyanYuanshou",
];
export const TEMPLE_CRISES: readonly CrisisId3[] = ["tanhuoLiangmi", "tanhuoLiangmi", "fazuoCuhuo", "fazuoCuhuo", "wutouXiangyou"];
/** 凌云峰：静白刁难移出，山居三张加入。 */
export const PEAK_ADD_OPPORTUNITIES: readonly OpportunityId3[] = ["yuexiaDuitan"];
export const PEAK_ADD_CRISES: readonly CrisisId3[] = ["yebanJingrao", "xianrenKuitan"];

const ACT1_EVENTS: ReadonlySet<EventId3> = new Set<EventId3>([...ACT1_OPPORTUNITIES, ...ACT1_CRISES, ...HUANGHOU_EVENTS, "wangyeXiantan", "qingmaiBaoxi"]);

/** 事件上显示的「没化解」文本：第 25 回合果郡王翻船之后，耳目窥伺不再提「撞见」。 */
export function unresolvedText3(def: EventDef3, turn: number): string {
  return def.id === "xianrenKuitan" && turn >= 25 ? "未来 2 回合每回合抓牌 -1（至少 1 张）" : def.unresolvedText;
}

/** 手牌「匹配事件」只列这一幕（寺中 / 凌云峰）真的会出现的事件。 */
export function matchesInAct(matches: readonly EventId3[], act: Act, turn: number): EventId3[] {
  const onPeak = turn > STAGE3.templeLastTurn;
  return matches.filter((id) => {
    if (act === 1) return ACT1_EVENTS.has(id);
    if (ACT1_EVENTS.has(id)) return false;
    const place = EVENTS3[id].place;
    return !(place === "temple" && onPeak) && !(place === "peak" && !onPeak);
  });
}

// ---------------------------------------------------------------- 陵容（第一幕）

type TierTable = Record<LingrongTier, LingrongOutcome>;

/** Stage-2 tables reused for the shared events; stage-3 events get their own. */
export const LINGRONG_EVENT3: Partial<Record<EventId3, TierTable>> = {
  /** 只在栗糕清苦的条件下陵容才接得了（见 lizigaoOpen）；无论情分都能化解。 */
  sanAgeYaochong: {
    close: { resolves: true, relation: 1, story: "陵容听说皇上一连几日歇在长春宫，便抱着琵琶去了养心殿外的廊下，唱的是你从前教她的那支小曲。皇上循声出来，问她怎么不在碎玉轩陪着莞嫔，当晚便摆驾来看你，摸着你的肚子笑了好一会儿。" },
    distant: { resolves: true, relation: 1, story: "「姐姐如今身子重，这些事交给妹妹便是。」陵容往养心殿送了一回新调的安神香，顺口提了句碎玉轩夜里不大安稳。皇上第二日便离了长春宫，过来陪你坐了半晌。" },
    resentful: { resolves: true, relation: 1, story: "陵容低着头应了，隔了两日才来回话，说长春宫那边已经消停了。皇上果然不往长春宫去了，只来碎玉轩坐了不到一盏茶的工夫，又说要去听陵容新学的曲子。" },
  },
  huanghouShangshi: {
    close: { resolves: true, relation: 1, effects: [sc(1)], story: "陵容陪你去景仁宫晨省。皇后拉着你们俩问长问短，又各赏了一对玉镯。出来时陵容挽着你，说这镯子最衬姐姐。" },
    distant: { resolves: true, effects: [sc(1)], story: "陵容随你去了景仁宫，皇后温言问了几句，各赏了东西。一路回来，她话不多，只说了句「姐姐受累了」。" },
    resentful: { resolves: false, story: "晨省时皇后的话头多半落在陵容身上，你只在一旁坐着。出来后她站了片刻，没有说话，各自回宫去了。" },
  },
  gongzhongLiuyan: {
    close: { ...LINGRONG_EVENT.gongzhongLiuyan!.close, story: "陵容在各宫替你说话，句句圆融：「姐姐如今是什么身份，谁不知道？旁人嚼舌根，不过是眼红罢了。」她笑盈盈的，三两句便把几个碎嘴的宫人说得讪讪低了头。" },
    distant: { ...LINGRONG_EVENT.gongzhongLiuyan!.distant, story: "「姐姐何必在意这些闲话，清者自清。」陵容在几处宫里替你分辩，话说得滴水不漏，既没得罪谁，也没落下你的不是。" },
    resentful: { ...LINGRONG_EVENT.gongzhongLiuyan!.resentful, relation: 0, story: "陵容去各宫走了一圈，话说得阴阳怪气：「姐姐如今恩宠正盛，招人说两句，也是该的。」流言反倒越传越凶。到了夜里，宝鹊又悄悄送来一盏安神汤，说是她家小主吩咐的。" },
  },
  neiwufuDiaonan: {
    close: { ...LINGRONG_EVENT.neiwufuDiaonan!.close, story: "陵容笑着往内务府走了一趟，几句体面话、一包碎银，管事太监便点头哈腰。她回来笑说：「这些人的心思，我最清楚，给足了面子，没有办不成的事。」" },
    distant: { ...LINGRONG_EVENT.neiwufuDiaonan!.distant, story: "「内务府的差事，妹妹跑一趟便是。」陵容话说得客气周到，当日便把份例补齐了，走时还笑道：「姐姐有事，只管吩咐。」" },
    resentful: { ...LINGRONG_EVENT.neiwufuDiaonan!.resentful, story: "陵容出面去要份例，话里带刺：「姐姐如今金贵，连份例都要旁人跑腿。」这话传开，倒显得你斤斤计较。" },
  },
  liyiShiwu: {
    close: { ...LINGRONG_EVENT.liyiShiwu!.close, story: "陵容不慌不忙扶你起来，替你把衣裳理得妥妥帖帖，笑道：「姐姐放心，回头送药膏来，保管看不出一丝痕迹。」" },
    distant: { ...LINGRONG_EVENT.liyiShiwu!.distant, story: "「姐姐素来最重仪态，这回可得留神些。」陵容三言两语把场面遮掩过去，才说回头送药来。" },
    resentful: { ...LINGRONG_EVENT.liyiShiwu!.resentful, story: "陵容上前替你圆了场，话却带着刺：「姐姐一向端庄，原来也有出岔子的时候。」说罢才淡淡补了一句：「回头我让人送药来。」" },
  },
  wangyeXiantan: {
    close: { resolves: true, relation: 1, effects: [q(1)], story: "陵容替你收下了王爷送来的诗集，笑着说王爷的字写得真好。又陪你挑了几句诗回赠。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容替你去回了王爷的礼，回来只说东西送到了。" },
    resentful: { resolves: true, effects: [q(1)], story: "陵容替你把东西送回了王爷那里，淡淡说了句「送到了」，便回自己宫里去了。" },
  },
  yanqingTanbing: {
    close: { resolves: true, relation: 1, effects: [q(1)], story: "陵容陪你去延庆殿，调了一味安神的香给端妃。端妃看了她一眼，淡淡道了声谢。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你去了一趟延庆殿，一路上没怎么说话。" },
    resentful: { resolves: false, story: "陵容说延庆殿药味重，熏得她头疼，走到半路便回去了。" },
  },
  xianfuXianhua: {
    close: { resolves: true, relation: 1, effects: [q(1)], story: "陵容绣了一方素帕，同你一起送去咸福宫。敬妃拉着她的手，夸她手巧。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你去了咸福宫，坐在一旁安安静静的，偶尔替你们添茶。" },
    resentful: { resolves: false, story: "陵容推说手头有事，没去。敬妃问起她，你只得替她圆了几句。" },
  },
  kuairenKuaiyu: {
    close: { resolves: true, relation: 1, effects: [sc(1)], story: "陵容唱了一支江南小调，欣贵人听得直拍手，说碎玉轩真是热闹。" },
    distant: { resolves: true, effects: [sc(1)], story: "陵容陪着说了几句话，欣贵人嘴快，她插不上话，便只是笑。" },
    resentful: { resolves: false, story: "欣贵人说话没轻没重，陵容听了几句便沉了脸，起身走了。" },
  },
  antaiBupin: {
    close: { resolves: true, relation: 1, story: "陵容尝了尝那盅补品，说炖得偏燥，不如先搁着，另让小厨房炖了盅清淡的给你。她替你掖好被角，又陪你说了一会儿话。" },
    distant: { resolves: true, relation: 1, story: "陵容说这补品炖得偏燥，替你换了盅清淡的，又叮嘱你多歇着。" },
    resentful: { resolves: true, story: "陵容端走了补品，说替姐姐换盅清淡的来。她没多坐，放下话便走了。" },
  },
  jiayanXianyi: {
    close: { resolves: true, relation: 1, effects: [sc(1)], story: "你抚琴，陵容唱曲。一曲终了，皇上抚掌大笑，赏赐都记在了碎玉轩名下。陵容低着头，没说话。" },
    distant: { resolves: true, story: "你抚琴，陵容唱曲。皇上的目光落在了陵容身上，赏赐也送去了她宫里。" },
    resentful: { resolves: true, effects: [sc(1)], story: "临上场前，陵容说嗓子哑了。你只好独自弹了一曲。皇上很喜欢，陵容在席间看着你，脸上没有表情。" },
  },
  shanghuaXiaoju: {
    close: { resolves: true, effects: [q(1)], relation: 1, story: "陵容陪你在花下应酬各宫，替你挡了几句不好接的话。两人说说笑笑，一下午过得飞快。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你在花下坐了半日。你说起各宫的趣事，她也跟着笑了笑。" },
    resentful: { resolves: true, effects: [q(1)], relation: 1, story: "陵容陪你去了。席间她话不多，倒也替你周全了礼数。" },
  },
};

export { LINGRONG_SUMMON };

/** 陵容 played with nothing on the table: just keeping her company, 情分 +1. After 纯元故衣 your words turn cold. */
export const LINGRONG_IDLE_TEXT3: Record<LingrongTier, string> = {
  close: "你留陵容在碎玉轩喝茶。她如今应对得体，三言两语便把话说得熨帖，连延禧宫的旧事也只挑好听的讲。临走时她拉着你的袖子，说下回再来。",
  distant: "你请陵容过来坐坐。她言谈周全，客客气气，茶盏放得端端正正，坐久了才多说了几句心里话。",
  resentful: "你请陵容过来坐坐，她句句冷嘲热讽：「姐姐如今忙得很，难为还记得妹妹。」可坐得久了，语气也松了些。",
};
export const LINGRONG_COLD_TEXT = "你留陵容说话，说着说着，竟说了一句「心冷了」。陵容握着你的手，柔声劝了许久。";

// ---------------------------------------------------------------- stories

export type StoryId3 =
  | "zhaoxing"
  | "huanghouXiaoyi"
  | "haitangChunshui"
  | "haitangYeyu"
  | "tonghuataiChuyu"
  | "zhenYuandaoXiayu"
  | "wanwanLeiqing"
  | "mochou"
  | "shanmenOuyu"
  | "wentaiyiTanshi"
  | "taxueWenji"
  | "hehunGengtie"
  | "diannanZhixing"
  | "zhoufuEHao"
  | "yihuaOuyu";

/** 甄远道下狱: which option, and how heavy it lands (see `xiayuCost`). */
export type XiayuChoice = "kneel" | "taihou" | "guo" | "lingrong" | "shoulong" | "jinyan";

export type StoryOption3 = {
  readonly id: string;
  readonly name: string;
  readonly card?: CardId3;
  readonly hidden?: boolean;
  /** 双牌：同回合须再打出这张故事里另一张可应对此事的牌。 */
  readonly two?: boolean;
  /** 双牌：第二张须与第一张不同名（各打一张）。 */
  readonly distinct?: boolean;
  readonly effects: readonly Delta3[];
  readonly text: string;
  readonly compact?: string;
  readonly story: string;
  readonly tierStory?: Record<LingrongTier, string>;
  readonly pregnancy?: boolean;
  readonly summon?: boolean;
  /** 陵容 answers: she notes this (hidden). */
  readonly secret?: SecretId;
  readonly drawCards?: number;
  readonly removeNegatives?: "all" | 1;
  /** 菀菀类卿: 身子 never drops below 1 here. */
  readonly shenziFloor?: number;
  readonly xiayu?: XiayuChoice;
  /** Story-specific flag the engine records (桐花台 / 莫愁 / 温太医探视 / 庚帖 / 送行). */
  /** 舟覆后果郡王相助可能变成的遗物。 */
  readonly relic?: RelicId;
  readonly flag?: "li" | "di" | "lingrong" | "luofa" | "gengtie" | "songxing" | "xiangshou" | "ouyu";
  readonly status?: StatusId3;
};

export type StoryDef3 = {
  readonly id: StoryId3;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly note?: string;
  readonly defaultOptionId: string;
  readonly options: readonly StoryOption3[];
};

export const FIXED_STORIES3: Partial<Record<number, StoryId3>> = {
  2: "huanghouXiaoyi",
  3: "haitangChunshui",
  5: "tonghuataiChuyu",
  8: "zhenYuandaoXiayu",
  9: "wanwanLeiqing",
  11: "mochou",
  12: "shanmenOuyu",
  15: "wentaiyiTanshi",
  19: "taxueWenji",
  23: "hehunGengtie",
  24: "diannanZhixing",
  25: "zhoufuEHao",
};

export const STORIES3: Record<StoryId3, StoryDef3> = {
  zhaoxing: {
    id: "zhaoxing",
    name: "凤鸾承恩",
    emoji: "🌙",
    flavor: "敬事房的公公来报：今夜皇上翻了你的绿头牌。",
    note: "侍寝成功圣宠 +1，按身子 ÷ 5 判定喜脉。不处理则称病避宠。",
    defaultOptionId: "chengbingBichong",
    options: [
      {
        id: "chengbingBichong",
        name: "称病避宠",
        effects: [{ resource: "shengchong", amount: -1 }],
        text: "圣宠 -1",
        story: "你推说身子不适，请皇上另择他人。敬事房的公公讪讪地走了。",
      },
      { id: "shengzhuangChengen", name: "盛装承恩", card: "yirongZhengsu", effects: [], summon: true, text: "侍寝成功", story: "你盛装梳妆、含笑承恩，皇上见了心情大好，留你说话直到天明。" },
      { id: "shiciDechong", name: "以诗词得宠", card: "jinyanShenxing", effects: [], summon: true, text: "侍寝成功", story: "你与皇上对诗到深夜，他笑着说你是解语花。" },
      { id: "lingrongXiezhuang", name: "陵容相助", card: "lingrongXiangzhu", effects: [], text: "效果视你与陵容的情分而定", story: "陵容来了碎玉轩，替你梳妆更衣，又陪你说了会儿话，才送你出门。" },
    ],
  },
  huanghouXiaoyi: {
    id: "huanghouXiaoyi",
    name: "皇后笑意",
    emoji: "🏵️",
    flavor: "华妃倒后，皇后亲自来碎玉轩道贺，赏下一对玉镯。她笑得温和，你却想起翊坤宫倒下那日，她站在廊下一言不发的样子。",
        defaultOptionId: "xieen",
    options: [
      { id: "xieen", name: "谢恩收下", effects: [sc(1)], text: "圣宠 +1", story: "你跪下谢恩，把玉镯收进了妆奁。皇后扶你起来，说往后常来景仁宫坐坐。" },
      {
        id: "daishangYuzhuo",
        name: "戴上玉镯",
        card: "yirongZhengsu",
        effects: [sc(2)],
        text: "圣宠 +2",
        story: "你当场把玉镯戴上，衬着新裁的衣裳。当晚皇上来碎玉轩，一眼就看见了，说皇后挑东西向来有眼光。",
      },
      {
        id: "gongjinYingdui",
        name: "恭谨应对",
        card: "jinyanShenxing",
        effects: [q(1)],
        text: "清誉 +1",
        story: "你句句谦让，只说华妃之事全赖皇上圣明、皇后主持。皇后笑意更深了些，回去便在太后跟前夸你懂事。",
      },
      {
        id: "dashangLairen",
        name: "打赏来人",
        card: "shoulongRenxin",
        effects: [q(1), sc(1)],
        text: "清誉 +1、圣宠 +1",
        story: "你让小允子重重打赏了景仁宫来送东西的宫人。没过几日，各宫都传碎玉轩的主子待下宽厚，这话也传到了皇上耳朵里。",
      },
    ],
  },
  haitangChunshui: {
    id: "haitangChunshui",
    name: "海棠春睡",
    emoji: "🌸",
    flavor: "华妃倒后，皇上夜夜往碎玉轩去，在你窗前那几株海棠下留宿。敬事房的牌子翻来翻去，翻的只有碎玉轩；别的宫里的灯一盏盏暗下去，只有这里的海棠树下还亮着。你独占君恩，宠冠六宫，满宫的眼睛都盯在碎玉轩的院墙上：有人艳羡，更多的是嫉恨。请安时的茶凉了没人添，座次越挪越远，话里话外都带着刺。这份恩宠，清誉要担，身子要熬，人言也要受，端看你怎么应对。",
    note: "还没有身孕时必定有孕；已有孕时只是一段恩宠。身上有【抱恙在身】也照常有孕。",
    defaultOptionId: "chengen",
    options: [
      {
        id: "chengen",
        name: "承恩",
        effects: [sc(2), q(-3), sz(-2)],
        status: "liuyanChanshen",
        pregnancy: true,
        text: "圣宠 +2、清誉 -3、身子 -2；未来 3 回合每回合抓牌 -1；未孕时必定有孕",
        story: "海棠花下，皇上握着你的手说：「朕的嬛嬛。」一连数夜，他再没踏进过别的宫门，敬事房的牌子翻来翻去，翻的只有碎玉轩。第二日请安，满殿的珠翠都亮着，齐妃的茶盏重重一搁，瓜尔佳氏用帕子掩着嘴笑，那笑却冷得像冰。皇后温言说了句「妹妹好福气」，满座便都低了头。回宫的路上，你听见身后有人压着嗓子说：「专宠至此，也不怕折了福。」你夜夜承恩，没睡过几个整觉，面上的粉一日厚过一日，人也一天天乏了下去。",
      },
      {
        id: "haitangXinzhuang",
        name: "海棠新妆",
        card: "yirongZhengsu",
        effects: [sc(2), sz(-2)],
        status: "liuyanChanshen",
        pregnancy: true,
        text: "圣宠 +2、身子 -2；未来 3 回合每回合抓牌 -1；未孕时必定有孕",
        story: "你簪了一朵新开的海棠，妆容端庄，不见半分轻佻。皇上看了你很久，说海棠春睡，不及你一笑。次日去景仁宫请安，各宫的目光都落在你鬓边那朵花上：齐妃盯着看了许久，转头对身边人说：「新鲜花样，也只有碎玉轩的人才戴得起。」后宫里再多的酸话，也挑不出你仪态的错处，只是陪驾熬到夜深，人难免乏了。闲话也一日日传开：说碎玉轩的海棠，是只开给一个人看的；说这六宫的雨露，如今都落在了一处。",
      },
      {
        id: "dengxiaDushi",
        name: "灯下读诗",
        card: "jinyanShenxing",
        effects: [sc(2), q(-3), sz(-2)],
        pregnancy: true,
        text: "圣宠 +2、清誉 -3、身子 -2；未孕时必定有孕",
        story: "你在灯下陪皇上读诗，读到「只恐夜深花睡去」，他笑着接了下一句，一直读到天明。你句句谨慎，不提旁人一字，外头抓不到话柄。可皇上连着数日宿在碎玉轩，别处的宫灯都熄得早，宠冠六宫四个字，不用谁说出口，满宫的眼睛都在替你说。请安时，有人阴阳怪气，说你不识大体；有人当面笑着，转身就在皇后跟前叹气。你自己也明白，这样的恩宠是烧着的火，夜读到天明，身子也吃不消。",
      },
      {
        id: "jinxiZhoudao",
        name: "槿汐周全",
        card: "jinxiXiangzhu",
        effects: [sc(2), q(-3)],
        status: "liuyanChanshen",
        pregnancy: true,
        text: "圣宠 +2、清誉 -3；未来 3 回合每回合抓牌 -1；未孕时必定有孕",
        story: "槿汐早早备下安神汤，皇上睡下后又轻手轻脚收拾了一切，叫你好生歇着。皇上一连数夜只往碎玉轩来，你的身子没有被拖垮，可各宫的嫉恨再藏不住：有人说你狐媚专宠，有人说碎玉轩的恩宠来得太容易，连奉茶的小宫女也被人拦在路上盘问，今晚皇上用了什么，说了什么。这些话传得比海棠谢得还快，你听槿汐一一说来，只淡淡道：「由她们去。」",
      },
    ],
  },
  haitangYeyu: {
    id: "haitangYeyu",
    name: "海棠春睡",
    emoji: "🌸",
    flavor: "太医的喜脉早已报到了御前。皇上这几日仍常往碎玉轩来，只在海棠树下坐坐，陪你说说话。别的宫里却是一夜比一夜冷清，你有孕在身还独占圣驾，宠冠六宫，惹得各宫的嫉妒再也藏不住。有人当面关切，转身就在皇后跟前叹气。这份恩宠，清誉要担，身子要熬，人言也要受，端看你怎么应对。",
    defaultOptionId: "chengen",
    options: [
      {
        id: "chengen",
        name: "承恩",
        effects: [sc(2), q(-3), sz(-2)],
        status: "liuyanChanshen",
        text: "圣宠 +2、清誉 -3、身子 -2；未来 3 回合每回合抓牌 -1",
        story: "海棠树下，皇上扶你坐下，只问腹中孩子今日闹不闹。那一夜他宿在碎玉轩，听你絮絮说了半宿的话。可你有孕还霸着圣驾的事传了出去，各宫都说你不知进退，齐妃当着众人的面说：「有了身子的人，还是该静养，莫要劳烦皇上。」这话听着是关切，旁人却都听出了刺。别的宫里一夜比一夜冷清，那些落空的盼头都算在了你头上。你本就辛苦，这几日又添了心事，人愈发恹恹的。",
      },
      {
        id: "haitangXinzhuang",
        name: "海棠新妆",
        card: "yirongZhengsu",
        effects: [sc(2), sz(-2)],
        status: "liuyanChanshen",
        text: "圣宠 +2、身子 -2；未来 3 回合每回合抓牌 -1",
        story: "你簪了一朵新开的海棠，妆容端庄，皇上笑说等孩子落了地，要带他来看这满树的花。无人能挑你的错处，可宫里的闲话仍一句句往碎玉轩递：说你有了身孕还拢着圣心不放，说六宫的雨露全落在了一处，连皇后赏下的东西，也有人酸溜溜地说是看在龙裔的面上。你有孕在身，陪驾到夜深，总归是累着了。",
      },
      {
        id: "dengxiaDushi",
        name: "灯下读诗",
        card: "jinyanShenxing",
        effects: [sc(2), q(-3), sz(-2)],
        text: "圣宠 +2、清誉 -3、身子 -2",
        story: "你在灯下陪皇上读诗，读到「只恐夜深花睡去」，他笑着把你肩上的披风拢了拢，不许你熬夜。你言行谨慎，没留下半点话柄，可有孕仍独占圣驾，各宫都看不顺眼。请安时没人敢明说，只是茶凉了没人添，座次越挪越远，人前人后的议论没有停过。圣宠正盛，也正是众矢之的，你夜里睡得不安稳，身子也跟着受累。",
      },
      {
        id: "jinxiZhoudao",
        name: "槿汐周全",
        card: "jinxiXiangzhu",
        effects: [sc(2), q(-3)],
        status: "liuyanChanshen",
        text: "圣宠 +2、清誉 -3；未来 3 回合每回合抓牌 -1",
        story: "槿汐早早备下安神汤，又嘱咐小厨房把夜里的点心换成清淡的，皇上走后便扶你睡下。你的身子无碍，可有孕还独占圣驾，各宫的闲话是怎么也拦不住的。宠冠六宫，便是把嫉妒都招到了自己身上：有人在皇后面前提起你的恩宠太盛，有人暗暗打听碎玉轩的用度，连往日走得近的几位，说话也多了几分小心。这些话一句句传到你耳里，你只是抚着小腹，一言不发。",
      },
    ],
  },
  tonghuataiChuyu: {
    id: "tonghuataiChuyu",
    name: "桐花台初遇",
    emoji: "🎐",
    flavor: "果郡王自外游历回京。你在桐花台听见笛声，循声走过去，撞见了他。",
    note: "无论怎样结算，之后牌库加入第 1 张【果郡王相助】，机会池洗入【王爷闲谈】。",
    defaultOptionId: "lundi",
    options: [
      { id: "lundi", name: "论笛谈诗", relic: "yiwuDipu", effects: [], drawCards: 1, flag: "di", text: "抽 1 张牌（他记住了你）", compact: "🎴+1", story: "你说他的笛子吹得太急，像是心里有事。他怔了怔，笑着说：「小主是第一个这样说的人。」" },
      { id: "lundiCard", name: "论笛谈诗", card: "yirongZhengsu", relic: "yiwuDipu", effects: [], drawCards: 1, flag: "di", text: "抽 1 张牌（他记住了你）", compact: "🎴+1", story: "你理了理衣裳走上前去，与他说起笛中的曲子。他听得认真，临走时回头看了你一眼。" },
      { id: "yili", name: "以礼相待", card: "jinyanShenxing", relic: "yiwuTonghua", effects: [q(1)], flag: "li", text: "清誉 +1", story: "你福了福身，只道了一句「王爷安好」，便转身离开了。他站在桐花台上，没有再吹笛子。" },
      {
        id: "lingrongZaice",
        name: "有陵容在侧",
        card: "lingrongXiangzhu",
        effects: [],
        flag: "lingrong",
        secret: "wangyeZengwu",
        text: "她替你圆场",
        story: "陵容在一旁笑着替你圆了场，三言两语便把话头岔了开去。",
        tierStory: {
          close: "陵容笑盈盈地替你挡在前头，说姐姐走累了，拉着你便走。回去的路上，她挽着你的胳膊，说桐花台的花开得真好。",
          distant: "陵容替你圆了场，说你们是来赏花的。王爷笑着送了你们一枝桐花，陵容接过来，回去替你插在了瓶里。",
          resentful: "陵容替你说了几句场面话，王爷送了一枝桐花。陵容接过来，回去的路上没怎么说话。",
        },
      },
    ],
  },
  zhenYuandaoXiayu: {
    id: "zhenYuandaoXiayu",
    name: "甄远道下狱",
    emoji: "⛓️",
    flavor: "鄂敏的折子递上去不过数日，一道旨意便传进了碎玉轩：甄远道因文字狱下狱，家中女眷皆受拘押。槿汐白着脸进来回话，话没说完，你手里的茶盏已摔在了地上。「小主，」她跪下去，「眼下宫里宫外都在看着碎玉轩，小主万不能乱了方寸。」你扶着桌角站了许久，窗外的风吹得帘子一下一下地响。",
    note: "每打出一张解牌，局势降一档，降到零则完美解决；回合末仍未了结，按默认「跪求皇上」处理。",
    defaultOptionId: "guiqiu",
    options: [
      { id: "guiqiu", name: "跪求皇上", effects: [], xiayu: "kneel", text: "圣宠、清誉受损（清誉少损）", story: "你脱去钗环，素衣跪在养心殿外的石阶上。夜露渐重，膝下一片冰凉，殿内的灯却始终亮着。天将亮时，苏培盛才缓缓走出来，低着头传话：「小主请回吧，皇上说了，后宫不得干政。」你伏在地上，指甲掐进掌心，却连父亲的名字也没能再提一句。" },
      { id: "qiuTaihou", name: "求太后", effects: [], xiayu: "taihou", text: "圣宠、清誉受损（圣宠少损）", story: "你顶着晨雾去了寿康宫，在太后跟前一跪便是半个时辰。太后拨着佛珠，叹道：「哀家也知道你的难处，可你一个后宫嫔妃，为前朝的事奔走，原是犯忌讳的。」她终究松了口，答应寻个时机在皇上面前提一句。你谢恩出来，已听见廊下的宫人窃窃私语，说甄氏到底是不安分的。" },
      {
        id: "tuoGuo",
        name: "托果郡王周旋",
        card: "guojunwangXiangzhu",
        effects: [],
        xiayu: "guo",
        text: "解牌：局势降一档",
        story: "果郡王听罢，沉默片刻，只说：「你放心，我去想办法。」他当日便递牌子进了前朝，一连几日辗转于各府之间，又亲自去刑部打点了狱卒。数日后他托人带话进来：「令尊在狱中尚好，只是人瘦了些。你照看好自己，别叫他们担心。」",
      },
      {
        id: "tuoRenxin",
        name: "托人在前朝打点",
        card: "shoulongRenxin",
        effects: [],
        xiayu: "shoulong",
        text: "解牌：局势降一档",
        story: "你把妆匣里剩下的金银细软都倒了出来，交给小允子：「去前朝，能托的人都托一遍，狱里要什么，一样不许缺。」小允子磕了个头，揣着包袱消失在夜色里。几日后他回来复命，嗓子都哑了：「小主，狱卒收了银子，答应给老爷换了干净的被褥，还捎进去一件厚衣裳。」",
      },
      {
        id: "yinrenBuyan",
        name: "隐忍不言",
        card: "jinyanShenxing",
        effects: [],
        xiayu: "jinyan",
        text: "解牌：局势降一档",
        story: "槿汐劝你，这时候多说一句便多错一句。你攥着帕子点了点头，吩咐宫门落锁，称病不见客。夜里你坐在灯下，一遍遍默念父亲的名字，却一个字也不敢外传。皇上没有来，也没有降罪碎玉轩，只是那盏常常为你留着的灯，许久没再亮过。",
      },
      {
        id: "tuoLingrong",
        name: "托陵容传信",
        card: "lingrongXiangzhu",
        effects: [],
        xiayu: "lingrong",
        secret: "yuzhongShuxin",
        text: "解牌：局势降一档",
        story: "陵容听完，低头想了想，轻声说：「姐姐别急，我家里在刑部有几分旧情，让我试试。」她当天便托人把你写的信递了进去，临走前又细细嘱咐了一句：「信里的话，姐姐可写得妥当？」",
        tierStory: {
          close: "陵容说她父亲在狱里有旧识，亲自替你把信递了进去。她回来时眼眶红红的，握着你的手说：「甄伯父让姐姐保重，说他在里头一切都好，只盼姐姐莫要为他失了分寸。」",
          distant: "陵容替你把信送了进去，回来时说一切都好：「甄伯父让姐姐别挂心。」她说得客气周全，你却看不出她心里是怎么想的。",
          resentful: "陵容把信递了进去，只淡淡说了句狱里已打点过，叫你放心，便福身告退了。她走得很快，你连道谢的话都没来得及说完。",
        },
      },
    ],
  },
  wanwanLeiqing: {
    id: "wanwanLeiqing",
    name: "菀菀类卿",
    emoji: "💔",
    flavor: "你挺着肚子去养心殿，想再为父亲求一次情。暖阁案上摊着皇上的旧手书：「菀菀类卿，暂排苦思，亦除却巫山非云也。」旁边压着一幅小像，画中女子的眉眼与你有七分相似。你扶着桌沿站了很久，腹中一阵一阵地疼起来。",
    note: "当夜早产，生下胧月。身子最少扣到 1。",
    defaultOptionId: "shihun",
    options: [
      { id: "shihun", name: "失魂而归", effects: [sz(-1)], shenziFloor: 1, text: "身子 -1（最少扣到 1）", story: "你不记得是怎么走出养心殿的，只记得宫道很长，风很冷。当夜腹痛如绞，天快亮时，你听见一声啼哭，有人说：「是位公主。」" },
      { id: "fuhui", name: "扶你回宫", card: "jinxiXiangzhu", effects: [], text: "身子不扣", story: "槿汐什么也没问，赶在旁人看见之前扶你出了养心殿，低声说：「小主，什么都等孩子平安了再说。」她守了你一夜，天亮时你生下了一个女儿。" },
      {
        id: "baochan",
        name: "连夜保产",
        card: "wenTaiyiZhenzhi",
        effects: [],
        removeNegatives: 1,
        text: "身子不扣；移除 1 个负面状态",
        story: "温实初连夜赶来，施针开方，额上的汗也顾不得擦。天亮时终于传出一声啼哭，母女平安。",
      },
      { id: "shouhou", name: "守在产房外", card: "meizhuangXiangzhu", effects: [sz(-1), q(1)], shenziFloor: 1, text: "身子 -1、清誉 +1", story: "眉庄连夜赶到碎玉轩，在产房外守了一夜，谁来都不让进。天亮时她抱着孩子进来，眼睛红红的：「是个公主，长得像你。」" },
    ],
  },
  mochou: {
    id: "mochou",
    name: "莫愁",
    emoji: "🪷",
    flavor: "甘露寺在凌云峰脚下，是宫里获罪或自请出宫的女眷落发修行的地方，清苦偏僻。住持静岸师太慈和，肯照拂你；可寺里管事的静白师太势利，见你没了位分，脸色先冷了三分。静岸师太为你取法号莫愁，问你俗家名字，你答「甄嬛」，不提皇上赐的那个“莞”字。",
        defaultOptionId: "daifa",
    options: [
      { id: "daifa", name: "带发修行", effects: [], text: "无效果（尘缘未断）", story: "你没有落发。师太看着你，说：「尘缘未断，也是缘法。」" },
      { id: "luofa", name: "落发", card: "chanyuXiushen", effects: [q(2)], flag: "luofa", status: "chenyuanYiduan", text: "清誉 +2；未来 2 回合每回合抓牌 +1", story: "青丝一缕一缕落在地上。你闭着眼，听见剪刀的声音，像是什么东西断了。" },
      { id: "buqunXiuxing", name: "布裙修行", card: "jingchaiBuqun", effects: [q(1)], drawCards: 1, text: "清誉 +1，抽 1 张牌", story: "你换了粗布衣裳，不落发，只把钗环尽数收进箱底。每日挑水扫地，与寺里的姑子们一同做早晚课。静岸师太见你肯吃苦，点头道：「心净，不在发上。」" },
      { id: "shangyaoZhaoliao", name: "敷药诊视", card: "wenTaiyiZhenzhi", effects: [], status: "fuyaoTiaoyang", text: "未来 2 回合每回合末身子 +1", story: "温实初上山来，一进院子就愣住了：你正挑着水从井边回来，手上全是冻疮。他慌忙放下药箱去接扁担，拉过你的手细看，声音都发颤：「你每天都要做这些？」你把手抽回去，笑着说不过是寺里的寻常活计，早惯了。他却不再听，低头一点一点替你上药。" },
    ],
  },
  shanmenOuyu: {
    id: "shanmenOuyu",
    name: "山门偶遇",
    emoji: "🎐",
    flavor: "果郡王来看望住在附近安栖观的舒太妃，在甘露寺山门外撞见了你。",
    note: "无论怎样结算，牌库加入 1 张【果郡王相助】。",
    defaultOptionId: "huibi",
    options: [
      { id: "huibi", name: "回避", effects: [q(1)], text: "清誉 +1", story: "你低着头从他身边走过去。他怔了一下，低声叫了一句「莫愁师父」。你没有回头。" },
      { id: "yichanXiangtan", name: "以禅相谈", card: "chanyuXiushen", relic: "yiwuHehua", effects: [], drawCards: 1, text: "抽 1 张牌", story: "你站在山门下，与他说了几句禅语。他说：「我在安栖观外种了一片合欢，等开了花，请你来看。」" },
    ],
  },
  wentaiyiTanshi: {
    id: "wentaiyiTanshi",
    name: "故人来访",
    emoji: "🩺",
    flavor: "温实初上山来了，捎来胧月的一张小像，是敬妃托他带的。画上的孩子胖乎乎的，眉眼像你。",
    note: "有【敬妃之谊】时，另得未来 3 回合每回合抓牌 +1。",
    defaultOptionId: "zhenzhi",
    options: [
      { id: "zhenzhi", name: "请他诊治", effects: [sz(2)], removeNegatives: "all", text: "移除全部负面状态；身子 +2", story: "温实初替你诊了脉，开了方子，又留下许多药材。临走时他说：「嬛妹妹，你要好好的。」" },
      { id: "yuandaoBuji", name: "眉庄捎来补给", card: "meizhuangXiangzhu", effects: [], status: "yuandaoBuji", text: "未来 3 回合每回合末身子 +1", compact: "🌱+1×3", story: "眉庄在宫里放心不下，远远托温实初带了药材和补给上山。" },
      { id: "weiNver", name: "槿汐相伴", card: "jinxiXiangzhu", effects: [], status: "weiNverChengxia", text: "未来 2 回合每回合末清誉 +1", compact: "🪷+1×2", story: "你看着胧月的小像，看了很久。槿汐在一旁默默替你添了一盏灯。" },
    ],
  },
  taxueWenji: {
    id: "taxueWenji",
    name: "踏雪问疾",
    emoji: "🌨️",
    flavor:
      "凌云峰上落了三天的雪，屋顶压得吱呀作响，你的咳疾也愈发重了，夜里连灯都懒得点。这日晌午，门被人叩响，开门一看，果郡王披着一身雪站在门外，身后跟着牵马的阿晋。他低头看了看你苍白的脸，眉头皱得很紧：「山下的清凉台是我的别业，暖和，也清静。你不必谢我，今日必须跟我走。」风卷着雪花扑进屋里，你扶着门框，一时竟答不上话。",
    note: "下山养病、果郡王相助、槿汐相助这三种结算，牌库再加入 1 张【果郡王相助】。",
    defaultOptionId: "yangbing",
    options: [
      { id: "yangbing", name: "清凉台养病", effects: [sz(-2), q(-1)], shenziFloor: 1, text: "身子 -2（最少扣到 1）；清誉 -1", story: "你推说不必，终究没拗过他，被半扶半搀地带下了山。清凉台很暖，炭火烧得旺旺的，窗上糊着新纸，一点风也不漏，可你一路颠簸，又在风口里站了许久，当夜病势反倒重了，睡了醒、醒了睡，只记得汤药总是温的，帕子总是凉的，有人一直守在床边，你一睁眼，他便不动声色地把手收了回去。养了十来日，人却比上山时更瘦了一圈。临走那天，阿晋把你的旧包袱收拾得整整齐齐，你谢过他，仍旧回了凌云峰。可山下的闲话也跟着传开了，都说果郡王亲自把一个出家的人接进了别业，一住就是十来日。" },
      {
        id: "bingzhongXiangshou",
        name: "病中相守",
        card: "guojunwangXiangzhu",
        relic: "yiwuPifeng",
        effects: [],
        flag: "xiangshou",
        status: "bingzhongXinyou",
        text: "下回合抓牌数 -1",
        story:
          "他守了你几天几夜，药要亲自尝过才肯端来，帕子换了一盆又一盆，连阿晋劝他去歇歇，他也只摆摆手。你烧退的那个清晨，睁眼便看见他靠在床边睡着了，眼下一片青黑。可你好了，他自己却倒下了，咳得一声重过一声。你坐在他床边，替他掖好被角，第一次叫了他的名字：「允礼。」他睁开眼，怔了许久，才低低地「嗯」了一声，像是怕惊散了什么。回到凌云峰后，你夜里总惦着清凉台那头的咳声，翻来覆去，睡不安稳。",
      },
      {
        id: "jinxiZhaoliao",
        name: "槿汐照料",
        card: "jinxiXiangzhu",
        effects: [],
        status: "jinxiLeikua",
        text: "未来 2 回合不能打出槿汐相助",
        story:
          "槿汐听说有人要接你下山，一句话也没多问，先把你的旧棉袄、药罐和那卷抄了一半的经书收进包袱。到了清凉台，她不肯让旁人近身，煎药、喂汤、擦身，事事亲力亲为，夜里就在脚踏上和衣而卧，你一动她便醒。你烧得糊涂时拉着她的手喊冷，她只一遍遍说：「小主别怕，奴婢在呢，天亮了就好。」果郡王立在帘外，听着里头的动静，终究没有进来，只吩咐阿晋再添两盆炭。待你好些了，她却在榻边一头栽倒，烧得说不出话来，回山后也只能躺着，一连几日使唤不动。",
      },
      {
        id: "bimenXieke",
        name: "闭门谢客",
        card: "jingxinRennai",
        effects: [sz(-1)],
        shenziFloor: 1,
        text: "身子 -1（最少扣到 1）",
        story:
          "你隔着门谢了他的好意，只说山上清净，养几日便好。他在雪地里立了很久，终究没有再叩门，只让阿晋把药包和一篓银炭搁在了门槛外。你守着那点炭火，一碗一碗地熬药，咳声断断续续，捱了好些日子，才勉强缓过来一些。",
      },
    ],
  },
  hehunGengtie: {
    id: "hehunGengtie",
    name: "合婚庚帖",
    emoji: "📜",
    flavor: "果郡王趁着无人，从袖中取出一张红纸，轻声请你写下自己的庚帖。他说这一笔写下去，便是把你这个人托付给他，他不要你应他什么，只要你肯留下一个名字。你捏着笔，迟迟没有落下。",
    note: "须双牌：【果郡王相助】与【荆钗布裙】各打一张；只打一张，回合末按默认选项处理。",
    defaultOptionId: "buxie",
    options: [
      { id: "buxie", name: "不写", effects: [q(1)], text: "清誉 +1", story: "你把红纸推了回去。他没有说什么，只把它仔细折好，收进了袖子里。" },
      { id: "xiexia", name: "写下庚帖", card: "guojunwangXiangzhu", two: true, distinct: true, relic: "yiwuGengtie", effects: [], flag: "gengtie", text: "他收好了庚帖", story: "你换了一身素净的布衣，提笔写下自己的生辰。他在旁边写的是「嬛嬛」，一笔一画，写得极慢。写罢他把两张红纸并在一起，轻轻吹干了墨，低声说：「我不求名分，只求你的名字，在我这里有个着落。」你没有应声，只看着那两行字在灯下并排立着，像是两个本不该相遇的人。" },
      { id: "xiexiaBuqun", name: "写下庚帖", card: "jingchaiBuqun", two: true, distinct: true, relic: "yiwuGengtie", effects: [], flag: "gengtie", text: "他收好了庚帖", story: "你换了一身素净的布衣，提笔写下自己的生辰。他在旁边写的是「嬛嬛」，一笔一画，写得极慢。写罢他把两张红纸并在一起，轻轻吹干了墨，低声说：「我不求名分，只求你的名字，在我这里有个着落。」你没有应声，只看着那两行字在灯下并排立着，像是两个本不该相遇的人。" },
    ],
  },
  diannanZhixing: {
    id: "diannanZhixing",
    name: "滇南之行",
    emoji: "⛵",
    flavor: "果郡王奉旨出使滇南，明日一早便要启程，这一去，少说也得大半年。",
    defaultOptionId: "wuyan",
    options: [
      { id: "wuyan", name: "不去相送", effects: [], text: "无效果", story: "你没有去送他。那一夜，你坐在窗前，听着山风一阵紧似一阵，直到天边泛白。" },
      { id: "songxing", name: "送行", card: "guojunwangXiangzhu", relic: "yiwuDi", effects: [], flag: "songxing", status: "songxingBieyi", text: "未来 3 回合每回合抓牌 +1", story: "你送他到山下。他翻身下马，把那支随身多年的笛子塞进你手里：「等我回来。」" },
    ],
  },
  zhoufuEHao: {
    id: "zhoufuEHao",
    name: "舟覆噩耗",
    emoji: "🌊",
    flavor: "果郡王的船在江上翻了，尸骨无存。你握着那支他留下的东西，半晌说不出一个字。",
    defaultOptionId: "beitong",
    options: [
      { id: "beitong", name: "悲恸难抑", effects: [sz(-2)], shenziFloor: 1, text: "身子 -2（最少扣到 1）", story: "你一夜没有合眼，水米未进，第二天起身时，眼前一阵阵发黑。" },
      { id: "jinxiPeiban", name: "槿汐陪伴", card: "jinxiXiangzhu", effects: [], text: "身子不扣", story: "槿汐什么也没说，只一遍遍替你暖着手，陪你在窗前坐到天亮。" },
      { id: "fotianJingzuo", name: "佛前静坐", card: "chanyuXiushen", effects: [sz(-1)], shenziFloor: 1, text: "身子 -1", story: "你在佛前跪了一夜，念的是往生咒，眼泪却止不住。天亮时，心里空落落的，却也静了下来。" },
      { id: "meizhuangQuanwei", name: "眉庄劝慰", card: "meizhuangXiangzhu", effects: [sz(-1)], shenziFloor: 1, removeNegatives: 1, text: "身子 -1；移除 1 个负面状态", story: "眉庄托人捎来长信，只写了一句：「人去了，你还得好好活着，才不辜负他。」" },
    ],
  },
  yihuaOuyu: {
    id: "yihuaOuyu",
    name: "圣驾偶遇",
    emoji: "🌸",
    flavor: "皇上驾临甘露寺，正往佛堂这边来。你若不在佛前相见，这一回便又错过了。",
    note: "打出【禅语修身】或【荆钗布裙】才算偶遇成功；没成就隔一回合再来。",
    defaultOptionId: "cuoguo",
    options: [
      { id: "cuoguo", name: "错失圣驾", effects: [], text: "偶遇没成，隔一回合再来", story: "皇上在山门外立了片刻，终究没有见到你，由苏培盛扶着回了銮驾。" },
      { id: "foqianChongfeng", name: "佛前重逢", card: "chanyuXiushen", effects: [], flag: "ouyu", text: "偶遇成功", story: "你在佛前念着经，听见身后的脚步声停了下来。皇上望着你的背影，许久，轻轻唤了一声你的名字。" },
      { id: "bunqunChongfeng", name: "布裙重逢", card: "jingchaiBuqun", effects: [], flag: "ouyu", text: "偶遇成功", story: "你荆钗布裙，正蹲在廊下捡拾落叶，听见身后的脚步声停了下来。皇上望着你素净的侧影，许久，轻轻唤了一声你的名字。" },
    ],
  },
};

// ---------------------------------------------------------------- special event cards

/** 第 6 回合【纯元故衣】：槿汐 + 一张查验类牌才能识破。 */
export const CHUNYUAN = {
  name: "纯元故衣",
  emoji: "👗",
  flavor: "皇上的生辰宴就在今夜。内务府送来一件华服，说是皇后特意挑的。你穿上去，镜子里的人陌生得很。",
  /** ① 起疑：其中一张。 */
  firstCards: ["jinxiXiangzhu", "yirongZhengsu", "lingrongXiangzhu"] as readonly CardId3[],
  /** ② 查实：① 之后再打其中一张。 */
  checkCards: ["wenTaiyiZhenzhi", "shoulongRenxin"] as readonly CardId3[],
  /** 只起疑、没查实。 */
  halfPenalty: 2,
  /** 没识破。 */
  failPenalty: 5,
  rule: "先打出【槿汐相助】【仪容整肃】【陵容相助】之一（起疑），再打出【温太医相助】或【收拢人心】（查实）。两步都做到：免祸；只起疑：圣宠 -2；没识破：圣宠 -5。",
  firstStory: {
    jinxiXiangzhu: "槿汐替你系衣带，手忽然停了。她盯着袖口的绣样看了许久，低声道：「小主，这花样……奴婢在宫里这些年，只在一个人身上见过。」",
    yirongZhengsu: "你对镜理妆，越看越不对：腰身、袖长都不是照你的尺寸裁的，倒像是照着另一个人做的。这样的衣裳，内务府怎么会现做？",
    lingrongXiangzhu: "陵容替你更衣，摸着衣襟上的绣线，轻声说：「这是十几年前宫里时兴的针法了，如今没人这样绣。」你对着镜子说了一句：「穿得再像，也不是我。」她的手停了一下。",
  } as Record<string, string>,
  checkStory: {
    wenTaiyiZhenzhi: "温实初听你说起那绣样，脸色变了：「师父当年给纯元皇后请脉，说过皇后最爱一件绣着这花样的衣裳。那是先皇后的旧物，宫里人人都知道，皇上见不得。」",
    shoulongRenxin: "小允子揣着银子去了一趟内务府，回来时满头是汗：「小主，档上写得明白，这是纯元皇后的旧衣，一直封在库里，是景仁宫的人前日来取走的。」",
  } as Record<string, string>,
  successStory: "你连夜把衣裳叠好，原样送回了内务府，换了自己的旧衣去赴宴。皇上什么也没看出来。",
  halfStory: "你觉得这衣裳哪里不对，却说不清是哪里，到底没敢穿，换了件旧衣去赴宴。皇上看见你，眼里的光暗了一下：「皇后说给你备了件新衣裳，怎么没穿？」",
  failStory: "你穿着那身衣裳进了殿。皇上看见你，手里的酒杯停在半空，怔了半晌，只说了一句「你穿这身，倒像极了一个人」，便拂袖而去。",
  popup: {
    seen: "那件华服原样叠好，送回了库中，生辰宴上笙歌如旧，无风无浪。夜深人静，槿汐替你卸下钗环，对着烛火犹豫良久，终于低声道：「小主，那件衣裳……奴婢细细看过，像是纯元皇后当年穿过的。」窗外落了一地月色，你却一夜未眠。纯元皇后是皇上的元配，宫里无人不知，她去了这么多年，皇上心头那一处，始终不曾放下。皇后偏偏在这样的日子里，将她的旧衣送到碎玉轩来，是疏忽，还是有意？你想起皇上初见你时的神情，那一眼里有惊，有喜，如今回想，竟又隐隐藏着几分恍惚，如隔着水雾看一幅旧画。他望着的，究竟是你，还是你身后的另一个人？次日清晨，消息还是传到了养心殿。皇上听说内务府竟将先皇后的旧物当作新衣送去了后宫，当即摔了手边的茶盏，沉声斥道：「纯元遗物，也是能随意翻出来的么？」内务府上下跪了一地，连掌事的太监都吓得面无人色。圣怒之下，没有人敢替谁分辩一句。你立在殿外听着那一声声雷霆，只觉从今夜起，有些事再也不能当作从未发生。",
    half: "宴席散去，皇上只淡淡说了句「早些歇息」，便回了养心殿，连一盏茶的工夫也不曾多留。你独坐灯下，指尖抚过袖口，想起他看你时那一瞬掠过的失望。他期待你穿上的，究竟是一件崭新的华服，还是旧日里的一道影子？衣裳的来历，你终究没能查个明白，只隐约觉得，皇后既肯费心备下，便不会只是一份寻常的心意。烛花轻轻爆了一声，更漏迢迢，你把这点疑影压在心底，只告诉自己：往后的路，每一步都须多留几分心。",
    fail: "满殿宾客俱都低着头，连丝竹声也不知何时停了。皇上方才将酒盏重重掷在案上，脸色铁青，一字未言，竟当众拂袖而去。你跪在冰凉的金砖上，听着那盛怒的脚步渐渐远去，才有人压低了嗓子议论：那是纯元皇后的旧衣。原来你披上它的那一刻，他看见的并不是你。皇后端坐凤座，轻轻叹了口气，只说是自己一时疏忽，没留意衣裳的来历，转头还温言细语安慰了你几句，字字句句都是体恤。你垂首谢恩，掌心却被指甲掐得生疼。这般周全的疏忽，偏偏落在你一人身上，岂会是巧合？今夜宫灯如昼，照得满身华服只剩一片寒凉，皇上这一份怒意，一时半刻是消不下去了。",
  },
  popupRules: {
    seen: "识破：免祸。",
    half: "只起疑、没查实：圣宠 -2。",
    fail: "没识破：圣宠 -5。",
  },
};

/** 第 10 回合【景仁宫对质】。 */
export const CONFRONT = {
  name: "景仁宫对质 · 自请出宫",
  emoji: "⚖️",
  flavor:
    "景仁宫里点着安神的檀香，烟气一缕一缕往上飘，熏得人眼睛发涩。皇后端坐正中，手边的茶早已凉了，皇上坐在她身侧，一手按着扶手，不言不语。皇后先叹了口气，说本是些不值一提的闲话，只是传得久了，总要当面说开才好，随即一条一条问了下去，语气温和得像在闲谈家常。每问一句，皇上的目光便在你脸上停一停，那目光里没有怒意，只有审视。你跪在冰凉的金砖上，听着那些细碎的陈年旧事被一件一件翻出来，才发觉有的话，当时屋里只有两三个人。你抬眼扫过殿中，没有看见那个最熟悉的身影，陵容没有来。",
  cards: ["jinyanShenxing", "meizhuangXiangzhu", "wenTaiyiZhenzhi", "jinxiXiangzhu", "shoulongRenxin", "guojunwangXiangzhu"] as readonly CardId3[],
  /** 没有专门辩词时的通用说法：为小主对皇上的忠心作证。 */
  cardStory: {
    jinyanShenxing: "你撑着虚软的身子，重重叩首，额头撞在金砖上一声闷响：「臣妾对皇上的一片心，天地可鉴，从无半点欺瞒。皇上若不信，臣妾无话可说，可这份心，臣妾不敢昧着良心不认。」皇上看着你，没有出声。",
    meizhuangXiangzhu: "眉庄不等传唤，径直走到殿中跪下，脊背挺得笔直：「皇上，嬛儿是什么样的人，臣妾最清楚。从前臣妾蒙冤，是她奔走相救，这份情臣妾记一辈子。她待皇上的赤诚，臣妾愿以位分担保。」皇后看了她一眼，没有说话。",
    wenTaiyiZhenzhi: "温实初双手捧着脉案，跪在阶下，声音有些发紧，却一字一句说得清楚：「小主这些日子的起居言行，臣每日请脉都看在眼里，所言所行皆有脉案可查。小主对皇上只有忠心，没有半分异志。」他把脉案高高举过头顶，等着人来接。",
    jinxiXiangzhu: "槿汐跪在你身后，不疾不徐地开口，一个字也没有多：「小主日日念着皇上的安康，夜里惊醒，头一句问的也是皇上歇下了没有。奴婢寸步不离，都看在眼里。」说完，她伏下身去，再没有抬头。",
    shoulongRenxin: "小允子领着碎玉轩的宫人跪了一地，他抢先磕了个头，嗓子都劈了：「奴才们愿意作证！小主待下宽厚，口口声声不离皇上，对皇上忠心耿耿，奴才们哪怕掉脑袋，也不敢有半句虚言。」身后的宫人跟着齐齐叩头。",
    guojunwangXiangzhu: "果郡王恰在殿外候见，听见里头的动静，掀帘进来，规规矩矩行了礼，替你说了几句公道话：「皇兄，臣弟以为，莞嫔对皇兄的心意，绝无可疑。宫里的闲话向来越传越走样，皇兄英明，断不会因几句风言风语，就冷了人的心。」皇上看了他一眼，神色缓了一缓。",
  } as Record<string, string>,
  /** 针对某条指控的专门辩词：指控 → 辩白牌 → 说法。 */
  pleas: {
    shiqinNeiqing: {
      jinyanShenxing: "你叩首道：「那几日臣妾确是身子不适，不敢侍奉圣驾，当时已禀过敬事房，并无欺瞒之意。」",
      wenTaiyiZhenzhi: "温实初叩首：「那几日小主脉象虚浮，不宜承恩，臣的脉案上写得明明白白。」",
    },
    zhuangshenNonggui: {
      jinxiXiangzhu: "槿汐跪下道：「那夜小主一直在碎玉轩，奴婢守在门外，寸步未离，从没见小主出过门。」",
      shoulongRenxin: "小允子叩头道：「那夜碎玉轩上下都在，门禁是奴才亲手落的锁，没有人出去过。」",
    },
    sitanSiqiu: {
      jinyanShenxing: "你垂泪道：「臣妾不过盼着在余氏临终之际探望一面，念的是旧识之情，但愿她走得安心，并无传话灭口之意。」",
      shoulongRenxin: "小允子叩头道：「碎玉轩遣人探视余氏，是领了牌子、记了档的，内务府一查便知。」",
    },
    jierenYaochong: {
      jinyanShenxing: "你轻声道：「那支曲子，不过是姐妹间的消遣。皇上驾临，臣妾事先全然不知。」",
      shoulongRenxin: "小允子叩头道：「那日皇上是临时改了路，才进的碎玉轩，沿途宫人都看见了。」",
    },
    kuitanGongwei: {
      jinxiXiangzhu: "槿汐道：「碎玉轩的出入归奴婢管，哪个宫人几时出的门、去了何处，一笔一笔都有数。」",
      shoulongRenxin: "小允子叩头道：「碎玉轩的规矩森严，下人从不私下走动，内务府的账上都有记录。」",
    },
    qiuziXinqie: {
      jinyanShenxing: "你垂首道：「臣妾盼着子嗣，也是盼着替皇上、替皇家添福，并无半点私心。」",
      wenTaiyiZhenzhi: "温实初叩首：「小主体虚，臣早嘱咐过多礼佛静养，那日不过是遵医嘱去的。」",
    },
    wangyeZengwu: {
      jinyanShenxing: "你不卑不亢：「那日臣妾与王爷只论诗文，隔着回廊，宫人皆在，不曾有半分逾矩。」",
      guojunwangXiangzhu: "果郡王恰在殿外候见，进来拱手道：「皇兄，那日臣弟奉太后之命办事，同莞嫔说了几句闲话，并无私相授受。」",
    },
    guyiYuanyan: {
      jinyanShenxing: "你伏地道：「那日臣妾不过是一时惶恐，说了不当的话，绝无怨怼皇上之意。」",
      meizhuangXiangzhu: "眉庄上前一步：「皇上待嬛儿的情分，她心里比谁都清楚，怎会有怨言。」",
    },
    xinlengZhiyu: {
      meizhuangXiangzhu: "眉庄道：「早产之后心绪不宁，说几句丧气话，岂能当真？嬛儿心里从没有怨过皇上。」",
      wenTaiyiZhenzhi: "温实初叩首：「小主产后体虚，情志郁结，那是病里的话，臣可以作证。」",
    },
    yuzhongShuxin: {
      jinyanShenxing: "你泣道：「臣妾身为人女，只想问一声父亲冷暖，信中只字未提朝政。」",
      shoulongRenxin: "小允子叩头道：「那封信是先过了狱卒的眼才递进去的，写了什么，一查便知。」",
      guojunwangXiangzhu: "果郡王恰在殿外候见，进来道：「皇兄，那封信臣弟也看过，不过是问安的家常话。」",
    },
    qiciBuyong: {
      wenTaiyiZhenzhi: "温实初叩首：「小主有孕，饮食用药须经太医过目。那盅补品臣尚未验过，不敢让小主入口。」",
      jinyanShenxing: "你叩首道：「臣妾不敢辜负娘娘的好意，只是身子金贵，一应入口的东西，都要先请太医验过。」",
    },
    xijianSiyu: {
      jinyanShenxing: "你低头道：「席间不过说些衣裳花样，臣妾并没有议论各宫长短。」",
      meizhuangXiangzhu: "眉庄道：「那日臣妾也在席上，说的都是家常闲话，哪有什么搬弄是非。」",
    },
    chuyanDingzhuang: {
      jinyanShenxing: "你叩首道：「那日臣妾言辞或有失当，事后已向齐妃娘娘赔过不是。」",
      meizhuangXiangzhu: "眉庄冷冷道：「齐妃姐姐言语失当在先，嬛儿不过据理分辩，何来顶撞？」",
    },
    shanduShide: {
      jinyanShenxing: "你垂首道：「臣妾待祺贵人向来平和，从没有在人前给她脸色。」",
      shoulongRenxin: "小允子叩头道：「那日在场的宫人都看见了，小主对祺贵人一直礼数周全。」",
    },
    yuanwangJunfu: {
      jinyanShenxing: "你泣道：「臣妾为父亲喊冤，是盼着皇上明察，不是怨皇上；一片孝心，请皇上明鉴。」",
      guojunwangXiangzhu: "果郡王恰在殿外候见，进来道：「皇兄，甄大人的案子朝野议论纷纷，不独莞嫔一人心急。」",
    },
    "enshang.jingrenHoushang": { jinyanShenxing: "你叩首道：「娘娘赏的步摇，臣妾只在内殿试戴过一回，去寿康宫请安，穿戴的仍是自己的份例。」" },
    "enshang.xieliGongwu": {
      jinyanShenxing: "你叩首道：「娘娘托付宫务，臣妾不过是替娘娘分忧，一切都请示过娘娘，不敢专擅。」",
      meizhuangXiangzhu: "眉庄道：「皇后娘娘托付宫务，臣妾也在一旁帮手，每一桩都是回过娘娘的。」",
    },
    "enshang.antaiBupin": {
      jinyanShenxing: "你叩首道：「娘娘送来的补品，臣妾不敢擅用，正等着太医来验过。」",
      wenTaiyiZhenzhi: "温实初叩首：「小主身子金贵，补品入口前，臣都要先验过。」",
    },
    "enshang.jiayanXianyi": { jinyanShenxing: "你叩首道：「家宴献艺，是奉了娘娘的懿旨，臣妾岂敢有争宠之心。」" },
    "enshang.shanghuaXiaoju": {
      jinyanShenxing: "你叩首道：「赏花小聚是娘娘的美意，臣妾不过随众人叨扰，席上留心的，只是别失了礼数。」",
      meizhuangXiangzhu: "眉庄道：「那日赏花，臣妾也在场，大家都是说说笑笑，没有一句不妥。」",
    },
    fabricated: {
      jinyanShenxing: "你抬起头，一字一顿：「这话臣妾从未说过，请皇上明察是谁凭空编造。」",
      meizhuangXiangzhu: "眉庄道：「嬛儿断不会说这样的话，臣妾愿以性命担保。」",
    },
  } as Record<string, Partial<Record<CardId3, string>>>,
};

/** 第 18 回合【肺痨之诬】。 */
export const FEILAO = {
  name: "肺痨之诬",
  emoji: "🤒",
  flavor:
    "入冬以来，你夜夜咳得睡不安稳，白日里还要挑水、扫雪、抄经，一口气总提不上来。这日晨课刚散，静白领着两个粗使的师父拦在院门口，掩着口鼻退开三步，高声道：「诸位都听见了，她咳得这般厉害，分明是肺痨！这病过人，一个传一个，全寺都要遭殃。」满院的师父低着头，没有一个人出声。静白又说：「后山凌云峰有间空屋，今日就把她挪过去，谁也不许再近她的身。」你想分辩，喉头一痒，又是一阵咳，帕子上却干干净净。她要的，本就不是一个真相。",
  cards: ["jinxiXiangzhu", "chanyuXiushen", "meizhuangXiangzhu"] as readonly CardId3[],
  cardStory: {
    jinxiXiangzhu: "「背你上山」：槿汐一句话不说，蹲下身把你背了起来。静白的人伸手来拦，她只回头看了一眼：「我家小主的身子，轮不到你们碰。」山路上积着雪，她一步一步踩得很稳，背上的你听见她的喘息，一声比一声重，却始终没有放下你。",
    chanyuXiushen: "「佛前陈情」：你整了整衣襟，在静岸师太面前跪下，把病了多久、咳在何时、帕上有无血色，一桩一桩平平静静地说清楚。师太闭着眼捻了许久佛珠，终究没有驳回静白，却对身边的小尼说：「去，把今日的话记在簿上。」",
    meizhuangXiangzhu: "「宫中送药」：天黑透了，山门外有人叩门，是眉庄托人连夜送来的包袱：几味润肺的药材，一件厚厚的狐裘，夹层里还缝着一张字条，只有八个字：「咳是真的，肺痨是假的。」你把字条在灯上烧了，药材却收得很小心。",
  } as Record<string, string>,
  tiers: [
    { name: "师太暗护", text: "清誉 -1；下一次危机未化解时免罚", story: "静岸师太拦不住静白，当着众人只说了句「依规办吧」，转过身却吩咐小尼：把后山空屋的炭盆生起来，被褥晒透了，再送一罐熬好的汤药上去。你踏进那间屋子时，屋里竟是暖的，案上还摆着一碟尚温的素点。" },
    { name: "仓皇出寺", text: "身子 -1、清誉 -2；未来 2 回合每回合末身子 -1", story: "静白只许你带随身的衣物，连那卷抄了一半的经也不让拿。槿汐扶着你，踩着雪往后山走，山路又陡又滑，你们走几步就要歇一歇。身后山门「砰」的一声合上，惊起了檐上一排寒鸦。屋里的炕是冷的，窗纸破了好几处，槿汐点了半天才把灯点着。" },
    { name: "连夜被逐", text: "身子 -2、清誉 -3；未来 2 回合每回合末身子 -1", story: "不等天亮，静白便叫了几个粗使婆子，连人带铺盖把你抬出了寺门。雪下得正紧，你裹着一床薄被躺在担架上，听见沿途的窗后有人压低声音议论：「肺痨呢，离远些。」山上的屋子多年没人住，进门便是一股霉味。从这夜起，寺里都传你的病会过人，再没有一个人愿意靠近凌云峰。" },
  ],
};

/** 第 21 回合【月下琴笛】（条件事件）。 */
export const CHANGXIANGSI = {
  name: "月下琴笛",
  emoji: "🎶",
  flavor:
    "山中夜深，月色清得像水。窗外忽然传来几声试笛，你推门出去，果郡王正立在院中那株光秃秃的合欢树下，袖里露出半截笛子。他不看你，只低声说：「路过听见屋里有琴声，便想着，若有人肯和一曲就好了。」你屋里确有一张旧琴，是入寺时带来的，弦已松了大半。",
  rule: "同一回合打出【果郡王相助】与【禅语修身】「笛箫合奏」：清誉 +2。不触发则没有效果。",
  story:
    "你把旧琴搬到石桌上，一根一根调好了弦。他横笛在唇边，先吹了一段起头，你听出是《长相思》，指尖便落了下去。笛声清，琴声缓，一句接着一句，谁也没有开口说话。山风吹过枯枝，竟也静了下来。曲终时他放下笛子，只说了一句：「这曲子，原不该只有我一个人吹。」你低头拨了拨余音未尽的琴弦，没有应声，可案上的灯花，却爆了两下。",
};

/** 第 25 回合【舟覆噩耗】。 */
export const ZHOUFU = {
  name: "舟覆噩耗",
  emoji: "🌊",
  text: "消息是夜里传来的：果郡王的船在江上翻了，尸骨无存。",
};

/** 登门开场文本：随疑点、遗物、出宫档位不同。 */
export function dengmenOpenText(doubt: number, relics: number, exitTier: ExitTier | null): string {
  const score = doubt + relics;
  if (score <= 0) return YIHUA.dengmenOpen.none;
  const base = score <= 2 ? YIHUA.dengmenOpen.light : score <= 4 ? YIHUA.dengmenOpen.mid : YIHUA.dengmenOpen.heavy;
  return base + (relics > 0 ? YIHUA.dengmenOpen.relic : "") + (exitTier !== 1 ? YIHUA.dengmenOpen.notGraceful : "");
}

/** 第 26 回合起的持续事件【移花接木】。 */
export const YIHUA = {
  name: "移花接木",
  emoji: "🎎",
  flavor: "要保住这个孩子，只有一条路：回宫，让皇上相信，这是他的孩子。",
  /** 每步先显示 todo（要办的事）；解完才换成结果文本并露出下一步。 */
  steps: [
    { name: "引驾", emoji: "🔔", todo: "你有孕在身，在寺里藏不了多久。得先让皇上动身来一趟甘露寺：托人在御前递话，说太后凤体欠安，宜往山中祈福。" },
    { name: "偶遇", emoji: "🌸", todo: "皇上要来了。佛前这一面该怎么见，是素心念经，还是布衣荆钗，要想好。" },
    { name: "改脉", emoji: "📜", todo: "皇上留宿之后，宫里很快就要传出喜脉的消息，这孩子的月份必须对得上，否则你们几个人都活不成。得去求温太医，请他在脉案上动手脚。" },
    { name: "登门", emoji: "🚪", todo: "温太医向皇上报了喜脉，第二天皇上亲自登门，要看你究竟有没有瞒他什么。" },
  ],
  /** ① 完成后追加的一句：已落发，要多打一张。 */
  luofaDone: "你已落发为尼，皇上未必肯为一个出了家的人动身，所以又多费了一番周折。",
  /** ② 完成后按所用解牌的结果。 */
  ouyuDone: {
    chanyuXiushen: "你在佛前念着经，没有回头，直到身后的脚步声停下。",
    jingchaiBuqun: "你荆钗布裙，正蹲在廊下拾落叶，听见脚步声也没有躲。",
  } as Record<string, string>,
  /** ③ 完成后的结果。 */
  maiDone: "温太医沉默了许久，终于长叹一声，答应在脉案上悄悄改写月份，把这个孩子的来历瞒得严严实实。",
  yinjiaCards: ["jinxiXiangzhu"] as readonly CardId3[],
  yinjiaStory: {
    jinxiXiangzhu: "槿汐想法子去拉拢御前的苏培盛，托他在皇上跟前递话，说太后凤体欠安，宜往甘露寺祈福。苏培盛问她：「这些年的心意，你可明白？」槿汐低着头，应下了对食之约，只求他把话递到。",
    meizhuangXiangzhu: "眉庄在太后跟前进言，说甘露寺香火灵验，太后凤体欠安，正该去那里祈福。",
  } as Record<string, string>,
  /** 落发后引驾要多打的那一张，除了槿汐也可以是这张。 */
  luofaExtra: "meizhuangXiangzhu" as CardId3,
  /** 引驾完成后第几回合偶遇；偶遇没成，再隔几回合。 */
  ouyuDelay: 2,
  ouyuRetry: 2,
  /** 移花接木开始后，每打出一张 📜疑点 -1。 */
  doubtCards: ["jinxiXiangzhu", "meizhuangXiangzhu"] as readonly CardId3[],
  /** 偶遇成功的弹窗：求皇上原谅，暗中盘算下一步改脉；按解牌略有不同。 */
  ouyuPopup: {
    chanyuXiushen: [
      "你在佛前合十，缓缓转过身，在皇上面前跪了下去：「臣妾有罪，求皇上原谅。」皇上沉默了很久，终究伸手扶你起来，说他这些年也想过你。",
      "你垂着眼，把这几年的委屈与思念一句一句说得很轻，说到最后，眼泪落在他的袖口。皇上叹了口气，没有再责怪你。",
      "天色渐晚，山风入帘，皇上说今夜不回宫了，便留宿在这清冷禅院之中。灯影摇红，你伏在他肩头，心里却清楚，这个孩子藏不了多久：往后只有请温太医在脉案上动手脚，把月份改得对得上。",
    ],
    jingchaiBuqun: [
      "你一身荆钗布裙，手上还沾着落叶的碎屑，见了皇上也不躲，只缓缓跪下：「臣妾有罪，求皇上原谅。」皇上看着你素净的模样，眼眶竟有些红了。",
      "他伸手扶你起来，指尖触到你粗糙的手背，问你在山上吃了多少苦。你摇摇头，只说能再见皇上一面，便不觉得苦。",
      "暮色四合，皇上不忍就此离去，当夜便留宿甘露寺，与你共对一盏青灯。你面上柔顺，心里却一刻未敢放松：这孩子的月份瞒不过太医，只有早早找温太医商量，在脉案上做些改动，才能让一切合情合理。",
    ],
  } as Record<string, string[]>,
  /** 登门：能算数的解牌。 */
  dengmenCards: ["jinxiXiangzhu", "jingchaiBuqun", "chanyuXiushen", "wenTaiyiZhenzhi"] as readonly CardId3[],
  /** 登门要打的张数：疑点 + 尚未焚毁的遗物 合计 1–2 → 1 张，3–4 → 2 张，5 以上 → 3 张；零则只过剧情；不是体面自请再多 1 张。 */
  dengmenStory: {
    jinxiXiangzhu: "槿汐趁皇上在廊下歇脚，托苏培盛递了话：「小主这几年夜里常常惊醒，嘴上不说，枕下压着的还是皇上赏过的那串念珠。」苏培盛躬着身子，把这些话一字不落地回给了皇上。",
    jingchaiBuqun: "你素衣布裙地迎出门去，袖口磨得起了毛边，手背上还有冻裂的口子。皇上看了许久，才低声问：「怎么瘦成了这样？」你垂着头只说不苦，他的喉头却动了一动。",
    chanyuXiushen: "你没有提自己的苦，只劝皇上：「前朝事忙，皇上要保重龙体，莫为臣妾这点小事熬坏了眼睛。」皇上怔了怔，接过你递来的热茶，神色缓了下来。",
    wenTaiyiZhenzhi: "温太医跪在阶下回禀：「小主身子本就虚，山中潮冷，实在不宜在此处养胎，若再拖下去，只怕母子都有闪失。」皇上沉默片刻，道：「那就接回宫里去。」",
  } as Record<string, string>,
  dengmenOpen: {
    /** 疑点与遗物皆无：早料到皇上多疑，准备周全。 */
    none: "天刚擦黑，山门外传来銮铃声，皇上亲自来了。你早料到他生性多疑，这几日里里外外都收拾过：旧物一件不留，脉案、说辞、身边人的口径，样样对过不止一遍。你立在廊下迎驾，神色平静，连衣褶都是整的。他在屋里转了一圈，什么也没问，只说：「朕来看看你。」",
    /** 合计 1–2。 */
    light: "山门外忽然传来銮铃声，皇上亲自登门了。你迎出去时，心里清楚还有一两处不够圆满。他在院中站了许久，目光从你的脸滑到你的腰身，缓缓问：「这些日子，你在山上都想了些什么？」",
    /** 合计 3–4。 */
    mid: "山门外銮铃声急，皇上亲自登门，随行的人比往日多。他进了屋，不坐，只一样一样地看：案上的经卷，窗边的旧琴，你的脸色。「嬛嬛，」他说，「朕听到些话，想听你自己说。」你知道有几处没有弥缝好，掌心全是汗。",
    /** 合计 5 以上。 */
    heavy: "銮铃声到了山门便停了，皇上一个人走了进来，脸上看不出喜怒。他在屋里站定，目光一寸一寸地扫过去，像在找什么。苏培盛在门外垂手不语，连风声都静了。「朕不绕弯子，」他说，「你有没有事瞒着朕？」你只觉得身上的衣衫一点一点被冷汗浸透。",
    /** 手里或牌库里还有遗物时追加。 */
    relic: "屋角那几件旧物还没有处理干净，你不敢往那边看。",
    /** 出宫不是体面自请时追加。 */
    notGraceful: "你又想起当初是怎样离开紫禁城的，他心里的那道坎，未必已经过去。",
  },
  dengmenNarrow: "皇上在屋里坐了很久，目光几次停在你身上，又移开。临走时他只说：「有些话，朕今日不问。你先回宫，日后再说。」你伏在地上谢恩，后背的衣衫早已被冷汗浸透。",
  dengmenDone: "皇上的神色终于松了。他伸手替你掖了掖披风，说：「山里终究清苦，回宫吧。」你俯身谢恩，听见自己的心在胸腔里一下一下地跳。",
  dengmenNoneDone: "皇上坐了半个时辰，同你说起太后的病，说起胧月学会了走路。临走时他站在门槛上回头：「嬛嬛，回宫吧，朕让人来接你。」",
  ouyuStory: "皇上在佛前看见你，愣住了。「嬛嬛。」他唤你。你第一次明白，可以把“像她”当成手段：这一回，是我借了她的影子。当夜，皇上留宿甘露寺。",
  doubtLabel: "疑点",
  dushuNote: "那件旧物还留在手边，宫里人多眼杂，万一被谁瞧见，便是说不清的麻烦。你一整日都坐立不安。",
  dushuStory: "皇上在你屋里看见了那件东西，随口问了一句是谁的。你答得很快，可他已经多看了一眼。",
};

/** 第三幕结局：凤阙归来。 */
export const HOMECOMING = {
  name: "凤阙归来",
  emoji: "👑",
};

// ---------------------------------------------------------------- 对质结果

export type ExitTier = 1 | 2 | 3 | 4;

/** Cards needed by presented 把柄 (before the 贵人 +1). */
export function confrontNeeded(presented: number): number {
  if (presented <= 0) return 0;
  if (presented <= 3) return 2;
  if (presented <= 6) return 3;
  return 4;
}

/** Outcome by presented 把柄 and how many cards were missing. */
export function confrontOutcome(presented: number, short: number): ExitTier {
  const col = Math.min(2, Math.max(0, short));
  const row: readonly ExitTier[] =
    presented <= 3 ? [1, 2, 2] : presented <= 6 ? [1, 2, 3] : presented <= 11 ? [2, 3, 3] : presented <= 16 ? [2, 3, 4] : [4, 4, 4];
  return row[col]!;
}

export const EXIT: Record<ExitTier, { name: string; emoji: string; effects: readonly Delta3[]; story: string; longyue: string; emperor: string }> = {
  1: {
    name: "体面自请",
    emoji: "🍃",
    effects: [],
    story:
      "景仁宫里静得能听见烛花爆开的声音。你摘下珠钗放在掌心，向御座叩首：「臣妾自知德行有亏，愿往甘露寺带发修行，为皇上、为太后祈福。」皇后温声劝了两句，你只是不应。皇上看了你许久，终于道：「朕准了。车马仪仗，照你如今的位分，不可怠慢。」你伏身谢恩，额头触着冰凉的金砖，竟没有一滴泪。",
    longyue:
      "启程前夜，你抱着胧月走到咸福宫。敬妃没有多问，只伸手接过孩子，托稳她的头。你低声说：「她夜里爱醒，醒了不哭，只睁着眼睛看人。」敬妃红着眼眶点头：「你放心，我拿她当亲生的疼。」你行了大礼，转身便走，身后忽然传来一声细细的啼哭，你终究没有回头。",
    emperor: "皇上沉默良久，只说：「朕准了。」",
  },
  2: {
    name: "被劝出宫",
    emoji: "🚪",
    effects: [],
    story: "皇上将茶盏轻轻搁下，没有问罪，也没有再看你，只淡淡道：「你既心不在此，便去佛前静一静。」你想辩白，却见他已别过脸去。旨意传下，你被送出了宫门，一路上无人相送，车帘外只有辘辘的轮声。",
    longyue: "你在殿外跪了许久，求皇上让你把胧月托付给敬妃。他终于松了口。你把孩子交到敬妃手里，她接得极稳，你却连一句嘱咐也说不完整，只能一遍遍低头看那张小脸。",
    emperor: "皇上看着你，目光一点一点冷下去：「朕原以为，你是不一样的。」",
  },
  3: {
    name: "被废出宫",
    emoji: "⛓️",
    effects: [sz(-1)],
    story: "皇上拂袖而起，当殿下旨：褫夺封号，废为庶人。你想开口，却被两个嬷嬷按住了肩。你只带了随身几件衣物，当日便被送出宫门，朱红的宫墙在身后一点点远去，没有人回头看你。",
    longyue: "嬷嬷上前，当场把胧月从你怀里抱走。你伸出手去，只抓住一角襁褓，又被硬生生掰开。哭声渐渐远了，没有人告诉你，她被送去了哪里。",
    emperor: "「朕待你如何，你心里清楚。」你心里接了一句：你待的，本就不是我。",
  },
  4: {
    name: "打入冷宫",
    emoji: "❌",
    effects: [],
    story: "皇上拂袖而去，一个字也没有再说。旨意随后颁下，你被送入冷宫。宫门从外面落了锁，窗纸破了半幅，夜里的风直往屋里灌。你隔着门缝望出去，只见一线灰白的天，从此再也没有走出去过。",
    longyue: "胧月交给了皇后抚养。",
    emperor: "皇上一个字也没有再说。",
  },
};

/** 对质结束时按情分落一句；陵容退场时按情分各有一笔。 */
export const LINGRONG_TRUTH: Record<LingrongTier, string> = {
  close: "她终究还是替我瞒下了一些。",
  distant: "原来她什么都告诉了皇后。",
  resentful: "连没有的事，她也替皇后想好了。",
};
export const LINGRONG_FAREWELL: Record<LingrongTier, string> = {
  close: "出宫前一夜，宝鹊悄悄送来一盒亲手调的香，说是她家小主给的，只带了一句话：「心中有愧，只愿姐姐平安。」",
  distant: "陵容没有来送。只托人带了一句「姐姐保重」。",
  resentful: "陵容没有来送。后来你才知道，她还在替皇后打听你的消息。",
};

// ---------------------------------------------------------------- popups (§五)

export type PopupId = "opening" | "huanghou" | "tonghuatai" | "chunyuan" | "wanwan" | "confront" | "exit" | "feilao" | "zhoufu" | "ximai" | "ouyu" | "dengmen" | "qinse" | "lizigao";

export const POPUP_TEXT = {
  opening: "翊坤宫的门关上了。华妃倒了，六宫都说碎玉轩的莞主子是头一份的恩宠。听说景仁宫也要亲自来贺。",
  openingTail: {
    pinPregnant: "你已是嫔位，腹中的孩子一日日大起来，盯着碎玉轩的眼睛也一日日多了起来。",
    guirenPregnant: "腹中有了孩子，只是位分还低，总要寻个机会让太医把喜讯报到御前。",
    pinPlain: "你已是嫔位，只是腹中还没有动静，宫里的人看你的眼神，已有了几分探究。",
    guirenPlain: "位分还低，腹中也还没有动静。时日不多了。",
  },
  /** 每局都有：眉庄洗冤复位。 */
  meizhuang: "华妃一倒，眉庄假孕一案也查清了：是华妃买通太医刘畚设的局。皇上复了她的位分，又赏了好些东西。眉庄解了禁足，头一件事就是来碎玉轩看你。",
  returned: {
    wenTaiyiZhenzhi: "温实初从疫所回到了太医院，听说你近来多有不适，随时可以替你诊脉。",
  } as Record<string, string>,
  openingRules: [
    "👭 眉庄冤屈洗刷、复了位分，说话更有分量：本关【眉庄相助】打出时，除了原有效果，还立刻抓 1 张牌。",
    "🏵️ 皇后会在第 2 回合亲自登门。",
  ],
  huanghou:
    "皇后亲自来碎玉轩道贺，赏下一对玉镯：「华妃之事，妹妹受委屈了。往后六宫和睦，还要靠妹妹帮衬。」她笑得温和，你却想起翊坤宫倒下那日，她站在廊下一言不发的样子。",
  /** 第一幕说明里的六宫人物（只写眉庄、陵容；其余人物由皇后笑意里皇后的口吻介绍）。 */
  people: [
    { name: "沈眉庄", text: "沈眉庄复位之后，对圣宠淡了许多，常去寿康宫陪太后说话。待你还是从前那样，有事总第一个站出来。" },
    { name: "安陵容", text: "安陵容出身寒微，心思细密，说话总是轻声细语，一句话要在心里转上几转才肯出口。她有一副好嗓子，又会调香，这些年一直依傍着你和眉庄，常来碎玉轩走动，待你恭顺周到，挑不出半点错处。只是她笑起来总带着几分小心，一垂眼便什么也看不出；这些日子她心里藏着什么，你竟说不准。" },
  ] as readonly { readonly name: string; readonly text: string }[],
  /** 皇后笑意：皇后的口吻介绍如今的后宫（不含眉庄、陵容）。 */
  huanghouPeople: [
    { name: "端妃", text: "端妃是潜邸里最早伺候皇上的，可惜多年前伤了身子，常年在延庆殿静养，极少出门。皇上念着旧情，一向厚待她。她喜欢清净，妹妹若去探望，略坐一坐便好，别累着她。" },
    { name: "敬妃", text: "敬妃资历深，性子温厚，从不与人争。只是膝下一直空着，平日在咸福宫做些针线，最喜欢孩子。妹妹得空，不妨常去陪她说说话。" },
    { name: "欣贵人", text: "欣贵人也是潜邸的旧人了，生过淑和公主。她性子爽利，只是说话直了些，有时不大顾分寸，本宫也说过她几回。她和齐妃说话总有些不对付，妹妹夹在中间，倒要多留些心。" },
    { name: "齐妃", text: "齐妃是三阿哥的生母，王府时就跟着皇上，也是本宫的旧人，没什么心思。她见妹妹得宠，心里难免不痛快，妹妹别往心里去。" },
    { name: "祺贵人", text: "祺贵人是瓜尔佳氏，华妃去后才得宠，年轻，难免娇纵些。她父亲鄂敏在前朝当差，听说和甄大人政见不大相合。不过那是前朝的事，这孩子常来本宫这里走动，妹妹不必多想。" },
  ] as readonly { readonly name: string; readonly text: string }[],
  huanghouIntro: "皇后端起茶盏，缓缓说道：「妹妹刚出来走动，如今的六宫，有几位是该认一认的。」",
  huanghouRules: ["🏵️ 皇后事件：回合末按默认结算；打出卡面所列的牌，换成对应的赏赐。"],
  /** 开局规则说明里的第一幕事件规则。 */
  eventRules: [
    "🤝 盟友事件：第一次把握，获得她的盟友状态。",
    "⚔️ 对头事件：须同回合打出两张解牌；其中有指定的牌才算打压，获得【打压】状态：她的危机下次出现时少需要 1 张解牌。",
    "🔗 连环事件：一对危机与机会。须先化解危机，才能把握机会；危机没化解，机会随之作废。危机须两张解牌，其中标明的那张可一石二鸟：一张牌同时化解危机、把握机会，既结交盟友，又打压对头（她的危机下次出现时少需要 1 张解牌）。",
  ],
  /** 桐花台初遇：开头与结尾按你的应对（论笛谈诗 / 以礼相待 / 有陵容在侧）而不同，中间介绍他的一段相同。 */
  tonghuatai: {
    open: {
      di: "笛声停了。那人回过身来，朝你一揖：「允礼唐突，惊扰小主了。」你却笑着说，他的笛子吹得太急，像是心里有事。",
      li: "笛声停了。那人回过身来，朝你一揖：「允礼唐突，惊扰小主了。」你福了福身，只道了一句「王爷安好」。",
      lingrong: "笛声停了。那人回过身来，朝你一揖：「允礼唐突，惊扰小主了。」你一时不知如何作答，陵容已笑着上前，替你还了礼。",
    },
    bio: "他是当今皇上的十七弟，封果郡王。生母出身不高，他自幼不争不抢，爱诗词，爱笛，也爱游历山川，一年里倒有大半年在宫外。皇上待他亲厚，宫里的人也都说他是诸王里最清净、最没有机心的一个。",
    close: {
      di: "他怔了一怔，倒和你论起笛中的曲子来，说他刚从外头回京，是循着桐花台的旧景来看看。他看你的眼神很干净，没有试探，也没有讨好，临走时还回头看了你一眼。",
      li: "你不肯多留，转身便走。走出好远，桐花台上也没有再响起笛声。你心里清楚，后宫妃嫔与亲王，本就该隔着这样的距离。",
      lingrong: "陵容说你们是来赏花的，三言两语便把话头岔开了。他笑了笑，也不多问，折了一枝桐花递过来，说是唐突了小主，权当赔个不是。",
    },
  } as { readonly open: Record<"di" | "li" | "lingrong", string>; readonly bio: string; readonly close: Record<"di" | "li" | "lingrong", string> },
  tonghuataiRules: "往后他会不时在你最难的时候伸手帮你：牌库里加入【🎐果郡王相助】，打出可抽 1 张牌，本回合出牌 +1，下回合再多抽 1 张；日后还会有几次相逢，每次再添一张。",
  wanwan: [
    "「菀菀类卿，暂排苦思，亦除却巫山非云也。」短短一行字，是皇上的亲笔，墨色早就旧了。你忽然想起生辰宴前那件封在库里的旧衣，想起镜子里那个陌生的自己，原来那从来不是巧合：皇上这些年对你青眼有加，只因你生得像纯元皇后。倚梅园里那一句许愿，杏花林下那一回眸，他赐你的那个“莞”字，取的原是她的“菀”。枕边那些温存的话，一句一句，原来都是说给另一个人听的。",
  ] as readonly string[],
  /** 菀菀类卿弹窗的第二段：按当回合打出的解牌而不同（未打牌即默认）。 */
  wanwanBirth: {
    shihun:
      "你不记得是怎么走出养心殿的，宫道那样长，风灌进袖口，也不觉得冷。回到碎玉轩，腹中才猛地绞痛起来，一阵紧过一阵。身边的宫女慌了神，满院子地叫人，稳婆来时你已疼得说不出话。天快亮时，细细的一声啼哭传来，有人低声道：「恭喜小主，是位公主。」皇上隔日赐名胧月。你抱着那小小的一团，看窗外的天一点点亮起来，心里却有什么东西，跟着那一夜的月色一起暗了下去。",
    fuhui:
      "槿汐赶在殿外的人看见之前扶住了你，一路什么也没问，只在你耳边低声说：「小主，什么都等孩子平安了再说。」她半扶半抱把你送回碎玉轩，吩咐人烧水、备参汤、传稳婆，声音一点没乱。你疼得咬破了嘴唇，她就握着你的手，一遍遍地说：「奴婢在，奴婢在。」天亮时孩子落了地，是位公主，皇上隔日赐名胧月。槿汐替你擦去额上的汗，轻声道：「小主，往后的事，奴婢陪着您。」",
    baochan:
      "你被抬回碎玉轩时，裙角已见了红。流朱哭着跑去太医院，把温实初连夜请了来。他顾不上行礼，当即下针、开方，一碗碗汤药端进来，额上的汗滴在衣襟上也不去擦。你昏昏沉沉间听见他对稳婆说：「胎位尚正，别慌，照我说的做。」直到天边泛白，才传出一声哭，他靠着门框长长地舒了口气：「母女平安。」那是位公主，皇上隔日赐名胧月。他又替你把了一回脉，叮嘱你好生将养，说话时却不敢看你的眼睛。",
    shouhou:
      "眉庄得了信，披着外衣就赶到碎玉轩，进门先吩咐关了院门，谁来问都说小主歇下了。你在里头疼得几乎昏过去，她就守在产房外，一遍遍地问：「怎么样了？可好了？」天亮时孩子落了地，她抱着襁褓进来，眼睛红红的：「是个公主，眉眼长得像你。」皇上隔日赐名胧月。眉庄在榻边坐下，握住你冰凉的手：「嬛儿，别怕，有我在。你若想哭，就在我跟前哭。」",
  } as Readonly<Record<"shihun" | "fuhui" | "baochan" | "shouhou", string>>,
  confrontScene: [
    "孩子才落地没几日，你还躺在榻上，连起身都要人搀着，景仁宫的人就到了：皇后请你过去一趟，说有几句话要当面问。",
    "你到时，殿里已经坐满了人。皇后端坐正中，皇上在她身侧，各宫妃嫔一个不少，齐妃、祺贵人也在。没有人说话，只有茶盏轻轻搁在案上的声音。",
    "皇后叹了口气，说本不愿惊扰你养身子，只是宫里近来有些话传得不好听，不当着皇上和姐妹们的面说清楚，反倒委屈了你。话音刚落，齐妃便抢着开了口，祺贵人在一旁帮腔，一桩接一桩，像是早就备好了的。",
    "你强撑着跪在殿中，小腹还隐隐作痛，眼前一阵一阵发黑。她们要问的每一件，你事先一个字也没听说过。",
  ] as readonly string[],
  confrontIntro: "皇后垂着眼，一言不发。站出来的，是一个又一个早就备好了话的人：",
  confrontNone: "皇后手里什么也没有，翻来覆去，竟寻不出一桩可以拿来问你的事。",
  confrontSummary: {
    exposed: "以上有几桩，当初只有陵容帮过你的忙，也只有她一个人知道。看来是她透露给了皇后。",
    withheld: "可她知道的并不止这些，另有几桩，似乎被她瞒了下来：",
    withheldOnly: "你隐约觉得，有几桩只有陵容知道的事，皇后并没有问起，应是她瞒了下来：",
  },
  confrontDuanfeiLead: "端妃想起你往日去延庆殿陪她说话、问药问安的情分，缓缓抬眸，在一旁轻声说道：「",
  confrontDuanfeiTail: "」皇后看了她一眼，终是略过了这一桩。",
  confrontDuanfei: "端妃想起你往日去延庆殿陪她说话、问药问安的情分，缓缓抬眸，在一旁轻声说道：「妹妹侍奉君前，向来谨慎。宫里的事查来查去，查不出什么，反倒伤了和气。」皇后看了她一眼，终是略过了一桩。",
  confrontQifeiTail: "说到这里，齐妃的目光落到你身上，忽然想起那盘栗子糕，后半句话硬生生咽了回去，脸色白了几分。皇后看了她一眼，这一桩便没有再问下去。",
  confrontQifei: "齐妃几次要开口，目光落到你身上，想起那盘栗子糕，突然语塞，到底一个字也没说出来。皇后手里的事，便少了一桩。",
  /** 栗糕清苦（隐藏事件）：甄嬛眼里的经过；陵容教齐妃的那一层，她此时并不知道。 */
  lizigao: [
    "自你有了身孕，齐妃在景仁宫请安时便总是心神不宁，眼睛有意无意往你小腹上落。她早已不得宠，满心的指望都压在三阿哥身上；你年轻得宠，若再添一位皇子，在她看来，弘时往后的路便窄了。这些，你那时只当是她小家子气，并没往心里去。",
    "可她心里的那口气，早就攒下了。前些日子在你跟前下不来台，当着满宫的人丢了脸面，她一直记着；这回好不容易借三阿哥的功课把皇上留在长春宫，没几日又叫碎玉轩把人请了回去。两回都折在你手里，她在长春宫里枯坐了一夜，越想越怕：再这样下去，皇上眼里只剩碎玉轩，三阿哥往后还能指望谁？",
    "这日长春宫的翠果捧来一盘栗子糕，说是齐妃娘娘亲手做的，给莞嫔补补身子。陵容正巧在碎玉轩陪你说话。你拈起一块刚要入口，她忽然按住你的手：「姐姐且慢。」她把糕凑到鼻尖闻了闻，脸色一变：「这糕里有一股清苦味，是夹竹桃，花粉和汁液都掺进去了。」",
    "她说你这几日胸闷，太医开的是桂枝汤；夹竹桃本就伤胎，与桂枝一同入口，活血祛瘀的药力更猛，若是吃下去，这孩子只怕保不住。你后背一阵发凉，回过神来，紧紧握住了她的手。那一刻你只觉得，这宫里肯这样护着你的，除了眉姐姐，便是她了。",
    "你本想当晚便去养心殿回禀皇上，陵容却拉住了你，轻声道：「姐姐三思。谋害皇嗣，皇上自然要重处齐妃，可三阿哥是皇上的骨肉，又是皇上膝下最年长的阿哥，皇上断不会因生母之过迁怒于他。姐姐细想，今日是姐姐亲手将他的额娘送进了冷宫，他日三阿哥若承继大统，追念生母，这桩旧怨又该记在谁的头上？到那时，只怕姐姐与腹中的孩儿都难以自处。」你怔了半晌，只觉她这一番话思虑深远，处处都是替你打算，连你自己都不曾想到这一层。你想了一夜，终究没有去养心殿，只让槿汐悄悄把那盘栗子糕送去太医院，请章太医验个明白。太医院里人多口杂，没过两日，这件事便传到了皇后耳中。",
    "后来的事，是槿汐从景仁宫的宫人那里辗转听来的。皇后把齐妃单独叫去，又传了章太医来，当着她的面把糕里验出的夹竹桃一五一十说了。齐妃起初咬定不知道夹竹桃会伤胎，皇后却慢慢说出一件事：前些日子，长春宫的人去太医院打听过碎玉轩的安胎方子，早知道你在喝桂枝汤。齐妃当场瘫软在地，只说自己一时糊涂。",
    "皇后没有把这件事报给皇上。她只告诉齐妃，谋害皇嗣是死罪，传出去，三阿哥也要受牵连。齐妃跪着求了许久，皇后才叹了口气：「念你伺候皇上多年，本宫替你瞒下这一回。只是你心术不正，不配再教养皇子，三阿哥往后就挪到景仁宫，由本宫亲自教养，也算给你一个教训。」没过几日，三阿哥的东西便搬出了长春宫。你听说时，只觉这番惩戒未免太轻：谋害皇嗣，不过是挪走一个孩子了事。可皇后已经发了话，你自己也是为着日后打算，才不愿声张，再多说什么也无益。好在那盘糕终究没有入口，孩子平平安安的，你摸着小腹，也就把这口气咽了下去。",
    "这日夜里，你特意把陵容留在碎玉轩用膳，亲手替她布菜，握着她的手久久不放：「今日若不是妹妹，我和这孩子……」话没说完，眼眶先红了。陵容垂着眼，只轻声说姐妹之间，原不必言谢。你却记下了这份恩情，暗暗想着，往后定要好好待她。",
    "齐妃经此一事，气焰全消。景仁宫请安时，她总坐在最末，见了你便低头避开，再不敢夹枪带棒地说一句酸话；从前跟着她附和的几位，也都识趣地噤了声。碎玉轩的日子，一时清净了许多。",
  ] as readonly string[],
  /** 栗糕清苦之后三阿哥已归景仁宫抚养：提到他功课的几段换成齐妃去景仁宫辅导功课。 */
  lizigaoStory: {
    qifeiXunxin: {
      jinyanShenxing: "你笑着回了一句：「娘娘说笑了。听说娘娘如今日日往景仁宫跑，陪三阿哥做功课，那才是皇上放在心尖上的事。」齐妃脸色一白，再没敢开口。",
    },
  } as Partial<Record<EventId3, Partial<Record<CardId3, string>>>>,
  lizigaoXinCover: {
    yuhuayuanQi: "欣贵人嗓门一提，笑着堵了回去：「齐妃姐姐这是羡慕咱们说话投缘吧？风光不风光的，姐姐还是早些去景仁宫，三阿哥的功课还等着您辅导呢。」满园宫人都憋着笑，齐妃讪讪地走了。",
  } as Partial<Record<EventId3, string>>,
  lizigaoRules: "⚔️【打压·齐妃】从此不会用掉：齐妃的危机每次出现都少需要 1 张解牌。📚 三阿哥邀宠不再出现。",
  confrontRealize: {
    exposed:
      "一件件被揭出来，你的心便沉一分。那些事，有的是夜里对着一盏孤灯说的，有的是两个人头挨着头、压低了声音说的。碎玉轩的窗纸那样薄，可听见的，从来只有一个人：安陵容。你想起她替你描眉时微微发颤的手，想起她倚在你肩头唤你“姐姐”的模样。原来这些日子，陵容一直坐在你身边，一针一线绣着荷包，也一字一句，替旁人记着你的话。而能把这些零碎的旧事串成一张网、等到今日才一并抖出来的，只有端坐在上首、一直不动声色的皇后。这一局，是她早就布好的。",
    withheld: "可皇后手里，终究少了几桩。那几件事陵容也知道，却到底没有说出去。你不知道该恨她，还是该谢她。",
    withheldOnly: "你后来才隐约知道，陵容这些日子也替景仁宫留心着碎玉轩的一举一动。只是那几件只有她知道的事，她到底没有说出去。你不知道该恨她，还是该谢她。",
    fabricated: "还有最后那一句，你从来没有说过。可这样的话，这宫里也只有她编得圆。",
    /** 栗糕清苦触发过：甄嬛回头想明白那盘栗子糕。 */
    lizigao: "你又想起那盘栗子糕。齐妃素来不通医理，夹竹桃伤胎、桂枝汤活血，这些门道又是谁说与她听的？那日陵容恰在你身侧，一闻便知，一语道破；转头又婉言相劝，叫你莫去惊动皇上，那盘糕从太医院辗转，偏偏就落到了皇后手里。如今想来，哪里是什么巧合。那一局原是陵容与皇后一同布下的，为的是把三阿哥稳稳当当地挪到皇后膝下；齐妃不过是递刀的人，而你，也只是她们算计里的一环。当日你还握着陵容的手，满心以为欠了她一份救命的情。",
  },
  exitHeart:
    "出宫那日下着小雪。你没有回头看紫禁城，只想起那卷手书上的四个字。原来这些年的恩宠、枕边那些温存的话、倚梅园的那一夜，都是给另一个人的。你不恨了，只是累了。从今往后，这宫里的人和事，与你再无干系。",
  exitGate: "马车停在甘露寺山门前。静白师太上下打量你：「进了这道门，就没有什么小主娘娘了。」",
  exitRules: "第二幕：失去位分，每回合抓 2 打 1，清誉上限 8，换成寺中牌库；🌱身子归 0 即病死寺中。",
  feilao:
    "静白咬定你得了肺痨，当着满寺师父的面，说要把你挪出去，免得过了病气给旁人。你知道那是诬陷，可这样的话一旦说出口，便没有人敢替你争辩。于是你只带了几件随身的衣物，由槿汐扶着，踩着雪往后山走。身后，甘露寺的门「砰」地关上了。山路又陡又滑，你却渐渐觉得心里松了一口气：凌云峰上没有人盯着你的一举一动，没有刁难，也没有闲话，只有风声、雪声和一间清冷的小屋。名声是被人糟蹋了，日子，倒也算落得个清净。",
  feilaoRules: "杂役磋磨、功德箱失窃移出；月下对谈、夜半惊扰、耳目窥伺加入。",
  zhoufu: "消息是夜里传来的：果郡王的船在江上翻了，尸骨无存。他留给你的那些东西，如今只剩下念想。",
  qinse: [
    "庚帖上，两个名字并排立着，墨迹一点点干了。你忽然想起前些日子，雪夜里他赶来的身影，月色下他吹起的那支长相思，想起你抚琴时他低头含笑的样子。琴瑟和鸣，原不过是这样的光景：你不必说，他也懂；他不必问，你也应。",
    "这几件事，一桩一桩，都像是在心里种下了什么。你只觉得，往后不论山风再冷、日子再长，心里总有一处是暖的、定的。",
  ],
  zhoufuQinse:
    "只是那夜琴笛相和的光景还在眼前，你竟没有倒下。你把他留下的东西一件一件收好，心里空得发疼，却也有什么东西在这疼里慢慢沉了下来：他不在了，你更要好好活着，把日子一步一步走下去。",
  zhoufuQinseRules: "【琴瑟同心】生效：此后每回合抓牌数 +1。",
  zhoufuRules: "3 张【果郡王相助】变成 🕯️遗物：打出即焚毁，没有别的效果。",
  ximaiRecall: {
    1: "当初你自请出宫，临行前亲手把胧月交给了敬妃，原想从此清清静静，在佛前了此残生。",
    2: "当初你被劝出宫，跪着求了皇上许久，才许你把胧月托付给敬妃。你原想从此在佛前了此残生。",
    3: "当初你被废出宫，胧月被嬷嬷当场抱走，直到后来才知道她在敬妃身边。你原想从此在佛前了此残生。",
  } as Record<1 | 2 | 3, string>,
  ximaiBridge: "谁知青灯之下，竟遇见了果郡王允礼。山门外一揖，雪地里一问，他的笛声伴着你的清梦，你的经卷也染上了他的茶香。两个人都明白，那一缕情丝早已系牢，山中月夜里，终究越过了那道礼法的藩篱，彼此再无遮掩。直到那一日，他在你面前低声道：「此生得遇你，不算白来。」你没有答话，红了眼眶，心里却已经应了。",
  ximai: [
    "温太医的手指搭在你腕上，迟迟没有拿开。「嬛妹妹……是喜脉。」你怔怔地坐着，手不自觉地护住了小腹。允礼走了，连尸骨都没有找回来，这是他留在世上唯一的骨血。温太医低声劝你：「这孩子若被人知道，你和他都活不成……」你打断他：「我要留下他。」",
    "凌云峰上，一个带罪修行的人有了身孕，瞒不过三个月。要保住这个孩子，只有一条路：回宫，让皇上相信，这是他的孩子。头一件事，便是想法子把皇上引到甘露寺来。可你如今是带罪出宫的修行人，递不进一句话，更见不到御前的人。你把宫里宫外认得的人想了一遍，能把话递到皇上跟前的，大约只有御前总管苏培盛苏公公了。好在槿汐和他是旧日相识，当年同在宫中当差，多少还有几分情面。这条路能不能走通，还要看槿汐肯不肯、苏公公又愿不愿。",
  ] as readonly string[],
  dengmenRules: "皇上登门：须打出下列张数的解牌（槿汐相助 / 荆钗布裙 / 禅语修身 / 温太医相助）才算过关：登门当回合与下一回合内打够为大胜，只差 1 张为险胜，再少则失败。",
  ximaiRules: "持续事件【🎎移花接木】开始，详见事件卡。🌱身子归 0 即小产，失败。",
  homecoming: [
    "这几年里，你在甘露寺青灯古佛，几经风波，终于借着佛前重逢，向皇上低头认了错。温太医在脉案上不动声色，替你把月份圆得天衣无缝：你腹中的孩子，就这样成了皇上的骨血。",
    "消息传回宫中，皇上又惊又喜。他握着那份脉案，在殿上来回踱步，当即下旨，要把你风风光光地接回宫中。",
    "圣旨随后颁下：甄氏温婉淑慎，诞育皇嗣有功，赐姓钮祜禄氏，册封熹妃，即日回宫。从此你不必再顶着那个“莞”字，也不必再躲着人过日子。",
  ] as readonly string[],
  homecomingTier: {
    1: "回宫那日，皇上亲自在宫门前等你，满宫的人都看见了这一幕。",
    2: "回宫那日，六宫的人都来看你，眼神里有好奇，也有忌惮。",
    3: "太后又特意为你抬旗，洗清了被废的旧名。六宫上下，再没有人敢提当年的事。",
  } as Record<number, string>,
};

export type Loss3Kind = "qingyu1" | "qingyu" | "shengchong" | "lenggong" | "death" | "miscarriage" | "doubt" | "deadline";
export const LOSS3_STORY: Record<Loss3Kind, string> = {
  qingyu1: "宫里人人都说你失德，流言传到了皇上耳中。他不曾来问你一句，只吩咐苏培盛，往后碎玉轩的牌子不必再呈上去。你守着一盏孤灯，连晨省也被皇后免了，只听窗外宫人压低声音议论：「从前何等风光，如今还不是这般下场。」",
  qingyu: "寺里人人都说你不守清规，连静岸师太也不再护着你。她在殿前当众叹道：「佛门清净地，容不得这般是非。」不过数日，你便被遣去后山最偏的一间柴房。往日肯同你说话的小尼姑，远远见了你也低头绕开。",
  shengchong: "皇上有许多日子没有翻你的牌子了。起初还有人来送炭送饭，后来连内务府的人也懒得登门。等你想起来推窗去看，碎玉轩的门前已经长了草，廊下的海棠谢了一地，无人来扫。槿汐红着眼睛说：「小主，别等了。」",
  lenggong: "皇上拂袖而去，一个字也没有再说。旨意随后颁下，你被送入冷宫。宫门从外面落了锁，窗纸破了半幅，夜里的风直往屋里灌。你隔着门缝望出去，只见一线灰白的天，从此再也没有走出去过。",
  death: "那个冬天格外冷，山里的雪下了三日不停。你咳得越来越厉害，药炉里的火却一日比一日弱。槿汐抱着你，一遍一遍地喊「小主」，你想应她一声，却再也没有力气。窗外风吹过梅枝，禅房里的灯，终究是灭了。",
  miscarriage: "血染红了禅房的地。你疼得说不出话，只觉得身下一片温热，槿汐哭着去喊人，竟没有一个人回头。孩子没了，也再没有人知道他曾来过。回宫的路断了，凌云峰上那一夜的月色，如今想来，只剩一场空梦。",
  doubt: "「这胎象，不像是两个月的样子。」太医的话传进了景仁宫。皇后听完，只轻轻拨了拨茶盖，淡淡道：「去请皇上来。」不多时，一道旨意便到了禅房前，来人的脸色你从未见过，你知道，所有的遮掩都到此为止了。",
  deadline: "肚子一天天大了，宽大的衣裳再也遮不住。你对着铜镜，看见自己渐渐隆起的小腹，只觉得日子过得太快，该做的事却一件也没来得及做完。远处传来銮驾离去的声音，你知道，一切都来不及了。",
};

/** 胜利结局：按剧情顺序（对质 → 出宫 → 静白污蔑 → 凌云峰 → 移花接木 → 回宫）拼成。 */
export const ENDING = {
  /** 完胜才有的额外交代。 */
  perfect: [
    "銮驾过了神武门，你回望一眼远山，恍如隔世。这一遭你看清了许多：皇上的多疑与凉薄，原是一直都在，只是从前自己不肯看；皇后温言软语背后的筹算，陵容盈盈笑意里的几分真假，也都隔着一层，算不得真心。",
    "从前只求安稳，往后不必了。你轻轻抚着小腹，想起山中那人横笛立在月下的身影，心里一片澄明：这是他留在世上唯一的骨血，你要为他，也为这个孩子，在这深宫里一步一步走得稳，走得远，走出一片枝繁叶茂的天地。",
  ],
  confront: {
    exposed: "景仁宫那一日，皇后当着皇上的面，把一件件“听说的事”问到你脸上。那些只在碎玉轩灯下说过的话，听见的从来只有陵容。",
    plain: "景仁宫那一日，皇后当着皇上的面，把一件件“听说的事”问到你脸上。你一句一句辩白，才知道这一局，是皇后早就布好的。",
  },
  exit: {
    1: "对质到了最后，你没有等皇上发落，自己先跪了下去：「臣妾自请去甘露寺，为皇上祈福。」皇上沉默了很久，才说：「你去吧。」出宫前一夜，你抱着胧月去了咸福宫，亲手把她交到敬妃怀里。敬妃红着眼圈应下：「姐姐放心，我拿她当亲生的。」第二天出宫，皇上还赏了一路的车马，你没有回头。",
    2: "皇上没有当场发落你，只是看着你，目光一点一点冷下去：「朕原以为，你是不一样的。」你跪了许久，才求来一个恩典：许你把胧月托付给敬妃。他最后说：「你既心不在此，便去佛前静一静。」没有旨意，没有仪仗，你自己收拾了几件衣裳，出了宫门。",
    3: "皇上拂袖下旨，褫夺封号，废为庶人，即日送出宫门。你想再看胧月一眼，嬷嬷已经当着你的面把她从怀里抱走，没有人告诉你她被送去了哪里。你只带了随身几件衣物，由人押着出了宫门。直到许多日子以后，温太医上山探视，你才知道她在敬妃身边。",
  } as Record<number, string>,
  gate: {
    1: "马车停在甘露寺山门前。静白师太上下打量你：「进了这道门，就没有什么小主娘娘了。」",
    2: "马车停在甘露寺山门前。静白师太上下打量你：「进了这道门，就没有什么小主娘娘了。」",
    3: "马车停在甘露寺山门前。寺里早已传遍你是被废之人，静白师太上下打量你，连眼皮都懒得抬：「进了这道门，就没有什么小主娘娘了。」",
  } as Record<number, string>,
  feilao: [
    "后来静白咬定你得了肺痨，要把你赶去后山。静岸师太拦不住她，却悄悄让人把被褥和汤药送上了山，你没有吃太大的苦。",
    "后来静白咬定你得了肺痨，当着满寺师父的面要把你挪出去。你只许带随身衣物，由槿汐扶着踩雪上了后山，身后山门「砰」地关上。",
    "后来静白咬定你得了肺痨，当夜就把你抬出了寺门。寺里都传你的病会过人，再没有人敢靠近凌云峰。",
  ] as readonly string[],
  lingyun:
    "名声是被她糟蹋了，凌云峰上倒落得清净：没有人盯着你，只有风声、雪声和一间清冷的小屋，槿汐日日陪着你。山门外一揖，雪地里一问，果郡王带着笛声和茶香来过，两个人都明白那缕情丝早已系牢，一纸庚帖、一夜相守，早把礼法抛在了身后。后来他奉旨出使滇南，船在江上翻了，尸骨无存。",
  relicsKept: (n: number) => `他留下的东西，你还留着 ${n} 件。有些念想，终究舍不得烧。`,
  relicsBurned: "他留下的东西，你一件一件都烧了。从此心里只剩下要走的路。",
  ximai: "温太医搭脉良久，是喜脉。你决意留下他唯一的骨血，回宫的路只有一条：让皇上相信，这是他的孩子。",
  qinse: "既与他琴瑟同心，你便不能只是活着；为了他，也为腹中这个孩子，往后的每一步，都要走得稳，走得高。",
  duishi: "槿汐去求苏培盛引驾，应下了他的对食之约。她说，这是她心甘情愿的。",
  lingrong: {
    close: "陵容瞒下的那几件事，后来再也没有人提起过。",
    distant: "陵容如今在宫里过得很好。只是你们再也没有说过体己话。",
    resentful: "陵容一直替皇后留意着甘露寺的消息。这笔账，你记下了。",
  } as Record<LingrongTier, string>,
};

export const LENGGONG_LINGRONG: Record<LingrongTier, string> = {
  close: "听说陵容后来常常一个人坐着发呆，手里攥着一盒没送出去的香。",
  distant: "陵容封了嫔。她再也没有提起过你。",
  resentful: "陵容封了嫔。听说她在皇后跟前，越发得脸了。",
};

// ---------------------------------------------------------------- tags

export type TagId3 =
  | "opportunity"
  | "crisis"
  | "huanghou"
  | "story"
  | "negative"
  | "positive"
  | "lianmei"
  | "chezhou"
  | "yiyi"
  | "double"
  | "ally"
  | "rival"
  | "pair"
  | "jingbai"
  | "relic"
  | "chengbing"
  | "yihua"
  | "doubt";

export const TAG3_INFO: Record<TagId3, { label: string; lore: string; rules: string }> = {
  opportunity: { label: "机会", lore: "转瞬即逝的机会。", rules: "打出匹配牌即可把握；否则回合末离场，没有惩罚。" },
  crisis: { label: "危机", lore: "躲不过就得接住。", rules: "打出匹配牌即可化解；否则回合末结算惩罚。" },
  huanghou: {
    label: "皇后",
    lore: "景仁宫的心意，向来不好推辞。",
    rules: "第 3–9 回合每回合 1 张。回合末按默认结算；打出卡面所列的牌，换成对应的赏赐。标 🎶 的也能交给陵容。",
  },
  story: { label: "剧情", lore: "命运的关口，如约而至。", rules: "选一个基础选项（不占出牌），或打出卡面所列的牌（占 1 次出牌）。不处理则按默认选项。" },
  negative: { label: "负面", lore: "缠身的麻烦。", rules: "温太医相助可移除 1 个（标“不可移除”的除外）。" },
  positive: { label: "正面", lore: "占得的先机。", rules: "持续的有利状态。" },
  lianmei: { label: "联袂", lore: "姐妹同心。", rules: "情分亲厚时，陵容左边或右边的一张牌可以打出而不占出牌名额。每回合最多用一次。" },
  chezhou: { label: "掣肘", lore: "处处牵制。", rules: "情分怨怼时，陵容左右相邻的牌不能打出。打出陵容后解除。" },
  yiyi: { label: "依依", lore: "缠着姐姐不肯走。", rules: "情分生分时，陵容在回合末留在手牌中；留下几张，下回合就少抓几张。" },
  double: { label: "双牌", lore: "一个人扛不住。", rules: "同一回合内打出两张匹配牌才算解决；回合末不满 2 张则进度清零。" },
  ally: { label: "盟友", lore: "后宫重新站队，总有人愿意站在你这边。", rules: "第一次把握她的事件，获得盟友状态（端妃相护 / 敬妃之谊 / 欣贵人解围）。" },
  rival: { label: "对头", lore: "她们都是皇后的人。", rules: "危机须同回合打出两张解牌才能化解；其中有卡面标注的牌算打压，获得该对头的【打压】状态：她的危机下次出现时少需要 1 张解牌。" },
  pair: {
    label: "连环",
    lore: "一石二鸟。",
    rules: "机会与危机成对出现。先化解危机才能把握机会；危机的两张解牌里有共同牌，机会顺带解决并算打压，否则机会要另外解。危机没化解，机会随之作废。",
  },
  jingbai: { label: "静白刁难", lore: "静白师太管着甘露寺的杂务，最讲寺规。在她眼里，你不过是躲来避祸的带罪之人，非磨磨性子不可：克扣炭火，杂役磋磨，甚至诬你偷香油钱。", rules: "第 11–18 回合的刁难没化解，静白就更嚣张，决定第 18 回合被赶走时有多狼狈。" },
  relic: { label: "遗物", lore: "他留下的东西。", rules: "打出即焚毁，没有别的效果。" },
  chengbing: { label: "称病", lore: "陵容身子不适，告了假。", rules: "景仁宫对质这一回合，陵容称病没有来，她的牌打不出。" },
  yihua: {
    label: "持续",
    lore: "唯一的活路。",
    rules: "① 引驾（槿汐相助；落发的再加 1 张槿汐或眉庄）→ 两回合后 ② 偶遇（打出禅语修身或荆钗布裙；没成隔一回合再来）→ ③ 改脉（温太医相助），即回宫。",
  },
  doubt: {
    label: "疑点",
    lore: "月份差得越多，越瞒不住。",
    rules: "从 1 起算。偶遇前每回合末 +1；睹物生疑（引驾后每回合末手里每件遗物）+1；景仁宫来人没应对 +1。槿汐相助、眉庄相助各 -1。到 5 即失败。",
  },
};

/** 宫中来信: with 敬妃之谊, the 解牌 story reads differently (敬妃 also sent supplies and news of 胧月). */
export const GONGZHONG_LAIXIN_JINGFEI_STORY: Partial<Record<CardId3, string>> = {
  meizhuangXiangzhu:
    "你拆开信，是眉庄的字迹，写得很长，足足三页。她说：「宫里一切都好，你不必挂心。这回的冬衣和药材，是我与敬妃姐姐一同备下的，她比我还操心，连炭火都亲自挑过。」信末另夹着一张小笺，是敬妃的笔迹：胧月在她身边养得很好，前几日会叫「额娘」了，夜里睡得安稳，只是偶尔睁着眼睛朝门口望。你把小笺看了又看，攥在手心里，悬了许久的心总算落下一半。",
  jinxiXiangzhu:
    "槿汐托人去山下取了信，一路藏在怀里带回来，还带着她的体温。你拆开一看，是眉庄的字迹，问你冷不冷、病好了没有。包袱里除了眉庄备的衣物，还有米面、炭火和几味补药，是敬妃托人一并捎来的。信里夹着敬妃的小笺，说胧月在她身边养得很好，前几日会叫「额娘」了。槿汐在一旁抹着眼泪：「娘娘，宫里还有人惦记着您和公主呢。」",
};

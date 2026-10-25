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
  standaloneSecrets: 3,
  /** 第 13、16……31 回合末【暗香盈袖】🌱+1。 */
  fragranceTurns: [13, 16, 19, 22, 25, 28, 31] as readonly number[],
  /** 🌟完美：三步在这一回合之前完成。 */
  perfectBefore: 30,
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

const RELIC_RULES = ["打出即焚毁，没有别的效果。", "引驾之后、回宫之前，每回合末手里每有 1 件遗物，疑点 +1。"];

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
    baseStatus: "wangyeGuaNian",
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
  | "xinGuirenZhangyi"
  | "fuxiongMengchen"
  | "lingrongDeXiang"
  | "shitaiBihu"
  | "hanzheng"
  | "jingji"
  | "xinruZhishui"
  | "jingfeiZhouji"
  | "yuandaoBuji"
  | "weiNverChengxia"
  | "wangyeGuaNian"
  | "meizhuangDadian"
  | "yishiWucuo"
  | "dayaQifei"
  | "dayaGuaerjia"
  | "yanxianHuansi"
  | "xianhuaChuanKai";

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

/** 打压 leaves one of these per rival: her next crisis is auto-resolved once. */
function daya(id: StatusId3, rivalName: string, flavor: string): StatusDef3 {
  return {
    id,
    name: `打压·${rivalName}`,
    emoji: "⚔️",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: `${rivalName}的危机下次出现时自动化解。用掉后消失。`,
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
  wangyeGuaNian: {
    id: "wangyeGuaNian",
    name: "王爷挂念",
    emoji: "🎐",
    tag: "positive",
    duration: 1,
    drawModifier: 1,
    effectText: "下回合抓牌数 +1。多个实例效果叠加。",
    flavor: "他把你的难处都记在了心上，转头便着手替你一件件周旋，下回合你便能轻省些。",
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
    effectText: "【宫中来信】解决时另 🌱身子 +1。",
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
    name: "为女儿撑下去",
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

const ENSHANG_LINE = "皇后端着茶盏，淡淡说了一句：「本宫赏下的东西，妹妹倒也收得心安。」";

export const SECRETS: Record<SecretId, SecretDef> = {
  shiqinNeiqing: { name: "侍寝内情", emoji: "🌙", lingrong: true, line: "祺贵人拿帕子拭着眼角：「那晚敬事房明明翻的是莞嫔的牌子，进养心殿的却是旁人。莞嫔称病，转头让别人替了去，这是欺瞒圣上，混淆宫闱。」", servant: "敬事房的小太监跪着说：「那晚翻的是莞嫔的牌子，进养心殿的却不是她。称病，转头让旁人顶替，这是欺瞒圣上，混淆宫闱。」", hint: "第二关里，你曾让陵容代你侍寝。" },
  zhuangshenNonggui: { name: "装神弄鬼", emoji: "👻", lingrong: true, line: "祺贵人颤声道：「嫔妾听说，那夜丽嫔姐姐宫里有人喊‘福子来了’，后来才知是人扮的。在宫里装神弄鬼，吓得嫔御失魂，这是扰乱宫闱，欺君不敬。」", servant: "景仁宫的小宫女道：「丽嫔娘娘那夜见的‘福子’，是有人扮的。莞嫔在宫里装神弄鬼，吓得嫔御失魂落魄，这是扰乱宫闱，欺君不敬。」", hint: "丽嫔惊梦那夜，装“福子”吓她，是陵容帮你办的。" },
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
  chuyanDingzhuang: { name: "出言顶撞", emoji: "🗣️", lingrong: false, line: "齐妃红着眼眶抢着开口：「皇上，那日莞嫔当着众人的面顶撞臣妾，一句不让，目无尊卑！」", servant: "景仁宫的小宫女道：「那日请安，奴婢亲眼见莞嫔当着众人顶撞齐妃娘娘，一句不让。这是目无尊卑。」", hint: "齐妃寻衅的事没有压下去，你当面顶过她。" },
  shanduShide: { name: "善妒失德", emoji: "🐍", lingrong: false, line: "祺贵人哭着道：「嫔妾不过说了句话，莞嫔便当众给嫔妾脸色看。嫔妾是新人，容不下新人，这是善妒，有违后宫和睦。」", servant: "御花园的小太监说：「祺小主说话时，莞嫔当众给了脸色。容不下新人，这是善妒，有违后宫和睦。」", hint: "祺贵人争宠的事没有压下去，你给过她脸色。" },
  yuanwangJunfu: { name: "怨望君父", emoji: "⛓️", lingrong: false, line: "祺贵人又道：「嫔妾的父亲在前朝听说，甄大人的案子，莞嫔私下说是冤在皇上。怨怼圣裁，这是对皇上不满，近乎大不敬。」", servant: "前朝传话的小太监战战兢兢：「奴才听人传，莞嫔私下说甄大人这案子是冤在皇上。怨怼圣裁，近乎大不敬。」", hint: "鄂敏参本的事没有压下去，你为父亲的案子流露过怨望。" },
  "enshang.jingrenHoushang": { name: "恩赏为凭·云锦步摇", emoji: "🎁", lingrong: false, line: ENSHANG_LINE, hint: "你收下了景仁宫赏的云锦和点翠步摇。" },
  "enshang.xieliGongwu": { name: "恩赏为凭·协理宫务", emoji: "📜", lingrong: false, line: "齐妃接口：「娘娘让她帮着打理宫务，她倒真把六宫当成了自己的，越权专擅，眼里没有皇后。」", hint: "" },
  "enshang.antaiBupin": { name: "恩赏为凭·安胎补品", emoji: "🍲", lingrong: false, line: ENSHANG_LINE, hint: "你收下了景仁宫送来的安胎补品。" },
  "enshang.jiayanXianyi": { name: "恩赏为凭·家宴献艺", emoji: "🎵", lingrong: false, line: "祺贵人掩口笑道：「家宴上那一曲，莞嫔是弹给谁听的？当着皇上的面刻意献艺争宠，成什么体统。」", hint: "你应了皇后的话，在家宴上当众献艺。" },
  "enshang.shanghuaXiaoju": { name: "恩赏为凭·赏花小聚", emoji: "🏮", lingrong: false, line: ENSHANG_LINE, hint: "你随皇后赏花，也收下了她的一番好意。" },
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
  /** 打压状态让这张危机自动化解时的剧情。 */
  readonly suppressedStory?: string;
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
    resolvedText: "圣宠 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      yirongZhengsu: "你衣饰得体、进退有度。皇后赏了你一对玉镯，又在皇上跟前提了你一句。",
      jinyanShenxing: "皇后问起宫务，你答得周全又不逾矩。皇后笑着说你懂事。你垂着眼，看不见她眼底的神色。",
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
    resolvedText: "清誉 +1（眉庄解决时翻倍）",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jinyanShenxing: "太后问你近来读什么书，你答得谦逊稳妥。太后捻着佛珠，说这孩子沉静。",
      meizhuangXiangzhu: "眉庄陪你一同前去，你们一唱一和，太后听得开怀，赏了你们一人一串佛珠。",
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
      wenTaiyiZhenzhi: "温实初诊完脉，便退到殿外守着。门一关上，端妃才慢慢说起景仁宫的旧事，说一句，停一停。她说，如今的皇后和故去的纯元皇后原是一母同胞的亲姐妹，姐姐去后，妹妹才入的潜邸，一步步坐上了凤位。",
      shoulongRenxin: "你让小允子守着殿门。端妃这才开口，说起纯元皇后当年的事，说到一半，停住了。末了她轻轻补了一句：「如今的皇后，是纯元皇后的亲妹妹。」",
      jingguanQibian: "你只是静静坐着，不催也不问。端妃看了你很久，终于说：「皇后这个人，从来不是表面上那样。她和纯元皇后是一母所生的亲姐妹，姐姐在时，她不过是跟在后头的妹妹。」",
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
      meizhuangXiangzhu: "眉庄在各宫走动时替你分说清楚，又寻出了嚼舌根的宫女。流言一夜之间没了声息。",
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
      meizhuangXiangzhu: "眉庄把自己宫里的份例分了一半送来，又托人敲打内务府，没过两日便补齐了。",
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
    suppressedStory: "请安那日，齐妃刚张口要提「心尖上的人」，目光落到你身上，又想起上回在三阿哥的功课上吃的亏，讪讪闭了嘴，只低头喝茶。",
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
    suppressedStory: "长春宫的人来碎玉轩送东西，话说得格外客气。齐妃自上回被你堵得下不来台，这次没再拿三阿哥的功课做文章，皇上也没被扣在长春宫。",
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
    suppressedStory: "祺贵人在御花园遇见你，笑得有些发僵，福身行礼，一句多的话也没说。她还记着上回被压下去的那场风波，没敢再来“偶遇”。",
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
    penalty: [q(-1)],
    penaltyStatus: "fuxiongMengchen",
    rival: "guaerjia",
    needTwo: true,
    suppressedStory: "鄂敏的折子递到半路，又被祺贵人悄悄劝了回去。她想起上回在皇后面前碰的钉子，生怕再闹出事来，折子到底没敢呈上去。",
    suppressCard: "shoulongRenxin",
    secret: "yuanwangJunfu",
    resolvedText: "移除事件；两张解牌含收拢人心即打压祺贵人，获得【打压·祺贵人】",
    unresolvedText: "清誉 -1、获得【父兄蒙尘】",
    note: "第 5 回合后洗入危机池。",
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
    suppressedStory: "齐妃远远瞧见你和欣贵人，脚步顿了顿，绕着另一条路走了。上回在这儿吃的亏她还记着，这回连招呼都省了。",
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
    suppressedStory: "祺贵人原想去皇后面前再告一状，走到景仁宫门口又退了回去。上回碰的钉子还疼着，条陈的事便没人再提。",
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
    suppressedStory: "齐妃到了延庆殿门口，只让宫人递了盒点心，说身子不便，改日再来探病。上回的教训还在，她没敢再往里闯。",
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
    reward: [q(1)],
    penalty: NO,
    resolvedText: "清誉 +1",
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
    flavor: "有人托山下的小贩捎来一封信。信封上没有落款，你却认得那字迹。",
    reward: [q(1)],
    penalty: NO,
    resolvedText: "清誉 +1（眉庄解决时翻倍；有【敬妃之谊】时另身子 +1）",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      meizhuangXiangzhu: "是眉庄的信，还捎来了衣物和药材。她说宫里一切都好，叫你千万保重。",
      jinxiXiangzhu: "槿汐托人去山下取了信，一路藏在怀里带回来，还带着她的体温。",
    },
  },
  jinganChuilian: {
    id: "jinganChuilian",
    kind: "opportunity",
    name: "静岸师太垂怜",
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
    name: "莫言援手",
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
    penalty: [sz(-2)],
    halfPenalty: [sz(-1)],
    needTwo: true,
    jingbai: true,
    place: "temple",
    resolvedText: "移除事件；需打出两张解牌",
    unresolvedText: "身子 -2（挑水劈柴，累倒在井边）；只打出一张解牌则身子 -1",
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
    penalty: [q(-2)],
    jingbai: true,
    place: "temple",
    resolvedText: "移除事件",
    unresolvedText: "清誉 -2",
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
  huanghouShangshi: LINGRONG_EVENT.huanghouShangshi,
  gongzhongLiuyan: LINGRONG_EVENT.gongzhongLiuyan,
  neiwufuDiaonan: LINGRONG_EVENT.neiwufuDiaonan,
  liyiShiwu: LINGRONG_EVENT.liyiShiwu,
  wangyeXiantan: {
    close: { resolves: true, effects: [q(1)], story: "陵容替你收下了王爷送来的诗集，笑着说王爷的字写得真好。又陪你挑了几句诗回赠。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容替你去回了王爷的礼，回来只说东西送到了。" },
    resentful: { resolves: true, effects: [q(1)], story: "陵容替你把东西送回了王爷那里，淡淡说了句「送到了」，便回自己宫里去了。" },
  },
  yanqingTanbing: {
    close: { resolves: true, effects: [q(1)], story: "陵容陪你去延庆殿，调了一味安神的香给端妃。端妃看了她一眼，淡淡道了声谢。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你去了一趟延庆殿，一路上没怎么说话。" },
    resentful: { resolves: false, story: "陵容说延庆殿药味重，熏得她头疼，走到半路便回去了。" },
  },
  xianfuXianhua: {
    close: { resolves: true, effects: [q(1)], story: "陵容绣了一个小小的肚兜，同你一起送去咸福宫。敬妃拉着她的手，夸她手巧。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你去了咸福宫，坐在一旁安安静静的，偶尔替你们添茶。" },
    resentful: { resolves: false, story: "陵容推说手头有事，没去。敬妃问起她，你只得替她圆了几句。" },
  },
  kuairenKuaiyu: {
    close: { resolves: true, effects: [sc(1)], story: "陵容唱了一支江南小调，欣贵人听得直拍手，说碎玉轩真是热闹。" },
    distant: { resolves: true, effects: [sc(1)], story: "陵容陪着说了几句话，欣贵人嘴快，她插不上话，便只是笑。" },
    resentful: { resolves: false, story: "欣贵人说话没轻没重，陵容听了几句便沉了脸，起身走了。" },
  },
  antaiBupin: {
    close: { resolves: true, story: "陵容尝了尝那盅补品，说炖得偏燥，不如先搁着，另让小厨房炖了盅清淡的给你。她替你掖好被角，又陪你说了一会儿话。" },
    distant: { resolves: true, story: "陵容说这补品炖得偏燥，替你换了盅清淡的，又叮嘱你多歇着。" },
    resentful: { resolves: true, story: "陵容端走了补品，说替姐姐换盅清淡的来。她没多坐，放下话便走了。" },
  },
  jiayanXianyi: {
    close: { resolves: true, effects: [sc(1)], story: "你抚琴，陵容唱曲。一曲终了，皇上抚掌大笑，赏赐都记在了碎玉轩名下。陵容低着头，没说话。" },
    distant: { resolves: true, story: "你抚琴，陵容唱曲。皇上的目光落在了陵容身上，赏赐也送去了她宫里。" },
    resentful: { resolves: true, effects: [sc(1)], story: "临上场前，陵容说嗓子哑了。你只好独自弹了一曲。皇上很喜欢，陵容在席间看着你，脸上没有表情。" },
  },
  shanghuaXiaoju: {
    close: { resolves: true, effects: [q(1)], relation: 1, story: "陵容陪你在花下应酬各宫，替你挡了几句不好接的话。两人说说笑笑，一下午过得飞快。" },
    distant: { resolves: true, effects: [q(1)], relation: 1, story: "陵容陪你在花下坐了半日。你说起各宫的趣事，她也跟着笑了笑。" },
    resentful: { resolves: true, effects: [q(1)], relation: 1, story: "陵容陪你去了。席间她话不多，倒也替你周全了礼数。" },
  },
};

export { LINGRONG_SUMMON };

/** 陵容 played with nothing on the table: just keeping her company, 情分 +1. After 纯元故衣 your words turn cold. */
export const LINGRONG_IDLE_TEXT3: Record<LingrongTier, string> = {
  close: "你留陵容在碎玉轩喝茶，两人说了半日体己话。临走时她拉着你的袖子，说下回再来。",
  distant: "你请陵容过来坐坐。她起初拘谨得很，后来也说了几句心里话。",
  resentful: "你请陵容过来坐坐，她句句带刺。可坐得久了，语气也松了些。",
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
    flavor: "华妃倒后，皇上夜夜往碎玉轩去，在你窗前那几株海棠下留宿。碎玉轩的海棠开得正好，你常在树下拜一拜。",
    note: "还没有身孕时必定有孕；已有孕时只是一段恩宠。身上有【抱恙在身】也照常有孕。",
    defaultOptionId: "chengen",
    options: [
      { id: "chengen", name: "承恩", effects: [sc(1)], pregnancy: true, text: "圣宠 +1；未孕时必定有孕", story: "海棠花下，皇上握着你的手说：「朕的嬛嬛。」那一夜，海棠落了一地。" },
      {
        id: "haitangXinzhuang",
        name: "海棠新妆",
        card: "yirongZhengsu",
        effects: [sc(2)],
        pregnancy: true,
        text: "圣宠 +2；未孕时必定有孕",
        story: "你簪了一朵新开的海棠。皇上看了你很久，说海棠春睡，不及你一笑。",
      },
      {
        id: "dengxiaDushi",
        name: "灯下读诗",
        card: "jinyanShenxing",
        effects: [q(1)],
        pregnancy: true,
        text: "清誉 +1；未孕时必定有孕",
        story: "你在灯下陪皇上读诗，读到「只恐夜深花睡去」，他笑着接了下一句。",
      },
    ],
  },
  haitangYeyu: {
    id: "haitangYeyu",
    name: "海棠春睡",
    emoji: "🌸",
    flavor: "太医的喜脉早已报到了御前。皇上这几日仍常往碎玉轩来，只在海棠树下坐坐，陪你说说话。",
    note: "只是一段恩宠。",
    defaultOptionId: "chengen",
    options: [
      { id: "chengen", name: "承恩", effects: [sc(1)], text: "圣宠 +1", story: "海棠树下，皇上扶你坐下，只问腹中孩子今日闹不闹。那一夜他宿在碎玉轩，什么也没做，只听你絮絮说了半宿的话。" },
      {
        id: "haitangXinzhuang",
        name: "海棠新妆",
        card: "yirongZhengsu",
        effects: [sc(2)],
        text: "圣宠 +2",
        story: "你簪了一朵新开的海棠。皇上看了你很久，笑说等孩子落了地，要带他来看这满树的花。",
      },
      {
        id: "dengxiaDushi",
        name: "灯下读诗",
        card: "jinyanShenxing",
        effects: [q(1)],
        text: "清誉 +1",
        story: "你在灯下陪皇上读诗，读到「只恐夜深花睡去」，他笑着把你肩上的披风拢了拢，不许你熬夜。",
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
    flavor: "父亲因文字狱下狱。消息传进碎玉轩时，你手里的茶盏摔在了地上。",
    note: "须双牌解；只打一张按跪求皇上，少扣 1。代价随局势：【父兄蒙尘】加重，打压过祺贵人减轻。",
    defaultOptionId: "guiqiu",
    options: [
      { id: "guiqiu", name: "跪求皇上", effects: [], xiayu: "kneel", text: "圣宠大减（皇上避而不见）", story: "你在养心殿外跪了一夜。皇上没有见你，只让苏培盛传了一句：「后宫不得干政。」" },
      { id: "qiuTaihou", name: "求太后", effects: [], xiayu: "taihou", text: "清誉受损", story: "你去寿康宫求太后。太后叹了口气，答应替你说一句话，可宫里都说你不安分。" },
      {
        id: "tuoGuo",
        name: "托果郡王周旋",
        card: "guojunwangXiangzhu",
        two: true,
        effects: [],
        xiayu: "guo",
        text: "不扣圣宠",
        story: "果郡王替你在前朝奔走，又打点了狱卒。父亲在狱里总算少吃了些苦头。",
      },
      {
        id: "tuoRenxin",
        name: "托人在前朝打点",
        card: "shoulongRenxin",
        two: true,
        effects: [],
        xiayu: "shoulong",
        text: "不扣圣宠",
        story: "你让小允子拿体己银子在前朝四处打点，托人往狱里递话送物。父亲在狱中的日子好过了些。",
      },
      {
        id: "yinrenBuyan",
        name: "隐忍不言",
        card: "jinyanShenxing",
        two: true,
        effects: [],
        xiayu: "jinyan",
        text: "只损圣宠",
        story: "你一个字也没有替父亲辩，只称病闭门，等着风头过去。皇上虽未见你，也没有迁怒碎玉轩。",
      },
      {
        id: "tuoLingrong",
        name: "托陵容传信",
        card: "lingrongXiangzhu",
        two: true,
        effects: [],
        xiayu: "lingrong",
        secret: "yuzhongShuxin",
        text: "不扣圣宠",
        story: "陵容应下此事，当天便托人替你往狱里递了一封信。",
        tierStory: {
          close: "陵容说她父亲在狱里有旧识，替你把信递了进去。她回来时眼眶红红的，说甄伯父让姐姐保重。",
          distant: "陵容替你把信送了进去，回来时说一切都好，甄伯父让你别挂心。",
          resentful: "陵容把信递了进去，只说狱里打点过了，叫你放心。",
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
      { id: "luofa", name: "落发", card: "chanyuXiushen", effects: [q(2)], flag: "luofa", text: "清誉 +2；第三幕引驾要多打 1 张槿汐或眉庄", story: "青丝一缕一缕落在地上。你闭着眼，听见剪刀的声音，像是什么东西断了。" },
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
    note: "诊治、眉庄相助、槿汐相助三选一；有【敬妃之谊】时，无论怎么选，另得未来 3 回合每回合抓牌 +1。",
    defaultOptionId: "zhenzhi",
    options: [
      { id: "zhenzhi", name: "请他诊治", effects: [sz(2)], removeNegatives: "all", text: "移除全部负面状态；身子 +2", story: "温实初替你诊了脉，开了方子，又留下许多药材。临走时他说：「嬛妹妹，你要好好的。」" },
      { id: "yuandaoBuji", name: "眉庄捎来补给", card: "meizhuangXiangzhu", effects: [], status: "yuandaoBuji", text: "未来 3 回合每回合末身子 +1", compact: "🌱+1×3", story: "眉庄在宫里放心不下，远远托温实初带了药材和补给上山。" },
      { id: "weiNver", name: "为女儿撑下去", card: "jinxiXiangzhu", effects: [], status: "weiNverChengxia", text: "未来 2 回合每回合末清誉 +1", compact: "🪷+1×2", story: "你看着胧月的小像，看了很久。槿汐在一旁默默替你添了一盏灯。" },
    ],
  },
  taxueWenji: {
    id: "taxueWenji",
    name: "踏雪问疾",
    emoji: "🌨️",
    flavor: "果郡王带着阿晋冒雪赶上凌云峰，把你接到清凉台养病。病一好，你便执意回了凌云峰。",
    note: "无论怎样结算，牌库再加入 1 张【果郡王相助】。",
    defaultOptionId: "yangbing",
    options: [
      { id: "yangbing", name: "清凉台养病", effects: [sz(2)], removeNegatives: "all", text: "移除全部负面状态；身子 +2", story: "清凉台很暖。你病得迷迷糊糊，只记得有人一直守在床边，替你换额上的帕子。" },
      {
        id: "bingzhongXiangshou",
        name: "病中相守",
        card: "guojunwangXiangzhu",
        relic: "yiwuPifeng",
        effects: [sz(3)],
        removeNegatives: "all",
        flag: "xiangshou",
        text: "移除全部负面状态；身子 +3",
        story: "他守了你几天几夜，你好了，他自己却病倒了。你坐在他床边，第一次叫了他的名字：「允礼。」",
      },
    ],
  },
  hehunGengtie: {
    id: "hehunGengtie",
    name: "合婚庚帖",
    emoji: "📜",
    flavor: "果郡王趁着无人，从袖中取出一张红纸，轻声请你写下自己的庚帖。",
    defaultOptionId: "buxie",
    options: [
      { id: "buxie", name: "不写", effects: [q(1)], text: "清誉 +1", story: "你把红纸推了回去。他没有说什么，只把它仔细折好，收进了袖子里。" },
      { id: "xiexia", name: "写下庚帖", card: "guojunwangXiangzhu", relic: "yiwuGengtie", effects: [], flag: "gengtie", text: "他收好了庚帖，日后或许用得上", story: "你提笔写下自己的生辰。他在旁边写的是「嬛嬛」。他从来只唤你自己的名字。" },
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
    seen: "那件衣裳原样送回了库里，生辰宴平平安安地过去了。夜里槿汐替你卸了妆，犹豫了许久，才低声道：「小主，那件衣裳……奴婢瞧着，像是纯元皇后当年穿过的。」你一夜没睡。纯元皇后是皇上的元配，宫里人人都知道，她走了这么多年，皇上心里从来没有放下过。皇后偏偏在这时候，把她的旧衣送到碎玉轩来。你想起皇上第一次见你时的神情，那一眼里有惊，有喜，如今想来，竟又有几分恍惚。他看的到底是谁？你不敢往下想，却也再不能当作什么都没有发生过。",
    half: "宴散后，皇上一句话也没多说就回了养心殿。你坐在灯下，想起他看你时那一瞬的失望：他期待你穿上的，究竟是一件新衣裳，还是另一个人的影子？你到底没弄明白那衣裳的来历，只隐约觉得，皇后既然特意备下，便不会只是一份寻常的心意。往后的日子，你得多留几分心。",
    fail: "满殿的人都低着头。你跪在那里，听见皇上走远了，才有人小声说：那是纯元皇后的旧衣。原来你穿上它的那一刻，他看见的不是你。皇后在一旁轻轻叹了口气，只说是自己疏忽，没留意衣裳的来历，转头还温言安慰了你几句。可你心里明白，这样的疏忽，偏偏落在你身上，绝不会是巧合。皇上的冷淡，一时半会儿是挽不回来了。",
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
  flavor: "皇后请皇上同到景仁宫，当着皇上的面，把一件件“听说的事”拿出来问你。陵容没有来。",
  cards: ["jinyanShenxing", "meizhuangXiangzhu", "wenTaiyiZhenzhi", "jinxiXiangzhu", "shoulongRenxin", "guojunwangXiangzhu"] as readonly CardId3[],
  /** 没有专门辩词时的通用说法：为小主对皇上的忠心作证。 */
  cardStory: {
    jinyanShenxing: "你重重叩首：「臣妾对皇上的一片心，天地可鉴，从无半点欺瞒。」",
    meizhuangXiangzhu: "眉庄上前一步：「皇上，嬛儿是什么样的人，臣妾最清楚。她待皇上的赤诚，臣妾愿以位分担保。」",
    wenTaiyiZhenzhi: "温实初捧着脉案跪下：「小主这些日子的起居言行，臣都看在眼里，对皇上只有忠心，没有半分异志。」",
    jinxiXiangzhu: "槿汐跪在你身后，不疾不徐：「小主日日念着皇上的安康，奴婢寸步不离，都看在眼里。」",
    shoulongRenxin: "小允子领着碎玉轩的宫人跪了一地：「奴才们愿意作证，小主对皇上忠心耿耿。」",
    guojunwangXiangzhu: "果郡王恰在殿外候见，进来替你说了几句公道话：「皇兄，臣弟以为，莞嫔对皇兄的心意，绝无可疑。」",
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
    "enshang.jingrenHoushang": { jinyanShenxing: "你叩首道：「娘娘的恩赏，臣妾感恩戴德，一应都是循着规矩领受的。」" },
    "enshang.xieliGongwu": {
      jinyanShenxing: "你叩首道：「娘娘托付宫务，臣妾不过是替娘娘分忧，一切都请示过娘娘，不敢专擅。」",
      meizhuangXiangzhu: "眉庄道：「皇后娘娘托付宫务，臣妾也在一旁帮手，每一桩都是回过娘娘的。」",
    },
    "enshang.antaiBupin": {
      jinyanShenxing: "你叩首道：「娘娘送来的安胎补品，臣妾收下，是感念娘娘的体恤。」",
      wenTaiyiZhenzhi: "温实初叩首：「小主身子金贵，补品入口前，臣都要先验过。」",
    },
    "enshang.jiayanXianyi": { jinyanShenxing: "你叩首道：「家宴献艺，是奉了娘娘的懿旨，臣妾岂敢有争宠之心。」" },
    "enshang.shanghuaXiaoju": {
      jinyanShenxing: "你叩首道：「赏花小聚是娘娘的美意，臣妾不过随众人叨扰，不敢辜负。」",
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
  flavor: "你积劳成疾，咳了好些日子。静白一口咬定你得了肺痨，说怕过了病气给全寺，要把你赶去后山凌云峰。",
  cards: ["jinxiXiangzhu", "chanyuXiushen", "meizhuangXiangzhu"] as readonly CardId3[],
  cardStory: {
    jinxiXiangzhu: "「背你上山」：槿汐一句话不说，把你背起来就走，不让静白的人碰你。",
    chanyuXiushen: "「佛前陈情」：你在静岸师太面前平静地说明病情。师太虽拦不住静白，却记下了。",
    meizhuangXiangzhu: "「宫中送药」：眉庄托人连夜送来药材和厚衣。",
  } as Record<string, string>,
  tiers: [
    { name: "师太暗护", text: "身子不减；下一次危机未化解时免罚", story: "静岸师太拦不住静白，却悄悄让人把被褥和药送上了山。" },
    { name: "仓皇出寺", text: "身子 -1；未来 2 回合每回合末身子 -1", story: "只许带随身衣物。槿汐扶着你，踩着雪往后山走。" },
    { name: "连夜被逐", text: "身子 -2、清誉 -1；未来 2 回合每回合末身子 -1", story: "当夜就被抬出寺门。寺里都传你得了肺痨，没人敢靠近凌云峰。" },
  ],
};

/** 第 21 回合【长相思】（条件事件）。 */
export const CHANGXIANGSI = {
  name: "长相思",
  emoji: "🎶",
  flavor: "月色很好。他带了笛子来，你屋里有一张旧琴。",
  rule: "同一回合打出【果郡王相助】与【禅语修身】「笛箫合奏」：清誉 +2。不触发则没有效果。",
  story: "笛声起，琴声和。一曲长相思，山风都静了下来。",
};

/** 第 25 回合【舟覆噩耗】。 */
export const ZHOUFU = {
  name: "舟覆噩耗",
  emoji: "🌊",
  text: "消息是夜里传来的：果郡王的船在江上翻了，尸骨无存。",
};

/** 第 26 回合起的持续事件【移花接木】。 */
export const YIHUA = {
  name: "移花接木",
  emoji: "🎎",
  flavor: "要保住这个孩子，只有一条路：回宫，让皇上相信，这是他的孩子。",
  steps: [
    { name: "引驾", emoji: "🔔", story: "托人在御前递话，说太后凤体欠安，宜往甘露寺祈福。" },
    { name: "偶遇", emoji: "🌸", story: "皇上驾临甘露寺，佛前重逢，二人相对无言，当夜便留宿在了寺中。" },
    { name: "改脉", emoji: "📜", story: "你再三恳求温太医：皇上留宿之后，宫里很快就要传出喜脉的消息，这孩子的月份必须对得上，否则你们几个人都活不成。他沉默了许久，终于长叹一声，答应在脉案上悄悄改写了月份，把这个孩子的来历瞒得严严实实。" },
  ],
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
      "可你心里清楚，这个孩子藏不了多久。你一边应着他的话，一边暗暗盘算：待他留宿之后，只有请温太医在脉案上动手脚，把月份改得对得上。",
    ],
    jingchaiBuqun: [
      "你一身荆钗布裙，手上还沾着落叶的碎屑，见了皇上也不躲，只缓缓跪下：「臣妾有罪，求皇上原谅。」皇上看着你素净的模样，眼眶竟有些红了。",
      "他伸手扶你起来，指尖触到你粗糙的手背，问你在山上吃了多少苦。你摇摇头，只说能再见皇上一面，便不觉得苦。",
      "你面上柔顺，心里却一刻没有放松：这孩子的月份瞒不过太医，只有早早找温太医商量，在脉案上做些改动，才能让一切合情合理。",
    ],
  } as Record<string, string[]>,
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
  if (presented <= 8) return 3;
  return 4;
}

/** Outcome by presented 把柄 and how many cards were missing. */
export function confrontOutcome(presented: number, short: number): ExitTier {
  const col = Math.min(2, Math.max(0, short));
  const row: readonly ExitTier[] =
    presented <= 0 ? [1, 2, 2] : presented <= 3 ? [1, 2, 2] : presented <= 8 ? [1, 2, 3] : presented <= 13 ? [2, 3, 3] : presented <= 18 ? [2, 3, 4] : [3, 4, 4];
  return row[col]!;
}

export const EXIT: Record<ExitTier, { name: string; emoji: string; effects: readonly Delta3[]; story: string; longyue: string; emperor: string }> = {
  1: {
    name: "体面自请",
    emoji: "🍃",
    effects: [],
    story: "你自请去甘露寺为皇上祈福。皇上默然许了，还赏了一路的车马。",
    longyue: "临行前，你抱着胧月去了咸福宫，亲手把她交给了敬妃。",
    emperor: "皇上沉默良久，只说：「你去吧。」",
  },
  2: {
    name: "被劝出宫",
    emoji: "🚪",
    effects: [q(-2)],
    story: "皇上没有发落你，只说：「你既心不在此，便去佛前静一静。」",
    longyue: "你跪着求了皇上许久，他终于点头，许你把胧月托付给敬妃。",
    emperor: "皇上看着你，目光一点一点冷下去：「朕原以为，你是不一样的。」",
  },
  3: {
    name: "被废出宫",
    emoji: "⛓️",
    effects: [q(-4), sz(-1)],
    story: "皇上下旨褫夺封号，废为庶人，你只带了随身几件衣物，即日被送出宫门。",
    longyue: "嬷嬷当场把胧月从你怀里抱走。没有人告诉你，她被送去了哪里。",
    emperor: "「朕待你如何，你心里清楚。」你心里接了一句：你待的，本就不是我。",
  },
  4: {
    name: "打入冷宫",
    emoji: "❌",
    effects: [],
    story: "皇上拂袖而去。旨意随后颁下，你被送入冷宫，宫门从外面落了锁，再也没有走出去。",
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

export type PopupId = "opening" | "huanghou" | "tonghuatai" | "chunyuan" | "wanwan" | "confront" | "exit" | "feilao" | "zhoufu" | "ximai" | "ouyu";

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
    { name: "安陵容", text: "安陵容出身寒微，性子怯懦，说话总是轻声细语。她有一副好嗓子，又会调香，这些年一直跟在你和眉庄身边，常来碎玉轩走动。只是姐妹间这些日子处得如何，她心里怎么想，你也说不准。" },
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
    "⚔️ 对头事件：须同回合打出两张解牌；其中有指定的牌才算打压，获得【打压】状态：她的危机下次出现时自动化解一次。",
    "🔗 连环事件：先化解危机才能把握机会；危机的两张解牌里有共同牌，可一石二鸟，顺带把握机会。",
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
    "那一夜碎玉轩的灯一直亮着。你受了这一场惊动，当夜便动了胎气，孩子早产落了地，哭声细细的，像一只刚出壳的雏鸟。是位公主，皇上隔日赐了名，叫胧月。你抱着她，看窗外的天一点点亮起来，心里却有什么东西，跟着那一夜的月色一起暗了下去。",
  ] as readonly string[],
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
  confrontDuanfei: "端妃在一旁淡淡说了一句，皇后便略过了一桩。",
  confrontRealize: {
    exposed:
      "一件件被揭出来，你的心便沉一分。那些事，有的是夜里对着一盏孤灯说的，有的是两个人头挨着头、压低了声音说的。碎玉轩的窗纸那样薄，可听见的，从来只有一个人：安陵容。你想起她替你描眉时微微发颤的手，想起她倚在你肩头唤你“姐姐”的模样。原来这些日子，陵容一直坐在你身边，一针一线绣着荷包，也一字一句，替旁人记着你的话。而能把这些零碎的旧事串成一张网、等到今日才一并抖出来的，只有端坐在上首、一直不动声色的皇后。这一局，是她早就布好的。",
    withheld: "可皇后手里，终究少了几桩。那几件事陵容也知道，却到底没有说出去。你不知道该恨她，还是该谢她。",
    withheldOnly: "你后来才隐约知道，陵容这些日子也替景仁宫留心着碎玉轩的一举一动。只是那几件只有她知道的事，她到底没有说出去。你不知道该恨她，还是该谢她。",
    fabricated: "还有最后那一句，你从来没有说过。可这样的话，这宫里也只有她编得圆。",
  },
  exitHeart:
    "出宫那日下着小雪。你没有回头看紫禁城，只想起那卷手书上的四个字。原来这些年的恩宠、枕边那些温存的话、倚梅园的那一夜，都是给另一个人的。你不恨了，只是累了。从今往后，这宫里的人和事，与你再无干系。",
  exitGate: "马车停在甘露寺山门前。静白师太上下打量你：「进了这道门，就没有什么小主娘娘了。」",
  exitRules: "第二幕：失去位分，每回合抓 2 打 1，清誉上限 8，换成寺中牌库；🌱身子归 0 即病死寺中。",
  feilao:
    "静白咬定你得了肺痨，当着满寺师父的面，说要把你挪出去，免得过了病气给旁人。你知道那是诬陷，可这样的话一旦说出口，便没有人敢替你争辩。于是你只带了几件随身的衣物，由槿汐扶着，踩着雪往后山走。身后，甘露寺的门「砰」地关上了。山路又陡又滑，你却渐渐觉得心里松了一口气：凌云峰上没有人盯着你的一举一动，没有刁难，也没有闲话，只有风声、雪声和一间清冷的小屋。名声是被人糟蹋了，日子，倒也算落得个清净。",
  feilaoRules: "杂役磋磨、功德箱失窃移出；月下对谈、夜半惊扰、耳目窥伺加入。",
  zhoufu: "消息是夜里传来的：果郡王的船在江上翻了，尸骨无存。他留给你的那些东西，如今只剩下念想。",
  zhoufuRules: "3 张【果郡王相助】变成 🕯️遗物：打出即焚毁，没有别的效果；留在手里，日后恐惹人生疑。",
  ximaiRecall: {
    1: "当初你自请出宫，临行前亲手把胧月交给了敬妃，原想从此清清静静，在佛前了此残生。",
    2: "当初你被劝出宫，跪着求了皇上许久，才许你把胧月托付给敬妃。你原想从此在佛前了此残生。",
    3: "当初你被废出宫，胧月被嬷嬷当场抱走，直到后来才知道她在敬妃身边。你原想从此在佛前了此残生。",
  } as Record<1 | 2 | 3, string>,
  ximaiBridge: "谁知青灯之下，竟遇见了果郡王允礼。山门外一揖，雪地里一问，他的笛声伴着你的清梦，你的经卷也染上了他的茶香。两个人都明白，那一缕情丝早已系牢，只是发乎情，止乎礼，谁也不肯先说破。直到那一日，他在你面前低声道：「此生得遇你，不算白来。」你没有答话，红了眼眶，心里却已经应了。",
  ximai: [
    "温太医的手指搭在你腕上，迟迟没有拿开。「嬛妹妹……是喜脉。」你怔怔地坐着，手不自觉地护住了小腹。允礼走了，连尸骨都没有找回来，这是他留在世上唯一的骨血。温太医低声劝你：「这孩子若被人知道，你和他都活不成……」你打断他：「我要留下他。」",
    "凌云峰上，一个带罪修行的人有了身孕，瞒不过三个月。要保住这个孩子，只有一条路：回宫，让皇上相信，这是他的孩子。头一件事，便是想法子把皇上引到甘露寺来。可你如今是带罪出宫的修行人，递不进一句话，更见不到御前的人。你把宫里宫外认得的人想了一遍，能把话递到皇上跟前的，大约只有御前总管苏培盛苏公公了。好在槿汐和他是旧日相识，当年同在宫中当差，多少还有几分情面。这条路能不能走通，还要看槿汐肯不肯、苏公公又愿不愿。",
  ] as readonly string[],
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
  perfect: "回宫那夜，槿汐悄悄告诉你，滇南来了消息，王爷……还活着。",
};

export type Loss3Kind = "qingyu1" | "qingyu" | "shengchong" | "lenggong" | "death" | "miscarriage" | "doubt" | "deadline";
export const LOSS3_STORY: Record<Loss3Kind, string> = {
  qingyu1: "宫里人人都说你失德，皇上再没来过碎玉轩。",
  qingyu: "寺里人人都说你不守清规，连静岸师太也不再护着你。",
  shengchong: "皇上有许多日子没有翻你的牌子了。等你想起来，碎玉轩的门前已经长了草。",
  lenggong: "皇上拂袖而去。旨意随后颁下，你被送入冷宫，宫门从外面落了锁，再也没有走出去。",
  death: "那个冬天格外冷。槿汐抱着你，一遍一遍地喊，你却再也没有醒来。",
  miscarriage: "血染红了禅房的地。孩子没了，回宫的路也断了。",
  doubt: "「这胎象，不像是两个月的样子。」太医的话传进了景仁宫。",
  deadline: "肚子一天天大了，再也遮不住。你知道，一切都来不及了。",
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
  rival: { label: "对头", lore: "她们都是皇后的人。", rules: "危机须同回合打出两张解牌才能化解；其中有卡面标注的牌算打压，获得该对头的【打压】状态：她的危机下次出现时自动化解一次。" },
  pair: {
    label: "连环",
    lore: "一石二鸟。",
    rules: "机会与危机成对出现。先化解危机才能把握机会；危机的两张解牌里有共同牌，机会顺带解决并算打压，否则机会要另外解。危机没化解，机会随之作废。",
  },
  jingbai: { label: "静白刁难", lore: "静白师太管着甘露寺的杂务，最讲寺规。在她眼里，你不过是躲来避祸的带罪之人，非磨磨性子不可：克扣炭火，杂役磋磨，甚至诬你偷香油钱。", rules: "第 11–18 回合的刁难没化解，静白就更嚣张，决定第 18 回合被赶走时有多狼狈。" },
  relic: { label: "遗物", lore: "他留下的东西。", rules: "打出即焚毁，没有别的效果。引驾之后、回宫之前，每回合末手里每有 1 件，疑点 +1（睹物生疑）。" },
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

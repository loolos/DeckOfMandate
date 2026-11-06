// cards
import { CARDS as STAGE1_CARDS } from "../content";
import { CARDS2 } from "../stage2Content";
import type { EventId3 } from "./events";
import type { Act, Delta3 } from "./level";
import type { StatusId3 } from "./statuses";

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
  /** 第二幕起（甘露寺、凌云峰）换成寺中情景的剧情文本。 */
  readonly templeFlavor?: string;
  readonly base: readonly Delta3[];
  readonly baseDraw: number;
  readonly baseStatus?: StatusId3;
  /** This turn's play limit +N. */
  readonly extraPlays?: number;
  /** extraPlays 只在这张牌作为本回合某个未解决事件（含剧情事件、景仁宫对质等）的解牌打出时生效。 */
  readonly extraPlaysOnlyWhenSolving?: boolean;
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

/** 这张牌在第 `act` 幕的剧情文本。 */
export function cardFlavor3(def: CardDef3, act: Act): string {
  return act >= 2 && def.templeFlavor ? def.templeFlavor : def.flavor;
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
    templeFlavor: "温实初冒着雪从后山小路上来，药箱上落了一层薄雪。他怕宫里起疑，只说是顺路替人采药，转身却把方子悄悄塞进你手里。",
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
    templeFlavor: "山寺清苦，眉姐姐身在宫中，却托家里人一趟趟往山上送衣食药材。隔着宫墙与山路，她仍是第一个想着你的人。",
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
    templeFlavor: "槿汐陪你住进了寺里的小屋，生炉子、补窗纸、叠被褥，样样不用你开口。清苦的日子被她打理得井井有条，叫人心里踏实。",
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
    extraPlaysOnlyWhenSolving: true,
    matches: ["wangyeXiantan", "tanhuoLiangmi", "shanzhongCaiyao", "yuexiaDuitan", "yebanJingrao"],
    rulesText: ["抽 1 张牌；若作为本回合某个事件的解牌打出，本回合出牌 +1；下回合抓牌 +1。"],
    rulesCompact: "🎴+1 解事件🀄+1 ⏭️🎴+1",
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
    rulesText: ["无基础效果。", "联动：作为任何事件的解牌打出时，下回合抓牌 +1（静白一时挑不出错）。"],
    rulesCompact: "解事件→⏭️🎴+1",
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
    flavor: "一支竹笛，名唤长相守。那夜它与你的长相思琴相和，笛子还是那支笛子，只是吹笛的人不在了，再没有人来和上一曲。",
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
  yiwuDi: "笛子投进火盆，噼啪响了几声。长相思，摧心肝。你在心里替他把那曲的最后一句弹完了。",
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

/** 第二幕寺中牌库（第 11 回合开局；第一幕的果郡王相助另带进来）。 */
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

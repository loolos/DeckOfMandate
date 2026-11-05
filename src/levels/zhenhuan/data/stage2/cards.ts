// cards
import { CARDS as STAGE1_CARDS } from "../content";
import type { EventId2 } from "./events";
import type { Delta2 } from "./resources";
import type { StatusId2 } from "./statuses";

export type CardId2 =
  | "yirongZhengsu"
  | "jinyanShenxing"
  | "wenTaiyiZhenzhi"
  | "shoulongRenxin"
  | "jingguanQibian"
  | "meizhuangXiangzhu"
  | "lingrongXiangzhu"
  | "jinxiXiangzhu";

export type CardDef2 = {
  readonly id: CardId2;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly base: readonly Delta2[];
  readonly baseDraw: number;
  readonly baseStatus?: StatusId2;
  /** Ordinary / 华妃 events this card resolves on its own. */
  readonly matches: readonly EventId2[];
  readonly rulesText: readonly string[];
  /** 略缩 summary (emoji); falls back to the rules text run through compactEffect2. */
  readonly rulesCompact?: string;
};

function fromStage1(id: Exclude<CardId2, "lingrongXiangzhu" | "jinxiXiangzhu">, overrides: Partial<CardDef2>): CardDef2 {
  const c = STAGE1_CARDS[id];
  return {
    id,
    name: c.name,
    emoji: c.emoji,
    flavor: c.flavor,
    base: c.base,
    baseDraw: c.baseDraw,
    baseStatus: c.baseStatus as StatusId2 | undefined,
    matches: [],
    rulesText: c.rulesText,
    ...overrides,
  };
}

export const CARDS2: Record<CardId2, CardDef2> = {
  yirongZhengsu: fromStage1("yirongZhengsu", { matches: ["huanghouShangshi", "liyiShiwu"] }),
  jinyanShenxing: fromStage1("jinyanShenxing", {
    matches: ["huanghouShangshi", "taihouChuixun", "baohuadianQifu", "gongzhongLiuyan", "yikungongLiGuiju", "qinmoChenqing"],
  }),
  wenTaiyiZhenzhi: fromStage1("wenTaiyiZhenzhi", {
    base: [{ resource: "shenzi", amount: 1 }],
    matches: ["jingxinTiaoyang", "baohuadianQifu", "liyiShiwu", "hanliangZhiwu", "shanshiYouyi", "wenyiBaoyang"],
    rulesText: ["移除 1 个【负面】状态；身子 +1。"],
    rulesCompact: "🧹负面 🌱+1",
  }),
  shoulongRenxin: fromStage1("shoulongRenxin", {
    rulesCompact: "👂×2 📦→🎴+1",
    matches: ["supeishengToufeng", "liPinJingmeng", "wenyiBaoyang", "qinmoChenqing", "gongzhongLiuyan", "neiwufuDiaonan", "kekouFenli", "shanshiYouyi", "songzhiKuisi"],
  }),
  jingguanQibian: fromStage1("jingguanQibian", { matches: ["jingxinTiaoyang", "hanliangZhiwu", "songzhiKuisi"] }),
  meizhuangXiangzhu: fromStage1("meizhuangXiangzhu", {
    rulesCompact: "🪷+1 🌸奖励×2", matches: ["taihouChuixun", "gongzhongLiuyan", "neiwufuDiaonan", "yikungongLiGuiju", "songzhiKuisi"] }),
  lingrongXiangzhu: {
    id: "lingrongXiangzhu",
    name: "陵容相助",
    emoji: "🎶",
    flavor: "安妹妹总是轻声细语，叫人看不透她心里在想什么。",
    base: [],
    baseDraw: 0,
    matches: [
      "huanghouShangshi",
      "jingxinTiaoyang",
      "baohuadianQifu",
      "liPinJingmeng",
      "gongzhongLiuyan",
      "neiwufuDiaonan",
      "liyiShiwu",
      "hanliangZhiwu",
      "kekouFenli",
      "huanyixiangZhuanchong",
      "songzhiKuisi",
    ],
    rulesText: [
      "能解决带 🎶 的事件；她肯出几分力，要看你素日待她如何。",
      "冷落：回合末她仍留在手中，小主始终无暇见她，她便与你疏远几分。",
      "叙话：无事相托时打出，便是请她过来坐坐、说几句体己话，她会与你亲近些；若她心中已存怨意，难免在皇上跟前说几句闲话（圣宠 -1）。",
    ],
    rulesCompact: "🎶视情分",
  },
  jinxiXiangzhu: {
    id: "jinxiXiangzhu",
    name: "槿汐相助",
    emoji: "🏮",
    flavor: "槿汐在宫里伺候了大半辈子，碎玉轩的大小事务交到她手里，你便能腾出手来。",
    base: [],
    baseDraw: 0,
    baseStatus: "zhushiTuotie",
    matches: ["supeishengToufeng", "neiwufuDiaonan", "kekouFenli", "shanshiYouyi", "songzhiKuisi", "yikungongLiGuiju", "gongzhongLiuyan"],
    rulesText: ["下回合出牌数 +1。"],
    rulesCompact: "🗝️ 下回合🀄+1",
  },
};

/** Cards that leave the deck when their 惜别 card is played (§6). */
export type DepartingCard = "meizhuangXiangzhu" | "wenTaiyiZhenzhi";

export const XIBIE: Record<DepartingCard, { effectName: string; rulesText: string; compact: string; playStory: string; leaveStory: string; finalePlayStory: string; finaleLeaveStory: string; finaleEnding: string; who: string }> = {
  meizhuangXiangzhu: {
    effectName: "临别相托",
    who: "眉庄",
    rulesText: "惜别：清誉 +2（解决机会事件时奖励照样翻倍）；之后抵消一次华妃事件未化解的效果。这是最后一张眉庄相助，打出后离场。",
    compact: "🕯️ 🪷+2 🛡️",
    playStory: "闲月阁的门落锁前，眉庄隔着门缝塞给你一方帕子：“我是倦了，往后这宫里的事，我不想再理。华妃不会就此罢手，你万事当心。”",
    leaveStory: "眉庄心灰意冷，从此闭门不出，再不过问后宫之事。",
    finalePlayStory: "眉庄本已闭门谢客，却在这一日重新踏进了养心殿，立在你身侧：“我既已退出，原不想再沾这些事。可这一回，我不能再躲了。”",
    finaleLeaveStory: "话说完，眉庄福了福身，退回殿侧，不再多言。她这一程，替你走到了最后。",
    finaleEnding: "闲月阁的门重新开了。眉庄在御前说完那番话，心结也解了大半，往后虽仍不愿多理后宫之事，却不再是孤身一人。",
  },
  wenTaiyiZhenzhi: {
    effectName: "临行诊治",
    who: "温太医",
    rulesText: "惜别：移除全部可移除的负面状态；身子 +2；之后抵消一次伤胎类事件的后果。这是最后一张温太医相助，打出后离场。",
    compact: "🕯️ 🧹全部负面 🌱+2 📜",
    playStory: "临去疫所前夜，温实初最后一次替你请脉，把一张方子压在了茶盏底下。",
    leaveStory: "疫所路远，从此只有书信偶尔递进宫来。",
    finalePlayStory: "温实初本已远在疫所，闻讯连夜赶回宫中，风尘仆仆地跪在了殿前，把脉案高高捧过头顶。",
    finaleLeaveStory: "话说完，温实初叩首退下，仍要赶回疫所。这一回，他是亲自来替你作证的。",
    finaleEnding: "温实初在御前作证后，又回了疫所，临行前留下一句“万事保重”。此后书信仍隔几日便到，只是字里行间，多了几分释然。",
  },
};

export const STAGE2_START_DECK: readonly CardId2[] = [
  "yirongZhengsu",
  "yirongZhengsu",
  "jinyanShenxing",
  "jinyanShenxing",
  "wenTaiyiZhenzhi",
  "wenTaiyiZhenzhi",
  "shoulongRenxin",
  "shoulongRenxin",
  "jingguanQibian",
  "jingguanQibian",
  "meizhuangXiangzhu",
  "meizhuangXiangzhu",
  "jinxiXiangzhu",
  "jinxiXiangzhu",
];

export const LINGRONG_COPIES = 3;

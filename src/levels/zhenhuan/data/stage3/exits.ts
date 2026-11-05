// 对质结果
import type { LingrongTier } from "../stage2Content";
import { sz } from "./events";
import type { Delta3 } from "./level";

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
    presented <= 3 ? [1, 2, 2] : presented <= 6 ? [1, 2, 3] : presented <= 11 ? [2, 3, 4] : presented <= 16 ? [3, 4, 4] : [4, 4, 4];
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

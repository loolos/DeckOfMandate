// tags
import type { CardId3 } from "./cards";
import { FIXED_STORIES3 } from "./stories";

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

/** 第 15 回合【故人来访】温太医上山：被废出宫的，到这一回合才知道胧月在敬妃处。 */
export const GUREN_TURN = Number(Object.keys(FIXED_STORIES3).find((t) => FIXED_STORIES3[Number(t)] === "wentaiyiTanshi"));

/** 被废出宫、故人来访之前：主角还不知道胧月的下落，文本里不能提她在敬妃处。 */
export function longyueHidden3(exitTier: number | null, turn: number): boolean {
  return exitTier === 3 && turn < GUREN_TURN;
}

/** 宫中来信：被废出宫、还不知道胧月下落时，眉庄也只能托人打听。 */
export const GONGZHONG_LAIXIN_HIDDEN_STORY: Partial<Record<CardId3, string>> = {
  meizhuangXiangzhu:
    "你拆开信，是眉庄的字迹，写得很长，足足三页。她说：「宫里一切都好，你不必挂心，只管保重自己。」信末又添一句：「胧月的事，我时时托人打听，一有准信，立刻写给你。」包袱里是厚实的冬衣和几包药材，药包上还压着一张她亲笔写的服法。你读到最后，眼眶发热，把信折了又折，贴身收好。",
  jinxiXiangzhu:
    "槿汐托人去山下取了信，一路藏在怀里带回来，还带着她的体温。你拆开一看，是眉庄的字迹，劈头便问你冷不冷、病好了没有，说宫里一切都好，叫你千万保重。末了一句：「胧月的事，我时时托人打听，一有准信，立刻写给你。」槿汐在一旁抹着眼泪，说：「娘娘，眉庄小主心里一直惦记着您呢。」",
};

/** 宫中来信：有【敬妃之谊】但还不知道胧月下落时，敬妃只托人捎东西，不提胧月。 */
export const GONGZHONG_LAIXIN_HIDDEN_JINGFEI_STORY: Partial<Record<CardId3, string>> = {
  meizhuangXiangzhu:
    "你拆开信，是眉庄的字迹，写得很长，足足三页。她说：「宫里一切都好，你不必挂心。这回的冬衣和药材，是我与敬妃姐姐一同备下的，她比我还操心，连炭火都亲自挑过。」信末又添一句：「胧月的事，我时时托人打听，一有准信，立刻写给你。」你把信看了又看，宫里竟还有两个人这样记挂你，心里暖了一暖，又空落落地疼。",
  jinxiXiangzhu:
    "槿汐托人去山下取了信，一路藏在怀里带回来，还带着她的体温。你拆开一看，是眉庄的字迹，问你冷不冷、病好了没有，末了一句：「胧月的事，我时时托人打听。」包袱里除了眉庄备的衣物，还有米面、炭火和几味补药，是敬妃托人一并捎来的。槿汐在一旁抹着眼泪：「娘娘，宫里还有人惦记着您呢。」",
};

/** 宫中来信: with 敬妃之谊, the 解牌 story reads differently (敬妃 also sent supplies and news of 胧月). */
export const GONGZHONG_LAIXIN_JINGFEI_STORY: Partial<Record<CardId3, string>> = {
  meizhuangXiangzhu:
    "你拆开信，是眉庄的字迹，写得很长，足足三页。她说：「宫里一切都好，你不必挂心。这回的冬衣和药材，是我与敬妃姐姐一同备下的，她比我还操心，连炭火都亲自挑过。」信末另夹着一张小笺，是敬妃的笔迹：胧月在她身边养得很好，前几日会叫「额娘」了，夜里睡得安稳，只是偶尔睁着眼睛朝门口望。你把小笺看了又看，攥在手心里，悬了许久的心总算落下一半。",
  jinxiXiangzhu:
    "槿汐托人去山下取了信，一路藏在怀里带回来，还带着她的体温。你拆开一看，是眉庄的字迹，问你冷不冷、病好了没有。包袱里除了眉庄备的衣物，还有米面、炭火和几味补药，是敬妃托人一并捎来的。信里夹着敬妃的小笺，说胧月在她身边养得很好，前几日会叫「额娘」了。槿汐在一旁抹着眼泪：「娘娘，宫里还有人惦记着您和公主呢。」",
};

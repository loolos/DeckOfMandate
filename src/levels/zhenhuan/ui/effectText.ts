import { RESOURCE_EMOJI, STATUSES } from "../data/content";

/**
 * Emoji forms of effect text (events, cards, story options). Compact (略缩) cards show emoji only
 * ("👑+1"); expanded cards keep the words and add the emoji ("👑圣宠 +1").
 */

const STATUS_EMOJI = new Map(Object.values(STATUSES).map((s) => [s.name, s.emoji]));
const DRAW = "🎴";
const PLAYS = "🀄";

/** Emoji-only effect text for 略缩 cards. */
export function compactEffect(text: string): string {
  return (
    text
      .replace(/。$/, "")
      // 获得【耳目灵通】：未来 2 回合每回合抓牌 +1 → 👂耳目灵通(2回合)
      .replace(/获得(?:状态)?【(.+?)】(?:：未来 (\d+) 回合每回合抓牌 [+-]\d+)?/g, (m, name: string, turns?: string) =>
        STATUS_EMOJI.has(name) ? `${STATUS_EMOJI.get(name)}${name}${turns ? `(${turns}回合)` : ""}` : m,
      )
      .replace(/本回合最多出牌数 ([+-]\d+)(（.*?）)?/g, `${PLAYS}$1`)
      .replace(/抽 (\d+) 张牌/g, `${DRAW}+$1`)
      .replace(/抓牌 ([+-]\d+)/g, `${DRAW}$1`)
      .replace(/圣宠 ([+-]\d+)/g, `${RESOURCE_EMOJI.shengchong}$1`)
      .replace(/清誉 ([+-]\d+)/g, `${RESOURCE_EMOJI.qingyu}$1`)
      .replace(/移除 1 个【负面】状态/g, "移除负面状态")
      .replace(/[、，]/g, " ")
  );
}

/** Words plus emoji for expanded cards. */
export function expandedEffect(text: string): string {
  return text
    .replace(/【(.+?)】/g, (m, name: string) => (STATUS_EMOJI.has(name) ? `【${STATUS_EMOJI.get(name)}${name}】` : m))
    .replace(/本回合最多出牌数/g, `${PLAYS}本回合最多出牌数`)
    .replace(/(抽 \d+ 张牌|抓牌)/g, `${DRAW}$1`)
    .replace(/圣宠/g, `${RESOURCE_EMOJI.shengchong}圣宠`)
    .replace(/清誉/g, `${RESOURCE_EMOJI.qingyu}清誉`);
}

import { CARDS, RESOURCE_EMOJI, STATUSES, type StatusDef } from "../data/content";

/**
 * Emoji forms of effect text (events, cards, story options). Compact (略缩) cards show emoji only
 * ("👑+1"); expanded cards keep the words and add the emoji ("👑圣宠 +1").
 */

const STATUS_BY_NAME = new Map(Object.values(STATUSES).map((s) => [s.name, s]));
const STATUS_EMOJI = new Map(Object.values(STATUSES).map((s) => [s.name, s.emoji]));
/** Generic negative-status mark (Sun King uses ⚠️ the same way). */
const NEGATIVE = "⚠️";
const DRAW = "🎴";
const PLAYS = "🀄";

/** Emoji-only effect text for 略缩 cards. */
export function compactEffect(text: string): string {
  return (
    text
      .replace(/。$/, "")
      .replace(/无额外效果，事件消失/g, "—")
      .replace(/移除事件(，不产生负面状态)?/g, "✅")
      // 获得【耳目灵通】：未来 2 回合每回合抓牌 +1 → 👂×2 (status emoji × turns, as in the Sun King compact frames)
      .replace(/获得(?:状态)?【(.+?)】(?:：未来 \d+ 回合每回合(?:抓牌|圣宠|清誉) [+-]\d+)?/g, (m, name: string) => {
        const st = STATUS_BY_NAME.get(name);
        return st ? `${st.emoji}×${st.duration}` : m;
      })
      .replace(/本回合最多出牌数 ([+-]\d+)(（.*?）)?/g, `${PLAYS}$1`)
      .replace(/抽 (\d+) 张牌/g, `${DRAW}+$1`)
      .replace(/抓牌 ([+-]\d+)/g, `${DRAW}$1`)
      .replace(/圣宠 ([+-]\d+)/g, `${RESOURCE_EMOJI.shengchong}$1`)
      .replace(/清誉 ([+-]\d+)/g, `${RESOURCE_EMOJI.qingyu}$1`)
      .replace(/移除 1 个【负面】状态/g, `${NEGATIVE}-1`)
      .replace(/[、，]/g, " ")
  );
}

/** Words plus emoji for expanded cards. */
export function expandedEffect(text: string): string {
  return text
    .replace(/【(.+?)】/g, (m, name: string) => (STATUS_EMOJI.has(name) ? `【${STATUS_EMOJI.get(name)}${name}】` : m))
    .replace(/【负面】/g, `【${NEGATIVE}负面】`)
    .replace(/本回合最多出牌数/g, `${PLAYS}本回合最多出牌数`)
    .replace(/(抽 \d+ 张牌|抓牌)/g, `${DRAW}$1`)
    .replace(/圣宠/g, `${RESOURCE_EMOJI.shengchong}圣宠`)
    .replace(/清誉/g, `${RESOURCE_EMOJI.qingyu}清誉`);
}

const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/** Emoji-only mechanics of a status for the 略缩 status bar ("🎴+1", "🚫👗"). */
export function statusBrief(def: StatusDef): string {
  if (def.blocksCards) return `🚫${def.blocksCards.map((id) => CARDS[id].emoji).join("")}${def.drawModifier ? `${DRAW}${signed(def.drawModifier)}` : ""}`;
  if (def.perTurn) return def.perTurn.map((d) => `${RESOURCE_EMOJI[d.resource]}${signed(d.amount)}`).join(" ");
  return `${DRAW}${signed(def.drawModifier)}`;
}

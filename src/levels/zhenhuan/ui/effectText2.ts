import { CARDS2, RESOURCE2_EMOJI, STATUSES2, type StatusDef2 } from "../data/stage2Content";

/** 第二关 effect text in emoji form (略缩 cards) and with emoji added (expanded cards). */

const STATUS_BY_NAME = new Map(Object.values(STATUSES2).map((s) => [s.name, s]));

export function compactEffect2(text: string): string {
  return text
    .replace(/。$/, "")
    .replace(/无额外效果，事件消失（之后还会出现）/g, "🔁")
    .replace(/无额外效果，事件消失|无效果|无变化/g, "—")
    .replace(/移除事件(（[^）]*）)?(，不产生负面状态)?/g, "✅")
    .replace(/伤胎：有孕前身子 -1、获得【抱恙在身】；有孕后直接小产/g, "⚠️")
    .replace(/获得(?:状态)?【(.+?)】(?:：[^；，、]*)?/g, (m, name: string) => statusEmoji(name) ?? m)
    .replace(/【?(抱恙在身|闭门思过|流言缠身|耳目灵通|眉庄嘱托|温太医留方)】?/g, (m, name: string) => statusEmoji(name) ?? m)
    .replace(/得到罪证【(.+?)】/g, "🗂️$1")
    .replace(/(多次应对后)?可能搜集到华妃的罪证/g, (_m, many?: string) => (many ? "🗂️×2？" : "🗂️？"))
    .replace(/恨意初值 (\d+)/g, `${RESOURCE2_EMOJI.hate}=$1`)
    .replace(/本回合最多出牌数 ([+-]\d+)(（.*?）)?/g, "🀄$1")
    .replace(/抽 (\d+) 张牌/g, "🎴+$1")
    .replace(/抓牌 ([+-]\d+)/g, "🎴$1")
    .replace(/（免去身子 -1）|（身子不扣）/g, "")
    .replace(/圣宠 ([+-]\d+)/g, `${RESOURCE2_EMOJI.shengchong}$1`)
    .replace(/清誉 ([+-]\d+)/g, `${RESOURCE2_EMOJI.qingyu}$1`)
    .replace(/身子 ([+-]\d+)/g, `${RESOURCE2_EMOJI.shenzi}$1`)
    .replace(/恨意 ([+-]\d+)/g, `${RESOURCE2_EMOJI.hate}$1`)
    .replace(/激怒：|出气：|只/g, "")
    .replace(/小产/g, "🥀")
    .replace(/必定有孕/g, "👶")
    .replace(/陵容夺功，你未侍寝/g, "🎶夺功")
    .replace(/召幸被截走/g, "🎶截走")
    .replace(/召幸作废/g, "🌙✗")
    .replace(/称病避宠/g, "🙅避宠")
    .replace(/侍寝成功/g, "🌙✓")
    .replace(/舒痕胶/g, "🧴")
    .replace(/眉庄退场/g, "👭🕯️")
    .replace(/温太医退场/g, "💊🕯️")
    .replace(/曹贵人线结束/g, "✖️")
    .replace(/效果视(你与陵容的)?情分而定|视情分而定/g, "🎶视情分")
    .replace(/陵容：(亲厚|生分|怨怼)(（[^）]*）)?/g, (_m, tier: string) => `🎶${TIER_EMOJI_BY_LABEL[tier] ?? tier}`)
    .replace(/[、，；]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TIER_EMOJI_BY_LABEL: Record<string, string> = { 亲厚: "🤝", 生分: "😐", 怨怼: "🥀" };

function statusEmoji(name: string): string | undefined {
  const st = STATUS_BY_NAME.get(name);
  return st ? (st.permanent ? st.emoji : `${st.emoji}×${st.duration}`) : undefined;
}

export function expandedEffect2(text: string): string {
  return text
    .replace(/【(.+?)】/g, (m, name: string) => {
      const st = STATUS_BY_NAME.get(name);
      return st ? `【${st.emoji}${name}】` : m;
    })
    .replace(/圣宠/g, `${RESOURCE2_EMOJI.shengchong}圣宠`)
    .replace(/清誉/g, `${RESOURCE2_EMOJI.qingyu}清誉`)
    .replace(/身子/g, `${RESOURCE2_EMOJI.shenzi}身子`)
    .replace(/恨意/g, `${RESOURCE2_EMOJI.hate}恨意`);
}

const signed2 = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/** Emoji-only mechanics of a status for the 略缩 status bar ("🎴-1", "🚫👗🙊", "🀄-1"). */
export function statusBrief2(def: StatusDef2): string {
  const parts: string[] = [];
  if (def.drawModifier) parts.push(`🎴${signed2(def.drawModifier)}`);
  if (def.blocksCards) parts.push(`🚫${def.blocksCards.map((id) => CARDS2[id].emoji).join("")}`);
  if (def.playCap) parts.push(`🀄≤${def.playCap}`);
  if (def.playPenalty) parts.push(`🀄-${def.playPenalty}`);
  if (def.playBonus) parts.push(`🀄+${def.playBonus}`);
  for (const d of def.turnStart ?? []) parts.push(`${RESOURCE2_EMOJI[d.resource]}${signed2(d.amount)}`);
  if (def.noSummon) parts.push("🌙✗");
  return parts.length > 0 ? parts.join(" ") : "🛡️";
}

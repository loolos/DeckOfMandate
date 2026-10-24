import { RESOURCE3_EMOJI, STATUSES3 } from "../data/stage3Content";

/** 第三关 effect text in emoji form (略缩 cards) and with emoji added (expanded cards). */

const STATUS_BY_NAME = new Map(Object.values(STATUSES3).map((s) => [s.name, s]));

function statusEmoji(name: string): string | undefined {
  const st = STATUS_BY_NAME.get(name);
  return st ? (st.permanent ? st.emoji : `${st.emoji}×${st.duration}`) : undefined;
}

export function compactEffect3(text: string): string {
  return text
    .replace(/。$/, "")
    .replace(/无额外效果，事件消失|无效果|无变化|没有效果/g, "—")
    .replace(/获得(?:状态)?【(.+?)】(?:（[^）]*）)?/g, (m, name: string) => statusEmoji(name) ?? m)
    .replace(/【(.+?)】/g, (m, name: string) => statusEmoji(name) ?? m)
    .replace(/本回合(?:最多)?出牌 ?([+-]\d+)/g, "🀄$1")
    .replace(/下回合出牌 ?([+-]\d+)/g, "⏭️🀄$1")
    .replace(/抽 (\d+) 张(牌)?/g, "🎴+$1")
    .replace(/抓牌 ([+-]\d+)/g, "🎴$1")
    .replace(/圣宠 ?([+-]\d+)/g, `${RESOURCE3_EMOJI.shengchong}$1`)
    .replace(/清誉 ?([+-]\d+)/g, `${RESOURCE3_EMOJI.qingyu}$1`)
    .replace(/身子 ?([+-]\d+)/g, `${RESOURCE3_EMOJI.shenzi}$1`)
    .replace(/疑点 ?([+-]\d+)/g, "📜$1")
    .replace(/未孕时必定有孕|必定有孕/g, "👶")
    .replace(/侍寝成功/g, "🌙✓")
    .replace(/效果视(你与陵容的)?情分而定|视情分而定/g, "🎶视情分")
    .replace(/[、，；]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function expandedEffect3(text: string): string {
  return text
    .replace(/【(.+?)】/g, (m, name: string) => {
      const st = STATUS_BY_NAME.get(name);
      return st ? `【${st.emoji}${name}】` : m;
    })
    .replace(/圣宠/g, `${RESOURCE3_EMOJI.shengchong}圣宠`)
    .replace(/清誉/g, `${RESOURCE3_EMOJI.qingyu}清誉`)
    .replace(/身子/g, `${RESOURCE3_EMOJI.shenzi}身子`)
    .replace(/疑点/g, "📜疑点");
}

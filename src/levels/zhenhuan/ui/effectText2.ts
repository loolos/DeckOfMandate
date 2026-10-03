import { RESOURCE2_EMOJI, STATUSES2 } from "../data/stage2Content";

/** 第二关 effect text in emoji form (略缩 cards) and with emoji added (expanded cards). */

const STATUS_BY_NAME = new Map(Object.values(STATUSES2).map((s) => [s.name, s]));

export function compactEffect2(text: string): string {
  return text
    .replace(/。$/, "")
    .replace(/获得(?:状态)?【(.+?)】(?:：[^；，、]*)?/g, (m, name: string) => {
      const st = STATUS_BY_NAME.get(name);
      return st ? (st.permanent ? st.emoji : `${st.emoji}×${st.duration}`) : m;
    })
    .replace(/得到罪证【(.+?)】/g, "🗂️$1")
    .replace(/本回合最多出牌数 ([+-]\d+)(（.*?）)?/g, "🀄$1")
    .replace(/抽 (\d+) 张牌/g, "🎴+$1")
    .replace(/抓牌 ([+-]\d+)/g, "🎴$1")
    .replace(/圣宠 ([+-]\d+)/g, `${RESOURCE2_EMOJI.shengchong}$1`)
    .replace(/清誉 ([+-]\d+)/g, `${RESOURCE2_EMOJI.qingyu}$1`)
    .replace(/身子 ([+-]\d+)/g, `${RESOURCE2_EMOJI.shenzi}$1`)
    .replace(/恨意 ([+-]\d+)/g, `${RESOURCE2_EMOJI.hate}$1`)
    .replace(/[、，；]/g, " ");
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

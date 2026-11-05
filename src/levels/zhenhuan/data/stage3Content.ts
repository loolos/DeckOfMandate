/**
 * 甄嬛传 · 第三关「青灯凤阙」 content. Rules come from `../docs/design-stage3.md`; keep mechanic text in sync with it.
 * Palace cards keep their 第一 / 第二关 names, emoji and flavor; their matches here cover all three acts
 * (an act's events never show up in another act, so one table is enough).
 *
 * The tables live in `./stage3/`, one file per section; this file only re-exports them.
 */
export { RANKS, type RankId } from "./content";
export { SHENZI, lingrongTier, summonInterval, type LingrongTier } from "./stage2Content";

export * from "./stage3/level";
export * from "./stage3/cards";
export * from "./stage3/statuses";
export * from "./stage3/secrets";
export * from "./stage3/allies";
export * from "./stage3/events";
export * from "./stage3/lingrong";
export * from "./stage3/stories";
export * from "./stage3/specialCards";
export * from "./stage3/exits";
export * from "./stage3/popups";
export * from "./stage3/tags";

/**
 * 甄嬛传 · 第二关 content. Rules come from `../docs/design-stage2.md`; keep mechanic text in sync with it.
 * Card names, emoji and base flavor are shared with 第一关 (`./content`); everything that differs in
 * 第二关 (matches, 温太医 身子 bonus, 陵容相助, events, stories) lives here.
 *
 * The tables live in `./stage2/`, one file per section; this file only re-exports them.
 */
export { RANKS, type RankId } from "./content";

export * from "./stage2/resources";
export * from "./stage2/lingrongRelation";
export * from "./stage2/evidence";
export * from "./stage2/cards";
export * from "./stage2/statuses";
export * from "./stage2/events";
export * from "./stage2/lingrongEvents";
export * from "./stage2/stories";
export * from "./stage2/tags";

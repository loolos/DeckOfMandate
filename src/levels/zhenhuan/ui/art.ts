import type { CardId, EventId, StoryId } from "../data/content";
import type { CardId2, EventId2, StoryId2 } from "../data/stage2Content";
import type { CardId3, EventId3, StoryId3 } from "../data/stage3Content";

/**
 * Card / event / backdrop art (docs/art-spec.md). Files are named by id, so dropping
 * `assets/cards/<id>.webp` into place is all it takes; a missing file means "no art yet".
 */

/** `../assets/cards/yizhangHong.webp` → `yizhangHong`. */
export function indexByBasename(files: Record<string, string>, ext: RegExp = /\.webp$/): ReadonlyMap<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1).replace(ext, ""), url]));
}

const CARD_ART = indexByBasename(import.meta.glob<string>("../assets/cards/*.webp", { eager: true, import: "default" }));
const EVENT_ART = indexByBasename(import.meta.glob<string>("../assets/events/*.webp", { eager: true, import: "default" }));
const STORY_ART = indexByBasename(import.meta.glob<string>("../assets/stories/*.webp", { eager: true, import: "default" }));
const BACKDROPS = indexByBasename(import.meta.glob<string>("../assets/backdrops/*.webp", { eager: true, import: "default" }));

/** 第三关寺中（第二、三幕）换了修行装束的手牌，配图是 `cards/<id>_temple.webp`；没有这张就用原图。 */
export const TEMPLE_CARD_ART = ["jinxiXiangzhu", "meizhuangXiangzhu", "wenTaiyiZhenzhi"] as const satisfies readonly CardId3[];

export function cardArtUrl(id: CardId | CardId2 | CardId3, variant?: "temple"): string | null {
  return (variant ? CARD_ART.get(`${id}_${variant}`) : undefined) ?? CARD_ART.get(id) ?? null;
}

/** Events shared by several chapters (same id) share one picture. */
export function eventArtUrl(id: EventId | EventId2 | EventId3): string | null {
  return EVENT_ART.get(id) ?? null;
}

/** Story variants that share one picture (both 玉阶炎日 cards use the plain one). */
const STORY_ART_ALIAS: Partial<Record<StoryId | StoryId2 | StoryId3, StoryId | StoryId2 | StoryId3>> = { fakuiPregnant: "fakuiPlain" };

export function storyArtUrl(id: StoryId | StoryId2 | StoryId3): string | null {
  return STORY_ART.get(STORY_ART_ALIAS[id] ?? id) ?? null;
}

/**
 * Story-area cards that have no id of their own (晋封考验 ×2, 翊坤落幕; 第三关 纯元故衣, 景仁宫对质, 肺痨之诬,
 * 长相思, 移花接木); files live in `assets/stories/`.
 */
export const SPECIAL_ART_KEYS = ["promotionTrial", "guirenTrial", "finale", "chunyuan", "confront", "feilao", "changxiangsi", "yihua"] as const;
export type SpecialArtKey = (typeof SPECIAL_ART_KEYS)[number];

export function specialArtUrl(key: SpecialArtKey): string | null {
  return STORY_ART.get(key) ?? null;
}

/** The start menu uses the 第一关 backdrop. */
export function backdropUrl(stage: 1 | 2 | 3): string | null {
  return BACKDROPS.get(`stage${stage}`) ?? null;
}

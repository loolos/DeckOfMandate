import type { CardId, EventId, StoryId } from "../data/content";
import type { CardId2, EventId2, StoryId2 } from "../data/stage2Content";

/**
 * Card / event / backdrop art (docs/art-spec.md). Files are named by id, so dropping
 * `assets/cards/<id>.webp` into place is all it takes; a missing file means "no art yet".
 */

/** `../assets/cards/yizhangHong.webp` → `yizhangHong`. */
export function indexByBasename(files: Record<string, string>): ReadonlyMap<string, string> {
  return new Map(Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1).replace(/\.webp$/, ""), url]));
}

const CARD_ART = indexByBasename(import.meta.glob<string>("../assets/cards/*.webp", { eager: true, import: "default" }));
const EVENT_ART = indexByBasename(import.meta.glob<string>("../assets/events/*.webp", { eager: true, import: "default" }));
const STORY_ART = indexByBasename(import.meta.glob<string>("../assets/stories/*.webp", { eager: true, import: "default" }));
const BACKDROPS = indexByBasename(import.meta.glob<string>("../assets/backdrops/*.webp", { eager: true, import: "default" }));

export function cardArtUrl(id: CardId | CardId2): string | null {
  return CARD_ART.get(id) ?? null;
}

/** Events shared by both chapters (same id) share one picture. */
export function eventArtUrl(id: EventId | EventId2): string | null {
  return EVENT_ART.get(id) ?? null;
}

/** Story variants that share one picture (both 翊坤长跪 cards use the plain one). */
const STORY_ART_ALIAS: Partial<Record<StoryId | StoryId2, StoryId | StoryId2>> = { fakuiPregnant: "fakuiPlain" };

export function storyArtUrl(id: StoryId | StoryId2): string | null {
  return STORY_ART.get(STORY_ART_ALIAS[id] ?? id) ?? null;
}

/** Story-area cards that have no id of their own (晋封考验 ×2, 翊坤落幕); files live in `assets/stories/`. */
export const SPECIAL_ART_KEYS = ["promotionTrial", "guirenTrial", "finale"] as const;
export type SpecialArtKey = (typeof SPECIAL_ART_KEYS)[number];

export function specialArtUrl(key: SpecialArtKey): string | null {
  return STORY_ART.get(key) ?? null;
}

/** The start menu uses the 第一关 backdrop. */
export function backdropUrl(stage: 1 | 2): string | null {
  return BACKDROPS.get(`stage${stage}`) ?? null;
}

import type { CardId, EventId } from "../data/content";
import type { CardId2, EventId2 } from "../data/stage2Content";

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
const BACKDROPS = indexByBasename(import.meta.glob<string>("../assets/backdrops/*.webp", { eager: true, import: "default" }));

export function cardArtUrl(id: CardId | CardId2): string | null {
  return CARD_ART.get(id) ?? null;
}

/** Events shared by both chapters (same id) share one picture. */
export function eventArtUrl(id: EventId | EventId2): string | null {
  return EVENT_ART.get(id) ?? null;
}

/** The start menu uses the 第一关 backdrop. */
export function backdropUrl(stage: 1 | 2): string | null {
  return BACKDROPS.get(`stage${stage}`) ?? null;
}

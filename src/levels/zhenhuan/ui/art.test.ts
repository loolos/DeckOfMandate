import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CARDS, EVENTS, STORIES } from "../data/content";
import { CARDS2, EVENTS2, STORIES2 } from "../data/stage2Content";
import { CARDS3, EVENTS3, STORIES3 } from "../data/stage3Content";
import { SPECIAL_ART_KEYS, TEMPLE_CARD_ART, indexByBasename } from "./art";

/** Art files that aren't named after a real id would silently never show (docs/art-spec.md §2). */
function strayFiles(folder: string, ids: readonly string[]): string[] {
  const dir = fileURLToPath(new URL(`../assets/${folder}/`, import.meta.url));
  const allowed = new Set(ids.map((id) => `${id}.webp`));
  return readdirSync(dir).filter((name) => name !== ".gitkeep" && !allowed.has(name));
}

describe("zhenhuan art files", () => {
  it("card art is named <CardId>.webp (or <CardId>_temple.webp for 第三关寺中版)", () => {
    const temple = TEMPLE_CARD_ART.map((id) => `${id}_temple`);
    expect(strayFiles("cards", [...Object.keys(CARDS), ...Object.keys(CARDS2), ...Object.keys(CARDS3), ...temple])).toEqual([]);
  });

  it("event art is named <EventId>.webp", () => {
    expect(strayFiles("events", [...Object.keys(EVENTS), ...Object.keys(EVENTS2), ...Object.keys(EVENTS3)])).toEqual([]);
  });

  it("story art is named <StoryId>.webp (or a special card key)", () => {
    expect(strayFiles("stories", [...Object.keys(STORIES), ...Object.keys(STORIES2), ...Object.keys(STORIES3), ...SPECIAL_ART_KEYS])).toEqual([]);
  });

  it("backdrops are stage1.webp / stage2.webp / stage3.webp", () => {
    expect(strayFiles("backdrops", ["stage1", "stage2", "stage3"])).toEqual([]);
  });

  it("indexes glob results by id", () => {
    const index = indexByBasename({ "../assets/events/yizhangHong.webp": "/a.webp", "../assets/events/liyiShiwu.webp": "/b.webp" });
    expect(index.get("yizhangHong")).toBe("/a.webp");
    expect(index.get("liyiShiwu")).toBe("/b.webp");
  });
});

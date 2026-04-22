import { registerChapter2StandaloneFactory } from "../../data/levelBootstrap";
import type { LevelContent, LevelDef } from "../../data/levelTypes";
import { registerLevel, setDefaultLevelId } from "../../data/levelRegistry";
import type { Level2StartDraft } from "./chapter2Transition";

type ChapterModule = {
  levelDef: LevelDef;
  levelContent: LevelContent;
  registerAsDefaultLevel?: boolean;
  chapter2StandaloneFactory?: (seed?: number) => Level2StartDraft;
};

const chapterModules = import.meta.glob("./chapters/*.ts", { eager: true }) as Record<string, ChapterModule>;

export function registerSunking(): void {
  let defaultLevelId: string | null = null;
  for (const path of Object.keys(chapterModules).sort()) {
    const mod = chapterModules[path];
    if (!mod?.levelDef || !mod?.levelContent) continue;
    registerLevel(mod.levelDef, mod.levelContent);
    if (mod.registerAsDefaultLevel) defaultLevelId = mod.levelDef.id;
    const factory = mod.chapter2StandaloneFactory;
    if (factory && mod.levelDef.bootstrap === "chapter2Standalone") {
      registerChapter2StandaloneFactory(mod.levelDef.id, factory);
    }
  }
  if (defaultLevelId) setDefaultLevelId(defaultLevelId);
}

registerSunking();

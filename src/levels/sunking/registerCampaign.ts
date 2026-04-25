import {
  registerChapter2StandaloneFactory,
  registerChapter3StandaloneFactory,
} from "../../data/levelBootstrap";
import type { LevelContent, LevelDef } from "../../data/levelTypes";
import { registerLevel, setDefaultLevelId } from "../../data/levelRegistry";
import type { Level2StartDraft, Level3StartDraft } from "../../types/continuity";
import { registerCampaignReducerBridge } from "../campaignReducerBridge";
import { trySunkingCampaignReducerBridge } from "./logic/campaignReducerBridgeImpl";
import { registerSunkingInitialStateHooks } from "./sunkingInitialStateHooks";

type ChapterModule = {
  levelDef: LevelDef;
  levelContent: LevelContent;
  registerAsDefaultLevel?: boolean;
  chapter2StandaloneFactory?: (seed?: number) => Level2StartDraft;
  chapter3StandaloneFactory?: (seed?: number) => Level3StartDraft;
};

const chapterModules = import.meta.glob("./chapters/*.ts", { eager: true }) as Record<string, ChapterModule>;

export function registerSunking(): void {
  registerCampaignReducerBridge(trySunkingCampaignReducerBridge);
  registerSunkingInitialStateHooks();
  let defaultLevelId: string | null = null;
  for (const path of Object.keys(chapterModules).sort()) {
    const mod = chapterModules[path];
    if (!mod?.levelDef || !mod?.levelContent) continue;
    registerLevel(mod.levelDef, mod.levelContent);
    if (mod.registerAsDefaultLevel) defaultLevelId = mod.levelDef.id;
    if (mod.levelDef.bootstrap === "chapter2Standalone" && mod.chapter2StandaloneFactory) {
      registerChapter2StandaloneFactory(mod.levelDef.id, mod.chapter2StandaloneFactory);
    }
    if (mod.levelDef.bootstrap === "chapter3Standalone" && mod.chapter3StandaloneFactory) {
      registerChapter3StandaloneFactory(mod.levelDef.id, mod.chapter3StandaloneFactory);
    }
  }
  if (defaultLevelId) setDefaultLevelId(defaultLevelId);
}

registerSunking();

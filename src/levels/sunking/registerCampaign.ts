import { registerLevelBootstrapStateBuilder } from "../../data/levelBootstrap";
import type { LevelContent, LevelDef } from "../../data/levelTypes";
import { registerLevel, setDefaultLevelId } from "../../data/levelRegistry";
import type { Level2StartDraft, Level3StartDraft } from "./types/continuity";
import { registerCampaignReducerBridge } from "../campaignReducerBridge";
import { trySunkingCampaignReducerBridge } from "./logic/campaignReducerBridgeImpl";
import { buildLevel2StateFromDraft } from "./chapter2Transition";
import {
  registerChapter2StandaloneDraftFactory,
  registerChapter3StandaloneDraftFactory,
} from "./chapterBootstrapDrafts";
import { buildLevel3StateFromDraft } from "./chapter3Transition";
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
      const factory = mod.chapter2StandaloneFactory;
      registerChapter2StandaloneDraftFactory(mod.levelDef.id, factory);
      registerLevelBootstrapStateBuilder(mod.levelDef.id, (seed?: number) => buildLevel2StateFromDraft(factory(seed)));
    }
    if (mod.levelDef.bootstrap === "chapter3Standalone" && mod.chapter3StandaloneFactory) {
      const factory = mod.chapter3StandaloneFactory;
      registerChapter3StandaloneDraftFactory(mod.levelDef.id, factory);
      registerLevelBootstrapStateBuilder(mod.levelDef.id, (seed?: number) => buildLevel3StateFromDraft(factory(seed)));
    }
  }
  if (defaultLevelId) setDefaultLevelId(defaultLevelId);
}

registerSunking();

export type { LevelEndingCopyKeys } from "./levelTypes";
export type { LevelId } from "./levelRegistry";
export {
  getDefaultLevelId,
  getLevelDef,
  getRegisteredLevelIds,
  getTurnLimitForRun,
  isLevelId,
  tryGetLevelDef,
} from "./levelRegistry";

import { getLevelDef } from "./levelRegistry";

/** First playable Sun King chapter (when that campaign is registered). */
export function levelFirstMandate(): ReturnType<typeof getLevelDef> {
  return getLevelDef("firstMandate");
}

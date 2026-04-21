export type {
  LevelContent,
  ScriptedCalendarAntiCoalitionConfig,
  ScriptedCalendarAttackConfig,
  ScriptedCalendarEventConfig,
  SlotEscalation,
} from "./levelTypes";
import { getLevelContent as getLevelContentFromRegistry } from "./levelRegistry";

export { getLevelContent } from "./levelRegistry";

/** Test / tooling access to Sun King chapters by stable id. */
export const levelContentByLevelId = {
  get firstMandate() {
    return getLevelContentFromRegistry("firstMandate");
  },
  get secondMandate() {
    return getLevelContentFromRegistry("secondMandate");
  },
};

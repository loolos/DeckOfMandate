import type { ScriptedCalendarEventConfig } from "../../../data/levelContent";
import type { GameState } from "../../../types/game";
import type { SlotId } from "../../types/event";
import { appendActionLog } from "./actionLog";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

export function onScriptedCalendarPlacement(
  state: GameState,
  cfg: ScriptedCalendarEventConfig,
  target: SlotId,
): GameState {
  let s = state;
  if (cfg.templateId === "nineYearsWar") {
    s = appendActionLog(s, { kind: "eventNineYearsWarBegins", slot: target });
  }
  if (s.levelId === THIRD_MANDATE_LEVEL_ID && cfg.templateId === "utrechtTreaty") {
    s = { ...s, utrechtTreatyCountdown: 6 };
  }
  return s;
}

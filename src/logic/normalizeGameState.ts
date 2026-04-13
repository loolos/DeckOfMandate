import { defaultLevelId, isLevelId } from "../data/levels";
import type { GameState } from "../types/game";

/** Fill defaults for fields added after older saves / external HYDRATE payloads. */
export function normalizeGameState(state: GameState): GameState {
  let s: GameState = isLevelId(state.levelId) ? state : { ...state, levelId: defaultLevelId };
  if (!Array.isArray(s.playerStatuses)) {
    s = { ...s, playerStatuses: [] };
  }
  const eventId = typeof s.nextIds?.event === "number" ? s.nextIds.event : 0;
  const statusId = typeof s.nextIds?.status === "number" ? s.nextIds.status : 0;
  const logId = typeof s.nextIds?.log === "number" ? s.nextIds.log : 0;
  s = { ...s, nextIds: { event: eventId, status: statusId, log: logId } };
  if (!Array.isArray(s.actionLog)) {
    s = { ...s, actionLog: [] };
  }
  return s;
}

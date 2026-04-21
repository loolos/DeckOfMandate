import { hasCardTag } from "./cardTags";
import type { GameState } from "../types/game";

/** Royal ban, dynamic Defiance tag (Jansenist neighbor), and other status-based blocks. */
export function isCardPlayableUnderStatuses(state: GameState, cardInstanceId: string): boolean {
  if (hasCardTag(state, cardInstanceId, "defiance")) return false;
  for (const st of state.playerStatuses) {
    if (st.kind !== "blockCardTag" || !st.blockedTag) continue;
    if (hasCardTag(state, cardInstanceId, st.blockedTag)) return false;
  }
  return true;
}

/** Full playability check for the action phase. */
export function isCardPlayableInActionPhase(state: GameState, cardInstanceId: string): boolean {
  return isCardPlayableUnderStatuses(state, cardInstanceId);
}

import type { GameAction } from "../app/gameReducer";
import type { GameState } from "../types/game";

/**
 * Optional campaign-specific reducer slice (phase 2+).
 * Return a new state when handled; return null to let the engine reducer continue.
 */
export function tryCampaignReducerBridge(_state: GameState, _action: GameAction): GameState | null {
  return null;
}

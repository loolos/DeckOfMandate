import type { GameAction } from "../app/gameReducer";
import type { GameState } from "../types/game";

export type CampaignReducerBridge = (state: GameState, action: GameAction) => GameState | null;

let registeredBridge: CampaignReducerBridge | null = null;

/** Called from each campaign's `registerCampaign.ts` (typically once at module load). */
export function registerCampaignReducerBridge(fn: CampaignReducerBridge | null): void {
  registeredBridge = fn;
}

/**
 * Optional campaign-specific reducer slice.
 * Return a new state when handled; return null to let the engine reducer continue.
 */
export function tryCampaignReducerBridge(state: GameState, action: GameAction): GameState | null {
  return registeredBridge?.(state, action) ?? null;
}

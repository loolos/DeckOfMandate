import type { GameState } from "../types/game";

/**
 * Opening-state builders for levels whose `bootstrap` is not `"initial"`.
 * The campaign registers one per level id; the engine calls it when a run starts for
 * that level (menu start and run-code replay alike) instead of `createInitialState`.
 */
const bootstrapStateBuilders: Record<string, (seed?: number) => GameState> = {};

export function registerLevelBootstrapStateBuilder(levelId: string, fn: (seed?: number) => GameState): void {
  bootstrapStateBuilders[levelId] = fn;
}

/** Built opening state for a campaign-bootstrapped level, or null when the level has none. */
export function buildCampaignBootstrapState(levelId: string, seed?: number): GameState | null {
  const fn = bootstrapStateBuilders[levelId];
  return fn ? fn(seed) : null;
}

import type { LevelEndingCopyKeys } from "../data/levels";
import type { GameState } from "../types/game";

type ContinuityEndingState = Pick<GameState, "nantesPolicyCarryover" | "warOfDevolutionAttacked">;

export function continuityEndingBodyKeys(
  ending: LevelEndingCopyKeys,
  state: ContinuityEndingState,
): string[] {
  const keys: string[] = [];
  const warKey = state.warOfDevolutionAttacked
    ? ending.continuityWarOfDevolutionBodyKeys?.attacked
    : ending.continuityWarOfDevolutionBodyKeys?.restrained;
  if (warKey) keys.push(warKey);

  const nantesKey = state.nantesPolicyCarryover
    ? ending.continuityNantesPolicyBodyKeys?.[state.nantesPolicyCarryover]
    : undefined;
  if (nantesKey) keys.push(nantesKey);

  return keys;
}

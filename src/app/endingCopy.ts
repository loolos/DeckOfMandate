import type { LevelEndingCopyKeys } from "../data/levels";
import type { GameState } from "../types/game";

type ContinuityEndingState = Pick<
  GameState,
  "nantesPolicyCarryover" | "warOfDevolutionAttacked" | "actionLog"
>;

type LouisXivLegacyEndingChoice = "regencyCustody" | "youngKingDirectRule";

function findLouisXivLegacyEndingChoice(state: ContinuityEndingState): LouisXivLegacyEndingChoice | null {
  for (let i = state.actionLog.length - 1; i >= 0; i -= 1) {
    const entry = state.actionLog[i];
    if (!entry) continue;
    if (entry.kind === "eventLouisXivLegacyChoice") {
      return entry.directRule ? "youngKingDirectRule" : "regencyCustody";
    }
    if (entry.kind === "eventYearEndPenalty" && entry.templateId === "louisXivLegacy1715") {
      return "regencyCustody";
    }
  }
  return null;
}

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

  const legacyChoice = findLouisXivLegacyEndingChoice(state);
  if (legacyChoice) {
    const legacyKey = ending.chapter3LouisXivLegacyBodyKeys?.[legacyChoice];
    if (legacyKey) keys.push(legacyKey);
  }

  return keys;
}

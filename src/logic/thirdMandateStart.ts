import type { GameState, NantesPolicyCarryover } from "../types/game";
import { applyEffects } from "./applyEffects";

/** Standalone / menu start: when unspecified, chapter 3 defaults to the crackdown branch. */
export function resolveThirdMandateNantesPolicy(
  explicit: NantesPolicyCarryover | null | undefined,
): NantesPolicyCarryover {
  return explicit ?? "crackdown";
}

/**
 * Chapter 2 Nantes branch → chapter 3 deck injection only (no duplicate status / legitimacy from ch.2).
 * - Tolerance: 4× `religiousTensionCard` (宗教冲突).
 * - Crackdown: 4× `jansenistReservation` (良心保留; Jansenist defiance after Huguenot suppression).
 */
export function applyThirdMandateNantesStartingEffects(
  state: GameState,
  policy: NantesPolicyCarryover,
): GameState {
  const templateId = policy === "tolerance" ? "religiousTensionCard" : "jansenistReservation";
  return applyEffects(state, [{ kind: "addCardsToDeck", templateId, count: 4 }]);
}

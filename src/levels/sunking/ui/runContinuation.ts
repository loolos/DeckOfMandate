/**
 * Post-victory continuation offer: chapters 1 and 2 invite the player to carry their deck
 * into the next chapter's refit screen. Driven by each level's `postVictoryContinuity`.
 */
import { tryGetLevelDef } from "../../../data/levels";
import type { GameState } from "../../../types/game";
import type { CampaignRunContinuation } from "../../campaignUiRegistry";

export function resolveSunkingRunContinuation(state: GameState): CampaignRunContinuation | null {
  const continuity = tryGetLevelDef(state.levelId)?.postVictoryContinuity;
  if (!continuity) return null;
  return { continueLabelKey: continuity.continueLabelKey };
}

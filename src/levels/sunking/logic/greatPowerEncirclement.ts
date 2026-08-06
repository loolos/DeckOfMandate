import type { GameState } from "../../../types/game";

/**
 * Encirclement ladder: each threshold the core-resource sum strictly exceeds is worth one
 * more point of Habsburg opponent strength, so >45 / >60 / >75 / >90 map to +1 / +2 / +3 / +4.
 */
export const GREAT_POWER_ENCIRCLEMENT_TIER_SUMS: readonly number[] = [45, 60, 75, 90];

/**
 * Extra Habsburg begin-year draws per rung of the ladder above, indexed by tier: rungs
 * >45 / >60 / >75 / >90 are worth +0 / +1 / +1 / +2 cards. The draw ladder is deliberately
 * flatter than the strength one — an extra card compounds across the rival's whole hand, so
 * it only steps at the second and fourth rungs.
 */
const GREAT_POWER_ENCIRCLEMENT_DRAW_BONUS_BY_TIER: readonly number[] = [0, 0, 1, 1, 2];

export function sumCoreResources(state: GameState): number {
  return state.resources.treasuryStat + state.resources.power + state.resources.legitimacy;
}

/** How much opponent strength the current core-resource sum is worth (0 when below the first tier). */
export function greatPowerEncirclementTier(resourceSum: number): number {
  return GREAT_POWER_ENCIRCLEMENT_TIER_SUMS.filter((threshold) => resourceSum > threshold).length;
}

/**
 * The rung this run sits on: the ratchet already paid out never gives way to a lower live sum,
 * and a sum raised during the player's turn counts before the event phase re-syncs the status.
 */
export function greatPowerEncirclementEffectiveTier(state: GameState): number {
  return Math.max(
    state.greatPowerEncirclementStrengthApplied,
    greatPowerEncirclementTier(sumCoreResources(state)),
  );
}

/**
 * Extra cards the Habsburg rival draws each begin-year while `greatPowerEncirclement` is held:
 * core resources above 45 / 60 / 75 / 90 are worth +0 / +1 / +1 / +2. Like the strength ladder
 * it never gives back, so spending down before the draw phase cannot starve the rival's hand.
 */
export function greatPowerEncirclementDrawBonus(state: GameState): number {
  if (!state.playerStatuses.some((s) => s.templateId === "greatPowerEncirclement")) return 0;
  const tier = greatPowerEncirclementEffectiveTier(state);
  const capped = Math.min(tier, GREAT_POWER_ENCIRCLEMENT_DRAW_BONUS_BY_TIER.length - 1);
  return GREAT_POWER_ENCIRCLEMENT_DRAW_BONUS_BY_TIER[Math.max(0, capped)] ?? 0;
}

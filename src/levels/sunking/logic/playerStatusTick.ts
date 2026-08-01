import type { GameState } from "../../../types/game";
import type { PlayerStatusInstance, PlayerStatusKind } from "../../types/status";

/** Statuses whose lifetime is driven by engine hooks, never by the yearly tick. */
const PERMANENT_STATUS_TEMPLATE_IDS: ReadonlySet<string> = new Set([
  "religiousTolerance",
  "huguenotContainment",
  "greatPowerEncirclement",
]);

/**
 * Kinds whose effect is read *after* the start-of-year phase: card-play blocks consumed
 * during the action phase, and the end-of-year retention cap.
 *
 * A status granted by an unresolved event penalty is created at year end, i.e. after that
 * year's action phase, so it has to survive the whole of the *following* year. Ticking it
 * right after the next draw (like the start-of-year kinds below) would expire it before the
 * action phase ever reads it. These therefore tick at the end of the year instead, before
 * `resolveEndOfYearPenalties` grants new ones.
 *
 * Every other kind (draw attempts, begin-year resource deltas, hand cap) is consumed inside
 * `beginYear` before the tick, so `turns` already means "affects the next N start-of-year
 * phases" for them.
 */
const END_OF_YEAR_TICK_KINDS: ReadonlySet<PlayerStatusKind> = new Set<PlayerStatusKind>([
  "blockCardTag",
  "retentionCapacityDelta",
]);

function tick(
  statuses: readonly PlayerStatusInstance[],
  shouldTick: (status: PlayerStatusInstance) => boolean,
  /** Whether rows this pass did not tick may also be dropped once they hit 0. */
  sweepUntickedRows: boolean,
): PlayerStatusInstance[] {
  const out: PlayerStatusInstance[] = [];
  for (const p of statuses) {
    if (PERMANENT_STATUS_TEMPLATE_IDS.has(p.templateId) || !shouldTick(p)) {
      if (!sweepUntickedRows || p.turnsRemaining > 0) out.push(p);
      continue;
    }
    const turnsRemaining = p.turnsRemaining - 1;
    if (turnsRemaining > 0) out.push({ ...p, turnsRemaining });
  }
  return out;
}

/**
 * Start-of-year tick: runs in `beginYear` once the draw has consumed the statuses. Also
 * sweeps any already-expired row, which is what this pass has always done.
 */
export function tickBeginYearStatuses(state: GameState): GameState {
  return {
    ...state,
    playerStatuses: tick(state.playerStatuses, (p) => !END_OF_YEAR_TICK_KINDS.has(p.kind), true),
  };
}

/**
 * End-of-year tick: runs before unresolved-event penalties grant next year's statuses, and
 * touches only the action-phase kinds so start-of-year rows keep their existing lifetime.
 */
export function tickEndOfYearStatuses(state: GameState): GameState {
  return {
    ...state,
    playerStatuses: tick(state.playerStatuses, (p) => END_OF_YEAR_TICK_KINDS.has(p.kind), false),
  };
}

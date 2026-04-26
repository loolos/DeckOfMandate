import type { PlayerStatusInstance } from "../levels/types/status";

import { handCap } from "./draw";

export function getHandCapForStatuses(statuses: readonly PlayerStatusInstance[]): number {
  let bonus = 0;
  for (const st of statuses) {
    if (st.kind === "handCapDelta" || st.kind === "retentionCapacityDelta") bonus += st.delta ?? 0;
  }
  return Math.max(0, handCap + bonus);
}

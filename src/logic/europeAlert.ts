/** Europe Alert draw reduction is fixed at chapter start: floor(power / 2), at least 1. */
export function computeEuropeAlertDrawPenalty(startingPower: number): number {
  return Math.max(1, Math.floor(startingPower / 2));
}

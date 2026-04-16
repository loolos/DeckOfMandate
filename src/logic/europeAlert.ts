/** Europe Alert immediate power loss at chapter start: floor(current power / 2). */
export function computeEuropeAlertPowerLoss(currentPower: number): number {
  return Math.max(0, Math.floor(currentPower / 2));
}

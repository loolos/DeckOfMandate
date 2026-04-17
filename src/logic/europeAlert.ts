/** Europe Alert immediate power loss at chapter start: floor(current power / 2). */
export function computeEuropeAlertPowerLoss(currentPower: number): number {
  return Math.max(0, Math.floor(currentPower / 2));
}

export const EUROPE_ALERT_PROGRESS_MIN = 1;
export const EUROPE_ALERT_PROGRESS_MAX = 10;
export const EUROPE_ALERT_START_PROGRESS = 3;

export function clampEuropeAlertProgress(progress: number): number {
  return Math.min(EUROPE_ALERT_PROGRESS_MAX, Math.max(EUROPE_ALERT_PROGRESS_MIN, Math.floor(progress)));
}

/** Treaties of Nijmegen solve cost scales with Europe Alert progress. */
export function nymwegenSettlementFundingCost(progress: number): number {
  return clampEuropeAlertProgress(progress) + 3;
}

/**
 * Europe Alert supplemental event count by progress:
 * - 1..5: chance `progress * 20%` for exactly 1 event
 * - 6..10: guaranteed 1 event, plus second-event chance `(progress - 5) * 20%`
 */
export function rollEuropeAlertSupplementalEventCount(
  progress: number,
  randomPrimary: number,
  randomSecondary: number,
): number {
  const p = clampEuropeAlertProgress(progress);
  if (p <= 5) {
    return randomPrimary < p * 0.2 ? 1 : 0;
  }
  const secondChance = (p - 5) * 0.2;
  return randomSecondary < secondChance ? 2 : 1;
}

/** 基础压力差值：k = (treasury + power + legitimacy) - 12 - progress*3 */
export function europeAlertPressureDeltaK(
  treasuryStat: number,
  power: number,
  legitimacy: number,
  progress: number,
): number {
  return treasuryStat + power + legitimacy - 12 - clampEuropeAlertProgress(progress) * 3;
}

export function europeAlertProgressShiftProbability(k: number): number {
  if (k === 0) return 0;
  return Math.min(1, Math.abs(k) * 0.1);
}

/**
 * Power-to-draw conversion uses increasing marginal cost:
 * 1 power -> 1 draw, then each extra draw costs current draw count power.
 * Thresholds: 1, 2, 4, 7, 11, 16, ...
 */
export function drawAttemptsFromPower(power: number): number {
  if (power <= 1) return 1;
  const normalized = Math.max(0, power - 1);
  const extraDraws = Math.floor((Math.sqrt(1 + 8 * normalized) - 1) / 2);
  return 1 + extraDraws;
}


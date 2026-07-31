/**
 * Sun King slice of the persisted-save structural check: fields written by this
 * campaign that must exist before an old localStorage save may hydrate the reducer.
 */
export function campaignSaveStateShapeValid(s: Record<string, unknown>): boolean {
  return (
    typeof s.successionTrack === "number" &&
    "utrechtTreatyCountdown" in s &&
    "utrechtSettlementTier" in s &&
    "successionOutcomeTier" in s &&
    "greatPowerEncirclementHighPressureApplied" in s
  );
}

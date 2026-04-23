/** Level ids registered by the Sun King (`sunking`) campaign — used for shared art / shell UI. */
export const SUNKING_LEVEL_IDS = ["firstMandate", "secondMandate", "thirdMandate"] as const;

export type SunkingLevelId = (typeof SUNKING_LEVEL_IDS)[number];

const sunkingSet = new Set<string>(SUNKING_LEVEL_IDS);

export function isSunkingLevelId(levelId: string): levelId is SunkingLevelId {
  return sunkingSet.has(levelId);
}

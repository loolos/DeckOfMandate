import type { CardTag } from "../../types/tags";

/** Runtime list of this campaign's card tags (type side lives in `../types/contentTypesAugmentation.ts`). */
export const CARD_TAGS = [
  "royal",
  "temp",
  "extra",
  "inflation",
  "defiance",
  "consume",
  "opponent",
  "successionContest",
] as const satisfies readonly CardTag[];

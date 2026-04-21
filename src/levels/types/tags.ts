export const CARD_TAGS = [
  "royal",
  "temp",
  "extra",
  "inflation",
  "defiance",
  "consume",
  "opponent",
  "successionContest",
] as const;

export type CardTag = (typeof CARD_TAGS)[number];

export const CARD_TAGS = ["royal", "temp", "extra", "inflation"] as const;

export type CardTag = (typeof CARD_TAGS)[number];

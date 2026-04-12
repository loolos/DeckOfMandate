import type { Effect } from "./effect";

export type CardTemplateId = "funding" | "crackdown" | "reform" | "ceremony";

export type CardTemplate = {
  id: CardTemplateId;
  cost: number;
  /** Keys into locale bundles for title and body. */
  titleKey: string;
  descriptionKey: string;
  /** Crackdown uses UI + reducer branch instead of a generic effect list. */
  effects: Effect[];
};

export type CardInstance = {
  instanceId: string;
  templateId: CardTemplateId;
};

import type { Effect } from "./effect";
import type { CardTag } from "./tags";

/** Registry of card template ids; campaign packs merge their ids in via `declare module`. */
export interface CardTemplateIdRegistry {}
export type CardTemplateId = keyof CardTemplateIdRegistry & string;

/** Campaign packs merge extra card-template metadata fields into this interface. */
export interface CampaignCardTemplateFields {}

export type CardTemplate = {
  id: CardTemplateId;
  cost: number;
  tags: readonly CardTag[];
  /** Keys into locale bundles for title, flavor, and rules text. */
  titleKey: string;
  /** Brief thematic line shown on hand cards. */
  backgroundKey: string;
  descriptionKey: string;
  /** Some cards use UI + reducer branches instead of a generic effect list. */
  effects: Effect[];
} & CampaignCardTemplateFields;

export type CardInstance = {
  instanceId: string;
  templateId: CardTemplateId;
};

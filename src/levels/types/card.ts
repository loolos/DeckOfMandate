import type { Effect } from "./effect";
import type { CardTag } from "./tags";

export type CardTemplateId =
  | "funding"
  | "crackdown"
  | "diplomaticIntervention"
  | "fiscalBurden"
  | "antiFrenchContainment"
  | "reform"
  | "ceremony"
  | "development"
  | "grainRelief"
  | "taxRebalance"
  | "diplomaticCongress"
  | "suppressHuguenots"
  | "religiousTensionCard"
  | "jesuitCollege";

export type CardTemplate = {
  id: CardTemplateId;
  cost: number;
  tags: readonly CardTag[];
  /** Keys into locale bundles for title, flavor, and rules text. */
  titleKey: string;
  /** Brief thematic line shown on hand cards. */
  backgroundKey: string;
  descriptionKey: string;
  /** Crackdown uses UI + reducer branch instead of a generic effect list. */
  effects: Effect[];
};

export type CardInstance = {
  instanceId: string;
  templateId: CardTemplateId;
};

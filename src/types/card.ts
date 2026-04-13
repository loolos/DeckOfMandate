import type { Effect } from "./effect";

export type CardTemplateId =
  | "funding"
  | "crackdown"
  | "reform"
  | "ceremony"
  | "development"
  | "grainRelief"
  | "taxRebalance"
  | "diplomaticCongress"
  | "patronageOffice"
  | "warBond";

export type CardTemplate = {
  id: CardTemplateId;
  cost: number;
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

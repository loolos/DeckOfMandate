import type { CardTemplate, CardTemplateId } from "../types/card";
import type { CardTag } from "../types/tags";

const ROYAL: readonly CardTag[] = ["royal"];
const EXTRA: readonly CardTag[] = ["extra"];
const INFLATION: readonly CardTag[] = ["inflation"];

const templates: Record<CardTemplateId, CardTemplate> = {
  funding: {
    id: "funding",
    cost: 0,
    tags: ROYAL,
    titleKey: "card.funding.name",
    backgroundKey: "card.funding.background",
    descriptionKey: "card.funding.desc",
    effects: [{ kind: "gainFunding", amount: 1 }],
  },
  crackdown: {
    id: "crackdown",
    cost: 1,
    tags: ROYAL,
    titleKey: "card.crackdown.name",
    backgroundKey: "card.crackdown.background",
    descriptionKey: "card.crackdown.desc",
    effects: [],
  },
  diplomaticIntervention: {
    id: "diplomaticIntervention",
    cost: 0,
    tags: EXTRA,
    titleKey: "card.diplomaticIntervention.name",
    backgroundKey: "card.diplomaticIntervention.background",
    descriptionKey: "card.diplomaticIntervention.desc",
    effects: [],
  },
  fiscalBurden: {
    id: "fiscalBurden",
    cost: 2,
    tags: [],
    titleKey: "card.fiscalBurden.name",
    backgroundKey: "card.fiscalBurden.background",
    descriptionKey: "card.fiscalBurden.desc",
    effects: [],
  },
  antiFrenchContainment: {
    id: "antiFrenchContainment",
    cost: 2,
    tags: [],
    titleKey: "card.antiFrenchContainment.name",
    backgroundKey: "card.antiFrenchContainment.background",
    descriptionKey: "card.antiFrenchContainment.desc",
    effects: [],
  },
  reform: {
    id: "reform",
    cost: 2,
    tags: INFLATION,
    titleKey: "card.reform.name",
    backgroundKey: "card.reform.background",
    descriptionKey: "card.reform.desc",
    effects: [
      { kind: "modResource", resource: "power", delta: 1 },
      { kind: "drawCards", count: 1 },
    ],
  },
  ceremony: {
    id: "ceremony",
    cost: 2,
    tags: INFLATION,
    titleKey: "card.ceremony.name",
    backgroundKey: "card.ceremony.background",
    descriptionKey: "card.ceremony.desc",
    effects: [{ kind: "modResource", resource: "legitimacy", delta: 1 }],
  },
  development: {
    id: "development",
    cost: 3,
    tags: INFLATION,
    titleKey: "card.development.name",
    backgroundKey: "card.development.background",
    descriptionKey: "card.development.desc",
    effects: [{ kind: "modResource", resource: "treasuryStat", delta: 1 }],
  },
  grainRelief: {
    id: "grainRelief",
    cost: 3,
    tags: INFLATION,
    titleKey: "card.grainRelief.name",
    backgroundKey: "card.grainRelief.background",
    descriptionKey: "card.grainRelief.desc",
    effects: [
      { kind: "addPlayerStatus", templateId: "grainReliefDrawBoost", turns: 1 },
      { kind: "addPlayerStatus", templateId: "grainReliefLegitimacyBoost", turns: 1 },
    ],
  },
  taxRebalance: {
    id: "taxRebalance",
    cost: 2,
    tags: INFLATION,
    titleKey: "card.taxRebalance.name",
    backgroundKey: "card.taxRebalance.background",
    descriptionKey: "card.taxRebalance.desc",
    effects: [
      { kind: "modResource", resource: "treasuryStat", delta: 1 },
      { kind: "addPlayerStatus", templateId: "drawPenalty", turns: 2 },
    ],
  },
  diplomaticCongress: {
    id: "diplomaticCongress",
    cost: 3,
    tags: [],
    titleKey: "card.diplomaticCongress.name",
    backgroundKey: "card.diplomaticCongress.background",
    descriptionKey: "card.diplomaticCongress.desc",
    effects: [{ kind: "modResource", resource: "power", delta: 1 }],
  },
  suppressHuguenots: {
    id: "suppressHuguenots",
    cost: 3,
    tags: EXTRA,
    titleKey: "card.suppressHuguenots.name",
    backgroundKey: "card.suppressHuguenots.background",
    descriptionKey: "card.suppressHuguenots.desc",
    effects: [],
  },
  religiousTensionCard: {
    id: "religiousTensionCard",
    cost: 2,
    tags: EXTRA,
    titleKey: "card.religiousTensionCard.name",
    backgroundKey: "card.religiousTensionCard.background",
    descriptionKey: "card.religiousTensionCard.desc",
    effects: [],
  },
  jesuitCollege: {
    id: "jesuitCollege",
    cost: 2,
    tags: EXTRA,
    titleKey: "card.jesuitCollege.name",
    backgroundKey: "card.jesuitCollege.background",
    descriptionKey: "card.jesuitCollege.desc",
    effects: [{ kind: "modResource", resource: "legitimacy", delta: 1 }],
  },
};

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  return templates[id];
}

/** Starter deck order is per-level; see `levelContent.ts` (`starterDeckTemplateOrder`). */

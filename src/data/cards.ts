import type { CardTemplate, CardTemplateId } from "../types/card";

const templates: Record<CardTemplateId, CardTemplate> = {
  funding: {
    id: "funding",
    cost: 0,
    titleKey: "card.funding.name",
    backgroundKey: "card.funding.background",
    descriptionKey: "card.funding.desc",
    effects: [{ kind: "gainFunding", amount: 1 }],
  },
  crackdown: {
    id: "crackdown",
    cost: 1,
    titleKey: "card.crackdown.name",
    backgroundKey: "card.crackdown.background",
    descriptionKey: "card.crackdown.desc",
    effects: [],
  },
  reform: {
    id: "reform",
    cost: 2,
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
    titleKey: "card.ceremony.name",
    backgroundKey: "card.ceremony.background",
    descriptionKey: "card.ceremony.desc",
    effects: [{ kind: "modResource", resource: "legitimacy", delta: 1 }],
  },
  development: {
    id: "development",
    cost: 3,
    titleKey: "card.development.name",
    backgroundKey: "card.development.background",
    descriptionKey: "card.development.desc",
    effects: [{ kind: "modResource", resource: "treasuryStat", delta: 1 }],
  },
};

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  return templates[id];
}

export const starterDeckTemplateOrder: CardTemplateId[] = [
  "funding",
  "funding",
  "funding",
  "funding",
  "crackdown",
  "crackdown",
  "crackdown",
  "reform",
  "reform",
  "ceremony",
  "ceremony",
  "development",
  "development",
];

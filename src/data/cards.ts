import type { CardTemplate, CardTemplateId } from "../types/card";

const templates: Record<CardTemplateId, CardTemplate> = {
  funding: {
    id: "funding",
    cost: 0,
    titleKey: "card.funding.name",
    descriptionKey: "card.funding.desc",
    effects: [{ kind: "gainFunding", amount: 1 }],
  },
  crackdown: {
    id: "crackdown",
    cost: 1,
    titleKey: "card.crackdown.name",
    descriptionKey: "card.crackdown.desc",
    effects: [],
  },
  reform: {
    id: "reform",
    cost: 2,
    titleKey: "card.reform.name",
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
    descriptionKey: "card.ceremony.desc",
    effects: [{ kind: "modResource", resource: "legitimacy", delta: 1 }],
  },
};

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  return templates[id];
}

export const starterDeckTemplateOrder: CardTemplateId[] = [
  "funding",
  "funding",
  "funding",
  "crackdown",
  "crackdown",
  "crackdown",
  "reform",
  "reform",
  "reform",
  "ceremony",
  "ceremony",
  "ceremony",
];

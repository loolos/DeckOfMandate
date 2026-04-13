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
  grainRelief: {
    id: "grainRelief",
    cost: 2,
    titleKey: "card.grainRelief.name",
    backgroundKey: "card.grainRelief.background",
    descriptionKey: "card.grainRelief.desc",
    effects: [{ kind: "modResource", resource: "legitimacy", delta: 1 }],
  },
  taxRebalance: {
    id: "taxRebalance",
    cost: 2,
    titleKey: "card.taxRebalance.name",
    backgroundKey: "card.taxRebalance.background",
    descriptionKey: "card.taxRebalance.desc",
    effects: [{ kind: "gainFunding", amount: 1 }],
  },
  diplomaticCongress: {
    id: "diplomaticCongress",
    cost: 2,
    titleKey: "card.diplomaticCongress.name",
    backgroundKey: "card.diplomaticCongress.background",
    descriptionKey: "card.diplomaticCongress.desc",
    effects: [{ kind: "scheduleNextTurnDrawModifier", delta: 1 }],
  },
  patronageOffice: {
    id: "patronageOffice",
    cost: 1,
    titleKey: "card.patronageOffice.name",
    backgroundKey: "card.patronageOffice.background",
    descriptionKey: "card.patronageOffice.desc",
    effects: [{ kind: "modResource", resource: "power", delta: 1 }],
  },
  warBond: {
    id: "warBond",
    cost: 0,
    titleKey: "card.warBond.name",
    backgroundKey: "card.warBond.background",
    descriptionKey: "card.warBond.desc",
    effects: [
      { kind: "gainFunding", amount: 2 },
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
    ],
  },
};

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  return templates[id];
}

/** Starter deck order is per-level; see `levelContent.ts` (`starterDeckTemplateOrder`). */

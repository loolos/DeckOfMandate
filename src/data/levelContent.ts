import type { LevelId } from "./levels";
import type { CardTemplateId } from "../types/card";
import type { EventTemplateId, SlotId } from "../types/event";

/** When `pendingMajorCrisis[slot]` is true and the slot still holds `from`, replace with `to` at Event phase start. */
export type SlotEscalation = {
  from: EventTemplateId;
  to: EventTemplateId;
};

export type ScriptedCalendarAttackConfig = {
  fundingCost: number;
  powerDelta: number;
  extraTreasuryProbability: number;
  extraTreasuryDelta: number;
};

export type ScriptedCalendarAntiCoalitionConfig = {
  drawPenaltyProbability: number;
  drawPenaltyDelta: number;
  /** Years after the attack turn during which each beginYear may roll the draw penalty; `null` = through last turn. */
  activeYearsAfterAttack: number | null;
};

/**
 * Calendar-driven event row: injected on `presenceStartYear` only; stays until solved or `presenceEndYear` passes.
 */
export type ScriptedCalendarEventConfig = {
  templateId: EventTemplateId;
  presenceStartYear: number;
  presenceEndYear: number;
  /** If every slot is full, place (replace) this slot. */
  overflowSlot?: SlotId;
  /** Only needed when the event template uses `solve.kind === "scriptedAttack"`. */
  attack?: ScriptedCalendarAttackConfig;
  antiCoalition?: ScriptedCalendarAntiCoalitionConfig;
  /** Optional branch gate for chapter transitions. */
  requiresWarOfDevolutionAttacked?: boolean;
};

/**
 * Per-level playable content: deck composition, event roll pool, and escalation rules.
 * Event/card *templates* (stats, locale keys) stay in `events.ts` / `cards.ts` until a level needs overrides.
 */
export type LevelContent = {
  starterDeckTemplateOrder: readonly CardTemplateId[];
  rollableEventIds: readonly EventTemplateId[];
  slotEscalations: readonly SlotEscalation[];
  /**
   * Harmful events that, when unresolved at year-end, only arm `pendingMajorCrisis` for that slot
   * (no immediate `penaltiesIfUnresolved` application in that pass).
   */
  eoyEscalationSchedulers: readonly EventTemplateId[];
  /** Scripted rows (not weighted); see `logic/scriptedCalendar.ts`. */
  scriptedCalendarEvents: readonly ScriptedCalendarEventConfig[];
};

export const levelContentByLevelId = {
  firstMandate: {
    starterDeckTemplateOrder: [
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
    ],
    rollableEventIds: [
      "budgetStrain",
      "publicUnrest",
      "administrativeDelay",
      "tradeOpportunity",
      "politicalGridlock",
      "powerVacuum",
    ],
    slotEscalations: [{ from: "powerVacuum", to: "majorCrisis" }],
    eoyEscalationSchedulers: ["powerVacuum"],
    scriptedCalendarEvents: [
      {
        templateId: "warOfDevolution",
        presenceStartYear: 1667,
        presenceEndYear: 1669,
        overflowSlot: "C",
        attack: {
          fundingCost: 2,
          powerDelta: 1,
          extraTreasuryProbability: 0.5,
          extraTreasuryDelta: 1,
        },
        antiCoalition: {
          drawPenaltyProbability: 0.4,
          drawPenaltyDelta: -1,
          activeYearsAfterAttack: 5,
        },
      },
    ],
  },
  secondMandate: {
    starterDeckTemplateOrder: [
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
      "grainRelief",
      "taxRebalance",
      "diplomaticCongress",
    ],
    rollableEventIds: [
      "versaillesExpenditure",
      "nobleResentment",
      "provincialNoncompliance",
      "risingGrainPrices",
      "taxResistance",
      "courtScandal",
      "militaryPrestige",
      "commercialExpansion",
      "talentedAdministrator",
      "warWeariness",
    ],
    slotEscalations: [],
    eoyEscalationSchedulers: [],
    scriptedCalendarEvents: [
      {
        templateId: "expansionRemembered",
        presenceStartYear: 1676,
        presenceEndYear: 1677,
        overflowSlot: "D",
        requiresWarOfDevolutionAttacked: true,
      },
      {
        templateId: "cautiousCrown",
        presenceStartYear: 1676,
        presenceEndYear: 1677,
        overflowSlot: "D",
        requiresWarOfDevolutionAttacked: false,
      },
      {
        templateId: "nymwegenSettlement",
        presenceStartYear: 1678,
        presenceEndYear: 1682,
        overflowSlot: "D",
      },
      {
        templateId: "revocationNantes",
        presenceStartYear: 1685,
        presenceEndYear: 1688,
        overflowSlot: "D",
      },
      {
        templateId: "grainReliefCrisis",
        presenceStartYear: 1686,
        presenceEndYear: 1694,
        overflowSlot: "F",
      },
      {
        templateId: "leagueOfAugsburg",
        presenceStartYear: 1686,
        presenceEndYear: 1690,
        overflowSlot: "E",
      },
      {
        templateId: "nineYearsWar",
        presenceStartYear: 1689,
        presenceEndYear: 1697,
        overflowSlot: "E",
      },
      {
        templateId: "ryswickPeace",
        presenceStartYear: 1697,
        presenceEndYear: 1700,
        overflowSlot: "F",
      },
    ],
  },
} as const satisfies Record<LevelId, LevelContent>;

export function getLevelContent(id: LevelId): LevelContent {
  return levelContentByLevelId[id];
}

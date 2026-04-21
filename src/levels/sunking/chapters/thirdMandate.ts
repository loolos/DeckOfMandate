import type { LevelContent, LevelDef } from "../../../data/levelTypes";
import type { CardTemplateId } from "../../types/card";

/** Opening hand templates (6) — not part of the shuffled deck. */
export const LEVEL3_STARTING_HAND_TEMPLATE_ORDER: readonly CardTemplateId[] = [
  "bourbonMarriageProclamation",
  "bourbonMarriageProclamation",
  "grandAllianceInfiltrationDiplomacy",
  "grandAllianceInfiltrationDiplomacy",
  "italianTheaterTroopRedeploy",
  "italianTheaterTroopRedeploy",
];

/** Same core deck as chapter 2 (16 cards); six chapter-3 cards start in hand. */
const LEVEL3_DECK_TEMPLATE_ORDER: readonly CardTemplateId[] = [
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
  "grainRelief",
  "taxRebalance",
  "taxRebalance",
  "diplomaticCongress",
];

export const levelDef: LevelDef = {
  id: "thirdMandate",
  supportedLocales: ["en", "fr", "zh"],
  nameKey: "level.successionWar.name",
  introTitleKey: "level.successionWar.introTitle",
  introBodyKey: "level.successionWar.introBody",
  ending: {
    victoryBodyKey: "level.successionWar.ending.victory",
    victoryWarDevolutionExtraKey: "level.successionWar.ending.victoryWarDevolutionExtra",
    defeatBodyKey: "level.successionWar.ending.defeat",
  },
  calendarStartYear: 1701,
  yearsPerTurn: 1,
  startingResources: {
    treasuryStat: 12,
    funding: 0,
    power: 8,
    legitimacy: 10,
  },
  winTargets: {
    treasuryStat: 10,
    power: 10,
    legitimacy: 10,
  },
  turnLimitRule: { kind: "calendarEnd", endYear: 1721 },
  victoryRule: { kind: "successionWar", calendarEndExclusiveYear: 1721 },
  features: {
    europeAlertMechanics: false,
    inflation: { kind: "pressureThreshold", threshold: 12 },
  },
  bootstrap: "chapter3Standalone",
  menuBriefKey: "menu.levelBrief.thirdMandate",
  targetsUiKey: "ui.targets.thirdMandate",
  turnBannerKey: "banner.turn.sunKingAnnual",
  timeStepHintKey: "levelTime.sunKing.oneTurnOneYear",
};

export const levelContent: LevelContent = {
  starterDeckTemplateOrder: LEVEL3_DECK_TEMPLATE_ORDER,
  rollableEventIds: [
    "versaillesExpenditure",
    "provincialNoncompliance",
    "risingGrainPrices",
    "taxResistance",
    "militaryPrestige",
    "commercialExpansion",
    "warWeariness",
    "jesuitPatronage",
    "bavarianCourtRealignment",
    "portugueseTariffNegotiation",
    "imperialElectorsMood",
  ],
  slotEscalations: [],
  eoyEscalationSchedulers: [],
  scriptedCalendarEvents: [
    {
      templateId: "successionCrisis",
      presenceStartYear: 1701,
      presenceEndYear: 1701,
      overflowSlot: "D",
    },
    {
      templateId: "utrechtTreaty",
      presenceStartYear: 1713,
      presenceEndYear: 1720,
      overflowSlot: "E",
    },
  ],
  opening: {
    turnOnePrefix: [],
    standaloneCarryoverIdPrefix: "standalone_old_",
  },
  procedural: {
    firstTurnEmptyBoardCount: 2,
  },
};

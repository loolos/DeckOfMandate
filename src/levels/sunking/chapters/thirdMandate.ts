import type { LevelContent, LevelDef } from "../../../data/levelTypes";
import type { CardTemplateId } from "../../types/card";

/** Eight chapter-3-only templates shuffled into the full library with the rest; opening deal is two cards. */
const CHAPTER3_REFIT_STARTING_HAND_ORDER: readonly CardTemplateId[] = [
  "bourbonMarriageProclamation",
  "bourbonMarriageProclamation",
  "grandAllianceInfiltrationDiplomacy",
  "grandAllianceInfiltrationDiplomacy",
  "italianTheaterTroopRedeploy",
  "italianTheaterTroopRedeploy",
  "usurpationEdict",
  "usurpationEdict",
];

/** Same core deck as chapter 2 (16 cards); eight chapter-3 templates are part of the shuffled pool. */
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
    victoryBodyByTierKeys: {
      bourbon: "level.successionWar.ending.victoryByTier.bourbon",
      compromise: "level.successionWar.ending.victoryByTier.compromise",
      habsburg: "level.successionWar.ending.victoryByTier.habsburg",
    },
    victoryWarDevolutionExtraKey: "level.successionWar.ending.victoryWarDevolutionExtra",
    defeatBodyKey: "level.successionWar.ending.defeat",
    victorySuccessionTrackCapBodyKey: "level.successionWar.ending.victorySuccessionTrackCap",
    defeatSuccessionTrackFloorBodyKey: "level.successionWar.ending.defeatSuccessionTrackFloor",
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
    "commercialExpansion",
    "warWeariness",
    "jesuitPatronage",
    "bavarianCourtRealignment",
    "portugueseTariffNegotiation",
    "imperialElectorsMood",
    "localizedSuccessionWar",
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
    {
      templateId: "dualFrontCrisis",
      presenceStartYear: 1708,
      presenceEndYear: 1708,
      overflowSlot: "F",
    },
    {
      templateId: "louisXivLegacy1715",
      presenceStartYear: 1715,
      presenceEndYear: 1715,
      overflowSlot: "G",
    },
  ],
  opening: {
    turnOnePrefix: [],
    standaloneCarryoverIdPrefix: "standalone_old_",
  },
  procedural: {
    firstTurnEmptyBoardCount: 2,
  },
  chapter3RefitStartingHandOrder: CHAPTER3_REFIT_STARTING_HAND_ORDER,
  opponentBoardEventTemplateId: "opponentHabsburg",
};

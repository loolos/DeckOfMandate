import type { LevelContent, LevelDef } from "../../../data/levelTypes";
import { createStandaloneLevel2Draft } from "../chapter2Transition";

export const levelDef: LevelDef = {
  id: "secondMandate",
  supportedLocales: ["en", "fr", "zh"],
  nameKey: "level.gloryUnderStrain.name",
  introTitleKey: "level.gloryUnderStrain.introTitle",
  introBodyKey: "level.gloryUnderStrain.introBody",
  ending: {
    victoryBodyKey: "level.gloryUnderStrain.ending.victory",
    victoryWarDevolutionExtraKey: "level.gloryUnderStrain.ending.victoryWarDevolutionExtra",
    defeatBodyKey: "level.gloryUnderStrain.ending.defeat",
  },
  calendarStartYear: 1676,
  yearsPerTurn: 1,
  startingResources: {
    treasuryStat: 3,
    funding: 0,
    power: 3,
    legitimacy: 3,
  },
  standaloneStartingResources: {
    treasuryStat: 7,
    funding: 0,
    power: 7,
    legitimacy: 5,
  },
  winTargets: {
    treasuryStat: 10,
    power: 8,
    legitimacy: 10,
  },
  turnLimitRule: { kind: "calendarEnd", endYear: 1701 },
  victoryRule: {
    kind: "gated",
    earliestCalendarYear: 1696,
    minLegitimacy: 6,
  },
  features: {
    europeAlertMechanics: true,
    inflation: { kind: "always" },
  },
  bootstrap: "chapter2Standalone",
  postVictoryContinuity: {
    continueLabelKey: "menu.continueChapter3",
    draftKind: "level3FromPrior",
  },
  menuBriefKey: "menu.levelBrief.secondMandate",
  targetsUiKey: "ui.targets.secondMandate",
  turnBannerKey: "banner.turn.sunKingAnnual",
  timeStepHintKey: "levelTime.sunKing.oneTurnOneYear",
};

export const levelContent: LevelContent = {
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
    "grainRelief",
    "taxRebalance",
    "taxRebalance",
    "diplomaticCongress",
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
    "jesuitPatronage",
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
  opening: {
    turnOnePrefix: [],
    standaloneTurnOnePrefix: ["versaillesExpenditure", "taxResistance"],
    standaloneCarryoverIdPrefix: "standalone_old_",
  },
  procedural: {
    firstTurnStandaloneEmptyBoardMin: 3,
  },
};

export const chapter2StandaloneFactory = createStandaloneLevel2Draft;

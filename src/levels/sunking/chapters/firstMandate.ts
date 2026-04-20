import type { LevelContent, LevelDef } from "../../../data/levelTypes";

export const levelDef: LevelDef = {
  id: "firstMandate",
  supportedLocales: ["en", "fr", "zh"],
  nameKey: "level.risingSun.name",
  introTitleKey: "level.risingSun.introTitle",
  introBodyKey: "level.risingSun.introBody",
  ending: {
    victoryBodyKey: "level.risingSun.ending.victory",
    victoryWarDevolutionExtraKey: "level.risingSun.ending.victoryWarDevolutionExtra",
    defeatBodyKey: "level.risingSun.ending.defeat",
  },
  calendarStartYear: 1661,
  yearsPerTurn: 1,
  startingResources: {
    treasuryStat: 2,
    funding: 0,
    power: 2,
    legitimacy: 2,
  },
  standaloneStartingResources: {
    treasuryStat: 2,
    funding: 0,
    power: 2,
    legitimacy: 2,
  },
  winTargets: {
    treasuryStat: 6,
    power: 6,
    legitimacy: 5,
  },
  turnLimitRule: { kind: "fixed", turnLimit: 15 },
  victoryRule: { kind: "resourceTargets" },
  features: {
    europeAlertMechanics: false,
    inflation: { kind: "pressureThreshold", threshold: 12 },
    inflationActivationLogKey: "firstMandateInflationActivated",
  },
  bootstrap: "initial",
  menuBriefKey: "menu.levelBrief.firstMandate",
  targetsUiKey: "ui.targets.firstMandate",
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
  opening: {
    turnOnePrefix: ["tradeOpportunity", "administrativeDelay"],
    standaloneCarryoverIdPrefix: "standalone_old_",
  },
  procedural: {
    firstTurnEmptyBoardCount: 2,
  },
};

/** Start-menu default for this campaign (one chapter may set this). */
export const registerAsDefaultLevel = true;

import type { LevelContent, LevelDef } from "../../../data/levelTypes";

/** War of the Spanish Succession era (placeholder content; Nantes carryover is wired in `initialState`). */
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
  turnLimitRule: { kind: "fixed", turnLimit: 20 },
  victoryRule: { kind: "resourceTargets" },
  features: {
    europeAlertMechanics: false,
    inflation: { kind: "pressureThreshold", threshold: 12 },
  },
  bootstrap: "initial",
  menuBriefKey: "menu.levelBrief.thirdMandate",
  targetsUiKey: "ui.targets.thirdMandate",
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
  scriptedCalendarEvents: [],
  opening: {
    turnOnePrefix: ["tradeOpportunity", "administrativeDelay"],
    standaloneCarryoverIdPrefix: "standalone_old_",
  },
  procedural: {
    firstTurnEmptyBoardCount: 2,
  },
};

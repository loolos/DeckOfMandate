/** Locale keys for the end-of-run narrative (shown in the game-over modal). */
export type LevelEndingCopyKeys = {
  victoryBodyKey: string;
  /** Shown after victory body if the player launched the War of Devolution scripted attack. */
  victoryWarDevolutionExtraKey: string;
  defeatBodyKey: string;
};

const firstMandate = {
  id: "firstMandate",
  nameKey: "level.risingSun.name",
  introTitleKey: "level.risingSun.introTitle",
  introBodyKey: "level.risingSun.introBody",
  ending: {
    victoryBodyKey: "level.risingSun.ending.victory",
    victoryWarDevolutionExtraKey: "level.risingSun.ending.victoryWarDevolutionExtra",
    defeatBodyKey: "level.risingSun.ending.defeat",
  } satisfies LevelEndingCopyKeys,
  turnLimit: 15,
  calendarStartYear: 1661,
  yearsPerTurn: 1,
  startingResources: {
    treasuryStat: 2,
    funding: 0,
    power: 2,
    legitimacy: 2,
  },
  winTargets: {
    treasuryStat: 4,
    power: 4,
    legitimacy: 5,
  },
} as const;

const secondMandate = {
  id: "secondMandate",
  nameKey: "level.gloryUnderStrain.name",
  introTitleKey: "level.gloryUnderStrain.introTitle",
  introBodyKey: "level.gloryUnderStrain.introBody",
  ending: {
    victoryBodyKey: "level.gloryUnderStrain.ending.victory",
    victoryWarDevolutionExtraKey: "level.gloryUnderStrain.ending.victoryWarDevolutionExtra",
    defeatBodyKey: "level.gloryUnderStrain.ending.defeat",
  } satisfies LevelEndingCopyKeys,
  turnLimit: 25,
  calendarStartYear: 1676,
  yearsPerTurn: 1,
  startingResources: {
    treasuryStat: 3,
    funding: 0,
    power: 3,
    legitimacy: 3,
  },
  winTargets: {
    treasuryStat: 10,
    power: 8,
    legitimacy: 10,
  },
} as const;

export const levelDefs = {
  firstMandate,
  secondMandate,
} as const;

export type LevelId = keyof typeof levelDefs;

export const defaultLevelId: LevelId = "firstMandate";

export function getLevelDef(id: LevelId) {
  return levelDefs[id];
}

export function isLevelId(x: unknown): x is LevelId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(levelDefs, x);
}

/** First playable level; same as `getLevelDef("firstMandate")`. */
export const levelFirstMandate = levelDefs.firstMandate;

const firstMandate = {
  id: "firstMandate",
  nameKey: "app.subtitle",
  turnLimit: 15,
  calendarStartYear: 1518,
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

export const levelDefs = {
  firstMandate,
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

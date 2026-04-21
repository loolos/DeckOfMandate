import type { LevelContent, LevelDef } from "./levelTypes";

/** Runtime level identifier (campaign-defined string). */
export type LevelId = string;

const levelDefsById: Record<string, LevelDef> = {};
const levelContentById: Record<string, LevelContent> = {};

/** Registration order — first registered is default menu level unless overridden. */
const registrationOrder: string[] = [];

let defaultLevelIdOverride: LevelId | null = null;

export function registerLevel(def: LevelDef, content: LevelContent): void {
  if (levelDefsById[def.id]) {
    throw new Error(`levelRegistry: duplicate level id ${def.id}`);
  }
  levelDefsById[def.id] = def;
  levelContentById[def.id] = content;
  registrationOrder.push(def.id);
}

export function setDefaultLevelId(id: LevelId): void {
  defaultLevelIdOverride = id;
}

export function getRegisteredLevelIds(): readonly LevelId[] {
  return [...registrationOrder];
}

export function getLevelDef(id: LevelId): LevelDef {
  const def = levelDefsById[id];
  if (!def) throw new Error(`levelRegistry: unknown level ${id}`);
  return def;
}

export function tryGetLevelDef(id: LevelId): LevelDef | undefined {
  return levelDefsById[id];
}

export function getLevelContent(id: LevelId): LevelContent {
  const c = levelContentById[id];
  if (!c) throw new Error(`levelRegistry: unknown level content ${id}`);
  return c;
}

export function getDefaultLevelId(): LevelId {
  if (defaultLevelIdOverride && levelDefsById[defaultLevelIdOverride]) {
    return defaultLevelIdOverride;
  }
  const first = registrationOrder[0];
  if (!first) throw new Error("levelRegistry: no levels registered");
  return first;
}

export function isLevelId(x: unknown): x is LevelId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(levelDefsById, x);
}

export function getTurnLimitForRun(levelId: LevelId, calendarStartYear: number): number {
  const def = getLevelDef(levelId);
  const rule = def.turnLimitRule;
  if (rule.kind === "calendarEnd") {
    const span = rule.endYear - calendarStartYear;
    const ypt = def.yearsPerTurn;
    return Math.max(1, Math.ceil(span / ypt));
  }
  return rule.turnLimit;
}

import type { Level2StartDraft, Level3StartDraft } from "../types/continuity";

const chapter2StandaloneFactories: Record<string, (seed?: number) => Level2StartDraft> = {};
const chapter3StandaloneFactories: Record<string, (seed?: number) => Level3StartDraft> = {};

export function registerChapter2StandaloneFactory(levelId: string, fn: (seed?: number) => Level2StartDraft): void {
  chapter2StandaloneFactories[levelId] = fn;
}

export function getChapter2StandaloneDraft(levelId: string, seed?: number): Level2StartDraft | undefined {
  const fn = chapter2StandaloneFactories[levelId];
  return fn?.(seed);
}

export function registerChapter3StandaloneFactory(levelId: string, fn: (seed?: number) => Level3StartDraft): void {
  chapter3StandaloneFactories[levelId] = fn;
}

export function getChapter3StandaloneDraft(levelId: string, seed?: number): Level3StartDraft | undefined {
  const fn = chapter3StandaloneFactories[levelId];
  return fn?.(seed);
}

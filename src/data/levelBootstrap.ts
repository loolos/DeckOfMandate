import type { Level2StartDraft } from "../types/continuity";

const chapter2StandaloneFactories: Record<string, (seed?: number) => Level2StartDraft> = {};

export function registerChapter2StandaloneFactory(levelId: string, fn: (seed?: number) => Level2StartDraft): void {
  chapter2StandaloneFactories[levelId] = fn;
}

export function getChapter2StandaloneDraft(levelId: string, seed?: number): Level2StartDraft | undefined {
  const fn = chapter2StandaloneFactories[levelId];
  return fn?.(seed);
}

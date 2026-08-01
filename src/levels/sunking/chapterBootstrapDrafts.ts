/**
 * Pack-internal registry of standalone chapter drafts, keyed by level id.
 *
 * The framework's bootstrap registry stores *built states*; run-code replay needs the
 * draft itself so it can re-apply the player's recorded card removals before building.
 * Populated from `registerCampaign.ts` alongside the framework registration.
 */
import type { Level2StartDraft, Level3StartDraft } from "./types/continuity";

const chapter2DraftFactories: Record<string, (seed?: number) => Level2StartDraft> = {};
const chapter3DraftFactories: Record<string, (seed?: number) => Level3StartDraft> = {};

export function registerChapter2StandaloneDraftFactory(
  levelId: string,
  fn: (seed?: number) => Level2StartDraft,
): void {
  chapter2DraftFactories[levelId] = fn;
}

export function registerChapter3StandaloneDraftFactory(
  levelId: string,
  fn: (seed?: number) => Level3StartDraft,
): void {
  chapter3DraftFactories[levelId] = fn;
}

export function getChapter2StandaloneDraft(levelId: string, seed?: number): Level2StartDraft | undefined {
  return chapter2DraftFactories[levelId]?.(seed);
}

export function getChapter3StandaloneDraft(levelId: string, seed?: number): Level3StartDraft | undefined {
  return chapter3DraftFactories[levelId]?.(seed);
}

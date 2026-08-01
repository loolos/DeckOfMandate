/**
 * Campaign-provided UI extension points. Campaign packs register their renderers from
 * `registerCampaign.ts` (module load, before first render); framework components consult
 * the registry and render nothing campaign-specific on their own.
 */
import type { ComponentType, CSSProperties, ReactNode, Ref } from "react";
import type { GameAction } from "../app/gameReducer";
import type { ContinuitySnapshot } from "../logic/runCode";
import type { ActionLogEntry, GameState, Resources } from "../types/game";
import type { MessageKey } from "../locales";

export type UiTranslator = (key: MessageKey, vars?: Record<string, string | number>) => string;

/** Renders one action-log entry's content (the framework owns the surrounding row/scroll chrome). */
export type CampaignLogEntryRenderer = (entry: ActionLogEntry, t: UiTranslator) => ReactNode;

let logEntryRenderer: CampaignLogEntryRenderer | null = null;

export function registerCampaignLogEntryRenderer(fn: CampaignLogEntryRenderer | null): void {
  logEntryRenderer = fn;
}

export function renderCampaignLogEntry(entry: ActionLogEntry, t: UiTranslator): ReactNode {
  return logEntryRenderer ? logEntryRenderer(entry, t) : null;
}

/** One display row in the status bar; entirely derived by the campaign pack. */
export type CampaignStatusRow = {
  id: string;
  title: string;
  compactMeta: string;
  meta: string;
  detail?: string;
  hideMetaWhenExpandedOnMobile?: boolean;
  /** Optional inline progress bar (e.g. pressure tracks); class names come from the campaign. */
  progress?: { pct: number; trackClassName: string; fillClassName: string };
};

export type CampaignStatusRowsBuilder = (state: GameState, t: UiTranslator) => CampaignStatusRow[];

let statusRowsBuilder: CampaignStatusRowsBuilder | null = null;

export function registerCampaignStatusRowsBuilder(fn: CampaignStatusRowsBuilder | null): void {
  statusRowsBuilder = fn;
}

export function buildCampaignStatusRows(state: GameState, t: UiTranslator): CampaignStatusRow[] {
  return statusRowsBuilder ? statusRowsBuilder(state, t) : [];
}

/** Campaign-provided components: resource system UI and the event interaction panel. */
export type CampaignUiComponents = {
  ResourceBar: ComponentType<{ resources: Resources }>;
  ResourceTooltipText: ComponentType<{ text: string; resources?: Resources }>;
  ResourceTooltipIcon: ComponentType<{
    resource: keyof Resources & string;
    resources?: Resources;
    className?: string;
  }>;
  EventPanel: ComponentType<{
    state: GameState;
    dispatch: (a: GameAction) => void;
    scrollContainerRef?: Ref<HTMLDivElement>;
  }>;
  Hand: ComponentType<{
    state: GameState;
    dispatch: (a: GameAction) => void;
    scrollContainerRef?: Ref<HTMLDivElement>;
  }>;
};

/**
 * Pre-run screens: levels whose `bootstrap` is not `"initial"` hand control to the campaign
 * before the run starts (chapter refit, draft picks, …), and a finished run may offer a
 * campaign continuation from the game-over modal. The shell only routes; the screen is the
 * campaign's own component and owns its editing state.
 */
export type CampaignPreRunRequest =
  /** Starting this level directly from the menu; the campaign builds the opening state. */
  | { kind: "standaloneStart"; levelId: string; seed: number | undefined }
  /** Continuing from a finished run (post-victory CTA). */
  | { kind: "continueFromRun"; state: GameState };

export type CampaignPreRunConfirm = {
  /** Fully built opening state for the new run. */
  state: GameState;
  /** Indices removed from the campaign's carryover list; recorded in the run code. */
  removedIndices: readonly number[];
  /** Set when this run continues an earlier chapter; null for a standalone start. */
  continuitySnapshot: ContinuitySnapshot | null;
};

export type CampaignPreRunScreenProps = {
  request: CampaignPreRunRequest;
  onConfirm: (result: CampaignPreRunConfirm) => void;
  onCancel: () => void;
};

let preRunScreen: ComponentType<CampaignPreRunScreenProps> | null = null;

export function registerCampaignPreRunScreen(component: ComponentType<CampaignPreRunScreenProps> | null): void {
  preRunScreen = component;
}

export function getCampaignPreRunScreen(): ComponentType<CampaignPreRunScreenProps> | null {
  return preRunScreen;
}

/** Post-run continuation offer (e.g. "carry this deck into the next chapter"). */
export type CampaignRunContinuation = { continueLabelKey: string };

let runContinuationResolver: ((state: GameState) => CampaignRunContinuation | null) | null = null;

export function registerCampaignRunContinuationResolver(
  fn: ((state: GameState) => CampaignRunContinuation | null) | null,
): void {
  runContinuationResolver = fn;
}

export function getCampaignRunContinuation(state: GameState): CampaignRunContinuation | null {
  return runContinuationResolver?.(state) ?? null;
}

/**
 * End-of-run narrative for the game-over modal, fully composed by the campaign:
 * a headline plus already-translated body paragraphs.
 */
export type CampaignOutcomeCopy = {
  headline: string;
  paragraphs: readonly string[];
};

export type CampaignOutcomeCopyBuilder = (state: GameState, t: UiTranslator) => CampaignOutcomeCopy;

let outcomeCopyBuilder: CampaignOutcomeCopyBuilder | null = null;

export function registerCampaignOutcomeCopyBuilder(fn: CampaignOutcomeCopyBuilder | null): void {
  outcomeCopyBuilder = fn;
}

export function buildCampaignOutcomeCopy(state: GameState, t: UiTranslator): CampaignOutcomeCopy | null {
  return outcomeCopyBuilder ? outcomeCopyBuilder(state, t) : null;
}

/** Label above the end-of-turn retention picker explaining what sets the keep cap. */
export type CampaignRetentionCapLabelBuilder = (state: GameState, cap: number, t: UiTranslator) => string;

let retentionCapLabelBuilder: CampaignRetentionCapLabelBuilder | null = null;

export function registerCampaignRetentionCapLabelBuilder(fn: CampaignRetentionCapLabelBuilder | null): void {
  retentionCapLabelBuilder = fn;
}

export function buildCampaignRetentionCapLabel(state: GameState, cap: number, t: UiTranslator): string {
  return retentionCapLabelBuilder ? retentionCapLabelBuilder(state, cap, t) : String(cap);
}

/** In-run goals line shown above the board; the campaign owns what "goals" means. */
export type CampaignTargetsLineBuilder = (
  state: GameState,
  turnLimit: number,
  t: UiTranslator,
) => string | null;

let targetsLineBuilder: CampaignTargetsLineBuilder | null = null;

export function registerCampaignTargetsLineBuilder(fn: CampaignTargetsLineBuilder | null): void {
  targetsLineBuilder = fn;
}

export function buildCampaignTargetsLine(
  state: GameState,
  turnLimit: number,
  t: UiTranslator,
): string | null {
  return targetsLineBuilder ? targetsLineBuilder(state, turnLimit, t) : null;
}

/**
 * Per-level shell theming owned by the campaign: backdrop art plus whether the shell and its
 * modals use the translucent "glass" treatment. Levels with no registered theme render plain.
 */
export type CampaignLevelTheme = {
  backdropStyle?: CSSProperties;
  glass?: boolean;
};

let levelThemeResolver: ((levelId: string) => CampaignLevelTheme | null) | null = null;

export function registerCampaignLevelThemeResolver(fn: ((levelId: string) => CampaignLevelTheme | null) | null): void {
  levelThemeResolver = fn;
}

export function getCampaignLevelTheme(levelId: string | undefined): CampaignLevelTheme | null {
  if (!levelId) return null;
  return levelThemeResolver?.(levelId) ?? null;
}

const uiComponents: Partial<CampaignUiComponents> = {};

export function registerCampaignUiComponents(components: Partial<CampaignUiComponents>): void {
  Object.assign(uiComponents, components);
}

export function getCampaignUiComponent<K extends keyof CampaignUiComponents>(
  key: K,
): CampaignUiComponents[K] | null {
  return uiComponents[key] ?? null;
}

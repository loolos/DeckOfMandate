/**
 * Campaign-provided UI extension points. Campaign packs register their renderers from
 * `registerCampaign.ts` (module load, before first render); framework components consult
 * the registry and render nothing campaign-specific on their own.
 */
import type { ComponentType, ReactNode } from "react";
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

/** Campaign-provided components for the resource system (panel, inline icon, icon-annotated text). */
export type CampaignUiComponents = {
  ResourceBar: ComponentType<{ resources: Resources }>;
  ResourceTooltipText: ComponentType<{ text: string; resources?: Resources }>;
  ResourceTooltipIcon: ComponentType<{
    resource: keyof Resources & string;
    resources?: Resources;
    className?: string;
  }>;
};

const uiComponents: Partial<CampaignUiComponents> = {};

export function registerCampaignUiComponents(components: Partial<CampaignUiComponents>): void {
  Object.assign(uiComponents, components);
}

export function getCampaignUiComponent<K extends keyof CampaignUiComponents>(
  key: K,
): CampaignUiComponents[K] | null {
  return uiComponents[key] ?? null;
}

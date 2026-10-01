import type { ComponentType } from "react";
import type { LocaleId } from "../locales/localeIds";

/**
 * Top-level campaign entry: one per campaign folder, `src/levels/<campaignId>/campaignEntry.tsx`.
 * The shell renders the active entry's `Root`; each campaign owns everything below it
 * (state, rules, UI). Copying a campaign folder in/out adds/removes it from the menu.
 */
export type CampaignEntry = {
  readonly id: string;
  /** Lower sorts first; the first entry is the default campaign. */
  readonly order: number;
  readonly label: (locale: LocaleId) => string;
  readonly Root: ComponentType;
};

type CampaignEntryModule = { campaignEntry?: CampaignEntry };

const modules = import.meta.glob<CampaignEntryModule>("./*/campaignEntry.tsx", { eager: true });

const entries: CampaignEntry[] = Object.values(modules)
  .map((m) => m.campaignEntry)
  .filter((e): e is CampaignEntry => e != null)
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

export function getCampaignEntries(): readonly CampaignEntry[] {
  return entries;
}

export function getDefaultCampaignId(): string {
  const first = entries[0];
  if (!first) throw new Error("No campaign registered (expected src/levels/<id>/campaignEntry.tsx)");
  return first.id;
}

export function getCampaignEntry(id: string): CampaignEntry | undefined {
  return entries.find((e) => e.id === id);
}

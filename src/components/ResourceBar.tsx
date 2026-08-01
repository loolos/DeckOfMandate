import { getCampaignUiComponent } from "../levels/campaignUiRegistry";
import type { Resources } from "../types/game";

/** Delegates to the campaign-registered resource panel (each campaign owns its resource system UI). */
export function ResourceBar({ resources }: { resources: Resources }) {
  const Impl = getCampaignUiComponent("ResourceBar");
  return Impl ? <Impl resources={resources} /> : null;
}

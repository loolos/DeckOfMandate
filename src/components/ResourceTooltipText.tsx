import { getCampaignUiComponent } from "../levels/campaignUiRegistry";
import type { Resources } from "../types/game";

/** Delegates to the campaign-registered icon component for a single resource. */
export function ResourceTooltipIcon(props: {
  resource: keyof Resources & string;
  resources?: Resources;
  className?: string;
}) {
  const Impl = getCampaignUiComponent("ResourceTooltipIcon");
  return Impl ? <Impl {...props} /> : null;
}

/** Delegates to the campaign-registered renderer that annotates resource icons inside copy text. */
export function ResourceTooltipText(props: { text: string; resources?: Resources }) {
  const Impl = getCampaignUiComponent("ResourceTooltipText");
  return Impl ? <Impl {...props} /> : <>{props.text}</>;
}

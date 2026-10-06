import type { CampaignEntry } from "../campaignEntries";
import { CAMPAIGN_TITLE } from "./data/content";
import { ZhenhuanRoot } from "./ui/ZhenhuanRoot";

/** Chinese-only campaign (design.md §12). Everything it needs lives in this folder. */
export const campaignEntry: CampaignEntry = {
  id: "zhenhuan",
  order: 0,
  label: () => CAMPAIGN_TITLE,
  Root: ZhenhuanRoot,
};

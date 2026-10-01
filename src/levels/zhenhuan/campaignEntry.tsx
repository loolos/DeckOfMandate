import type { CampaignEntry } from "../campaignEntries";
import { ZhenhuanRoot } from "./ui/ZhenhuanRoot";

/** Chinese-only campaign (design.md §12). Everything it needs lives in this folder. */
export const campaignEntry: CampaignEntry = {
  id: "zhenhuan",
  order: 10,
  label: () => "甄嬛传",
  Root: ZhenhuanRoot,
};

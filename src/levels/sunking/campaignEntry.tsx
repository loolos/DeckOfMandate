import { Game } from "../../app/Game";
import type { CampaignEntry } from "../campaignEntries";

export const campaignEntry: CampaignEntry = {
  id: "sunking",
  order: 0,
  label: (locale) => (locale === "zh" ? "太阳王" : locale === "fr" ? "Le Roi-Soleil" : "The Sun King"),
  Root: Game,
};

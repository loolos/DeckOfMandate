import { Game } from "../../app/Game";
import type { CampaignEntry } from "../campaignEntries";

export const campaignEntry: CampaignEntry = {
  id: "sunking",
  order: 10,
  label: (locale) =>
    locale === "zh" ? "凡尔赛日冕·太阳王" : locale === "fr" ? "Couronne de Versailles · Le Roi-Soleil" : "Versailles Corona · The Sun King",
  Root: Game,
};

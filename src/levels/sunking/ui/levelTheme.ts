/**
 * Sun King shell theming: the campaign backdrop and glass treatment used by the level intro,
 * refit screens, and in-run shell. Registered through `registerCampaignLevelThemeResolver`.
 */
import type { CampaignLevelTheme } from "../../campaignUiRegistry";
import { isSunkingLevelId } from "../sunkingLevelIds";
import sunkingCampaignBackdropUrl from "../assets/sunkingCampaignBackdrop.webp";

const SUNKING_CAMPAIGN_THEME: CampaignLevelTheme = {
  backdropStyle: {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.45)), url(${sunkingCampaignBackdropUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  glass: true,
};

export function resolveSunkingLevelTheme(levelId: string): CampaignLevelTheme | null {
  return isSunkingLevelId(levelId) ? SUNKING_CAMPAIGN_THEME : null;
}

/**
 * Sun King UI registrations. Kept separate from `registerCampaign.ts` because UI modules
 * import the locale runtime, which itself depends on `src/levels/load` — loading these from
 * the content-registration graph would create an unresolved module cycle. `src/levels/loadUi.ts`
 * pulls this in after content registration completes.
 */
import {
  registerCampaignLevelThemeResolver,
  registerCampaignLogEntryRenderer,
  registerCampaignOutcomeCopyBuilder,
  registerCampaignStatusRowsBuilder,
  registerCampaignTargetsLineBuilder,
  registerCampaignUiComponents,
} from "../campaignUiRegistry";
import { resolveSunkingLevelTheme } from "./ui/levelTheme";
import { buildSunkingOutcomeCopy, buildSunkingTargetsLine } from "./ui/outcomeCopy";
import { renderSunkingLogEntry } from "./ui/actionLogEntries";
import { buildSunkingStatusRows } from "./ui/statusRows";
import { ResourceBar } from "./ui/SunkingResourceBar";
import { ResourceTooltipIcon, ResourceTooltipText } from "./ui/SunkingResourceTooltipText";
import { EventPanel } from "./ui/SunkingEventPanel";
import { Hand } from "./ui/SunkingHand";

export function registerSunkingUi(): void {
  registerCampaignLogEntryRenderer(renderSunkingLogEntry);
  registerCampaignStatusRowsBuilder(buildSunkingStatusRows);
  registerCampaignLevelThemeResolver(resolveSunkingLevelTheme);
  registerCampaignOutcomeCopyBuilder(buildSunkingOutcomeCopy);
  registerCampaignTargetsLineBuilder(buildSunkingTargetsLine);
  registerCampaignUiComponents({
    ResourceBar,
    ResourceTooltipText,
    ResourceTooltipIcon,
    EventPanel,
    Hand,
  });
}

registerSunkingUi();

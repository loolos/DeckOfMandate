import type { CardTemplateId } from "../levels/types/card";
import { getCampaignCardArtUrl } from "../levels/campaignCardArt";

export function getCardArtUrl(templateId: CardTemplateId): string | null {
  return getCampaignCardArtUrl(templateId);
}

import type { CardTemplateId } from "./types/card";
import { getSunkingCardArtUrl } from "./sunking/logic/cardArt";

/**
 * Campaign-level card art resolver façade.
 * Additional campaigns can extend this file without coupling `src/logic` to a specific pack.
 */
export function getCampaignCardArtUrl(templateId: CardTemplateId): string | null {
  return getSunkingCardArtUrl(templateId);
}

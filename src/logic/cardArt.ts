import type { CardTemplateId } from "../levels/types/card";
import fundingArtUrl from "../levels/sunking/assets/Funding.card1024.webp";
import crackdownArtUrl from "../levels/sunking/assets/Crackdown.card1024.webp";
import reformArtUrl from "../levels/sunking/assets/Reform.card1024.webp";
import ceremonyArtUrl from "../levels/sunking/assets/Ceremony.card1024.webp";
import developmentArtUrl from "../levels/sunking/assets/Development.card1024.webp";

const cardArtByTemplateId: Partial<Record<CardTemplateId, string>> = {
  funding: fundingArtUrl,
  crackdown: crackdownArtUrl,
  reform: reformArtUrl,
  ceremony: ceremonyArtUrl,
  development: developmentArtUrl,
};

export function getCardArtUrl(templateId: CardTemplateId): string | null {
  return cardArtByTemplateId[templateId] ?? null;
}


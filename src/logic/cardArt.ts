import type { CardTemplateId } from "../levels/types/card";
import fundingArtUrl from "../levels/sunking/assets/Funding.card1024.webp";
import crackdownArtUrl from "../levels/sunking/assets/Crackdown.card1024.webp";
import reformArtUrl from "../levels/sunking/assets/Reform.card1024.webp";
import ceremonyArtUrl from "../levels/sunking/assets/Ceremony.card1024.webp";
import developmentArtUrl from "../levels/sunking/assets/Development.card1024.webp";
import diplomaticCongressArtUrl from "../levels/sunking/assets/diplomaticCongress.card1024.webp";
import taxRebalanceArtUrl from "../levels/sunking/assets/taxRebalance.card1024.webp";
import grainReliefArtUrl from "../levels/sunking/assets/grainRelief.card1024.webp";
import diplomaticInterventionArtUrl from "../levels/sunking/assets/diplomaticIntervention.card1024.webp";
import fiscalBurdenArtUrl from "../levels/sunking/assets/fiscalBurden.card1024.webp";
import antiFrenchContainmentArtUrl from "../levels/sunking/assets/antiFrenchContainment.card1024.webp";
import suppressHuguenotsArtUrl from "../levels/sunking/assets/suppressHuguenots.card1024.webp";
import religiousTensionCardArtUrl from "../levels/sunking/assets/religiousTensionCard.card1024.webp";
import jesuitCollegeArtUrl from "../levels/sunking/assets/jesuitCollege.card1024.webp";
import bourbonMarriageProclamationArtUrl from "../levels/sunking/assets/bourbonMarriageProclamation.card1024.webp";
import grandAllianceInfiltrationDiplomacyArtUrl from "../levels/sunking/assets/grandAllianceInfiltrationDiplomacy.card1024.webp";
import italianTheaterTroopRedeployArtUrl from "../levels/sunking/assets/italianTheaterTroopRedeploy.card1024.webp";
import usurpationEdictArtUrl from "../levels/sunking/assets/usurpationEdict.card1024.webp";
import jansenistReservationArtUrl from "../levels/sunking/assets/jansenistReservation.card1024.webp";

const cardArtByTemplateId: Partial<Record<CardTemplateId, string>> = {
  funding: fundingArtUrl,
  crackdown: crackdownArtUrl,
  reform: reformArtUrl,
  ceremony: ceremonyArtUrl,
  development: developmentArtUrl,
  diplomaticCongress: diplomaticCongressArtUrl,
  taxRebalance: taxRebalanceArtUrl,
  grainRelief: grainReliefArtUrl,
  diplomaticIntervention: diplomaticInterventionArtUrl,
  fiscalBurden: fiscalBurdenArtUrl,
  antiFrenchContainment: antiFrenchContainmentArtUrl,
  suppressHuguenots: suppressHuguenotsArtUrl,
  religiousTensionCard: religiousTensionCardArtUrl,
  jesuitCollege: jesuitCollegeArtUrl,
  bourbonMarriageProclamation: bourbonMarriageProclamationArtUrl,
  grandAllianceInfiltrationDiplomacy: grandAllianceInfiltrationDiplomacyArtUrl,
  italianTheaterTroopRedeploy: italianTheaterTroopRedeployArtUrl,
  usurpationEdict: usurpationEdictArtUrl,
  jansenistReservation: jansenistReservationArtUrl,
};

export function getCardArtUrl(templateId: CardTemplateId): string | null {
  return cardArtByTemplateId[templateId] ?? null;
}


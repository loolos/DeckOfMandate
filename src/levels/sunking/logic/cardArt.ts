import type { CardTemplateId } from "../../types/card";
import fundingArtUrl from "../assets/Funding.card1024.webp";
import crackdownArtUrl from "../assets/Crackdown.card1024.webp";
import reformArtUrl from "../assets/Reform.card1024.webp";
import ceremonyArtUrl from "../assets/Ceremony.card1024.webp";
import developmentArtUrl from "../assets/Development.card1024.webp";
import diplomaticCongressArtUrl from "../assets/diplomaticCongress.card1024.webp";
import taxRebalanceArtUrl from "../assets/taxRebalance.card1024.webp";
import grainReliefArtUrl from "../assets/grainRelief.card1024.webp";
import diplomaticInterventionArtUrl from "../assets/diplomaticIntervention.card1024.webp";
import fiscalBurdenArtUrl from "../assets/fiscalBurden.card1024.webp";
import antiFrenchContainmentArtUrl from "../assets/antiFrenchContainment.card1024.webp";
import suppressHuguenotsArtUrl from "../assets/suppressHuguenots.card1024.webp";
import religiousTensionCardArtUrl from "../assets/religiousTensionCard.card1024.webp";
import jesuitCollegeArtUrl from "../assets/jesuitCollege.card1024.webp";
import bourbonMarriageProclamationArtUrl from "../assets/bourbonMarriageProclamation.card1024.webp";
import grandAllianceInfiltrationDiplomacyArtUrl from "../assets/grandAllianceInfiltrationDiplomacy.card1024.webp";
import italianTheaterTroopRedeployArtUrl from "../assets/italianTheaterTroopRedeploy.card1024.webp";
import usurpationEdictArtUrl from "../assets/usurpationEdict.card1024.webp";
import jansenistReservationArtUrl from "../assets/jansenistReservation.card1024.webp";

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

export function getSunkingCardArtUrl(templateId: CardTemplateId): string | null {
  return cardArtByTemplateId[templateId] ?? null;
}

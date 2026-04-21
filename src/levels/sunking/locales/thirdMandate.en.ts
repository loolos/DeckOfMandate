/**
 * English copy for level `thirdMandate` (War of the Spanish Succession).
 */
export const messagesEnThirdMandate = {
  "level.successionWar.name": "Waning Sun, Vacant Crown",
  "level.successionWar.introTitle": "1701 — Waning light: testaments, thrones, crowns in strife",
  "level.successionWar.introBody":
    "When the Spanish Habsburg line failed with Charles II, half of Europe was suddenly negotiable. Madrid’s vast composite monarchy—Castile and Aragon, Naples and Milan, much of the Low Countries, and overseas silver—sat at the centre of every balance-of-power calculation. France backed Bourbon claims through dynastic marriages and the will’s language; Vienna and the emperor’s court argued for Habsburg continuity and for limits to Bourbon encirclement. London and The Hague, fearing French primacy in both Channel and Mediterranean, tilted toward coalitions that could restrain Versailles without surrendering their own commercial empires.\n\nWhat followed was less a single war than a shifting lattice of fronts: fortresses and bargainers in the Spanish Netherlands, Piedmont and the Alpine passes, Rhine principalities squeezed between imperial and French armies, and the naval math of trade and colonies. Treaties would later try to fix the map; this chapter is the long strain of French kingship stretched between tribute, tax, and the envy of other crowns.",
  "level.successionWar.ending.victory":
    "France secures a durable settlement. The crown navigates coalition war and dynastic rivalry without losing the political center.",
  "level.successionWar.ending.victoryWarDevolutionExtra":
    "Earlier French offensives still color how neighbors read your moves, but disciplined diplomacy limits the backlash.",
  "level.successionWar.ending.defeat":
    "The succession crisis overwhelms the monarchy. Resources collapse, legitimacy frays, and France pays the price of overstretch.",

  "event.successionCrisis.name": "Succession Crisis",
  "event.successionCrisis.desc":
    "When Charles II died without issue, the Spanish Habsburg line ended and Europe had to retie a composite monarchy—Castilian-Aragonese cores, Italian satellites, the Low Countries, American silver—into a successor regime. The Bourbon court claimed the Spanish inheritance for Philip of Anjou through decades of marriage alliances and the late king’s will, offering European courts assurances against immediate union with France. The Habsburg party in Vienna and the empire argued from dynasty, partition precedents, and women’s claims in older branches: a Bourbon king in Madrid looked like French primacy over half of Italy, the western Mediterranean, and America, and they mobilized coalition guarantees and Protestant allies as well as Catholic rhetoric. Both sides drafted jurists and genealogists to prove rightful succession; the paper war framed the coalition war to come.\n\nPay 3 Funding to assert a stronger Bourbon claim (+1 on the succession track), or refuse and start at −1. If ignored until year-end, counts as refusal (−1) and the Habsburg opponent still appears.",
  "event.opponentHabsburg.name": "Opponent: House of Habsburg",
  "event.opponentHabsburg.desc":
    "Vienna, Madrid’s jurists, and Catholic allies weave a counter-claim to Bourbon pretensions: dynastic law, imperial prestige, and the fear of a French ring around Habsburg lands. This row tracks the diplomatic-military pressure their camp brings to bear each year, represented as a hand of hostile moves.",
  "event.utrechtTreaty.name": "Treaty of Utrecht window",
  "event.utrechtTreaty.desc":
    "End the war of succession or wait. Each wait consumes one round of the 6-round negotiation window; at 0, the war ends automatically. Ending the war does not remove the opponent phase.",
  "event.bavarianCourtRealignment.name": "Bavarian court realignment",
  "event.bavarianCourtRealignment.desc": "Pay 2 Funding: succession track +1. If ignored: succession track −1.",
  "event.portugueseTariffNegotiation.name": "Portuguese tariff negotiation",
  "event.portugueseTariffNegotiation.desc":
    "Context: during the War of the Spanish Succession, Portugal realigned with the maritime coalition; the 1703 Methuen Treaty traded favorable wine duties in Portugal for English cloth access, folding Lisbon’s revenue politics into the Grand Alliance’s wider war economy and imperial supply lines against France.\n\nPay ceil(Treasury/4) Funding: Treasury +1 and succession track +1. If ignored: Treasury +1 only.",
  "event.imperialElectorsMood.name": "Imperial electors’ mood",
  "event.imperialElectorsMood.desc":
    "Pay 2 Funding or use Intervention. If ignored: succession track −1 and Legitimacy −1.",

  "card.bourbonMarriageProclamation.name": "Bourbon marriage proclamation",
  "card.bourbonMarriageProclamation.background": "Dynastic narrative",
  "card.bourbonMarriageProclamation.desc": "Legitimacy +1. Succession track +1.",
  "card.grandAllianceInfiltrationDiplomacy.name": "Grand Alliance infiltration diplomacy",
  "card.grandAllianceInfiltrationDiplomacy.background": "Divide the coalition",
  "card.grandAllianceInfiltrationDiplomacy.desc": "Draw 1. This turn, opponent phase costs −1 (min 0).",
  "card.italianTheaterTroopRedeploy.name": "Italian theater troop redeploy",
  "card.italianTheaterTroopRedeploy.background": "Alpine front",
  "card.italianTheaterTroopRedeploy.desc": "Succession track +2. Add 1 Fiscal Burden to your deck.",
  "card.habsburgImperialLegitimacyNote.name": "Imperial legitimacy note",
  "card.habsburgImperialLegitimacyNote.background": "Legalist pressure",
  "card.habsburgImperialLegitimacyNote.desc": "Opponent cost 1. Succession track −1.",
  "card.habsburgImperialLegitimacyNote.opponentHistory":
    "Chancelleries cite imperial privilege and old ties to Spain’s Habsburg past—jurists’ briefs meant to remind Europe that Bourbon claims were negotiable on paper long before they were conceded on the battlefield.",
  "card.habsburgLowCountriesAgitation.name": "Low Countries agitation",
  "card.habsburgLowCountriesAgitation.background": "Northwestern front",
  "card.habsburgLowCountriesAgitation.desc": "Opponent cost 2. Succession track −1, Power −1.",
  "card.habsburgLowCountriesAgitation.opponentHistory":
    "The Spanish Netherlands—fortress belts, river lines, and mutinous garrisons—were the cockpit where coalition logistics met French overreach; unrest here was a lever on London as much as on Versailles.",
  "card.habsburgGrandAllianceLevy.name": "Grand Alliance levy",
  "card.habsburgGrandAllianceLevy.background": "Coalition war chest",
  "card.habsburgGrandAllianceLevy.desc": "Opponent cost 2. Succession track −2.",
  "card.habsburgGrandAllianceLevy.opponentHistory":
    "Funds raised under anti-French leagues and imperial diets: subsidies, Dutch loans, and Austrian direct taxes, stitched into long campaigns that made French primacy expensive to hold year after year.",
} as const;

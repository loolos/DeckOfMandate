/** Card / event / status template copy moved out of `en.core.ts` — Sun King campaign pack. */
export const sunkingCoreGameContentEn = {
  "card.funding.name": "Royal Levy",
  "card.funding.background":
    "Extraordinary tallies and accelerated collection—short-term cash for the crown’s urgent line items.",
  "card.funding.desc": "Gain +1 Funding this turn (not Treasury). If Remaining is exhausted: Treasury -1.",
  "card.crackdown.name": "Royal Intervention",
  "card.crackdown.background":
    "Edicts, troops, or police action—force applied where rumor and riot have already outpaced law.",
  "card.crackdown.desc": "Resolve one harmful event. If Remaining is exhausted: Power -1.",
  "card.fiscalBurden.name": "Fiscal Burden",
  "card.fiscalBurden.background":
    "Debt obligations and emergency liabilities now crowd the books and constrain every cycle.",
  "card.fiscalBurden.desc":
    "When drawn, lose 1 Funding. You may pay floor(Treasury/5)+1 Funding to purge it (removed, not discarded).",
  "card.antiFrenchContainment.name": "Anti-French Containment",
  "card.antiFrenchContainment.background":
    "European courts coordinate tariffs, credit pressure, and maritime checks to narrow French options.",
  "card.antiFrenchContainment.desc":
    "When drawn, 50/50: lose 1 Power or lose 1 Legitimacy. You may pay max(1, floor(Europe Alert progress/2)) Funding to purge it (removed, not discarded).",
  "card.reform.name": "Administrative Reform",
  "card.reform.background":
    "Registers and reporting lines are redrawn; the bureaucracy tightens under royal direction.",
  "card.reform.desc": "Power +1 (applies next draw phase). Draw 1 now (hand cap 12).",
  "card.ceremony.name": "Versailles Ceremony",
  "card.ceremony.background":
    "Banners, oaths, and spectacle at court—majesty displayed so every faction remembers who stands at the center.",
  "card.ceremony.desc": "Legitimacy +1.",
  "card.development.name": "Royal Manufactories",
  "card.development.background":
    "Colbert-era workshops, ports, and foundations—the slow lift of national wealth through royal industry.",
  "card.development.desc": "Treasury +1.",
  "card.suppressHuguenots.name": "Suppress the Huguenots",
  "card.suppressHuguenots.background":
    "Royal troops, policing, and local courts are mobilized to break remaining Huguenot networks.",
  "card.suppressHuguenots.desc":
    "Temporary. Cost 3. On play, reduce “Contain Huguenot Remnants” by 1; at 0, remove that status and purge all Suppress the Huguenots cards.",
  "card.religiousTensionCard.name": "Religious Conflict",
  "card.religiousTensionCard.background":
    "Confessional rifts never fully close: doctrinal disputes, liturgical demands, and provincial grievances keep crowding the royal agenda.",
  "card.religiousTensionCard.desc":
    "Extra. You may pay 2 Funding to purge it (removed, not discarded). Added to your draw pile when Arminian Polemic, Huguenot Underground Agitation, or Jesuit Patronage is resolved.",
  "card.jansenistReservation.name": "Reservation of Conscience",
  "card.jansenistReservation.background":
    "After Huguenot networks were broken, Catholic unity did not follow automatically: Jansenist rigor and episcopal authority clashed, leaving conscience claims that tied up royal policy.",
  "card.jansenistReservation.desc":
    "Extra. Cost 2. On play, removed from circulation (not discarded). While in hand, the card immediately to its left gains the Defiance tag and cannot be played.",
  "card.jesuitCollege.name": "Jesuit Collège",
  "card.jesuitCollege.background":
    "La Flèche, Louis-le-Grand, and Clermont train Crown-aligned elites — magistrates, officers, and clergy schooled in rhetoric, theology, and obedience. Their pulpits also doubled as the front line against Jansenist rigorism.",
  "card.jesuitCollege.desc":
    "Extra. Remaining 1/1 — single use. Cost 2. On play, Legitimacy +1; if a Jansenist Controversy event is unresolved on the board, immediately resolve one (no Funding cost). After play, removed from circulation.",
  "event.budgetStrain.name": "Court Overspending",
  "event.budgetStrain.desc":
    "Louis XIV's palace works and household scale routinely overshot ordinary revenue forecasts. Versailles expansion and court ritual push spending past the budget. Pay 2 Funding or lose 1 Treasury.",
  "event.publicUnrest.name": "Paris Unrest",
  "event.publicUnrest.desc":
    "Ancien-régime crowds moved fast on bread rumors and police gossip. Bread prices and rumor fill the streets. Intervention only, or lose 1 Legitimacy.",
  "event.administrativeDelay.name": "Bureaucratic Delay",
  "event.administrativeDelay.desc":
    "Provincial estates, parlements, and tax farmers often tested new edicts against local privilege. Provincial officials slow-walk new orders from the court. Pay 1 Funding or draw one fewer next turn (min 1 draw).",
  "event.tradeOpportunity.name": "Colonial Trade Boom",
  "event.tradeOpportunity.desc":
    "Atlantic and colonial routes tied sugar, tobacco, and slaves to Bordeaux and La Rochelle capital. Sea lanes and merchants ask for crown support. Pay 1 Funding to gain +1 Treasury. No penalty if ignored.",
  "event.powerVacuum.name": "Provincial Governor Ascendant",
  "event.powerVacuum.desc":
    "Strong intendants or governors could outpace Versailles on the ground when court attention drifted. A governor bypasses the court. Pay 2 Funding or Intervention, or escalate to Royal Crisis next turn.",
  "event.majorCrisis.name": "Royal Crisis",
  "event.majorCrisis.desc":
    "Fronde memory made any visible break in royal command politically explosive. Intervention only. Tagged Continued: if unresolved it remains into next turn and repeats Legitimacy -1 plus draw penalty each year until solved.",
  "event.politicalGridlock.name": "Noble Resistance",
  "event.politicalGridlock.desc":
    "Great families still combined quickly against fiscal centralization that recalled Mazarin’s levies. Great nobles unite against your fiscal scheme. Pay 2 Funding or suffer Loss of Authority for 3 turns (−1 draw attempt each turn, min 1 draw).",
  "status.powerLeak.name": "Loss of Authority",
  "status.powerLeak.history": "Provincial resistance and factional drag steadily weaken central execution.",
  "status.drawPenalty.name": "Draw Fatigue",
  "status.drawPenalty.history": "Tax restructuring creates short-term implementation friction.",
  "status.retentionBoost.name": "Court Storage",
  "status.retentionBoost.history": "Patronage networks improve continuity of royal control over appointments.",
  "status.royalBan.name": "Royal Access Frozen",
  "status.royalBan.history": "When court credibility breaks, royal command tools temporarily lose traction.",
  "status.grainReliefDrawBoost.name": "Relief Coordination",
  "status.grainReliefDrawBoost.history": "Emergency grain administration boosts short-run coordination capacity.",
  "status.grainReliefLegitimacyBoost.name": "Relief Confidence",
  "status.grainReliefLegitimacyBoost.history":
    "Visible relief action briefly restores trust in crown-led governance.",
  "status.religiousTolerance.name": "Religious Tolerance (Permanent)",
  "status.religiousTolerance.history":
    "After the revocation era, the crown balances confessional unity against governability: pressure on Protestants, policing of Catholic theological disputes, and royal legitimacy all pull in different directions. Choosing tolerance avoids total confrontation but keeps reopening friction in courts, parishes, and provincial administration.",
  "status.huguenotContainment.name": "Contain Huguenot Remnants",
  "status.huguenotContainment.history":
    "Harsh repression demands sustained policing campaigns and political bandwidth.",
  "status.huguenotContainment.hint": "While active, Chapter 2 victory is blocked.",
  "status.huguenotContainment.hintGeneral":
    "Tracks crackdown suppression stacks; clearing suppress cards from play removes stacks over time.",
  "status.legitimacyCrisis.name": "Legitimacy Crisis",
  "status.legitimacyCrisis.history":
    "Bypassing succession norms accelerates your claim now, but keeps corroding royal credibility over the next turns.",
  "event.jansenistTension.name": "Jansenist Controversy",
  "event.jansenistTension.desc":
    "Port-Royal rigor and episcopal authority had clashed with Rome and Versailles since Richelieu's day. Debates over grace and salvation revive Jansenist networks and reopen conflict between bishops, magistrates, and the crown. Pay 2 Funding for clerical inspections and public pacification, or lose 1 Legitimacy.",
  "event.arminianTension.name": "Arminian Polemic",
  "event.arminianTension.desc":
    "Dutch-influenced polemics on grace circulated in French faculties alongside Gallican defensiveness. Arminian disputes over free will and predestination spread through pulpits and academies, weakening doctrinal coordination. Pay 1 Funding to consolidate seminaries and censorship channels (resolving adds 1 Religious Tension to your draw pile), or lose 1 Power.",
  "event.huguenotTension.name": "Huguenot Underground Agitation",
  "event.huguenotTension.desc":
    "After 1685, Channel ports logged smuggling and covert relief tied to refugee networks abroad. Post-revocation Huguenot communities rebuild covert aid networks in ports and border towns, straining police and tax enforcement. Pay 1 Funding to reinforce security and relief (resolving adds 1 Religious Tension to your draw pile), or lose 1 Treasury.",
  "card.tag.royal": "Royal",
  "card.tag.temp": "Temp",
  "card.tag.extra": "Extra",
  "card.tag.inflation": "Inflation",
  "card.tag.defiance": "Defiance",
  "card.tag.consume": "Consume",
  "card.tag.successionContest": "Succession Contest",
  "card.tag.remainingUses": "Remaining {remaining}/{total}",
} as const;

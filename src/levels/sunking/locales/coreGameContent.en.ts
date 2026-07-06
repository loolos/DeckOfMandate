/** Card / event / status template copy moved out of `en.core.ts` — Sun King campaign pack. */
export const sunkingCoreGameContentEn = {
  "card.funding.name": "Royal Levy",
  "card.funding.background":
    "Under Louis XIV, near-continuous warfare and fortress maintenance forced the crown to rely on extraordinary levies, advance tax calls, and harder pressure on tax-farm circuits to keep army pay and supply moving. Royal Levy delivers immediate liquidity, but it also deepens provincial resentment and future collection fatigue once emergency extraction becomes routine.",
  "card.funding.desc": "Gain +1 Funding this turn (not Treasury). If Remaining is exhausted: Treasury -1.",
  "card.crackdown.name": "Royal Intervention",
  "card.crackdown.background":
    "In the late reign, Versailles repeatedly used intendants, garrisons, and police ordinances to impose order when parlements stalled, bread unrest spread, or factional rumor outran regular procedure. Royal Intervention can restore command quickly in a crisis, but repeated coercion erodes political trust and raises longer-term governance costs.",
  "card.crackdown.desc":
    "Resolve one harmful event with the same post-resolve extras as paying Funding for that event when defined (e.g. some Europe Alert pressure events reduce alert progress by 1). If Remaining is exhausted: Power -1.",
  "card.fiscalBurden.name": "Fiscal Burden",
  "card.fiscalBurden.background":
    "Decades of war finance under Louis XIV ran on borrowing, venal office, and revenue anticipation; interest, arrears, and deferred bills now crowd the books and must be serviced before anything else each fiscal year.",
  "card.fiscalBurden.desc":
    "When drawn, lose 1 Funding. Pay floor(Treasury/5) + 1 Funding to play and purge from circulation.",
  "card.antiFrenchContainment.name": "Anti-French Containment",
  "card.antiFrenchContainment.background":
    "Since the Devolution and Dutch wars, European courts have learned to coordinate tariffs, credit pressure, and maritime checks to narrow French options, so that every confrontation starts with a political price.",
  "card.antiFrenchContainment.desc":
    "When drawn, 50/50: lose 1 Power or lose 1 Legitimacy. Pay the Europe Alert–scaled Funding (min 1) to play and purge from circulation.",
  "card.reform.name": "Administrative Reform",
  "card.reform.background":
    "After Louis XIV's personal rule began, intendants and Versailles court networks pulled provincial power back to the center, redrawing registers and reporting lines.",
  "card.reform.desc": "Power +1 (applies next draw phase). Draw 1 now (hand cap 12).",
  "card.ceremony.name": "Versailles Ceremony",
  "card.ceremony.background":
    "Louis XIV turned Versailles ritual into a machinery of rule: audiences, banquets, and honors made nobles compete for royal favor, steadily pulling provincial elites and court factions back toward the crown.",
  "card.ceremony.desc": "Legitimacy +1.",
  "card.development.name": "Royal Manufactories",
  "card.development.background":
    "Colbert-era workshops, ports, and chartered ventures—the slow lift of national wealth through royal industry, steering commercial profit back into crown revenue.",
  "card.development.desc": "Treasury +1.",
  "card.suppressHuguenots.name": "Suppress the Huguenots",
  "card.suppressHuguenots.background":
    "After the 1685 revocation of the Edict of Nantes, royal troops, policing, and local courts were mobilized again and again to break the clandestine Huguenot networks of worship, print, and mutual aid.",
  "card.suppressHuguenots.desc":
    "On play, reduce “Contain Huguenot Remnants” by 1; at 0, remove that status and purge all Suppress the Huguenots cards.",
  "card.religiousTensionCard.name": "Religious Conflict",
  "card.religiousTensionCard.background":
    "Confessional rifts never fully close: doctrinal disputes, liturgical demands, and provincial grievances keep crowding the royal agenda.",
  "card.religiousTensionCard.desc":
    "Added to your draw pile when Arminian Polemic, Huguenot Underground Agitation, or Jesuit Patronage is resolved. Pay 2 Funding to play and purge from circulation.",
  "card.jansenistReservation.name": "Reservation of Conscience",
  "card.jansenistReservation.background":
    "After Huguenot networks were broken, Catholic unity did not follow automatically: Jansenist rigor and episcopal authority clashed, leaving conscience claims that tied up royal policy.",
  "card.jansenistReservation.desc":
    "While in hand, the card immediately to its left gains Defiance and cannot be played. After play, removed from circulation (not discarded).",
  "card.jesuitCollege.name": "Jesuit Collège",
  "card.jesuitCollege.background":
    "La Flèche, Louis-le-Grand, and Clermont train Crown-aligned elites — magistrates, officers, and clergy schooled in rhetoric, theology, and obedience. Their pulpits also doubled as the front line against Jansenist rigorism.",
  "card.jesuitCollege.desc":
    "On play, Legitimacy +1; if Jansenist Controversy is unresolved, resolve one at no Funding cost. Removed from circulation when exhausted.",
  "event.budgetStrain.name": "Court Overspending",
  "event.budgetStrain.history":
    "Louis XIV's palace works and household scale routinely overshot ordinary revenue forecasts; court splendor was an instrument of rule and a bottomless bill at once.",
  "event.budgetStrain.desc":
    "Versailles expansion and court ritual push spending past the budget: pay 2 Funding or lose 1 Treasury.",
  "event.publicUnrest.name": "Paris Unrest",
  "event.publicUnrest.history":
    "Ancien-régime crowds moved fast on bread rumors and police gossip; within days bread prices and rumor could fill the streets, and any hesitation read as royal weakness.",
  "event.publicUnrest.desc": "Intervention only, or lose 1 Legitimacy.",
  "event.administrativeDelay.name": "Bureaucratic Delay",
  "event.administrativeDelay.history":
    "Provincial estates, parlements, and tax farmers often tested new edicts against local privilege, so royal orders bent and slowed on the road out of Paris.",
  "event.administrativeDelay.desc":
    "Provincial officials slow-walk new orders from the court: pay 1 Funding or draw one fewer next turn (min 1 draw).",
  "event.tradeOpportunity.name": "Colonial Trade Boom",
  "event.tradeOpportunity.history":
    "Atlantic and colonial routes tied sugar, tobacco, and shipping capital to Bordeaux and La Rochelle, and merchants petitioned the crown for charters and convoy support.",
  "event.tradeOpportunity.desc": "Pay 1 Funding to gain +1 Treasury. No penalty if ignored.",
  "event.powerVacuum.name": "Provincial Governor Ascendant",
  "event.powerVacuum.history":
    "Strong intendants or governors could outpace Versailles on the ground when court attention drifted, running their provinces past the court.",
  "event.powerVacuum.desc": "Pay 2 Funding or Intervention, or this slot escalates to Royal Crisis next turn.",
  "event.majorCrisis.name": "Royal Crisis",
  "event.majorCrisis.history":
    "Fronde memory made any visible break in royal command politically explosive, tempting nobles and courts to probe the crown's limits again.",
  "event.majorCrisis.desc":
    "Intervention only. Tagged Continued: if unresolved it remains into next turn and repeats Legitimacy -1 plus a draw penalty each year until solved.",
  "event.politicalGridlock.name": "Noble Resistance",
  "event.politicalGridlock.history":
    "Great families still combined quickly against fiscal centralization that recalled Mazarin’s levies.",
  "event.politicalGridlock.desc":
    "Great nobles unite against your fiscal scheme: pay 2 Funding or suffer Loss of Authority for 3 turns (−1 draw attempt each turn, min 1 draw).",
  "status.powerLeak.name": "Loss of Authority",
  "status.powerLeak.history": "Provincial resistance and factional drag steadily weaken central execution.",
  "status.powerLeak.desc": "While active, draw attempts -1 each turn (min 1 draw).",
  "status.drawPenalty.name": "Draw Fatigue",
  "status.drawPenalty.history": "Tax restructuring creates short-term implementation friction.",
  "status.drawPenalty.desc": "While active, draw attempts -1 each turn (min 1 draw).",
  "status.retentionBoost.name": "Court Storage",
  "status.retentionBoost.history": "Patronage networks improve continuity of royal control over appointments.",
  "status.retentionBoost.desc": "While active, end-of-turn hand retention cap +1.",
  "status.royalBan.name": "Royal Access Frozen",
  "status.royalBan.history": "When court credibility breaks, royal command tools temporarily lose traction.",
  "status.royalBan.desc": "While active, Royal-tagged hand cards cannot be played.",
  "status.grainReliefDrawBoost.name": "Relief Coordination",
  "status.grainReliefDrawBoost.history": "Emergency grain administration boosts short-run coordination capacity.",
  "status.grainReliefDrawBoost.desc": "While active, draw attempts +1 each turn.",
  "status.grainReliefLegitimacyBoost.name": "Relief Confidence",
  "status.grainReliefLegitimacyBoost.history":
    "Visible relief action briefly restores trust in crown-led governance.",
  "status.grainReliefLegitimacyBoost.desc": "While active, Legitimacy +1 at the start of each turn.",
  "status.diplomaticCongressDrawBoost.name": "Congress Momentum",
  "status.diplomaticCongressDrawBoost.history": "Diplomatic networking increases next-year coordination bandwidth.",
  "status.diplomaticCongressDrawBoost.desc": "While active, draw attempts +1 each turn.",
  "status.grandAllianceInfiltration.name": "Grand Alliance infiltration",
  "status.grandAllianceInfiltration.history":
    "Back-channel diplomacy exploits agenda splits inside the Grand Alliance, blunting its ability to press in unison.",
  "status.grandAllianceInfiltration.desc": "This year's opponent phase budget is reduced by 1 (min 0).",
  "status.religiousTolerance.name": "Religious Tolerance (Permanent)",
  "status.religiousTolerance.history":
    "After the revocation era, the crown balances confessional unity against governability: pressure on Protestants, policing of Catholic theological disputes, and royal legitimacy all pull in different directions. Choosing tolerance avoids total confrontation but keeps reopening friction in courts, parishes, and provincial administration.",
  "status.religiousTolerance.desc":
    "Permanent: each year, if no confessional-dispute event is on the board, one may appear automatically (Jansenist Controversy / Arminian Polemic / Huguenot Underground Agitation, 15% each).",
  "status.huguenotContainment.name": "Contain Huguenot Remnants",
  "status.huguenotContainment.history":
    "Harsh repression demands sustained policing campaigns and political bandwidth.",
  "status.huguenotContainment.hint": "While active, Chapter 2 victory is blocked.",
  "status.huguenotContainment.hintGeneral":
    "Tracks crackdown suppression stacks; clearing suppress cards from play removes stacks over time.",
  "status.greatPowerEncirclement.name": "Grand Alliance Encirclement (Permanent)",
  "status.greatPowerEncirclement.history":
    "During the War of the Spanish Succession, Bourbon dynastic expansion from Versailles was increasingly viewed as a continental balance-of-power threat. Britain, the Dutch Republic, Savoy, and Portugal therefore coordinated money, fleets, and field support for the Habsburg camp, turning a dynastic dispute into a broader coalition war. Until the Utrecht settlement closes the conflict, that external backing keeps lifting Habsburg war capacity.",
  "status.greatPowerEncirclement.desc":
    "Chapter 3: if the Habsburg opponent row is present and Treasury + Power + Legitimacy exceeds 50, gain this status and Habsburg opponent budget +1; if that total exceeds 75, it adds one more opponent budget +1 (once per war). It does not clear while the war lasts.",
  "status.legitimacyCrisis.name": "Legitimacy Crisis",
  "status.legitimacyCrisis.history":
    "Bypassing succession norms accelerates your claim now, but keeps corroding royal credibility over the next turns.",
  "status.legitimacyCrisis.desc": "While active, Legitimacy -1 at the end of each turn.",
  "status.minorRegencyDoubt.name": "Minor Regency Doubt",
  "status.minorRegencyDoubt.history":
    "After Louis XIV's death, a child-king court invites factional doubt and slows command relay each year.",
  "status.minorRegencyDoubt.desc": "While active, draw attempts -1 each turn (min 1 draw).",
  "status.bourbonMarriageRetention.name": "Dynastic alliance composure",
  "status.bourbonMarriageRetention.history":
    "A staged marriage-and-succession narrative steadies court rhythm and the paperwork of dynastic claims.",
  "status.bourbonMarriageRetention.desc":
    "+1 total hand cap (can exceed the default 12); the same +1 also counts toward how many hand cards you may keep at year-end together with Legitimacy.",
  "event.jansenistTension.name": "Jansenist Controversy",
  "event.jansenistTension.history":
    "Port-Royal rigor and episcopal authority had clashed with Rome and Versailles since Richelieu's day; debates over grace and salvation revive Jansenist networks and reopen conflict between bishops, magistrates, and the crown.",
  "event.jansenistTension.desc":
    "Pay 2 Funding for clerical inspections and public pacification, or lose 1 Legitimacy.",
  "event.arminianTension.name": "Arminian Polemic",
  "event.arminianTension.history":
    "Dutch-influenced polemics on grace circulated in French faculties alongside Gallican defensiveness; Arminian disputes over free will and predestination spread through pulpits and academies, weakening doctrinal coordination.",
  "event.arminianTension.desc":
    "Pay 1 Funding to consolidate seminaries and censorship channels (resolving adds 1 Religious Conflict to your draw pile), or lose 1 Power.",
  "event.huguenotTension.name": "Huguenot Underground Agitation",
  "event.huguenotTension.history":
    "After 1685, Channel ports logged smuggling and covert relief tied to refugee networks abroad; post-revocation Huguenot communities rebuilt covert aid networks in ports and border towns, straining police and tax enforcement.",
  "event.huguenotTension.desc":
    "Pay 1 Funding to reinforce security and relief (resolving adds 1 Religious Conflict to your draw pile), or lose 1 Treasury.",
  "card.tag.royal": "Royal",
  "card.tag.temp": "Temp",
  "card.tag.extra": "Extra",
  "card.tag.inflation": "Inflation",
  "card.tag.defiance": "Defiance",
  "card.tag.consume": "Consume",
  "card.tag.opponent": "Opponent",
  "card.tag.successionContest": "Succession Contest",
  "card.tag.remainingUses": "Remaining {remaining}/{total}",
} as const;

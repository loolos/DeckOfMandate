/**
 * English copy for level `secondMandate` (Long Shadows at Noon, France 1676–1700).
 */
export const messagesEnSecondMandate = {
  "level.gloryUnderStrain.name": "Long Shadows at Noon",
  "level.gloryUnderStrain.introTitle": "France, 1676 — Hold the hegemony",
  "level.gloryUnderStrain.introBody":
    "The age of expansion has ended; the age of payment begins. By 1676, Louis XIV presides over a stronger but more exposed monarchy: Versailles projects splendor, yet court ceremony, military mobilization, and fiscal extraction all demand constant funding. Every gain in authority now carries a maintenance cost, and every delay in administration risks widening into provincial noncompliance.\n\nReligion sharpens that strain. The Edict of Nantes, issued by Henry IV in 1598 after decades of civil war between Catholics and Protestants, did not create equality, but it built a political compromise: Catholicism remained the state religion while Huguenots retained limited worship rights, legal protections, and fortified spaces of security. That settlement helped end the French Wars of Religion by trading absolute confessional victory for governable coexistence.\n\nIn this chapter, that compromise unravels. Pressure to enforce unity can strengthen royal authority in the short term, but persecution can hollow out trust, provoke resistance, and drain state capacity over time. Tolerance, meanwhile, may reduce immediate violence while inviting recurring political backlash. Abroad, rival powers read domestic fracture as strategic opportunity; at home, tax burdens and grain stress turn doctrine into unrest. Your task is not to restore a lost balance, but to govern through a dangerous transition: preserve legitimacy, manage conflict between faith and obedience, and keep France standing through the wars that follow its rise.",
  "level.gloryUnderStrain.ending.victory":
    "The monarchy endures the pressure years. France remains formidable, and the state survives diplomatic encirclement and war finance without collapsing legitimacy.",
  "level.gloryUnderStrain.ending.victoryWarDevolutionExtra":
    "Europe still remembers your earlier offensives. Rivals never fully trust French restraint, but careful reconstruction after war keeps the crown standing.",
  "level.gloryUnderStrain.ending.defeat":
    "The burdens of hegemony break the regime. Fiscal strain, social unrest, and diplomatic pressure outpace royal control, leaving the crown weakened and isolated.",
  "status.europeAlert.name": "Europe Alert",
  "status.europeAlert.hint":
    "Europe Alert tracks progress (1-10): start at 3; at 1-5, extra-event chance is progress×20%; at 6-10, at least 1 event is guaranteed and second-event chance is (progress-5)×20%.",
  "status.europeAlert.history":
    "Earlier French offensives hardened long-run coalition vigilance across Europe.",
  "status.europeAlert.stage.eased.name": "Eased (1-2)",
  "status.europeAlert.stage.eased.desc":
    "Rival coordination is present but measured; pressure channels are still mostly diplomatic.",
  "status.europeAlert.stage.alert.name": "Alert (3-4)",
  "status.europeAlert.stage.alert.desc":
    "Monitoring and signaling intensify as neighboring courts test French commitments.",
  "status.europeAlert.stage.containment.name": "Containment (5-6)",
  "status.europeAlert.stage.containment.desc":
    "Neighbors coordinate practical balancing steps to slow French room for maneuver.",
  "status.europeAlert.stage.hostile.name": "Hostile (7-8)",
  "status.europeAlert.stage.hostile.desc":
    "Economic and military pressure shifts from warning to active obstruction.",
  "status.europeAlert.stage.conflict.name": "Conflict (9-10)",
  "status.europeAlert.stage.conflict.desc":
    "The system enters overt confrontation and dual-crisis pressure becomes routine.",
  "status.antiFrenchSentiment.name": "Anti-French Sentiment",
  "status.antiFrenchSentiment.emotionLabel": "Sentiment {x}",
  "status.antiFrenchSentiment.detail":
    "Sentiment {x}: the current number of Anti-French Containment cards in your full library. While this status is active, Peace of Ryswick gains an extra +{n} Funding cost.",
  "status.antiFrenchSentiment.history":
    "After the 1670s, France's military and fiscal expansion convinced rival courts that temporary truces were no longer enough. A broader anti-French consensus emerged, with states increasingly coordinating diplomacy, trade pressure, and military readiness to contain Bourbon influence. Mechanically: once Power+Treasury is high enough, Europe-Alert-linked funding solutions become more expensive, and this status also adds recurring containment pressure through deck disruption until that combined strength falls back down.",
  "event.nymwegenSettlement.name": "Treaties of Nijmegen",
  "event.nymwegenSettlement.desc":
    "A mandatory long-running crisis: pay (Europe Alert progress + 3) Funding to secure the settlement (Power -2, Treasury -1, Legitimacy -1). This does not remove Europe Alert; if ignored, lose 1 Power each year.",
  "event.revocationNantes.name": "Policy on the Edict of Nantes",
  "event.revocationNantes.desc":
    "In 1598, Henry IV issued the Edict of Nantes to end the French Wars of Religion: Catholicism remained the state faith, while French Protestants (Huguenots) received limited worship rights, civil protections, and security guarantees. The crown now revokes it. This is a Continued event: if ignored, you draw 2 fewer cards each turn and it stays on the board. Resolve by choosing one policy: Religious Tolerance (immediate Legitimacy -1; gain permanent Religious Tolerance, which makes a single roll each turn that injects at most one of three confessional crises—Jansenist controversy (15%), Arminian polemic (15%), or Huguenot underground agitation (15%), for a 45% combined chance; the roll is skipped if any of the three is already on the board or no event slot is free; note that resolving Arminian Polemic or Huguenot Underground Agitation, each costing 1 Funding, also inserts 1 Religious Tension card into the draw pile, cost 2, purged from the deck on play rather than discarded), or Harsh Crackdown (no immediate numeric change; gain Contain Huguenot Remnants 3 and add 3 “Suppress the Huguenots” cards to deck, cost 3 each; each play reduces remnants by 1; at 0, remove the status and purge those cards from hand/deck/discard). While that containment status remains active, every 2 turns (at the end of the event phase) a Huguenot resurgence triggers: 1 extra “Suppress the Huguenots” card is added to the deck and remnants +1, modeling clandestine networks rebuilding faster than the crackdown can finish. While that containment status exists, Chapter 2 victory is blocked.",
  "event.leagueOfAugsburg.name": "League of Augsburg Forms",
  "event.leagueOfAugsburg.desc":
    "After the 1680s, French expansion along the Rhine and into the Low Countries fed sustained alarm among the neighboring courts. In 1686, princes of the Holy Roman Empire, the Habsburgs, and German states aligned at Augsburg, and over the following years England, the Dutch Republic, and Spain progressively joined the anti-French coordination. For Louis XIV this was no longer a passing diplomatic friction: the European balance was hardening into an institutionalized alliance constraint on France. Mechanically, this is a continuous diplomatic pressure tagged Remaining 3 — it must be resolved 3 times in total before it is fully removed. On any turn it is not resolved, you lose 1 Power and 1 Treasury at end of turn (the Remaining counter is not consumed). Each time you pay 2 Funding (or use Intervention) it counts as one resolve: this turn avoids the unresolved penalty, but the event remains next turn until Remaining reaches 0.",
  "event.nineYearsWar.name": "The Nine Years' War",
  "event.nineYearsWar.desc":
    "From 1688, the Nine Years' War grew out of the League of Augsburg system into a continent-wide struggle over the European balance of power. Fighting stretched from the Rhineland and the Low Countries to maritime routes and colonial fronts, turning fiscal endurance into the core test of state capacity. In game terms, this is a Continued crisis: you can campaign each turn by paying floor(Europe Alert progress / 2) + 1 Funding (or using Intervention), while delay risks legitimacy setbacks and ongoing fiscal drag.",
  "event.ryswickPeace.name": "Peace of Ryswick",
  "event.ryswickPeace.desc":
    "Peace terms can restore order. Invest (Europe Alert progress + 2) Funding to gain Legitimacy +1 and clear Europe Alert. If the Nine Years' War is still active, this solve cost gains an additional +4. While Anti-French Sentiment is active, this cost also gains +2x (x = current Anti-French Containment cards in your full library). Resolving this event also ends the Nine Years' War completely. This event is Continued: if unresolved, Legitimacy -1 each turn.",
  "event.versaillesExpenditure.name": "Versailles Expenditure",
  "event.versaillesExpenditure.desc":
    "Court spending rises again. Pay 3 Funding or use Intervention; if unresolved, lose 2 Treasury.",
  "event.nobleResentment.name": "Noble Resentment",
  "event.nobleResentment.desc":
    "Elite resistance grows at court and in the provinces. Pay 2 Funding or Intervention, or gain Loss of Authority for 3 turns.",
  "event.provincialNoncompliance.name": "Provincial Noncompliance",
  "event.provincialNoncompliance.desc":
    "Local officials stall implementation. Pay 2 Funding or suffer draw -2 next year, then draw -1 in each of the next two years.",
  "event.risingGrainPrices.name": "Rising Grain Prices",
  "event.risingGrainPrices.desc":
    "Food pressure drives unrest. Pay 3 Funding or use Intervention; if unresolved, lose 2 Legitimacy.",
  "event.taxResistance.name": "Tax Resistance",
  "event.taxResistance.desc":
    "Communities and elites resist levies. Pay 2 Funding or use Intervention; if unresolved, lose 1 Treasury and 1 Legitimacy.",
  "event.frontierGarrisons.name": "Frontier Garrisons",
  "event.frontierGarrisons.desc":
    "Border garrisons consume revenue. Pay 3 Funding or lose 1 Treasury and take a draw penalty next year.",
  "event.tradeDisruption.name": "Trade Disruption",
  "event.tradeDisruption.desc":
    "Sea lanes and convoy risk cut into policy bandwidth. Pay 1 Funding or take a -2 draw modifier next year.",
  "event.embargoCoalition.name": "Embargo Coalition",
  "event.embargoCoalition.desc":
    "Maritime restrictions tighten around French commerce. Pay 2 Funding, or lose 1 Treasury and suffer a draw penalty next year.",
  "event.mercenaryRaiders.name": "Mercenary Raiders",
  "event.mercenaryRaiders.desc":
    "Paid border raiders disrupt local order and crown authority. Pay 2 Funding, or lose 1 Power and 1 Legitimacy.",
  "event.localWar.name": "Local War",
  "event.localWar.desc":
    "Europe Alert fuels a regional conflict. Intervention cannot resolve this event. Choose Attack (pay floor(Europe Alert progress / 2) Funding, then apply Anti-French Sentiment surcharge if active; equal 1/3 outcomes: Local Victory [Power +1, Legitimacy +1], Stalemate [no change], Minor Loss [Power -1]) or Appease (no Funding cost, Legitimacy -1). This is a Continued event: if left unresolved, next turn's Funding income is reduced by 2 (not below 0).",
  "event.courtScandal.name": "Court Scandal",
  "event.courtScandal.desc":
    "Factional intrigue weakens authority. Pay 3 Funding to contain it; if unresolved, Legitimacy -1 and all Royal-tag cards are blocked next turn.",
  "event.militaryPrestige.name": "Military Prestige",
  "event.militaryPrestige.desc":
    "A chance to convert battlefield image into authority. Invest 2 Funding for Legitimacy +1.",
  "event.commercialExpansion.name": "Commercial Expansion",
  "event.commercialExpansion.desc":
    "Merchants request support for growth. Invest 2 Funding for Treasury +1.",
  "event.talentedAdministrator.name": "Talented Administrator",
  "event.talentedAdministrator.desc":
    "A capable official can be elevated. Invest 2 Funding for Power +1.",
  "event.warWeariness.name": "War Weariness",
  "event.warWeariness.desc":
    "Long conflict exhausts support. Pay 3 Funding or Intervention, or lose 1 Legitimacy and gain Loss of Authority for 2 turns.",
  "event.jesuitPatronage.name": "Jesuit Patronage",
  "event.jesuitPatronage.desc":
    "Père François de La Chaise, Louis XIV's Jesuit confessor since 1675, channels the Society of Jesus' patronage. Its elite collèges — La Flèche (where Descartes was schooled), Louis-le-Grand in Paris, and Clermont — train officers, magistrates, and clergy under royal-aligned doctrine, weaving the Crown into a transnational Catholic education and missionary network. Jesuit theologians had also been the sharpest opponents of Jansenism since the Augustinus controversy of the 1640s, and their pulpits could blunt local Jansenist agitation when the Crown leaned on them. The same prominence, however, fuels resentment from the Gallican episcopate, the Sorbonne, and Jansenist circles who see Jesuit ultramontanism as a threat to French ecclesiastical autonomy. Pay 2 Funding to deepen the partnership: add 2 Jesuit Collège cards (cost 2, Remaining 1/1, Legitimacy +1, also instantly resolves one unresolved Jansenist Controversy on play) and 1 Religious Tension card to your draw pile. If unresolved, no penalty.",
  "event.expansionRemembered.name": "Expansion Remembered",
  "event.expansionRemembered.desc":
    "Earlier expansion still casts a long shadow. Pay 2 Funding to contain it and add 2 Fiscal Burden cards to your deck; if unresolved, 3 Fiscal Burden cards are added.",
  "event.cautiousCrown.name": "Cautious Crown",
  "event.cautiousCrown.desc":
    "Earlier restraint buys only limited room. Pay 2 Funding to resolve it; if ignored, lose 1 Power each year.",
  "card.grainRelief.name": "Grain Relief Program",
  "card.grainRelief.background":
    "Emergency grain purchasing and provincial relief channels cool unrest before shortages become revolt.",
  "card.grainRelief.desc":
    "Gain Relief Coordination and Relief Confidence for 1 turn (next turn: +1 draw attempt and Legitimacy +1). If an unresolved Rising Grain Prices event exists, immediately resolve one.",
  "card.taxRebalance.name": "Tax Rebalancing",
  "card.taxRebalance.background":
    "Reallocate burdens and close loopholes to keep revenue flowing without immediate breakdown.",
  "card.taxRebalance.desc": "Treasury +1. Gain Draw Penalty (draw -1) for 2 turns.",
  "card.diplomaticCongress.name": "Diplomatic Congress",
  "card.diplomaticCongress.background":
    "Envoys, conferences, and guarantees buy breathing room while rivals test your frontiers.",
  "card.diplomaticCongress.desc": "Power +1. Add 1 extra Diplomatic Intervention to your hand.",
  "card.diplomaticIntervention.name": "Diplomatic Intervention",
  "card.diplomaticIntervention.background":
    "Apply pressure through envoys and treaty leverage rather than direct royal command.",
  "card.diplomaticIntervention.desc":
    "Extra card. Resolve one harmful event (not Colonial Trade Boom). Not a Royal-tag card; when Remaining is exhausted there is no extra penalty, it simply leaves circulation. Excluded from chapter refit and removed when the chapter ends.",
} as const;

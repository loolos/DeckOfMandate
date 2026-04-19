/** Shared UI / cards / events — not tied to a single level id. */
export const messagesEnCore = {
  "app.title": "Deck of Mandate",
  "app.subtitle": "The Rising Sun",
  "menu.introContinue": "Enter game",
  "banner.turn": "Turn {turn} / {limit}",
  "phase.action": "Action phase — play cards, solve events, then end the turn.",
  "phase.retention": "End of turn — choose cards to retain (up to Legitimacy).",
  "phase.gameOver": "Run ended.",
  "resource.treasuryStat": "Treasury",
  "resource.treasuryStat.hint": "Adds to turnly Funding.",
  "resource.funding": "Funding",
  "resource.funding.hint": "Pays cards & events.",
  "resource.power": "Power",
  "resource.power.hint": "Draw attempts each turn.",
  "resource.legitimacy": "Legitimacy",
  "resource.legitimacy.hint": "Retention cap; 0 ends the run.",
  "ui.resources": "Resources",
  "ui.resourceMobileExpand": "Tap for full labels and hints.",
  "ui.resourceMobileCollapse": "Tap to collapse resource details",
  "ui.endTurn": "End turn",
  "ui.solve": "Solve ({cost})",
  "ui.solveCrackdown": "Resolve (Intervention)",
  "ui.solveFundingOrCrackdown": "Pay {cost} or Intervention",
  "ui.scriptedAttack": "Attack ({cost})",
  "ui.nantesTolerance": "Religious Tolerance",
  "ui.nantesCrackdown": "Harsh Crackdown",
  "ui.localWarAttack": "Attack ({cost})",
  "ui.localWarAppease": "Appease",
  "ui.resolved": "Resolved",
  "ui.harmful": "Harmful",
  "ui.opportunity": "Opportunity",
  "ui.historical": "Historical",
  "ui.continued": "Continued",
  "ui.continuedTurns": "Continued {n}",
  "ui.remainingTurns": "Remaining {n}",
  "ui.deck": "Deck",
  "ui.discard": "Discard",
  "ui.quickFrame.cost": "Cost",
  "ui.quickFrame.onPlay": "When played",
  "ui.quickFrame.pay": "Solve with",
  "ui.quickFrame.ifSolved": "On solve",
  "ui.quickFrame.yearEnd": "Year-end if still open",
  "ui.hand": "Hand",
  "ui.events": "Events",
  "ui.eventsResizeHint": "Drag the bottom-right corner to resize the events area.",
  "ui.mobileLogTapHint":
    "Small screen: tap events, statuses, and hand cards to expand details; double-click any hand card (compact or expanded) to play it.",
  "ui.playThisCard": "Play this card",
  "log.crackdownPickPrompt":
    "[Turn {turn}] Choose a harmful event to resolve with Intervention (not Colonial Trade Boom).",
  "ui.cancel": "Cancel",
  "ui.confirmRetention": "Confirm retention",
  "ui.newGame": "New run",
  "menu.title": "Main menu",
  "menu.resumeSave": "Resume saved run",
  "menu.levelLabel": "Level",
  "menu.seedLabel": "Run seed (optional)",
  "menu.seedPlaceholder": "Random if empty",
  "menu.seedHint": "Leave blank for a random seed. The same seed reproduces deck order and early events.",
  "menu.seedInvalid": "Enter a valid finite number.",
  "menu.startConfigured": "Start",
  "menu.continueChapter2": "Continue to Chapter 2",
  "menu.refit.title": "Chapter Transition Deck Refit",
  "menu.refit.subtitle": "Rebuild your deck for high-pressure governance.",
  "menu.refit.adjustable": "Carryover cards",
  "menu.refit.newCards": "Chapter 2 new cards",
  "menu.refit.mode.standalone": "Mode: standalone Chapter 2 start",
  "menu.refit.mode.continuity": "Mode: continue from Chapter 1 victory",
  "menu.refit.resources": "Starting resources — Treasury {treasury}, Power {power}, Legitimacy {legitimacy}",
  "menu.refit.startYear": "Chapter 2 start year: {year}",
  "menu.refit.europeAlertOn":
    "Europe Alert: ON (progress starts at 3/10. At progress 1-5, extra-event chance is progress×20%; at 6-10, at least 1 extra event is guaranteed and second-event chance is (progress-5)×20%).",
  "menu.refit.europeAlertOff": "Europe Alert: OFF (standard Chapter 2 pressure).",
  "menu.refit.totalCards": "Deck size: {current} (required {min}–{max})",
  "menu.refit.totalCards.simple": "Deck size after removals: {current}",
  "menu.refit.newCardTotal": "New cards chosen: {current} / {max}",
  "menu.refit.baseAdjustTotal": "Carryover-card adjustments: {current} / {max}",
  "menu.refit.continuityRule":
    "Refit rule: remove 0–{max} Chapter 1 carryover cards only; the three Chapter 2 new cards are fixed at +1 each.",
  "menu.refit.mobileDoubleToggleHint":
    "On small screens, double-click a card row to toggle “Remove this card”.",
  "menu.refit.removeToggle": "Remove this card",
  "menu.refit.invalid": "Deck rules not met yet.",
  "menu.refit.start": "Start Chapter 2",
  "menu.refit.back": "Back",
  "menu.refit.reset": "Reset to entry state",
  "menu.refit.presetHistorical": "Historical recommendation",
  "menu.refit.presetWar": "War pressure preset",
  "menu.tutorialOnLevelEntry": "Show interface tutorial when entering a level",
  "menu.tutorialOnLevelEntryHint": "A short English walkthrough highlighting goals, resources, events, and your hand. Off by default.",
  "ui.statuses": "Ongoing effects",
  "ui.statuses.empty": "No ongoing effects.",
  "ui.statusTurnsRemaining": "{n} turn(s) left",
  "ui.statusPermanent": "Permanent",
  "ui.statusHuguenotRemaining": "Remnants {n}",
  "ui.statusDetail.drawAttemptsDelta": "Draw attempts modifier each turn: {delta}.",
  "ui.statusDetail.retentionCapacityDelta": "Retention cap modifier at turn end: {delta}.",
  "ui.statusDetail.beginYearResourceDelta": "At turn start: {resource} {delta}.",
  "ui.statusDetail.blockCardTag": "Cards with the “{tag}” tag cannot be played.",
  "ui.actionLog": "Action log",
  "ui.actionLog.empty": "No effects yet this run.",
  "ui.targets": "Level goals — within {limit} turns: Treasury {tT}, Power {tP}, Legitimacy {tL}",
  "ui.targets.secondMandateExtra":
    "Chapter 2 victory has only two conditions: Europe Alert must be cleared, and victory is blocked before 1696.",
  "ui.language": "Language",
  "ui.lang.en": "English",
  "ui.lang.zh": "中文",
  "ui.lang.fr": "Français",
  "outcome.victory": "Victory — mandate secured.",
  "outcome.defeatLegitimacy": "Defeat — a core resource collapsed.",
  "outcome.defeatTime": "Defeat — time ran out before targets were met.",
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
    "When drawn, lose 1 Funding. You may pay 2 Funding to purge it (removed, not discarded).",
  "card.antiFrenchContainment.name": "Anti-French Containment",
  "card.antiFrenchContainment.background":
    "European courts coordinate tariffs, credit pressure, and maritime checks to narrow French options.",
  "card.antiFrenchContainment.desc":
    "When drawn, 50/50: lose 1 Power or lose 1 Legitimacy. You may pay floor(Europe Alert progress/2) Funding to purge it (removed, not discarded).",
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
  "event.budgetStrain.name": "Court Overspending",
  "event.budgetStrain.desc":
    "Versailles expansion and court ritual push spending past the budget. Pay 2 Funding or lose 1 Treasury.",
  "event.publicUnrest.name": "Paris Unrest",
  "event.publicUnrest.desc":
    "Bread prices and rumor fill the streets. Intervention only, or lose 1 Legitimacy.",
  "event.administrativeDelay.name": "Bureaucratic Delay",
  "event.administrativeDelay.desc":
    "Provincial officials slow-walk new orders from the court. Pay 1 Funding or draw one fewer next turn (min 1 draw).",
  "event.tradeOpportunity.name": "Colonial Trade Boom",
  "event.tradeOpportunity.desc":
    "Sea lanes and merchants ask for crown support. Pay 1 Funding to gain +1 Treasury. No penalty if ignored.",
  "event.powerVacuum.name": "Provincial Governor Ascendant",
  "event.powerVacuum.desc":
    "A governor bypasses the court. Pay 2 Funding or Intervention, or escalate to Royal Crisis next turn.",
  "event.majorCrisis.name": "Royal Crisis",
  "event.majorCrisis.desc":
    "Intervention only. Tagged Continued: if unresolved it remains into next turn and repeats Legitimacy -1 plus draw penalty each year until solved.",
  "event.politicalGridlock.name": "Noble Resistance",
  "event.politicalGridlock.desc":
    "Great nobles unite against your fiscal scheme. Pay 2 Funding or suffer Loss of Authority for 3 turns (−1 draw attempt each turn, min 1 draw).",
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
    "Tolerance lowers immediate coercion but leaves recurring confessional flashpoints.",
  "status.huguenotContainment.name": "Contain Huguenot Remnants",
  "status.huguenotContainment.history":
    "Harsh repression demands sustained policing campaigns and political bandwidth.",
  "status.huguenotContainment.hint": "While active, Chapter 2 victory is blocked.",
  "event.religiousTension.name": "Religious Tension",
  "event.religiousTension.desc": "Confessional conflict flares again. Pay 2 Funding or lose 1 Legitimacy.",
  "card.tag.royal": "Royal",
  "card.tag.temp": "Temp",
  "card.tag.extra": "Extra",
  "card.tag.inflation": "Inflation",
  "card.tag.remainingUses": "Remaining {remaining}/{total}",
  "log.cardPlayed.title": "[Turn {turn}] {card} — paid {cost} {funding}.",
  "log.cardPlayed.effectsLabel": "Effects:",
  "log.cardPlayed.noEffects": "No listed effects.",
  "log.effect.modResource": "{resource} {delta}",
  "log.effect.gainFunding": "{funding} +{amount}",
  "log.effect.drawCards": "Draw {count}",
  "log.effect.scheduleNextTurnDrawModifier": "Next-year draw modifier {delta}",
  "log.effect.scheduleDrawModifiers": "Multi-year draw modifiers {deltas}",
  "log.effect.setCardTagBlocked": "Block {tag} cards ({turns} turns)",
  "log.effect.addPlayerStatus": "{status} ({turns} turns)",
  "log.effect.addCardsToDeck": "Add {count} {card} to deck",
  "log.eventFundSolved": "[Turn {turn}] {event}. Paid {paid} {funding}{treasury}",
  "log.eventFundSolved.treasury": " Treasury +{gain}.",
  "log.eventCrackdownSolved": "[Turn {turn}] Intervention cleared {event} (spent {paid} {funding}).",
  "log.eventYearEndPenalty.title": "[Turn {turn}] Year-end: {event} unresolved.",
  "log.eventYearEndPenalty.effectsLabel": "Penalties:",
  "log.eventPowerVacuumScheduled": "[Turn {turn}] Year-end: {event} — Royal Crisis next year.",
  "log.crackdownCancelled": "[Turn {turn}] Intervention cancelled; refunded {refund} {funding}.",
  "log.eventScriptedAttack.generic":
    "[Turn {turn}] {event} — military option. Paid {paid} {funding}.{treasury}",
  "log.drawCards.title": "[Turn {turn}] Drew {count} card(s): {cards}.",
  "log.drawOverflowDiscarded.title":
    "[Turn {turn}] Hand reached cap; discarded {count} undrawn card(s): {cards}.",
  "log.europeAlertProgressShift":
    "[Turn {turn}] Europe Alert adjusted {from}→{to} (k={k}, trigger chance {pct}%).",
  "log.info.firstMandateInflationActivated":
    "[Turn {turn}] As Colbert-style reforms and Versailles court politics scale up together, the stronger the royal machine gets, the more expensive it is to keep running. Chapter 1 inflation is now active: from now on, only cards with the “Inflation” tag gain extra cost when they cycle from discard back into deck.",
  "log.info.chapter2EuropeAlertOn":
    "[Turn {turn}] Chapter 2 starts with Europe Alert active: alert progress starts at 3/10 and controls yearly extra events (1-5: progress×20%; 6-10: guaranteed 1 + possible second event).",
  "log.info.chapter2EuropeAlertOff":
    "[Turn {turn}] Chapter 2 starts with Europe Alert inactive: no Europe-Alert supplemental event checks.",
  "log.info.antiFrenchSentimentActivated":
    "[Turn {turn}] Anti-French Sentiment rises: when Power+Treasury exceeds 20, every full +5 overflow raises all funding-based event solve costs by +1.",
  "log.info.antiFrenchSentimentEnded":
    "[Turn {turn}] Anti-French Sentiment recedes: once Power+Treasury returns to 20 or below, the extra event-cost pressure is removed.",
  "log.info.cardTag.royal":
    "[Turn {turn}] Tag note “Royal”: this is a royal-command tool, and some crises can only be cleared through royal intervention routes.",
  "log.info.cardTag.temp":
    "[Turn {turn}] Tag note “Temp”: this card is temporary and usually does not cycle back through discard after play.",
  "log.info.cardTag.extra":
    "[Turn {turn}] Tag note “Extra”: this card was added by other effects, is excluded from chapter refit, and is removed when the chapter ends.",
  "log.info.cardTag.inflation":
    "[Turn {turn}] Tag note “Inflation”: once inflation is active, this card’s cost stacks upward whenever it cycles through reshuffle and redraw.",
  "log.info.cardUse.remainingUses": "[Turn {turn}] Tag note “Remaining”: this card currently has X/Y uses left; each play spends one, and it leaves circulation at 0.",
  "log.info.cardUse.depleted.crackdownPenalty":
    "[Turn {turn}] Royal Intervention reached 0/3 and was removed from circulation; court coercive leverage slips (Power -1).",
  "log.info.cardUse.depleted.fundingPenalty":
    "[Turn {turn}] Royal Levy reached 0/3 and was removed from circulation; emergency extraction channels dry up (Treasury -1).",
  "log.info.cardUse.depleted.diplomaticIntervention":
    "[Turn {turn}] Diplomatic Intervention reached 0/3 and was removed from circulation.",
  "log.info.eventTag.harmful":
    "[Turn {turn}] Tag note “Harmful”: if unresolved at year end, this event applies penalties.",
  "log.info.eventTag.opportunity":
    "[Turn {turn}] Tag note “Opportunity”: this is an optional upside event and usually has no penalty if ignored.",
  "log.info.eventTag.historical":
    "[Turn {turn}] Tag note “Historical”: this event is based on real history and has no extra gameplay effect by itself.",
  "log.info.eventTag.continued":
    "[Turn {turn}] Tag note “Continued”: if unresolved, this event remains into the next year and repeats its negative effects.",
  "log.info.eventTag.resolved":
    "[Turn {turn}] Tag note “Resolved”: this event has already been handled this year and will not apply year-end penalties.",
  "help.short":
    "Treasury sets turnly income to Funding. Funding pays for cards and event solves. Power sets draw attempts. Legitimacy sets retention limit. Unresolved harmful events are settled in sequence.",
} as const;

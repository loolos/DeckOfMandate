/** Shared UI / engine strings — campaign card/event/status copy lives in `src/levels/sunking/locales`. */
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
  "resource.power.hint":
    "Draw attempts grow on a Power threshold ladder (1/2/4/7/11/16…): cross the next threshold for +1 attempt; drop below the current threshold for −1. Expand the resource detail for the full rules and examples.",
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
  "menu.runCodeLoad": "Load from run code",
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
  "ui.levelLocaleFallback":
    "This level is not fully translated for your current interface language. Level-specific text may fall back to English.",
  "ui.language": "Language",
  "ui.lang.en": "English",
  "ui.lang.zh": "中文",
  "ui.lang.fr": "Français",
  "outcome.victory": "Victory — mandate secured.",
  "outcome.defeatLegitimacy": "Defeat — a core resource collapsed.",
  "outcome.defeatTime": "Defeat — time ran out before targets were met.",
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
  "log.eventLocalWarChoice.attack":
    "[Turn {turn}] {event} — chose attack, paid {paid} {funding}; impact: {outcome}.",
  "log.eventLocalWarChoice.appease":
    "[Turn {turn}] {event} — chose appeasement; impact: {legitimacy} -1.",
  "log.eventLocalWarChoice.attackOutcome.success":
    "{power} +1 and {legitimacy} +1. Frontier victories briefly lift court prestige, and neighboring states ease off testing France's limits.",
  "log.eventLocalWarChoice.attackOutcome.stalemate":
    "limited gains; no immediate resource swing. Siege-and-supply deadlock repeats the attritional logic of the \"small wars between great wars.\"",
  "log.eventLocalWarChoice.attackOutcome.setback":
    "{power} -1. A failed raid exposes cracks in local military coordination and encourages rival courts to keep up pressure.",
  "log.eventNineYearsWarCampaign.title":
    "[Turn {turn}] {event}: used {method} (paid {paid} {funding}) — {outcome}.",
  "log.eventNineYearsWarCampaign.method.funding": "Funding",
  "log.eventNineYearsWarCampaign.method.intervention": "Intervention",
  "log.eventNineYearsWarCampaign.outcome.decisiveVictory":
    "decisive victory; war pressure ends. From the Rhineland to the Low Countries, coalition momentum falters and coordinated offensives lose pace.",
  "log.eventNineYearsWarCampaign.outcome.stalemate":
    "stalemate; front remains unchanged. The balance-of-power struggle stays locked in a fiscal and credit endurance contest.",
  "log.eventNineYearsWarCampaign.outcome.limitedGains":
    "limited gains; {legitimacy} +1. Tactical success steadies domestic confidence, but does not yet break the long-war attrition pattern.",
  "log.eventNineYearsWarCampaign.history":
    "Historical note: the Nine Years' War (1688–1697) stretched from the Rhineland and Low Countries to maritime theaters, exhausting state finances across Europe.",
  "log.eventNineYearsWarFiscalBurden.title":
    "[Turn {turn}] {event} remains active at year-end: add 1 {card} to your deck.",
  "log.eventNineYearsWarFiscalBurden.history":
    "Historical note: prolonged mobilization forced extraordinary loans, arrears, and tax pressure that kept compounding fiscal strain.",
  "log.huguenotResurgence.title":
    "[Turn {turn}] Contain Huguenot Remnants is still active: clandestine Huguenot networks regroup through tolerance gaps and exile routes. Add {addedCount} {card} to your deck; remnant strength rises to {remainingStacks}.",
  "log.huguenotResurgence.history":
    "Historical note: after the 1685 Edict of Fontainebleau, Huguenots went underground or into exile, but their assemblies, printing, and mutual-aid networks kept reforming in the countryside and on the borders, demanding fresh waves of repression every few years.",
  "log.drawCards.title": "[Turn {turn}] Drew {count} card(s): {cards}.",
  "log.drawOverflowDiscarded.title":
    "[Turn {turn}] Hand reached cap; discarded {count} undrawn card(s): {cards}.",
  "log.europeAlertProgressShift":
    "[Turn {turn}] Europe Alert adjusted {from}→{to} (k={k}, trigger chance {pct}%).",
  "log.info.chapter2EuropeAlertOn":
    "[Turn {turn}] Chapter 2 starts with Europe Alert active: alert progress starts at 3/10 and controls yearly extra events (1-5: progress×20%; 6-10: guaranteed 1 + possible second event).",
  "log.info.chapter2EuropeAlertOff":
    "[Turn {turn}] Chapter 2 starts with Europe Alert inactive: no Europe-Alert supplemental event checks.",
  "log.info.antiFrenchSentimentActivated":
    "[Turn {turn}] Anti-French Sentiment rises: when Power+Treasury exceeds 20, Europe-Alert-linked funding solves gain +1 immediately, then +1 per additional full +5 overflow. The status now also shows Sentiment x (x = Anti-French Containment cards in your full library), and Peace of Ryswick gains an extra +2x Funding while this status is active.",
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
  "log.info.cardDraw.fiscalBurdenTriggered":
    "[Turn {turn}] On draw, Fiscal Burden triggered: Funding -1.",
  "log.info.cardDraw.antiFrenchContainmentPowerLoss":
    "[Turn {turn}] On draw, Anti-French Containment triggered: Power -1.",
  "log.info.cardDraw.antiFrenchContainmentLegitimacyLoss":
    "[Turn {turn}] On draw, Anti-French Containment triggered: Legitimacy -1.",
  "log.info.nantesPolicy.toleranceNoFontainebleau":
    "[Turn {turn}] You chose Religious Tolerance: the crown does not issue a Fontainebleau-style full revocation decree this year. Immediate pressure eases, but confessional disputes will keep resurfacing.",
  "log.info.nantesPolicy.crackdownFontainebleauIssued":
    "[Turn {turn}] You chose Harsh Crackdown: policy shifts toward a Fontainebleau-style decree, withdrawing Protestant protections and intensifying forced conversion pressure. Compliance rises short-term, but long-run governance costs increase.",
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
  "runCode.label": "Run code",
  "runCode.charCount": "len {count}",
  "runCode.copy": "Copy",
  "runCode.copied": "Copied",
  "runCode.loadPlaceholder": "Paste a hex run code to load…",
  "runCode.load": "Load",
  "runCode.invalid": "Invalid code: {error}",
} as const;

/**
 * English copy for level `firstMandate` (The Rising Sun, France 1661–1676).
 * Keys mirror `levels.ts` / scripted content for this scenario.
 */
export const messagesEnFirstMandate = {
  "level.risingSun.name": "The Rising Sun",
  "level.risingSun.introTitle": "France, 1661 — The Sun King rises",
  "level.risingSun.introBody":
    "In 1661, after Cardinal Mazarin’s death, Louis XIV took personal rule and refused another first minister. France became Europe’s most ambitious monarchy: Colbert’s finances and manufactures, expanding bureaucracy, and a court culture that bound nobles to Versailles.\n\nWar and diplomacy followed—Devolution, then wider struggles into the 1670s. Glory grew expensive: court spending, armies, and restless Paris beneath a gleaming crown.\n\nYou steer those early years. Centralize authority, fund reform, and survive crises—before legitimacy fails or time runs out.",
  "level.risingSun.ending.victory":
    "Louis XIV has secured the crown’s authority and brought the great nobles under control. Royal officials now enforce policy across the provinces, while taxes, trade, and industry steadily enrich the treasury. Court ceremony at Versailles turns ambition into obedience, binding rival elites to the monarchy. France stands stronger, richer, and more centralized than before. Across Europe, other powers begin to watch with caution as a new continental giant rises under the Sun King.",
  "level.risingSun.ending.victoryWarDevolutionExtra":
    "The campaigns through the Spanish Netherlands and Franche-Comté echo the triumphs of 1667–1668: frontier fortresses fall and silver flows into the royal accounts. Yet the shock of French arms also forged the Triple Alliance—England, the Dutch Republic, and Sweden—reminding every minister that each gain on the map will be bargained over in chancelleries as fiercely as on the battlefield.",
  "level.risingSun.ending.defeat":
    "Royal authority collapses under debt, disorder, and resistance. Provinces ignore Paris, nobles revive private power, and officials delay or refuse the king’s commands. Tax revenues shrink as unrest spreads through towns and countryside alike. Rumors of weakness invite foreign intrigue and domestic conspiracies. The dream of centralized monarchy breaks apart before it is complete, and France returns to a divided realm where the crown is feared less each passing year.",
  "event.warOfDevolution.name": "War of Devolution",
  "event.warOfDevolution.desc":
    "Louis presses claims on the Spanish Netherlands and Franche-Comté. You may launch the campaign (costs and rewards below). Success alarms neighbors: after an attack, the Triple Alliance may coordinate—each year there is a chance to draw one fewer card (never below 1). The issue stays on the board through 1669 unless you attack.",
  "status.antiFrenchLeague.name": "Anti-French coalition",
  "status.antiFrenchLeague.hint": "Each year: {pct}% chance of −1 draw (min 1).",
  "log.eventScriptedAttack.war.title":
    "[Turn {turn}] Slot {slot}: {event} — campaign in the Spanish Netherlands and Franche-Comté.",
  "log.eventScriptedAttack.war.summary":
    "French arms push the devolution claim (1667–1668). Paid {paid} {funding}. {power} +{powerDelta}.",
  "log.eventScriptedAttack.war.treasuryYes":
    "Towns, ransoms, or levies beat the odds (extra loot chance was {rollPct}%): {treasury} +{gain}.",
  "log.eventScriptedAttack.war.treasuryNo":
    "No windfall this season — the extra Treasury roll ({rollPct}%) did not pay off.",
  "log.eventScriptedAttack.war.coalitionNote":
    "The shock of French success helped push England, the Dutch Republic, and Sweden toward the Triple Alliance—diplomatic friction may now trim your options each year.",
  "log.antiFrenchLeagueDraw.title":
    "[Turn {turn}] Anti-French coordination: {pct}% hazard hit — one fewer card drawn this year (never below 1).",
  "log.antiFrenchLeagueDraw.history":
    "Envoys, subsidies, and threats along France’s borders echo the coalition diplomacy after the War of Devolution (Treaty of Aix-la-Chapelle, 1668).",
} as const;

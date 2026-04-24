/**
 * English copy for level `firstMandate` (The Rising Sun, France 1661–1675).
 * Keys mirror `levels.ts` / scripted content for this scenario.
 */
export const messagesEnFirstMandate = {
  "level.risingSun.name": "The Rising Sun",
  "level.risingSun.introTitle": "France, 1661 — The Sun King rises",
  "level.risingSun.introBody":
    "In 1661, after Cardinal Mazarin's death, the twenty-three-year-old Louis XIV declared personal rule and refused to appoint another first minister. France was emerging from the aftershocks of the Fronde and decades of war finance: the crown stood above great nobles in principle, yet still had to bargain with provincial privilege, debt burdens, and tax resistance in practice. It was already one of Europe's largest kingdoms by population and revenue base, but state capacity remained uneven and costly to enforce outside the center.\n\nFor the Bourbon dynasty, this was both the strongest and the most fragile moment. Since Henry IV established Bourbon rule in 1589, the monarchy had rebuilt order after the Wars of Religion, expanded central authority under Louis XIII and Richelieu, and gained major diplomatic weight by the end of the Thirty Years' War. By Louis XIV's accession era, the Bourbons inherited not only prestige as the leading Catholic monarchy in Europe, but also a structural obligation: keep fiscal-military mobilization running while containing noble and provincial centrifugal pressure.\n\nThis first chapter begins in that \"rising but not yet secure\" phase. You must strengthen the royal center and administrative reach while managing taxes, court expenditure, and military costs at home. Abroad, disputes over the Spanish Netherlands and frontier settlements will soon drive France toward the War of Devolution and trigger coordinated alarm against Bourbon expansion. Your task is not to enjoy finished hegemony, but to build it before it breaks.",
  "level.risingSun.ending.victory":
    "Louis XIV has secured the crown’s authority and brought the great nobles under control. Royal officials now enforce policy across the provinces, while taxes, trade, and industry steadily enrich the treasury. Court ceremony at Versailles turns ambition into obedience, binding rival elites to the monarchy. France stands stronger, richer, and more centralized than before. Across Europe, other powers begin to watch with caution as a new continental giant rises under the Sun King.",
  "level.risingSun.ending.victoryWarDevolutionExtra":
    "The campaigns through the Spanish Netherlands and Franche-Comté echo the triumphs of 1667–1668: frontier fortresses fall and silver flows into the royal accounts. Yet the shock of French arms also forged the Triple Alliance—England, the Dutch Republic, and Sweden—reminding every minister that each gain on the map will be bargained over in chancelleries as fiercely as on the battlefield.",
  "level.risingSun.ending.defeat":
    "Royal authority collapses under debt, disorder, and resistance. Provinces ignore Paris, nobles revive private power, and officials delay or refuse the king’s commands. Tax revenues shrink as unrest spreads through towns and countryside alike. Rumors of weakness invite foreign intrigue and domestic conspiracies. The dream of centralized monarchy breaks apart before it is complete, and France returns to a divided realm where the crown is feared less each passing year.",
  "event.warOfDevolution.name": "War of Devolution",
  "event.warOfDevolution.desc":
    "In 1667, Louis XIV advanced a dynastic “devolution” claim through Queen Maria Theresa against Spanish possessions in the Low Countries and Franche-Comté. French forces moved quickly with strong siegecraft and logistics, and the war ended in 1668 with the Treaty of Aix-la-Chapelle: France kept several fortified towns, but the shock of that success helped drive England, the Dutch Republic, and Sweden into the Triple Alliance to contain further Bourbon expansion. Mechanically, launching the campaign can deliver short-term gains but raises later coalition pressure; if you hold back, the issue continues to occupy a slot until 1669.",
  "status.antiFrenchLeague.name": "Anti-French coalition",
  "status.antiFrenchLeague.hint": "Each year: {pct}% chance of −1 draw (min 1).",
  "status.antiFrenchLeague.history":
    "French expansion provokes balancing diplomacy that hardens into sustained war pressure.",
  "log.eventScriptedAttack.war.title":
    "[Turn {turn}] {event} — campaign in the Spanish Netherlands and Franche-Comté.",
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

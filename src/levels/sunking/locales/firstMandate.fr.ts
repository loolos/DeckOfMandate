import { messagesEnFirstMandate } from "./firstMandate.en";

/**
 * Texte français pour le niveau `firstMandate` (Le Soleil levant, France 1661–1675).
 */
export const messagesFrFirstMandate: Record<keyof typeof messagesEnFirstMandate, string> = {
  ...messagesEnFirstMandate,
  "level.risingSun.name": "Le Soleil levant",
  "level.risingSun.introTitle": "France, 1661 — le Roi-Soleil s'élève",
  "level.risingSun.introBody":
    "En 1661, après la mort du cardinal Mazarin, Louis XIV prend le pouvoir personnel et refuse un nouveau premier ministre. La France devient la monarchie la plus ambitieuse d'Europe : finances et manufactures de Colbert, bureaucratie en expansion, et culture de cour qui attache les nobles à Versailles.\n\nViennent ensuite guerre et diplomatie — guerre de Dévolution, puis conflits plus larges dans les années 1670. La gloire coûte cher : dépenses de cour, armées, et agitation parisienne sous une couronne éclatante.\n\nVous dirigez ces premières années. Centralisez l'autorité, financez les réformes, et survivez aux crises — avant l'effondrement de la légitimité ou l'épuisement du temps.",
  "level.risingSun.ending.victory":
    "Louis XIV a consolidé l'autorité de la couronne et soumis les grands nobles. Les officiers royaux appliquent désormais la politique à travers les provinces, tandis que fiscalité, commerce et industrie enrichissent régulièrement le trésor. Le cérémonial de Versailles transforme l'ambition en obéissance, liant les élites rivales à la monarchie. La France est plus forte, plus riche et plus centralisée qu'auparavant. Partout en Europe, les autres puissances observent avec prudence l'ascension d'un nouveau géant continental sous le Roi-Soleil.",
  "level.risingSun.ending.victoryWarDevolutionExtra":
    "Les campagnes dans les Pays-Bas espagnols et en Franche-Comté rappellent les succès de 1667–1668 : les forteresses frontalières tombent et l'argent afflue vers les comptes royaux. Mais le choc des armes françaises a aussi forgé la Triple Alliance — Angleterre, Provinces-Unies et Suède — rappelant à chaque ministre que chaque gain territorial sera négocié dans les chancelleries aussi durement que sur le champ de bataille.",
  "level.risingSun.ending.defeat":
    "L'autorité royale s'effondre sous la dette, le désordre et les résistances. Les provinces ignorent Paris, les nobles restaurent leur pouvoir privé, et les officiers retardent ou refusent les ordres du roi. Les recettes fiscales diminuent tandis que les troubles gagnent villes et campagnes. Les rumeurs de faiblesse attirent intrigues étrangères et complots intérieurs. Le rêve de monarchie centralisée se brise avant d'être achevé, et la France redevient un royaume divisé où la couronne est chaque année moins redoutée.",
  "event.warOfDevolution.name": "Guerre de Dévolution",
  "event.warOfDevolution.desc":
    "Louis fait valoir ses droits sur les Pays-Bas espagnols et la Franche-Comté. Vous pouvez lancer la campagne (coûts et gains ci-dessous). Le succès inquiète les voisins : après une attaque, la Triple Alliance peut se coordonner — chaque année, il existe une chance de piocher une carte en moins (jamais sous 1). La question reste sur le plateau jusqu'en 1669 si vous n'attaquez pas.",
  "status.antiFrenchLeague.name": "Coalition anti-française",
  "status.antiFrenchLeague.hint": "Chaque année : {pct}% de chance de −1 pioche (min 1).",
  "status.antiFrenchLeague.history":
    "L'expansion française provoque une diplomatie d'équilibrage qui se durcit en pression de guerre durable.",
  "log.eventScriptedAttack.war.title":
    "[Tour {turn}] {event} — campagne dans les Pays-Bas espagnols et en Franche-Comté.",
  "log.eventScriptedAttack.war.summary":
    "Les armes françaises poussent la revendication de dévolution (1667–1668). Coût {paid} {funding}. {power} +{powerDelta}.",
  "log.eventScriptedAttack.war.treasuryYes":
    "Villes, rançons ou levées dépassent les attentes (chance de butin supplémentaire : {rollPct}%) : {treasury} +{gain}.",
  "log.eventScriptedAttack.war.treasuryNo":
    "Aubaine absente cette saison — le jet Trésor supplémentaire ({rollPct}%) n'a pas réussi.",
  "log.eventScriptedAttack.war.coalitionNote":
    "Le choc du succès français a poussé Angleterre, Provinces-Unies et Suède vers la Triple Alliance — la friction diplomatique peut désormais réduire vos marges chaque année.",
  "log.antiFrenchLeagueDraw.title":
    "[Tour {turn}] Coordination anti-française : risque {pct}% déclenché — une carte de moins piochée cette année (jamais sous 1).",
  "log.antiFrenchLeagueDraw.history":
    "Émissaires, subsides et menaces aux frontières de la France évoquent la diplomatie de coalition après la guerre de Dévolution (traité d'Aix-la-Chapelle, 1668).",
};

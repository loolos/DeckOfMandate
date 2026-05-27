import { messagesEnFirstMandate } from "./firstMandate.en";

/**
 * Texte français pour le niveau `firstMandate` (Le Soleil levant, France 1661–1675).
 */
export const messagesFrFirstMandate: Record<keyof typeof messagesEnFirstMandate, string> = {
  ...messagesEnFirstMandate,
  "level.risingSun.name": "Roi-Soleil : Le Soleil levant",
  "level.risingSun.introTitle": "France, 1661 — le Roi-Soleil s'élève",
  "level.risingSun.introBody":
    "Si l'on remonte quelques siècles, les Capétiens ont assemblé la France pas à pas, mais l'autorité royale est restée disputée entre domaine du roi, grands seigneurs et villes privilégiées. La guerre de Cent Ans, puis les guerres d'Italie et de Religion, ont laissé un royaume épuisé dont les dettes politiques, militaires et fiscales pèsent encore sur les premiers Bourbons. À l'ouverture du XVIIe siècle, l'unité française existe davantage comme projet de gouvernement que comme capacité administrative homogène sur tout le territoire.\n\nEn 1661, après la mort de Mazarin, Louis XIV (23 ans) annonce son gouvernement personnel et renonce à nommer un nouveau principal ministre. La France sort de la Fronde et d'une longue économie de guerre : la couronne paraît dominante, mais doit encore négocier avec privilèges provinciaux, résistances fiscales et appareil administratif inégal hors de Paris. Le royaume dispose d'une base démographique et fiscale exceptionnelle, mais chaque décision royale coûte encore cher à faire exécuter dans les provinces.\n\nCe premier chapitre commence dans cette phase de montée encore fragile. Vous devez consolider le centre royal tout en maîtrisant fiscalité, dépenses de cour et coûts militaires ; à l'extérieur, les tensions autour des Pays-Bas espagnols mènent vers la guerre de Dévolution et une surveillance accrue des puissances européennes. Le but n'est pas de gérer une hégémonie acquise, mais de la bâtir avant qu'elle ne se fissure, en transformant une supériorité potentielle en capacité politique durable.",
  "level.risingSun.ending.victory":
    "Louis XIV a consolidé l'autorité de la couronne et soumis les grands nobles. Les officiers royaux appliquent désormais la politique à travers les provinces, tandis que fiscalité, commerce et industrie enrichissent régulièrement le trésor. Le cérémonial de Versailles transforme l'ambition en obéissance, liant les élites rivales à la monarchie. La France est plus forte, plus riche et plus centralisée qu'auparavant. Partout en Europe, les autres puissances observent avec prudence l'ascension d'un nouveau géant continental sous le Roi-Soleil.",
  "level.risingSun.ending.victoryWarDevolutionExtra":
    "Les campagnes dans les Pays-Bas espagnols et en Franche-Comté rappellent les succès de 1667–1668 : les forteresses frontalières tombent et l'argent afflue vers les comptes royaux. Mais le choc des armes françaises a aussi forgé la Triple Alliance — Angleterre, Provinces-Unies et Suède — rappelant à chaque ministre que chaque gain territorial sera négocié dans les chancelleries aussi durement que sur le champ de bataille.",
  "level.risingSun.ending.defeat":
    "L'autorité royale s'effondre sous la dette, le désordre et les résistances. Les provinces ignorent Paris, les nobles restaurent leur pouvoir privé, et les officiers retardent ou refusent les ordres du roi. Les recettes fiscales diminuent tandis que les troubles gagnent villes et campagnes. Les rumeurs de faiblesse attirent intrigues étrangères et complots intérieurs. Le rêve de monarchie centralisée se brise avant d'être achevé, et la France redevient un royaume divisé où la couronne est chaque année moins redoutée.",
  "event.warOfDevolution.name": "Guerre de Dévolution",
  "event.warOfDevolution.desc":
    "En 1667, Louis XIV invoque les droits successoraux de la reine Marie-Thérèse pour lancer sa revendication de « dévolution » sur les Pays-Bas espagnols et la Franche-Comté. L'armée française progresse vite grâce à sa logistique et à la guerre de siège, et le conflit s'achève en 1668 par le traité d'Aix-la-Chapelle : la France conserve plusieurs places fortes, mais ce succès accélère aussi la formation de la Triple Alliance (Angleterre, Provinces-Unies, Suède), signe d'un endiguement européen plus structuré. Côté mécanique, attaquer peut offrir des gains rapides mais augmente la pression de coalition ensuite ; sans attaque, la question reste en jeu jusqu'en 1669.",
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

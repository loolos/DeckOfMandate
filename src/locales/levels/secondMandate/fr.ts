import { messagesEnSecondMandate } from "./en";

/**
 * Texte français pour le niveau `secondMandate` (Gloire sous tension, France 1676–1700).
 */
export const messagesFrSecondMandate: Record<keyof typeof messagesEnSecondMandate, string> = {
  ...messagesEnSecondMandate,
  "level.gloryUnderStrain.name": "Gloire sous tension",
  "level.gloryUnderStrain.introTitle": "France, 1676 — maintenir l'hégémonie",
  "level.gloryUnderStrain.introBody":
    "L'âge de l'expansion est terminé ; l'âge du paiement commence. En 1676, Louis XIV dirige une monarchie plus forte mais aussi plus exposée : Versailles projette la splendeur, mais le cérémonial de cour, la mobilisation militaire et l'extraction fiscale exigent un financement constant. Chaque gain d'autorité entraîne désormais un coût d'entretien, et chaque retard administratif risque de s'élargir en non-coopération provinciale.\n\nLa religion aiguise encore cette tension. L'édit de Nantes, promulgué par Henri IV en 1598 après des décennies de guerre civile entre catholiques et protestants, n'a pas créé l'égalité, mais a construit un compromis politique : le catholicisme restait religion d'État tandis que les huguenots conservaient des droits de culte limités, des protections juridiques et des espaces fortifiés de sécurité. Cet arrangement a contribué à mettre fin aux guerres de Religion en remplaçant la victoire confessionnelle absolue par une coexistence gouvernable.\n\nDans ce chapitre, ce compromis se défait. La pression pour imposer l'unité peut renforcer l'autorité royale à court terme, mais la persécution peut éroder la confiance, provoquer des résistances et vider la capacité de l'État sur la durée. La tolérance, quant à elle, peut réduire la violence immédiate tout en suscitant des retours de bâton politiques. À l'étranger, les puissances rivales lisent les fractures internes comme des opportunités stratégiques ; au pays, charges fiscales et tensions sur les grains transforment la doctrine en agitation. Votre tâche n'est pas de restaurer un équilibre perdu, mais de gouverner une transition dangereuse : préserver la légitimité, gérer le conflit entre foi et obéissance, et maintenir la France debout dans les guerres qui suivent son ascension.",
  "level.gloryUnderStrain.ending.victory":
    "La monarchie traverse les années de pression. La France reste redoutable, et l'État survit aux alertes de famine, à l'encerclement diplomatique et au financement de guerre sans effondrement de légitimité.",
  "level.gloryUnderStrain.ending.victoryWarDevolutionExtra":
    "L'Europe se souvient encore de vos offensives passées. Les rivaux ne font jamais totalement confiance à la retenue française, mais une reconstruction prudente après guerre maintient la couronne.",
  "level.gloryUnderStrain.ending.defeat":
    "Le coût de l'hégémonie brise le régime. Pression fiscale, agitation sociale et contrainte diplomatique dépassent le contrôle royal, laissant la couronne affaiblie et isolée.",
  "status.europeAlert.name": "Alerte Europe",
  "status.europeAlert.hint":
    "Alerte Europe suit désormais une progression (1-10) : départ à 3 ; progression 1-5, chance d'événement supplémentaire = progression×20% ; progression 6-10, au moins 1 événement garanti et chance de 2e événement = (progression-5)×20%.",
  "status.europeAlert.history":
    "Les offensives françaises antérieures ont durci la vigilance de coalition à long terme en Europe.",
  "status.antiFrenchSentiment.name": "Sentiment anti-français",
  "status.antiFrenchSentiment.history":
    "Après le tournant des coalitions des années 1670, la montée en puissance française déclenche une coordination extérieure plus serrée. Mécaniquement : quand Pouvoir+Trésor dépasse 20, chaque tranche complète de +5 augmente de +1 le coût de résolution des événements payés en Financement ; tant que ce statut existe, la fin de chaque tour ajoute aussi 1 carte Endiguement anti-français au deck (à la pioche : 50/50 perdre 1 Pouvoir ou 1 Légitimité ; coût d'activation = floor(progression Alerte Europe/2) ; à l'activation : épurée, pas défaussée). Le statut disparaît quand Pouvoir+Trésor revient à 20 ou moins.",
  "event.nymwegenSettlement.name": "Traités de Nimègue",
  "event.nymwegenSettlement.desc":
    "Crise obligatoire de longue durée : payez (progression d'Alerte Europe + 3) Financement pour sécuriser l'accord (Pouvoir -2, Trésor -1, Légitimité -1). Cela ne met pas fin à Alerte Europe ; si ignoré, perdez 1 Pouvoir chaque année.",
  "event.revocationNantes.name": "Révocation de l'édit de Nantes",
  "event.revocationNantes.desc":
    "En 1598, Henri IV publia l'édit de Nantes pour mettre fin aux guerres de Religion : le catholicisme demeurait la foi d'État, tandis que les protestants français (huguenots) recevaient des droits de culte limités, des protections civiles et des garanties de sécurité. La couronne le révoque désormais. C'est un événement Continu : si ignoré, vous piochez 2 cartes de moins à chaque tour et il reste sur le plateau. Résolvez en choisissant une politique : Tolérance religieuse (Légitimité -1 immédiat ; gagnez le statut permanent Tolérance religieuse qui a 30% de chance annuelle de générer Tension religieuse : payez 2 Financement ou perdez 1 Légitimité), ou Répression sévère (pas de variation numérique immédiate ; gagnez Contenir les restes huguenots 3 et ajoutez 3 cartes temporaires « Réprimer les huguenots » au deck, coût 3 chacune ; chaque activation réduit les restes de 1 ; à 0, retirez le statut et purgez ces cartes de la main/du deck/de la défausse). Tant que ce statut de containment existe, la victoire du Chapitre 2 est bloquée.",
  "event.leagueOfAugsburg.name": "Formation de la Ligue d'Augsbourg",
  "event.leagueOfAugsburg.desc":
    "Les puissances européennes se coordonnent contre la France. Tag Continu 3 : chaque tour, payez floor(progression Alerte Europe/2) Financement pour maintenir les négociations ; si impayé, perdez 1 Pouvoir et 1 Trésor. Vous pouvez toujours résoudre plus tôt en payant 2 Financement (ou via Intervention).",
  "event.nineYearsWar.name": "Guerre de Neuf Ans",
  "event.nineYearsWar.desc":
    "Cet événement est Continu. Chaque tour, vous pouvez payer 2 Financement (ou Intervention) pour tenter une résolution de campagne : 1/9 victoire décisive (retirez l'événement), 4/9 enlisement (aucun effet), 4/9 gains limités (Légitimité +1, l'événement reste). Si vous ne le traitez pas ce tour, Légitimité -1 et l'événement persiste. De plus, s'il est encore présent en fin de tour, ajoutez 1 Fardeau fiscal à votre pioche. Tant qu'il n'est pas terminé, la Paix de Ryswick coûte +4 Financement à résoudre.",
  "event.ryswickPeace.name": "Paix de Ryswick",
  "event.ryswickPeace.desc":
    "Les termes de paix peuvent restaurer l'ordre. Investissez (progression Alerte Europe + 2) Financement pour gagner Légitimité +1 et lever l'Alerte Europe. Cet événement est Continu : s'il n'est pas résolu, Légitimité -1 chaque tour.",
  "event.versaillesExpenditure.name": "Dépenses de Versailles",
  "event.versaillesExpenditure.desc":
    "Les dépenses de cour montent encore. Payez 3 Financement ou utilisez Intervention ; si non résolu, perdez 2 Trésor.",
  "event.nobleResentment.name": "Ressentiment nobiliaire",
  "event.nobleResentment.desc":
    "La résistance des élites grandit à la cour et en province. Payez 2 Financement ou Intervention, sinon gagnez Perte d'autorité pendant 3 tours.",
  "event.provincialNoncompliance.name": "Non-conformité provinciale",
  "event.provincialNoncompliance.desc":
    "Les officiels locaux ralentissent l'application. Payez 2 Financement ou subissez pioche -2 l'an prochain, puis pioche -1 chacune des deux années suivantes.",
  "event.risingGrainPrices.name": "Hausse des prix du grain",
  "event.risingGrainPrices.desc":
    "La pression alimentaire provoque des troubles. Payez 3 Financement ou Intervention ; si non résolu, perdez 2 Légitimité.",
  "event.taxResistance.name": "Résistance fiscale",
  "event.taxResistance.desc":
    "Communautés et élites résistent aux levées. Payez 2 Financement ou Intervention ; si non résolu, perdez 1 Trésor et 1 Légitimité.",
  "event.frontierGarrisons.name": "Garnisons frontalières",
  "event.frontierGarrisons.desc":
    "Les garnisons frontalières absorbent les recettes. Payez 3 Financement ou perdez 1 Trésor et subissez une pénalité de pioche l'an prochain.",
  "event.tradeDisruption.name": "Perturbation commerciale",
  "event.tradeDisruption.desc":
    "Les risques sur routes maritimes et convois réduisent la marge de gouvernance. Payez 1 Financement ou subissez un modificateur de pioche -2 l'an prochain.",
  "event.localWar.name": "Guerre locale",
  "event.localWar.desc":
    "L'Alerte Europe alimente un conflit régional. Intervention ne peut pas résoudre cet événement. Choisissez Attaquer (payez un coût en Financement égal à la progression d'Alerte Europe ; trois issues équiprobables : Victoire locale [Pouvoir +1, Légitimité +1], Enlisement [aucun effet], Pertes limitées [Pouvoir -1]) ou Apaiser (sans coût, mais Légitimité -1). C'est un événement Continu : s'il reste non résolu, le revenu de Financement du prochain tour est réduit de 2 (minimum 0).",
  "event.courtScandal.name": "Scandale de cour",
  "event.courtScandal.desc":
    "Les intrigues de faction affaiblissent l'autorité. Payez 3 Financement pour contenir ; sinon, Légitimité -1 et toutes les cartes taguées Royal sont bloquées au prochain tour.",
  "event.militaryPrestige.name": "Prestige militaire",
  "event.militaryPrestige.desc":
    "Une occasion de convertir l'image du champ de bataille en autorité. Investissez 2 Financement pour Légitimité +1.",
  "event.commercialExpansion.name": "Expansion commerciale",
  "event.commercialExpansion.desc":
    "Les marchands demandent un soutien à la croissance. Investissez 2 Financement pour Trésor +1.",
  "event.talentedAdministrator.name": "Administrateur talentueux",
  "event.talentedAdministrator.desc":
    "Un officier capable peut être promu. Investissez 2 Financement pour Pouvoir +1.",
  "event.warWeariness.name": "Lassitude de guerre",
  "event.warWeariness.desc":
    "Le conflit prolongé épuise le soutien. Payez 3 Financement ou Intervention, sinon perdez 1 Légitimité et gagnez Perte d'autorité pour 2 tours.",
  "event.grainReliefCrisis.name": "Crise des secours céréaliers",
  "event.grainReliefCrisis.desc":
    "L'insécurité alimentaire s'aggrave. Dépensez 2 Financement pour stabiliser les communautés et gagner Légitimité +2 ; sinon la pression non résolue cause Légitimité -2.",
  "event.expansionRemembered.name": "Expansion encore présente",
  "event.expansionRemembered.desc":
    "L'expansion passée projette toujours une ombre longue. Payez 2 Financement pour la contenir et ajouter 2 cartes Fardeau fiscal à votre deck ; si non résolu, 3 cartes Fardeau fiscal sont ajoutées.",
  "event.cautiousCrown.name": "Couronne prudente",
  "event.cautiousCrown.desc":
    "La retenue passée n'offre qu'une marge limitée. Payez 2 Financement pour résoudre ; si ignoré, perdez 1 Pouvoir chaque année.",
  "card.grainRelief.name": "Programme de secours céréaliers",
  "card.grainRelief.background":
    "Achat d'urgence de grain et canaux de secours provinciaux refroidissent les troubles avant que les pénuries ne deviennent révolte.",
  "card.grainRelief.desc":
    "Gagnez Coordination des secours et Confiance dans les secours pendant 1 tour (tour suivant : +1 tentative de pioche et Légitimité +1). Si un événement Hausse des prix du grain non résolu existe, résolvez-en un immédiatement.",
  "card.taxRebalance.name": "Rééquilibrage fiscal",
  "card.taxRebalance.background":
    "Réallouer les charges et fermer les failles pour maintenir les recettes sans rupture immédiate.",
  "card.taxRebalance.desc": "Trésor +1. Gagnez Fatigue de pioche (pioche -1) pendant 2 tours.",
  "card.diplomaticCongress.name": "Congrès diplomatique",
  "card.diplomaticCongress.background":
    "Émissaires, conférences et garanties achètent du répit pendant que vos rivaux testent vos frontières.",
  "card.diplomaticCongress.desc": "Pouvoir +1. Ajoutez 1 Intervention diplomatique supplémentaire à votre main.",
  "card.diplomaticIntervention.name": "Intervention diplomatique",
  "card.diplomaticIntervention.background":
    "Exercez une pression via émissaires et leviers de traité plutôt que par commandement royal direct.",
  "card.diplomaticIntervention.desc":
    "Carte supplémentaire. Résolvez un événement néfaste (pas Boom du commerce colonial). N'est pas une carte taguée Royal ; quand « Restant » est épuisé, il n'y a pas de pénalité supplémentaire et elle quitte simplement le cycle. Exclue du réajustement inter-chapitre et retirée à la fin du chapitre.",
  "log.eventNineYearsWarAttempt.method.funding": "opérations financées",
  "log.eventNineYearsWarAttempt.method.intervention": "intervention diplomatique",
  "log.eventNineYearsWarAttempt.title":
    "[Tour {turn}] {event} ({slot}) — {method}, {paid} {funding} engagés ; jet de campagne (table 1/9) : {roll}.",
  "log.eventNineYearsWarAttempt.outcome.majorVictory":
    "Repère historique : une fenêtre de règlement global type Ryswick s'ouvre ; la pression de guerre prend fin.",
  "log.eventNineYearsWarAttempt.outcome.stalemate":
    "Repère historique : la profondeur de coalition et la logistique imposent l'enlisement ; aucun basculement immédiat.",
  "log.eventNineYearsWarAttempt.outcome.minorGains":
    "Repère historique : des gains locaux sur les fronts/forteresses améliorent l'assise du trône ; {legitimacy} +1, mais la guerre continue.",
  "log.eventNineYearsWarAttempt.history":
    "Contexte : la guerre de Neuf Ans (1688-1697) fut une longue guerre d'usure de coalition, aux gains souvent limités.",
  "log.eventNineYearsWarBegins.title":
    "[Tour {turn}] {event} ({slot}) commence comme crise calendaire fixe (1689).",
  "log.eventNineYearsWarBegins.history":
    "Contexte : à partir de 1689, la guerre s'élargit en affrontement de coalition paneuropéen contre Louis XIV.",
  "log.eventNineYearsWarEndedByRyswick.title":
    "[Tour {turn}] {ryswick} est conclu — {war} est entièrement terminé et retiré ({removed} occurrence(s)).",
  "log.eventNineYearsWarEndedByRyswick.history":
    "Contexte : la paix de Ryswick (1697) règle globalement la guerre de Neuf Ans et réordonne l'équilibre diplomatique.",
  "log.eventNineYearsWarBurden.title":
    "[Tour {turn}] {event} ({slot}) se poursuit — la contrainte financière de guerre ajoute 1 Fardeau fiscal à la pioche.",
  "log.eventNineYearsWarBurden.history":
    "Contexte : la mobilisation prolongée reposait sur l'endettement, les approvisionnements et une pression fiscale cumulative.",
};

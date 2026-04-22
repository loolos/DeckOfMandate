import { messagesEnSecondMandate } from "./secondMandate.en";

/**
 * Texte français pour le niveau `secondMandate` (Longues ombres à midi, France 1676–1700).
 */
export const messagesFrSecondMandate: Record<keyof typeof messagesEnSecondMandate, string> = {
  ...messagesEnSecondMandate,
  "level.gloryUnderStrain.name": "Longues ombres à midi",
  "level.gloryUnderStrain.introTitle": "France, 1676 — maintenir l'hégémonie",
  "level.gloryUnderStrain.introBody":
    "L'âge de l'expansion est terminé ; l'âge du paiement commence. En 1676, Louis XIV dirige une monarchie plus forte mais aussi plus exposée : Versailles projette la splendeur, mais le cérémonial de cour, la mobilisation militaire et l'extraction fiscale exigent un financement constant. Chaque gain d'autorité entraîne désormais un coût d'entretien, et chaque retard administratif risque de s'élargir en non-coopération provinciale.\n\nLa religion aiguise encore cette tension. L'édit de Nantes, promulgué par Henri IV en 1598 après des décennies de guerre civile entre catholiques et protestants, n'a pas créé l'égalité, mais a construit un compromis politique : le catholicisme restait religion d'État tandis que les huguenots conservaient des droits de culte limités, des protections juridiques et des espaces fortifiés de sécurité. Cet arrangement a contribué à mettre fin aux guerres de Religion en remplaçant la victoire confessionnelle absolue par une coexistence gouvernable.\n\nDans ce chapitre, ce compromis se défait. La pression pour imposer l'unité peut renforcer l'autorité royale à court terme, mais la persécution peut éroder la confiance, provoquer des résistances et vider la capacité de l'État sur la durée. La tolérance, quant à elle, peut réduire la violence immédiate tout en suscitant des retours de bâton politiques. À l'étranger, les puissances rivales lisent les fractures internes comme des opportunités stratégiques ; au pays, charges fiscales et tensions sur les grains transforment la doctrine en agitation. Votre tâche n'est pas de restaurer un équilibre perdu, mais de gouverner une transition dangereuse : préserver la légitimité, gérer le conflit entre foi et obéissance, et maintenir la France debout dans les guerres qui suivent son ascension.",
  "level.gloryUnderStrain.ending.victory":
    "La monarchie traverse les années de pression. La France reste redoutable, et l'État survit à l'encerclement diplomatique et au financement de guerre sans effondrement de légitimité.",
  "level.gloryUnderStrain.ending.victoryWarDevolutionExtra":
    "L'Europe se souvient encore de vos offensives passées. Les rivaux ne font jamais totalement confiance à la retenue française, mais une reconstruction prudente après guerre maintient la couronne.",
  "level.gloryUnderStrain.ending.defeat":
    "Le coût de l'hégémonie brise le régime. Pression fiscale, agitation sociale et contrainte diplomatique dépassent le contrôle royal, laissant la couronne affaiblie et isolée.",
  "status.europeAlert.name": "Alerte Europe",
  "status.europeAlert.hint":
    "Alerte Europe suit une progression (1-10) : départ habituel à 3 ; en continuité depuis le Chapitre 1 sans la branche d'attaque de la guerre de Dévolution, départ à 1. Progression 1-5, chance d'événement supplémentaire = progression×20% ; progression 6-10, au moins 1 événement garanti et chance de 2e événement = (progression-5)×20%.",
  "status.europeAlert.history":
    "Les offensives françaises antérieures ont durci la vigilance de coalition à long terme en Europe.",
  "status.europeAlert.stage.eased.name": "Accalmie (1-2)",
  "status.europeAlert.stage.eased.desc":
    "La coordination rivale existe, mais la pression reste surtout diplomatique.",
  "status.europeAlert.stage.alert.name": "Alerte (3-4)",
  "status.europeAlert.stage.alert.desc":
    "Surveillance et signaux de fermeté s'intensifient autour des engagements français.",
  "status.europeAlert.stage.containment.name": "Endiguement (5-6)",
  "status.europeAlert.stage.containment.desc":
    "Les voisins passent à des mesures de balancing concrètes pour limiter la marge française.",
  "status.europeAlert.stage.hostile.name": "Hostile (7-8)",
  "status.europeAlert.stage.hostile.desc":
    "La pression économique et militaire glisse de la dissuasion vers l'obstruction active.",
  "status.europeAlert.stage.conflict.name": "Conflit (9-10)",
  "status.europeAlert.stage.conflict.desc":
    "Le système bascule en confrontation ouverte et les crises jumelées deviennent fréquentes.",
  "status.antiFrenchSentiment.name": "Sentiment anti-français",
  "status.antiFrenchSentiment.emotionLabel": "Sentiment {x}",
  "status.antiFrenchSentiment.detail":
    "Sentiment {x} : nombre actuel de cartes Endiguement anti-français dans toute votre bibliothèque. Tant que ce statut est actif, la Paix de Ryswick coûte aussi +{n} Financement.",
  "status.antiFrenchSentiment.history":
    "Après les années 1670, l'expansion militaire et fiscale de la France convainc les cours rivales que les trêves ponctuelles ne suffisent plus. Un consensus anti-français plus large se forme : coordination diplomatique, pression commerciale et préparation militaire se combinent pour contenir l'influence bourbonienne. Côté mécanique : quand le total Pouvoir+Trésor devient trop élevé, les solutions payées liées à l'Alerte Europe coûtent davantage, et ce statut ajoute aussi une pression récurrente via le deck jusqu'au retour à un niveau de puissance plus bas.",
  "event.nymwegenSettlement.name": "Traités de Nimègue",
  "event.nymwegenSettlement.desc":
    "Les traités de Nimègue (1678–1679) mettent fin à la phase principale de la guerre de Hollande. La France y consolide des gains sur ses frontières, mais la méfiance stratégique ne disparaît pas : les cours voisines continuent d'interpréter l'expansion bourbonienne comme une menace durable, et la diplomatie d'après-guerre se transforme progressivement en logique d'endiguement de l'équilibre européen. Côté mécanique, c'est une crise obligatoire de longue durée : payez (progression d'Alerte Europe + 3) Financement pour sécuriser l'accord (Pouvoir -2, Trésor -1, Légitimité -1). Cela ne met pas fin à Alerte Europe ; si ignoré, perdez 1 Pouvoir chaque année.",
  "event.revocationNantes.name": "Politique sur l'édit de Nantes",
  "event.revocationNantes.desc":
    "En 1598, Henri IV promulgua l'édit de Nantes après des décennies de guerres de Religion. Ce texte n'instaurait pas l'égalité confessionnelle : il organisait plutôt un compromis politique, en maintenant le catholicisme comme religion d'État tout en accordant aux huguenots des droits de culte limités, certaines protections juridiques et quelques places de sûreté. Dans la seconde moitié du XVIIe siècle, la monarchie associa de plus en plus l'unité religieuse à l'obéissance administrative et à l'autorité dynastique. Pression fiscale, guerres de frontière et contrôle confessionnel se renforcèrent mutuellement, et les communautés protestantes furent de plus en plus perçues comme un risque intérieur durable. La révocation de 1685 rompit ce compromis : de nombreux huguenots partirent vers l'Angleterre, les Provinces-Unies, le Brandebourg ou la Suisse, emportant capitaux, savoir-faire et réseaux commerciaux ; ceux qui restèrent durent souvent passer à la clandestinité, entre assemblées secrètes et entraide souterraine. Côté mécanique, c'est un événement Continu avec pénalité de pioche s'il n'est pas traité : la voie de tolérance réduit le choc immédiat mais peut réintroduire des crises confessionnelles récurrentes, tandis que la voie de répression offre un contrôle plus dur au prix de résurgences périodiques et d'une usure de gouvernance plus longue.",
  "event.leagueOfAugsburg.name": "Formation de la Ligue d'Augsbourg",
  "event.leagueOfAugsburg.desc":
    "Après les années 1680, l'expansion française sur le Rhin et dans les Pays-Bas entretient une inquiétude durable chez ses voisins. En 1686, princes du Saint-Empire, Habsbourg et États allemands se regroupent à Augsbourg, puis l'Angleterre, les Provinces-Unies et l'Espagne s'alignent progressivement vers une coordination anti-française. Pour Louis XIV, ce n'est plus une friction diplomatique ponctuelle : l'équilibre européen se transforme en contrainte d'alliance institutionnalisée. Côté mécanique : pression diplomatique continue marquée Restant 3, à résoudre 3 fois en cumulé pour la retirer définitivement. Si elle n'est pas traitée pendant le tour, vous perdez 1 Pouvoir et 1 Trésor en fin de tour (sans consommer le compteur Restant). Chaque paiement de 2 Financement (ou usage d'Intervention) compte comme une résolution : ce tour évite la pénalité, mais l'événement reste jusqu'à ce que Restant atteigne 0.",
  "event.nineYearsWar.name": "Guerre de Neuf Ans",
  "event.nineYearsWar.desc":
    "À partir de 1688, la Guerre de Neuf Ans prolonge la logique de la Ligue d'Augsbourg en un affrontement continental sur l'équilibre européen. Les combats s'étendent du Rhin et des Pays-Bas aux routes maritimes et aux espaces coloniaux, faisant de l'endurance financière la véritable mesure de la puissance d'État. En jeu, c'est une crise Continue : chaque tour vous devez payer floor(progression Alerte Europe/2)+1 Financement pour lancer une campagne (l'Intervention ne s'applique pas), tandis que l'inaction expose à des pertes de légitimité et à une pression budgétaire durable.",
  "event.ryswickPeace.name": "Paix de Ryswick",
  "event.ryswickPeace.desc":
    "Les termes de paix peuvent restaurer l'ordre. Investissez (progression Alerte Europe + 2) Financement pour gagner Légitimité +1 et lever l'Alerte Europe. Si la Guerre de Neuf Ans n'est pas encore terminée, ce coût gagne +4 supplémentaire. Tant que le Sentiment anti-français est actif, ce coût gagne aussi +2x (x = nombre actuel de cartes Endiguement anti-français dans toute votre bibliothèque). Résoudre cet événement met aussi fin définitivement à la Guerre de Neuf Ans. Cet événement est Continu : s'il n'est pas résolu, Légitimité -1 chaque tour.",
  "event.versaillesExpenditure.name": "Dépenses de Versailles",
  "event.versaillesExpenditure.desc":
    "Pensions, offices et grands travaux du palais grignotaient une part croissante des recettes ordinaires. Les dépenses de cour montent encore. Payez 3 Financement ou utilisez Intervention ; si non résolu, perdez 2 Trésor.",
  "event.nobleResentment.name": "Ressentiment nobiliaire",
  "event.nobleResentment.desc":
    "Les grandes familles regrettaient leurs clientèles militaires et les audits fiscaux qui rappelaient les levées de Mazarin. La résistance des élites grandit à la cour et en province. Payez 2 Financement ou Intervention, sinon gagnez Perte d'autorité pendant 3 tours.",
  "event.provincialNoncompliance.name": "Non-conformité provinciale",
  "event.provincialNoncompliance.desc":
    "Parlements et états provinciaux testaient encore les intendants contre chartes et immunités. Les officiels locaux ralentissent l'application. Payez 2 Financement ou subissez pioche -2 l'an prochain, puis pioche -1 chacune des deux années suivantes.",
  "event.risingGrainPrices.name": "Hausse des prix du grain",
  "event.risingGrainPrices.desc":
    "Mauvaises récoltes et politique du grain pouvaient transformer émeutes de subsistance en crise politique en quelques jours. La pression alimentaire provoque des troubles. Payez 3 Financement ou Intervention ; si non résolu, perdez 2 Légitimité.",
  "event.taxResistance.name": "Résistance fiscale",
  "event.taxResistance.desc":
    "Révisions de taille et aides nouvelles crispaient villes et ordres privilégiés. Communautés et élites résistent aux levées. Payez 2 Financement ou Intervention ; si non résolu, perdez 1 Trésor et 1 Légitimité.",
  "event.frontierGarrisons.name": "Garnisons frontalières",
  "event.frontierGarrisons.desc":
    "Rhin et Pays-Bas : garnisons et sièges absorbèrent les budgets des années 1680-1690. Les garnisons frontalières absorbent les recettes. Payez 3 Financement ou perdez 1 Trésor et subissez une pénalité de pioche l'an prochain.",
  "event.tradeDisruption.name": "Perturbation commerciale",
  "event.tradeDisruption.desc":
    "Guerre de convois et corsaires anglo-hollandais pinçaient les recettes atlantiques. Les risques sur routes maritimes et convois réduisent la marge de gouvernance. Payez 1 Financement ou subissez un modificateur de pioche -2 l'an prochain.",
  "event.embargoCoalition.name": "Coalition d'embargo",
  "event.embargoCoalition.desc":
    "Les marines de la Grande Alliance resserrèrent les cordons maritimes quand la guerre de coalition devint la norme. Les restrictions maritimes se resserrent autour du commerce français. Payez 2 Financement, ou perdez 1 Trésor et subissez une pénalité de pioche l'an prochain.",
  "event.mercenaryRaiders.name": "Raiders mercenaires",
  "event.mercenaryRaiders.desc":
    "Entre deux campagnes, compagnies libres et raids payés hantaient encore les marches. Des pillards frontaliers à gages perturbent l'ordre local et l'autorité de la couronne. Payez 2 Financement, ou perdez 1 Pouvoir et 1 Légitimité.",
  "event.localWar.name": "Guerre locale",
  "event.localWar.desc":
    "Entre grands traités, la France enchaînait encore escarmouches rhénanes et crises italiennes. L'Alerte Europe alimente un conflit régional. Intervention ne peut pas résoudre cet événement. Choisissez Attaquer (payez floor(progression Alerte Europe/2) Financement, puis appliquez le surcoût Sentiment anti-français si actif ; trois issues équiprobables : Victoire locale [Pouvoir +1, Légitimité +1], Enlisement [aucun effet], Pertes limitées [Pouvoir -1]) ou Apaiser (sans coût, mais Légitimité -1). C'est un événement Continu : s'il reste non résolu, le revenu de Financement du prochain tour est réduit de 2 (minimum 0).",
  "event.courtScandal.name": "Scandale de cour",
  "event.courtScandal.desc":
    "Cabinet du lit et rivalités ministérielles à Versailles alimentaient feuilles volantes et rumeurs publiques. Les intrigues de faction affaiblissent l'autorité. Payez 3 Financement pour contenir ; sinon, Légitimité -1 et toutes les cartes taguées Royal sont bloquées au prochain tour.",
  "event.militaryPrestige.name": "Prestige militaire",
  "event.militaryPrestige.desc":
    "Des sièges comme Namur étaient exhibés comme preuve des armes bourboniennes et du droit divin. Une occasion de convertir l'image du champ de bataille en autorité. Investissez 2 Financement pour Légitimité +1.",
  "event.commercialExpansion.name": "Expansion commerciale",
  "event.commercialExpansion.desc":
    "Dans la France de la fin du XVIIe siècle, l'héritage colbertiste continue de soutenir manufactures, marine marchande et compagnies à privilège, mais les guerres et les frictions tarifaires rendent l'essor commercial coûteux. Les marchands demandent un soutien à la croissance. Investissez 2 Financement pour Trésor +1.",
  "event.talentedAdministrator.name": "Administrateur talentueux",
  "event.talentedAdministrator.desc":
    "Les successeurs de Colbert promouvaient secrétaires et intendants capables de contourner la routine vénale. Un officier capable peut être promu. Investissez 2 Financement pour Pouvoir +1.",
  "event.warWeariness.name": "Lassitude de guerre",
  "event.warWeariness.desc":
    "Pendant la guerre de Neuf Ans, même les victoires ne masquaient plus la tension fiscale au pays. Le conflit prolongé épuise le soutien. Payez 3 Financement ou Intervention, sinon perdez 1 Légitimité et gagnez Perte d'autorité pour 2 tours.",
  "event.jesuitPatronage.name": "Patronage jésuite",
  "event.jesuitPatronage.desc":
    "Depuis 1675, des confesseurs jésuites comme le père de La Chaise rapprochent la Compagnie de la Couronne ; les collèges d'élite forment des cadres alignés et contrecarrent souvent le jansénisme, mais attisent les tensions religieuses. Payez 2 Financement : ajoutez à votre pioche 2 cartes Collège jésuite (coût 2, Restant 1/1, Légitimité +1 ; à l'activation, résolvez une Controverse janséniste non résolue) et 1 carte Tension religieuse. Aucune pénalité si ignoré.",
  "event.expansionRemembered.name": "Expansion encore présente",
  "event.expansionRemembered.desc":
    "Les chancelleries rivales chiffraient encore les gains français des guerres de Dévolution et de Hollande. L'expansion passée projette toujours une ombre longue. Payez 2 Financement pour la contenir et ajouter 2 cartes Fardeau fiscal à votre deck ; si non résolu, 3 cartes Fardeau fiscal sont ajoutées.",
  "event.cautiousCrown.name": "Couronne prudente",
  "event.cautiousCrown.desc":
    "La respiration diplomatique après Nimègue n'effaçait pas la méfiance stratégique. La retenue passée n'offre qu'une marge limitée. Payez 2 Financement pour résoudre ; si ignoré, perdez 1 Pouvoir chaque année.",
  "card.grainRelief.name": "Programme de secours céréaliers",
  "card.grainRelief.background":
    "Achat d'urgence de grain et canaux de secours provinciaux refroidissent les troubles avant que les pénuries ne deviennent révolte.",
  "card.grainRelief.desc":
    "Gagnez Coordination des secours et Confiance dans les secours pendant 1 tour (tour suivant : +1 tentative de pioche et Légitimité +1). Si un événement Hausse des prix du grain non résolu existe, résolvez-en un immédiatement.",
  "card.taxRebalance.name": "Rééquilibrage fiscal",
  "card.taxRebalance.background":
    "Les guerres de Louis XIV imposent réévaluations de la taille et droits indirects plus serrés ; réallouer les charges maintient les recettes mais attise souvent les frictions provinciales.",
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

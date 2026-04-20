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
    "Alerte Europe suit désormais une progression (1-10) : départ à 3 ; progression 1-5, chance d'événement supplémentaire = progression×20% ; progression 6-10, au moins 1 événement garanti et chance de 2e événement = (progression-5)×20%.",
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
    "À partir de 1688, la Guerre de Neuf Ans prolonge la logique de la Ligue d'Augsbourg en un affrontement continental sur l'équilibre européen. Les combats s'étendent du Rhin et des Pays-Bas aux routes maritimes et aux espaces coloniaux, faisant de l'endurance financière la véritable mesure de la puissance d'État. En jeu, c'est une crise Continue : vous pouvez lancer des campagnes chaque tour en payant floor(progression Alerte Europe/2)+1 Financement (ou via Intervention), tandis que l'inaction expose à des pertes de légitimité et à une pression budgétaire durable.",
  "event.ryswickPeace.name": "Paix de Ryswick",
  "event.ryswickPeace.desc":
    "Les termes de paix peuvent restaurer l'ordre. Investissez (progression Alerte Europe + 2) Financement pour gagner Légitimité +1 et lever l'Alerte Europe. Si la Guerre de Neuf Ans n'est pas encore terminée, ce coût gagne +4 supplémentaire. Tant que le Sentiment anti-français est actif, ce coût gagne aussi +2x (x = nombre actuel de cartes Endiguement anti-français dans toute votre bibliothèque). Résoudre cet événement met aussi fin définitivement à la Guerre de Neuf Ans. Cet événement est Continu : s'il n'est pas résolu, Légitimité -1 chaque tour.",
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
  "event.embargoCoalition.name": "Coalition d'embargo",
  "event.embargoCoalition.desc":
    "Les restrictions maritimes se resserrent autour du commerce français. Payez 2 Financement, ou perdez 1 Trésor et subissez une pénalité de pioche l'an prochain.",
  "event.mercenaryRaiders.name": "Raiders mercenaires",
  "event.mercenaryRaiders.desc":
    "Des pillards frontaliers à gages perturbent l'ordre local et l'autorité de la couronne. Payez 2 Financement, ou perdez 1 Pouvoir et 1 Légitimité.",
  "event.localWar.name": "Guerre locale",
  "event.localWar.desc":
    "L'Alerte Europe alimente un conflit régional. Intervention ne peut pas résoudre cet événement. Choisissez Attaquer (payez floor(progression Alerte Europe/2) Financement, puis appliquez le surcoût Sentiment anti-français si actif ; trois issues équiprobables : Victoire locale [Pouvoir +1, Légitimité +1], Enlisement [aucun effet], Pertes limitées [Pouvoir -1]) ou Apaiser (sans coût, mais Légitimité -1). C'est un événement Continu : s'il reste non résolu, le revenu de Financement du prochain tour est réduit de 2 (minimum 0).",
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
  "event.jesuitPatronage.name": "Patronage jésuite",
  "event.jesuitPatronage.desc":
    "Le père François de La Chaise, confesseur jésuite de Louis XIV depuis 1675, relaie le patronage de la Compagnie de Jésus. Ses collèges d'élite — La Flèche (où Descartes fit ses études), Louis-le-Grand à Paris et Clermont — forment officiers, magistrats et clergé selon une doctrine alignée sur la Couronne, intégrant l'État dans un réseau d'éducation et de mission catholique transnational. Depuis la querelle de l'Augustinus dans les années 1640, les théologiens jésuites sont aussi les adversaires les plus tranchants du jansénisme, et leurs chaires peuvent étouffer une agitation janséniste locale lorsque la Couronne s'appuie sur eux. Cette même prééminence nourrit toutefois la rancœur de l'épiscopat gallican, des théologiens de la Sorbonne et des cercles jansénistes, qui voient l'ultramontanisme jésuite comme une menace pour l'autonomie ecclésiastique française. Payez 2 Financement pour approfondir le partenariat : ajoutez 2 cartes Collège jésuite (coût 2, Restant 1/1, Légitimité +1, et résout immédiatement à l'activation un événement Controverse janséniste non résolu) et 1 carte Tension religieuse à votre pioche. Si non résolu, aucune pénalité.",
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
};

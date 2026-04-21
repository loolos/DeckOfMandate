import { messagesEnCore } from "./en.core";

/**
 * Bundle français principal.
 * Fallback anglais pour les clés non encore localisées.
 */
export const messagesFrCore: Record<keyof typeof messagesEnCore, string> = {
  ...messagesEnCore,
  "app.subtitle": "Le Soleil levant",
  "menu.introContinue": "Entrer dans la partie",
  "banner.turn": "Tour {turn} / {limit}",
  "phase.action": "Phase d'action — jouez des cartes, résolvez les événements, puis terminez le tour.",
  "phase.retention": "Fin du tour — choisissez les cartes à conserver (jusqu'à la Légitimité).",
  "phase.gameOver": "Partie terminée.",
  "resource.treasuryStat": "Trésor",
  "resource.treasuryStat.hint": "Ajoute au Financement de chaque tour.",
  "resource.funding": "Financement",
  "resource.funding.hint": "Paie les cartes et les événements.",
  "resource.power": "Pouvoir",
  "resource.power.hint":
    "Les tentatives de pioche progressent sur une échelle de seuils de Pouvoir (1/2/4/7/11/16…) : franchir le seuil suivant donne +1 tentative ; passer sous le seuil actuel en retire 1. Déployez le détail de la ressource pour les règles et exemples complets.",
  "resource.legitimacy": "Légitimité",
  "resource.legitimacy.hint": "Limite de conservation ; 0 met fin à la partie.",
  "ui.resources": "Ressources",
  "ui.resourceMobileExpand": "Touchez pour afficher les libellés complets et les aides.",
  "ui.resourceMobileCollapse": "Touchez pour réduire les détails des ressources",
  "ui.endTurn": "Terminer le tour",
  "ui.solve": "Résoudre ({cost})",
  "ui.solveCrackdown": "Résoudre (Intervention)",
  "ui.solveFundingOrCrackdown": "Payer {cost} ou Intervention",
  "ui.scriptedAttack": "Attaquer ({cost})",
  "ui.nantesTolerance": "Tolérance religieuse",
  "ui.nantesCrackdown": "Répression sévère",
  "ui.localWarAttack": "Attaquer ({cost})",
  "ui.localWarAppease": "Apaiser",
  "ui.successionCrisisPay": "Payer 3 fonds — piste de succession +1",
  "ui.successionCrisisDecline": "Ne pas payer — départ à −1 sur la piste",
  "ui.utrechtEndWar": "Mettre fin à la guerre de succession (traité)",
  "ui.utrechtWait": "Attendre ({n} tour(s) restant(s) à la fenêtre)",
  "ui.dualFrontCrisis.concede": "Céder provisoirement — piste −3 ; budget adverse +1",
  "ui.dualFrontCrisis.escalate":
    "Élargir la guerre — piste +1, légitimité −1, +3 Charges fiscales ; budget adverse +1",
  "ui.successionTrack": "Piste de succession",
  "ui.opponentHabsburg": "Adversaire : Habsbourg",
  "ui.opponentStrength": "Budget adversaire",
  "ui.opponentEvent.strengthTag": "Puissance {n}",
  "ui.opponentEvent.lastPlayCombinedFx": "Total fin d'année précédente : {fx}",
  "ui.opponentEvent.lastPlayCardBlurb": "{history} En jeu : {fx}",
  "ui.resolved": "Résolu",
  "ui.harmful": "Néfaste",
  "ui.opportunity": "Opportunité",
  "ui.historical": "Historique",
  "ui.continued": "Continu",
  "ui.continuedTurns": "Continu {n}",
  "ui.remainingTurns": "Restant {n}",
  "ui.deck": "Pioche",
  "ui.discard": "Défausse",
  "ui.quickFrame.cost": "Coût",
  "ui.quickFrame.onPlay": "À l'activation",
  "ui.quickFrame.pay": "Résoudre avec",
  "ui.quickFrame.ifSolved": "En cas de résolution",
  "ui.quickFrame.yearEnd": "Fin d'année si toujours actif",
  "ui.hand": "Main",
  "ui.events": "Événements",
  "ui.eventsResizeHint": "Glissez le coin inférieur droit pour redimensionner la zone d'événements.",
  "ui.mobileLogTapHint":
    "Petit écran : touchez les événements, statuts et cartes en main pour afficher les détails ; double-cliquez une carte en main (compacte ou étendue) pour la jouer.",
  "ui.playThisCard": "Jouer cette carte",
  "log.crackdownPickPrompt":
    "[Tour {turn}] Choisissez un événement néfaste à résoudre via Intervention (pas Boom du commerce colonial).",
  "ui.cancel": "Annuler",
  "ui.confirmRetention": "Confirmer la conservation",
  "ui.newGame": "Nouvelle partie",
  "menu.title": "Menu principal",
  "menu.resumeSave": "Reprendre la sauvegarde",
  "menu.levelLabel": "Niveau",
  "menu.seedLabel": "Graine de partie (optionnelle)",
  "menu.seedPlaceholder": "Aléatoire si vide",
  "menu.seedHint":
    "Laissez vide pour une graine aléatoire. La même graine reproduit l'ordre du deck et les premiers événements.",
  "menu.seedInvalid": "Saisissez un nombre fini valide.",
  "menu.startConfigured": "Démarrer",
  "menu.runCodeLoad": "Charger depuis un code de partie",
  "menu.continueChapter2": "Continuer au Chapitre 2",
  "menu.continueChapter3": "Continuer au Chapitre 3",
  "menu.refit.title": "Réajustement du deck entre chapitres",
  "menu.refit.subtitle": "Reconstruisez votre deck pour une gouvernance à haute pression.",
  "menu.refit.adjustable": "Cartes transférées",
  "menu.refit.newCards": "Nouvelles cartes du Chapitre 2",
  "menu.refit.mode.standalone": "Mode : démarrage autonome du Chapitre 2",
  "menu.refit.mode.continuity": "Mode : continuité après victoire du Chapitre 1",
  "menu.refit.resources": "Ressources de départ — Trésor {treasury}, Pouvoir {power}, Légitimité {legitimacy}",
  "menu.refit.startYear": "Année de départ du Chapitre 2 : {year}",
  "menu.refit.europeAlertOn":
    "Alerte Europe : ACTIVÉE (la jauge commence à 3/10. Progression 1-5 : chance d'événement supplémentaire = progression×20% ; 6-10 : au moins 1 événement, puis un 2e avec (progression-5)×20%).",
  "menu.refit.europeAlertOnLow":
    "Alerte Europe : ACTIVÉE (continuité sans la branche d'attaque de la guerre de Dévolution : la jauge commence à 1/10 ; règles annuelles d'événements supplémentaires inchangées).",
  "menu.refit.europeAlertOff": "Alerte Europe : DÉSACTIVÉE (pression standard du Chapitre 2).",
  "menu.refit.totalCards": "Taille du deck : {current} (requis {min}–{max})",
  "menu.refit.totalCards.simple": "Taille du deck après retraits : {current}",
  "menu.refit.newCardTotal": "Nouvelles cartes choisies : {current} / {max}",
  "menu.refit.baseAdjustTotal": "Ajustements des cartes transférées : {current} / {max}",
  "menu.refit.continuityRule":
    "Règle de réajustement : retirez seulement 0–{max} cartes transférées du Chapitre 1 ; les trois nouvelles cartes du Chapitre 2 sont fixées à +1 chacune.",
  "menu.refit.mobileDoubleToggleHint":
    "Sur petit écran, double-cliquez une ligne de carte pour basculer « Retirer cette carte ».",
  "menu.refit.removeToggle": "Retirer cette carte",
  "menu.refit.invalid": "Les règles du deck ne sont pas encore respectées.",
  "menu.refit.start": "Démarrer le Chapitre 2",
  "menu.refit.back": "Retour",
  "menu.refit.reset": "Réinitialiser à l'état d'entrée",
  "menu.refit.presetHistorical": "Recommandation historique",
  "menu.refit.presetWar": "Préréglage pression de guerre",
  "menu.tutorialOnLevelEntry": "Afficher le tutoriel d'interface à l'entrée du niveau",
  "menu.tutorialOnLevelEntryHint":
    "Une courte présentation en anglais mettant en évidence objectifs, ressources, événements et main. Désactivé par défaut.",
  "ui.statuses": "Effets en cours",
  "ui.statuses.empty": "Aucun effet en cours.",
  "ui.statusTurnsRemaining": "{n} tour(s) restant(s)",
  "ui.statusPermanent": "Permanent",
  "ui.statusHuguenotRemaining": "Restes {n}",
  "ui.statusDetail.drawAttemptsDelta": "Modificateur de tentatives de pioche par tour : {delta}.",
  "ui.statusDetail.retentionCapacityDelta": "Modificateur de limite de conservation en fin de tour : {delta}.",
  "ui.statusDetail.beginYearResourceDelta": "Au début du tour : {resource} {delta}.",
  "ui.statusDetail.blockCardTag": "Les cartes avec le tag « {tag} » ne peuvent pas être jouées.",
  "ui.actionLog": "Journal d'actions",
  "ui.actionLog.empty": "Aucun effet enregistré dans cette partie.",
  "ui.targets": "Objectifs du niveau — en {limit} tours : Trésor {tT}, Pouvoir {tP}, Légitimité {tL}",
  "ui.levelLocaleFallback":
    "Ce niveau n’est pas entièrement traduit pour la langue d’interface actuelle. Les textes propres au niveau peuvent s’afficher en anglais.",
  "ui.language": "Langue",
  "ui.lang.en": "English",
  "ui.lang.zh": "中文",
  "ui.lang.fr": "Français",
  "outcome.victory": "Victoire — mandat sécurisé.",
  "outcome.defeatLegitimacy": "Défaite — une ressource clé s'est effondrée.",
  "outcome.defeatTime": "Défaite — le temps est écoulé avant d'atteindre les objectifs.",
  "outcome.defeatSuccession": "Défaite — la ligne de succession a basculé contre la France.",
  "outcome.successionTier.bourbon": "Règlement : avantage Bourbon dans le bilan final.",
  "outcome.successionTier.compromise": "Règlement : équilibre de compromis entre prétentions.",
  "outcome.successionTier.habsburg": "Règlement : avantage Habsbourg dans le bilan final.",
  "outcome.utrechtVictoryEpilogue.bourbon":
    "Après la série d’Utrecht, le canon cède au parchemin : l’Europe accepte une Espagne bourbonienne sous garde-fous, et la France échange la peur d’une union catastrophique contre une victoire dynastique défendable.",
  "outcome.utrechtVictoryEpilogue.compromise":
    "Les traités ferment les hostilités sans knock-out net : l’héritage est redecoupé, les visages sauvés — la France gagne de l’air, pas un chèque en blanc, sur la succession espagnole.",
  "outcome.utrechtVictoryEpilogue.habsburg":
    "La paix reflète la pression de coalition : Philippe peut garder Madrid, mais Versailles accepte des brides plus serrées — freins impériaux et maritimes qui survivront au dernier tonnerre de la guerre de succession.",
  "log.europeAlertProgressShift":
    "[Tour {turn}] Alerte Europe ajustée {from}→{to} (k={k}, chance de déclenchement {pct}%).",
  "log.eventLocalWarChoice.attackOutcome.success":
    "{power} +1 et {legitimacy} +1. Les succès de frontière rehaussent brièvement le prestige de cour, et les puissances voisines temporisent leurs tests.",
  "log.eventLocalWarChoice.attackOutcome.stalemate":
    "gains limités ; pas de variation immédiate des ressources. Le cycle sièges-logistique rejoue l'usure typique des « petites guerres entre grandes guerres ».",
  "log.eventLocalWarChoice.attackOutcome.setback":
    "{power} -1. Le revers révèle des fissures de coordination militaire locale et encourage les cours rivales à maintenir la pression.",
  "log.eventNineYearsWarCampaign.outcome.decisiveVictory":
    "victoire décisive ; la pression de guerre prend fin. Du Rhin aux Pays-Bas, l'élan de coalition s'essouffle et les offensives coordonnées ralentissent.",
  "log.eventNineYearsWarCampaign.outcome.stalemate":
    "enlisement ; le front reste inchangé. La logique d'équilibre européen reste piégée dans un duel d'endurance fiscale et de crédit.",
  "log.eventNineYearsWarCampaign.outcome.limitedGains":
    "gains partiels ; {legitimacy} +1. Le succès tactique rassure l'intérieur, sans rompre la dynamique d'usure d'une guerre longue.",
  "log.huguenotResurgence.title":
    "[Tour {turn}] Contenir les restes huguenots est toujours actif : les réseaux clandestins huguenots se reforment via les marges de tolérance et les routes d'exil. Ajoute {addedCount} {card} au deck ; les restes passent à {remainingStacks}.",
  "log.huguenotResurgence.history":
    "Note historique : après l'édit de Fontainebleau (1685), les huguenots passent dans la clandestinité ou s'exilent, mais leurs assemblées, leur imprimerie et leurs réseaux d'entraide se reconstruisent dans les campagnes et aux frontières, exigeant de nouvelles vagues de répression tous les quelques années.",
  "log.info.chapter2EuropeAlertOn":
    "[Tour {turn}] La guerre de Dévolution et le règlement diplomatique autour de la paix d'Aix-la-Chapelle (1668) ont dissipé les illusions sur les visées françaises aux Pays-Bas et sur les contentieux successoraux. La trêve n'a pas rendu la confiance : cours hollandaise, impériale et maritimes ont poursuivi une coordination contre les coups de force bourboniens—cette « Alerte Europe » était déjà l'ambiance non dite des chancelleries.",
  "log.info.chapter2EuropeAlertContinuityLow":
    "[Tour {turn}] La France a surtout fait valoir ses prétentions par la diplomatie et la pression frontalière plutôt que par une guerre généralisée autour de la Dévolution. Les rivaux observent toujours Versailles de près—agents, armements et leviers commerciaux se resserrent dans l'ombre—, mais la fusion d'un encerclement continental, forgé par des défaites éclatantes ou des annexions brutales, n'est pas encore là. La méfiance couve plutôt qu'elle n'embrase (l'Alerte Europe pèse encore sur les frontières, mais à un registre plus bas).",
  "log.info.chapter2EuropeAlertOff":
    "[Tour {turn}] À ce point de départ narratif, la pression extérieure sur la France ne s'est pas encore cristallisée en containment institutionnel : traités et clauses secrètes restent à l'essai, et la mobilisation des grandes alliances n'est pas encore le tempo de la politique européenne—les chancelleries lisent la prudence plus souvent que l'ultimatum.",
  "log.info.chapter3ContinuityIntro":
    "[Tour {turn}] Chapitre 3 : vos ressources, l'année du calendrier et le deck survivant se poursuivent depuis le chapitre 2 ; six nouvelles cartes rejoignent la main de départ. La crise de succession scriptée apparaît lorsque le calendrier atteint 1701.",
  "log.info.antiFrenchSentimentActivated":
    "[Tour {turn}] Le sentiment anti-français monte : quand Pouvoir+Trésor dépasse 20, les résolutions financées liées à l'Alerte Europe prennent +1 immédiatement, puis +1 par tranche complète supplémentaire de +5. Le statut affiche aussi Sentiment x (x = nombre de cartes Endiguement anti-français dans toute votre bibliothèque), et la Paix de Ryswick gagne un surcoût supplémentaire de +2x tant que ce statut est actif.",
  "log.info.antiFrenchSentimentEnded":
    "[Tour {turn}] Le sentiment anti-français retombe : dès que Pouvoir+Trésor revient à 20 ou moins, ce surcoût de résolution d'événements est retiré.",
  "log.info.cardUse.depleted.crackdownPenalty":
    "[Tour {turn}] Intervention royale : usages épuisés, carte retirée du cycle ; la capacité de contrainte de la cour recule (Pouvoir -1).",
  "log.info.cardUse.depleted.fundingPenalty":
    "[Tour {turn}] Prélèvement royal : usages épuisés, carte retirée du cycle ; les canaux d'extraction d'urgence s'épuisent (Trésor -1).",
  "log.info.cardUse.depleted.diplomaticIntervention":
    "[Tour {turn}] Intervention diplomatique atteint 0/3 et est retirée du cycle (sans pénalité).",
  "log.info.nantesPolicy.toleranceNoFontainebleau":
    "[Tour {turn}] Vous choisissez la tolérance religieuse : la couronne n'édicte pas, cette année, une révocation générale de type Fontainebleau. La tension immédiate baisse, mais les conflits confessionnels reviendront.",
  "log.info.nantesPolicy.crackdownFontainebleauIssued":
    "[Tour {turn}] Vous choisissez la répression sévère : la monarchie bascule vers une ligne de type édit de Fontainebleau, retire des protections aux protestants et durcit les conversions forcées. L'obéissance progresse à court terme, mais le coût politique augmente.",
  "log.info.eventTag.historical":
    "[Tour {turn}] Note de tag « Historique » : cet événement renvoie à un fait historique réel et ce tag n'ajoute aucun effet de jeu.",
  "log.info.cardTag.extra":
    "[Tour {turn}] Note de tag « Supplémentaire » : cette carte est ajoutée par d'autres effets, exclue du réajustement inter-chapitre et retirée à la fin du chapitre.",
  "log.info.cardTag.consume":
    "[Tour {turn}] Note de tag « Consommation » : une fois jouée, cette carte quitte votre bibliothèque et ne passe ni par la défausse ni par les mélanges suivants.",
  "log.info.cardUse.remainingUses": "[Tour {turn}] Note de tag « Restant » : cette carte a X/Y utilisations restantes ; chaque activation en consomme 1 et elle quitte le cycle à 0.",
  "help.short":
    "Le Trésor fixe le revenu en Financement par tour. Le Financement paie les cartes et résolutions d'événements. Le Pouvoir fixe les tentatives de pioche. La Légitimité fixe la limite de conservation. Les événements néfastes non résolus sont réglés en séquence.",
  "runCode.label": "Code de partie",
  "runCode.charCount": "{count} car.",
  "runCode.copy": "Copier",
  "runCode.copied": "Copié",
  "runCode.loadPlaceholder": "Collez un code hexadécimal pour charger…",
  "runCode.load": "Charger",
  "runCode.invalid": "Code invalide : {error}",
  "log.effect.modOpponentStrength": "Budget de l’adversaire Habsbourg {delta}",
  "log.eventDualFrontCrisis.concede":
    "[Tour {turn}] {event} — céder provisoirement ; piste −3 ; budget adverse +1.",
  "log.eventDualFrontCrisis.escalate":
    "[Tour {turn}] {event} — élargir la guerre ; piste +1, légitimité −1, +3 Charges fiscales ; budget adverse +1.",
  "log.eventLocalizedSuccessionWar.resolve":
    "[Tour {turn}] {event}. Payé {paid} {funding}. {track} {delta} (aléatoire).",
};

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
  "resource.power.hint": "Tentatives de pioche par tour.",
  "resource.legitimacy": "Légitimité",
  "resource.legitimacy.hint": "Limite de conservation ; 0 met fin à la partie.",
  "ui.resources": "Ressources",
  "ui.resourceMobileExpand": "Touchez pour afficher les libellés complets et les aides.",
  "ui.resourceMobileCollapse": "Touchez pour réduire les détails des ressources",
  "ui.endTurn": "Terminer le tour",
  "ui.solve": "Résoudre ({cost})",
  "ui.solveCrackdown": "Résoudre (Intervention royale)",
  "ui.solveFundingOrCrackdown": "Payer {cost} ou Intervention royale",
  "ui.scriptedAttack": "Attaquer ({cost})",
  "ui.nantesTolerance": "Tolérance religieuse",
  "ui.nantesCrackdown": "Répression sévère",
  "ui.resolved": "Résolu",
  "ui.harmful": "Néfaste",
  "ui.opportunity": "Opportunité",
  "ui.continued": "Continu",
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
    "[Tour {turn}] Choisissez un événement néfaste à résoudre via Intervention royale (pas Boom du commerce colonial).",
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
  "menu.continueChapter2": "Continuer au Chapitre 2",
  "menu.refit.title": "Réajustement du deck entre chapitres",
  "menu.refit.subtitle": "Reconstruisez votre deck pour une gouvernance à haute pression.",
  "menu.refit.adjustable": "Cartes transférées",
  "menu.refit.newCards": "Nouvelles cartes du Chapitre 2",
  "menu.refit.mode.standalone": "Mode : démarrage autonome du Chapitre 2",
  "menu.refit.mode.continuity": "Mode : continuité après victoire du Chapitre 1",
  "menu.refit.resources": "Ressources de départ — Trésor {treasury}, Pouvoir {power}, Légitimité {legitimacy}",
  "menu.refit.startYear": "Année de départ du Chapitre 2 : {year}",
  "menu.refit.europeAlertOn":
    "Alerte Europe : ACTIVÉE (Poids de Lassitude de guerre +1 ; réduction fixe de pioche chaque année : -{n} ; plus 50% de chance chaque année d'ajouter Garnisons frontalières ou Perturbation commerciale).",
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
  "ui.targets.secondMandateExtra":
    "Objectifs supplémentaires du Chapitre 2 : l'Alerte Europe doit être levée, et les Traités de Nimègue doivent être obtenus.",
  "ui.language": "Langue",
  "ui.lang.en": "English",
  "ui.lang.zh": "中文",
  "ui.lang.fr": "Français",
  "outcome.victory": "Victoire — mandat sécurisé.",
  "outcome.defeatLegitimacy": "Défaite — la légitimité s'est effondrée.",
  "outcome.defeatTime": "Défaite — le temps est écoulé avant d'atteindre les objectifs.",
  "card.funding.name": "Prélèvement royal",
  "card.funding.background":
    "Levées extraordinaires et collecte accélérée — des liquidités à court terme pour les urgences de la couronne.",
  "card.funding.desc": "Gagnez +1 Financement ce tour (pas Trésor). Si « Restant » est épuisé : Trésor -1.",
  "card.crackdown.name": "Intervention royale",
  "card.crackdown.background":
    "Édits, troupes ou action policière — la force appliquée là où rumeur et émeute dépassent déjà la loi.",
  "card.crackdown.desc": "Résolvez un événement néfaste. Si « Restant » est épuisé : Pouvoir -1.",
  "card.fiscalBurden.name": "Fardeau fiscal",
  "card.fiscalBurden.background":
    "Dettes et passifs d'urgence encombrent désormais les comptes et contraignent chaque cycle.",
  "card.fiscalBurden.desc":
    "Quand piochée, perdez 1 Financement. Vous pouvez payer 2 Financement pour l'épurer (retirée, pas défaussée).",
  "card.reform.name": "Réforme administrative",
  "card.reform.background":
    "Registres et chaînes de rapport sont redessinés ; la bureaucratie se resserre sous la direction royale.",
  "card.reform.desc": "Pouvoir +1 (appliqué à la prochaine phase de pioche). Piochez 1 maintenant (main max 12).",
  "card.ceremony.name": "Cérémonie de Versailles",
  "card.ceremony.background":
    "Bannières, serments et spectacle à la cour — la majesté s'affiche pour rappeler à chaque faction qui est au centre.",
  "card.ceremony.desc": "Légitimité +1.",
  "card.development.name": "Manufactures royales",
  "card.development.background":
    "Ateliers, ports et fondations à la manière de Colbert — la montée lente de la richesse nationale par l'industrie royale.",
  "card.development.desc": "Trésor +1.",
  "card.suppressHuguenots.name": "Réprimer les huguenots",
  "card.suppressHuguenots.background":
    "Troupes royales, police et tribunaux locaux sont mobilisés pour briser les réseaux huguenots restants.",
  "card.suppressHuguenots.desc":
    "Temporaire. Coût 3. À l'activation, réduisez « Contenir les restes huguenots » de 1 ; à 0, retirez ce statut et épurez toutes les cartes Réprimer les huguenots.",
  "event.budgetStrain.name": "Dépenses excessives de la cour",
  "event.budgetStrain.desc":
    "L'expansion de Versailles et le rituel de cour poussent les dépenses au-delà du budget. Payez 2 Financement ou perdez 1 Trésor.",
  "event.publicUnrest.name": "Troubles à Paris",
  "event.publicUnrest.desc":
    "Prix du pain et rumeurs envahissent les rues. Intervention royale uniquement, sinon perdez 1 Légitimité.",
  "event.administrativeDelay.name": "Retard administratif",
  "event.administrativeDelay.desc":
    "Les officiels provinciaux ralentissent l'application des nouveaux ordres de la cour. Payez 1 Financement ou piochez une carte de moins au prochain tour (min 1).",
  "event.tradeOpportunity.name": "Boom du commerce colonial",
  "event.tradeOpportunity.desc":
    "Routes maritimes et marchands demandent le soutien de la couronne. Payez 1 Financement pour gagner +1 Trésor. Aucune pénalité si ignoré.",
  "event.powerVacuum.name": "Gouverneur provincial ascendant",
  "event.powerVacuum.desc":
    "Un gouverneur contourne la cour. Payez 2 Financement ou Intervention royale, sinon cela escalade en Crise royale au prochain tour.",
  "event.majorCrisis.name": "Crise royale",
  "event.majorCrisis.desc":
    "Intervention royale uniquement. Tag Continu : si non résolu, il reste au tour suivant et répète Légitimité -1 plus pénalité de pioche chaque année jusqu'à résolution.",
  "event.politicalGridlock.name": "Résistance nobiliaire",
  "event.politicalGridlock.desc":
    "Les grands nobles s'unissent contre votre plan fiscal. Payez 2 Financement ou subissez Perte d'autorité pendant 3 tours (−1 tentative de pioche par tour, min 1).",
  "status.powerLeak.name": "Perte d'autorité",
  "status.powerLeak.history":
    "La résistance provinciale et les frictions de factions affaiblissent progressivement l'exécution centrale.",
  "status.drawPenalty.name": "Fatigue de pioche",
  "status.drawPenalty.history": "La restructuration fiscale crée des frictions d'application à court terme.",
  "status.retentionBoost.name": "Réserve de cour",
  "status.retentionBoost.history":
    "Les réseaux de patronage améliorent la continuité du contrôle royal sur les nominations.",
  "status.royalBan.name": "Accès royal gelé",
  "status.royalBan.history":
    "Quand la crédibilité de la cour s'effondre, les outils de commandement royal perdent temporairement en traction.",
  "status.grainReliefDrawBoost.name": "Coordination des secours",
  "status.grainReliefDrawBoost.history":
    "L'administration d'urgence des grains augmente la capacité de coordination à court terme.",
  "status.grainReliefLegitimacyBoost.name": "Confiance dans les secours",
  "status.grainReliefLegitimacyBoost.history":
    "Une action de secours visible restaure brièvement la confiance dans la gouvernance de la couronne.",
  "status.religiousTolerance.name": "Tolérance religieuse (Permanent)",
  "status.religiousTolerance.history":
    "La tolérance réduit la coercition immédiate mais laisse des tensions confessionnelles récurrentes.",
  "status.huguenotContainment.name": "Contenir les restes huguenots",
  "status.huguenotContainment.history":
    "Une répression dure exige des campagnes policières soutenues et du capital politique.",
  "status.huguenotContainment.hint": "Tant que ce statut est actif, la victoire du Chapitre 2 est bloquée.",
  "event.religiousTension.name": "Tension religieuse",
  "event.religiousTension.desc":
    "Le conflit confessionnel s'embrase de nouveau. Payez 2 Financement ou perdez 1 Légitimité.",
  "card.tag.royal": "Royal",
  "card.tag.temp": "Temp",
  "card.tag.extra": "Supplémentaire",
  "card.tag.inflation": "Inflation",
  "card.tag.remainingUses": "Restant {remaining}/{total}",
  "log.info.cardUse.depleted.crackdownPenalty":
    "[Tour {turn}] Intervention royale atteint 0/3 et est retirée du cycle ; la capacité de contrainte de la cour recule (Pouvoir -1).",
  "log.info.cardUse.depleted.fundingPenalty":
    "[Tour {turn}] Prélèvement royal atteint 0/3 et est retiré du cycle ; les canaux d'extraction d'urgence s'épuisent (Trésor -1).",
  "log.info.cardUse.depleted.diplomaticIntervention":
    "[Tour {turn}] Intervention diplomatique atteint 0/3 et est retirée du cycle (sans pénalité).",
  "log.info.cardTag.extra":
    "[Tour {turn}] Note de tag « Supplémentaire » : cette carte est ajoutée par d'autres effets, exclue du réajustement inter-chapitre et retirée à la fin du chapitre.",
  "log.info.cardUse.remainingUses": "[Tour {turn}] Note de tag « Restant » : cette carte a X/Y utilisations restantes ; chaque activation en consomme 1 et elle quitte le cycle à 0.",
  "help.short":
    "Le Trésor fixe le revenu en Financement par tour. Le Financement paie les cartes et résolutions d'événements. Le Pouvoir fixe les tentatives de pioche. La Légitimité fixe la limite de conservation. Les événements néfastes non résolus sont réglés en séquence.",
};

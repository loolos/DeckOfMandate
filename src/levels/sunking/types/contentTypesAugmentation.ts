/**
 * Sun King campaign contributions to the framework content-type registries
 * (`src/levels/types/*`): template ids, tags, resource stats, effect kinds,
 * event solve kinds, and template metadata fields. See `gameStateAugmentation.ts`
 * for the game-state side.
 */
import type { Effect } from "../../types/effect";

declare module "../../types/tags" {
  interface CardTagRegistry {
    royal: true;
    temp: true;
    extra: true;
    inflation: true;
    defiance: true;
    consume: true;
    opponent: true;
    successionContest: true;
  }
}

declare module "../../types/effect" {
  interface ResourceStatRegistry {
    treasuryStat: true;
    power: true;
    legitimacy: true;
  }

  interface CampaignEffectRegistry {
    gainFunding: { kind: "gainFunding"; amount: number };
    modEuropeAlertProgress: { kind: "modEuropeAlertProgress"; delta: number };
    modSuccessionTrack: { kind: "modSuccessionTrack"; delta: number };
    /** Applied at next `beginYear` when computing treasury→funding income (then reset with draw modifier). */
    /** Chapter 3 opponent phase only: adjusts opponent's next `beginYear` draw count (base 2). */
    opponentNextTurnDrawModifier: { kind: "opponentNextTurnDrawModifier"; delta: number };
    /** Chapter 3: immediately discard `count` random cards from the Habsburg opponent's hand (played-card phase). */
    opponentHandDiscardNow: { kind: "opponentHandDiscardNow"; count: number };
    /** Chapter 3: adjusts Habsburg opponent cost budget (`opponentStrength`). */
    modOpponentStrength: { kind: "modOpponentStrength"; delta: number };
  }
}

declare module "../../types/card" {
  interface CardTemplateIdRegistry {
    funding: true;
    crackdown: true;
    diplomaticIntervention: true;
    fiscalBurden: true;
    antiFrenchContainment: true;
    reform: true;
    ceremony: true;
    development: true;
    grainRelief: true;
    taxRebalance: true;
    diplomaticCongress: true;
    suppressHuguenots: true;
    religiousTensionCard: true;
    jansenistReservation: true;
    jesuitCollege: true;
    bourbonMarriageProclamation: true;
    grandAllianceInfiltrationDiplomacy: true;
    italianTheaterTroopRedeploy: true;
    usurpationEdict: true;
    habsburgGrandAllianceLevy: true;
    habsburgImperialCustomsDelay: true;
    habsburgImperialLegitimacyNote: true;
    habsburgLowCountriesAgitation: true;
    habsburgAngloDutchMaritimeInterdiction: true;
    habsburgRhineMagazineEmbargo: true;
  }

  interface CampaignCardTemplateFields {
    /**
     * Habsburg opponent pool only: budget cost for the opponent phase each year.
     * When set, the card is not meant for the player hand (engine keeps it in opponent zones).
     */
    opponentCost?: number;
  }
}

declare module "../../types/status" {
  interface StatusTemplateIdRegistry {
    powerLeak: true;
    drawPenalty: true;
    retentionBoost: true;
    royalBan: true;
    grainReliefDrawBoost: true;
    grainReliefLegitimacyBoost: true;
    religiousTolerance: true;
    huguenotContainment: true;
    antiFrenchSentiment: true;
    greatPowerEncirclement: true;
    legitimacyCrisis: true;
    minorRegencyDoubt: true;
    bourbonMarriageRetention: true;
    diplomaticCongressDrawBoost: true;
    grandAllianceInfiltration: true;
    supplyLineSqueeze: true;
    usurpationMobilization: true;
    edictBacklog: true;
    provincialFootDragging: true;
    nobleGrudge: true;
    warExhaustion: true;
    frontierWatch: true;
    seaLaneDisarray: true;
    embargoPressure: true;
    confessionalDeadlock: true;
  }
}

declare module "../../types/event" {
  interface EventTemplateIdRegistry {
    budgetStrain: true;
    publicUnrest: true;
    administrativeDelay: true;
    tradeOpportunity: true;
    politicalGridlock: true;
    powerVacuum: true;
    majorCrisis: true;
    warOfDevolution: true;
    nymwegenSettlement: true;
    revocationNantes: true;
    leagueOfAugsburg: true;
    nineYearsWar: true;
    ryswickPeace: true;
    versaillesExpenditure: true;
    nobleResentment: true;
    provincialNoncompliance: true;
    risingGrainPrices: true;
    taxResistance: true;
    frontierGarrisons: true;
    tradeDisruption: true;
    embargoCoalition: true;
    mercenaryRaiders: true;
    courtScandal: true;
    militaryPrestige: true;
    commercialExpansion: true;
    sunKingPilgrimage: true;
    talentedAdministrator: true;
    warWeariness: true;
    expansionRemembered: true;
    cautiousCrown: true;
    jansenistTension: true;
    arminianTension: true;
    huguenotTension: true;
    localWar: true;
    jesuitPatronage: true;
    successionCrisis: true;
    opponentHabsburg: true;
    utrechtTreaty: true;
    bavarianCourtRealignment: true;
    portugueseTariffNegotiation: true;
    imperialElectorsMood: true;
    localizedSuccessionWar: true;
    dualFrontCrisis: true;
    louisXivLegacy1715: true;
  }

  interface EventTagRegistry {
    antiFrenchAlliance: true;
    continued3: true;
  }

  interface CampaignEventSolveRegistry {
    funding: { kind: "funding"; amount: number };
    fundingOrCrackdown: { kind: "fundingOrCrackdown"; amount: number };
    nantesPolicyChoice: { kind: "nantesPolicyChoice" };
    crackdownOnly: { kind: "crackdownOnly" };
    localWarChoice: { kind: "localWarChoice" };
    /** Balance numbers come from level `scriptedCalendarEvents` (matched by template id). */
    scriptedAttack: { kind: "scriptedAttack" };
    /** Chapter 3: pay 3 funding for track +1, or decline for -1 (resolved via dedicated actions). */
    successionCrisisChoice: { kind: "successionCrisisChoice" };
    /** Chapter 3: scripted Utrecht negotiation — no funding solve. */
    utrechtTreatyChoice: { kind: "utrechtTreatyChoice" };
    /** Chapter 3: permanent opponent row — not solved with funding. */
    opponentDisplay: { kind: "opponentDisplay" };
    /** Chapter 3: funding scales with ceil(treasuryStat/4) at solve time. */
    fundingTreasuryQuarterCeil: { kind: "fundingTreasuryQuarterCeil" };
    /** Chapter 3: 1708 dual-front crisis — concede or escalate (dedicated actions). */
    dualFrontCrisisChoice: { kind: "dualFrontCrisisChoice" };
    /** Chapter 3: 1715 legacy event — regency custody vs direct young-king rule. */
    louisXivLegacyChoice: { kind: "louisXivLegacyChoice" };
  }

  interface CampaignEventTemplateFields {
    /** Applied when player resolves this event through the funding path. */
    onFundSolveEffects?: readonly Effect[];
    /**
     * When true, Crackdown / diplomatic intervention cannot clear this event (funding or scripted choices only).
     */
    crackdownImmune?: boolean;
  }
}

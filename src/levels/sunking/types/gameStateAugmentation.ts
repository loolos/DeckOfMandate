/**
 * Sun King campaign contributions to the framework game-state types.
 *
 * The framework (`src/types/game.ts`) only defines the campaign-neutral core plus empty
 * registry interfaces; every Sun King resource, state field, outcome, pending interaction,
 * log entry, and log info key is merged in here via TypeScript declaration merging.
 * A different campaign pack would ship its own augmentation file instead.
 */
import type { CardTemplateId } from "../../types/card";
import type { Effect } from "../../types/effect";
import type { EventTemplateId, SlotId } from "../../types/event";
import type { AntiFrenchLeagueState, NantesPolicyCarryover, SuccessionIntervalTier } from "./campaignState";

declare module "../../../types/game" {
  /** Sun King resource system: treasury income, spendable funding, power-driven draw, legitimacy floor. */
  interface Resources {
    treasuryStat: number;
    funding: number;
    power: number;
    legitimacy: number;
  }

  interface CampaignGameOutcomeRegistry {
    /** Legitimacy or power reached 0. */
    defeatLegitimacy: true;
    /** Chapter 3: succession track reached -10 (or legacy). */
    defeatSuccession: true;
  }

  interface CampaignPendingInteractionRegistry {
    crackdownPick: {
      type: "crackdownPick";
      cardInstanceId: string;
      /** For cancel / validation. */
      fundingPaid: number;
    };
  }

  interface CampaignLogInfoKeyRegistry {
    firstMandateInflationActivated: true;
    chapter2EuropeAlertOn: true;
    chapter2EuropeAlertContinuityLow: true;
    chapter2EuropeAlertOff: true;
    chapter3ContinuityIntro: true;
    antiFrenchSentimentActivated: true;
    antiFrenchSentimentEnded: true;
    "cardTag.royal": true;
    "cardTag.temp": true;
    "cardTag.extra": true;
    "cardTag.inflation": true;
    "cardTag.defiance": true;
    "cardTag.consume": true;
    "cardTag.successionContest": true;
    "cardUse.remainingUses": true;
    "cardUse.depleted.crackdownPenalty": true;
    "cardUse.depleted.fundingPenalty": true;
    "cardUse.depleted.diplomaticIntervention": true;
    "cardDraw.fiscalBurdenTriggered": true;
    "cardDraw.antiFrenchContainmentPowerLoss": true;
    "cardDraw.antiFrenchContainmentLegitimacyLoss": true;
    "nantesPolicy.toleranceNoFontainebleau": true;
    "nantesPolicy.crackdownFontainebleauIssued": true;
    huguenotContainmentCleared: true;
    "eventTag.harmful": true;
    "eventTag.opportunity": true;
    "eventTag.historical": true;
    "eventTag.antiFrenchAlliance": true;
    "eventTag.continued": true;
    "eventTag.resolved": true;
  }

  interface ActionLogEntryRegistry {
    eventFundSolved: {
      kind: "eventFundSolved";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: EventTemplateId;
      fundingPaid: number;
      treasuryGain: number;
    };
    eventCrackdownSolved: {
      kind: "eventCrackdownSolved";
      id: string;
      turn: number;
      slot: SlotId;
      harmfulEventTemplateId: EventTemplateId;
      fundingPaid: number;
    };
    eventPowerVacuumScheduled: {
      kind: "eventPowerVacuumScheduled";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: "powerVacuum";
    };
    crackdownCancelled: {
      kind: "crackdownCancelled";
      id: string;
      turn: number;
      refund: number;
    };
    crackdownPickPrompt: {
      kind: "crackdownPickPrompt";
      id: string;
      turn: number;
    };
    eventScriptedAttack: {
      kind: "eventScriptedAttack";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: EventTemplateId;
      fundingPaid: number;
      treasuryGain: number;
      /** From level scripted config; shown in log. */
      powerDelta: number;
      /** Rounded percent; treasury roll used `extraTreasuryProbability` from config. */
      extraTreasuryProbabilityPct: number;
    };
    eventNineYearsWarAttempt: {
      kind: "eventNineYearsWarAttempt";
      id: string;
      turn: number;
      slot: SlotId;
      method: "funding" | "intervention";
      fundingPaid: number;
      /** 1..9 sampled bucket used for deterministic outcome display. */
      roll: number;
      outcome: "majorVictory" | "stalemate" | "minorGains";
    };
    eventNineYearsWarBegins: {
      kind: "eventNineYearsWarBegins";
      id: string;
      turn: number;
      slot: SlotId;
    };
    eventLocalWarChoice: {
      kind: "eventLocalWarChoice";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: "localWar";
      choice: "attack" | "appease";
      fundingPaid: number;
      powerDelta: number;
      legitimacyDelta: number;
    };
    eventNineYearsWarCampaign: {
      kind: "eventNineYearsWarCampaign";
      id: string;
      turn: number;
      slot: SlotId;
      fundingPaid: number;
      viaIntervention: boolean;
      outcome: "decisiveVictory" | "stalemate" | "limitedGains";
      legitimacyDelta: number;
    };
    eventNineYearsWarFiscalBurden: {
      kind: "eventNineYearsWarFiscalBurden";
      id: string;
      turn: number;
      slot: SlotId;
    };
    eventNineYearsWarEndedByRyswick: {
      kind: "eventNineYearsWarEndedByRyswick";
      id: string;
      turn: number;
      removedCount: number;
    };
    eventNineYearsWarBurden: {
      kind: "eventNineYearsWarBurden";
      id: string;
      turn: number;
      slot: SlotId;
    };
    huguenotResurgence: {
      kind: "huguenotResurgence";
      id: string;
      turn: number;
      /** Copies of `suppressHuguenots` just inserted into the deck (always 1 for now). */
      addedCount: number;
      /** Stacks left on `huguenotContainment` after this resurgence. */
      remainingStacks: number;
    };
    antiFrenchLeagueDraw: {
      kind: "antiFrenchLeagueDraw";
      id: string;
      turn: number;
      /** Rounded percent; hazard rolled at beginYear when league is active. */
      probabilityPct: number;
    };
    europeAlertProgressShift: {
      kind: "europeAlertProgressShift";
      id: string;
      turn: number;
      from: number;
      to: number;
      /** Rounded percent of this turn's roll gate. */
      probabilityPct: number;
      /** x-12-y*3 using this turn's pre-adjust resources/progress baseline. */
      pressureDeltaK: number;
    };
    opponentHabsburgPlay: {
      kind: "opponentHabsburgPlay";
      id: string;
      turn: number;
      /** Instance ids played this opponent phase, sorted per AI tie-break. */
      cardInstanceIds: string[];
      /** Play order; same tie-break as instance ids. */
      playedTemplateIds: readonly CardTemplateId[];
      /** Net effects on the player this phase (same composition as `opponentTemplatesToAppliedEffects`). */
      effects: readonly Effect[];
      /** Total opponent-cost budget before discount. */
      opponentCostSum: number;
      /** Applied discount from player cards this turn. */
      opponentCostDiscount: number;
    };
    opponentHabsburgDraw: {
      kind: "opponentHabsburgDraw";
      id: string;
      turn: number;
      drawnCardIds: string[];
    };
    eventDualFrontCrisisChoice: {
      kind: "eventDualFrontCrisisChoice";
      id: string;
      turn: number;
      slot: SlotId;
      /** True: escalate war (+1 track, −1 legitimacy, +3 Fiscal Burden). False: concede (−3 track). Opponent budget +1 either way. */
      expandWar: boolean;
    };
    eventSuccessionCrisisChoice: {
      kind: "eventSuccessionCrisisChoice";
      id: string;
      turn: number;
      slot: SlotId;
      pay: boolean;
      fundingPaid: number;
      successionDelta: 1 | -1;
    };
    eventLouisXivLegacyChoice: {
      kind: "eventLouisXivLegacyChoice";
      id: string;
      turn: number;
      slot: SlotId;
      directRule: boolean;
    };
    eventLocalizedSuccessionWarResolve: {
      kind: "eventLocalizedSuccessionWarResolve";
      id: string;
      turn: number;
      slot: SlotId;
      fundingPaid: number;
      successionDelta: -1 | 0 | 1 | 2;
    };
    utrechtPeaceSettlement: {
      kind: "utrechtPeaceSettlement";
      id: string;
      turn: number;
      tier: SuccessionIntervalTier;
    };
  }

  interface CampaignGameStateFields {
    /**
     * Chapter 2 only (until resolved): records the Edict of Nantes branch taken at `revocationNantes`.
     * Chapter 3 reads this when continuing from chapter 2; remains null if the event was never resolved.
     */
    nantesPolicyCarryover: NantesPolicyCarryover | null;
    /** Set when resolving a scripted attack (e.g. War of Devolution); cleared after `untilTurn`. */
    antiFrenchLeague: AntiFrenchLeagueState | null;
    /** True after the player chooses the military option on the War of Devolution event (affects victory epilogue). */
    warOfDevolutionAttacked: boolean;
    /** Continuity marker from Chapter 1 military overreach; increases selected war-pressure rolls in Chapter 2. */
    europeAlert: boolean;
    /** Legacy/compat field; Europe Alert no longer applies chapter-start power loss (kept as 0). */
    europeAlertPowerLoss: number;
    /** Europe Alert pressure progress in Chapter 2 (1-10 while active; defaults to 3 when it starts). */
    europeAlertProgress: number;
    /** Chapter-2 objective marker; set true once Treaties of Nijmegen is successfully resolved. */
    nymwegenSettlementAchieved: boolean;
    /**
     * Counts beginYear ticks since the last Huguenot resurgence trigger (or since Crackdown was chosen).
     * While `huguenotContainment` is active, every 2 ticks adds a `suppressHuguenots` card to the deck
     * and increments containment stacks by 1. Reset to 0 when the trigger fires or when the choice is made.
     */
    huguenotResurgenceCounter: number;
    /**
     * Consumed at the next `beginYear` when adding treasury-based funding income (additive with treasury
     * stat and local-war penalty), then reset to 0 with `nextTurnDrawModifier`.
     */
    nextTurnFundingIncomeModifier: number;
    /** Inflation stacks per card instance (active in Chapter 2, and in Chapter 1 after pressure threshold). */
    cardInflationById: Record<string, number>;
    /** If true, that slot must become Major Crisis at the next Event phase (before empty rolls). */
    pendingMajorCrisis: Record<SlotId, boolean>;
    /** Chapter 3: Spanish succession contest, -10..+10. */
    successionTrack: number;
    /** Chapter 3: max opponent-cost budget per opponent phase (fixed at 3 in this version). */
    opponentStrength: number;
    /** Chapter 3: true once Great Power Encirclement has applied its high-resource bonus. */
    greatPowerEncirclementHighPressureApplied: boolean;
    /** Chapter 3: after `successionCrisis` resolves; enables opponent draw/play. */
    opponentHabsburgUnlocked: boolean;
    /**
     * Chapter 3: player ended the war via Utrecht event or countdown.
     * While true: succession track is frozen (hidden in UI), `modSuccessionTrack` has no effect,
     * chapter-3 succession-gated random events are not rolled, and ±10 track instant outcomes are off.
     */
    warEnded: boolean;
    /** Chapter 3: Utrecht event rounds remaining while active; null when not in negotiation. */
    utrechtTreatyCountdown: number | null;
    opponentDeck: string[];
    opponentHand: string[];
    opponentDiscard: string[];
    /** Chapter 3: `grandAllianceInfiltrationDiplomacy` — reduces opponent cost sum (min 0). */
    opponentCostDiscountThisTurn: number;
    /**
     * Chapter 3: added when the opponent plays certain cards; consumed at `opponentBeginYearDrawPhase`.
     * Opponent draw count that year is `max(0, 2 + this)`, then this resets to 0.
     */
    opponentNextTurnDrawModifier: number;
    /**
     * Chapter 3: opponent templates played in the last completed opponent phase (`END_YEAR`), preserved for UI.
     */
    opponentLastPlayedTemplateIds: readonly CardTemplateId[];
    /**
     * When `outcome` is `victory` from chapter 3 calendar end, which tier narrative to show.
     */
    successionOutcomeTier: SuccessionIntervalTier | null;
    /**
     * Chapter 3: frozen when the Utrecht treaty ends hostilities (`warEnded`), from signing-time
     * `successionTrack` via `utrechtTreatySituationTier` (bourbon ≥+5, compromise −4..+4, habsburg ≤−5).
     * Drives `outcome.utrechtVictoryEpilogue.*` on victory.
     */
    utrechtSettlementTier: SuccessionIntervalTier | null;
  }
}

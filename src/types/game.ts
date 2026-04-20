import type { LevelId } from "../data/levels";
import type { CardInstance, CardTemplateId } from "./card";
import type { Effect } from "./effect";
import type { EventInstance, EventTemplateId, SlotId } from "./event";
import type { PlayerStatusInstance } from "./status";

export type LogInfoKey =
  | "firstMandateInflationActivated"
  | "chapter2EuropeAlertOn"
  | "chapter2EuropeAlertOff"
  | "antiFrenchSentimentActivated"
  | "antiFrenchSentimentEnded"
  | "cardTag.royal"
  | "cardTag.temp"
  | "cardTag.extra"
  | "cardTag.inflation"
  | "cardUse.remainingUses"
  | "cardUse.depleted.crackdownPenalty"
  | "cardUse.depleted.fundingPenalty"
  | "cardUse.depleted.diplomaticIntervention"
  | "cardDraw.fiscalBurdenTriggered"
  | "cardDraw.antiFrenchContainmentPowerLoss"
  | "cardDraw.antiFrenchContainmentLegitimacyLoss"
  | "nantesPolicy.toleranceNoFontainebleau"
  | "nantesPolicy.crackdownFontainebleauIssued"
  | "eventTag.harmful"
  | "eventTag.opportunity"
  | "eventTag.historical"
  | "eventTag.continued"
  | "eventTag.resolved";

/** Append-only player-facing log; newest entries at the end of the array. */
export type ActionLogEntry =
  | {
      kind: "cardPlayed";
      id: string;
      turn: number;
      templateId: CardTemplateId;
      fundingCost: number;
      effects: readonly Effect[];
    }
  | {
      kind: "eventFundSolved";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: EventTemplateId;
      fundingPaid: number;
      treasuryGain: number;
    }
  | {
      kind: "eventCrackdownSolved";
      id: string;
      turn: number;
      slot: SlotId;
      harmfulEventTemplateId: EventTemplateId;
      fundingPaid: number;
    }
  | {
      kind: "eventYearEndPenalty";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: EventTemplateId;
      effects: readonly Effect[];
    }
  | {
      kind: "eventPowerVacuumScheduled";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: "powerVacuum";
    }
  | {
      kind: "crackdownCancelled";
      id: string;
      turn: number;
      refund: number;
    }
  | {
      kind: "crackdownPickPrompt";
      id: string;
      turn: number;
    }
  | {
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
    }
  | {
      kind: "eventLocalWarChoice";
      id: string;
      turn: number;
      slot: SlotId;
      templateId: "localWar";
      choice: "attack" | "appease";
      fundingPaid: number;
      powerDelta: number;
      legitimacyDelta: number;
    }
  | {
      kind: "eventNineYearsWarCampaign";
      id: string;
      turn: number;
      slot: SlotId;
      fundingPaid: number;
      viaIntervention: boolean;
      outcome: "decisiveVictory" | "stalemate" | "limitedGains";
      legitimacyDelta: number;
    }
  | {
      kind: "eventNineYearsWarFiscalBurden";
      id: string;
      turn: number;
      slot: SlotId;
    }
  | {
      kind: "huguenotResurgence";
      id: string;
      turn: number;
      /** Copies of `suppressHuguenots` just inserted into the deck (always 1 for now). */
      addedCount: number;
      /** Stacks left on `huguenotContainment` after this resurgence. */
      remainingStacks: number;
    }
  | {
      kind: "antiFrenchLeagueDraw";
      id: string;
      turn: number;
      /** Rounded percent; hazard rolled at beginYear when league is active. */
      probabilityPct: number;
    }
  | {
      kind: "europeAlertProgressShift";
      id: string;
      turn: number;
      from: number;
      to: number;
      /** Rounded percent of this turn's roll gate. */
      probabilityPct: number;
      /** x-12-y*3 using this turn's pre-adjust resources/progress baseline. */
      pressureDeltaK: number;
    }
  | {
      kind: "drawOverflowDiscarded";
      id: string;
      turn: number;
      cardTemplateIds: CardTemplateId[];
    }
  | {
      kind: "drawCards";
      id: string;
      turn: number;
      cardTemplateIds: CardTemplateId[];
    }
  | {
      kind: "info";
      id: string;
      turn: number;
      infoKey: LogInfoKey;
    };

export type GamePhase = "action" | "retention" | "gameOver";

export type GameOutcome =
  | "playing"
  | "victory"
  | "defeatLegitimacy"
  | "defeatTime";

/** After a scripted military choice; each year’s draw may roll drawPenaltyProbability for drawPenaltyDelta (clamped with power). */
export type AntiFrenchLeagueState = {
  untilTurn: number;
  drawPenaltyProbability: number;
  drawPenaltyDelta: number;
};

export type PendingInteraction =
  | {
      type: "crackdownPick";
      cardInstanceId: string;
      /** For cancel / validation. */
      fundingPaid: number;
    };

export type Resources = {
  treasuryStat: number;
  funding: number;
  power: number;
  legitimacy: number;
};

export type CardUseState = {
  remaining: number;
  total: number;
};

export type RngSerialized = {
  /** Mulberry32 internal state (uint32). */
  state: number;
};

export type GameState = {
  /** Active level; drives turn limit, win targets, calendar, and starting layout on new runs. */
  levelId: LevelId;
  /** Per-run calendar anchor; defaults to level start year but can be overridden for chapter continuity. */
  calendarStartYear: number;
  runSeed: number;
  rng: RngSerialized;
  turn: number;
  phase: GamePhase;
  outcome: GameOutcome;
  pendingInteraction: PendingInteraction | null;
  nextIds: { event: number; status: number; log: number };
  resources: Resources;
  /**
   * Consumed at the start of the Draw phase; sums delays / crises that affect draw count only.
   * Draw attempts = max(1, power + this), then reset to 0.
   */
  nextTurnDrawModifier: number;
  /** Queue of per-year draw modifiers; index 0 applies this year then is shifted. */
  scheduledDrawModifiers: number[];
  deck: string[];
  discard: string[];
  hand: string[];
  /** All card instances keyed by id (includes played copies for lookup). */
  cardsById: Record<string, CardInstance>;
  /** Limited-use cards store remaining uses for "Remaining X/Y" hand tags and depletion effects. */
  cardUsesById: Record<string, CardUseState>;
  /** Inflation stacks per card instance (active in Chapter 2, and in Chapter 1 after pressure threshold). */
  cardInflationById: Record<string, number>;
  slots: Record<SlotId, EventInstance | null>;
  /** If true, that slot must become Major Crisis at the next Event phase (before empty rolls). */
  pendingMajorCrisis: Record<SlotId, boolean>;
  /** Timed modifiers (e.g. draw penalty); turns tick after each beginYear draw phase. */
  playerStatuses: PlayerStatusInstance[];
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
   * Deterministic procedural event queue (A–C random events only).
   * Built as concatenated shuffled blocks where each template appears `weight` times.
   */
  proceduralEventSequence: EventTemplateId[];
  actionLog: readonly ActionLogEntry[];
};

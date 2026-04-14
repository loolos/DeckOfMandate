import type { LevelId } from "../data/levels";
import type { CardInstance, CardTemplateId } from "./card";
import type { Effect } from "./effect";
import type { EventInstance, EventTemplateId, SlotId } from "./event";
import type { PlayerStatusInstance } from "./status";

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
      kind: "antiFrenchLeagueDraw";
      id: string;
      turn: number;
      /** Rounded percent; hazard rolled at beginYear when league is active. */
      probabilityPct: number;
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
  /** Fixed Chapter-2 Europe Alert draw reduction computed from chapter-start power (floor(power/2), min 1). */
  europeAlertDrawPenalty: number;
  /** Chapter-2 objective marker; set true once Treaties of Nijmegen is successfully resolved. */
  nymwegenSettlementAchieved: boolean;
  /**
   * Deterministic procedural event queue (A–C random events only).
   * Built as concatenated shuffled blocks where each template appears `weight` times.
   */
  proceduralEventSequence: EventTemplateId[];
  actionLog: readonly ActionLogEntry[];
};

import type { LevelId } from "../data/levels";
import type { CardInstance, CardTemplateId } from "../levels/types/card";
import type { Effect } from "../levels/types/effect";
import type { EventInstance, EventTemplateId, SlotId } from "../levels/types/event";
import type { PlayerStatusInstance } from "../levels/types/status";

/**
 * Registry of `info` action-log keys. The framework declares none; campaign packs merge
 * their keys in via `declare module` (see `src/levels/sunking/types/gameStateAugmentation.ts`).
 */
export interface CampaignLogInfoKeyRegistry {}
export type LogInfoKey = keyof CampaignLogInfoKeyRegistry & string;

/**
 * Registry of action-log entry shapes keyed by `kind`. The framework declares only the
 * campaign-neutral entries; campaign packs merge in their own kinds via `declare module`.
 */
export interface ActionLogEntryRegistry {
  cardPlayed: {
    kind: "cardPlayed";
    id: string;
    turn: number;
    templateId: CardTemplateId;
    fundingCost: number;
    effects: readonly Effect[];
  };
  eventYearEndPenalty: {
    kind: "eventYearEndPenalty";
    id: string;
    turn: number;
    slot: SlotId;
    templateId: EventTemplateId;
    effects: readonly Effect[];
  };
  drawOverflowDiscarded: {
    kind: "drawOverflowDiscarded";
    id: string;
    turn: number;
    cardTemplateIds: CardTemplateId[];
  };
  drawCards: {
    kind: "drawCards";
    id: string;
    turn: number;
    cardTemplateIds: CardTemplateId[];
  };
  info: {
    kind: "info";
    id: string;
    turn: number;
    infoKey: LogInfoKey;
  };
}

/** Append-only player-facing log; newest entries at the end of the array. */
export type ActionLogEntry = ActionLogEntryRegistry[keyof ActionLogEntryRegistry];

export type GamePhase = "action" | "retention" | "gameOver";

/** Campaign packs merge their extra outcomes (e.g. special defeats) into this registry. */
export interface CampaignGameOutcomeRegistry {}
export type GameOutcome = "playing" | "victory" | "defeatTime" | (keyof CampaignGameOutcomeRegistry & string);

/** Campaign packs merge their modal interaction shapes (keyed by `type`) into this registry. */
export interface CampaignPendingInteractionRegistry {}
export type PendingInteraction = CampaignPendingInteractionRegistry[keyof CampaignPendingInteractionRegistry];

/**
 * Player resources. The framework does not define any resource: each campaign pack declares
 * its own resource system by merging fields into this interface via `declare module`.
 */
export interface Resources {}

export type CardUseState = {
  remaining: number;
  total: number;
};

export type RngSerialized = {
  /** Mulberry32 internal state (uint32). */
  state: number;
};

/**
 * Campaign packs merge their run-state fields into this interface via `declare module`.
 * The Sun King slice is catalogued in `src/levels/sunking/types/campaignState.ts`.
 */
export interface CampaignGameStateFields {}

/** Campaign-neutral core of the run state; campaign fields are merged in from the registry above. */
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
  deck: string[];
  discard: string[];
  hand: string[];
  /** All card instances keyed by id (includes played copies for lookup). */
  cardsById: Record<string, CardInstance>;
  /** Limited-use cards store remaining uses for "Remaining X/Y" hand tags and depletion effects. */
  cardUsesById: Record<string, CardUseState>;
  slots: Record<SlotId, EventInstance | null>;
  /** Timed modifiers (e.g. draw penalty); turns tick after each beginYear draw phase. */
  playerStatuses: PlayerStatusInstance[];
  /**
   * Deterministic procedural event queue (A–C random events only).
   * Built as concatenated shuffled blocks where each template appears `weight` times.
   * Cleared and rebuilt when the active level's rollable event ids change.
   */
  proceduralEventSequence: EventTemplateId[];
  /**
   * Shuffled `rollableEventIds` for the current level. Re-shuffled when content changes
   * so newly added event templates enter the same procedural ordering as existing ones.
   */
  proceduralEventPoolOrder: EventTemplateId[];
  actionLog: readonly ActionLogEntry[];
} & CampaignGameStateFields;

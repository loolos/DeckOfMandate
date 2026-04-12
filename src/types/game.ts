import type { LevelId } from "../data/levels";
import type { CardInstance } from "./card";
import type { EventInstance, SlotId } from "./event";

export type GamePhase = "action" | "retention" | "gameOver";

export type GameOutcome =
  | "playing"
  | "victory"
  | "defeatLegitimacy"
  | "defeatTime";

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
  runSeed: number;
  rng: RngSerialized;
  turn: number;
  phase: GamePhase;
  outcome: GameOutcome;
  pendingInteraction: PendingInteraction | null;
  nextIds: { event: number };
  resources: Resources;
  /**
   * Consumed at the start of the Draw phase; sums delays / crises that affect draw count only.
   * Draw attempts = max(1, power + this), then reset to 0.
   */
  nextTurnDrawModifier: number;
  deck: string[];
  discard: string[];
  hand: string[];
  /** All card instances keyed by id (includes played copies for lookup). */
  cardsById: Record<string, CardInstance>;
  slots: Record<SlotId, EventInstance | null>;
  /** If true, that slot must become Major Crisis at the next Event phase (before empty rolls). */
  pendingMajorCrisis: Record<SlotId, boolean>;
};

import type { CardTemplateId } from "../types/card";
import type { Effect } from "../types/effect";
import type { EventTemplateId, SlotId } from "../types/event";
import type { ActionLogEntry, GameState } from "../types/game";

export const MAX_ACTION_LOG = 150;

export type ActionLogPayload =
  | { kind: "cardPlayed"; templateId: CardTemplateId; fundingCost: number; effects: readonly Effect[] }
  | {
      kind: "eventFundSolved";
      slot: SlotId;
      templateId: EventTemplateId;
      fundingPaid: number;
      treasuryGain: number;
    }
  | { kind: "eventCrackdownSolved"; slot: SlotId; harmfulEventTemplateId: EventTemplateId; fundingPaid: number }
  | { kind: "eventYearEndPenalty"; slot: SlotId; templateId: EventTemplateId; effects: readonly Effect[] }
  | { kind: "eventPowerVacuumScheduled"; slot: SlotId; templateId: "powerVacuum" }
  | { kind: "crackdownCancelled"; refund: number }
  | { kind: "crackdownPickPrompt" };

export function appendActionLog(state: GameState, payload: ActionLogPayload): GameState {
  const logSeq = state.nextIds.log ?? 0;
  const id = `log_${logSeq}`;
  const turn = state.turn;
  const entry = { ...payload, id, turn } as ActionLogEntry;
  const nextLog = [...state.actionLog, entry].slice(-MAX_ACTION_LOG);
  return {
    ...state,
    actionLog: nextLog,
    nextIds: { ...state.nextIds, log: logSeq + 1 },
  };
}

import type { CardTemplateId } from "../levels/types/card";
import type { Effect } from "../levels/types/effect";
import type { EventTemplateId, SlotId } from "../levels/types/event";
import type { ActionLogEntry, GameState, LogInfoKey } from "../types/game";

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
  | { kind: "crackdownPickPrompt" }
  | {
      kind: "eventScriptedAttack";
      slot: SlotId;
      templateId: EventTemplateId;
      fundingPaid: number;
      treasuryGain: number;
      powerDelta: number;
      extraTreasuryProbabilityPct: number;
    }
  | {
      kind: "eventLocalWarChoice";
      slot: SlotId;
      templateId: "localWar";
      choice: "attack" | "appease";
      fundingPaid: number;
      powerDelta: number;
      legitimacyDelta: number;
    }
  | {
      kind: "eventNineYearsWarCampaign";
      slot: SlotId;
      fundingPaid: number;
      viaIntervention: boolean;
      outcome: "decisiveVictory" | "stalemate" | "limitedGains";
      legitimacyDelta: number;
    }
  | { kind: "eventNineYearsWarFiscalBurden"; slot: SlotId }
  | { kind: "huguenotResurgence"; addedCount: number; remainingStacks: number }
  | { kind: "antiFrenchLeagueDraw"; probabilityPct: number }
  | { kind: "europeAlertProgressShift"; from: number; to: number; probabilityPct: number; pressureDeltaK: number }
  | { kind: "drawOverflowDiscarded"; cardTemplateIds: CardTemplateId[] }
  | { kind: "drawCards"; cardTemplateIds: CardTemplateId[] }
  | { kind: "info"; infoKey: LogInfoKey }
  | {
      kind: "opponentHabsburgPlay";
      cardInstanceIds: string[];
      opponentCostSum: number;
      opponentCostDiscount: number;
    }
  | { kind: "opponentHabsburgDraw"; drawnCardIds: string[] }
  | { kind: "eventDualFrontCrisisChoice"; slot: SlotId; expandWar: boolean }
  | {
      kind: "eventLocalizedSuccessionWarResolve";
      slot: SlotId;
      fundingPaid: number;
      successionDelta: -1 | 0 | 1 | 2;
    };

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

/**
 * Sun King reducer actions merged into the framework `GameAction` union.
 * Handled by `logic/campaignReducerBridgeImpl.ts` (registered through the campaign
 * reducer bridge) — the engine reducer itself knows none of these.
 */
import type { SlotId } from "../../types/event";

declare module "../../../app/gameReducer" {
  interface CampaignGameActionRegistry {
    SOLVE_EVENT: { type: "SOLVE_EVENT"; slot: SlotId };
    PICK_NANTES_TOLERANCE: { type: "PICK_NANTES_TOLERANCE"; slot: SlotId };
    PICK_NANTES_CRACKDOWN: { type: "PICK_NANTES_CRACKDOWN"; slot: SlotId };
    PICK_LOCAL_WAR_ATTACK: { type: "PICK_LOCAL_WAR_ATTACK"; slot: SlotId };
    PICK_LOCAL_WAR_APPEASE: { type: "PICK_LOCAL_WAR_APPEASE"; slot: SlotId };
    SCRIPTED_EVENT_ATTACK: { type: "SCRIPTED_EVENT_ATTACK"; slot: SlotId };
    CRACKDOWN_TARGET: { type: "CRACKDOWN_TARGET"; slot: SlotId };
    CRACKDOWN_CANCEL: { type: "CRACKDOWN_CANCEL" };
    PICK_SUCCESSION_CRISIS: { type: "PICK_SUCCESSION_CRISIS"; slot: SlotId; pay: boolean };
    PICK_UTRECHT_TREATY: { type: "PICK_UTRECHT_TREATY"; slot: SlotId; endWar: boolean };
    PICK_DUAL_FRONT_CRISIS: { type: "PICK_DUAL_FRONT_CRISIS"; slot: SlotId; expandWar: boolean };
    PICK_LOUIS_XIV_LEGACY: { type: "PICK_LOUIS_XIV_LEGACY"; slot: SlotId; directRule: boolean };
  }
}

import { addCardsToHand } from "../../../logic/cardRuntime";
import { markSlotResolved } from "../../../logic/eventSlotOps";
import type { GameState } from "../../../types/game";
import type { CardTemplateId } from "../../types/card";
import { EVENT_SLOT_ORDER, type EventTemplateId, type SlotId } from "../../types/event";

function resolveFirstUnresolvedEventByTemplate(
  state: GameState,
  templateId: EventTemplateId,
): GameState {
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    if (ev.templateId !== templateId) continue;
    return markSlotResolved(state, slot as SlotId);
  }
  return state;
}

/** Sun King-specific post-template play state (after `applyPlayedCardEffects`, before hand removal / uses). */
export function applySunkingPlayCardExtras(state: GameState, templateId: CardTemplateId): GameState {
  let s = state;
  if (templateId === "grandAllianceInfiltrationDiplomacy") {
    s = { ...s, opponentCostDiscountThisTurn: 1 };
  }
  if (templateId === "grainRelief") {
    s = resolveFirstUnresolvedEventByTemplate(s, "risingGrainPrices");
  }
  if (templateId === "diplomaticCongress") {
    s = addCardsToHand(s, "diplomaticIntervention", 1);
  }
  if (templateId === "jesuitCollege") {
    s = resolveFirstUnresolvedEventByTemplate(s, "jansenistTension");
  }
  return s;
}

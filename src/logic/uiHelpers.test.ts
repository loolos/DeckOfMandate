import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import { EMPTY_EVENT_SLOTS } from "../types/event";
import type { EventTemplateId } from "../types/event";
import type { GameState } from "../types/game";
import { slotIsHandledOrNoFurtherAction } from "./uiHelpers";

function createStateWithSingleEvent(templateId: EventTemplateId): GameState {
  const base = createInitialState(515_151, "secondMandate");
  return {
    ...base,
    phase: "action",
    outcome: "playing",
    pendingInteraction: null,
    resources: { ...base.resources, funding: 0 },
    hand: [],
    slots: {
      ...EMPTY_EVENT_SLOTS,
      A: { instanceId: "event_A", templateId, resolved: false },
    },
  };
}

describe("slotIsHandledOrNoFurtherAction", () => {
  it("returns true when the slot event is already resolved", () => {
    const state = createStateWithSingleEvent("tradeOpportunity");
    state.slots.A = { ...state.slots.A!, resolved: true };
    expect(slotIsHandledOrNoFurtherAction(state, "A")).toBe(true);
  });

  it("returns false when a funding solve is currently feasible", () => {
    const state = createStateWithSingleEvent("tradeOpportunity");
    state.resources = { ...state.resources, funding: 3 };
    expect(slotIsHandledOrNoFurtherAction(state, "A")).toBe(false);
  });

  it("returns true when an unresolved harmless event has no feasible action", () => {
    const state = createStateWithSingleEvent("tradeOpportunity");
    state.resources = { ...state.resources, funding: 0 };
    expect(slotIsHandledOrNoFurtherAction(state, "A")).toBe(true);
  });

  it("returns false when a harmful event can still be solved via playable crackdown", () => {
    const state = createStateWithSingleEvent("publicUnrest");
    state.resources = { ...state.resources, funding: 2 };
    state.hand = ["card_crackdown"];
    state.cardsById = {
      ...state.cardsById,
      card_crackdown: { instanceId: "card_crackdown", templateId: "crackdown" },
    };
    expect(slotIsHandledOrNoFurtherAction(state, "A")).toBe(false);
  });

  it("returns true when crackdown exists but is blocked by status", () => {
    const state = createStateWithSingleEvent("publicUnrest");
    state.resources = { ...state.resources, funding: 2 };
    state.hand = ["card_crackdown"];
    state.cardsById = {
      ...state.cardsById,
      card_crackdown: { instanceId: "card_crackdown", templateId: "crackdown" },
    };
    state.playerStatuses = [
      {
        instanceId: "status_royal_ban",
        templateId: "royalBan",
        kind: "blockCardTag",
        blockedTag: "royal",
        turnsRemaining: 1,
      },
    ];
    expect(slotIsHandledOrNoFurtherAction(state, "A")).toBe(true);
  });

  it("returns false for unresolved event-choice actions that are still selectable", () => {
    const state = createStateWithSingleEvent("revocationNantes");
    expect(slotIsHandledOrNoFurtherAction(state, "A")).toBe(false);
  });

  it("reflects pending crackdown pick feasibility per slot", () => {
    const base = createInitialState(515_152, "secondMandate");
    const state: GameState = {
      ...base,
      phase: "action",
      outcome: "playing",
      pendingInteraction: { type: "crackdownPick", cardInstanceId: "card_x", fundingPaid: 1 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "event_harm", templateId: "publicUnrest", resolved: false },
        B: { instanceId: "event_safe", templateId: "tradeOpportunity", resolved: false },
      },
    };
    expect(slotIsHandledOrNoFurtherAction(state, "A")).toBe(false);
    expect(slotIsHandledOrNoFurtherAction(state, "B")).toBe(true);
  });
});

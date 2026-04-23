import { describe, expect, it } from "vitest";
import { createInitialState } from "../../app/initialState";
import { completeSuccessionCrisisAndRevealOpponent } from "../../logic/opponentHabsburg";
import { currentCalendarYear } from "../../logic/scriptedCalendar";
import { EVENT_SLOT_ORDER } from "../types/event";
import { buildLevel3StateFromDraft, createContinuityLevel3Draft } from "./chapter3Transition";

describe("chapter3 continuity transition", () => {
  it("starts with Habsburg unlocked at strength 2 before 1701 scripted crisis", () => {
    const ch2 = createInitialState(88_201, "secondMandate");
    const ch2Late = { ...ch2, turn: 24 };
    const draft = createContinuityLevel3Draft(ch2Late, 88_202);
    expect(draft.resources.treasuryStat).toBe(14);
    expect(draft.resources.power).toBe(10);
    expect(draft.resources.legitimacy).toBe(10);
    expect(draft.resources.funding).toBe(ch2Late.resources.funding);
    expect(draft.calendarStartYear).toBe(1699);

    const s0 = buildLevel3StateFromDraft(draft);
    expect(currentCalendarYear(s0)).toBe(1699);
    expect(s0.opponentHabsburgUnlocked).toBe(true);
    expect(s0.opponentStrength).toBe(2);
    expect(s0.opponentDeck.length + s0.opponentHand.length).toBe(12);
    const oppSlots = EVENT_SLOT_ORDER.filter((sl) => s0.slots[sl]?.templateId === "opponentHabsburg");
    expect(oppSlots.length).toBe(1);
  });

  it("succession crisis completion bumps strength to 3 without duplicating opponent deck", () => {
    const ch2 = createInitialState(88_301, "secondMandate");
    const ch2Late = { ...ch2, turn: 24 };
    const draft = createContinuityLevel3Draft(ch2Late, 88_302);
    let s = buildLevel3StateFromDraft(draft);
    const oppCountBefore = Object.keys(s.cardsById).filter((id) => id.startsWith("opp_")).length;
    expect(oppCountBefore).toBe(12);

    const crisisSlot =
      EVENT_SLOT_ORDER.find((sl) => !s.slots[sl]) ??
      (() => {
        throw new Error("expected a free slot for succession crisis");
      })();
    s = {
      ...s,
      slots: {
        ...s.slots,
        [crisisSlot]: {
          instanceId: "evt_succ_test",
          templateId: "successionCrisis",
          resolved: false,
        },
      },
    };

    const s1 = completeSuccessionCrisisAndRevealOpponent(s, crisisSlot);
    expect(s1.opponentStrength).toBe(3);
    expect(s1.slots[crisisSlot]).toBeNull();
    const oppCountAfter = Object.keys(s1.cardsById).filter((id) => id.startsWith("opp_")).length;
    expect(oppCountAfter).toBe(12);
    expect(EVENT_SLOT_ORDER.filter((sl) => s1.slots[sl]?.templateId === "opponentHabsburg").length).toBe(1);
  });
});

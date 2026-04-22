import { describe, expect, it } from "vitest";
import { gameReducer } from "../../app/gameReducer";
import { createInitialState } from "../../app/initialState";
import { THIRD_MANDATE_LEVEL_ID } from "../../logic/thirdMandateConstants";

describe("Sun King chapter 3 reducer picks (campaign bridge)", () => {
  it("1708 dual-front crisis: concede applies −3 track and +1 opponent budget", () => {
    const base = createInitialState(51_100, THIRD_MANDATE_LEVEL_ID);
    const s0: typeof base = {
      ...base,
      successionTrack: 0,
      opponentHabsburgUnlocked: true,
      opponentStrength: 2,
      slots: {
        ...base.slots,
        A: { instanceId: "e_df", templateId: "dualFrontCrisis", resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "PICK_DUAL_FRONT_CRISIS", slot: "A", expandWar: false });
    expect(after.successionTrack).toBe(-3);
    expect(after.opponentStrength).toBe(3);
    expect(after.slots.A?.resolved).toBe(true);
  });

  it("1708 dual-front crisis: escalate applies +1 track, −1 legitimacy, +3 fiscal burden, +1 opponent budget", () => {
    const base = createInitialState(51_101, THIRD_MANDATE_LEVEL_ID);
    const burdenBefore = Object.values(base.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    const s0: typeof base = {
      ...base,
      successionTrack: 0,
      resources: { ...base.resources, legitimacy: 5 },
      opponentHabsburgUnlocked: true,
      opponentStrength: 2,
      slots: {
        ...base.slots,
        A: { instanceId: "e_df2", templateId: "dualFrontCrisis", resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "PICK_DUAL_FRONT_CRISIS", slot: "A", expandWar: true });
    expect(after.successionTrack).toBe(1);
    expect(after.resources.legitimacy).toBe(4);
    expect(after.opponentStrength).toBe(3);
    const burdenAfter = Object.values(after.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    expect(burdenAfter).toBe(burdenBefore + 3);
  });

  it("1715 legacy event: regency custody applies power/legitimacy loss with one fiscal burden and no succession-side changes", () => {
    const base = createInitialState(51_130, THIRD_MANDATE_LEVEL_ID);
    const burdenBefore = Object.values(base.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    const s0: typeof base = {
      ...base,
      resources: { ...base.resources, power: 6, legitimacy: 7 },
      successionTrack: 2,
      opponentStrength: 4,
      slots: {
        ...base.slots,
        A: { instanceId: "e_legacy", templateId: "louisXivLegacy1715", resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "PICK_LOUIS_XIV_LEGACY", slot: "A", directRule: false });
    const burdenAfter = Object.values(after.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    expect(after.resources.power).toBe(5);
    expect(after.resources.legitimacy).toBe(6);
    expect(burdenAfter).toBe(burdenBefore + 1);
    expect(after.successionTrack).toBe(2);
    expect(after.opponentStrength).toBe(4);
    expect(after.slots.A?.resolved).toBe(true);
    expect(after.actionLog.some((e) => e.kind === "eventLouisXivLegacyChoice" && e.directRule === false)).toBe(true);
  });

  it("1715 legacy event: young king direct rule grants power, adds three fiscal burdens, and applies permanent minor regency doubt", () => {
    const base = createInitialState(51_131, THIRD_MANDATE_LEVEL_ID);
    const burdenBefore = Object.values(base.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    const s0: typeof base = {
      ...base,
      resources: { ...base.resources, power: 6, legitimacy: 7 },
      successionTrack: -1,
      opponentStrength: 3,
      slots: {
        ...base.slots,
        A: { instanceId: "e_legacy2", templateId: "louisXivLegacy1715", resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "PICK_LOUIS_XIV_LEGACY", slot: "A", directRule: true });
    const burdenAfter = Object.values(after.cardsById).filter((c) => c.templateId === "fiscalBurden").length;
    const status = after.playerStatuses.find((st) => st.templateId === "minorRegencyDoubt");
    expect(after.resources.power).toBe(7);
    expect(after.resources.legitimacy).toBe(7);
    expect(burdenAfter).toBe(burdenBefore + 3);
    expect(status?.turnsRemaining).toBe(99);
    expect(after.successionTrack).toBe(-1);
    expect(after.opponentStrength).toBe(3);
    expect(after.slots.A?.resolved).toBe(true);
    expect(after.actionLog.some((e) => e.kind === "eventLouisXivLegacyChoice" && e.directRule === true)).toBe(true);
  });
});

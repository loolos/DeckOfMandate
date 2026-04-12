import { describe, expect, it } from "vitest";
import { createInitialState } from "./initialState";
import { gameReducer } from "./gameReducer";

describe("gameReducer", () => {
  it("creates deterministic initial layouts for the same seed", () => {
    const a = createInitialState(424242);
    const b = createInitialState(424242);
    expect(a.runSeed).toBe(b.runSeed);
    expect(a.deck).toEqual(b.deck);
    expect(a.hand).toEqual(b.hand);
    expect(a.slots).toEqual(b.slots);
  });

  it("does not change state on invalid PLAY_CARD index", () => {
    const s0 = createInitialState(1001);
    const s1 = gameReducer(s0, { type: "PLAY_CARD", handIndex: 999 });
    expect(s1).toEqual(s0);
  });

  it("lose-first: legitimacy collapse ends the run before a later victory check would matter", () => {
    const s0 = createInitialState(222);
    const doomed: typeof s0 = {
      ...s0,
      resources: { ...s0.resources, legitimacy: 0 },
    };
    const s1 = gameReducer(doomed, { type: "END_YEAR" });
    expect(s1.outcome).toBe("defeatLegitimacy");
    expect(s1.phase).toBe("gameOver");
  });

  it("skips retention phase when hand size is within Legitimacy (auto-keep all)", () => {
    const base = createInitialState(55_555);
    const keepOne = base.hand[0]!;
    const rest = base.hand.slice(1);
    const s0: typeof base = {
      ...base,
      hand: [keepOne],
      deck: [...base.deck, ...rest],
      resources: { ...base.resources, funding: 0, legitimacy: 3 },
      slots: {
        A: { instanceId: "test_e1", templateId: "tradeOpportunity", resolved: true },
        B: { instanceId: "test_e2", templateId: "tradeOpportunity", resolved: true },
      },
    };
    const after = gameReducer(s0, { type: "END_YEAR" });
    expect(after.phase).toBe("action");
    expect(after.turn).toBe(s0.turn + 1);
    expect(after.hand).toContain(keepOne);
  });
});

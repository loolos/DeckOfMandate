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

  it("retention cap uses Legitimacy before end-of-year event penalties, not after", () => {
    const base = createInitialState(77_777);
    const [a, b] = base.hand;
    const c = base.deck[0];
    if (!a || !b || !c) throw new Error("expected two hand cards and a deck card");
    const s0: typeof base = {
      ...base,
      resources: { ...base.resources, funding: 5, legitimacy: 2 },
      hand: [a, b, c],
      deck: base.deck.slice(1),
      slots: {
        A: { instanceId: "e_u1", templateId: "publicUnrest", resolved: false },
        B: { instanceId: "e_ok", templateId: "tradeOpportunity", resolved: true },
      },
    };
    const toRetention = gameReducer(s0, { type: "END_YEAR" });
    expect(toRetention.phase).toBe("retention");
    const afterKeep = gameReducer(toRetention, { type: "CONFIRM_RETENTION", keepIds: [a, b] });
    expect(afterKeep.outcome).toBe("playing");
    expect(afterKeep.resources.legitimacy).toBe(1);
    expect(afterKeep.hand).toContain(a);
    expect(afterKeep.hand).toContain(b);
    expect(afterKeep.hand).not.toContain(c);
    expect(afterKeep.discard).toContain(c);
    expect(afterKeep.turn).toBe(s0.turn + 1);
  });

  it("END_YEAR: win targets already met before retention → immediate victory (no retention, same turn)", () => {
    const base = createInitialState(12_345);
    const pool = [...base.hand, ...base.deck];
    const hand = pool.slice(0, 6);
    const deck = pool.slice(6);
    if (hand.length < 6) throw new Error("expected at least 6 cards total");
    const s0: typeof base = {
      ...base,
      hand,
      deck,
      resources: { treasuryStat: 4, power: 4, legitimacy: 5, funding: 3 },
      slots: {
        A: { instanceId: "e1", templateId: "budgetStrain", resolved: false },
        B: { instanceId: "e2", templateId: "tradeOpportunity", resolved: true },
      },
    };
    const after = gameReducer(s0, { type: "END_YEAR" });
    expect(after.outcome).toBe("victory");
    expect(after.phase).toBe("gameOver");
    expect(after.turn).toBe(s0.turn);
    expect(after.resources.funding).toBe(0);
  });

  it("appends cardPlayed to actionLog when a card resolves", () => {
    const s0 = createInitialState(1001);
    const idx = s0.hand.findIndex((id) => s0.cardsById[id]?.templateId === "funding");
    if (idx < 0) throw new Error("expected a funding card in hand");
    const n0 = s0.actionLog.length;
    const s1 = gameReducer(s0, { type: "PLAY_CARD", handIndex: idx });
    expect(s1.actionLog.length).toBe(n0 + 1);
    const last = s1.actionLog[s1.actionLog.length - 1]!;
    expect(last.kind).toBe("cardPlayed");
    if (last.kind === "cardPlayed") {
      expect(last.templateId).toBe("funding");
      expect(last.effects[0]).toEqual({ kind: "gainFunding", amount: 1 });
    }
  });

  it("appends eventFundSolved to actionLog when paying to solve an event", () => {
    const s0 = createInitialState(31415);
    const s1: typeof s0 = {
      ...s0,
      resources: { ...s0.resources, funding: 2 },
      slots: {
        A: { instanceId: "e_trade", templateId: "tradeOpportunity", resolved: false },
        B: s0.slots.B,
      },
    };
    const n0 = s1.actionLog.length;
    const after = gameReducer(s1, { type: "SOLVE_EVENT", slot: "A" });
    expect(after.actionLog.length).toBe(n0 + 1);
    const last = after.actionLog[after.actionLog.length - 1]!;
    expect(last.kind).toBe("eventFundSolved");
    if (last.kind === "eventFundSolved") {
      expect(last.templateId).toBe("tradeOpportunity");
      expect(last.treasuryGain).toBe(1);
    }
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

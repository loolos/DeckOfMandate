import { describe, expect, it } from "vitest";
import { levelContentByLevelId } from "../data/levelContent";
import { getLevelDef } from "../data/levels";
import { getCardTemplate } from "../data/cards";
import { EMPTY_EVENT_SLOTS } from "../types/event";
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
        ...EMPTY_EVENT_SLOTS,
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
        ...EMPTY_EVENT_SLOTS,
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
        ...s0.slots,
        A: { instanceId: "e_trade", templateId: "tradeOpportunity", resolved: false },
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

  it("SCRIPTED_EVENT_ATTACK uses level scripted config (cost, power, coalition window)", () => {
    const cfg = levelContentByLevelId.firstMandate.scriptedCalendarEvents.find(
      (x) => x.templateId === "warOfDevolution",
    )!;
    const turn = cfg.presenceStartYear - getLevelDef("firstMandate").calendarStartYear + 1;
    let s = createInitialState(100);
    s = {
      ...s,
      turn,
      phase: "action",
      resources: { ...s.resources, funding: 5 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e1", templateId: "warOfDevolution", resolved: false },
      },
    };
    const after = gameReducer(s, { type: "SCRIPTED_EVENT_ATTACK", slot: "A" });
    expect(after.slots.A?.resolved).toBe(true);
    expect(after.resources.funding).toBe(5 - cfg.attack.fundingCost);
    expect(after.resources.power).toBe(s.resources.power + cfg.attack.powerDelta);
    expect(after.warOfDevolutionAttacked).toBe(true);
    expect(after.antiFrenchLeague).not.toBeNull();
    const years = cfg.antiCoalition.activeYearsAfterAttack;
    const expectedUntil =
      years === null ? getLevelDef("firstMandate").turnLimit : turn + years;
    expect(after.antiFrenchLeague!.untilTurn).toBe(expectedUntil);
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
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "test_e1", templateId: "tradeOpportunity", resolved: true },
        B: { instanceId: "test_e2", templateId: "tradeOpportunity", resolved: true },
      },
    };
    const after = gameReducer(s0, { type: "END_YEAR" });
    expect(after.phase).toBe("action");
    expect(after.turn).toBe(s0.turn + 1);
    expect(after.hand).toContain(keepOne);
  });

  it("blocks royal-tag cards when royal ban status is active", () => {
    const base = createInitialState(778899);
    const royalInDeck = base.deck.find((id) => getCardTemplate(base.cardsById[id]!.templateId).tags.includes("royal"));
    if (!royalInDeck) throw new Error("expected at least one royal-tag card in deck");
    const blockedState = {
      ...base,
      hand: [royalInDeck],
      deck: base.deck.filter((id) => id !== royalInDeck),
    };
    const handIndex = 0;
    const beforeFunding = base.resources.funding;
    const beforeLog = base.actionLog.length;
    const blocked = {
      ...blockedState,
      playerStatuses: [
        ...blockedState.playerStatuses,
        {
          instanceId: "st_block_royal",
          templateId: "royalBan" as const,
          kind: "blockCardTag" as const,
          blockedTag: "royal" as const,
          turnsRemaining: 1,
        },
      ],
    };
    const after = gameReducer(blocked, { type: "PLAY_CARD", handIndex });
    expect(after).toEqual(blocked);
    expect(after.resources.funding).toBe(beforeFunding);
    expect(after.actionLog.length).toBe(beforeLog);
  });

  it("retention boost status increases keep limit by +1", () => {
    const base = createInitialState(990011);
    const full = [...base.hand, ...base.deck];
    if (full.length < 3) throw new Error("expected at least three cards total");
    const hand = full.slice(0, 3);
    const boosted = {
      ...base,
      phase: "retention" as const,
      hand,
      deck: full.slice(3),
      playerStatuses: [
        ...base.playerStatuses,
        {
          instanceId: "st_keep_boost",
          templateId: "retentionBoost" as const,
          kind: "retentionCapacityDelta" as const,
          delta: 1,
          turnsRemaining: 3,
        },
      ],
    };
    const tryKeep3 = gameReducer(boosted, { type: "CONFIRM_RETENTION", keepIds: hand.slice(0, 3) });
    expect(tryKeep3.phase).toBe("action");
    expect(tryKeep3.turn).toBe(boosted.turn + 1);
  });

  it("allows diplomatic intervention under royal ban and enters target-pick flow", () => {
    const base = createInitialState(123_009, "secondMandate");
    const diplomaticIntervention = base.deck.find(
      (id) => base.cardsById[id]?.templateId === "diplomaticIntervention",
    );
    if (!diplomaticIntervention) {
      throw new Error("expected diplomaticIntervention in secondMandate deck");
    }
    const withCardInHand = {
      ...base,
      hand: [diplomaticIntervention],
      deck: base.deck.filter((id) => id !== diplomaticIntervention),
      resources: { ...base.resources, funding: 1 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_harm", templateId: "nobleResentment", resolved: false },
      },
      playerStatuses: [
        ...base.playerStatuses,
        {
          instanceId: "st_block_royal",
          templateId: "royalBan" as const,
          kind: "blockCardTag" as const,
          blockedTag: "royal" as const,
          turnsRemaining: 1,
        },
      ],
    };
    const afterPlay = gameReducer(withCardInHand, { type: "PLAY_CARD", handIndex: 0 });
    expect(afterPlay.pendingInteraction?.type).toBe("crackdownPick");
    expect(afterPlay.pendingInteraction?.cardInstanceId).toBe(diplomaticIntervention);
    expect(afterPlay.resources.funding).toBe(0);
  });
});

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
      resources: { treasuryStat: 6, power: 6, legitimacy: 5, funding: 3 },
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

  it("first mandate starts royal intervention at 4/4 uses", () => {
    const s0 = createInitialState(1002, "firstMandate");
    const crackdownId = Object.keys(s0.cardsById).find((id) => s0.cardsById[id]?.templateId === "crackdown");
    if (!crackdownId) throw new Error("expected crackdown in chapter 1 deck");
    expect(s0.cardUsesById[crackdownId]).toEqual({ remaining: 4, total: 4 });
  });

  it("second mandate starts royal cards at 1/3 uses", () => {
    const s0 = createInitialState(1003, "secondMandate");
    const crackdownId = Object.keys(s0.cardsById).find((id) => s0.cardsById[id]?.templateId === "crackdown");
    const fundingId = Object.keys(s0.cardsById).find((id) => s0.cardsById[id]?.templateId === "funding");
    if (!crackdownId || !fundingId) throw new Error("expected royal cards in chapter 2 deck");
    expect(s0.cardUsesById[crackdownId]).toEqual({ remaining: 1, total: 3 });
    expect(s0.cardUsesById[fundingId]).toEqual({ remaining: 1, total: 3 });
  });

  it("first mandate starts development at 2/2 uses", () => {
    const s0 = createInitialState(10031, "firstMandate");
    const developmentId = Object.keys(s0.cardsById).find((id) => s0.cardsById[id]?.templateId === "development");
    if (!developmentId) throw new Error("expected development in chapter 1 deck");
    expect(s0.cardUsesById[developmentId]).toEqual({ remaining: 2, total: 2 });
  });

  it("playing funding decrements uses and on depletion removes card with treasury penalty log", () => {
    const base = createInitialState(1004, "firstMandate");
    const fundingId = "funding_limited";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [fundingId]: { instanceId: fundingId, templateId: "funding" as const },
      },
      cardUsesById: {
        ...base.cardUsesById,
        [fundingId]: { remaining: 1, total: 3 },
      },
      hand: [fundingId],
      deck: [],
      discard: [],
      resources: { ...base.resources, treasuryStat: 4, funding: 0 },
    };
    const after = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.cardUsesById[fundingId]).toBeUndefined();
    expect(after.hand.includes(fundingId)).toBe(false);
    expect(after.discard.includes(fundingId)).toBe(false);
    expect(after.resources.treasuryStat).toBe(3);
    const penaltyLog = after.actionLog.find(
      (entry) => entry.kind === "info" && entry.infoKey === "cardUse.depleted.fundingPenalty",
    );
    expect(penaltyLog).toBeTruthy();
  });

  it("discarding at retention does not decrement limited uses", () => {
    const base = createInitialState(1005, "firstMandate");
    const fundingId = "funding_retention";
    const safe = "safe_card";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [fundingId]: { instanceId: fundingId, templateId: "funding" as const },
        [safe]: { instanceId: safe, templateId: "reform" as const },
      },
      cardUsesById: {
        ...base.cardUsesById,
        [fundingId]: { remaining: 3, total: 3 },
      },
      hand: [fundingId, safe],
      deck: [],
      discard: [],
      phase: "retention",
      resources: { ...base.resources, legitimacy: 1 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "safe_evt", templateId: "tradeOpportunity" as const, resolved: true },
      },
    };
    const after = gameReducer(withCard, { type: "CONFIRM_RETENTION", keepIds: [safe] });
    const stillTracked = after.hand.includes(fundingId) || after.deck.includes(fundingId) || after.discard.includes(fundingId);
    expect(stillTracked).toBe(true);
    expect(after.cardUsesById[fundingId]).toEqual({ remaining: 3, total: 3 });
  });

  it("development depletion removes card without depletion penalty", () => {
    const base = createInitialState(10051, "firstMandate");
    const developmentId = "development_limited";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [developmentId]: { instanceId: developmentId, templateId: "development" as const },
      },
      cardUsesById: {
        ...base.cardUsesById,
        [developmentId]: { remaining: 1, total: 2 },
      },
      hand: [developmentId],
      deck: [],
      discard: [],
      resources: { ...base.resources, treasuryStat: 4, funding: 3 },
    };
    const after = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.cardUsesById[developmentId]).toBeUndefined();
    expect(after.hand.includes(developmentId)).toBe(false);
    expect(after.discard.includes(developmentId)).toBe(false);
    expect(after.resources.treasuryStat).toBe(5);
    const depletedInfo = after.actionLog.find(
      (entry) => entry.kind === "info" && entry.infoKey.startsWith("cardUse.depleted."),
    );
    expect(depletedInfo).toBeUndefined();
  });

  it("crackdown uses decrement only when target confirmed, and depletion applies power penalty", () => {
    const base = createInitialState(1006, "firstMandate");
    const crackdownId = "crackdown_limited";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [crackdownId]: { instanceId: crackdownId, templateId: "crackdown" as const },
      },
      cardUsesById: {
        ...base.cardUsesById,
        [crackdownId]: { remaining: 1, total: 3 },
      },
      hand: [crackdownId],
      deck: [],
      discard: [],
      resources: { ...base.resources, funding: 1, power: 4 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "harm_evt", templateId: "publicUnrest", resolved: false },
      },
    };
    const afterPlay = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(afterPlay.pendingInteraction?.type).toBe("crackdownPick");
    expect(afterPlay.cardUsesById[crackdownId]).toEqual({ remaining: 1, total: 3 });

    const afterTarget = gameReducer(afterPlay, { type: "CRACKDOWN_TARGET", slot: "A" });
    expect(afterTarget.cardUsesById[crackdownId]).toBeUndefined();
    expect(afterTarget.discard.includes(crackdownId)).toBe(false);
    expect(afterTarget.resources.power).toBe(3);
    const penaltyLog = afterTarget.actionLog.find(
      (entry) => entry.kind === "info" && entry.infoKey === "cardUse.depleted.crackdownPenalty",
    );
    expect(penaltyLog).toBeTruthy();
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
    const turnWindow = cfg.antiCoalition.activeYearsAfterAttack;
    const expectedUntil =
      turnWindow === null ? getLevelDef("firstMandate").turnLimit : turn + turnWindow;
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
    const diplomaticIntervention = "tmp_di";
    const withCardInHand: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [diplomaticIntervention]: {
          instanceId: diplomaticIntervention,
          templateId: "diplomaticIntervention",
        },
      },
      hand: [diplomaticIntervention],
      resources: { ...base.resources, funding: 0 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_harm", templateId: "nobleResentment" as const, resolved: false },
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

  it("diplomatic intervention starts at 3/3 and is removed on depletion without penalty", () => {
    const base = createInitialState(123_010, "secondMandate");
    const diplomaticIntervention = "tmp_di_limited";
    const withCardInHand: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [diplomaticIntervention]: {
          instanceId: diplomaticIntervention,
          templateId: "diplomaticIntervention",
        },
      },
      cardUsesById: {
        ...base.cardUsesById,
        [diplomaticIntervention]: { remaining: 1, total: 3 },
      },
      hand: [diplomaticIntervention],
      resources: { ...base.resources, funding: 0, power: 5, treasuryStat: 5 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_harm2", templateId: "nobleResentment" as const, resolved: false },
      },
    };
    const afterPlay = gameReducer(withCardInHand, { type: "PLAY_CARD", handIndex: 0 });
    const afterTarget = gameReducer(afterPlay, { type: "CRACKDOWN_TARGET", slot: "A" });
    expect(afterTarget.cardUsesById[diplomaticIntervention]).toBeUndefined();
    expect(afterTarget.discard.includes(diplomaticIntervention)).toBe(false);
    expect(afterTarget.resources.power).toBe(5);
    expect(afterTarget.resources.treasuryStat).toBe(5);
    const infoLog = afterTarget.actionLog.find(
      (entry) => entry.kind === "info" && entry.infoKey === "cardUse.depleted.diplomaticIntervention",
    );
    expect(infoLog).toBeTruthy();
  });

  it("playing diplomatic congress adds a temporary diplomatic intervention to hand", () => {
    const base = createInitialState(202_701, "secondMandate");
    const congressId = "tmp_congress";
    const withCongress: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [congressId]: { instanceId: congressId, templateId: "diplomaticCongress" as const },
      },
      hand: [congressId],
      resources: { ...base.resources, funding: 3 },
      playerStatuses: [],
    };
    const after = gameReducer(withCongress, { type: "PLAY_CARD", handIndex: 0 });
    const tempInHand = after.hand.find((id) => after.cardsById[id]?.templateId === "diplomaticIntervention");
    expect(tempInHand).toBeTruthy();
    expect(after.discard).toContain(congressId);
  });

  it("extra diplomatic intervention can enter discard during year-end retention", () => {
    const base = createInitialState(202_702, "secondMandate");
    const tempId = "tmp_di_purge";
    const keepId = "keep_funding";
    const withTempInHand: typeof base = {
      ...base,
      hand: [tempId, keepId],
      cardsById: {
        ...base.cardsById,
        [tempId]: { instanceId: tempId, templateId: "diplomaticIntervention" as const },
        [keepId]: { instanceId: keepId, templateId: "funding" as const },
      },
      resources: { ...base.resources, funding: 0, legitimacy: 1 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "safe_evt", templateId: "tradeOpportunity" as const, resolved: true },
      },
    };
    const inRetention = gameReducer(withTempInHand, { type: "END_YEAR" });
    expect(inRetention.phase).toBe("retention");
    const after = gameReducer(inRetention, { type: "CONFIRM_RETENTION", keepIds: [keepId] });
    expect(after.hand.includes(tempId)).toBe(false);
    expect(after.discard.includes(tempId)).toBe(true);
  });

  it("extra cards are purged when the level ends (defeat)", () => {
    const base = createInitialState(202_703, "secondMandate");
    const extraId = "tmp_di_end";
    const withExtraInDiscard: typeof base = {
      ...base,
      discard: [extraId],
      cardsById: {
        ...base.cardsById,
        [extraId]: { instanceId: extraId, templateId: "diplomaticIntervention" as const },
      },
      resources: { ...base.resources, legitimacy: 0 },
    };
    const after = gameReducer(withExtraInDiscard, { type: "END_YEAR" });
    expect(after.outcome).toBe("defeatLegitimacy");
    expect(after.phase).toBe("gameOver");
    expect(after.discard.includes(extraId)).toBe(false);
    expect(after.cardsById[extraId]).toBeUndefined();
  });

  it("expansion remembered solved adds two fiscal burden cards to deck", () => {
    const base = createInitialState(202_602, "secondMandate");
    const beforeCardCount = Object.keys(base.cardsById).length;
    const s0: typeof base = {
      ...base,
      resources: { ...base.resources, funding: 2 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_expansion", templateId: "expansionRemembered" as const, resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "SOLVE_EVENT", slot: "A" });
    const burdenIds = Object.values(after.cardsById)
      .filter((c) => c.templateId === "fiscalBurden")
      .map((c) => c.instanceId);
    expect(after.resources.funding).toBe(0);
    expect(Object.keys(after.cardsById).length).toBe(beforeCardCount + 2);
    expect(burdenIds.length).toBe(2);
    expect(after.deck).toEqual(expect.arrayContaining(burdenIds));
  });

  it("playing fiscal burden purges it without adding to discard", () => {
    const base = createInitialState(202_603, "secondMandate");
    const fiscalBurden = "fb_manual";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [fiscalBurden]: { instanceId: fiscalBurden, templateId: "fiscalBurden" as const },
      },
      hand: [fiscalBurden],
      deck: base.deck.filter((id) => id !== fiscalBurden),
      resources: { ...base.resources, funding: 2 },
    };
    const after = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.resources.funding).toBe(0);
    expect(after.hand.includes(fiscalBurden)).toBe(false);
    expect(after.discard.includes(fiscalBurden)).toBe(false);
  });

  it("chapter 2 inflation stack increases playable card cost", () => {
    const base = createInitialState(202_604, "secondMandate");
    const ceremonyId = "ceremony_inflation";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [ceremonyId]: { instanceId: ceremonyId, templateId: "ceremony" as const },
      },
      hand: [ceremonyId],
      deck: [],
      discard: [],
      resources: { ...base.resources, funding: 2, legitimacy: 3 },
      cardInflationById: { ...base.cardInflationById, [ceremonyId]: 1 },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const blocked = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(blocked).toEqual(withCard);

    const affordable = { ...withCard, resources: { ...withCard.resources, funding: 3 } };
    const after = gameReducer(affordable, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.resources.funding).toBe(0);
    expect(after.discard).toContain(ceremonyId);
    const last = after.actionLog[after.actionLog.length - 1];
    expect(last?.kind).toBe("cardPlayed");
    if (last?.kind === "cardPlayed") {
      expect(last.fundingCost).toBe(3);
    }
  });

  it("chapter 1 below pressure threshold ignores inflation stacks for cost calculation", () => {
    const base = createInitialState(202_605, "firstMandate");
    const ceremonyId = "ceremony_no_inflation";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [ceremonyId]: { instanceId: ceremonyId, templateId: "ceremony" as const },
      },
      hand: [ceremonyId],
      deck: [],
      discard: [],
      resources: { ...base.resources, funding: 2, legitimacy: 3 },
      cardInflationById: { ...base.cardInflationById, [ceremonyId]: 5 },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const after = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.resources.funding).toBe(0);
    expect(after.discard).toContain(ceremonyId);
    const last = after.actionLog[after.actionLog.length - 1];
    expect(last?.kind).toBe("cardPlayed");
    if (last?.kind === "cardPlayed") {
      expect(last.fundingCost).toBe(2);
    }
  });

  it("chapter 1 at pressure threshold applies inflation stacks for cost calculation", () => {
    const base = createInitialState(202_606, "firstMandate");
    const ceremonyId = "ceremony_threshold_inflation";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [ceremonyId]: { instanceId: ceremonyId, templateId: "ceremony" as const },
      },
      hand: [ceremonyId],
      deck: [],
      discard: [],
      resources: { treasuryStat: 5, funding: 2, power: 5, legitimacy: 4 },
      cardInflationById: { ...base.cardInflationById, [ceremonyId]: 1 },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const blocked = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(blocked).toEqual(withCard);

    const affordable = { ...withCard, resources: { ...withCard.resources, funding: 3 } };
    const after = gameReducer(affordable, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.resources.funding).toBe(0);
    expect(after.discard).toContain(ceremonyId);
    const last = after.actionLog[after.actionLog.length - 1];
    expect(last?.kind).toBe("cardPlayed");
    if (last?.kind === "cardPlayed") {
      expect(last.fundingCost).toBe(3);
    }
  });

  it("chapter 1 reaching pressure threshold immediately appends inflation activation log", () => {
    const base = createInitialState(202_607, "firstMandate");
    const developmentId = "development_threshold_log";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [developmentId]: { instanceId: developmentId, templateId: "development" as const },
      },
      hand: [developmentId],
      deck: [],
      discard: [],
      resources: { treasuryStat: 3, funding: 3, power: 5, legitimacy: 3 },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const after = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.resources.treasuryStat).toBe(4);
    const infoEntries = after.actionLog.filter(
      (entry) => entry.kind === "info" && entry.infoKey === "firstMandateInflationActivated",
    );
    expect(infoEntries).toHaveLength(1);
  });

  it("solving nymwegen settlement keeps europe alert and marks chapter objective", () => {
    const base = createInitialState(202_900, "secondMandate");
    const s0: typeof base = {
      ...base,
      europeAlert: true,
      europeAlertPowerLoss: 1,
      europeAlertProgress: 3,
      nymwegenSettlementAchieved: false,
      resources: { ...base.resources, funding: 6, power: 9, legitimacy: 9 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_nymwegen", templateId: "nymwegenSettlement" as const, resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "SOLVE_EVENT", slot: "A" });
    expect(after.europeAlert).toBe(true);
    expect(after.nymwegenSettlementAchieved).toBe(true);
    expect(after.resources.funding).toBe(0);
    expect(after.resources.power).toBe(7);
    expect(after.resources.legitimacy).toBe(7);
  });

  it("solving ryswick peace clears europe alert", () => {
    const base = createInitialState(202_904, "secondMandate");
    const s0: typeof base = {
      ...base,
      europeAlert: true,
      europeAlertProgress: 5,
      resources: { ...base.resources, funding: 1 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_ryswick", templateId: "ryswickPeace" as const, resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "SOLVE_EVENT", slot: "A" });
    expect(after.europeAlert).toBe(false);
    expect(after.europeAlertProgress).toBe(0);
    expect(after.resources.funding).toBe(0);
    expect(after.resources.legitimacy).toBe(base.resources.legitimacy + 1);
  });

  it("chapter 2 cannot win from 1696 onward while europe alert is still active", () => {
    const base = createInitialState(202_905, "secondMandate");
    const s0: typeof base = {
      ...base,
      turn: 21, // 1696
      europeAlert: true,
      hand: [],
      resources: {
        treasuryStat: 0,
        power: 0,
        legitimacy: 1,
        funding: 0,
      },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const after = gameReducer(s0, { type: "END_YEAR" });
    expect(after.outcome).not.toBe("victory");
  });

  it("chapter 2 cannot win before year 1696 even when europe alert is resolved", () => {
    const base = createInitialState(202_906, "secondMandate");
    const s0: typeof base = {
      ...base,
      turn: 20, // 1695
      europeAlert: false,
      hand: [],
      resources: {
        treasuryStat: 0,
        power: 0,
        legitimacy: 1,
        funding: 0,
      },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const after = gameReducer(s0, { type: "END_YEAR" });
    expect(after.outcome).not.toBe("victory");
  });

  it("chapter 2 can win from year 1696 onward when europe alert is resolved", () => {
    const base = createInitialState(202_907, "secondMandate");
    const s0: typeof base = {
      ...base,
      turn: 21, // 1696
      europeAlert: false,
      hand: [],
      resources: {
        treasuryStat: 0,
        power: 0,
        legitimacy: 1,
        funding: 0,
      },
      slots: { ...EMPTY_EVENT_SLOTS },
    };
    const after = gameReducer(s0, { type: "END_YEAR" });
    expect(after.outcome).toBe("victory");
  });

  it("grainRelief directly resolves one unresolved risingGrainPrices event when played", () => {
    const base = createInitialState(202_902, "secondMandate");
    const grainReliefCardId = "test_grain_relief";
    const withCardInHand: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [grainReliefCardId]: {
          instanceId: grainReliefCardId,
          templateId: "grainRelief",
        },
      },
      hand: [grainReliefCardId],
      resources: { ...base.resources, funding: 3 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_rise_1", templateId: "risingGrainPrices", resolved: false },
        B: { instanceId: "e_other", templateId: "nobleResentment", resolved: false },
      },
    };
    const after = gameReducer(withCardInHand, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.resources.funding).toBe(0);
    expect(after.slots.A?.resolved).toBe(true);
    expect(after.slots.B?.resolved).toBe(false);
  });

  it("revocation nantes tolerance branch applies legitimacy -1 and permanent tolerance status", () => {
    const base = createInitialState(333_001, "secondMandate");
    const s0: typeof base = {
      ...base,
      resources: { ...base.resources, legitimacy: 5 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_nantes", templateId: "revocationNantes" as const, resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "PICK_NANTES_TOLERANCE", slot: "A" });
    expect(after.resources.legitimacy).toBe(4);
    expect(after.slots.A?.resolved).toBe(true);
    expect(after.playerStatuses.some((s) => s.templateId === "religiousTolerance")).toBe(true);
  });

  it("revocation nantes crackdown branch adds containment status and three suppress cards", () => {
    const base = createInitialState(333_002, "secondMandate");
    const s0: typeof base = {
      ...base,
      slots: {
        ...base.slots,
        A: { instanceId: "e_nantes", templateId: "revocationNantes" as const, resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "PICK_NANTES_CRACKDOWN", slot: "A" });
    const containment = after.playerStatuses.find((s) => s.templateId === "huguenotContainment");
    expect(containment?.turnsRemaining).toBe(3);
    const suppressCount = Object.values(after.cardsById).filter((c) => c.templateId === "suppressHuguenots").length;
    expect(suppressCount).toBe(3);
  });

  it("playing suppress huguenots decrements containment and purges all suppress cards at zero", () => {
    const base = createInitialState(333_003, "secondMandate");
    const cardId = "tmp_sup_1";
    const second = "tmp_sup_2";
    const third = "tmp_sup_3";
    const withCards: typeof base = {
      ...base,
      hand: [cardId],
      deck: [second, ...base.deck],
      discard: [third, ...base.discard],
      cardsById: {
        ...base.cardsById,
        [cardId]: { instanceId: cardId, templateId: "suppressHuguenots" as const },
        [second]: { instanceId: second, templateId: "suppressHuguenots" as const },
        [third]: { instanceId: third, templateId: "suppressHuguenots" as const },
      },
      resources: { ...base.resources, funding: 3 },
      playerStatuses: [
        ...base.playerStatuses,
        {
          instanceId: "st_hug",
          templateId: "huguenotContainment" as const,
          kind: "drawAttemptsDelta" as const,
          delta: 0,
          turnsRemaining: 1,
        },
      ],
    };
    const after = gameReducer(withCards, { type: "PLAY_CARD", handIndex: 0 });
    expect(after.playerStatuses.some((s) => s.templateId === "huguenotContainment")).toBe(false);
    expect(after.hand.includes(cardId)).toBe(false);
    expect(after.deck.includes(second)).toBe(false);
    expect(after.discard.includes(third)).toBe(false);
  });
});

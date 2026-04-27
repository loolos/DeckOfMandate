import { describe, expect, it } from "vitest";
import { levelContentByLevelId } from "../../../data/levelContent";
import { getLevelDef, getTurnLimitForRun } from "../../../data/levels";
import { getEventTemplate } from "../../../data/events";
import { EMPTY_EVENT_SLOTS } from "../../types/event";
import { createInitialState } from "../../../app/initialState";
import { gameReducer } from "../../../app/gameReducer";
import { initOpponentHabsburgPool } from "../../../logic/opponentHabsburg";
import { THIRD_MANDATE_LEVEL_ID } from "../../../logic/thirdMandateConstants";
import { retentionCapacity } from "./turnFlow";
import { createInitialCardUseState } from "./cardUsage";

describe("gameReducer (sunking campaign behaviors)", () => {
  it("Bavarian defection probe fund-solve draws one immediate opponent card when Habsburg row is active", () => {
    const s0 = initOpponentHabsburgPool(createInitialState(51_001, THIRD_MANDATE_LEVEL_ID));
    const handBefore = s0.opponentHand.length;
    const s1: typeof s0 = {
      ...s0,
      resources: { ...s0.resources, funding: 2 },
      opponentNextTurnDrawModifier: 0,
      slots: {
        ...s0.slots,
        A: { instanceId: "e_bav", templateId: "bavarianCourtRealignment", resolved: false },
      },
    };
    const after = gameReducer(s1, { type: "SOLVE_EVENT", slot: "A" });
    expect(after.resources.funding).toBe(0);
    expect(after.opponentNextTurnDrawModifier).toBe(0);
    expect(after.opponentHand.length).toBe(handBefore + 1);
  });

  it("Imperial electors fund-solve draws one immediate opponent card", () => {
    const s0 = initOpponentHabsburgPool(createInitialState(51_003, THIRD_MANDATE_LEVEL_ID));
    const handBefore = s0.opponentHand.length;
    const s1: typeof s0 = {
      ...s0,
      resources: { ...s0.resources, funding: 2 },
      opponentNextTurnDrawModifier: 0,
      slots: {
        ...s0.slots,
        A: { instanceId: "e_elec", templateId: "imperialElectorsMood", resolved: false },
      },
    };
    const after = gameReducer(s1, { type: "SOLVE_EVENT", slot: "A" });
    expect(after.resources.funding).toBe(0);
    expect(after.opponentNextTurnDrawModifier).toBe(0);
    expect(after.opponentHand.length).toBe(handBefore + 1);
  });

  it("usurpation edict grants +2 succession, draws one card, and applies a two-turn end-of-year legitimacy drain", () => {
    const base = createInitialState(51_120, THIRD_MANDATE_LEVEL_ID);
    const usurpationId = "tmp_usurpation";
    const drawId = "tmp_usurpation_draw";
    const withCard: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [usurpationId]: { instanceId: usurpationId, templateId: "usurpationEdict" as const },
        [drawId]: { instanceId: drawId, templateId: "funding" as const },
      },
      hand: [usurpationId],
      deck: [drawId],
      discard: [],
      slots: { ...EMPTY_EVENT_SLOTS },
      resources: { ...base.resources, funding: 3, legitimacy: 10 },
      successionTrack: 0,
      playerStatuses: [],
    };
    const afterPlay = gameReducer(withCard, { type: "PLAY_CARD", handIndex: 0 });
    expect(afterPlay.resources.funding).toBe(0);
    expect(afterPlay.successionTrack).toBe(2);
    expect(afterPlay.hand).toContain(drawId);
    const crisis = afterPlay.playerStatuses.find((s) => s.templateId === "legitimacyCrisis");
    expect(crisis?.turnsRemaining).toBe(2);

    const afterFirstEndYear = gameReducer(afterPlay, { type: "END_YEAR" });
    expect(afterFirstEndYear.resources.legitimacy).toBe(9);
    expect(afterFirstEndYear.playerStatuses.find((s) => s.templateId === "legitimacyCrisis")?.turnsRemaining).toBe(1);

    const preparedSecondYear: typeof afterFirstEndYear = {
      ...afterFirstEndYear,
      phase: "action",
      hand: [],
      slots: { ...EMPTY_EVENT_SLOTS },
      pendingInteraction: null,
    };
    const afterSecondEndYear = gameReducer(preparedSecondYear, { type: "END_YEAR" });
    expect(afterSecondEndYear.resources.legitimacy).toBe(8);
    expect(afterSecondEndYear.playerStatuses.some((s) => s.templateId === "legitimacyCrisis")).toBe(false);
  });

  it("bourbon marriage proclamation grants a two-turn +1 hand cap status", () => {
    const base = createInitialState(51_121, THIRD_MANDATE_LEVEL_ID);
    const cardId = "tmp_bourbon_marriage";
    const s0: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [cardId]: { instanceId: cardId, templateId: "bourbonMarriageProclamation" as const },
      },
      hand: [cardId],
      resources: { ...base.resources, funding: 3, legitimacy: 4, power: 2 },
      successionTrack: 0,
      playerStatuses: [],
    };
    expect(retentionCapacity(s0)).toBe(4);
    const afterPlay = gameReducer(s0, { type: "PLAY_CARD", handIndex: 0 });
    expect(afterPlay.resources.funding).toBe(0);
    expect(afterPlay.resources.power).toBe(3);
    expect(afterPlay.successionTrack).toBe(1);
    const st = afterPlay.playerStatuses.find((p) => p.templateId === "bourbonMarriageRetention");
    expect(st?.kind).toBe("handCapDelta");
    expect(st?.delta).toBe(1);
    expect(st?.turnsRemaining).toBe(2);
    expect(retentionCapacity(afterPlay)).toBe(5);
  });

  it("Imperial electors crackdown intervention draws one immediate opponent card", () => {
    const base = initOpponentHabsburgPool(createInitialState(51_004, THIRD_MANDATE_LEVEL_ID));
    const handBefore = base.opponentHand.length;
    const diId = "tmp_di_elec";
    const s0: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [diId]: { instanceId: diId, templateId: "diplomaticIntervention" },
      },
      hand: [diId],
      resources: { ...base.resources, funding: 0 },
      opponentNextTurnDrawModifier: 0,
      slots: {
        ...base.slots,
        A: { instanceId: "e_elec2", templateId: "imperialElectorsMood", resolved: false },
      },
    };
    const afterPlay = gameReducer(s0, { type: "PLAY_CARD", handIndex: 0 });
    const after = gameReducer(afterPlay, { type: "CRACKDOWN_TARGET", slot: "A" });
    expect(after.opponentNextTurnDrawModifier).toBe(0);
    expect(after.opponentHand.length).toBe(handBefore + 1);
  });

  it("royal intervention can clear localized succession war", () => {
    const base = createInitialState(51_005, THIRD_MANDATE_LEVEL_ID);
    const crackdownId = "tmp_crack_localized";
    const s0: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [crackdownId]: { instanceId: crackdownId, templateId: "crackdown" },
      },
      hand: [crackdownId],
      resources: { ...base.resources, funding: 1 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_localized_war", templateId: "localizedSuccessionWar", resolved: false },
      },
    };
    const afterPlay = gameReducer(s0, { type: "PLAY_CARD", handIndex: 0 });
    expect(afterPlay.pendingInteraction?.type).toBe("crackdownPick");
    const after = gameReducer(afterPlay, { type: "CRACKDOWN_TARGET", slot: "A" });
    expect(after.slots.A?.resolved).toBe(true);
  });

  it("diplomatic intervention can clear localized succession war", () => {
    const base = createInitialState(51_006, THIRD_MANDATE_LEVEL_ID);
    const interventionId = "tmp_di_localized";
    const s0: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [interventionId]: { instanceId: interventionId, templateId: "diplomaticIntervention" },
      },
      hand: [interventionId],
      resources: { ...base.resources, funding: 0 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_localized_war", templateId: "localizedSuccessionWar", resolved: false },
      },
    };
    const afterPlay = gameReducer(s0, { type: "PLAY_CARD", handIndex: 0 });
    expect(afterPlay.pendingInteraction?.type).toBe("crackdownPick");
    const after = gameReducer(afterPlay, { type: "CRACKDOWN_TARGET", slot: "A" });
    expect(after.slots.A?.resolved).toBe(true);
  });

  it("local war attack pays floor(europe-alert-progress/2) cost and resolves the event", () => {
    const base = createInitialState(8_001, "secondMandate");
    const s0 = {
      ...base,
      resources: { ...base.resources, funding: 8, power: 4, legitimacy: 4 },
      europeAlert: true,
      europeAlertProgress: 5,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_local_war", templateId: "localWar" as const, resolved: false },
      },
    };
    const s1 = gameReducer(s0, { type: "PICK_LOCAL_WAR_ATTACK", slot: "A" });
    expect(s1.resources.funding).toBe(6);
    expect(s1.slots.A?.resolved).toBe(true);
    const last = s1.actionLog[s1.actionLog.length - 1];
    expect(last?.kind).toBe("eventLocalWarChoice");
    if (last?.kind === "eventLocalWarChoice") {
      expect(last.choice).toBe("attack");
      expect(last.fundingPaid).toBe(2);
    }
  });

  it("local war attack includes anti-french sentiment penalty in funding cost", () => {
    const base = createInitialState(8_003, "secondMandate");
    const s0 = {
      ...base,
      resources: { ...base.resources, funding: 8, treasuryStat: 13, power: 12, legitimacy: 4 },
      europeAlert: true,
      europeAlertProgress: 5,
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_local_war", templateId: "localWar" as const, resolved: false },
      },
    };
    const s1 = gameReducer(s0, { type: "PICK_LOCAL_WAR_ATTACK", slot: "A" });
    expect(s1.resources.funding).toBe(5);
    expect(s1.slots.A?.resolved).toBe(true);
  });

  it("local war appease resolves with legitimacy -1 and no funding cost", () => {
    const base = createInitialState(8_002, "secondMandate");
    const s0 = {
      ...base,
      resources: { ...base.resources, funding: 4, legitimacy: 4 },
      slots: {
        ...EMPTY_EVENT_SLOTS,
        A: { instanceId: "e_local_war", templateId: "localWar" as const, resolved: false },
      },
    };
    const s1 = gameReducer(s0, { type: "PICK_LOCAL_WAR_APPEASE", slot: "A" });
    expect(s1.resources.funding).toBe(4);
    expect(s1.resources.legitimacy).toBe(3);
    expect(s1.slots.A?.resolved).toBe(true);
    const last = s1.actionLog[s1.actionLog.length - 1];
    expect(last).toMatchObject({
      kind: "eventLocalWarChoice",
      choice: "appease",
      fundingPaid: 0,
      legitimacyDelta: -1,
      powerDelta: 0,
    });
  });

  it("CRACKDOWN_TARGET only accepts harmful unresolved targets", () => {
    const base = createInitialState(77_001, "secondMandate");
    const crackdownId = "tmp_cd_smoke";
    const s0: typeof base = {
      ...base,
      cardsById: {
        ...base.cardsById,
        [crackdownId]: { instanceId: crackdownId, templateId: "crackdown" },
      },
      hand: [crackdownId],
      resources: { ...base.resources, funding: 1 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_h", templateId: "nobleResentment", resolved: false },
        B: { instanceId: "e_o", templateId: "tradeOpportunity", resolved: false },
      },
    };
    const afterPlay = gameReducer(s0, { type: "PLAY_CARD", handIndex: 0 });
    const afterBad = gameReducer(afterPlay, { type: "CRACKDOWN_TARGET", slot: "B" });
    expect(afterBad).toEqual(afterPlay);
    const afterGood = gameReducer(afterPlay, { type: "CRACKDOWN_TARGET", slot: "A" });
    expect(getEventTemplate("nobleResentment").harmful).toBe(true);
    expect(afterGood.slots.A?.resolved).toBe(true);
  });

  it("league of augsburg requires 3 resolves and persists between years until remaining reaches zero", () => {
    const base = createInitialState(31_416, "secondMandate");
    const s0: typeof base = {
      ...base,
      resources: { ...base.resources, funding: 6, legitimacy: 5 },
      slots: {
        ...base.slots,
        A: {
          instanceId: "e_augsburg",
          templateId: "leagueOfAugsburg",
          resolved: false,
          remainingTurns: 3,
        },
      },
    };
    const s1 = gameReducer(s0, { type: "SOLVE_EVENT", slot: "A" });
    expect(s1.resources.funding).toBe(4);
    expect(s1.slots.A?.resolved).toBe(true);
    expect(s1.slots.A?.remainingTurns).toBe(2);
    const s2 = gameReducer(s1, { type: "END_YEAR" });
    expect(s2.turn).toBe(s1.turn + 1);
    expect(s2.slots.A?.templateId).toBe("leagueOfAugsburg");
    expect(s2.slots.A?.resolved).toBe(false);
    expect(s2.slots.A?.remainingTurns).toBe(2);
  });

  it("SCRIPTED_EVENT_ATTACK uses level scripted config (cost, power, coalition window)", () => {
    const cfg = levelContentByLevelId.firstMandate.scriptedCalendarEvents.find(
      (x: { templateId: string }) => x.templateId === "warOfDevolution",
    )!;
    if (!cfg.attack || !cfg.antiCoalition) throw new Error("expected war scripted attack config");
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
      turnWindow === null
        ? getTurnLimitForRun("firstMandate", getLevelDef("firstMandate").calendarStartYear)
        : turn + turnWindow;
    expect(after.antiFrenchLeague!.untilTurn).toBe(expectedUntil);
  });

  it("diplomatic intervention starts at 2/2 and is removed on depletion without penalty", () => {
    const base = createInitialState(123_010, "secondMandate");
    expect(createInitialCardUseState("secondMandate", "diplomaticIntervention")).toEqual({ remaining: 2, total: 2 });
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
        [diplomaticIntervention]: { remaining: 1, total: 2 },
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
  });

  it("solving ryswick peace clears europe alert", () => {
    const base = createInitialState(202_904, "secondMandate");
    const s0: typeof base = {
      ...base,
      europeAlert: true,
      europeAlertProgress: 5,
      resources: { ...base.resources, funding: 11 },
      slots: {
        ...base.slots,
        A: { instanceId: "e_ryswick", templateId: "ryswickPeace" as const, resolved: false },
        B: { instanceId: "e_nine_years", templateId: "nineYearsWar" as const, resolved: false },
      },
    };
    const after = gameReducer(s0, { type: "SOLVE_EVENT", slot: "A" });
    expect(after.europeAlert).toBe(false);
    expect(after.europeAlertProgress).toBe(0);
    expect(after.slots.B).toBeNull();
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
    expect(
      after.actionLog.some(
        (entry) => entry.kind === "info" && entry.infoKey === "nantesPolicy.crackdownFontainebleauIssued",
      ),
    ).toBe(true);
  });

  it("playing one of three suppress cards decrements containment to 2 (strict invariant)", () => {
    const base = createInitialState(333_004, "secondMandate");
    const inHand = "tmp_sup_hand";
    const inDeck = "tmp_sup_deck";
    const inDiscard = "tmp_sup_disc";
    const withCards: typeof base = {
      ...base,
      hand: [inHand],
      deck: [inDeck, ...base.deck],
      discard: [inDiscard, ...base.discard],
      cardsById: {
        ...base.cardsById,
        [inHand]: { instanceId: inHand, templateId: "suppressHuguenots" as const },
        [inDeck]: { instanceId: inDeck, templateId: "suppressHuguenots" as const },
        [inDiscard]: { instanceId: inDiscard, templateId: "suppressHuguenots" as const },
      },
      resources: { ...base.resources, funding: 3 },
      playerStatuses: [
        ...base.playerStatuses,
        {
          instanceId: "st_hug",
          templateId: "huguenotContainment" as const,
          kind: "drawAttemptsDelta" as const,
          delta: 0,
          turnsRemaining: 3,
        },
      ],
    };
    const after = gameReducer(withCards, { type: "PLAY_CARD", handIndex: 0 });
    const status = after.playerStatuses.find((s) => s.templateId === "huguenotContainment");
    const liveCount = [...after.deck, ...after.hand, ...after.discard].filter(
      (id) => after.cardsById[id]?.templateId === "suppressHuguenots",
    ).length;
    expect(liveCount).toBe(2);
    expect(status?.turnsRemaining).toBe(liveCount);
  });
});


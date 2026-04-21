import { getCardTemplate } from "../data/cards";
import type { CardTemplateId } from "../levels/types/card";
import type { Effect } from "../levels/types/effect";
import { EVENT_SLOT_ORDER, type EventInstance, type SlotId } from "../levels/types/event";
import type { GameState, SuccessionIntervalTier } from "../types/game";
import { appendActionLog } from "./actionLog";
import { applyEffects, enforceLegitimacy, enforceSuccessionImmediateOutcome } from "./applyEffects";
import { OPPONENT_AI_NEAR_WIN_THRESHOLD, THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";
import { shuffle } from "./rng";

const HABSURG_TIE_ORDER: readonly CardTemplateId[] = [
  "habsburgGrandAllianceLevy",
  "habsburgImperialCustomsDelay",
  "habsburgImperialLegitimacyNote",
  "habsburgLowCountriesAgitation",
];

type OppDelta = { seq: number; pow: number; leg: number; tre: number };

function opponentEffectDelta(templateId: CardTemplateId): OppDelta {
  switch (templateId) {
    case "habsburgImperialLegitimacyNote":
      return { seq: -1, pow: 0, leg: 0, tre: 0 };
    case "habsburgLowCountriesAgitation":
      return { seq: -1, pow: -1, leg: -1, tre: 0 };
    case "habsburgGrandAllianceLevy":
      return { seq: -2, pow: 0, leg: 0, tre: 0 };
    case "habsburgImperialCustomsDelay":
      return { seq: 0, pow: 0, leg: 0, tre: -1 };
    default:
      return { seq: 0, pow: 0, leg: 0, tre: 0 };
  }
}

/** Build the effect list applied to the player when these opponent cards resolve (for UI / logs). */
export function opponentTemplatesToAppliedEffects(ids: readonly CardTemplateId[]): Effect[] {
  let d: OppDelta = { seq: 0, pow: 0, leg: 0, tre: 0 };
  for (const id of ids) d = addDelta(d, opponentEffectDelta(id));
  const out: Effect[] = [];
  if (d.seq !== 0) out.push({ kind: "modSuccessionTrack", delta: d.seq });
  const levyCount = ids.filter((id) => id === "habsburgGrandAllianceLevy").length;
  const customsCount = ids.filter((id) => id === "habsburgImperialCustomsDelay").length;
  const fiscalBurdenAdds = levyCount + customsCount;
  if (fiscalBurdenAdds > 0) {
    out.push({ kind: "addCardsToDeck", templateId: "fiscalBurden", count: fiscalBurdenAdds });
  }
  if (customsCount > 0) {
    out.push({ kind: "scheduleNextTurnDrawModifier", delta: -customsCount });
  }
  const legitimacyNoteCount = ids.filter((id) => id === "habsburgImperialLegitimacyNote").length;
  if (legitimacyNoteCount > 0) {
    out.push({ kind: "opponentNextTurnDrawModifier", delta: -legitimacyNoteCount });
  }
  if (d.pow !== 0) out.push({ kind: "modResource", resource: "power", delta: d.pow });
  if (d.leg !== 0) out.push({ kind: "modResource", resource: "legitimacy", delta: d.leg });
  if (d.tre !== 0) out.push({ kind: "modResource", resource: "treasuryStat", delta: d.tre });
  return out;
}

function addDelta(a: OppDelta, b: OppDelta): OppDelta {
  return {
    seq: a.seq + b.seq,
    pow: a.pow + b.pow,
    leg: a.leg + b.leg,
    tre: a.tre + b.tre,
  };
}

function compareLex(a: OppDelta, b: OppDelta): number {
  if (a.seq !== b.seq) return a.seq - b.seq;
  if (a.pow !== b.pow) return a.pow - b.pow;
  if (a.leg !== b.leg) return a.leg - b.leg;
  return a.tre - b.tre;
}

function sortIdsForTieBreak(ids: readonly string[], cardsById: GameState["cardsById"]): string[] {
  return [...ids].sort((a, b) => {
    const ta = cardsById[a]?.templateId;
    const tb = cardsById[b]?.templateId;
    if (ta !== tb) {
      const ia = ta ? HABSURG_TIE_ORDER.indexOf(ta) : 999;
      const ib = tb ? HABSURG_TIE_ORDER.indexOf(tb) : 999;
      if (ia !== ib) return ia - ib;
      return (ta ?? "").localeCompare(tb ?? "");
    }
    return a.localeCompare(b);
  });
}

function sumOpponentCost(ids: readonly string[], cardsById: GameState["cardsById"]): number {
  let s = 0;
  for (const id of ids) {
    const t = cardsById[id]?.templateId;
    if (!t) continue;
    const c = getCardTemplate(t).opponentCost ?? 0;
    s += c;
  }
  return s;
}

function enumerateNonEmptySubsets<T>(items: readonly T[]): T[][] {
  const n = items.length;
  const out: T[][] = [];
  for (let mask = 1; mask < 1 << n; mask++) {
    const row: T[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) row.push(items[i]!);
    }
    out.push(row);
  }
  return out;
}

function sumDeltaForSubset(ids: readonly string[], cardsById: GameState["cardsById"]): OppDelta {
  let d: OppDelta = { seq: 0, pow: 0, leg: 0, tre: 0 };
  for (const id of ids) {
    const tid = cardsById[id]?.templateId;
    if (tid) d = addDelta(d, opponentEffectDelta(tid));
  }
  return d;
}

/** Returns true if `a` is strictly better for the opponent than `b`. */
function opponentPlayIsBetter(
  nearWin: boolean,
  a: readonly string[],
  b: readonly string[],
  cardsById: GameState["cardsById"],
): boolean {
  const da = sumDeltaForSubset(a, cardsById);
  const db = sumDeltaForSubset(b, cardsById);
  if (nearWin) {
    if (da.seq !== db.seq) return da.seq < db.seq;
  } else {
    const cmp = compareLex(da, db);
    if (cmp !== 0) return cmp < 0;
  }
  const ca = sumOpponentCost(a, cardsById);
  const cb = sumOpponentCost(b, cardsById);
  if (ca !== cb) return ca > cb;
  const sa = sortIdsForTieBreak(a, cardsById).join("\0");
  const sb = sortIdsForTieBreak(b, cardsById).join("\0");
  return sa < sb;
}

export function chooseOpponentPlay(state: GameState): readonly string[] | null {
  if (state.levelId !== THIRD_MANDATE_LEVEL_ID || !state.opponentHabsburgUnlocked) return null;
  const hand = state.opponentHand;
  if (hand.length === 0) return [];

  const n = state.opponentStrength;
  const discount = Math.max(0, Math.floor(state.opponentCostDiscountThisTurn));
  const budget = Math.max(0, n - discount);
  const nearWin = state.successionTrack >= OPPONENT_AI_NEAR_WIN_THRESHOLD;

  const candidates = enumerateNonEmptySubsets(hand).filter((ids) => sumOpponentCost(ids, state.cardsById) <= budget);
  if (candidates.length === 0) return [];

  let best = candidates[0]!;
  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i]!;
    if (opponentPlayIsBetter(nearWin, c, best, state.cardsById)) best = c;
  }
  return sortIdsForTieBreak(best, state.cardsById);
}

function applyOpponentCardToState(state: GameState, templateId: CardTemplateId): GameState {
  const d = opponentEffectDelta(templateId);
  const effects: Effect[] = [];
  if (d.seq !== 0) effects.push({ kind: "modSuccessionTrack" as const, delta: d.seq });
  if (d.pow !== 0) effects.push({ kind: "modResource" as const, resource: "power" as const, delta: d.pow });
  if (d.leg !== 0) effects.push({ kind: "modResource" as const, resource: "legitimacy" as const, delta: d.leg });
  if (d.tre !== 0) effects.push({ kind: "modResource" as const, resource: "treasuryStat" as const, delta: d.tre });
  if (templateId === "habsburgImperialLegitimacyNote") {
    effects.push({ kind: "opponentNextTurnDrawModifier", delta: -1 });
  }
  if (templateId === "habsburgGrandAllianceLevy") {
    effects.push({ kind: "addCardsToDeck", templateId: "fiscalBurden", count: 1 });
  }
  if (templateId === "habsburgImperialCustomsDelay") {
    effects.push(
      { kind: "addCardsToDeck", templateId: "fiscalBurden", count: 1 },
      { kind: "scheduleNextTurnDrawModifier", delta: -1 },
    );
  }
  if (effects.length === 0) return state;
  return applyEffects(state, effects);
}

/** Draw up to `count` cards from opponent deck (reshuffle discard if needed). */
export function opponentDrawFromDeck(state: GameState, count: number): GameState {
  let deck = [...state.opponentDeck];
  let discard = [...state.opponentDiscard];
  let hand = [...state.opponentHand];
  let rng = state.rng;
  const drawn: string[] = [];

  for (let i = 0; i < count; i++) {
    if (deck.length === 0 && discard.length > 0) {
      const [r2, sh] = shuffle(rng, discard);
      rng = r2;
      deck = sh;
      discard = [];
    }
    if (deck.length === 0) break;
    const id = deck[0]!;
    deck = deck.slice(1);
    drawn.push(id);
    hand.push(id);
  }

  return {
    ...state,
    rng,
    opponentDeck: deck,
    opponentDiscard: discard,
    opponentHand: hand,
  };
}

export function completeSuccessionCrisisAndRevealOpponent(state: GameState, slot: SlotId): GameState {
  let s = initOpponentHabsburgPool(state);
  const instance: EventInstance = {
    instanceId: `evt_${s.nextIds.event}`,
    templateId: "opponentHabsburg",
    /** Display-only row; no funding solve this year. */
    resolved: true,
  };
  return {
    ...s,
    nextIds: { ...s.nextIds, event: s.nextIds.event + 1 },
    slots: { ...s.slots, [slot]: instance },
  };
}

export function initOpponentHabsburgPool(state: GameState): GameState {
  const templates: CardTemplateId[] = [
    "habsburgGrandAllianceLevy",
    "habsburgGrandAllianceLevy",
    "habsburgImperialCustomsDelay",
    "habsburgImperialCustomsDelay",
    "habsburgImperialLegitimacyNote",
    "habsburgImperialLegitimacyNote",
    "habsburgLowCountriesAgitation",
    "habsburgLowCountriesAgitation",
  ];
  const cardsById = { ...state.cardsById };
  const ids: string[] = [];
  let idx = state.nextIds.event;
  for (const templateId of templates) {
    const instanceId = `opp_${templateId}_${idx}`;
    idx += 1;
    cardsById[instanceId] = { instanceId, templateId };
    ids.push(instanceId);
  }
  const [rng2, shuffled] = shuffle(state.rng, ids);
  let deck = [...shuffled];
  const hand: string[] = [];
  for (let i = 0; i < 1 && deck.length > 0; i++) {
    hand.push(deck[0]!);
    deck = deck.slice(1);
  }
  return {
    ...state,
    rng: rng2,
    cardsById,
    nextIds: { ...state.nextIds, event: idx },
    opponentDeck: deck,
    opponentHand: hand,
    opponentDiscard: [],
    opponentStrength: 2,
    opponentHabsburgUnlocked: true,
    opponentNextTurnDrawModifier: state.opponentNextTurnDrawModifier,
  };
}

/** Opponent draws at year-start so the player can see current rival hand before ending the year. */
/** Tier at treaty-signing time from succession track (not identical to calendar-end interval tiers). */
export function utrechtTreatySituationTier(track: number): SuccessionIntervalTier {
  if (track >= 4) return "bourbon";
  if (track >= -3) return "compromise";
  return "habsburg";
}

/** Player chose Utrecht peace (or countdown expired): end war, drop rival row, freeze settlement tier for epilogue. */
export function stateAfterUtrechtTreatyEndsWar(state: GameState, utrechtSlot: SlotId): GameState {
  const tier = utrechtTreatySituationTier(state.successionTrack);
  const slots: GameState["slots"] = { ...state.slots, [utrechtSlot]: null };
  for (const slot of EVENT_SLOT_ORDER) {
    if (slots[slot]?.templateId === "opponentHabsburg") {
      slots[slot] = null;
    }
  }
  return {
    ...state,
    warEnded: true,
    utrechtTreatyCountdown: null,
    utrechtSettlementTier: tier,
    slots,
    opponentHabsburgUnlocked: false,
    opponentDeck: [],
    opponentHand: [],
    opponentDiscard: [],
    opponentLastPlayedTemplateIds: [],
    opponentNextTurnDrawModifier: 0,
    opponentCostDiscountThisTurn: 0,
  };
}

export function opponentBeginYearDrawPhase(state: GameState): GameState {
  if (state.levelId !== THIRD_MANDATE_LEVEL_ID || !state.opponentHabsburgUnlocked || state.warEnded) {
    return { ...state, opponentCostDiscountThisTurn: 0 };
  }
  const drawMod = state.opponentNextTurnDrawModifier;
  const drawN = Math.max(0, 1 + drawMod);
  const reset = { ...state, opponentCostDiscountThisTurn: 0, opponentNextTurnDrawModifier: 0 };
  const beforeDraw = reset.opponentHand.length;
  const drawnState = opponentDrawFromDeck(reset, drawN);
  const drawn = drawnState.opponentHand.slice(beforeDraw);
  if (drawn.length === 0) return drawnState;
  return appendActionLog(drawnState, { kind: "opponentHabsburgDraw", drawnCardIds: drawn });
}

export function opponentEndYearPlayPhase(state: GameState): GameState {
  if (
    state.levelId !== THIRD_MANDATE_LEVEL_ID ||
    !state.opponentHabsburgUnlocked ||
    state.outcome !== "playing" ||
    state.warEnded
  ) {
    return state;
  }
  let pre = state;
  const picked = chooseOpponentPlay(pre);
  if (picked === null) {
    return pre;
  }
  if (picked.length === 0) {
    return { ...pre, opponentLastPlayedTemplateIds: [] };
  }
  const discount = Math.max(0, Math.floor(pre.opponentCostDiscountThisTurn));
  const costSum = sumOpponentCost(picked, pre.cardsById);
  const budget = Math.max(0, pre.opponentStrength - discount);
  if (costSum > budget) return pre;

  const pickedSet = new Set(picked);
  let s: GameState = {
    ...pre,
    opponentHand: pre.opponentHand.filter((id) => !pickedSet.has(id)),
    opponentDiscard: [...pre.opponentDiscard, ...picked],
  };

  const playedTemplates: CardTemplateId[] = [];
  for (const id of picked) {
    const t = s.cardsById[id]?.templateId;
    if (!t) continue;
    playedTemplates.push(t);
    s = applyOpponentCardToState(s, t);
    s = enforceSuccessionImmediateOutcome(s);
    if (s.outcome !== "playing") break;
    s = enforceLegitimacy(s);
    if (s.outcome !== "playing") break;
  }
  s = { ...s, opponentLastPlayedTemplateIds: playedTemplates };
  return appendActionLog(s, {
    kind: "opponentHabsburgPlay",
    cardInstanceIds: [...picked],
    opponentCostSum: costSum,
    opponentCostDiscount: discount,
  });
}

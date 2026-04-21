import { createInitialState } from "../app/initialState";
import {
  buildLevel2StateFromDraft,
  createContinuityLevel2Draft,
  createStandaloneLevel2Draft,
} from "../app/level2Transition";
import { gameReducer, type GameAction } from "../app/gameReducer";
import { getCardTemplate } from "../data/cards";
import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { getLevelDef } from "../data/levels";
import type { CardTemplateId } from "../levels/types/card";
import { EVENT_SLOT_ORDER, type SlotId } from "../levels/types/event";
import type { GameOutcome, GameState, Resources } from "../types/game";
import { getPlayableCardCost } from "./cardCost";
import { findScriptedCalendarConfig } from "./scriptedCalendar";
import { retentionCapacity } from "./turnFlow";

const MAX_STEPS_PER_RUN = 4_000;
const RETENTION_PRIORITY_TEMPLATES: readonly CardTemplateId[] = [
  "funding",
  "crackdown",
  "diplomaticIntervention",
];
const RETENTION_PRIORITY_TEMPLATES_STRATEGY_I: readonly CardTemplateId[] = [
  "funding",
  "crackdown",
  "diplomaticIntervention",
  "grainRelief",
  "diplomaticCongress",
  "development",
  "reform",
  "ceremony",
  "taxRebalance",
  "jesuitCollege",
];
const LEGACY_STRATEGY_ID = "event-first-retain-royal-funding-and-intervention";
const STRATEGY_I_ID = "a-strategy-i";

type StrategyPolicyId = "legacy" | "a-strategy-i";

export type NantesChoice = "crackdown" | "tolerance";

export type StrategyOptions = {
  nantesChoice?: NantesChoice;
};

export type StrategyRunResult = {
  seed: number;
  outcome: GameOutcome;
  endTurn: number;
  endingResources: Resources;
};

export type StrategyBatchReport = {
  levelId: "firstMandate";
  strategyId: typeof LEGACY_STRATEGY_ID;
  runCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageEndTurn: number;
  averageEndTurnOnWin: number | null;
  averageEndTurnOnLoss: number | null;
  averageEndingResources: Resources;
};

export type SecondMandateBatchReport = {
  levelId: "secondMandate";
  startMode: "standalone";
  strategyId: typeof STRATEGY_I_ID;
  runCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageEndTurn: number;
  averageEndTurnOnWin: number | null;
  averageEndTurnOnLoss: number | null;
  averageEndingResources: Resources;
};

export type CampaignRunResult = {
  seed: number;
  firstOutcome: GameOutcome;
  firstEndTurn: number;
  secondOutcome: GameOutcome | null;
  secondEndTurn: number | null;
};

export type CampaignBatchReport = {
  strategyId: typeof STRATEGY_I_ID;
  runCount: number;
  chapter1Wins: number;
  chapter1Losses: number;
  chapter1WinRate: number;
  chapter2Runs: number;
  chapter2Wins: number;
  chapter2Losses: number;
  chapter2WinRateAfterCarryover: number | null;
  fullCampaignWins: number;
  fullCampaignWinRate: number;
  averageChapter1EndTurn: number;
  averageChapter2EndTurnOnReached: number | null;
  averageChapter2EndTurnOnWin: number | null;
};

function round(value: number, digits: number): number {
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

function unresolvedSlots(state: GameState): SlotId[] {
  return EVENT_SLOT_ORDER.filter((slot) => {
    const ev = state.slots[slot];
    return !!ev && !ev.resolved;
  });
}

function harmfulUrgencyScore(templateId: string): number {
  switch (templateId) {
    case "versaillesExpenditure":
      return 120;
    case "taxResistance":
      return 110;
    case "frontierGarrisons":
      return 105;
    case "warWeariness":
      return 100;
    case "risingGrainPrices":
      return 96;
    case "courtScandal":
      return 92;
    case "provincialNoncompliance":
      return 88;
    case "nobleResentment":
      return 84;
    case "politicalGridlock":
      return 82;
    case "administrativeDelay":
      return 78;
    case "budgetStrain":
      return 76;
    case "publicUnrest":
      return 74;
    case "majorCrisis":
      return 122;
    case "powerVacuum":
      return 108;
    default:
      return 70;
  }
}

function pickCrackdownTarget(state: GameState): SlotId | null {
  const unresolved = unresolvedSlots(state);
  if (unresolved.length === 0) return null;
  const ranked = [...unresolved].sort((a, b) => {
    const ta = getEventTemplate(state.slots[a]!.templateId);
    const tb = getEventTemplate(state.slots[b]!.templateId);
    if (ta.harmful !== tb.harmful) return ta.harmful ? -1 : 1;
    if (ta.harmful && tb.harmful) {
      const sa = harmfulUrgencyScore(state.slots[a]!.templateId);
      const sb = harmfulUrgencyScore(state.slots[b]!.templateId);
      if (sa !== sb) return sb - sa;
    }
    return a.localeCompare(b);
  });
  for (const slot of ranked) {
    const tmpl = getEventTemplate(state.slots[slot]!.templateId);
    if (tmpl.harmful) return slot;
  }
  return null;
}

function pickFundSolveActionsLegacy(state: GameState): GameAction[] {
  const hasUnresolvedHarmful = unresolvedSlots(state).some((slot) => {
    const ev = state.slots[slot];
    return !!ev && !ev.resolved && getEventTemplate(ev.templateId).harmful;
  });
  const candidates: Array<{ slot: SlotId; harmful: boolean; amount: number }> = [];
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown") continue;
    if (hasUnresolvedHarmful && !tmpl.harmful) continue;
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    if (amount === null) continue;
    if (state.resources.funding < amount) continue;
    candidates.push({ slot, harmful: tmpl.harmful, amount });
  }
  candidates.sort((a, b) => {
    if (a.harmful !== b.harmful) return a.harmful ? -1 : 1;
    if (a.amount !== b.amount) return a.amount - b.amount;
    return a.slot.localeCompare(b.slot);
  });
  return candidates.map((x) => ({ type: "SOLVE_EVENT", slot: x.slot }));
}

function hasUnresolvedHarmfulEvents(state: GameState): boolean {
  return unresolvedSlots(state).some((slot) => {
    const ev = state.slots[slot];
    return !!ev && !ev.resolved && getEventTemplate(ev.templateId).harmful;
  });
}

function firstUnresolvedSlotByTemplate(state: GameState, templateId: string): SlotId | null {
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    if (ev.templateId === templateId) return slot;
  }
  return null;
}

function minFundingSolveAmount(
  state: GameState,
  predicate: (templateId: string, harmful: boolean) => boolean,
): number | null {
  let best: number | null = null;
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    if (!predicate(ev.templateId, tmpl.harmful)) continue;
    if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown") continue;
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    if (amount === null) continue;
    best = best === null ? amount : Math.min(best, amount);
  }
  return best;
}

function isCriticalOpportunityEventTemplate(templateId: string): boolean {
  return (
    templateId === "ryswickPeace" ||
    templateId === "nymwegenSettlement" ||
    templateId === "leagueOfAugsburg" ||
    templateId === "nineYearsWar" ||
    templateId === "expansionRemembered" ||
    templateId === "cautiousCrown"
  );
}

function strategyISolvePriority(state: GameState, slot: SlotId, amount: number): number {
  const ev = state.slots[slot];
  if (!ev) return 1_000_000;
  const id = ev.templateId;
  if (id === "ryswickPeace") return -30_000 + amount;
  if (id === "versaillesExpenditure") return -28_000 + amount;
  if (id === "taxResistance") return -27_500 + amount;
  if (id === "frontierGarrisons") return -27_000 + amount;
  if (id === "warWeariness") return -26_500 + amount;
  if (id === "risingGrainPrices") return -26_000 + amount;
  if (id === "courtScandal") return -25_500 + amount;
  if (id === "provincialNoncompliance") return -25_000 + amount;
  if (id === "nymwegenSettlement") return -24_000 + amount;
  if (id === "leagueOfAugsburg" || id === "nineYearsWar") return -23_000 + amount;
  if (getEventTemplate(id).harmful) return -22_000 + amount;
  if (isCriticalOpportunityEventTemplate(id)) return -14_000 + amount;
  return -8_000 + amount;
}

/**
 * Funding kept in reserve when `huguenotContainment` is active and the AI
 * holds at least one `suppressHuguenots` card. This prevents the solve-first
 * loop from draining funding to 0 before the dead card can ever be played,
 * which would otherwise let containment stacks pile up indefinitely.
 *
 * Solves can still consume reserved funding for *critical* (very-high
 * priority) targets via `strategyISolvePriority` — the reserve is only
 * enforced for ordinary harmful/funding solves where we'd rather chip away
 * at the suppress stack than handle one more low/mid-tier event this turn.
 */
const HUGUENOT_SUPPRESS_FUNDING_RESERVE = 3;
const HUGUENOT_SUPPRESS_RESERVE_OVERRIDE_PRIORITY = -25_000;

function pickFundSolveActionsStrategyI(state: GameState): GameAction[] {
  const hasUnresolvedHarmful = hasUnresolvedHarmfulEvents(state);
  const hasJansenistOnBoard = !!firstUnresolvedSlotByTemplate(state, "jansenistTension");
  const hasContainment = state.playerStatuses.some((s) => s.templateId === "huguenotContainment");
  const hasSuppressInHand = state.hand.some((id) => state.cardsById[id]?.templateId === "suppressHuguenots");
  const reserveBuffer = hasContainment && hasSuppressInHand ? HUGUENOT_SUPPRESS_FUNDING_RESERVE : 0;
  const candidates: Array<{ slot: SlotId; amount: number; priority: number }> = [];
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown") continue;
    const keepEvenUnderPressure = isCriticalOpportunityEventTemplate(ev.templateId);
    if (hasUnresolvedHarmful && !tmpl.harmful && !keepEvenUnderPressure) continue;
    // Jesuit Patronage dilutes the deck (2 collèges + 1 religious-tension card); only worth
    // solving when its Jansenist auto-resolve synergy can actually be triggered.
    if (ev.templateId === "jesuitPatronage" && !hasJansenistOnBoard) continue;
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    if (amount === null) continue;
    if (state.resources.funding < amount) continue;
    const priority = strategyISolvePriority(state, slot, amount);
    // Funding-reserve guard for the suppressHuguenots play loop.
    // Critical-priority solves (e.g. Ryswick) bypass the reserve.
    if (
      reserveBuffer > 0 &&
      priority > HUGUENOT_SUPPRESS_RESERVE_OVERRIDE_PRIORITY &&
      state.resources.funding - amount < reserveBuffer
    ) {
      continue;
    }
    candidates.push({
      slot,
      amount,
      priority,
    });
  }
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.amount !== b.amount) return a.amount - b.amount;
    return a.slot.localeCompare(b.slot);
  });
  return candidates.map((x) => ({ type: "SOLVE_EVENT", slot: x.slot }));
}

function pickScriptedAttackActionsLegacy(state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    if (tmpl.solve.kind !== "scriptedAttack") continue;
    const cfg = findScriptedCalendarConfig(state.levelId, ev.templateId);
    if (!cfg?.attack) continue;
    if (state.resources.funding < cfg.attack.fundingCost) continue;
    actions.push({ type: "SCRIPTED_EVENT_ATTACK", slot });
  }
  return actions;
}

function pickScriptedAttackActionsStrategyI(state: GameState): GameAction[] {
  if (state.levelId === "firstMandate") return [];
  return pickScriptedAttackActionsLegacy(state);
}

function cardPlayPriorityLegacy(state: GameState, cardInstanceId: string): number {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return 1_000;
  const tmpl = inst.templateId;
  const harmfulUnresolvedExists = unresolvedSlots(state).some((slot) => {
    const ev = state.slots[slot];
    return !!ev && !ev.resolved && getEventTemplate(ev.templateId).harmful;
  });
  const win = getLevelDef(state.levelId).winTargets;
  const treasuryMissing = Math.max(0, win.treasuryStat - state.resources.treasuryStat);
  const powerMissing = Math.max(0, win.power - state.resources.power);
  const legitimacyMissing = Math.max(0, win.legitimacy - state.resources.legitimacy);

  switch (tmpl) {
    case "funding":
      return harmfulUnresolvedExists ? 0 : 4;
    case "crackdown":
    case "diplomaticIntervention":
      return harmfulUnresolvedExists ? 1 : 60;
    case "development":
      return treasuryMissing > 0 ? 2 : 20;
    case "reform":
      return powerMissing > 0 ? 2 : 20;
    case "ceremony":
      return legitimacyMissing > 0 ? 2 : 20;
    default:
      return 30;
  }
}

function cardPlayPriorityStrategyI(state: GameState, cardInstanceId: string): number {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return 1_000;
  const tmpl = inst.templateId;
  const unresolvedHarmful = hasUnresolvedHarmfulEvents(state);
  const unresolvedRyswickPeace = !!firstUnresolvedSlotByTemplate(state, "ryswickPeace");
  const unresolvedRisingGrain = !!firstUnresolvedSlotByTemplate(state, "risingGrainPrices");
  const hasContainmentStatus = state.playerStatuses.some((st) => st.templateId === "huguenotContainment");
  const minimumHarmfulSolveAmount = minFundingSolveAmount(state, (_templateId, harmful) => harmful);
  const currentFunding = state.resources.funding;
  const canFundingUnlockHarmfulSolve =
    minimumHarmfulSolveAmount !== null &&
    currentFunding < minimumHarmfulSolveAmount &&
    currentFunding + 1 >= minimumHarmfulSolveAmount;
  const ryswickSolveAmount = unresolvedRyswickPeace ? getEventSolveFundingAmount(state, "ryswickPeace") : null;
  const canFundingUnlockRyswick =
    ryswickSolveAmount !== null && currentFunding < ryswickSolveAmount && currentFunding + 1 >= ryswickSolveAmount;

  if (tmpl === "fiscalBurden") return 10_000;
  if (tmpl === "religiousTensionCard" || tmpl === "jansenistReservation") return 10_000;
  if (state.levelId === "secondMandate") {
    switch (tmpl) {
      case "funding":
        if (canFundingUnlockRyswick) return 0;
        if (canFundingUnlockHarmfulSolve) return 1;
        if (unresolvedRyswickPeace) return 8;
        if (unresolvedHarmful) return 10;
        return 16;
      case "crackdown":
      case "diplomaticIntervention":
        return unresolvedHarmful ? (state.resources.power <= 2 ? 7 : 2) : 70;
      case "grainRelief":
        return unresolvedRisingGrain ? 2 : state.resources.legitimacy <= 6 ? 4 : 22;
      case "diplomaticCongress":
        return state.resources.power < 8 ? 3 : 24;
      case "taxRebalance":
        return state.resources.treasuryStat < 4 ? 5 : state.resources.treasuryStat < 6 ? 9 : 30;
      case "development":
        return state.resources.treasuryStat < 7 ? 4 : state.resources.treasuryStat < 9 ? 8 : 26;
      case "reform":
        return state.resources.power < 6 ? 4 : state.resources.power < 8 ? 8 : 26;
      case "ceremony":
        return state.resources.legitimacy < 6 ? 3 : state.resources.legitimacy < 9 ? 7 : 26;
      case "suppressHuguenots":
        return hasContainmentStatus ? 7 : 90;
      case "jesuitCollege": {
        const jansenistSlot = firstUnresolvedSlotByTemplate(state, "jansenistTension");
        if (jansenistSlot) return 2;
        return state.resources.legitimacy < 9 ? 5 : 12;
      }
      default:
        return 30;
    }
  }
  return cardPlayPriorityLegacy(state, cardInstanceId);
}

function pickCardPlayActions(state: GameState, policy: StrategyPolicyId): GameAction[] {
  const ranked: Array<{ handIndex: number; priority: number; cost: number }> = [];
  const unresolvedHarmful = hasUnresolvedHarmfulEvents(state);
  const hasContainmentStatus = state.playerStatuses.some((st) => st.templateId === "huguenotContainment");
  for (let i = 0; i < state.hand.length; i++) {
    const id = state.hand[i];
    if (!id) continue;
    const inst = state.cardsById[id];
    if (!inst) continue;
    const template = inst.templateId;
    if ((template === "crackdown" || template === "diplomaticIntervention") && !unresolvedHarmful) {
      continue;
    }
    if (template === "fiscalBurden") {
      continue;
    }
    if (template === "religiousTensionCard" || template === "jansenistReservation") {
      continue;
    }
    if (template === "suppressHuguenots" && !hasContainmentStatus) {
      continue;
    }
    const cost = getPlayableCardCost(state, id);
    if (state.resources.funding < cost) continue;
    ranked.push({
      handIndex: i,
      priority: policy === "legacy" ? cardPlayPriorityLegacy(state, id) : cardPlayPriorityStrategyI(state, id),
      cost,
    });
  }
  ranked.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    if (a.cost !== b.cost) return a.cost - b.cost;
    return a.handIndex - b.handIndex;
  });
  return ranked.map((x) => ({ type: "PLAY_CARD", handIndex: x.handIndex }));
}

export function pickRetentionIdsForSimplePolicy(state: GameState): readonly string[] {
  const capacity = retentionCapacity(state);
  if (capacity <= 0 || state.hand.length === 0) return [];
  const ranked = [...state.hand].sort((a, b) => {
    const ia = state.cardsById[a];
    const ib = state.cardsById[b];
    if (!ia || !ib) return a.localeCompare(b);
    const ta = ia.templateId;
    const tb = ib.templateId;
    const pa = RETENTION_PRIORITY_TEMPLATES.includes(ta) ? 1 : 0;
    const pb = RETENTION_PRIORITY_TEMPLATES.includes(tb) ? 1 : 0;
    if (pa !== pb) return pb - pa;
    const ca = getCardTemplate(ta).cost;
    const cb = getCardTemplate(tb).cost;
    if (ca !== cb) return ca - cb;
    return a.localeCompare(b);
  });
  return ranked.slice(0, capacity);
}

function pickRetentionIdsForStrategyI(state: GameState): readonly string[] {
  const capacity = retentionCapacity(state);
  if (capacity <= 0 || state.hand.length === 0) return [];
  const ranked = [...state.hand].sort((a, b) => {
    const ia = state.cardsById[a];
    const ib = state.cardsById[b];
    if (!ia || !ib) return a.localeCompare(b);
    const ta = ia.templateId;
    const tb = ib.templateId;
    const pa = RETENTION_PRIORITY_TEMPLATES_STRATEGY_I.includes(ta) ? 1 : 0;
    const pb = RETENTION_PRIORITY_TEMPLATES_STRATEGY_I.includes(tb) ? 1 : 0;
    if (pa !== pb) return pb - pa;
    const ca = getCardTemplate(ta).cost;
    const cb = getCardTemplate(tb).cost;
    if (ca !== cb) return ca - cb;
    return a.localeCompare(b);
  });
  return ranked.slice(0, capacity);
}

/**
 * Returns up to one "essential" card play that should happen *before* the
 * solveActions phase consumes funding. Designed to break the feedback loop
 * where `huguenotContainment` causes suppressHuguenots cards to pile up but
 * are never played, because solves drain funding to 0 every turn.
 *
 * Logic when `huguenotContainment` is active and a `suppressHuguenots` is in
 * the hand:
 *   1. If funding ≥ 3 → play the first suppressHuguenots in hand.
 *   2. Otherwise, if a free `funding` card is in hand → play it to build up
 *      funding so the suppress can be played in a later iteration.
 * Returns [] in all other cases.
 */
function pickEssentialPreSolveActionsStrategyI(state: GameState): GameAction[] {
  const hasContainment = state.playerStatuses.some((s) => s.templateId === "huguenotContainment");
  if (!hasContainment) return [];
  let suppressHandIndex = -1;
  let fundingHandIndex = -1;
  for (let i = 0; i < state.hand.length; i++) {
    const id = state.hand[i];
    if (!id) continue;
    const inst = state.cardsById[id];
    if (!inst) continue;
    if (suppressHandIndex < 0 && inst.templateId === "suppressHuguenots") {
      suppressHandIndex = i;
    } else if (fundingHandIndex < 0 && inst.templateId === "funding") {
      fundingHandIndex = i;
    }
    if (suppressHandIndex >= 0 && fundingHandIndex >= 0) break;
  }
  if (suppressHandIndex < 0) return [];
  if (state.resources.funding >= HUGUENOT_SUPPRESS_FUNDING_RESERVE) {
    const suppressId = state.hand[suppressHandIndex];
    if (!suppressId) return [];
    const cost = getPlayableCardCost(state, suppressId);
    if (state.resources.funding < cost) return [];
    return [{ type: "PLAY_CARD", handIndex: suppressHandIndex }];
  }
  if (fundingHandIndex >= 0) {
    return [{ type: "PLAY_CARD", handIndex: fundingHandIndex }];
  }
  return [];
}

function pickSpecialChoiceActionsStrategyI(
  state: GameState,
  options: StrategyOptions = {},
): GameAction[] {
  const nantesSlot = firstUnresolvedSlotByTemplate(state, "revocationNantes");
  if (nantesSlot) {
    const choice: NantesChoice = options.nantesChoice ?? "crackdown";
    if (choice === "tolerance") {
      return [{ type: "PICK_NANTES_TOLERANCE", slot: nantesSlot }];
    }
    return [{ type: "PICK_NANTES_CRACKDOWN", slot: nantesSlot }];
  }
  const localWarSlot = firstUnresolvedSlotByTemplate(state, "localWar");
  if (localWarSlot) {
    const cost = state.europeAlertProgress;
    if (state.resources.funding >= cost) {
      return [{ type: "PICK_LOCAL_WAR_ATTACK", slot: localWarSlot }];
    }
    const canPlayFundingCardNow = state.hand.some((id) => {
      const inst = state.cardsById[id];
      if (!inst || inst.templateId !== "funding") return false;
      return state.resources.funding >= getPlayableCardCost(state, id);
    });
    if (canPlayFundingCardNow) {
      return [];
    }
    if (state.resources.legitimacy > 1) {
      return [{ type: "PICK_LOCAL_WAR_APPEASE", slot: localWarSlot }];
    }
    return [{ type: "PICK_LOCAL_WAR_APPEASE", slot: localWarSlot }];
  }
  return [];
}

function chooseActions(
  state: GameState,
  policy: StrategyPolicyId,
  options: StrategyOptions = {},
): GameAction[] {
  if (state.phase === "retention") {
    const keepIds =
      policy === "legacy" ? pickRetentionIdsForSimplePolicy(state) : pickRetentionIdsForStrategyI(state);
    return [{ type: "CONFIRM_RETENTION", keepIds }];
  }
  if (state.phase !== "action" || state.outcome !== "playing") return [];
  if (state.pendingInteraction?.type === "crackdownPick") {
    const target = pickCrackdownTarget(state);
    if (target) return [{ type: "CRACKDOWN_TARGET", slot: target }];
    return [{ type: "CRACKDOWN_CANCEL" }];
  }
  if (policy === "a-strategy-i") {
    const special = pickSpecialChoiceActionsStrategyI(state, options);
    if (special.length > 0) return special;
    const essential = pickEssentialPreSolveActionsStrategyI(state);
    if (essential.length > 0) return essential;
  }
  const solveActions = policy === "legacy" ? pickFundSolveActionsLegacy(state) : pickFundSolveActionsStrategyI(state);
  const scriptedAttackActions =
    policy === "legacy" ? pickScriptedAttackActionsLegacy(state) : pickScriptedAttackActionsStrategyI(state);
  return [
    ...solveActions,
    ...scriptedAttackActions,
    ...pickCardPlayActions(state, policy),
    { type: "END_YEAR" },
  ];
}

function runStrategyStep(
  state: GameState,
  policy: StrategyPolicyId,
  options: StrategyOptions = {},
): GameState {
  const actions = chooseActions(state, policy, options);
  for (const action of actions) {
    const next = gameReducer(state, action);
    if (next !== state) return next;
  }
  return state;
}

export function simulateFirstMandateRun(seed: number): StrategyRunResult {
  const state = simulateFirstMandateEndState(seed);
  return {
    seed,
    outcome: state.outcome,
    endTurn: state.turn,
    endingResources: { ...state.resources },
  };
}

export function simulateSecondMandateStandaloneRun(
  seed: number,
  options: StrategyOptions = {},
): StrategyRunResult {
  const state = simulateSecondMandateStandaloneEndState(seed, options);
  return {
    seed,
    outcome: state.outcome,
    endTurn: state.turn,
    endingResources: { ...state.resources },
  };
}

function simulateEndStateWithPolicy(
  initialState: GameState,
  policy: StrategyPolicyId,
  seed: number,
  label: string,
  options: StrategyOptions = {},
): GameState {
  let state = initialState;
  for (let i = 0; i < MAX_STEPS_PER_RUN; i++) {
    if (state.outcome !== "playing") {
      return state;
    }
    const next = runStrategyStep(state, policy, options);
    if (next === state) {
      throw new Error(`strategy got stuck at ${label}, seed=${seed}, turn=${state.turn}, phase=${state.phase}`);
    }
    state = next;
  }
  throw new Error(`strategy exceeded max steps at ${label}, seed=${seed}`);
}

export function simulateFirstMandateEndState(seed: number): GameState {
  return simulateEndStateWithPolicy(createInitialState(seed, "firstMandate"), "legacy", seed, "firstMandate");
}

export function simulateSecondMandateStandaloneEndState(
  seed: number,
  options: StrategyOptions = {},
): GameState {
  const draft = createStandaloneLevel2Draft(seed);
  const initialState = buildLevel2StateFromDraft(draft);
  return simulateEndStateWithPolicy(initialState, "a-strategy-i", seed, "secondMandateStandalone", options);
}

function campaignSecondStageSeed(seed: number): number {
  return ((seed * 1_664_525 + 1_013_904_223) >>> 0) || 0x9e3779b9;
}

export function simulateFirstToSecondCampaignRun(
  seed: number,
  options: StrategyOptions = {},
): CampaignRunResult {
  const firstEndState = simulateEndStateWithPolicy(
    createInitialState(seed, "firstMandate"),
    "legacy",
    seed,
    "campaign:firstMandate",
  );
  if (firstEndState.outcome !== "victory") {
    return {
      seed,
      firstOutcome: firstEndState.outcome,
      firstEndTurn: firstEndState.turn,
      secondOutcome: null,
      secondEndTurn: null,
    };
  }
  const seed2 = campaignSecondStageSeed(seed);
  const draft = createContinuityLevel2Draft(firstEndState, seed2);
  const secondStartState = buildLevel2StateFromDraft(draft);
  const secondEndState = simulateEndStateWithPolicy(
    secondStartState,
    "a-strategy-i",
    seed2,
    "campaign:secondMandate",
    options,
  );
  return {
    seed,
    firstOutcome: firstEndState.outcome,
    firstEndTurn: firstEndState.turn,
    secondOutcome: secondEndState.outcome,
    secondEndTurn: secondEndState.turn,
  };
}

export function simulateFirstMandateBatch(options?: {
  seedStart?: number;
  runCount?: number;
}): StrategyBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const runs: StrategyRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateFirstMandateRun(seedStart + i));
  }
  const wins = runs.filter((r) => r.outcome === "victory");
  const losses = runs.filter((r) => r.outcome !== "victory");
  return {
    levelId: "firstMandate",
    strategyId: LEGACY_STRATEGY_ID,
    runCount,
    wins: wins.length,
    losses: losses.length,
    winRate: round(wins.length / runCount, 4),
    averageEndTurn: round(average(runs.map((r) => r.endTurn)), 3),
    averageEndTurnOnWin: wins.length ? round(average(wins.map((r) => r.endTurn)), 3) : null,
    averageEndTurnOnLoss: losses.length ? round(average(losses.map((r) => r.endTurn)), 3) : null,
    averageEndingResources: {
      treasuryStat: round(average(runs.map((r) => r.endingResources.treasuryStat)), 3),
      funding: round(average(runs.map((r) => r.endingResources.funding)), 3),
      power: round(average(runs.map((r) => r.endingResources.power)), 3),
      legitimacy: round(average(runs.map((r) => r.endingResources.legitimacy)), 3),
    },
  };
}

export function simulateSecondMandateStandaloneBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): SecondMandateBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const strategyOptions: StrategyOptions = {};
  if (options?.nantesChoice) strategyOptions.nantesChoice = options.nantesChoice;
  const runs: StrategyRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateSecondMandateStandaloneRun(seedStart + i, strategyOptions));
  }
  const wins = runs.filter((r) => r.outcome === "victory");
  const losses = runs.filter((r) => r.outcome !== "victory");
  return {
    levelId: "secondMandate",
    startMode: "standalone",
    strategyId: STRATEGY_I_ID,
    runCount,
    wins: wins.length,
    losses: losses.length,
    winRate: round(wins.length / runCount, 4),
    averageEndTurn: round(average(runs.map((r) => r.endTurn)), 3),
    averageEndTurnOnWin: wins.length ? round(average(wins.map((r) => r.endTurn)), 3) : null,
    averageEndTurnOnLoss: losses.length ? round(average(losses.map((r) => r.endTurn)), 3) : null,
    averageEndingResources: {
      treasuryStat: round(average(runs.map((r) => r.endingResources.treasuryStat)), 3),
      funding: round(average(runs.map((r) => r.endingResources.funding)), 3),
      power: round(average(runs.map((r) => r.endingResources.power)), 3),
      legitimacy: round(average(runs.map((r) => r.endingResources.legitimacy)), 3),
    },
  };
}

export function simulateFirstToSecondCampaignBatch(options?: {
  seedStart?: number;
  runCount?: number;
  nantesChoice?: NantesChoice;
}): CampaignBatchReport {
  const seedStart = options?.seedStart ?? 1;
  const runCount = options?.runCount ?? 200;
  if (runCount <= 0) {
    throw new Error("runCount must be > 0");
  }
  const strategyOptions: StrategyOptions = {};
  if (options?.nantesChoice) strategyOptions.nantesChoice = options.nantesChoice;
  const runs: CampaignRunResult[] = [];
  for (let i = 0; i < runCount; i++) {
    runs.push(simulateFirstToSecondCampaignRun(seedStart + i, strategyOptions));
  }
  const chapter1Wins = runs.filter((r) => r.firstOutcome === "victory");
  const chapter2Runs = runs.filter((r) => r.secondOutcome !== null);
  const chapter2Wins = chapter2Runs.filter((r) => r.secondOutcome === "victory");
  return {
    strategyId: STRATEGY_I_ID,
    runCount,
    chapter1Wins: chapter1Wins.length,
    chapter1Losses: runCount - chapter1Wins.length,
    chapter1WinRate: round(chapter1Wins.length / runCount, 4),
    chapter2Runs: chapter2Runs.length,
    chapter2Wins: chapter2Wins.length,
    chapter2Losses: chapter2Runs.length - chapter2Wins.length,
    chapter2WinRateAfterCarryover:
      chapter2Runs.length > 0 ? round(chapter2Wins.length / chapter2Runs.length, 4) : null,
    fullCampaignWins: chapter2Wins.length,
    fullCampaignWinRate: round(chapter2Wins.length / runCount, 4),
    averageChapter1EndTurn: round(average(runs.map((r) => r.firstEndTurn)), 3),
    averageChapter2EndTurnOnReached:
      chapter2Runs.length > 0 ? round(average(chapter2Runs.map((r) => r.secondEndTurn ?? 0)), 3) : null,
    averageChapter2EndTurnOnWin:
      chapter2Wins.length > 0 ? round(average(chapter2Wins.map((r) => r.secondEndTurn ?? 0)), 3) : null,
  };
}

import { createInitialState } from "../app/initialState";
import { gameReducer, type GameAction } from "../app/gameReducer";
import { getCardTemplate } from "../data/cards";
import { getEventSolveFundingAmount, getEventTemplate } from "../data/events";
import { getLevelDef } from "../data/levels";
import type { CardTemplateId } from "../types/card";
import { EVENT_SLOT_ORDER, type SlotId } from "../types/event";
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

export type StrategyRunResult = {
  seed: number;
  outcome: GameOutcome;
  endTurn: number;
  endingResources: Resources;
};

export type StrategyBatchReport = {
  levelId: "firstMandate";
  strategyId: "event-first-retain-royal-funding-and-intervention";
  runCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageEndTurn: number;
  averageEndTurnOnWin: number | null;
  averageEndTurnOnLoss: number | null;
  averageEndingResources: Resources;
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

function pickCrackdownTarget(state: GameState): SlotId | null {
  const unresolved = unresolvedSlots(state);
  if (unresolved.length === 0) return null;
  const ranked = [...unresolved].sort((a, b) => {
    const ta = getEventTemplate(state.slots[a]!.templateId);
    const tb = getEventTemplate(state.slots[b]!.templateId);
    if (ta.harmful !== tb.harmful) return ta.harmful ? -1 : 1;
    return a.localeCompare(b);
  });
  for (const slot of ranked) {
    const tmpl = getEventTemplate(state.slots[slot]!.templateId);
    if (tmpl.harmful) return slot;
  }
  return ranked[0] ?? null;
}

function pickFundSolveActions(state: GameState): GameAction[] {
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

function pickScriptedAttackActions(state: GameState): GameAction[] {
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

function cardPlayPriority(state: GameState, cardInstanceId: string): number {
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

function pickCardPlayActions(state: GameState): GameAction[] {
  const ranked: Array<{ handIndex: number; priority: number; cost: number }> = [];
  for (let i = 0; i < state.hand.length; i++) {
    const id = state.hand[i];
    if (!id) continue;
    const inst = state.cardsById[id];
    if (!inst) continue;
    const template = inst.templateId;
    const unresolvedHarmful = unresolvedSlots(state).some((slot) => {
      const ev = state.slots[slot];
      return !!ev && !ev.resolved && getEventTemplate(ev.templateId).harmful;
    });
    if ((template === "crackdown" || template === "diplomaticIntervention") && !unresolvedHarmful) {
      continue;
    }
    const cost = getPlayableCardCost(state, id);
    if (state.resources.funding < cost) continue;
    ranked.push({
      handIndex: i,
      priority: cardPlayPriority(state, id),
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

function chooseActions(state: GameState): GameAction[] {
  if (state.phase === "retention") {
    return [{ type: "CONFIRM_RETENTION", keepIds: pickRetentionIdsForSimplePolicy(state) }];
  }
  if (state.phase !== "action" || state.outcome !== "playing") return [];
  if (state.pendingInteraction?.type === "crackdownPick") {
    const target = pickCrackdownTarget(state);
    if (target) return [{ type: "CRACKDOWN_TARGET", slot: target }];
    return [{ type: "CRACKDOWN_CANCEL" }];
  }
  return [
    ...pickFundSolveActions(state),
    ...pickScriptedAttackActions(state),
    ...pickCardPlayActions(state),
    { type: "END_YEAR" },
  ];
}

function runStrategyStep(state: GameState): GameState {
  const actions = chooseActions(state);
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

export function simulateFirstMandateEndState(seed: number): GameState {
  let state = createInitialState(seed, "firstMandate");
  for (let i = 0; i < MAX_STEPS_PER_RUN; i++) {
    if (state.outcome !== "playing") {
      return state;
    }
    const next = runStrategyStep(state);
    if (next === state) {
      throw new Error(`strategy got stuck at seed=${seed}, turn=${state.turn}, phase=${state.phase}`);
    }
    state = next;
  }
  throw new Error(`strategy exceeded max steps for seed=${seed}`);
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
    strategyId: "event-first-retain-royal-funding-and-intervention",
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

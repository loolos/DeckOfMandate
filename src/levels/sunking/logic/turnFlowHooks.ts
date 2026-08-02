import { getLevelDef } from "../../../data/levels";
import { EVENT_SLOT_ORDER, type EventInstance } from "../../types/event";
import type { Effect } from "../../types/effect";
import type { GameState } from "../../../types/game";
import { appendActionLog } from "./actionLog";
import { enforceHuguenotContainmentInvariant, addCardsToDeck } from "./cardRuntime";
import {
  clampEuropeAlertProgress,
  europeAlertPressureDeltaK,
  europeAlertProgressShiftProbability,
  rollEuropeAlertSupplementalEventCount,
} from "./europeAlert";
import { antiFrenchSentimentActive } from "./antiFrenchSentiment";
import { applyEffects } from "./applyEffects";
import { rngNext } from "../../../logic/rng";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

const HUGUENOT_RESURGENCE_INTERVAL = 2;
const EUROPE_ALERT_SUPPLEMENTAL_POOL = [
  "frontierGarrisons",
  "tradeDisruption",
  "embargoCoalition",
  "mercenaryRaiders",
  "localWar",
] as const;
const RELIGIOUS_TENSION_BRANCH_PROBABILITY = 0.15;
const RELIGIOUS_TENSION_EVENTS: readonly EventInstance["templateId"][] = [
  "jansenistTension",
  "arminianTension",
  "huguenotTension",
];
/**
 * Encirclement ladder: each threshold the core-resource sum strictly exceeds is worth one
 * more point of Habsburg opponent strength, so >45 / >60 / >75 / >90 map to +1 / +2 / +3 / +4.
 */
const GREAT_POWER_ENCIRCLEMENT_TIER_SUMS: readonly number[] = [45, 60, 75, 90];

/** Sun King: unspent funding is lost at year end before victory evaluation. */
export function applyEndYearResourceResetHook(state: GameState): GameState {
  return { ...state, resources: { ...state.resources, funding: 0 } };
}

export function maybeAdjustEuropeAlertProgressAtYearStartHook(state: GameState): GameState {
  if (!state.europeAlert || !getLevelDef(state.levelId).features.europeAlertMechanics) return state;
  const from = clampEuropeAlertProgress(state.europeAlertProgress);
  const k = europeAlertPressureDeltaK(
    state.resources.treasuryStat,
    state.resources.power,
    state.resources.legitimacy,
    from,
  );
  if (k === 0) return { ...state, europeAlertProgress: from };
  const probability = europeAlertProgressShiftProbability(k);
  if (probability <= 0) return { ...state, europeAlertProgress: from };
  const [rng, u] = rngNext(state.rng);
  let s: GameState = { ...state, rng, europeAlertProgress: from };
  if (u >= probability) return s;
  const delta = k > 0 ? 1 : -1;
  const to = Math.min(10, Math.max(1, from + delta));
  if (to === from) return s;
  s = { ...s, europeAlertProgress: to };
  return appendActionLog(s, {
    kind: "europeAlertProgressShift",
    from,
    to,
    probabilityPct: Math.round(probability * 100),
    pressureDeltaK: k,
  });
}

export function maybeTriggerHuguenotResurgenceHook(state: GameState): GameState {
  const containment = state.playerStatuses.find((s) => s.templateId === "huguenotContainment");
  if (!containment) {
    if (state.huguenotResurgenceCounter === 0) return state;
    return { ...state, huguenotResurgenceCounter: 0 };
  }
  const nextCounter = state.huguenotResurgenceCounter + 1;
  if (nextCounter < HUGUENOT_RESURGENCE_INTERVAL) {
    return { ...state, huguenotResurgenceCounter: nextCounter };
  }
  let s: GameState = { ...state, huguenotResurgenceCounter: 0 };
  s = addCardsToDeck(s, "suppressHuguenots", 1);
  s = enforceHuguenotContainmentInvariant(s);
  const refreshed = s.playerStatuses.find((p) => p.templateId === "huguenotContainment");
  const remainingStacks = refreshed?.turnsRemaining ?? containment.turnsRemaining + 1;
  s = appendActionLog(s, {
    kind: "huguenotResurgence",
    addedCount: 1,
    remainingStacks,
  });
  return s;
}

export function maybeAddEuropeAlertSupplementalEventHook(
  state: GameState,
  isStandaloneChapter2OpeningTurn: boolean,
): GameState {
  if (isStandaloneChapter2OpeningTurn) return state;
  if (!state.europeAlert || !getLevelDef(state.levelId).features.europeAlertMechanics) return state;
  let s = state;
  const [rngPrimary, uPrimary] = rngNext(s.rng);
  s = { ...s, rng: rngPrimary };
  const [rngSecondary, uSecondary] = rngNext(s.rng);
  s = { ...s, rng: rngSecondary };
  const totalToAdd = rollEuropeAlertSupplementalEventCount(state.europeAlertProgress, uPrimary, uSecondary);
  if (totalToAdd <= 0) return s;
  for (let i = 0; i < totalToAdd; i++) {
    const target = EVENT_SLOT_ORDER.find((slot) => !s.slots[slot]);
    if (!target) break;
    const [rngPick, uPick] = rngNext(s.rng);
    s = { ...s, rng: rngPick };
    const index = Math.min(
      EUROPE_ALERT_SUPPLEMENTAL_POOL.length - 1,
      Math.floor(uPick * EUROPE_ALERT_SUPPLEMENTAL_POOL.length),
    );
    const templateId = EUROPE_ALERT_SUPPLEMENTAL_POOL[index]!;
    const instance: EventInstance = {
      instanceId: `evt_${s.nextIds.event}`,
      templateId,
      resolved: false,
    };
    s = {
      ...s,
      nextIds: { ...s.nextIds, event: s.nextIds.event + 1 },
      slots: { ...s.slots, [target]: instance },
    };
  }
  return s;
}

export function maybeAddReligiousTensionEventHook(state: GameState): GameState {
  if (!state.playerStatuses.some((s) => s.templateId === "religiousTolerance")) return state;
  const alreadyOnBoard = EVENT_SLOT_ORDER.some((slot) => {
    const templateId = state.slots[slot]?.templateId;
    return templateId != null && RELIGIOUS_TENSION_EVENTS.includes(templateId);
  });
  if (alreadyOnBoard) return state;
  const target = EVENT_SLOT_ORDER.find((slot) => !state.slots[slot]);
  if (!target) return state;
  let s = state;
  const [rngRoll, uRoll] = rngNext(s.rng);
  s = { ...s, rng: rngRoll };
  let templateId: EventInstance["templateId"] | null = null;
  if (uRoll < RELIGIOUS_TENSION_BRANCH_PROBABILITY) {
    templateId = "jansenistTension";
  } else if (uRoll < RELIGIOUS_TENSION_BRANCH_PROBABILITY * 2) {
    templateId = "arminianTension";
  } else if (uRoll < RELIGIOUS_TENSION_BRANCH_PROBABILITY * 3) {
    templateId = "huguenotTension";
  }
  if (!templateId) return s;
  const instance: EventInstance = {
    instanceId: `evt_${s.nextIds.event}`,
    templateId,
    resolved: false,
  };
  return {
    ...s,
    nextIds: { ...s.nextIds, event: s.nextIds.event + 1 },
    slots: { ...s.slots, [target]: instance },
  };
}

export function syncAntiFrenchSentimentStatusHook(state: GameState): GameState {
  const active = antiFrenchSentimentActive(state);
  const hasStatus = state.playerStatuses.some((s) => s.templateId === "antiFrenchSentiment");
  if (active && !hasStatus) {
    const s = applyEffects(state, [{ kind: "addPlayerStatus", templateId: "antiFrenchSentiment", turns: 99 }]);
    return appendActionLog(s, { kind: "info", infoKey: "antiFrenchSentimentActivated" });
  }
  if (!active && hasStatus) {
    const s = {
      ...state,
      playerStatuses: state.playerStatuses.filter((s) => s.templateId !== "antiFrenchSentiment"),
    };
    return appendActionLog(s, { kind: "info", infoKey: "antiFrenchSentimentEnded" });
  }
  return state;
}

function hasHabsburgOpponentRow(state: GameState): boolean {
  return EVENT_SLOT_ORDER.some((slot) => state.slots[slot]?.templateId === "opponentHabsburg");
}

function sumCoreResources(state: GameState): number {
  return state.resources.treasuryStat + state.resources.power + state.resources.legitimacy;
}

/** How much opponent strength the current core-resource sum is worth (0 when below the first tier). */
export function greatPowerEncirclementTier(resourceSum: number): number {
  return GREAT_POWER_ENCIRCLEMENT_TIER_SUMS.filter((threshold) => resourceSum > threshold).length;
}

/**
 * Chapter 3 only: while the Habsburg rival row is on the board, a growing France provokes a
 * growing coalition. Core resources above 45 / 60 / 75 / 90 grant a permanent
 * "greatPowerEncirclement" status worth +1 / +2 / +3 / +4 Habsburg opponent strength.
 *
 * The ladder only climbs: spending back down below a threshold keeps the strength already
 * granted, so the player cannot dump resources before the opponent phase to weaken the rival.
 * Everything granted here is released when the rival row leaves the board (Utrecht).
 */
export function syncGreatPowerEncirclementStatusHook(state: GameState): GameState {
  if (state.levelId !== THIRD_MANDATE_LEVEL_ID) return state;
  const hasStatus = state.playerStatuses.some((s) => s.templateId === "greatPowerEncirclement");
  const opponentRowPresent = hasHabsburgOpponentRow(state);
  if (hasStatus && !opponentRowPresent) {
    return {
      ...state,
      playerStatuses: state.playerStatuses.filter((s) => s.templateId !== "greatPowerEncirclement"),
      greatPowerEncirclementStrengthApplied: 0,
    };
  }
  if (!opponentRowPresent) return state;

  const tier = greatPowerEncirclementTier(sumCoreResources(state));
  const applied = hasStatus ? state.greatPowerEncirclementStrengthApplied : 0;
  const topUp = tier - applied;
  if (topUp <= 0) return state;

  const effects: Effect[] = [];
  if (!hasStatus) {
    effects.push({ kind: "addPlayerStatus", templateId: "greatPowerEncirclement", turns: 99 });
  }
  effects.push({ kind: "modOpponentStrength", delta: topUp });
  const s = applyEffects(state, effects);
  return { ...s, greatPowerEncirclementStrengthApplied: tier };
}

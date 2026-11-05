import type { GameAction } from "../../../../app/gameReducer";
import { getCardTemplate } from "../../../../data/cards";
import { getLevelDef } from "../../../../data/levels";
import { getPlayableCardCost } from "../../../../logic/cardCost";
import { getHandCapForStatuses } from "../../../../logic/handCapacity";
import { retentionCapacity } from "../../../../logic/turnFlow";
import type { GameState } from "../../../../types/game";
import type { CardTemplateId } from "../../../types/card";
import { EVENT_SLOT_ORDER, type SlotId } from "../../../types/event";
import { isCardPlayableInActionPhase } from "../../logic/cardPlayability";
import { drawAttemptsFromPower } from "../../logic/drawScaling";
import { getEventSolveFundingAmount, getEventTemplate } from "../../logic/eventTemplateApi";
import { currentCalendarYear, findScriptedCalendarConfig } from "../../logic/scriptedCalendar";
import { cardPlayPriorityFirstMandate } from "../strategies/firstMandateStrategy";
import {
  type SecondMandateChoiceOptions,
  cardPlayPrioritySecondMandate,
  pickSecondMandateChoiceActions,
} from "../strategies/secondMandateStrategy";
import { cardPlayPriorityThirdMandate, pickThirdMandateChoiceActions } from "../strategies/thirdMandateStrategy";
import type { StrategyOptions } from "./reports";

// ---------------------------------------------------------------- policy constants

export const MAX_STEPS_PER_RUN = 4_000;

/** Same-calendar-year micro-steps before forcing `END_YEAR` (avoids pathological play-only loops). */
export const FORCE_END_YEAR_AFTER_SAME_TURN_STEPS = 1_200;
const RETENTION_PRIORITY_TEMPLATES: readonly CardTemplateId[] = [
  "funding",
  "crackdown",
  "diplomaticIntervention",
];
const RETENTION_PRIORITY_TEMPLATES_STRATEGY_I: readonly CardTemplateId[] = [
  "funding",
  "crackdown",
  "diplomaticIntervention",
  "bourbonMarriageProclamation",
  "grandAllianceInfiltrationDiplomacy",
  "italianTheaterTroopRedeploy",
  "grainRelief",
  "diplomaticCongress",
  "development",
  "reform",
  "ceremony",
  "taxRebalance",
  "jesuitCollege",
  "usurpationEdict",
];
export const LEGACY_STRATEGY_ID = "event-first-retain-royal-funding-and-intervention";
export const STRATEGY_I_ID = "a-strategy-i";

export type StrategyPolicyId = "legacy" | "a-strategy-i";

// ---------------------------------------------------------------- policy

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
    if (tmpl.crackdownImmune) continue;
    if (tmpl.harmful) return slot;
  }
  return null;
}

function pickFundSolveActionsLegacy(state: GameState): GameAction[] {
  const hasUnresolvedHarmful = unresolvedSlots(state).some((slot) => {
    const ev = state.slots[slot];
    return !!ev && !ev.resolved && getEventTemplate(ev.templateId).harmful;
  });
  const candidates: Array<{ slot: SlotId; harmful: boolean; amount: number; opportunity: boolean }> = [];
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown") continue;
    // Trade Opportunity converts 1 funding into +1 permanent treasury income —
    // the best compounding buy in chapter 1; never let it expire unsolved.
    const opportunity = ev.templateId === "tradeOpportunity";
    if (hasUnresolvedHarmful && !tmpl.harmful && !opportunity) continue;
    const amount = getEventSolveFundingAmount(state, ev.templateId);
    if (amount === null) continue;
    if (state.resources.funding < amount) continue;
    candidates.push({ slot, harmful: tmpl.harmful, amount, opportunity });
  }
  candidates.sort((a, b) => {
    if (a.opportunity !== b.opportunity) return a.opportunity ? -1 : 1;
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

function remainingCardUses(state: GameState, cardInstanceId: string): number | null {
  const usage = state.cardUsesById[cardInstanceId];
  if (!usage) return null;
  return usage.remaining;
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

function isTreasuryPressureEventTemplate(templateId: string): boolean {
  return (
    templateId === "versaillesExpenditure" ||
    templateId === "taxResistance" ||
    templateId === "frontierGarrisons" ||
    templateId === "embargoCoalition" ||
    templateId === "budgetStrain" ||
    templateId === "huguenotTension"
  );
}

/**
 * Chapter-3 events whose solves are worth funding even while harmful events
 * sit unresolved. The track-swing solves (Bavarian realignment: +1 on solve,
 * −1 if left; Portuguese tariffs: +1 track +1 treasury) are the cheapest
 * succession pushes in the chapter — 2 funding for a 1–2 point swing beats a
 * 3-cost succession card.
 */
function isThirdMandateValueSolveTemplate(templateId: string): boolean {
  return (
    templateId === "bavarianCourtRealignment" ||
    templateId === "portugueseTariffNegotiation" ||
    templateId === "commercialExpansion" ||
    templateId === "sunKingPilgrimage"
  );
}


function strategyISolvePriority(state: GameState, slot: SlotId, amount: number): number {
  const ev = state.slots[slot];
  if (!ev) return 1_000_000;
  const id = ev.templateId;
  const power = state.resources.power;
  const treasury = state.resources.treasuryStat;
  if (state.levelId === "thirdMandate") {
    if (id === "bavarianCourtRealignment") return -29_000 + amount;
    if (id === "portugueseTariffNegotiation") return -28_600 + amount;
    if (id === "localizedSuccessionWar") return -27_600 + amount;
    if (id === "imperialElectorsMood") return -27_400 + amount;
    if (id === "commercialExpansion" && treasury < 14) return -26_800 + amount;
    if (id === "sunKingPilgrimage" && state.resources.legitimacy <= 5) {
      // +2 legitimacy is the strongest recovery in the chapter when near the floor.
      return -27_800 + amount;
    }
    if (id === "sunKingPilgrimage" && (power <= 8 || state.resources.legitimacy <= 8)) {
      return -24_800 + amount;
    }
  }
  const prioritizeTreasury = (state.levelId === "firstMandate" || state.levelId === "secondMandate") && treasury <= 7;
  const ch2TreasurySprint = state.levelId === "secondMandate" && treasury >= 10 && power >= 8 && state.resources.legitimacy >= 8;
  if (id === "ryswickPeace") return -30_000 + amount;
  if (id === "versaillesExpenditure") {
    return (prioritizeTreasury ? -30_500 : -28_000) + amount;
  }
  if (ch2TreasurySprint && id === "commercialExpansion") return -29_700 + amount;
  if (id === "mercenaryRaiders") return -27_800 + amount;
  if (id === "taxResistance") return (prioritizeTreasury ? -29_800 : -27_500) + amount;
  if (id === "nobleResentment") return -27_250 + amount;
  if (id === "frontierGarrisons") return (prioritizeTreasury ? -29_500 : -27_000) + amount;
  if (id === "warWeariness") return -26_500 + amount;
  if (id === "risingGrainPrices") return -26_000 + amount;
  if (id === "courtScandal") return -25_500 + amount;
  if (id === "provincialNoncompliance") return -25_000 + amount;
  if (id === "nymwegenSettlement") {
    // Nijmegen solve trades away power immediately; delay it when power is already fragile.
    if (power <= 4) return -21_000 + amount;
    return -24_000 + amount;
  }
  if (id === "leagueOfAugsburg" || id === "nineYearsWar") return -23_000 + amount;
  if (prioritizeTreasury && isTreasuryPressureEventTemplate(id)) return -24_500 + amount;
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

/**
 * Chapter-3 wartime funding reserve: while the Habsburg rival is active the
 * bot keeps enough funding to play one succession-contest card from hand, so
 * ordinary solves cannot starve the track defense. Critical solves (very
 * negative priority) still bypass the reserve, mirroring the huguenot rule.
 */
const SUCCESSION_RESERVE_OVERRIDE_PRIORITY = -27_000;

function successionFundingReserve(state: GameState): number {
  if (state.levelId !== "thirdMandate") return 0;
  if (!state.opponentHabsburgUnlocked || state.warEnded) return 0;
  // Reserve only while the track actually needs pushing; with a comfortable
  // lead the funding is better spent on solves and legitimacy upkeep.
  if (state.successionTrack >= 6) return 0;
  if (state.resources.legitimacy <= 3) return 0;
  const costs: number[] = [];
  for (const id of state.hand) {
    const inst = state.cardsById[id];
    if (!inst) continue;
    if (!getCardTemplate(inst.templateId).tags.includes("successionContest")) continue;
    if (!isCardPlayableInActionPhase(state, id)) continue;
    costs.push(getPlayableCardCost(state, id));
  }
  if (costs.length === 0) return 0;
  costs.sort((a, b) => a - b);
  // With a healthy income, hold back enough for two track pushes per year.
  const holdCount = state.resources.treasuryStat >= 7 ? Math.min(2, costs.length) : 1;
  return costs.slice(0, holdCount).reduce((sum, c) => sum + c, 0);
}

function pickFundSolveActionsStrategyI(state: GameState): GameAction[] {
  const hasUnresolvedHarmful = hasUnresolvedHarmfulEvents(state);
  const hasJansenistOnBoard = !!firstUnresolvedSlotByTemplate(state, "jansenistTension");
  const hasContainment = state.playerStatuses.some((s) => s.templateId === "huguenotContainment");
  const hasSuppressInHand = state.hand.some((id) => state.cardsById[id]?.templateId === "suppressHuguenots");
  const reserveBuffer = hasContainment && hasSuppressInHand ? HUGUENOT_SUPPRESS_FUNDING_RESERVE : 0;
  const successionReserve = successionFundingReserve(state);
  const candidates: Array<{ slot: SlotId; amount: number; priority: number }> = [];
  for (const slot of EVENT_SLOT_ORDER) {
    const ev = state.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    if (tmpl.solve.kind !== "funding" && tmpl.solve.kind !== "fundingOrCrackdown") continue;
    const keepEvenUnderPressure =
      isCriticalOpportunityEventTemplate(ev.templateId) ||
      (state.levelId === "thirdMandate" && isThirdMandateValueSolveTemplate(ev.templateId));
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
    // Chapter-3 wartime reserve: keep one succession-contest play affordable.
    if (
      successionReserve > 0 &&
      priority > SUCCESSION_RESERVE_OVERRIDE_PRIORITY &&
      state.resources.funding - amount < successionReserve
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

function firstPlayableHandIndexByTemplates(
  state: GameState,
  templates: readonly CardTemplateId[],
): { handIndex: number; cost: number; template: CardTemplateId } | null {
  for (const template of templates) {
    for (let i = 0; i < state.hand.length; i++) {
      const id = state.hand[i];
      if (!id) continue;
      const inst = state.cardsById[id];
      if (!inst || inst.templateId !== template) continue;
      if (!isCardPlayableInActionPhase(state, id)) continue;
      const cost = getPlayableCardCost(state, id);
      if (state.resources.funding < cost) continue;
      return { handIndex: i, cost, template };
    }
  }
  return null;
}

function secondMandateGatedVictoryReadyForSim(state: GameState): boolean {
  if (state.levelId !== "secondMandate") return false;
  const vr = getLevelDef("secondMandate").victoryRule;
  if (vr.kind !== "gated") return false;
  if (currentCalendarYear(state) < vr.earliestCalendarYear) return false;
  if (state.europeAlert) return false;
  if (state.playerStatuses.some((s) => s.templateId === "huguenotContainment")) return false;
  return state.resources.legitimacy >= vr.minLegitimacy;
}

function pickSecondMandateEconomyPreSolveActions(state: GameState): GameAction[] {
  if (state.levelId !== "secondMandate") return [];
  if (hasUnresolvedHarmfulEvents(state)) return [];
  const year = currentCalendarYear(state);
  const vr = getLevelDef("secondMandate").victoryRule;
  const unresolvedRyswick = !!firstUnresolvedSlotByTemplate(state, "ryswickPeace");
  const canTreasurySprintTo15 =
    vr.kind === "gated" &&
    secondMandateGatedVictoryReadyForSim(state) &&
    year <= vr.earliestCalendarYear + 3 &&
    !unresolvedRyswick &&
    state.resources.treasuryStat < 15 &&
    state.resources.power >= 6 &&
    state.resources.legitimacy >= 8;
  if (year >= 1693 && !canTreasurySprintTo15) return [];
  const targets: CardTemplateId[] = [];
  if (canTreasurySprintTo15) {
    targets.push("development", "taxRebalance");
  }
  if (state.resources.treasuryStat <= 8) {
    targets.push("development", "taxRebalance");
  }
  if (state.resources.power <= 5) {
    targets.push("reform", "diplomaticCongress");
  }
  if (state.resources.legitimacy <= 7) {
    targets.push("ceremony", "grainRelief");
  }
  if (targets.length === 0) return [];
  const picked = firstPlayableHandIndexByTemplates(state, targets);
  if (!picked) return [];
  if (state.resources.funding - picked.cost < 2) {
    return [];
  }
  return [{ type: "PLAY_CARD", handIndex: picked.handIndex }];
}

/**
 * Succession-contest cards played *before* solves drain funding. While the
 * Habsburg rival is active, the succession track slides ~1–2 per year from
 * opponent plays alone, so the bot must reliably convert funding into track
 * pushes every year — waiting until the track is nearly lost (the old −6
 * trigger) loses carryover runs that enter chapter 3 with a weak economy.
 */
function thirdMandateSuccessionPlayOrder(state: GameState): CardTemplateId[] {
  const order: CardTemplateId[] = [];
  // Infiltration first when the rival has budget to burn: it cuts this year's
  // opponent budget by 1 on top of +1 track and a replacement draw.
  if (state.opponentStrength >= 3) order.push("grandAllianceInfiltrationDiplomacy");
  if (state.successionTrack <= 0) order.push("italianTheaterTroopRedeploy");
  order.push("bourbonMarriageProclamation", "grandAllianceInfiltrationDiplomacy");
  // Usurpation's legitimacyCrisis status bleeds 1 legitimacy per year for two
  // years; only safe with a solid buffer and never while one is already active.
  const hasLegitimacyCrisis = state.playerStatuses.some((st) => st.templateId === "legitimacyCrisis");
  const usurpationLegitimacyFloor = state.successionTrack <= -6 ? 5 : 6;
  if (state.resources.legitimacy >= usurpationLegitimacyFloor && !hasLegitimacyCrisis) {
    order.push("usurpationEdict");
  }
  order.push("italianTheaterTroopRedeploy");
  return order;
}

function pickThirdMandateMomentumPreSolveActions(state: GameState): GameAction[] {
  if (state.levelId !== "thirdMandate") return [];
  if (!state.opponentHabsburgUnlocked || state.warEnded) return [];
  if (firstUnresolvedSlotByTemplate(state, "utrechtTreaty")) return [];
  if (state.successionTrack >= 9) return [];
  // Legitimacy near the floor kills faster than the track: recover it first.
  if (state.resources.legitimacy <= 3) return [];
  const picked = firstPlayableHandIndexByTemplates(state, thirdMandateSuccessionPlayOrder(state));
  if (!picked) return [];
  const danger = state.successionTrack <= 0;
  if (!danger) {
    // Track not in immediate danger: only pre-empt solves when the cheapest
    // harmful solve still fits into the remaining funding afterwards.
    const minHarmfulSolve = minFundingSolveAmount(state, (_templateId, harmful) => harmful);
    if (minHarmfulSolve !== null && state.resources.funding - picked.cost < minHarmfulSolve) {
      return [];
    }
  }
  return [{ type: "PLAY_CARD", handIndex: picked.handIndex }];
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
  return cardPlayPriorityFirstMandate(state, cardInstanceId);
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
  const nearDeadline = state.levelId === "secondMandate" && currentCalendarYear(state) >= 1693;

  if (
    tmpl === "fiscalBurden" ||
    tmpl === "religiousTensionCard" ||
    tmpl === "jansenistReservation" ||
    tmpl === "antiFrenchContainment"
  ) {
    const selfCost = getPlayableCardCost(state, cardInstanceId);
    // Consume-on-play dead cards: burning one permanently thins the deck AND
    // frees a hand slot. Hand slots matter because year-start draws stop at
    // the hand cap — a hand clogged with junk starves the run of new cards.
    const handCapNow = getHandCapForStatuses(state.playerStatuses);
    const drawStarved = state.hand.length >= handCapNow - 2;
    if (drawStarved && state.resources.funding >= selfCost) return 6;
    if (state.resources.funding - selfCost >= 3) {
      return tmpl === "fiscalBurden" ? 11 : 12;
    }
    // Leftover funding is wiped at END_YEAR; spend it on thinning when the
    // hand is even moderately crowded.
    if (state.hand.length >= handCapNow - 4 && state.resources.funding >= selfCost) return 13;
    return 10_000;
  }
  if (state.levelId === "secondMandate") {
    return cardPlayPrioritySecondMandate(state, cardInstanceId, {
      unresolvedHarmful,
      unresolvedRyswickPeace,
      unresolvedRisingGrain,
      hasContainmentStatus,
      canFundingUnlockHarmfulSolve,
      canFundingUnlockRyswick,
      nearDeadline,
    });
  }
  if (state.levelId === "thirdMandate") {
    return cardPlayPriorityThirdMandate(state, cardInstanceId, {
      unresolvedHarmful,
      unresolvedRisingGrain,
      hasContainmentStatus,
      canFundingUnlockHarmfulSolve,
    });
  }
  return cardPlayPriorityLegacy(state, cardInstanceId);
}

function pickCardPlayActions(state: GameState, policy: StrategyPolicyId): GameAction[] {
  const ranked: Array<{ handIndex: number; priority: number; cost: number }> = [];
  const unresolvedHarmful = hasUnresolvedHarmfulEvents(state);
  const crackdownTargetAvailable = pickCrackdownTarget(state) !== null;
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
    if ((template === "crackdown" || template === "diplomaticIntervention") && !crackdownTargetAvailable) {
      continue;
    }
    if (policy === "a-strategy-i" && template === "crackdown") {
      const remaining = remainingCardUses(state, id);
      if (remaining === 1 && state.resources.power <= 5) {
        // Preserve the final crackdown charge to avoid depletion-driven power collapse.
        continue;
      }
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
  const win = getLevelDef(state.levelId).winTargets;
  const keepWeight = (templateId: CardTemplateId): number => {
    // A stat-builder for a still-missing win target beats generic utility:
    // it is the card we must play soon, and re-drawing it is not guaranteed.
    if (templateId === "development" && state.resources.treasuryStat < win.treasuryStat) return 2;
    if (templateId === "reform" && state.resources.power < win.power) return 2;
    if (templateId === "ceremony" && state.resources.legitimacy < win.legitimacy) return 2;
    return RETENTION_PRIORITY_TEMPLATES.includes(templateId) ? 1 : 0;
  };
  const ranked = [...state.hand].sort((a, b) => {
    const ia = state.cardsById[a];
    const ib = state.cardsById[b];
    if (!ia || !ib) return a.localeCompare(b);
    const ta = ia.templateId;
    const tb = ib.templateId;
    const pa = keepWeight(ta);
    const pb = keepWeight(tb);
    if (pa !== pb) return pb - pa;
    const ca = getCardTemplate(ta).cost;
    const cb = getCardTemplate(tb).cost;
    if (ca !== cb) return ca - cb;
    return a.localeCompare(b);
  });
  return ranked.slice(0, capacity);
}

/** Dead-weight templates never worth a retention slot (burnable consumables). */
const RETENTION_JUNK_TEMPLATES: ReadonlySet<CardTemplateId> = new Set<CardTemplateId>([
  "fiscalBurden",
  "religiousTensionCard",
  "jansenistReservation",
  "antiFrenchContainment",
]);

function retentionKeepWeight(templateId: CardTemplateId): number {
  // Succession-contest cards are the chapter-3 win condition; always keep.
  if (getCardTemplate(templateId).tags.includes("successionContest")) return 2;
  return RETENTION_PRIORITY_TEMPLATES_STRATEGY_I.includes(templateId) ? 1 : 0;
}

/**
 * Retention that respects the hand cap: the previous policy kept everything
 * (capacity = legitimacy, usually above the 12-card hand cap), so hands filled
 * with dead cards and the year-start draw was blocked entirely — succession
 * cards then never surfaced from the deck. Keep only useful cards and always
 * leave room for a full year-start draw.
 */
function pickRetentionIdsForStrategyI(state: GameState): readonly string[] {
  const capacity = retentionCapacity(state);
  if (capacity <= 0 || state.hand.length === 0) return [];
  const hasContainment = state.playerStatuses.some((st) => st.templateId === "huguenotContainment");
  const keepable = state.hand.filter((id) => {
    const inst = state.cardsById[id];
    if (!inst) return false;
    const t = inst.templateId;
    if (RETENTION_JUNK_TEMPLATES.has(t)) return false;
    if (t === "suppressHuguenots" && !hasContainment) return false;
    const uses = state.cardUsesById[id];
    if (uses && uses.remaining <= 0) return false;
    return true;
  });
  const ranked = keepable.sort((a, b) => {
    const ia = state.cardsById[a];
    const ib = state.cardsById[b];
    if (!ia || !ib) return a.localeCompare(b);
    const ta = ia.templateId;
    const tb = ib.templateId;
    const pa = retentionKeepWeight(ta);
    const pb = retentionKeepWeight(tb);
    if (pa !== pb) return pb - pa;
    const ca = getCardTemplate(ta).cost;
    const cb = getCardTemplate(tb).cost;
    if (ca !== cb) return ca - cb;
    return a.localeCompare(b);
  });
  const drawRoom = Math.max(3, drawAttemptsFromPower(state.resources.power));
  const keepCap = Math.max(0, Math.min(capacity, getHandCapForStatuses(state.playerStatuses) - drawRoom));
  return ranked.slice(0, keepCap);
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
const BURNABLE_JUNK_TEMPLATES: readonly CardTemplateId[] = [
  "fiscalBurden",
  "religiousTensionCard",
  "jansenistReservation",
  "antiFrenchContainment",
];

/**
 * Draw-deadlock breaker: when the hand sits at the hand cap, year-start draws
 * are fully blocked and the run can freeze (junk in hand, no new cards, all
 * funding eaten by solves every year). Burning a consume-on-play junk card
 * before solves reopens the draw flow — worth more than one mid-tier solve.
 */
function pickHandUnclogPreSolveActions(state: GameState): GameAction[] {
  const handCapNow = getHandCapForStatuses(state.playerStatuses);
  if (state.hand.length < handCapNow - 1) return [];
  const picked = firstPlayableHandIndexByTemplates(state, BURNABLE_JUNK_TEMPLATES);
  if (!picked) return [];
  return [{ type: "PLAY_CARD", handIndex: picked.handIndex }];
}

/**
 * Chapter-3 funding triage: a crackdown play clears a harmful event for 1
 * funding where the funding solve costs 3–6. When income cannot cover both
 * the harmful solves and a succession-contest play, spend the crackdown
 * charge first and save the funding for the track.
 */
function pickThirdMandateCrackdownPreSolveActions(state: GameState): GameAction[] {
  if (state.levelId !== "thirdMandate" && state.levelId !== "secondMandate") return [];
  if (state.levelId === "thirdMandate" && (!state.opponentHabsburgUnlocked || state.warEnded)) return [];
  if (!hasUnresolvedHarmfulEvents(state)) return [];
  if (pickCrackdownTarget(state) === null) return [];
  const minHarmfulSolve = minFundingSolveAmount(state, (_templateId, harmful) => harmful);
  if (minHarmfulSolve === null) return [];
  const reserve = successionFundingReserve(state);
  if (state.resources.funding >= minHarmfulSolve + reserve) return [];
  const picked = firstPlayableHandIndexByTemplates(state, ["crackdown", "diplomaticIntervention"]);
  if (!picked) return [];
  return [{ type: "PLAY_CARD", handIndex: picked.handIndex }];
}

function pickEssentialPreSolveActionsStrategyI(state: GameState): GameAction[] {
  const unclog = pickHandUnclogPreSolveActions(state);
  if (unclog.length > 0) return unclog;
  const crackdownTriage = pickThirdMandateCrackdownPreSolveActions(state);
  if (crackdownTriage.length > 0) return crackdownTriage;
  const thirdMomentum = pickThirdMandateMomentumPreSolveActions(state);
  if (thirdMomentum.length > 0) return thirdMomentum;
  const economy = pickSecondMandateEconomyPreSolveActions(state);
  if (economy.length > 0) return economy;
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
  if (state.levelId === "thirdMandate") {
    const ch3 = pickThirdMandateChoiceActions(state);
    if (ch3.length > 0) return ch3;
    return [];
  }
  if (state.levelId === "secondMandate") {
    return pickSecondMandateChoiceActions(state, options as SecondMandateChoiceOptions);
  }
  return [];
}

export function chooseActions(
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

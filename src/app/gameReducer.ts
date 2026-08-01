import { getCardTemplate } from "../data/cards";
import { getChapter2StandaloneDraft, getChapter3StandaloneDraft } from "../data/levelBootstrap";
import type { LevelId } from "../data/levels";
import { appendActionLog } from "../logic/actionLog";
import { enforceLegitimacy } from "../logic/applyEffects";
import { isCardPlayableInActionPhase } from "../logic/cardPlayability";
import { hasCardTag } from "../logic/cardTags";
import { appendInflationActivationLogIfNeeded, getPlayableCardCost } from "../logic/cardCost";
import { normalizeGameState } from "../logic/normalizeGameState";
import { applyPlayedCardEffects } from "../logic/resolveCard";
import { resolveEndOfYearPenalties } from "../logic/resolveEvents";
import { opponentEndYearPlayPhase } from "../logic/opponentHabsburg";
import { beginYear, evaluateTimeDefeat, evaluateVictory, retentionCapacity } from "../logic/turnFlow";
import type { GameState } from "../types/game";
import type { LogInfoKey } from "../types/game";
import {
  applyAntiFrenchContainmentDeckAfterRetentionYear,
  applyCampaignConsumeInvariant,
  applyCampaignEndYearResourceReset,
  applyCampaignPlayCardExtras,
  maybeAppendHuguenotContainmentClearedLog,
  maybeBeginCampaignCardPlayInteraction,
} from "../levels/campaignLogicBundle";
import { tryCampaignReducerBridge } from "../levels/campaignReducerBridge";
import { createInitialState } from "./initialState";
import { buildLevel2StateFromDraft, buildLevel3StateFromDraft } from "./levelTransitions";
import {
  consumeLimitedUseCard,
  isPlayingActionPhaseWithoutPendingInteraction,
  isTemporaryCardInstance,
  purgeExtraCardsIfLevelEnded,
  pushDiscard,
  removeHand,
} from "./reducerShared";

/**
 * Campaign packs merge their reducer actions (keyed by `type`) into this registry via
 * `declare module`; the campaign reducer bridge handles them before the engine switch runs.
 */
export interface CampaignGameActionRegistry {}

export type GameAction =
  | { type: "NEW_GAME"; seed?: number; levelId?: LevelId }
  | { type: "HYDRATE"; state: GameState }
  | { type: "PLAY_CARD"; handIndex: number }
  | { type: "END_YEAR" }
  | { type: "APPEND_LOG_INFO"; infoKey: LogInfoKey }
  | { type: "CONFIRM_RETENTION"; keepIds: readonly string[] }
  | CampaignGameActionRegistry[keyof CampaignGameActionRegistry];

/** After funding is cleared: keep chosen cards, discard the rest, then EOY penalties, then win / time / next year. */
function completeYearAfterRetention(state: GameState, keepIds: readonly string[]): GameState {
  const retainedIds = keepIds.filter((id) => !isTemporaryCardInstance(state, id));
  const keep = new Set(retainedIds);
  const discardIds = state.hand.filter((id) => !keep.has(id) && !isTemporaryCardInstance(state, id));
  let s: GameState = {
    ...state,
    hand: [...retainedIds],
    discard: [...state.discard, ...discardIds],
    phase: "action",
  };
  s = applyAntiFrenchContainmentDeckAfterRetentionYear(s);
  s = resolveEndOfYearPenalties(s);
  if (s.outcome !== "playing") return purgeExtraCardsIfLevelEnded(s);
  s = opponentEndYearPlayPhase(s);
  if (s.outcome !== "playing") return purgeExtraCardsIfLevelEnded(s);
  s = evaluateVictory(s);
  if (s.outcome === "victory") return purgeExtraCardsIfLevelEnded(s);
  s = evaluateTimeDefeat(s);
  if (s.outcome === "defeatTime") return purgeExtraCardsIfLevelEnded(s);
  s = { ...s, turn: s.turn + 1 };
  s = beginYear(s);
  return s;
}

function handlePlayCard(state: GameState, action: Extract<GameAction, { type: "PLAY_CARD" }>): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
    return state;
  }
  const id = state.hand[action.handIndex];
  if (!id) return state;
  const inst = state.cardsById[id];
  if (!inst) return state;
  if (!isCardPlayableInActionPhase(state, id)) return state;
  const tmpl = getCardTemplate(inst.templateId);
  const cost = getPlayableCardCost(state, id);
  if (state.resources.funding < cost) return state;
  const paid = {
    ...state,
    resources: { ...state.resources, funding: state.resources.funding - cost },
  };
  const interaction = maybeBeginCampaignCardPlayInteraction(paid, inst.templateId, id, cost);
  if (interaction) return interaction;
  if (hasCardTag(paid, id, "consume")) {
    let s: GameState = removeHand(paid, id);
    s = applyCampaignConsumeInvariant(s, inst.templateId);
    s = appendActionLog(s, {
      kind: "cardPlayed",
      templateId: inst.templateId,
      fundingCost: cost,
      effects: tmpl.effects,
    });
    s = maybeAppendHuguenotContainmentClearedLog(paid, s, inst.templateId);
    return s;
  }
  let s = applyPlayedCardEffects(paid, inst.templateId);
  s = applyCampaignPlayCardExtras(s, inst.templateId);
  s = removeHand(s, id);
  const consumed = consumeLimitedUseCard(s, id);
  s = consumed.state;
  if (!consumed.exhausted) {
    s = pushDiscard(s, id);
  }
  s = enforceLegitimacy(s);
  s = appendActionLog(s, {
    kind: "cardPlayed",
    templateId: inst.templateId,
    fundingCost: cost,
    effects: tmpl.effects,
  });
  return appendInflationActivationLogIfNeeded(state, s);
}

function handleEndYear(state: GameState): GameState {
  if (!isPlayingActionPhaseWithoutPendingInteraction(state)) {
    return state;
  }
  let s = enforceLegitimacy(state);
  if (s.outcome !== "playing") {
    return purgeExtraCardsIfLevelEnded(s);
  }
  s = applyCampaignEndYearResourceReset(s);
  s = evaluateVictory(s);
  if (s.outcome === "victory") {
    return appendInflationActivationLogIfNeeded(state, purgeExtraCardsIfLevelEnded(s));
  }
  const cap = retentionCapacity(s);
  if (s.hand.length <= cap) {
    return appendInflationActivationLogIfNeeded(state, completeYearAfterRetention(s, s.hand));
  }
  return appendInflationActivationLogIfNeeded(state, { ...s, phase: "retention" });
}

function handleConfirmRetention(
  state: GameState,
  action: Extract<GameAction, { type: "CONFIRM_RETENTION" }>,
): GameState {
  if (state.outcome !== "playing" || state.phase !== "retention") return state;
  const keep = new Set(action.keepIds);
  if (keep.size !== action.keepIds.length) return state;
  for (const id of action.keepIds) {
    if (!state.hand.includes(id)) return state;
  }
  if (action.keepIds.length > retentionCapacity(state)) return state;
  return appendInflationActivationLogIfNeeded(state, completeYearAfterRetention(state, action.keepIds));
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const bridged = tryCampaignReducerBridge(state, action);
  if (bridged) return bridged;
  switch (action.type) {
    case "HYDRATE":
      return normalizeGameState(action.state);
    case "NEW_GAME": {
      const nextLevelId = action.levelId ?? state.levelId;
      const chapter2Draft = getChapter2StandaloneDraft(nextLevelId, action.seed);
      if (chapter2Draft) {
        return buildLevel2StateFromDraft(chapter2Draft);
      }
      const chapter3Draft = getChapter3StandaloneDraft(nextLevelId, action.seed);
      if (chapter3Draft) {
        return buildLevel3StateFromDraft(chapter3Draft);
      }
      return createInitialState(action.seed, nextLevelId);
    }
    case "APPEND_LOG_INFO":
      return appendActionLog(state, { kind: "info", infoKey: action.infoKey });
    case "PLAY_CARD":
      return handlePlayCard(state, action);
    case "END_YEAR":
      return handleEndYear(state);
    case "CONFIRM_RETENTION":
      return handleConfirmRetention(state, action);
    default:
      // Campaign-registered actions are handled (or intentionally ignored) by the bridge above.
      return state;
  }
}

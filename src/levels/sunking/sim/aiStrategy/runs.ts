import { gameReducer } from "../../../../app/gameReducer";
import { createInitialState } from "../../../../app/initialState";
import type { GameOutcome, GameState, Resources } from "../../../../types/game";
import {
  buildLevel2StateFromDraft,
  buildLevel3StateFromDraft,
  createContinuityLevel2Draft,
  createContinuityLevel3Draft,
  createStandaloneLevel2Draft,
  createStandaloneLevel3Draft,
} from "../../chapterTransitions";
import { FORCE_END_YEAR_AFTER_SAME_TURN_STEPS, MAX_STEPS_PER_RUN, type StrategyPolicyId, chooseActions } from "./policy";
import { withAutoInflationRefit, withChapter3DeckThinningRefit } from "./refit";
import {
  type CampaignRunResult,
  type SecondToThirdCampaignRunResult,
  type StrategyOptions,
  type StrategyRunResult,
  type ThreeChapterCampaignRunResult,
  classifyThirdMandateEndState,
} from "./reports";

// ---------------------------------------------------------------- runs

function runStrategyStep(
  state: GameState,
  policy: StrategyPolicyId,
  options: StrategyOptions = {},
  opts?: { forceEndYear?: boolean },
): GameState {
  if (
    opts?.forceEndYear &&
    state.levelId === "thirdMandate" &&
    state.phase === "action" &&
    state.outcome === "playing" &&
    !state.pendingInteraction
  ) {
    const forced = gameReducer(state, { type: "END_YEAR" });
    if (forced !== state) return forced;
  }
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
  let lastProgressTurn = state.turn;
  let stepsSinceTurnAdvance = 0;
  for (let i = 0; i < MAX_STEPS_PER_RUN; i++) {
    if (state.outcome !== "playing") {
      return state;
    }
    const forceEndYear =
      state.levelId === "thirdMandate" && stepsSinceTurnAdvance >= FORCE_END_YEAR_AFTER_SAME_TURN_STEPS;
    const next = runStrategyStep(state, policy, options, forceEndYear ? { forceEndYear: true } : undefined);
    if (next === state) {
      throw new Error(`strategy got stuck at ${label}, seed=${seed}, turn=${state.turn}, phase=${state.phase}`);
    }
    state = next;
    if (state.turn !== lastProgressTurn) {
      lastProgressTurn = state.turn;
      stepsSinceTurnAdvance = 0;
    } else {
      stepsSinceTurnAdvance += 1;
    }
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

export function simulateThirdMandateStandaloneEndState(
  seed: number,
  options: StrategyOptions = {},
): GameState {
  const draft = createStandaloneLevel3Draft(seed);
  const initialState = buildLevel3StateFromDraft(draft);
  return simulateEndStateWithPolicy(initialState, "a-strategy-i", seed, "thirdMandateStandalone", options);
}

export function simulateThirdMandateStandaloneRun(
  seed: number,
  options: StrategyOptions = {},
): StrategyRunResult {
  const state = simulateThirdMandateStandaloneEndState(seed, options);
  return {
    seed,
    outcome: state.outcome,
    endTurn: state.turn,
    endingResources: { ...state.resources },
  };
}

function campaignSecondStageSeed(seed: number): number {
  return ((seed * 1_664_525 + 1_013_904_223) >>> 0) || 0x9e3779b9;
}

function campaignThirdStageSeed(seed2: number): number {
  return ((seed2 * 2_742_633 + 2_061_585_601) >>> 0) || 0x9e3779b9;
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
  const draft = withAutoInflationRefit(createContinuityLevel2Draft(firstEndState, seed2));
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
    secondEndResources: { ...secondEndState.resources },
  };
}

function simulateFirstToThirdCampaignPhaseStates(
  seed: number,
  options: StrategyOptions = {},
): {
  firstOutcome: GameOutcome;
  firstEndTurn: number;
  secondOutcome: GameOutcome | null;
  secondEndTurn: number | null;
  secondEndResources: Resources | null;
  thirdEndState: GameState | null;
} {
  const firstEndState = simulateEndStateWithPolicy(
    createInitialState(seed, "firstMandate"),
    "legacy",
    seed,
    "campaign:firstMandate",
  );
  if (firstEndState.outcome !== "victory") {
    return {
      firstOutcome: firstEndState.outcome,
      firstEndTurn: firstEndState.turn,
      secondOutcome: null,
      secondEndTurn: null,
      secondEndResources: null,
      thirdEndState: null,
    };
  }
  const seed2 = campaignSecondStageSeed(seed);
  const draft2 = withAutoInflationRefit(createContinuityLevel2Draft(firstEndState, seed2));
  const secondStartState = buildLevel2StateFromDraft(draft2);
  const secondEndState = simulateEndStateWithPolicy(
    secondStartState,
    "a-strategy-i",
    seed2,
    "campaign:secondMandate",
    options,
  );
  if (secondEndState.outcome !== "victory") {
    return {
      firstOutcome: firstEndState.outcome,
      firstEndTurn: firstEndState.turn,
      secondOutcome: secondEndState.outcome,
      secondEndTurn: secondEndState.turn,
      secondEndResources: { ...secondEndState.resources },
      thirdEndState: null,
    };
  }
  const seed3 = campaignThirdStageSeed(seed2);
  const draft3 = withChapter3DeckThinningRefit(createContinuityLevel3Draft(secondEndState, seed3));
  const thirdStartState = buildLevel3StateFromDraft(draft3);
  const thirdEndState = simulateEndStateWithPolicy(
    thirdStartState,
    "a-strategy-i",
    seed3,
    "campaign:thirdMandate",
    options,
  );
  return {
    firstOutcome: firstEndState.outcome,
    firstEndTurn: firstEndState.turn,
    secondOutcome: secondEndState.outcome,
    secondEndTurn: secondEndState.turn,
    secondEndResources: { ...secondEndState.resources },
    thirdEndState,
  };
}

export function simulateFirstToThirdCampaignRun(
  seed: number,
  options: StrategyOptions = {},
): ThreeChapterCampaignRunResult {
  const p = simulateFirstToThirdCampaignPhaseStates(seed, options);
  return {
    seed,
    firstOutcome: p.firstOutcome,
    firstEndTurn: p.firstEndTurn,
    secondOutcome: p.secondOutcome,
    secondEndTurn: p.secondEndTurn,
    secondEndResources: p.secondEndResources,
    thirdOutcome: p.thirdEndState?.outcome ?? null,
    thirdEndTurn: p.thirdEndState?.turn ?? null,
    thirdTerminalKind: p.thirdEndState ? classifyThirdMandateEndState(p.thirdEndState) : null,
  };
}

export function simulateSecondToThirdCampaignRun(
  seed: number,
  options: StrategyOptions = {},
): SecondToThirdCampaignRunResult {
  const draft2 = createStandaloneLevel2Draft(seed);
  const secondStartState = buildLevel2StateFromDraft(draft2);
  const secondEndState = simulateEndStateWithPolicy(
    secondStartState,
    "a-strategy-i",
    seed,
    "campaign:secondMandateStandalone",
    options,
  );
  if (secondEndState.outcome !== "victory") {
    return {
      seed,
      secondOutcome: secondEndState.outcome,
      secondEndTurn: secondEndState.turn,
      thirdOutcome: null,
      thirdEndTurn: null,
      thirdTerminalKind: null,
    };
  }
  const seed3 = campaignThirdStageSeed(seed);
  const draft3 = withChapter3DeckThinningRefit(createContinuityLevel3Draft(secondEndState, seed3));
  const thirdStartState = buildLevel3StateFromDraft(draft3);
  const thirdEndState = simulateEndStateWithPolicy(
    thirdStartState,
    "a-strategy-i",
    seed3,
    "campaign:thirdMandate",
    options,
  );
  return {
    seed,
    secondOutcome: secondEndState.outcome,
    secondEndTurn: secondEndState.turn,
    thirdOutcome: thirdEndState.outcome,
    thirdEndTurn: thirdEndState.turn,
    thirdTerminalKind: classifyThirdMandateEndState(thirdEndState),
  };
}

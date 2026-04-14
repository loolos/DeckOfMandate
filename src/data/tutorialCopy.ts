/** English-only copy for the level-entry UI tutorial (see LevelTutorialOverlay). */

export const TUTORIAL_TARGET_IDS = {
  targets: "tutorial-targets",
  resources: "tutorial-resources",
  events: "tutorial-events",
  hand: "tutorial-hand",
} as const;

export type LevelTutorialStep = {
  targetId: string;
  body: string;
};

export const LEVEL_TUTORIAL_STEPS: readonly LevelTutorialStep[] = [
  {
    targetId: TUTORIAL_TARGET_IDS.targets,
    body:
      "These are your level goals: reach the listed Treasury, Power, and Legitimacy before the turn limit. The banner shows the current year and how many turns you have left.",
  },
  {
    targetId: TUTORIAL_TARGET_IDS.resources,
    body:
      "Resources drive everything: Treasury adds to your yearly Funding; Funding pays to play cards and solve events; Power sets how many cards you draw each turn; Legitimacy caps how many cards you may keep at year-end — and the run ends if Legitimacy hits zero.",
  },
  {
    targetId: TUTORIAL_TARGET_IDS.events,
    body:
      "Events are the crises and opportunities on the board. Harmful ones need a solution (often Funding or a special card); opportunities may grant benefits if you invest. Unresolved harmful events can penalize you when you end the turn.",
  },
  {
    targetId: TUTORIAL_TARGET_IDS.hand,
    body:
      "Your hand is your deck of policy options — each card is a tool to shift resources or the board. Play them to solve events or strengthen the state, then end the turn when you are ready.",
  },
];

/** Level-entry UI tutorial step layout; copy comes from i18n keys (see LevelTutorialOverlay). */

export const TUTORIAL_TARGET_IDS = {
  targets: "tutorial-targets",
  resources: "tutorial-resources",
  events: "tutorial-events",
  hand: "tutorial-hand",
  actionLog: "tutorial-action-log",
} as const;

export type LevelTutorialStep = {
  targetId: string;
  bodyKey:
    | "tutorial.step.targets"
    | "tutorial.step.resources"
    | "tutorial.step.events"
    | "tutorial.step.hand"
    | "tutorial.step.actionLog";
};

export const LEVEL_TUTORIAL_STEPS: readonly LevelTutorialStep[] = [
  { targetId: TUTORIAL_TARGET_IDS.targets, bodyKey: "tutorial.step.targets" },
  { targetId: TUTORIAL_TARGET_IDS.resources, bodyKey: "tutorial.step.resources" },
  { targetId: TUTORIAL_TARGET_IDS.events, bodyKey: "tutorial.step.events" },
  { targetId: TUTORIAL_TARGET_IDS.hand, bodyKey: "tutorial.step.hand" },
  { targetId: TUTORIAL_TARGET_IDS.actionLog, bodyKey: "tutorial.step.actionLog" },
];

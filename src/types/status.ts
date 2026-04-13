/** Runtime row shown in the status bar; ticks down at end of each year's beginYear (after draw). */
export type PlayerStatusKind = "drawAttemptsDelta";

export type StatusTemplateId = "powerLeak";

export type PlayerStatusInstance = {
  instanceId: string;
  templateId: StatusTemplateId;
  kind: PlayerStatusKind;
  delta: number;
  turnsRemaining: number;
};

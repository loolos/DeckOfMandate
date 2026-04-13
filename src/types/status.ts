import type { CardTag } from "./tags";

/** Runtime row shown in the status bar; ticks down at end of each year's beginYear (after draw). */
export type PlayerStatusKind =
  | "drawAttemptsDelta"
  | "retentionCapacityDelta"
  | "blockCardTag";

export type StatusTemplateId =
  | "powerLeak"
  | "drawPenalty"
  | "retentionBoost"
  | "royalBan";

export type PlayerStatusInstance = {
  instanceId: string;
  templateId: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  blockedTag?: CardTag;
  turnsRemaining: number;
};

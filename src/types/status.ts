import type { CardTag } from "./tags";

/** Runtime row shown in the status bar; ticks down at end of each year's beginYear (after draw). */
export type PlayerStatusKind =
  | "drawAttemptsDelta"
  | "retentionCapacityDelta"
  | "blockCardTag"
  | "beginYearResourceDelta";

export type BeginYearStatusResource = "treasuryStat" | "power" | "legitimacy";

export type StatusTemplateId =
  | "powerLeak"
  | "drawPenalty"
  | "retentionBoost"
  | "royalBan"
  | "grainReliefDrawBoost"
  | "grainReliefLegitimacyBoost"
  | "religiousTolerance"
  | "huguenotContainment"
  | "antiFrenchSentiment";

export type PlayerStatusInstance = {
  instanceId: string;
  templateId: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  resource?: BeginYearStatusResource;
  blockedTag?: CardTag;
  turnsRemaining: number;
};

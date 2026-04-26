import type { CardTag } from "./tags";
import type { MessageKey } from "../../locales/en";

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
  | "antiFrenchSentiment"
  | "legitimacyCrisis"
  | "minorRegencyDoubt"
  | "bourbonMarriageRetention"
  | "diplomaticCongressDrawBoost";

/** Static definition for a player status template (drives UI keys and effect shape). */
export type StatusTemplate = {
  id: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  resource?: "treasuryStat" | "power" | "legitimacy";
  blockedTag?: "royal";
  titleKey: MessageKey;
  historyKey?: MessageKey;
};

export type PlayerStatusInstance = {
  instanceId: string;
  templateId: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  resource?: BeginYearStatusResource;
  blockedTag?: CardTag;
  turnsRemaining: number;
};

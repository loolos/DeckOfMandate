import type { CardTag } from "./tags";
import type { MessageKey } from "../../locales/en";

/** Runtime row shown in the status bar; ticks down at end of each year's beginYear (after draw). */
export type PlayerStatusKind =
  | "drawAttemptsDelta"
  | "retentionCapacityDelta"
  | "handCapDelta"
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
  | "greatPowerEncirclement"
  | "legitimacyCrisis"
  | "minorRegencyDoubt"
  | "bourbonMarriageRetention"
  | "diplomaticCongressDrawBoost"
  | "grandAllianceInfiltration";

/** Static definition for a player status template (drives UI keys and effect shape). */
export type StatusTemplate = {
  id: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  resource?: "treasuryStat" | "power" | "legitimacy";
  blockedTag?: "royal";
  titleKey: MessageKey;
  /** Historical-background copy; required for every status (enforced by `contentCompleteness.test.ts`). */
  historyKey: MessageKey;
  /**
   * Mechanics-only copy (`status.<id>.desc` or an existing detail/hint key). Shown in the
   * status bar; must state the concrete gameplay effect even when the template's numeric
   * delta is 0 and the real effect lives in engine hooks.
   */
  descKey: MessageKey;
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

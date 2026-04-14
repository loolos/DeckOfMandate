import type { MessageKey } from "../locales";
import type { PlayerStatusKind, StatusTemplateId } from "../types/status";

export type StatusTemplate = {
  id: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
  resource?: "treasuryStat" | "power" | "legitimacy";
  blockedTag?: "royal";
  titleKey: MessageKey;
};

export const statusTemplates: Record<StatusTemplateId, StatusTemplate> = {
  powerLeak: {
    id: "powerLeak",
    kind: "drawAttemptsDelta",
    delta: -1,
    titleKey: "status.powerLeak.name",
  },
  drawPenalty: {
    id: "drawPenalty",
    kind: "drawAttemptsDelta",
    delta: -1,
    titleKey: "status.drawPenalty.name",
  },
  retentionBoost: {
    id: "retentionBoost",
    kind: "retentionCapacityDelta",
    delta: 1,
    titleKey: "status.retentionBoost.name",
  },
  royalBan: {
    id: "royalBan",
    kind: "blockCardTag",
    blockedTag: "royal",
    titleKey: "status.royalBan.name",
  },
  grainReliefDrawBoost: {
    id: "grainReliefDrawBoost",
    kind: "drawAttemptsDelta",
    delta: 1,
    titleKey: "status.grainReliefDrawBoost.name",
  },
  grainReliefLegitimacyBoost: {
    id: "grainReliefLegitimacyBoost",
    kind: "beginYearResourceDelta",
    resource: "legitimacy",
    delta: 1,
    titleKey: "status.grainReliefLegitimacyBoost.name",
  },
  religiousTolerance: {
    id: "religiousTolerance",
    kind: "drawAttemptsDelta",
    delta: 0,
    titleKey: "status.religiousTolerance.name",
  },
  huguenotContainment: {
    id: "huguenotContainment",
    kind: "drawAttemptsDelta",
    delta: 0,
    titleKey: "status.huguenotContainment.name",
  },
};

export function getStatusTemplate(id: StatusTemplateId): StatusTemplate {
  return statusTemplates[id];
}

import type { MessageKey } from "../locales";
import type { PlayerStatusKind, StatusTemplateId } from "../types/status";

export type StatusTemplate = {
  id: StatusTemplateId;
  kind: PlayerStatusKind;
  delta?: number;
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
};

export function getStatusTemplate(id: StatusTemplateId): StatusTemplate {
  return statusTemplates[id];
}

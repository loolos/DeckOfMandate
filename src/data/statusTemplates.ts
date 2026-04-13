import type { MessageKey } from "../locales";
import type { PlayerStatusKind, StatusTemplateId } from "../types/status";

export type StatusTemplate = {
  id: StatusTemplateId;
  kind: PlayerStatusKind;
  delta: number;
  titleKey: MessageKey;
};

export const statusTemplates: Record<StatusTemplateId, StatusTemplate> = {
  powerLeak: {
    id: "powerLeak",
    kind: "drawAttemptsDelta",
    delta: -1,
    titleKey: "status.powerLeak.name",
  },
};

export function getStatusTemplate(id: StatusTemplateId): StatusTemplate {
  return statusTemplates[id];
}

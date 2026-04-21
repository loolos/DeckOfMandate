import type { StatusTemplate, StatusTemplateId } from "../levels/types/status";
import { statusTemplates } from "./loadStatusTemplates";

export type { StatusTemplate } from "../levels/types/status";
export { statusTemplates } from "./loadStatusTemplates";

export function getStatusTemplate(id: StatusTemplateId): StatusTemplate {
  const t = statusTemplates[id];
  if (t === undefined) throw new Error(`Unknown status template: ${String(id)}`);
  return t;
}

import type { StatusTemplate, StatusTemplateId } from "../levels/types/status";
import { statusTemplates } from "./load/content";

export type { StatusTemplate } from "../levels/types/status";
export { statusTemplates } from "./load/content";

export function getStatusTemplate(id: StatusTemplateId): StatusTemplate {
  const t = statusTemplates[id];
  if (t === undefined) throw new Error(`Unknown status template: ${String(id)}`);
  return t;
}

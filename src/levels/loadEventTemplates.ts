import type { EventTemplate, EventTemplateId } from "../levels/types/event";

const modules = import.meta.glob("./**/templates/events.ts", { eager: true }) as Record<
  string,
  { eventTemplates: Record<EventTemplateId, EventTemplate> }
>;

let merged: Record<EventTemplateId, EventTemplate> = {} as Record<EventTemplateId, EventTemplate>;
for (const path of Object.keys(modules).sort()) {
  const mod = modules[path];
  if (mod?.eventTemplates) merged = { ...merged, ...mod.eventTemplates };
}

if (Object.keys(merged).length === 0) {
  throw new Error("loadEventTemplates: no ./**/templates/events.ts under src/levels");
}

export const eventTemplates: Record<EventTemplateId, EventTemplate> = merged;

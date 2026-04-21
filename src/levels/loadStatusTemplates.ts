import type { StatusTemplate, StatusTemplateId } from "../levels/types/status";

const modules = import.meta.glob("./**/templates/statusTemplates.ts", { eager: true }) as Record<
  string,
  { statusTemplates: Record<StatusTemplateId, StatusTemplate> }
>;

let merged: Record<StatusTemplateId, StatusTemplate> = {} as Record<StatusTemplateId, StatusTemplate>;
for (const path of Object.keys(modules).sort()) {
  const mod = modules[path];
  if (mod?.statusTemplates) merged = { ...merged, ...mod.statusTemplates };
}

if (Object.keys(merged).length === 0) {
  throw new Error("loadStatusTemplates: no ./**/templates/statusTemplates.ts under src/levels");
}

export const statusTemplates: Record<StatusTemplateId, StatusTemplate> = merged;

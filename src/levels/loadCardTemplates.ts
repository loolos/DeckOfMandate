import type { CardTemplate, CardTemplateId } from "../levels/types/card";

const modules = import.meta.glob("./**/templates/cards.ts", { eager: true }) as Record<
  string,
  { cardTemplates: Record<CardTemplateId, CardTemplate> }
>;

let merged: Record<CardTemplateId, CardTemplate> = {} as Record<CardTemplateId, CardTemplate>;
for (const path of Object.keys(modules).sort()) {
  const mod = modules[path];
  if (mod?.cardTemplates) merged = { ...merged, ...mod.cardTemplates };
}

if (Object.keys(merged).length === 0) {
  throw new Error("loadCardTemplates: no ./**/templates/cards.ts under src/levels");
}

export const cardTemplates: Record<CardTemplateId, CardTemplate> = merged;

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  const t = cardTemplates[id];
  if (t === undefined) throw new Error(`Unknown card template: ${String(id)}`);
  return t;
}

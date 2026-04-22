import type { CardTemplate, CardTemplateId } from "../levels/types/card";
import { cardTemplates } from "../levels/load/content";

export { cardTemplates };

export function getCardTemplate(id: CardTemplateId): CardTemplate {
  const t = cardTemplates[id];
  if (t === undefined) throw new Error(`Unknown card template: ${String(id)}`);
  return t;
}

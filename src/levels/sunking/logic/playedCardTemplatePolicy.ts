import type { CardTemplateId } from "../../types/card";

/** Cards whose effects are driven by crackdown interaction flow, not `applyPlayedCardEffects`. */
export function shouldDeferPlayedCardEffectApplication(templateId: CardTemplateId): boolean {
  return templateId === "crackdown" || templateId === "diplomaticIntervention";
}

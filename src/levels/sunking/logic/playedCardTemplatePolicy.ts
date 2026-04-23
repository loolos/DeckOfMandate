import type { CardTemplateId } from "../../types/card";

/** Cards whose effects are driven by crackdown interaction flow, not `applyPlayedCardEffects`. */
export function shouldDeferPlayedCardEffectApplication(templateId: CardTemplateId): boolean {
  return templateId === "crackdown" || templateId === "diplomaticIntervention";
}

/** True when playing this card should open the harmful-event target picker instead of auto-applying effects. */
export function cardPlayOpensCrackdownPicker(templateId: CardTemplateId): boolean {
  return shouldDeferPlayedCardEffectApplication(templateId);
}

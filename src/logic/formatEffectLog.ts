import { getStatusTemplate } from "../data/statusTemplates";
import { getCardTemplate } from "../data/cards";
import { resourceLabelWithIcon } from "./icons";
import type { Effect } from "../levels/types/effect";
import type { MessageKey } from "../locales";

export function formatEffectLogLine(
  effect: Effect,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
): string {
  switch (effect.kind) {
    case "modResource":
      return t("log.effect.modResource", {
        resource: resourceLabelWithIcon(effect.resource, t(`resource.${effect.resource}` as MessageKey)),
        delta: effect.delta >= 0 ? `+${effect.delta}` : String(effect.delta),
      });
    case "gainFunding":
      return t("log.effect.gainFunding", {
        amount: effect.amount,
        funding: resourceLabelWithIcon("funding", t("resource.funding")),
      });
    case "drawCards":
      return t("log.effect.drawCards", { count: effect.count });
    case "scheduleNextTurnDrawModifier": {
      const d = effect.delta;
      const signed = d >= 0 ? `+${d}` : String(d);
      return t("log.effect.scheduleNextTurnDrawModifier", { delta: signed });
    }
    case "scheduleDrawModifiers":
      return t("log.effect.scheduleDrawModifiers", {
        deltas: effect.deltas.map((d) => (d >= 0 ? `+${d}` : String(d))).join(", "),
      });
    case "addPlayerStatus": {
      const tmpl = getStatusTemplate(effect.templateId);
      return t("log.effect.addPlayerStatus", {
        status: t(tmpl.titleKey),
        turns: effect.turns,
      });
    }
    case "addCardsToDeck": {
      const card = getCardTemplate(effect.templateId);
      return t("log.effect.addCardsToDeck", {
        count: effect.count,
        card: t(card.titleKey as MessageKey),
      });
    }
    default: {
      const _never: never = effect;
      return _never;
    }
  }
}

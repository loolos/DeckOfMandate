import { getEventTemplate, isContinuedCrisis } from "../data/events";
import { getLevelContent } from "../data/levelContent";
import { EVENT_SLOT_ORDER, type SlotId } from "../levels/types/event";
import type { GameState } from "../types/game";
import { appendActionLog } from "./actionLog";
import { applyEffects, enforceLegitimacy } from "./applyEffects";
import {
  handleThirdMandateSuccessionCrisisAtEoy,
  handleThirdMandateUtrechtAtEoy,
} from "../levels/sunking/logic/resolveEventsHooks";

const SLOTS: readonly SlotId[] = EVENT_SLOT_ORDER;

/** After Action phase: harmful unresolved penalties in {@link EVENT_SLOT_ORDER} order. */
export function resolveEndOfYearPenalties(state: GameState): GameState {
  let s = state;
  if (s.playerStatuses.some((st) => st.templateId === "legitimacyCrisis")) {
    s = applyEffects(s, [{ kind: "modResource", resource: "legitimacy", delta: -1 }]);
    s = enforceLegitimacy(s);
    if (s.outcome !== "playing") return s;
  }
  const schedulers = getLevelContent(s.levelId).eoyEscalationSchedulers;
  for (const slot of SLOTS) {
    const ev = s.slots[slot];
    if (!ev) continue;
    if (ev.templateId === "nineYearsWar") {
      if (!ev.resolved) {
        const effects = [{ kind: "modResource", resource: "legitimacy", delta: -1 }] as const;
        s = appendActionLog(s, {
          kind: "eventYearEndPenalty",
          slot,
          templateId: ev.templateId,
          effects,
        });
        s = applyEffects(s, effects);
        s = enforceLegitimacy(s);
        if (s.outcome !== "playing") return s;
      }
      s = applyEffects(s, [{ kind: "addCardsToDeck", templateId: "fiscalBurden", count: 1 }]);
      s = appendActionLog(s, { kind: "eventNineYearsWarFiscalBurden", slot });
      continue;
    }
    if (ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    const successionHandled = handleThirdMandateSuccessionCrisisAtEoy(s, slot);
    if (successionHandled.handled) {
      s = successionHandled.state;
      if (s.outcome !== "playing") return s;
      continue;
    }
    const utrechtHandled = handleThirdMandateUtrechtAtEoy(s, slot);
    if (utrechtHandled.handled) {
      s = utrechtHandled.state;
      continue;
    }
    if (schedulers.includes(ev.templateId)) {
      if (ev.templateId === "powerVacuum") {
        s = appendActionLog(s, { kind: "eventPowerVacuumScheduled", slot, templateId: "powerVacuum" });
      }
      s = { ...s, pendingMajorCrisis: { ...s.pendingMajorCrisis, [slot]: true } };
      continue;
    }
    if (tmpl.harmful || tmpl.penaltiesIfUnresolved.length > 0) {
      s = appendActionLog(s, {
        kind: "eventYearEndPenalty",
        slot,
        templateId: ev.templateId,
        effects: tmpl.penaltiesIfUnresolved,
      });
      s = applyEffects(s, tmpl.penaltiesIfUnresolved);
      s = enforceLegitimacy(s);
      if (s.outcome !== "playing") return s;
    }
    if (!isContinuedCrisis(tmpl)) {
      s = { ...s, slots: { ...s.slots, [slot]: null } };
    }
  }
  return s;
}

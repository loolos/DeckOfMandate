import { getEventTemplate, isContinuedCrisis } from "../data/events";
import { getLevelContent } from "../data/levelContent";
import { EVENT_SLOT_ORDER, type SlotId } from "../types/event";
import type { GameState } from "../types/game";
import { appendActionLog } from "./actionLog";
import { applyEffects, enforceLegitimacy } from "./applyEffects";

const SLOTS: readonly SlotId[] = EVENT_SLOT_ORDER;

/** After Action phase: harmful unresolved penalties in {@link EVENT_SLOT_ORDER} order. */
export function resolveEndOfYearPenalties(state: GameState): GameState {
  let s = state;
  const schedulers = getLevelContent(s.levelId).eoyEscalationSchedulers;
  for (const slot of SLOTS) {
    const ev = s.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
    if (!tmpl.harmful) continue;
    if (schedulers.includes(ev.templateId)) {
      if (ev.templateId === "powerVacuum") {
        s = appendActionLog(s, { kind: "eventPowerVacuumScheduled", slot, templateId: "powerVacuum" });
      }
      s = { ...s, pendingMajorCrisis: { ...s.pendingMajorCrisis, [slot]: true } };
      continue;
    }
    s = appendActionLog(s, {
      kind: "eventYearEndPenalty",
      slot,
      templateId: ev.templateId,
      effects: tmpl.penaltiesIfUnresolved,
    });
    s = applyEffects(s, tmpl.penaltiesIfUnresolved);
    s = enforceLegitimacy(s);
    if (s.outcome !== "playing") return s;
    if (!isContinuedCrisis(tmpl)) {
      s = { ...s, slots: { ...s.slots, [slot]: null } };
    }
  }
  return s;
}

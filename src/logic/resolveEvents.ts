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
  const existingNineYearsWarSlot = SLOTS.find((slot) => s.slots[slot]?.templateId === "nineYearsWar") ?? null;
  for (const slot of SLOTS) {
    const ev = s.slots[slot];
    if (!ev || ev.resolved) continue;
    const tmpl = getEventTemplate(ev.templateId);
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
    if (ev.templateId === "leagueOfAugsburg") {
      const upkeep = Math.floor(s.europeAlertProgress / 2);
      if (upkeep > 0) {
        if (s.resources.funding >= upkeep) {
          s = { ...s, resources: { ...s.resources, funding: s.resources.funding - upkeep } };
        } else {
          s = applyEffects(s, [
            { kind: "modResource", resource: "power", delta: -1 },
            { kind: "modResource", resource: "treasuryStat", delta: -1 },
          ]);
        }
      }
      continue;
    }
    if (!isContinuedCrisis(tmpl)) {
      s = { ...s, slots: { ...s.slots, [slot]: null } };
    }
  }
  const finalNineYearsWarSlot =
    existingNineYearsWarSlot && s.slots[existingNineYearsWarSlot]?.templateId === "nineYearsWar"
      ? existingNineYearsWarSlot
      : null;
  if (finalNineYearsWarSlot) {
    s = appendActionLog(s, { kind: "eventNineYearsWarBurden", slot: finalNineYearsWarSlot });
    s = applyEffects(s, [{ kind: "addCardsToDeck", templateId: "fiscalBurden", count: 1 }]);
  }
  return s;
}

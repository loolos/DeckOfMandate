import { getEventTemplate, isContinuedCrisis } from "../data/events";
import { getLevelContent } from "../data/levelContent";
import { EVENT_SLOT_ORDER, type SlotId } from "../levels/types/event";
import type { GameState } from "../types/game";
import { appendActionLog } from "./actionLog";
import { applyEffects, enforceLegitimacy } from "./applyEffects";
import { completeSuccessionCrisisAndRevealOpponent } from "./opponentHabsburg";
import { THIRD_MANDATE_LEVEL_ID } from "./thirdMandateConstants";

const SLOTS: readonly SlotId[] = EVENT_SLOT_ORDER;

/** After Action phase: harmful unresolved penalties in {@link EVENT_SLOT_ORDER} order. */
export function resolveEndOfYearPenalties(state: GameState): GameState {
  let s = state;
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
    if (s.levelId === THIRD_MANDATE_LEVEL_ID && ev.templateId === "successionCrisis") {
      s = appendActionLog(s, {
        kind: "eventYearEndPenalty",
        slot,
        templateId: ev.templateId,
        effects: tmpl.penaltiesIfUnresolved,
      });
      s = applyEffects(s, tmpl.penaltiesIfUnresolved);
      s = enforceLegitimacy(s);
      if (s.outcome !== "playing") return s;
      s = completeSuccessionCrisisAndRevealOpponent(s, slot);
      continue;
    }
    if (s.levelId === THIRD_MANDATE_LEVEL_ID && ev.templateId === "utrechtTreaty") {
      const raw = s.utrechtTreatyCountdown ?? 6;
      const next = raw - 1;
      if (next <= 0) {
        s = {
          ...s,
          warEnded: true,
          utrechtTreatyCountdown: null,
          slots: { ...s.slots, [slot]: null },
        };
      } else {
        s = { ...s, utrechtTreatyCountdown: next };
      }
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

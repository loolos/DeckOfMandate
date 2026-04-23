import { getLevelDef } from "../../../../data/levels";
import { getEventTemplate } from "../../../../data/events";
import { EVENT_SLOT_ORDER } from "../../../types/event";
import type { GameState } from "../../../../types/game";

export function cardPlayPriorityFirstMandate(state: GameState, cardInstanceId: string): number {
  const inst = state.cardsById[cardInstanceId];
  if (!inst) return 1_000;
  const tmpl = inst.templateId;
  const harmfulUnresolvedExists = EVENT_SLOT_ORDER.some((slot) => {
    const ev = state.slots[slot];
    return !!ev && !ev.resolved && getEventTemplate(ev.templateId).harmful;
  });
  const win = getLevelDef(state.levelId).winTargets;
  const treasuryMissing = Math.max(0, win.treasuryStat - state.resources.treasuryStat);
  const powerMissing = Math.max(0, win.power - state.resources.power);
  const legitimacyMissing = Math.max(0, win.legitimacy - state.resources.legitimacy);

  switch (tmpl) {
    case "funding":
      return harmfulUnresolvedExists ? 0 : 4;
    case "crackdown":
    case "diplomaticIntervention":
      return harmfulUnresolvedExists ? 1 : 60;
    case "development":
      return treasuryMissing > 0 ? 2 : 20;
    case "reform":
      return powerMissing > 0 ? 2 : 20;
    case "ceremony":
      return legitimacyMissing > 0 ? 2 : 20;
    default:
      return 30;
  }
}

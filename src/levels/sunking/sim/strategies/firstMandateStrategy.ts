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
  const turnsLeft = Math.max(0, 15 - state.turn + 1);
  const nearDeadline = turnsLeft <= 4;
  const severeDeficit = treasuryMissing + powerMissing + legitimacyMissing >= 4;

  switch (tmpl) {
    case "funding":
      if (harmfulUnresolvedExists) return 0;
      if (nearDeadline && severeDeficit) return 1;
      return 4;
    case "crackdown":
    case "diplomaticIntervention":
      return harmfulUnresolvedExists ? 1 : 70;
    case "development":
      if (treasuryMissing >= 2) return 1;
      if (nearDeadline && treasuryMissing > 0) return 1;
      return treasuryMissing > 0 ? 2 : 22;
    case "reform":
      if (powerMissing >= 2) return 1;
      if (nearDeadline && powerMissing > 0) return 1;
      return powerMissing > 0 ? 2 : 22;
    case "ceremony":
      if (legitimacyMissing >= 2) return 1;
      if (nearDeadline && legitimacyMissing > 0) return 1;
      return legitimacyMissing > 0 ? 2 : 22;
    default:
      return 30;
  }
}

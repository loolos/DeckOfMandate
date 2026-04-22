import type { GameState, LogInfoKey } from "../../../types/game";

/** When a limited-use card reaches 0 remaining, apply campaign-specific penalties and optional log key. */
export function limitedUseCardDepletionPenalty(
  state: GameState,
  instanceId: string,
): { state: GameState; infoKey: LogInfoKey | null } {
  const inst = state.cardsById[instanceId];
  let s = state;
  let infoKey: LogInfoKey | null = null;
  if (inst?.templateId === "crackdown") {
    s = {
      ...s,
      resources: {
        ...s.resources,
        power: Math.max(0, s.resources.power - 1),
      },
    };
    infoKey = "cardUse.depleted.crackdownPenalty";
  } else if (inst?.templateId === "funding") {
    s = {
      ...s,
      resources: {
        ...s.resources,
        treasuryStat: Math.max(0, s.resources.treasuryStat - 1),
      },
    };
    infoKey = "cardUse.depleted.fundingPenalty";
  } else if (inst?.templateId === "diplomaticIntervention") {
    infoKey = "cardUse.depleted.diplomaticIntervention";
  }
  return { state: s, infoKey };
}

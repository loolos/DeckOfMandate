import type { CardInstance } from "../../types/card";
import type { NantesPolicyCarryover } from "../../../types/game";

/** Standalone / menu start: when unspecified, chapter 3 defaults to the crackdown branch. */
export function resolveThirdMandateNantesPolicy(
  explicit: NantesPolicyCarryover | null | undefined,
): NantesPolicyCarryover {
  return explicit ?? "crackdown";
}

/**
 * Four Nantes-policy cards for chapter 3 (registered in `cardsById` only).
 * Caller shuffles the rest of the library, then inserts these ids at random positions in the draw pile.
 * - Tolerance: 4× `religiousTensionCard`.
 * - Crackdown: 4× `jansenistReservation`.
 */
export function registerNantesStarterCardsForThirdMandate(
  cardsById: Record<string, CardInstance>,
  policy: NantesPolicyCarryover,
): readonly string[] {
  const templateId = policy === "tolerance" ? "religiousTensionCard" : "jansenistReservation";
  const ids: string[] = [];
  for (let i = 0; i < 4; i++) {
    let seq = Object.keys(cardsById).length + i;
    let id = `gen_${templateId}_${seq}`;
    while (cardsById[id]) {
      seq += 1;
      id = `gen_${templateId}_${seq}`;
    }
    cardsById[id] = { instanceId: id, templateId };
    ids.push(id);
  }
  return ids;
}

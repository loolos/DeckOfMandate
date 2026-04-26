import type { RngSerialized } from "../types/game";
import { shuffle } from "./rng";

const HAND_CAP = 12;

function normalizeHandCap(handCap: number): number {
  return Math.max(0, Math.floor(Number.isFinite(handCap) ? handCap : HAND_CAP));
}

export function refillDeckFromDiscard(
  rng: RngSerialized,
  deck: string[],
  discard: string[],
): [RngSerialized, string[], string[], string[]] {
  if (deck.length > 0) return [rng, deck, discard, []];
  if (discard.length === 0) return [rng, deck, discard, []];
  const [r, shuffled] = shuffle(rng, discard);
  const sameOrder = shuffled.length > 1 && shuffled.every((id, i) => id === discard[i]);
  if (!sameOrder) return [r, shuffled, [], discard];
  // If shuffle returns the same order by chance, rotate once so each refill is visibly reshuffled.
  return [r, [...shuffled.slice(1), shuffled[0]!], [], discard];
}

export function tryDrawOne(
  rng: RngSerialized,
  hand: string[],
  deck: string[],
  discard: string[],
  handCap: number = HAND_CAP,
): {
  rng: RngSerialized;
  hand: string[];
  deck: string[];
  discard: string[];
  drew: boolean;
  drewCardId: string | null;
  refilledCardIds: string[];
} {
  const cap = normalizeHandCap(handCap);
  if (hand.length >= cap) {
    return { rng, hand, deck, discard, drew: false, drewCardId: null, refilledCardIds: [] };
  }
  const [r0, d0, di0, refilledCardIds] = refillDeckFromDiscard(rng, deck, discard);
  if (d0.length === 0) {
    return { rng: r0, hand, deck: d0, discard: di0, drew: false, drewCardId: null, refilledCardIds };
  }
  const top = d0[0]!;
  return {
    rng: r0,
    hand: [...hand, top],
    deck: d0.slice(1),
    discard: di0,
    drew: true,
    drewCardId: top,
    refilledCardIds,
  };
}

export function drawUpToPower(
  rng: RngSerialized,
  hand: string[],
  deck: string[],
  discard: string[],
  attempts: number,
  handCap: number = HAND_CAP,
): {
  rng: RngSerialized;
  hand: string[];
  deck: string[];
  discard: string[];
  drawnCardIds: string[];
  discardedCardIds: string[];
  refilledCardIds: string[];
} {
  let r = rng;
  let h = hand;
  let d = deck;
  let di = discard;
  const drawnCardIds: string[] = [];
  const discardedCardIds: string[] = [];
  const refilledCardIds: string[] = [];
  const cap = normalizeHandCap(handCap);
  for (let i = 0; i < attempts; i++) {
    if (h.length >= cap) {
      const [r0, d0, di0, refilled] = refillDeckFromDiscard(r, d, di);
      r = r0;
      d = d0;
      di = di0;
      if (refilled.length > 0) refilledCardIds.push(...refilled);
      if (d.length === 0) break;
      const top = d[0]!;
      d = d.slice(1);
      di = [...di, top];
      discardedCardIds.push(top);
      continue;
    }
    const step = tryDrawOne(r, h, d, di, cap);
    r = step.rng;
    h = step.hand;
    d = step.deck;
    di = step.discard;
    if (step.drewCardId) drawnCardIds.push(step.drewCardId);
    if (step.refilledCardIds.length > 0) refilledCardIds.push(...step.refilledCardIds);
    if (!step.drew && d.length === 0 && di.length === 0) break;
  }
  return { rng: r, hand: h, deck: d, discard: di, drawnCardIds, discardedCardIds, refilledCardIds };
}

export const handCap = HAND_CAP;

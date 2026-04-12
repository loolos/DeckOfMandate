import type { RngSerialized } from "../types/game";
import { shuffle } from "./rng";

const HAND_CAP = 10;

export function refillDeckFromDiscard(
  rng: RngSerialized,
  deck: string[],
  discard: string[],
): [RngSerialized, string[], string[]] {
  if (deck.length > 0) return [rng, deck, discard];
  if (discard.length === 0) return [rng, deck, discard];
  const [r, newDeck] = shuffle(rng, discard);
  return [r, newDeck, []];
}

export function tryDrawOne(
  rng: RngSerialized,
  hand: string[],
  deck: string[],
  discard: string[],
): { rng: RngSerialized; hand: string[]; deck: string[]; discard: string[]; drew: boolean } {
  if (hand.length >= HAND_CAP) {
    return { rng, hand, deck, discard, drew: false };
  }
  const [r0, d0, di0] = refillDeckFromDiscard(rng, deck, discard);
  if (d0.length === 0) {
    return { rng: r0, hand, deck: d0, discard: di0, drew: false };
  }
  const top = d0[0]!;
  return {
    rng: r0,
    hand: [...hand, top],
    deck: d0.slice(1),
    discard: di0,
    drew: true,
  };
}

export function drawUpToPower(
  rng: RngSerialized,
  hand: string[],
  deck: string[],
  discard: string[],
  attempts: number,
): { rng: RngSerialized; hand: string[]; deck: string[]; discard: string[] } {
  let r = rng;
  let h = hand;
  let d = deck;
  let di = discard;
  for (let i = 0; i < attempts; i++) {
    const step = tryDrawOne(r, h, d, di);
    r = step.rng;
    h = step.hand;
    d = step.deck;
    di = step.discard;
    if (!step.drew && h.length >= HAND_CAP) continue;
    if (!step.drew && d.length === 0 && di.length === 0) break;
  }
  return { rng: r, hand: h, deck: d, discard: di };
}

export const handCap = HAND_CAP;

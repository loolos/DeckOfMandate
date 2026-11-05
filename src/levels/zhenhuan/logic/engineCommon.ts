/**
 * Helpers shared by the three 甄嬛传 engines (第一关 `engine.ts`, `stage2Engine.ts`, `stage3Engine.ts`).
 * Each takes only the slice of state it touches, so every stage's state type fits. Rules that differ
 * between stages (losing, deltas, statuses' meaning, 陵容's 情分) stay in their own engines.
 *
 * Replays depend on these consuming the RNG in exactly the same order as before; change them only
 * together with the replay tests.
 */
import { rngNext, shuffle } from "../../../logic/rng";
import type { RngSerialized } from "../../../types/game";

export type LogTone = "info" | "good" | "bad";
export type LogEntry = { readonly turn: number; readonly text: string; readonly tone: LogTone };

type Logged = { turn: number; log: LogEntry[] };
type Seeded = { rng: RngSerialized };

export function log(s: Logged, text: string, tone: LogTone = "info"): void {
  s.log.push({ turn: s.turn, text, tone });
}

export function alive(s: { outcome: string }): boolean {
  return s.outcome === "playing";
}

/** Next random number in [0, 1); advances the state's RNG. */
export function roll(s: Seeded): number {
  const [rng, x] = rngNext(s.rng);
  s.rng = rng;
  return x;
}

/** A shuffled copy of `items`; advances the state's RNG. */
export function shuffleInto<T>(s: Seeded, items: readonly T[]): T[] {
  const [rng, out] = shuffle(s.rng, items);
  s.rng = rng;
  return out;
}

/** Draws `n` cards into the hand, shuffling the discard pile back when the draw pile runs out. */
export function drawIntoHand<C>(
  s: Logged & Seeded & { drawPile: C[]; hand: C[]; discard: C[]; drawnThisTurn: number },
  n: number,
): void {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discard.length === 0) {
        log(s, "抽牌堆与弃牌堆都已空，无法继续抽牌。");
        return;
      }
      s.drawPile = shuffleInto(s, s.discard);
      s.discard = [];
      log(s, `弃牌堆洗回抽牌堆（${s.drawPile.length} 张）。`);
    }
    s.hand.push(s.drawPile.shift()!);
    s.drawnThisTurn++;
  }
}

/** A fresh, unresolved event instance with the next uid. */
export function newEvent<Id extends string>(s: { nextUid: number }, id: Id): { uid: string; id: Id; resolved: false } {
  return { uid: `e${s.nextUid++}`, id, resolved: false };
}

/** Removes the first status with this id; false when there was none. */
export function removeStatusById<Id extends string>(s: { statuses: { readonly id: Id }[] }, id: Id): boolean {
  const i = s.statuses.findIndex((st) => st.id === id);
  if (i < 0) return false;
  s.statuses.splice(i, 1);
  return true;
}

/** A 陵容相助 card right next to `index` in the hand (联袂), if any. */
export function adjacentLingrongCard<C extends { readonly id: string }>(hand: readonly C[], index: number): C | null {
  for (const j of [index - 1, index + 1]) {
    const c = hand[j];
    if (c && c.id === "lingrongXiangzhu") return c;
  }
  return null;
}

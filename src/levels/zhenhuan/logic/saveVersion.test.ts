import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { newGame, reduce } from "./engine";
import { clearSession, loadSessionResult, saveSession, startStage2Standalone } from "./session";
import { canPlayCard, reduce2, type Z2State } from "./stage2Engine";
import { classifySaveFailure, currentBuild, saveFailureMessage } from "./saveVersion";

class MemoryStorage {
  readonly map = new Map<string, string>();
  refuseWrites = false;
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.refuseWrites) throw new Error("QuotaExceededError");
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}

let store: MemoryStorage;
beforeEach(() => {
  store = new MemoryStorage();
  (globalThis as { localStorage?: unknown }).localStorage = store;
});
afterEach(() => {
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

function playOneTurn2(s: Z2State): Z2State {
  const c = s.hand.find((x) => canPlayCard(s, x.uid));
  if (c) {
    const next = reduce2(s, { type: "playCard", cardUid: c.uid });
    if (next !== s && !next.pending) s = next;
  }
  return reduce2(s, { type: "endTurn" });
}

describe("zhenhuan autosave", () => {
  it("round-trips a 第一关 save and records the writing build", () => {
    const state = reduce(newGame(7), { type: "endTurn" });
    saveSession({ stage: 1, state });
    const r = loadSessionResult();
    expect(r.kind).toBe("ok");
    expect(r.kind === "ok" && r.session.state.turn).toBe(state.turn);
    expect(store.getItem("deck-of-mandate.zhenhuan.save.build")).toBe(currentBuild());
  });

  it("keeps the previous save when the new write is refused", () => {
    const s1 = reduce(newGame(7), { type: "endTurn" });
    saveSession({ stage: 1, state: s1 });
    store.refuseWrites = true;
    saveSession(startStage2Standalone(9));
    store.refuseWrites = false;
    const r = loadSessionResult();
    expect(r.kind === "ok" && r.session.stage).toBe(1);
  });

  it("a newer stage's save replaces the older stage's", () => {
    saveSession({ stage: 1, state: newGame(7) });
    const s2 = startStage2Standalone(9);
    saveSession({ ...s2, state: playOneTurn2(s2.state) });
    expect(store.getItem("deck-of-mandate.zhenhuan.save.v1")).toBeNull();
    const r = loadSessionResult();
    expect(r.kind === "ok" && r.session.stage).toBe(2);
  });

  it("a save that no longer replays reports an outdated build and is cleared", () => {
    store.setItem("deck-of-mandate.zhenhuan.save.v1", JSON.stringify({ seed: 7, actions: [{ type: "playCard", cardUid: "nope" }] }));
    store.setItem("deck-of-mandate.zhenhuan.save.build", "1000");
    const r = loadSessionResult();
    expect(r.kind).toBe("failed");
    expect(r.kind === "failed" && r.failure.kind).toBe("outdated");
    expect(store.getItem("deck-of-mandate.zhenhuan.save.v1")).toBeNull();
    expect(loadSessionResult().kind).toBe("none");
  });
});

describe("classifySaveFailure", () => {
  it("tells outdated, newer and broken saves apart", () => {
    expect(classifySaveFailure(null, "2000").kind).toBe("outdated");
    expect(classifySaveFailure("1000", "2000").kind).toBe("outdated");
    expect(classifySaveFailure("3000", "2000").kind).toBe("newer");
    expect(classifySaveFailure("2000", "2000").kind).toBe("corrupt");
  });

  it("names the saving build's date when known", () => {
    const f = classifySaveFailure(String(Date.UTC(2026, 9, 3, 12)), String(Date.UTC(2026, 10, 5, 12)));
    expect(f.savedAt).toBe("2026-10-03");
    expect(saveFailureMessage(f)).toContain("2026-10-03");
  });
});

afterEach(() => {
  if ((globalThis as { localStorage?: unknown }).localStorage) clearSession();
});

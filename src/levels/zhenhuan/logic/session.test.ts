import { describe, expect, it } from "vitest";
import { newGame, reduce } from "./engine";
import { continueToStage2, decodeSessionCode, encodeSessionCode, startStage2Standalone } from "./session";
import { canPlayCard, reduce2, type Z2State } from "./stage2Engine";

function playSomeTurns(s: Z2State, turns: number): Z2State {
  for (let i = 0; i < turns && s.outcome === "playing"; i++) {
    const c = s.hand.find((x) => canPlayCard(s, x.uid));
    if (c) {
      const next = reduce2(s, { type: "playCard", cardUid: c.uid });
      if (next !== s && !next.pending) s = next;
    }
    s = reduce2(s, { type: "endTurn" });
  }
  return s;
}

describe("zhenhuan sessions", () => {
  it("第一关 codes still decode as 第一关", () => {
    let s = newGame(5);
    s = reduce(s, { type: "endTurn" });
    const r = decodeSessionCode(encodeSessionCode({ stage: 1, state: s }));
    expect(r.ok && r.session.stage).toBe(1);
  });

  it("continuing to 第二关 carries 清誉 / 圣宠 and round-trips through a ZH2 code", () => {
    const s1 = newGame(7);
    s1.qingyu = 4;
    s1.shengchong = 6;
    s1.outcome = "won";
    const session = continueToStage2(s1, 99);
    expect(session.state.qingyu).toBe(4);
    expect(session.state.shengchong).toBe(6);
    const st = playSomeTurns(session.state, 4);
    const code = encodeSessionCode({ ...session, state: st });
    expect(code.startsWith("ZH2-")).toBe(true);
    const r = decodeSessionCode(code);
    expect(r.ok).toBe(true);
    if (r.ok && r.session.stage === 2) {
      expect(r.session.state.turn).toBe(st.turn);
      expect(r.session.state.carry).toEqual({ qingyu: 4, shengchong: 6 });
      expect(r.session.stage1?.seed).toBe(7);
    }
  });

  it("standalone 第二关 codes have no 第一关 part", () => {
    const session = startStage2Standalone(3);
    const st = playSomeTurns(session.state, 2);
    const r = decodeSessionCode(encodeSessionCode({ ...session, state: st }));
    expect(r.ok && r.session.stage === 2 && r.session.stage1).toBe(null);
  });
});

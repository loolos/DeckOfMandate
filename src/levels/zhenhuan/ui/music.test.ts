import { describe, expect, it } from "vitest";
import { newGame } from "../logic/engine";
import { startStage2Standalone } from "../logic/session";
import { newStage2 } from "../logic/stage2Engine";
import { musicMood } from "./music";

describe("musicMood", () => {
  it("calm on the start menu", () => {
    expect(musicMood(null)).toBe("calm");
  });

  it("victory only for a 第二关 win with 大胜 or 完美胜利", () => {
    expect(musicMood({ stage: 1, state: { ...newGame(1), turn: 15, outcome: "won" } })).toBe("calm");
    const s = startStage2Standalone(1);
    if (s.stage !== 2) throw new Error("expected stage 2");
    const end = (outcome: "won" | "lost", victory: "narrow" | "full" | "perfect" | null) =>
      musicMood({ ...s, state: { ...newStage2(1, s.state.carry), turn: 30, outcome, victory } });
    expect(end("won", "perfect")).toBe("victory");
    expect(end("won", "full")).toBe("victory");
    expect(end("won", "narrow")).toBe("climax");
    expect(end("lost", null)).toBe("climax");
  });

  it("stage 1 follows its story beats", () => {
    const at = (turn: number) => musicMood({ stage: 1, state: { ...newGame(1), turn } });
    expect([1, 3, 4, 7, 8, 9, 10, 12, 13, 15].map(at)).toEqual([
      "calm", "calm", "tension", "tension", "tender", "tender", "tension", "tension", "calm", "calm",
    ]);
  });

  it("stage 2 follows its story beats", () => {
    const s = startStage2Standalone(1);
    if (s.stage !== 2) throw new Error("expected stage 2");
    const at = (turn: number) => musicMood({ ...s, state: { ...newStage2(1, s.state.carry), turn } });
    expect([1, 2, 3, 7, 8, 9, 10, 13, 14, 16, 17, 19, 20, 23, 24, 30].map(at)).toEqual([
      "calm", "calm", "tension", "tension", "sorrow", "sorrow", "calm", "calm", "tender", "tender", "sorrow", "sorrow",
      "tension", "tension", "climax", "climax",
    ]);
  });
});

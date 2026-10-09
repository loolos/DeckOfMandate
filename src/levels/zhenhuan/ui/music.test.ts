import { describe, expect, it } from "vitest";
import { newGame } from "../logic/engine";
import { startStage2Standalone } from "../logic/session";
import { newStage2 } from "../logic/stage2Engine";
import { musicMood } from "./music";

describe("musicMood", () => {
  it("calm on the start menu", () => {
    expect(musicMood(null)).toBe("calm");
  });

  it("stage 1 follows the turn: calm → tension → sorrow → climax", () => {
    const at = (turn: number) => musicMood({ stage: 1, state: { ...newGame(1), turn } });
    expect([1, 3, 4, 9, 10, 12, 13, 15].map(at)).toEqual([
      "calm", "calm", "tension", "tension", "sorrow", "sorrow", "climax", "climax",
    ]);
  });

  it("stage 2 follows the turn over its 30 turns", () => {
    const s = startStage2Standalone(1);
    if (s.stage !== 2) throw new Error("expected stage 2");
    const at = (turn: number) => musicMood({ ...s, state: { ...newStage2(1, s.state.carry), turn } });
    expect([1, 7, 8, 18, 19, 25, 26, 30].map(at)).toEqual([
      "calm", "calm", "tension", "tension", "sorrow", "sorrow", "climax", "climax",
    ]);
  });
});

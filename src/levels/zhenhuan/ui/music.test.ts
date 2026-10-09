import { describe, expect, it } from "vitest";
import { newGame } from "../logic/engine";
import { startStage2Standalone } from "../logic/session";
import { musicMood } from "./music";

describe("musicMood", () => {
  it("menu when no session", () => {
    expect(musicMood(null)).toBe("calm");
  });

  it("outcomes override everything", () => {
    const st = newGame(1);
    expect(musicMood({ stage: 1, state: { ...st, outcome: "won" } })).toBe("calm");
    expect(musicMood({ stage: 1, state: { ...st, outcome: "lost" } })).toBe("sorrow");
  });

  it("stage 1 and 2 starts resolve to a playing mood", () => {
    expect(["calm", "tension", "sorrow"]).toContain(musicMood({ stage: 1, state: newGame(1) }));
    expect(["calm", "tension", "sorrow"]).toContain(musicMood(startStage2Standalone(1)));
  });

  it("climax mood when the stage 2 finale is active", () => {
    const s = startStage2Standalone(1);
    if (s.stage !== 2) throw new Error("expected stage 2");
    const finale = { needed: 3, played: [], stories: [] };
    expect(musicMood({ ...s, state: { ...s.state, finale } })).toBe("climax");
  });
});

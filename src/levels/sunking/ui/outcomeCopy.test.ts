import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { messagesEn } from "../../../locales/en";
import type { MessageKey } from "../../../locales";
import type { GameState } from "../../../types/game";
import { buildSunkingOutcomeCopy, buildSunkingTargetsLine } from "./outcomeCopy";

import "../../../test/setupLevels";

/** Minimal translator: returns the raw English string with `{var}` placeholders substituted. */
const t = (key: MessageKey, vars?: Record<string, string | number>): string => {
  const raw = (messagesEn as Record<string, string>)[key];
  if (raw === undefined) return `MISSING:${key}`;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
};

function endedState(levelId: string, patch: Partial<GameState>): GameState {
  return { ...createInitialState(1, levelId), ...patch } as GameState;
}

describe("buildSunkingOutcomeCopy", () => {
  it("renders the victory headline and body for a resource-target chapter", () => {
    const copy = buildSunkingOutcomeCopy(endedState("firstMandate", { outcome: "victory" }), t);
    expect(copy.headline).toBe(t("outcome.victory"));
    expect(copy.paragraphs.length).toBeGreaterThan(0);
    expect(copy.paragraphs.every((p) => !p.startsWith("MISSING:"))).toBe(true);
  });

  it("adds the War of Devolution epilogue only when that branch was taken", () => {
    const restrained = buildSunkingOutcomeCopy(
      endedState("firstMandate", { outcome: "victory", warOfDevolutionAttacked: false }),
      t,
    );
    const attacked = buildSunkingOutcomeCopy(
      endedState("firstMandate", { outcome: "victory", warOfDevolutionAttacked: true }),
      t,
    );
    expect(attacked.paragraphs.length).toBe(restrained.paragraphs.length + 1);
  });

  it("uses the succession-track-cap victory copy when the track hit +10", () => {
    const capped = buildSunkingOutcomeCopy(
      endedState("thirdMandate", { outcome: "victory", successionTrack: 10 }),
      t,
    );
    const settled = buildSunkingOutcomeCopy(
      endedState("thirdMandate", {
        outcome: "victory",
        successionTrack: 2,
        successionOutcomeTier: "compromise",
      }),
      t,
    );
    expect(capped.paragraphs).not.toEqual(settled.paragraphs);
    expect(capped.paragraphs.every((p) => !p.startsWith("MISSING:"))).toBe(true);
    expect(settled.paragraphs.every((p) => !p.startsWith("MISSING:"))).toBe(true);
  });

  it("renders each defeat outcome with its own headline and body", () => {
    for (const outcome of ["defeatLegitimacy", "defeatTime", "defeatSuccession"] as const) {
      const copy = buildSunkingOutcomeCopy(endedState("thirdMandate", { outcome }), t);
      expect(copy.headline).toBe(t(`outcome.${outcome}` as MessageKey));
      expect(copy.paragraphs.length).toBeGreaterThan(0);
      expect(copy.paragraphs.every((p) => !p.startsWith("MISSING:"))).toBe(true);
    }
  });
});

describe("buildSunkingTargetsLine", () => {
  it("fills the per-level goals line with that level's win targets", () => {
    for (const levelId of ["firstMandate", "secondMandate", "thirdMandate"]) {
      const line = buildSunkingTargetsLine(createInitialState(1, levelId), 15, t);
      expect(line).not.toContain("MISSING:");
      expect(line).not.toContain("{");
    }
  });
});

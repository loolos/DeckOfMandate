import { describe, expect, it } from "vitest";
import { createInitialState } from "../app/initialState";
import type { CardInstance } from "../types/card";
import type { GameState } from "../types/game";
import { beginYear } from "./turnFlow";

describe("beginYear + playerStatuses", () => {
  it("applies drawAttemptsDelta to attempts then decrements turnsRemaining", () => {
    const started = createInitialState(42_424);
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "funding" },
      c1: { instanceId: "c1", templateId: "funding" },
      c2: { instanceId: "c2", templateId: "funding" },
      c3: { instanceId: "c3", templateId: "funding" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 3, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["c0", "c1", "c2", "c3"],
      discard: [],
      cardsById,
      playerStatuses: [
        {
          instanceId: "st_x",
          templateId: "powerLeak",
          kind: "drawAttemptsDelta",
          delta: -1,
          turnsRemaining: 2,
        },
      ],
    };
    const s1 = beginYear(s0);
    expect(s1.hand.length).toBe(2);
    expect(s1.deck.length).toBe(2);
    expect(s1.playerStatuses).toHaveLength(1);
    expect(s1.playerStatuses[0]!.turnsRemaining).toBe(1);
  });

  it("clamps draw attempts to at least 1 when statuses would zero out power", () => {
    const started = createInitialState(99_001);
    const cardsById: Record<string, CardInstance> = {
      c0: { instanceId: "c0", templateId: "funding" },
    };
    const s0: GameState = {
      ...started,
      outcome: "playing",
      phase: "action",
      resources: { treasuryStat: 0, funding: 0, power: 1, legitimacy: 2 },
      nextTurnDrawModifier: 0,
      hand: [],
      deck: ["c0"],
      discard: [],
      cardsById,
      playerStatuses: [
        {
          instanceId: "st_y",
          templateId: "powerLeak",
          kind: "drawAttemptsDelta",
          delta: -1,
          turnsRemaining: 1,
        },
      ],
    };
    const s1 = beginYear(s0);
    expect(s1.hand.length).toBe(1);
    expect(s1.playerStatuses).toHaveLength(0);
  });
});

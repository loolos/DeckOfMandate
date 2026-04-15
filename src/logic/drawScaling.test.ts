import { describe, expect, it } from "vitest";

import { drawAttemptsFromPower } from "./drawScaling";

describe("drawAttemptsFromPower", () => {
  it("matches increasing-cost thresholds", () => {
    expect(drawAttemptsFromPower(1)).toBe(1);
    expect(drawAttemptsFromPower(2)).toBe(2);
    expect(drawAttemptsFromPower(4)).toBe(3);
    expect(drawAttemptsFromPower(7)).toBe(4);
    expect(drawAttemptsFromPower(11)).toBe(5);
    expect(drawAttemptsFromPower(16)).toBe(6);
  });

  it("keeps at least one draw for zero or negative power", () => {
    expect(drawAttemptsFromPower(0)).toBe(1);
    expect(drawAttemptsFromPower(-3)).toBe(1);
  });
});

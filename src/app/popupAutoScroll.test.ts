import { describe, expect, it } from "vitest";
import { nextAutoScrollTop } from "./popupAutoScroll";

describe("nextAutoScrollTop", () => {
  it("advances proportionally to elapsed time", () => {
    expect(nextAutoScrollTop(0, 1000, 500, 20)).toBe(20);
    expect(nextAutoScrollTop(10, 500, 500, 20)).toBe(20);
  });
  it("clamps at the bottom", () => {
    expect(nextAutoScrollTop(95, 1000, 100, 20)).toBe(100);
  });
  it("stays at the top when nothing overflows", () => {
    expect(nextAutoScrollTop(0, 1000, 0)).toBe(0);
    expect(nextAutoScrollTop(5, 1000, -3)).toBe(0);
  });
});

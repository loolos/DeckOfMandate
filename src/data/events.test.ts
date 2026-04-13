import { describe, expect, it } from "vitest";
import { getEventRollWeight } from "./events";
import { createInitialState } from "../app/initialState";

describe("getEventRollWeight", () => {
  it("returns base weight when europe alert is off", () => {
    const st = { ...createInitialState(111, "secondMandate"), europeAlert: false };
    expect(getEventRollWeight(st, "frontierGarrisons")).toBe(2);
    expect(getEventRollWeight(st, "risingGrainPrices")).toBe(3);
  });

  it("adds +1 for coalition-pressure events when europe alert is on", () => {
    const st = { ...createInitialState(222, "secondMandate"), europeAlert: true };
    expect(getEventRollWeight(st, "frontierGarrisons")).toBe(3);
    expect(getEventRollWeight(st, "tradeDisruption")).toBe(2);
    expect(getEventRollWeight(st, "warWeariness")).toBe(3);
    expect(getEventRollWeight(st, "risingGrainPrices")).toBe(3);
  });
});

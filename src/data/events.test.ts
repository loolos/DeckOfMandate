import { describe, expect, it } from "vitest";
import { getEventRollWeight, getEventSolveFundingAmount } from "./events";
import { createInitialState } from "../app/initialState";

describe("getEventRollWeight", () => {
  it("returns base weight when europe alert is off", () => {
    const st = { ...createInitialState(111, "secondMandate"), europeAlert: false };
    expect(getEventRollWeight(st, "frontierGarrisons")).toBe(2);
    expect(getEventRollWeight(st, "tradeDisruption")).toBe(1);
    expect(getEventRollWeight(st, "warWeariness")).toBe(2);
    expect(getEventRollWeight(st, "risingGrainPrices")).toBe(3);
  });

  it("keeps base weights when europe alert is on", () => {
    const st = { ...createInitialState(222, "secondMandate"), europeAlert: true };
    expect(getEventRollWeight(st, "frontierGarrisons")).toBe(2);
    expect(getEventRollWeight(st, "tradeDisruption")).toBe(1);
    expect(getEventRollWeight(st, "warWeariness")).toBe(2);
    expect(getEventRollWeight(st, "risingGrainPrices")).toBe(3);
  });

  it("scales nymwegen settlement funding cost by europe alert progress", () => {
    const st = { ...createInitialState(333, "secondMandate"), europeAlert: true, europeAlertProgress: 3 };
    expect(getEventSolveFundingAmount(st, "nymwegenSettlement")).toBe(6);
    expect(getEventSolveFundingAmount({ ...st, europeAlertProgress: 10 }, "nymwegenSettlement")).toBe(13);
  });

  it("scales ryswick peace funding cost by europe alert progress (+2)", () => {
    const st = { ...createInitialState(334, "secondMandate"), europeAlert: true, europeAlertProgress: 3 };
    expect(getEventSolveFundingAmount(st, "ryswickPeace")).toBe(5);
    expect(getEventSolveFundingAmount({ ...st, europeAlertProgress: 10 }, "ryswickPeace")).toBe(12);
  });
});

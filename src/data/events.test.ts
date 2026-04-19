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

  it("adds anti-french sentiment solve-cost penalty to europe-alert supplemental pool events only", () => {
    const st = createInitialState(12_347, "secondMandate");
    const atTwenty = { ...st, resources: { ...st.resources, treasuryStat: 10, power: 10 } };
    const overImmediatePlusOne = { ...st, resources: { ...st.resources, treasuryStat: 11, power: 10 } };
    const overStillPlusOne = { ...st, resources: { ...st.resources, treasuryStat: 13, power: 12 } };
    const overPlusTwo = { ...st, resources: { ...st.resources, treasuryStat: 16, power: 10 } };

    expect(getEventSolveFundingAmount(atTwenty, "frontierGarrisons")).toBe(3);
    expect(getEventSolveFundingAmount(overImmediatePlusOne, "frontierGarrisons")).toBe(4);
    expect(getEventSolveFundingAmount(overStillPlusOne, "frontierGarrisons")).toBe(4);
    expect(getEventSolveFundingAmount(overPlusTwo, "frontierGarrisons")).toBe(5);

    expect(getEventSolveFundingAmount(overPlusTwo, "budgetStrain")).toBe(2);
  });

});

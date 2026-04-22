import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import {
  getEventRollWeight,
  getEventSolveFundingAmount,
  shouldDiscardCh3SuccessionGatedProceduralHead,
} from "./eventTemplateApi";

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

  it("zeros chapter-3 succession-gated roll weights until track leaves 0", () => {
    const atZero = { ...createInitialState(501, "thirdMandate"), successionTrack: 0 };
    expect(getEventRollWeight(atZero, "bavarianCourtRealignment")).toBe(0);
    expect(getEventRollWeight(atZero, "portugueseTariffNegotiation")).toBe(0);
    expect(getEventRollWeight(atZero, "imperialElectorsMood")).toBe(0);
    expect(getEventRollWeight(atZero, "localizedSuccessionWar")).toBe(0);
    expect(getEventRollWeight(atZero, "taxResistance")).toBe(2);
    const moved = { ...atZero, successionTrack: -1 };
    expect(getEventRollWeight(moved, "bavarianCourtRealignment")).toBe(2);
    expect(getEventRollWeight(moved, "localizedSuccessionWar")).toBe(3);
    expect(shouldDiscardCh3SuccessionGatedProceduralHead(atZero, "bavarianCourtRealignment")).toBe(true);
    expect(shouldDiscardCh3SuccessionGatedProceduralHead(atZero, "localizedSuccessionWar")).toBe(true);
    expect(shouldDiscardCh3SuccessionGatedProceduralHead(moved, "bavarianCourtRealignment")).toBe(false);
    const afterPeace = { ...moved, warEnded: true };
    expect(getEventRollWeight(afterPeace, "bavarianCourtRealignment")).toBe(0);
    expect(getEventRollWeight(afterPeace, "localizedSuccessionWar")).toBe(0);
    expect(shouldDiscardCh3SuccessionGatedProceduralHead(afterPeace, "bavarianCourtRealignment")).toBe(true);
    expect(shouldDiscardCh3SuccessionGatedProceduralHead(afterPeace, "taxResistance")).toBe(false);
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

  it("adds +4 ryswick peace surcharge while nine years war is still present", () => {
    const st = {
      ...createInitialState(3_340, "secondMandate"),
      europeAlert: true,
      europeAlertProgress: 3,
      slots: {
        ...createInitialState(3_340, "secondMandate").slots,
        A: { instanceId: "e_nine", templateId: "nineYearsWar" as const, resolved: false },
      },
    };
    expect(getEventSolveFundingAmount(st, "ryswickPeace")).toBe(9);
  });

  it("adds ryswick peace extra +2x only while anti-french sentiment is active", () => {
    const base = createInitialState(3_340_1, "secondMandate");
    const withContainmentInLibrary = {
      ...base,
      deck: [...base.deck, "afc_1", "afc_2"],
      cardsById: {
        ...base.cardsById,
        afc_1: { instanceId: "afc_1", templateId: "antiFrenchContainment" as const },
        afc_2: { instanceId: "afc_2", templateId: "antiFrenchContainment" as const },
      },
      europeAlert: true,
      europeAlertProgress: 3,
    };
    const active = {
      ...withContainmentInLibrary,
      resources: { ...withContainmentInLibrary.resources, power: 11, treasuryStat: 10 },
    };
    const inactive = {
      ...withContainmentInLibrary,
      resources: { ...withContainmentInLibrary.resources, power: 10, treasuryStat: 10 },
    };

    // Base 5, then +2x where x=2 => +4.
    expect(getEventSolveFundingAmount(active, "ryswickPeace")).toBe(9);
    expect(getEventSolveFundingAmount(inactive, "ryswickPeace")).toBe(5);
  });

  it("scales nine years war solve funding to floor(progress/2) + 1", () => {
    const base = createInitialState(3_341, "secondMandate");
    expect(getEventSolveFundingAmount({ ...base, europeAlertProgress: 1 }, "nineYearsWar")).toBe(1);
    expect(getEventSolveFundingAmount({ ...base, europeAlertProgress: 3 }, "nineYearsWar")).toBe(2);
    expect(getEventSolveFundingAmount({ ...base, europeAlertProgress: 4 }, "nineYearsWar")).toBe(3);
    expect(getEventSolveFundingAmount({ ...base, europeAlertProgress: 9 }, "nineYearsWar")).toBe(5);
  });

  it("scales commercial expansion solve funding to floor(treasury/5) + 1", () => {
    const base = createInitialState(3_342, "secondMandate");
    expect(
      getEventSolveFundingAmount({ ...base, resources: { ...base.resources, treasuryStat: 0 } }, "commercialExpansion"),
    ).toBe(1);
    expect(
      getEventSolveFundingAmount({ ...base, resources: { ...base.resources, treasuryStat: 4 } }, "commercialExpansion"),
    ).toBe(1);
    expect(
      getEventSolveFundingAmount({ ...base, resources: { ...base.resources, treasuryStat: 5 } }, "commercialExpansion"),
    ).toBe(2);
    expect(
      getEventSolveFundingAmount(
        { ...base, resources: { ...base.resources, treasuryStat: 14 } },
        "commercialExpansion",
      ),
    ).toBe(3);
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

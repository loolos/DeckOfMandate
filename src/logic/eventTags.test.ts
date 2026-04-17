import { describe, expect, it } from "vitest";
import { isHistoricalEventTemplateId } from "./eventTags";

describe("isHistoricalEventTemplateId", () => {
  it("marks mainline scripted events as historical", () => {
    expect(isHistoricalEventTemplateId("warOfDevolution")).toBe(true);
    expect(isHistoricalEventTemplateId("nymwegenSettlement")).toBe(true);
    expect(isHistoricalEventTemplateId("revocationNantes")).toBe(true);
  });

  it("keeps procedural opportunity events non-historical", () => {
    expect(isHistoricalEventTemplateId("tradeOpportunity")).toBe(false);
    expect(isHistoricalEventTemplateId("commercialExpansion")).toBe(false);
    expect(isHistoricalEventTemplateId("militaryPrestige")).toBe(false);
  });
});

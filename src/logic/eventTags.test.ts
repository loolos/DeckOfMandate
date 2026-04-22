import { describe, expect, it } from "vitest";
import { isHistoricalEventTemplateId } from "./eventTags";

/** Contract: `src/logic/eventTags` remains a thin re-export of the registered campaign implementation. */
describe("eventTags façade", () => {
  it("re-exports a callable predicate", () => {
    expect(typeof isHistoricalEventTemplateId).toBe("function");
    expect(isHistoricalEventTemplateId("tradeOpportunity")).toBe(false);
  });
});

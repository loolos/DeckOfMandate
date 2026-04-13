import { describe, expect, it } from "vitest";
import { getCardTemplate } from "./cards";
import { getEventTemplate } from "./events";

describe("secondMandate balance data", () => {
  it("keeps chapter 2 new cards functionally distinct from chapter 1 baseline cards", () => {
    const newIds = [
      "grainRelief",
      "taxRebalance",
      "diplomaticCongress",
      "patronageOffice",
      "warBond",
    ] as const;
    for (const id of newIds) {
      const card = getCardTemplate(id);
      expect(card.effects.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("buffs key chapter 2 new card payoffs", () => {
    const taxRebalance = getCardTemplate("taxRebalance");
    expect(taxRebalance.effects).toEqual([
      { kind: "gainFunding", amount: 2 },
      { kind: "modResource", resource: "treasuryStat", delta: 1 },
    ]);

    const warBond = getCardTemplate("warBond");
    expect(warBond.effects).toEqual([
      { kind: "gainFunding", amount: 3 },
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
    ]);
  });

  it("increases chapter 2 event pressure for unresolved crises", () => {
    expect(getEventTemplate("versaillesExpenditure").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "treasuryStat", delta: -2 },
    ]);
    expect(getEventTemplate("risingGrainPrices").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "legitimacy", delta: -2 },
    ]);
    expect(getEventTemplate("tradeDisruption").penaltiesIfUnresolved).toEqual([
      { kind: "scheduleNextTurnDrawModifier", delta: -2 },
    ]);
  });
});

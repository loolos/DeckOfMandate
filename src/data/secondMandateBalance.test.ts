import { describe, expect, it } from "vitest";
import { getCardTemplate } from "./cards";
import { getEventTemplate } from "./events";

describe("secondMandate balance data", () => {
  it("applies requested chapter 2 new-card costs", () => {
    const newIds = [
      "grainRelief",
      "taxRebalance",
      "diplomaticCongress",
      "diplomaticIntervention",
      "fiscalBurden",
      "patronageOffice",
      "warBond",
    ] as const;
    const expectedCosts = {
      grainRelief: 3,
      taxRebalance: 2,
      diplomaticCongress: 3,
      diplomaticIntervention: 0,
      fiscalBurden: 2,
      patronageOffice: 4,
      warBond: 0,
    } as const;
    for (const id of newIds) {
      expect(getCardTemplate(id).cost).toBe(expectedCosts[id]);
    }
  });

  it("applies requested chapter 2 new card effects and royal tags", () => {
    const taxRebalance = getCardTemplate("taxRebalance");
    expect(taxRebalance.effects).toEqual([
      { kind: "modResource", resource: "treasuryStat", delta: 1 },
      { kind: "addPlayerStatus", templateId: "drawPenalty", turns: 2 },
    ]);

    const grainRelief = getCardTemplate("grainRelief");
    expect(grainRelief.cost).toBe(3);
    expect(grainRelief.effects).toEqual([
      { kind: "addPlayerStatus", templateId: "grainReliefDrawBoost", turns: 1 },
      { kind: "addPlayerStatus", templateId: "grainReliefLegitimacyBoost", turns: 1 },
    ]);

    const congress = getCardTemplate("diplomaticCongress");
    expect(congress.effects).toEqual([{ kind: "modResource", resource: "power", delta: 1 }]);

    const diplomaticIntervention = getCardTemplate("diplomaticIntervention");
    expect(diplomaticIntervention.effects).toEqual([]);
    expect(diplomaticIntervention.tags.includes("royal")).toBe(false);
    expect(diplomaticIntervention.tags.includes("temp")).toBe(true);

    const fiscalBurden = getCardTemplate("fiscalBurden");
    expect(fiscalBurden.effects).toEqual([]);
    expect(fiscalBurden.tags.includes("royal")).toBe(false);

    const patronage = getCardTemplate("patronageOffice");
    expect(patronage.cost).toBe(4);
    expect(patronage.effects).toEqual([
      { kind: "modResource", resource: "power", delta: 1 },
      { kind: "addPlayerStatus", templateId: "retentionBoost", turns: 3 },
    ]);

    const warBond = getCardTemplate("warBond");
    expect(warBond.effects).toEqual([
      { kind: "gainFunding", amount: 3 },
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
    ]);
    expect(warBond.tags.includes("royal")).toBe(false);
    expect(getCardTemplate("funding").tags.includes("royal")).toBe(true);
    expect(getCardTemplate("crackdown").tags.includes("royal")).toBe(true);
    expect(getCardTemplate("patronageOffice").tags.includes("royal")).toBe(true);
  });

  it("applies updated chapter 2 event solve costs and penalties", () => {
    expect(getEventTemplate("versaillesExpenditure").solve).toEqual({
      kind: "fundingOrCrackdown",
      amount: 3,
    });
    expect(getEventTemplate("provincialNoncompliance").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("risingGrainPrices").solve).toEqual({
      kind: "fundingOrCrackdown",
      amount: 3,
    });
    expect(getEventTemplate("taxResistance").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("frontierGarrisons").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("courtScandal").solve).toEqual({
      kind: "funding",
      amount: 3,
    });
    expect(getEventTemplate("versaillesExpenditure").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "treasuryStat", delta: -2 },
    ]);
    expect(getEventTemplate("courtScandal").penaltiesIfUnresolved).toEqual([
      { kind: "addPlayerStatus", templateId: "royalBan", turns: 1 },
    ]);
    expect(getEventTemplate("expansionRemembered").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("expansionRemembered").onFundSolveEffects).toEqual([
      { kind: "addCardsToDeck", templateId: "fiscalBurden", count: 2 },
    ]);
    expect(getEventTemplate("expansionRemembered").penaltiesIfUnresolved).toEqual([
      { kind: "addCardsToDeck", templateId: "fiscalBurden", count: 3 },
    ]);
  });

  it("uses status-driven effects for draw penalty, royal ban, and retention boost", () => {
    expect(getCardTemplate("taxRebalance").effects).toContainEqual({
      kind: "addPlayerStatus",
      templateId: "drawPenalty",
      turns: 2,
    });
    expect(getCardTemplate("grainRelief").effects).toContainEqual({
      kind: "addPlayerStatus",
      templateId: "grainReliefDrawBoost",
      turns: 1,
    });
    expect(getCardTemplate("grainRelief").effects).toContainEqual({
      kind: "addPlayerStatus",
      templateId: "grainReliefLegitimacyBoost",
      turns: 1,
    });
    expect(getCardTemplate("patronageOffice").effects).toContainEqual({
      kind: "addPlayerStatus",
      templateId: "retentionBoost",
      turns: 3,
    });
    expect(getEventTemplate("courtScandal").penaltiesIfUnresolved).toEqual([
      { kind: "addPlayerStatus", templateId: "royalBan", turns: 1 },
    ]);
  });
});

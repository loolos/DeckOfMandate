import { describe, expect, it } from "vitest";
import { getLevelContent } from "./levelContent";
import { getCardTemplate } from "./cards";
import { getEventSolveFundingAmount, getEventTemplate } from "./events";
import { createInitialState } from "../app/initialState";

describe("secondMandate balance data", () => {
  it("applies requested chapter 2 new-card costs", () => {
    const newIds = [
      "grainRelief",
      "taxRebalance",
      "diplomaticCongress",
      "diplomaticIntervention",
      "fiscalBurden",
    ] as const;
    const expectedCosts = {
      grainRelief: 3,
      taxRebalance: 2,
      diplomaticCongress: 3,
      diplomaticIntervention: 0,
      fiscalBurden: 2,
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
    expect(grainRelief.tags.includes("inflation")).toBe(true);
    expect(grainRelief.effects).toEqual([
      { kind: "addPlayerStatus", templateId: "grainReliefDrawBoost", turns: 1 },
      { kind: "addPlayerStatus", templateId: "grainReliefLegitimacyBoost", turns: 1 },
    ]);

    expect(taxRebalance.tags.includes("inflation")).toBe(true);

    const congress = getCardTemplate("diplomaticCongress");
    expect(congress.effects).toEqual([{ kind: "modResource", resource: "power", delta: 1 }]);

    const diplomaticIntervention = getCardTemplate("diplomaticIntervention");
    expect(diplomaticIntervention.effects).toEqual([]);
    expect(diplomaticIntervention.tags.includes("royal")).toBe(false);
    expect(diplomaticIntervention.tags.includes("extra")).toBe(true);

    const fiscalBurden = getCardTemplate("fiscalBurden");
    expect(fiscalBurden.effects).toEqual([]);
    expect(fiscalBurden.tags.includes("royal")).toBe(false);

    expect(getCardTemplate("funding").tags.includes("royal")).toBe(true);
    expect(getCardTemplate("crackdown").tags.includes("royal")).toBe(true);
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
      amount: 3,
    });
    expect(getEventTemplate("militaryPrestige").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("commercialExpansion").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("talentedAdministrator").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("warWeariness").solve).toEqual({
      kind: "fundingOrCrackdown",
      amount: 3,
    });
    expect(getEventTemplate("provincialNoncompliance").penaltiesIfUnresolved).toEqual([
      { kind: "scheduleDrawModifiers", deltas: [-2, -1, -1] },
    ]);
    expect(getEventTemplate("courtScandal").solve).toEqual({
      kind: "funding",
      amount: 3,
    });
    expect(getEventTemplate("versaillesExpenditure").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "treasuryStat", delta: -2 },
    ]);
    expect(getEventTemplate("courtScandal").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "legitimacy", delta: -1 },
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
    expect(getEventTemplate("cautiousCrown").solve).toEqual({
      kind: "funding",
      amount: 2,
    });
    expect(getEventTemplate("cautiousCrown").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "power", delta: -1 },
    ]);
    expect(getEventTemplate("nymwegenSettlement").solve).toEqual({ kind: "funding", amount: 6 });
    const st = { ...createInitialState(1_234, "secondMandate"), europeAlert: true, europeAlertProgress: 7 };
    expect(getEventSolveFundingAmount(st, "nymwegenSettlement")).toBe(10);
    expect(getEventSolveFundingAmount(st, "ryswickPeace")).toBe(9);
    const stWithNineYearsWar = {
      ...st,
      slots: {
        ...st.slots,
        A: { instanceId: "e_nine_years", templateId: "nineYearsWar" as const, resolved: false },
      },
    };
    expect(getEventSolveFundingAmount(stWithNineYearsWar, "ryswickPeace")).toBe(13);
    expect(getEventTemplate("nymwegenSettlement").harmful).toBe(false);
    expect(getEventTemplate("expansionRemembered").harmful).toBe(false);
    expect(getEventTemplate("cautiousCrown").harmful).toBe(false);
    expect(getEventTemplate("revocationNantes").harmful).toBe(false);
    expect(getEventTemplate("grainReliefCrisis").harmful).toBe(false);
    expect(getEventTemplate("leagueOfAugsburg").harmful).toBe(false);
    expect(getEventTemplate("nineYearsWar").harmful).toBe(true);
    expect(getEventTemplate("ryswickPeace").harmful).toBe(false);
    expect(getEventTemplate("leagueOfAugsburg").crisisPersistence).toBe("continued");
    expect(getEventTemplate("leagueOfAugsburg").continuedDurationTurns).toBe(3);
    expect(getEventTemplate("ryswickPeace").crisisPersistence).toBe("continued");
    expect(getEventTemplate("ryswickPeace").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "legitimacy", delta: -1 },
    ]);
    expect(getEventTemplate("nymwegenSettlement").crisisPersistence).toBe("continued");
    expect(getEventTemplate("nymwegenSettlement").onFundSolveEffects).toEqual([
      { kind: "modResource", resource: "power", delta: -2 },
      { kind: "modResource", resource: "treasuryStat", delta: -1 },
      { kind: "modResource", resource: "legitimacy", delta: -1 },
    ]);
    expect(getEventTemplate("nymwegenSettlement").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "power", delta: -1 },
    ]);
  });
  it("keeps europe-alert extra events out of the normal chapter 2 random pool", () => {
    const pool = getLevelContent("secondMandate").rollableEventIds;
    expect(pool.includes("frontierGarrisons")).toBe(false);
    expect(pool.includes("tradeDisruption")).toBe(false);
    expect(pool.includes("embargoCoalition")).toBe(false);
    expect(pool.includes("mercenaryRaiders")).toBe(false);
  });

  it("chapter 2 starter deck includes two grain relief and two tax rebalance cards", () => {
    const starter = getLevelContent("secondMandate").starterDeckTemplateOrder;
    const grainCount = starter.filter((id) => id === "grainRelief").length;
    const taxCount = starter.filter((id) => id === "taxRebalance").length;
    expect(grainCount).toBe(2);
    expect(taxCount).toBe(2);
  });

  it("uses status-driven effects for draw penalty and royal ban", () => {
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
    expect(getEventTemplate("courtScandal").penaltiesIfUnresolved).toEqual([
      { kind: "modResource", resource: "legitimacy", delta: -1 },
      { kind: "addPlayerStatus", templateId: "royalBan", turns: 1 },
    ]);
  });

  it("uses chapter-2 revocation branch mechanics and religious tension event", () => {
    expect(getEventTemplate("revocationNantes").solve).toEqual({ kind: "nantesPolicyChoice" });
    expect(getEventTemplate("revocationNantes").crisisPersistence).toBe("continued");
    expect(getEventTemplate("revocationNantes").penaltiesIfUnresolved).toEqual([
      { kind: "scheduleNextTurnDrawModifier", delta: -2 },
    ]);
    expect(getEventTemplate("religiousTension").solve).toEqual({ kind: "funding", amount: 2 });
    expect(getCardTemplate("suppressHuguenots").cost).toBe(3);
  });
});

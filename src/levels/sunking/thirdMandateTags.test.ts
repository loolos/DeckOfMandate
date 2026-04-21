import { describe, expect, it } from "vitest";
import { getCardTemplate } from "../../data/cards";

describe("third mandate succession contest tags", () => {
  it("marks all three succession-contest player cards with the successionContest tag", () => {
    expect(getCardTemplate("bourbonMarriageProclamation").tags).toContain("successionContest");
    expect(getCardTemplate("grandAllianceInfiltrationDiplomacy").tags).toContain("successionContest");
    expect(getCardTemplate("italianTheaterTroopRedeploy").tags).toContain("successionContest");
  });
});

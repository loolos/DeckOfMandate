import { describe, expect, it } from "vitest";
import { createInitialState } from "../../../app/initialState";
import { THIRD_MANDATE_LEVEL_ID } from "../../../logic/thirdMandateConstants";
import { applySunkingPlayCardExtras } from "./playCardExtras";

describe("applySunkingPlayCardExtras", () => {
  it("stacks opponent discount when grand alliance infiltration diplomacy is played multiple times", () => {
    const s0 = createInitialState(61_001, THIRD_MANDATE_LEVEL_ID);
    const s1 = applySunkingPlayCardExtras(s0, "grandAllianceInfiltrationDiplomacy");
    const s2 = applySunkingPlayCardExtras(s1, "grandAllianceInfiltrationDiplomacy");

    expect(s1.playerStatuses.filter((st) => st.templateId === "grandAllianceInfiltration")).toHaveLength(1);
    expect(s2.playerStatuses.filter((st) => st.templateId === "grandAllianceInfiltration")).toHaveLength(2);
  });
});

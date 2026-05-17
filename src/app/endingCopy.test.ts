import { describe, expect, it } from "vitest";
import { getLevelDef } from "../data/levels";
import { continuityEndingBodyKeys } from "./endingCopy";

import "../test/setupLevels";

describe("continuityEndingBodyKeys", () => {
  const ending = getLevelDef("thirdMandate").ending;

  it("selects chapter 1 attack and chapter 2 crackdown epilogue keys", () => {
    expect(
      continuityEndingBodyKeys(ending, {
        warOfDevolutionAttacked: true,
        nantesPolicyCarryover: "crackdown",
      }),
    ).toEqual([
      "level.successionWar.ending.continuity.warOfDevolution.attacked",
      "level.successionWar.ending.continuity.nantes.crackdown",
    ]);
  });

  it("selects chapter 1 restraint and chapter 2 tolerance epilogue keys", () => {
    expect(
      continuityEndingBodyKeys(ending, {
        warOfDevolutionAttacked: false,
        nantesPolicyCarryover: "tolerance",
      }),
    ).toEqual([
      "level.successionWar.ending.continuity.warOfDevolution.restrained",
      "level.successionWar.ending.continuity.nantes.tolerance",
    ]);
  });

  it("does not add continuity paragraphs for levels without branch epilogues", () => {
    expect(
      continuityEndingBodyKeys(getLevelDef("firstMandate").ending, {
        warOfDevolutionAttacked: true,
        nantesPolicyCarryover: null,
      }),
    ).toEqual([]);
  });
});

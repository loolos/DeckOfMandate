import { describe, expect, it } from "vitest";
import { getLevelDef } from "../data/levels";
import { continuityEndingBodyKeys } from "./endingCopy";
import type { GameState } from "../types/game";

import "../test/setupLevels";

describe("continuityEndingBodyKeys", () => {
  const ending = getLevelDef("thirdMandate").ending;

  it("selects chapter 1 attack and chapter 2 crackdown epilogue keys", () => {
    expect(
      continuityEndingBodyKeys(ending, {
        warOfDevolutionAttacked: true,
        nantesPolicyCarryover: "crackdown",
        actionLog: [],
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
        actionLog: [],
      }),
    ).toEqual([
      "level.successionWar.ending.continuity.warOfDevolution.restrained",
      "level.successionWar.ending.continuity.nantes.tolerance",
    ]);
  });

  it("adds chapter-3 legacy direct-rule epilogue key when that branch is chosen", () => {
    const actionLog: GameState["actionLog"] = [
      { kind: "eventLouisXivLegacyChoice", id: "log_legacy", turn: 12, slot: "A", directRule: true },
    ];
    expect(
      continuityEndingBodyKeys(ending, {
        warOfDevolutionAttacked: false,
        nantesPolicyCarryover: null,
        actionLog,
      }),
    ).toEqual([
      "level.successionWar.ending.continuity.warOfDevolution.restrained",
      "level.successionWar.ending.chapter3LouisXivLegacy.youngKingDirectRule",
    ]);
  });

  it("adds chapter-3 legacy regency epilogue key on unresolved year-end fallback", () => {
    const actionLog: GameState["actionLog"] = [
      {
        kind: "eventYearEndPenalty",
        id: "log_legacy_eoy",
        turn: 12,
        slot: "A",
        templateId: "louisXivLegacy1715",
        effects: [],
      },
    ];
    expect(
      continuityEndingBodyKeys(ending, {
        warOfDevolutionAttacked: true,
        nantesPolicyCarryover: null,
        actionLog,
      }),
    ).toEqual([
      "level.successionWar.ending.continuity.warOfDevolution.attacked",
      "level.successionWar.ending.chapter3LouisXivLegacy.regencyCustody",
    ]);
  });

  it("does not add continuity paragraphs for levels without branch epilogues", () => {
    expect(
      continuityEndingBodyKeys(getLevelDef("firstMandate").ending, {
        warOfDevolutionAttacked: true,
        nantesPolicyCarryover: null,
        actionLog: [],
      }),
    ).toEqual([]);
  });
});

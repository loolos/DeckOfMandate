import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider } from "../../../locales";
import { createInitialState } from "../../../app/initialState";
import type { GameState } from "../../../types/game";
import type { CampaignPreRunRequest } from "../../campaignUiRegistry";
import {
  buildLevel2StateFromDraft,
  createStandaloneLevel2Draft,
  toggleContinuityCardRemoval,
  validateLevel2Draft,
} from "../chapter2Transition";
import { ChapterRefitScreen } from "./ChapterRefitScreen";

import "../../../test/setupLevels";

function render(request: CampaignPreRunRequest): string {
  return renderToStaticMarkup(
    <I18nProvider>
      <ChapterRefitScreen request={request} onConfirm={() => {}} onCancel={() => {}} />
    </I18nProvider>,
  );
}

describe("ChapterRefitScreen", () => {
  it("renders the chapter-2 standalone refit with carryover rows and new cards", () => {
    const html = render({ kind: "standaloneStart", levelId: "secondMandate", seed: 7 });
    expect(html).toContain("level2-refit-title");
    expect(html).toContain("refitRow");
    expect(html).not.toContain("MISSING");
  });

  it("renders the chapter-3 standalone refit", () => {
    const html = render({ kind: "standaloneStart", levelId: "thirdMandate", seed: 7 });
    expect(html).toContain("level3-refit-title");
    expect(html).toContain("refitRow");
  });

  it("renders a continuation from a finished chapter-1 run", () => {
    const finished: GameState = { ...createInitialState(11, "firstMandate"), outcome: "victory" };
    const html = render({ kind: "continueFromRun", state: finished });
    expect(html).toContain("level2-refit-title");
  });

  it("renders nothing for a level that needs no pre-run screen", () => {
    expect(render({ kind: "standaloneStart", levelId: "firstMandate", seed: 1 })).toBe("");
  });

  it("builds a playable opening state from the draft the screen confirms", () => {
    // Static rendering cannot click Confirm, so exercise the same helpers the confirm path uses.
    const draft = createStandaloneLevel2Draft(3);
    const opening = buildLevel2StateFromDraft(draft);
    expect(opening.levelId).toBe("secondMandate");
    expect(opening.phase).toBe("action");
    expect(opening.outcome).toBe("playing");
    expect(opening.deck.length + opening.hand.length).toBeGreaterThan(0);
    expect(validateLevel2Draft(draft).isValid).toBe(true);
  });

  it("reports removed carryover cards as indices into the carryover list", () => {
    const draft = createStandaloneLevel2Draft(3);
    const target = draft.carryoverCards[1];
    expect(target).toBeDefined();
    const edited = toggleContinuityCardRemoval(draft, target!.instanceId);
    expect(edited.removedCarryoverIds).toContain(target!.instanceId);
    const indices = edited.carryoverCards
      .map((card, idx) => (edited.removedCarryoverIds.includes(card.instanceId) ? idx : -1))
      .filter((idx) => idx >= 0);
    expect(indices).toEqual([1]);
  });
});

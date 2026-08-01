/**
 * Invariant guard: every delayed ("takes effect from next turn") consequence a card or an
 * event can produce must travel as an `addPlayerStatus`, so the player can see it in the
 * status bar and so it ticks on the single documented schedule in `playerStatusTick.ts`.
 *
 * Hidden per-turn counters (`nextTurnDrawModifier`, `scheduledDrawModifiers`,
 * `nextTurnFundingIncomeModifier`) used to carry these; they are gone. This test fails if a
 * future effect kind smuggles one back into card or event content.
 *
 * Out of scope, deliberately: `pendingMajorCrisis` (an unresolved `powerVacuum` transforms
 * its own board slot next Event phase — a board change, not a hidden modifier on the player)
 * and `opponentNextTurnDrawModifier` (opponent-side draw scheduling, which no card or event
 * currently produces and which a *player* status could not represent).
 */
import { describe, expect, it } from "vitest";
import { cardTemplates } from "../templates/cards";
import { eventTemplates } from "../templates/events";
import { statusTemplates } from "../templates/statusTemplates";
import { opponentTemplatesToAppliedEffects } from "./opponentHabsburg";
import type { CardTemplateId } from "../../types/card";
import type { Effect } from "../../types/effect";

/** Effect kinds that resolve entirely at the moment they are applied. */
const IMMEDIATE_EFFECT_KINDS: ReadonlySet<Effect["kind"]> = new Set<Effect["kind"]>([
  "modResource",
  "gainFunding",
  "drawCards",
  "addCardsToDeck",
  "modSuccessionTrack",
  "modEuropeAlertProgress",
  "modOpponentStrength",
  "opponentHandDiscardNow",
]);

function assertNoHiddenSchedulers(effects: readonly Effect[], label: string): void {
  for (const effect of effects) {
    if (effect.kind === "addPlayerStatus") {
      expect(statusTemplates[effect.templateId], `${label}: unknown status ${effect.templateId}`).toBeTruthy();
      expect(effect.turns, `${label}: ${effect.templateId} must last at least one turn`).toBeGreaterThan(0);
      continue;
    }
    expect(
      IMMEDIATE_EFFECT_KINDS.has(effect.kind),
      `${label}: "${effect.kind}" is neither immediate nor a status — express delayed effects as addPlayerStatus`,
    ).toBe(true);
  }
}

describe("delayed effects are always statuses", () => {
  it("no card effect defers anything outside a status", () => {
    for (const [id, tmpl] of Object.entries(cardTemplates)) {
      assertNoHiddenSchedulers(tmpl.effects, `card ${id}`);
    }
  });

  it("no event effect defers anything outside a status", () => {
    for (const [id, tmpl] of Object.entries(eventTemplates)) {
      assertNoHiddenSchedulers(tmpl.penaltiesIfUnresolved, `event ${id} penaltiesIfUnresolved`);
      assertNoHiddenSchedulers(tmpl.onFundSolveEffects ?? [], `event ${id} onFundSolveEffects`);
    }
  });

  it("no Habsburg opponent card defers anything outside a status", () => {
    const opponentIds = (Object.keys(cardTemplates) as CardTemplateId[]).filter((id) =>
      cardTemplates[id].tags.includes("opponent"),
    );
    expect(opponentIds.length).toBeGreaterThan(0);
    for (const id of opponentIds) {
      assertNoHiddenSchedulers(opponentTemplatesToAppliedEffects([id]), `opponent card ${id}`);
    }
  });

  it("every status template renders a concrete effect the status bar can describe", () => {
    for (const [id, tmpl] of Object.entries(statusTemplates)) {
      if (tmpl.kind === "blockCardTag") {
        expect(tmpl.blockedTag, `status ${id} must name the blocked tag`).toBeTruthy();
        continue;
      }
      if (tmpl.kind === "beginYearResourceDelta") {
        expect(tmpl.resource, `status ${id} must name the resource it shifts`).toBeTruthy();
      }
      expect(typeof tmpl.delta, `status ${id} must carry a numeric delta`).toBe("number");
    }
  });
});

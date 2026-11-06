import { getCardTemplate } from "../../../../data/cards";
import type { Resources } from "../../../../types/game";
import type { CardTemplateId } from "../../../types/card";
import { CONTINUITY_REFIT_MAX_CARD_REMOVALS } from "../../types/continuity";

// ---------------------------------------------------------------- refit

type CarryoverDraftLike = {
  carryoverCards: readonly {
    instanceId: string;
    templateId: CardTemplateId;
    inflationDelta: number;
    remainingUses: number | null;
    totalUses: number | null;
  }[];
  removedCarryoverIds: readonly string[];
};

const HARD_PROTECTED_REFIT_TEMPLATES = new Set<CardTemplateId>([
  "funding",
  "crackdown",
  "diplomaticIntervention",
]);

const SOFT_PROTECTED_REFIT_TEMPLATES = new Set<CardTemplateId>([
  "development",
  "reform",
  "ceremony",
  "taxRebalance",
  "grainRelief",
  "diplomaticCongress",
  "jesuitCollege",
  "usurpationEdict",
  "bourbonMarriageProclamation",
  "grandAllianceInfiltrationDiplomacy",
  "italianTheaterTroopRedeploy",
  "suppressHuguenots",
]);

function refitRemovalSort(
  a: { instanceId: string; templateId: CardTemplateId; inflationDelta: number },
  b: { instanceId: string; templateId: CardTemplateId; inflationDelta: number },
): number {
  if (a.inflationDelta !== b.inflationDelta) return b.inflationDelta - a.inflationDelta;
  const ac = getCardTemplate(a.templateId).cost;
  const bc = getCardTemplate(b.templateId).cost;
  if (ac !== bc) return bc - ac;
  return a.instanceId.localeCompare(b.instanceId);
}

export function withAutoInflationRefit<T extends CarryoverDraftLike>(draft: T): T {
  if (draft.carryoverCards.length <= 1) return draft;
  const maxRemovals = Math.min(
    CONTINUITY_REFIT_MAX_CARD_REMOVALS,
    draft.carryoverCards.length - 1,
  );
  if (maxRemovals <= 0) return draft;
  const inflationCards = draft.carryoverCards.filter((card) => card.inflationDelta > 0);
  if (inflationCards.length === 0) return draft;

  // Pass 1: remove only non-protected, inflated cards.
  const pass1 = inflationCards
    .filter(
      (card) =>
        !HARD_PROTECTED_REFIT_TEMPLATES.has(card.templateId) &&
        !SOFT_PROTECTED_REFIT_TEMPLATES.has(card.templateId),
    )
    .sort(refitRemovalSort);

  const removedCarryoverIds: string[] = pass1.slice(0, maxRemovals).map((card) => card.instanceId);
  if (removedCarryoverIds.length >= maxRemovals) {
    return { ...draft, removedCarryoverIds };
  }

  // Pass 2: if removal slots remain, trim duplicated high-inflation soft-protected cards.
  const countsByTemplate = new Map<CardTemplateId, number>();
  for (const card of draft.carryoverCards) {
    countsByTemplate.set(card.templateId, (countsByTemplate.get(card.templateId) ?? 0) + 1);
  }
  const alreadyRemoved = new Set(removedCarryoverIds);
  const pass2 = inflationCards
    .filter((card) => {
      if (alreadyRemoved.has(card.instanceId)) return false;
      if (HARD_PROTECTED_REFIT_TEMPLATES.has(card.templateId)) return false;
      if (!SOFT_PROTECTED_REFIT_TEMPLATES.has(card.templateId)) return false;
      if (card.inflationDelta < 3) return false;
      return (countsByTemplate.get(card.templateId) ?? 0) > 1;
    })
    .sort(refitRemovalSort);

  for (const card of pass2) {
    if (removedCarryoverIds.length >= maxRemovals) break;
    removedCarryoverIds.push(card.instanceId);
  }
  if (removedCarryoverIds.length === 0) return draft;
  return { ...draft, removedCarryoverIds };
}

/**
 * Chapter-3 refit: unlike the generic inflation refit, always spend all
 * removal slots. Chapter 3 is a deck-cycling race — the eight new
 * succession-contest cards must come around as often as possible — so every
 * removed low-value carryover card directly raises track-defense throughput.
 */
function chapter3RemovalScore(
  card: {
    templateId: CardTemplateId;
    inflationDelta: number;
    remainingUses: number | null;
  },
  entryLegitimacy: number,
): number {
  // Depleted limited-use cards are pure dead weight.
  if (card.remainingUses !== null && card.remainingUses <= 0) return 1_000;
  // With a thin legitimacy buffer the legitimacy cards are the survival kit —
  // never trade them away for deck speed.
  const legitimacyFragile = entryLegitimacy <= 9;
  const base = (() => {
    switch (card.templateId) {
      case "jesuitCollege":
        return legitimacyFragile ? 0 : 30;
      case "ceremony":
        return legitimacyFragile ? 0 : 25;
      case "grainRelief":
        return legitimacyFragile ? 0 : 18;
      case "taxRebalance":
        return 15; // draw-penalty side effect slows cycling
      case "suppressHuguenots":
        return 40;
      case "diplomaticCongress":
        return 4;
      case "reform":
        return 3;
      case "development":
        return 2;
      default:
        return 0;
    }
  })();
  return base + card.inflationDelta * 3;
}

export function withChapter3DeckThinningRefit<T extends CarryoverDraftLike & { resources: Resources }>(
  draft: T,
): T {
  if (draft.carryoverCards.length <= 1) return draft;
  const maxRemovals = Math.min(
    CONTINUITY_REFIT_MAX_CARD_REMOVALS,
    draft.carryoverCards.length - 1,
  );
  if (maxRemovals <= 0) return draft;
  const entryLegitimacy = draft.resources.legitimacy;
  const ranked = [...draft.carryoverCards].sort((a, b) => {
    const sa = chapter3RemovalScore(a, entryLegitimacy);
    const sb = chapter3RemovalScore(b, entryLegitimacy);
    if (sa !== sb) return sb - sa;
    return a.instanceId.localeCompare(b.instanceId);
  });
  const removedCarryoverIds = ranked.slice(0, maxRemovals).map((card) => card.instanceId);
  return { ...draft, removedCarryoverIds };
}

import type { LevelId } from "../data/levels";
import type { CardInstance, CardTemplateId } from "../types/card";
import type { CardUseState, GameState } from "../types/game";

const LIMITED_CARD_TOTAL_USES = 3;
const CHAPTER2_STARTING_ROYAL_REMAINING_USES = 1;

type LimitedUseTemplateId = "funding" | "crackdown" | "diplomaticIntervention";

export function isLimitedUseTemplateId(templateId: CardTemplateId): templateId is LimitedUseTemplateId {
  return templateId === "funding" || templateId === "crackdown" || templateId === "diplomaticIntervention";
}

function getDefaultRemainingUses(levelId: LevelId, templateId: LimitedUseTemplateId): number {
  if ((templateId === "funding" || templateId === "crackdown") && levelId === "secondMandate") {
    return CHAPTER2_STARTING_ROYAL_REMAINING_USES;
  }
  return LIMITED_CARD_TOTAL_USES;
}

export function createInitialCardUseState(
  levelId: LevelId,
  templateId: CardTemplateId,
  remainingOverride?: number,
): CardUseState | null {
  if (!isLimitedUseTemplateId(templateId)) return null;
  const defaultRemaining = getDefaultRemainingUses(levelId, templateId);
  const remaining = Math.max(
    0,
    Math.min(
      LIMITED_CARD_TOTAL_USES,
      Number.isFinite(remainingOverride) ? Number(remainingOverride) : defaultRemaining,
    ),
  );
  return {
    remaining,
    total: LIMITED_CARD_TOTAL_USES,
  };
}

export function buildDefaultCardUsesById(
  levelId: LevelId,
  cardsById: Record<string, CardInstance>,
): Record<string, CardUseState> {
  const cardUsesById: Record<string, CardUseState> = {};
  for (const [id, inst] of Object.entries(cardsById)) {
    const usage = createInitialCardUseState(levelId, inst.templateId);
    if (!usage) continue;
    cardUsesById[id] = usage;
  }
  return cardUsesById;
}

export function getCardUseStateForInstance(state: GameState, cardInstanceId: string): CardUseState | null {
  return state.cardUsesById[cardInstanceId] ?? null;
}

export function normalizeCardUsesById(state: Pick<GameState, "levelId" | "cardsById" | "cardUsesById">) {
  const normalized: Record<string, CardUseState> = {};
  for (const [id, inst] of Object.entries(state.cardsById)) {
    const existing = state.cardUsesById[id];
    const usage = createInitialCardUseState(
      state.levelId,
      inst.templateId,
      existing?.remaining ?? existing?.total,
    );
    if (!usage) continue;
    normalized[id] = usage;
  }
  return normalized;
}

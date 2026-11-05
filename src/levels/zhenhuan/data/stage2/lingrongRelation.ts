// 陵容关系

export type LingrongTier = "close" | "distant" | "resentful";

export const LINGRONG = { min: -4, max: 4, /** 冷落 never pushes below this. */ neglectFloor: -1 };

export const TIER_LABEL: Record<LingrongTier, string> = { close: "亲厚", distant: "生分", resentful: "怨怼" };
export const TIER_EMOJI: Record<LingrongTier, string> = { close: "🤝", distant: "😐", resentful: "🥀" };

export function lingrongTier(relation: number): LingrongTier {
  if (relation >= 2) return "close";
  if (relation <= -2) return "resentful";
  return "distant";
}

/** 舒痕胶有害概率 (§5.5). */
export const SHUHENJIAO_HARM_CHANCE: Record<LingrongTier, number> = { close: 0, distant: 0.3, resentful: 0.6 };
/** 无害时疤痕尽消（圣宠 +1）的概率：亲厚必定；生分 30%（有害 30% 之外的另一段）。 */
export const SHUHENJIAO_HEAL_CHANCE: Record<LingrongTier, number> = { close: 1, distant: 0.3, resentful: 0 };

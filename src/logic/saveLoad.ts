import type { GameState } from "../types/game";

const SAVE_KEY = "deck-of-mandate.save.v1";

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota / privacy mode */
  }
}

/** Minimal structural check so a stale save from an older build doesn't crash the reducer. */
function isValidGameState(v: unknown): v is GameState {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.levelId === "string" &&
    typeof s.turn === "number" &&
    typeof s.phase === "string" &&
    typeof s.outcome === "string" &&
    Array.isArray(s.deck) &&
    Array.isArray(s.hand) &&
    Array.isArray(s.discard) &&
    s.resources !== null &&
    typeof s.resources === "object" &&
    typeof s.successionTrack === "number" &&
    "utrechtTreatyCountdown" in s &&
    "utrechtSettlementTier" in s &&
    "successionOutcomeTier" in s &&
    "greatPowerEncirclementHighPressureApplied" in s
  );
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidGameState(parsed)) {
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

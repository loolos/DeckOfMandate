const TUTORIAL_ON_LEVEL_ENTRY_KEY = "deck-of-mandate.tutorialOnLevelEntry.v1";

export function readTutorialOnLevelEntry(): boolean {
  try {
    const raw = localStorage.getItem(TUTORIAL_ON_LEVEL_ENTRY_KEY);
    return raw === "1" || raw === "true";
  } catch {
    return false;
  }
}

export function writeTutorialOnLevelEntry(enabled: boolean): void {
  try {
    localStorage.setItem(TUTORIAL_ON_LEVEL_ENTRY_KEY, enabled ? "1" : "0");
  } catch {
    /* ignore quota / privacy mode */
  }
}

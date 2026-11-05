/**
 * Which build wrote the autosave. Saves are seed + action lists replayed on load, so a later build
 * can usually still read them; the build id is only consulted after a replay fails, to tell the
 * player whether the save is from an older build (rules changed), a newer one (this tab is stale),
 * or simply broken.
 */
const BUILD_KEY = "deck-of-mandate.zhenhuan.save.build";

/** Why an autosave could not be continued. `savedAt` is the writing build's date, when known. */
export type SaveFailure = { readonly kind: "outdated" | "newer" | "corrupt"; readonly savedAt: string | null };

export function currentBuild(): string {
  return typeof __BUILD_ID__ === "string" ? __BUILD_ID__ : "dev";
}

export function writeSaveBuild(): void {
  try {
    localStorage.setItem(BUILD_KEY, currentBuild());
  } catch {
    /* ignore quota / privacy mode */
  }
}

export function readSaveBuild(): string | null {
  try {
    return localStorage.getItem(BUILD_KEY);
  } catch {
    return null;
  }
}

export function clearSaveBuild(): void {
  try {
    localStorage.removeItem(BUILD_KEY);
  } catch {
    /* ignore */
  }
}

function buildDate(build: string | null): string | null {
  const ms = Number(build);
  if (!build || !Number.isFinite(ms) || ms <= 0) return null;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Called only after a save failed to replay. A save without a build id predates this check, so it
 * counts as older. Build ids are build timestamps, so they also order the two builds.
 */
export function classifySaveFailure(saved: string | null, current: string = currentBuild()): SaveFailure {
  if (saved === null) return { kind: "outdated", savedAt: null };
  const savedAt = buildDate(saved);
  if (saved === current) return { kind: "corrupt", savedAt };
  const a = Number(saved);
  const b = Number(current);
  if (Number.isFinite(a) && Number.isFinite(b) && a > b) return { kind: "newer", savedAt };
  return { kind: "outdated", savedAt };
}

/** Menu notice for a save that could not be continued. */
export function saveFailureMessage(f: SaveFailure): string {
  const when = f.savedAt ? `（存于 ${f.savedAt} 的版本）` : "";
  switch (f.kind) {
    case "outdated":
      return `游戏已更新，上次的存档${when}在新版本中无法继续，已清除。`;
    case "newer":
      return `上次的存档${when}来自更新的版本，请刷新页面后再继续。`;
    case "corrupt":
      return "上次的存档无法读取，已清除。";
  }
}

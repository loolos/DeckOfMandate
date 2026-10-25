/**
 * GitHub Pages serves index.html with a ~10 minute browser cache, so a returning player can
 * keep running an older build. Compare the embedded build id with /version.json (fetched
 * uncached); the ⋯ menu offers this as a manual "检查更新".
 */
export type UpdateStatus = "latest" | "outdated" | "error";

export async function checkForUpdate(): Promise<UpdateStatus> {
  try {
    const url = `${import.meta.env.BASE_URL}version.json?t=${Date.now()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return "error";
    const data = (await res.json()) as { id?: string };
    if (!data.id) return "error";
    return data.id === __BUILD_ID__ ? "latest" : "outdated";
  } catch {
    return "error";
  }
}

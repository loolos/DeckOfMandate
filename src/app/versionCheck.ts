/**
 * GitHub Pages serves index.html with a ~10 minute browser cache, so a returning player can
 * keep running an older build. Compare the embedded build id with /version.json (fetched
 * uncached) on load and whenever the tab becomes visible; if they differ, show a banner
 * instead of reloading so an in-progress run is never lost.
 */
const CHECK_MIN_INTERVAL_MS = 60_000;

let lastCheck = 0;
let bannerShown = false;

function showBanner(): void {
  if (bannerShown) return;
  bannerShown = true;
  const bar = document.createElement("div");
  bar.setAttribute("role", "status");
  bar.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;z-index:99999;display:flex;gap:12px;justify-content:center;align-items:center;padding:10px 16px;background:#222;color:#fff;font-size:14px;";
  const text = document.createElement("span");
  text.textContent = "发现新版本 / A new version is available";
  const btn = document.createElement("button");
  btn.textContent = "刷新 / Reload";
  btn.onclick = () => location.reload();
  bar.append(text, btn);
  document.body.appendChild(bar);
}

async function check(): Promise<void> {
  const now = Date.now();
  if (bannerShown || now - lastCheck < CHECK_MIN_INTERVAL_MS) return;
  lastCheck = now;
  try {
    const url = `${import.meta.env.BASE_URL}version.json?t=${now}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as { id?: string };
    if (data.id && data.id !== __BUILD_ID__) showBanner();
  } catch {
    /* offline or dev server: ignore */
  }
}

export function startVersionCheck(): void {
  if (import.meta.env.DEV) return;
  void check();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void check();
  });
}

/**
 * Overflowing popups open at their very top and then drift slowly downward so the whole text can be read
 * without touching anything. Any manual interaction (wheel, touch, pointer, key, or a scroll we did not cause)
 * permanently stops the drift for that element.
 *
 * Installed once at the app root: it finds `[role="dialog"]` and `[data-auto-scroll]` elements and their
 * scrollable descendants, so individual popups need no wiring.
 */

/** Pixels per second. Slow enough to read along with. */
export const AUTO_SCROLL_SPEED = 22;
/** Pause at the top before drifting, ms. */
export const AUTO_SCROLL_DELAY_MS = 1800;

/** Next scroll offset after `dtMs`, clamped to `max`. */
export function nextAutoScrollTop(pos: number, dtMs: number, max: number, speed = AUTO_SCROLL_SPEED): number {
  if (max <= 0) return 0;
  return Math.min(max, Math.max(0, pos + (speed * dtMs) / 1000));
}

const STOP_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown", "mousedown"] as const;

function maxScroll(el: HTMLElement): number {
  return el.scrollHeight - el.clientHeight;
}

/** Start drifting `el`; returns a stop function. */
export function startAutoScroll(el: HTMLElement): () => void {
  let stopped = false;
  let raf = 0;
  let last = 0;
  let pos = 0;
  let waitedMs = 0;
  el.scrollTop = 0;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    for (const ev of STOP_EVENTS) el.removeEventListener(ev, stop);
    el.removeEventListener("scroll", onScroll);
  };
  /** A scroll that does not match what we last set came from the player (scrollbar drag, anchor, ...). */
  const onScroll = () => {
    if (Math.abs(el.scrollTop - pos) > 2) stop();
  };
  const tick = (now: number) => {
    if (stopped) return;
    const dt = last ? Math.min(now - last, 100) : 0;
    last = now;
    const max = maxScroll(el);
    if (max > 1) {
      if (waitedMs < AUTO_SCROLL_DELAY_MS) waitedMs += dt;
      else {
        pos = nextAutoScrollTop(pos, dt, max);
        el.scrollTop = pos;
        if (pos >= max) return stop();
      }
    }
    raf = requestAnimationFrame(tick);
  };
  for (const ev of STOP_EVENTS) el.addEventListener(ev, stop, { passive: true });
  el.addEventListener("scroll", onScroll, { passive: true });
  raf = requestAnimationFrame(tick);
  return stop;
}

function isScrollable(el: HTMLElement): boolean {
  const oy = getComputedStyle(el).overflowY;
  return oy === "auto" || oy === "scroll";
}

export function installPopupAutoScroll(): () => void {
  if (typeof window === "undefined" || typeof MutationObserver === "undefined") return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  const active = new WeakSet<HTMLElement>();
  let queued = false;

  const scan = () => {
    queued = false;
    document.querySelectorAll<HTMLElement>('[role="dialog"], [data-auto-scroll]').forEach((root) => {
      for (const el of [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))]) {
        if (active.has(el) || !isScrollable(el)) continue;
        active.add(el);
        const stop = startAutoScroll(el);
        // drop the controller once the popup leaves the DOM
        const gone = new MutationObserver(() => {
          if (!el.isConnected) {
            stop();
            gone.disconnect();
          }
        });
        gone.observe(document.body, { childList: true, subtree: true });
      }
    });
  };
  const obs = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scan);
  });
  obs.observe(document.body, { childList: true, subtree: true });
  scan();
  return () => obs.disconnect();
}

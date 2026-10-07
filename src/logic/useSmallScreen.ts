import { useCallback, useEffect, useState } from "react";

/**
 * Small-screen compact cards are intended for touch devices only.
 * Desktop browser zoom should change visual scale, not force mobile card thumbnails.
 * The player can override the automatic choice either way (略缩模式 on a desktop, off on a phone).
 */
const MOBILE_MEDIA_QUERY = "(max-width: 760px) and (hover: none), (max-width: 760px) and (pointer: coarse)";
const FORCE_SMALL_SCREEN_STORAGE_KEY = "deckOfMandate_ui_forceSmallScreen";
const FORCE_SMALL_SCREEN_EVENT = "deckOfMandate:forceSmallScreenChanged";

/** "on" / "off" override the device default; null follows it. Stored as "1" / "0" / absent. */
type SmallScreenOverride = "on" | "off" | null;

function readOverrideFromStorage(): SmallScreenOverride {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(FORCE_SMALL_SCREEN_STORAGE_KEY);
    return v === "1" ? "on" : v === "0" ? "off" : null;
  } catch {
    return null;
  }
}

function writeOverrideToStorage(next: SmallScreenOverride): void {
  if (typeof window === "undefined") return;
  try {
    if (next === null) {
      window.localStorage.removeItem(FORCE_SMALL_SCREEN_STORAGE_KEY);
    } else {
      window.localStorage.setItem(FORCE_SMALL_SCREEN_STORAGE_KEY, next === "on" ? "1" : "0");
    }
  } catch {
    /* ignore storage failures */
  }
}

function useSmallScreenOverride(): [SmallScreenOverride, (next: SmallScreenOverride) => void] {
  const [override, setOverride] = useState(readOverrideFromStorage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setOverride(readOverrideFromStorage());
    const onStorage = (event: StorageEvent) => {
      if (event.key !== FORCE_SMALL_SCREEN_STORAGE_KEY) return;
      sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(FORCE_SMALL_SCREEN_EVENT, sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(FORCE_SMALL_SCREEN_EVENT, sync);
    };
  }, []);

  const update = useCallback((next: SmallScreenOverride) => {
    writeOverrideToStorage(next);
    setOverride(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(FORCE_SMALL_SCREEN_EVENT));
    }
  }, []);

  return [override, update];
}

function useMobileViewport(): boolean {
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(MOBILE_MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) => setIsSmallScreen(event.matches);
    setIsSmallScreen(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isSmallScreen;
}

/**
 * The 略缩模式 switch: whether it is on right now, and a setter. Choosing the device default
 * clears the override, so the mode keeps following the device (e.g. after resizing).
 */
export function useSmallScreenToggle(): [boolean, (next: boolean) => void] {
  const [override, setOverride] = useSmallScreenOverride();
  const device = useMobileViewport();
  const on = override === "on" ? true : override === "off" ? false : device;
  const set = useCallback((next: boolean) => setOverride(next === device ? null : next ? "on" : "off"), [device, setOverride]);
  return [on, set];
}

export function useSmallScreen(): boolean {
  return useSmallScreenToggle()[0];
}

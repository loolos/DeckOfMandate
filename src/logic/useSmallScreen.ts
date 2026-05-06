import { useCallback, useEffect, useState } from "react";

/**
 * Small-screen compact cards are intended for touch devices only.
 * Desktop browser zoom should change visual scale, not force mobile card thumbnails.
 */
const MOBILE_MEDIA_QUERY = "(max-width: 760px) and (hover: none), (max-width: 760px) and (pointer: coarse)";
const FORCE_SMALL_SCREEN_STORAGE_KEY = "deckOfMandate_ui_forceSmallScreen";
const FORCE_SMALL_SCREEN_EVENT = "deckOfMandate:forceSmallScreenChanged";

function readForceSmallScreenFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FORCE_SMALL_SCREEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeForceSmallScreenToStorage(force: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (force) {
      window.localStorage.setItem(FORCE_SMALL_SCREEN_STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(FORCE_SMALL_SCREEN_STORAGE_KEY);
    }
  } catch {
    /* ignore storage failures */
  }
}

export function useForcedSmallScreenMode(): [boolean, (next: boolean) => void] {
  const [forcedSmallScreen, setForcedSmallScreen] = useState(readForceSmallScreenFromStorage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setForcedSmallScreen(readForceSmallScreenFromStorage());
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

  const updateForcedSmallScreen = useCallback((next: boolean) => {
    writeForceSmallScreenToStorage(next);
    setForcedSmallScreen(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(FORCE_SMALL_SCREEN_EVENT));
    }
  }, []);

  return [forcedSmallScreen, updateForcedSmallScreen];
}

export function useSmallScreen(): boolean {
  const [forcedSmallScreen] = useForcedSmallScreenMode();
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

  return forcedSmallScreen || isSmallScreen;
}

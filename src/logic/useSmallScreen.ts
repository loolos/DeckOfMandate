import { useCallback, useEffect, useState } from "react";

/**
 * 略缩模式 (compact cards) is off by default on every device; the player turns it on (or off again)
 * with the toggle, and the choice is remembered.
 */
const FORCE_SMALL_SCREEN_STORAGE_KEY = "deckOfMandate_ui_forceSmallScreen";
const FORCE_SMALL_SCREEN_EVENT = "deckOfMandate:forceSmallScreenChanged";

/** Stored as "1" when on; absent (or any other value) means off. */
function readFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(FORCE_SMALL_SCREEN_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeToStorage(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (on) {
      window.localStorage.setItem(FORCE_SMALL_SCREEN_STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(FORCE_SMALL_SCREEN_STORAGE_KEY);
    }
  } catch {
    /* ignore storage failures */
  }
}

/** The 略缩模式 switch: whether it is on right now, and a setter (shared by every toggle on the page). */
export function useSmallScreenToggle(): [boolean, (next: boolean) => void] {
  const [on, setOn] = useState(readFromStorage);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setOn(readFromStorage());
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

  const update = useCallback((next: boolean) => {
    writeToStorage(next);
    setOn(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(FORCE_SMALL_SCREEN_EVENT));
    }
  }, []);

  return [on, update];
}

export function useSmallScreen(): boolean {
  return useSmallScreenToggle()[0];
}

import { useEffect, useState } from "react";

/**
 * Small-screen compact cards are intended for touch devices only.
 * Desktop browser zoom should change visual scale, not force mobile card thumbnails.
 */
const MOBILE_MEDIA_QUERY = "(max-width: 760px) and (hover: none), (max-width: 760px) and (pointer: coarse)";

export function useSmallScreen(): boolean {
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

import { useEffect, useState } from "react";
import { musicUrl, type MusicMood } from "./music";
import styles from "./zhenhuan.module.css";

const MUTE_KEY = "zhenhuan.bgm.muted";
const VOLUME = 0.5;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * One track at a time, each played through once. A mood change never interrupts the track
 * that is playing: when it ends, the track for whatever mood is wanted *then* starts next.
 */
let wanted: MusicMood = "calm";
let playing: HTMLAudioElement | null = null;

function startWanted() {
  if (playing) return;
  const url = musicUrl(wanted);
  if (!url) return;
  const el = new Audio(url);
  el.volume = VOLUME;
  playing = el;
  el.addEventListener("ended", () => {
    if (playing !== el) return;
    playing = null;
    startWanted();
  });
  // Browsers block audio before the first click; the play() rejection is expected then.
  el.play().catch(() => {
    if (playing === el) playing = null;
  });
}

function stopAll() {
  const el = playing;
  playing = null;
  el?.pause();
}

/** Keeps `mood` as the next track to play; starts on the first user gesture if autoplay is blocked. */
export function useBgm(mood: MusicMood): { muted: boolean; setMuted: (muted: boolean) => void } {
  const [muted, setMutedState] = useState(readMuted);

  const setMuted = (next: boolean) => {
    setMutedState(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? "1" : "0");
    } catch {
      /* storage unavailable: preference just isn't remembered */
    }
  };

  useEffect(() => {
    wanted = mood;
    if (muted) {
      stopAll();
      return;
    }
    startWanted();
    window.addEventListener("pointerdown", startWanted, { once: true });
    return () => window.removeEventListener("pointerdown", startWanted);
  }, [mood, muted]);

  useEffect(() => stopAll, []);

  return { muted, setMuted };
}

export function MusicToggle({ muted, onChange }: { muted: boolean; onChange: (muted: boolean) => void }) {
  return (
    <button
      type="button"
      className={styles.musicToggle}
      aria-pressed={!muted}
      aria-label={muted ? "开启背景音乐" : "关闭背景音乐"}
      title={muted ? "开启背景音乐" : "关闭背景音乐"}
      onClick={() => onChange(!muted)}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}

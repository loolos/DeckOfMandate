import { useEffect, useState } from "react";
import { musicUrl, type MusicMood } from "./music";
import styles from "./zhenhuan.module.css";

const MUTE_KEY = "zhenhuan.bgm.muted";
const VOLUME = 0.5;
const FADE_MS = 1200;
const FADE_STEP_MS = 50;

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

/** One audio element at a time; switching moods cross-fades (fade out, then fade the next one in). */
let current: { mood: MusicMood; el: HTMLAudioElement } | null = null;
let fadeTimer: number | undefined;

function fade(el: HTMLAudioElement, to: number, done?: () => void) {
  window.clearInterval(fadeTimer);
  const step = ((to - el.volume) * FADE_STEP_MS) / FADE_MS;
  fadeTimer = window.setInterval(() => {
    const next = el.volume + step;
    if ((step >= 0 && next >= to) || (step < 0 && next <= to)) {
      el.volume = to;
      window.clearInterval(fadeTimer);
      done?.();
    } else {
      el.volume = Math.min(1, Math.max(0, next));
    }
  }, FADE_STEP_MS);
}

function stopCurrent(then: () => void) {
  const prev = current;
  current = null;
  if (!prev) return then();
  fade(prev.el, 0, () => {
    prev.el.pause();
    then();
  });
}

function playMood(mood: MusicMood) {
  if (current?.mood === mood) return;
  stopCurrent(() => {
    const url = musicUrl(mood);
    if (!url) return;
    const el = new Audio(url);
    el.loop = true;
    el.volume = 0;
    current = { mood, el };
    // Browsers block audio before the first click; the play() rejection is expected then.
    el.play().then(() => fade(el, VOLUME)).catch(() => {
      if (current?.el === el) current = null;
    });
  });
}

/** Plays the track for `mood` (cross-fading on change); starts on the first user gesture if autoplay is blocked. */
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
    if (muted) {
      stopCurrent(() => {});
      return;
    }
    playMood(mood);
    const retry = () => playMood(mood);
    window.addEventListener("pointerdown", retry, { once: true });
    return () => window.removeEventListener("pointerdown", retry);
  }, [mood, muted]);

  useEffect(() => () => stopCurrent(() => {}), []);

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

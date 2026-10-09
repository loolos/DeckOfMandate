import { useEffect, useSyncExternalStore } from "react";
import { musicUrl, type MusicMood } from "./music";
import styles from "./zhenhuan.module.css";

const MUTE_KEY = "zhenhuan.bgm.muted";
const VOLUME = 0.5;
/** Silence between two tracks. */
const GAP_MS = 3000;

/** Muted unless the player has turned the music on (and that choice was remembered). */
function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) !== "0";
  } catch {
    return true;
  }
}

/**
 * One track at a time, each played through once. A mood change never interrupts the track
 * that is playing: when it ends, ~3 s of silence follow, then the track for whatever mood is
 * wanted *at that moment* (current level and turn) starts.
 */
let wanted: MusicMood = "calm";
let playing: HTMLAudioElement | null = null;
let gapTimer: number | undefined;

function startWanted() {
  if (playing || gapTimer !== undefined) return;
  const url = musicUrl(wanted);
  if (!url) return;
  const el = new Audio(url);
  el.volume = VOLUME;
  playing = el;
  el.addEventListener("ended", () => {
    if (playing !== el) return;
    playing = null;
    gapTimer = window.setTimeout(() => {
      gapTimer = undefined;
      startWanted();
    }, GAP_MS);
  });
  // Browsers block audio before the first click; the play() rejection is expected then.
  el.play().catch(() => {
    if (playing === el) playing = null;
  });
}

function stopAll() {
  window.clearTimeout(gapTimer);
  gapTimer = undefined;
  const el = playing;
  playing = null;
  el?.pause();
}

/** Mute preference shared by the player and every toggle on screen. */
let muted = readMuted();
const listeners = new Set<() => void>();

function subscribeMuted(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function setMuted(next: boolean) {
  muted = next;
  try {
    localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    /* storage unavailable: preference just isn't remembered */
  }
  listeners.forEach((fn) => fn());
}

function useMuted(): boolean {
  return useSyncExternalStore(subscribeMuted, () => muted);
}

/** Keeps `mood` as the next track to play; starts on the first user gesture if autoplay is blocked. */
export function useBgm(mood: MusicMood) {
  const isMuted = useMuted();

  useEffect(() => {
    wanted = mood;
    if (isMuted) {
      stopAll();
      return;
    }
    startWanted();
    window.addEventListener("pointerdown", startWanted, { once: true });
    return () => window.removeEventListener("pointerdown", startWanted);
  }, [mood, isMuted]);

  useEffect(() => stopAll, []);
}

/** 背景音乐开关 (off by default); `brief` shows only the icon, for the compact header. */
export function MusicToggle({ brief = false }: { brief?: boolean }) {
  const isMuted = useMuted();
  const label = isMuted ? "开启背景音乐" : "关闭背景音乐";
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles.musicToggle}`}
      aria-pressed={!isMuted}
      aria-label={label}
      title={label}
      onClick={() => setMuted(!isMuted)}
    >
      {isMuted ? "🔇" : "🔊"}
      {brief ? null : isMuted ? " 音乐：关" : " 音乐：开"}
    </button>
  );
}

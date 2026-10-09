import type { Session } from "../logic/session";
import { CHAPTER } from "../data/content";
import { STAGE2 } from "../data/stage2Content";
import { indexByBasename } from "./art";

/**
 * Background music (docs/music-prompts.md). Files are named by mood, so dropping
 * `assets/music/<mood>.mp3` (or .ogg / .m4a / .wav) into place is all it takes;
 * a missing file means "silence for that mood".
 */
export const MUSIC_MOODS = ["calm", "tension", "climax", "sorrow"] as const;
export type MusicMood = (typeof MUSIC_MOODS)[number];

const MUSIC = indexByBasename(
  import.meta.glob<string>("../assets/music/*.{mp3,ogg,m4a,wav}", { eager: true, import: "default" }),
  /\.(mp3|ogg|m4a|wav)$/,
);

export function musicUrl(mood: MusicMood): string | null {
  return MUSIC.get(mood) ?? null;
}

/** Fractions of the level at which the music moves on: 日常欢快 → 紧张 → 哀婉 → 高潮. */
const MOOD_BY_PROGRESS: readonly (readonly [upTo: number, mood: MusicMood])[] = [
  [0.25, "calm"],
  [0.6, "tension"],
  [0.85, "sorrow"],
  [1, "climax"],
];

/** The track that fits the current turn alone (events and outcome are ignored); `null` session = start menu. */
export function musicMood(session: Session | null): MusicMood {
  if (!session) return "calm";
  const total = session.stage === 2 ? STAGE2.totalTurns : CHAPTER.totalTurns;
  const progress = session.state.turn / total;
  return MOOD_BY_PROGRESS.find(([upTo]) => progress <= upTo)?.[1] ?? "climax";
}

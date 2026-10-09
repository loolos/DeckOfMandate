import type { Session } from "../logic/session";
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

/**
 * Per-level schedule, tied to the story beats: from `fromTurn` on, the next track to start is `mood`.
 * A level need not use every mood. Edit freely; entries must be in ascending turn order.
 */
const MUSIC_SCHEDULE: Record<1 | 2, readonly (readonly [fromTurn: number, mood: MusicMood])[]> = {
  // 第一关：1 初入宫门；4 逆风解意；8 杏花微雨；10–12 晋封考验；13 起尘埃落定
  1: [
    [1, "calm"],
    [4, "tension"],
    [8, "calm"],
    [10, "tension"],
    [13, "calm"],
  ],
  // 第二关：1 凤鸾空返；3 初谒翊坤；8 菊残霜冷（眉庄 / 温太医退场）；10 贵人之后；17 翊坤长跪；20 端妃旧事；24 年氏倾颓；30 翊坤落幕
  2: [
    [1, "calm"],
    [3, "tension"],
    [8, "sorrow"],
    [10, "calm"],
    [17, "sorrow"],
    [20, "tension"],
    [24, "climax"],
  ],
};

/**
 * The track to start next, given the turn the game is on *when the previous track ends*
 * (events and outcome are ignored); `null` session = start menu.
 */
export function musicMood(session: Session | null): MusicMood {
  if (!session) return "calm";
  let mood: MusicMood = "calm";
  for (const [fromTurn, m] of MUSIC_SCHEDULE[session.stage]) {
    if (session.state.turn >= fromTurn) mood = m;
  }
  return mood;
}

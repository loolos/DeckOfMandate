import type { Session } from "../logic/session";
import { indexByBasename } from "./art";

/**
 * Background music (docs/music-prompts.md). Files are named by mood, so dropping
 * `assets/music/<mood>.mp3` (or .ogg / .m4a / .wav) into place is all it takes;
 * a missing file means "silence for that mood".
 */
export const MUSIC_MOODS = ["victory", "calm", "tension", "sorrow", "climax", "tender"] as const;
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
const MUSIC_SCHEDULE: Record<1 | 2 | 3, readonly (readonly [fromTurn: number, mood: MusicMood])[]> = {
  // 第一关：1 初入宫门；4 逆风解意；8 杏花微雨；10–12 晋封考验；13 起尘埃落定
  1: [
    [1, "calm"],
    [4, "tension"],
    [8, "tender"],
    [10, "tension"],
    [13, "calm"],
  ],
  // 第二关：1 凤鸾空返；3 初谒翊坤；8 菊残霜冷（眉庄 / 温太医退场）；10 贵人之后；14 圆明伴驾；17 玉阶炎日；20 端妃旧事；24 年氏倾颓；30 翊坤落幕
  2: [
    [1, "calm"],
    [3, "tension"],
    [8, "sorrow"],
    [10, "calm"],
    [14, "tender"],
    [17, "sorrow"],
    [20, "tension"],
    [24, "climax"],
  ],
  // 第三关：1 皇后笑意；5 桐花台；8 甄远道下狱；9 婉婉类卿；10 景仁宫对质；11 甘露寺；12 山门偶遇；18 肺痨之诬；
  // 19 踏雪问疾；25 舟覆噩耗；26 移花接木；30 起到截止
  3: [
    [1, "calm"],
    [3, "tension"],
    [5, "tender"],
    [8, "sorrow"],
    [10, "climax"],
    [11, "sorrow"],
    [12, "calm"],
    [18, "tension"],
    [19, "tender"],
    [25, "sorrow"],
    [26, "tension"],
    [30, "climax"],
  ],
};

/**
 * The track to start next, given the turn the game is on *when the previous track ends*
 * (events are ignored); `null` session = start menu (`calm`). Once 第二关 is won with 大胜 or 完美胜利, or 第三关
 * is won, the next track is `victory`: it only plays if the player is still on the cleared screen when the
 * previous track ends. Every other outcome (第一关 win, 险胜, loss) follows the schedule.
 */
export function musicMood(session: Session | null): MusicMood {
  if (!session) return "calm";
  if (session.stage === 2 && session.state.outcome === "won" && session.state.victory !== "narrow") return "victory";
  if (session.stage === 3 && session.state.outcome === "won") return "victory";
  let mood: MusicMood = "calm";
  for (const [fromTurn, m] of MUSIC_SCHEDULE[session.stage]) {
    if (session.state.turn >= fromTurn) mood = m;
  }
  return mood;
}

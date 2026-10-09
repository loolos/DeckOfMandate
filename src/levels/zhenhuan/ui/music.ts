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

/** Which track fits the current moment; `null` session = start menu. 通关 → calm, 失败 → sorrow. */
export function musicMood(session: Session | null): MusicMood {
  if (!session) return "calm";
  const s = session.state;
  if (s.outcome === "won") return "calm";
  if (s.outcome === "lost") return "sorrow";
  if (session.stage === 2) {
    const st = session.state;
    if (st.finale) return "climax";
    if (st.trial.active) return "tension";
    if (st.stories.some((x) => x.chosenOptionId === null)) return "sorrow";
    if (st.crisis && !st.crisis.resolved) return "tension";
    if (st.huafei.some((h) => !h.resolved)) return "tension";
    return "calm";
  }
  const st = session.state;
  if (st.trial.active) return "tension";
  if (st.story && st.story.chosenOptionId === null) return "sorrow";
  if ((st.crisis && !st.crisis.resolved) || (st.envy && !st.envy.resolved)) return "tension";
  return "calm";
}

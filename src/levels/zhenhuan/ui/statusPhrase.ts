/** 事件文字里直接写状态的效果（不提状态名）；略缩卡把这些说法换成 emoji。 */

export type PhraseEmoji = { readonly shengchong: string; readonly qingyu: string; readonly shenzi?: string; readonly draw?: string };

export function compactStatusPhrases(text: string, emoji: PhraseEmoji): string {
  const draw = emoji.draw ?? "🎴";
  const key: Record<string, string> = { 抓牌: draw, 圣宠: emoji.shengchong, 清誉: emoji.qingyu, 身子: emoji.shenzi ?? "🌱" };
  return text
    .replace(/未来 (\d+) 回合，?每回合(?:末|开始时)?(抓牌|圣宠|清誉|身子)(?:数)? ?([+-]\d+)/g, (_m, n: string, k: string, v: string) => `${key[k]}${v}×${n}`)
    .replace(/未来 (\d+) 回合，?出牌上限 -1/g, "🀄-1×$1")
    .replace(/未来 (\d+) 回合不能打出?([^；，。（]+?)(，不能侍寝)?(?=[；，。（]|$)/g, (_m, n: string, what: string, bed?: string) => `🚫${what.replace(/、/g, "")}${bed ? "🌙" : ""}×${n}`)
    .replace(/(\d+) 回合内不能打(?:出)?([^；，。（]+)/g, "🚫$2×$1");
}

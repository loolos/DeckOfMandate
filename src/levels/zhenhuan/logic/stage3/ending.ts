import {
  DUANFEI_DEFAULT,
  DUANFEI_DEFENSE,
  ENDING,
  EXIT,
  FABRICATED_HINT,
  FABRICATED_SECRET,
  POPUP_TEXT,
  SECRETS,
  type SecretId,
  dengmenCloseText,
  lingrongTier,
} from "../../data/stage3Content";
import { hasStatus3, relicsKept } from "./queries";
import type { Z3State } from "./state";

// ---------------------------------------------------------------- 对质 / 结局 text

/** The 把柄 at 对质: what 皇后 brought out, plus the ones a 亲厚 陵容 kept back (`withheld`). */
export type ConfrontLine3 = { id: string; line: string; hint: string; lingrong: boolean; withheld?: boolean; duanfei?: string; /** 栗糕清苦：齐妃说到一半语塞。 */ qifei?: boolean };

export function confrontLines(s: Z3State): ConfrontLine3[] {
  const tier = s.exitTierLingrong ?? lingrongTier(s.relation);
  const held = (Object.keys(s.secrets) as SecretId[]).filter((id) => (s.secrets[id] ?? 0) > 0);
  // a 亲厚 陵容 kept two of hers back
  let hidden = tier === "close" ? 2 : 0;
  const lines: ConfrontLine3[] = held.map((id, i) => {
    const withheld = hidden > 0 && SECRETS[id].lingrong;
    if (withheld) hidden--;
    // 每隔一条由宫人、小太监说出，保证对质里总有下人开口
    const line = i % 2 === 1 && SECRETS[id].servant ? SECRETS[id].servant! : SECRETS[id].line;
    return { id, line, hint: SECRETS[id].hint, lingrong: SECRETS[id].lingrong, ...(withheld ? { withheld } : {}) };
  });
  if (tier === "resentful") lines.push({ id: "fabricated", line: FABRICATED_SECRET, hint: FABRICATED_HINT, lingrong: true });
  // 栗糕清苦：齐妃开口的头一条，她说到一半想起栗子糕，语塞了（她名下的版本）
  if (s.lizigao) {
    const mine = lines.find((l) => !l.withheld && l.id !== "fabricated" && SECRETS[l.id as SecretId].line.startsWith("齐妃"));
    if (mine) {
      mine.line = SECRETS[mine.id as SecretId].line;
      mine.qifei = true;
    }
  }
  // 端妃相护：挡下最后一条真正提出的指控，指控照常提出，端妃在一旁替你说话
  if (hasStatus3(s, "duanfeiXianghu")) {
    const covered = [...lines].reverse().find((l) => !l.withheld && !l.qifei && l.id !== "fabricated");
    if (covered) covered.duanfei = DUANFEI_DEFENSE[covered.id] ?? DUANFEI_DEFAULT[s.seed % DUANFEI_DEFAULT.length]!;
  }
  return lines;
}

/** 胜利结局，按剧情顺序：景仁宫对质 → 出宫 → 静白污蔑 → 凌云峰 → 移花接木 → 回宫 → 陵容。 */
export function endingStory3(s: Z3State): string[] {
  const lines: string[] = [];
  const exposed = confrontLines(s).some((l) => l.lingrong && !l.withheld);
  lines.push(exposed ? ENDING.confront.exposed : ENDING.confront.plain);
  if (s.exitTier && s.exitTier <= 3) {
    lines.push(ENDING.exit[s.exitTier]!, ENDING.gate[s.exitTier]!);
  }
  if (s.feilaoTier != null) lines.push(ENDING.feilao[s.feilaoTier]!);
  lines.push(ENDING.lingyun);
  const kept = relicsKept(s);
  if (kept > 0) lines.push(ENDING.relicsKept(kept));
  else if (s.relicsBurned > 0) lines.push(ENDING.relicsBurned);
  lines.push(ENDING.ximai);
  if (s.yihua?.duishi) lines.push(ENDING.duishi);
  if (hasStatus3(s, "qinseHeming")) lines.push(ENDING.qinse);
  if (s.victory === "narrow") lines.push(dengmenCloseText("narrow", s.exitTier));
  lines.push(...POPUP_TEXT.homecoming);
  if (s.exitTier) lines.push(POPUP_TEXT.homecomingTier[s.exitTier]!);
  if (s.exitTierLingrong) lines.push(ENDING.lingrong[s.exitTierLingrong]);
  if (s.victory === "perfect") lines.push(...ENDING.perfect);
  if (s.victory === "return") lines.push(ENDING.perfectHint);
  return lines;
}

/** Ending lines for the 失败 outcome screen. */
export function endingLines3(s: Z3State): string[] {
  const lines: string[] = [];
  if (s.exitTier) lines.push(`出宫：${EXIT[s.exitTier].emoji} ${EXIT[s.exitTier].name}。`);
  const t = s.exitTierLingrong;
  if (t) lines.push(ENDING.lingrong[t]);
  return lines;
}

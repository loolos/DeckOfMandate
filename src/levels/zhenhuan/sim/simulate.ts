/**
 * 甄嬛传 balance simulator. Usage: npx tsx src/levels/zhenhuan/sim/simulate.ts [runs]
 * Plays many seeds with two policies and prints win rate / where runs are lost.
 * - careful: per turn, searches every play order (incl. story options) and keeps the best end-of-turn state
 * - casual: plays a matching card if it has one (else a random card), never picks story options
 */
import { CARDS } from "../data/content";
import { negativeStatuses, newGame, playsLeft, reduce, storyBasicOptions, currentStory, type ZhAction, type ZhState } from "../logic/engine";

export type Policy = (s: ZhState, seed: number) => ZhState;

function legalTurnActions(s: ZhState): ZhAction[] {
  const out: ZhAction[] = [];
  if (s.pending) {
    for (const st of negativeStatuses(s)) out.push({ type: "removeStatus", statusUid: st.uid });
    return out;
  }
  if (playsLeft(s) > 0) {
    const seen = new Set<string>();
    for (const c of s.hand) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push({ type: "playCard", cardUid: c.uid });
    }
  }
  const story = currentStory(s);
  if (story && s.story?.chosenOptionId == null) {
    for (const o of storyBasicOptions(story)) out.push({ type: "chooseStory", optionId: o.id });
  }
  return out;
}

function score(s: ZhState): number {
  if (s.outcome === "lost") return -1e6 + s.turn * 1000;
  if (s.outcome === "won") return 1e6;
  let h = 3 * Math.min(s.qingyu, s.shengchong) + s.qingyu + s.shengchong;
  for (const st of s.statuses) h += st.id === "liuyanChanshen" ? -1.5 : 1;
  if (s.promoted) h += 100;
  // pre-trial: being near the trial thresholds matters
  if (!s.promoted && s.turn >= 9) h += 2 * Math.min(s.shengchong, 6) + 2 * Math.min(s.qingyu, 5);
  return h;
}

/** Best end-of-turn result over all play sequences this turn (bounded DFS). */
export const careful: Policy = (s) => {
  let best: ZhState | null = null;
  let bestScore = -Infinity;
  const visit = (cur: ZhState, depth: number) => {
    const ended = reduce(cur, { type: "endTurn" });
    if (ended !== cur) {
      const sc = score(ended);
      if (sc > bestScore) {
        bestScore = sc;
        best = ended;
      }
    }
    if (depth > 6) return;
    for (const a of legalTurnActions(cur)) {
      const next = reduce(cur, a);
      if (next !== cur) visit(next, depth + 1);
    }
  };
  visit(s, 0);
  return best ?? reduce(s, { type: "endTurn" });
};

export const casual: Policy = (s, seed) => {
  let cur = s;
  let i = 0;
  while (cur.outcome === "playing" && i++ < 10) {
    if (cur.pending) {
      cur = reduce(cur, { type: "removeStatus", statusUid: negativeStatuses(cur)[0]!.uid });
      continue;
    }
    if (playsLeft(cur) <= 0 || cur.hand.length === 0) break;
    const matching = cur.hand.find((c) =>
      [cur.opportunity, cur.crisis].some((e) => e && !e.resolved && (CARD_MATCHES[c.id] ?? []).includes(e.id)),
    );
    const card = matching ?? cur.hand[(seed + cur.turn + i) % cur.hand.length]!;
    const next = reduce(cur, { type: "playCard", cardUid: card.uid });
    if (next === cur) break;
    cur = next;
  }
  return cur.outcome === "playing" ? reduce(cur, { type: "endTurn" }) : cur;
};

const CARD_MATCHES: Record<string, readonly string[]> = Object.fromEntries(
  Object.values(CARDS).map((c) => [c.id, c.matches]),
);

export type SimResult = { runs: number; wins: number; promoted: number; lossByTurn: Map<number, number>; lossReasons: Map<string, number> };

export function simulate(policy: Policy, runs: number, setup?: (s: ZhState) => ZhState): SimResult {
  const r: SimResult = { runs, wins: 0, promoted: 0, lossByTurn: new Map(), lossReasons: new Map() };
  for (let seed = 1; seed <= runs; seed++) {
    let s = newGame(seed);
    if (setup) s = setup(s);
    let guard = 0;
    while (s.outcome === "playing" && guard++ < 40) s = policy(s, seed);
    if (s.promoted) r.promoted++;
    if (s.outcome === "won") r.wins++;
    else {
      r.lossByTurn.set(s.turn, (r.lossByTurn.get(s.turn) ?? 0) + 1);
      const reason = s.lossReason ?? "?";
      r.lossReasons.set(reason, (r.lossReasons.get(reason) ?? 0) + 1);
    }
  }
  return r;
}

export function formatResult(name: string, r: SimResult): string {
  const pct = (n: number) => `${((n / r.runs) * 100).toFixed(1)}%`;
  const turns = [...r.lossByTurn.entries()].sort((a, b) => a[0] - b[0]).map(([t, n]) => `T${t}:${n}`).join(" ");
  const reasons = [...r.lossReasons.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join("；");
  return `${name}\n  胜率 ${pct(r.wins)} · 晋封 ${pct(r.promoted)}\n  失败回合 ${turns || "-"}\n  失败原因 ${reasons || "-"}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runs = Number(process.argv[2] ?? 500);
  console.log(formatResult("细心玩家", simulate(careful, runs)));
  console.log(formatResult("随手玩家", simulate(casual, runs)));
}

/**
 * 甄嬛传 · 第二关 balance simulator. Usage: npx tsx src/levels/zhenhuan/sim/simulateStage2.ts [runs] [qingyu shengchong]
 * - careful: per turn, searches play orders (incl. story options, bounded) and keeps the best end-of-turn state
 * - casual: plays a card that answers something if it has one (else a random playable card), never picks story options
 */
import { EVIDENCE_THRESHOLDS, STORIES2 } from "../data/stage2Content";
import {
  boardEvents,
  canPlayCard,
  cardAffectsEvent,
  finaleAccepts,
  newStage2,
  openStories,
  reduce2,
  removableNegatives,
  storyBasicOptions2,
  storyResponsesFor,
  type Carry,
  type Z2Action,
  type Z2State,
} from "../logic/stage2Engine";

export type Policy2 = (s: Z2State, seed: number) => Z2State;

function legalActions(s: Z2State): Z2Action[] {
  const out: Z2Action[] = [];
  if (s.pending) {
    for (const st of removableNegatives(s)) out.push({ type: "removeStatus", statusUid: st.uid });
    return out;
  }
  const seen = new Set<string>();
  for (const [i, c] of s.hand.entries()) {
    if (!canPlayCard(s, c.uid)) continue;
    // position matters for 联袂 / 掣肘, so only dedupe identical neighbours
    const key = `${c.id}|${s.hand[i - 1]?.id ?? ""}|${s.hand[i + 1]?.id ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ type: "playCard", cardUid: c.uid });
  }
  for (const st of openStories(s)) {
    for (const o of storyBasicOptions2(STORIES2[st.id])) out.push({ type: "chooseStory", storyId: st.id, optionId: o.id });
  }
  return out;
}

function score(s: Z2State): number {
  if (s.outcome === "lost") return -1e6 + s.turn * 1000;
  if (s.outcome === "won") return 1e6 + s.evidence.length * 1000;
  let h = 3 * Math.min(s.qingyu, s.shengchong) + s.qingyu + s.shengchong;
  h += 2 * s.shenzi;
  h += 12 * s.evidence.length;
  h -= Math.max(0, s.hate - 5) * 2;
  if (s.relation != null) h += s.relation;
  if (s.rank !== "changzai") h += 100;
  if (s.trial.active) {
    h += 2 * Math.min(s.shengchong, 9) + 2 * Math.min(s.qingyu, 9) + (s.trial.summoned ? 15 : 0);
  }
  if (s.pregnant) h += 5;
  if (s.caoOwed) h += 8;
  if (s.finale) h += 300 * Math.min(s.finale.played.length, s.finale.needed);
  return h;
}

export const careful2: Policy2 = (s) => {
  let best: Z2State | null = null;
  let bestScore = -Infinity;
  let budget = 600;
  const visit = (cur: Z2State, depth: number) => {
    if (budget-- <= 0) return;
    const ended = reduce2(cur, { type: "endTurn" });
    if (ended !== cur) {
      const sc = score(ended);
      if (sc > bestScore) {
        bestScore = sc;
        best = ended;
      }
    }
    if (depth >= 5) return;
    for (const a of legalActions(cur)) {
      const next = reduce2(cur, a);
      if (next !== cur) visit(next, depth + 1);
    }
  };
  visit(s, 0);
  return best ?? reduce2(s, { type: "endTurn" });
};

function answersSomething(s: Z2State, uid: string): boolean {
  const c = s.hand.find((x) => x.uid === uid);
  if (!c) return false;
  return storyResponsesFor(s, c.id).length > 0 || boardEvents(s).some((e) => cardAffectsEvent(e, c.id)) || finaleAccepts(s, c.id);
}

export const casual2: Policy2 = (s, seed) => {
  let cur = s;
  let i = 0;
  while (cur.outcome === "playing" && i++ < 12) {
    if (cur.pending) {
      cur = reduce2(cur, { type: "removeStatus", statusUid: removableNegatives(cur)[0]!.uid });
      continue;
    }
    const playable = cur.hand.filter((c) => canPlayCard(cur, c.uid));
    if (playable.length === 0) break;
    const card = playable.find((c) => answersSomething(cur, c.uid)) ?? playable[(seed + cur.turn + i) % playable.length]!;
    const next = reduce2(cur, { type: "playCard", cardUid: card.uid });
    if (next === cur) break;
    cur = next;
  }
  return cur.outcome === "playing" ? reduce2(cur, { type: "endTurn" }) : cur;
};

export type Sim2Result = {
  runs: number;
  wins: number;
  full: number;
  guiren: number;
  pin: number;
  miscarriage: number;
  evidenceTotal: number;
  lossByTurn: Map<number, number>;
  lossReasons: Map<string, number>;
};

export function simulate2(policy: Policy2, runs: number, carry: Carry | null = null): Sim2Result {
  const r: Sim2Result = { runs, wins: 0, full: 0, guiren: 0, pin: 0, miscarriage: 0, evidenceTotal: 0, lossByTurn: new Map(), lossReasons: new Map() };
  for (let seed = 1; seed <= runs; seed++) {
    let s = newStage2(seed, carry);
    let guard = 0;
    while (s.outcome === "playing" && guard++ < 60) {
      s = policy(s, seed);
      s.log = []; // keeps cloning cheap; the sim never reads the log
    }
    if (s.rank !== "changzai") r.guiren++;
    if (s.rank === "pin") r.pin++;
    if (s.miscarriages > 0) r.miscarriage++;
    r.evidenceTotal += s.evidence.length;
    if (s.outcome === "won") {
      r.wins++;
      if (s.evidence.length >= EVIDENCE_THRESHOLDS.fullWin) r.full++;
    } else {
      r.lossByTurn.set(s.turn, (r.lossByTurn.get(s.turn) ?? 0) + 1);
      const reason = (s.lossReason ?? "?").replace(/\d+ 条/, "N 条");
      r.lossReasons.set(reason, (r.lossReasons.get(reason) ?? 0) + 1);
    }
  }
  return r;
}

export function formatResult2(name: string, r: Sim2Result): string {
  const pct = (n: number) => `${((n / r.runs) * 100).toFixed(1)}%`;
  const turns = [...r.lossByTurn.entries()].sort((a, b) => a[0] - b[0]).map(([t, n]) => `T${t}:${n}`).join(" ");
  const reasons = [...r.lossReasons.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}×${n}`).join("；");
  return [
    name,
    `  胜率 ${pct(r.wins)}（完胜 ${pct(r.full)}）· 晋贵人 ${pct(r.guiren)} · 晋嫔 ${pct(r.pin)} · 小产 ${pct(r.miscarriage)} · 平均罪证 ${(r.evidenceTotal / r.runs).toFixed(2)}`,
    `  失败回合 ${turns || "-"}`,
    `  失败原因 ${reasons || "-"}`,
  ].join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const runs = Number(process.argv[2] ?? 200);
  const carry = process.argv[3] ? { qingyu: Number(process.argv[3]), shengchong: Number(process.argv[4] ?? process.argv[3]) } : null;
  console.log(formatResult2("细心玩家", simulate2(careful2, runs, carry)));
  console.log(formatResult2("随手玩家", simulate2(casual2, runs, carry)));
}

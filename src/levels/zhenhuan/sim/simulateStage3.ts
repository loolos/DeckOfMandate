/**
 * 甄嬛传 · 第三关 / 全流程 simulator.
 * Usage: npx tsx src/levels/zhenhuan/sim/simulateStage3.ts <mode: campaign|stage3> <policy: careful|casual> [runs] [seedOffset]
 * Prints one JSON line of aggregate counts (merge across shards by summing).
 */
import { careful, casual } from "./simulate";
import { careful2, casual2 } from "./simulateStage2";
import { CARDS3, STATUSES3, STORIES3, confrontOutcome } from "../data/stage3Content";
import { newGame } from "../logic/engine";
import { newStage2 } from "../logic/stage2Engine";
import { carry3FromStage2 } from "../logic/session";
import {
  canPlayCard3,
  isRelic,
  relicsKept,
  newStage3,
  openStories3,
  reduce3,
  removableNegatives3,
  secretsHeld,
  storyBasicOptions3,
  type Carry3,
  type Z3Action,
  type Z3State,
} from "../logic/stage3Engine";

type Policy3 = (s: Z3State, seed: number) => Z3State;

function legal3(s: Z3State): Z3Action[] {
  const out: Z3Action[] = [];
  if (s.pending) {
    for (const st of removableNegatives3(s)) out.push({ type: "removeStatus", statusUid: st.uid });
    return out;
  }
  const seen = new Set<string>();
  for (const [i, c] of s.hand.entries()) {
    if (!canPlayCard3(s, c.uid)) continue;
    const key = `${c.id}|${s.hand[i - 1]?.id ?? ""}|${s.hand[i + 1]?.id ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ type: "playCard", cardUid: c.uid });
  }
  for (const st of openStories3(s)) for (const o of storyBasicOptions3(STORIES3[st.id])) out.push({ type: "chooseStory", storyId: st.id, optionId: o.id });
  return out;
}

function projected(s: Z3State, res: "shenzi" | "qingyu"): number {
  let v = s[res];
  for (const st of s.statuses) {
    const d = STATUSES3[st.id];
    for (const e of d.turnEnd ?? []) if (e.resource === res) v += e.amount * st.remaining;
  }
  return v;
}

const W = {
  sz: Number(process.env.W_SZ ?? 10),
  lowSz: Number(process.env.W_LOWSZ ?? 40),
  q: Number(process.env.W_Q ?? 6),
  lowQ: Number(process.env.W_LOWQ ?? 25),
  draw: Number(process.env.W_DRAW ?? 12),
  step: Number(process.env.W_STEP ?? 300),
  doubt2: Number(process.env.W_D2 ?? 0),
  doubt: Number(process.env.W_DOUBT ?? 60),
  relicHand: Number(process.env.W_RH ?? 20),
  relicKept: Number(process.env.W_RK ?? 4),
  neg: Number(process.env.W_NEG ?? 2),
};

function score3(s: Z3State): number {
  if (s.outcome === "lost") return -1e6 + s.turn * 1000;
  if (s.outcome === "won") return 1e6;
  let h = 0;
  const pz = projected(s, "shenzi");
  const pq = projected(s, "qingyu");
  h += W.sz * Math.min(pz, 5) - W.lowSz * Math.max(0, 2 - pz);
  if (s.act === 1) {
    h += 3 * Math.min(s.qingyu, s.shengchong) + s.qingyu + s.shengchong;
  } else {
    h += W.q * Math.min(pq, 8) - W.lowQ * Math.max(0, 3 - pq);
  }
  h += s.relation;
  if (s.exitTier != null) h += s.exitTier === 1 ? 400 : s.exitTier === 2 ? 200 : 0;
  if (s.confront) h += 150 * s.confront.played.length;
  if (s.yihua) h += W.step * s.yihua.step - W.doubt * s.yihua.doubt - W.doubt2 * s.yihua.doubt * s.yihua.doubt;
  for (const st of s.statuses) {
    const d = STATUSES3[st.id];
    if (d.tag === "negative") h -= W.neg * Math.max(1, st.remaining);
    // 抓牌加成（果郡王相助等）：到移花接木之前尽量多攒
    if (d.drawModifier > 0 && s.turn < 26) h += W.draw * d.drawModifier * Math.max(1, st.remaining);
    if (d.drawModifier < 0) h -= W.draw * Math.abs(d.drawModifier) * Math.max(1, st.remaining);
  }
  const inHand = s.hand.filter((c) => isRelic(c.id)).length;
  h -= (s.yihua ? W.relicHand : 5) * inHand + W.relicKept * relicsKept(s);
  if (s.pregnant) h += 5;
  h -= 3 * s.arrogance;
  return h;
}

export const careful3: Policy3 = (s) => {
  let best: Z3State | null = null;
  let bestScore = -Infinity;
  let budget = Number(process.env.BUDGET ?? 400);
  const visit = (cur: Z3State, depth: number) => {
    if (budget-- <= 0) return;
    const ended = reduce3(cur, { type: "endTurn" });
    if (ended !== cur) {
      const sc = score3(ended);
      if (sc > bestScore) {
        bestScore = sc;
        best = ended;
      }
    }
    if (depth >= 5) return;
    for (const a of legal3(cur)) {
      const next = reduce3(cur, a);
      if (next !== cur) {
        next.log = [];
        visit(next, depth + 1);
      }
    }
  };
  visit(s, 0);
  return best ?? reduce3(s, { type: "endTurn" });
};

const casual3: Policy3 = (s, seed) => {
  let cur = s;
  let i = 0;
  while (cur.outcome === "playing" && i++ < 14) {
    if (cur.pending) {
      cur = reduce3(cur, { type: "removeStatus", statusUid: removableNegatives3(cur)[0]!.uid });
      continue;
    }
    const playable = cur.hand.filter((c) => canPlayCard3(cur, c.uid));
    if (playable.length === 0) break;
    const board = [cur.crisis, cur.opportunity, cur.huanghou].filter(Boolean);
    const ans = playable.find((c) => board.some((e) => !e!.resolved && CARDS3[c.id].matches.includes(e!.id)) || cur.confront != null);
    const card = ans ?? playable[(seed + cur.turn + i) % playable.length]!;
    const next = reduce3(cur, { type: "playCard", cardUid: card.uid });
    if (next === cur) break;
    cur = next;
  }
  return cur.outcome === "playing" ? reduce3(cur, { type: "endTurn" }) : cur;
};

function runStage1(seed: number, pol: typeof careful) {
  let s = newGame(seed);
  let g = 0;
  while (s.outcome === "playing" && g++ < 60) s = pol(s, seed);
  return s;
}
function runStage2(seed: number, carry: { qingyu: number; shengchong: number } | null, pol: typeof careful2) {
  let s = newStage2(seed, carry);
  let g = 0;
  while (s.outcome === "playing" && g++ < 60) {
    s = pol(s, seed);
    s.log = [];
  }
  return s;
}
const act1Traj = { q: {} as Record<number, number[]>, sc: {} as Record<number, number[]> };
function runStage3(seed: number, carry: Carry3 | null, pol: Policy3) {
  let s = newStage3(seed, carry);
  let g = 0;
  while (s.outcome === "playing" && g++ < 60) {
    s = pol(s, seed);
    if (s.act === 1 || s.turn <= 10) {
      const t = Math.min(s.turn, 10);
      (act1Traj.q[t] ??= []).push(s.qingyu);
      (act1Traj.sc[t] ??= []).push(s.shengchong);
    }
    if (process.env.TRACE) {
      console.error(`T${s.turn} q${s.qingyu} sc${s.shengchong} sz${s.shenzi} doubt${s.yihua?.doubt ?? "-"} step${s.yihua?.step ?? "-"} st[${s.statuses.map((x) => x.id).join(",")}]`);
      if (s.outcome !== "playing") console.error(s.lossReason, "\n" + s.log.map((l) => l.text).join("\n"));
    }
    s.log = [];
  }
  return s;
}

const [mode = "campaign", polName = "careful", runsArg = "100", offArg = "0"] = process.argv.slice(2);
const runs = Number(runsArg);
const off = Number(offArg);
const p1 = polName === "careful" ? careful : casual;
const p2 = polName === "careful" ? careful2 : casual2;
const p3 = polName === "careful" ? careful3 : casual3;

const inc = (m: Record<string, number>, k: string | number) => void (m[String(k)] = (m[String(k)] ?? 0) + 1);
const r = {
  mode, polName, runs,
  s1Win: 0, s2Reached: 0, s2Win: 0, s3Reached: 0, s3Win: 0, s3Victory: {} as Record<string, number>,
  carrySecrets: {} as Record<string, number>, carryPregnant: { yes: 0, no: 0 }, carryRank: {} as Record<string, number>,
  exitTier: {} as Record<string, number>, // among stage-3 runs that reached confront
  confrontReached: 0,
  presentedAtConfront: {} as Record<string, number>,
  heldAtConfront: {} as Record<string, number>,
  s3LossKind: {} as Record<string, number>, s3LossTurn: {} as Record<string, number>,
  s1LossReason: {} as Record<string, number>, s2LossReason: {} as Record<string, number>,
};

for (let i = 1; i <= runs; i++) {
  const seed = off + i;
  let carry: Carry3 | null = null;
  if (mode === "campaign") {
    const a = runStage1(seed, p1);
    if (a.outcome !== "won") { inc(r.s1LossReason, a.lossReason ?? "?"); continue; }
    r.s1Win++; r.s2Reached++;
    const b = runStage2(seed * 7 + 1, { qingyu: a.qingyu, shengchong: a.shengchong }, p2);
    if (b.outcome !== "won") { inc(r.s2LossReason, (b.lossReason ?? "?").replace(/\d+ 条/, "N 条")); continue; }
    r.s2Win++; r.s3Reached++;
    carry = carry3FromStage2(b);
    inc(r.carrySecrets, carry.secrets.length); inc(r.carryRank, carry.rank); r.carryPregnant[carry.pregnant ? "yes" : "no"]++;
  } else r.s3Reached++;
  const s = runStage3(seed * 13 + 5, carry, p3);
  if (s.exitTier != null) {
    r.confrontReached++; inc(r.exitTier, s.exitTier);
    inc(r.heldAtConfront, secretsHeld(s));
  }
  if (s.outcome === "won") { r.s3Win++; inc(r.s3Victory, s.victory ?? "?"); }
  else { inc(r.s3LossKind, s.lossKind ?? "?"); inc(r.s3LossTurn, s.turn); }
}
void confrontOutcome;
if (process.env.TRAJ) {
  const avg = (a: number[]) => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
  for (let t = 1; t <= 10; t++) {
    const q = act1Traj.q[t] ?? [], c = act1Traj.sc[t] ?? [];
    if (q.length) console.error(`T${t} 清誉 avg ${avg(q)} min ${Math.min(...q)} | 圣宠 avg ${avg(c)} min ${Math.min(...c)}`);
  }
}
console.log(JSON.stringify(r));

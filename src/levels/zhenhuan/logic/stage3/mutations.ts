import {
  ALLIES,
  type AllyId,
  type CardId3,
  type Delta3,
  type EventId3,
  FIXED_STORIES3,
  type LingrongTier,
  type Loss3Kind,
  type PopupId,
  RANKS,
  RESOURCE3_LABEL,
  RIVALS,
  type RivalId,
  SHENZI,
  STAGE3,
  STATUSES3,
  STORIES3,
  SUMMON_THRESHOLD3,
  SUPPRESS_STATUS,
  type SecretId,
  type StatusId3,
  type StoryId3,
  lingrongTier,
  statusText3,
  summonInterval,
} from "../../data/stage3Content";
import { alive, drawIntoHand, log, removeStatusById, roll, shuffleInto } from "../engineCommon";
import { hasStatus3, rankCap3, removableNegatives3 } from "./queries";
import type { CardInst3, Z3State } from "./state";

// ---------------------------------------------------------------- mutation helpers

export function lose(s: Z3State, reason: string, kind: Loss3Kind): void {
  if (!alive(s)) return;
  s.outcome = "lost";
  s.lossReason = reason;
  s.lossKind = kind;
  log(s, `失败：${reason}`, "bad");
}

export function popup(s: Z3State, id: PopupId): void {
  if (!s.popups.includes(id)) s.popups.push(id);
}

export function applyDelta3(s: Z3State, d: Delta3, source: string): void {
  if (!alive(s) || d.amount === 0) return;
  const label = RESOURCE3_LABEL[d.resource];
  if (d.resource === "shengchong" && s.act > 1 && !(s.yihua && s.yihua.step >= 3)) return; // frozen at the temple
  if (d.resource === "shenzi") {
    const was = s.shenzi;
    const next = Math.max(0, Math.min(SHENZI.max, s.shenzi + d.amount));
    s.shenzi = next;
    log(s, `${source}：身子 ${d.amount > 0 ? "+" : ""}${d.amount} → ${next}`, d.amount > 0 ? "good" : "bad");
    if (next === 0 && was > 0) shenziZero(s);
    return;
  }
  const cur = s[d.resource];
  if (d.amount > 0) {
    const cap = rankCap3(s);
    const next = Math.min(cap, cur + d.amount);
    s[d.resource] = next;
    log(s, `${source}：${label} +${d.amount}${next - cur < d.amount ? `（上限 ${cap}）` : ""} → ${next}`, "good");
    return;
  }
  const next = Math.max(0, cur + d.amount);
  s[d.resource] = next;
  log(s, `${source}：${label} ${d.amount} → ${next}`, "bad");
  if (next > 0) return;
  if (d.resource === "qingyu") lose(s, "清誉降至 0", s.act === 1 ? "qingyu1" : "qingyu");
  else if (s.act === 1) lose(s, "圣宠降至 0", "shengchong");
}

export function applyDeltas3(s: Z3State, deltas: readonly Delta3[], source: string): void {
  for (const d of deltas) {
    if (!alive(s)) return;
    applyDelta3(s, d, source);
  }
}

function shenziZero(s: Z3State): void {
  if (s.act === 2) lose(s, "身子归 0，病死在寺中", "death");
  else if (s.act === 3) lose(s, "身子归 0，小产", "miscarriage");
  else if (!hasStatus3(s, "wochuangJingyang")) addStatus3(s, "wochuangJingyang");
}

export function addStatus3(s: Z3State, id: StatusId3, turns?: number): void {
  const def = STATUSES3[id];
  s.statuses.push({ uid: `s${s.nextUid++}`, id, appliesFromTurn: s.turn + 1, remaining: turns ?? def.duration });
  log(s, `获得状态【${def.name}】（${statusText3(def, s.turn).effectText}）`, def.tag === "negative" ? "bad" : "good");
}

export function removeStatus3(s: Z3State, uid: string, source: string): void {
  const st = s.statuses.find((x) => x.uid === uid);
  if (!st) return;
  s.statuses = s.statuses.filter((x) => x.uid !== uid);
  log(s, `${source}：移除状态【${STATUSES3[st.id].name}】`, "good");
}

export function removeNegatives(s: Z3State, n: "all" | 1, source: string): void {
  const negs = removableNegatives3(s);
  for (const st of n === "all" ? negs : negs.slice(0, 1)) removeStatus3(s, st.uid, source);
}

export function changeRelation(s: Z3State, delta: number, quiet = false): void {
  if (s.lingrongGone || delta === 0) return;
  const before = s.relation;
  const next = Math.max(-4, Math.min(4, before + delta));
  if (next === before) return;
  s.relation = next;
  if (quiet) return;
  const label = { close: "亲厚", distant: "生分", resentful: "怨怼" } as const;
  const tierChange = lingrongTier(before) !== lingrongTier(next) ? `，情分 ${label[lingrongTier(before)]} → ${label[lingrongTier(next)]}` : "";
  log(s, `${delta > 0 ? "陵容待你亲近了些" : "陵容与你生分了些"}${tierChange}`, delta > 0 ? "good" : "bad");
}

/**
 * 把柄 (hidden, never logged): each kind once; what 陵容 herself handled counts 2 when she is 怨怼
 * (she adds to it). A kind already carried over from 第二关 is not counted again.
 */
export function addSecret(s: Z3State, id: SecretId, tier: LingrongTier | null): void {
  if (s.secrets[id] != null) return;
  s.secrets[id] = tier === "resentful" ? 2 : 1;
}

export function drawCards3(s: Z3State, n: number): void {
  drawIntoHand(s, n);
}

/** A new card goes into the draw pile at a random place. */
export function addCardToDeck(s: Z3State, id: CardId3): void {
  const card: CardInst3 = { uid: `c${s.nextUid++}`, id };
  s.drawPile = shuffleInto(s, [...s.drawPile, card]);
}

export function drawFromPool<T extends EventId3>(s: Z3State, poolKey: "opportunityPool" | "crisisPool" | "huanghouPool", usedKey: "opportunityUsed" | "crisisUsed" | "huanghouUsed", ok: (id: T) => boolean = () => true): T | null {
  const take = (also: (id: T) => boolean = () => true): T | null => {
    const pool = s[poolKey] as T[];
    const i = pool.findIndex((id) => ok(id) && also(id));
    if (i < 0) return null;
    return pool.splice(i, 1)[0]!;
  };
  const first = take();
  if (first) return first;
  const used = s[usedKey] as T[];
  if (!used.some(ok)) return null;
  const last = used[used.length - 1];
  (s[poolKey] as T[]) = [...(s[poolKey] as T[]), ...shuffleInto(s, used)];
  (s[usedKey] as T[]) = [];
  // A reshuffle never hands back the card that just left, when another one fits.
  return take((id) => id !== last) ?? take();
}

export function removeFromPools(s: Z3State, ids: readonly EventId3[]): void {
  const keep = (id: EventId3) => !ids.includes(id);
  s.opportunityPool = s.opportunityPool.filter(keep);
  s.opportunityUsed = s.opportunityUsed.filter(keep);
  s.crisisPool = s.crisisPool.filter(keep);
  s.crisisUsed = s.crisisUsed.filter(keep);
}

// ---------------------------------------------------------------- pregnancy / summon

export const PIN_EVENT = "qingmaiBaoxi" as const;

export function becomePregnant(s: Z3State, source: string): void {
  if (s.pregnant || s.childBorn || !alive(s)) return;
  s.pregnant = true;
  s.statuses.push({ uid: `s${s.nextUid++}`, id: "shenhuaiLongyi", appliesFromTurn: s.turn, remaining: 0 });
  log(s, `💗 ${source}：你有了身孕，获得【身怀龙裔】！`, "good");
  if (s.rank === "guiren") addPinEvent(s);
}

export function addPinEvent(s: Z3State): void {
  s.opportunityPool = shuffleInto(s, [...s.opportunityPool.filter((id) => id !== PIN_EVENT), PIN_EVENT]);
  log(s, "【请脉报喜】洗入机会牌池：诊脉报喜妥当后才能晋为嫔。", "good");
}

export function promoteToPin(s: Z3State): void {
  if (s.rank !== "guiren" || !s.pregnant) return;
  s.rank = "pin";
  const r = RANKS.pin;
  log(s, `有孕晋封为【${r.name}】：清誉 / 圣宠上限 ${r.cap}；下回合起每回合抓 ${r.draw} 打 ${r.plays}。`, "good");
  log(s, "陵容送来一双亲手绣的虎头鞋：「姐姐如今是嫔了，妹妹……替姐姐高兴。」");
  changeRelation(s, -2);
}

export function summonSuccess(s: Z3State): void {
  log(s, "召幸：侍寝成功。", "good");
  applyDelta3(s, { resource: "shengchong", amount: 1 }, "侍寝");
  if (!alive(s) || s.pregnant || s.childBorn) return;
  const chance = Math.min(1, s.shenzi / SHENZI.divisor);
  if (chance >= 1 || roll(s) < chance) becomePregnant(s, "侍寝后");
  else log(s, `喜脉判定（身子 ${s.shenzi} ÷ ${SHENZI.divisor}）：未有喜。`);
}

export function checkSummon(s: Z3State): void {
  if (s.act !== 1 || s.pregnant || s.turn === STAGE3.confrontTurn || FIXED_STORIES3[s.turn] === "haitangChunshui" || FIXED_STORIES3[s.turn] === "wanwanLeiqing") return;
  if (s.shengchong < SUMMON_THRESHOLD3) {
    s.summonLast = null;
    return;
  }
  if (s.summonLast != null && s.turn - s.summonLast < summonInterval(s.shengchong - SUMMON_THRESHOLD3)) return;
  s.summonLast = s.turn;
  openStory(s, "zhaoxing");
}

export function openStory(s: Z3State, id: StoryId3): void {
  s.stories.push({ id, chosenOptionId: null });
  log(s, `剧情事件：【${STORIES3[id].name}】`);
}

// ---------------------------------------------------------------- 盟友 / 对头

export function befriend(s: Z3State, ally: AllyId): void {
  if (s.allies[ally]) return;
  s.allies[ally] = true;
  log(s, `🤝 结交盟友：${ALLIES[ally].name}。`, "good");
  addStatus3(s, ALLIES[ally].status);
}

/** 打压: a status that eases this rival's next crisis by one 解牌. */
export function suppress(s: Z3State, rival: RivalId): void {
  const first = !s.suppressed[rival];
  s.suppressed[rival] = true;
  log(s, `⚔️ 打压${RIVALS[rival].name}${first && rival === "guaerjia" ? "：第 8 回合父亲下狱的代价减轻一档" : ""}。`, "good");
  const status = SUPPRESS_STATUS[rival];
  if (rival === "qifei" && hasStatus3(s, "dayaQifeiLizi")) return;
  if (!s.statuses.some((st) => st.id === status)) addStatus3(s, status);
}

/** 栗糕清苦: 齐妃's 把柄 lands in 皇后's hands — 打压·齐妃 stays for the rest of 第一幕, 三阿哥邀宠 is gone. */
export function lizigao(s: Z3State): void {
  s.lizigao = true;
  removeStatusById(s, "dayaQifei");
  addStatus3(s, "dayaQifeiLizi");
  removeFromPools(s, ["sanAgeYaochong"]);
  log(s, "🥮 栗糕清苦：齐妃送来的栗子糕里掺了夹竹桃，幸而陵容闻了出来。皇后得了三阿哥，齐妃从此只能听命于景仁宫。", "good");
  popup(s, "lizigao");
}

/**
 * 甄嬛传 · 第二关 rules engine. Pure and deterministic like 第一关's engine: the same seed, carry-over
 * and action list always yield the same state. Rules: `../docs/design-stage2.md`.
 */
import { createRngFromSeed, rngNext, shuffle } from "../../../logic/rng";
import type { RngSerialized } from "../../../types/game";
import {
  CARDS2,
  CRISIS2_POOL,
  EVENT_KIND2_LABEL,
  EVENTS2,
  EVIDENCE,
  EVIDENCE_THRESHOLDS,
  FINALE,
  FAKUI_TURN,
  JINGHONG_STORY,
  FIXED_STORY_TURNS,
  GUIREN_TRIAL,
  HATE,
  HUAFEI_EVENTS,
  LATE_OPPORTUNITIES,
  LINGRONG,
  LINGRONG_BACKLASH,
  LINGRONG_IDLE_TEXT,
  LINGRONG_COPIES,
  LINGRONG_EVENT,
  LINGRONG_NEGLECT_TEXT,
  LINGRONG_PROMOTION_TEXT,
  LINGRONG_SUMMON,
  NIAN_TURN,
  OPPORTUNITY2_POOL,
  RANKS,
  RESOURCE2_LABEL,
  SHENZI,
  SHUHENJIAO_HARM_CHANCE,
  SHUHENJIAO_HEAL_CHANCE,
  SHUHENJIAO_TEXT,
  STAGE2,
  STAGE2_START_DECK,
  STATUSES2,
  STORIES2,
  SUMMON_THRESHOLD,
  TAG2_INFO,
  TIER_LABEL,
  XIBIE,
  YUANMINGYUAN_TURNS,
  huafeiDrawPlan,
  lingrongTier,
  summonInterval,
  type CardId2,
  type CrisisId2,
  type Delta2,
  type DepartingCard,
  type EventId2,
  type EvidenceId,
  type HuafeiId,
  type LingrongOutcome,
  type LingrongTier,
  type OpportunityId2,
  type RankId,
  type StatusId2,
  type StoryDef2,
  type StoryId2,
  type StoryOption2,
  type TagId2,
  type ResponsePenalty,
} from "../data/stage2Content";

export type CardInst2 = { readonly uid: string; readonly id: CardId2 };

export type EventInst2 = {
  readonly uid: string;
  readonly id: EventId2;
  resolved: boolean;
  resolvedBy?: CardId2;
  rewardDoubled?: boolean;
  /** Cards played toward a 双牌 event this turn. */
  progress?: CardId2[];
  /** 延烧: already unresolved once, staying one more turn. */
  burning?: boolean;
  /** 陵容 resolved / failed it: the tier used (for the banner). */
  lingrong?: LingrongTier;
  /** 陵容 played on it but 失效. */
  lingrongFailed?: boolean;
  /** 蜚语盈廊 made worse by a 怨怼 陵容. */
  aggravated?: boolean;
  evidence?: EvidenceId;
};

export type StoryInst2 = { readonly id: StoryId2; chosenOptionId: string | null; viaCard?: CardId2; result?: string; story?: string };
export type StatusInst2 = { readonly uid: string; readonly id: StatusId2; readonly appliesFromTurn: number; remaining: number };
export type LogTone = "info" | "good" | "bad";
export type LogEntry = { readonly turn: number; readonly text: string; readonly tone: LogTone };
export type Notice = { readonly emoji: string; readonly name: string; readonly text: string };
export type Carry = { readonly qingyu: number; readonly shengchong: number };

export type Z2Action =
  | { readonly type: "playCard"; readonly cardUid: string }
  | { readonly type: "chooseStory"; readonly storyId: StoryId2; readonly optionId: string }
  | { readonly type: "removeStatus"; readonly statusUid: string }
  | { readonly type: "cancelPending" }
  | { readonly type: "endTurn" }
  /** UI-only: not recorded. */
  | { readonly type: "explainTag"; readonly tag: TagId2 };

export type Z2Outcome = "playing" | "won" | "lost";

export type Z2State = {
  stage: 2;
  seed: number;
  carry: Carry | null;
  rng: RngSerialized;
  turn: number;
  rank: RankId;
  /** Rank at the start of the turn: draw / play counts follow it (promotions apply next turn). */
  turnRank: RankId;
  qingyu: number;
  shengchong: number;
  shenzi: number;
  hate: number;
  shenziRevealed: boolean;
  /** What first brought 身子 into play: the first 侍寝, or something else changing it. */
  shenziRevealedBy: "summon" | "other" | null;
  /** null until 陵容 joins (第 2 回合). */
  relation: number | null;
  drawPile: CardInst2[];
  hand: CardInst2[];
  discard: CardInst2[];
  departed: CardInst2[];
  /** Whose cards carry 惜别, and whether they have already left. */
  xibie: DepartingCard | null;
  xibieDone: boolean;
  /** The first 惜别 card reached the hand: the person's other copies have left, this one is the last. */
  xibieCulled: boolean;
  opportunityPool: OpportunityId2[];
  opportunityUsed: OpportunityId2[];
  crisisPool: CrisisId2[];
  crisisUsed: CrisisId2[];
  opportunity: EventInst2 | null;
  crisis: EventInst2 | null;
  huafei: EventInst2[];
  stories: StoryInst2[];
  notices: Notice[];
  trial: { active: boolean; summoned: boolean };
  /** 惊鸿舞 (a bonus, not part of the promotion): 眉庄 / 陵容 played at any point of the 贵人考验; done once it happened. */
  jinghong: { meizhuang: boolean; lingrong: boolean; done: boolean };
  pregnant: boolean;
  pregnancies: number;
  miscarriages: number;
  /** What caused the latest 小产 (for the notice). */
  miscarriageCause: string | null;
  /** What the latest 小产 actually cost (after caps), for the notice. */
  miscarriageCost: { shenzi: number; qingyu: number; shengchong: number; hate: number } | null;
  /** Turn of the last 召幸; null = next turn at the threshold summons right away. */
  summonLast: number | null;
  caoTriggered: boolean;
  caoBefriended: boolean;
  caoOwed: boolean;
  /** 罚跪 started with 恨意 ≥ 6. */
  fakuiHarsh: boolean;
  /** 陵容 uids whose 联袂 was used this turn. */
  lianmeiSpent: string[];
  evidence: EvidenceId[];
  /** 华妃事件 evidence needs two qualifying answers: how many so far, per evidence. */
  evidenceClues: Partial<Record<EvidenceId, number>>;
  shuhenjiaoHarm: number;
  statuses: StatusInst2[];
  playsUsed: number;
  extraPlays: number;
  drawnThisTurn: number;
  pending: { cardUid: string } | null;
  outcome: Z2Outcome;
  lossReason: string | null;
  victory: "narrow" | "full" | null;
  /** 第 30 回合【翊坤落幕】: cards needed and cards played toward it. */
  finale: { needed: number; played: CardId2[]; stories: string[] } | null;
  log: LogEntry[];
  actions: Z2Action[];
  turnStartActionCount: number;
  nextUid: number;
};

// ---------------------------------------------------------------- queries

export function rankCap(s: Z2State): number {
  return RANKS[s.rank].cap;
}

function activeStatuses(s: Z2State): StatusInst2[] {
  return s.statuses.filter((st) => STATUSES2[st.id].permanent || st.appliesFromTurn <= s.turn);
}

export function hasStatus(s: Z2State, id: StatusId2): boolean {
  return s.statuses.some((st) => st.id === id);
}

export function playLimit2(s: Z2State): number {
  let base = RANKS[s.turnRank].plays;
  let penalty = 0;
  let bonus = 0;
  for (const st of activeStatuses(s)) {
    const def = STATUSES2[st.id];
    if (def.playCap != null) base = Math.min(base, def.playCap);
    penalty += def.playPenalty ?? 0;
    bonus += def.playBonus ?? 0;
  }
  // 闭门思过 never takes the limit below 1; 诸事妥帖 and 静观其变's +1 still apply on top
  return Math.max(1, base - penalty) + bonus + s.extraPlays;
}

/** 抱恙在身: a status in effect this turn forbids this card. */
export function blockedByStatus(s: Z2State, cardId: CardId2): boolean {
  return blockingStatusName(s, cardId) != null;
}

/** Name of the status in effect that forbids this card (抱恙在身 / 噤若寒蝉), if any. */
export function blockingStatusName(s: Z2State, cardId: CardId2): string | null {
  const st = activeStatuses(s).find((x) => STATUSES2[x.id].blocksCards?.includes(cardId));
  return st ? STATUSES2[st.id].name : null;
}

/** 抱恙在身 / 卧床静养 in effect: no 侍寝 (召幸 can only be declined or missed). Returns the status name. */
export function summonUnwell(s: Z2State): string | null {
  const st = activeStatuses(s).find((x) => STATUSES2[x.id].noSummon);
  return st ? STATUSES2[st.id].name : null;
}

export function playsLeft2(s: Z2State): number {
  return Math.max(0, playLimit2(s) - s.playsUsed);
}

export function removableNegatives(s: Z2State): StatusInst2[] {
  return s.statuses.filter((st) => STATUSES2[st.id].tag === "negative" && !STATUSES2[st.id].unremovable);
}

export function drawModifier2(s: Z2State, turn: number): number {
  return s.statuses.filter((st) => st.appliesFromTurn <= turn).reduce((sum, st) => sum + STATUSES2[st.id].drawModifier, 0);
}

export function drawCount2(s: Z2State, turn: number): number {
  return Math.max(1, RANKS[s.turnRank].draw + drawModifier2(s, turn));
}

export function tierOf(s: Z2State): LingrongTier | null {
  return s.relation == null ? null : lingrongTier(s.relation);
}

export function storyDef(inst: StoryInst2): StoryDef2 {
  return STORIES2[inst.id];
}

export function openStories(s: Z2State): StoryInst2[] {
  return s.stories.filter((st) => st.chosenOptionId == null);
}

/** 欢宜香浓 unresolved on the board: 召幸 cannot be handled. */
export function summonBlocked(s: Z2State): boolean {
  return s.huafei.some((e) => !e.resolved && EVENTS2[e.id].blocksSummon);
}

function storyLocked(s: Z2State, inst: StoryInst2): boolean {
  return inst.id === "zhaoxing" && summonBlocked(s);
}

export function storyBasicOptions2(def: StoryDef2): StoryOption2[] {
  return def.options.filter((o) => !o.card && !o.hidden);
}

export function storyCardResponses2(def: StoryDef2): StoryOption2[] {
  return def.options.filter((o) => o.card);
}

/** Open stories `cardId` would answer if played now, with the option it picks. */
export function storyResponsesFor(s: Z2State, cardId: CardId2): { story: StoryInst2; option: StoryOption2 }[] {
  const out: { story: StoryInst2; option: StoryOption2 }[] = [];
  for (const st of openStories(s)) {
    if (storyLocked(s, st)) continue;
    if (st.id === "zhaoxing" && summonUnwell(s)) continue;
    const option = STORIES2[st.id].options.find((o) => o.card === cardId);
    if (option) out.push({ story: st, option });
  }
  return out;
}

export function boardEvents(s: Z2State): EventInst2[] {
  return [s.opportunity, s.crisis, ...s.huafei].filter((e): e is EventInst2 => e != null);
}

/** Does `cardId` count toward this unresolved event (single match or 双牌 progress)? */
export function cardAffectsEvent(ev: EventInst2, cardId: CardId2): boolean {
  if (ev.resolved) return false;
  const def = EVENTS2[ev.id];
  if (CARDS2[cardId].matches.includes(ev.id)) return true;
  const d = def.double;
  if (!d || !d.cards.includes(cardId)) return false;
  if (d.kind === "both") return !(ev.progress ?? []).includes(cardId);
  return true;
}

export function matchedEvents2(s: Z2State, cardId: CardId2): EventInst2[] {
  return boardEvents(s).filter((e) => cardAffectsEvent(e, cardId));
}

/** 联袂 works at most once per turn, whichever 陵容 it came from. */
function lianmeiAvailable(s: Z2State): boolean {
  return tierOf(s) === "close" && s.lianmeiSpent.length === 0;
}

/** 陵容 whose 联袂 can make the card at `index` free. */
function lianmeiSourceFor(s: Z2State, index: number): CardInst2 | null {
  if (!lianmeiAvailable(s)) return null;
  for (const j of [index - 1, index + 1]) {
    const c = s.hand[j];
    if (c && c.id === "lingrongXiangzhu") return c;
  }
  return null;
}

export function lianmeiLit(s: Z2State, card: CardInst2): boolean {
  return card.id === "lingrongXiangzhu" && lianmeiAvailable(s);
}

export function isFreeByLianmei(s: Z2State, cardUid: string): boolean {
  const i = s.hand.findIndex((c) => c.uid === cardUid);
  return i >= 0 && lianmeiSourceFor(s, i) != null;
}

/** 掣肘: a 怨怼 陵容 next to this (non-陵容) card. */
export function blockedByChezhou(s: Z2State, cardUid: string): boolean {
  if (tierOf(s) !== "resentful") return false;
  const i = s.hand.findIndex((c) => c.uid === cardUid);
  if (i < 0 || s.hand[i]!.id === "lingrongXiangzhu") return false;
  return [s.hand[i - 1], s.hand[i + 1]].some((c) => c?.id === "lingrongXiangzhu");
}

export function canPlayCard(s: Z2State, cardUid: string): boolean {
  if (s.outcome !== "playing" || s.pending) return false;
  if (!s.hand.some((c) => c.uid === cardUid)) return false;
  if (blockedByChezhou(s, cardUid)) return false;
  if (blockedByStatus(s, s.hand.find((c) => c.uid === cardUid)!.id)) return false;
  return playsLeft2(s) > 0 || isFreeByLianmei(s, cardUid);
}

export type TrialProgress2 = { shengchong: boolean; qingyu: boolean; summoned: boolean; all: boolean };

export function guirenTrialProgress(s: Z2State): TrialProgress2 {
  const shengchong = s.shengchong >= GUIREN_TRIAL.minShengchong;
  const qingyu = s.qingyu >= GUIREN_TRIAL.minQingyu;
  const summoned = s.trial.summoned;
  return { shengchong, qingyu, summoned, all: shengchong && qingyu && summoned };
}

/** Does this card count toward 【翊坤落幕】 right now? */
export function finaleAccepts(s: Z2State, cardId: CardId2): boolean {
  return s.finale != null && (FINALE.cards as readonly CardId2[]).includes(cardId);
}

/** Opening text follows the cards needed: 1 → full, 2 → narrow, 3 → thin. */
export function finaleTier(evidence: number): "full" | "narrow" | "thin" {
  const n = FINALE.needed(evidence);
  return n === 1 ? "full" : n === 2 ? "narrow" : "thin";
}

/** Closing text follows the verdict: 完胜 (≥ 5 evidence) or 险胜 (thinner with 2–3). */
export function finaleDoneStory(evidence: number): string {
  if (evidence >= EVIDENCE_THRESHOLDS.fullWin) return FINALE.doneStory.full;
  return evidence >= 4 ? FINALE.doneStory.narrow : FINALE.doneStory.thin;
}

export function canEndTurn2(s: Z2State): boolean {
  return s.outcome === "playing" && s.pending == null;
}

export function isXibieCard(s: Z2State, cardId: CardId2): boolean {
  return s.xibie != null && !s.xibieDone && s.xibie === cardId;
}

// ---------------------------------------------------------------- mutation helpers

function log(s: Z2State, text: string, tone: LogTone = "info"): void {
  s.log.push({ turn: s.turn, text, tone });
}

function lose(s: Z2State, reason: string): void {
  if (s.outcome !== "playing") return;
  s.outcome = "lost";
  s.lossReason = reason;
  log(s, `失败：${reason}`, "bad");
}

function roll(s: Z2State): number {
  const [rng, x] = rngNext(s.rng);
  s.rng = rng;
  return x;
}

function alive(s: Z2State): boolean {
  return s.outcome === "playing";
}

function revealShenzi(s: Z2State, by: "summon" | "other" = "other"): void {
  if (s.shenziRevealed) return;
  s.shenziRevealed = true;
  s.shenziRevealedBy = by;
  const why = by === "summon" ? "因为侍寝，新出现了一项资源" : "新出现了一项资源";
  log(s, `🌱 ${why}【身子】：关系到能否怀上龙裔，以及能否平安生产。当前身子 ${s.shenzi} / ${SHENZI.max}。`, "info");
}

function applyDelta2(s: Z2State, d: Delta2, source: string): void {
  if (!alive(s) || d.amount === 0) return;
  const label = RESOURCE2_LABEL[d.resource];
  if (d.resource === "hate") {
    const next = Math.max(0, Math.min(HATE.max, s.hate + d.amount));
    if (next === s.hate) return;
    s.hate = next;
    log(s, `${source}：华妃恨意 ${d.amount > 0 ? "+" : ""}${d.amount} → ${next}`, d.amount > 0 ? "bad" : "good");
    return;
  }
  if (d.resource === "shenzi") {
    revealShenzi(s);
    const next = Math.max(0, Math.min(SHENZI.max, s.shenzi + d.amount));
    const was = s.shenzi;
    s.shenzi = next;
    log(s, `${source}：身子 ${d.amount > 0 ? "+" : ""}${d.amount} → ${next}`, d.amount > 0 ? "good" : "bad");
    if (next === 0 && was > 0) shenziZero(s);
    return;
  }
  const cur = s[d.resource];
  if (d.amount > 0) {
    const next = Math.min(rankCap(s), cur + d.amount);
    s[d.resource] = next;
    const capped = next - cur < d.amount ? `（上限 ${rankCap(s)}，溢出部分忽略）` : "";
    log(s, `${source}：${label} +${d.amount}${capped} → ${next}`, "good");
    return;
  }
  const next = Math.max(0, cur + d.amount);
  s[d.resource] = next;
  log(s, `${source}：${label} ${d.amount} → ${next}`, "bad");
  if (next <= 0) lose(s, `${label}降至 0`);
}

function applyDeltas2(s: Z2State, deltas: readonly Delta2[], source: string): void {
  for (const d of deltas) {
    if (!alive(s)) return;
    applyDelta2(s, d, source);
  }
}

function addStatus2(s: Z2State, id: StatusId2, turns?: number): void {
  const def = STATUSES2[id];
  const remaining = turns ?? def.duration;
  s.statuses.push({ uid: `s${s.nextUid++}`, id, appliesFromTurn: s.turn + 1, remaining });
  const text = turns != null ? def.effectText.replace(/未来 \d+ 回合/, `未来 ${turns} 回合`) : def.effectText;
  log(s, `获得状态【${def.name}】（${text}）`, def.tag === "negative" ? "bad" : "good");
}

function removeStatusById(s: Z2State, id: StatusId2): boolean {
  const i = s.statuses.findIndex((st) => st.id === id);
  if (i < 0) return false;
  s.statuses.splice(i, 1);
  return true;
}

function removeStatus2(s: Z2State, uid: string, source: string): void {
  const st = s.statuses.find((x) => x.uid === uid);
  if (!st) return;
  s.statuses = s.statuses.filter((x) => x.uid !== uid);
  log(s, `${source}：移除状态【${STATUSES2[st.id].name}】`, "good");
}

function changeRelation(s: Z2State, delta: number, source: string): void {
  if (s.relation == null || delta === 0) return;
  const before = s.relation;
  const next = Math.max(LINGRONG.min, Math.min(LINGRONG.max, before + delta));
  if (next === before) return;
  s.relation = next;
  // the number stays hidden from the player: only the direction and tier changes are shown
  const tierChange = lingrongTier(before) !== lingrongTier(next) ? `，情分 ${TIER_LABEL[lingrongTier(before)]} → ${TIER_LABEL[lingrongTier(next)]}` : "";
  log(s, `${source === "陵容" ? "" : `${source}：`}${delta > 0 ? "陵容待你亲近了些" : "陵容与你生分了些"}${tierChange}`, delta > 0 ? "good" : "bad");
}

function gainEvidence(s: Z2State, id: EvidenceId): void {
  if (s.evidence.includes(id)) return;
  s.evidence.push(id);
  const def = EVIDENCE[id];
  log(s, `🗂️ 搜集华妃罪证（${s.evidence.length}）：${def.emoji} ${def.name}——${def.line}`, "good");
}

/** 身子 hit 0: 卧床静养, and a miscarriage when pregnant. */
function shenziZero(s: Z2State): void {
  if (s.pregnant) miscarry(s, 0, "身子亏空");
  if (!alive(s)) return;
  if (!hasStatus(s, "wochuangJingyang")) addStatus2(s, "wochuangJingyang");
}

function miscarry(s: Z2State, shenziLoss: number, cause: string): void {
  if (!s.pregnant) return;
  s.pregnant = false;
  removeStatusById(s, "shenhuaiLongyi");
  s.miscarriages++;
  s.miscarriageCause = cause;
  s.summonLast = null;
  dropPinEvent(s);
  log(s, `小产（${cause}）：失去【身怀龙裔】。`, "bad");
  const before = { shenzi: s.shenzi, qingyu: s.qingyu, shengchong: s.shengchong, hate: s.hate };
  applyDeltas2(
    s,
    [
      { resource: "shenzi", amount: -shenziLoss },
      { resource: "qingyu", amount: -1 },
      { resource: "shengchong", amount: -1 },
      { resource: "hate", amount: -3 },
    ],
    "小产",
  );
  s.miscarriageCost = {
    shenzi: s.shenzi - before.shenzi,
    qingyu: s.qingyu - before.qingyu,
    shengchong: s.shengchong - before.shengchong,
    hate: s.hate - before.hate,
  };
}

/** 晋封 (贵人 / 有孕晋嫔): 陵容 feels left behind. */
function lingrongOnPromotion(s: Z2State): void {
  if (s.relation == null) return;
  const text = LINGRONG_PROMOTION_TEXT[s.rank];
  if (text) log(s, text);
  changeRelation(s, -2, "晋封（姐姐越走越远）");
}

function becomePregnant(s: Z2State, source: string): void {
  if (s.pregnant || !alive(s)) return;
  s.pregnant = true;
  s.pregnancies++;
  revealShenzi(s);
  s.statuses.push({ uid: `s${s.nextUid++}`, id: "shenhuaiLongyi", appliesFromTurn: s.turn, remaining: 0 });
  log(s, `💗 ${source}：你有了身孕，获得【身怀龙裔】！`, "good");
  if (s.rank === "guiren") {
    // 晋嫔 waits for the 请脉报喜 opportunity, put at the bottom of the pool
    s.opportunityPool = [...s.opportunityPool.filter((id) => id !== PIN_EVENT), PIN_EVENT];
    log(s, "【请脉报喜】加入机会牌池：太医确诊后才能晋为嫔。", "good");
  }
  applyDelta2(s, { resource: "hate", amount: 3 }, "喜脉");
}

const PIN_EVENT = "qingmaiBaoxi" as const;
/** 华妃事件 evidence: the second qualifying answer turns the clues into evidence. */
const HUAFEI_EVIDENCE_CLUES = 2;
const CAO_EVENT = "qinmoChenqing" as const;
/** With this many other events (贵人考验 not counted), 凤鸾承恩 takes the opportunity event's place. */
const SUMMON_CROWD_LIMIT = 4;
/** 琴默叩门 never comes before this turn. */
const CAO_VISIT_MIN_TURN = 10;

function promoteToPin(s: Z2State): void {
  if (s.rank !== "guiren" || !s.pregnant) return;
  s.rank = "pin";
  const r = RANKS.pin;
  log(s, `有孕晋封为【${r.name}】：清誉 / 圣宠上限 ${r.cap}；下回合起每回合抓 ${r.draw} 打 ${r.plays}。`, "good");
  lingrongOnPromotion(s);
}

/** 小产: the pending 请脉报喜 leaves the pool (and the board). */
function dropPinEvent(s: Z2State): void {
  const had = s.opportunityPool.includes(PIN_EVENT) || s.opportunityUsed.includes(PIN_EVENT) || (s.opportunity?.id === PIN_EVENT && !s.opportunity.resolved);
  if (!had) return;
  s.opportunityPool = s.opportunityPool.filter((id) => id !== PIN_EVENT);
  s.opportunityUsed = s.opportunityUsed.filter((id) => id !== PIN_EVENT);
  if (s.opportunity?.id === PIN_EVENT && !s.opportunity.resolved) s.opportunity = null;
  log(s, "【请脉报喜】随之从机会牌池移除。");
}

/** 伤胎: 留方 absorbs it; otherwise 身子 -1, or a miscarriage when pregnant. */
function harmPregnancy(s: Z2State, source: string): boolean /* absorbed by 留方 */ {
  if (removeStatusById(s, "wentaiyiLiufang")) {
    log(s, `【温太医留方】抵消了「${source}」的伤胎后果。`, "good");
    return true;
  }
  if (s.pregnant) miscarry(s, 3, source);
  else applyDelta2(s, { resource: "shenzi", amount: -1 }, `${source}（伤胎）`);
  return false;
}

function shuhenjiao(s: Z2State, tier: LingrongTier): void {
  if (!alive(s)) return;
  log(s, "🧴 陵容送来了舒痕胶。");
  if (tier === "close") {
    log(s, SHUHENJIAO_TEXT.close, "good");
    applyDelta2(s, { resource: "shengchong", amount: 1 }, "舒痕胶（疤痕尽消）");
    return;
  }
  const r = roll(s);
  if (r < SHUHENJIAO_HARM_CHANCE[tier]) {
    s.shuhenjiaoHarm++;
    log(s, SHUHENJIAO_TEXT.harm, "bad");
    if (s.shenzi > 1) applyDelta2(s, { resource: "shenzi", amount: -1 }, "舒痕胶");
    else revealShenzi(s);
  } else if (r < SHUHENJIAO_HARM_CHANCE[tier] + SHUHENJIAO_HEAL_CHANCE[tier]) {
    log(s, SHUHENJIAO_TEXT.heal, "good");
    applyDelta2(s, { resource: "shengchong", amount: 1 }, "舒痕胶（疤痕尽消）");
  } else {
    log(s, SHUHENJIAO_TEXT.safe);
  }
}

function summonSuccess(s: Z2State, source: string): void {
  log(s, `${source}：侍寝成功。`, "good");
  revealShenzi(s, "summon");
  if (s.trial.active && !s.trial.summoned) {
    s.trial.summoned = true;
    log(s, "晋封考验：侍寝条件达成。", "good");
  }
  applyDelta2(s, { resource: "shengchong", amount: 1 }, "侍寝");
  applyDelta2(s, { resource: "hate", amount: 1 }, "侍寝");
  if (!alive(s) || s.pregnant || (s.rank !== "guiren" && s.rank !== "pin")) return;
  const chance = Math.min(1, s.shenzi / SHENZI.divisor);
  if (chance >= 1 || roll(s) < chance) becomePregnant(s, "侍寝后");
  else log(s, `喜脉判定（身子 ${s.shenzi} ÷ ${SHENZI.divisor}）：未有喜。`);
}

function checkFanan(s: Z2State): void {
  if (!alive(s) || s.hate < HATE.max) return;
  if (s.stories.some((st) => st.id === "huafeiFanan" && st.chosenOptionId == null)) return;
  openStory(s, "huafeiFanan");
}

function openStory(s: Z2State, id: StoryId2): void {
  s.stories.push({ id, chosenOptionId: null });
  log(s, `剧情事件：【${STORIES2[id].name}】`);
}

/** 惜别: once one of the leaving person's cards is in hand, all their other copies leave; only this one stays. */
function cullXibie(s: Z2State): void {
  const who = s.xibie;
  if (!who || s.xibieDone || s.xibieCulled) return;
  const keep = s.hand.find((c) => c.id === who);
  if (!keep) return;
  s.xibieCulled = true;
  const others = (c: CardInst2) => c.id === who && c.uid !== keep.uid;
  const removed = [...s.hand.filter(others), ...s.drawPile.filter(others), ...s.discard.filter(others)];
  s.hand = s.hand.filter((c) => !others(c));
  s.drawPile = s.drawPile.filter((c) => !others(c));
  s.discard = s.discard.filter((c) => !others(c));
  s.departed.push(...removed);
  log(
    s,
    `🕯️ ${XIBIE[who].who}将要远去：${removed.length > 0 ? `其余 ${removed.length} 张【${CARDS2[who].name}】离场，` : ""}只剩手里这一张带【惜别】的，这是最后一次相助。`,
    "bad",
  );
}

function drawCards2(s: Z2State, n: number): void {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discard.length === 0) {
        log(s, "抽牌堆与弃牌堆都已空，无法继续抽牌。");
        return;
      }
      const [rng, shuffled] = shuffle(s.rng, s.discard);
      s.rng = rng;
      s.drawPile = shuffled;
      s.discard = [];
      log(s, `弃牌堆洗回抽牌堆（${s.drawPile.length} 张）。`);
    }
    s.hand.push(s.drawPile.shift()!);
    s.drawnThisTurn++;
  }
  cullXibie(s);
}

function drawFromPool<T extends EventId2>(s: Z2State, poolKey: "opportunityPool" | "crisisPool", usedKey: "opportunityUsed" | "crisisUsed"): T | null {
  const pool = s[poolKey] as T[];
  if (pool.length === 0) {
    const used = s[usedKey] as T[];
    if (used.length === 0) return null;
    const [rng, shuffled] = shuffle(s.rng, used);
    s.rng = rng;
    (s[poolKey] as T[]) = shuffled;
    (s[usedKey] as T[]) = [];
    log(s, `${poolKey === "opportunityPool" ? "机会" : "危机"}牌池已抽完，已用事件重新洗匀。`);
  }
  return (s[poolKey] as T[]).shift() ?? null;
}

function newEvent(s: Z2State, id: EventId2): EventInst2 {
  return { uid: `e${s.nextUid++}`, id, resolved: false };
}

// ---------------------------------------------------------------- resolution

function verb(kind: string): string {
  return kind === "opportunity" ? "把握" : kind === "huafei" ? "应对" : "化解";
}

function applyResponsePenalty(s: Z2State, cost: ResponsePenalty, source: string): void {
  applyDeltas2(s, cost.effects, source);
  if (cost.status && alive(s)) addStatus2(s, cost.status, cost.statusTurns);
}

function eventStoryFor(ev: EventInst2, card: CardId2): string | undefined {
  return EVENTS2[ev.id].resolvedStory[card];
}

function resolveEventByCard(s: Z2State, ev: EventInst2, card: CardId2, doubleReward: boolean): void {
  const def = EVENTS2[ev.id];
  ev.resolved = true;
  ev.resolvedBy = card;
  log(s, `${verb(def.kind)}${EVENT_KIND2_LABEL[def.kind]}事件【${def.name}】`, "good");
  const story = eventStoryFor(ev, card);
  if (story) log(s, story);
  // 华妃事件 are never free: answering still costs one lighter penalty
  const cost = def.double ? def.doublePenalty : def.responsePenalty?.[card];
  if (cost && alive(s)) applyResponsePenalty(s, cost, `${def.name}（应对的代价）`);
  if (def.kind === "opportunity") {
    applyDeltas2(s, def.reward, def.name);
    const bonus = def.cardBonus?.[card];
    if (bonus && alive(s)) applyDeltas2(s, bonus, `${def.name}（${CARDS2[card].name}）`);
    if (doubleReward && def.reward.length > 0 && alive(s)) {
      ev.rewardDoubled = true;
      applyDeltas2(s, def.reward, "眉庄相助联动：奖励翻倍");
    }
  }
  const evidence = def.evidence;
  if (evidence && alive(s)) {
    const via = def.double ? (ev.progress ?? []) : [card];
    if (via.some((c) => evidence.cards.includes(c)) && !s.evidence.includes(evidence.id)) {
      // 华妃事件 come back again and again: the first time only leaves a clue
      const clues = (s.evidenceClues[evidence.id] ?? 0) + 1;
      s.evidenceClues[evidence.id] = clues;
      if (def.kind === "huafei" && clues < HUAFEI_EVIDENCE_CLUES) {
        log(s, "你记下了些蛛丝马迹，只是还不足以成为罪证。", "info");
      } else {
        ev.evidence = evidence.id;
        gainEvidence(s, evidence.id);
      }
    }
  }
  if (ev.id === PIN_EVENT && alive(s)) promoteToPin(s);
  if (ev.id === "wenyiBaoyang" && alive(s)) {
    s.caoOwed = true;
    log(s, "曹贵人欠下了你的人情。", "good");
  }
}

/** 陵容 on an ordinary / 华妃 event; returns the relation change to apply afterwards. */
function resolveEventByLingrong(s: Z2State, ev: EventInst2, tier: LingrongTier): number {
  const def = EVENTS2[ev.id];
  const o: LingrongOutcome | undefined = LINGRONG_EVENT[ev.id]?.[tier];
  if (!o) return 0;
  ev.lingrong = tier;
  log(s, `${TIER_LABEL[tier]}的陵容：${o.story}`, tier === "resentful" ? "bad" : "info");
  if (!o.resolves) {
    ev.lingrongFailed = true;
    log(s, `【${def.name}】失效：陵容没有帮上忙。`, "bad");
    if (o.aggravate) ev.aggravated = true;
    if (o.effects) applyDeltas2(s, o.effects, `陵容（${TIER_LABEL[tier]}）`);
    return o.relation ?? 0;
  }
  ev.resolved = true;
  ev.resolvedBy = "lingrongXiangzhu";
  log(s, `${verb(def.kind)}${EVENT_KIND2_LABEL[def.kind]}事件【${def.name}】`, "good");
  if (o.effects) applyDeltas2(s, o.effects, `${def.name}（陵容·${TIER_LABEL[tier]}）`);
  if (o.extraDraw && alive(s)) {
    log(s, `陵容联动：额外抽 ${o.extraDraw} 张牌。`, "good");
    drawCards2(s, o.extraDraw);
  }
  if (o.evidence && def.evidence && alive(s)) {
    ev.evidence = def.evidence.id;
    gainEvidence(s, def.evidence.id);
  }
  if (o.shuhenjiao) shuhenjiao(s, tier);
  return o.relation ?? 0;
}

function applyStoryOption(s: Z2State, inst: StoryInst2, option: StoryOption2, source: string, tier: LingrongTier | null): number {
  const def = STORIES2[inst.id];
  inst.chosenOptionId = option.id;
  if (option.card) inst.viaCard = option.card;
  log(s, source);
  let relationDelta = 0;

  // 陵容 on 召幸: by tier
  if (inst.id === "zhaoxing" && option.card === "lingrongXiangzhu" && tier) {
    const o = LINGRONG_SUMMON[tier];
    log(s, o.story, tier === "close" ? "good" : "bad");
    inst.story = o.story;
    inst.result = o.result === "success" ? "侍寝成功" : o.result === "stolen" ? "陵容夺功，你未侍寝" : "召幸被截走";
    if (o.effects) applyDeltas2(s, o.effects, "陵容截宠");
    if (o.result === "success") summonSuccess(s, "召幸");
    return o.relation ?? 0;
  }

  const told = option.tierStory && tier ? option.tierStory[tier] : option.story;
  if (option.tierStory && tier) inst.story = told;
  log(s, told);
  if (option.distantRemark && tier === "distant") log(s, `陵容（生分）：${option.distantRemark}`);
  if (inst.id === "fakuiPregnant") {
    let loss = option.fakuiShenzi ?? 3;
    if (s.fakuiHarsh) loss++;
    if (removeStatusById(s, "wentaiyiLiufang")) {
      loss = Math.max(0, loss - 1);
      log(s, "【温太医留方】保住了你的身子：身子少扣 1。", "good");
    }
    miscarry(s, loss, "翊坤长跪");
  } else if (inst.id === "fakuiPlain") {
    applyDeltas2(s, option.effects, `${def.name}·${option.name}`);
    if (s.fakuiHarsh) applyDelta2(s, { resource: "qingyu", amount: -1 }, "华妃恨意正盛，罚得更重");
  } else {
    applyDeltas2(s, option.effects, `${def.name}·${option.name}`);
  }
  if (!alive(s)) return 0;

  if (option.setHate != null) {
    s.hate = option.setHate;
    log(s, `华妃恨意初始为 ${s.hate}。`, "bad");
  }
  if (option.setRelation != null) {
    s.relation = option.setRelation;
    log(s, `陵容对你的情分：${TIER_LABEL[lingrongTier(s.relation)]}。`);
  }
  if (option.status) addStatus2(s, option.status);
  relationDelta += (option.relation ?? 0) + (tier ? (option.tierRelation?.[tier] ?? 0) : 0);
  if (option.evidence && (!option.evidenceTiers || (tier != null && option.evidenceTiers.includes(tier)))) gainEvidence(s, option.evidence);
  if (option.exit) {
    s.xibie = option.exit;
    log(s, `${XIBIE[option.exit].who}将要离你远去：【${CARDS2[option.exit].name}】带上【惜别】标签。下次抓到时，其余的同名牌离场，只留这一张。`, "bad");
    cullXibie(s);
  }
  if (option.pregnancy) becomePregnant(s, def.name);
  if (option.summon === "success") {
    inst.result = "侍寝成功";
    summonSuccess(s, "召幸");
  }
  if (option.summon === "avoid") inst.result = "称病避宠";
  if (option.caoBefriend) {
    s.caoBefriended = true;
    s.opportunityPool.push("wenyiBaoyang");
    const [rng, shuffled] = shuffle(s.rng, s.opportunityPool);
    s.rng = rng;
    s.opportunityPool = shuffled;
    log(s, "【温宜抱恙】洗入机会池。");
  }
  if (inst.id === "huafeiFanan" && alive(s)) {
    s.hate = HATE.fananResetTo;
    log(s, `华妃出了这口气，恨意回落到 ${s.hate}。`, "good");
  }
  if (option.shuhenjiao && tier) shuhenjiao(s, tier);
  return relationDelta;
}

function departXibie(s: Z2State, who: DepartingCard): void {
  const leaving = (c: CardInst2) => c.id === who;
  s.departed.push(...s.hand.filter(leaving), ...s.drawPile.filter(leaving), ...s.discard.filter(leaving));
  s.hand = s.hand.filter((c) => !leaving(c));
  s.drawPile = s.drawPile.filter((c) => !leaving(c));
  s.discard = s.discard.filter((c) => !leaving(c));
  s.xibieDone = true;
  log(s, XIBIE[who].leaveStory, "bad");
  log(s, `【${CARDS2[who].name}】离场。`);
}

function resolvePlay2(s: Z2State, cardUid: string, removeStatusUid?: string): void {
  const idx = s.hand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return;
  const lianmei = lianmeiSourceFor(s, idx);
  const card = s.hand[idx]!;
  const def = CARDS2[card.id];
  const tier = tierOf(s);
  const isLingrong = card.id === "lingrongXiangzhu";
  const xibie = isXibieCard(s, card.id) ? s.xibie : null;

  // which stories / events this card answers (computed before anything changes)
  const responses = storyResponsesFor(s, card.id);
  const singles = boardEvents(s).filter((e) => !e.resolved && def.matches.includes(e.id));
  const doubles = boardEvents(s).filter((e) => !e.resolved && !def.matches.includes(e.id) && cardAffectsEvent(e, card.id));

  s.hand.splice(idx, 1);
  if (lianmei) {
    s.lianmeiSpent.push(lianmei.uid);
    log(s, `打出【${def.name}】（联袂：不占出牌名额）`, "good");
  } else {
    s.playsUsed++;
    log(s, `打出【${def.name}】${xibie ? "（惜别）" : ""}`);
  }

  let relationDelta = 0;

  // 1. story responses
  for (const { story, option } of responses) {
    if (!alive(s)) break;
    relationDelta += applyStoryOption(s, story, option, `【${STORIES2[story.id].name}】·${option.name}（打出【${def.name}】）`, isLingrong ? tier : null);
  }

  // 2. card's own effect (or 惜别)
  if (alive(s)) {
    if (xibie) {
      const x = XIBIE[xibie];
      log(s, `惜别·${x.effectName}：${x.playStory}`, "good");
      if (xibie === "meizhuangXiangzhu") {
        applyDelta2(s, { resource: "qingyu", amount: 2 }, "临别相托");
        if (alive(s)) addStatus2(s, "meizhuangZhutuo");
      } else {
        for (const st of removableNegatives(s)) removeStatus2(s, st.uid, "临行诊治");
        applyDelta2(s, { resource: "shenzi", amount: 2 }, "临行诊治");
        if (alive(s)) addStatus2(s, "wentaiyiLiufang");
      }
    } else {
      applyDeltas2(s, def.base, def.name);
      if (def.baseStatus && alive(s)) addStatus2(s, def.baseStatus);
      if (def.baseDraw > 0 && alive(s)) drawCards2(s, def.baseDraw);
    }
  }

  // 3. ordinary / 华妃 events (opportunity first, as in 第一关)
  const ordered = [...singles].sort((a, b) => (EVENTS2[a.id].kind === "opportunity" ? -1 : 0) - (EVENTS2[b.id].kind === "opportunity" ? -1 : 0));
  for (const ev of ordered) {
    if (!alive(s)) break;
    if (isLingrong && tier) relationDelta += resolveEventByLingrong(s, ev, tier);
    else resolveEventByCard(s, ev, card.id, card.id === "meizhuangXiangzhu");
    if (alive(s) && card.id === "shoulongRenxin" && ev.id === "neiwufuDiaonan") {
      log(s, "收拢人心联动：额外抽 1 张牌。", "good");
      drawCards2(s, 1);
    }
  }

  // 4. 双牌 progress
  for (const ev of doubles) {
    if (!alive(s)) break;
    const d = EVENTS2[ev.id].double!;
    ev.progress = [...(ev.progress ?? []), card.id];
    if (ev.progress.length >= 2) resolveEventByCard(s, ev, card.id, false);
    else log(s, `【${EVENTS2[ev.id].name}】双牌进度 1/2${d.kind === "both" ? `（还需${d.cards.filter((c) => c !== card.id).map((c) => `【${CARDS2[c].name}】`).join("")}）` : ""}。`);
  }

  // 5. 陵容 with nothing to answer: just her company, 情分 +1 (a 怨怼 one still bites: 反噬)
  if (alive(s) && isLingrong && tier && responses.length === 0 && singles.length === 0 && !finaleAccepts(s, card.id)) {
    log(s, LINGRONG_IDLE_TEXT[tier], tier === "resentful" ? "bad" : "good");
    if (tier === "resentful") {
      log(s, "怨怼的陵容反咬一口。", "bad");
      applyDeltas2(s, LINGRONG_BACKLASH, "陵容反噬");
    }
    relationDelta += 1;
  }

  // 6. extra effects
  if (alive(s) && card.id === "jingguanQibian") {
    s.extraPlays++;
    log(s, `静观其变：本回合最多出牌数 +1（现为 ${playLimit2(s)}）。`, "good");
  }
  if (alive(s) && card.id === "wenTaiyiZhenzhi" && !xibie) {
    const negatives = removableNegatives(s);
    const target = removeStatusUid ?? (negatives.length === 1 ? negatives[0]!.uid : undefined);
    if (target) removeStatus2(s, target, def.name);
    else log(s, "温太医相助：没有可移除的负面状态。");
  }

  if (alive(s) && s.trial.active && !s.jinghong.done) {
    if (card.id === "meizhuangXiangzhu") s.jinghong.meizhuang = true;
    if (isLingrong && tier && tier !== "resentful") s.jinghong.lingrong = true;
    if (s.jinghong.meizhuang && s.jinghong.lingrong) {
      s.jinghong.done = true;
      log(s, `💃 ${JINGHONG_STORY}`, "good");
      addStatus2(s, "jinghongWu");
    }
  }

  if (alive(s) && finaleAccepts(s, card.id)) {
    const f = s.finale!;
    const first = !f.played.includes(card.id);
    f.played.push(card.id);
    const story = !first ? "" : isLingrong ? FINALE.lingrongStory[tier ?? "distant"] : (FINALE.cardStory[card.id] ?? "");
    if (story) f.stories.push(`${def.emoji} ${story}`);
    log(s, `【${FINALE.name}】${story}（解牌 ${f.played.length}/${f.needed}）`, "good");
    if (f.played.length === f.needed) log(s, finaleDoneStory(s.evidence.length), "good");
  }

  if (alive(s) && relationDelta !== 0) changeRelation(s, relationDelta, "陵容");

  if (xibie) {
    s.departed.push(card);
    departXibie(s, xibie);
  } else {
    s.discard.push(card);
  }
  checkFanan(s);
}

// ---------------------------------------------------------------- turn flow

function drawHuafei(s: Z2State): void {
  // 翊坤落幕: 华妃 has no hand left to play on the last turn (延烧 ones die out too)
  if (s.turn >= STAGE2.totalTurns) {
    s.huafei = [];
    return;
  }
  const plan = huafeiDrawPlan(s.hate);
  let n = plan.fixed;
  if (plan.chance > 0 && roll(s) < plan.chance) n++;
  // 欢宜香浓 (截宠) only shows up on a turn that has a 召幸 to steal.
  const summonTonight = s.stories.some((st) => st.id === "zhaoxing");
  const unlocked = HUAFEI_EVENTS.filter((id) => s.hate >= (EVENTS2[id].unlockHate ?? 0) && (summonTonight || !EVENTS2[id].blocksSummon));
  const drawn: HuafeiId[] = [];
  for (let i = 0; i < n; i++) {
    const options = unlocked.filter((id) => !drawn.includes(id));
    if (options.length === 0) break;
    const id = options[Math.floor(roll(s) * options.length)]!;
    drawn.push(id);
    s.huafei.push(newEvent(s, id));
    log(s, `华妃事件：【${EVENTS2[id].name}】`, "bad");
  }
}

function checkSummon(s: Z2State): void {
  // 召幸 starts once the 贵人考验 has begun; none on the 罚跪 turn (it never interrupts the interval count).
  if (s.pregnant || s.turn < GUIREN_TRIAL.firstTurn || s.turn === FAKUI_TURN) return;
  const inGarden = s.turn >= YUANMINGYUAN_TURNS.first && s.turn <= YUANMINGYUAN_TURNS.last;
  const threshold = SUMMON_THRESHOLD[s.rank];
  if (!inGarden) {
    if (threshold == null || s.shengchong < threshold) {
      s.summonLast = null;
      return;
    }
    if (s.summonLast != null && s.turn - s.summonLast < summonInterval(s.shengchong - threshold)) return;
  }
  s.summonLast = s.turn;
  openStory(s, "zhaoxing");
}

/** Too crowded a turn: 凤鸾承恩 pushes the opportunity event back to the top of its pool. */
function makeRoomForSummon(s: Z2State): void {
  if (!s.opportunity || !s.stories.some((st) => st.id === "zhaoxing")) return;
  const others = s.stories.filter((st) => st.id !== "zhaoxing").length + (s.opportunity ? 1 : 0) + (s.crisis ? 1 : 0) + s.huafei.length;
  if (others < SUMMON_CROWD_LIMIT) return;
  const id = s.opportunity.id as OpportunityId2;
  s.opportunityPool = [id, ...s.opportunityPool];
  s.opportunity = null;
}

function beginTurn2(s: Z2State, turn: number): void {
  s.turn = turn;
  s.turnRank = s.rank;
  s.playsUsed = 0;
  s.extraPlays = 0;
  s.drawnThisTurn = 0;
  s.lianmeiSpent = [];
  s.notices = [];
  log(s, `—— 第 ${turn} 回合 ——`);

  for (const st of activeStatuses(s)) {
    const effects = STATUSES2[st.id].turnStart;
    if (effects && alive(s)) applyDeltas2(s, effects, STATUSES2[st.id].name);
  }
  if (turn > 1) {
    if (s.shengchong <= 4) applyDelta2(s, { resource: "hate", amount: -1 }, "失宠，华妃懒得管你");
    else if (s.shengchong >= rankCap(s)) applyDelta2(s, { resource: "hate", amount: 1 }, "宠冠六宫");
    if (s.pregnant) applyDelta2(s, { resource: "hate", amount: 1 }, "身怀龙裔，华妃如鲠在喉");
  }
  checkFanan(s);

  const fixed = FIXED_STORY_TURNS[turn];
  if (fixed) openStory(s, fixed);
  if (turn === FAKUI_TURN) {
    s.fakuiHarsh = s.hate >= 6;
    openStory(s, s.pregnant ? "fakuiPregnant" : "fakuiPlain");
  }
  if (turn === STAGE2.totalTurns && s.evidence.length <= FINALE.hopeless) {
    log(s, FINALE.hopelessStory, "bad");
    lose(s, `罪证只有 ${s.evidence.length} 条，扳不倒华妃`);
    return;
  }
  if (turn === STAGE2.totalTurns) {
    const needed = FINALE.needed(s.evidence.length);
    s.finale = { needed, played: [], stories: [] };
    log(s, `剧情事件：【${FINALE.name}】——${FINALE.flavor[finaleTier(s.evidence.length)]}本回合须打出 ${needed} 张牌才能扳倒华妃。`);
  }
  if (turn === GUIREN_TRIAL.firstTurn && s.rank === "changzai") {
    s.trial = { active: true, summoned: false };
    log(s, `剧情事件：【${GUIREN_TRIAL.name}】开始（第 ${GUIREN_TRIAL.firstTurn}—${GUIREN_TRIAL.lastTurn} 回合）：需圣宠 ≥ ${GUIREN_TRIAL.minShengchong}、清誉 ≥ ${GUIREN_TRIAL.minQingyu}，且考验期间至少侍寝成功一次。`);
  }
  if (!s.caoTriggered && s.hate > 5 && turn >= CAO_VISIT_MIN_TURN) {
    s.caoTriggered = true;
    openStory(s, "caoGuirenLaifang");
  }

  const opp = drawFromPool<OpportunityId2>(s, "opportunityPool", "opportunityUsed");
  if (opp) {
    s.opportunity = newEvent(s, opp);
    log(s, `机会事件：【${EVENTS2[opp].name}】`);
  }
  const crisis = drawFromPool<CrisisId2>(s, "crisisPool", "crisisUsed");
  if (crisis) {
    s.crisis = newEvent(s, crisis);
    log(s, `危机事件：【${EVENTS2[crisis].name}】`);
  }
  checkSummon(s);
  drawHuafei(s);
  makeRoomForSummon(s);

  // 依依: 陵容 kept from last turn take up this turn's draws.
  const kept = s.hand.length;
  const base = drawCount2(s, turn);
  const n = Math.max(0, base - kept);
  const mod = drawModifier2(s, turn);
  drawCards2(s, n);
  const notes = [mod !== 0 ? `状态修正 ${mod > 0 ? "+" : ""}${mod}，最低 1 张` : "", kept > 0 ? `依依留下 ${kept} 张陵容，少抓 ${base - n} 张` : ""].filter(Boolean);
  log(s, `抓 ${n} 张牌${notes.length ? `（${notes.join("；")}）` : ""}。`);
}

function settleHuafei(s: Z2State, ev: EventInst2): boolean /* stays */ {
  const def = EVENTS2[ev.id];
  // 双牌 half done: a lighter penalty, no 激怒 / 出气, and 嘱托 is not needed
  if (def.partialPenalty && (ev.progress?.length ?? 0) === 1) {
    log(s, `华妃事件【${def.name}】只应对了一半。`, "bad");
    applyResponsePenalty(s, def.partialPenalty, `${def.name}（应对了一半）`);
    return false;
  }
  if (removeStatusById(s, "meizhuangZhutuo")) {
    log(s, `【眉庄嘱托】抵消了华妃事件【${def.name}】的未化解效果。`, "good");
    if ((def.unresolvedHate ?? 0) < 0) applyDelta2(s, { resource: "hate", amount: def.unresolvedHate! }, `${def.name}（出气）`);
    return false;
  }
  log(s, `华妃事件【${def.name}】未应对：${ev.burning ? "延烧未止" : def.unresolvedText}。`, "bad");
  if (def.burnPenalty) {
    if (ev.burning) {
      applyDeltas2(s, def.burnPenalty, `${def.name}（延烧）`);
      if (def.burnStatus && alive(s)) addStatus2(s, def.burnStatus);
      return false;
    }
    applyDeltas2(s, def.penalty, def.name);
    ev.burning = true;
    ev.progress = undefined;
    return true;
  }
  applyDeltas2(s, def.penalty, def.name);
  const wasPregnant = s.pregnant;
  if (def.harmsPregnancy && alive(s)) harmPregnancy(s, def.name);
  if (def.penaltyStatus && alive(s) && !(def.harmsPregnancy && wasPregnant)) addStatus2(s, def.penaltyStatus, def.penaltyStatusTurns);
  if (def.unresolvedHate && alive(s)) applyDelta2(s, { resource: "hate", amount: def.unresolvedHate }, `${def.name}（${def.unresolvedHate > 0 ? "激怒" : "出气"}）`);
  return false;
}

function retiredOpportunity(s: Z2State, ev: EventInst2): boolean {
  if (ev.id === "wenyiBaoyang") return ev.resolved;
  const evidence = EVENTS2[ev.id].evidence;
  return evidence != null && s.evidence.includes(evidence.id);
}

function endTurn2(s: Z2State): void {
  // 10. open stories → default option
  for (const inst of s.stories) {
    if (inst.chosenOptionId != null || !alive(s)) continue;
    const def = STORIES2[inst.id];
    if (inst.id === "zhaoxing" && summonBlocked(s)) {
      inst.chosenOptionId = "cuoguo";
      inst.result = "召幸作废";
      log(s, "【欢宜香浓】未化解：皇上留在翊坤宫，本回合召幸作废。", "bad");
      continue;
    }
    const option = def.options.find((o) => o.id === def.defaultOptionId)!;
    const msg = option.hidden ? `【${def.name}】未处理，${option.story}` : `未作选择，已按默认选项【${option.name}】处理【${def.name}】。`;
    applyStoryOption(s, inst, option, msg, null);
  }
  if (!alive(s)) return;

  // 11. unresolved events
  if (s.opportunity && !s.opportunity.resolved) log(s, `机会事件【${EVENTS2[s.opportunity.id].name}】未把握，直接离场。`);
  if (s.crisis && !s.crisis.resolved) {
    const def = EVENTS2[s.crisis.id];
    log(s, `危机事件【${def.name}】未化解：${def.unresolvedText}。`, "bad");
    applyDeltas2(s, def.penalty, def.name);
    // 留方 only absorbs the 伤胎 itself; 抱恙在身 still comes — unless pregnant (the 伤胎 is a 小产 then)
    const wasPregnant = s.pregnant;
    if (def.harmsPregnancy && alive(s)) harmPregnancy(s, def.name);
    if (def.penaltyStatus && alive(s) && !(def.harmsPregnancy && wasPregnant)) {
      addStatus2(s, def.penaltyStatus);
      if (s.crisis.aggravated && alive(s)) addStatus2(s, def.penaltyStatus);
    }
  }
  const staying: EventInst2[] = [];
  for (const ev of s.huafei) {
    if (!alive(s)) break;
    if (ev.resolved) continue;
    if (settleHuafei(s, ev)) staying.push(ev);
  }
  if (!alive(s)) return;

  // 12. events leave
  if (s.opportunity?.id === CAO_EVENT) {
    // 琴默陈情 comes once only, resolved or not
  } else if (s.opportunity?.id === PIN_EVENT) {
    // not confirmed yet: shuffled back into the remaining pool while still pregnant
    if (!s.opportunity.resolved && s.pregnant && s.rank === "guiren") {
      const [rng, shuffled] = shuffle(s.rng, [...s.opportunityPool, PIN_EVENT]);
      s.rng = rng;
      s.opportunityPool = shuffled;
      log(s, "【请脉报喜】没能确诊，洗回机会牌池。");
    }
  } else if (s.opportunity && !retiredOpportunity(s, s.opportunity)) s.opportunityUsed.push(s.opportunity.id as OpportunityId2);
  if (s.crisis) s.crisisUsed.push(s.crisis.id as CrisisId2);
  s.opportunity = null;
  s.crisis = null;
  s.huafei = staying;
  s.stories = [];

  // 13. hand: 依依 keeps 陵容 (生分); others to discard; 冷落
  const tier = tierOf(s);
  const lingrongLeft = s.hand.some((c) => c.id === "lingrongXiangzhu");
  const keep = tier === "distant" ? s.hand.filter((c) => c.id === "lingrongXiangzhu") : [];
  s.discard.push(...s.hand.filter((c) => !keep.includes(c)));
  s.hand = keep;
  if (keep.length > 0) log(s, `依依：${keep.length} 张【陵容相助】留在手牌中，下回合少抓 ${keep.length} 张。`);
  if (lingrongLeft && s.relation != null) {
    if (s.relation > LINGRONG.neglectFloor) {
      log(s, LINGRONG_NEGLECT_TEXT.drop, "bad");
      changeRelation(s, -1, "冷落");
    } else {
      log(s, LINGRONG_NEGLECT_TEXT.floor, "bad");
    }
  }

  // 14. statuses tick
  for (const st of s.statuses) {
    if (!STATUSES2[st.id].permanent && st.appliesFromTurn <= s.turn) st.remaining--;
  }
  for (const st of s.statuses.filter((x) => !STATUSES2[x.id].permanent && x.remaining <= 0)) {
    log(s, `状态【${STATUSES2[st.id].name}】结束。`);
    if (st.id === "wochuangJingyang") {
      s.shenzi = Math.max(s.shenzi, 1);
      log(s, `静养期满，身子恢复为 ${s.shenzi}。`, "good");
    }
  }
  s.statuses = s.statuses.filter((x) => STATUSES2[x.id].permanent || x.remaining > 0);

  // 15. 贵人考验
  if (s.trial.active) {
    if (guirenTrialProgress(s).all) {
      s.trial.active = false;
      s.rank = GUIREN_TRIAL.promoteTo;
      const r = RANKS[s.rank];
      log(s, `晋封成功！位分晋升为【${r.name}】：每回合抓 ${r.draw} 打 ${r.plays}，清誉 / 圣宠上限 ${r.cap}。`, "good");
      applyDelta2(s, { resource: "hate", amount: 2 }, "晋为贵人");
      lingrongOnPromotion(s);
    } else if (s.turn >= GUIREN_TRIAL.lastTurn) {
      s.trial.active = false;
      lose(s, `第 ${GUIREN_TRIAL.lastTurn} 回合结束时仍未晋为贵人`);
      return;
    }
  }
  if (!alive(s)) return;

  // scheduled additions
  if (s.turn === 2) {
    const added: CardInst2[] = Array.from({ length: LINGRONG_COPIES }, () => ({ uid: `c${s.nextUid++}`, id: "lingrongXiangzhu" as const }));
    // into the discard pile, so they arrive with the next reshuffle instead of in one clump
    s.discard.push(...added);
    log(s, `${LINGRONG_COPIES} 张【陵容相助】加入弃牌堆，下次洗牌后才会抽到。`);
  }
  if (s.turn === NIAN_TURN && s.caoOwed) {
    s.opportunityPool = [CAO_EVENT, ...s.opportunityPool];
    log(s, "曹贵人眼见年家倒台，托人递话说要来碎玉轩一趟：【琴默陈情】加入机会牌池。", "good");
  }
  const late = LATE_OPPORTUNITIES[s.turn];
  if (late) {
    const [rng, shuffled] = shuffle(s.rng, [...s.opportunityPool, late]);
    s.rng = rng;
    s.opportunityPool = shuffled;
    log(s, `【${EVENTS2[late].name}】洗入机会池。`);
  }

  // 16. 翊坤落幕: the cards decide; the evidence decides how many it took and how it ends
  if (s.turn >= STAGE2.totalTurns) {
    const n = s.evidence.length;
    const f = s.finale;
    if (!f || f.played.length < f.needed) {
      log(s, FINALE.failStory, "bad");
      lose(s, "没能在最后一回合扳倒华妃");
      return;
    }
    s.outcome = "won";
    s.victory = n >= EVIDENCE_THRESHOLDS.fullWin ? "full" : "narrow";
    log(s, s.victory === "full" ? `罪证 ${n} 条，华妃降为答应，打入冷宫：完胜！` : `罪证 ${n} 条，华妃被收回协理六宫之权：险胜！`, "good");
    return;
  }

  beginTurn2(s, s.turn + 1);
}

// ---------------------------------------------------------------- public API

export function newStage2(seed: number, carry: Carry | null): Z2State {
  let rng = createRngFromSeed(seed);
  let nextUid = 1;
  const deck: CardInst2[] = STAGE2_START_DECK.map((id) => ({ uid: `c${nextUid++}`, id }));
  let drawPile: CardInst2[];
  [rng, drawPile] = shuffle(rng, deck);
  let opportunityPool: OpportunityId2[];
  let crisisPool: CrisisId2[];
  [rng, opportunityPool] = shuffle(rng, [...OPPORTUNITY2_POOL]);
  [rng, crisisPool] = shuffle(rng, [...CRISIS2_POOL]);
  const s: Z2State = {
    stage: 2,
    seed,
    carry,
    rng,
    turn: 0,
    rank: STAGE2.startRank,
    turnRank: STAGE2.startRank,
    qingyu: Math.min(RANKS[STAGE2.startRank].cap, carry?.qingyu ?? STAGE2.standaloneQingyu),
    shengchong: Math.min(RANKS[STAGE2.startRank].cap, carry?.shengchong ?? STAGE2.standaloneShengchong),
    shenzi: SHENZI.start,
    hate: 0,
    shenziRevealed: false,
    shenziRevealedBy: null,
    relation: null,
    drawPile,
    hand: [],
    discard: [],
    departed: [],
    xibie: null,
    xibieDone: false,
    xibieCulled: false,
    opportunityPool,
    opportunityUsed: [],
    crisisPool,
    crisisUsed: [],
    opportunity: null,
    crisis: null,
    huafei: [],
    stories: [],
    notices: [],
    trial: { active: false, summoned: false },
    jinghong: { meizhuang: false, lingrong: false, done: false },
    pregnant: false,
    pregnancies: 0,
    miscarriages: 0,
    miscarriageCause: null,
    miscarriageCost: null,
    summonLast: null,
    caoTriggered: false,
    caoBefriended: false,
    caoOwed: false,
    fakuiHarsh: false,
    lianmeiSpent: [],
    evidence: [],
    evidenceClues: {},
    shuhenjiaoHarm: 0,
    statuses: [],
    playsUsed: 0,
    extraPlays: 0,
    drawnThisTurn: 0,
    pending: null,
    outcome: "playing",
    lossReason: null,
    victory: null,
    finale: null,
    log: [],
    actions: [],
    turnStartActionCount: 0,
    nextUid,
  };
  log(s, carry ? `承接第一关：清誉 ${s.qingyu}、圣宠 ${s.shengchong}。` : `单独开始第二关：清誉 ${s.qingyu}、圣宠 ${s.shengchong}。`);
  beginTurn2(s, 1);
  return s;
}

export function reduce2(state: Z2State, action: Z2Action): Z2State {
  if (state.outcome !== "playing" && action.type !== "explainTag") return state;
  const s = structuredClone(state);
  switch (action.type) {
    case "playCard": {
      if (!canPlayCard(s, action.cardUid)) return state;
      const card = s.hand.find((c) => c.uid === action.cardUid)!;
      if (card.id === "wenTaiyiZhenzhi" && !isXibieCard(s, card.id) && removableNegatives(s).length > 1) {
        s.pending = { cardUid: card.uid };
        log(s, "温太医相助：请选择要移除的负面状态（可取消）。");
      } else {
        resolvePlay2(s, card.uid);
      }
      break;
    }
    case "removeStatus": {
      if (!s.pending) return state;
      const st = removableNegatives(s).find((x) => x.uid === action.statusUid);
      if (!st) return state;
      const cardUid = s.pending.cardUid;
      s.pending = null;
      resolvePlay2(s, cardUid, st.uid);
      break;
    }
    case "cancelPending": {
      if (!s.pending) return state;
      s.pending = null;
      log(s, "已取消打出温太医相助。");
      break;
    }
    case "chooseStory": {
      if (s.pending) return state;
      const inst = s.stories.find((st) => st.id === action.storyId && st.chosenOptionId == null);
      if (!inst || storyLocked(s, inst)) return state;
      const option = storyBasicOptions2(STORIES2[inst.id]).find((o) => o.id === action.optionId);
      if (!option) return state;
      const delta = applyStoryOption(s, inst, option, `【${STORIES2[inst.id].name}】选择：${option.name}`, null);
      if (alive(s) && delta) changeRelation(s, delta, "陵容");
      checkFanan(s);
      break;
    }
    case "explainTag": {
      const info = TAG2_INFO[action.tag];
      s.log.push({ turn: s.turn, text: `【${info.label}】${info.lore}`, tone: "info" });
      s.log.push({ turn: s.turn, text: `机制：${info.rules}`, tone: "info" });
      return s;
    }
    case "endTurn": {
      if (!canEndTurn2(s)) return state;
      s.actions.push(action);
      endTurn2(s);
      s.turnStartActionCount = s.actions.length;
      return s;
    }
  }
  s.actions.push(action);
  return s;
}

export function replay2(seed: number, carry: Carry | null, actions: readonly Z2Action[]): Z2State {
  let s = newStage2(seed, carry);
  for (const [i, a] of actions.entries()) {
    const next = reduce2(s, a);
    if (next === s) throw new Error(`第二关第 ${i + 1} 步操作无法复现`);
    s = next;
  }
  return s;
}

/** Ending lines for the outcome screen (§12.10). */
export function endingLines(s: Z2State): string[] {
  const lines: string[] = [];
  if (s.turn >= STAGE2.totalTurns && !s.finale) lines.push(FINALE.hopelessStory);
  if (s.finale) {
    const done = s.finale.played.length >= s.finale.needed;
    lines.push(done ? finaleDoneStory(s.evidence.length) : FINALE.failStory);
  }
  for (const id of s.evidence) lines.push(EVIDENCE[id].ending);
  lines.push(s.rank === "pin" ? "你以嫔位立于六宫之中。" : `你如今是${RANKS[s.rank].name}。`);
  if (s.miscarriages > 0) lines.push("那个没能保住的孩子，成了你心里一道过不去的坎。");
  if (s.pregnant) lines.push(s.miscarriages > 0 ? "所幸腹中又有了龙裔，这一回安然无恙，阖宫都在等着这个孩子降生。" : "腹中的龙裔安然无恙，阖宫都在等着这个孩子降生。");
  else if (s.pregnancies === 0) lines.push("这一路走来，腹中始终没有动静。");
  if (s.xibie) lines.push(s.xibie === "meizhuangXiangzhu" ? "存菊堂的宫门依旧紧闭，眉庄姐姐还在等一个昭雪的日子。" : "疫所的书信隔几日便到，温实初总说一切安好。");
  const tier = tierOf(s);
  if (tier === "close") lines.push("陵容依旧常来碎玉轩，姐妹情分一如往昔。");
  else if (tier === "distant") lines.push("陵容来得越来越少了，见面时笑意也淡了。");
  else if (tier === "resentful") lines.push("陵容已经很久没来碎玉轩了，听说她常往景仁宫去。");
  if (s.shuhenjiaoHarm > 0) lines.push("直到很久以后才知道，舒痕胶里早被人掺了麝香。");
  return lines;
}

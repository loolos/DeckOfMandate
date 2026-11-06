import {
  type Act,
  CARDS3,
  CHUNYUAN,
  CONFRONT,
  type CardId3,
  type Delta3,
  EVENTS3,
  FEILAO,
  FIXED_STORIES3,
  LINGRONG_EVENT3,
  type LingrongTier,
  PAIRS,
  RANKS,
  RELICS,
  type RelicId,
  STAGE3,
  STATUSES3,
  STORIES3,
  type StatusId3,
  type StoryDef3,
  type StoryOption3,
  XIUXING,
  type XiayuChoice,
  YIHUA,
  lingrongTier,
} from "../../data/stage3Content";
import { adjacentLingrongCard } from "../engineCommon";
import type { CardInst3, EventInst3, StatusInst3, StoryInst3, Z3State } from "./state";

// ---------------------------------------------------------------- queries

export function actOf(turn: number): Act {
  return turn >= STAGE3.act3Start ? 3 : turn >= STAGE3.act2Start ? 2 : 1;
}

export function rankCap3(s: Z3State): number {
  return s.act === 1 ? RANKS[s.rank].cap : XIUXING.cap;
}

export function rankName3(s: Z3State): string {
  return s.act === 1 ? RANKS[s.rank].name : XIUXING.name;
}

function baseDraw(s: Z3State): number {
  return s.act === 1 ? RANKS[s.turnRank].draw : XIUXING.draw;
}

function basePlays(s: Z3State): number {
  return s.act === 1 ? RANKS[s.turnRank].plays : XIUXING.plays;
}

export function activeStatuses(s: Z3State): StatusInst3[] {
  return s.statuses.filter((st) => STATUSES3[st.id].permanent || st.appliesFromTurn <= s.turn);
}

export function hasStatus3(s: Z3State, id: StatusId3): boolean {
  return s.statuses.some((st) => st.id === id);
}

export function playLimit3(s: Z3State): number {
  let base = basePlays(s);
  let bonus = 0;
  for (const st of activeStatuses(s)) {
    const def = STATUSES3[st.id];
    if (def.playCap != null) base = Math.min(base, def.playCap);
    bonus += def.playBonus ?? 0;
  }
  return base + bonus + s.extraPlays;
}

export function playsLeft3(s: Z3State): number {
  return Math.max(0, playLimit3(s) - s.playsUsed);
}

export function drawModifier3(s: Z3State, turn: number): number {
  return s.statuses.filter((st) => st.appliesFromTurn <= turn).reduce((sum, st) => sum + STATUSES3[st.id].drawModifier, 0);
}

export function drawCount3(s: Z3State, turn: number): number {
  return Math.max(1, baseDraw(s) + drawModifier3(s, turn));
}

/**
 * 本回合已生效且今天就到期的纯抓牌 / 出牌上限状态：抓牌已在回合开头结算，不会再有后续影响，
 * 状态栏不再显示，温太医也不必（无法）移除它。
 */
export function isSpentStatus3(s: Z3State, st: StatusInst3): boolean {
  const def = STATUSES3[st.id];
  if (def.permanent || st.appliesFromTurn > s.turn || st.remaining > 1) return false;
  if (def.turnEnd || def.blocksCards || def.noSummon || def.playCap != null) return false;
  return def.drawModifier !== 0 || (def.playBonus ?? 0) !== 0;
}

export function removableNegatives3(s: Z3State): StatusInst3[] {
  return s.statuses.filter((st) => STATUSES3[st.id].tag === "negative" && !STATUSES3[st.id].unremovable && !isSpentStatus3(s, st));
}

export function blockingStatusName3(s: Z3State, cardId: CardId3): string | null {
  const st = activeStatuses(s).find((x) => STATUSES3[x.id].blocksCards?.includes(cardId));
  return st ? STATUSES3[st.id].name : null;
}

export function summonUnwell3(s: Z3State): string | null {
  const st = s.statuses.find((x) => STATUSES3[x.id].noSummon);
  return st ? STATUSES3[st.id].name : null;
}

export function tierOf3(s: Z3State): LingrongTier | null {
  return s.lingrongGone ? null : lingrongTier(s.relation);
}

/** 遗物 still in hand / 抽牌堆 / 弃牌堆 (not yet burned). */
export function relicsKept(s: Z3State): number {
  return [...s.hand, ...s.drawPile, ...s.discard].filter((c) => isRelic(c.id)).length;
}

export function isRelic(id: CardId3): id is RelicId {
  return (RELICS as readonly CardId3[]).includes(id);
}

export function storyBasicOptions3(def: StoryDef3): StoryOption3[] {
  return def.options.filter((o) => !o.card && !o.hidden);
}

export function storyCardResponses3(def: StoryDef3): StoryOption3[] {
  return def.options.filter((o) => o.card);
}

export function openStories3(s: Z3State): StoryInst3[] {
  return s.stories.filter((st) => st.chosenOptionId == null);
}

export function storyResponsesFor3(s: Z3State, cardId: CardId3): { story: StoryInst3; option: StoryOption3 }[] {
  const out: { story: StoryInst3; option: StoryOption3 }[] = [];
  for (const st of openStories3(s)) {
    if (st.id === "zhaoxing" && summonUnwell3(s)) continue;
    const option = STORIES3[st.id].options.find((o) => o.card === cardId);
    if (option) out.push({ story: st, option });
  }
  return out;
}

export function boardEvents3(s: Z3State): EventInst3[] {
  return [s.crisis, s.opportunity, s.huanghou].filter((e): e is EventInst3 => e != null);
}

/** 连环: the opportunity half stays locked while its crisis half is on the board unresolved. */
export function pairLocked(s: Z3State, ev: EventInst3): boolean {
  const pair = EVENTS3[ev.id].pair;
  if (!pair || EVENTS3[ev.id].kind !== "opportunity") return false;
  const crisis = s.crisis;
  return crisis != null && crisis.id === PAIRS[pair].crisis && !crisis.resolved;
}

/** 解牌 a 对头 crisis needs: two, one fewer after an earlier 打压. */
export function solveCount(ev: EventInst3): number {
  return ev.eased ? 1 : 2;
}

/**
 * 栗糕清苦 (hidden): once 齐妃 has been put down (打压) at least once, with a child on the way, 陵容 can take on 三阿哥邀宠
 * whatever her 情分; once she does, the 栗糕 event follows.
 */
export function lizigaoOpen(s: Z3State, ev: EventInst3): boolean {
  return ev.id === "sanAgeYaochong" && !ev.resolved && !s.lizigao && s.act === 1 && s.pregnant && s.turn < WANWAN_TURN && s.suppressed.qifei;
}

/** 菀菀类卿那一回合孩子就要落地：栗糕清苦只在这之前。 */
const WANWAN_TURN = Number(Object.keys(FIXED_STORIES3).find((t) => FIXED_STORIES3[Number(t)] === "wanwanLeiqing"));

/**
 * 陵容相助能不能接这件事：有陵容事件表，且是她的匹配事件；三阿哥邀宠只在栗糕清苦的条件下才接得了。
 * 引擎判定、事件卡上的匹配牌和陵容提示都只看这一处。
 */
export function lingrongAnswers3(s: Z3State, ev: EventInst3): boolean {
  if (!LINGRONG_EVENT3[ev.id]) return false;
  return ev.id === "sanAgeYaochong" ? lizigaoOpen(s, ev) : CARDS3.lingrongXiangzhu.matches.includes(ev.id);
}

/** Does `cardId` count toward this unresolved event right now (single match or 双牌 progress)? */
export function cardAffectsEvent3(s: Z3State, ev: EventInst3, cardId: CardId3): boolean {
  if (ev.resolved) return false;
  const def = EVENTS3[ev.id];
  if (cardId === "guojunwangXiangzhu" && s.turn >= STAGE3.zhoufuTurn) return false;
  if (cardId === "lingrongXiangzhu") return lingrongAnswers3(s, ev) && !pairLocked(s, ev);
  if (def.double) return def.double.includes(cardId) && !(ev.progress ?? []).includes(cardId);
  if (!CARDS3[cardId].matches.includes(ev.id)) return false;
  // 连环 opportunity stays locked until its crisis is cleared (the shared card among the crisis's two cards takes it afterwards)
  return !pairLocked(s, ev);
}

export function matchedEvents3(s: Z3State, cardId: CardId3): EventInst3[] {
  return boardEvents3(s).filter((e) => cardAffectsEvent3(s, e, cardId));
}

function lianmeiAvailable(s: Z3State): boolean {
  return tierOf3(s) === "close" && s.lianmeiSpent.length === 0;
}

export function lianmeiSourceFor(s: Z3State, index: number): CardInst3 | null {
  return lianmeiAvailable(s) && s.turn !== STAGE3.confrontTurn ? adjacentLingrongCard(s.hand, index) : null;
}

export function lianmeiLit3(s: Z3State, card: CardInst3): boolean {
  return card.id === "lingrongXiangzhu" && lianmeiAvailable(s) && s.turn !== STAGE3.confrontTurn;
}

export function isFreeByLianmei3(s: Z3State, cardUid: string): boolean {
  const i = s.hand.findIndex((c) => c.uid === cardUid);
  return i >= 0 && lianmeiSourceFor(s, i) != null;
}

export function blockedByChezhou3(s: Z3State, cardUid: string): boolean {
  if (tierOf3(s) !== "resentful" || s.turn === STAGE3.confrontTurn) return false;
  const i = s.hand.findIndex((c) => c.uid === cardUid);
  if (i < 0 || s.hand[i]!.id === "lingrongXiangzhu") return false;
  return [s.hand[i - 1], s.hand[i + 1]].some((c) => c?.id === "lingrongXiangzhu");
}

/** 第 10 回合陵容称病没来：她的牌打不出。 */
export function lingrongAbsent(s: Z3State, cardId: CardId3): boolean {
  return cardId === "lingrongXiangzhu" && s.turn === STAGE3.confrontTurn;
}

export function canPlayCard3(s: Z3State, cardUid: string): boolean {
  if (s.outcome !== "playing" || s.pending) return false;
  const card = s.hand.find((c) => c.uid === cardUid);
  if (!card) return false;
  if (lingrongAbsent(s, card.id)) return false;
  if (blockedByChezhou3(s, cardUid)) return false;
  if (blockingStatusName3(s, card.id)) return false;
  return playsLeft3(s) > 0 || isFreeByLianmei3(s, cardUid);
}

export function canEndTurn3(s: Z3State): boolean {
  return s.outcome === "playing" && s.pending == null;
}

export function confrontAccepts(s: Z3State, cardId: CardId3): boolean {
  return s.confront != null && CONFRONT.cards.includes(cardId);
}

export function feilaoAccepts(s: Z3State, cardId: CardId3): boolean {
  return s.feilao != null && FEILAO.cards.includes(cardId);
}

export function feilaoBaseTier(arrogance: number): 0 | 1 | 2 {
  return arrogance >= 3 ? 2 : arrogance >= 1 ? 1 : 0;
}

export function feilaoCurrentTier(s: Z3State): 0 | 1 | 2 {
  if (!s.feilao) return 0;
  return Math.max(0, s.feilao.base - s.feilao.played.length) as 0 | 1 | 2;
}

export function chunyuanChecked(s: Z3State): boolean {
  return s.chunyuan?.second != null;
}

/** The 纯元故衣 step this card would take now (① 起疑, then ② 查实). */
export function chunyuanAccepts(s: Z3State, cardId: CardId3): 1 | 2 | null {
  const c = s.chunyuan;
  if (!c || c.second) return null;
  if (!c.first) return CHUNYUAN.firstCards.includes(cardId) ? 1 : null;
  return CHUNYUAN.checkCards.includes(cardId) ? 2 : null;
}

/** The 移花接木 step this card would advance now. */
export function yihuaAccepts(s: Z3State, cardId: CardId3): boolean {
  const y = s.yihua;
  if (!y || s.outcome !== "playing") return false;
  if (y.step === 1) {
    if (cardId === "jinxiXiangzhu") return true;
    // 落发: the extra card may be 眉庄 instead of a second 槿汐
    return cardId === YIHUA.luofaExtra && y.yinjiaNeed > 1 && !y.yinjia.includes(cardId);
  }
  if (y.step === 2) return false; // 偶遇 is its own 剧情事件【圣驾偶遇】
  if (y.step === 3) return cardId === "wenTaiyiZhenzhi";
  if (y.step === 4) return y.dengmen != null && YIHUA.dengmenCards.includes(cardId);
  return false;
}

/** 甄远道下狱: how heavy it lands (0 light … 2 heavy). */
/** 登门 needs: 疑点 + unburned 遗物 → 0 / 1 / 2 / 3 cards, +1 when you did not leave 体面自请. */
export function dengmenNeeded(s: Z3State, doubt: number, relics: number): number {
  const score = doubt + relics;
  if (score <= 0) return 0;
  return (score <= 2 ? 1 : score <= 4 ? 2 : 3) + (s.exitTier === 1 ? 0 : 1);
}

/** 甄远道下狱的局势 s：起始 4，【父兄蒙尘】+1，打压过祺贵人 -1，每打出一张解牌 -1；0 即完美解决。 */
export function xiayuS(s: Z3State, solved: number): number {
  return Math.max(0, 4 + (hasStatus3(s, "fuxiongMengchen") ? 1 : 0) - (s.suppressed.guaerjia ? 1 : 0) - solved);
}

/** 未解决时扣圣宠与清誉各 2s；求太后少扣 2 圣宠，跪求皇上少扣 2 清誉。 */
export function xiayuCost(s: Z3State, choice: XiayuChoice, solved = 0): Delta3[] {
  const n = 2 * xiayuS(s, solved);
  const sc = choice === "taihou" ? Math.max(0, n - 2) : n;
  const qy = choice === "kneel" ? Math.max(0, n - 2) : n;
  const cost: Delta3[] = [];
  if (sc > 0) cost.push({ resource: "shengchong", amount: -sc });
  if (qy > 0) cost.push({ resource: "qingyu", amount: -qy });
  return cost;
}

/** 第一幕对质前打出这么多次【收拢人心】，记下【收买人心】把柄。 */
export const RENXIN_SECRET_PLAYS = 4;

/** 把柄 held (hidden): 第二关带入 + 第一幕记下。 */
export function secretsHeld(s: Z3State): number {
  return Object.values(s.secrets).reduce((a, b) => a + (b ?? 0), 0);
}

/** 皇后呈上的把柄: adjusted by 情分 and 端妃相护. */
export function presentedSecrets(s: Z3State): number {
  const tier = lingrongTier(s.relation);
  const adj = tier === "close" ? -2 : tier === "resentful" ? 1 : 0;
  return Math.max(0, secretsHeld(s) + adj - (hasStatus3(s, "duanfeiXianghu") ? 1 : 0) - (s.lizigao ? 1 : 0));
}

export const ZHOUFU_TURN = STAGE3.zhoufuTurn;

/** 踏雪问疾（本回合打牌化解，不走默认）与月下琴笛都已完成，合婚庚帖写下时才有长相思守。 */
export function qinseReady(s: Z3State): boolean {
  return s.changxiangsiDone === true && s.taxueByCard === true;
}

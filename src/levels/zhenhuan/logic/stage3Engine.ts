/**
 * 甄嬛传 · 第三关「青灯凤阙」 rules engine. Pure and deterministic like the 第一 / 第二关 engines: the same
 * seed, carry-over and action list always yield the same state. Rules: `../docs/design-stage3.md`.
 *
 * Three acts in one run: 第一幕 in the palace (turns 1–10, ending with 景仁宫对质), 第二幕 at 甘露寺 / 凌云峰
 * (11–25, 修行 identity and the temple deck), 第三幕 移花接木 (26–33).
 */
import { createRngFromSeed, rngNext, shuffle } from "../../../logic/rng";
import type { RngSerialized } from "../../../types/game";
import {
  ACT1_CRISES,
  ACT1_OPPORTUNITIES,
  ALLIES,
  CARDS3,
  CHANGXIANGSI,
  CHUNYUAN,
  CONFRONT,
  DOUBT,
  EVENT_KIND3_LABEL,
  EVENTS3,
  GONGZHONG_LAIXIN_JINGFEI_STORY,
  ENDING,
  EXIT,
  FABRICATED_HINT,
  unresolvedText3,
  FABRICATED_SECRET,
  FEILAO,
  FIXED_STORIES3,
  HUANGHOU_EVENTS,
  LINGRONG_COLD_TEXT,
  LINGRONG_EVENT3,
  LINGRONG_FAREWELL,
  LINGRONG_IDLE_TEXT3,
  LINGRONG_SUMMON,
  LINGRONG_TRUTH,
  POPUP_TEXT,
  PAIRS,
  PEAK_ADD_CRISES,
  PEAK_ADD_OPPORTUNITIES,
  RANKS,
  RELIC_TEXT,
  RELICS,
  RESOURCE3_LABEL,
  RIVALS,
  SECRETS,
  DUANFEI_DEFAULT,
  DUANFEI_DEFENSE,
  SHENZI,
  STAGE2_SECRETS,
  STAGE3,
  STAGE3_ACT1_DECK,
  STAGE3_TEMPLE_DECK,
  STATUSES3,
  SUPPRESS_STATUS,
  statusText3,
  STORIES3,
  SUMMON_THRESHOLD3,
  TAG3_INFO,
  RELIC_DOUBT_RULE,
  TEMPLE_CRISES,
  TEMPLE_OPPORTUNITIES,
  XIUXING,
  YIHUA,
  ZHOUFU,
  confrontNeeded,
  dengmenOpenText,
  confrontOutcome,
  lingrongTier,
  summonInterval,
  type Act,
  type AllyId,
  type CardId3,
  type CrisisId3,
  type Delta3,
  type EventId3,
  type ExitTier,
  type HuanghouId,
  type LingrongTier,
  type Loss3Kind,
  type OpportunityId3,
  type PopupId,
  type RankId,
  type RelicId,
  type RivalId,
  type SecretId,
  type Stage2SecretId,
  type StatusId3,
  type StoryDef3,
  type StoryId3,
  type StoryOption3,
  type TagId3,
  type XiayuChoice,
} from "../data/stage3Content";

export type CardInst3 = { readonly uid: string; readonly id: CardId3 };

export type EventInst3 = {
  readonly uid: string;
  readonly id: EventId3;
  resolved: boolean;
  resolvedBy?: CardId3;
  rewardDoubled?: boolean;
  /** 双牌 progress (请脉报喜). */
  progress?: CardId3[];
  lingrong?: LingrongTier;
  lingrongFailed?: boolean;
  aggravated?: boolean;
  /** Unresolved, but 欣贵人解围 took the penalty. */
  byXin?: boolean;
  /** An earlier 打压 status eased it: one fewer 解牌 needed. */
  eased?: boolean;
  /** Resolved with the 打压 card (or the 连环 shared card). */
  suppressed?: boolean;
  story?: string;
};

export type StoryInst3 = { readonly id: StoryId3; chosenOptionId: string | null; viaCard?: CardId3; pendingOptionId?: string; result?: string; story?: string; /** 甄远道下狱: 已打出的解牌数与逐张剧情。 */ solved?: number; steps?: string[] };
export type StatusInst3 = { readonly uid: string; readonly id: StatusId3; readonly appliesFromTurn: number; remaining: number };
export type LogTone = "info" | "good" | "bad";
export type LogEntry = { readonly turn: number; readonly text: string; readonly tone: LogTone };
export type Notice3 = { readonly emoji: string; readonly name: string; readonly text: string };

/** What 第二关 hands over (design-stage3.md §2.1–2.4). */
export type Carry3 = {
  readonly qingyu: number;
  readonly shengchong: number;
  readonly shenzi: number;
  readonly rank: "guiren" | "pin";
  readonly pregnant: boolean;
  readonly relation: number;
  /** 第二关里陵容经手过的私事（把柄）。 */
  readonly secrets: readonly Stage2SecretId[];
  /** Who left at 菊残霜冷 and is back now (for the opening text). */
  readonly returned: "meizhuangXiangzhu" | "wenTaiyiZhenzhi" | null;
};

export type Z3Action =
  | { readonly type: "playCard"; readonly cardUid: string }
  | { readonly type: "chooseStory"; readonly storyId: StoryId3; readonly optionId: string }
  | { readonly type: "removeStatus"; readonly statusUid: string }
  | { readonly type: "cancelPending" }
  | { readonly type: "endTurn" }
  /** UI-only: not recorded. */
  | { readonly type: "explainTag"; readonly tag: TagId3 };

export type Z3Outcome = "playing" | "won" | "lost";

export type Yihua = {
  /** The step now lit: 1 引驾, 2 偶遇, 3 改脉, 4 登门; 5 = all done. */
  step: 1 | 2 | 3 | 4 | 5;
  /** 引驾 cards played so far / needed (落发 needs 2). */
  yinjia: CardId3[];
  yinjiaNeed: number;
  /** 引驾 went through 槿汐 (对食 accepted). */
  duishi: boolean;
  doubt: number;
  /** The turn the last step was done. */
  doneTurn: number | null;
  /** ② 偶遇 can be done on this turn only (引驾 + 2; missed → 2 turns later). */
  ouyuDue: number | null;
  /** The turn ② 偶遇 was done (its end always checks 遗物 in hand). */
  ouyuTurn: number | null;
  /** The turn ① 引驾 was done: from the next turn on until 回宫, 遗物 in hand at each turn's end raise 疑点. */
  yinjiaTurn: number | null;
  /** The card that made the 偶遇 succeed (picks the 偶遇 popup text). */
  ouyuCard?: CardId3;
  dushu: boolean;
  /** 登门 opens the turn after 改脉: solve cards needed (fixed then) and played so far. */
  dengmen: { doubt: number; relics: number; needed: number; played: CardId3[]; openTurn: number } | null;
};

export type Z3State = {
  stage: 3;
  seed: number;
  carry: Carry3 | null;
  rng: RngSerialized;
  turn: number;
  act: Act;
  rank: RankId;
  turnRank: RankId;
  qingyu: number;
  shengchong: number;
  shenzi: number;
  /** 陵容 (hidden number, tier shown); `lingrongGone` once she leaves at 对质. */
  relation: number;
  lingrongGone: boolean;
  drawPile: CardInst3[];
  hand: CardInst3[];
  discard: CardInst3[];
  departed: CardInst3[];
  opportunityPool: OpportunityId3[];
  opportunityUsed: OpportunityId3[];
  crisisPool: CrisisId3[];
  crisisUsed: CrisisId3[];
  huanghouPool: HuanghouId[];
  huanghouUsed: HuanghouId[];
  opportunity: EventInst3 | null;
  crisis: EventInst3 | null;
  huanghou: EventInst3 | null;
  stories: StoryInst3[];
  notices: Notice3[];
  /** Story popups raised since the last end of turn (UI shows each once). */
  popups: PopupId[];
  pregnant: boolean;
  childBorn: boolean;
  summonLast: number | null;
  /** 把柄 — hidden from the player until 景仁宫对质. */
  secrets: Partial<Record<SecretId, number>>;
  allies: Record<AllyId, boolean>;
  suppressed: Record<RivalId, boolean>;
  /** 栗糕清苦（隐藏事件）已经发生。 */
  lizigao: boolean;
  guoMeet: "li" | "di" | "lingrong" | null;
  /** 纯元故衣 (turn 6): ① 起疑 card, then ② 查实 card. */
  chunyuan: { first: CardId3 | null; second: CardId3 | null } | null;
  chunyuanResult: "seen" | "half" | "fail" | null;
  /** 纯元故衣 is behind us: your words to 陵容 turn cold. */
  chunyuanPassed: boolean;
  confront: { presented: number; needed: number; played: CardId3[]; stories: string[]; rebutted: string[] } | null;
  exitTier: ExitTier | null;
  /** 圣宠 / 位分 the day you left: restored at 偶遇 / used by the ending. */
  exitShengchong: number | null;
  exitRank: RankId | null;
  exitTierLingrong: LingrongTier | null;
  /** 💢 静白嚣张 (hidden). */
  arrogance: number;
  feilao: { base: 0 | 1 | 2; played: CardId3[] } | null;
  feilaoTier: 0 | 1 | 2 | null;
  atPeak: boolean;
  luofa: boolean;
  gengtie: boolean;
  songxing: boolean;
  /** 与果郡王有过的往来，舟覆后变成遗物。 */
  keepsakes: RelicId[];
  /** 温太医探视: the temporary card's uid, and whether 槿汐相助 was used. */
  changxiangsi: { played: CardId3[]; done: boolean } | null;
  /** 月下琴笛 was completed (the event card itself is gone by turn 23). */
  changxiangsiDone?: boolean;
  /** 踏雪问疾 was resolved by playing a card (the story is gone from the board by turn 23). */
  taxueByCard?: boolean;
  /** 菀菀类卿当回合所选的应对（弹窗按此分剧情）。 */
  wanwanOption?: string;
  yihua: Yihua | null;
  relicsBurned: number;
  statuses: StatusInst3[];
  playsUsed: number;
  extraPlays: number;
  drawnThisTurn: number;
  lianmeiSpent: string[];
  playedThisTurn: CardId3[];
  pending: { kind: "wentaiyi"; cardUid: string } | null;
  outcome: Z3Outcome;
  lossReason: string | null;
  lossKind: Loss3Kind | null;
  victory: "return" | "perfect" | "narrow" | null;
  log: LogEntry[];
  actions: Z3Action[];
  turnStartActionCount: number;
  nextUid: number;
};

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

function activeStatuses(s: Z3State): StatusInst3[] {
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

export function removableNegatives3(s: Z3State): StatusInst3[] {
  return s.statuses.filter((st) => STATUSES3[st.id].tag === "negative" && !STATUSES3[st.id].unremovable);
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

/** Does `cardId` count toward this unresolved event right now (single match or 双牌 progress)? */
export function cardAffectsEvent3(s: Z3State, ev: EventInst3, cardId: CardId3): boolean {
  if (ev.resolved) return false;
  const def = EVENTS3[ev.id];
  if (cardId === "lingrongXiangzhu" && lizigaoOpen(s, ev)) return true;
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

function lianmeiSourceFor(s: Z3State, index: number): CardInst3 | null {
  if (!lianmeiAvailable(s) || s.turn === STAGE3.confrontTurn) return null;
  for (const j of [index - 1, index + 1]) {
    const c = s.hand[j];
    if (c && c.id === "lingrongXiangzhu") return c;
  }
  return null;
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
  return arrogance >= 4 ? 2 : arrogance >= 2 ? 1 : 0;
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

/** 甄远道下狱的局势 s：起始 3，【父兄蒙尘】+1，打压过祺贵人 -1，每打出一张解牌 -1；0 即完美解决。 */
export function xiayuS(s: Z3State, solved: number): number {
  return Math.max(0, 3 + (hasStatus3(s, "fuxiongMengchen") ? 1 : 0) - (s.suppressed.guaerjia ? 1 : 0) - solved);
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

// ---------------------------------------------------------------- mutation helpers

function log(s: Z3State, text: string, tone: LogTone = "info"): void {
  s.log.push({ turn: s.turn, text, tone });
}

function alive(s: Z3State): boolean {
  return s.outcome === "playing";
}

function lose(s: Z3State, reason: string, kind: Loss3Kind): void {
  if (!alive(s)) return;
  s.outcome = "lost";
  s.lossReason = reason;
  s.lossKind = kind;
  log(s, `失败：${reason}`, "bad");
}

function roll(s: Z3State): number {
  const [rng, x] = rngNext(s.rng);
  s.rng = rng;
  return x;
}

function shuffleInto<T>(s: Z3State, items: readonly T[]): T[] {
  const [rng, out] = shuffle(s.rng, items);
  s.rng = rng;
  return out;
}

function popup(s: Z3State, id: PopupId): void {
  if (!s.popups.includes(id)) s.popups.push(id);
}

function applyDelta3(s: Z3State, d: Delta3, source: string): void {
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

function applyDeltas3(s: Z3State, deltas: readonly Delta3[], source: string): void {
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

function addStatus3(s: Z3State, id: StatusId3, turns?: number): void {
  const def = STATUSES3[id];
  s.statuses.push({ uid: `s${s.nextUid++}`, id, appliesFromTurn: s.turn + 1, remaining: turns ?? def.duration });
  log(s, `获得状态【${def.name}】（${statusText3(def, s.turn).effectText}）`, def.tag === "negative" ? "bad" : "good");
}

function removeStatusById(s: Z3State, id: StatusId3): boolean {
  const i = s.statuses.findIndex((st) => st.id === id);
  if (i < 0) return false;
  s.statuses.splice(i, 1);
  return true;
}

function removeStatus3(s: Z3State, uid: string, source: string): void {
  const st = s.statuses.find((x) => x.uid === uid);
  if (!st) return;
  s.statuses = s.statuses.filter((x) => x.uid !== uid);
  log(s, `${source}：移除状态【${STATUSES3[st.id].name}】`, "good");
}

function removeNegatives(s: Z3State, n: "all" | 1, source: string): void {
  const negs = removableNegatives3(s);
  for (const st of n === "all" ? negs : negs.slice(0, 1)) removeStatus3(s, st.uid, source);
}

function changeRelation(s: Z3State, delta: number): void {
  if (s.lingrongGone || delta === 0) return;
  const before = s.relation;
  const next = Math.max(-4, Math.min(4, before + delta));
  if (next === before) return;
  s.relation = next;
  const label = { close: "亲厚", distant: "生分", resentful: "怨怼" } as const;
  const tierChange = lingrongTier(before) !== lingrongTier(next) ? `，情分 ${label[lingrongTier(before)]} → ${label[lingrongTier(next)]}` : "";
  log(s, `${delta > 0 ? "陵容待你亲近了些" : "陵容与你生分了些"}${tierChange}`, delta > 0 ? "good" : "bad");
}

/**
 * 把柄 (hidden, never logged): each kind once; what 陵容 herself handled counts 2 when she is 怨怼
 * (she adds to it). A kind already carried over from 第二关 is not counted again.
 */
function addSecret(s: Z3State, id: SecretId, tier: LingrongTier | null): void {
  if (s.secrets[id] != null) return;
  s.secrets[id] = tier === "resentful" ? 2 : 1;
}

function newEvent(s: Z3State, id: EventId3): EventInst3 {
  return { uid: `e${s.nextUid++}`, id, resolved: false };
}

function drawCards3(s: Z3State, n: number): void {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discard.length === 0) {
        log(s, "抽牌堆与弃牌堆都已空，无法继续抽牌。");
        return;
      }
      s.drawPile = shuffleInto(s, s.discard);
      s.discard = [];
      log(s, `弃牌堆洗回抽牌堆（${s.drawPile.length} 张）。`);
    }
    s.hand.push(s.drawPile.shift()!);
    s.drawnThisTurn++;
  }
}

/** A new card goes into the draw pile at a random place. */
function addCardToDeck(s: Z3State, id: CardId3): void {
  const card: CardInst3 = { uid: `c${s.nextUid++}`, id };
  s.drawPile = shuffleInto(s, [...s.drawPile, card]);
}

function drawFromPool<T extends EventId3>(s: Z3State, poolKey: "opportunityPool" | "crisisPool" | "huanghouPool", usedKey: "opportunityUsed" | "crisisUsed" | "huanghouUsed", ok: (id: T) => boolean = () => true): T | null {
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

function removeFromPools(s: Z3State, ids: readonly EventId3[]): void {
  const keep = (id: EventId3) => !ids.includes(id);
  s.opportunityPool = s.opportunityPool.filter(keep);
  s.opportunityUsed = s.opportunityUsed.filter(keep);
  s.crisisPool = s.crisisPool.filter(keep);
  s.crisisUsed = s.crisisUsed.filter(keep);
}

// ---------------------------------------------------------------- pregnancy / summon

const PIN_EVENT = "qingmaiBaoxi" as const;

function becomePregnant(s: Z3State, source: string): void {
  if (s.pregnant || s.childBorn || !alive(s)) return;
  s.pregnant = true;
  s.statuses.push({ uid: `s${s.nextUid++}`, id: "shenhuaiLongyi", appliesFromTurn: s.turn, remaining: 0 });
  log(s, `💗 ${source}：你有了身孕，获得【身怀龙裔】！`, "good");
  if (s.rank === "guiren") addPinEvent(s);
}

function addPinEvent(s: Z3State): void {
  s.opportunityPool = shuffleInto(s, [...s.opportunityPool.filter((id) => id !== PIN_EVENT), PIN_EVENT]);
  log(s, "【请脉报喜】洗入机会牌池：诊脉报喜妥当后才能晋为嫔。", "good");
}

function promoteToPin(s: Z3State): void {
  if (s.rank !== "guiren" || !s.pregnant) return;
  s.rank = "pin";
  const r = RANKS.pin;
  log(s, `有孕晋封为【${r.name}】：清誉 / 圣宠上限 ${r.cap}；下回合起每回合抓 ${r.draw} 打 ${r.plays}。`, "good");
  log(s, "陵容送来一双亲手绣的虎头鞋：「姐姐如今是嫔了，妹妹……替姐姐高兴。」");
  changeRelation(s, -2);
}

function summonSuccess(s: Z3State): void {
  log(s, "召幸：侍寝成功。", "good");
  applyDelta3(s, { resource: "shengchong", amount: 1 }, "侍寝");
  if (!alive(s) || s.pregnant || s.childBorn) return;
  const chance = Math.min(1, s.shenzi / SHENZI.divisor);
  if (chance >= 1 || roll(s) < chance) becomePregnant(s, "侍寝后");
  else log(s, `喜脉判定（身子 ${s.shenzi} ÷ ${SHENZI.divisor}）：未有喜。`);
}

function checkSummon(s: Z3State): void {
  if (s.act !== 1 || s.pregnant || s.turn === STAGE3.confrontTurn || FIXED_STORIES3[s.turn] === "haitangChunshui" || FIXED_STORIES3[s.turn] === "wanwanLeiqing") return;
  if (s.shengchong < SUMMON_THRESHOLD3) {
    s.summonLast = null;
    return;
  }
  if (s.summonLast != null && s.turn - s.summonLast < summonInterval(s.shengchong - SUMMON_THRESHOLD3)) return;
  s.summonLast = s.turn;
  openStory(s, "zhaoxing");
}

function openStory(s: Z3State, id: StoryId3): void {
  s.stories.push({ id, chosenOptionId: null });
  log(s, `剧情事件：【${STORIES3[id].name}】`);
}

// ---------------------------------------------------------------- 盟友 / 对头

function befriend(s: Z3State, ally: AllyId): void {
  if (s.allies[ally]) return;
  s.allies[ally] = true;
  log(s, `🤝 结交盟友：${ALLIES[ally].name}。`, "good");
  addStatus3(s, ALLIES[ally].status);
}

/** 打压: a status that eases this rival's next crisis by one 解牌. */
function suppress(s: Z3State, rival: RivalId): void {
  const first = !s.suppressed[rival];
  s.suppressed[rival] = true;
  log(s, `⚔️ 打压${RIVALS[rival].name}${first && rival === "guaerjia" ? "：第 8 回合父亲下狱的代价减轻一档" : ""}。`, "good");
  const status = SUPPRESS_STATUS[rival];
  if (rival === "qifei" && hasStatus3(s, "dayaQifeiLizi")) return;
  if (!s.statuses.some((st) => st.id === status)) addStatus3(s, status);
}

/** 栗糕清苦: 齐妃's 把柄 lands in 皇后's hands — 打压·齐妃 stays for the rest of 第一幕, 三阿哥邀宠 is gone. */
function lizigao(s: Z3State): void {
  s.lizigao = true;
  removeStatusById(s, "dayaQifei");
  addStatus3(s, "dayaQifeiLizi");
  removeFromPools(s, ["sanAgeYaochong"]);
  log(s, "🥮 栗糕清苦：齐妃送来的栗子糕里掺了夹竹桃，幸而陵容闻了出来。皇后得了三阿哥，齐妃从此只能听命于景仁宫。", "good");
  popup(s, "lizigao");
}

// ---------------------------------------------------------------- resolution

function verb(kind: string): string {
  return kind === "opportunity" ? "把握" : kind === "huanghou" ? "领受" : "化解";
}

function resolveEventByCard(s: Z3State, ev: EventInst3, card: CardId3, doubleReward: boolean): void {
  const def = EVENTS3[ev.id];
  ev.resolved = true;
  ev.resolvedBy = card;
  log(s, `${verb(def.kind)}${EVENT_KIND3_LABEL[def.kind]}事件【${def.name}】`, "good");
  const story =
    (ev.id === "gongzhongLaixin" && hasStatus3(s, "jingfeiZhiyi") ? GONGZHONG_LAIXIN_JINGFEI_STORY[card] : undefined) ??
    (s.lizigao ? POPUP_TEXT.lizigaoStory[ev.id]?.[card] : undefined) ??
    def.resolvedStory[card];
  if (story) {
    ev.story = story;
    log(s, story);
  }
  if (def.kind === "opportunity") {
    const reward = def.cardReward?.[card] ?? def.reward;
    applyDeltas3(s, reward, def.name);
    if (doubleReward && reward.length > 0 && alive(s)) {
      ev.rewardDoubled = true;
      applyDeltas3(s, reward, "眉庄相助联动：奖励翻倍");
    }
    opportunityExtras(s, ev, card);
  }
  if (def.kind === "huanghou") {
    for (const c of new Set(ev.progress ?? [card])) applyDeltas3(s, def.cardReward?.[c] ?? [], def.name);
  }
  if (def.kind === "crisis") {
    if (def.resolveCost && alive(s)) applyDeltas3(s, def.resolveCost, `${def.name}（化解了，仍有些折损）`);
    if (def.rival && def.suppressCard && (ev.progress ?? [card]).includes(def.suppressCard) && !def.pair) {
      ev.suppressed = true;
      suppress(s, def.rival);
    }
    if (card === "jingchaiBuqun" && alive(s)) {
      log(s, "荆钗布裙联动：静白一时挑不出错。", "good");
      addStatus3(s, "yishiWucuo");
    }
  }
  if (card === "shoulongRenxin" && ev.id === "neiwufuDiaonan" && alive(s)) {
    log(s, "收拢人心联动：额外抽 1 张牌。", "good");
    drawCards3(s, 1);
  }
}

const JINGFEI_LETTER_NOTE =
  "山下捎来的信里，另夹着敬妃的小笺：她让人送了米面、炭火和补药，又说胧月在她身边养得很好，前几日会叫「额娘」了。你把小笺看了又看，悬了许久的心总算落下一半。";

/** 敬妃之谊: the 宫中来信 bonus lands whether or not the letter itself was taken up. */
function jingfeiLetter(s: Z3State, ev: EventInst3): void {
  if (!hasStatus3(s, "jingfeiZhiyi")) return;
  if (!ev.resolved || !ev.story) log(s, JINGFEI_LETTER_NOTE);
  applyDelta3(s, { resource: "shenzi", amount: 1 }, "敬妃之谊：胧月的消息");
}

function opportunityExtras(s: Z3State, ev: EventInst3, card: CardId3 | "lingrong"): void {
  if (!alive(s)) return;
  const def = EVENTS3[ev.id];
  if (def.ally) befriend(s, def.ally);
  switch (ev.id) {
    case PIN_EVENT:
      promoteToPin(s);
      break;
    case "gongzhongLaixin":
      jingfeiLetter(s, ev);
      break;
    case "foqianGongdeng":
      addStatus3(s, "zhushiTuotie");
      break;
    case "jinganChuilian":
      if (!hasStatus3(s, "shitaiBihu")) addStatus3(s, "shitaiBihu");
      break;
    case "shanzhongCaiyao":
      removeNegatives(s, 1, def.name);
      break;
    case "chanfangChaojing":
      addStatus3(s, "xinruZhishui");
      break;
    case "moyanYuanshou":
      s.extraPlays++;
      log(s, `默然分劳：本回合出牌 +1（现为 ${playLimit3(s)}）。`, "good");
      break;
    case "yuexiaDuitan":
      if (card === "guojunwangXiangzhu") drawCards3(s, 1);
      break;
  }
}

/** 陵容 on an event; returns the relation change to apply afterwards. */
function resolveEventByLingrong(s: Z3State, ev: EventInst3, tier: LingrongTier): number {
  const def = EVENTS3[ev.id];
  const o = LINGRONG_EVENT3[ev.id]?.[tier];
  if (!o) return 0;
  ev.lingrong = tier;
  log(s, `陵容：${o.story}`, tier === "resentful" ? "bad" : "info");
  if (!o.resolves) {
    ev.lingrongFailed = true;
    log(s, `【${def.name}】失效：陵容没有帮上忙。`, "bad");
    if (o.aggravate) ev.aggravated = true;
    if (o.effects) applyDeltas3(s, o.effects as readonly Delta3[], "陵容");
    return o.relation ?? 0;
  }
  ev.resolved = true;
  ev.resolvedBy = "lingrongXiangzhu";
  log(s, `${verb(def.kind)}${EVENT_KIND3_LABEL[def.kind]}事件【${def.name}】`, "good");
  if (o.effects) applyDeltas3(s, o.effects as readonly Delta3[], `${def.name}（陵容）`);
  if (o.extraDraw && alive(s)) drawCards3(s, o.extraDraw);
  if (o.shuhenjiao) shuhenjiao(s, tier);
  if (def.lingrongSecret) addSecret(s, def.lingrongSecret, tier);
  if (def.kind === "opportunity") opportunityExtras(s, ev, "lingrong");
  if (ev.id === "sanAgeYaochong") lizigao(s);
  return o.relation ?? 0;
}

/** 第一幕的舒痕胶不伤胎：有害时改为【抱恙在身】。 */
function shuhenjiao(s: Z3State, tier: LingrongTier): void {
  if (!alive(s)) return;
  log(s, "🧴 陵容送来了舒痕胶。");
  if (tier === "close") {
    applyDelta3(s, { resource: "shengchong", amount: 1 }, "舒痕胶（疤痕尽消）");
    return;
  }
  const harm = tier === "distant" ? 0.3 : 0.6;
  const heal = tier === "distant" ? 0.3 : 0;
  const r = roll(s);
  if (r < harm) {
    log(s, "药膏香气浓得有些异样，你只当是好药。", "bad");
    addStatus3(s, "baoyangZaishen");
  } else if (r < harm + heal) applyDelta3(s, { resource: "shengchong", amount: 1 }, "舒痕胶（疤痕尽消）");
  else log(s, "药膏清凉，伤处好得很快。");
}

/** 甄远道下狱：每打出一张解牌局势 s -1，并给出这张牌的剧情；s 归零即完美解决。 */
function xiayuStep(s: Z3State, inst: StoryInst3, option: StoryOption3, tier: LingrongTier | null, name: string): number {
  inst.solved = (inst.solved ?? 0) + 1;
  const told = option.tierStory && tier ? option.tierStory[tier] : option.story;
  (inst.steps ??= []).push(told);
  log(s, `【${name}】·${option.name}`);
  log(s, told);
  if (option.secret && tier) addSecret(s, option.secret, tier);
  const left = xiayuS(s, inst.solved);
  if (left > 0) {
    log(s, `【${name}】尚未了结，局势还差 ${left} 档。`, "info");
    return 0;
  }
  inst.chosenOptionId = option.id;
  inst.viaCard = option.card;
  inst.story = told;
  inst.result = "完美解决，没有代价";
  log(s, `【${name}】完美解决。`, "good");
  removeStatusById(s, "fuxiongMengchen");
  return 0;
}

function applyStoryOption(s: Z3State, inst: StoryInst3, option: StoryOption3, source: string, tier: LingrongTier | null): number {
  const def = STORIES3[inst.id];
  inst.chosenOptionId = option.id;
  if (option.card) inst.viaCard = option.card;
  log(s, source);

  if (inst.id === "zhaoxing" && option.card === "lingrongXiangzhu" && tier) {
    const o = LINGRONG_SUMMON[tier];
    log(s, o.story, tier === "close" ? "good" : "bad");
    inst.story = o.story;
    inst.result = o.result === "success" ? "侍寝成功" : o.result === "stolen" ? "陵容夺功，你未侍寝" : "召幸被截走";
    if (o.effects) applyDeltas3(s, o.effects as readonly Delta3[], "陵容截宠");
    if (o.result !== "lost") addSecret(s, "shiqinNeiqing", tier);
    if (o.result === "success") summonSuccess(s);
    return o.relation ?? 0;
  }

  const told = option.tierStory && tier ? option.tierStory[tier] : option.story;
  if (option.tierStory && tier) inst.story = told;
  log(s, told);

  if (option.xiayu) {
    const cost = xiayuCost(s, option.xiayu, inst.solved ?? 0);
    inst.result = cost.length ? cost.map((d) => `${RESOURCE3_LABEL[d.resource]} ${d.amount}`).join("、") : "没有代价";
    applyDeltas3(s, cost, def.name);
    removeStatusById(s, "fuxiongMengchen");
  }
  if (option.shenziFloor != null) {
    for (const d of option.effects) {
      if (d.resource !== "shenzi") applyDelta3(s, d, `${def.name}·${option.name}`);
      else if (s.shenzi + d.amount < option.shenziFloor) {
        const amount = Math.min(0, option.shenziFloor - s.shenzi);
        if (amount !== 0) applyDelta3(s, { resource: "shenzi", amount }, `${def.name}·${option.name}（最少扣到 ${option.shenziFloor}）`);
      } else applyDelta3(s, d, `${def.name}·${option.name}`);
    }
  } else applyDeltas3(s, option.effects, `${def.name}·${option.name}`);
  if (!alive(s)) return 0;

  if (option.status) addStatus3(s, option.status);
  if (def.id === "wentaiyiTanshi" && hasStatus3(s, "jingfeiZhiyi")) {
    log(s, "敬妃托温太医带来了不少物资，山居的日子打点得宽裕了些。", "good");
    addStatus3(s, "jingfeiZhouji");
  }
  if (option.removeNegatives) removeNegatives(s, option.removeNegatives, option.name);
  if (option.drawCards) drawCards3(s, option.drawCards);
  if (option.pregnancy) becomePregnant(s, def.name);
  if (option.summon) {
    inst.result = "侍寝成功";
    summonSuccess(s);
  }
  if (option.secret && tier) addSecret(s, option.secret, tier);
  if (option.relic && !s.keepsakes.includes(option.relic)) s.keepsakes.push(option.relic);
  switch (option.flag) {
    case "li":
    case "di":
    case "lingrong":
      s.guoMeet = option.flag;
      break;
    case "luofa":
      s.luofa = true;
      break;
    case "gengtie":
      s.gengtie = true;
      if (qinseReady(s)) {
        s.statuses.push({ uid: `s${s.nextUid++}`, id: "qinseHeming", appliesFromTurn: ZHOUFU_TURN + 1, remaining: 0 });
        log(s, `获得状态【${STATUSES3.qinseHeming.name}】（${statusText3(STATUSES3.qinseHeming, s.turn).effectText}）`, "good");
        popup(s, "qinse");
      }
      break;
    case "songxing":
      s.songxing = true;
      break;
    case "ouyu":
      if (s.yihua?.step === 2) advanceYihua(s, option.card ?? "chanyuXiushen");
      break;
  }
  if (inst.id === "tonghuataiChuyu") afterTonghuatai(s);
  if (inst.id === "taxueWenji" && option.card) s.taxueByCard = true;
  if (inst.id === "shanmenOuyu" || inst.id === "taxueWenji") {
    addCardToDeck(s, "guojunwangXiangzhu");
    log(s, "牌库加入 1 张【果郡王相助】。", "good");
  }
  if (inst.id === "wanwanLeiqing") {
    s.wanwanOption = option.id;
    birth(s);
  }
  return 0;
}

function afterTonghuatai(s: Z3State): void {
  addCardToDeck(s, "guojunwangXiangzhu");
  log(s, "牌库加入第 1 张【果郡王相助】。", "good");
  s.opportunityPool = shuffleInto(s, [...s.opportunityPool, "wangyeXiantan"]);
  log(s, "【王爷闲谈】洗入机会池。");
  popup(s, "tonghuatai");
}

function birth(s: Z3State): void {
  if (!alive(s)) return;
  s.pregnant = false;
  s.childBorn = true;
  removeStatusById(s, "shenhuaiLongyi");
  removeFromPools(s, [PIN_EVENT]);
  log(s, "当夜早产，你生下一个女儿，皇上赐名胧月。", "good");
  popup(s, "wanwan");
}

function resolvePlay3(s: Z3State, cardUid: string, removeStatusUid?: string): void {
  const idx = s.hand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return;
  const lianmei = lianmeiSourceFor(s, idx);
  const card = s.hand[idx]!;
  const def = CARDS3[card.id];
  const tier = tierOf3(s);
  const isLingrong = card.id === "lingrongXiangzhu";

  const responses = storyResponsesFor3(s, card.id);
  const events = matchedEvents3(s, card.id);
  const yihuaStep = yihuaAccepts(s, card.id);

  s.hand.splice(idx, 1);
  if (lianmei) {
    s.lianmeiSpent.push(lianmei.uid);
    log(s, `打出【${def.name}】（联袂：不占出牌名额）`, "good");
  } else {
    s.playsUsed++;
    log(s, `打出【${def.name}】`);
  }
  s.playedThisTurn.push(card.id);
  let relationDelta = 0;
  let answered = responses.length > 0;

  // 1. story responses
  const startedNow = new Set<StoryInst3>();
  for (const { story, option } of responses) {
    if (!alive(s)) break;
    if (option.xiayu && option.card) {
      relationDelta += xiayuStep(s, story, option, isLingrong ? tier : null, STORIES3[story.id].name);
      continue;
    }
    if (option.two) {
      if (!story.pendingOptionId) {
        story.pendingOptionId = option.id;
        startedNow.add(story);
        log(s, `【${STORIES3[story.id].name}】·${option.name} 1/2：还需再打出一张牌。`);
      }
      continue;
    }
    relationDelta += applyStoryOption(s, story, option, `【${STORIES3[story.id].name}】·${option.name}（打出【${def.name}】）`, isLingrong ? tier : null);
  }

  for (const st of openStories3(s)) {
    if (!alive(s)) break;
    if (!st.pendingOptionId || startedNow.has(st)) continue;
    if (!STORIES3[st.id].options.some((o) => o.two && o.card === card.id)) continue;
    // 第二张须是这件事的某个卡牌应对（温太医相助之类不相干的牌不算）
    if (!STORIES3[st.id].options.some((o) => o.card === card.id)) continue;
    const opt = STORIES3[st.id].options.find((o) => o.id === st.pendingOptionId)!;
    if (opt.distinct && opt.card === card.id) continue;
    st.pendingOptionId = undefined;
    answered = true;
    relationDelta += applyStoryOption(s, st, opt, `【${STORIES3[st.id].name}】·${opt.name}（再打出【${def.name}】）`, opt.card === "lingrongXiangzhu" ? lingrongTier(s.relation) : null);
  }

  // 2. card's own effect
  if (alive(s)) {
    if (card.id === "meizhuangXiangzhu" && s.act >= 2) {
      addStatus3(s, "meizhuangDadian");
    } else {
      applyDeltas3(s, def.base, def.name);
      if (def.baseStatus && alive(s)) addStatus3(s, def.baseStatus);
      if (def.baseDraw > 0 && alive(s)) drawCards3(s, def.baseDraw);
    }
    if (def.extraPlays && alive(s)) {
      s.extraPlays += def.extraPlays;
      log(s, `${def.name}：本回合出牌 +${def.extraPlays}（现为 ${playLimit3(s)}）。`, "good");
    }
    if (card.id === "wenTaiyiZhenzhi") {
      const negatives = removableNegatives3(s);
      const target = removeStatusUid ?? (negatives.length === 1 ? negatives[0]!.uid : undefined);
      if (target) removeStatus3(s, target, def.name);
      else applyDelta3(s, { resource: "shenzi", amount: 1 }, `${def.name}（没有负面状态）`);
    }
  }

  // 3. events: 连环 crisis first, then opportunity, then the rest; each checked again right before
  const ordered = [...events].sort((a, b) => rankEvent(a) - rankEvent(b));
  const resolvedNow: EventInst3[] = [];
  for (const ev of ordered) {
    if (!alive(s)) break;
    if (ev.resolved || !cardAffectsEvent3(s, ev, card.id)) continue;
    answered = true;
    const d = EVENTS3[ev.id];
    if (d.double) {
      ev.progress = [...(ev.progress ?? []), card.id];
      if (ev.progress.length >= 2) resolveEventByCard(s, ev, card.id, false);
      else log(s, `【${d.name}】双牌进度 1/2。`);
      continue;
    }
    if (d.needTwo) {
      ev.progress = [...(ev.progress ?? []), card.id];
      if (ev.progress.length >= solveCount(ev)) {
        // 栗糕清苦：解牌里有陵容（不论先后），就按陵容化解
        const lingrongTier3 = isLingrong ? tier : ev.progress.includes("lingrongXiangzhu") && lizigaoOpen(s, ev) ? tierOf3(s) : null;
        if (lingrongTier3) relationDelta += resolveEventByLingrong(s, ev, lingrongTier3);
        else {
          // 连环: with the shared card among the two, its story always wins
          const shared = d.pair ? PAIRS[d.pair].shared : undefined;
          resolveEventByCard(s, ev, shared && ev.progress.includes(shared) ? shared : card.id, false);
        }
        if (ev.resolved) resolvedNow.push(ev);
      } else log(s, `【${d.name}】解牌 1/${solveCount(ev)}。`);
      continue;
    }
    if (isLingrong && tier) relationDelta += resolveEventByLingrong(s, ev, tier);
    else resolveEventByCard(s, ev, card.id, card.id === "meizhuangXiangzhu");
    if (ev.resolved) resolvedNow.push(ev);
  }
  // 连环 crisis cleared with the shared card among its two cards: the opportunity half is taken along
  for (const ev of [...resolvedNow]) {
    const pairId = EVENTS3[ev.id].pair;
    if (!pairId || EVENTS3[ev.id].kind !== "crisis" || !alive(s)) continue;
    const p = PAIRS[pairId];
    const opp = s.opportunity;
    if (!ev.progress?.includes(p.shared) || !opp || opp.id !== p.opportunity || opp.resolved) continue;
    resolveEventByCard(s, opp, p.shared, p.shared === "meizhuangXiangzhu");
    resolvedNow.push(opp);
    sharedPairCheck(s, p.shared, resolvedNow);
  }
  sharedPairCheck(s, card.id, resolvedNow);

  // 4. special cards of this turn
  if (alive(s) && s.chunyuan) {
    const step = chunyuanAccepts(s, card.id);
    if (step === 1) {
      s.chunyuan.first = card.id;
      log(s, `【${CHUNYUAN.name}】① 起疑：${CHUNYUAN.firstStory[card.id]}`, "good");
    } else if (step === 2) {
      s.chunyuan.second = card.id;
      log(s, `【${CHUNYUAN.name}】② 查实：${CHUNYUAN.checkStory[card.id]}`, "good");
    }
    if (isLingrong && tier) {
      answered = true;
      addSecret(s, "guyiYuanyan", tier);
    }
  }
  if (alive(s) && s.confront && confrontAccepts(s, card.id)) {
    const c = s.confront;
    const first = !c.played.includes(card.id);
    c.played.push(card.id);
    if (first) {
      // 先挑一条这张牌能专门辩解的、还没被驳过的指控；没有就用通用的作证表忠心
      const target = confrontLines(s).find((l) => !l.withheld && !l.qifei && !c.rebutted.includes(l.id) && CONFRONT.pleas[l.id]?.[card.id]);
      if (target) c.rebutted.push(target.id);
      const text = target ? CONFRONT.pleas[target.id]![card.id]! : CONFRONT.cardStory[card.id];
      const topic = target ? `回应「${target.id === "fabricated" ? "凭空编造的话" : SECRETS[target.id as SecretId].name.replace("恩赏为凭·", "")}」：` : "";
      if (text) c.stories.push(`${def.emoji} ${topic}${text}`);
    }
    log(s, `【景仁宫对质】辩白 ${c.played.length}/${c.needed}`, "good");
  }
  if (alive(s) && s.feilao && feilaoAccepts(s, card.id)) {
    const seen = s.feilao.played.includes(card.id);
    s.feilao.played.push(card.id);
    // 同一张解牌再打出时不重复整段剧情，只记减轻一档
    const story = seen ? `又一张「${FEILAO.cardStory[card.id]!.slice(1, FEILAO.cardStory[card.id]!.indexOf("」"))}」。` : FEILAO.cardStory[card.id];
    log(s, `【${FEILAO.name}】${story}（减轻一档，现为 ${FEILAO.tiers[feilaoCurrentTier(s)]!.name}）`, "good");
  }
  if (alive(s) && s.changxiangsi && !s.changxiangsi.done) {
    s.changxiangsi.played.push(card.id);
    if (s.changxiangsi.played.includes("guojunwangXiangzhu") && s.changxiangsi.played.includes("chanyuXiushen")) {
      s.changxiangsi.done = true;
      s.changxiangsiDone = true;
      log(s, `【${CHANGXIANGSI.name}】笛箫合奏：${CHANGXIANGSI.story}`, "good");
      applyDelta3(s, { resource: "qingyu", amount: 2 }, "笛箫合奏");
    }
  }
  if (alive(s) && yihuaStep && s.yihua!.step !== 4) advanceYihua(s, card.id);
  if (alive(s) && yihuaStep && s.yihua?.step === 4 && s.yihua.dengmen) {
    const d = s.yihua.dengmen;
    d.played.push(card.id);
    log(s, `④ 登门：${YIHUA.dengmenStory[card.id]}（解牌 ${Math.min(d.played.length, d.needed)}/${d.needed}）`, "good");
    if (d.played.length >= d.needed) finishDengmen(s);
  }
  if (alive(s) && s.yihua && s.yihua.step < 5 && YIHUA.doubtCards.includes(card.id)) changeDoubt(s, -1, def.name);

  // 5. 陵容 with nothing to answer: her company, 情分 +1 (after 纯元故衣, a cold word)
  if (alive(s) && isLingrong && tier && !answered) {
    if (s.chunyuanPassed) {
      log(s, LINGRONG_COLD_TEXT);
      addSecret(s, "xinlengZhiyu", tier);
    } else log(s, LINGRONG_IDLE_TEXT3[tier], tier === "resentful" ? "bad" : "good");
    if (tier === "resentful") applyDelta3(s, { resource: "shengchong", amount: -1 }, "陵容微词");
    relationDelta += 1;
  }

  if (alive(s) && relationDelta !== 0) changeRelation(s, relationDelta);

  // 6. where the card goes
  if (isRelic(card.id)) {
    s.departed.push(card);
    s.relicsBurned++;
    log(s, `🕯️ 焚毁【${def.name}】：${RELIC_TEXT[card.id]}`);
  } else s.discard.push(card);
}

function rankEvent(ev: EventInst3): number {
  const d = EVENTS3[ev.id];
  if (d.pair && d.kind === "crisis") return 0;
  if (d.kind === "opportunity") return 1;
  return 2;
}

/** The 连环 shared card cleared both halves in one play: ally + 打压. */
function sharedPairCheck(s: Z3State, card: CardId3, resolvedNow: EventInst3[]): void {
  for (const pairId of Object.keys(PAIRS) as (keyof typeof PAIRS)[]) {
    const p = PAIRS[pairId];
    if (p.shared !== card) continue;
    const both = resolvedNow.some((e) => e.id === p.crisis) && resolvedNow.some((e) => e.id === p.opportunity);
    if (!both || !alive(s)) continue;
    log(s, `🔗 ${p.name}·一石二鸟：一张【${CARDS3[card].name}】两头都顾上了。`, "good");
    const crisis = resolvedNow.find((e) => e.id === p.crisis)!;
    if (crisis.suppressed) continue;
    crisis.suppressed = true;
    suppress(s, p.rival);
  }
}

function changeDoubt(s: Z3State, delta: number, source: string): void {
  const y = s.yihua;
  if (!y || !alive(s) || delta === 0) return;
  const next = Math.max(0, Math.min(DOUBT.max, y.doubt + delta));
  if (next === y.doubt) return;
  y.doubt = next;
  log(s, `${source}：📜疑点 ${delta > 0 ? "+" : ""}${delta} → ${next}`, delta > 0 ? "bad" : "good");
  if (next >= DOUBT.max) {
    lose(s, "疑点到 5，胎象再也瞒不住", "doubt");
    return;
  }
}

function advanceYihua(s: Z3State, card: CardId3): void {
  const y = s.yihua!;
  if (y.step === 1) {
    y.yinjia.push(card);
    log(s, `① 引驾：${YIHUA.yinjiaStory[card] ?? ""}`, "good");
    if (card === "jinxiXiangzhu") y.duishi = true;
    if (y.yinjia.length >= y.yinjiaNeed && y.yinjia.includes("jinxiXiangzhu")) {
      y.step = 2;
      y.yinjiaTurn = s.turn;
      y.ouyuDue = s.turn + YIHUA.ouyuDelay;
      log(s, `引驾完成：皇上要来甘露寺了（第 ${y.ouyuDue} 回合偶遇）。`, "good");
    } else log(s, `你已落发，皇上未必肯来：引驾还差 ${y.yinjiaNeed - y.yinjia.length} 张${y.yinjia.includes("jinxiXiangzhu") ? "（槿汐相助或眉庄相助）" : "槿汐相助"}。`);
    return;
  }
  if (y.step === 2) {
    y.step = 3;
    y.ouyuCard = card;
    popup(s, "ouyu");
    log(s, `② 偶遇：${YIHUA.ouyuStory}`, "good");
    if (s.exitShengchong != null) {
      s.shengchong = s.exitShengchong;
      log(s, `圣宠恢复为 ${s.shengchong}。`, "good");
    }
    y.ouyuTurn = s.turn;
    return;
  }
  if (y.step === 3) {
    y.step = 4;
    log(s, `③ 改脉：${YIHUA.maiDone}脉案上的月份对上了。只是皇上明日要亲自登门。`, "good");
  }
}

function finishDengmen(s: Z3State): void {
  const y = s.yihua!;
  y.step = 5;
  y.doneTurn = s.turn;
  log(s, `④ 登门：${y.dengmen!.needed === 0 ? YIHUA.dengmenNoneDone : s.exitTier === 3 ? YIHUA.dengmenNarrow : YIHUA.dengmenDone}移花接木，四步俱成。`, "good");
}

function openDengmen(s: Z3State): void {
  const y = s.yihua!;
  const relics = relicsKept(s);
  const needed = dengmenNeeded(s, y.doubt, relics);
  y.dengmen = { doubt: y.doubt, relics, needed, played: [], openTurn: s.turn };
  popup(s, "dengmen");
  log(s, `皇上亲自登门：${dengmenOpenText(y.doubt, relics, s.exitTier)}`, "info");
  if (needed === 0) finishDengmen(s);
  else log(s, `登门需打出 ${needed} 张解牌（📜疑点 ${y.doubt}、遗物 ${relics} 件${s.exitTier === 1 ? "" : "，非体面自请多 1 张"}），须在本回合与下一回合内打够（一回合内打够才可能完胜，少 1 张为险胜）。`, "info");
}

// ---------------------------------------------------------------- turn flow

function enterTemple(s: Z3State): void {
  s.act = 2;
  s.lingrongGone = true;
  const guo = [...s.hand, ...s.drawPile, ...s.discard].filter((c) => c.id === "guojunwangXiangzhu");
  s.departed.push(...[...s.hand, ...s.drawPile, ...s.discard].filter((c) => c.id !== "guojunwangXiangzhu"));
  const ids = s.exitTier === 3 ? STAGE3_TEMPLE_DECK.filter((id, i, all) => !(id === "jinxiXiangzhu" && all.indexOf(id) === i)) : [...STAGE3_TEMPLE_DECK];
  const deck: CardInst3[] = [...ids.map((id) => ({ uid: `c${s.nextUid++}`, id })), ...guo];
  s.hand = [];
  s.discard = [];
  s.drawPile = shuffleInto(s, deck);
  s.statuses = s.statuses.filter((st) => st.id === "lingrongDeXiang" || st.id === "jingfeiZhiyi");
  if (s.shenzi < 1) s.shenzi = 1; // 卧床静养 ends with 第一幕
  if (s.qingyu > XIUXING.cap) {
    s.qingyu = XIUXING.cap;
    log(s, `修行之人，清誉上限 ${XIUXING.cap}：清誉记为 ${s.qingyu}。`);
  }
  s.opportunityPool = shuffleInto(s, TEMPLE_OPPORTUNITIES);
  s.opportunityUsed = [];
  s.crisisPool = shuffleInto(s, TEMPLE_CRISES);
  s.crisisUsed = [];
  s.huanghouPool = [];
  s.huanghouUsed = [];
  s.summonLast = null;
  log(s, `—— ${"第二幕 · 青灯古佛"} ——你成了甘露寺里带发修行的莫愁。宫中的牌封存，换成寺中牌库（${deck.length} 张）；每回合抓 ${XIUXING.draw} 打 ${XIUXING.plays}。`, "info");
}

function moveToPeak(s: Z3State): void {
  s.atPeak = true;
  removeFromPools(s, ["fazuoCuhuo", "wutouXiangyou"]);
  s.opportunityPool = shuffleInto(s, [...s.opportunityPool, ...PEAK_ADD_OPPORTUNITIES]);
  s.crisisPool = shuffleInto(s, [...s.crisisPool, ...PEAK_ADD_CRISES]);
  log(s, "迁居凌云峰：杂役磋磨、功德箱失窃移出；月下对谈、夜半惊扰、耳目窥伺加入。");
}

const ZHOUFU_TURN = 25;

/** 踏雪问疾（打牌化解）与月下琴笛都已完成，合婚庚帖写下时才有琴瑟同心。 */
export function qinseReady(s: Z3State): boolean {
  return s.changxiangsiDone === true && s.taxueByCard === true;
}

function zhoufu(s: Z3State): void {
  const have = new Set<RelicId>(s.keepsakes);
  if (s.gengtie) have.add("yiwuGengtie");
  if (s.songxing) have.add("yiwuDi");
  const relics = RELICS.filter((r) => have.has(r));
  let i = 0;
  const convert = (pile: CardInst3[]): CardInst3[] =>
    pile.map((c) => (c.id === "guojunwangXiangzhu" ? { uid: c.uid, id: relics[i++] ?? "yiwuPifeng" } : c));
  s.drawPile = convert(s.drawPile);
  s.discard = convert(s.discard);
  s.hand = convert(s.hand);
  log(s, `🌊 ${ZHOUFU.text}【果郡王相助】都变成了 🕯️遗物。`, "bad");
  popup(s, "zhoufu");
}

function enterYihua(s: Z3State): void {
  s.act = 3;
  s.pregnant = true;
  s.statuses.push({ uid: `s${s.nextUid++}`, id: "shenhuaiLongyi", appliesFromTurn: s.turn, remaining: 0 });
  addCardToDeck(s, "wenTaiyiZhenzhi");
  removeFromPools(s, ["yuexiaDuitan"]);
  if (s.exitTierLingrong === "resentful") {
    s.crisisPool = shuffleInto(s, [...s.crisisPool, "jingrenLairen"]);
    log(s, "景仁宫还在打听你的消息：【景仁宫来人】洗入危机池。", "bad");
  }
  s.yihua = { step: 1, yinjia: [], yinjiaNeed: s.luofa ? 2 : 1, duishi: false, doubt: DOUBT.start, doneTurn: null, ouyuDue: null, ouyuTurn: null, yinjiaTurn: null, dushu: false, dengmen: null };
  log(s, "—— 第三幕 · 移花接木 —— 温太医诊出喜脉，牌库加入 1 张【温太医相助】。持续事件【🎎移花接木】开始，📜疑点为 1。", "info");
  popup(s, "ximai");
}

function drawEvents(s: Z3State): void {
  const ease = (ev: EventInst3) => {
    const rival = EVENTS3[ev.id].rival;
    if (rival === "qifei" && hasStatus3(s, "dayaQifeiLizi")) {
      ev.eased = true;
      log(s, `【打压·齐妃】齐妃有把柄在皇后手里，不敢闹大：【${EVENTS3[ev.id].name}】少需要 1 张解牌。`, "good");
      return;
    }
    const daya = rival ? SUPPRESS_STATUS[rival] : undefined;
    if (!daya || !removeStatusById(s, daya)) return;
    ev.eased = true;
    log(s, `【${STATUSES3[daya].name}】上回吃了亏，这回没敢闹大：【${EVENTS3[ev.id].name}】少需要 1 张解牌。`, "good");
  };
  let opp = drawFromPool<OpportunityId3>(s, "opportunityPool", "opportunityUsed");
  let crisis = drawFromPool<CrisisId3>(s, "crisisPool", "crisisUsed");
  const oppPair = opp ? EVENTS3[opp].pair : undefined;
  const crisisPair = crisis ? EVENTS3[crisis].pair : undefined;
  if (oppPair) {
    const partner = PAIRS[oppPair].crisis;
    if (crisis !== partner) {
      if (crisis) s.crisisPool = shuffleInto(s, [...s.crisisPool, crisis]);
      removeFromPools(s, [partner]);
      crisis = partner;
    }
  } else if (crisisPair) {
    const partner = PAIRS[crisisPair].opportunity;
    if (opp !== partner) {
      if (opp) s.opportunityPool = shuffleInto(s, [...s.opportunityPool, opp]);
      removeFromPools(s, [partner]);
      opp = partner;
    }
  }
  if (opp) {
    s.opportunity = newEvent(s, opp);
    log(s, `机会事件：【${EVENTS3[opp].name}】`);
  }
  if (crisis) {
    s.crisis = newEvent(s, crisis);
    log(s, `危机事件：【${EVENTS3[crisis].name}】${EVENTS3[crisis].pair ? "（连环）" : ""}`);
    ease(s.crisis);
  }
}

function beginTurn3(s: Z3State, turn: number): void {
  s.turn = turn;
  s.act = actOf(turn) === 1 ? 1 : s.act;
  s.turnRank = s.rank;
  s.playsUsed = 0;
  s.extraPlays = 0;
  s.drawnThisTurn = 0;
  s.lianmeiSpent = [];
  s.playedThisTurn = [];
  s.notices = [];
  s.chunyuan = null;
  s.confront = null;
  s.feilao = null;
  s.changxiangsi = null;
  log(s, `—— 第 ${turn} 回合 ——`);

  if (turn === STAGE3.act2Start) enterTemple(s);
  if (turn === STAGE3.act3Start) enterYihua(s);
  for (const st of s.statuses) {
    const v = STATUSES3[st.id].veiled;
    if (v?.untilTurn === turn) log(s, `【${STATUSES3[st.id].name}】${STATUSES3[st.id].flavor}（${STATUSES3[st.id].effectText}）`, "good");
  }
  if (s.yihua?.step === 2 && s.yihua.ouyuDue === turn) {
    log(s, "皇上驾临甘露寺：本回合解决【圣驾偶遇】才算偶遇成功。", "info");
    openStory(s, "yihuaOuyu");
  }

  if (s.yihua?.step === 4 && !s.yihua.dengmen) openDengmen(s);

  const fixed = FIXED_STORIES3[turn];
  // 嫔位已报过喜脉：海棠春睡只是留宿夜谈
  if (fixed) openStory(s, fixed === "haitangChunshui" && s.pregnant && s.rank === "pin" ? "haitangYeyu" : fixed);
  if (turn === 6) {
    s.chunyuan = { first: null, second: null };
    log(s, `剧情事件：【${CHUNYUAN.name}】${CHUNYUAN.rule}`);
  }
  if (turn === STAGE3.confrontTurn) {
    const presented = presentedSecrets(s);
    const needed = confrontNeeded(presented) + (s.rank === "guiren" ? 1 : 0);
    s.confront = { presented, needed, played: [], stories: [], rebutted: [] };
    popup(s, "confront");
    log(s, `剧情事件：【${CONFRONT.name}】皇后拿出了 ${presented} 件事。本回合须打出 ${needed} 张辩白牌${s.rank === "guiren" ? "（贵人多 1 张）" : ""}。陵容称病没来，她的牌打不出。`, "bad");
  }
  if (turn === STAGE3.templeLastTurn) {
    if (hasStatus3(s, "hanzheng")) applyDelta3(s, { resource: "shenzi", amount: -1 }, "带着寒疾缠身病倒");
    if (!alive(s)) return;
    const base = feilaoBaseTier(s.arrogance);
    s.feilao = { base, played: [] };
    log(s, `剧情事件：【${FEILAO.name}】初始档位：${FEILAO.tiers[base]!.name}。本回合每打出 1 张槿汐相助 / 禅语修身 / 眉庄相助，减轻一档。`, "bad");
  }
  if (turn === 21) {
    s.changxiangsi = { played: [], done: false };
    log(s, `剧情事件：【${CHANGXIANGSI.name}】${CHANGXIANGSI.rule}`);
  }
  if (turn === ZHOUFU_TURN) zhoufu(s);

  if (turn !== STAGE3.confrontTurn) {
    drawEvents(s);
    if (s.act === 1 && turn >= 3) drawHuanghou(s);
    checkSummon(s);
  }

  const kept = s.hand.length;
  const base = drawCount3(s, turn);
  const n = Math.max(0, base - kept);
  drawCards3(s, n);
  log(s, `抓 ${n} 张牌${kept > 0 ? `（依依留下 ${kept} 张陵容，少抓 ${base - n} 张）` : ""}。`);
}

function drawHuanghou(s: Z3State): void {
  const id = drawFromPool<HuanghouId>(s, "huanghouPool", "huanghouUsed", (x) => x !== "antaiBupin" || s.pregnant);
  if (!id) return;
  s.huanghou = newEvent(s, id);
  log(s, `皇后事件：【${EVENTS3[id].name}】`, "info");
}

function settleCrisis(s: Z3State, ev: EventInst3): void {
  const def = EVENTS3[ev.id];
  const jingbai = def.jingbai && s.act === 2 && !s.atPeak;
  if (jingbai) s.arrogance++; // hidden
  if (removeStatusById(s, "shitaiBihu")) {
    log(s, `【佛门庇荫】静岸师太替你挡下了【${def.name}】。`, "good");
    return;
  }
  if (def.rival && removeStatusById(s, "xinGuirenZhangyi")) {
    ev.byXin = true;
    log(s, `【欣贵人解围】【${def.name}】没化解，欣贵人替你挡下了惩罚。${(s.lizigao ? POPUP_TEXT.lizigaoXinCover[ev.id] : undefined) ?? def.xinCover ?? "她当众顶了回去。"}`, "good");
    if (def.pair) log(s, `连环：【${EVENTS3[PAIRS[def.pair].opportunity].name}】随之作废。`, "bad");
    return;
  }
  log(s, `危机事件【${def.name}】未化解：${unresolvedText3(def, s.turn)}。`, "bad");
  const half = def.needTwo === true && (ev.progress ?? []).length === 1;
  if (half) log(s, `只凑了一张解牌，【${def.name}】的惩罚减轻了。`, "info");
  applyDeltas3(s, half && def.halfPenalty ? def.halfPenalty : def.penalty, def.name);
  if (ev.id === "xianrenKuitan" && s.playedThisTurn.includes("guojunwangXiangzhu")) applyDelta3(s, { resource: "qingyu", amount: -1 }, "被撞见");
  if (def.penaltyStatus && alive(s)) {
    const turns = half ? def.halfStatusTurns : undefined;
    addStatus3(s, def.penaltyStatus, turns);
    if (ev.aggravated && alive(s)) addStatus3(s, def.penaltyStatus, turns);
  }
  if (def.secret) addSecret(s, def.secret, null);
  if (ev.id === "jingrenLairen") changeDoubt(s, 1, "景仁宫来人");
  if (def.pair) log(s, `连环：【${EVENTS3[PAIRS[def.pair].opportunity].name}】随之作废。`, "bad");
}

function settleConfront(s: Z3State): void {
  const c = s.confront!;
  const short = Math.max(0, c.needed - c.played.length);
  const tier = confrontOutcome(c.presented, short);
  const ltier = lingrongTier(s.relation);
  const exit = EXIT[tier];
  s.exitTier = tier;
  s.exitTierLingrong = ltier;
  log(s, `景仁宫对质：辩白 ${c.played.length}/${c.needed}。${exit.emperor}`, tier >= 3 ? "bad" : "info");
  log(s, `${LINGRONG_TRUTH[ltier]}`);
  if (tier === 4) {
    lose(s, "景仁宫对质落到“打入冷宫”", "lenggong");
    return;
  }
  log(s, `${exit.emoji} ${exit.name}：${exit.story}${exit.longyue}`, tier === 1 ? "good" : "bad");
  // 出宫清誉按皇后呈上的把柄条数扣，从修行上限起算（先封顶，否则宫中攒的高清誉会把扣减吞掉）；至少留 1
  if (s.qingyu > XIUXING.cap) s.qingyu = XIUXING.cap;
  const loss = Math.min(c.presented, s.qingyu - 1);
  if (loss > 0) applyDelta3(s, { resource: "qingyu", amount: -loss }, `皇后呈上 ${c.presented} 条把柄`);
  applyDeltas3(s, exit.effects, exit.name);
  if (!alive(s)) {
    s.lossKind = "lenggong";
    return;
  }
  s.exitShengchong = s.shengchong;
  s.exitRank = s.rank;
  if (tier === 3) s.arrogance = Math.max(s.arrogance, 1);
  log(s, LINGRONG_FAREWELL[ltier]);
  if (ltier === "close") addStatus3(s, "lingrongDeXiang");
  popup(s, "exit");
}

function endTurn3(s: Z3State): void {
  s.popups = [];
  // stories → default option
  for (const inst of s.stories) {
    if (inst.chosenOptionId != null || !alive(s)) continue;
    const def = STORIES3[inst.id];
    const option = def.options.find((o) => o.id === def.defaultOptionId)!;
    const msg = option.hidden ? `【${def.name}】未处理，${option.story}` : `未作选择，已按默认选项【${option.name}】处理【${def.name}】。`;
    const delta = applyStoryOption(s, inst, option, msg, null);
    if (delta) changeRelation(s, delta);
  }
  if (!alive(s)) return;

  // 纯元故衣
  if (s.chunyuan) {
    const c = s.chunyuan;
    const result = c.second ? "seen" : c.first ? "half" : "fail";
    s.chunyuanResult = result;
    if (result === "seen") log(s, `【${CHUNYUAN.name}】识破：${CHUNYUAN.successStory}`, "good");
    else {
      log(s, `【${CHUNYUAN.name}】${result === "half" ? "只起了疑" : "没识破"}：${result === "half" ? CHUNYUAN.halfStory : CHUNYUAN.failStory}`, "bad");
      applyDelta3(s, { resource: "shengchong", amount: -(result === "half" ? CHUNYUAN.halfPenalty : CHUNYUAN.failPenalty) }, CHUNYUAN.name);
    }
    popup(s, "chunyuan");
    s.chunyuanPassed = true;
    if (!alive(s)) return;
  }

  // events
  if (s.opportunity && !s.opportunity.resolved) log(s, `机会事件【${EVENTS3[s.opportunity.id].name}】未把握，直接离场。`);
  if (s.opportunity && !s.opportunity.resolved) {
    if (s.opportunity.id === "gongzhongLaixin") jingfeiLetter(s, s.opportunity);
    const secret = EVENTS3[s.opportunity.id].secret;
    if (secret) addSecret(s, secret, null);
  }
  if (s.crisis && !s.crisis.resolved) settleCrisis(s, s.crisis);
  if (!alive(s)) return;
  if (s.huanghou && !s.huanghou.resolved) {
    const def = EVENTS3[s.huanghou.id];
    log(s, `皇后事件【${def.name}】按默认结算。`);
    applyDeltas3(s, def.reward, def.name);
    addSecret(s, `enshang.${s.huanghou.id as HuanghouId}`, null);
  }
  if (!alive(s)) return;

  // 睹物生疑: every 遗物 still in hand at the end of any turn between 引驾 and 回宫 (and the 偶遇 turn itself)
  const yh = s.yihua;
  if (yh && ((yh.yinjiaTurn != null && yh.step < 5 && s.turn > yh.yinjiaTurn) || yh.ouyuTurn === s.turn)) {
    const n = s.hand.filter((c) => isRelic(c.id)).length;
    if (n > 0) {
      yh.dushu = true;
      log(s, `睹物生疑：${yh.ouyuTurn === s.turn ? YIHUA.dushuStory : YIHUA.dushuNote}`, "bad");
      changeDoubt(s, n, `睹物生疑（手里 ${n} 件遗物）`);
      if (!alive(s)) return;
    }
  }

  // events leave
  if (s.opportunity?.id === PIN_EVENT) {
    if (!s.opportunity.resolved && s.pregnant && s.rank === "guiren") {
      s.opportunityPool = shuffleInto(s, [...s.opportunityPool, PIN_EVENT]);
      log(s, "【请脉报喜】没能稳妥报喜，洗回机会牌池。");
    }
  } else if (s.opportunity) s.opportunityUsed.push(s.opportunity.id as OpportunityId3);
  if (s.crisis && !(s.lizigao && s.crisis.id === "sanAgeYaochong")) s.crisisUsed.push(s.crisis.id as CrisisId3);
  if (s.huanghou) s.huanghouUsed.push(s.huanghou.id as HuanghouId);
  s.opportunity = null;
  s.crisis = null;
  s.huanghou = null;
  s.stories = [];

  // hand: 依依 keeps 陵容 (生分); 冷落
  const tier = tierOf3(s);
  const lingrongLeft = s.hand.some((c) => c.id === "lingrongXiangzhu");
  const keep = tier === "distant" && s.turn < STAGE3.confrontTurn ? s.hand.filter((c) => c.id === "lingrongXiangzhu") : [];
  s.discard.push(...s.hand.filter((c) => !keep.includes(c)));
  s.hand = keep;
  if (keep.length > 0) log(s, `依依：${keep.length} 张【陵容相助】留在手牌中，下回合少抓 ${keep.length} 张。`);
  if (lingrongLeft && tier && s.turn < STAGE3.confrontTurn) {
    if (s.relation > -1) {
      log(s, "陵容来碎玉轩候了半日，宫人说小主正忙着，她没能见上一面。", "bad");
      changeRelation(s, -1);
    } else log(s, "陵容又扑了个空，眼里的光淡了些。", "bad");
  }

  // 肺痨之诬: after the crises (静白嚣张 counted)
  if (s.feilao) {
    const t = feilaoCurrentTier(s);
    s.feilaoTier = t;
    const tierDef = FEILAO.tiers[t]!;
    log(s, `【${FEILAO.name}】${tierDef.name}：${tierDef.story}`, t === 0 ? "info" : "bad");
    if (t === 0) {
      if (!hasStatus3(s, "shitaiBihu")) addStatus3(s, "shitaiBihu");
    } else {
      applyDeltas3(s, t === 1 ? [{ resource: "shenzi", amount: -1 }] : [{ resource: "shenzi", amount: -2 }, { resource: "qingyu", amount: -1 }], tierDef.name);
      if (alive(s)) addStatus3(s, "hanzheng");
    }
    if (!alive(s)) return;
    moveToPeak(s);
    popup(s, "feilao");
  }

  // statuses: end-of-turn effects, then tick
  for (const st of activeStatuses(s)) {
    const fx = STATUSES3[st.id].turnEnd;
    if (fx && alive(s)) applyDeltas3(s, fx, STATUSES3[st.id].name);
  }
  if (!alive(s)) return;
  for (const st of s.statuses) if (!STATUSES3[st.id].permanent && st.appliesFromTurn <= s.turn) st.remaining--;
  for (const st of s.statuses.filter((x) => !STATUSES3[x.id].permanent && x.remaining <= 0)) {
    log(s, `状态【${STATUSES3[st.id].name}】结束。`);
    if (st.id === "wochuangJingyang") s.shenzi = Math.max(s.shenzi, 1);
  }
  s.statuses = s.statuses.filter((x) => STATUSES3[x.id].permanent || x.remaining > 0);
  if (hasStatus3(s, "lingrongDeXiang") && STAGE3.fragranceTurns.includes(s.turn)) applyDelta3(s, { resource: "shenzi", amount: 1 }, "暗香盈袖");
  if (!alive(s)) return;

  // scheduled additions
  if (s.turn === 2) {
    s.huanghouPool = shuffleInto(s, HUANGHOU_EVENTS);
    log(s, "🏵️ 从下一回合起，每回合会有一张皇后事件。");
    popup(s, "huanghou");
  }
  if (s.turn === 5) {
    s.crisisPool = shuffleInto(s, [...s.crisisPool, "emingCanben"]);
    log(s, "前朝起了风波：【鄂敏参本】洗入危机池。", "bad");
  }
  // 甄远道已在第 8 回合下狱，折子的事有了定论，不会再出现。
  if (s.turn === 9) removeFromPools(s, ["emingCanben"]);

  // 景仁宫对质
  if (s.confront) {
    settleConfront(s);
    if (!alive(s)) return;
  }

  // 移花接木
  const y = s.yihua;
  if (y) {
    if (y.step === 5) {
      s.outcome = "won";
      const perfect = y.doneTurn != null && y.doneTurn < STAGE3.perfectBefore && relicsKept(s) === 0 && s.exitTier === 1 && y.dengmen?.openTurn === y.doneTurn;
      const narrow = s.exitTier === 3;
      s.victory = narrow ? "narrow" : perfect ? "perfect" : "return";
      log(s, narrow ? "凤阙归来（险胜）：皇上心存疑虑，仍下旨接你回宫。" : perfect ? "凤阙归来：完胜！" : "凤阙归来：钮祜禄氏，封熹妃，即日回宫。", "good");
      return;
    }
    const dm = y.dengmen;
    if (y.step === 4 && dm && s.turn >= Math.min(dm.openTurn + 1, STAGE3.totalTurns)) {
      if (dm.needed - dm.played.length === 1) {
        y.step = 5;
        y.doneTurn = s.turn;
        s.outcome = "won";
        s.victory = "narrow";
        log(s, `④ 登门：${YIHUA.dengmenNarrow}`, "good");
        log(s, "凤阙归来（险胜）：皇上心存疑虑，仍下旨接你回宫。", "good");
      } else lose(s, "登门两回合内解牌不足，皇上拂袖而去", "deadline");
      return;
    }
    if (y.step === 2 && y.ouyuDue === s.turn) {
      y.ouyuDue = s.turn + YIHUA.ouyuRetry;
      log(s, `偶遇没成：皇上这回没见着你，隔一回合还会再来（第 ${y.ouyuDue} 回合）。`, "bad");
    }
    if (y.step < 3) changeDoubt(s, 1, "召幸迟迟未成，月份越差越多");
    if (!alive(s)) return;
    if (s.turn >= STAGE3.totalTurns) {
      lose(s, "第 33 回合末移花接木仍未完成", "deadline");
      return;
    }
  }

  beginTurn3(s, s.turn + 1);
}

// ---------------------------------------------------------------- public API

function randomSecrets(s: Z3State, n: number): Stage2SecretId[] {
  return shuffleInto(s, STAGE2_SECRETS).slice(0, n);
}

export function newStage3(seed: number, carry: Carry3 | null): Z3State {
  let rng = createRngFromSeed(seed);
  let nextUid = 1;
  const deck: CardInst3[] = STAGE3_ACT1_DECK.map((id) => ({ uid: `c${nextUid++}`, id }));
  let drawPile: CardInst3[];
  [rng, drawPile] = shuffle(rng, deck);
  let opportunityPool: OpportunityId3[];
  let crisisPool: CrisisId3[];
  [rng, opportunityPool] = shuffle(rng, ACT1_OPPORTUNITIES);
  [rng, crisisPool] = shuffle(rng, ACT1_CRISES);
  const rank: RankId = carry?.rank ?? STAGE3.standaloneRank;
  const cap = RANKS[rank].cap;
  const s: Z3State = {
    stage: 3,
    seed,
    carry,
    rng,
    turn: 0,
    act: 1,
    rank,
    turnRank: rank,
    qingyu: Math.min(cap, carry?.qingyu ?? STAGE3.standaloneQingyu),
    shengchong: Math.min(cap, carry?.shengchong ?? STAGE3.standaloneShengchong),
    shenzi: Math.max(1, Math.min(SHENZI.max, carry?.shenzi ?? STAGE3.standaloneShenzi)),
    relation: carry?.relation ?? 0,
    lingrongGone: false,
    drawPile,
    hand: [],
    discard: [],
    departed: [],
    opportunityPool,
    opportunityUsed: [],
    crisisPool,
    crisisUsed: [],
    huanghouPool: [],
    huanghouUsed: [],
    opportunity: null,
    crisis: null,
    huanghou: null,
    stories: [],
    notices: [],
    popups: [],
    pregnant: false,
    childBorn: false,
    summonLast: null,
    secrets: {},
    allies: { duanfei: false, jingfei: false, xin: false },
    suppressed: { qifei: false, guaerjia: false },
    lizigao: false,
    guoMeet: null,
    chunyuan: null,
    chunyuanPassed: false,
    chunyuanResult: null,
    confront: null,
    exitTier: null,
    exitShengchong: null,
    exitRank: null,
    exitTierLingrong: null,
    arrogance: 0,
    feilao: null,
    feilaoTier: null,
    atPeak: false,
    luofa: false,
    gengtie: false,
    songxing: false,
    keepsakes: [],
    changxiangsi: null,
    yihua: null,
    relicsBurned: 0,
    statuses: [],
    playsUsed: 0,
    extraPlays: 0,
    drawnThisTurn: 0,
    lianmeiSpent: [],
    playedThisTurn: [],
    pending: null,
    outcome: "playing",
    lossReason: null,
    lossKind: null,
    victory: null,
    log: [],
    actions: [],
    turnStartActionCount: 0,
    nextUid,
  };
  for (const id of carry ? carry.secrets : randomSecrets(s, STAGE3.standaloneSecrets)) s.secrets[id] = 1;
  if (carry ? carry.pregnant : STAGE3.standalonePregnant) {
    s.pregnant = true;
    s.statuses.push({ uid: `s${s.nextUid++}`, id: "shenhuaiLongyi", appliesFromTurn: 0, remaining: 0 });
    if (rank === "guiren") addPinEvent(s);
  }
  log(
    s,
    carry
      ? `承接第二关：${RANKS[rank].name}${carry.pregnant ? "，身怀龙裔" : ""}；清誉 ${s.qingyu}、圣宠 ${s.shengchong}、身子 ${s.shenzi}。`
      : `单独开始第三关：${RANKS[rank].name}${s.pregnant ? "，身怀龙裔" : "，未孕"}；清誉 ${s.qingyu}、圣宠 ${s.shengchong}、身子 ${s.shenzi}。`,
  );
  popup(s, "opening");
  beginTurn3(s, 1);
  return s;
}

export function reduce3(state: Z3State, action: Z3Action): Z3State {
  if (state.outcome !== "playing" && action.type !== "explainTag") return state;
  const s = structuredClone(state);
  switch (action.type) {
    case "playCard": {
      if (!canPlayCard3(s, action.cardUid)) return state;
      const card = s.hand.find((c) => c.uid === action.cardUid)!;
      if (card.id === "wenTaiyiZhenzhi" && removableNegatives3(s).length > 1) {
        s.pending = { kind: "wentaiyi", cardUid: card.uid };
        log(s, "温太医相助：请选择要移除的负面状态（可取消）。");
      } else resolvePlay3(s, card.uid);
      break;
    }
    case "removeStatus": {
      if (s.pending?.kind !== "wentaiyi") return state;
      const st = removableNegatives3(s).find((x) => x.uid === action.statusUid);
      if (!st) return state;
      const cardUid = s.pending.cardUid;
      s.pending = null;
      resolvePlay3(s, cardUid, st.uid);
      break;
    }
    case "cancelPending": {
      if (!s.pending) return state;
      s.pending = null;
      log(s, "已取消。");
      break;
    }
    case "chooseStory": {
      if (s.pending) return state;
      const inst = s.stories.find((st) => st.id === action.storyId && st.chosenOptionId == null);
      if (!inst) return state;
      const option = storyBasicOptions3(STORIES3[inst.id]).find((o) => o.id === action.optionId);
      if (!option) return state;
      const delta = applyStoryOption(s, inst, option, `【${STORIES3[inst.id].name}】选择：${option.name}`, null);
      if (alive(s) && delta) changeRelation(s, delta);
      break;
    }
    case "explainTag": {
      const info = TAG3_INFO[action.tag];
      s.log.push({ turn: s.turn, text: `【${info.label}】${info.lore}`, tone: "info" });
      const relicDoubt = action.tag === "relic" && s.yihua ? RELIC_DOUBT_RULE : "";
      s.log.push({ turn: s.turn, text: `机制：${info.rules}${relicDoubt}`, tone: "info" });
      return s;
    }
    case "endTurn": {
      if (!canEndTurn3(s)) return state;
      s.actions.push(action);
      endTurn3(s);
      s.turnStartActionCount = s.actions.length;
      return s;
    }
  }
  s.actions.push(action);
  return s;
}

export function replay3(seed: number, carry: Carry3 | null, actions: readonly Z3Action[]): Z3State {
  let s = newStage3(seed, carry);
  for (const [i, a] of actions.entries()) {
    const next = reduce3(s, a);
    if (next === s) throw new Error(`第三关第 ${i + 1} 步操作无法复现`);
    s = next;
  }
  return s;
}

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
  if (s.victory === "narrow") lines.push(YIHUA.dengmenNarrow);
  lines.push(...POPUP_TEXT.homecoming);
  if (s.exitTier) lines.push(POPUP_TEXT.homecomingTier[s.exitTier]!);
  if (s.exitTierLingrong) lines.push(ENDING.lingrong[s.exitTierLingrong]);
  if (s.victory === "perfect") lines.push(...ENDING.perfect);
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

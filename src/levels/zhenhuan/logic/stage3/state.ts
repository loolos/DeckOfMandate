import type { RngSerialized } from "../../../../types/game";
import type {
  Act,
  AllyId,
  CardId3,
  CrisisId3,
  EventId3,
  ExitTier,
  HuanghouId,
  LingrongTier,
  Loss3Kind,
  OpportunityId3,
  PopupId,
  RankId,
  RelicId,
  RivalId,
  SecretId,
  Stage2SecretId,
  StatusId3,
  StoryId3,
  TagId3,
} from "../../data/stage3Content";
import type { LogEntry } from "../engineCommon";

// ---------------------------------------------------------------- state

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
export type { LogEntry, LogTone } from "../engineCommon";
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
  /** 第一幕对质前打出【收拢人心】的次数（隐藏，满 4 次记一条把柄）。 */
  renxinPlays: number;
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

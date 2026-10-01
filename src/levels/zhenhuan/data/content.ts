/**
 * 甄嬛传 · 第一关 content. Rules come from `../docs/design.md`; keep mechanic text in sync with it.
 * Flavor text is a short placeholder for now (design.md §12).
 */

export type Resource = "qingyu" | "shengchong";

export const RESOURCE_LABEL: Record<Resource, string> = { qingyu: "清誉", shengchong: "圣宠" };
export const RESOURCE_EMOJI: Record<Resource, string> = { qingyu: "🪷", shengchong: "👑" };

/** One step of an effect list; lists resolve in order and each step is checked for defeat. */
export type ResourceDelta = { readonly resource: Resource; readonly amount: number };

// ---------------------------------------------------------------- ranks

export type RankId = "daying" | "changzai" | "guiren" | "pin" | "fei";

export type RankDef = {
  readonly id: RankId;
  readonly name: string;
  readonly draw: number;
  readonly plays: number;
  /** Cap for both 清誉 and 圣宠. 答应 is 8 so the trial's 圣宠 ≥ 6 isn't the cap; higher ranks are provisional (design.md §2). */
  readonly cap: number;
};

export const RANKS: Record<RankId, RankDef> = {
  daying: { id: "daying", name: "答应", draw: 3, plays: 1, cap: 8 },
  changzai: { id: "changzai", name: "常在", draw: 3, plays: 2, cap: 10 },
  guiren: { id: "guiren", name: "贵人", draw: 4, plays: 2, cap: 14 },
  pin: { id: "pin", name: "嫔", draw: 5, plays: 3, cap: 18 },
  fei: { id: "fei", name: "妃", draw: 6, plays: 3, cap: 22 },
};

// ---------------------------------------------------------------- events

export type OpportunityId = "huangdiZhaojian" | "taihouChuixun" | "wenTaiyiQingmai";
export type CrisisId = "gongzhongLiuyan" | "neiwufuDiaonan" | "liyiShiwu";
export type EventId = OpportunityId | CrisisId;
export type EventKind = "opportunity" | "crisis";

export type EventDef = {
  readonly id: EventId;
  readonly kind: EventKind;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  /** Opportunity reward when resolved. */
  readonly reward: readonly ResourceDelta[];
  /** Crisis penalty when unresolved at end of turn. */
  readonly penalty: readonly ResourceDelta[];
  /** Crisis penalty that adds a status instead of / in addition to resource loss. */
  readonly penaltyStatus?: StatusId;
  readonly resolvedText: string;
  readonly unresolvedText: string;
};

export const EVENTS: Record<EventId, EventDef> = {
  huangdiZhaojian: {
    id: "huangdiZhaojian",
    kind: "opportunity",
    name: "皇帝召见",
    emoji: "🐉",
    flavor: "养心殿传来口谕，皇上要见你。",
    reward: [{ resource: "shengchong", amount: 2 }],
    penalty: [],
    resolvedText: "圣宠 +2",
    unresolvedText: "无额外效果，事件消失",
  },
  taihouChuixun: {
    id: "taihouChuixun",
    kind: "opportunity",
    name: "太后垂询",
    emoji: "🪭",
    flavor: "寿康宫请你过去说说话。",
    reward: [{ resource: "qingyu", amount: 2 }],
    penalty: [],
    resolvedText: "清誉 +2",
    unresolvedText: "无额外效果，事件消失",
  },
  wenTaiyiQingmai: {
    id: "wenTaiyiQingmai",
    kind: "opportunity",
    name: "温太医请脉",
    emoji: "🩺",
    flavor: "温实初照例前来请平安脉。",
    reward: [{ resource: "qingyu", amount: 1 }],
    penalty: [],
    resolvedText: "清誉 +1",
    unresolvedText: "无额外效果，事件消失",
  },
  gongzhongLiuyan: {
    id: "gongzhongLiuyan",
    kind: "crisis",
    name: "宫中流言",
    emoji: "🗣️",
    flavor: "各宫私下议论纷纷，矛头隐隐指向你。",
    reward: [],
    penalty: [],
    penaltyStatus: "liuyanChanshen",
    resolvedText: "移除事件，不产生负面状态",
    unresolvedText: "获得状态【流言缠身】",
  },
  neiwufuDiaonan: {
    id: "neiwufuDiaonan",
    kind: "crisis",
    name: "内务府刁难",
    emoji: "📦",
    flavor: "这个月的份例迟迟没有送来。",
    reward: [],
    penalty: [{ resource: "shengchong", amount: -1 }],
    resolvedText: "移除事件",
    unresolvedText: "圣宠 -1",
  },
  liyiShiwu: {
    id: "liyiShiwu",
    kind: "crisis",
    name: "礼仪失误",
    emoji: "🎎",
    flavor: "请安时的一个小差错，被有心人看在眼里。",
    reward: [],
    penalty: [
      { resource: "qingyu", amount: -1 },
      { resource: "shengchong", amount: -1 },
    ],
    resolvedText: "移除事件",
    unresolvedText: "清誉 -1、圣宠 -1",
  },
};

export const OPPORTUNITY_POOL: readonly OpportunityId[] = [
  "huangdiZhaojian",
  "huangdiZhaojian",
  "taihouChuixun",
  "taihouChuixun",
  "wenTaiyiQingmai",
  "wenTaiyiQingmai",
];

export const CRISIS_POOL: readonly CrisisId[] = [
  "gongzhongLiuyan",
  "gongzhongLiuyan",
  "neiwufuDiaonan",
  "neiwufuDiaonan",
  "liyiShiwu",
  "liyiShiwu",
];

// ---------------------------------------------------------------- statuses

export type StatusId = "liuyanChanshen" | "xianjiZaiwo";
export type StatusTag = "negative" | "positive";

export const STATUS_TAG_LABEL: Record<StatusTag, string> = { negative: "负面", positive: "正面" };

export type StatusDef = {
  readonly id: StatusId;
  readonly name: string;
  readonly emoji: string;
  readonly tag: StatusTag;
  /** Number of future turns the status applies to. */
  readonly duration: number;
  readonly drawModifier: number;
  readonly effectText: string;
};

export const STATUSES: Record<StatusId, StatusDef> = {
  liuyanChanshen: {
    id: "liuyanChanshen",
    name: "流言缠身",
    emoji: "🌫️",
    tag: "negative",
    duration: 3,
    drawModifier: -1,
    effectText: "未来 3 回合，每回合抓牌数 -1。多个实例分别计时、效果叠加。",
  },
  xianjiZaiwo: {
    id: "xianjiZaiwo",
    name: "先机在握",
    emoji: "🧭",
    tag: "positive",
    duration: 3,
    drawModifier: 1,
    effectText: "未来 3 回合，每回合抓牌数 +1。",
  },
};

// ---------------------------------------------------------------- cards

export type CardId = "yirongZhengsu" | "jinyanShenxing" | "wenTaiyiZhenzhi" | "shoulongRenxin" | "jingguanQibian" | "meizhuangXiangzhu";

export type CardDef = {
  readonly id: CardId;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly base: readonly ResourceDelta[];
  /** Base-effect card draw (静观其变). */
  readonly baseDraw: number;
  readonly matches: readonly EventId[];
  /** Full mechanic text shown on the card. */
  readonly rulesText: readonly string[];
};

export const CARDS: Record<CardId, CardDef> = {
  yirongZhengsu: {
    id: "yirongZhengsu",
    name: "仪容整肃",
    emoji: "🪞",
    flavor: "衣饰妆容一丝不苟。",
    base: [{ resource: "shengchong", amount: 1 }],
    baseDraw: 0,
    matches: ["huangdiZhaojian", "liyiShiwu"],
    rulesText: ["圣宠 +1。"],
  },
  jinyanShenxing: {
    id: "jinyanShenxing",
    name: "谨言慎行",
    emoji: "🤐",
    flavor: "话到嘴边留三分。",
    base: [{ resource: "qingyu", amount: 1 }],
    baseDraw: 0,
    matches: ["huangdiZhaojian", "taihouChuixun", "gongzhongLiuyan"],
    rulesText: ["清誉 +1。"],
  },
  wenTaiyiZhenzhi: {
    id: "wenTaiyiZhenzhi",
    name: "温太医诊治",
    emoji: "💊",
    flavor: "温实初的方子，总是最妥帖的。",
    base: [{ resource: "qingyu", amount: 2 }],
    baseDraw: 0,
    matches: ["wenTaiyiQingmai"],
    rulesText: [
      "清誉 +2。",
      "移除你的 1 个【负面】状态：只有 1 个时直接移除；有多个时由你选择。没有负面状态时无额外效果。",
    ],
  },
  shoulongRenxin: {
    id: "shoulongRenxin",
    name: "收拢人心",
    emoji: "🤝",
    flavor: "赏下去的银子，总会换回些什么。",
    base: [
      { resource: "qingyu", amount: 1 },
      { resource: "shengchong", amount: 1 },
    ],
    baseDraw: 0,
    matches: ["neiwufuDiaonan"],
    rulesText: ["清誉 +1、圣宠 +1。", "联动：用它解决【内务府刁难】时，额外抽 1 张牌。"],
  },
  jingguanQibian: {
    id: "jingguanQibian",
    name: "静观其变",
    emoji: "🍵",
    flavor: "先按兵不动，看清局势。",
    base: [],
    baseDraw: 1,
    matches: [],
    rulesText: ["抽 1 张牌。", "本回合最多出牌数 +1（本身仍占用 1 次出牌；可叠加）。"],
  },
  meizhuangXiangzhu: {
    id: "meizhuangXiangzhu",
    name: "眉庄相助",
    emoji: "👭",
    flavor: "眉姐姐总会站在你这边。",
    base: [
      { resource: "qingyu", amount: 1 },
      { resource: "shengchong", amount: 1 },
    ],
    baseDraw: 0,
    matches: ["taihouChuixun", "gongzhongLiuyan", "neiwufuDiaonan"],
    rulesText: ["清誉 +1、圣宠 +1。", "联动：它解决的机会事件，事件奖励翻倍（自身基础效果不翻倍）。"],
  },
};

export const STARTING_DECK: readonly CardId[] = [
  "yirongZhengsu",
  "yirongZhengsu",
  "jinyanShenxing",
  "jinyanShenxing",
  "wenTaiyiZhenzhi",
  "wenTaiyiZhenzhi",
  "shoulongRenxin",
  "shoulongRenxin",
  "jingguanQibian",
  "jingguanQibian",
  "meizhuangXiangzhu",
  "meizhuangXiangzhu",
];

/** Turn 1 is fixed (design.md §3.5). */
export const OPENING = {
  hand: ["shoulongRenxin", "yirongZhengsu", "jingguanQibian"] as readonly CardId[],
  opportunity: "huangdiZhaojian" as OpportunityId,
  crisis: "liyiShiwu" as CrisisId,
};

// ---------------------------------------------------------------- story events

export type StoryId = "diyiciMiansheng" | "huafeiQiaoda";

export type StoryOptionDef = {
  readonly id: string;
  readonly name: string;
  /**
   * Card response: playing this card FROM HAND while the story is open resolves it with these
   * effects (instead of the card's base effect). Never a button on the event (design.md §9).
   */
  readonly card?: CardId;
  readonly effects: readonly ResourceDelta[];
  readonly gainStatus?: StatusId;
  readonly text: string;
};

export type StoryDef = {
  readonly id: StoryId;
  readonly turn: number;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly defaultOptionId: string;
  readonly options: readonly StoryOptionDef[];
};

export const STORIES: Record<StoryId, StoryDef> = {
  diyiciMiansheng: {
    id: "diyiciMiansheng",
    turn: 4,
    name: "第一次面圣",
    emoji: "🏯",
    flavor: "敬事房翻了你的牌子，今夜要去养心殿。",
    defaultOptionId: "jinshenYingdui",
    options: [
      { id: "keyiBiaoxian", name: "刻意表现", effects: [{ resource: "shengchong", amount: 2 }, { resource: "qingyu", amount: -1 }], text: "圣宠 +2，清誉 -1" },
      { id: "jinshenYingdui", name: "谨慎应对", effects: [{ resource: "shengchong", amount: 1 }, { resource: "qingyu", amount: 1 }], text: "圣宠 +1，清誉 +1" },
      { id: "shengzhuangFuzhao", name: "盛装赴召", card: "yirongZhengsu", effects: [{ resource: "shengchong", amount: 3 }], text: "圣宠 +3" },
      { id: "yantanDeti", name: "言谈得体", card: "jinyanShenxing", effects: [{ resource: "shengchong", amount: 2 }, { resource: "qingyu", amount: 1 }], text: "圣宠 +2，清誉 +1" },
    ],
  },
  huafeiQiaoda: {
    id: "huafeiQiaoda",
    turn: 8,
    name: "华妃敲打",
    emoji: "🦚",
    flavor: "翊坤宫召你前去，华妃话里有话。",
    defaultOptionId: "renqiTunsheng",
    options: [
      { id: "renqiTunsheng", name: "忍气吞声", effects: [{ resource: "qingyu", amount: 1 }, { resource: "shengchong", amount: -2 }], text: "清誉 +1，圣宠 -2" },
      { id: "dangmianBiabai", name: "当面辩白", effects: [{ resource: "shengchong", amount: 1 }, { resource: "qingyu", amount: -2 }], text: "圣宠 +1，清誉 -2" },
      { id: "jiemeiXianghu", name: "姐妹相护", card: "meizhuangXiangzhu", effects: [{ resource: "qingyu", amount: 2 }], text: "清誉 +2，圣宠不下降" },
      { id: "biqiFengmang", name: "避其锋芒", card: "jinyanShenxing", effects: [{ resource: "qingyu", amount: 1 }], text: "清誉 +1，圣宠不变" },
      { id: "tiqianDezhi", name: "提前得知消息", card: "shoulongRenxin", effects: [], gainStatus: "xianjiZaiwo", text: "获得【先机在握】：未来 3 回合每回合抓牌 +1" },
    ],
  },
};

// ---------------------------------------------------------------- tag explanations (click a tag → log)

export type TagId = "opportunity" | "crisis" | "story" | "trial" | "trialCard" | "negative" | "positive";

export type TagInfo = { readonly label: string; readonly lore: string; readonly rules: string };

export const TAG_INFO: Record<TagId, TagInfo> = {
  opportunity: {
    label: "机会",
    lore: "宫里的恩典来得快、去得也快，抓住了便是你的。",
    rules: "每回合从机会牌池抽 1 张。打出卡面上的匹配牌即可解决并获得奖励；未解决时回合末直接离场，没有惩罚。",
  },
  crisis: {
    label: "危机",
    lore: "后宫里的风浪，躲不过就得接住。",
    rules: "每回合从危机牌池抽 1 张。打出匹配牌即可化解；未解决时回合末结算未处理效果后离场。",
  },
  story: {
    label: "剧情",
    lore: "命运的关口，在固定的日子里如约而至。",
    rules:
      "在固定回合出现，与普通事件同时存在。可以选择一个基础选项（不消耗出牌次数），或从手牌打出卡面所列的牌来解决（消耗 1 次出牌，按该牌的剧情效果结算，替代其基础效果，并同时解决匹配的普通事件）。都不做就结束回合时，按默认选项处理。",
  },
  trial: {
    label: "晋封考验",
    lore: "这一批晋封的名单，就看这三日的表现。",
    rules: "第 10—12 回合持续。每回合末判定：圣宠 ≥ 6、清誉 ≥ 5，且考验期间打出过仪容整肃或谨言慎行，即晋封为常在；第 12 回合末仍未满足则失败。",
  },
  trialCard: {
    label: "考验",
    lore: "仪容与言行，正是晋封时最看重的。",
    rules: "晋封考验期间（第 10—12 回合）打出这张牌，即满足考验的第 3 个条件。无论它用于解决什么事件都算。",
  },
  negative: {
    label: "负面",
    lore: "缠身的麻烦，一时半刻甩不掉。",
    rules: "持续性的不利状态。同名状态可以同时存在多个、分别计时。温太医诊治可以移除 1 个负面状态。",
  },
  positive: {
    label: "正面",
    lore: "占得的先机，要趁早用上。",
    rules: "持续性的有利状态，从获得后的下一回合开始生效。",
  },
};

/** 晋封考验 (design.md §9.3). */
export const PROMOTION_TRIAL = {
  name: "晋封考验",
  emoji: "📜",
  flavor: "宫里要晋一批小主的位分，这是你的机会。",
  firstTurn: 10,
  lastTurn: 12,
  minShengchong: 6,
  minQingyu: 5,
  keyCards: ["yirongZhengsu", "jinyanShenxing"] as readonly CardId[],
  promoteTo: "changzai" as RankId,
};

export const CHAPTER = {
  title: "第一关 · 初入宫闱",
  totalTurns: 15,
  startRank: "daying" as RankId,
  startQingyu: 2,
  startShengchong: 2,
};

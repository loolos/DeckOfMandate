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

export type OpportunityId = "huanghouShangshi" | "taihouChuixun" | "wenTaiyiQingmai";
export type CrisisId = "gongzhongLiuyan" | "neiwufuDiaonan" | "liyiShiwu";
/** 嫉妒事件: an extra third event while 圣宠 is high (design.md §7.4). */
export type EnvyId = "yuDayingZhengchong" | "shichongErjiao" | "anzhongXiaban";
export type EventId = OpportunityId | CrisisId | EnvyId;
export type EventKind = "opportunity" | "crisis" | "envy";

export const EVENT_KIND_LABEL: Record<EventKind, string> = { opportunity: "机会", crisis: "危机", envy: "嫉妒" };

export type EventDef = {
  readonly id: EventId;
  readonly kind: EventKind;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  /** Opportunity reward when resolved. */
  readonly reward: readonly ResourceDelta[];
  /** Crisis / envy penalty when unresolved at end of turn. */
  readonly penalty: readonly ResourceDelta[];
  /** Crisis penalty that adds a status instead of / in addition to resource loss. */
  readonly penaltyStatus?: StatusId;
  readonly resolvedText: string;
  readonly unresolvedText: string;
  /**
   * 剧情文本 shown on the event (and logged) once it is resolved, keyed by the card that resolved it.
   * Every card in `CARDS[x].matches` that lists this event must have an entry (checked by tests).
   */
  readonly resolvedStory: Partial<Record<CardId, string>>;
};

export const EVENTS: Record<EventId, EventDef> = {
  huanghouShangshi: {
    id: "huanghouShangshi",
    kind: "opportunity",
    name: "中宫垂青",
    emoji: "🏮",
    flavor: "景仁宫晨省，新入宫的小主们按位分站在最末。皇后娘娘的目光扫过来，在你身上停了一停。",
    reward: [{ resource: "shengchong", amount: 1 }],
    penalty: [],
    resolvedText: "圣宠 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      yirongZhengsu:
        "你妆饰素净、行礼分毫不乱，在一众新人里格外显眼。皇后当众赏了你一支宫花，敬事房的人最会看风向，当晚就把你的绿头牌往前挪了挪。",
      jinyanShenxing:
        "皇后问新人们住得惯不惯，旁人忙着诉苦讨巧，你只答“一切都好，谢娘娘挂念”。皇后说你稳重，赏了一匹缎子；消息传开，敬事房对碎玉轩也殷勤了几分。",
    },
  },
  taihouChuixun: {
    id: "taihouChuixun",
    kind: "opportunity",
    name: "太后垂询",
    emoji: "🪭",
    flavor: "寿康宫请你过去说说话。",
    reward: [{ resource: "qingyu", amount: 1 }],
    penalty: [],
    resolvedText: "清誉 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jinyanShenxing:
        "太后问你读过什么书，你答得谦逊稳妥，不卖弄一字。太后捻着佛珠，说这孩子沉静，是个有福气的。",
      meizhuangXiangzhu:
        "眉庄姐姐常往寿康宫抄经，早在太后跟前替你说了不少好话。这回她陪你一同前去，你们一唱一和，太后听得开怀，赏了你们一人一串佛珠。",
    },
  },
  wenTaiyiQingmai: {
    id: "wenTaiyiQingmai",
    kind: "opportunity",
    name: "太医请脉",
    emoji: "🩺",
    flavor: "太医照例前来请平安脉。",
    reward: [{ resource: "qingyu", amount: 1 }],
    penalty: [],
    resolvedText: "清誉 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi:
        "温实初细细诊过脉，开了一剂温补的方子，又低声嘱咐流朱几句饮食上的忌讳。他走后，宫人都说碎玉轩的小主身子调养得最好。",
    },
  },
  gongzhongLiuyan: {
    id: "gongzhongLiuyan",
    kind: "crisis",
    name: "蜚语盈廊",
    emoji: "🗣️",
    flavor: "各宫私下议论纷纷，矛头隐隐指向你。",
    reward: [],
    penalty: [],
    penaltyStatus: "liuyanChanshen",
    resolvedText: "移除事件，不产生负面状态",
    unresolvedText: "获得状态【流言缠身】",
    resolvedStory: {
      jinyanShenxing:
        "你闭门不出，见了谁都只说些天气花草。流言找不到新的把柄，传了几日便自己散了。",
      shoulongRenxin:
        "你让流朱带着银子在各宫走动，凡是嚼舌根的小宫女都得了赏，嘴自然就严了。那些闲话没了传的人，不出几日便无人再提。",
      meizhuangXiangzhu:
        "眉庄姐姐在各宫走动时替你分说清楚，又寻出了最先嚼舌根的那个宫女，交给管事姑姑处置。流言一夜之间便没了声息。",
    },
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
    resolvedStory: {
      shoulongRenxin:
        "你让小允子拿了银子去内务府打点，那管事太监掂了掂分量，当天下午份例便一样不少地送到了碎玉轩，还多添了两篓银炭。",
      meizhuangXiangzhu:
        "眉庄姐姐听说了，直接把自己宫里的份例分了一半送来，又请沈家托人递话敲打内务府。没过两日，你的份例便补齐了。",
    },
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
    resolvedStory: {
      yirongZhengsu:
        "你当即端正仪容、从容请罪，礼数周全得挑不出错处。皇后反倒夸你知错能改，那点差错也就没人再提。",
      wenTaiyiZhenzhi:
        "温实初替你出了一张脉案，说你那几日身子虚乏、头晕失神。众人这才知道你并非失礼，而是抱病强撑着来请安。",
    },
  },
  yuDayingZhengchong: {
    id: "yuDayingZhengchong",
    kind: "envy",
    name: "梅影争春",
    emoji: "🎶",
    flavor: "倚梅园里的歌声又响起来了，余答应想把皇上的心思拉回去。",
    reward: [],
    penalty: [{ resource: "shengchong", amount: -1 }],
    resolvedText: "移除事件",
    unresolvedText: "圣宠 -1",
    resolvedStory: {
      yirongZhengsu:
        "你精心妆扮，在皇上必经的路上赏花。皇上见了你，便忘了倚梅园的歌声，当晚翻了你的绿头牌。",
      shoulongRenxin:
        "你打点了敬事房的公公，余答应递去的话总是慢了半步。她连唱了几夜，皇上却一次也没去。",
    },
  },
  shichongErjiao: {
    id: "shichongErjiao",
    kind: "envy",
    name: "恃宠而骄",
    emoji: "💍",
    flavor: "得宠不过几日，各宫已在背后说你轻狂。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -2 }],
    resolvedText: "移除事件",
    unresolvedText: "清誉 -2",
    resolvedStory: {
      jinyanShenxing:
        "你把皇上的赏赐分送给各宫姐妹，见了谁都谦让三分。背后说你轻狂的人，渐渐也找不出话来。",
      meizhuangXiangzhu:
        "眉庄姐姐当着众人的面笑说：「妹妹得宠是她的福气，更是她的本分，倒叫你们眼红了。」又把你素日谦让的事一桩桩说给各宫听。说你轻狂的人，一时都讪讪地住了口。",
    },
  },
  anzhongXiaban: {
    id: "anzhongXiaban",
    kind: "envy",
    name: "暗中下绊",
    emoji: "🪤",
    flavor: "你明日赴宴要穿的那身宫装，夜里似乎被人动过。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -1 }],
    penaltyStatus: "shiyiMengxiu",
    resolvedText: "移除事件，不产生负面状态",
    unresolvedText: "清誉 -1、获得状态【失仪蒙羞】",
    resolvedStory: {
      meizhuangXiangzhu:
        "眉庄姐姐来碎玉轩说话，随手抖开你明日要穿的宫装，一眼看出腰身的缝线被人挑断了。她连夜叫自己宫里的绣娘缝好，又记下那晚进过衣房的人。你们心照不宣，暂且按下不发。",
      shoulongRenxin:
        "你赏了衣房的宫人几两银子，她们一五一十说出那晚谁进过衣房、谁碰过那身宫装。你连夜换了针线，又把这些名字都记在心里。",
    },
  },
};

export const OPPORTUNITY_POOL: readonly OpportunityId[] = [
  "huanghouShangshi",
  "huanghouShangshi",
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

export const ENVY_POOL: readonly EnvyId[] = ["yuDayingZhengchong", "shichongErjiao", "anzhongXiaban"];

/**
 * 嫉妒事件 trigger (design.md §7.4), checked at the start of each turn from `firstTurn` on: the first turn that starts
 * with 圣宠 ≥ minShengchong always triggers, then every `interval` turns while it stays ≥; a turn
 * starting below the threshold resets it.
 */
export const ENVY_TRIGGER = { firstTurn: 6, minShengchong: 5, interval: 2 };

// ---------------------------------------------------------------- statuses

export type StatusId = "liuyanChanshen" | "gongrenChuifeng" | "ermuLingtong" | "shiyiMengxiu";
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
  /** Resource change at the start of each turn the status applies to (宫人吹风). */
  readonly perTurn?: readonly ResourceDelta[];
  /** Story line logged when the status runs out on its own. */
  readonly endStory?: string;
  /** Cards that cannot be played while the status applies. */
  readonly blocksCards?: readonly CardId[];
  /** 机制文本 */
  readonly effectText: string;
  /** 剧情文本 (placeholder flavor) */
  readonly flavor: string;
  /** Where the status comes from. */
  readonly source: string;
};

export const STATUSES: Record<StatusId, StatusDef> = {
  liuyanChanshen: {
    id: "liuyanChanshen",
    name: "流言缠身",
    emoji: "🗯️",
    tag: "negative",
    duration: 3,
    drawModifier: -1,
    effectText: "未来 3 回合，每回合抓牌数 -1。多个实例分别计时、效果叠加。",
    flavor: "宫里的闲话越传越离谱，连走动见人都要多几分小心。",
    source: "回合末未处理的危机事件【蜚语盈廊】",
  },
  gongrenChuifeng: {
    id: "gongrenChuifeng",
    name: "宫人吹风",
    emoji: "🌬️",
    tag: "positive",
    duration: 2,
    drawModifier: 0,
    perTurn: [{ resource: "shengchong", amount: 1 }],
    endStory: "闲话终于传进了养心殿：余答应连字都认不全，除夕夜那句“逆风如解意”怎会是她念的？皇上心里已经明白，那夜的人不是她。",
    effectText: "未来 2 回合，每回合开始时圣宠 +1。",
    flavor: "得了赏的宫人们在各宫、御前有意无意地提起：那位余答应，连字都认不全呢。",
    source: "第 4 回合【逆风解意】时从手牌打出【收拢人心】（宫人透底）",
  },
  ermuLingtong: {
    id: "ermuLingtong",
    name: "耳目灵通",
    emoji: "👂",
    tag: "positive",
    duration: 2,
    drawModifier: 1,
    effectText: "未来 2 回合，每回合抓牌数 +1。多个实例分别计时、效果叠加。",
    flavor: "赏下去的银子换来了几双眼睛，各宫的动静渐渐传到你耳边。",
    source: "打出【收拢人心】",
  },
  shiyiMengxiu: {
    id: "shiyiMengxiu",
    name: "失仪蒙羞",
    emoji: "🧵",
    tag: "negative",
    duration: 4,
    drawModifier: -1,
    blocksCards: ["yirongZhengsu"],
    effectText: "未来 4 回合，不能打出【仪容整肃】，每回合抓牌数 -1。",
    flavor: "赴宴时宫装腰身当众绽开，满座哗然。之后好些日子你闭门少出，既没心思妆扮，各宫的消息也传得少了。",
    source: "回合末未处理的嫉妒事件【暗中下绊】",
  },
};

// ---------------------------------------------------------------- cards

export type CardId = "yirongZhengsu" | "jinyanShenxing" | "wenTaiyiZhenzhi" | "shoulongRenxin" | "jingguanQibian" | "meizhuangXiangzhu";

/** Design rule (design.md §4): a card's base effect gives at most +1 to ONE of 清誉 / 圣宠. */
export type CardDef = {
  readonly id: CardId;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly base: readonly ResourceDelta[];
  /** Base-effect card draw (静观其变). */
  readonly baseDraw: number;
  /** Status gained as part of the base effect (收拢人心). */
  readonly baseStatus?: StatusId;
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
    matches: ["huanghouShangshi", "liyiShiwu", "yuDayingZhengchong"],
    rulesText: ["圣宠 +1。"],
  },
  jinyanShenxing: {
    id: "jinyanShenxing",
    name: "谨言慎行",
    emoji: "🤐",
    flavor: "话到嘴边留三分。",
    base: [{ resource: "qingyu", amount: 1 }],
    baseDraw: 0,
    matches: ["huanghouShangshi", "taihouChuixun", "gongzhongLiuyan", "shichongErjiao"],
    rulesText: ["清誉 +1。"],
  },
  wenTaiyiZhenzhi: {
    id: "wenTaiyiZhenzhi",
    name: "温太医相助",
    emoji: "💊",
    flavor: "温实初的方子，总是最妥帖的。",
    base: [],
    baseDraw: 0,
    matches: ["wenTaiyiQingmai", "liyiShiwu"],
    rulesText: ["移除 1 个【负面】状态。"],
  },
  shoulongRenxin: {
    id: "shoulongRenxin",
    name: "收拢人心",
    emoji: "🤝",
    flavor: "赏下去的银子，总会换回些什么。",
    base: [],
    baseDraw: 0,
    baseStatus: "ermuLingtong",
    matches: ["gongzhongLiuyan", "neiwufuDiaonan", "yuDayingZhengchong", "anzhongXiaban"],
    rulesText: ["获得【耳目灵通】：未来 2 回合每回合抓牌 +1。", "联动：用它解决【内务府刁难】时，额外抽 1 张牌。"],
  },
  jingguanQibian: {
    id: "jingguanQibian",
    name: "静观其变",
    emoji: "🍵",
    flavor: "先按兵不动，看清局势。",
    base: [],
    baseDraw: 2,
    matches: [],
    rulesText: ["抽 2 张牌。", "本回合最多出牌数 +1（本身仍占用 1 次出牌；可叠加）。"],
  },
  meizhuangXiangzhu: {
    id: "meizhuangXiangzhu",
    name: "眉庄相助",
    emoji: "👭",
    flavor: "眉姐姐总会站在你这边。",
    base: [{ resource: "qingyu", amount: 1 }],
    baseDraw: 0,
    matches: ["taihouChuixun", "gongzhongLiuyan", "neiwufuDiaonan", "shichongErjiao", "anzhongXiaban"],
    rulesText: ["清誉 +1。", "联动：它解决的机会事件，事件奖励翻倍（自身基础效果不翻倍）。"],
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
  opportunity: "huanghouShangshi" as OpportunityId,
  crisis: "liyiShiwu" as CrisisId,
};

// ---------------------------------------------------------------- story events

export type StoryId = "yimeiYuan" | "xinghuaWeiyu";

export type StoryOptionDef = {
  readonly id: string;
  readonly name: string;
  /**
   * Card response: playing this card FROM HAND while the story is open resolves it with these
   * effects, on top of the card's own effects. Never a button on the event (design.md §9).
   */
  readonly card?: CardId;
  readonly effects: readonly ResourceDelta[];
  readonly gainStatus?: StatusId;
  /** Effect summary shown on the event and hand card. */
  readonly text: string;
  /** Story text written to the log when this option resolves the event. */
  readonly story: string;
  /** Hidden follow-up line logged after the effects (no mechanical effect). */
  readonly epilogue?: string;
  /** Short clause summarising this choice in the 第一关 victory recap. */
  readonly recap: string;
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
  yimeiYuan: {
    id: "yimeiYuan",
    turn: 4,
    name: "逆风解意",
    emoji: "❄️",
    flavor:
      "除夕夜你在倚梅园许愿，念了一句“逆风如解意，容易莫摧残”。如今宫里都在传，皇上寻到了那夜念诗的人，是宫女余莺儿，已被封为答应。",
    defaultOptionId: "yinrenBuyan",
    options: [
      {
        id: "yinrenBuyan",
        recap: "隐忍未言",
        name: "隐忍不言",
        effects: [{ resource: "shengchong", amount: -1 }],
        text: "圣宠 -1",
        story: "你攥紧了帕子，终究一字未提。余答应夜夜承宠，那句诗成了别人的恩典。",
      },
      {
        id: "dangzhongShuopo",
        recap: "当众说破却无凭无据",
        name: "当众说破",
        effects: [{ resource: "qingyu", amount: -1 }],
        text: "清誉 -1",
        story: "你说那夜念诗的是自己，可无凭无据。旁人只当你眼红新宠，背后议论你争风吃醋。",
      },
      {
        id: "jiemeiChafang",
        recap: "托眉庄姐姐查访留了后手",
        name: "姐妹查访",
        card: "meizhuangXiangzhu",
        effects: [{ resource: "qingyu", amount: 1 }],
        text: "清誉 +1",
        story: "眉庄姐姐悄悄查访倚梅园当夜当值的宫人，替你记下了几处破绽，只待时机。",
      },
      {
        id: "gongrenToudi",
        recap: "借宫人悄悄吹了风",
        name: "宫人透底",
        card: "shoulongRenxin",
        effects: [],
        gainStatus: "gongrenChuifeng",
        text: "获得【宫人吹风】：未来 2 回合每回合圣宠 +1",
        story: "倚梅园的小太监私下告诉你，余答应连字都认不全。你赏了他们银子，宫人们便在各宫、御前悄悄吹起风来。",
      },
    ],
  },
  xinghuaWeiyu: {
    id: "xinghuaWeiyu",
    turn: 8,
    name: "杏花微雨",
    emoji: "🌸",
    flavor: "杏花微雨，你在御花园散心，迎面遇见一位自称“果郡王”的男子，与你谈起诗词。他衣着素净，气度却不似寻常王爷。",
    defaultOptionId: "bixianGaotui",
    options: [
      {
        id: "bixianGaotui",
        recap: "守礼避嫌告退",
        name: "避嫌告退",
        effects: [{ resource: "shengchong", amount: -1 }],
        text: "圣宠 -1",
        story: "你规规矩矩福了一福便告退。后来才知道，那日的“王爷”正是皇上，他望着你的背影站了许久。",
      },
      {
        id: "yuWangyeChangtan",
        recap: "与王爷畅谈惹了闲话",
        name: "与王爷畅谈",
        effects: [{ resource: "qingyu", amount: -1 }],
        text: "清誉 -1",
        story: "你与“王爷”相谈甚欢。不知被谁瞧见了，宫里渐渐有了“小主私会外男”的闲话。",
      },
      {
        id: "yishiXianghe",
        recap: "以诗相和得了圣心",
        name: "以诗相和",
        card: "jinyanShenxing",
        effects: [{ resource: "shengchong", amount: 1 }, { resource: "qingyu", amount: 1 }],
        text: "圣宠 +1，清誉 +1",
        story: "你只以“王爷”相称，句句守礼，又以诗相和。皇上大为欣赏，回宫后便命人打听杏花树下的那位小主。",
        epilogue: "皇上听你念诗的声音，忽然认出你才是除夕夜倚梅园念“逆风如解意”的人。",
      },
      {
        id: "kanpoBushuopo",
        recap: "看破不说破，进退有度",
        name: "看破不说破",
        card: "jingguanQibian",
        effects: [{ resource: "qingyu", amount: 2 }],
        text: "清誉 +2",
        story: "你瞥见他腰间系着明黄络子，心中了然，却只当他是王爷，进退有度，半分不逾矩。",
      },
    ],
  },
};

// ---------------------------------------------------------------- tag explanations (click a tag → log)

export type TagId = "opportunity" | "crisis" | "envy" | "story" | "trial" | "trialCard" | "negative" | "positive";

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
  envy: {
    label: "嫉妒",
    lore: "树大招风，圣宠越盛，盯着你的眼睛就越多。",
    rules: "第 6 回合起，回合开始时圣宠 ≥ 5 才会出现：第一次达到时必定出现，之后只要每回合开始时圣宠仍 ≥ 5，就每隔一回合出现一次；某回合开始时圣宠 < 5 则重新计算。作为本回合的额外事件，打出匹配牌即可化解；未解决时回合末结算未处理效果后离场。",
  },
  story: {
    label: "剧情",
    lore: "命运的关口，在固定的日子里如约而至。",
    rules:
      "在固定回合出现，与普通事件同时存在。可以选择一个基础选项（不消耗出牌次数），或从手牌打出卡面所列的牌来解决（消耗 1 次出牌，结算剧情效果，该牌自身的效果也照常结算，并同时解决匹配的普通事件）。都不做就结束回合时，按默认选项处理。晋封考验也是剧情事件，但会持续多个回合，靠回合末达成条件来完成。",
  },
  trial: {
    label: "持续",
    lore: "这一批晋封的名单，就看这三日的表现。",
    rules: "晋封考验持续第 10—12 回合，“持续 X”表示包括本回合在内还剩 X 回合。每回合末判定：圣宠 ≥ 6、清誉 ≥ 5，且考验期间打出过仪容整肃或谨言慎行，即晋封为常在；第 12 回合末仍未满足则失败。",
  },
  trialCard: {
    label: "考验",
    lore: "仪容与言行，正是晋封时最看重的。",
    rules: "晋封考验期间（第 10—12 回合）打出这张牌，即满足考验的第 3 个条件。无论它用于解决什么事件都算。",
  },
  negative: {
    label: "负面",
    lore: "缠身的麻烦，一时半刻甩不掉。",
    rules: "持续性的不利状态。同名状态可以同时存在多个、分别计时。温太医相助可以移除 1 个负面状态。",
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

/** Campaign display name (picker, start menu, screen titles). */
export const CAMPAIGN_TITLE = "紫禁云深·甄嬛";

export const CHAPTER = {
  title: "第一关 · 初入宫闱",
  totalTurns: 15,
  startRank: "daying" as RankId,
  startQingyu: 2,
  startShengchong: 2,
};

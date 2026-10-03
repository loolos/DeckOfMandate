/**
 * 甄嬛传 · 第二关 content. Rules come from `../docs/design-stage2.md`; keep mechanic text in sync with it.
 * Card names, emoji and base flavor are shared with 第一关 (`./content`); everything that differs in
 * 第二关 (matches, 温太医 身子 bonus, 陵容相助, events, stories) lives here.
 */
import { CARDS as STAGE1_CARDS, RANKS, type RankId } from "./content";

export { RANKS, type RankId };

// ---------------------------------------------------------------- resources

/** 清誉 / 圣宠 are capped by rank; 身子 has its own fixed range; 恨意 is 华妃's meter. */
export type Resource2 = "qingyu" | "shengchong" | "shenzi" | "hate";

export const RESOURCE2_LABEL: Record<Resource2, string> = { qingyu: "清誉", shengchong: "圣宠", shenzi: "身子", hate: "恨意" };
export const RESOURCE2_EMOJI: Record<Resource2, string> = { qingyu: "🪷", shengchong: "👑", shenzi: "🌱", hate: "🔥" };

export type Delta2 = { readonly resource: Resource2; readonly amount: number };

export const SHENZI = { start: 2, max: 6, /** 喜脉概率 = 身子 ÷ divisor（≥ divisor 必定有孕） */ divisor: 5 };
export const HATE = { max: 10, fananResetTo: 6 };

export const STAGE2 = {
  title: "第二关 · 华妃跋扈",
  totalTurns: 30,
  startRank: "changzai" as RankId,
  /** 从主菜单单独开始第二关时的清誉 / 圣宠。 */
  standaloneQingyu: 8,
  standaloneShengchong: 8,
};

/** 贵人考验 (design-stage2.md §12.5). */
export const GUIREN_TRIAL = {
  name: "晋封考验：贵人",
  emoji: "🏮",
  flavor: "宫里要晋一批位分，皇上也问起了碎玉轩。能不能更进一步，就看这几日。",
  firstTurn: 5,
  lastTurn: 9,
  minShengchong: 9,
  minQingyu: 9,
  promoteTo: "guiren" as RankId,
};

/** 召幸 thresholds by rank (§10.1). No 召幸 before the 贵人考验 begins (第 5 回合). */
export const SUMMON_THRESHOLD: Partial<Record<RankId, number>> = { changzai: 6, guiren: 8, pin: 8 };

/** 召幸 interval by how far 圣宠 is above the threshold (§10.1). */
export function summonInterval(excess: number): number {
  if (excess >= 4) return 2;
  if (excess >= 2) return 3;
  return 4;
}

export const YUANMINGYUAN_TURNS = { first: 14, last: 16 };

// ---------------------------------------------------------------- 陵容关系

export type LingrongTier = "close" | "distant" | "resentful";

export const LINGRONG = { min: -4, max: 4, /** 冷落 never pushes below this. */ neglectFloor: -1 };

export const TIER_LABEL: Record<LingrongTier, string> = { close: "亲厚", distant: "生分", resentful: "怨怼" };
export const TIER_EMOJI: Record<LingrongTier, string> = { close: "🤝", distant: "😐", resentful: "🥀" };

export function lingrongTier(relation: number): LingrongTier {
  if (relation >= 2) return "close";
  if (relation <= -2) return "resentful";
  return "distant";
}

/** 舒痕胶有害概率 (§5.5). */
export const SHUHENJIAO_HARM_CHANCE: Record<LingrongTier, number> = { close: 0, distant: 0.3, resentful: 0.6 };

// ---------------------------------------------------------------- 罪证

export type EvidenceId =
  | "yuyingerYiyan"
  | "liuweiqingYaofang"
  | "fuziZhisi"
  | "maiguanYujue"
  | "kekouZhangce"
  | "lanyongSixing"
  | "duanfeiHonghua"
  | "caoguirenGaofa";

export type EvidenceDef = { readonly id: EvidenceId; readonly emoji: string; readonly name: string; readonly line: string; readonly ending: string };

export const EVIDENCE: Record<EvidenceId, EvidenceDef> = {
  yuyingerYiyan: {
    id: "yuyingerYiyan",
    emoji: "🥀",
    name: "余莺儿遗言",
    line: "余莺儿临死前说出，当初是华妃许她荣华，教她冒认倚梅园之功",
    ending: "冷宫里传出的余莺儿遗言，坐实了华妃当年李代桃僵的旧事。",
  },
  liuweiqingYaofang: {
    id: "liuweiqingYaofang",
    emoji: "💊",
    name: "刘畏卿药方",
    line: "华妃指使太医刘畏卿用药推迟月信，令眉庄假孕失宠",
    ending: "刘畏卿的药方一摆上御案，眉庄假孕一案便真相大白。",
  },
  fuziZhisi: {
    id: "fuziZhisi",
    emoji: "👻",
    name: "福子之死",
    line: "丽嫔惊梦，供出华妃害死宫女福子、沉尸井中",
    ending: "丽嫔疯疯癫癫的供词里，宫女福子的冤魂终于有了着落。",
  },
  maiguanYujue: {
    id: "maiguanYujue",
    emoji: "🗝️",
    name: "卖官鬻爵",
    line: "苏培盛透露，年羹尧在外卖官收贿，华妃在宫里替兄长打点",
    ending: "年家卖官鬻爵的账，一笔一笔都算到了翊坤宫头上。",
  },
  kekouZhangce: {
    id: "kekouZhangce",
    emoji: "📒",
    name: "克扣账册",
    line: "内务府的账册记下了华妃克扣各宫、尤其是存菊堂份例的明细",
    ending: "内务府的旧账册翻出来，各宫被克扣的份例一桩桩都有记档。",
  },
  lanyongSixing: {
    id: "lanyongSixing",
    emoji: "🩸",
    name: "滥用私刑",
    line: "宫人作证，华妃滥用一丈红，杖残夏冬春",
    ending: "当年目睹一丈红的宫人跪了一地，夏冬春的惨状再无人能替华妃遮掩。",
  },
  duanfeiHonghua: {
    id: "duanfeiHonghua",
    emoji: "🌸",
    name: "端妃红花",
    line: "端妃道出当年被华妃灌下红花、终身不能生育的旧怨",
    ending: "端妃抱病上殿，说出那碗红花的来历，满殿皆惊。",
  },
  caoguirenGaofa: {
    id: "caoguirenGaofa",
    emoji: "🍵",
    name: "曹贵人告发",
    line: "曹贵人为温宜计，倒戈告发华妃的种种罪状",
    ending: "最懂华妃的曹贵人反戈一击，桩桩件件说得清清楚楚。",
  },
};

export const EVIDENCE_THRESHOLDS = { narrowWin: 3, fullWin: 5 };

// ---------------------------------------------------------------- cards

export type CardId2 = "yirongZhengsu" | "jinyanShenxing" | "wenTaiyiZhenzhi" | "shoulongRenxin" | "jingguanQibian" | "meizhuangXiangzhu" | "lingrongXiangzhu";

export type CardDef2 = {
  readonly id: CardId2;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly base: readonly Delta2[];
  readonly baseDraw: number;
  readonly baseStatus?: StatusId2;
  /** Ordinary / 华妃 events this card resolves on its own. */
  readonly matches: readonly EventId2[];
  readonly rulesText: readonly string[];
};

function fromStage1(id: Exclude<CardId2, "lingrongXiangzhu">, overrides: Partial<CardDef2>): CardDef2 {
  const c = STAGE1_CARDS[id];
  return {
    id,
    name: c.name,
    emoji: c.emoji,
    flavor: c.flavor,
    base: c.base,
    baseDraw: c.baseDraw,
    baseStatus: c.baseStatus as StatusId2 | undefined,
    matches: [],
    rulesText: c.rulesText,
    ...overrides,
  };
}

export const CARDS2: Record<CardId2, CardDef2> = {
  yirongZhengsu: fromStage1("yirongZhengsu", { matches: ["huanghouShangshi", "liyiShiwu"] }),
  jinyanShenxing: fromStage1("jinyanShenxing", {
    matches: ["huanghouShangshi", "taihouChuixun", "baohuadianQifu", "gongzhongLiuyan", "yikungongLiGuiju"],
  }),
  wenTaiyiZhenzhi: fromStage1("wenTaiyiZhenzhi", {
    base: [{ resource: "shenzi", amount: 1 }],
    matches: ["jingxinTiaoyang", "liyiShiwu", "shanshiYouyi", "wenyiBaoyang"],
    rulesText: ["移除 1 个【负面】状态；身子 +1。"],
  }),
  shoulongRenxin: fromStage1("shoulongRenxin", {
    matches: ["supeishengToufeng", "liPinJingmeng", "wenyiBaoyang", "neiwufuDiaonan", "hanliangZhiwu", "kekouFenli", "shanshiYouyi"],
  }),
  jingguanQibian: fromStage1("jingguanQibian", { matches: ["jingxinTiaoyang", "hanliangZhiwu"] }),
  meizhuangXiangzhu: fromStage1("meizhuangXiangzhu", { matches: ["taihouChuixun", "gongzhongLiuyan", "neiwufuDiaonan"] }),
  lingrongXiangzhu: {
    id: "lingrongXiangzhu",
    name: "陵容相助",
    emoji: "🎶",
    flavor: "安妹妹总是轻声细语，叫人看不透她心里在想什么。",
    base: [],
    baseDraw: 0,
    matches: [
      "huanghouShangshi",
      "jingxinTiaoyang",
      "baohuadianQifu",
      "liPinJingmeng",
      "supeishengToufeng",
      "gongzhongLiuyan",
      "neiwufuDiaonan",
      "liyiShiwu",
      "kekouFenli",
      "huanyixiangZhuanchong",
    ],
    rulesText: ["本身没有效果；效果取决于与陵容的关系（亲厚 / 生分 / 怨怼）和所解决的事件。"],
  },
};

/** Cards that leave the deck when their 惜别 card is played (§6). */
export type DepartingCard = "meizhuangXiangzhu" | "wenTaiyiZhenzhi";

export const XIBIE: Record<DepartingCard, { effectName: string; rulesText: string; playStory: string; leaveStory: string; who: string }> = {
  meizhuangXiangzhu: {
    effectName: "临别相托",
    who: "眉庄",
    rulesText: "惜别：清誉 +2（解决机会事件时奖励照样翻倍）；获得【眉庄嘱托】。打出后，所有眉庄相助离场。",
    playStory: "存菊堂的宫门落锁前，眉庄隔着门缝塞给你一方帕子：“华妃不会就此罢手，你万事当心。”",
    leaveStory: "从此宫门深锁，眉庄再不出存菊堂一步。",
  },
  wenTaiyiZhenzhi: {
    effectName: "临行诊治",
    who: "温太医",
    rulesText: "惜别：移除全部可移除的负面状态；身子 +2；获得【温太医留方】。打出后，所有温太医相助离场。",
    playStory: "临去疫所前夜，温实初最后一次替你请脉，把一张方子压在了茶盏底下。",
    leaveStory: "疫所路远，从此只有书信偶尔递进宫来。",
  },
};

export const STAGE2_START_DECK: readonly CardId2[] = [
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

export const LINGRONG_COPIES = 3;

// ---------------------------------------------------------------- statuses

export type StatusId2 =
  | "liuyanChanshen"
  | "ermuLingtong"
  | "wochuangJingyang"
  | "meizhuangZhutuo"
  | "wentaiyiLiufang"
  | "shenhuaiLongyi";

export type StatusDef2 = {
  readonly id: StatusId2;
  readonly name: string;
  readonly emoji: string;
  readonly tag: "negative" | "positive";
  /** Turns of effect; ignored for `permanent` statuses. */
  readonly duration: number;
  /** Lasts until used / until the condition ends; never ticks down. */
  readonly permanent?: boolean;
  /** 温太医相助 cannot remove it. */
  readonly unremovable?: boolean;
  readonly drawModifier: number;
  /** Max cards per turn while it applies (卧床静养). */
  readonly playCap?: number;
  readonly effectText: string;
  readonly flavor: string;
  readonly source: string;
};

export const STATUSES2: Record<StatusId2, StatusDef2> = {
  liuyanChanshen: {
    id: "liuyanChanshen",
    name: "流言缠身",
    emoji: "🗯️",
    tag: "negative",
    duration: 3,
    drawModifier: -1,
    effectText: "未来 3 回合，每回合抓牌数 -1。多个实例分别计时、效果叠加。",
    flavor: "宫里的闲话越传越离谱，连走动见人都要多几分小心。",
    source: "回合末未处理的危机事件【宫中流言】",
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
  wochuangJingyang: {
    id: "wochuangJingyang",
    name: "卧床静养",
    emoji: "🛏️",
    tag: "negative",
    duration: 2,
    unremovable: true,
    drawModifier: 0,
    playCap: 1,
    effectText: "未来 2 回合，每回合最多打出 1 张牌（静观其变的出牌数 +1 与陵容的联袂仍然有效）；结束时身子恢复为 1。不可移除。",
    flavor: "身子已亏空到了极处，太医嘱咐须得卧床好生将养。",
    source: "身子降到 0",
  },
  meizhuangZhutuo: {
    id: "meizhuangZhutuo",
    name: "眉庄嘱托",
    emoji: "🛡️",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: "抵消一次华妃事件未化解的效果（含激怒的恨意 +1；出气的恨意 -1 照常生效）。触发后消失。",
    flavor: "眉庄塞来的那方帕子，你一直贴身收着。",
    source: "眉庄相助的惜别效果「临别相托」",
  },
  wentaiyiLiufang: {
    id: "wentaiyiLiufang",
    name: "温太医留方",
    emoji: "📜",
    tag: "positive",
    duration: 0,
    permanent: true,
    drawModifier: 0,
    effectText: "抵消一次伤胎类事件的后果（有孕前不扣身子；有孕后免于小产）；翊坤宫罚跪时不能阻止小产，但身子少扣 1。第一次适用时自动用掉。",
    flavor: "茶盏底下那张方子，字迹工整，每一味药都写了用量。",
    source: "温太医相助的惜别效果「临行诊治」",
  },
  shenhuaiLongyi: {
    id: "shenhuaiLongyi",
    name: "身怀龙裔",
    emoji: "👶",
    tag: "positive",
    duration: 0,
    permanent: true,
    unremovable: true,
    drawModifier: 0,
    effectText: "不再出现召幸；伤胎类事件未化解时直接小产；身子降到 0 时立即小产。持续到小产或关卡结束。",
    flavor: "太医跪地道喜：小主有喜了。",
    source: "喜脉",
  },
};

// ---------------------------------------------------------------- events

export type OpportunityId2 =
  | "huanghouShangshi"
  | "taihouChuixun"
  | "jingxinTiaoyang"
  | "baohuadianQifu"
  | "supeishengToufeng"
  | "liPinJingmeng"
  | "wenyiBaoyang";
export type CrisisId2 = "gongzhongLiuyan" | "neiwufuDiaonan" | "liyiShiwu" | "hanliangZhiwu";
export type HuafeiId = "yikungongLiGuiju" | "kekouFenli" | "shanshiYouyi" | "yizhangHong" | "huanyixiangZhuanchong";
export type EventId2 = OpportunityId2 | CrisisId2 | HuafeiId;
export type EventKind2 = "opportunity" | "crisis" | "huafei";

export const EVENT_KIND2_LABEL: Record<EventKind2, string> = { opportunity: "机会", crisis: "危机", huafei: "华妃" };

/** Two cards in the same turn resolve the event (§9.4). */
export type DoubleRule =
  | { readonly kind: "anyTwo"; readonly cards: readonly CardId2[] }
  | { readonly kind: "both"; readonly cards: readonly [CardId2, CardId2] };

export type EventDef2 = {
  readonly id: EventId2;
  readonly kind: EventKind2;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly reward: readonly Delta2[];
  readonly penalty: readonly Delta2[];
  readonly penaltyStatus?: StatusId2;
  /** 伤胎类 (§7.2). */
  readonly harmsPregnancy?: boolean;
  /** 激怒 (+1) / 出气 (-1) hate change when unresolved. */
  readonly unresolvedHate?: number;
  /** 延烧: unresolved once → stays for one more turn with `burnPenalty`. */
  readonly burnPenalty?: readonly Delta2[];
  /** Unresolved 欢宜香专宠 voids this turn's 召幸 and blocks it until resolved. */
  readonly blocksSummon?: boolean;
  readonly double?: DoubleRule;
  /** 华妃事件 unlock threshold. */
  readonly unlockHate?: number;
  /** Evidence and which cards earn it. For double events: any of the cards in the pair. */
  readonly evidence?: { readonly id: EvidenceId; readonly cards: readonly CardId2[] };
  readonly resolvedText: string;
  readonly unresolvedText: string;
  readonly resolvedStory: Partial<Record<CardId2, string>>;
  /** Rule note shown on the card. */
  readonly note?: string;
};

export const EVENTS2: Record<EventId2, EventDef2> = {
  huanghouShangshi: {
    id: "huanghouShangshi",
    kind: "opportunity",
    name: "皇后赏识",
    emoji: "🏮",
    flavor: "景仁宫晨省，皇后娘娘当着众人的面问起碎玉轩近来可好。",
    reward: [{ resource: "shengchong", amount: 1 }],
    penalty: [],
    resolvedText: "圣宠 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      yirongZhengsu: "你衣饰得体、进退有度，皇后赏了一对玉镯，又在皇上跟前提了你一句。",
      jinyanShenxing: "皇后问起宫务，你答得周全又不逾矩。皇后笑着说你懂事，把这话带去了养心殿。",
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
      jinyanShenxing: "太后问你读过什么书，你答得谦逊稳妥。太后捻着佛珠，说这孩子沉静。",
      meizhuangXiangzhu: "眉庄姐姐陪你一同前去，你们一唱一和，太后听得开怀，赏了你们一人一串佛珠。",
    },
  },
  jingxinTiaoyang: {
    id: "jingxinTiaoyang",
    kind: "opportunity",
    name: "静心调养",
    emoji: "🌿",
    flavor: "近来劳神，槿汐劝你闭门几日，好好养一养身子。",
    reward: [
      { resource: "qingyu", amount: 1 },
      { resource: "shenzi", amount: 1 },
    ],
    penalty: [],
    resolvedText: "清誉 +1、身子 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jingguanQibian: "你闭门焚香，抄了几卷经。外头的风风雨雨一概不理，气色倒一日好过一日。",
      wenTaiyiZhenzhi: "温实初开了一剂温补的方子，嘱咐你按时服用。几日下来，手脚都暖和了。",
    },
  },
  baohuadianQifu: {
    id: "baohuadianQifu",
    kind: "opportunity",
    name: "宝华殿祈福",
    emoji: "🙏",
    flavor: "宝华殿做法事，各宫小主都去上香祈福。",
    reward: [
      { resource: "qingyu", amount: 1 },
      { resource: "shenzi", amount: 1 },
    ],
    penalty: [],
    resolvedText: "清誉 +1、身子 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jinyanShenxing: "你跪在佛前，心中默念的不过是家人平安、自身康健。太后听说你虔诚，夸了一句。",
    },
  },
  supeishengToufeng: {
    id: "supeishengToufeng",
    kind: "opportunity",
    name: "苏培盛透风",
    emoji: "🗝️",
    flavor: "槿汐与御前的苏公公是旧识，这日回来，神色有些异样。",
    reward: [],
    penalty: [],
    evidence: { id: "maiguanYujue", cards: ["shoulongRenxin", "lingrongXiangzhu"] },
    resolvedText: "得到罪证【卖官鬻爵】",
    unresolvedText: "无额外效果，事件消失（之后还会出现）",
    resolvedStory: {
      shoulongRenxin: "你让槿汐备了厚礼去谢苏公公。他私下说了一句：年大将军在外头卖官，翊坤宫那位也没少替兄长打点。",
    },
  },
  liPinJingmeng: {
    id: "liPinJingmeng",
    kind: "opportunity",
    name: "丽嫔惊梦",
    emoji: "👻",
    flavor: "丽嫔近来夜夜惊梦，口中总念着一个叫福子的宫女。",
    reward: [],
    penalty: [],
    evidence: { id: "fuziZhisi", cards: ["shoulongRenxin", "lingrongXiangzhu"] },
    resolvedText: "得到罪证【福子之死】",
    unresolvedText: "无额外效果，事件消失（之后还会出现）",
    resolvedStory: {
      shoulongRenxin: "你让小允子扮作福子在丽嫔窗下哭了半宿。丽嫔吓得魂飞魄散，把华妃怎样害死福子的事全说了出来。",
    },
  },
  wenyiBaoyang: {
    id: "wenyiBaoyang",
    kind: "opportunity",
    name: "温宜抱恙",
    emoji: "🤒",
    flavor: "温宜公主夜里发热不退，曹贵人急得团团转，却不敢声张。",
    reward: [{ resource: "hate", amount: -2 }],
    penalty: [],
    resolvedText: "恨意 -2；曹贵人欠下人情（第 24 回合可得罪证【曹贵人告发】）",
    unresolvedText: "无额外效果，事件消失（之后还会出现）",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初连夜进宫，几服药下去公主便退了热。曹贵人抱着女儿，对你深深一拜。",
      shoulongRenxin: "你托人悄悄请来民间的名医，又替曹贵人瞒住了消息。公主好转，曹贵人记下了这份情。",
    },
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
    resolvedStory: {
      jinyanShenxing: "你闭门不出，见了谁都只说些天气花草。流言找不到新的把柄，几日便散了。",
      meizhuangXiangzhu: "眉庄姐姐在各宫走动时替你分说清楚，又寻出了嚼舌根的宫女。流言一夜之间没了声息。",
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
    note: "用收拢人心解决时额外抽 1 张。",
    resolvedStory: {
      shoulongRenxin: "小允子拿了银子去内务府打点，当天下午份例便一样不少地送到了碎玉轩。",
      meizhuangXiangzhu: "眉庄姐姐把自己宫里的份例分了一半送来，又托人敲打内务府，没过两日便补齐了。",
    },
  },
  liyiShiwu: {
    id: "liyiShiwu",
    kind: "crisis",
    name: "礼仪失误",
    emoji: "🎎",
    flavor: "请安时脚下一滑跌了一跤，手上擦破了皮，失了仪态。",
    reward: [],
    penalty: [
      { resource: "qingyu", amount: -1 },
      { resource: "shengchong", amount: -1 },
    ],
    resolvedText: "移除事件",
    unresolvedText: "清誉 -1、圣宠 -1",
    note: "用陵容相助解决时，她会送来舒痕胶（🧴）。",
    resolvedStory: {
      yirongZhengsu: "你当即整好衣饰、从容请罪，礼数周全得挑不出错处，那点狼狈也就没人再提。",
      wenTaiyiZhenzhi: "温实初替你出了一张脉案，说你那几日头晕乏力。众人这才知道你是抱病强撑。",
    },
  },
  hanliangZhiwu: {
    id: "hanliangZhiwu",
    kind: "crisis",
    name: "寒凉之物",
    emoji: "🧊",
    flavor: "宫人送来一碗冰镇的果子，说是各宫都有。",
    reward: [],
    penalty: [],
    harmsPregnancy: true,
    resolvedText: "移除事件",
    unresolvedText: "伤胎：有孕前身子 -1；有孕后直接小产",
    resolvedStory: {
      shoulongRenxin: "你打赏了送东西的宫人，顺口一问，才知道这碗冰果是特意给碎玉轩备的。你原封不动地退了回去。",
      jingguanQibian: "你只看了一眼便叫人撤下，说近来脾胃虚寒，碰不得凉的。",
    },
  },
  yikungongLiGuiju: {
    id: "yikungongLiGuiju",
    kind: "huafei",
    name: "翊坤宫立规矩",
    emoji: "🏯",
    flavor: "请安时华妃当众挑你的错处，满殿的人都等着看你如何应对。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -1 }],
    unresolvedHate: 1,
    unlockHate: 3,
    resolvedText: "移除事件",
    unresolvedText: "清誉 -1；激怒：恨意 +1",
    resolvedStory: {
      jinyanShenxing: "你垂首听训，一句不辩，末了只说“娘娘教训得是”。华妃挑不出错，只得作罢。",
    },
  },
  kekouFenli: {
    id: "kekouFenli",
    kind: "huafei",
    name: "克扣份例",
    emoji: "🍚",
    flavor: "内务府看着翊坤宫的脸色，碎玉轩的炭火、吃食一日比一日少。",
    reward: [],
    penalty: [{ resource: "shengchong", amount: -1 }],
    burnPenalty: [{ resource: "shengchong", amount: -2 }],
    unlockHate: 3,
    evidence: { id: "kekouZhangce", cards: ["shoulongRenxin"] },
    resolvedText: "移除事件（用收拢人心化解可得罪证【克扣账册】）",
    unresolvedText: "延烧：圣宠 -1，事件留到下回合；下回合仍未化解：圣宠 -2 后离场",
    resolvedStory: {
      shoulongRenxin: "你让小允子拿银子去内务府，顺手抄出了一本账册：各宫被克扣的份例，笔笔都记着翊坤宫的吩咐。",
    },
  },
  shanshiYouyi: {
    id: "shanshiYouyi",
    kind: "huafei",
    name: "膳食有异",
    emoji: "🍲",
    flavor: "御膳房送来的汤水，闻着与往日不大一样。",
    reward: [],
    penalty: [],
    harmsPregnancy: true,
    unlockHate: 5,
    resolvedText: "移除事件",
    unresolvedText: "伤胎：有孕前身子 -1；有孕后直接小产",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初验过汤水，脸色一沉：里头加了活血的东西。你命人倒掉，不动声色。",
      shoulongRenxin: "御膳房里收过你赏钱的小太监悄悄递话：今日的汤，别喝。",
    },
  },
  yizhangHong: {
    id: "yizhangHong",
    kind: "huafei",
    name: "一丈红",
    emoji: "🩸",
    flavor: "华妃又要拿人立威，这回被拖到翊坤宫外的，是你宫里的人。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -2 }],
    unresolvedHate: -1,
    unlockHate: 5,
    double: { kind: "anyTwo", cards: ["jinyanShenxing", "yirongZhengsu", "shoulongRenxin"] },
    evidence: { id: "lanyongSixing", cards: ["shoulongRenxin"] },
    resolvedText: "移除事件（两张中含收拢人心：得罪证【滥用私刑】）",
    unresolvedText: "清誉 -2；出气：恨意 -1",
    note: "双牌：同一回合打出谨言慎行、仪容整肃、收拢人心中任意 2 张。",
    resolvedStory: {
      jinyanShenxing: "你跪在翊坤宫外替宫人求情，句句恭顺，华妃寻不到再发作的由头。",
      yirongZhengsu: "你衣冠整齐地赶来，当众请罪，把罪责都揽在自己身上。",
      shoulongRenxin: "平日受过你恩惠的宫人一个个站出来作证，一丈红终究没有落下。",
    },
  },
  huanyixiangZhuanchong: {
    id: "huanyixiangZhuanchong",
    kind: "huafei",
    name: "欢宜香专宠",
    emoji: "🌺",
    flavor: "皇上连日宿在翊坤宫，满宫都闻得见欢宜香的味道。",
    reward: [],
    penalty: [{ resource: "shengchong", amount: -1 }],
    unresolvedHate: -1,
    blocksSummon: true,
    unlockHate: 7,
    double: { kind: "both", cards: ["yirongZhengsu", "jingguanQibian"] },
    resolvedText: "移除事件；召幸恢复可处理",
    unresolvedText: "本回合召幸作废、圣宠 -1；出气：恨意 -1",
    note: "陵容相助单张，或同一回合打出仪容整肃 + 静观其变。在场时召幸不能处理。",
    resolvedStory: {
      yirongZhengsu: "你盛装在御花园赏花，又沉得住气不争不抢。皇上终于想起了碎玉轩。",
      jingguanQibian: "你沉得住气，不争不抢，只在皇上必经的路上赏花。皇上终于想起了碎玉轩。",
    },
  },
};

export const OPPORTUNITY2_POOL: readonly OpportunityId2[] = [
  "huanghouShangshi",
  "huanghouShangshi",
  "taihouChuixun",
  "taihouChuixun",
  "jingxinTiaoyang",
  "jingxinTiaoyang",
  "baohuadianQifu",
  "baohuadianQifu",
  "supeishengToufeng",
];

export const CRISIS2_POOL: readonly CrisisId2[] = [
  "gongzhongLiuyan",
  "gongzhongLiuyan",
  "neiwufuDiaonan",
  "neiwufuDiaonan",
  "liyiShiwu",
  "liyiShiwu",
  "hanliangZhiwu",
  "hanliangZhiwu",
];

export const HUAFEI_EVENTS: readonly HuafeiId[] = ["yikungongLiGuiju", "kekouFenli", "shanshiYouyi", "yizhangHong", "huanyixiangZhuanchong"];

/** How many 华妃 events a turn draws at this (turn-start) hate: [guaranteed, extra chance]. */
export function huafeiDrawPlan(hate: number): { fixed: number; chance: number } {
  if (hate >= 9) return { fixed: 2, chance: 0 };
  if (hate >= 7) return { fixed: 1, chance: 0.5 };
  if (hate >= 5) return { fixed: 1, chance: 0 };
  if (hate >= 3) return { fixed: 0, chance: 0.5 };
  return { fixed: 0, chance: 0 };
}

export function hateTierLabel(hate: number): string {
  if (hate >= 9) return "🔥 欲除之";
  if (hate >= 6) return "😠 记恨";
  if (hate >= 3) return "😒 侧目";
  return "😌 不屑";
}

// ---------------------------------------------------------------- 陵容 per-event outcomes (§5.4)

export type LingrongOutcome = {
  /** false = 失效: the card is spent but the event stays unresolved. */
  readonly resolves: boolean;
  /** Opportunity: replaces the reward. Crisis / 华妃: extra effects applied on resolve (or on 失效). */
  readonly effects?: readonly Delta2[];
  readonly relation?: number;
  readonly extraDraw?: number;
  readonly evidence?: boolean;
  readonly shuhenjiao?: boolean;
  /** 宫中流言 怨怼: two 流言缠身 at end of turn. */
  readonly aggravate?: boolean;
  readonly story: string;
};

type TierTable = Record<LingrongTier, LingrongOutcome>;

export const LINGRONG_EVENT: Partial<Record<EventId2, TierTable>> = {
  huanghouShangshi: {
    close: { resolves: true, effects: [{ resource: "shengchong", amount: 1 }], relation: 1, story: "陵容陪你一同去景仁宫，皇后见你们姐妹和睦，赏了你一对玉镯。" },
    distant: { resolves: true, effects: [], relation: 1, story: "赏赐全落在了陵容身上。「姐姐如今是皇后跟前的红人了。」她笑着说。" },
    resentful: { resolves: false, relation: 1, story: "皇后的赏赐落到了陵容头上。她从景仁宫出来，再没往碎玉轩看一眼。" },
  },
  jingxinTiaoyang: {
    close: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容亲手制了安神香送来，你一夜好眠。" },
    distant: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容送来安神香。「这香方子金贵，姐姐省着些用。」" },
    resentful: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容送来的安神香气味清冽，你倒也睡得安稳。" },
  },
  baohuadianQifu: {
    close: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], relation: 1, story: "你与陵容并肩跪在佛前，她替你多磕了三个头。" },
    distant: { resolves: true, effects: [{ resource: "shenzi", amount: 1 }], relation: 1, story: "「姐姐求子心切，妹妹自然陪着。」陵容陪你上了一炷香。" },
    resentful: { resolves: true, effects: [], relation: 1, story: "佛前青烟袅袅，陵容一言不发，临走时却替你掸了掸衣上的香灰。" },
  },
  liPinJingmeng: {
    close: { resolves: true, evidence: true, relation: 1, story: "陵容学着福子的声音在丽嫔窗下哭了半宿。丽嫔吓破了胆，把华妃害死福子的事全说了。" },
    distant: { resolves: true, evidence: true, story: "陵容肯帮这个忙，却撇嘴道：「这种装神弄鬼的事，也只有姐姐想得出来。」丽嫔终究吐了实话。" },
    resentful: { resolves: false, relation: 1, effects: [{ resource: "hate", amount: 1 }], story: "消息不知怎么走漏到了翊坤宫，丽嫔那边一下子没了动静。" },
  },
  supeishengToufeng: {
    close: { resolves: true, evidence: true, story: "陵容在御前唱曲时留了心，回来把听见的话一五一十告诉了你：年家在外头卖官。" },
    distant: { resolves: true, evidence: true, story: "「姐姐身边的人，倒是什么都打听得到。」陵容替你把话递到了，苏公公终于松了口。" },
    resentful: { resolves: false, relation: 1, effects: [{ resource: "hate", amount: 1 }], story: "陵容把你打听年家的事透给了别人，翊坤宫那边立刻警觉起来。" },
  },
  gongzhongLiuyan: {
    close: { resolves: true, relation: 1, story: "陵容在各宫替你辟谣：「姐姐的为人，我最清楚。」" },
    distant: { resolves: true, relation: 1, story: "「姐姐何必在意这些闲话，清者自清嘛。」陵容嘴上这么说，倒也替你分辩了几句。" },
    resentful: { resolves: false, relation: 1, aggravate: true, story: "陵容在别人跟前添油加醋，流言越传越凶。" },
  },
  neiwufuDiaonan: {
    close: { resolves: true, extraDraw: 1, story: "陵容出身寒微，最懂怎么跟内务府打交道，没两日便替你把份例要了回来。" },
    distant: { resolves: true, story: "「妹妹出身寒微，跟奴才们打交道倒是在行。」份例总算补齐了。" },
    resentful: { resolves: true, effects: [{ resource: "shengchong", amount: -1 }], story: "陵容出面去要份例，却把事情闹得人尽皆知，倒显得你斤斤计较。" },
  },
  liyiShiwu: {
    close: { resolves: true, shuhenjiao: true, story: "陵容扶你起来，替你整好衣裳，又说回头送药来。" },
    distant: { resolves: true, shuhenjiao: true, story: "「姐姐素来最重仪态，这回可要仔细些。」陵容替你遮掩过去，说回头送药来。" },
    resentful: { resolves: true, shuhenjiao: true, story: "陵容上前替你圆了场，低头时嘴角却像是笑了一下。她说回头送药来。" },
  },
  kekouFenli: {
    close: { resolves: true, relation: 1, story: "陵容把自己的份例分了一半送来：「姐姐别嫌弃。」" },
    distant: { resolves: true, story: "「我一个答应的份例，哪比得上姐姐的。」陵容嘴上这么说，还是送了些炭来。" },
    resentful: { resolves: false, relation: 1, story: "陵容推说自己也不够用，一样东西也没送来。" },
  },
  huanyixiangZhuanchong: {
    close: { resolves: true, story: "陵容在御花园唱曲，把皇上从翊坤宫引了过来，又借故走开，留你陪驾。" },
    distant: { resolves: true, story: "陵容的歌声把皇上引了过来。「姐姐这回可欠妹妹一个人情。」" },
    resentful: { resolves: false, relation: 1, effects: [{ resource: "shengchong", amount: -2 }], story: "陵容趁机自己去御前献唱，皇上当晚留在了她那里。" },
  },
};

/** 怨怼 陵容 played without matching anything (§5.3). */
export const LINGRONG_BACKLASH: readonly Delta2[] = [{ resource: "shengchong", amount: -1 }];

export const LINGRONG_NEGLECT_TEXT = {
  drop: "陵容在廊下等了半日，终究没等到姐姐召她，悻悻回了宫。",
  floor: "陵容又白等了一日，眼里的光淡了些。",
};

export const SHUHENJIAO_TEXT = {
  close: "陵容亲手替你上药，药膏清凉，伤处好得很快。",
  safe: "药膏清凉，伤处好得很快。",
  harm: "药膏香气浓得有些异样，你只当是好药。",
};

// ---------------------------------------------------------------- stories

export type StoryId2 =
  | "chuQingan"
  | "lingrongTuihui"
  | "yuyingerShishi"
  | "jiaYunFengbo"
  | "yuanmingyuan"
  | "fakuiPlain"
  | "fakuiPregnant"
  | "duanfeiJiushi"
  | "zhaoxing"
  | "caoGuirenLaifang"
  | "huafeiFanan";

export type StoryOption2 = {
  readonly id: string;
  readonly name: string;
  /** Card response: played from hand. */
  readonly card?: CardId2;
  /** Not shown as a button (召幸's 错过). */
  readonly hidden?: boolean;
  readonly effects: readonly Delta2[];
  readonly text: string;
  readonly story: string;
  readonly setHate?: number;
  readonly setRelation?: number;
  readonly relation?: number;
  readonly evidence?: EvidenceId;
  readonly exit?: DepartingCard;
  readonly pregnancy?: boolean;
  readonly summon?: "success" | "avoid";
  readonly caoBefriend?: boolean;
  /** 翊坤宫罚跪（有孕）: body loss for this option (before 恨意 / 留方 adjustments). */
  readonly fakuiShenzi?: number;
  /** 生分的陵容打出这个卡牌应对时多说的一句风凉话。 */
  readonly distantRemark?: string;
  readonly shuhenjiao?: boolean;
};

export type StoryDef2 = {
  readonly id: StoryId2;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly defaultOptionId: string;
  readonly options: readonly StoryOption2[];
  /** Rule line shown under the flavor. */
  readonly note?: string;
};

export const FIXED_STORY_TURNS: Partial<Record<number, StoryId2>> = {
  3: "chuQingan",
  2: "lingrongTuihui",
  4: "yuyingerShishi",
  8: "jiaYunFengbo",
  14: "yuanmingyuan",
  20: "duanfeiJiushi",
};
export const FAKUI_TURN = 17;

export const STORIES2: Record<StoryId2, StoryDef2> = {
  chuQingan: {
    id: "chuQingan",
    name: "翊坤宫初请安",
    emoji: "🏯",
    flavor: "新人初到翊坤宫请安，华妃斜倚在榻上，有意给个下马威。",
    note: "你的应对决定华妃恨意的初始值。恭顺低头、出言顶撞须打出特定手牌。",
    defaultOptionId: "bubeiBukang",
    options: [
      {
        id: "bubeiBukang",
        name: "不卑不亢",
        effects: [],
        setHate: 2,
        text: "恨意初值 2",
        story: "你行礼如仪，答话有分寸。华妃挑了挑眉，没再说什么。",
      },
      {
        id: "gongshun",
        name: "恭顺低头",
        card: "jinyanShenxing",
        effects: [{ resource: "qingyu", amount: 1 }],
        setHate: 1,
        text: "恨意初值 1；清誉 +1",
        story: "你低眉顺眼，任华妃冷嘲热讽也不失礼数。华妃懒得再看你，皇后听说了，倒夸你识大体。",
      },
      {
        id: "chuyanDingzhuang",
        name: "出言顶撞",
        card: "meizhuangXiangzhu",
        effects: [{ resource: "qingyu", amount: 1 }],
        setHate: 3,
        text: "恨意初值 3；清誉 +1",
        story: "眉庄在旁帮腔，你据理回了一句，满殿寂静。华妃笑了，那笑意却冷得叫人发寒。",
      },
    ],
  },
  lingrongTuihui: {
    id: "lingrongTuihui",
    name: "陵容侍寝被退回",
    emoji: "🌙",
    flavor: "安陵容第一次侍寝时战战兢兢，没侍成寝就被原样抬回了宫，成了阖宫的笑柄。",
    note: "你的处理决定陵容最初对你的态度。本回合结束时，3 张【陵容相助】洗入抽牌堆。",
    defaultOptionId: "bixianBuwen",
    options: [
      { id: "bixianBuwen", name: "避嫌不问", effects: [], setRelation: -1, text: "陵容关系 -1", story: "宫里人人都在笑她，你没有露面。" },
      {
        id: "dengmenKuanwei",
        name: "登门宽慰",
        effects: [{ resource: "shengchong", amount: -1 }],
        setRelation: 2,
        text: "陵容关系 +2；圣宠 -1",
        story: "你亲自去看她，陪她说了好一会儿话，却被华妃宫里的人瞧见了。",
      },
      {
        id: "jiemeiTongqu",
        name: "姐妹同去",
        card: "meizhuangXiangzhu",
        effects: [{ resource: "qingyu", amount: 1 }],
        setRelation: 3,
        text: "陵容关系 +3；清誉 +1",
        story: "你和眉庄一起陪她说了半夜的话，三个人的手握在一处。",
      },
      {
        id: "jiaotaGuiju",
        name: "教她规矩",
        card: "jinyanShenxing",
        effects: [{ resource: "qingyu", amount: 1 }],
        setRelation: 2,
        text: "陵容关系 +2；清誉 +1",
        story: "你细细教她侍寝时的规矩，劝她宽心。",
      },
      {
        id: "zengtaYishi",
        name: "赠她衣饰",
        card: "yirongZhengsu",
        effects: [{ resource: "shengchong", amount: 1 }],
        setRelation: 0,
        text: "陵容关系 0；圣宠 +1",
        story: "你把自己的衣裳首饰送给她。她低头道谢，心里却更自卑了。",
      },
      {
        id: "dadianJingshifang",
        name: "打点敬事房",
        card: "shoulongRenxin",
        effects: [],
        setRelation: 1,
        text: "陵容关系 +1",
        story: "你托人打点敬事房，让她下次侍寝顺顺当当。",
      },
    ],
  },
  yuyingerShishi: {
    id: "yuyingerShishi",
    name: "余莺儿失势",
    emoji: "🥀",
    flavor: "冒认倚梅园之功的余莺儿恃宠犯上，获罪下狱。",
    defaultOptionId: "bujiu",
    options: [
      { id: "bujiu", name: "不救", effects: [{ resource: "qingyu", amount: -1 }], text: "清誉 -1", story: "你没有替她说一句话。旁人说你心狠。" },
      { id: "qiuqing", name: "求情", effects: [{ resource: "shengchong", amount: -1 }], text: "圣宠 -1", story: "你替她求了情，皇上皱眉，说你太过心软。" },
      {
        id: "yuzhongTanshi",
        name: "狱中探视",
        card: "shoulongRenxin",
        effects: [],
        evidence: "yuyingerYiyan",
        text: "得到罪证【余莺儿遗言】",
        story: "你打点狱卒，见了余莺儿最后一面。她惨笑着说，当初是华妃许她荣华，教她冒认倚梅园之功。",
      },
    ],
  },
  jiaYunFengbo: {
    id: "jiaYunFengbo",
    name: "假孕风波",
    emoji: "⚖️",
    flavor: "眉庄有孕本是喜事，却是华妃串通太医刘畏卿设下的局：药物推迟月信，宫女茯苓被收买。",
    note: "眉庄与温太医，终究要有一人离你远去。退场一方的牌会带上【惜别】标签。",
    defaultOptionId: "xiushouPangguan",
    options: [
      {
        id: "xiushouPangguan",
        name: "袖手旁观",
        effects: [],
        exit: "meizhuangXiangzhu",
        text: "眉庄退场",
        story: "眉庄假孕被当众揭穿，降位禁足于存菊堂。",
      },
      {
        id: "chumianLibao",
        name: "出面力保",
        effects: [{ resource: "hate", amount: 1 }],
        exit: "wenTaiyiZhenzhi",
        text: "温太医退场；恨意 +1",
        story: "你请温太医出面替眉庄说话，眉庄保住了，温实初却被华妃反咬“妄议脉案”，又逢时疫，被派往疫所。",
      },
      {
        id: "chayanYaofang",
        name: "查验药方",
        card: "wenTaiyiZhenzhi",
        effects: [],
        exit: "wenTaiyiZhenzhi",
        evidence: "liuweiqingYaofang",
        text: "温太医退场；得到罪证【刘畏卿药方】",
        story: "温实初查出了刘畏卿的药方，眉庄得以洗清，他自己却因此被反咬，派往疫所。",
      },
      {
        id: "maitongFuling",
        name: "买通茯苓",
        card: "shoulongRenxin",
        effects: [],
        exit: "meizhuangXiangzhu",
        evidence: "liuweiqingYaofang",
        text: "眉庄退场；得到罪证【刘畏卿药方】",
        story: "眉庄的假孕仍被当众揭穿，但被你买通的茯苓供出了刘畏卿。",
      },
    ],
  },
  yuanmingyuan: {
    id: "yuanmingyuan",
    name: "随驾圆明园",
    emoji: "🏞️",
    flavor: "皇上带你住进圆明园碧桐书院，恩宠一时无两。",
    note: "结算后恨意 +2；第 14—16 回合每回合都出现召幸（有孕后不再出现）；3 回合后翊坤宫罚跪。",
    defaultOptionId: "anfenSuishi",
    options: [
      { id: "anfenSuishi", name: "安分随侍", effects: [{ resource: "hate", amount: 2 }], text: "恨意 +2", story: "你安分随侍，不争不抢。" },
      {
        id: "yuexiaXiangban",
        name: "月下相伴",
        card: "yirongZhengsu",
        effects: [{ resource: "hate", amount: 2 }],
        pregnancy: true,
        text: "必定有孕；恨意 +2",
        story: "月下荷风，你盛装相伴。不多时，太医便诊出了喜脉。",
      },
      {
        id: "qinshiXianghe",
        name: "琴诗相和",
        card: "jinyanShenxing",
        effects: [{ resource: "hate", amount: 2 }],
        pregnancy: true,
        text: "必定有孕；恨意 +2",
        story: "你抚琴，他吟诗，碧桐书院里夜夜笙歌。不多时，太医便诊出了喜脉。",
      },
    ],
  },
  fakuiPlain: {
    id: "fakuiPlain",
    name: "翊坤宫罚跪",
    emoji: "☀️",
    flavor: "华妃借故罚你跪于翊坤宫外的烈日下。",
    note: "罚跪开始时恨意 ≥ 6，清誉再 -1。",
    defaultOptionId: "lingfa",
    options: [
      {
        id: "lingfa",
        name: "领罚",
        effects: [{ resource: "shenzi", amount: -1 }, { resource: "qingyu", amount: -1 }],
        text: "身子 -1、清誉 -1",
        story: "你在烈日下跪了整整两个时辰，回宫时膝上已是一片青紫。",
      },
      {
        id: "lingrongSongyao",
        name: "陵容送药",
        card: "lingrongXiangzhu",
        effects: [{ resource: "qingyu", amount: -1 }],
        shuhenjiao: true,
        distantRemark: "「跪了这半日，姐姐何苦与华妃硬碰。」",
        text: "清誉 -1（免去身子 -1）；舒痕胶",
        story: "陵容连夜送来舒痕胶替你敷上，说擦了便不会落疤。",
      },
    ],
  },
  fakuiPregnant: {
    id: "fakuiPregnant",
    name: "翊坤宫罚跪",
    emoji: "☀️",
    flavor: "华妃借故罚你跪于翊坤宫外的烈日下。你腹中隐隐作痛。",
    note: "有孕时必定小产（温太医留方也挡不住）；所选的牌决定身子伤得多重。罚跪开始时恨意 ≥ 6，身子再 -1；有温太医留方，身子少扣 1。",
    defaultOptionId: "yingcheng",
    options: [
      { id: "yingcheng", name: "硬撑到底", effects: [], fakuiShenzi: 3, text: "小产；身子 -3", story: "你咬牙跪到最后，起身时裙下已是一片殷红。" },
      { id: "jizhaoTaiyi", name: "急召太医", card: "wenTaiyiZhenzhi", effects: [], fakuiShenzi: 1, text: "小产；身子 -1", story: "温实初冒死闯进翊坤宫，孩子终究没能保住，但他保住了你。" },
      { id: "feibaoHuangshang", name: "宫人飞报皇上", card: "shoulongRenxin", effects: [], fakuiShenzi: 2, text: "小产；身子 -2", story: "小允子拼死跑去养心殿报信，皇上赶到时，一切已经晚了。" },
      { id: "anzhongLiuxin", name: "暗中留心", card: "jingguanQibian", effects: [], fakuiShenzi: 2, text: "小产；身子 -2", story: "你早有防备，备了参片含在口中，总算撑住了一口气。" },
      {
        id: "lingrongSongyao",
        name: "陵容送药",
        card: "lingrongXiangzhu",
        effects: [],
        fakuiShenzi: 2,
        shuhenjiao: true,
        distantRemark: "「跪了这半日，姐姐何苦与华妃硬碰。」",
        text: "小产；身子 -2；舒痕胶",
        story: "陵容连夜送来舒痕胶替你敷上，说擦了便不会落疤。",
      },
    ],
  },
  duanfeiJiushi: {
    id: "duanfeiJiushi",
    name: "端妃旧事",
    emoji: "🌸",
    flavor: "端妃当年被华妃灌下红花，从此不能生育。罚跪之后，她主动来找你。",
    defaultOptionId: "lishuZhouquan",
    options: [
      { id: "lishuZhouquan", name: "礼数周全", effects: [{ resource: "qingyu", amount: 1 }], text: "清誉 +1", story: "你恭恭敬敬地陪端妃坐了一会儿，她只说了些家常。" },
      { id: "wenyanXiangxun", name: "温言相询", card: "jinyanShenxing", effects: [], evidence: "duanfeiHonghua", text: "得到罪证【端妃红花】", story: "你轻声问起她的病，端妃沉默良久，终于说出了那碗红花的来历。" },
      {
        id: "weiDuanfeiZhenmai",
        name: "为端妃诊脉",
        card: "wenTaiyiZhenzhi",
        effects: [{ resource: "shenzi", amount: 1 }],
        evidence: "duanfeiHonghua",
        text: "得到罪证【端妃红花】；身子 +1",
        story: "温实初替端妃诊脉，一语道破她的病根。端妃红了眼眶，说出了当年的红花。",
      },
    ],
  },
  zhaoxing: {
    id: "zhaoxing",
    name: "敬事房翻牌",
    emoji: "🌙",
    flavor: "敬事房的公公来报：今夜皇上翻了你的绿头牌。",
    note: "打出仪容整肃 / 谨言慎行即侍寝成功（恨意 +1；贵人以后按身子判定喜脉）；打出陵容相助按关系结算。不处理则错过。欢宜香专宠在场时须先化解它。",
    defaultOptionId: "cuoguo",
    options: [
      { id: "cuoguo", name: "错过", hidden: true, effects: [], text: "无效果", story: "这一夜就这样过去了。" },
      {
        id: "chengbingBichong",
        name: "称病避宠",
        effects: [{ resource: "hate", amount: -1 }, { resource: "shengchong", amount: -1 }],
        summon: "avoid",
        text: "恨意 -1、圣宠 -1",
        story: "你推说身子不适，请皇上另择他人。翊坤宫那边，似乎安静了些。",
      },
      { id: "shengzhuangChengen", name: "盛装承恩", card: "yirongZhengsu", effects: [], summon: "success", text: "侍寝成功", story: "你盛装承恩，皇上留你到天明。" },
      { id: "shiciDechong", name: "以诗词得宠", card: "jinyanShenxing", effects: [], summon: "success", text: "侍寝成功", story: "你与皇上对诗到深夜，他笑着说你是解语花。" },
      {
        id: "lingrongXiezhuang",
        name: "陵容相助",
        card: "lingrongXiangzhu",
        effects: [],
        text: "按关系：亲厚侍寝成功；生分陵容夺功（你不侍寝，关系 +1）；怨怼召幸被截走（圣宠 -1，关系 +1）",
        story: "陵容来了碎玉轩。",
      },
    ],
  },
  caoGuirenLaifang: {
    id: "caoGuirenLaifang",
    name: "曹贵人来访",
    emoji: "🍵",
    flavor: "曹贵人看出华妃已难收场，开始为女儿温宜给自己留后路。她提着一盒点心，来碎玉轩坐坐。",
    defaultOptionId: "wanjuShuyuan",
    options: [
      { id: "wanjuShuyuan", name: "婉拒疏远", effects: [], text: "曹贵人线结束", story: "你客客气气地送走了她。曹贵人笑意不减，眼底却冷了。" },
      {
        id: "jiejiao",
        name: "结交",
        effects: [{ resource: "shengchong", amount: -1 }],
        caoBefriend: true,
        text: "圣宠 -1；【温宜抱恙】洗入机会池",
        story: "你留她用了茶，被华妃那边的人看见了。曹贵人临走时说，往后多走动。",
      },
      { id: "antongKuanqu", name: "暗通款曲", card: "shoulongRenxin", effects: [], caoBefriend: true, text: "结交，无代价", story: "你借着送点心回礼，悄悄与她搭上了线。" },
      { id: "xuyuWeiyi", name: "虚与委蛇", card: "jinyanShenxing", effects: [{ resource: "hate", amount: -1 }], text: "恨意 -1；曹贵人线结束", story: "你与她客套周旋，话里话外都替华妃说好话。消息传回翊坤宫，华妃的脸色缓了些。" },
    ],
  },
  huafeiFanan: {
    id: "huafeiFanan",
    name: "华妃发难",
    emoji: "💥",
    flavor: "华妃忍无可忍，要拿你开刀。",
    note: "处理后恨意回落到 6。",
    defaultOptionId: "renfa",
    options: [
      { id: "renfa", name: "认罚", effects: [{ resource: "qingyu", amount: -2 }, { resource: "shengchong", amount: -1 }], text: "清誉 -2、圣宠 -1", story: "你跪下认罚，任华妃发作了一通。" },
      { id: "qiuHuanghou", name: "求皇后庇护", effects: [{ resource: "shengchong", amount: -2 }], text: "圣宠 -2", story: "你求到了景仁宫，皇后替你挡下了这一回，也记下了这份人情。" },
      { id: "juliLizheng", name: "据理力争", card: "jinyanShenxing", effects: [{ resource: "qingyu", amount: -1 }], text: "清誉 -1", story: "你不卑不亢，一条一条驳回去，华妃气得摔了茶盏，却也拿你没办法。" },
    ],
  },
};

/** 陵容 as a card response to stories (召幸 / 罚跪): tier outcomes. */
export const LINGRONG_SUMMON: Record<LingrongTier, { story: string; result: "success" | "stolen" | "lost"; relation?: number; effects?: readonly Delta2[] }> = {
  close: { result: "success", story: "陵容一早来替你梳妆，又教了你一支新曲。皇上留你到天明。" },
  distant: { result: "stolen", relation: 1, story: "陵容截下了这次召幸，换她去侍寝。「姐姐福气好，也该分妹妹一些。」" },
  resentful: { result: "lost", relation: 1, effects: [{ resource: "shengchong", amount: -1 }], story: "陵容在半路截走了召幸，皇上那夜宿在了她那里。" },
};

export const NOTICES = {
  fakuiAftermath: { emoji: "☀️", name: "罚跪之后", text: "罚跪的事传遍了六宫。有人幸灾乐祸，也有人暗暗替你不平。" },
  nianGengyao: { emoji: "⛓️", name: "年羹尧失势", text: "年羹尧获罪下狱，翊坤宫失了靠山。宫里的风向，变了。" },
};

export const NIAN_TURN = 24;

// ---------------------------------------------------------------- tags

export type TagId2 =
  | "opportunity"
  | "crisis"
  | "huafei"
  | "story"
  | "trial"
  | "negative"
  | "positive"
  | "lianmei"
  | "chezhou"
  | "yiyi"
  | "xibie"
  | "shuhenjiao"
  | "harm"
  | "burn"
  | "double"
  | "evidence";

export const TAG2_INFO: Record<TagId2, { label: string; lore: string; rules: string }> = {
  opportunity: { label: "机会", lore: "宫里的恩典来得快、去得也快。", rules: "每回合从机会牌池抽 1 张。打出匹配牌即可把握；未把握时回合末直接离场，没有惩罚。" },
  crisis: { label: "危机", lore: "后宫里的风浪，躲不过就得接住。", rules: "每回合从危机牌池抽 1 张。打出匹配牌即可化解；未化解时回合末结算惩罚。" },
  huafei: {
    label: "华妃",
    lore: "翊坤宫的手，伸得比谁都长。",
    rules: "恨意 3–4：50% 出 1 张；5–6：必出 1 张；7–8：1 张再 50% 加 1 张；9：2 张。恨意 3 解锁立规矩、克扣份例；5 解锁膳食有异、一丈红；7 解锁欢宜香专宠。按回合开始时的恨意计算。",
  },
  story: {
    label: "剧情",
    lore: "命运的关口，如约而至。",
    rules: "可以选一个基础选项（不占出牌），或从手牌打出卡面所列的牌（占 1 次出牌，另加该牌效果）。不处理就结束回合时，按默认选项处理。",
  },
  trial: { label: "持续", lore: "这一批晋封的名单，就看这几日的表现。", rules: "贵人考验持续第 5—9 回合，召幸（侍寝）也从考验开始后才出现。每回合末判定：圣宠 ≥ 9、清誉 ≥ 9，且考验期间侍寝成功过，即晋为贵人；第 9 回合末仍未满足则失败。" },
  negative: { label: "负面", lore: "缠身的麻烦，一时半刻甩不掉。", rules: "持续性的不利状态。温太医相助可移除 1 个（标“不可移除”的除外）。" },
  positive: { label: "正面", lore: "占得的先机，要趁早用上。", rules: "持续性的有利状态。" },
  lianmei: {
    label: "联袂",
    lore: "姐妹同心，其利断金。",
    rules: "关系亲厚时，陵容在手牌中，她左边或右边的一张牌可以打出一次而不占出牌名额。用掉后标签变灰；每次抓到陵容时重新亮起。",
  },
  chezhou: { label: "掣肘", lore: "处处牵制，暗中作梗。", rules: "关系怨怼时，陵容在手牌中，她左右相邻的牌不能打出（陵容自己不受影响）。打出陵容后解除。" },
  yiyi: { label: "依依", lore: "依依不舍，缠着姐姐不肯走。", rules: "关系生分时，陵容在回合末不进弃牌堆，留在手牌最左边；留下几张，下回合就少抓几张。" },
  xibie: { label: "惜别", lore: "人将远去，情分只够再相助一回。", rules: "打出带惜别标签的牌时按惜别效果结算；打出后，此人的所有牌都将离场。" },
  shuhenjiao: { label: "舒痕胶", lore: "祛疤的药膏，香气清冽。", rules: "陵容送药时判定：亲厚无害并圣宠 +1；生分 30%、怨怼 60% 有害，有害时身子 -1（最多扣到 1）。" },
  harm: { label: "伤胎", lore: "防不胜防的暗手。", rules: "未化解时：有孕前身子 -1；有孕后直接小产。温太医留方可抵消一次。" },
  burn: { label: "延烧", lore: "拖得越久，越难收拾。", rules: "未化解时圣宠 -1 并留到下回合（不占下回合的华妃事件名额）；下回合仍未化解，圣宠 -2 后离场。" },
  double: { label: "双牌", lore: "一个人扛不住，就得多想一步。", rules: "同一回合内打出两张匹配牌才算化解，每张牌自身效果照常结算；回合末不满 2 张则进度清零。" },
  evidence: { label: "线索", lore: "华妃的罪状，一桩桩都要攒在手里。", rules: "第 30 回合末按罪证数结算：≤ 2 关卡失败；3–4 险胜；≥ 5 完胜。" },
};

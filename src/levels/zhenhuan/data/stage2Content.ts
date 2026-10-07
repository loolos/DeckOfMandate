/**
 * 甄嬛传 · 第二关 content. Rules come from `../docs/design-stage2.md`; keep mechanic text in sync with it.
 * Card names, emoji and base flavor are shared with 第一关 (`./content`); everything that differs in
 * 第二关 (matches, 温太医 身子 bonus, 陵容相助, events, stories) lives here.
 */
import { CARDS as STAGE1_CARDS, RANKS, type RankId, type ResourceInfo } from "./content";

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
  title: "第二关 · 年华未央",
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
  flavor: "宫里要晋一批位分，皇上也问起了碎玉轩。能不能更进一步，就看这几日：圣宠与清誉都要够分量，更要有一回承恩侍寝，让皇上亲眼看一看你。",
  firstTurn: 5,
  lastTurn: 9,
  minShengchong: 9,
  minQingyu: 9,
  promoteTo: "guiren" as RankId,
};

/** Story line and mechanic notes shown on a resource tile (hover / tap); keep in sync with design-stage2.md. */
export const RESOURCE_INFO2: Record<Resource2, ResourceInfo> = {
  qingyu: {
    lore: "宫里人人都盯着你的言行。名声一坏，再得宠也立不住脚。",
    rules: ["降到 0 立即失败。", "上限随位分提高（常在 10、贵人 14、嫔 18）。"],
  },
  shengchong: {
    lore: "皇上的恩宠，是你在后宫里最要紧的依仗，也最招华妃的眼。",
    rules: [
      "降到 0 立即失败。上限同清誉。",
      "达到召幸门槛（常在 6、贵人 / 嫔 8）才有召幸，越高召幸越勤。",
      "到上限时华妃恨意 +1，≤ 4 时 -1（回合开始时判定）。",
    ],
  },
  shenzi: {
    lore: "凤体康泰，方能承雨露、育龙裔；一身安危，皆系于此。",
    rules: ["范围 0–6。", "侍寝后按身子判定有喜，≥ 5 必有。", "降到 0 须卧床静养；有孕则小产。"],
  },
  hate: {
    lore: "你入了华妃的眼。她恨你越深，翊坤宫的手段就来得越密、越狠。",
    rules: [
      "范围 0–10，每回合开始时按当时的恨意决定华妃事件的数量和种类。",
      "到 10 时华妃当场发难，触发【殿前风雨】。",
      "侍寝、晋封、喜脉、身怀龙裔（每回合）、圣宠到上限会让她更恨你。",
      "失宠（圣宠 ≤ 4）、称病避宠、让她出了气、小产会让她消气。",
    ],
  },
};

/** Notes for the 本回合出牌 tile. */
export const PLAYS_INFO2: ResourceInfo = {
  lore: "一日里能办的事有限，先办哪件、留哪件，全凭你拿主意。",
  rules: [
    "每回合最多打出的手牌数，由位分决定（常在 2、贵人 2、嫔 3）。",
    "【静观其变】本回合 +1；【槿汐相助】的【诸事妥帖】下回合 +1；陵容的联袂可让邻牌不占名额。",
    "【卧床静养】期间每回合最多 1 张。",
  ],
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
/** 无害时疤痕尽消（圣宠 +1）的概率：亲厚必定；生分 30%（有害 30% 之外的另一段）。 */
export const SHUHENJIAO_HEAL_CHANCE: Record<LingrongTier, number> = { close: 1, distant: 0.3, resentful: 0 };

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
    line: "华妃指使太医刘畏卿用药推迟月信，设局诬眉庄假孕争宠",
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
    line: "内务府的账册记下了华妃授意克扣各宫份例的明细",
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
    line: "曹贵人为温宜计，私下吐露华妃的种种罪状，答应到时在御前作证",
    ending: "曹琴默也站了出来，跪在御前指控华妃，桩桩件件说得清清楚楚。最懂华妃的人反戈一击，华妃再无从抵赖。",
  },
};

export const EVIDENCE_THRESHOLDS = {
  fullWin: 5,
  /** 完美结局: ≥ this many evidence, ≥ `perfectCards` 解牌 on 第 30 回合, one of them the 惜别 card. */
  perfect: 7,
  perfectCards: 3,
};

/** 第 30 回合 the closing event: how many cards it takes depends on the evidence gathered. */
export const FINALE = {
  name: "翊坤落幕",
  emoji: "👑",
  /** ≤ this many evidence: no case at all, the stage is lost when 第 30 回合 begins. */
  hopeless: 1,
  /** Cards needed: ≥ 7 evidence → 1; 4–6 → 2; 2–3 → 3. */
  needed(evidence: number): number {
    return evidence >= 7 ? 1 : evidence >= 4 ? 2 : 3;
  },
  flavor: {
    full: "年家已倒，你手里的罪状一桩桩、一件件，足够让翊坤宫再也翻不了身。只差最后一步。",
    narrow: "年家倒了，你手里已攒下不少罪证，可要一举扳倒华妃，还得在御前多费些心力。",
    thin: "年家虽倒，你手里几乎没有华妃的把柄。想在今日扳倒她，只能拼尽全力一搏。",
  },
  /** Cards that count (more than needed is fine); each distinct card tells its part. */
  cards: ["jinyanShenxing", "shoulongRenxin", "meizhuangXiangzhu", "wenTaiyiZhenzhi", "lingrongXiangzhu", "jinxiXiangzhu"] as const,
  cardStory: {
    jinyanShenxing: "你跪在御前，一字一句道：「臣妾不敢妄言，只求皇上明察。年氏一门的所作所为，桩桩件件都有人证物证。」",
    shoulongRenxin: "小允子领着一众宫人跪了一地，叩首道：「奴婢们人微言轻，可翊坤宫这些年做下的事，奴婢们都亲眼见过。」",
    meizhuangXiangzhu: "眉庄挺直了背，朗声道：「皇上，臣妾与她自幼相识，她的为人臣妾最清楚。翊坤宫这些年处处与碎玉轩为难，阖宫有目共睹。」",
    jinxiXiangzhu: "槿汐跪在殿下，不疾不徐地道：「奴婢在宫里伺候了大半辈子，翊坤宫这些年的手段，奴婢一桩一桩都记着。」",
    wenTaiyiZhenzhi: "温实初捧着脉案跪下：「碎玉轩这些年的脉案都在此处，哪一回病是怎么落下的，写得明明白白。微臣愿以项上人头担保，绝无半字虚言。」",
  } as Partial<Record<string, string>>,
  /**
   * `cardStory` above is each card's default line, used when nothing is left for it to speak to;
   * it names no particular evidence, so it never repeats what another testimony said.
   *
   * Each 解牌 testifies to one particular evidence: the first on its list that you hold and nobody
   * has spoken to yet this 翊坤落幕 (so the testimonies differ); `cardStory` / `lingrongStory` is the
   * fallback. 陵容's entries are only her words; `lingrongManner` sets them in her tone.
   */
  witnessStory: {
    jinyanShenxing: [
      ["yuyingerYiyan", "你跪在御前，一字一句道：「当年倚梅园那句诗，原是臣妾所念。余氏临死前已说了实话：是翊坤宫许她荣华，教她冒认。」"],
      ["maiguanYujue", "你跪在御前，一字一句道：「年氏一门在外卖官鬻爵，进项有几成送进了翊坤宫，御前的人都看在眼里。臣妾不敢妄言，只求皇上明察。」"],
      ["fuziZhisi", "你跪在御前，一字一句道：「福子不过一个宫女，好端端地沉在了井里。丽嫔娘娘夜夜惊梦，心里有鬼的人，夜里是睡不安稳的。」"],
      ["lanyongSixing", "你跪在御前，一字一句道：「夏常在不过一时言语冲撞，便在翊坤宫外受了一丈红，落得终身残废。这等私刑，宫规里哪一条许过？」"],
      ["duanfeiHonghua", "你跪在御前，一字一句道：「端妃娘娘这些年缠绵病榻、终身无出，皆因当年翊坤宫送去的那碗红花。臣妾不敢妄言，只求皇上明察。」"],
    ],
    meizhuangXiangzhu: [
      ["liuweiqingYaofang", "眉庄挺直了背，朗声道：「皇上，臣妾当日假孕失宠，正是翊坤宫串通刘畏卿一手设下的局。臣妾至今想起，仍觉心寒。」"],
      ["kekouZhangce", "眉庄挺直了背，朗声道：「臣妾禁足存菊堂时，连炭火都被克扣了去。内务府的人亲口说，是翊坤宫的意思。」"],
      ["lanyongSixing", "眉庄挺直了背，朗声道：「一丈红那日，臣妾也在。夏常在年轻不懂事，可罪不至此，华妃却连一句求情的话都不许人说。」"],
      ["yuyingerYiyan", "眉庄挺直了背，朗声道：「余氏冒认倚梅园之功，背后若无人撑腰，她一个宫女哪来这样的胆子？」"],
    ],
    wenTaiyiZhenzhi: [
      ["liuweiqingYaofang", "温实初捧着脉案跪下：「刘畏卿开给沈小主的方子，微臣一味一味验过，皆是推迟月信之药。微臣愿以项上人头担保，此事出自翊坤宫授意。」"],
      ["duanfeiHonghua", "温实初捧着脉案跪下：「微臣替端妃娘娘诊过脉，娘娘的病根，是多年前一碗红花落下的。脉案在此，绝无半字虚言。」"],
      ["kekouZhangce", "温实初捧着脉案跪下：「那年冬天碎玉轩断了炭火，小主受寒抱恙，脉案上都有记档。内务府克扣份例，是翊坤宫的吩咐。」"],
    ],
    shoulongRenxin: [
      ["lanyongSixing", "小允子领着一众宫人跪了一地，叩首道：「那年翊坤宫外的一丈红，奴才们都在场。夏小主是怎么被打成那样的，奴才们亲眼看着，至今夜里还会惊醒。」"],
      ["fuziZhisi", "小允子领着一众宫人跪了一地，叩首道：「福子姑娘出事那夜，有人瞧见翊坤宫的人往井边去过。奴才们人微言轻，这话憋了这些年，今日不敢不说。」"],
      ["kekouZhangce", "小允子领着一众宫人跪了一地，叩首道：「奴才们年年去内务府领东西，哪一宫少了炭、少了米，又是谁吩咐扣下的，奴才们心里都有数。」"],
      ["yuyingerYiyan", "小允子领着一众宫人跪了一地，叩首道：「余答应临去前在狱里说的话，看守的公公也听见了：倚梅园那夜的功劳，是翊坤宫教她冒认的。」"],
      ["maiguanYujue", "小允子领着一众宫人跪了一地，叩首道：「年府往翊坤宫送东西，走的都是西华门。奴才们替人抬过那些箱子，沉得很。」"],
    ],
    jinxiXiangzhu: [
      ["maiguanYujue", "槿汐跪在殿下，不疾不徐地道：「奴婢在宫里伺候了大半辈子，各处的老人都有往来。年大将军卖官的银子，有几成进了翊坤宫，宫里的老人心里都有本账。」"],
      ["duanfeiHonghua", "槿汐跪在殿下，不疾不徐地道：「端妃娘娘当年那碗红花，是翊坤宫的人亲手端去的。那时奴婢已在宫里当差，宫里的老人都知道，只是这些年没人敢说。」"],
      ["kekouZhangce", "槿汐跪在殿下，不疾不徐地道：「内务府这些年的旧账，奴婢一笔一笔对过。哪一宫的份例被扣下、扣下后去了哪里，都记着翊坤宫的吩咐。」"],
      ["fuziZhisi", "槿汐跪在殿下，不疾不徐地道：「福子那孩子是奴婢看着进宫的，好端端的，怎么就没了？那几日翊坤宫的人在井边进出，奴婢都记着。」"],
      ["yuyingerYiyan", "槿汐跪在殿下，不疾不徐地道：「余答应当年不过是倚梅园一个宫女，凭什么一夜之间就成了主子？背后替她铺路的是谁，奴婢看得清清楚楚。」"],
      ["lanyongSixing", "槿汐跪在殿下，不疾不徐地道：「宫规里从没有一丈红这一条。翊坤宫私设刑罚，打残了夏小主，奴婢当日就在宫道上。」"],
    ],
    lingrongXiangzhu: [
      ["fuziZhisi", "「丽嫔娘娘惊梦时，喊的都是福子的名字。福子是怎么死的，丽嫔心里最清楚，翊坤宫也最清楚。」"],
      ["yuyingerYiyan", "「余答应在狱中说的话，臣妾也听说了：倚梅园那夜的功劳，是翊坤宫教她冒认的。」"],
      ["lanyongSixing", "「臣妾初入宫时，夏常在也曾当众羞辱过臣妾。可她后来落得那般下场，臣妾想起来，至今夜里都睡不着。」"],
      ["kekouZhangce", "「臣妾份例微薄，最知道少一篓炭是什么滋味。翊坤宫一句话，内务府便把各宫的东西扣下了。」"],
    ],
  } as Partial<Record<CardId2, readonly (readonly [EvidenceId, string])[]>>,
  /** 陵容's tone (by 情分) before her evidence line. */
  lingrongManner: {
    close: "陵容握着你的手，轻声道：「姐姐受的委屈，妹妹都记着。」到了御前，她低眉顺眼地补了一句：",
    distant: "陵容低着头，声音细细的：",
    resentful: "陵容不是为你，她自己也恨透了翊坤宫。她在御前只淡淡一句，却比谁都狠：",
  } as Record<LingrongTier, string>,
  /** 眉庄's evidence lines when 温太医 left instead (菊残霜冷): she was cleared and never 禁足. */
  meizhuangClearedWitness: {
    liuweiqingYaofang:
      "眉庄挺直了背，朗声道：「皇上，当日臣妾有孕一事，正是翊坤宫串通刘畏卿设下的局，臣妾险些百口莫辩。若非有人仗义执言，臣妾今日也站不到这里。」",
    kekouZhangce:
      "眉庄挺直了背，朗声道：「华妃协理六宫这些年，各宫的份例说扣便扣，内务府只看翊坤宫的脸色。臣妾宫里便被扣过不止一回。」",
  } as Partial<Record<EvidenceId, string>>,
  /** 陵容 is no friend of 华妃 whatever she thinks of you; only her manner differs. */
  lingrongStory: {
    close: "陵容握着你的手，轻声道：「姐姐受的委屈，妹妹都记着。」到了御前，她低眉顺眼地补了一句：「臣妾也曾见翊坤宫的人，往碎玉轩送过不干净的东西。」",
    distant: "陵容低着头，声音细细的：「臣妾人微言轻，本不该多嘴。只是那年在翊坤宫外，臣妾亲耳听见娘娘说，要让碎玉轩好看。」",
    resentful: "陵容不是为你，她自己也恨透了翊坤宫。她在御前只淡淡一句：「华妃娘娘这些年，对谁都不曾手软过。」却比谁都狠。",
  } as Record<LingrongTier, string>,
  doneStory: {
    full: "皇上将罪证掷在华妃面前，良久无言，终于下旨：年氏降为答应，打入冷宫。",
    narrow: "皇上沉吟良久，收回了华妃协理六宫之权，命她在翊坤宫闭门思过。",
    thin: "证据虽薄，你却把能说的话都说尽了。皇上终于动了怒，收回了华妃协理六宫之权。",
  },
  /** 完美结局 (§11.3): the 惜别 card stands beside you one last time, and the 欢宜香 secret comes out. */
  perfectStory:
    "那位即将远去的故人，在御前为你说了最后一次话，字字都落在要紧处。华妃还想抵赖，皇上却抬手止住了她，沉默良久，缓缓开口：「欢宜香里掺了什么，朕比谁都清楚。」满殿的人都变了脸色。他说，那香是他默许她用了这么多年的；他忌惮年家，也不愿再看见年家的血脉承继宫闱。华妃如遭雷击，跌坐在地。皇上看着你，目光复杂，只道了一句：「这些年，委屈你们了。」旨意随即颁下：华妃褫夺封号，打入冷宫，年氏一门尽数削权。你立于殿中，回头望去，故人眼中含泪带笑。这一程你们并肩走到了最后，也走得最漂亮。",
  failStory: "你没能在御前把话说透。皇上念及旧情，华妃复起，翊坤宫的灯又亮了。",
  hopelessStory: "年家倒了，你手里却几乎拿不出华妃的一条罪状。皇上念及旧情，华妃复起，翊坤宫的灯又亮了。",
};

// ---------------------------------------------------------------- cards

export type CardId2 =
  | "yirongZhengsu"
  | "jinyanShenxing"
  | "wenTaiyiZhenzhi"
  | "shoulongRenxin"
  | "jingguanQibian"
  | "meizhuangXiangzhu"
  | "lingrongXiangzhu"
  | "jinxiXiangzhu";

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
  /** 略缩 summary (emoji); falls back to the rules text run through compactEffect2. */
  readonly rulesCompact?: string;
};

function fromStage1(id: Exclude<CardId2, "lingrongXiangzhu" | "jinxiXiangzhu">, overrides: Partial<CardDef2>): CardDef2 {
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
    matches: ["huanghouShangshi", "taihouChuixun", "baohuadianQifu", "gongzhongLiuyan", "yikungongLiGuiju", "qinmoChenqing"],
  }),
  wenTaiyiZhenzhi: fromStage1("wenTaiyiZhenzhi", {
    base: [{ resource: "shenzi", amount: 1 }],
    matches: ["jingxinTiaoyang", "baohuadianQifu", "liyiShiwu", "hanliangZhiwu", "shanshiYouyi", "wenyiBaoyang"],
    rulesText: ["移除 1 个【负面】状态；身子 +1。"],
    rulesCompact: "🧹负面 🌱+1",
  }),
  shoulongRenxin: fromStage1("shoulongRenxin", {
    rulesCompact: "👂×2 📦→🎴+1",
    matches: ["supeishengToufeng", "liPinJingmeng", "wenyiBaoyang", "qinmoChenqing", "gongzhongLiuyan", "neiwufuDiaonan", "kekouFenli", "shanshiYouyi", "songzhiKuisi"],
  }),
  jingguanQibian: fromStage1("jingguanQibian", { matches: ["jingxinTiaoyang", "hanliangZhiwu", "songzhiKuisi"] }),
  meizhuangXiangzhu: fromStage1("meizhuangXiangzhu", {
    rulesCompact: "🪷+1 🌸奖励×2", matches: ["taihouChuixun", "gongzhongLiuyan", "neiwufuDiaonan", "yikungongLiGuiju", "songzhiKuisi"] }),
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
      "gongzhongLiuyan",
      "neiwufuDiaonan",
      "liyiShiwu",
      "hanliangZhiwu",
      "kekouFenli",
      "huanyixiangZhuanchong",
      "songzhiKuisi",
    ],
    rulesText: [
      "能解决带 🎶 的事件；她肯出几分力，要看你素日待她如何。",
      "冷落：回合末仍留在手中、未曾召她，她便与你疏远几分。",
      "叙话：无事相托时打出，便是请她过来坐坐、说几句体己话，她会与你亲近些；若她心中已存怨意，难免在皇上跟前说几句闲话（圣宠 -1）。",
    ],
    rulesCompact: "🎶视情分",
  },
  jinxiXiangzhu: {
    id: "jinxiXiangzhu",
    name: "槿汐相助",
    emoji: "🏮",
    flavor: "槿汐在宫里伺候了大半辈子，碎玉轩的大小事务交到她手里，你便能腾出手来。",
    base: [],
    baseDraw: 0,
    baseStatus: "zhushiTuotie",
    matches: ["supeishengToufeng", "neiwufuDiaonan", "kekouFenli", "shanshiYouyi", "songzhiKuisi", "yikungongLiGuiju", "gongzhongLiuyan"],
    rulesText: ["获得【诸事妥帖】：下回合出牌数 +1。"],
    rulesCompact: "🗝️ 下回合🀄+1",
  },
};

/** Cards that leave the deck when their 惜别 card is played (§6). */
export type DepartingCard = "meizhuangXiangzhu" | "wenTaiyiZhenzhi";

export const XIBIE: Record<DepartingCard, { effectName: string; rulesText: string; compact: string; playStory: string; leaveStory: string; who: string }> = {
  meizhuangXiangzhu: {
    effectName: "临别相托",
    who: "眉庄",
    rulesText: "惜别：清誉 +2（解决机会事件时奖励照样翻倍）；获得【眉庄嘱托】。这是最后一张眉庄相助，打出后离场。",
    compact: "🕯️ 🪷+2 🛡️",
    playStory: "存菊堂的宫门落锁前，眉庄隔着门缝塞给你一方帕子：“华妃不会就此罢手，你万事当心。”",
    leaveStory: "从此宫门深锁，眉庄再不出存菊堂一步。",
  },
  wenTaiyiZhenzhi: {
    effectName: "临行诊治",
    who: "温太医",
    rulesText: "惜别：移除全部可移除的负面状态；身子 +2；获得【温太医留方】。这是最后一张温太医相助，打出后离场。",
    compact: "🕯️ 🧹全部负面 🌱+2 📜",
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
  "jinxiXiangzhu",
  "jinxiXiangzhu",
];

export const LINGRONG_COPIES = 3;

// ---------------------------------------------------------------- statuses

export type StatusId2 =
  | "liuyanChanshen"
  | "ermuLingtong"
  | "wochuangJingyang"
  | "meizhuangZhutuo"
  | "wentaiyiLiufang"
  | "shenhuaiLongyi"
  | "baoyangZaishen"
  | "bimenSiguo"
  | "jinghongWu"
  | "zhushiTuotie"
  | "jinruoHanchan";

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
  /** Each active instance lowers the play limit by 1 (never below 1); instances stack. */
  readonly playPenalty?: number;
  /** Each active instance raises the play limit by 1 (诸事妥帖); instances stack. */
  readonly playBonus?: number;
  /** Cards that cannot be played while it applies (抱恙在身). */
  readonly blocksCards?: readonly CardId2[];
  /** No 侍寝 while it applies: 召幸 can only be declined or missed. */
  readonly noSummon?: boolean;
  /** Applied at the start of every turn it is in effect. */
  readonly turnStart?: readonly Delta2[];
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
    source: "回合末未处理的危机事件【蜚语盈廊】",
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
    noSummon: true,
    effectText: "未来 2 回合，每回合最多打出 1 张牌（静观其变、诸事妥帖的出牌数 +1 与陵容的联袂仍然有效），也不能侍寝（召幸只能称病避宠或错过）；结束时身子恢复为 1。不可移除。",
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
    effectText: "抵消一次伤胎类事件的后果（有孕前不扣身子；有孕后免于小产）；翊坤长跪时不能阻止小产，但身子少扣 1。第一次适用时自动用掉。",
    flavor: "茶盏底下那张方子，字迹工整，每一味药都写了用量。",
    source: "温太医相助的惜别效果「临行诊治」",
  },
  baoyangZaishen: {
    id: "baoyangZaishen",
    name: "抱恙在身",
    emoji: "🤒",
    tag: "negative",
    duration: 2,
    drawModifier: 0,
    blocksCards: ["yirongZhengsu", "jinyanShenxing"],
    noSummon: true,
    effectText: "未来 2 回合，不能打出【仪容整肃】和【谨言慎行】，也不能侍寝（召幸只能称病避宠或错过）。多个实例分别计时。",
    flavor: "身子一阵阵发虚，连起身梳妆都勉强。",
    source: "华妃的暗手、罚跪等",
  },
  bimenSiguo: {
    id: "bimenSiguo",
    name: "闭门思过",
    emoji: "🔒",
    tag: "negative",
    duration: 2,
    drawModifier: 0,
    playPenalty: 1,
    effectText: "未来 2 回合，每回合出牌上限 -1（最低 1 张）。多个实例分别计时、效果叠加。",
    flavor: "碎玉轩的宫门半掩，往来的人一日少过一日。",
    source: "翊坤立威、莺儿伏罪·求情、殿前风雨·认罚",
  },
  jinghongWu: {
    id: "jinghongWu",
    name: "惊鸿舞",
    emoji: "💃",
    tag: "positive",
    duration: 3,
    drawModifier: 0,
    turnStart: [{ resource: "shengchong", amount: 1 }],
    effectText: "未来 3 回合，每回合开始时圣宠 +1。",
    flavor: "一舞惊鸿，皇上的目光再也没从你身上移开。",
    source: "贵人考验期间打出过眉庄相助与陵容相助（陵容怨怼时不肯帮忙）",
  },
  zhushiTuotie: {
    id: "zhushiTuotie",
    name: "诸事妥帖",
    emoji: "🗝️",
    tag: "positive",
    duration: 1,
    drawModifier: 0,
    playBonus: 1,
    effectText: "下回合出牌上限 +1。多个实例效果叠加。",
    flavor: "宫里的琐碎事槿汐都替你料理妥当了，你只管腾出手来应付要紧的。",
    source: "打出【槿汐相助】",
  },
  jinruoHanchan: {
    id: "jinruoHanchan",
    name: "噤若寒蝉",
    emoji: "🍂",
    tag: "negative",
    duration: 2,
    drawModifier: 0,
    blocksCards: ["shoulongRenxin", "jinxiXiangzhu"],
    effectText: "持续期间不能打出【收拢人心】和【槿汐相助】。一丈红未应对时持续 2 回合，只应对了一半时持续 1 回合。多个实例分别计时。",
    flavor: "宫人们亲眼见了一丈红，一个个噤若寒蝉，谁也不敢再替你出头。",
    source: "华妃事件【一丈红】未应对或只应对了一半",
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
    effectText: "每回合开始时华妃恨意 +1；不再出现召幸；伤胎类事件未化解时直接小产；身子降到 0 时立即小产。持续到小产或关卡结束。",
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
  | "wenyiBaoyang"
  | "qingmaiBaoxi"
  | "qinmoChenqing";
export type CrisisId2 = "gongzhongLiuyan" | "neiwufuDiaonan" | "liyiShiwu" | "hanliangZhiwu";
export type HuafeiId = "yikungongLiGuiju" | "kekouFenli" | "shanshiYouyi" | "yizhangHong" | "huanyixiangZhuanchong" | "songzhiKuisi";
export type EventId2 = OpportunityId2 | CrisisId2 | HuafeiId;
export type EventKind2 = "opportunity" | "crisis" | "huafei";

export const EVENT_KIND2_LABEL: Record<EventKind2, string> = { opportunity: "机会", crisis: "危机", huafei: "华妃" };

/** Two cards in the same turn resolve the event (§9.4). */
export type DoubleRule =
  | { readonly kind: "anyTwo"; readonly cards: readonly CardId2[] }
  | { readonly kind: "both"; readonly cards: readonly [CardId2, CardId2] };

export type ResponsePenalty = { readonly effects: readonly Delta2[]; readonly status?: StatusId2; /** Overrides the status's own duration. */ readonly statusTurns?: number };

export type EventDef2 = {
  readonly id: EventId2;
  readonly kind: EventKind2;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  readonly reward: readonly Delta2[];
  /** Extra reward when this particular card takes the opportunity. */
  readonly cardBonus?: Partial<Record<CardId2, readonly Delta2[]>>;
  /** Replaces `reward` when this particular card takes the opportunity. */
  readonly cardReward?: Partial<Record<CardId2, readonly Delta2[]>>;
  readonly penalty: readonly Delta2[];
  readonly penaltyStatus?: StatusId2;
  /** Overrides the status's own duration when it comes from this event. */
  readonly penaltyStatusTurns?: number;
  /** 伤胎类 (§7.2). */
  readonly harmsPregnancy?: boolean;
  /** 激怒 (+1) / 出气 (-1) hate change when unresolved. */
  readonly unresolvedHate?: number;
  /** 延烧: unresolved once → stays for one more turn with `burnPenalty`. */
  readonly burnPenalty?: readonly Delta2[];
  /** Status gained when the 延烧 runs out unresolved. */
  readonly burnStatus?: StatusId2;
  /** Unresolved 欢宜香浓 voids this turn's 召幸 and blocks it until resolved. */
  readonly blocksSummon?: boolean;
  readonly double?: DoubleRule;
  /** 华妃事件: answering with this card still costs this one penalty (applied when played). */
  readonly responsePenalty?: Partial<Record<CardId2, ResponsePenalty>>;
  /** 华妃双牌事件: the penalty left once both cards are in. */
  readonly doublePenalty?: ResponsePenalty;
  /** 华妃双牌事件: only one card in by the end of the turn — this lighter penalty instead (no 激怒 / 出气). */
  readonly partialPenalty?: ResponsePenalty;
  /** 华妃事件 unlock threshold. */
  readonly unlockHate?: number;
  /** Evidence and which cards earn it. For double events: any of the cards in the pair. */
  readonly evidence?: { readonly id: EvidenceId; readonly cards: readonly CardId2[] };
  readonly resolvedText: string;
  readonly unresolvedText: string;
  /** 略缩 summaries (emoji) when the generic conversion is not enough. */
  readonly resolvedCompact?: string;
  readonly unresolvedCompact?: string;
  readonly resolvedStory: Partial<Record<CardId2, string>>;
  /** Rule note shown on the card. */
  readonly note?: string;
};

export const EVENTS2: Record<EventId2, EventDef2> = {
  huanghouShangshi: {
    id: "huanghouShangshi",
    kind: "opportunity",
    name: "中宫垂青",
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
    cardBonus: { jinyanShenxing: [{ resource: "shengchong", amount: 1 }] },
    penalty: [],
    resolvedText: "清誉 +1（谨言慎行把握时另加圣宠 +1）",
    resolvedCompact: "🪷+1 · 🤐👑+1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jinyanShenxing: "太后问你读过什么书，你答得谦逊稳妥。太后捻着佛珠，说这孩子沉静，转头便在皇上跟前夸了你几句。",
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
    cardReward: { jingguanQibian: [{ resource: "shenzi", amount: 2 }] },
    resolvedText: "清誉 +1、身子 +1（静观其变解决时改为身子 +2，不加清誉）",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jingguanQibian: "你闭门焚香，抄了几卷经。外头的风风雨雨一概不理，气色倒一日好过一日。",
      wenTaiyiZhenzhi: "温实初开了一剂温补的方子，嘱咐你按时服用。几日下来，手脚都暖和了。",
    },
  },
  baohuadianQifu: {
    id: "baohuadianQifu",
    kind: "opportunity",
    name: "宝华祈福",
    emoji: "🙏",
    flavor: "宝华殿做法事，各宫小主都去上香祈福。",
    reward: [
      { resource: "qingyu", amount: 1 },
      { resource: "shenzi", amount: 1 },
    ],
    penalty: [],
    cardReward: { wenTaiyiZhenzhi: [{ resource: "shenzi", amount: 1 }] },
    resolvedText: "清誉 +1、身子 +1（温太医相助解决时只得身子 +1）",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初陪你去宝华殿上香，又替你把了平安脉，叮嘱你少思少虑。你在佛前静坐了半日，只觉得身子轻快了许多。",
      jinyanShenxing: "你跪在佛前，心中默念的不过是家人平安、自身康健。太后听说你虔诚，夸了一句。",
    },
  },
  supeishengToufeng: {
    id: "supeishengToufeng",
    kind: "opportunity",
    name: "御前密语",
    emoji: "🗝️",
    flavor: "槿汐与御前的苏公公是旧识，这日回来，神色有些异样。",
    reward: [],
    penalty: [],
    evidence: { id: "maiguanYujue", cards: ["shoulongRenxin", "jinxiXiangzhu"] },
    resolvedText: "可能搜集到华妃的罪证",
    unresolvedText: "无额外效果，事件消失（之后还会出现）",
    resolvedStory: {
      shoulongRenxin: "你让槿汐备了厚礼去谢苏公公。他私下说了一句：年大将军在外头卖官，翊坤宫那位也没少替兄长打点。",
      jinxiXiangzhu: "槿汐亲自去见了苏公公，不过寒暄了几句旧话。临走时他压低声音提了一句：年大将军在外头卖官，翊坤宫那位也没少替兄长打点。",
    },
  },
  liPinJingmeng: {
    id: "liPinJingmeng",
    kind: "opportunity",
    name: "丽嫔惊梦",
    emoji: "👻",
    flavor: "丽嫔近来夜夜惊梦，醒来便抱着被子发抖，问什么都说不出个所以然。",
    reward: [],
    penalty: [],
    evidence: { id: "fuziZhisi", cards: ["shoulongRenxin", "lingrongXiangzhu"] },
    resolvedText: "可能搜集到华妃的罪证",
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
    reward: [],
    penalty: [],
    resolvedCompact: "🍵欠情",
    resolvedText: "曹贵人欠下你一个人情，日后会还",
    unresolvedText: "无额外效果，事件消失（之后还会出现）",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初连夜进宫，几服药下去公主便退了热。曹贵人抱着女儿，对你深深一拜。",
      shoulongRenxin: "你托人悄悄请了相熟的太医连夜来看，又替曹贵人瞒住了消息。公主好转，曹贵人记下了这份情。",
    },
  },
  qingmaiBaoxi: {
    id: "qingmaiBaoxi",
    kind: "opportunity",
    name: "请脉报喜",
    emoji: "💗",
    flavor: "你近来总是懒懒的，闻不得油腥。太医院派了人来请脉。",
    reward: [],
    penalty: [],
    double: { kind: "anyTwo", cards: ["wenTaiyiZhenzhi", "shoulongRenxin", "jinyanShenxing"] },
    resolvedCompact: "💗→嫔",
    unresolvedCompact: "🔁",
    resolvedText: "太医确诊喜脉，晋为嫔",
    unresolvedText: "这回没能确诊：洗回机会牌池，下次再来",
    note: "身怀龙裔的贵人才会出现。同一回合打出温太医相助、收拢人心、谨言慎行中任意 2 张才算确诊；小产后此事件随之消失。",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初诊了又诊，才敢跪下道喜。消息传到养心殿，皇上当即下旨晋你为嫔。",
      shoulongRenxin: "你早早打点了太医院，来请脉的太医一句也不敢含糊。消息传到养心殿，皇上当即下旨晋你为嫔。",
      jinyanShenxing: "你沉住气，等太医确诊了才让人去报喜。皇上大喜，当即下旨晋你为嫔。",
    },
  },
  qinmoChenqing: {
    id: "qinmoChenqing",
    kind: "opportunity",
    name: "琴默陈情",
    emoji: "🍵",
    flavor: "年家倒了，曹贵人连夜来了碎玉轩。她屏退左右，说要还你当日照看温宜的人情。",
    reward: [],
    penalty: [],
    evidence: { id: "caoguirenGaofa", cards: ["shoulongRenxin", "jinyanShenxing"] },
    unresolvedCompact: "✖️",
    resolvedText: "可能搜集到华妃的罪证",
    unresolvedText: "曹贵人等不到你的回音，此事作罢（不会再出现）",
    note: "只出现一次。",
    resolvedStory: {
      shoulongRenxin: "你让槿汐守着门，听曹贵人把翊坤宫这些年的事一桩桩说了出来。临走时她说，若到了御前，她肯站出来作证。",
      jinyanShenxing: "你只静静听着，一句也不多问。曹贵人说完，叹了口气：「为了温宜，到时我自会在皇上跟前把话说清楚。」",
    },
  },
  songzhiKuisi: {
    id: "songzhiKuisi",
    kind: "huafei",
    name: "隔墙有耳",
    emoji: "👁️",
    flavor: "碎玉轩里有小宫女收了颂芝的好处，你屋里的一举一动，翊坤宫都知道了。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -1 }],
    penaltyStatus: "liuyanChanshen",
    penaltyStatusTurns: 2,
    unlockHate: 0,
    responsePenalty: {
      shoulongRenxin: { effects: [{ resource: "qingyu", amount: -1 }] },
      jingguanQibian: { effects: [{ resource: "hate", amount: 1 }] },
      jinxiXiangzhu: { effects: [{ resource: "hate", amount: 1 }] },
    },
    resolvedText: "收拢人心：只清誉 -1；静观其变、槿汐相助：只恨意 +1；眉庄相助：完美化解，没有代价；陵容相助：视情分而定",
    resolvedCompact: "🤝🪷-1 · 🍵🏮🔥+1 · 👭✨ · 🎶",
    unresolvedText: "清誉 -1、获得【流言缠身】（2 回合）",
    unresolvedCompact: "🪷-1 🗯️×2",
    note: "不论恨意高低都可能抽到（恨意 ≥ 3 才会出现华妃事件）。",
    resolvedStory: {
      shoulongRenxin: "你拿银子撬开了几个宫人的嘴，揪出了那个收了好处的小宫女。打发走时动静不小，宫里都说碎玉轩的主子刻薄。",
      jinxiXiangzhu: "槿汐不动声色地查了几日，寻了个由头把那小宫女退回了内务府。颂芝断了耳目，翊坤宫又把这笔账记在了你头上。",
      jingguanQibian: "你只当不知，故意让那小宫女听见几句假话。翊坤宫扑了个空，华妃气得摔了茶盏。",
      meizhuangXiangzhu: "眉庄不动声色地把那小宫女调去了自己宫里当差，碎玉轩清净了，翊坤宫也挑不出半点错处。",
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
      jinyanShenxing: "你闭门不出，见了谁都只说些天气花草。流言找不到新的把柄，几日便散了。",
      meizhuangXiangzhu: "眉庄姐姐在各宫走动时替你分说清楚，又寻出了嚼舌根的宫女。流言一夜之间没了声息。",
      shoulongRenxin: "你让小允子拿了些碎银子，在各宫的宫人间打点了一圈。收了好处的人自然换了口风，流言渐渐没人再提。",
      jinxiXiangzhu: "槿汐暗中寻到了传话的源头，把几个碎嘴的宫人敲打了一番。流言没了下文。",
    },
  },
  neiwufuDiaonan: {
    id: "neiwufuDiaonan",
    kind: "crisis",
    name: "内务府刁难",
    emoji: "📦",
    flavor: "这个月的份例迟迟没有送来。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -1 }],
    resolvedText: "移除事件",
    unresolvedText: "清誉 -1",
    note: "用收拢人心解决时额外抽 1 张。",
    resolvedStory: {
      shoulongRenxin: "小允子拿了银子去内务府打点，当天下午份例便一样不少地送到了碎玉轩。",
      meizhuangXiangzhu: "眉庄姐姐把自己宫里的份例分了一半送来，又托人敲打内务府，没过两日便补齐了。",
      jinxiXiangzhu: "槿汐拿着碎玉轩的份例单子去内务府对账，一笔一笔说得清清楚楚，管事太监只得赔着笑补齐。",
    },
  },
  liyiShiwu: {
    id: "liyiShiwu",
    kind: "crisis",
    name: "莲步微蹶",
    emoji: "🎎",
    flavor: "请安时莲步微蹶，踉跄间擦破了手心，仪态稍失。",
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
    penaltyStatus: "baoyangZaishen",
    resolvedText: "移除事件",
    unresolvedText: "伤胎：有孕前身子 -1、获得【抱恙在身】；有孕后直接小产",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初正好来请脉，看了一眼那碗冰果便摇头：小主体寒，这东西碰不得。",
      jingguanQibian: "你只看了一眼便叫人撤下，说近来脾胃虚寒，碰不得凉的。",
    },
  },
  yikungongLiGuiju: {
    id: "yikungongLiGuiju",
    kind: "huafei",
    name: "翊坤立威",
    emoji: "🏯",
    flavor: "请安时华妃当众挑你的错处，满殿的人都等着看你如何应对。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -2 }],
    penaltyStatus: "bimenSiguo",
    unresolvedHate: 1,
    unlockHate: 3,
    responsePenalty: {
      jinyanShenxing: { effects: [{ resource: "qingyu", amount: -1 }] },
      meizhuangXiangzhu: { effects: [{ resource: "hate", amount: 1 }] },
      jinxiXiangzhu: { effects: [{ resource: "qingyu", amount: -1 }] },
    },
    resolvedCompact: "🤐🏮🪷-1 · 👭🔥+1",
    resolvedText: "谨言慎行、槿汐相助：只清誉 -1；眉庄相助：只恨意 +1",
    unresolvedText: "清誉 -2、获得【闭门思过】；激怒：恨意 +1",
    resolvedStory: {
      jinyanShenxing: "你垂首听训，一句不辩，末了只说“娘娘教训得是”。华妃挑不出大错，却还是当众数落了你几句。",
      meizhuangXiangzhu: "眉庄陪你一同站了半日规矩，替你挡下了不少难听的话。华妃冷笑一声，把这笔账记在了你头上。",
      jinxiXiangzhu: "槿汐上前跪下，把错处都揽到自己身上：“是奴婢没提点好小主。”华妃罚了她半月月钱，满殿的人却都看在眼里，说碎玉轩的主子连个奴才都护不住。",
    },
  },
  kekouFenli: {
    id: "kekouFenli",
    kind: "huafei",
    name: "克扣份例",
    emoji: "🍚",
    flavor: "内务府看着翊坤宫的脸色，碎玉轩的炭火、吃食一日比一日少。",
    reward: [],
    penalty: [
      { resource: "shengchong", amount: -1 },
      { resource: "qingyu", amount: -1 },
    ],
    burnPenalty: [{ resource: "shengchong", amount: -2 }],
    burnStatus: "baoyangZaishen",
    unlockHate: 3,
    evidence: { id: "kekouZhangce", cards: ["shoulongRenxin"] },
    responsePenalty: {
      shoulongRenxin: { effects: [{ resource: "qingyu", amount: -1 }] },
      jinxiXiangzhu: { effects: [{ resource: "qingyu", amount: -1 }] },
    },
    resolvedCompact: "🤝🪷-1 🗂️×2？ · 🏮🪷-1 · 🎶🪷-1",
    unresolvedCompact: "👑-1 🪷-1 ⏳→👑-2 🤒×2",
    resolvedText: "收拢人心：只清誉 -1，多次应对后可能搜集到华妃的罪证；槿汐相助：只清誉 -1；陵容相助：视情分而定",
    unresolvedText: "延烧：圣宠 -1、清誉 -1，事件留到下回合；下回合仍未应对：圣宠 -2、获得【抱恙在身】后离场",
    resolvedStory: {
      shoulongRenxin: "你让小允子拿银子去内务府打点，炭火吃食总算补了回来。他回来悄悄说，账上好几笔份例的去向，都记着翊坤宫的吩咐。",
      jinxiXiangzhu: "槿汐去内务府走了一趟，几句软中带硬的话，炭火吃食总算补回来大半。只是宫里都在传，碎玉轩为了几篓炭跟内务府斤斤计较。",
    },
  },
  shanshiYouyi: {
    id: "shanshiYouyi",
    kind: "huafei",
    name: "膳食有异",
    emoji: "🍲",
    flavor: "御膳房送来的汤水，闻着与往日不大一样。",
    reward: [],
    penalty: [{ resource: "shenzi", amount: -1 }],
    harmsPregnancy: true,
    penaltyStatus: "baoyangZaishen",
    unlockHate: 5,
    responsePenalty: {
      wenTaiyiZhenzhi: { effects: [{ resource: "qingyu", amount: -1 }] },
      shoulongRenxin: { effects: [{ resource: "shengchong", amount: -1 }] },
      jinxiXiangzhu: { effects: [{ resource: "hate", amount: 1 }] },
    },
    resolvedCompact: "💊🪷-1 · 🤝👑-1 · 🏮🔥+1",
    unresolvedCompact: "⚠️ 🌱-1",
    resolvedText: "温太医相助：只清誉 -1；收拢人心：只圣宠 -1；槿汐相助：只恨意 +1",
    unresolvedText: "伤胎：有孕前身子 -1、获得【抱恙在身】；有孕后直接小产；另外身子 -1",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初验过汤水，脸色一沉：里头加了活血的东西。你滴水未沾，可太医深夜出入碎玉轩的事传了出去，宫里都说你疑神疑鬼。",
      shoulongRenxin: "御膳房里收过你赏钱的小太监悄悄递话：今日的汤，别喝。你把这事闹到了御前，皇上却嫌你小题大做。",
      jinxiXiangzhu: "槿汐端起碗闻了闻，眉头一皱：汤里有一股红花的味道。她悄悄把汤倒了，换上一碗清粥。翊坤宫听说碎玉轩没上当，又记了你一笔。",
    },
  },
  yizhangHong: {
    id: "yizhangHong",
    kind: "huafei",
    name: "一丈红",
    emoji: "🩸",
    flavor: "华妃又要拿人立威。周宁海带着人闯进碎玉轩，把你宫里的人拖到了翊坤宫外。",
    reward: [],
    penalty: [{ resource: "qingyu", amount: -2 }],
    penaltyStatus: "jinruoHanchan",
    penaltyStatusTurns: 2,
    unresolvedHate: -1,
    unlockHate: 5,
    double: { kind: "anyTwo", cards: ["jinyanShenxing", "yirongZhengsu", "shoulongRenxin"] },
    partialPenalty: { effects: [{ resource: "qingyu", amount: -1 }], status: "jinruoHanchan", statusTurns: 1 },
    doublePenalty: { effects: [{ resource: "hate", amount: 1 }] },
    evidence: { id: "lanyongSixing", cards: ["shoulongRenxin"] },
    resolvedCompact: "✌️🔥+1 · ☝️🪷-1 🍂×1",
    unresolvedCompact: "🪷-2 🍂×2 🔥-1",
    resolvedText: "打出 2 张：只恨意 +1（两张中含收拢人心，多次应对后可能搜集到华妃的罪证）；只打出 1 张：回合末清誉 -1、获得【噤若寒蝉】（1 回合）",
    unresolvedText: "清誉 -2、获得【噤若寒蝉】（2 回合）；出气：恨意 -1",
    note: "双牌：同一回合打出谨言慎行、仪容整肃、收拢人心中任意 2 张。",
    resolvedStory: {
      jinyanShenxing: "你跪在翊坤宫外替宫人求情，句句恭顺，华妃寻不到再发作的由头。",
      yirongZhengsu: "你衣冠整齐地赶来，当众请罪，把罪责都揽在自己身上。",
      shoulongRenxin: "平日受过你恩惠的宫人一个个站出来作证，周宁海举着板子，终究没敢落下去。",
    },
  },
  huanyixiangZhuanchong: {
    id: "huanyixiangZhuanchong",
    kind: "huafei",
    name: "欢宜香浓",
    emoji: "🌺",
    flavor: "皇上连日宿在翊坤宫，满宫都闻得见欢宜香的味道。",
    reward: [],
    penalty: [{ resource: "shengchong", amount: -1 }],
    unresolvedHate: -1,
    blocksSummon: true,
    unlockHate: 7,
    double: { kind: "both", cards: ["yirongZhengsu", "jingguanQibian"] },
    doublePenalty: { effects: [{ resource: "hate", amount: 1 }] },
    resolvedCompact: "🌙✓ 🔥+1",
    unresolvedCompact: "🌙✗ 👑-1 🔥-1",
    resolvedText: "召幸恢复可处理；只恨意 +1（把皇上从翊坤宫拉了回来）",
    unresolvedText: "本回合召幸作废、圣宠 -1；出气：恨意 -1",
    note: "只在有召幸的回合出现。陵容相助单张，或同一回合打出仪容整肃 + 静观其变。在场时召幸不能处理。",
    resolvedStory: {
      yirongZhengsu: "你盛装去了御花园，恰在皇上回养心殿的路上折了一枝新开的海棠。皇上远远瞧见，驻足看了许久，终于想起了碎玉轩。",
      jingguanQibian: "你按兵不动，等皇上在翊坤宫住了几日，才托人在御前递了一句：碎玉轩的海棠开了。皇上终于想起了碎玉轩。",
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

export const HUAFEI_EVENTS: readonly HuafeiId[] = ["yikungongLiGuiju", "kekouFenli", "shanshiYouyi", "yizhangHong", "huanyixiangZhuanchong", "songzhiKuisi"];

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
  /** 蜚语盈廊 怨怼: two 流言缠身 at end of turn. */
  readonly aggravate?: boolean;
  readonly story: string;
};

type TierTable = Record<LingrongTier, LingrongOutcome>;

export const LINGRONG_EVENT: Partial<Record<EventId2, TierTable>> = {
  huanghouShangshi: {
    close: { resolves: true, effects: [{ resource: "shengchong", amount: 1 }], relation: 1, story: "陵容陪你一同去景仁宫，皇后见你们姐妹和睦，赏了你一对玉镯。回来的路上，陵容挽着你的胳膊，说这镯子最衬姐姐。" },
    distant: { resolves: true, effects: [], relation: 1, story: "赏赐全落在了陵容身上。「姐姐如今是皇后跟前的红人了。」她笑着说，临走却把一支珠花塞进你手里：「这个，妹妹替姐姐留着的。」" },
    resentful: { resolves: false, relation: 1, story: "皇后的赏赐落到了陵容头上。她从景仁宫出来，在碎玉轩门口站了好一会儿，终究还是进来坐了坐。" },
  },
  jingxinTiaoyang: {
    close: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容亲手制了安神香送来，你一夜好眠。" },
    distant: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容送来安神香。「这香方子金贵，姐姐省着些用。」" },
    resentful: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容送来的安神香气味清冽，你倒也睡得安稳。" },
  },
  baohuadianQifu: {
    close: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], relation: 1, story: "你与陵容并肩跪在佛前，她替你多磕了三个头。起身时，她悄悄握了握你的手。" },
    distant: { resolves: true, effects: [{ resource: "shenzi", amount: 1 }], relation: 1, story: "「姐姐求子心切，妹妹自然陪着。」陵容陪你上了一炷香，回去的路上，话比来时多了些。" },
    resentful: { resolves: true, effects: [], relation: 1, story: "佛前青烟袅袅，陵容一言不发，临走时却替你掸了掸衣上的香灰。" },
  },
  liPinJingmeng: {
    close: { resolves: true, evidence: true, relation: 1, story: "陵容学着福子的声音在丽嫔窗下哭了半宿。丽嫔吓破了胆，把华妃害死福子的事全说了。事后陵容抿嘴笑：「也只有姐姐，敢叫我做这样的事。」" },
    distant: { resolves: true, evidence: true, story: "陵容肯帮这个忙，却撇嘴道：「这种装神弄鬼的事，也只有姐姐想得出来。」丽嫔终究吐了实话。" },
    resentful: { resolves: false, relation: 1, effects: [{ resource: "hate", amount: 1 }], story: "消息不知怎么走漏到了翊坤宫，丽嫔那边一下子没了动静。陵容低着头来见你，绞着帕子说是自己嘴不严。" },
  },
  gongzhongLiuyan: {
    close: { resolves: true, relation: 1, story: "陵容在各宫替你辟谣：「姐姐的为人，我最清楚。」说这话时，她的声音比平日都响亮些。" },
    distant: { resolves: true, relation: 1, story: "「姐姐何必在意这些闲话，清者自清嘛。」陵容嘴上这么说，倒也替你分辩了几句，走前还回头看了你一眼。" },
    resentful: { resolves: false, relation: 1, aggravate: true, story: "陵容在别人跟前添油加醋，流言越传越凶。可到了夜里，宝鹊又悄悄送来一盏安神汤，说是她家小主吩咐的。" },
  },
  neiwufuDiaonan: {
    close: { resolves: true, extraDraw: 1, story: "陵容出身寒微，最懂怎么跟内务府打交道，没两日便替你把份例要了回来。" },
    distant: { resolves: true, story: "「妹妹出身寒微，跟奴才们打交道倒是在行。」份例总算补齐了。" },
    resentful: { resolves: true, effects: [{ resource: "qingyu", amount: -1 }], story: "陵容出面去要份例，却把事情闹得人尽皆知，倒显得你斤斤计较。" },
  },
  liyiShiwu: {
    close: { resolves: true, shuhenjiao: true, story: "陵容扶你起来，替你整好衣裳，又说回头送药来。" },
    distant: { resolves: true, shuhenjiao: true, story: "「姐姐素来最重仪态，这回可要仔细些。」陵容替你遮掩过去，说回头送药来。" },
    resentful: { resolves: true, shuhenjiao: true, story: "陵容上前替你圆了场，低头时嘴角却像是笑了一下。她说回头送药来。" },
  },
  hanliangZhiwu: {
    close: { resolves: true, relation: 1, story: "陵容抢先端走了那碗冰果：「姐姐身子要紧，这个我替姐姐吃了。」" },
    distant: { resolves: true, story: "「姐姐如今金贵，连口凉的都吃不得了。」陵容嘴上打趣，还是把冰果端走了。" },
    resentful: { resolves: true, effects: [{ resource: "qingyu", amount: -1 }], story: "陵容当着众人的面把冰果打翻了，说姐姐身子弱、碰不得凉的。东西是没吃成，宫里却都说你娇气。" },
  },
  songzhiKuisi: {
    close: { resolves: true, effects: [{ resource: "hate", amount: 1 }], story: "陵容替你留意着，没两日便认出了那个常往翊坤宫跑的小宫女。「姐姐身边的人，可得仔细些。」" },
    distant: { resolves: true, effects: [{ resource: "shengchong", amount: -1 }], story: "「姐姐宫里的事，原轮不到我多嘴。」陵容嘴上这么说，还是把内鬼指了出来。" },
    resentful: { resolves: false, relation: 1, story: "陵容只说没瞧见什么。过了几日，她却托人捎来一句：「碎玉轩的门，夜里该落锁了。」" },
  },
  kekouFenli: {
    close: { resolves: true, relation: -1, effects: [{ resource: "qingyu", amount: -1 }], story: "陵容把自己的份例分了一半送来：「姐姐别嫌弃。咱们姐妹，原该如此。」那几日延禧宫的炭盆却早早熄了，宝鹊说她家小主夜里冻得睡不着。内务府那边，到底还是记了你一笔。" },
    distant: { resolves: true, relation: -1, effects: [{ resource: "qingyu", amount: -1 }], story: "「我一个答应的份例，哪比得上姐姐的。」陵容嘴上这么说，还是送了些炭来，放下便走了。你后来才听说，那是她攒了一冬没舍得用的。" },
    resentful: { resolves: false, relation: 1, story: "陵容推说自己也不够用，一样东西也没送来。第二日清早，碎玉轩门口却多了一小篓炭，没留话。" },
  },
  huanyixiangZhuanchong: {
    close: { resolves: true, relation: -1, effects: [{ resource: "hate", amount: 1 }], story: "陵容在御花园唱了一支新曲，把皇上从翊坤宫引了过来，又借故走开，留你陪驾。回宫的路上她一直低着头，过了许久才轻声说：「姐姐好福气。」" },
    distant: { resolves: true, relation: -1, effects: [{ resource: "hate", amount: 1 }], story: "陵容的歌声把皇上引了过来，皇上却只随口问了句是谁在唱，便携了你的手走了。「姐姐这回可欠妹妹一个人情。」她笑着说，笑意却没到眼底。" },
    resentful: { resolves: false, relation: 1, effects: [{ resource: "shengchong", amount: -2 }], story: "陵容趁机自己去御前献唱，皇上当晚留在了她那里。次日她来请安，眼圈红红的，只说了一句「姐姐别怪我」。" },
  },
};

/** 怨怼 陵容 played without matching anything (§5.3). */
export const LINGRONG_BACKLASH: readonly Delta2[] = [{ resource: "shengchong", amount: -1 }];

/** 陵容 played with nothing on the table for her: just keeping her company, 情分 +1. */
export const LINGRONG_IDLE_TEXT: Record<LingrongTier, string> = {
  close: "你留陵容在碎玉轩喝茶，两人说了半日体己话。临走时她拉着你的袖子，说下回再来。",
  distant: "你请陵容过来坐坐。她起初拘谨得很，后来也说了几句心里话。",
  resentful: "你请陵容过来坐坐，她句句带刺。可临出门时，她回头看了你一眼。",
};

export const LINGRONG_NEGLECT_TEXT = {
  drop: "陵容在廊下等了半日，终究没等到姐姐召她，悻悻回了宫。",
  floor: "陵容又白等了一日，眼里的光淡了些。",
};

export const SHUHENJIAO_TEXT = {
  close: "陵容亲手替你上药，药膏清凉，伤处好得很快。",
  heal: "药膏清凉，伤处好得很快，竟连一点疤痕也没留下。",
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
  | "nianShiQingtui"
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
  /** 略缩 summary (emoji) when the generic conversion is not enough. */
  readonly compact?: string;
  readonly story: string;
  /** 陵容 card answers: the story told depends on her 情分 at the time. */
  readonly tierStory?: Record<LingrongTier, string>;
  /** 陵容 card answers: 情分 change by her tier at the time (on top of `relation`). */
  readonly tierRelation?: Partial<Record<LingrongTier, number>>;
  readonly setHate?: number;
  readonly setRelation?: number;
  readonly relation?: number;
  readonly evidence?: EvidenceId;
  /** 陵容 card answers: only these tiers actually come away with the `evidence` (default: any). */
  readonly evidenceTiers?: readonly LingrongTier[];
  readonly exit?: DepartingCard;
  readonly pregnancy?: boolean;
  readonly summon?: "success" | "avoid";
  readonly caoBefriend?: boolean;
  /** 翊坤长跪（有孕）: body loss for this option (before 恨意 / 留方 adjustments). */
  readonly fakuiShenzi?: number;
  /** Negative status this option adds (blocked by nothing; 温太医相助 can remove it). */
  readonly status?: StatusId2;
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
  /** Replaces `flavor` from 年氏倾颓 (第 NIAN_TURN 回合) on, once 年家 has fallen. */
  readonly lateFlavor?: string;
};

/** The flavor a story shows on this turn (年家 rises and falls mid-stage). */
export function storyFlavor2(def: StoryDef2, turn: number): string {
  return def.lateFlavor && turn >= NIAN_TURN ? def.lateFlavor : def.flavor;
}

export const FIXED_STORY_TURNS: Partial<Record<number, StoryId2>> = {
  3: "chuQingan",
  2: "lingrongTuihui",
  4: "yuyingerShishi",
  8: "jiaYunFengbo",
  14: "yuanmingyuan",
  20: "duanfeiJiushi",
  24: "nianShiQingtui",
};
export const FAKUI_TURN = 17;

/** 贵人考验: 眉庄 plays the qin, 陵容 sings, you dance — once per run. */
export const JINGHONG_STORY =
  "眉庄抚琴，陵容清歌，你在御前跳了一支惊鸿舞。琴声歌声里衣袂翩跹，满殿寂静，皇上看得出了神。";
/** 华妃恨意 appears (and is explained) when 初谒翊坤 begins. */
export const HATE_REVEAL_TURN = 3;
/** Opportunity events shuffled into the pool at the end of a given turn. */
export const LATE_OPPORTUNITIES: Partial<Record<number, OpportunityId2>> = { 8: "liPinJingmeng", 10: "supeishengToufeng" };

export const STORIES2: Record<StoryId2, StoryDef2> = {
  chuQingan: {
    id: "chuQingan",
    name: "初谒翊坤",
    emoji: "🏯",
    flavor: "你新晋常在，在皇上跟前露了脸，终于入了华妃的眼。这日去翊坤宫请安，华妃斜倚在榻上，有意给你个下马威。",
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
    name: "凤鸾空返",
    emoji: "🌙",
    flavor: "安陵容第一次侍寝时战战兢兢，没侍成寝就被原样抬回了宫，成了阖宫的笑柄。",
    note: "你的处理决定陵容最初对你的态度。本回合结束时，3 张【陵容相助】加入弃牌堆（下次洗牌时才会抽到）。",
    defaultOptionId: "bixianBuwen",
    options: [
      { id: "bixianBuwen", name: "避嫌不问", effects: [], setRelation: -1, text: "陵容：生分（偏冷）", story: "宫里人人都在笑她，你没有露面。" },
      {
        id: "dengmenKuanwei",
        name: "登门宽慰",
        effects: [{ resource: "qingyu", amount: -1 }],
        setRelation: 2,
        text: "陵容：亲厚；清誉 -1",
        story: "你亲自去看她，陪她说了好一会儿话。宫里正拿她当笑柄，见你与她走得近，连你也一并议论上了。",
      },
      {
        id: "jiemeiTongqu",
        name: "姐妹同去",
        card: "meizhuangXiangzhu",
        effects: [{ resource: "qingyu", amount: 1 }],
        setRelation: 3,
        text: "陵容：亲厚（情分更深）；清誉 +1",
        story: "你和眉庄一起陪她说了半夜的话，三个人的手握在一处。",
      },
      {
        id: "jiaotaGuiju",
        name: "教她规矩",
        card: "jinyanShenxing",
        effects: [{ resource: "qingyu", amount: 1 }],
        setRelation: 2,
        text: "陵容：亲厚；清誉 +1",
        story: "你细细教她侍寝时的规矩，劝她宽心。",
      },
      {
        id: "zengtaYishi",
        name: "赠她衣饰",
        card: "yirongZhengsu",
        effects: [{ resource: "qingyu", amount: 1 }],
        setRelation: 0,
        text: "陵容：生分；清誉 +1",
        story: "你把自己的衣裳首饰送给她，宫里都说你待姐妹大方。她低头道谢，心里却更自卑了。",
      },
      {
        id: "dadianJingshifang",
        name: "打点敬事房",
        card: "shoulongRenxin",
        effects: [],
        setRelation: 1,
        text: "陵容：生分（偏暖）",
        story: "你托人打点敬事房，让她下次侍寝顺顺当当。",
      },
    ],
  },
  yuyingerShishi: {
    id: "yuyingerShishi",
    name: "莺儿伏罪",
    emoji: "🥀",
    flavor: "冒认倚梅园之功的余莺儿恃宠犯上，获罪下狱。",
    defaultOptionId: "bujiu",
    options: [
      { id: "bujiu", name: "不救", effects: [{ resource: "qingyu", amount: -1 }], text: "清誉 -1", story: "你没有替她说一句话。旁人说你心狠。" },
      { id: "qiuqing", name: "求情", effects: [{ resource: "shengchong", amount: -1 }], status: "bimenSiguo", text: "圣宠 -1；闭门思过", story: "你替她求了情，皇上皱眉，说你太过心软。" },
      {
        id: "jiansuZhai",
        name: "递一碗素斋",
        card: "jinyanShenxing",
        effects: [{ resource: "qingyu", amount: 1 }],
        text: "清誉 +1",
        story: "你不求情，也不落井下石，只托人给她递了一碗素斋。宫里人都说你心善，却又不越本分。",
      },
      {
        id: "yuzhongTanshi",
        name: "狱中探视",
        card: "shoulongRenxin",
        effects: [],
        evidence: "yuyingerYiyan",
        text: "可能搜集到华妃的罪证",
        story: "你打点狱卒，见了余莺儿最后一面。她惨笑着说，当初是华妃许她荣华，教她冒认倚梅园之功。",
      },
      {
        id: "lingrongTanshi",
        name: "陵容探视",
        card: "lingrongXiangzhu",
        effects: [],
        evidence: "yuyingerYiyan",
        evidenceTiers: ["close", "distant"],
        text: "视情分，可能搜集到华妃的罪证",
        compact: "🎶 🗂️视情分",
        story: "陵容替你去了一趟狱中。",
        tierStory: {
          close:
            "陵容说：「姐姐不必去那种地方，妹妹替你去。」她去了大半日，回来时脸色发白，指尖冰凉，只低声道：「她都说了。姐姐别问妹妹是怎么问出来的。」说罢便岔开了话头。",
          distant:
            "陵容淡淡应了一声，到底还是去了。回来时神色如常，袖口却洇着一点暗色。她把余莺儿的话原样转述，末了只道：「人到了那个地步，什么都肯说的。」",
          resentful:
            "陵容去了，回来时却只摇了摇头，说余莺儿咬紧牙关，什么也不肯说。你看着她，竟觉得那双眼睛里藏着话，却一句也不肯与你讲。",
        },
      },
    ],
  },
  jiaYunFengbo: {
    id: "jiaYunFengbo",
    name: "菊残霜冷",
    emoji: "⚖️",
    flavor: "眉庄有孕本是喜事，却是华妃串通太医刘畏卿设下的局：药物推迟月信，宫女茯苓被收买。",
    note: "眉庄与温太医，终究要有一人离你远去。退场一方的牌会带上【惜别】标签：下次抓到时只留一张，这是最后一次相助。",
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
        text: "温太医退场；可能搜集到华妃的罪证",
        story: "温实初查出了刘畏卿的药方，眉庄得以洗清，他自己却因此被反咬，派往疫所。",
      },
      {
        id: "maitongFuling",
        name: "买通茯苓",
        card: "shoulongRenxin",
        effects: [],
        exit: "meizhuangXiangzhu",
        evidence: "liuweiqingYaofang",
        text: "眉庄退场；可能搜集到华妃的罪证",
        story: "眉庄的假孕仍被当众揭穿，但被你买通的茯苓供出了刘畏卿。",
      },
      {
        id: "jinxiAnfang",
        name: "槿汐暗访",
        card: "jinxiXiangzhu",
        effects: [],
        exit: "meizhuangXiangzhu",
        evidence: "liuweiqingYaofang",
        text: "眉庄退场；可能搜集到华妃的罪证",
        story: "眉庄的假孕仍被当众揭穿，但槿汐托人在太医院打听到，刘畏卿开给眉庄的方子，原是翊坤宫授意的。",
      },
    ],
  },
  yuanmingyuan: {
    id: "yuanmingyuan",
    name: "圆明伴驾",
    emoji: "🏞️",
    flavor: "皇上带你住进圆明园碧桐书院，恩宠一时无两。",
    note: "本回合不另出召幸；第 15、16 回合每回合都出现召幸（有孕后不再出现）；3 回合后翊坤长跪。",
    defaultOptionId: "anfenSuishi",
    options: [
      { id: "anfenSuishi", name: "安分随侍", effects: [], text: "无变化", story: "你安分随侍，不争不抢。" },
      {
        id: "yuexiaXiangban",
        name: "月下相伴",
        card: "yirongZhengsu",
        effects: [
          { resource: "shengchong", amount: 1 },
          { resource: "hate", amount: 3 },
        ],
        pregnancy: true,
        text: "必定有孕；圣宠 +1；恨意 +3",
        compact: "👶 👑+1 🔥+3",
        story: "月下荷风，你盛装相伴，皇上一连几夜都留宿在碧桐书院。这般招摇，翊坤宫那边怕是早已记恨上了。",
      },
      {
        id: "tiaoyangShengti",
        name: "调养圣体",
        card: "wenTaiyiZhenzhi",
        effects: [
          { resource: "shenzi", amount: 1 },
          { resource: "hate", amount: 1 },
        ],
        text: "身子 +1；恨意 +1",
        compact: "🌱+1 🔥+1",
        story: "你请温实初为皇上和自己调了几剂温补的方子，说是夏日消暑。皇上用着舒心，你也气色渐好；只是这份体贴传到翊坤宫，华妃又添了几分不快。",
      },
      {
        id: "qinshiXianghe",
        name: "琴诗相和",
        card: "jinyanShenxing",
        effects: [
          { resource: "qingyu", amount: 1 },
          { resource: "hate", amount: 1 },
        ],
        pregnancy: true,
        text: "必定有孕；清誉 +1；恨意 +1",
        compact: "👶 🪷+1 🔥+1",
        story: "你抚琴，他吟诗，碧桐书院里琴声常到夜半。你只说是陪皇上消暑解闷，并不张扬。",
      },
    ],
  },
  fakuiPlain: {
    id: "fakuiPlain",
    name: "翊坤长跪",
    emoji: "☀️",
    flavor: "华妃借故罚你跪于翊坤宫外的烈日下，周宁海搬了张凳子坐在廊下盯着。",
    note: "罚跪开始时恨意 ≥ 6，清誉再 -1。",
    defaultOptionId: "lingfa",
    options: [
      {
        id: "lingfa",
        name: "领罚",
        effects: [{ resource: "shenzi", amount: -2 }, { resource: "qingyu", amount: -1 }],
        status: "baoyangZaishen",
        text: "身子 -2、清誉 -1；抱恙在身",
        story: "你在烈日下跪了整整两个时辰，回宫时膝上已是一片青紫。",
      },
      {
        id: "jinxiHuxi",
        name: "槿汐护膝",
        card: "jinxiXiangzhu",
        effects: [{ resource: "shenzi", amount: -1 }],
        status: "baoyangZaishen",
        text: "身子 -1（免去清誉 -1）；抱恙在身",
        story: "槿汐早在你膝下垫了一层软布，又一刻不停地替你打扇。你跪满了时辰，起身时仍是端端正正，没在人前失了体面。",
      },
      {
        id: "feibaoHuangshangPlain",
        name: "宫人飞报皇上",
        card: "shoulongRenxin",
        effects: [{ resource: "shenzi", amount: -2 }, { resource: "shengchong", amount: 1 }],
        status: "baoyangZaishen",
        text: "身子 -2；圣宠 +1（免去清誉 -1）；抱恙在身",
        story: "小允子拼死跑去养心殿报信，皇上赶到时你已经跪了许久。他当场免了余下的时辰，亲自扶你起身，又斥了周宁海几句。你膝上虽疼，这份心疼却记在了他心里。",
      },
      {
        id: "huTiTangyao",
        name: "备下护体汤药",
        card: "wenTaiyiZhenzhi",
        effects: [{ resource: "qingyu", amount: -1 }],
        text: "清誉 -1（免去身子 -2，且不抱恙）",
        story: "温实初早早备下了护体的汤药，让流朱在你临跪前灌下。你跪满了时辰，膝上虽疼，身子却没有大碍。",
      },
      {
        id: "lingrongSongyao",
        name: "陵容送药",
        card: "lingrongXiangzhu",
        effects: [{ resource: "shenzi", amount: -2 }, { resource: "qingyu", amount: -1 }],
        shuhenjiao: true,
        distantRemark: "「跪了这半日，姐姐何苦与华妃硬碰。」",
        text: "身子 -2、清誉 -1（不抱恙）；舒痕胶",
        story: "陵容连夜送来舒痕胶替你敷上，说擦了便不会落疤。",
      },
    ],
  },
  fakuiPregnant: {
    id: "fakuiPregnant",
    name: "翊坤长跪",
    emoji: "☀️",
    flavor: "华妃借故罚你跪于翊坤宫外的烈日下，周宁海守在一旁，谁也不许近前。你腹中隐隐作痛。",
    note: "有孕时必定小产（温太医留方也挡不住），小产本身身子 -2；所选的牌决定另外付出什么代价。罚跪开始时恨意 ≥ 6，身子再 -1；有温太医留方，身子少扣 1。",
    defaultOptionId: "yingcheng",
    options: [
      { id: "yingcheng", name: "硬撑到底", effects: [{ resource: "qingyu", amount: -2 }], fakuiShenzi: 2, text: "小产；身子 -2；清誉 -2", story: "你咬牙跪到最后，起身时裙下已是一片殷红。" },
      { id: "jizhaoTaiyi", name: "急召太医", card: "wenTaiyiZhenzhi", effects: [], fakuiShenzi: 2, text: "小产；身子 -2", story: "温实初冒死闯到翊坤宫外，孩子终究没能保住，但他保住了你。" },
      { id: "feibaoHuangshang", name: "宫人飞报皇上", card: "shoulongRenxin", effects: [{ resource: "shengchong", amount: 1 }], fakuiShenzi: 2, text: "小产；身子 -2；圣宠 +1", story: "小允子拼死跑去养心殿报信，皇上赶到时，一切已经晚了。" },
      { id: "anzhongLiuxin", name: "暗中留心", card: "jingguanQibian", effects: [], fakuiShenzi: 2, status: "baoyangZaishen", text: "小产；身子 -2；抱恙在身", story: "你早有防备，备了参片含在口中，总算撑住了一口气，孩子却终究没能保住。" },
      { id: "jinxiHuchi", name: "槿汐护持", card: "jinxiXiangzhu", effects: [{ resource: "qingyu", amount: -1 }], fakuiShenzi: 2, text: "小产；身子 -2；清誉 -1", story: "槿汐一直跪在你身侧扶着你。你倒下时，是她一把将你抱住，一路喊着太医。" },
      {
        id: "lingrongSongyao",
        name: "陵容送药",
        card: "lingrongXiangzhu",
        effects: [{ resource: "qingyu", amount: -1 }],
        fakuiShenzi: 2,
        shuhenjiao: true,
        distantRemark: "「跪了这半日，姐姐何苦与华妃硬碰。」",
        text: "小产；身子 -2；清誉 -1；舒痕胶",
        story: "孩子终究没能保住。陵容守在你榻前陪你哭了一场，夜里又送来舒痕胶，说膝上的伤擦了便不会落疤。",
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
      { id: "wenyanXiangxun", name: "温言相询", card: "jinyanShenxing", effects: [], evidence: "duanfeiHonghua", text: "可能搜集到华妃的罪证", story: "你轻声问起她的病，端妃沉默良久，终于说出了那碗红花的来历。" },
      {
        id: "weiDuanfeiZhenmai",
        name: "为端妃诊脉",
        card: "wenTaiyiZhenzhi",
        effects: [{ resource: "shenzi", amount: 1 }],
        evidence: "duanfeiHonghua",
        text: "可能搜集到华妃的罪证；身子 +1",
        story: "温实初替端妃诊脉，一语道破她的病根。端妃红了眼眶，说出了当年的红花。",
      },
    ],
  },
  zhaoxing: {
    id: "zhaoxing",
    name: "凤鸾承恩",
    emoji: "🌙",
    flavor: "敬事房的公公来报：今夜皇上翻了你的绿头牌。",
    note: "打出仪容整肃 / 谨言慎行即侍寝成功（圣宠 +1、恨意 +1；贵人以后按身子判定喜脉）；打出陵容相助，效果视情分而定。不处理则错过。欢宜香浓在场时须先化解它。",
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
        text: "效果视你与陵容的情分而定",
        story: "陵容来了碎玉轩。",
      },
    ],
  },
  nianShiQingtui: {
    id: "nianShiQingtui",
    name: "年氏倾颓",
    emoji: "⛓️",
    flavor: "年羹尧获罪下狱，翊坤宫失了靠山。宫里的风向变了，人人都在看你怎么走这一步。",
    note: "你的态度会改变华妃的恨意。",
    defaultOptionId: "geanGuanhuo",
    options: [
      { id: "geanGuanhuo", name: "隔岸观火", effects: [], text: "无变化", story: "你闭门不出，翊坤宫的事一概不问。" },
      {
        id: "luojingXiashi",
        name: "落井下石",
        effects: [
          { resource: "hate", amount: 2 },
          { resource: "shengchong", amount: 1 },
        ],
        text: "恨意 +2、圣宠 +1",
        story: "你在皇上跟前提了几句年家的旧事。皇上点了点头，翊坤宫那边却砸碎了一屋子的瓷器。",
      },
      {
        id: "xuezhongSongtan",
        name: "雪中送炭",
        effects: [
          { resource: "hate", amount: -2 },
          { resource: "shengchong", amount: -1 },
        ],
        text: "恨意 -2、圣宠 -1",
        story: "你派人给翊坤宫送了些点心。华妃没说什么，皇上听说了，却有些不悦。",
      },
      {
        id: "mingzheBaoshen",
        name: "明哲保身",
        card: "jinyanShenxing",
        effects: [
          { resource: "hate", amount: -1 },
          { resource: "qingyu", amount: 1 },
        ],
        text: "恨意 -1、清誉 +1",
        story: "你闭口不谈年家，只在太后跟前尽孝。两边都挑不出你的错处。",
      },
    ],
  },
  caoGuirenLaifang: {
    id: "caoGuirenLaifang",
    name: "琴默叩门",
    emoji: "🍵",
    flavor: "曹贵人心思活络，想替女儿温宜多留一条路。她提着一盒点心，来碎玉轩坐坐。",
    defaultOptionId: "wanjuShuyuan",
    options: [
      { id: "wanjuShuyuan", name: "婉拒疏远", effects: [], text: "曹贵人线结束", story: "你客客气气地送走了她。曹贵人笑意不减，眼底却冷了。" },
      {
        id: "jiejiao",
        name: "结交",
        effects: [{ resource: "qingyu", amount: -2 }],
        caoBefriend: true,
        text: "清誉 -2；【温宜抱恙】洗入机会池",
        compact: "🪷-2 🍵✓",
        story: "你留她用了茶，宫里很快传开了：碎玉轩与翊坤宫的人走得近。曹贵人临走时说，往后多走动。",
      },
      { id: "antongKuanqu", name: "暗通款曲", card: "shoulongRenxin", effects: [], caoBefriend: true, text: "结交，无代价", compact: "🍵✓", story: "你借着送点心回礼，悄悄与她搭上了线。" },
      { id: "xuyuWeiyi", name: "虚与委蛇", card: "jinyanShenxing", effects: [{ resource: "hate", amount: -1 }], text: "恨意 -1；曹贵人线结束", story: "你与她客套周旋，话里话外都替华妃说好话。消息传回翊坤宫，华妃的脸色缓了些。" },
    ],
  },
  huafeiFanan: {
    id: "huafeiFanan",
    name: "殿前风雨",
    emoji: "💥",
    flavor:
      "年羹尧在西北又打了胜仗，华妃风头正盛。她在养心殿里哭诉了大半日，说碎玉轩那位恃宠生娇、目无尊上，屡屡冲撞翊坤宫，非要皇上严惩不可。皇上念着年家的军功，只得传你过去问话。华妃坐在一旁，眼里尽是得意。",
    lateFlavor:
      "年家虽倒，华妃余威仍在，困兽犹斗。她在养心殿里哭诉了大半日，说碎玉轩那位落井下石、目无尊上，非要皇上严惩不可。皇上念着多年旧情，只得传你过去问话。华妃坐在一旁，眼里尽是怨毒。",
    note: "华妃动了真怒：不同的应对付出不同的代价，有的伤名声，有的失圣眷，有的要闭门思过，有的累及身子。处理后恨意回落到 6。",
    defaultOptionId: "renfa",
    options: [
      {
        id: "renfa",
        name: "认罚",
        effects: [
          { resource: "qingyu", amount: -2 },
          { resource: "shengchong", amount: -1 },
          { resource: "shenzi", amount: -2 },
        ],
        status: "bimenSiguo",
        text: "清誉 -2、圣宠 -1、身子 -2；闭门思过",
        story: "你没有辩一句，只叩首认罪。皇上看了华妃一眼，到底还是下了旨：罚你在翊坤宫外跪抄经文，回宫后闭门思过。华妃立在廊下看了半日，你回宫时已站不稳。",
      },
      {
        id: "qiuHuanghou",
        name: "求皇后庇护",
        card: "lingrongXiangzhu",
        effects: [
          { resource: "shengchong", amount: -1 },
          { resource: "shenzi", amount: -2 },
        ],
        text: "圣宠 -1、身子 -2",
        compact: "🎶 👑-1 🌱-2",
        story: "陵容去了一趟景仁宫。剪秋随即来养心殿传了皇后的话：后宫之事，自有中宫料理。皇上顺势把事情交给了皇后，华妃这才收了手。你在养心殿里站着听了大半日数落，回宫时已是头重脚轻。",
        tierStory: {
          close:
            "陵容急得红了眼眶，拉着你的手说：「姐姐别怕，我去求皇后娘娘。」不多时，剪秋便来养心殿传了皇后的话，皇上顺势把事情交给了中宫，华妃这才收了手。陵容回来时裙上沾着灰，想是在景仁宫跪了许久，只笑说不碍事。你这才留意到，她在皇后跟前，原来已经说得上话了。你在养心殿里站着听了大半日数落，回宫时已是头重脚轻。",
          distant:
            "陵容只说了句「我去试试」，便去了景仁宫。剪秋来养心殿传了皇后几句话，皇上便把事情交给了中宫，华妃悻悻收了手。陵容回来时神色如常，只淡淡道：「妹妹在皇后跟前欠下的这份人情，姐姐记着便是。」你在养心殿里站着听了大半日数落，回宫时已是头重脚轻。",
          resentful:
            "陵容并不是为你。只是皇后与翊坤宫素来不睦，乐得借这个由头压一压华妃。剪秋来养心殿传了话，皇上把事情交给了中宫，华妃收了手；陵容站在皇后身后，连看都没看你一眼。你在养心殿里站着听了大半日数落，回宫时已是头重脚轻。",
        },
        tierRelation: { close: -1, distant: -1 },
      },
      {
        id: "juliLizheng",
        name: "据理力争",
        card: "jinyanShenxing",
        effects: [{ resource: "shenzi", amount: -2 }],
        status: "bimenSiguo",
        text: "身子 -2；闭门思过",
        story: "你在御前不卑不亢，把华妃指的错处一条一条驳了回去，保住了体面。华妃气得当场摔了茶盏；皇上被你当着她的面顶撞，脸色难看得很，拂袖而去，旋即下旨命你回宫闭门思过。你站了半日，回去时双腿都已打战。",
      },
      {
        id: "lihuaDaiyu",
        name: "梨花带雨",
        card: "yirongZhengsu",
        effects: [
          { resource: "qingyu", amount: -2 },
          { resource: "shenzi", amount: -2 },
        ],
        text: "清誉 -2、身子 -2",
        story: "你素衣散发，跪在养心殿外哭了一场，只说自己年轻不懂事，惹娘娘动了气。皇上心软，免了大半责罚；华妃却恨得咬牙，阖宫都说你狐媚惑主。",
      },
      {
        id: "jizhenBaoshen",
        name: "急诊保身",
        card: "wenTaiyiZhenzhi",
        effects: [
          { resource: "qingyu", amount: -1 },
          { resource: "shengchong", amount: -1 },
        ],
        text: "清誉 -1、圣宠 -1（身子不扣）",
        story: "你在御前听着华妃一桩桩数落，忽然一阵晕眩。温实初连夜赶来施针，护住了你的身子；皇上见你病势沉重，不好再重罚，只是宫里都传你装病避罪，此后一连数日也没再召你。",
      },
    ],
  },
};

/** 陵容 as a card response to stories (召幸 / 罚跪): tier outcomes. */
export const LINGRONG_SUMMON: Record<LingrongTier, { story: string; result: "success" | "stolen" | "lost"; relation?: number; effects?: readonly Delta2[] }> = {
  close: { result: "success", story: "陵容一早来替你梳妆，又教了你一支新曲。皇上留你到天明。" },
  distant: { result: "stolen", relation: 1, story: "陵容截下了这次召幸，换她去侍寝。「姐姐福气好，也该分妹妹一些。」第二日她来道谢，笑得比平日真了些。" },
  resentful: { result: "lost", relation: 1, effects: [{ resource: "shengchong", amount: -1 }], story: "陵容在半路截走了召幸，皇上那夜宿在了她那里。过后见了你，她竟有几分心虚，难得软语说了几句体己话。" },
};

/** 陵容 on 甄嬛's promotions (关系 -2): shown in the log and the promotion notice. */
export const LINGRONG_PROMOTION_TEXT: Partial<Record<RankId, string>> = {
  guiren: "陵容来碎玉轩道贺，笑得有些勉强：「姐姐如今是贵人了，妹妹往后还要仰仗姐姐。」话没说完，便低下了头。",
  pin: "陵容送来一双亲手绣的虎头鞋，指尖还缠着线：「姐姐如今是嫔了，妹妹……替姐姐高兴。」",
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
    rules: "恨意 3–4：50% 出 1 张；5–6：必出 1 张；7–8：1 张再 50% 加 1 张；9：2 张。恨意 3 解锁翊坤立威、克扣份例；5 解锁膳食有异、一丈红；7 解锁欢宜香浓。按回合开始时的恨意计算。",
  },
  story: {
    label: "剧情",
    lore: "命运的关口，如约而至。",
    rules: "可以选一个基础选项（不占出牌），或从手牌打出卡面所列的牌（占 1 次出牌，另加该牌效果）。不处理就结束回合时，按默认选项处理。",
  },
  trial: { label: "持续", lore: "这一批晋封的名单，就看这几日的表现。", rules: "贵人考验持续第 5—9 回合，召幸（侍寝）也从考验开始后才出现。每回合末判定：圣宠 ≥ 9、清誉 ≥ 9，且考验期间至少侍寝成功一次（缺一不可），即晋为贵人；第 9 回合末仍未满足则失败。" },
  negative: { label: "负面", lore: "缠身的麻烦，一时半刻甩不掉。", rules: "持续性的不利状态。温太医相助可移除 1 个（标“不可移除”的除外）。" },
  positive: { label: "正面", lore: "占得的先机，要趁早用上。", rules: "持续性的有利状态。" },
  lianmei: {
    label: "联袂",
    lore: "姐妹同心，其利断金。",
    rules: "情分亲厚时，陵容在手牌中，她左边或右边的一张牌可以打出而不占出牌名额。每回合最多用一次：用掉后，本回合所有陵容的联袂标签都变灰，下回合重新亮起。",
  },
  chezhou: { label: "掣肘", lore: "处处牵制，暗中作梗。", rules: "情分怨怼时，陵容在手牌中，她左右相邻的牌不能打出（陵容自己不受影响）。打出陵容后解除。" },
  yiyi: { label: "依依", lore: "依依不舍，缠着姐姐不肯走。", rules: "情分生分时，陵容在回合末不进弃牌堆，留在手牌最左边；留下几张，下回合就少抓几张。" },
  xibie: { label: "惜别", lore: "人将远去，情分只够再相助一回。", rules: "第一次抓到此人的牌时，其余同名牌立即离场，只留这一张，这是最后一次相助。打出时按惜别效果结算，打出后离场；本回合没打出则照常进弃牌堆、洗回牌库，还有机会再用。" },
  shuhenjiao: { label: "舒痕胶", lore: "祛疤的药膏，香气清冽。", rules: "陵容送药时送来。情分亲厚时无害，并圣宠 +1；生分时也可能疤痕尽消（圣宠 +1）；情分越差，越可能有害（有害时身子 -1，最多扣到 1）。" },
  harm: { label: "伤胎", lore: "防不胜防的暗手。", rules: "未化解时：有孕前身子 -1；有孕后直接小产。温太医留方可抵消一次。" },
  burn: { label: "延烧", lore: "拖得越久，越难收拾。", rules: "未化解时圣宠 -1 并留到下回合（不占下回合的华妃事件名额）；下回合仍未化解，圣宠 -2 后离场。" },
  double: { label: "双牌", lore: "一个人扛不住，就得多想一步。", rules: "同一回合内打出两张匹配牌才算化解，每张牌自身效果照常结算；回合末不满 2 张则进度清零。" },
  evidence: { label: "线索", lore: "华妃的罪状，一桩桩都要攒在手里。", rules: "第 30 回合【翊坤落幕】：罪证 ≤ 1 条直接失败；2–3 条须打出 3 张牌，4–6 条 2 张，≥ 7 条 1 张；没打够即失败。罪证 ≥ 5 条为完胜。" },
};

// 罪证
import type { CardId2, DepartingCard } from "./cards";
import type { LingrongTier } from "./lingrongRelation";

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
    name: "刘畚药方",
    line: "华妃指使太医刘畚用药推迟月信，设局诬眉庄假孕争宠",
    ending: "刘畚的药方一摆上御案，眉庄假孕一案便真相大白。",
  },
  fuziZhisi: {
    id: "fuziZhisi",
    emoji: "👻",
    name: "福子之死",
    line: "余莺儿死后，丽嫔惊梦，供出华妃害死宫女福子、沉尸井中，又推眉庄落水",
    ending: "丽嫔疯疯癫癫的供词里，宫女福子的冤魂有了着落，眉庄当年落水也并非失足。",
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

/** 第二关失败结局的剧情文本（清誉 / 圣宠归零、贵人考验未过；翊坤落幕两种失败另见 FINALE）。 */
export type Loss2Kind = "qingyu" | "shengchong" | "trial";
export const LOSS2_STORY: Record<Loss2Kind, string> = {
  qingyu:
    "华妃抓住了你的把柄，一道懿旨便将你的名声踩进了泥里。皇后冷眼旁观，从不出言替你分辩。往日同你亲近的人纷纷避开，碎玉轩的门前冷得连风都懒得停留。你终于明白，在这宫里，清誉是比性命更先碎的东西。",
  shengchong:
    "那盏为你留着的宫灯，不知从哪一夜起再没有亮过。皇上翻牌子时，目光掠过你的名字，没有半分停留。翊坤宫的歌舞声隔着宫墙传来，一声声，都在提醒你，恩宠这样东西，来时如春水，去时也无声无息。",
  trial:
    "晋封的旨意颁下，六宫皆有封赏，唯独不见你的名字。华妃在席间笑意盈盈，说“有些人，终究是福薄”。你低头拢了拢袖口，没有人看见你指尖在发颤。贵人的位分近在咫尺，却终究与你擦肩而过。",
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
      ["fuziZhisi", "你跪在御前，一字一句道：「福子不过一个宫女，好端端地沉在了井里。丽嫔娘娘夜夜惊梦，福子沉井、眉庄落水，桩桩都与翊坤宫脱不了干系，心里有鬼的人，夜里是睡不安稳的。」"],
      ["lanyongSixing", "你跪在御前，一字一句道：「夏常在不过一时言语冲撞，便在翊坤宫外受了一丈红，落得终身残废。这等私刑，宫规里哪一条许过？」"],
      ["duanfeiHonghua", "你跪在御前，一字一句道：「端妃娘娘这些年缠绵病榻、终身无出，皆因当年翊坤宫送去的那碗红花。臣妾不敢妄言，只求皇上明察。」"],
    ],
    meizhuangXiangzhu: [
      ["liuweiqingYaofang", "眉庄挺直了背，朗声道：「皇上，臣妾当日假孕失宠，正是翊坤宫串通刘畚一手设下的局。臣妾至今想起，仍觉心寒。」"],
      ["kekouZhangce", "眉庄挺直了背，朗声道：「臣妾禁足闲月阁时，连炭火都被克扣了去。内务府的人亲口说，是翊坤宫的意思。」"],
      ["lanyongSixing", "眉庄挺直了背，朗声道：「一丈红的事，阖宫都知道。夏常在年轻不懂事，可罪不至此，华妃却连一句求情的话都不许人说。」"],
      ["yuyingerYiyan", "眉庄挺直了背，朗声道：「余氏冒认倚梅园之功，背后若无人撑腰，她一个宫女哪来这样的胆子？」"],
    ],
    wenTaiyiZhenzhi: [
      ["liuweiqingYaofang", "温实初捧着脉案跪下：「刘畚开给沈小主的方子，微臣一味一味验过，皆是推迟月信之药。微臣愿以项上人头担保，此事出自翊坤宫授意。」"],
      ["duanfeiHonghua", "温实初捧着脉案跪下：「微臣替端妃娘娘诊过脉，娘娘的病根，是多年前一碗红花落下的。脉案在此，绝无半字虚言。」"],
      ["kekouZhangce", "温实初捧着脉案跪下：「那年冬天碎玉轩断了炭火，小主受寒抱恙，脉案上都有记档。内务府克扣份例，是翊坤宫的吩咐。」"],
    ],
    shoulongRenxin: [
      ["lanyongSixing", "小允子领着一众宫人跪了一地，叩首道：「那年翊坤宫外的一丈红，奴才们都在场。夏小主是怎么被打成那样的，奴才们亲眼看着，至今夜里还会惊醒。」"],
      ["fuziZhisi", "小允子领着一众宫人跪了一地，叩首道：「福子姑娘出事那夜，有人瞧见翊坤宫的人往井边去过。奴才们人微言轻，这话憋了这些年，今日不敢不说。」"],
      ["kekouZhangce", "小允子领着一众宫人跪了一地，叩首道：「奴才们年年去内务府领东西，哪一宫少了炭、少了米，又是谁吩咐扣下的，奴才们心里都有数。」"],
      ["yuyingerYiyan", "小允子领着一众宫人跪了一地，叩首道：「余答应临去前在冷宫里说的话，看守的公公也听见了：倚梅园那夜的功劳，是翊坤宫教她冒认的。」"],
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
      ["fuziZhisi", "「丽嫔娘娘惊梦时，喊的是余答应的名字，嘴里翻来覆去只说『不是我，别来找我』。福子是怎么沉的井，眉庄是被谁推下去的，丽嫔心里最清楚，翊坤宫也最清楚。」"],
      ["yuyingerYiyan", "「余答应在冷宫里说的话，臣妾也听说了：倚梅园那夜的功劳，是翊坤宫教她冒认的。」"],
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
  /** 完美结局 (§11.3): the one who left at 菊残霜冷 is cleared by 华妃's fall, returns, and speaks for you one last time; the 欢宜香 secret comes out. */
  perfectIntro: {
    meizhuangXiangzhu:
      "眉庄回来了。当年华妃串通刘畚，用药推迟月信，设下假孕的局，害她失宠禁足闲月阁，从此心灰意冷。如今华妃的底细被一层层揭开，眉庄的冤屈终于得雪，她重新立在御前，为你说了最后一次话，字字都落在要紧处。",
    wenTaiyiZhenzhi:
      "温实初回来了。当年华妃害眉庄假孕失宠，他出面辩白，反被咬定“妄议脉案”，贬去疫所。如今华妃的底细被一层层揭开，他的冤屈终于得雪，奉旨回宫，立在御前，为你说了最后一次话，字字都落在要紧处。",
  } as Record<DepartingCard, string>,
  perfectStory:
    "华妃还想抵赖，皇上却抬手止住了她，沉默良久，缓缓开口：「欢宜香里掺了什么，朕比谁都清楚。」满殿的人都变了脸色。他说，那香是他默许她用了这么多年的；他忌惮年家，也不愿再看见年家的血脉承继宫闱。华妃如遭雷击，跌坐在地。皇上看着你，目光复杂，只道了一句：「这些年，委屈你们了。」旨意随即颁下：华妃褫夺封号，打入冷宫，年氏一门尽数削权。你立于殿中，回头望去，{who}眼中含泪带笑。这一程你们并肩走到了最后，也走得最漂亮。",
  failStory: "你没能在御前把话说透。皇上念及旧情，华妃复起，翊坤宫的灯又亮了。",
  hopelessStory: "年家倒了，你手里却几乎拿不出华妃的一条罪状。皇上念及旧情，华妃复起，翊坤宫的灯又亮了。",
};

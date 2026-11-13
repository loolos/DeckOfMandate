// stories
import type { RankId } from "../content";
import type { CardId2, DepartingCard } from "./cards";
import type { HuafeiId, OpportunityId2 } from "./events";
import type { EvidenceId } from "./evidence";
import type { LingrongTier } from "./lingrongRelation";
import type { MarkRequirement } from "./marks";
import type { Delta2 } from "./resources";
import type { StatusId2 } from "./statuses";

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
  /** 玉阶炎日（有孕）: body loss for this option (before 恨意 / 留方 adjustments). */
  readonly fakuiShenzi?: number;
  /** 玉阶炎日（有孕）: text for the 小产 popup, differs per option. */
  readonly miscarriageStory?: string;
  /** Negative status this option adds (blocked by nothing; 温太医相助 can remove it). */
  readonly status?: StatusId2;
  /** 生分的陵容打出这个卡牌应对时多说的一句风凉话。 */
  readonly distantRemark?: string;
  readonly shuhenjiao?: boolean;
  /** Only offered when 第一关 left this 旧事印记 (see marks.ts). */
  readonly mark?: MarkRequirement;
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
  /** With 抱恙在身 / 卧床静养 (a `noSummon` status) in effect, only these options may be taken (others are barred). */
  readonly unwellOptionIds?: readonly string[];
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

/** 贵人考验: 眉庄 writes the music, 陵容 sings, you dance — once per run. */
export const JINGHONG_STORY =
  "眉庄谱了新曲，陵容一遍遍试唱，你们三人关起门来排了好几日，说说笑笑，亲密得仿佛还是刚入宫时的样子。到了御前，陵容清歌婉转，你踏着眉庄的曲子跳了一支惊鸿舞，衣袂翩跹，满殿寂静。一曲终了，皇上久久没有出声，半晌才抚掌笑道：「朕竟不知，你们姐妹还藏着这样的本事。」当晚的赏赐流水般送进了碎玉轩，皇上看你的目光，也与往日不同了。";
/**
 * 闲月阁 (once per run): with 隔墙有耳 on the board, play 槿汐相助, 眉庄相助 and 收拢人心 in the same turn
 * to unmask 浣碧 — a false lead sends 华妃 storming into 闲月阁 for nothing.
 */
/** 琴默陈情: both 解牌 played in one go — 曹贵人 gives extra sources for evidence already on the board. */
export const CAO_PAIR: readonly CardId2[] = ["shoulongRenxin", "jinyanShenxing"];
export const CAO_TESTIMONY = {
  evidence: ["yuyingerYiyan", "maiguanYujue", "kekouZhangce"] as readonly EvidenceId[],
  log: "曹贵人推心置腹，道出多桩旧事，皆可为华妃的罪证添一份人证。",
  /** Popup paragraphs. */
  story: [
    "你先以利害相陈，再以温宜公主的前程相劝，一张一弛，不露半分机锋。曹贵人静听良久，终于缓缓起身，在你面前敛衽一礼：「姐姐肯为温宜思虑，妹妹岂能再袖手旁观。」",
    "她压低了声音，将翊坤宫内外的旧事一一道来：倚梅园之功原是余莺儿冒名顶替，背后全是华妃授意；年羹尧在外卖官鬻爵，宫里的打点皆出自华妃之手；至于宫中蜚语盈廊、寒凉之物、克扣份例种种，也皆是华妃一手指使，下头人不过奉命行事。",
    "这些事，你原先只握着零星线索，如今得曹贵人亲口佐证，便有了另一重来历，足以与旧日的人证物证互为印证。",
  ] as readonly string[],
} as const;

export const XIANYUEGE = {
  event: "songzhiKuisi" as HuafeiId,
  cards: ["jinxiXiangzhu", "meizhuangXiangzhu", "shoulongRenxin"] as readonly CardId2[],
  hint: "本回合同时打出这三张牌，可揪出碎玉轩真正的内鬼：",
  log: "闲月阁：你只对浣碧放了假消息，华妃果然带人闯进闲月阁扑了个空，反被皇上斥责。浣碧认了错，从此一心向你。",
  /** Popup paragraphs: the false lead, 华妃 storming 闲月阁 for nothing, 浣碧 owning up. */
  story: [
    "碎玉轩里的一举一动，翊坤宫总能知道得一清二楚。那个往外跑的小宫女不过是明面上的，你心里另有一个疑影：浣碧。她是你的妹妹，却不得不以婢女自居，心里憋着多少不平，你不是不知道。这事你不愿冤枉了她，也不能再放任下去，便想了个法子试她一试。",
    "这日你只对浣碧一人说：「今晚我要去闲月阁看眉庄姐姐，你留在宫里，哪儿也不许去。」眉庄奉旨禁足，私下探望便是抗旨，这话若传出去，便是现成的把柄。槿汐替你换了宫女的衣裳，小允子早早守在后门，你们三人装作要出门的样子，还特意在院里转了一圈，才又悄悄折回屋内，熄了灯。你前脚刚装作出了门，浣碧便从后门溜了出去。",
    "当夜华妃带着人闯进闲月阁，翻箱倒柜，只见眉庄独自在灯下抄经，笔也没停，抬眼淡淡看了她一眼：「娘娘深夜驾到，是来听臣妾念经的？」哪里有你的影子。华妃脸上的得意僵住了，还想再搜，皇上闻讯赶来，你随后从容而至，原来你根本不曾踏进闲月阁半步。华妃无凭无据深夜搜宫，皇上沉了脸，斥她轻率跋扈。原本有意让她重掌协理六宫之权，这下也暂且搁置了。",
    "回到碎玉轩，你屏退众人，只问浣碧华妃怎么会知道得这样准。她咬着唇不肯认，你却没有发落她。你说，你一直知道她是谁的女儿，也从没想过让她一辈子做奴婢，将来总要替她谋一个体面的身份、一门好亲事。浣碧跪在地上哭了许久，终于认了错，说她只是不甘心，一时糊涂，才把你的话说给了翊坤宫的人听。从那以后，碎玉轩的话再没传出去过，她替你守门、传话，比谁都用心。",
    "夜深人静，闲月阁外的守卫被方才那一场闹腾折腾得疲惫，三三两两靠在廊柱上打起了瞌睡。你换上槿汐的宫女衣裳，趁他们松懈，从后墙的角门悄悄溜了进去。门一开，眉庄正坐在窗下，身上披着一件半旧的藕色褙子，脸色比从前清减了许多，眼里却有了光亮。采月忙着添茶，她摆摆手让人退下，拉着你坐在榻边，笑道：「方才华妃的脸色，我这辈子都忘不了。」你也忍不住笑了，两个人想起华妃扑空时的狼狈，压着嗓子笑得前仰后合，直笑出了眼泪。",
    "笑过了，眉庄才慢慢收了神色，低声说起这些日子的闭门不出，说起抄经时心里反倒静了下来。她握着你的手：「我如今这样，不指望什么了，只盼着你好好的。往后宫里的路，你得自己走稳。」你点点头，说你会常来。更漏声声，炉上的茶一点点凉了，你们谁也没有再说话，只是静静地坐着，像从前在碎玉轩里那样，直到天色将明，守卫快要换班，你才匆匆离去。",
  ] as readonly string[],
  /** 弹窗默认显示的简要版；点「展开详情」才看完整的 story。 */
  storyBrief:
    "翊坤宫总能把碎玉轩的动静知道得一清二楚，你疑心浣碧，便只对浣碧一人说今晚要去闲月阁探望禁足的眉庄。当夜华妃带人闯进闲月阁扑了空，反被皇上斥责轻率跋扈，协理六宫之权也暂且搁置。你回宫问起，浣碧终于认了错，你没有发落她，只说将来总要替她谋个体面的身份。当夜趁守卫松懈，你悄悄溜进闲月阁与眉庄小聚，两人说起华妃扑空的狼狈，笑得直落泪，又静静坐到天将明。",
};
/** 端妃旧事 popup (after 温言相询 / 为端妃诊脉): 端妃 tells, in her own words, why 华妃 forced 红花 on her. */
export const DUANFEI_STORY: readonly string[] = [
  "端妃拢了拢膝上的薄毯，目光落在窗外那株半枯的海棠上，许久才开口：「我与年世兰同是潜邸旧人。她头一回有孕那年，年家正如日中天，她哥哥手握重兵，满朝上下谁不让着三分。她若再生下皇子，那孩子往后会是什么分量，宫里人心里都有数。」",
  "「有一回，太医院的人找到我，只说让我把一碗药端去给华妃，别的一概不提。旧人探望旧人，原也不显得突兀。我没有多问，也不敢多问。我端着药进了她的屋子，看着她喝下去。不过半日，她便腹痛如绞，孩子没有保住。」",
  "「她从此恨极了我。后来她有了协理六宫的权柄，头一件事，便是传我去翊坤宫。满屋子的人都退了出去，只留一碗黑漆漆的红花搁在案上。我跪着求她，她只是笑，说：『你欠本宫的，该还了。』颂芝按住我的肩，那碗红花是她亲眼看着灌下去的。」",
  "「血流了一夜，我从此再不能有孕。身子也是那时落下的病根，一到阴雨天便浑身发冷，咳起来夜里不得安睡。这些年我避世深居，不争不抢，她倒渐渐当我是个无关紧要的人。这些话我没对旁人提过一个字，今日说与你听，不为别的，只因你跪在她阶下受过的苦，我都受过，你该知道她的手段。」",
];

/** 端妃旧事弹窗默认显示的简要版；点「展开详情」才看完整的 DUANFEI_STORY。 */
export const DUANFEI_BRIEF =
  "端妃说，她与年世兰同是潜邸旧人。华妃头一回有孕时，有人让她端一碗药去探望，那孩子没了，华妃从此恨极了她。后来华妃得了协理六宫之权，第一件事便是传她去翊坤宫，灌下一碗红花，端妃从此再不能有孕，还落下阴雨天发冷的病根。她这些年避世不争，从没对旁人提过，今日说与你听，是因为你受过的苦她都受过，你该知道华妃的手段。";

/** 菊残霜冷 popup (after the 第 8 回合 event resolves): the whole 假孕 affair, then a branch per way it was answered. */
export const JIAYUN_STORY = {
  title: "菊残霜冷",
  /** The shared account: 刘畚 misleads, 茯苓 informs. */
  common: [
    "眉庄月信迟迟不至，太医刘畚请脉后，满面喜色地向她道贺，说是滑脉如珠，已有月余。阖宫上下都以为这是天大的喜事，眉庄自己亦欢喜得夜不能寐，日日小心保养，连碎玉轩送去的点心也要先命人试过才肯入口。她哪里知道，刘畚开给她的那几剂汤药，原是翊坤宫授意的，药性只管推迟月信，脉象也因之虚浮如孕。",
    "那太医说得言之凿凿，眉庄信了，旁人也信了。偏在此时，眉庄身边那个叫茯苓的宫女忽然红着眼睛跪到了皇后跟前，战战兢兢地告发：主子这些日子并无孕吐，也不见身形有变，所谓有孕，不过是借着汤药遮掩，意在欺瞒圣听、邀宠固位。她说得声泪俱下，仿佛是不忍主子一错再错。其实她早已被翊坤宫的银钱收买，一字一句，都是人家教好的。",
    "皇上闻讯震怒，当即传太医会诊，偏偏最先诊脉的刘畚早已趁乱逃出宫去，遍寻不见。来的是章院判章弥，与江诚、江慎兄弟。三人轮番搭了脉，章弥捻须沉吟良久，才躬身回禀：“先前的诊断有误，小主并无喜脉。”江诚、江慎亦附和称是。一句“有误”，把脉案翻了个底朝天；那推迟月信的汤药出自谁手，刘畚又为何逃走，竟无人再问。",
    "眉庄立在殿中，脸色白得像霜后的菊。她没有哭，也没有辩，只抬头看了皇上一眼，那一眼里没有怨，倒像是把什么东西彻底放下了。",
  ] as readonly string[],
  /** Brief of the shared account, shown first; each branch appends its own brief. */
  brief:
    "眉庄月信迟迟不至，太医刘畚诊为喜脉，其实那几剂汤药是翊坤宫授意开下的，药性只管推迟月信，脉象也虚浮如孕。待阖宫道贺之后，被翊坤宫收买的宫女茯苓忽然跪到皇后跟前，告发主子假孕欺君。皇上震怒，传太医会诊，刘畚却已逃走，无从找起；章院判章弥与江诚、江慎兄弟诊后，只说先前诊断有误、并无喜脉，眉庄立在殿中，神色如霜后之菊。",
  branches: {
    xiushouPangguan: {
      brief: "你始终没有开口。眉庄被降位禁足于闲月阁，也看清了你的袖手，从此心灰意冷，再不愿过问后宫之事。",
      paras: [
        "你立在人群里，袖中的手攥得生疼，终究一句话也没有说。你知道此刻开口，不过是多搭进去一个人，可你也知道，眉庄看见了你的沉默。",
        "旨意下来，眉庄被降了位分，禁足于闲月阁。她临去时回头望了你一眼，目光平静，平静得叫人心惊。此后你再递去的话，她只淡淡应着；后宫的是非，她一概不肯再听、不肯再问。有些人是被霜打落的，有些人，是自己松了手。",
      ],
    },
    chumianLibao: {
      brief: "你请温实初出面力保，没能挽回，眉庄仍被禁足。华妃反咬温太医妄议脉案，又逢时疫，他被打发去了疫所。眉庄知道你们尽了力，心里那口气没散。",
      paras: [
        "你终究不肯看着她这样走进去，转身请了温实初。他素来谨慎，那日却当殿直言，说眉庄脉象有异，疑是药物所致，请皇上详查。话音未落，华妃已冷冷截住，咬定他妄议脉案、结党攀附。",
        "眉庄仍被禁足于闲月阁，温实初因此得罪了翊坤宫，恰逢宫外时疫，一道旨意便将他遣去了疫所。眉庄后来听说此事，沉默了许久，只托人带来一句话：「难为你们了。」她并未心灰，那口气还在，只是要在冷清的院子里慢慢熬着。",
      ],
    },
    chayanYaofang: {
      brief: "温实初暗中查出了刘畚的药方，可华妃抢先一步，眉庄仍被禁足，温实初反被咬定妄议脉案、遣往疫所。药方被你收好，眉庄也知道你们尽了力。",
      paras: [
        "你没有急着去殿前喊冤，只请温实初悄悄取来刘畚开给眉庄的药方。他逐味看过，眉头越锁越紧：安胎之名下，竟藏着压抑月信的药材，分量拿捏得恰到好处，显见是行家的手笔。",
        "可华妃快了一步。温实初的话尚未递上去，她已先发制人，说他妄议脉案、搅扰宫闱。眉庄仍被禁足于闲月阁，温实初则被打发去了疫所。药方却叫你悄悄收了起来，纸上的墨迹分明，将来总有用得上的一天。眉庄得知你们为她奔走，心里那口气，终究没有散。",
      ],
    },
    maitongFuling: {
      brief: "你买通了茯苓，她供出了刘畚，可眉庄的假孕仍被当众揭穿，禁足闲月阁。眉庄已心灰意冷，再不愿理会后宫之事。",
      paras: [
        "你想起那个跪在殿前哭得最凶的宫女。银子能买她背主，自然也能买她开口。夜里你命人悄悄寻到茯苓，几句话便问得她冷汗涔涔，终于把刘畚如何教她说话、翊坤宫又赏了她多少，一五一十都吐了出来。",
        "只是这时候供词再清楚，也救不了眉庄：假孕已被当众揭穿，她仍旧禁足于闲月阁。眉庄听说了茯苓的事，只轻轻笑了一声，说人心原是这样的，可笑她竟信了这么久。她不再愿理会后宫之事，案头只剩一卷经，一盏冷茶。",
      ],
    },
    jinxiAnfang: {
      brief: "槿汐托人在太医院打听出，刘畚的方子原是翊坤宫授意的。眉庄的假孕仍被揭穿，禁足闲月阁，她已心灰意冷，再不愿理会后宫之事。",
      paras: [
        "槿汐在宫里多年，人脉都藏在不起眼的地方。她换了便服，借着给太医院送东西的由头，在药房、值房之间走动了两日，终于从一个老药童嘴里问出：刘畚开给眉庄的方子，是翊坤宫的人亲自吩咐过的，连几味药该下几钱都交代好了。",
        "消息递到你手上时，眉庄已被禁足于闲月阁。这一线真相来得迟了些，救不回她的位分，却也让你看清了对头的手段。眉庄听完始末，静静无话，半晌才道：「我只当是自己福薄。」从此她心灰意冷，闭了院门，再不愿理会后宫里的一切。",
      ],
    },
  } as Record<string, { brief: string; paras: readonly string[] }>,
};

/** 玉阶炎日（有孕）小产弹窗里接在各选项剧情之后：皇上得知后对华妃的不满。 */
export const FAKUI_MISCARRIAGE_AFTERMATH =
  "消息传到养心殿，皇上震怒，沉着脸斥华妃心狠手辣，全不顾及龙裔。他当夜便来看你，坐在榻边久久不语，临走时只说了一句：「是朕对不住你。」此后一连数日，翊坤宫派人来请，他都托词不去，对华妃的不满再明白不过。";

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
        name: "陪她温习",
        card: "jinyanShenxing",
        effects: [{ resource: "qingyu", amount: 1 }],
        setRelation: 2,
        text: "陵容：亲厚；清誉 +1",
        story: "你陪她把侍寝那日的礼数一桩桩理了一遍，不说教，只陪她把心里的怯放下。",
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
    flavor: "冒认倚梅园之功的余莺儿恃宠犯上，获罪打入冷宫。",
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
        name: "冷宫探视",
        card: "shoulongRenxin",
        effects: [],
        evidence: "yuyingerYiyan",
        text: "可能搜集到华妃的罪证",
        story: "你打点冷宫的看守，见了余莺儿最后一面。她惨笑着说，当初是华妃许她荣华，教她冒认倚梅园之功。",
      },
      {
        id: "jiuriPozhan",
        name: "旧日破绽",
        card: "meizhuangXiangzhu",
        mark: { yimei: "jiemeiChafang" },
        effects: [],
        evidence: "yuyingerYiyan",
        text: "可能搜集到华妃的罪证",
        story: "你带着眉庄当年记下的那几处破绽去了冷宫。余莺儿听你一件件说出当夜当值的宫人、几时点的灯，脸色渐渐灰了，终于惨笑着说，当初是华妃许她荣华，教她冒认倚梅园之功。",
      },
      {
        id: "tuoJiushi",
        name: "托旧识探视",
        mark: { yimei: "gongrenToudi" },
        effects: [{ resource: "qingyu", amount: -1 }],
        evidence: "yuyingerYiyan",
        text: "清誉 -1；可能搜集到华妃的罪证",
        story: "你托当年赏过银子的小太监引路，趁夜去冷宫见了余莺儿最后一面。她惨笑着说，当初是华妃许她荣华，教她冒认倚梅园之功。事后有人说你与冷宫的人来往过密，名声受了些损。",
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
        story: "陵容替你去了一趟冷宫。",
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
    flavor: "眉庄有孕本是喜事，却是华妃串通太医刘畚设下的局：药物推迟月信，宫女茯苓被收买。",
    note: "眉庄与温太医，终究要有一人离你远去。退场一方的牌会带上【惜别】标签：下次抓到时只留一张，这是最后一次相助。",
    defaultOptionId: "xiushouPangguan",
    options: [
      {
        id: "xiushouPangguan",
        name: "袖手旁观",
        effects: [],
        exit: "meizhuangXiangzhu",
        text: "眉庄退场",
        story: "眉庄假孕被当众揭穿，降位禁足于闲月阁。你始终没替她说一句话，她从此心灰意冷，再不愿理会后宫之事。",
      },
      {
        id: "chumianLibao",
        name: "出面力保",
        effects: [{ resource: "hate", amount: 1 }],
        exit: "wenTaiyiZhenzhi",
        text: "温太医退场；恨意 +1",
        story: "你请温太医出面替眉庄说话，到底没能挽回：眉庄仍被禁足于闲月阁，温实初反被华妃咬定“妄议脉案”，又逢时疫，被派往疫所。眉庄知道你们为她尽了力，心里那口气没散。",
      },
      {
        id: "chayanYaofang",
        name: "查验药方",
        card: "wenTaiyiZhenzhi",
        effects: [],
        exit: "wenTaiyiZhenzhi",
        evidence: "liuweiqingYaofang",
        text: "温太医退场；可能搜集到华妃的罪证",
        story: "温实初查出了刘畚的药方，可华妃抢先一步，眉庄仍被禁足于闲月阁，温实初反被咬定“妄议脉案”，派往疫所。药方被你收好了，眉庄也知道你们为她尽了力，心里那口气没散。",
      },
      {
        id: "maitongFuling",
        name: "买通茯苓",
        card: "shoulongRenxin",
        effects: [],
        exit: "meizhuangXiangzhu",
        evidence: "liuweiqingYaofang",
        text: "眉庄退场；可能搜集到华妃的罪证",
        story: "眉庄的假孕仍被当众揭穿，禁足于闲月阁。被你买通的茯苓供出了刘畚，眉庄却已心灰意冷，再不愿理会后宫之事。",
      },
      {
        id: "jinxiAnfang",
        name: "槿汐暗访",
        card: "jinxiXiangzhu",
        effects: [],
        exit: "meizhuangXiangzhu",
        evidence: "liuweiqingYaofang",
        text: "眉庄退场；可能搜集到华妃的罪证",
        story: "眉庄的假孕仍被当众揭穿，禁足于闲月阁。槿汐托人在太医院打听到，刘畚开给眉庄的方子原是翊坤宫授意的，眉庄却已心灰意冷，再不愿理会后宫之事。",
      },
    ],
  },
  yuanmingyuan: {
    id: "yuanmingyuan",
    name: "圆明伴驾",
    emoji: "🏞️",
    flavor: "皇上带你住进圆明园碧桐书院，恩宠一时无两。",
    note: "3 回合后玉阶炎日。身负【抱恙在身】或【卧床静养】时，只能安分随侍或由温太医相助。",
    defaultOptionId: "anfenSuishi",
    unwellOptionIds: ["anfenSuishi", "tiaoyangShengti"],
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
    name: "玉阶炎日",
    emoji: "☀️",
    flavor: "皇上与皇后都去了宫外祈福，六宫暂由华妃协理，翊坤宫里便是她说了算。这日一早，华妃便借着一桩不值一提的小过，传你前去问话，话没说上两句，就罚你跪在翊坤宫外的青砖上。正午的日头毒辣，砖面烫得几乎灼人，周宁海搬了张凳子坐在廊下盯着，宫人们远远避开，谁也不敢近前。你垂着眼，一滴汗顺着鬓角滑进衣领，心里明白，这一跪原是冲着你来的，今日有谁肯为你开口，就看你平日里攒下了什么。",
    note: "罚跪开始时恨意 ≥ 6，清誉再 -1。",
    defaultOptionId: "lingfa",
    options: [
      {
        id: "lingfa",
        name: "领罚",
        effects: [{ resource: "shenzi", amount: -2 }, { resource: "qingyu", amount: -1 }],
        status: "baoyangZaishen",
        text: "身子 -2、清誉 -1；抱恙在身",
        story: "你在烈日下跪了整整两个时辰，回宫时膝上已是一片青紫。后来皇上听说你在烈日下白白跪了两个时辰，皱着眉说华妃罚得过了，心里很是不满。",
      },
      {
        id: "jinxiHuxi",
        name: "槿汐护膝",
        card: "jinxiXiangzhu",
        effects: [{ resource: "shenzi", amount: -1 }],
        status: "baoyangZaishen",
        text: "身子 -1（免去清誉 -1）；抱恙在身",
        story: "槿汐早在你膝下垫了一层软布，又一刻不停地替你打扇。你跪满了时辰，起身时仍是端端正正，没在人前失了体面。此事传到御前，皇上虽没发作，也嫌华妃借故罚人太过，对她很是不满。",
      },
      {
        id: "feibaoHuangshangPlain",
        name: "宫人求见太后",
        card: "shoulongRenxin",
        effects: [{ resource: "shenzi", amount: -2 }, { resource: "shengchong", amount: 1 }],
        status: "baoyangZaishen",
        text: "身子 -2；圣宠 +1（免去清誉 -1）；抱恙在身",
        story: "皇上与皇后都去宫外祈福，宫中无人能替你做主。小允子拼死跑去寿康宫求见太后，太后赶到时你已经跪了许久。她当场免了余下的时辰，命人扶你起身，又斥了周宁海几句。待皇上回宫，这份委屈自会有人替你说到他耳边。皇上回宫听说后，当面训了华妃几句，脸色很不好看，对她的不满也记在了心里。",
      },
      {
        id: "huTiTangyao",
        name: "备下护体汤药",
        card: "wenTaiyiZhenzhi",
        effects: [{ resource: "qingyu", amount: -1 }],
        text: "清誉 -1（免去身子 -2，且不抱恙）",
        story: "温实初早早备下了护体的汤药，让流朱在你临跪前灌下。你跪满了时辰，膝上虽疼，身子却没有大碍。皇上日后得知华妃这般罚人，也很是不悦，嫌她仗着年家的势越发不知收敛。",
      },
      {
        id: "lingrongSongyao",
        name: "陵容送药",
        card: "lingrongXiangzhu",
        effects: [{ resource: "shenzi", amount: -2 }, { resource: "qingyu", amount: -1 }],
        shuhenjiao: true,
        distantRemark: "「跪了这半日，姐姐何苦与华妃硬碰。」",
        text: "身子 -2、清誉 -1（不抱恙）；舒痕胶",
        story: "陵容连夜送来舒痕胶替你敷上，说擦了便不会落疤。皇上得知华妃借故罚你，亦很不满，数日不曾理会翊坤宫。",
      },
    ],
  },
  fakuiPregnant: {
    id: "fakuiPregnant",
    name: "玉阶炎日",
    emoji: "☀️",
    flavor: "皇上与皇后都去了宫外祈福，六宫暂由华妃协理，翊坤宫里便是她说了算。这日一早，华妃便借着一桩不值一提的小过，传你前去问话，话没说上两句，就罚你跪在翊坤宫外的烈日下。她不是不知道你有着身孕，要的正是这个。周宁海守在一旁，谁也不许近前，连你带来的宫人也被远远隔开。日头一寸寸爬高，青砖烫得灼人，你腹中隐隐作痛，手心里全是冷汗，只能死死掐着掌心，不让自己在她们面前倒下。",
    note: "有孕时必定小产（温太医留方也挡不住），小产本身身子 -2；所选的牌决定另外付出什么代价。罚跪开始时恨意 ≥ 6，身子再 -1；有温太医留方，身子少扣 1。",
    defaultOptionId: "yingcheng",
    options: [
      { id: "yingcheng", name: "硬撑到底", effects: [{ resource: "qingyu", amount: -2 }], fakuiShenzi: 2, miscarriageStory: "你一直跪到日影西斜，起身时眼前一黑，裙下已洇开一片殷红。周宁海站在廊下，连眼皮也没抬一下。太医赶到时，孩子早已保不住了。", text: "小产；身子 -2；清誉 -2", story: "你咬牙跪到最后，起身时裙下已是一片殷红。" },
      { id: "jizhaoTaiyi", name: "急召太医", card: "wenTaiyiZhenzhi", effects: [], fakuiShenzi: 2, miscarriageStory: "温实初冒死闯到翊坤宫外，跪地诊脉，良久才哑声道：「小主，臣……来迟了。」孩子没能保住，他却硬是替你挡下了周宁海的呵斥，保全了你的性命。", text: "小产；身子 -2", story: "温实初冒死闯到翊坤宫外，孩子终究没能保住，但他保住了你。" },
      { id: "feibaoHuangshang", name: "宫人求见太后", card: "shoulongRenxin", effects: [{ resource: "shengchong", amount: 1 }], fakuiShenzi: 2, miscarriageStory: "太后赶到翊坤宫外时，你已倒在青砖上，裙裾尽染。她一面命人抬你回宫，一面厉声斥责华妃，可腹中的孩子已经听不见了。「是哀家来迟了。」她的声音沉得发颤。", text: "小产；身子 -2；圣宠 +1", story: "皇上与皇后都去宫外祈福，小允子拼死跑去寿康宫求见太后，太后赶到时，一切已经晚了。" },
      { id: "anzhongLiuxin", name: "暗中留心", card: "jingguanQibian", effects: [], fakuiShenzi: 2, miscarriageStory: "你含着参片，硬是撑到了太医赶来。脉案递到眼前时，你只轻轻合了合眼：参片保得住你，却保不住它。这一口气，你记下了。", status: "baoyangZaishen", text: "小产；身子 -2；抱恙在身", story: "你早有防备，备了参片含在口中，总算撑住了一口气，孩子却终究没能保住。" },
      { id: "jinxiHuchi", name: "槿汐护持", card: "jinxiXiangzhu", effects: [{ resource: "qingyu", amount: -1 }], fakuiShenzi: 2, miscarriageStory: "你倒下时，槿汐一把将你抱住，一面高声唤太医，一面用身子替你挡住了周遭窥探的目光。孩子没了，你伏在她肩头，终于没有在人前落一滴泪。", text: "小产；身子 -2；清誉 -1", story: "槿汐一直跪在你身侧扶着你。你倒下时，是她一把将你抱住，一路喊着太医。" },
      {
        id: "lingrongSongyao",
        name: "陵容送药",
        card: "lingrongXiangzhu",
        effects: [{ resource: "qingyu", amount: -1 }],
        fakuiShenzi: 2, miscarriageStory: "陵容守在榻前，一句话也没劝，只陪你无声地落泪。「姐姐，是妹妹无用。」她的手在袖中攥得发白，眼里却分不清是悲是怨。",
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
            "陵容急得红了眼眶，拉着你的手说：「姐姐别怕，我去求皇后娘娘。」不多时，剪秋便来养心殿传了皇后的话，皇上顺势把事情交给了中宫，华妃这才收了手。陵容回来时裙上沾着灰，想是在景仁宫跪了许久，只笑说不碍事。你这才留意到，她在皇后跟前，原来已经说得上话了。她这份情，你记下了，只是自此你们之间，多了一层说不出口的分寸。你在养心殿里站着听了大半日数落，回宫时已是头重脚轻。",
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
  distant: { result: "stolen", relation: 1, story: "陵容截下了这次召幸，换她去侍寝。「姐姐福气好，也该分妹妹一些。」第二日她来请安，笑意里有几分不自在，说话也比平日软了些。" },
  resentful: { result: "lost", relation: 1, effects: [{ resource: "shengchong", amount: -1 }], story: "陵容在半路截走了召幸，皇上那夜宿在了她那里。过后见了你，她竟有几分心虚，难得软语说了几句体己话。" },
};

/** 陵容 on 甄嬛's promotions (关系 -2): shown in the log and the promotion notice. */
export const LINGRONG_PROMOTION_TEXT: Partial<Record<RankId, string>> = {
  guiren: "陵容来碎玉轩道贺，笑得有些勉强：「姐姐如今是贵人了，妹妹往后还要仰仗姐姐。」话没说完，便低下了头。",
  pin: "陵容送来一双亲手绣的虎头鞋，指尖还缠着线：「姐姐如今是嫔了，妹妹……替姐姐高兴。」",
};

export const NIAN_TURN = 24;

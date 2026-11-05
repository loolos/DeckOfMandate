// events
import type { AllyId, PairId, RivalId } from "./allies";
import { CARDS3, type CardId3 } from "./cards";
import { type Act, type Delta3, STAGE3 } from "./level";
import type { HuanghouId, SecretId } from "./secrets";
import type { StatusId3 } from "./statuses";

export type OpportunityId3 =
  | "huanghouShangshi"
  | "taihouChuixun"
  | "wangyeXiantan"
  | "qingmaiBaoxi"
  | "yanqingTanbing"
  | "xianfuXianhua"
  | "kuairenKuaiyu"
  | "yuhuayuanXin"
  | "xianfuJing"
  | "yanqingDuan"
  | "foqianGongdeng"
  | "gongzhongLaixin"
  | "jinganChuilian"
  | "shanzhongCaiyao"
  | "chanfangChaojing"
  | "moyanYuanshou"
  | "yuexiaDuitan";

export type CrisisId3 =
  | "gongzhongLiuyan"
  | "neiwufuDiaonan"
  | "liyiShiwu"
  | "suiyuxuanXianhua"
  | "qifeiXunxin"
  | "sanAgeYaochong"
  | "xinrenZhengchong"
  | "emingCanben"
  | "yuhuayuanQi"
  | "xianfuQi"
  | "yanqingQi"
  | "tanhuoLiangmi"
  | "fazuoCuhuo"
  | "wutouXiangyou"
  | "yebanJingrao"
  | "xianrenKuitan"
  | "jingrenLairen";

export type EventId3 = OpportunityId3 | CrisisId3 | HuanghouId;
export type EventKind3 = "opportunity" | "crisis" | "huanghou";

export const EVENT_KIND3_LABEL: Record<EventKind3, string> = { opportunity: "机会", crisis: "危机", huanghou: "皇后" };

export type EventDef3 = {
  readonly id: EventId3;
  readonly kind: EventKind3;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  /** Opportunity reward; 皇后事件: what the default (accepting) gives. */
  readonly reward: readonly Delta3[];
  readonly cardReward?: Partial<Record<CardId3, readonly Delta3[]>>;
  readonly penalty: readonly Delta3[];
  readonly penaltyStatus?: StatusId3;
  /** 双牌: any two of these cards in one turn (请脉报喜). */
  readonly double?: readonly CardId3[];
  /** 盟友事件: the first time it is taken, the ally's status. */
  readonly ally?: AllyId;
  /** 对头事件 and whose. */
  readonly rival?: RivalId;
  /** 对头事件: two matching cards in one turn to resolve. */
  readonly needTwo?: boolean;
  /** 对头事件没化解、欣贵人替你挡下惩罚时的日志。 */
  readonly xinCover?: string;
  /** 需两张解牌的危机只凑了一张时的惩罚（不写则按完整惩罚）。 */
  readonly halfPenalty?: readonly Delta3[];
  /** 第一幕「盛宠招妒」：圣宠达到 ENVY_LINE3 时，这件事无论怎么了结都要付的清誉。 */
  readonly envyCost?: readonly Delta3[];
  /** 危机被化解时也要付的代价（断炭缺粮：熬过去也伤身子）。 */
  readonly resolveCost?: readonly Delta3[];
  /** 同上：惩罚状态只持续这么多回合。 */
  readonly halfStatusTurns?: number;
  /** 对头事件: resolving with this card is 打压. */
  readonly suppressCard?: CardId3;
  /** 对头事件 unresolved: 皇后 is told (hidden 把柄). */
  readonly secret?: SecretId;
  /** 陵容 resolved it: she notes this (hidden 把柄). */
  readonly lingrongSecret?: SecretId;
  readonly pair?: PairId;
  /** 🧹 静白刁难（寺中）. */
  readonly jingbai?: boolean;
  /** Only on 凌云峰 (from 肺痨之诬 on) / only in 寺中. */
  readonly place?: "temple" | "peak";
  /** 有【敬妃之谊】时换用的开场文字（宫中来信：敬妃另托人捎了东西）。 */
  readonly jingfeiFlavor?: string;
  readonly resolvedText: string;
  readonly unresolvedText: string;
  readonly resolvedStory: Partial<Record<CardId3, string>>;
  /** 凌云峰 text (断炭缺粮 / 师太 / 莫言 change their story on the mountain). */
  readonly peakFlavor?: string;
  readonly note?: string;
};

const NO: readonly Delta3[] = [];
export const q = (n: number): Delta3 => ({ resource: "qingyu", amount: n });
export const sc = (n: number): Delta3 => ({ resource: "shengchong", amount: n });
export const sz = (n: number): Delta3 => ({ resource: "shenzi", amount: n });

export const EVENTS3: Record<EventId3, EventDef3> = {
  // ---- 第一幕 · 机会
  huanghouShangshi: {
    id: "huanghouShangshi",
    kind: "opportunity",
    name: "中宫垂青",
    emoji: "🏮",
    flavor: "景仁宫晨省，皇后当着众人的面温温地问起碎玉轩近来可好，又问饮食起居，一桩桩问得比谁都细。",
    envyCost: [q(-1)],
    reward: [sc(1)],
    penalty: NO,
    secret: "dingmanZhonggong",
    resolvedText: "圣宠 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      yirongZhengsu: "你穿了身素净的月白衣裳，鬓边只簪一朵绒花，进退一丝不乱。皇后拉着你的手说了好些体己话，又在皇上跟前提了你一句。你谢了恩，只觉得她掌心很凉。",
      jinyanShenxing: "皇后问起六宫近事，你只拣些无关痛痒的回话，一句也不多。皇后笑着说你懂事，端起茶盏，半晌没有再开口。",
    },
  },
  taihouChuixun: {
    id: "taihouChuixun",
    kind: "opportunity",
    name: "太后垂询",
    emoji: "🪭",
    flavor: "寿康宫请你过去说说话。太后近来身子不大好，却还惦记着碎玉轩。",
    reward: [q(1)],
    penalty: NO,
    resolvedText: "清誉 +1（眉庄解决时翻倍）",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jinyanShenxing: "太后问你近来读什么书，你答得谦逊稳妥。太后捻着佛珠，说这孩子沉静。",
      meizhuangXiangzhu: "眉庄陪你一同前去。太后问起闲月阁那一年，眉庄只淡淡说：「都过去了，多亏嬛儿。」转头又把你夸了一遍。你们一唱一和，太后听得开怀，赏了你们一人一串佛珠。",
    },
  },
  wangyeXiantan: {
    id: "wangyeXiantan",
    kind: "opportunity",
    name: "王爷闲谈",
    emoji: "🎐",
    flavor: "果郡王进宫给太后请安，在御花园的回廊下又遇见了你。他说起塞外的风沙，说起江南的烟雨。",
    reward: [q(1)],
    penalty: NO,
    lingrongSecret: "wangyeZengwu",
    resolvedText: "清誉 +1",
    unresolvedText: "无额外效果，事件消失",
    note: "第 5 回合【桐花台初遇】之后洗入机会池。",
    resolvedStory: {
      jinyanShenxing: "你只与他说了几句诗文，便以礼告退。他站在廊下看你走远，没有再说话。",
      yirongZhengsu: "你理了理鬓边的珠花，与他说了几句闲话。他笑着说，宫里难得有人肯听他讲这些。",
      guojunwangXiangzhu: "他递给你一卷手抄的诗集，说是在外头游历时随手记下的。你翻了两页，字迹潇洒，像他这个人。",
    },
  },
  qingmaiBaoxi: {
    id: "qingmaiBaoxi",
    kind: "opportunity",
    name: "请脉报喜",
    emoji: "💗",
    flavor: "你近来总是懒懒的，闻不得油腥，晨起时还常犯恶心。碎玉轩的人看在眼里，太医院也派了人来请脉。",
    reward: NO,
    penalty: NO,
    double: ["wenTaiyiZhenzhi", "shoulongRenxin", "jinyanShenxing"],
    resolvedText: "太医确诊喜脉，晋为嫔",
    unresolvedText: "这回没能稳妥报喜：洗回机会牌池，下次再来",
    note: "只在贵人有孕时洗入。同一回合打出温太医相助、收拢人心、谨言慎行中任意 2 张，方能顺利晋封。",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初诊了又诊，才敢跪下道喜。消息传到养心殿，皇上当即下旨晋你为嫔。",
      shoulongRenxin: "你早早打点了太医院，来请脉的太医一句也不敢含糊。皇上当即下旨晋你为嫔。",
      jinyanShenxing: "你沉住气，等太医确诊了才让人去报喜。皇上大喜，当即下旨晋你为嫔。",
    },
  },
  yanqingTanbing: {
    id: "yanqingTanbing",
    kind: "opportunity",
    name: "延庆殿探病",
    emoji: "🍵",
    flavor: "端妃旧疾缠身，延庆殿里终年弥漫着药味。你常去陪她说话，听她断断续续讲些宫里的旧事。",
    reward: [q(1)],
    penalty: NO,
    ally: "duanfei",
    resolvedText: "清誉 +1；第一次把握时获得【端妃相护】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初替端妃换了一张方子。端妃喝了药，靠在榻上看了你许久，才说：「皇后那里，你要当心。」",
      jinyanShenxing: "你陪端妃坐了一下午，说的都是些闲话。临走时她握了握你的手，那手凉得像冰。",
    },
  },
  xianfuXianhua: {
    id: "xianfuXianhua",
    kind: "opportunity",
    name: "虎头寄情",
    emoji: "🧵",
    flavor: "敬妃膝下无子，最盼着你的孩子。她做了一双小小的虎头鞋送来。",
    reward: [q(1)],
    penalty: NO,
    ally: "jingfei",
    resolvedText: "清誉 +1；第一次把握时获得【敬妃之谊】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      meizhuangXiangzhu: "眉庄陪你去咸福宫回礼。敬妃抱着你送的小衣裳，眼圈都红了：「往后这孩子，我也替你看顾着。」",
      jinyanShenxing: "你亲自去咸福宫道谢，与敬妃说了半日孩子的事。她说话慢慢的，叫人心里踏实。",
    },
  },
  kuairenKuaiyu: {
    id: "kuairenKuaiyu",
    kind: "opportunity",
    name: "快人快语",
    emoji: "🗣️",
    flavor: "欣贵人看不惯齐妃，常替你抱不平。这日她又跑来碎玉轩，一进门就嚷着要喝你这里的茶。",
    reward: [sc(1)],
    penalty: NO,
    ally: "xin",
    resolvedText: "圣宠 +1；第一次把握时获得【欣贵人解围】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      shoulongRenxin: "你让小允子备了她最爱吃的点心。欣贵人吃得高兴，拍着胸脯说往后谁敢欺负你，她第一个不答应。",
      yirongZhengsu: "你陪她去御花园走了一圈，正遇上皇上。欣贵人一张嘴把皇上逗笑了，皇上顺口夸了你一句。",
    },
  },
  yuhuayuanXin: {
    id: "yuhuayuanXin",
    kind: "opportunity",
    name: "花苑观芳·欣贵人邀游",
    emoji: "🌸",
    flavor: "欣贵人兴冲冲邀你同游御花园，说牡丹开得正好。不巧走到半路，远远瞧见齐妃也带着人在园子里赏花。",
    reward: [sc(1)],
    penalty: NO,
    ally: "xin",
    pair: "yuhuayuan",
    resolvedText: "圣宠 +1；第一次把握时获得【欣贵人解围】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jinyanShenxing: "齐妃走远了，欣贵人挽着你笑：「你那一句不软不硬，我接得可痛快。早该有人治治她了。」两人在花下一直说到日头西斜。",
      yirongZhengsu: "你陪欣贵人在花下走了一圈，说说笑笑，倒把方才的不快都忘了。",
      shoulongRenxin: "你让宫人给欣贵人送去一盆开得正好的芍药，她高兴得当天就来回礼。",
    },
  },
  xianfuJing: {
    id: "xianfuJing",
    kind: "opportunity",
    name: "咸福代笔·敬妃求助",
    emoji: "🧵",
    flavor: "敬妃请你帮着拟一份宫务条陈，说你识字明理，比她自己写得好。",
    reward: [q(1)],
    penalty: NO,
    ally: "jingfei",
    pair: "xianfu",
    resolvedText: "清誉 +1；第一次把握时获得【敬妃之谊】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      meizhuangXiangzhu: "眉庄陪你在咸福宫把条陈一字一字斟酌定了。敬妃拉着你们俩的手说：「往后咸福宫的门，你们随时来。」",
      shoulongRenxin: "你托小允子去内务府问清了各处的规矩，条陈写得周周全全。敬妃拿着看了三遍。",
      jinxiXiangzhu: "槿汐对宫里的规矩比谁都熟，一条一条替你核过。敬妃说，这份情她记下了。",
    },
  },
  yanqingDuan: {
    id: "yanqingDuan",
    kind: "opportunity",
    name: "烛影旧话·端妃旧话",
    emoji: "🍵",
    flavor: "夜里你去延庆殿探望端妃。她屏退了所有宫人，只留一盏孤灯，几次欲言又止，像是有积压多年的话要对你说。",
    reward: [q(1)],
    penalty: NO,
    ally: "duanfei",
    pair: "yanqing",
    resolvedText: "清誉 +1；第一次把握时获得【端妃相护】",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初诊完脉，便退到殿外守着。门一关上，端妃才慢慢说起景仁宫的旧事，说一句，停一停。她说，如今的皇后和故去的纯元皇后原是同父异母的姐妹，姐姐是嫡出，她是庶出，姐姐去后，她才一步步坐上了凤位。",
      shoulongRenxin: "你让小允子守着殿门。端妃这才开口，说起纯元皇后当年的事，说到一半，停住了。末了她轻轻补了一句：「如今的皇后，是纯元皇后同父异母的庶妹。」",
      jingguanQibian: "你只是静静坐着，不催也不问。端妃看了你很久，终于说：「皇后这个人，从来不是表面上那样。她和纯元皇后是同父异母的姐妹，姐姐是嫡出，她是庶出。姐姐在时，她不过是跟在后头的庶妹。」",
    },
  },
  // ---- 第一幕 · 危机
  gongzhongLiuyan: {
    id: "gongzhongLiuyan",
    kind: "crisis",
    name: "蜚语盈廊",
    emoji: "🗣️",
    flavor: "华妃倒了，宫里的闲话却没少。这几日不知是谁起的头，都在说碎玉轩恩宠太盛、手段太巧，一传十，十传百。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "liuyanChanshen",
    resolveCost: [q(-1)],
    resolvedText: "移除事件；化解也要清誉 -1",
    unresolvedText: "未来 3 回合每回合抓牌 -1",
    resolvedStory: {
      jinyanShenxing: "你闭门不出，见了谁都只说些天气花草。流言找不到新的话柄，几日便散了。",
      meizhuangXiangzhu: "眉庄在各宫走动，不急不恼，只说一句：「我是被流言害过的人，最知道它怎么起。」她顺藤摸瓜寻出了嚼舌根的宫女，当着众人处置了。流言一夜之间没了声息。",
      shoulongRenxin: "你让小允子拿了些碎银子，在各宫的宫人间打点了一圈。流言渐渐没人再提。",
      jinxiXiangzhu: "槿汐暗中寻到了传话的源头，把几个碎嘴的宫人敲打了一番。流言没了下文。",
    },
  },
  neiwufuDiaonan: {
    id: "neiwufuDiaonan",
    kind: "crisis",
    name: "内务府刁难",
    emoji: "📦",
    flavor: "这个月的份例迟迟没有送来，去问时，内务府的人只说账目还没理清，让碎玉轩再等等。",
    reward: NO,
    penalty: [q(-1)],
    resolveCost: [sc(-1)],
    resolvedText: "移除事件；化解也要圣宠 -1",
    unresolvedText: "清誉 -1",
    note: "用收拢人心解决时额外抽 1 张。",
    resolvedStory: {
      shoulongRenxin: "小允子拿了银子去内务府打点，当天下午份例便一样不少地送到了碎玉轩。",
      meizhuangXiangzhu: "眉庄想起闲月阁那个冬天，炭火也是这样被克扣的，冷笑道：「这套把戏，我早领教过。」她把自己宫里的份例分了一半送来，又让采月去敲打内务府，没过两日便补齐了。",
      jinxiXiangzhu: "槿汐拿着份例单子去内务府对账，一笔一笔说得清清楚楚，管事太监只得赔着笑补齐。",
    },
  },
  liyiShiwu: {
    id: "liyiShiwu",
    kind: "crisis",
    name: "仪态微瑕",
    emoji: "🎎",
    flavor: "景仁宫请安时，你一时头晕，起身时碰翻了案上的茶盏，滚烫的茶水溅在手背上，红了一片，满殿的人都看了过来。",
    envyCost: [q(-1)],
    reward: NO,
    penalty: [q(-1), sc(-1)],
    resolvedText: "移除事件",
    unresolvedText: "清誉 -1、圣宠 -1",
    note: "用陵容相助解决时，她会送来舒痕胶（🧴）；有害时改为未来 2 回合不能打仪容整肃、谨言慎行，不能侍寝，不伤胎。",
    resolvedStory: {
      yirongZhengsu: "你当即整好衣饰、从容请罪，礼数周全得挑不出错处。",
      wenTaiyiZhenzhi: "温实初替你出了一张脉案，说你那几日头晕乏力。众人这才知道你是抱病强撑。",
    },
  },
  suiyuxuanXianhua: {
    id: "suiyuxuanXianhua",
    kind: "crisis",
    name: "碎玉私语",
    emoji: "🗣️",
    flavor: "碎玉轩里有人嚼舌根，说小主如今眼里只有皇上，待下人越发冷淡了。",
    envyCost: [q(-1)],
    reward: NO,
    penalty: NO,
    penaltyStatus: "xianhuaChuanKai",
    halfStatusTurns: 1,
    needTwo: true,
    resolveCost: [q(-1)],
    resolvedText: "移除事件；需打出两张解牌；化解也要清誉 -1",
    unresolvedText: "未来 2 回合每回合抓牌 -1（至少 1 张）；只打出一张解牌则只持续 1 回合",
    resolvedStory: {
      jinxiXiangzhu: "槿汐把碎玉轩上下叫到一处，不轻不重地说了几句。往后再没人敢乱说话。",
      shoulongRenxin: "你赏了碎玉轩上下每人一个月的月钱。宫人们感恩戴德，闲话也就没了。",
    },
  },
  qifeiXunxin: {
    id: "qifeiXunxin",
    kind: "crisis",
    name: "晨省讥语",
    emoji: "🌰",
    xinCover: "齐妃那句讥讽还没落地，欣贵人先笑出了声：「齐妃姐姐这话酸的，莫不是昨夜没睡好？」满殿的人都低头憋着笑，齐妃脸上挂不住，那桩事也就这么揭过去了。",
    flavor: "景仁宫请安时，齐妃当着众人的面讥讽你：「莞嫔如今可是皇上心尖上的人了。」",
    envyCost: [q(-1)],
    reward: NO,
    penalty: [q(-2)],
    penaltyStatus: "liuyanChanshen",
    rival: "qifei",
    needTwo: true,
    suppressCard: "jinyanShenxing",
    secret: "chuyanDingzhuang",
    resolveCost: [sz(-1)],
    resolvedText: "移除事件；两张解牌含谨言慎行即打压齐妃，获得【打压·齐妃】；化解也要身子 -1",
    unresolvedText: "清誉 -2、未来 3 回合每回合抓牌 -1",
    resolvedStory: {
      jinyanShenxing: "你笑着回了一句：「娘娘说笑了，三阿哥的功课，皇上才是放在心尖上的。」齐妃一时下不来台，再没敢开口。",
      meizhuangXiangzhu: "眉庄不咸不淡地接过话头，把齐妃的话轻轻挡了回去。",
      jinxiXiangzhu: "槿汐适时上前回话，说皇后宫里的茶凉了，替你把话岔开了。",
    },
  },
  sanAgeYaochong: {
    id: "sanAgeYaochong",
    kind: "crisis",
    name: "三阿哥邀宠",
    emoji: "📚",
    xinCover: "欣贵人见皇上连着几日都在长春宫，大大方方进去请安，借口自己公主的功课求皇上指点，三言两语又把话头引回了六宫，齐妃的小算盘没能得逞。",
    flavor: "齐妃拿三阿哥的功课做由头，把皇上请进了长春宫，一连几日都没放人出来，六宫的风向悄悄变了。",
    envyCost: [q(-1)],
    reward: NO,
    penalty: [sc(-2)],
    rival: "qifei",
    needTwo: true,
    suppressCard: "yirongZhengsu",
    resolveCost: [q(-1)],
    resolvedText: "移除事件；两张解牌含仪容整肃即打压齐妃，获得【打压·齐妃】；化解也要清誉 -1",
    unresolvedText: "圣宠 -2",
    resolvedStory: {
      yirongZhengsu: "你换了一身新裁的衣裳，在皇上回养心殿的路上候着。皇上远远看见，便不往长春宫去了。",
      jingguanQibian: "你按兵不动。三阿哥的功课本就不好，皇上考了几回，自己便没了兴致。",
    },
  },
  xinrenZhengchong: {
    id: "xinrenZhengchong",
    kind: "crisis",
    name: "御苑邀宠",
    emoji: "💃",
    xinCover: "欣贵人在一旁看得直撇嘴，当着皇上的面说：「新人鲜亮，咱们这些老人也不差呀。」又拉着你坐到皇上近前，祺贵人那点抢风头的心思，白费了。",
    flavor: "祺贵人新近入宫，在御花园里“偶遇”了皇上，笑得比花还艳，皇上当晚便翻了她的牌子。",
    envyCost: [q(-1)],
    reward: NO,
    penalty: [sc(-2)],
    rival: "guaerjia",
    needTwo: true,
    suppressCard: "yirongZhengsu",
    secret: "shanduShide",
    resolvedText: "移除事件；两张解牌含仪容整肃即打压祺贵人，获得【打压·祺贵人】",
    unresolvedText: "圣宠 -2",
    resolvedStory: {
      yirongZhengsu: "你在同一处园子里赏花，一身素净，倒衬得祺贵人过于艳丽。皇上看了你们一眼，携了你的手走了。",
      jinyanShenxing: "你不争不抢，只在皇上跟前提了一句祺贵人年轻活泼。皇上笑笑，倒觉得你大度。",
    },
  },
  emingCanben: {
    id: "emingCanben",
    kind: "crisis",
    name: "鄂敏参本",
    emoji: "📜",
    xinCover: "欣贵人在殿上直言：「甄大人的事前朝自有公断，哪有拿后宫姐妹的家世说嘴的道理。」祺贵人被噎得说不出话，那道折子的分量也就轻了几分。",
    flavor: "祺贵人的父亲鄂敏在前朝递了一道折子，参甄远道平日文字轻狂、结交不慎，字字句句都冲着甄家而来。",
    reward: NO,
    penalty: [q(-4)],
    halfPenalty: [q(-1)],
    resolveCost: [q(-1)],
    penaltyStatus: "fuxiongMengchen",
    rival: "guaerjia",
    needTwo: true,
    suppressCard: "shoulongRenxin",
    secret: "yuanwangJunfu",
    resolvedText: "移除事件；化解也要清誉 -1；两张解牌含收拢人心即打压祺贵人，获得【打压·祺贵人】",
    unresolvedText: "清誉 -4、获得【父兄蒙尘】；只打出一张解牌则清誉 -1、仍获得【父兄蒙尘】",
    note: "第 5 回合起洗入危机池，甄远道下狱后不再出现。",
    resolvedStory: {
      shoulongRenxin: "你托人在前朝周旋，鄂敏的折子被压了下来，留中不发。",
      meizhuangXiangzhu: "眉庄托沈家在前朝替甄家说了几句话，折子到底没掀起什么风浪。",
    },
  },
  yuhuayuanQi: {
    id: "yuhuayuanQi",
    kind: "crisis",
    name: "花苑观芳·齐妃讥讽",
    emoji: "🌸",
    xinCover: "欣贵人嗓门一提，笑着堵了回去：「齐妃姐姐这是羡慕咱们说话投缘吧？风光不风光的，姐姐先把三阿哥的功课看紧些。」满园宫人都憋着笑，齐妃讪讪地走了。",
    flavor: "齐妃带着宫人在御花园里迎面撞上你和欣贵人，上下打量了你一番，阴阳怪气地说：「莞嫔如今有欣贵人作陪，好大的风光。只是这宫里的风光，从来都是一阵一阵的。」当着满园宫人的面，句句带刺。",
    reward: NO,
    penalty: [q(-2)],
    rival: "qifei",
    needTwo: true,
    pair: "yuhuayuan",
    resolvedText: "移除事件；与【花苑观芳·欣贵人邀游】相连",
    unresolvedText: "清誉 -2；【花苑观芳·欣贵人邀游】随之作废",
    resolvedStory: {
      jinyanShenxing: "你只淡淡回了一句「娘娘教训的是」，欣贵人立刻接过话头，三言两语说得齐妃面红耳赤，拂袖走了。",
      jingguanQibian: "你不接她的话，只顾着赏花。齐妃自讨没趣，悻悻地走了。",
      jinxiXiangzhu: "槿汐上前行了个礼，说皇后正找齐妃娘娘，齐妃只得走了。",
    },
  },
  xianfuQi: {
    id: "xianfuQi",
    kind: "crisis",
    name: "咸福代笔·祺贵人告状",
    emoji: "🧵",
    xinCover: "欣贵人立刻替你分辩：「敬妃姐姐托人写条陈，是帮忙，哪里谈得上越权？祺贵人要是看不惯，下回也替敬妃姐姐写一份呀。」皇后听了，只好笑着把这事放下。",
    flavor: "祺贵人在皇后面前告了你一状，说你一个后宫嫔御，竟越权替敬妃拟宫务条陈，「眼里怕是没有中宫了」。",
    reward: NO,
    penalty: [q(-2)],
    rival: "guaerjia",
    needTwo: true,
    pair: "xianfu",
    resolvedText: "移除事件；与【咸福代笔·敬妃求助】相连",
    unresolvedText: "清誉 -2；【咸福代笔·敬妃求助】随之作废",
    resolvedStory: {
      meizhuangXiangzhu: "皇后召你去问越权的事，眉庄陪着同去。她把条陈一页页摊开：「这是敬妃娘娘的意思，嫔妾们不过代笔。」祺贵人被问得答不上话来。",
      jinyanShenxing: "你在皇后面前只说是替敬妃抄写，一个字也没多说。皇后挑不出错，只得罢了。",
      jingguanQibian: "你按下不动，等皇后自己去问敬妃。敬妃一句话，便把这事揭过去了。",
    },
  },
  yanqingQi: {
    id: "yanqingQi",
    kind: "crisis",
    name: "烛影旧话·齐妃探病",
    emoji: "🍵",
    xinCover: "欣贵人恰巧也来看端妃，一进门便大着嗓门道：「齐妃姐姐也来了？正好，一起坐下说说话。」她拉着齐妃东拉西扯，齐妃探不出半点口风，只能悻悻地回去复命。",
    flavor: "齐妃奉皇后之命来延庆殿“探病”，正撞见你和端妃说话，眼神在你们两人之间转了好几个来回。",
    reward: NO,
    penalty: [q(-2)],
    rival: "qifei",
    needTwo: true,
    pair: "yanqing",
    resolvedText: "移除事件；与【烛影旧话·端妃旧话】相连",
    unresolvedText: "清誉 -2；【烛影旧话·端妃旧话】随之作废",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初提着药箱进来，说该给端妃请脉了，病人须得静养。齐妃坐不住，客客气气地被请了出去。",
      jinxiXiangzhu: "槿汐引着齐妃去偏殿喝茶，絮絮叨叨说了好些闲话，齐妃什么也没听着。",
      jinyanShenxing: "你只说是来给端妃送药的，说完便告退。齐妃回去，什么也说不出来。",
    },
  },
  // ---- 第一幕 · 皇后事件（恩赏：默认收下，暗留把柄；打出列出的牌换一份赏赐，不留把柄）
  jingrenHoushang: {
    id: "jingrenHoushang",
    kind: "huanghou",
    needTwo: true,
    name: "景仁赐锦",
    emoji: "🎁",
    flavor: "景仁宫的剪秋亲自送来几匹云锦和一支点翠步摇，说是皇后特意挑的，给碎玉轩添喜，言语间满是体恤。",
    envyCost: [q(-1)],
    reward: [sc(1)],
    penalty: NO,
    cardReward: { jinyanShenxing: [q(1)], jinxiXiangzhu: [sz(1)] },
    resolvedText: "同回合打出两张匹配牌；谨言慎行：清誉 +1；槿汐相助：身子 +1",
    unresolvedText: "圣宠 +1",
    resolvedStory: {
      jinyanShenxing: "你说嫔妾福薄，受不起这样的厚赏，只收下了一匹素缎。皇后笑着说你太过谨慎，这话传到寿康宫，太后倒夸你知道分寸。",
      jinxiXiangzhu: "槿汐替你回了话，说小主素来不爱鲜亮的颜色。皇后便改赏了几盒燕窝，槿汐把燕窝收进小厨房，每日炖好了给你送去。",
    },
  },
  xieliGongwu: {
    id: "xieliGongwu",
    kind: "huanghou",
    needTwo: true,
    name: "协理宫务",
    emoji: "📜",
    flavor: "皇后说六宫琐事繁杂，一人照应不过来，请你帮着打理一二，语气和气得叫人不好推辞。",
    reward: [q(1)],
    penalty: NO,
    cardReward: { jinyanShenxing: [sc(1)], meizhuangXiangzhu: [sz(1)] },
    resolvedText: "同回合打出两张匹配牌；谨言慎行：圣宠 +1；眉庄相助：身子 +1",
    unresolvedText: "清誉 +1",
    resolvedStory: {
      jinyanShenxing: "你推说自己年轻，不懂这些，怕误了娘娘的事。皇上听说了，倒夸你不揽权、识大体。",
      meizhuangXiangzhu: "眉庄替你说了几句，说你身子要紧，不如由她来帮衬。皇后笑着应了，你也落得清闲，好好歇了几日。",
    },
  },
  antaiBupin: {
    id: "antaiBupin",
    kind: "huanghou",
    name: "安胎补品",
    emoji: "🍲",
    flavor: "景仁宫送来一盅安胎的补品，剪秋说是皇后亲手吩咐小厨房炖的。",
    reward: [q(1)],
    penalty: NO,
    lingrongSecret: "qiciBuyong",
    cardReward: { wenTaiyiZhenzhi: [sz(1)], jinxiXiangzhu: [sz(1)] },
    resolvedText: "温太医相助或槿汐相助：身子 +1",
    unresolvedText: "清誉 +1",
    note: "只在有孕时出现。",
    resolvedStory: {
      wenTaiyiZhenzhi: "温实初照例看过才让你用。补品并无不妥，他又添了两味药，另开了一张安胎的方子。",
      jinxiXiangzhu: "槿汐谢了赏，替你收下，转头吩咐小厨房另炖了一盅清润的，说小主这几日胃口淡，补品先温着，换着用。",
    },
  },
  jiayanXianyi: {
    id: "jiayanXianyi",
    kind: "huanghou",
    needTwo: true,
    name: "家宴献艺",
    emoji: "🎵",
    flavor: "家宴将近，皇后特意把你唤去，说皇上最爱听你弹琴，请你在席上弹一曲，也好让太后高兴高兴。",
    envyCost: [q(-1)],
    reward: [sc(1)],
    penalty: NO,
    lingrongSecret: "jierenYaochong",
    cardReward: { jingguanQibian: [q(1)], jinyanShenxing: [sz(1)] },
    resolvedText: "同回合打出两张匹配牌；静观其变：清誉 +1；谨言慎行：身子 +1",
    unresolvedText: "圣宠 +1",
    resolvedStory: {
      jingguanQibian: "你推说指上的伤还没好，只在席间安安静静地坐着。太后看在眼里，说你稳重。",
      jinyanShenxing: "你说近来身子乏，不宜劳神，请皇后另择他人。皇后点点头，说你懂事。你早早回宫歇下了。",
    },
  },
  shanghuaXiaoju: {
    id: "shanghuaXiaoju",
    kind: "huanghou",
    name: "赏花小聚",
    emoji: "🏮",
    flavor: "皇后召各宫去花苑观芳，特意吩咐让陵容陪你同去，说你们姐妹一向亲厚。",
    reward: [q(1)],
    penalty: NO,
    lingrongSecret: "xijianSiyu",
    cardReward: { shoulongRenxin: [sz(1)], meizhuangXiangzhu: [sc(1)] },
    resolvedText: "收拢人心：身子 +1；眉庄相助：圣宠 +1",
    unresolvedText: "清誉 +1",
    resolvedStory: {
      shoulongRenxin: "你托人告了假，说身子不适，在屋里安安静静歇了一日。第二日让小允子给各宫送了些点心赔礼。",
      meizhuangXiangzhu: "眉庄陪你去坐了一会儿，便借口要去太后宫里，把你一起带了出来。正巧皇上也来寿康宫请安，留你们说了好一会儿话。",
    },
  },
  // ---- 第二、三幕 · 机会
  foqianGongdeng: {
    id: "foqianGongdeng",
    kind: "opportunity",
    name: "佛前供灯",
    emoji: "🕯️",
    flavor: "大殿里的长明灯要人夜夜添油，一盏一盏数过去，足有三四十盏。这活儿清苦，却也清净，正好让人把心事沉下来。",
    reward: NO,
    penalty: NO,
    resolvedText: "下回合出牌 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      chanyuXiushen: "你跪在佛前，一盏一盏地添灯油。灯火映着佛像的脸，慈悲又遥远。",
      jinxiXiangzhu: "槿汐陪你在佛前跪了一夜。天亮时，几个小尼姑偷偷看你，眼里少了些轻慢。",
    },
  },
  gongzhongLaixin: {
    id: "gongzhongLaixin",
    kind: "opportunity",
    name: "宫中来信",
    emoji: "✉️",
    flavor: "有人托山下的小贩捎来一封信。信封上没有落款，你却认得那字迹——笔锋瘦劲，收尾处总带一点倔强，是沈眉庄的手笔。",
    jingfeiFlavor:
      "山下的小贩挑着担子上来，除了一封信，还有两个沉甸甸的包袱。信封上没有落款，你却认得那字迹，是沈眉庄的手笔；包袱上的结打得又密又紧，小贩说是咸福宫的人再三托付的，一样也不许少。",
    reward: [q(1)],
    penalty: NO,
    resolvedText: "清誉 +1（眉庄解决时翻倍）；有【敬妃之谊】时另身子 +1",
    unresolvedText: "有【敬妃之谊】时仍身子 +1，事件消失",
    resolvedStory: {
      meizhuangXiangzhu:
        "你拆开信，是眉庄的字迹，写得很长，足足三页。她说：「宫里一切都好，你不必挂心，只管保重自己。」信末又添一句：「胧月在咸福宫敬妃身边，我寻了个由头去看过一回，她吃得好睡得香，你别惦记。只是我人微言轻，帮不上更多，往后有什么消息，再写给你。」包袱里是厚实的冬衣和几包药材，药包上还压着一张她亲笔写的服法。你读到最后，眼眶发热，把信折了又折，贴身收好。",
      jinxiXiangzhu:
        "槿汐托人去山下取了信，一路藏在怀里带回来，还带着她的体温。你拆开一看，是眉庄的字迹，劈头便问你冷不冷、病好了没有，说宫里一切都好，叫你千万保重。末了一句：「胧月在咸福宫敬妃身边，我寻了个由头去看过一回，她吃得好睡得香，你别惦记。只是我人微言轻，帮不上更多，往后有什么消息，再写给你。」槿汐在一旁抹着眼泪，说：「娘娘，眉庄小主心里一直惦记着您呢。」",
    },
  },
  jinganChuilian: {
    id: "jinganChuilian",
    kind: "opportunity",
    name: "慈云覆荫",
    emoji: "🍵",
    flavor: "静岸师太在廊下遇见你，停下来问了一句：「近来可还住得惯？」",
    peakFlavor: "静岸师太拄着拐杖，一步一步爬上了凌云峰，说是放心不下，要亲眼来看看你的病好些没有。",
    reward: NO,
    penalty: NO,
    resolvedText: "下一次危机未化解时免罚",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      chanyuXiushen: "你与师太说了几句禅理。师太点点头：「你倒是有慧根。」此后静白再刁难你，师太总会拦一拦。",
      jingchaiBuqun: "你挽着袖子在井边洗衣，手冻得通红。师太看了你半晌，叹了口气，吩咐人给你添一床被子。",
    },
  },
  shanzhongCaiyao: {
    id: "shanzhongCaiyao",
    kind: "opportunity",
    name: "山中采药",
    emoji: "🌿",
    flavor: "后山坡上长着些野生草药，你蹲下身辨认，有几样竟是从前温实初教过你的，叶子的纹路至今还记得。",
    reward: [sz(1)],
    penalty: NO,
    resolvedText: "身子 +1；移除 1 个负面状态",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      wenTaiyiZhenzhi: "你照着温实初写的方子采了几味药，熬了一碗喝下，夜里总算睡得安稳了。",
      jingchaiBuqun: "你背着竹篓在山里走了大半日，采回一篓草药。手上划了好几道口子，心里却松快了些。",
      guojunwangXiangzhu: "他陪你在山里走了一下午，认得的草药比你还多。回来时，他手里还多了一束野花。",
    },
  },
  chanfangChaojing: {
    id: "chanfangChaojing",
    kind: "opportunity",
    name: "禅房抄经",
    emoji: "📖",
    flavor: "师太把一卷《金刚经》和笔墨放到你案上，说：「不急着抄完，一笔一画抄下来，心也就静了。」",
    reward: NO,
    penalty: NO,
    resolvedText: "未来 3 回合，每回合抓牌 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      chanyuXiushen: "你一笔一画地抄，抄到「一切有为法，如梦幻泡影」，笔停了很久。",
      jingxinRennai: "你抄了一夜，烛花爆了又爆，手腕酸了，心里那些翻来覆去的念头却慢慢空了下来。",
    },
  },
  moyanYuanshou: {
    id: "moyanYuanshou",
    kind: "opportunity",
    name: "默然分劳",
    emoji: "🤲",
    flavor: "寺里的莫言师父看不惯静白，悄悄走过来：「这活儿我替你担半天。」",
    peakFlavor: "莫言师父背着一捆柴、一袋米，沿着陡峭的山路一声不吭地上了凌云峰，放下东西就要走。",
    reward: NO,
    penalty: NO,
    resolvedText: "本回合出牌 +1",
    unresolvedText: "无额外效果，事件消失",
    resolvedStory: {
      jingchaiBuqun: "你与她并肩干了一会儿活。她话不多，手脚却麻利，剩下的半天，你总算能喘口气。",
      jinxiXiangzhu: "槿汐谢过莫言，两人分着担了活计，你这一日难得清闲。",
    },
  },
  yuexiaDuitan: {
    id: "yuexiaDuitan",
    kind: "opportunity",
    name: "月下对谈",
    emoji: "🌙",
    flavor: "他又来了。凌云峰的夜里月亮很大，照得山路一片白，他提着一盏灯笼站在院门外，说是路过，却不肯走。",
    reward: NO,
    cardReward: { chanyuXiushen: [q(1)] },
    penalty: NO,
    place: "peak",
    resolvedText: "果郡王解决：抽 1 张；禅语修身解决：清誉 +1",
    unresolvedText: "无额外效果，事件消失",
    note: "凌云峰起加入；第三幕移出。",
    resolvedStory: {
      guojunwangXiangzhu: "你们坐在石阶上说了半夜的话。他说起小时候的事，你笑了，那是你出宫以后第一次笑。",
      chanyuXiushen: "你与他谈禅，他听得认真。发乎情，止乎礼，这样就够了。",
    },
  },
  // ---- 第二、三幕 · 危机
  tanhuoLiangmi: {
    id: "tanhuoLiangmi",
    kind: "crisis",
    name: "断炭缺粮",
    emoji: "🔥",
    flavor: "静白又克扣了你屋里的炭火，说寺里清苦，修行之人不该贪暖，转身却让自己屋里的炭盆烧得旺旺的。",
    peakFlavor: "大雪封了山路，凌云峰上缺炭少粮，屋里的水缸结了一层冰，被褥又薄又潮，冷得像冰窖。",
    reward: NO,
    penalty: [sz(-1)],
    resolveCost: [sz(-1)],
    penaltyStatus: "hanzheng",
    jingbai: true,
    needTwo: true,
    halfStatusTurns: 1,
    resolvedText: "移除事件；需打出两张解牌；熬过去也要身子 -1",
    unresolvedText: "身子 -1，未来 2 回合每回合末身子 -1；只打出一张解牌则只持续 1 回合",
    note: "寺中算静白刁难（🧹）；凌云峰上是风雪断粮。",
    resolvedStory: {
      jingchaiBuqun: "你自己上山拾了一捆柴，手上磨出了血泡。屋里总算有了点暖气。",
      jinxiXiangzhu: "槿汐不知从哪里弄来半篓炭，只说是跟厨房的师父讨的。",
      meizhuangXiangzhu: "眉庄托人送来的包裹里，有炭、有米，还有一件厚厚的棉袍。",
      guojunwangXiangzhu: "阿晋趁夜送来两大车炭和米，说是王爷的意思，别的一句也不肯多说。",
    },
  },
  fazuoCuhuo: {
    id: "fazuoCuhuo",
    kind: "crisis",
    name: "杂役磋磨",
    emoji: "🪣",
    flavor: "静白说你念经时偷懒，罚你一日之内挑满后院七八口水缸，再劈完一院子的柴，不干完不许吃饭。",
    reward: NO,
    penalty: [sz(-2), q(-1)],
    halfPenalty: [sz(-1), q(-1)],
    resolveCost: [q(-1)],
    needTwo: true,
    jingbai: true,
    place: "temple",
    resolvedText: "移除事件；需打出两张解牌；化解也要清誉 -1",
    unresolvedText: "身子 -2、清誉 -1（挑水劈柴，累倒在井边）；只打出一张解牌则身子 -1、清誉 -1",
    resolvedStory: {
      jingchaiBuqun: "你一声不吭地把活干完了，干得又快又好。静白挑了半天，没找出错来。",
      jinxiXiangzhu: "槿汐抢着替你挑了一半的水。她年纪大了，回来时腰都直不起来。",
      jingxinRennai: "你咬着牙，一桶一桶地挑。挑到最后，竟也不觉得累了。",
    },
  },
  wutouXiangyou: {
    id: "wutouXiangyou",
    kind: "crisis",
    name: "功德蒙尘",
    emoji: "📿",
    flavor: "功德箱里少了几吊香油钱，静白一口咬定是你拿的，当着满寺的师父要你给个交代。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "xiangyouYiyun",
    resolveCost: [q(-1)],
    jingbai: true,
    place: "temple",
    resolvedText: "移除事件；化解也要清誉 -1",
    unresolvedText: "未来 3 回合每回合末清誉 -1",
    resolvedStory: {
      chanyuXiushen: "你在佛前跪下，平平静静地说：「佛祖在上，弟子没有。」师太看了你一眼，叫静白去查别处。",
      jinxiXiangzhu: "槿汐站出来作证，说那日小主一直在屋里抄经，她寸步不离地守着。",
    },
  },
  yebanJingrao: {
    id: "yebanJingrao",
    kind: "crisis",
    name: "夜半惊扰",
    emoji: "🐺",
    flavor: "半夜里山上起了狼嚎，一声比一声近，窗纸被风吹得簌簌直响，你再难入睡。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "jingji",
    needTwo: true,
    halfStatusTurns: 1,
    place: "peak",
    resolveCost: [q(-1)],
    resolvedText: "移除事件；需打出两张解牌；化解也要清誉 -1",
    unresolvedText: "未来 2 回合不能打出禅语修身；只打出一张解牌则只持续 1 回合",
    resolvedStory: {
      jingxinRennai: "你把油灯拨亮了些，坐着念了一夜的经。天亮时，狼嚎声也远了。",
      wenTaiyiZhenzhi: "你照着温实初留下的方子煎了一碗安神药，喝下去便睡着了。",
      guojunwangXiangzhu: "他在你门外守了一夜。第二天一早，你推门出去，看见他靠着廊柱睡着了。",
    },
  },
  xianrenKuitan: {
    id: "xianrenKuitan",
    kind: "crisis",
    name: "耳目窥伺",
    emoji: "👀",
    flavor: "这几日，有几个寺里的小尼姑总在凌云峰的院墙外转悠，探头探脑，窃窃私语，像是受了什么人的差遣。",
    reward: NO,
    penalty: NO,
    penaltyStatus: "yanxianHuansi",
    place: "peak",
    resolvedText: "移除事件",
    unresolvedText: "未来 2 回合每回合抓牌 -1（至少 1 张）；本回合若打出过果郡王相助，再清誉 -1（被撞见）",
    resolvedStory: {
      chanyuXiushen: "你开门请她们进来喝茶，念了一段经给她们听。她们听得无趣，便不再来了。",
      jinxiXiangzhu: "槿汐拿着扫帚迎了出去，笑着问她们是来扫地的还是来看热闹的，几句话就把人打发走了。",
    },
  },
  jingrenLairen: {
    id: "jingrenLairen",
    kind: "crisis",
    name: "景仁宫来人",
    emoji: "🏵️",
    flavor: "景仁宫的人借着送香油钱的名头上了山，眼睛一直往你身上瞟，还一再问起你近来都见过什么人。",
    reward: NO,
    penalty: NO,
    resolvedText: "移除事件",
    unresolvedText: "疑点 +1",
    note: "只在陵容怨怼退场时出现：她还在替皇后打听你的消息。",
    resolvedStory: {
      jinxiXiangzhu: "槿汐迎上去，说小主病着，见不得风。来人在门外站了半日，只好走了。",
      chanyuXiushen: "你隔着门静静念经，木鱼声不紧不慢，来人在门外站了许久，一句话也没问出来。",
      wenTaiyiZhenzhi: "温实初恰好来请脉，当着来人的面说你身子虚寒，开了几服补药。",
    },
  },
};

export const ACT1_OPPORTUNITIES: readonly OpportunityId3[] = [
  "huanghouShangshi",
  "huanghouShangshi",
  "taihouChuixun",
  "taihouChuixun",
  "yanqingTanbing",
  "xianfuXianhua",
  "kuairenKuaiyu",
  "yuhuayuanXin",
  "xianfuJing",
  "yanqingDuan",
];
export const ACT1_CRISES: readonly CrisisId3[] = [
  "gongzhongLiuyan",
  "gongzhongLiuyan",
  "neiwufuDiaonan",
  "neiwufuDiaonan",
  "liyiShiwu",
  "suiyuxuanXianhua",
  "suiyuxuanXianhua",
  "qifeiXunxin",
  "sanAgeYaochong",
  "xinrenZhengchong",
  "yuhuayuanQi",
  "xianfuQi",
  "yanqingQi",
];
export const HUANGHOU_EVENTS: readonly HuanghouId[] = ["jingrenHoushang", "xieliGongwu", "antaiBupin", "jiayanXianyi", "shanghuaXiaoju"];

export const TEMPLE_OPPORTUNITIES: readonly OpportunityId3[] = [
  "foqianGongdeng",
  "foqianGongdeng",
  "gongzhongLaixin",
  "gongzhongLaixin",
  "jinganChuilian",
  "shanzhongCaiyao",
  "chanfangChaojing",
  "moyanYuanshou",
  "moyanYuanshou",
];
export const TEMPLE_CRISES: readonly CrisisId3[] = ["tanhuoLiangmi", "tanhuoLiangmi", "fazuoCuhuo", "fazuoCuhuo", "wutouXiangyou"];
/** 凌云峰：静白刁难移出，山居三张加入。 */
export const PEAK_ADD_OPPORTUNITIES: readonly OpportunityId3[] = ["yuexiaDuitan"];
export const PEAK_ADD_CRISES: readonly CrisisId3[] = ["yebanJingrao", "xianrenKuitan"];

const ACT1_EVENTS: ReadonlySet<EventId3> = new Set<EventId3>([...ACT1_OPPORTUNITIES, ...ACT1_CRISES, ...HUANGHOU_EVENTS, "wangyeXiantan", "qingmaiBaoxi"]);

/** 事件上显示的「没化解」文本：第 25 回合果郡王翻船之后，耳目窥伺不再提「撞见」。 */
export function unresolvedText3(def: EventDef3, turn: number): string {
  return def.id === "xianrenKuitan" && turn >= STAGE3.zhoufuTurn ? "未来 2 回合每回合抓牌 -1（至少 1 张）" : def.unresolvedText;
}

/** 事件的解牌：果郡王翻船之后，果郡王相助不再算。 */
export function answeringCards3(id: EventId3, turn: number): CardId3[] {
  const def = EVENTS3[id];
  const singles = (Object.keys(CARDS3) as CardId3[]).filter((c) => CARDS3[c].matches.includes(id));
  return [...singles, ...(def.double ?? []).filter((c) => !singles.includes(c))].filter((c) => !(c === "guojunwangXiangzhu" && turn >= STAGE3.zhoufuTurn));
}

/** 手牌「匹配事件」只列这一幕（寺中 / 凌云峰）真的会出现的事件。 */
export function matchesInAct(matches: readonly EventId3[], act: Act, turn: number): EventId3[] {
  const onPeak = turn > STAGE3.templeLastTurn;
  return matches.filter((id) => {
    if (act === 1) return ACT1_EVENTS.has(id);
    if (ACT1_EVENTS.has(id)) return false;
    const place = EVENTS3[id].place;
    return !(place === "temple" && onPeak) && !(place === "peak" && !onPeak);
  });
}

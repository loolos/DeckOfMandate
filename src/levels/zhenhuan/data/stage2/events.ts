// events
import type { CardId2 } from "./cards";
import type { EvidenceId } from "./evidence";
import type { Delta2 } from "./resources";
import type { StatusId2 } from "./statuses";

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
  /** Replaces `resolvedStory` once 菊残霜冷 is behind us and 眉庄 is 禁足 in 闲月阁. */
  readonly confinedStory?: Partial<Record<CardId2, string>>;
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
    confinedStory: {
      meizhuangXiangzhu: "眉庄禁足出不来，托采月让你捎去她在闲月阁抄的一卷佛经。太后翻了几页，叹了句“这孩子可惜了”，赏了你一串佛珠，又让你给眉庄也带一串回去。",
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
    flavor: "自余莺儿死在冷宫，丽嫔便夜夜惊梦，醒来抱着被子发抖，只怕余氏回来报复，问什么都说不出个所以然。",
    reward: [],
    penalty: [],
    evidence: { id: "fuziZhisi", cards: ["shoulongRenxin", "lingrongXiangzhu"] },
    resolvedText: "可能搜集到华妃的罪证",
    unresolvedText: "无额外效果，事件消失（之后还会出现）",
    resolvedStory: {
      shoulongRenxin: "你让小允子扮作余莺儿的冤魂，在丽嫔窗下幽幽哭了半宿。丽嫔本就怕她死后回来报复，如今只当是她真的来了，吓得魂飞魄散，把华妃怎样害死福子沉井、又怎样推眉庄落水，全说了出来。",
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
    unresolvedText: "这回没能稳妥报喜：洗回机会牌池，下次再来",
    note: "唯有小主身怀龙胎之后，此事才会登门。同一回合打出温太医相助、收拢人心、谨言慎行中任意 2 张，诊脉与报喜都安排妥当，方能顺利晋封；小产后此事件随之消失。",
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
    flavor: "年家既倾，曹贵人携了一盒点心，款款来到碎玉轩。言笑晏晏之间，字字都在探你的心意。你心下明白：此时将她拉拢过来，正是良机。",
    reward: [],
    penalty: [],
    evidence: { id: "caoguirenGaofa", cards: ["shoulongRenxin", "jinyanShenxing"] },
    unresolvedCompact: "✖️",
    resolvedText: "可能搜集到华妃的罪证",
    unresolvedText: "曹贵人等不到你的回音，此事作罢（不会再出现）",
    note: "只出现一次。",
    resolvedStory: {
      shoulongRenxin: "你屏退左右，以茶代言，先陈利害：年家既倒，翊坤宫已是明日黄花，何必再为人作嫁。曹贵人垂眸不语，指尖在盏沿轻轻摩挲，良久方抬头道：「妹妹愿听姐姐的。」",
      jinyanShenxing: "你语声温婉，晓之以理，动之以情，只说为母者所求，不过是公主一世安稳。曹贵人听罢眼圈微红，终是倒向了你这一边，将华妃往日的种种罪状细细道来，末了轻叹：「为了温宜，我自当在御前言明。」",
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
    unresolvedText: "清誉 -1、未来 2 回合每回合抓牌 -1",
    unresolvedCompact: "🪷-1 🗯️×2",
    note: "不论恨意高低都可能抽到（恨意 ≥ 3 才会出现华妃事件）。",
    resolvedStory: {
      shoulongRenxin: "你拿银子撬开了几个宫人的嘴，揪出了那个收了好处的小宫女。打发走时动静不小，宫里都说碎玉轩的主子刻薄。",
      jinxiXiangzhu: "槿汐不动声色地查了几日，寻了个由头把那小宫女退回了内务府。颂芝断了耳目，翊坤宫又把这笔账记在了你头上。",
      jingguanQibian: "你只当不知，故意让那小宫女听见几句假话。翊坤宫扑了个空，华妃气得摔了茶盏。",
      meizhuangXiangzhu: "眉庄不动声色地把那小宫女调去了自己宫里当差，碎玉轩清净了，翊坤宫也挑不出半点错处。",
    },
    confinedStory: {
      meizhuangXiangzhu: "眉庄托采月寻了个由头，向内务府讨人，把那小宫女要去了闲月阁伺候。碎玉轩清净了，翊坤宫也挑不出半点错处。",
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
    unresolvedText: "未来 3 回合每回合抓牌 -1",
    resolvedStory: {
      jinyanShenxing: "你闭门不出，见了谁都只说些天气花草。流言找不到新的把柄，几日便散了。",
      meizhuangXiangzhu: "眉庄姐姐在各宫走动时替你分说清楚，又寻出了嚼舌根的宫女。流言一夜之间没了声息。",
      shoulongRenxin: "你让小允子拿了些碎银子，在各宫的宫人间打点了一圈。收了好处的人自然换了口风，流言渐渐没人再提。",
      jinxiXiangzhu: "槿汐暗中寻到了传话的源头，把几个碎嘴的宫人敲打了一番。流言没了下文。",
    },
    confinedStory: {
      meizhuangXiangzhu: "眉庄禁足在闲月阁出不来，却托采月捎了话出去，又拿出体己银子，请相熟的宫人在各宫替你打点。没过几日，那些闲话便没人再提了。",
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
    confinedStory: {
      meizhuangXiangzhu: "眉庄禁足后自己的份例也紧巴巴的，却仍托采月去内务府递了句话：沈家的人情，他们是记着的。没过两日，碎玉轩的份例便补齐了。",
    },
  },
  liyiShiwu: {
    id: "liyiShiwu",
    kind: "crisis",
    name: "仪态微瑕",
    emoji: "🎎",
    flavor: "请安时一时失仪，慌乱间还受了一点皮肉伤。",
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
    unresolvedText: "伤胎：有孕前身子 -1、未来 2 回合不能打仪容整肃、谨言慎行，不能侍寝；有孕后直接小产",
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
    unresolvedHate: -1,
    unlockHate: 3,
    responsePenalty: {
      jinyanShenxing: { effects: [{ resource: "qingyu", amount: -1 }] },
      meizhuangXiangzhu: { effects: [{ resource: "hate", amount: 1 }] },
      jinxiXiangzhu: { effects: [{ resource: "qingyu", amount: -1 }] },
    },
    resolvedCompact: "🤐🏮🪷-1 · 👭🔥+1",
    resolvedText: "谨言慎行、槿汐相助：只清誉 -1；眉庄相助：只恨意 +1",
    unresolvedText: "清誉 -2、未来 2 回合出牌上限 -1；出气：恨意 -1",
    resolvedStory: {
      jinyanShenxing: "你垂首听训，一句不辩，末了只说“娘娘教训得是”。华妃挑不出大错，却还是当众数落了你几句。",
      meizhuangXiangzhu: "眉庄陪你一同站了半日规矩，替你挡下了不少难听的话。华妃冷笑一声，把这笔账记在了你头上。",
      jinxiXiangzhu: "槿汐上前跪下，把错处都揽到自己身上：“是奴婢没提点好小主。”华妃罚了她半月月钱，满殿的人却都看在眼里，说碎玉轩的主子连个奴才都护不住。",
    },
    confinedStory: {
      meizhuangXiangzhu: "眉庄禁足出不来，却早托人把话递到了太后跟前。请安到一半，寿康宫便有人来传你过去说话，华妃不敢违逆太后，只得放你走，冷笑一声，把这笔账记在了你头上。",
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
    unresolvedText: "延烧：圣宠 -1、清誉 -1，事件留到下回合；下回合仍未应对：圣宠 -2、事件离场，未来 2 回合不能打仪容整肃、谨言慎行，不能侍寝",
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
    unresolvedText: "伤胎：有孕前身子 -1、未来 2 回合不能打仪容整肃、谨言慎行，不能侍寝；有孕后直接小产；另外身子 -1",
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
    resolvedText: "打出 2 张：只恨意 +1（两张中含收拢人心，多次应对后可能搜集到华妃的罪证）；只打出 1 张：回合末清誉 -1、1 回合内不能打收拢人心、槿汐相助",
    unresolvedText: "清誉 -2、2 回合内不能打收拢人心、槿汐相助；出气：恨意 -1",
    note: "双牌：同一回合打出谨言慎行、仪容整肃、收拢人心中任意 2 张。",
    resolvedStory: {
      jinyanShenxing: "你在翊坤宫外长跪不起，话说得极轻极缓：宫人冲撞是奴婢管教无方，不敢辩，也不敢求，只求娘娘息怒。字字挑不出错处，华妃几次想拿话头发作，都没能寻到由头。",
      yirongZhengsu: "你来得不慌不忙，匆忙间仍理好了鬓发，换上一身素净的衣裳，端端正正行了大礼。当着满院太监宫女，你把罪责都揽在自己身上，神色沉静，倒叫华妃一时下不来台。",
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
    penalty: [{ resource: "shengchong", amount: -2 }],
    unresolvedHate: -1,
    blocksSummon: true,
    unlockHate: 7,
    double: { kind: "both", cards: ["yirongZhengsu", "jingguanQibian"] },
    doublePenalty: { effects: [{ resource: "hate", amount: 1 }] },
    resolvedCompact: "🌙✓ 🔥+1",
    unresolvedCompact: "🌙✗ 👑-2 🔥-1",
    resolvedText: "召幸恢复可处理；只恨意 +1（把皇上从翊坤宫拉了回来）",
    unresolvedText: "本回合召幸作废、圣宠 -2；出气：恨意 -1",
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

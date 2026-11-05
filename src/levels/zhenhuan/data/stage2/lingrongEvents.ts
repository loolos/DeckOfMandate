// 陵容 per-event outcomes (§5.4)
import type { EventId2 } from "./events";
import type { LingrongTier } from "./lingrongRelation";
import type { Delta2 } from "./resources";

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
    distant: { resolves: true, effects: [], relation: 1, story: "陵容随你一同去了景仁宫。皇后见你们同来，温言夸了你们几句，各赏了东西，只是你们分着沾光，谁也没多得。出来时陵容笑着说：「姐姐如今是皇后跟前的红人了，妹妹也跟着沾了光。」临走又把一支珠花塞进你手里：「这个，妹妹替姐姐留着的。」这一路上，她话比来时多了些。" },
    resentful: { resolves: false, relation: 1, story: "皇后的赏赐落到了陵容头上。她从景仁宫出来，在碎玉轩门口站了好一会儿，终究还是进来坐了坐。" },
  },
  jingxinTiaoyang: {
    close: { resolves: true, relation: 1, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容亲手制了安神香送来，你一夜好眠。" },
    distant: { resolves: true, relation: 1, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容送来安神香。「这香方子金贵，姐姐省着些用。」" },
    resentful: { resolves: true, relation: 1, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], story: "陵容送来的安神香气味清冽，你倒也睡得安稳。" },
  },
  baohuadianQifu: {
    close: { resolves: true, effects: [{ resource: "qingyu", amount: 1 }, { resource: "shenzi", amount: 1 }], relation: 1, story: "你与陵容并肩跪在佛前，她替你多磕了三个头。起身时，她悄悄握了握你的手。" },
    distant: { resolves: true, effects: [{ resource: "shenzi", amount: 1 }], relation: 1, story: "「姐姐求子心切，妹妹自然陪着。」陵容陪你上了一炷香，回去的路上，话比来时多了些。" },
    resentful: { resolves: true, effects: [], relation: 1, story: "佛前青烟袅袅，陵容一言不发，临走时却替你掸了掸衣上的香灰。" },
  },
  liPinJingmeng: {
    close: { resolves: true, evidence: true, relation: 1, story: "陵容学着余莺儿生前的腔调，在丽嫔窗下幽幽哭了半宿。丽嫔本就怕她死后来报复，一听便吓破了胆，把华妃害死福子沉井、推眉庄落水的事全说了。事后陵容抿嘴笑：「也只有姐姐，敢叫我做这样的事。」" },
    distant: { resolves: true, evidence: true, story: "陵容肯帮这个忙，却撇嘴道：「这种装神弄鬼的事，也只有姐姐想得出来。」丽嫔终究吐了实话。" },
    resentful: { resolves: false, relation: 1, effects: [{ resource: "hate", amount: 1 }], story: "消息不知怎么走漏到了翊坤宫，丽嫔那边一下子没了动静。陵容低着头来见你，绞着帕子说是自己嘴不严。" },
  },
  gongzhongLiuyan: {
    close: { resolves: true, story: "陵容在各宫替你辟谣：「姐姐的为人，我最清楚。」说这话时，她的声音比平日都响亮些。" },
    distant: { resolves: true, story: "「姐姐何必在意这些闲话，清者自清嘛。」陵容嘴上这么说，倒也替你分辩了几句，走前还回头看了你一眼。" },
    resentful: { resolves: false, relation: 1, aggravate: true, story: "陵容在别人跟前添油加醋，流言越传越凶。可到了夜里，宝鹊又悄悄送来一盏安神汤，说是她家小主吩咐的。" },
  },
  neiwufuDiaonan: {
    close: { resolves: true, relation: 1, extraDraw: 1, story: "陵容出身寒微，最懂怎么跟内务府打交道，没两日便替你把份例要了回来。" },
    distant: { resolves: true, story: "「妹妹出身寒微，跟奴才们打交道倒是在行。」份例总算补齐了。" },
    resentful: { resolves: true, effects: [{ resource: "qingyu", amount: -1 }], story: "陵容出面去要份例，却把事情闹得人尽皆知，倒显得你斤斤计较。" },
  },
  liyiShiwu: {
    close: { resolves: true, relation: 1, shuhenjiao: true, story: "陵容扶你起来，替你整好衣裳，又说回头送药来。" },
    distant: { resolves: true, relation: 1, shuhenjiao: true, story: "「姐姐素来最重仪态，这回可要仔细些。」陵容替你遮掩过去，说回头送药来。" },
    resentful: { resolves: true, relation: 1, shuhenjiao: true, story: "陵容上前替你圆了场，低头时嘴角却像是笑了一下。她说回头送药来。" },
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
    distant: { resolves: true, relation: -1, effects: [{ resource: "qingyu", amount: -1 }], story: "「我一个答应的份例，哪比得上姐姐的。」陵容嘴上这么说，还是送了些炭来，放下便走了。你后来才听说，那是她攒了一冬没舍得用的。你心里一酸，却也听出她那句话里的自卑，她走得很快，像是怕你看见她的神色。" },
    resentful: { resolves: false, relation: 1, story: "陵容推说自己也不够用，一样东西也没送来。第二日清早，碎玉轩门口却多了一小篓炭，没留话。" },
  },
  huanyixiangZhuanchong: {
    close: { resolves: true, relation: -1, effects: [{ resource: "hate", amount: 1 }], story: "陵容在御花园唱了一支新曲，把皇上从翊坤宫引了过来，又借故走开，留你陪驾。回宫的路上她一直低着头，过了许久才轻声说：「姐姐好福气。」她笑着，笑意里却有一瞬黯然。" },
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
  resentful: "你请陵容过来坐坐，她句句带刺，话里话外透着几分不甘。可坐得久了，语气也松了些，临出门时回头看了你一眼。",
};

export const LINGRONG_NEGLECT_TEXT = {
  drop: "陵容来碎玉轩候了半日，宫人说小主正忙着，她没能见上一面，悻悻回了宫。",
  floor: "陵容又扑了个空，听说小主还在忙，眼里的光淡了些。",
};

export const SHUHENJIAO_TEXT = {
  close: "陵容亲手替你上药，药膏清凉，伤处好得很快。",
  heal: "药膏清凉，伤处好得很快，竟连一点疤痕也没留下。",
  safe: "药膏清凉，伤处好得很快。",
  harm: "药膏香气浓得有些异样，你只当是好药。",
};

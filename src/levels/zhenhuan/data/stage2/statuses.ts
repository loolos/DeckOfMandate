// statuses
import type { CardId2 } from "./cards";
import type { Delta2 } from "./resources";

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
  | "jiaoyanZanlian"
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
  /** 华妃恨意 cannot rise above this while the status lasts (it binds from the turn it is gained). */
  readonly hateCap?: number;
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
    effectText: "抵消一次伤胎类事件的后果（有孕前不扣身子；有孕后免于小产）；玉阶炎日时不能阻止小产，但身子少扣 1。第一次适用时自动用掉。",
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
  jiaoyanZanlian: {
    id: "jiaoyanZanlian",
    name: "骄焰暂敛",
    emoji: "🪤",
    tag: "positive",
    duration: 3,
    drawModifier: 0,
    hateCap: 6,
    effectText: "本回合起至未来 3 回合，华妃恨意最多为 6（获得时高于 6 的立即降到 6）。",
    flavor: "华妃深夜搜宫扑了个空，反被皇上斥责轻率跋扈，这些日子收敛了不少。",
    source: "闲月阁：【隔墙有耳】在场时，同一回合打出槿汐相助、眉庄相助与收拢人心（整局一次）",
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

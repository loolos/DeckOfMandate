// 陵容（第一幕）
import { LINGRONG_EVENT, LINGRONG_SUMMON, type LingrongOutcome, type LingrongTier } from "../stage2Content";
import { type EventId3, q, sc } from "./events";

type TierTable = Record<LingrongTier, LingrongOutcome>;

/** Stage-2 tables reused for the shared events; stage-3 events get their own. */
export const LINGRONG_EVENT3: Partial<Record<EventId3, TierTable>> = {
  /** 只在栗糕清苦的条件下陵容才接得了（见 lizigaoOpen）；无论情分都能化解。 */
  sanAgeYaochong: {
    close: { resolves: true, relation: 1, story: "陵容听说皇上一连几日歇在长春宫，便抱着琵琶去了养心殿外的廊下，唱的是你从前教她的那支小曲。皇上循声出来，问她怎么不在碎玉轩陪着莞嫔，当晚便摆驾来看你，摸着你的肚子笑了好一会儿。" },
    distant: { resolves: true, relation: 1, story: "「姐姐如今身子重，这些事交给妹妹便是。」陵容往养心殿送了一回新调的安神香，顺口提了句碎玉轩夜里不大安稳。皇上第二日便离了长春宫，过来陪你坐了半晌。" },
    resentful: { resolves: true, relation: 1, story: "陵容低着头应了，隔了两日才来回话，说长春宫那边已经消停了。皇上果然不往长春宫去了，只来碎玉轩坐了不到一盏茶的工夫，又说要去听陵容新学的曲子。" },
  },
  huanghouShangshi: {
    close: { resolves: true, relation: 1, effects: [sc(1)], story: "陵容陪你去景仁宫晨省。皇后拉着你们俩问长问短，又各赏了一对玉镯。出来时陵容挽着你，说这镯子最衬姐姐。" },
    distant: { resolves: true, relation: 1, effects: [sc(1)], story: "陵容随你去了景仁宫，皇后温言问了几句，各赏了东西。一路回来，她话不多，只说了句「姐姐受累了」。" },
    resentful: { resolves: false, relation: 1, story: "晨省时皇后的话头多半落在陵容身上，你只在一旁坐着。出来后她站了片刻，没有说话，各自回宫去了。" },
  },
  gongzhongLiuyan: {
    close: { ...LINGRONG_EVENT.gongzhongLiuyan!.close, story: "陵容在各宫替你说话，句句圆融：「姐姐如今是什么身份，谁不知道？旁人嚼舌根，不过是眼红罢了。」她笑盈盈的，三两句便把几个碎嘴的宫人说得讪讪低了头。" },
    distant: { ...LINGRONG_EVENT.gongzhongLiuyan!.distant, story: "「姐姐何必在意这些闲话，清者自清。」陵容在几处宫里替你分辩，话说得滴水不漏，既没得罪谁，也没落下你的不是。" },
    resentful: { ...LINGRONG_EVENT.gongzhongLiuyan!.resentful, relation: 1, story: "陵容去各宫走了一圈，话说得阴阳怪气：「姐姐如今恩宠正盛，招人说两句，也是该的。」流言反倒越传越凶。到了夜里，宝鹊又悄悄送来一盏安神汤，说是她家小主吩咐的。" },
  },
  neiwufuDiaonan: {
    close: { ...LINGRONG_EVENT.neiwufuDiaonan!.close, relation: 0, story: "陵容笑着往内务府走了一趟，几句体面话、一包碎银，管事太监便点头哈腰。她回来笑说：「这些人的心思，我最清楚，给足了面子，没有办不成的事。」" },
    distant: { ...LINGRONG_EVENT.neiwufuDiaonan!.distant, story: "「内务府的差事，妹妹跑一趟便是。」陵容话说得客气周到，当日便把份例补齐了，走时还笑道：「姐姐有事，只管吩咐。」" },
    resentful: { ...LINGRONG_EVENT.neiwufuDiaonan!.resentful, story: "陵容出面去要份例，话里带刺：「姐姐如今金贵，连份例都要旁人跑腿。」这话传开，倒显得你斤斤计较。" },
  },
  liyiShiwu: {
    close: { ...LINGRONG_EVENT.liyiShiwu!.close, story: "陵容不慌不忙扶你起来，替你把衣裳理得妥妥帖帖，笑道：「姐姐放心，回头送药膏来，保管看不出一丝痕迹。」" },
    distant: { ...LINGRONG_EVENT.liyiShiwu!.distant, story: "「姐姐素来最重仪态，这回可得留神些。」陵容三言两语把场面遮掩过去，才说回头送药来。" },
    resentful: { ...LINGRONG_EVENT.liyiShiwu!.resentful, story: "陵容上前替你圆了场，话却带着刺：「姐姐一向端庄，原来也有出岔子的时候。」说罢才淡淡补了一句：「回头我让人送药来。」" },
  },
  wangyeXiantan: {
    close: { resolves: true, effects: [q(1)], story: "陵容替你收下了王爷送来的诗集，笑着说王爷的字写得真好。又陪你挑了几句诗回赠。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容替你去回了王爷的礼，回来只说东西送到了。" },
    resentful: { resolves: true, effects: [q(1)], story: "陵容替你把东西送回了王爷那里，淡淡说了句「送到了」，便回自己宫里去了。" },
  },
  yanqingTanbing: {
    close: { resolves: true, effects: [q(1)], story: "陵容陪你去延庆殿，调了一味安神的香给端妃。端妃看了她一眼，淡淡道了声谢。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你去了一趟延庆殿，一路上没怎么说话。" },
    resentful: { resolves: false, relation: 1, story: "陵容说延庆殿药味重，熏得她头疼，走到半路便回去了。" },
  },
  xianfuXianhua: {
    close: { resolves: true, effects: [q(1)], story: "陵容绣了一方素帕，同你一起送去咸福宫。敬妃拉着她的手，夸她手巧。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你去了咸福宫，坐在一旁安安静静的，偶尔替你们添茶。" },
    resentful: { resolves: false, relation: 1, story: "陵容推说手头有事，没去。敬妃问起她，你只得替她圆了几句。" },
  },
  kuairenKuaiyu: {
    close: { resolves: true, effects: [sc(1)], story: "陵容唱了一支江南小调，欣贵人听得直拍手，说碎玉轩真是热闹。" },
    distant: { resolves: true, effects: [sc(1)], story: "陵容陪着说了几句话，欣贵人嘴快，她插不上话，便只是笑。" },
    resentful: { resolves: false, relation: 1, story: "欣贵人说话没轻没重，陵容听了几句便沉了脸，起身走了。" },
  },
  antaiBupin: {
    close: { resolves: true, relation: 1, story: "陵容尝了尝那盅补品，说炖得偏燥，不如先搁着，另让小厨房炖了盅清淡的给你。她替你掖好被角，又陪你说了一会儿话。" },
    distant: { resolves: true, relation: 1, story: "陵容说这补品炖得偏燥，替你换了盅清淡的，又叮嘱你多歇着。" },
    resentful: { resolves: true, story: "陵容端走了补品，说替姐姐换盅清淡的来。她没多坐，放下话便走了。" },
  },
  jiayanXianyi: {
    close: { resolves: true, relation: 1, effects: [sc(1)], story: "你抚琴，陵容唱曲。一曲终了，皇上抚掌大笑，赏赐都记在了碎玉轩名下。陵容低着头，没说话。" },
    distant: { resolves: true, relation: 1, story: "你抚琴，陵容唱曲。皇上的目光落在了陵容身上，赏赐也送去了她宫里。" },
    resentful: { resolves: true, effects: [sc(1)], story: "临上场前，陵容说嗓子哑了。你只好独自弹了一曲。皇上很喜欢，陵容在席间看着你，脸上没有表情。" },
  },
  shanghuaXiaoju: {
    close: { resolves: true, effects: [q(1)], relation: 1, story: "陵容陪你在花下应酬各宫，替你挡了几句不好接的话。两人说说笑笑，一下午过得飞快。" },
    distant: { resolves: true, effects: [q(1)], story: "陵容陪你在花下坐了半日。你说起各宫的趣事，她也跟着笑了笑。" },
    resentful: { resolves: true, effects: [q(1)], relation: 1, story: "陵容陪你去了。席间她话不多，倒也替你周全了礼数。" },
  },
};

/** 海棠春睡之后陵容情分暗中降档时补的一句剧情（不写数字）。 */
export const HAITANG_COOL_TEXT: Record<"distant" | "resentful", string> = {
  distant: "海棠花期过后，陵容来碎玉轩请安，只在门口站了站，福了福身便说宫里还有绣活要赶。你留她坐坐，她笑着应了一声，却始终没有走进来。",
  resentful: "陵容再来碎玉轩时，海棠树下的石凳她看也没看。你递过茶，她接了，却放在一旁没喝，淡淡说了句：「姐姐如今忙，我就不多叨扰了。」",
};

export { LINGRONG_SUMMON };

/** 陵容 played with nothing on the table: just keeping her company, 情分 +1. After 纯元故衣 your words turn cold. */
export const LINGRONG_IDLE_TEXT3: Record<LingrongTier, string> = {
  close: "你留陵容在碎玉轩喝茶。她如今应对得体，三言两语便把话说得熨帖，连延禧宫的旧事也只挑好听的讲。临走时她拉着你的袖子，说下回再来。",
  distant: "你请陵容过来坐坐。她言谈周全，客客气气，茶盏放得端端正正，坐久了才多说了几句心里话。",
  resentful: "你请陵容过来坐坐，她句句冷嘲热讽：「姐姐如今忙得很，难为还记得妹妹。」可坐得久了，语气也松了些。",
};
export const LINGRONG_COLD_TEXT = "你留陵容说话。自纯元故衣那一日后，你心里总横着一根刺，说着说着，话头竟绕回了那件旧衣上。你望着窗外，低低说了一句：「陵容，我这心，是冷了。」陵容一怔，忙握住你的手，柔声劝了许久。";

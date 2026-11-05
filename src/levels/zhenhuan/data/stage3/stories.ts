// stories
import type { LingrongTier } from "../stage2Content";
import type { CardId3, RelicId } from "./cards";
import { q, sc, sz } from "./events";
import type { Delta3 } from "./level";
import type { SecretId } from "./secrets";
import type { StatusId3 } from "./statuses";

export type StoryId3 =
  | "zhaoxing"
  | "huanghouXiaoyi"
  | "haitangChunshui"
  | "haitangYeyu"
  | "tonghuataiChuyu"
  | "zhenYuandaoXiayu"
  | "wanwanLeiqing"
  | "mochou"
  | "shanmenOuyu"
  | "wentaiyiTanshi"
  | "taxueWenji"
  | "hehunGengtie"
  | "diannanZhixing"
  | "zhoufuEHao"
  | "yihuaOuyu";

/** 甄远道下狱: which option, and how heavy it lands (see `xiayuCost`). */
export type XiayuChoice = "kneel" | "taihou" | "guo" | "lingrong" | "shoulong" | "jinyan";

export type StoryOption3 = {
  readonly id: string;
  readonly name: string;
  readonly card?: CardId3;
  readonly hidden?: boolean;
  /** 双牌：同回合须再打出这张故事里另一张可应对此事的牌。 */
  readonly two?: boolean;
  /** 双牌：第二张须与第一张不同名（各打一张）。 */
  readonly distinct?: boolean;
  readonly effects: readonly Delta3[];
  readonly text: string;
  readonly compact?: string;
  readonly story: string;
  readonly tierStory?: Record<LingrongTier, string>;
  readonly pregnancy?: boolean;
  readonly summon?: boolean;
  /** 陵容 answers: she notes this (hidden). */
  readonly secret?: SecretId;
  readonly drawCards?: number;
  /** 本回合出牌次数 +N（立即生效）。 */
  readonly extraPlays?: number;
  readonly removeNegatives?: "all" | 1;
  /** 菀菀类卿: 身子 never drops below 1 here. */
  readonly shenziFloor?: number;
  readonly xiayu?: XiayuChoice;
  /** Story-specific flag the engine records (桐花台 / 莫愁 / 温太医探视 / 庚帖 / 送行). */
  /** 舟覆后果郡王相助可能变成的遗物。 */
  readonly relic?: RelicId;
  readonly flag?: "li" | "di" | "lingrong" | "luofa" | "gengtie" | "songxing" | "xiangshou" | "ouyu";
  readonly status?: StatusId3;
};

export type StoryDef3 = {
  readonly id: StoryId3;
  readonly name: string;
  readonly emoji: string;
  readonly flavor: string;
  /** 被废出宫时换用的开场文字。 */
  readonly feichuFlavor?: string;
  readonly note?: string;
  readonly defaultOptionId: string;
  readonly options: readonly StoryOption3[];
};

export const FIXED_STORIES3: Partial<Record<number, StoryId3>> = {
  2: "huanghouXiaoyi",
  3: "haitangChunshui",
  5: "tonghuataiChuyu",
  8: "zhenYuandaoXiayu",
  9: "wanwanLeiqing",
  11: "mochou",
  12: "shanmenOuyu",
  15: "wentaiyiTanshi",
  19: "taxueWenji",
  23: "hehunGengtie",
  24: "diannanZhixing",
  25: "zhoufuEHao",
};

export const STORIES3: Record<StoryId3, StoryDef3> = {
  zhaoxing: {
    id: "zhaoxing",
    name: "凤鸾承恩",
    emoji: "🌙",
    flavor: "敬事房的公公来报：今夜皇上翻了你的绿头牌。",
    note: "侍寝成功圣宠 +1，按身子 ÷ 5 判定喜脉。不处理则称病避宠。",
    defaultOptionId: "chengbingBichong",
    options: [
      {
        id: "chengbingBichong",
        name: "称病避宠",
        effects: [{ resource: "shengchong", amount: -1 }],
        text: "圣宠 -1",
        story: "你推说身子不适，请皇上另择他人。敬事房的公公讪讪地走了。",
      },
      { id: "shengzhuangChengen", name: "盛装承恩", card: "yirongZhengsu", effects: [], summon: true, text: "侍寝成功", story: "你盛装梳妆、含笑承恩，皇上见了心情大好，留你说话直到天明。" },
      { id: "shiciDechong", name: "以诗词得宠", card: "jinyanShenxing", effects: [], summon: true, text: "侍寝成功", story: "你与皇上对诗到深夜，他笑着说你是解语花。" },
      { id: "lingrongXiezhuang", name: "陵容相助", card: "lingrongXiangzhu", effects: [], text: "效果视你与陵容的情分而定", story: "陵容来了碎玉轩，替你梳妆更衣，又陪你说了会儿话，才送你出门。" },
    ],
  },
  huanghouXiaoyi: {
    id: "huanghouXiaoyi",
    name: "皇后笑意",
    emoji: "🏵️",
    flavor: "华妃倒后，皇后亲自来碎玉轩道贺，赏下一对玉镯。她笑得温和，你却想起翊坤宫倒下那日，她站在廊下一言不发的样子。",
        defaultOptionId: "xieen",
    options: [
      { id: "xieen", name: "谢恩收下", effects: [sc(1)], text: "圣宠 +1", story: "你跪下谢恩，把玉镯收进了妆奁。皇后扶你起来，说往后常来景仁宫坐坐。" },
      {
        id: "daishangYuzhuo",
        name: "戴上玉镯",
        card: "yirongZhengsu",
        effects: [sc(2)],
        text: "圣宠 +2",
        story: "你当场把玉镯戴上，衬着新裁的衣裳。当晚皇上来碎玉轩，一眼就看见了，说皇后挑东西向来有眼光。",
      },
      {
        id: "gongjinYingdui",
        name: "恭谨应对",
        card: "jinyanShenxing",
        effects: [q(1)],
        text: "清誉 +1",
        story: "你句句谦让，只说华妃之事全赖皇上圣明、皇后主持。皇后笑意更深了些，回去便在太后跟前夸你懂事。",
      },
      {
        id: "dashangLairen",
        name: "打赏来人",
        card: "shoulongRenxin",
        effects: [q(1), sc(1)],
        text: "清誉 +1、圣宠 +1",
        story: "你让小允子重重打赏了景仁宫来送东西的宫人。没过几日，各宫都传碎玉轩的主子待下宽厚，这话也传到了皇上耳朵里。",
      },
    ],
  },
  haitangChunshui: {
    id: "haitangChunshui",
    name: "海棠春睡",
    emoji: "🌸",
    flavor: "华妃倒后，皇上夜夜往碎玉轩去，在你窗前那几株海棠下留宿。敬事房的牌子翻来翻去，翻的只有碎玉轩；别的宫里的灯一盏盏暗下去，只有这里的海棠树下还亮着。你独占君恩，宠冠六宫，满宫的眼睛都盯在碎玉轩的院墙上：有人艳羡，更多的是嫉恨。请安时的茶凉了没人添，座次越挪越远，话里话外都带着刺。这份恩宠，清誉要担，身子要熬，人言也要受，端看你怎么应对。",
    note: "还没有身孕时必定有孕；已有孕时只是一段恩宠。身上有【抱恙在身】也照常有孕。",
    defaultOptionId: "chengen",
    options: [
      {
        id: "chengen",
        name: "承恩",
        effects: [sc(2), q(-3), sz(-2)],
        status: "liuyanChanshen",
        pregnancy: true,
        text: "圣宠 +2、清誉 -3、身子 -2；未来 3 回合每回合抓牌 -1；未孕时必定有孕",
        story: "海棠花下，皇上握着你的手说：「朕的嬛嬛。」一连数夜，他再没踏进过别的宫门，敬事房的牌子翻来翻去，翻的只有碎玉轩。第二日请安，满殿的珠翠都亮着，齐妃的茶盏重重一搁，瓜尔佳氏用帕子掩着嘴笑，那笑却冷得像冰。皇后温言说了句「妹妹好福气」，满座便都低了头。回宫的路上，你听见身后有人压着嗓子说：「专宠至此，也不怕折了福。」你夜夜承恩，没睡过几个整觉，面上的粉一日厚过一日，人也一天天乏了下去。",
      },
      {
        id: "haitangXinzhuang",
        name: "海棠新妆",
        card: "yirongZhengsu",
        effects: [sc(2), sz(-2)],
        status: "liuyanChanshen",
        pregnancy: true,
        text: "圣宠 +2、身子 -2；未来 3 回合每回合抓牌 -1；未孕时必定有孕",
        story: "你簪了一朵新开的海棠，妆容端庄，不见半分轻佻。皇上看了你很久，说海棠春睡，不及你一笑。次日去景仁宫请安，各宫的目光都落在你鬓边那朵花上：齐妃盯着看了许久，转头对身边人说：「新鲜花样，也只有碎玉轩的人才戴得起。」后宫里再多的酸话，也挑不出你仪态的错处，只是陪驾熬到夜深，人难免乏了。闲话也一日日传开：说碎玉轩的海棠，是只开给一个人看的；说这六宫的雨露，如今都落在了一处。",
      },
      {
        id: "dengxiaDushi",
        name: "灯下读诗",
        card: "jinyanShenxing",
        effects: [sc(2), q(-3), sz(-2)],
        pregnancy: true,
        text: "圣宠 +2、清誉 -3、身子 -2；未孕时必定有孕",
        story: "你在灯下陪皇上读诗，读到「只恐夜深花睡去」，他笑着接了下一句，一直读到天明。你句句谨慎，不提旁人一字，外头抓不到话柄。可皇上连着数日宿在碎玉轩，别处的宫灯都熄得早，宠冠六宫四个字，不用谁说出口，满宫的眼睛都在替你说。请安时，有人阴阳怪气，说你不识大体；有人当面笑着，转身就在皇后跟前叹气。你自己也明白，这样的恩宠是烧着的火，夜读到天明，身子也吃不消。",
      },
      {
        id: "jinxiZhoudao",
        name: "槿汐周全",
        card: "jinxiXiangzhu",
        effects: [sc(2), q(-3)],
        status: "liuyanChanshen",
        pregnancy: true,
        text: "圣宠 +2、清誉 -3；未来 3 回合每回合抓牌 -1；未孕时必定有孕",
        story: "槿汐早早备下安神汤，皇上睡下后又轻手轻脚收拾了一切，叫你好生歇着。皇上一连数夜只往碎玉轩来，你的身子没有被拖垮，可各宫的嫉恨再藏不住：有人说你狐媚专宠，有人说碎玉轩的恩宠来得太容易，连奉茶的小宫女也被人拦在路上盘问，今晚皇上用了什么，说了什么。这些话传得比海棠谢得还快，你听槿汐一一说来，只淡淡道：「由她们去。」",
      },
    ],
  },
  haitangYeyu: {
    id: "haitangYeyu",
    name: "海棠春睡",
    emoji: "🌸",
    flavor: "太医的喜脉早已报到了御前。皇上这几日仍常往碎玉轩来，只在海棠树下坐坐，陪你说说话。别的宫里却是一夜比一夜冷清，你有孕在身还独占圣驾，宠冠六宫，惹得各宫的嫉妒再也藏不住。有人当面关切，转身就在皇后跟前叹气。这份恩宠，清誉要担，身子要熬，人言也要受，端看你怎么应对。",
    defaultOptionId: "chengen",
    options: [
      {
        id: "chengen",
        name: "承恩",
        effects: [sc(2), q(-3), sz(-2)],
        status: "liuyanChanshen",
        text: "圣宠 +2、清誉 -3、身子 -2；未来 3 回合每回合抓牌 -1",
        story: "海棠树下，皇上扶你坐下，只问腹中孩子今日闹不闹。那一夜他宿在碎玉轩，听你絮絮说了半宿的话。可你有孕还霸着圣驾的事传了出去，各宫都说你不知进退，齐妃当着众人的面说：「有了身子的人，还是该静养，莫要劳烦皇上。」这话听着是关切，旁人却都听出了刺。别的宫里一夜比一夜冷清，那些落空的盼头都算在了你头上。你本就辛苦，这几日又添了心事，人愈发恹恹的。",
      },
      {
        id: "haitangXinzhuang",
        name: "海棠新妆",
        card: "yirongZhengsu",
        effects: [sc(2), sz(-2)],
        status: "liuyanChanshen",
        text: "圣宠 +2、身子 -2；未来 3 回合每回合抓牌 -1",
        story: "你簪了一朵新开的海棠，妆容端庄，皇上笑说等孩子落了地，要带他来看这满树的花。无人能挑你的错处，可宫里的闲话仍一句句往碎玉轩递：说你有了身孕还拢着圣心不放，说六宫的雨露全落在了一处，连皇后赏下的东西，也有人酸溜溜地说是看在龙裔的面上。你有孕在身，陪驾到夜深，总归是累着了。",
      },
      {
        id: "dengxiaDushi",
        name: "灯下读诗",
        card: "jinyanShenxing",
        effects: [sc(2), q(-3), sz(-2)],
        text: "圣宠 +2、清誉 -3、身子 -2",
        story: "你在灯下陪皇上读诗，读到「只恐夜深花睡去」，他笑着把你肩上的披风拢了拢，不许你熬夜。你言行谨慎，没留下半点话柄，可有孕仍独占圣驾，各宫都看不顺眼。请安时没人敢明说，只是茶凉了没人添，座次越挪越远，人前人后的议论没有停过。圣宠正盛，也正是众矢之的，你夜里睡得不安稳，身子也跟着受累。",
      },
      {
        id: "jinxiZhoudao",
        name: "槿汐周全",
        card: "jinxiXiangzhu",
        effects: [sc(2), q(-3)],
        status: "liuyanChanshen",
        text: "圣宠 +2、清誉 -3；未来 3 回合每回合抓牌 -1",
        story: "槿汐早早备下安神汤，又嘱咐小厨房把夜里的点心换成清淡的，皇上走后便扶你睡下。你的身子无碍，可有孕还独占圣驾，各宫的闲话是怎么也拦不住的。宠冠六宫，便是把嫉妒都招到了自己身上：有人在皇后面前提起你的恩宠太盛，有人暗暗打听碎玉轩的用度，连往日走得近的几位，说话也多了几分小心。这些话一句句传到你耳里，你只是抚着小腹，一言不发。",
      },
    ],
  },
  tonghuataiChuyu: {
    id: "tonghuataiChuyu",
    name: "桐花台初遇",
    emoji: "🎐",
    flavor: "果郡王自外游历回京。你在桐花台听见笛声，循声走过去，撞见了他。",
    note: "无论怎样结算，之后牌库加入第 1 张【果郡王相助】，机会池洗入【王爷闲谈】。",
    defaultOptionId: "lundi",
    options: [
      { id: "lundi", name: "驻足听笛", relic: "yiwuDipu", effects: [], drawCards: 1, flag: "di", text: "抽 1 张牌（他记住了你）", compact: "🎴+1", story: "你说他的笛子吹得太急，像是心里有事。他怔了怔，笑着说：「小主是第一个这样说的人。」" },
      { id: "lundiCard", name: "论笛谈诗", card: "yirongZhengsu", relic: "yiwuDipu", effects: [], drawCards: 2, flag: "di", text: "抽 2 张牌（他记住了你）", compact: "🎴+2", story: "你理了理衣裳走上前去，与他说起笛中的曲子。他听得认真，临走时回头看了你一眼。" },
      { id: "yili", name: "以礼相待", card: "jinyanShenxing", relic: "yiwuTonghua", effects: [q(1)], flag: "li", text: "清誉 +1", story: "你福了福身，只道了一句「王爷安好」，便转身离开了。他站在桐花台上，没有再吹笛子。" },
      {
        id: "lingrongZaice",
        name: "有陵容在侧",
        card: "lingrongXiangzhu",
        effects: [],
        extraPlays: 1,
        flag: "lingrong",
        secret: "wangyeZengwu",
        text: "她替你圆场，本回合出牌 +1",
        story: "陵容在一旁笑着替你圆了场，三言两语便把话头岔了开去。",
        tierStory: {
          close: "陵容笑盈盈地替你挡在前头，说姐姐走累了，拉着你便走。回去的路上，她挽着你的胳膊，说桐花台的花开得真好。",
          distant: "陵容替你圆了场，说你们是来赏花的。王爷笑着送了你们一枝桐花，陵容接过来，回去替你插在了瓶里。",
          resentful: "陵容替你说了几句场面话，王爷送了一枝桐花。陵容接过来，回去的路上没怎么说话。",
        },
      },
    ],
  },
  zhenYuandaoXiayu: {
    id: "zhenYuandaoXiayu",
    name: "甄远道下狱",
    emoji: "⛓️",
    flavor: "鄂敏的折子递上去不过数日，一道旨意便传进了碎玉轩：甄远道因文字狱下狱，家中女眷皆受拘押。槿汐白着脸进来回话，话没说完，你手里的茶盏已摔在了地上。「小主，」她跪下去，「眼下宫里宫外都在看着碎玉轩，小主万不能乱了方寸。」你扶着桌角站了许久，窗外的风吹得帘子一下一下地响。",
    note: "每打出一张解牌，局势降一档，降到零则完美解决；回合末仍未了结，按默认「跪求皇上」处理。",
    defaultOptionId: "guiqiu",
    options: [
      { id: "guiqiu", name: "跪求皇上", effects: [], xiayu: "kneel", text: "圣宠、清誉受损（清誉少损）", story: "你脱去钗环，素衣跪在养心殿外的石阶上。夜露渐重，膝下一片冰凉，殿内的灯却始终亮着。天将亮时，苏培盛才缓缓走出来，低着头传话：「小主请回吧，皇上说了，后宫不得干政。」你伏在地上，指甲掐进掌心，却连父亲的名字也没能再提一句。" },
      { id: "qiuTaihou", name: "求太后", effects: [], xiayu: "taihou", text: "圣宠、清誉受损（圣宠少损）", story: "你顶着晨雾去了寿康宫，在太后跟前一跪便是半个时辰。太后拨着佛珠，叹道：「哀家也知道你的难处，可你一个后宫嫔妃，为前朝的事奔走，原是犯忌讳的。」她终究松了口，答应寻个时机在皇上面前提一句。你谢恩出来，已听见廊下的宫人窃窃私语，说甄氏到底是不安分的。" },
      {
        id: "tuoGuo",
        name: "托果郡王周旋",
        card: "guojunwangXiangzhu",
        effects: [],
        xiayu: "guo",
        text: "解牌：局势降一档",
        story: "果郡王听罢，沉默片刻，只说：「你放心，我去想办法。」他当日便递牌子进了前朝，一连几日辗转于各府之间，又亲自去刑部打点了狱卒。数日后他托人带话进来：「令尊在狱中尚好，只是人瘦了些。你照看好自己，别叫他们担心。」",
      },
      {
        id: "tuoRenxin",
        name: "托人在前朝打点",
        card: "shoulongRenxin",
        effects: [],
        xiayu: "shoulong",
        text: "解牌：局势降一档",
        story: "你把妆匣里剩下的金银细软都倒了出来，交给小允子：「去前朝，能托的人都托一遍，狱里要什么，一样不许缺。」小允子磕了个头，揣着包袱消失在夜色里。几日后他回来复命，嗓子都哑了：「小主，狱卒收了银子，答应给老爷换了干净的被褥，还捎进去一件厚衣裳。」",
      },
      {
        id: "yinrenBuyan",
        name: "隐忍不言",
        card: "jinyanShenxing",
        effects: [],
        xiayu: "jinyan",
        text: "解牌：局势降一档",
        story: "槿汐劝你，这时候多说一句便多错一句。你攥着帕子点了点头，吩咐宫门落锁，称病不见客。夜里你坐在灯下，一遍遍默念父亲的名字，却一个字也不敢外传。皇上没有来，也没有降罪碎玉轩，只是那盏常常为你留着的灯，许久没再亮过。",
      },
      {
        id: "tuoLingrong",
        name: "托陵容传信",
        card: "lingrongXiangzhu",
        effects: [],
        xiayu: "lingrong",
        secret: "yuzhongShuxin",
        text: "解牌：局势降一档",
        story: "陵容听完，低头想了想，轻声说：「姐姐别急，我家里在刑部有几分旧情，让我试试。」她当天便托人把你写的信递了进去，临走前又细细嘱咐了一句：「信里的话，姐姐可写得妥当？」",
        tierStory: {
          close: "陵容说她父亲在狱里有旧识，亲自替你把信递了进去。她回来时眼眶红红的，握着你的手说：「甄伯父让姐姐保重，说他在里头一切都好，只盼姐姐莫要为他失了分寸。」",
          distant: "陵容替你把信送了进去，回来时说一切都好：「甄伯父让姐姐别挂心。」她说得客气周全，你却看不出她心里是怎么想的。",
          resentful: "陵容把信递了进去，只淡淡说了句狱里已打点过，叫你放心，便福身告退了。她走得很快，你连道谢的话都没来得及说完。",
        },
      },
    ],
  },
  wanwanLeiqing: {
    id: "wanwanLeiqing",
    name: "菀菀类卿",
    emoji: "💔",
    flavor: "你挺着肚子去养心殿，想再为父亲求一次情。暖阁案上摊着皇上的旧手书：「菀菀类卿，暂排苦思，亦除却巫山非云也。」旁边压着一幅小像，画中女子的眉眼与你有七分相似。你扶着桌沿站了很久，腹中一阵一阵地疼起来。",
    note: "当夜早产，生下胧月。身子最少扣到 1。",
    defaultOptionId: "shihun",
    options: [
      { id: "shihun", name: "失魂而归", effects: [sz(-1)], shenziFloor: 1, text: "身子 -1（最少扣到 1）", story: "你不记得是怎么走出养心殿的，只记得宫道很长，风很冷。当夜腹痛如绞，天快亮时，你听见一声啼哭，有人说：「是位公主。」" },
      { id: "fuhui", name: "扶你回宫", card: "jinxiXiangzhu", effects: [], text: "身子不扣", story: "槿汐什么也没问，赶在旁人看见之前扶你出了养心殿，低声说：「小主，什么都等孩子平安了再说。」她守了你一夜，天亮时你生下了一个女儿。" },
      {
        id: "baochan",
        name: "连夜保产",
        card: "wenTaiyiZhenzhi",
        effects: [],
        removeNegatives: 1,
        text: "身子不扣；移除 1 个负面状态",
        story: "温实初连夜赶来，施针开方，额上的汗也顾不得擦。天亮时终于传出一声啼哭，母女平安。",
      },
      { id: "shouhou", name: "守在产房外", card: "meizhuangXiangzhu", effects: [sz(-1), q(1)], shenziFloor: 1, text: "身子 -1、清誉 +1", story: "眉庄连夜赶到碎玉轩，在产房外守了一夜，谁来都不让进。天亮时她抱着孩子进来，眼睛红红的：「是个公主，长得像你。」" },
    ],
  },
  mochou: {
    id: "mochou",
    name: "莫愁",
    emoji: "🪷",
    flavor: "甘露寺在凌云峰脚下，是宫里获罪或自请出宫的女眷落发修行的地方，清苦偏僻。住持静岸师太慈和，肯照拂你；可寺里管事的静白师太势利，见你没了位分，脸色先冷了三分。静岸师太为你取法号莫愁，问你俗家名字，你答「甄嬛」，不提皇上赐的那个“莞”字。",
        defaultOptionId: "daifa",
    options: [
      { id: "daifa", name: "带发修行", effects: [], text: "无效果（尘缘未断）", story: "你没有落发。师太看着你，说：「尘缘未断，也是缘法。」" },
      { id: "luofa", name: "落发", card: "chanyuXiushen", effects: [q(2)], flag: "luofa", status: "chenyuanYiduan", text: "清誉 +2；未来 2 回合每回合抓牌 +1", story: "青丝一缕一缕落在地上。你闭着眼，听见剪刀的声音，像是什么东西断了。" },
      { id: "buqunXiuxing", name: "布裙修行", card: "jingchaiBuqun", effects: [q(1)], drawCards: 1, text: "清誉 +1，抽 1 张牌", story: "你换了粗布衣裳，不落发，只把钗环尽数收进箱底。每日挑水扫地，与寺里的姑子们一同做早晚课。静岸师太见你肯吃苦，点头道：「心净，不在发上。」" },
      { id: "shangyaoZhaoliao", name: "敷药诊视", card: "wenTaiyiZhenzhi", effects: [], status: "fuyaoTiaoyang", text: "未来 2 回合每回合末身子 +1", story: "温实初上山来，一进院子就愣住了：你正挑着水从井边回来，手上全是冻疮。他慌忙放下药箱去接扁担，拉过你的手细看，声音都发颤：「你每天都要做这些？」你把手抽回去，笑着说不过是寺里的寻常活计，早惯了。他却不再听，低头一点一点替你上药。" },
    ],
  },
  shanmenOuyu: {
    id: "shanmenOuyu",
    name: "山门偶遇",
    emoji: "🎐",
    flavor: "果郡王来看望住在附近安栖观的舒太妃，在甘露寺山门外撞见了你。",
    note: "无论怎样结算，牌库加入 1 张【果郡王相助】。",
    defaultOptionId: "huibi",
    options: [
      { id: "huibi", name: "回避", effects: [q(1)], text: "清誉 +1", story: "你低着头从他身边走过去。他怔了一下，低声叫了一句「莫愁师父」。你没有回头。" },
      { id: "yichanXiangtan", name: "以禅相谈", card: "chanyuXiushen", relic: "yiwuHehua", effects: [], drawCards: 1, text: "抽 1 张牌", story: "你站在山门下，与他说了几句禅语。他说：「我在安栖观外种了一片合欢，等开了花，请你来看。」" },
      { id: "buqunXiangyu", name: "布裙相遇", card: "jingchaiBuqun", effects: [q(1)], text: "清誉 +1", story: "你荆钗布裙，正提着木桶从山门下经过，迎面撞见了他。他一时怔住，目光落在你冻红的手上，半晌才低声道：「在这里……可还好？」你福了一福，只答一句「多谢施主挂怀」，便提着桶继续往里走。" },
    ],
  },
  wentaiyiTanshi: {
    id: "wentaiyiTanshi",
    name: "故人来访",
    emoji: "🩺",
    flavor: "温实初上山来了，捎来胧月的一张小像，是敬妃托他带的。画上的孩子胖乎乎的，眉眼像你。",
    feichuFlavor:
      "温实初上山来了。他还没坐稳，你便抓住他的袖子问：「胧月呢？她被抱去了哪里？」他从怀里取出一张小像：「嬛妹妹别急，公主如今在咸福宫，敬妃娘娘亲自抚养，这画像就是她托我带来的。」画上的孩子胖乎乎的，眉眼像你。你这才知道她的下落，捧着画像，半晌说不出话来。",
    note: "有【敬妃之谊】时，另得下回合抓牌 +1。",
    defaultOptionId: "shouxia",
    options: [
      { id: "shouxia", name: "收下小像", effects: [sz(1)], drawCards: 1, text: "抽 1 张牌；身子 +1", story: "你把小像贴在心口看了许久，画上的孩子胖乎乎的，笑得没心没肺。温实初在一旁欲言又止，终是只留下一句：「嬛妹妹，你要好好的。」这一夜，你睡得比往日踏实些。" },
      { id: "zhenzhi", name: "请他诊治", card: "wenTaiyiZhenzhi", effects: [sz(2)], removeNegatives: "all", text: "移除全部负面状态；身子 +2", story: "温实初替你诊了脉，开了方子，又留下许多药材。临走时他说：「嬛妹妹，你要好好的。」" },
      { id: "yuandaoBuji", name: "眉庄捎来补给", card: "meizhuangXiangzhu", effects: [], status: "meizhuangDadian", text: "未来 3 回合每回合抓牌 +1", story: "眉庄在宫里放心不下，远远托温实初带了药材和补给上山，又托沈家在宫里宫外替你四处打点，日子渐渐宽裕了些。" },
      { id: "weiNver", name: "槿汐相伴", card: "jinxiXiangzhu", effects: [], status: "weiNverChengxia", text: "未来 2 回合每回合末清誉 +1", compact: "🪷+1×2", story: "你看着胧月的小像，看了很久。槿汐在一旁默默替你添了一盏灯。" },
    ],
  },
  taxueWenji: {
    id: "taxueWenji",
    name: "踏雪问疾",
    emoji: "🌨️",
    flavor:
      "凌云峰上落了三天的雪，屋顶压得吱呀作响，你的咳疾也愈发重了，夜里连灯都懒得点。这日晌午，门被人叩响，开门一看，果郡王披着一身雪站在门外，身后跟着牵马的阿晋。他低头看了看你苍白的脸，眉头皱得很紧：「山下的清凉台是我的别业，暖和，也清静。你不必谢我，今日必须跟我走。」风卷着雪花扑进屋里，你扶着门框，一时竟答不上话。",
    note: "下山养病、果郡王相助、槿汐相助这三种结算，牌库再加入 1 张【果郡王相助】。",
    defaultOptionId: "yangbing",
    options: [
      { id: "yangbing", name: "清凉台养病", effects: [sz(-2), q(-1)], shenziFloor: 1, text: "身子 -2（最少扣到 1）；清誉 -1", story: "你推说不必，终究没拗过他，被半扶半搀地带下了山。清凉台很暖，炭火烧得旺旺的，窗上糊着新纸，一点风也不漏，可你一路颠簸，又在风口里站了许久，当夜病势反倒重了，睡了醒、醒了睡，只记得汤药总是温的，帕子总是凉的，有人一直守在床边，你一睁眼，他便不动声色地把手收了回去。养了十来日，人却比上山时更瘦了一圈。临走那天，阿晋把你的旧包袱收拾得整整齐齐，你谢过他，仍旧回了凌云峰。可山下的闲话也跟着传开了，都说果郡王亲自把一个出家的人接进了别业，一住就是十来日。" },
      {
        id: "bingzhongXiangshou",
        name: "病中相守",
        card: "guojunwangXiangzhu",
        relic: "yiwuPifeng",
        effects: [],
        flag: "xiangshou",
        status: "bingzhongXinyou",
        text: "下回合抓牌数 -1",
        story:
          "他守了你几天几夜，药要亲自尝过才肯端来，帕子换了一盆又一盆，连阿晋劝他去歇歇，他也只摆摆手。你烧退的那个清晨，睁眼便看见他靠在床边睡着了，眼下一片青黑。可你好了，他自己却倒下了，咳得一声重过一声。你坐在他床边，替他掖好被角，第一次叫了他的名字：「允礼。」他睁开眼，怔了许久，才低低地「嗯」了一声，像是怕惊散了什么。回到凌云峰后，你夜里总惦着清凉台那头的咳声，翻来覆去，睡不安稳。",
      },
      {
        id: "jinxiZhaoliao",
        name: "槿汐照料",
        card: "jinxiXiangzhu",
        effects: [],
        status: "jinxiLeikua",
        text: "未来 2 回合不能打出槿汐相助",
        story:
          "槿汐听说有人要接你下山，一句话也没多问，先把你的旧棉袄、药罐和那卷抄了一半的经书收进包袱。到了清凉台，她不肯让旁人近身，煎药、喂汤、擦身，事事亲力亲为，夜里就在脚踏上和衣而卧，你一动她便醒。你烧得糊涂时拉着她的手喊冷，她只一遍遍说：「小主别怕，奴婢在呢，天亮了就好。」果郡王立在帘外，听着里头的动静，终究没有进来，只吩咐阿晋再添两盆炭。待你好些了，她却在榻边一头栽倒，烧得说不出话来，回山后也只能躺着，一连几日使唤不动。",
      },
      {
        id: "bimenXieke",
        name: "闭门谢客",
        card: "jingxinRennai",
        effects: [sz(-1)],
        shenziFloor: 1,
        text: "身子 -1（最少扣到 1）",
        story:
          "你隔着门谢了他的好意，只说山上清净，养几日便好。他在雪地里立了很久，终究没有再叩门，只让阿晋把药包和一篓银炭搁在了门槛外。你守着那点炭火，一碗一碗地熬药，咳声断断续续，捱了好些日子，才勉强缓过来一些。",
      },
    ],
  },
  hehunGengtie: {
    id: "hehunGengtie",
    name: "合婚庚帖",
    emoji: "📜",
    flavor: "果郡王趁着无人，从袖中取出一张红纸，轻声请你写下自己的庚帖。他说这一笔写下去，便是把你这个人托付给他，他不要你应他什么，只要你肯留下一个名字。你捏着笔，迟迟没有落下。",
    note: "须双牌：【果郡王相助】与【荆钗布裙】各打一张；只打一张，回合末按默认选项处理。",
    defaultOptionId: "buxie",
    options: [
      { id: "buxie", name: "不写", effects: [q(1)], text: "清誉 +1", story: "你把红纸推了回去。他没有说什么，只把它仔细折好，收进了袖子里。" },
      { id: "xiexia", name: "写下庚帖", card: "guojunwangXiangzhu", two: true, distinct: true, relic: "yiwuGengtie", effects: [], flag: "gengtie", text: "他收好了庚帖", story: "你换了一身素净的布衣，提笔写下自己的生辰。他在旁边写的是「嬛嬛」，一笔一画，写得极慢。写罢他把两张红纸并在一起，轻轻吹干了墨，低声说：「我不求名分，只求你的名字，在我这里有个着落。」你没有应声，只看着那两行字在灯下并排立着，像是两个本不该相遇的人。" },
      { id: "xiexiaBuqun", name: "写下庚帖", card: "jingchaiBuqun", two: true, distinct: true, relic: "yiwuGengtie", effects: [], flag: "gengtie", text: "他收好了庚帖", story: "你换了一身素净的布衣，提笔写下自己的生辰。他在旁边写的是「嬛嬛」，一笔一画，写得极慢。写罢他把两张红纸并在一起，轻轻吹干了墨，低声说：「我不求名分，只求你的名字，在我这里有个着落。」你没有应声，只看着那两行字在灯下并排立着，像是两个本不该相遇的人。" },
    ],
  },
  diannanZhixing: {
    id: "diannanZhixing",
    name: "滇南之行",
    emoji: "⛵",
    flavor: "果郡王奉旨出使滇南，明日一早便要启程，这一去，少说也得大半年。",
    defaultOptionId: "wuyan",
    options: [
      { id: "wuyan", name: "不去相送", effects: [], text: "无效果", story: "你没有去送他。那一夜，你坐在窗前，听着山风一阵紧似一阵，直到天边泛白。" },
      { id: "songxing", name: "送行", card: "guojunwangXiangzhu", relic: "yiwuDi", effects: [], flag: "songxing", status: "songxingBieyi", text: "未来 3 回合每回合抓牌 +1", story: "你送他到山下。他翻身下马，把那支随身多年的笛子塞进你手里：「等我回来。」" },
    ],
  },
  zhoufuEHao: {
    id: "zhoufuEHao",
    name: "舟覆噩耗",
    emoji: "🌊",
    flavor: "果郡王的船在江上翻了，尸骨无存。你握着那支他留下的东西，半晌说不出一个字。",
    defaultOptionId: "beitong",
    options: [
      { id: "beitong", name: "悲恸难抑", effects: [sz(-2)], shenziFloor: 1, text: "身子 -2（最少扣到 1）", story: "你一夜没有合眼，水米未进，第二天起身时，眼前一阵阵发黑。" },
      { id: "jinxiPeiban", name: "槿汐陪伴", card: "jinxiXiangzhu", effects: [], text: "身子不扣", story: "槿汐什么也没说，只一遍遍替你暖着手，陪你在窗前坐到天亮。" },
      { id: "fotianJingzuo", name: "佛前静坐", card: "chanyuXiushen", effects: [sz(-1)], shenziFloor: 1, text: "身子 -1", story: "你在佛前跪了一夜，念的是往生咒，眼泪却止不住。天亮时，心里空落落的，却也静了下来。" },
      { id: "meizhuangQuanwei", name: "眉庄劝慰", card: "meizhuangXiangzhu", effects: [sz(-1)], shenziFloor: 1, removeNegatives: 1, text: "身子 -1；移除 1 个负面状态", story: "眉庄托人捎来长信，只写了一句：「人去了，你还得好好活着，才不辜负他。」" },
    ],
  },
  yihuaOuyu: {
    id: "yihuaOuyu",
    name: "圣驾偶遇",
    emoji: "🌸",
    flavor: "皇上驾临甘露寺，正往佛堂这边来。你若不在佛前相见，这一回便又错过了。",
    note: "打出【禅语修身】或【荆钗布裙】才算偶遇成功；没成就隔一回合再来。",
    defaultOptionId: "cuoguo",
    options: [
      { id: "cuoguo", name: "错失圣驾", effects: [], text: "偶遇没成，隔一回合再来", story: "皇上在山门外立了片刻，终究没有见到你，由苏培盛扶着回了銮驾。" },
      { id: "foqianChongfeng", name: "佛前重逢", card: "chanyuXiushen", effects: [], flag: "ouyu", text: "偶遇成功", story: "你在佛前念着经，听见身后的脚步声停了下来。皇上望着你的背影，许久，轻轻唤了一声你的名字。" },
      { id: "bunqunChongfeng", name: "布裙重逢", card: "jingchaiBuqun", effects: [], flag: "ouyu", text: "偶遇成功", story: "你荆钗布裙，正蹲在廊下捡拾落叶，听见身后的脚步声停了下来。皇上望着你素净的侧影，许久，轻轻唤了一声你的名字。" },
    ],
  },
};

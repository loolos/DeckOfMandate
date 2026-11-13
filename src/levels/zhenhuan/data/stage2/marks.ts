// 第一关「旧事印记」：逆风解意 / 杏花微雨 里的选择，带进第二关的后续影响（design-stage2.md §3.1.1）
import { STORIES } from "../content";

export type YimeiMark = "yinrenBuyan" | "dangzhongShuopo" | "jiemeiChafang" | "gongrenToudi";
export type XinghuaMark = "bixianGaotui" | "yuWangyeChangtan" | "yishiXianghe" | "kanpoBushuopo";

export const YIMEI_MARKS: readonly YimeiMark[] = ["yinrenBuyan", "dangzhongShuopo", "jiemeiChafang", "gongrenToudi"];
export const XINGHUA_MARKS: readonly XinghuaMark[] = ["bixianGaotui", "yuWangyeChangtan", "yishiXianghe", "kanpoBushuopo"];

/** Which mark (if any) unlocks a story option. */
export type MarkRequirement = { readonly yimei?: YimeiMark; readonly xinghua?: XinghuaMark };

export type MarkCarry = { readonly yimei?: YimeiMark | null; readonly xinghua?: XinghuaMark | null };

export function parseYimei(raw: string | null | undefined): YimeiMark | null {
  return (YIMEI_MARKS as readonly string[]).includes(raw ?? "") ? (raw as YimeiMark) : null;
}
export function parseXinghua(raw: string | null | undefined): XinghuaMark | null {
  return (XINGHUA_MARKS as readonly string[]).includes(raw ?? "") ? (raw as XinghuaMark) : null;
}

/** 初谒翊坤：华妃恨意初值、清誉的调整。 */
export const CHUQINGAN_MARK_EFFECTS: {
  readonly yimei: Partial<Record<YimeiMark, { hate: number; qingyu: number }>>;
  readonly xinghua: Partial<Record<XinghuaMark, { hate: number; qingyu: number }>>;
} = {
  yimei: { yinrenBuyan: { hate: -1, qingyu: 0 }, dangzhongShuopo: { hate: 1, qingyu: 0 } },
  xinghua: { bixianGaotui: { hate: -1, qingyu: 0 }, yuWangyeChangtan: { hate: 1, qingyu: -1 } },
};

export const MARK_SHIELD_LOG = "旧事：杏花微雨里你进退有度，宫里都说你有分寸，这一回的非议被压下去一些：清誉少扣 1。";
export const MARK_SUMMON_LOG = "旧事：杏花树下以诗相和的缘分，皇上今夜格外垂青：圣宠额外 +1。";

type Preface = { readonly text: string; readonly note?: string };

/** 前置剧情：在对应的第二关事件上，交代第一关的选择留下了什么。 */
const PREFACE: Record<string, { yimei?: Partial<Record<YimeiMark, Preface>>; xinghua?: Partial<Record<XinghuaMark, Preface>> }> = {
  chuQingan: {
    yimei: {
      yinrenBuyan: {
        text: "倚梅园那句诗被余莺儿占了去，你始终一个字也没争。这事在宫里传了一阵，传到翊坤宫，华妃只当你是个任人拿捏的软性子，端着茶盏瞥你的眼神里，少了几分戒备。",
        note: "旧事：华妃恨意初值 -1。",
      },
      dangzhongShuopo: {
        text: "当初你当众说破倚梅园的诗是自己所念，却拿不出半点凭据，宫里私下都说你是眼红新宠。华妃把这话当笑料听了去，今日一见你，便似笑非笑地道：「听说妹妹也会作诗？」",
        note: "旧事：华妃恨意初值 +1。",
      },
    },
    xinghua: {
      bixianGaotui: {
        text: "杏花微雨里，你对那位「王爷」守礼避嫌，福了一福便告退，事后才知那是皇上。这份疏远传到翊坤宫，华妃只当你不是肯争宠的人，神色松了几分。",
        note: "旧事：华妃恨意初值 -1。",
      },
      yuWangyeChangtan: {
        text: "杏花微雨里，你与那位「王爷」谈诗论词，相谈甚欢，不知被谁瞧见，宫里渐渐有了「私会外男」的闲话。华妃今日正好拿来作文章：「妹妹好兴致，御花园里的杏花，可还入眼？」",
        note: "旧事：华妃恨意初值 +1，清誉 -1。",
      },
      yishiXianghe: {
        text: "杏花树下你与「王爷」以诗相和，后来才知那是皇上，圣眷也由此而来。华妃自然听说了，今日请安，她的目光在你身上停了许久，却没有急着发难。",
      },
      kanpoBushuopo: {
        text: "杏花微雨里你看破了「王爷」的身份，却始终守着本分，没有半句逾矩之言。宫里提起这事，都夸你进退有度；华妃想挑你的错，一时竟寻不出话头。",
      },
    },
  },
  yuyingerShishi: {
    yimei: {
      jiemeiChafang: {
        text: "眉庄姐姐当年悄悄记下的倚梅园当值宫人的破绽，如今还收在她妆匣底下。余莺儿被打入冷宫，眉庄递话来：若你想问她几句，那些旧账正好派得上用场。",
        note: "旧事：可打出【眉庄相助】前往冷宫对质。",
      },
      gongrenToudi: {
        text: "当初你赏过银子的那几个倚梅园小太监，如今有一个调去了冷宫当差。他托人带话：余莺儿那边，他可以引你去见一面，只是被人看见了，难免惹来闲话。",
        note: "旧事：多出一个不用出牌的选项「托旧识探视」。",
      },
      yinrenBuyan: {
        text: "倚梅园的事你始终没有声张。如今余莺儿获罪，宫里议论纷纷，却没有一个人把你牵扯进来；你也无意落井下石，只觉得往事如烟。",
      },
      dangzhongShuopo: {
        text: "当初你当众说破却无凭无据，如今余莺儿一出事，不少人想起这桩旧事，看你的眼神里添了几分探究：莫非那夜念诗的，真是你？",
      },
    },
  },
  zhaoxing: {
    xinghua: {
      yishiXianghe: {
        text: "你想起杏花微雨那日，皇上在树下认出你就是倚梅园念诗之人。今夜翻了你的牌子，敬事房的公公笑着凑趣：「皇上特意交代，要请的是杏花树下那位小主。」",
      },
      bixianGaotui: {
        text: "杏花微雨那日你福身告退，皇上在树下望了许久。今夜翻了你的牌子，敬事房的公公随口提了一句：「皇上近日倒不大提起碎玉轩了。」",
      },
    },
  },
};

export function storyPrefaceOf(storyId: string, marks: MarkCarry | null): { readonly lines: readonly string[]; readonly notes: readonly string[] } | null {
  const def = PREFACE[storyId];
  if (!def || !marks) return null;
  const hits = [marks.yimei ? def.yimei?.[marks.yimei] : undefined, marks.xinghua ? def.xinghua?.[marks.xinghua] : undefined].filter((p): p is Preface => !!p);
  if (hits.length === 0) return null;
  return { lines: hits.map((h) => h.text), notes: hits.flatMap((h) => (h.note ? [h.note] : [])) };
}

/** 第二关开场日志：把第一关的两桩旧事回顾一遍。 */
export function marksIntro(marks: MarkCarry | null): string | null {
  if (!marks || (!marks.yimei && !marks.xinghua)) return null;
  const recap = (id: "yimeiYuan" | "xinghuaWeiyu", option: string | null | undefined) =>
    option ? STORIES[id].options.find((o) => o.id === option)?.recap : undefined;
  const a = recap("yimeiYuan", marks.yimei);
  const b = recap("xinghuaWeiyu", marks.xinghua);
  const parts = [a && `倚梅园一事，你${a}`, b && `杏花微雨中，你${b}`].filter(Boolean);
  return parts.length ? `旧事未了：${parts.join("；")}。宫里人都还记着。` : null;
}

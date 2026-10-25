import { describe, expect, it } from "vitest";
import {
  CARDS3,
  CONFRONT,
  matchesInAct,
  EVENTS3,
  FABRICATED_SECRET,
  FIXED_STORIES3,
  LINGRONG_EVENT3,
  PAIRS,
  STAGE3,
  STAGE3_TEMPLE_DECK,
  STORIES3,
  XIUXING,
  confrontNeeded,
  confrontOutcome,
  type CardId3,
  type EventId3,
  type PairId,
  type StatusId3,
} from "../data/stage3Content";
import {
  canPlayCard3,
  confrontLines,
  feilaoBaseTier,
  feilaoCurrentTier,
  matchedEvents3,
  newStage3,
  pairLocked,
  presentedSecrets,
  reduce3,
  relicsKept,
  replay3,
  storyBasicOptions3,
  xiayuCost,
  playLimit3,
  type Carry3,
  type EventInst3,
  type Z3Action,
  type Z3State,
} from "./stage3Engine";

function act(s: Z3State, a: Z3Action): Z3State {
  const next = reduce3(s, a);
  expect(next, JSON.stringify(a)).not.toBe(s);
  return next;
}

function addCard(s: Z3State, id: CardId3): string {
  const uid = `t${s.nextUid++}`;
  s.hand.push({ uid, id });
  return uid;
}

function setHand(s: Z3State, ids: CardId3[]): string[] {
  s.discard.push(...s.hand);
  s.hand = [];
  return ids.map((id) => addCard(s, id));
}

function ev(s: Z3State, id: EventId3): EventInst3 {
  return { uid: `x${s.nextUid++}`, id, resolved: false };
}

function clearBoard(s: Z3State): void {
  s.opportunity = null;
  s.crisis = null;
  s.huanghou = null;
  s.stories = [];
}

function withStatus(s: Z3State, id: StatusId3, remaining = 2): void {
  s.statuses.push({ uid: `s${s.nextUid++}`, id, appliesFromTurn: s.turn, remaining });
}

function takeToHand(s: Z3State, uid: string): void {
  for (const pile of [s.drawPile, s.discard]) {
    const i = pile.findIndex((c) => c.uid === uid);
    if (i >= 0) s.hand.push(...pile.splice(i, 1));
  }
}

/** Ends turns with default choices until `turn` begins, keeping 清誉 / 圣宠 / 身子 topped up so nothing is lost on the way. */
function advanceTo(s: Z3State, turn: number): Z3State {
  while (s.turn < turn) {
    s.qingyu = Math.max(s.qingyu, 6);
    if (s.act === 1) s.shengchong = Math.max(s.shengchong, 6);
    s.shenzi = 6;
    if (s.yihua) s.yihua.doubt = 1;
    s = act(s, { type: "endTurn" });
    expect(s.outcome, s.lossReason ?? "").toBe("playing");
  }
  return s;
}

const CARRY: Carry3 = { qingyu: 12, shengchong: 11, shenzi: 3, rank: "pin", pregnant: true, relation: 0, secrets: ["shiqinNeiqing"], returned: "meizhuangXiangzhu" };

describe("zhenhuan stage 3 content", () => {
  it("every event has an answering card or a 陵容 table; every resolving card has a story", () => {
    for (const id of Object.keys(EVENTS3) as EventId3[]) {
      const def = EVENTS3[id];
      const cards = (Object.keys(CARDS3) as CardId3[]).filter((c) => CARDS3[c].matches.includes(id));
      expect(cards.length + (def.double?.length ?? 0) + (LINGRONG_EVENT3[id] ? 1 : 0), id).toBeGreaterThan(0);
      for (const c of cards) if (c !== "lingrongXiangzhu") expect(def.resolvedStory[c], `${id} / ${c}`).toBeTruthy();
      if (cards.includes("lingrongXiangzhu")) expect(LINGRONG_EVENT3[id], id).toBeTruthy();
    }
  });

  it("each 连环 shared card matches both halves", () => {
    for (const id of Object.keys(PAIRS) as PairId[]) {
      const p = PAIRS[id];
      expect(CARDS3[p.shared].matches, id).toContain(p.opportunity);
      expect(CARDS3[p.shared].matches, id).toContain(p.crisis);
    }
  });

  it("story defaults exist and are basic options", () => {
    for (const def of Object.values(STORIES3)) expect(def.options.some((o) => o.id === def.defaultOptionId && !o.card), def.id).toBe(true);
  });

  it("对质 table (design-stage3.md §2.7)", () => {
    expect([0, 1, 3, 4, 8, 9, 13, 14, 20].map(confrontNeeded)).toEqual([0, 2, 2, 3, 3, 4, 4, 4, 4]);
    expect(confrontOutcome(0, 0)).toBe(1);
    expect(confrontOutcome(5, 0)).toBe(1);
    expect(confrontOutcome(5, 1)).toBe(2);
    expect(confrontOutcome(5, 2)).toBe(3);
    expect(confrontOutcome(10, 0)).toBe(2);
    expect(confrontOutcome(16, 2)).toBe(4);
    expect(confrontOutcome(20, 1)).toBe(4);
  });
});

describe("zhenhuan stage 3 engine", () => {
  it("standalone start: 嫔, pregnant, 15/15, 身子 4, three carried 把柄, opening popup", () => {
    const s = newStage3(11, null);
    expect(s.turn).toBe(1);
    expect(s.rank).toBe("pin");
    expect(s.pregnant).toBe(true);
    expect(s.statuses.some((x) => x.id === "shenhuaiLongyi")).toBe(true);
    expect([s.qingyu, s.shengchong, s.shenzi]).toEqual([STAGE3.standaloneQingyu, STAGE3.standaloneShengchong, STAGE3.standaloneShenzi]);
    expect(Object.keys(s.secrets)).toHaveLength(STAGE3.standaloneSecrets);
    expect(s.popups).toContain("opening");
  });

  it("carry-over: rank, pregnancy, values and 把柄 come from 第二关", () => {
    const s = newStage3(3, CARRY);
    expect(s.pregnant).toBe(true);
    expect(s.qingyu).toBe(12);
    expect(s.secrets).toEqual({ shiqinNeiqing: 1 });
  });

  it("皇后事件 from turn 3; unanswered they are 收下: reward and a hidden 把柄", () => {
    let s = advanceTo(newStage3(5, CARRY), 3);
    expect(s.huanghou).not.toBeNull();
    const id = s.huanghou!.id;
    s = act(s, { type: "endTurn" });
    expect(s.secrets[`enshang.${id}` as keyof typeof s.secrets]).toBe(1);
  });

  it("皇后事件 played with a listed card: that card's own reward, no 把柄", () => {
    let s = advanceTo(newStage3(5, CARRY), 3);
    clearBoard(s);
    s.huanghou = ev(s, "jingrenHoushang");
    s.shenzi = 3;
    const sc = s.shengchong;
    const [jinxi, jinyan] = setHand(s, ["jinxiXiangzhu", "jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: jinxi! });
    expect(s.huanghou!.resolved).toBe(false);
    s = act(s, { type: "playCard", cardUid: jinyan! });
    expect(s.huanghou!.resolved).toBe(true);
    expect(s.shenzi).toBe(4);
    s = act(s, { type: "endTurn" });
    expect(s.shengchong).toBeLessThanOrEqual(sc);
    expect(s.secrets["enshang.jingrenHoushang" as keyof typeof s.secrets]).toBeUndefined();
  });

  it("皇后事件 with only one card: still 收下 with a hidden 把柄", () => {
    let s = advanceTo(newStage3(5, CARRY), 3);
    clearBoard(s);
    s.huanghou = ev(s, "jingrenHoushang");
    const [jinxi] = setHand(s, ["jinxiXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: jinxi! });
    s = act(s, { type: "endTurn" });
    expect(s.secrets["enshang.jingrenHoushang" as keyof typeof s.secrets]).toBe(1);
  });

  it("甄远道下狱: 托果郡王 needs one more card; alone it falls back to 跪求皇上", () => {
    const base = () => {
      const s = advanceTo(newStage3(5, CARRY), 8);
      clearBoard(s);
      s.stories = [{ id: "zhenYuandaoXiayu", chosenOptionId: null }];
      return s;
    };
    let s = base();
    const [g, j] = setHand(s, ["guojunwangXiangzhu", "jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: g! });
    expect(s.stories[0]!.chosenOptionId).toBeNull();
    s = act(s, { type: "playCard", cardUid: j! });
    expect(s.stories[0]!.chosenOptionId).toBe("tuoGuo");
    // 眉庄相助与此事无关，不算第二张
    let w = base();
    const [g3, t3, j3] = setHand(w, ["guojunwangXiangzhu", "meizhuangXiangzhu", "jinyanShenxing"]);
    w = act(w, { type: "playCard", cardUid: g3! });
    w = act(w, { type: "playCard", cardUid: t3! });
    expect(w.stories[0]!.chosenOptionId).toBeNull();
    w = act(w, { type: "playCard", cardUid: j3! });
    expect(w.stories[0]!.chosenOptionId).toBe("tuoGuo");
    let u = base();
    const [g2] = setHand(u, ["guojunwangXiangzhu"]);
    u = act(u, { type: "playCard", cardUid: g2! });
    u = act(u, { type: "endTurn" });
    expect(u.log.some((l) => l.text.includes("跪求皇上"))).toBe(true);
    expect(u.shengchong).toBeGreaterThan(base().shengchong - 2);
  });

  it("海棠春睡 (turn 3) makes a 未孕 player pregnant whatever is chosen", () => {
    let s = advanceTo(newStage3(8, { ...CARRY, pregnant: false }), 3);
    expect(s.stories.map((x) => x.id)).toContain(FIXED_STORIES3[3]);
    s = act(s, { type: "endTurn" });
    expect(s.pregnant).toBe(true);
  });

  it("皇后笑意 (turn 2): each answering card has its own reward, none leaves a 把柄", () => {
    let s = advanceTo(newStage3(7, CARRY), 2);
    expect(s.stories.map((x) => x.id)).toContain("huanghouXiaoyi");
    clearBoard(s);
    s.stories = [{ id: "huanghouXiaoyi", chosenOptionId: null }];
    s.shengchong = 10;
    const [uid] = setHand(s, ["yirongZhengsu"]);
    const secrets = { ...s.secrets };
    s = act(s, { type: "playCard", cardUid: uid! });
    expect(s.shengchong).toBe(13); // 戴上玉镯 +2, plus the card's own +1
    s = act(s, { type: "endTurn" });
    expect(s.secrets).toEqual(secrets);
    expect(s.popups).toContain("huanghou");

    let t = advanceTo(newStage3(7, CARRY), 2);
    clearBoard(t);
    t.stories = [{ id: "huanghouXiaoyi", chosenOptionId: null }];
    t.qingyu = 10;
    t.shengchong = 10;
    const [shou] = setHand(t, ["shoulongRenxin"]);
    t = act(t, { type: "playCard", cardUid: shou! });
    expect(t.stories[0]!.chosenOptionId).toBe("dashangLairen");
    expect([t.qingyu, t.shengchong]).toEqual([11, 11]);
  });

  it("凤鸾承恩 left alone: 称病避宠, 圣宠 -1", () => {
    let s = newStage3(3, { ...CARRY, pregnant: false });
    clearBoard(s);
    s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
    s.shengchong = 9;
    s = act(s, { type: "endTurn" });
    expect(s.log.some((l) => l.text.includes("称病避宠"))).toBe(true);
    expect(s.shengchong).toBeLessThanOrEqual(8);
  });

  it("纯元故衣: ① 起疑 then ② 查实 avoids it; only ① costs 圣宠 -2, nothing -5; 查实 first does not count", () => {
    const start = advanceTo(newStage3(17, CARRY), 6);
    expect(start.chunyuan).not.toBeNull();
    const run = (cards: CardId3[]): Z3State => {
      let s = structuredClone(start);
      clearBoard(s);
      s.shengchong = 12;
      s.extraPlays = 3;
      for (const uid of setHand(s, cards)) s = act(s, { type: "playCard", cardUid: uid });
      return act(s, { type: "endTurn" });
    };
    const seen = run(["jinxiXiangzhu", "shoulongRenxin"]);
    expect(seen.chunyuanResult).toBe("seen");
    expect(seen.popups).toContain("chunyuan");
    const half = run(["yirongZhengsu"]);
    expect(half.chunyuanResult).toBe("half");
    const reversed = run(["wenTaiyiZhenzhi", "jinxiXiangzhu"]);
    expect(reversed.chunyuanResult).toBe("half");
    const fail = run([]);
    expect(fail.chunyuanResult).toBe("fail");
    expect(fail.log.some((l) => l.text.includes("纯元故衣：圣宠 -5"))).toBe(true);
    expect(half.log.some((l) => l.text.includes("纯元故衣：圣宠 -2"))).toBe(true);
    const lingrong = run(["lingrongXiangzhu", "wenTaiyiZhenzhi"]);
    expect(lingrong.chunyuanResult).toBe("seen");
    expect(lingrong.secrets.guyiYuanyan).toBeGreaterThan(0);
  });

  it("连环: the opportunity half is locked until its crisis is cleared; the shared card does both and 打压", () => {
    const s = newStage3(2, CARRY);
    clearBoard(s);
    s.crisis = ev(s, "yuhuayuanQi");
    s.opportunity = ev(s, "yuhuayuanXin");
    expect(pairLocked(s, s.opportunity)).toBe(true);
    const [uid, uid2] = setHand(s, ["jinyanShenxing", "jinxiXiangzhu"]);
    expect(matchedEvents3(s, "jinyanShenxing").map((e) => e.id)).toContain("yuhuayuanQi");
    let t = act(s, { type: "playCard", cardUid: uid! });
    expect(t.crisis!.resolved).toBe(false);
    t = act(t, { type: "playCard", cardUid: uid2! });
    expect(t.crisis!.resolved && t.opportunity!.resolved).toBe(true);
    expect(t.suppressed.qifei).toBe(true);
    expect(t.allies.xin).toBe(true);
  });

  it("打压 leaves a status: the crisis stays in the pool and is auto-resolved the next time it is drawn", () => {
    let s = advanceTo(newStage3(3, CARRY), 3);
    clearBoard(s);
    s.crisis = ev(s, "qifeiXunxin");
    const [uid, uid2] = setHand(s, ["jinyanShenxing", "meizhuangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: uid! });
    expect(s.crisis!.resolved).toBe(false);
    s = act(s, { type: "playCard", cardUid: uid2! });
    expect(s.suppressed.qifei).toBe(true);
    expect(s.statuses.some((st) => st.id === "dayaQifei")).toBe(true);
    s.crisisPool = ["qifeiXunxin"];
    s.crisisUsed = [];
    s.opportunityPool = [];
    s.opportunityUsed = [];
    s = act(s, { type: "endTurn" });
    expect(s.crisis?.id).toBe("qifeiXunxin");
    expect(s.crisis!.resolved && s.crisis!.bySuppress).toBe(true);
    expect(s.statuses.some((st) => st.id === "dayaQifei")).toBe(false);
  });

  it("连环: two cards without the shared one clear the crisis only; the opportunity unlocks but stays open", () => {
    const s = newStage3(2, CARRY);
    clearBoard(s);
    s.crisis = ev(s, "xianfuQi");
    s.opportunity = ev(s, "xianfuJing");
    const [a, b] = setHand(s, ["jingguanQibian", "jinyanShenxing"]);
    let t = act(s, { type: "playCard", cardUid: a! });
    t = act(t, { type: "playCard", cardUid: b! });
    expect(t.crisis!.resolved).toBe(true);
    expect(t.opportunity!.resolved).toBe(false);
    expect(pairLocked(t, t.opportunity!)).toBe(false);
    expect(t.statuses.some((st) => st.id === "dayaGuaerjia")).toBe(false);
  });

  it("打压 is per rival: 齐妃寻衅 suppressed → 三阿哥邀宠 (also 齐妃) is auto-resolved next", () => {
    let s = advanceTo(newStage3(3, CARRY), 3);
    clearBoard(s);
    withStatus(s, "dayaQifei");
    s.crisisPool = ["sanAgeYaochong"];
    s.crisisUsed = [];
    s.opportunityPool = [];
    s.opportunityUsed = [];
    s = act(s, { type: "endTurn" });
    expect(s.crisis?.id).toBe("sanAgeYaochong");
    expect(s.crisis!.resolved && s.crisis!.bySuppress).toBe(true);
    expect(s.statuses.some((st) => st.id === "dayaQifei")).toBe(false);
  });

  it("连环 shared card: 打压 status for the pair crisis, and each half shows its own story", () => {
    const s = newStage3(2, CARRY);
    clearBoard(s);
    s.crisis = ev(s, "xianfuQi");
    s.opportunity = ev(s, "xianfuJing");
    const [uid, uid2] = setHand(s, ["meizhuangXiangzhu", "jinyanShenxing"]);
    let t = act(s, { type: "playCard", cardUid: uid! });
    t = act(t, { type: "playCard", cardUid: uid2! });
    expect(t.statuses.some((st) => st.id === "dayaGuaerjia")).toBe(true);
    expect(t.opportunity!.resolved).toBe(true);
    expect(EVENTS3.xianfuQi.resolvedStory.meizhuangXiangzhu).not.toBe(EVENTS3.xianfuJing.resolvedStory.meizhuangXiangzhu);
  });

  it("欣贵人解围 waives one rival crisis penalty; the crisis itself stays resolvable", () => {
    let s = advanceTo(newStage3(3, CARRY), 3);
    clearBoard(s);
    s.crisis = ev(s, "qifeiXunxin");
    withStatus(s, "xinGuirenZhangyi");
    setHand(s, ["jinyanShenxing"]);
    expect(matchedEvents3(s, "jinyanShenxing").map((e) => e.id)).toContain("qifeiXunxin");
    const before = s.secrets.chuyanDingzhuang ?? 0;
    s = act(s, { type: "endTurn" });
    expect(s.log.some((l) => l.text.includes("替你挡下了惩罚"))).toBe(true);
    expect(s.statuses.some((st) => st.id === "xinGuirenZhangyi" || st.id === "liuyanChanshen")).toBe(false);
    expect(s.secrets.chuyanDingzhuang ?? 0).toBe(before);
  });

  it("把柄 the player sees at 对质: 亲厚 -2, 怨怼 +1, 端妃相护 -1", () => {
    const s = newStage3(1, { ...CARRY, secrets: ["shiqinNeiqing", "zhuangshenNonggui", "sitanSiqiu", "jierenYaochong"] });
    s.relation = 0;
    expect(presentedSecrets(s)).toBe(4);
    s.relation = 2;
    expect(presentedSecrets(s)).toBe(2);
    s.relation = -2;
    expect(presentedSecrets(s)).toBe(5);
    withStatus(s, "duanfeiXianghu");
    expect(presentedSecrets(s)).toBe(4);
  });

  it("对质 evidence list: 亲厚 marks two of 陵容's as withheld, 怨怼 adds the made-up one", () => {
    const s = newStage3(1, { ...CARRY, secrets: ["shiqinNeiqing", "zhuangshenNonggui", "sitanSiqiu"] });
    s.secrets.chuyanDingzhuang = 1;
    s.relation = 2;
    const close = confrontLines(s);
    expect(close).toHaveLength(4);
    expect(close.filter((l) => l.withheld)).toHaveLength(2);
    expect(close.filter((l) => l.withheld).every((l) => l.lingrong)).toBe(true);
    s.relation = -2;
    const resentful = confrontLines(s);
    expect(resentful.some((l) => l.withheld)).toBe(false);
    expect(resentful.at(-1)!.line).toBe(FABRICATED_SECRET);
  });

  it("甄远道下狱 cost: 父兄蒙尘 heavier, 打压祺贵人 lighter", () => {
    const s = newStage3(1, CARRY);
    expect(xiayuCost(s, "kneel")).toEqual([{ resource: "shengchong", amount: -2 }]);
    expect(xiayuCost(s, "lingrong")).toEqual([]);
    withStatus(s, "fuxiongMengchen");
    expect(xiayuCost(s, "kneel")).toEqual([{ resource: "shengchong", amount: -3 }]);
    expect(xiayuCost(s, "guo")).toEqual([{ resource: "qingyu", amount: -1 }]);
    s.suppressed.guaerjia = true;
    expect(xiayuCost(s, "taihou")).toEqual([{ resource: "qingyu", amount: -2 }]);
  });

  it("景仁宫对质 (turn 10): no ordinary events, 陵容 cannot be played, outcome by cards played", () => {
    let s = advanceTo(newStage3(4, CARRY), 10);
    expect(s.opportunity ?? s.crisis ?? s.huanghou).toBeNull();
    expect(s.confront).not.toBeNull();
    expect(s.popups).toContain("confront");
    const need = s.confront!.needed;
    const ids = setHand(s, ["lingrongXiangzhu", ...CONFRONT.cards.slice(0, 3)]);
    s.extraPlays = 3;
    expect(canPlayCard3(s, ids[0]!)).toBe(false);
    for (const uid of ids.slice(1, 1 + need)) s = act(s, { type: "playCard", cardUid: uid });
    const presented = s.confront!.presented;
    s = act(s, { type: "endTurn" });
    expect(s.exitTier).toBe(confrontOutcome(presented, 0));
    expect(s.turn).toBe(11);
  });

  it("景仁宫对质: a card answers the specific charge it can, else falls back to vouching for loyalty", () => {
    let s = advanceTo(newStage3(4, { ...CARRY, secrets: ["zhuangshenNonggui"], relation: 0 }), 10);
    s.extraPlays = 3;
    s.secrets = { zhuangshenNonggui: 1 };
    const [jx, wt] = setHand(s, ["jinxiXiangzhu", "wenTaiyiZhenzhi"]);
    s = act(s, { type: "playCard", cardUid: jx! });
    expect(s.confront!.stories[0]).toContain("寸步未离");
    s = act(s, { type: "playCard", cardUid: wt! });
    expect(s.confront!.stories[1]).toContain("忠心");
  });

  it("手牌匹配事件只列当前这一幕会出现的", () => {
    const m = CARDS3.jinxiXiangzhu.matches;
    expect(matchesInAct(m, 1, 3)).toContain("gongzhongLiuyan");
    expect(matchesInAct(m, 1, 3)).not.toContain("foqianGongdeng");
    expect(matchesInAct(m, 2, 12)).toContain("foqianGongdeng");
    expect(matchesInAct(m, 2, 12)).not.toContain("gongzhongLiuyan");
    expect(matchesInAct(m, 2, 12)).not.toContain("xianrenKuitan");
    expect(matchesInAct(m, 2, 20)).toContain("xianrenKuitan");
  });

  it("故人来访 (turn 15): no temporary 温太医 card; 眉庄相助 brings 远道补给 (身子 +1 for 3 turns)", () => {
    let s = advanceTo(newStage3(6, CARRY), 15);
    expect(s.stories.map((x) => x.id)).toContain("wentaiyiTanshi");
    expect(s.hand.some((c) => c.id === "wenTaiyiZhenzhi" && c.uid.startsWith("w"))).toBe(false);
    s.extraPlays = 3;
    const [mz] = setHand(s, ["meizhuangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: mz! });
    expect(s.statuses.some((x) => x.id === "yuandaoBuji")).toBe(true);
  });

  it("故人来访 (turn 15): 槿汐相助「为女儿撑下去」gives 清誉 +1 for 2 turns, only one of the two bonuses", () => {
    let s = advanceTo(newStage3(6, CARRY), 15);
    s.extraPlays = 3;
    const [jx, mz] = setHand(s, ["jinxiXiangzhu", "meizhuangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: jx! });
    s = act(s, { type: "playCard", cardUid: mz! });
    expect(s.statuses.some((x) => x.id === "weiNverChengxia")).toBe(true);
    expect(s.statuses.some((x) => x.id === "yuandaoBuji")).toBe(false);
  });

  it("第二幕危机需两张解牌: 杂役磋磨 -2 none / -1 one card / cleared with two; 断炭缺粮 half = 寒疾缠身 1 turn", () => {
    const run = (id: "fazuoCuhuo" | "tanhuoLiangmi", ids: CardId3[]) => {
      let s = advanceTo(newStage3(6, CARRY), 12);
      clearBoard(s);
      s.shenzi = 4;
      s.crisis = ev(s, id);
      s.extraPlays = 5;
      for (const uid of setHand(s, ids)) s = act(s, { type: "playCard", cardUid: uid });
      s = act(s, { type: "endTurn" });
      return s;
    };
    const fBoth = run("fazuoCuhuo", ["jinxiXiangzhu", "jingxinRennai"]).shenzi;
    expect([run("fazuoCuhuo", []).shenzi, run("fazuoCuhuo", ["jinxiXiangzhu"]).shenzi]).toEqual([fBoth - 2, fBoth - 1]);
    const t1 = run("tanhuoLiangmi", ["jinxiXiangzhu"]).statuses.find((x) => x.id === "hanzheng" && x.appliesFromTurn === 13)?.remaining;
    const t0 = run("tanhuoLiangmi", []).statuses.find((x) => x.id === "hanzheng" && x.appliesFromTurn === 13)?.remaining;
    expect([t0, t1]).toEqual([2, 1]);
  });

  it("果郡王相助: draws 1, +1 play this turn, 王爷挂念 gives +1 draw next turn", () => {
    let s = advanceTo(newStage3(6, CARRY), 12);
    clearBoard(s);
    const [g] = setHand(s, ["guojunwangXiangzhu"]);
    const before = playLimit3(s);
    s = act(s, { type: "playCard", cardUid: g! });
    expect(playLimit3(s)).toBe(before + 1);
    expect(s.statuses.some((x) => x.id === "wangyeGuaNian")).toBe(true);
  });

  it("entering the temple: 修行 identity, temple deck plus the 果郡王 cards, 清誉 capped at 8", () => {
    let s = advanceTo(newStage3(6, CARRY), 10);
    s.qingyu = 15;
    s.extraPlays = 5;
    for (const uid of s.hand.filter((c) => CONFRONT.cards.includes(c.id) && c.id !== "lingrongXiangzhu").map((c) => c.uid)) s = act(s, { type: "playCard", cardUid: uid });
    s.drawPile.push({ uid: "g1", id: "guojunwangXiangzhu" });
    const guo = [...s.hand, ...s.drawPile, ...s.discard].filter((c) => c.id === "guojunwangXiangzhu").length;
    s = act(s, { type: "endTurn" });
    expect(s.act).toBe(2);
    expect(s.qingyu).toBeLessThanOrEqual(XIUXING.cap);
    const all = [...s.hand, ...s.drawPile, ...s.discard].map((c) => c.id);
    expect(all.filter((id) => id === "guojunwangXiangzhu")).toHaveLength(guo);
    expect(all.filter((id) => id !== "guojunwangXiangzhu").sort()).toEqual(
      (s.exitTier === 3 ? STAGE3_TEMPLE_DECK.filter((id, i, a) => !(id === "jinxiXiangzhu" && a.indexOf(id) === i)) : [...STAGE3_TEMPLE_DECK]).sort(),
    );
    expect(s.hand).toHaveLength(XIUXING.draw);
    expect(s.lingrongGone).toBe(true);
  });

  it("圣宠 is frozen at the temple", () => {
    const s = newStage3(1, CARRY);
    s.act = 2;
    s.turn = 12;
    clearBoard(s);
    s.opportunity = ev(s, "huanghouShangshi");
    const [uid] = setHand(s, ["yirongZhengsu"]);
    const before = s.shengchong;
    const t = act(s, { type: "playCard", cardUid: uid! });
    expect(t.shengchong).toBe(before);
  });

  it("肺痨之诬: 静白嚣张 sets the tier; each 槿汐 / 禅语 / 眉庄 lightens it", () => {
    expect([0, 1, 2, 3, 4, 7].map(feilaoBaseTier)).toEqual([0, 0, 1, 1, 2, 2]);
    let s = advanceTo(newStage3(9, CARRY), 18);
    s.feilao = { base: 2, played: [] };
    s.shenzi = 6;
    const ids = setHand(s, ["jinxiXiangzhu", "chanyuXiushen"]);
    s.extraPlays = 2;
    s = act(s, { type: "playCard", cardUid: ids[0]! });
    expect(feilaoCurrentTier(s)).toBe(1);
    s = act(s, { type: "endTurn" });
    expect(s.feilaoTier).toBe(1);
    expect(s.atPeak).toBe(true);
    expect(s.statuses.some((x) => x.id === "hanzheng")).toBe(true);
  });

  it("舟覆噩耗 turns the 果郡王 cards into relics; 移花接木 starts on turn 26 with 疑点 1", () => {
    let s = advanceTo(newStage3(12, CARRY), 24);
    s.gengtie = true;
    s.songxing = false;
    for (const pile of [s.hand, s.drawPile, s.discard]) for (let i = pile.length - 1; i >= 0; i--) if (pile[i]!.id === "guojunwangXiangzhu") pile.splice(i, 1);
    s.drawPile.push({ uid: "g1", id: "guojunwangXiangzhu" }, { uid: "g2", id: "guojunwangXiangzhu" });
    s = advanceTo(s, 25);
    const relics = [...s.hand, ...s.drawPile, ...s.discard].map((c) => c.id).filter((id) => id.startsWith("yiwu"));
    expect(relics.sort()).toEqual(["yiwuGengtie", "yiwuPifeng"]);
    expect([...s.hand, ...s.drawPile, ...s.discard].some((c) => c.id === "guojunwangXiangzhu")).toBe(false);
    s = act(s, { type: "endTurn" });
    expect(s.act).toBe(3);
    expect(s.pregnant).toBe(true);
    expect(s.yihua!.doubt).toBe(1);
  });

  it("圣驾偶遇 is its own 剧情事件 on the due turn; only 禅语修身 completes step ②", () => {
    let s = advanceTo(newStage3(21, CARRY), 26);
    s.yihua!.step = 2;
    s.yihua!.ouyuDue = 27;
    s = advanceTo(s, 27);
    expect(s.stories.some((st) => st.id === "yihuaOuyu")).toBe(true);
    expect(s.yihua!.step).toBe(2);
    s = act(s, { type: "endTurn" });
    expect(s.yihua!.step).toBe(2);
    expect(s.yihua!.ouyuDue).toBe(29);
  });

  it("皇后事件 every turn 3–9, never the same one two turns running", () => {
    for (const seed of [1, 2, 3, 7, 42, 99]) {
      let s = newStage3(seed, CARRY);
      const seen: string[] = [];
      while (s.turn < 10) {
        if (s.turn >= 3) seen.push(s.huanghou!.id);
        s = advanceTo(s, s.turn + 1);
      }
      expect(seen).toHaveLength(7);
      seen.forEach((id, i) => expect(id, `seed ${seed}`).not.toBe(seen[i - 1]));
    }
  });

  it("移花接木: 槿汐引驾 → 两回合后偶遇 (圣宠 restored) → 温太医改脉; perfect needs all relics burned", () => {
    let s = advanceTo(newStage3(13, CARRY), 26);
    s.exitShengchong = 9;
    s.shenzi = 6;
    const next = () => {
      clearBoard(s);
      s = act(s, { type: "endTurn" });
      clearBoard(s);
      s.extraPlays = 9;
    };
    clearBoard(s);
    s.extraPlays = 9;
    s.discard.push(...s.drawPile);
    s.drawPile = [];
    const relicUids = ["yiwuGengtie", "yiwuDi", "yiwuPifeng"].map((id) => {
      s.discard.push({ uid: `r-${id}`, id: id as CardId3 });
      return `r-${id}`;
    });
    const [jinxi, chanyuEarly] = setHand(s, ["jinxiXiangzhu", "chanyuXiushen"]);
    s.discard = s.discard.filter((c) => !c.id.startsWith("yiwu") || relicUids.includes(c.uid));
    s = act(s, { type: "playCard", cardUid: jinxi! });
    expect(s.yihua!.step).toBe(2);
    expect(s.yihua!.duishi).toBe(true);
    expect(s.yihua!.ouyuDue).toBe(28);
    expect(s.yihua!.doubt).toBe(0);
    s = act(s, { type: "playCard", cardUid: chanyuEarly! });
    expect(s.yihua!.step).toBe(2);
    next();
    expect(s.yihua!.doubt).toBe(1);
    next();
    expect(s.turn).toBe(28);
    expect(s.yihua!.doubt).toBe(2);
    for (const uid of relicUids) {
      takeToHand(s, uid);
      const before = { q: s.qingyu, hand: s.hand.length };
      s = act(s, { type: "playCard", cardUid: uid });
      expect(s.qingyu).toBe(before.q);
      expect(s.hand.length).toBe(before.hand - 1);
    }
    expect(relicsKept(s)).toBe(0);
    expect(s.stories.some((st) => st.id === "yihuaOuyu")).toBe(false);
    s.stories.push({ id: "yihuaOuyu", chosenOptionId: null });
    const [chanyu, wen] = setHand(s, ["chanyuXiushen", "wenTaiyiZhenzhi"]);
    s = act(s, { type: "playCard", cardUid: chanyu! });
    expect(s.yihua!.step).toBe(3);
    expect(s.shengchong).toBe(9);
    s = act(s, { type: "playCard", cardUid: wen! });
    expect(s.yihua!.step).toBe(4);
    clearBoard(s);
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("won");
    expect(s.victory).toBe("perfect");
  });

  it("移花接木: a missed 偶遇 comes back two turns later; 眉庄 lowers 疑点", () => {
    let s = advanceTo(newStage3(13, CARRY), 26);
    clearBoard(s);
    s.yihua!.step = 2;
    s.yihua!.ouyuDue = 26;
    s.yihua!.doubt = 3;
    const [meizhuang] = setHand(s, ["meizhuangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: meizhuang! });
    expect(s.yihua!.doubt).toBe(2);
    clearBoard(s);
    s = act(s, { type: "endTurn" });
    expect(s.yihua!.ouyuDue).toBe(28);
    expect(s.yihua!.doubt).toBe(3);
  });

  it("疑点 rises each turn before 偶遇; at 5 the run is lost", () => {
    let s = advanceTo(newStage3(14, CARRY), 26);
    s.yihua!.doubt = 4;
    clearBoard(s);
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("lost");
    expect(s.lossKind).toBe("doubt");
  });

  it("落发: 引驾 needs 槿汐 plus one more 槿汐 or 眉庄", () => {
    const s = advanceTo(newStage3(13, CARRY), 26);
    clearBoard(s);
    s.extraPlays = 5;
    s.yihua!.yinjiaNeed = 2;
    const [mei, mei2, jinxi] = setHand(s, ["meizhuangXiangzhu", "meizhuangXiangzhu", "jinxiXiangzhu"]);
    let t = act(s, { type: "playCard", cardUid: mei! });
    expect(t.yihua!.step).toBe(1);
    expect(t.yihua!.yinjia).toEqual(["meizhuangXiangzhu"]);
    t = act(t, { type: "playCard", cardUid: mei2! });
    expect(t.yihua!.yinjia).toEqual(["meizhuangXiangzhu"]);
    t = act(t, { type: "playCard", cardUid: jinxi! });
    expect(t.yihua!.step).toBe(2);
  });

  it("睹物生疑: every relic still in hand at the end of the 偶遇 turn adds 1 疑点", () => {
    let s = advanceTo(newStage3(15, CARRY), 26);
    s.extraPlays = 5;
    clearBoard(s);
    const [gengtie, , , chanyu] = setHand(s, ["yiwuGengtie", "yiwuDi", "yiwuPifeng", "chanyuXiushen"]);
    s.yihua!.step = 2;
    s.yihua!.ouyuDue = 26;
    s.yihua!.doubt = 1;
    s.stories.push({ id: "yihuaOuyu", chosenOptionId: null });
    s = act(s, { type: "playCard", cardUid: chanyu! });
    expect(s.yihua!.doubt).toBe(1);
    s = act(s, { type: "playCard", cardUid: gengtie! });
    expect(s.yihua!.ouyuTurn).toBe(s.turn);
    s = act(s, { type: "endTurn" });
    expect(s.yihua!.dushu).toBe(true);
    expect(s.yihua!.doubt).toBe(3);
  });

  it("story options can be chosen by id", () => {
    let s = advanceTo(newStage3(16, CARRY), 8);
    const inst = s.stories.find((x) => x.id === "zhenYuandaoXiayu")!;
    const option = storyBasicOptions3(STORIES3[inst.id]).find((o) => o.id === "qiuTaihou")!;
    s = act(s, { type: "chooseStory", storyId: inst.id, optionId: option.id });
    expect(s.stories.find((x) => x.id === "zhenYuandaoXiayu")!.chosenOptionId).toBe("qiuTaihou");
  });

  it("random play-throughs replay to the same state", () => {
    for (let seed = 1; seed <= 15; seed++) {
      let s = newStage3(seed, seed % 2 ? CARRY : null);
      for (let i = 0; i < 400 && s.outcome === "playing"; i++) {
        if (s.pending) {
          s = reduce3(s, { type: "cancelPending" });
          continue;
        }
        const c = s.hand.find((x) => canPlayCard3(s, x.uid));
        s = reduce3(s, c && i % 4 ? { type: "playCard", cardUid: c.uid } : { type: "endTurn" });
      }
      const r = replay3(s.seed, s.carry, s.actions);
      expect(JSON.stringify(r)).toBe(JSON.stringify(s));
    }
  });
});

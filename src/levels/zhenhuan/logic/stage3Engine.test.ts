import { describe, expect, it } from "vitest";
import { musicMood } from "../ui/music";
import {
  CARDS3,
  CONFRONT,
  EXIT,
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
  dengmenNeeded,
  yihuaAccepts,
  drawCount3,
  drawModifier3,
  hasStatus3,
  confrontLines,
  feilaoBaseTier,
  feilaoCurrentTier,
  matchedEvents3,
  newStage3,
  pairLocked,
  presentedSecrets,
  reduce3,
  relicsKept,
  endingStory3,
  replay3,
  storyBasicOptions3,
  xiayuCost,
  xiayuS,
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
    s.qingyu = Math.max(s.qingyu, 12);
    if (s.act === 1) s.shengchong = Math.max(s.shengchong, 12);
    s.shenzi = 6;
    if (s.yihua) s.yihua.doubt = 1;
    // 海棠春睡的默认结算会留下抓牌 -1，改变后续牌序；快进时跳过
    if (s.pregnant) s.stories = s.stories.filter((x) => x.id !== "haitangChunshui" && x.id !== "haitangYeyu");
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
    expect([0, 1, 3, 4, 6, 7, 11, 12, 20].map(confrontNeeded)).toEqual([0, 2, 2, 3, 3, 4, 4, 4, 4]);
    expect(confrontOutcome(0, 0)).toBe(1);
    expect(confrontOutcome(5, 0)).toBe(1);
    expect(confrontOutcome(5, 1)).toBe(2);
    expect(confrontOutcome(5, 2)).toBe(3);
    expect(confrontOutcome(7, 0)).toBe(2);
    expect(confrontOutcome(11, 2)).toBe(3);
    expect(confrontOutcome(12, 1)).toBe(3);
    expect(confrontOutcome(16, 2)).toBe(4);
    expect(confrontOutcome(17, 0)).toBe(4);
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

  it("甄远道下狱: 每张解牌局势 -1，归零完美解决；未了结按默认跪求皇上扣 2s", () => {
    const base = () => {
      const s = advanceTo(newStage3(5, CARRY), 8);
      clearBoard(s);
      s.stories = [{ id: "zhenYuandaoXiayu", chosenOptionId: null }];
      return s;
    };
    let s = base();
    const [g, j, k] = setHand(s, ["guojunwangXiangzhu", "shoulongRenxin", "jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: g! });
    s = act(s, { type: "playCard", cardUid: j! });
    expect(s.stories[0]!.chosenOptionId).toBeNull();
    expect(s.stories[0]!.steps).toHaveLength(2);
    s = act(s, { type: "playCard", cardUid: k! });
    expect(s.stories[0]!.chosenOptionId).toBe("yinrenBuyan");
    expect(s.stories[0]!.result).toContain("完美解决");
    // 眉庄相助与此事无关，不算解牌
    let w = base();
    const [t3] = setHand(w, ["meizhuangXiangzhu"]);
    w = act(w, { type: "playCard", cardUid: t3! });
    expect(w.stories[0]!.solved).toBeUndefined();
    // 一张都没打：默认跪求皇上，s=3 → 圣宠 -6、清誉 -4
    expect(xiayuCost(base(), "kneel", 0)).toEqual([
      { resource: "shengchong", amount: -6 },
      { resource: "qingyu", amount: -4 },
    ]);
    let u = base();
    const [g2] = setHand(u, ["guojunwangXiangzhu"]);
    u = act(u, { type: "playCard", cardUid: g2! });
    u = act(u, { type: "endTurn" });
    expect(u.log.some((l) => l.text.includes("跪求皇上"))).toBe(true);
  });

  it("海棠春睡 (turn 3) makes a 未孕 player pregnant whatever is chosen", () => {
    let s = advanceTo(newStage3(8, { ...CARRY, pregnant: false }), 3);
    expect(s.stories.map((x) => x.id)).toContain(FIXED_STORIES3[3]);
    s = act(s, { type: "endTurn" });
    expect(s.pregnant).toBe(true);
  });

  it("海棠春睡 quietly lowers 陵容情分 by 2 without a log line", () => {
    let s = advanceTo(newStage3(8, CARRY), 3);
    clearBoard(s);
    s.stories = [{ id: "haitangYeyu", chosenOptionId: null }];
    s.hand = [];
    const before = s.relation;
    const logged = s.log.length;
    s = act(s, { type: "endTurn" });
    expect(s.relation).toBe(Math.max(-4, before - 2));
    expect(s.log.slice(logged).some((l) => l.text.includes("陵容待你亲近") || l.text.includes("陵容与你生分"))).toBe(false);
    expect(s.log.slice(logged).some((l) => l.text.includes("海棠树下的石凳"))).toBe(true);
  });

  it("海棠春睡: 默认全扣，三张牌各免一项", () => {
    const run = (id?: CardId3) => {
      let s = advanceTo(newStage3(8, CARRY), 3);
      clearBoard(s);
      s.stories = [{ id: "haitangYeyu", chosenOptionId: null }];
      s.qingyu = 10;
      s.shengchong = 5;
      s.shenzi = 6;
      if (id) {
        const [uid] = setHand(s, [id]);
        s = act(s, { type: "playCard", cardUid: uid! });
      }
      s = act(s, { type: "endTurn" });
      return s;
    };
    const base = run();
    expect([base.qingyu, base.shenzi]).toEqual([7, 4]);
    expect(base.shengchong).toBe(7);
    expect(hasStatus3(base, "liuyanChanshen")).toBe(true);
    const zhuang = run("yirongZhengsu");
    expect(zhuang.qingyu).toBe(10);
    expect(zhuang.shenzi).toBe(4);
    expect(hasStatus3(zhuang, "liuyanChanshen")).toBe(true);
    const xi = run("jinxiXiangzhu");
    expect(xi.shenzi).toBe(6);
    expect(hasStatus3(xi, "liuyanChanshen")).toBe(true);
    const shi = run("jinyanShenxing");
    expect(hasStatus3(shi, "liuyanChanshen")).toBe(false);
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

  it("佛前供灯: resolving it raises next turn's play limit by 1", () => {
    let s = advanceTo(newStage3(2, CARRY), 12);
    clearBoard(s);
    s.opportunity = ev(s, "foqianGongdeng");
    const [uid] = setHand(s, ["chanyuXiushen"]);
    const control = advanceTo(structuredClone(s), 13);
    s = act(s, { type: "playCard", cardUid: uid! });
    expect(s.opportunity!.resolved).toBe(true);
    s = advanceTo(s, 13);
    expect(playLimit3(s)).toBe(playLimit3(control) + 1);
  });

  it("打压 leaves a status: the crisis stays in the pool and needs one fewer 解牌 the next time it is drawn", () => {
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
    expect(s.crisis!.eased).toBe(true);
    expect(s.crisis!.resolved).toBe(false);
    expect(s.statuses.some((st) => st.id === "dayaQifei")).toBe(false);
    const [one] = setHand(s, ["jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: one! });
    expect(s.crisis!.resolved).toBe(true);
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

  it("打压 is per rival: 齐妃寻衅 suppressed → 三阿哥邀宠 (also 齐妃) is eased next", () => {
    let s = advanceTo(newStage3(3, CARRY), 3);
    clearBoard(s);
    withStatus(s, "dayaQifei");
    s.crisisPool = ["sanAgeYaochong"];
    s.crisisUsed = [];
    s.opportunityPool = [];
    s.opportunityUsed = [];
    s = act(s, { type: "endTurn" });
    expect(s.crisis?.id).toBe("sanAgeYaochong");
    expect(s.crisis!.eased).toBe(true);
    expect(s.statuses.some((st) => st.id === "dayaQifei")).toBe(false);
  });

  it("栗糕清苦: 齐妃 once suppressed + eased 三阿哥邀宠 + pregnant → 陵容 alone resolves it, 打压·齐妃 stays, 三阿哥邀宠 leaves the pools", () => {
    let s = advanceTo(newStage3(3, CARRY), 3);
    clearBoard(s);
    s.suppressed.qifei = true;
    s.crisis = { ...ev(s, "sanAgeYaochong"), eased: true };
    s.relation = -3;
    s.crisisPool = ["sanAgeYaochong", "qifeiXunxin"];
    s.crisisUsed = ["sanAgeYaochong"];
    expect(matchedEvents3(s, "lingrongXiangzhu").map((e) => e.id)).toContain("sanAgeYaochong");
    const [uid] = setHand(s, ["lingrongXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: uid! });
    expect(s.crisis!.resolved).toBe(true);
    expect(s.lizigao).toBe(true);
    expect(s.popups).toContain("lizigao");
    expect(hasStatus3(s, "dayaQifeiLizi")).toBe(true);
    expect(s.crisisPool).not.toContain("sanAgeYaochong");
    expect(s.crisisUsed).not.toContain("sanAgeYaochong");
    s.opportunityPool = [];
    s.opportunityUsed = [];
    s.crisisPool = ["qifeiXunxin"];
    s = act(s, { type: "endTurn" });
    expect(s.crisisUsed).not.toContain("sanAgeYaochong");
    expect(s.crisis?.id).toBe("qifeiXunxin");
    expect(s.crisis!.eased).toBe(true);
    expect(hasStatus3(s, "dayaQifeiLizi")).toBe(true);
  });

  it("栗糕清苦 needs 陵容 among the 解牌, 打压, and a child on the way", () => {
    const base = advanceTo(newStage3(3, CARRY), 3);
    clearBoard(base);
    base.suppressed.qifei = true;
    // 不是陵容解的：不触发
    let s = structuredClone(base);
    s.crisis = { ...ev(s, "sanAgeYaochong"), eased: true };
    let [uid] = setHand(s, ["yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: uid! });
    expect(s.crisis!.resolved).toBe(true);
    expect(s.lizigao).toBe(false);
    // 从没打压过齐妃：陵容接不了
    s = structuredClone(base);
    s.suppressed.qifei = false;
    s.crisis = { ...ev(s, "sanAgeYaochong"), eased: true };
    expect(matchedEvents3(s, "lingrongXiangzhu")).toHaveLength(0);
    // 未孕：陵容接不了
    s = structuredClone(base);
    s.pregnant = false;
    s.crisis = { ...ev(s, "sanAgeYaochong"), eased: true };
    expect(matchedEvents3(s, "lingrongXiangzhu")).toHaveLength(0);
    // 菀菀类卿那一回合起不再触发（孩子要落地了）
    s = advanceTo(newStage3(3, CARRY), 9);
    clearBoard(s);
    s.suppressed.qifei = true;
    s.crisis = { ...ev(s, "sanAgeYaochong"), eased: true };
    expect(s.pregnant).toBe(true);
    expect(matchedEvents3(s, "lingrongXiangzhu")).toHaveLength(0);
    // 打压早已用掉、这回要两张：陵容先出、仪容整肃补上，同样触发
    s = structuredClone(base);
    s.crisis = ev(s, "sanAgeYaochong");
    const [a, b] = setHand(s, ["lingrongXiangzhu", "yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: a! });
    expect(s.crisis!.resolved).toBe(false);
    s = act(s, { type: "playCard", cardUid: b! });
    expect(s.crisis!.resolved).toBe(true);
    expect(s.lizigao).toBe(true);
  });

  it("栗糕清苦 afterwards: 齐妃寻衅's 谨言慎行 story speaks of 景仁宫 tutoring", () => {
    let s = advanceTo(newStage3(3, CARRY), 3);
    clearBoard(s);
    s.lizigao = true;
    s.crisis = { ...ev(s, "qifeiXunxin"), eased: true };
    const [uid] = setHand(s, ["jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: uid! });
    expect(s.crisis!.story).toContain("景仁宫");
  });

  it("栗糕清苦 at 对质: one fewer 把柄, and 齐妃 falls silent on one of hers", () => {
    const s = newStage3(1, { ...CARRY, secrets: ["shiqinNeiqing", "sitanSiqiu"] });
    s.relation = 0;
    expect(presentedSecrets(s)).toBe(2);
    s.lizigao = true;
    expect(presentedSecrets(s)).toBe(1);
    const lines = confrontLines(s);
    const silent = lines.filter((l) => l.qifei);
    expect(silent).toHaveLength(1);
    expect(silent[0]!.id).toBe("sitanSiqiu");
    expect(silent[0]!.line.startsWith("齐妃")).toBe(true);
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
    expect(t.crisis!.resolvedBy).toBe("meizhuangXiangzhu");
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

  it("对质 evidence: every other line is spoken by a 宫人 (the 六条 case always has some)", () => {
    const s = newStage3(1, { ...CARRY, secrets: ["shiqinNeiqing", "zhuangshenNonggui", "sitanSiqiu", "jierenYaochong", "kuitanGongwei", "qiuziXinqie"] });
    s.relation = 0;
    const lines = confrontLines(s).map((l) => l.line);
    expect(lines.filter((l) => /小太监|小宫女|嬷嬷/.test(l)).length).toBeGreaterThanOrEqual(3);
  });

  it("端妃相护: the covered accusation is still raised, with 端妃 speaking for her", () => {
    const s = newStage3(1, { ...CARRY, secrets: ["shiqinNeiqing", "sitanSiqiu"] });
    s.relation = 0;
    withStatus(s, "duanfeiXianghu");
    const lines = confrontLines(s);
    expect(lines).toHaveLength(2);
    expect(lines.filter((l) => l.duanfei)).toHaveLength(1);
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

  it("甄远道下狱 cost: s 起始 3，父兄蒙尘 +1，打压祺贵人 -1，每张解牌 -1", () => {
    const s = newStage3(1, CARRY);
    expect(xiayuS(s, 0)).toBe(3);
    expect(xiayuS(s, 1)).toBe(2);
    expect(xiayuS(s, 5)).toBe(0);
    expect(xiayuCost(s, "taihou", 0)).toEqual([
      { resource: "shengchong", amount: -4 },
      { resource: "qingyu", amount: -6 },
    ]);
    withStatus(s, "fuxiongMengchen");
    expect(xiayuS(s, 0)).toBe(4);
    s.suppressed.guaerjia = true;
    expect(xiayuS(s, 0)).toBe(3);
    expect(xiayuCost(s, "kneel", 2)).toEqual([
      { resource: "shengchong", amount: -2 },
    ]);
    expect(xiayuCost(s, "kneel", 3)).toEqual([]);
  });

  it("鄂敏参本: 没化解 清誉 -4 + 父兄蒙尘; 一张解牌 清誉 -1 + 父兄蒙尘; 化解也 清誉 -1", () => {
    const run = (hand: CardId3[]) => {
      let s = advanceTo(newStage3(5, CARRY), 5);
      clearBoard(s);
      s.crisis = ev(s, "emingCanben");
      const before = s.qingyu;
      const uids = setHand(s, hand);
      for (const u of uids) s = act(s, { type: "playCard", cardUid: u });
      s = act(s, { type: "endTurn" });
      return { delta: s.qingyu - before, curse: s.statuses.some((st) => st.id === "fuxiongMengchen"), log: s.log };
    };
    expect(run([])).toMatchObject({ delta: -4, curse: true });
    expect(run(["shoulongRenxin"])).toMatchObject({ curse: true });
    const full = run(["shoulongRenxin", "meizhuangXiangzhu"]);
    expect(full.curse).toBe(false);
    expect(full.log.some((l) => l.text.includes("鄂敏参本（化解了，仍有些折损）：清誉 -1"))).toBe(true);
  });

  it("景仁宫对质 (turn 10): no ordinary events, 陵容 cannot be played, outcome by cards played", () => {
    let s = advanceTo(newStage3(7, CARRY), 10);
    expect(s.opportunity ?? s.crisis ?? s.huanghou).toBeNull();
    expect(s.confront).not.toBeNull();
    expect(s.popups).toContain("confront");
    const need = s.confront!.needed;
    const ids = setHand(s, ["lingrongXiangzhu", ...CONFRONT.cards.slice(0, need)]);
    s.extraPlays = need;
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

  it("故人来访 (turn 15): 槿汐相助 / 眉庄相助 are exclusive options (and 默认 诊治 is the third)", () => {
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
    const q = (ids: CardId3[]) => run("fazuoCuhuo", ids).qingyu;
    expect([q([]), q(["jinxiXiangzhu"])]).toEqual([q(["jinxiXiangzhu", "jingxinRennai"]), q(["jinxiXiangzhu", "jingxinRennai"])]);
    const t1 = run("tanhuoLiangmi", ["jinxiXiangzhu"]).statuses.find((x) => x.id === "hanzheng" && x.appliesFromTurn === 13)?.remaining;
    const t0 = run("tanhuoLiangmi", []).statuses.find((x) => x.id === "hanzheng" && x.appliesFromTurn === 13)?.remaining;
    expect([t0, t1]).toEqual([2, 1]);
  });

  it("果郡王相助: draws 1, +1 play this turn, 笛韵萦怀 gives +1 draw next turn", () => {
    let s = advanceTo(newStage3(6, CARRY), 12);
    clearBoard(s);
    const [g] = setHand(s, ["guojunwangXiangzhu"]);
    const before = playLimit3(s);
    s = act(s, { type: "playCard", cardUid: g! });
    expect(playLimit3(s)).toBe(before + 1);
    expect(s.statuses.some((x) => x.id === "diyunYinghuai")).toBe(true);
  });

  it("睹物生疑: from the turn after 引驾 until 回宫, each 遗物 in hand at turn end adds 疑点 (not only on the 偶遇 turn)", () => {
    const doubtAfter = (hand: CardId3[]) => {
      let s = advanceTo(newStage3(12, CARRY), 27);
      clearBoard(s);
      s.yihua!.step = 2;
      s.yihua!.yinjiaTurn = 26;
      s.yihua!.ouyuDue = 99;
      setHand(s, hand);
      s = act(s, { type: "endTurn" });
      return s.yihua!.doubt;
    };
    expect(doubtAfter(["yiwuDi", "yiwuPifeng"]) - doubtAfter([])).toBe(2);
  });

  it("眉庄相助 in the temple: 清誉/抽牌 replaced by 眉庄打点 (抓牌 +1 for 3 turns)", () => {
    let s = advanceTo(newStage3(6, CARRY), 12);
    clearBoard(s);
    const [mz] = setHand(s, ["meizhuangXiangzhu"]);
    const qingyu = s.qingyu;
    const handBefore = s.hand.length;
    s = act(s, { type: "playCard", cardUid: mz! });
    expect(s.qingyu).toBe(qingyu);
    expect(s.hand.length).toBe(handBefore - 1);
    expect(s.statuses.find((x) => x.id === "meizhuangDadian")?.remaining).toBe(3);
  });

  it("欣贵人解围: an unresolved 对头 crisis is blocked with a crisis-specific log", () => {
    let s = advanceTo(newStage3(6, CARRY), 6);
    clearBoard(s);
    withStatus(s, "xinGuirenZhangyi");
    s.crisis = ev(s, "yuhuayuanQi");
    const qingyu = s.qingyu;
    s = act(s, { type: "endTurn" });
    expect(s.log.some((l) => l.text.includes("欣贵人解围") && l.text.includes("三阿哥的功课"))).toBe(true);
    expect(s.qingyu).toBeGreaterThanOrEqual(qingyu);
  });

  it("断炭缺粮: cleared with two cards still costs 🌱1; unresolved costs 🌱1 now plus 寒疾缠身", () => {
    const run = (ids: CardId3[]) => {
      let s = advanceTo(newStage3(6, CARRY), 12);
      clearBoard(s);
      s.shenzi = 5;
      s.crisis = ev(s, "tanhuoLiangmi");
      s.extraPlays = 5;
      for (const uid of setHand(s, ids)) s = act(s, { type: "playCard", cardUid: uid });
      s = act(s, { type: "endTurn" });
      return s;
    };
    const both = run(["jingchaiBuqun", "jinxiXiangzhu"]);
    const none = run([]);
    expect(both.statuses.some((x) => x.id === "hanzheng" && x.appliesFromTurn === 13)).toBe(false);
    expect(both.shenzi).toBe(none.shenzi);
    expect(none.statuses.some((x) => x.id === "hanzheng" && x.appliesFromTurn === 13)).toBe(true);
  });

  it("功德箱失窃: cleared still costs 🪷1; unresolved gives 香油疑云 (🪷-1 at each of the next 3 turn ends)", () => {
    const run = (ids: CardId3[]) => {
      let s = advanceTo(newStage3(6, CARRY), 12);
      clearBoard(s);
      s.qingyu = 5;
      s.crisis = ev(s, "wutouXiangyou");
      s.extraPlays = 5;
      for (const uid of setHand(s, ids)) s = act(s, { type: "playCard", cardUid: uid });
      s = act(s, { type: "endTurn" });
      return s;
    };
    const solved = run(["jinxiXiangzhu"]);
    const none = run([]);
    expect(solved.qingyu).toBe(4);
    expect(solved.statuses.some((x) => x.id === "xiangyouYiyun")).toBe(false);
    expect(none.qingyu).toBe(5);
    expect(none.statuses.find((x) => x.id === "xiangyouYiyun")?.remaining).toBe(3);
  });

  it("圣驾偶遇: 荆钗布裙 also completes step ②", () => {
    let s = advanceTo(newStage3(12, CARRY), 27);
    clearBoard(s);
    s.yihua = { step: 2, yinjia: ["jinxiXiangzhu"], yinjiaNeed: 1, duishi: true, doubt: 1, doneTurn: null, ouyuDue: s.turn, ouyuTurn: s.turn, yinjiaTurn: s.turn - 2, dushu: false, dengmen: null };
    s.stories.push({ id: "yihuaOuyu", chosenOptionId: null });
    s.extraPlays = 3;
    const [bu] = setHand(s, ["jingchaiBuqun"]);
    s = act(s, { type: "playCard", cardUid: bu! });
    expect(s.yihua!.step).toBe(3);
    expect(s.yihua!.ouyuCard).toBe("jingchaiBuqun");
    expect(s.popups).toContain("ouyu");
  });

  it("碎玉轩闲话: two cards, cleared costs 🪷1; one card = 闲话传开 1 turn, none = 2 turns", () => {
    const run = (ids: CardId3[]) => {
      let s = advanceTo(newStage3(6, CARRY), 8);
      clearBoard(s);
      s.crisis = ev(s, "suiyuxuanXianhua");
      s.extraPlays = 5;
      const q0 = s.qingyu;
      for (const uid of setHand(s, ids)) s = act(s, { type: "playCard", cardUid: uid });
      const q1 = s.qingyu;
      s = act(s, { type: "endTurn" });
      return { s, dq: q1 - q0 };
    };
    const rem = (s: Z3State) => s.statuses.find((x) => x.id === "xianhuaChuanKai" && x.appliesFromTurn === 9)?.remaining;
    const both = run(["jinxiXiangzhu", "shoulongRenxin"]);
    expect(rem(both.s)).toBeUndefined();
    expect(both.dq).toBeLessThanOrEqual(0);
    expect([rem(run(["jinxiXiangzhu"]).s), rem(run([]).s)]).toEqual([1, 2]);
  });

  it("耳目窥伺: unresolved gives 眼线环伺 (draw -1, never below 1) and no 清誉 loss", () => {
    let s = advanceTo(newStage3(6, CARRY), 20);
    clearBoard(s);
    s.statuses = [];
    s.crisis = ev(s, "xianrenKuitan");
    const qingyu = s.qingyu;
    s = act(s, { type: "endTurn" });
    expect(s.qingyu).toBe(qingyu);
    const st = s.statuses.find((x) => x.id === "yanxianHuansi" && x.appliesFromTurn === 21);
    expect(st?.remaining).toBe(2);
    expect(drawModifier3(s, s.turn)).toBeLessThan(0);
    expect(drawCount3(s, s.turn)).toBeGreaterThanOrEqual(1);
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
      [...STAGE3_TEMPLE_DECK].sort(),
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
    expect(s.log.some((l) => String(l.text ?? l).includes("仓皇出寺：清誉 -2"))).toBe(true);
    expect(s.atPeak).toBe(true);
    expect(s.statuses.some((x) => x.id === "hanzheng")).toBe(true);
  });

  it("合婚庚帖 is a 双牌 story: 果郡王相助 + 荆钗布裙 once each; the same card twice does not count", () => {
    const start = (): Z3State => {
      const s = advanceTo(newStage3(12, CARRY), 3);
      clearBoard(s);
      s.stories.push({ id: "hehunGengtie", chosenOptionId: null });
      return s;
    };
    let s = start();
    let [g1, g2] = setHand(s, ["guojunwangXiangzhu", "guojunwangXiangzhu"]);
    s.extraPlays = 3;
    s = act(s, { type: "playCard", cardUid: g1! });
    s = act(s, { type: "playCard", cardUid: g2! });
    expect(s.gengtie).toBe(false);
    expect(s.stories[0]!.chosenOptionId).toBeNull();

    s = start();
    const [g, j] = setHand(s, ["guojunwangXiangzhu", "jingchaiBuqun"]);
    s.extraPlays = 3;
    s = act(s, { type: "playCard", cardUid: j! });
    s = act(s, { type: "playCard", cardUid: g! });
    expect(s.gengtie).toBe(true);
    expect(s.keepsakes).toContain("yiwuGengtie");
  });

  it("踏雪问疾 resolved by a card is remembered after the story leaves the board", () => {
    let s = advanceTo(newStage3(12, CARRY), 19);
    const [g] = setHand(s, ["guojunwangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: g! });
    expect(s.taxueByCard).toBe(true);
    s = advanceTo(s, 23);
    expect(s.stories.some((st) => st.id === "taxueWenji")).toBe(false);
    expect(s.taxueByCard).toBe(true);
  });

  it("踏雪问疾: 默认 🌱-2 🪷-1; 果郡王相助下回合抓牌 -1; 槿汐相助下两回合打不出槿汐相助; 闭门谢客不移除负面且不加牌", () => {
    const run = (hand: CardId3[]) => {
      let s = advanceTo(newStage3(12, CARRY), 19);
      s.shenzi = Math.max(s.shenzi, 4);
      s.statuses.push({ uid: `s${s.nextUid++}`, id: "hanzheng", appliesFromTurn: s.turn, remaining: 2 });
      s.statuses.push({ uid: `s${s.nextUid++}`, id: "jingji", appliesFromTurn: s.turn, remaining: 2 });
      const sz = s.shenzi;
      const q = s.qingyu;
      const gjw = () => [...s.drawPile, ...s.hand, ...s.discard].filter((c) => c.id === "guojunwangXiangzhu").length;
      const uids = hand.length ? setHand(s, hand) : [];
      const g0 = gjw();
      if (uids[0]) s = act(s, { type: "playCard", cardUid: uids[0] });
      else s = act(s, { type: "endTurn" });
      return { s, dsz: s.shenzi - sz, dq: s.qingyu - q, dg: gjw() - g0 };
    };
    const bimen = run(["jingxinRennai"]);
    const card = run(["guojunwangXiangzhu"]);
    expect(card.s.statuses.some((x) => x.id === "bingzhongXinyou")).toBe(true);
    expect(card.s.statuses.some((x) => x.id === "hanzheng")).toBe(true);
    const jin = run(["jinxiXiangzhu"]);
    expect(jin.s.statuses.some((x) => x.id === "jinxiLeikua" && x.remaining === 2)).toBe(true);
    expect(card.dsz).toBe(0);
    expect(jin.dsz).toBe(0);
    expect(bimen.dsz).toBe(-1);
    expect(bimen.s.log.some((l) => l.text.startsWith("闭门谢客：移除状态"))).toBe(false);
    expect(bimen.s.statuses.some((x) => x.id === "hanzheng")).toBe(true);
    expect(bimen.s.taxueByCard).toBe(true);
    expect(bimen.dg).toBe(0);
  });

  it("合婚庚帖 grants 琴瑟同心 only after 踏雪问疾 (by a card) and 月下琴笛 are both done; draw +1 starts after 舟覆", () => {
    const run = (taxueByCard: boolean, qinDone: boolean) => {
      let s = advanceTo(newStage3(12, CARRY), 3);
      clearBoard(s);
      s.taxueByCard = taxueByCard;
      s.changxiangsiDone = qinDone;
      s.stories.push({ id: "hehunGengtie", chosenOptionId: null });
      const [g, j] = setHand(s, ["guojunwangXiangzhu", "jingchaiBuqun"]);
      s.extraPlays = 3;
      s = act(s, { type: "playCard", cardUid: j! });
      s = act(s, { type: "playCard", cardUid: g! });
      return s;
    };
    expect(hasStatus3(run(true, false), "qinseHeming")).toBe(false);
    expect(hasStatus3(run(false, true), "qinseHeming")).toBe(false);
    const s = run(true, true);
    expect(hasStatus3(s, "qinseHeming")).toBe(true);
    expect(s.popups).toContain("qinse");
    const base = run(true, false);
    expect(drawModifier3(s, 25)).toBe(drawModifier3(base, 25));
    expect(drawModifier3(s, 26)).toBe(drawModifier3(base, 26) + 1);
  });

  it("舟覆噩耗 turns the 果郡王 cards into relics; 移花接木 starts on turn 26 with 疑点 1", () => {
    let s = advanceTo(newStage3(12, CARRY), 24);
    s.gengtie = true;
    s.songxing = false;
    for (const pile of [s.hand, s.drawPile, s.discard]) for (let i = pile.length - 1; i >= 0; i--) if (pile[i]!.id === "guojunwangXiangzhu") pile.splice(i, 1);
    s.drawPile.push({ uid: "g1", id: "guojunwangXiangzhu" }, { uid: "g2", id: "guojunwangXiangzhu" });
    s = advanceTo(s, 25);
    const relics = [...s.hand, ...s.drawPile, ...s.discard].map((c) => c.id).filter((id) => id.startsWith("yiwu"));
    // 桐花台默认「论笛谈诗」留下旧笛谱；庚帖优先，其余按往来取用
    expect(relics.sort()).toEqual(["yiwuDipu", "yiwuGengtie"]);
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
    let s = advanceTo(newStage3(15, CARRY), 26);
    s.exitShengchong = 9;
    s.exitTier = 1;
    s.shenzi = 6;
    const next = () => {
      clearBoard(s);
      s = act(s, { type: "endTurn" });
      clearBoard(s);
      s.discard.push(...s.hand.filter((c) => c.id.startsWith("yiwu")));
      s.hand = s.hand.filter((c) => !c.id.startsWith("yiwu"));
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
    expect(s.outcome).toBe("playing");
    expect(s.turn).toBe(29);
    expect(s.yihua!.dengmen).toMatchObject({ doubt: 2, relics: 0, needed: 1 });
    expect(s.popups).toContain("dengmen");
    clearBoard(s);
    const [jinxi2] = setHand(s, ["jinxiXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: jinxi2! });
    expect(s.yihua!.step).toBe(5);
    clearBoard(s);
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("won");
    expect(s.victory).toBe("perfect");
    const story = endingStory3(s).join("\n");
    expect(story).toContain("自请去甘露寺");
    expect(story).toContain("枝繁叶茂");
    expect(story).not.toContain("还活着");
    expect(story.indexOf("景仁宫那一日")).toBeLessThan(story.indexOf("甘露寺"));
    expect(story.indexOf("凌云峰")).toBeLessThan(story.indexOf("钮祜禄氏"));
  });

  it("皇上登门: card count follows 疑点 + 遗物, +1 unless 体面自请; zero means story only", () => {
    const need = (doubt: number, relics: number, tier: 1 | 2) => {
      const s = newStage3(14, CARRY);
      s.exitTier = tier;
      return dengmenNeeded(s, doubt, relics);
    };
    expect(need(0, 0, 1)).toBe(0);
    expect(need(0, 0, 2)).toBe(0);
    expect(need(1, 0, 1)).toBe(1);
    expect(need(1, 1, 1)).toBe(1);
    expect(need(2, 1, 1)).toBe(2);
    expect(need(4, 1, 1)).toBe(3);
    expect(need(4, 1, 2)).toBe(4);
    let s = advanceTo(newStage3(14, CARRY), 28);
    clearBoard(s);
    s.exitTier = 1;
    s.yihua = { step: 4, yinjia: ["jinxiXiangzhu"], yinjiaNeed: 1, duishi: true, doubt: 0, doneTurn: null, ouyuDue: null, ouyuTurn: 27, yinjiaTurn: 25, dushu: false, dengmen: null };
    s.drawPile = s.drawPile.filter((c) => !c.id.startsWith("yiwu"));
    s.discard = s.discard.filter((c) => !c.id.startsWith("yiwu"));
    s.hand = s.hand.filter((c) => !c.id.startsWith("yiwu"));
    s = act(s, { type: "endTurn" });
    expect(s.turn).toBe(29);
    expect(s.yihua!.step).toBe(5);
    expect(s.yihua!.dengmen!.needed).toBe(0);
    clearBoard(s);
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("won");
  });

  it("皇上登门: one card short at the deadline is a 险胜, two short is a loss", () => {
    const run = (played: CardId3[]) => {
      let s = advanceTo(newStage3(16, CARRY), 33);
      clearBoard(s);
      s.yihua = { step: 4, yinjia: ["jinxiXiangzhu"], yinjiaNeed: 1, duishi: true, doubt: 0, doneTurn: null, ouyuDue: null, ouyuTurn: 27, yinjiaTurn: 25, dushu: false, dengmen: { doubt: 3, relics: 0, needed: 3, played, openTurn: 32 } };
      return act(s, { type: "endTurn" });
    };
    const narrow = run(["chanyuXiushen", "jingchaiBuqun"]);
    expect(narrow.outcome).toBe("won");
    expect(narrow.victory).toBe("narrow");
    expect(run(["chanyuXiushen"]).outcome).toBe("lost");
  });

  it("皇上登门: two-turn window; 被废出宫 caps at 险胜; only a one-turn clear can be 完胜", () => {
    const run = (tier: 1 | 3, plays: CardId3[][]) => {
      let s = advanceTo(newStage3(17, CARRY), 29);
      clearBoard(s);
      s.exitTier = tier;
      s.drawPile = s.drawPile.filter((c) => !c.id.startsWith("yiwu"));
      s.discard = s.discard.filter((c) => !c.id.startsWith("yiwu"));
      s.hand = s.hand.filter((c) => !c.id.startsWith("yiwu"));
      s.yihua = { step: 4, yinjia: ["jinxiXiangzhu"], yinjiaNeed: 1, duishi: true, doubt: 0, doneTurn: null, ouyuDue: null, ouyuTurn: 27, yinjiaTurn: 25, dushu: false, dengmen: { doubt: 1, relics: 0, needed: tier === 1 ? 1 : 2, played: [], openTurn: 29 } };
      for (let i = 0; i < plays.length; i++) {
        clearBoard(s);
        s.extraPlays = 3;
        for (const uid of setHand(s, plays[i]!)) s = act(s, { type: "playCard", cardUid: uid });
        clearBoard(s);
        if (s.outcome === "playing") s = act(s, { type: "endTurn" });
      }
      return s;
    };
    expect(run(1, [["chanyuXiushen"]]).victory).toBe("perfect");
    expect(run(1, [[], ["chanyuXiushen"]]).victory).toBe("return");
    expect(run(3, [["chanyuXiushen", "jingchaiBuqun"]]).victory).toBe("narrow");
    expect(run(3, [["chanyuXiushen"], []]).victory).toBe("narrow");
    expect(run(3, [[], []]).outcome).toBe("lost");
  });

  it("皇上登门: 温太医相助 counts, and the step spans turns", () => {
    let s = advanceTo(newStage3(15, CARRY), 29);
    clearBoard(s);
    s.yihua = { step: 4, yinjia: ["jinxiXiangzhu"], yinjiaNeed: 1, duishi: true, doubt: 3, doneTurn: null, ouyuDue: null, ouyuTurn: 27, yinjiaTurn: 25, dushu: false, dengmen: { doubt: 3, relics: 0, needed: 2, played: [], openTurn: s.turn } };
    expect(yihuaAccepts(s, "wenTaiyiZhenzhi")).toBe(true);
    expect(yihuaAccepts(s, "jingxinRennai")).toBe(false);
    expect(musicMood({ stage: 3, state: s } as never)).toBe("return");
    const [chanyu, jinxi] = setHand(s, ["chanyuXiushen", "jinxiXiangzhu"]);
    s.extraPlays = 0;
    s = act(s, { type: "playCard", cardUid: chanyu! });
    expect(s.yihua!.step).toBe(4);
    expect(s.yihua!.dengmen!.played).toEqual(["chanyuXiushen"]);
    clearBoard(s);
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("playing");
    expect(s.yihua!.dengmen!.needed).toBe(2);
    s.extraPlays = 0;
    const [jinxi2] = setHand(s, ["jinxiXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: jinxi2! });
    expect(s.yihua!.step).toBe(5);
    void jinxi;
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

describe("出宫清誉按把柄条数扣", () => {
  it("宫中清誉高于修行上限时，从上限 8 起扣呈上的把柄条数", () => {
    const s = advanceTo(newStage3(3, CARRY), 10);
    s.confront = { ...s.confront!, presented: 4, needed: confrontNeeded(4) };
    s.qingyu = 18;
    // 第 10 回合一张辩白牌都不打：缺 3 张，被废出宫
    const after = act(s, { type: "endTurn" });
    expect(after.exitTier).toBe(3);
    expect(after.qingyu).toBe(8 - 4); // 呈上 4 条
  });

  it("对质卡名不预设出宫方式（被废出宫时不应显示“自请出宫”）", () => {
    expect(CONFRONT.name).not.toContain("自请");
    const s = advanceTo(newStage3(3, CARRY), 10);
    const after = act(s, { type: "endTurn" });
    expect(after.exitTier).toBeGreaterThan(1);
    expect(EXIT[after.exitTier!].name).not.toBe(EXIT[1].name);
  });
});

describe("stage 3 陵容相助 情分", () => {
  it("a 陵容 outcome that fails to resolve the event still raises 情分", () => {
    for (const [id, table] of Object.entries(LINGRONG_EVENT3)) {
      for (const tier of ["close", "distant", "resentful"] as const) {
        const o = table![tier];
        if (!o.resolves) expect(o.relation, `${id}.${tier}`).toBe(1);
      }
    }
  });

  it("中宫垂青 with 亲厚 陵容 raises 情分", () => {
    expect(LINGRONG_EVENT3.huanghouShangshi!.close.relation).toBe(1);
  });
});

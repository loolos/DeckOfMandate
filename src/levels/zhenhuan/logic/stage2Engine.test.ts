import { describe, expect, it } from "vitest";
import { CARDS2, EVENTS2, FINALE, LINGRONG_EVENT, STORIES2, type CardId2, type EventId2, type EvidenceId, type StatusId2, type StoryId2 } from "../data/stage2Content";
import {
  xianyuegeHintVisible,
  blockedByChezhou,
  canPlayCard,
  endingLines,
  hateCap,
  isFreeByLianmei,
  lianmeiLit,
  newStage2,
  playLimit2,
  reduce2,
  replay2,
  storyResponsesFor,
  summonBlocked,
  tierOf,
  type EventInst2,
  type Z2Action,
  type Z2State,
} from "./stage2Engine";

function act(s: Z2State, a: Z2Action): Z2State {
  const next = reduce2(s, a);
  expect(next, JSON.stringify(a)).not.toBe(s);
  return next;
}

function addCard(s: Z2State, id: CardId2): string {
  const uid = `t${s.nextUid++}`;
  s.hand.push({ uid, id });
  return uid;
}

function setHand(s: Z2State, ids: CardId2[]): string[] {
  s.discard.push(...s.hand);
  s.hand = [];
  return ids.map((id) => addCard(s, id));
}

function ev(s: Z2State, id: EventId2): EventInst2 {
  return { uid: `x${s.nextUid++}`, id, resolved: false };
}

function onlyEvents(s: Z2State, events: { opportunity?: EventId2; crisis?: EventId2; huafei?: EventId2[] }): void {
  s.opportunity = events.opportunity ? ev(s, events.opportunity) : null;
  s.crisis = events.crisis ? ev(s, events.crisis) : null;
  s.huafei = (events.huafei ?? []).map((id) => ev(s, id));
}

function openStory(s: Z2State, id: StoryId2): void {
  s.stories = [{ id, chosenOptionId: null }];
}

function withStatus(s: Z2State, id: StatusId2, appliesFromTurn = s.turn, remaining = 2): void {
  s.statuses.push({ uid: `s${s.nextUid++}`, id, appliesFromTurn, remaining });
}

/** Ends turns choosing default options until `turn` begins. */
function advanceTo(s: Z2State, turn: number): Z2State {
  while (s.turn < turn && s.outcome === "playing") {
    s.qingyu = Math.max(s.qingyu, 9);
    s.shengchong = Math.max(s.shengchong, 9);
    s.crisis = null;
    s.huafei = [];
    s = act(s, { type: "endTurn" });
  }
  return s;
}

describe("zhenhuan stage 2 content", () => {
  it("every non-陵容 card that resolves an event has story text; 陵容 has a tier table for each match", () => {
    for (const card of Object.values(CARDS2)) {
      for (const id of card.matches) {
        if (card.id === "lingrongXiangzhu") expect(LINGRONG_EVENT[id], id).toBeTruthy();
        else expect(EVENTS2[id].resolvedStory[card.id], `${id} × ${card.id}`).toBeTruthy();
      }
    }
    for (const e of Object.values(EVENTS2)) {
      for (const c of e.double?.cards ?? []) expect(e.resolvedStory[c], `${e.id} × ${c}`).toBeTruthy();
    }
  });

  it("story defaults exist", () => {
    for (const st of Object.values(STORIES2)) expect(st.options.some((o) => o.id === st.defaultOptionId), st.id).toBe(true);
  });
});

describe("zhenhuan stage 2 engine", () => {
  it("standalone start: 常在, 8/8, 身子 2 hidden, no story on turn 1", () => {
    const s = newStage2(1, null);
    expect(s.turn).toBe(1);
    expect(s.rank).toBe("changzai");
    expect(s.qingyu).toBe(8);
    expect(s.shengchong).toBe(8);
    expect(s.shenzi).toBe(2);
    expect(s.shenziRevealed).toBe(false);
    expect(s.stories).toHaveLength(0);
    expect(s.hand).toHaveLength(3);
    expect(s.relation).toBeNull();
  });

  it("carry-over values are used and capped at the 常在 cap", () => {
    const s = newStage2(1, { qingyu: 3, shengchong: 14 });
    expect(s.qingyu).toBe(3);
    expect(s.shengchong).toBe(12);
  });

  it("初请安 sets the starting hate; 凤鸾空返 sets relation and puts 3 陵容 into the discard pile", () => {
    let s = newStage2(2, null);
    s.crisis = null;
    s = act(s, { type: "endTurn" });
    expect(s.turn).toBe(2);
    s = act(s, { type: "chooseStory", storyId: "lingrongTuihui", optionId: "dengmenKuanwei" });
    expect(s.relation).toBe(2);
    s.crisis = null;
    s.huafei = [];
    s = act(s, { type: "endTurn" });
    const all = [...s.drawPile, ...s.hand, ...s.discard].filter((c) => c.id === "lingrongXiangzhu");
    expect(all).toHaveLength(3);
    expect(s.drawPile.some((c) => c.id === "lingrongXiangzhu")).toBe(false);
    expect(s.turn).toBe(3);
    expect(reduce2(s, { type: "chooseStory", storyId: "chuQingan", optionId: "chuyanDingzhuang" })).toBe(s); // card-only
    const q = s.qingyu;
    onlyEvents(s, {});
    s.stories = s.stories.filter((x) => x.id === "chuQingan");
    const [m] = setHand(s, ["meizhuangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: m! });
    expect(s.hate).toBe(3);
    expect(s.qingyu).toBeGreaterThanOrEqual(q + 1);
    let t = newStage2(2, null);
    t.turn = 3;
    t.stories = [{ id: "chuQingan", chosenOptionId: null }];
    onlyEvents(t, {});
    const [j] = setHand(t, ["jinyanShenxing"]);
    t = act(t, { type: "playCard", cardUid: j! });
    expect(t.hate).toBe(1);
    t.stories = [{ id: "chuQingan", chosenOptionId: null }];
    t = act(t, { type: "chooseStory", storyId: "chuQingan", optionId: "bubeiBukang" });
    expect(t.hate).toBe(2);
  });

  it("联袂: one neighbour of a 亲厚 陵容 is played free, once per 陵容", () => {
    const s = newStage2(3, null);
    s.relation = 3;
    s.stories = [];
    onlyEvents(s, {});
    const [a, , b] = setHand(s, ["yirongZhengsu", "lingrongXiangzhu", "jinyanShenxing"]);
    expect(isFreeByLianmei(s, a!)).toBe(true);
    let t = act(s, { type: "playCard", cardUid: a! });
    expect(t.playsUsed).toBe(0);
    expect(isFreeByLianmei(t, b!)).toBe(false);
    t = act(t, { type: "playCard", cardUid: b! });
    expect(t.playsUsed).toBe(1);
  });

  it("联袂: at most once per turn — after one use every 陵容's 联袂 goes dim", () => {
    const s = newStage2(3, null);
    s.relation = 3;
    s.stories = [];
    onlyEvents(s, {});
    const [a, l1, , l2, d] = setHand(s, ["yirongZhengsu", "lingrongXiangzhu", "jingguanQibian", "lingrongXiangzhu", "jinyanShenxing"]);
    const lit = (st: Z2State) => [l1, l2].map((uid) => lianmeiLit(st, st.hand.find((c) => c.uid === uid)!));
    expect(lit(s)).toEqual([true, true]);
    expect(isFreeByLianmei(s, d!)).toBe(true);
    const t = act(s, { type: "playCard", cardUid: a! });
    expect(t.playsUsed).toBe(0);
    expect(lit(t)).toEqual([false, false]);
    expect(isFreeByLianmei(t, d!)).toBe(false);
  });

  it("掣肘: a 怨怼 陵容 blocks its neighbours but not itself; playing her lifts it", () => {
    const s = newStage2(4, null);
    s.relation = -3;
    s.stories = [];
    onlyEvents(s, {});
    const [a, l, b, c] = setHand(s, ["yirongZhengsu", "lingrongXiangzhu", "jinyanShenxing", "shoulongRenxin"]);
    expect(blockedByChezhou(s, a!)).toBe(true);
    expect(blockedByChezhou(s, b!)).toBe(true);
    expect(blockedByChezhou(s, c!)).toBe(false);
    expect(canPlayCard(s, a!)).toBe(false);
    const before = s.shengchong;
    const t = act(s, { type: "playCard", cardUid: l! });
    expect(t.shengchong).toBe(before - 1); // 微词
    expect(blockedByChezhou(t, a!)).toBe(false);
  });

  it("依依 keeps a 生分 陵容 in hand; 冷落 lowers relation but never below -1", () => {
    let s = newStage2(5, null);
    s.relation = 0;
    s.stories = [];
    onlyEvents(s, {});
    setHand(s, ["lingrongXiangzhu", "yirongZhengsu"]);
    s = act(s, { type: "endTurn" });
    expect(s.relation).toBe(-1);
    expect(s.hand[0]!.id).toBe("lingrongXiangzhu");
    // the kept 陵容 takes one of this turn's draws: 常在 draws 3 → 1 kept + 2 new
    expect(s.drawnThisTurn).toBe(2);
    expect(s.hand).toHaveLength(3);
    s.stories = [];
    onlyEvents(s, {});
    s = act(s, { type: "endTurn" });
    expect(s.relation).toBe(-1);
  });

  it("陵容 by tier on 蜚语盈廊: 怨怼 失效 and doubles 流言缠身", () => {
    let s = newStage2(6, null);
    s.relation = -3;
    s.stories = [];
    onlyEvents(s, { crisis: "gongzhongLiuyan" });
    const [l] = setHand(s, ["lingrongXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: l! });
    expect(s.crisis?.resolved).toBe(false);
    s = act(s, { type: "endTurn" });
    expect(s.statuses.filter((x) => x.id === "liuyanChanshen")).toHaveLength(2);
  });

  it("惜别: playing one 眉庄 gives 清誉 +2 and 眉庄嘱托, then every 眉庄 leaves", () => {
    let s = advanceTo(newStage2(7, null), 8);
    s = act(s, { type: "chooseStory", storyId: "jiaYunFengbo", optionId: "xiushouPangguan" });
    expect(s.xibie).toBe("meizhuangXiangzhu");
    onlyEvents(s, {});
    s.stories = [];
    const [m] = setHand(s, ["meizhuangXiangzhu"]);
    const q = s.qingyu;
    s.qingyu = Math.min(q, 5);
    const before = s.qingyu;
    s = act(s, { type: "playCard", cardUid: m! });
    expect(s.qingyu).toBe(before + 2);
    expect(s.statuses.some((x) => x.id === "meizhuangZhutuo")).toBe(true);
    const left = [...s.drawPile, ...s.hand, ...s.discard].filter((c) => c.id === "meizhuangXiangzhu");
    expect(left).toHaveLength(0);
    expect(s.departed.filter((c) => c.id === "meizhuangXiangzhu").length).toBeGreaterThanOrEqual(2);
  });

  it("欢宜香浓 blocks 召幸 until resolved; unresolved voids it", () => {
    let s = newStage2(8, null);
    s.relation = 0;
    s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
    onlyEvents(s, { huafei: ["huanyixiangZhuanchong"] });
    const [y, j] = setHand(s, ["yirongZhengsu", "jingguanQibian"]);
    expect(summonBlocked(s)).toBe(true);
    expect(reduce2(s, { type: "chooseStory", storyId: "zhaoxing", optionId: "chengbingBichong" })).toBe(s);
    s = act(s, { type: "playCard", cardUid: y! }); // 双牌 1/2; 召幸 not answered while blocked
    expect(s.stories[0]!.chosenOptionId).toBeNull();
    expect(s.huafei[0]!.progress).toEqual(["yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: j! });
    expect(s.huafei[0]!.resolved).toBe(true);
    expect(summonBlocked(s)).toBe(false);
  });

  it("一丈红: two of the set in one turn resolve it; 收拢人心 among them twice gives 滥用私刑", () => {
    const answer = (s: Z2State) => {
      s.stories = [];
      s.extraPlays = 3;
      onlyEvents(s, { huafei: ["yizhangHong"] });
      const [a, b] = setHand(s, ["shoulongRenxin", "jinyanShenxing"]);
      s = act(s, { type: "playCard", cardUid: a! });
      expect(s.huafei[0]!.resolved).toBe(false);
      s = act(s, { type: "playCard", cardUid: b! });
      expect(s.huafei[0]!.resolved).toBe(true);
      return s;
    };
    const fresh = newStage2(9, null);
    fresh.hate = 5;
    let s = answer(fresh);
    expect(s.hate).toBe(6); // fully answered: only 恨意 +1
    expect(s.evidence).not.toContain("lanyongSixing"); // first time: only a clue
    expect(s.evidenceClues.lanyongSixing).toBe(1);
    s.qingyu = 8;
    s.shengchong = 8;
    s = answer(s);
    expect(s.evidence).toContain("lanyongSixing");
  });

  it("克扣份例 延烧: stays a turn, then 圣宠 -2 and leaves", () => {
    let s = newStage2(10, null);
    s.stories = [];
    s.hate = 0;
    onlyEvents(s, { huafei: ["kekouFenli"] });
    setHand(s, []);
    const sc = s.shengchong;
    s = act(s, { type: "endTurn" });
    expect(s.huafei.some((e) => e.id === "kekouFenli" && e.burning)).toBe(true);
    expect(s.shengchong).toBeLessThanOrEqual(sc - 1 + 1);
    s.stories = [];
    s.opportunity = null;
    s.crisis = null;
    s.huafei = s.huafei.filter((e) => e.burning);
    setHand(s, []);
    const before = s.shengchong;
    s = act(s, { type: "endTurn" });
    expect(s.huafei.some((e) => e.burning)).toBe(false);
    expect(s.shengchong).toBeLessThanOrEqual(before - 2 + 1);
  });

  it("华妃事件数量随恨意：5 → 1 张", () => {
    let s = newStage2(11, null);
    s.stories = [];
    onlyEvents(s, {});
    s.hate = 5;
    s.shengchong = 7;
    s = act(s, { type: "endTurn" });
    expect(s.huafei).toHaveLength(1);
  });

  it("圆明园 card response: 必定有孕; 贵人 waits for 请脉报喜 (two cards) before 嫔", () => {
    let s = newStage2(12, null);
    s.rank = "guiren";
    s.relation = 3;
    s.hate = 0;
    openStory(s, "yuanmingyuan");
    onlyEvents(s, {});
    const [y] = setHand(s, ["yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: y! });
    expect(s.pregnant).toBe(true);
    expect(s.rank).toBe("guiren");
    expect(s.hate).toBe(6); // 月下相伴 +3, 有孕 +3
    expect(s.opportunityPool[s.opportunityPool.length - 1]).toBe("qingmaiBaoxi");
    // once the rest of the pool is used up it comes; one card is not enough
    s.opportunityPool = ["qingmaiBaoxi"];
    s.crisis = null;
    s.huafei = [];
    s.stories = [];
    s = act(s, { type: "endTurn" });
    expect(s.opportunity?.id).toBe("qingmaiBaoxi");
    s.stories = [];
    s.crisis = null;
    s.huafei = [];
    s.extraPlays = 5;
    const [w, j] = setHand(s, ["wenTaiyiZhenzhi", "jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: w! });
    expect(s.rank).toBe("guiren");
    s = act(s, { type: "playCard", cardUid: j! });
    expect(s.rank).toBe("pin");
    expect(s.relation).toBe(1);
  });

  it("请脉报喜 unresolved goes back into the pool; a miscarriage removes it", () => {
    let s = newStage2(25, null);
    s.rank = "guiren";
    openStory(s, "yuanmingyuan");
    onlyEvents(s, {});
    const [y] = setHand(s, ["yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: y! });
    s.opportunityPool = ["qingmaiBaoxi"];
    s.crisis = null;
    s.huafei = [];
    s.stories = [];
    s = act(s, { type: "endTurn" });
    expect(s.opportunity?.id).toBe("qingmaiBaoxi");
    s.crisis = null;
    s.huafei = [];
    s.stories = [];
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.rank).toBe("guiren");
    const inPool = (x: Z2State) => [...x.opportunityPool, x.opportunity?.id].includes("qingmaiBaoxi");
    expect(inPool(s)).toBe(true);
    // 伤胎 while pregnant → 小产 → gone
    s.stories = [];
    s.huafei = [];
    s.crisis = ev(s, "hanliangZhiwu");
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.pregnant).toBe(false);
    expect(inPool(s)).toBe(false);
    expect(s.opportunityUsed.includes("qingmaiBaoxi")).toBe(false);
  });

  it("罚跪 while pregnant: forced miscarriage; harsh +1, 留方 -1", () => {
    let s = newStage2(13, null);
    s.pregnant = true;
    s.statuses.push({ uid: "p", id: "shenhuaiLongyi", appliesFromTurn: 1, remaining: 0 });
    withStatus(s, "wentaiyiLiufang", 1, 0);
    s.shenzi = 5;
    s.hate = 7;
    s.fakuiHarsh = true;
    openStory(s, "fakuiPregnant");
    onlyEvents(s, {});
    const [w] = setHand(s, ["shoulongRenxin"]);
    s = act(s, { type: "playCard", cardUid: w! }); // 宫人飞报: 2 +1 harsh -1 留方 = 2
    expect(s.pregnant).toBe(false);
    expect(s.shenzi).toBe(3);
    expect(s.hate).toBe(4);
    expect(s.statuses.some((x) => x.id === "wentaiyiLiufang")).toBe(false);
  });

  it("罚跪（有孕）: 小产身子 -2 固定；默认 清誉 -2，暗中留心 抱恙在身，槿汐 / 陵容 清誉 -1", () => {
    const run = (hand: CardId2 | null) => {
      let s = newStage2(14, null);
      s.pregnant = true;
      s.statuses.push({ uid: "p", id: "shenhuaiLongyi", appliesFromTurn: 1, remaining: 0 });
      s.shenzi = 6;
      s.qingyu = 8;
      s.shengchong = 8;
      s.hate = 7;
      s.fakuiHarsh = false;
      onlyEvents(s, {});
      openStory(s, "fakuiPregnant");
      if (hand) {
        const [c] = setHand(s, [hand]);
        s = act(s, { type: "playCard", cardUid: c! });
      } else {
        s = act(s, { type: "chooseStory", storyId: "fakuiPregnant", optionId: "yingcheng" });
      }
      expect(s.pregnant).toBe(false);
      return s;
    };
    const def = run(null);
    expect(def.shenzi).toBe(4);
    expect(def.qingyu).toBe(8 - 1 - 2); // 小产 -1, 硬撑 -2
    expect(def.statuses.some((x) => x.id === "bimenSiguo")).toBe(false);
    const liuxin = run("jingguanQibian");
    expect(liuxin.qingyu).toBe(7);
    expect(liuxin.statuses.some((x) => x.id === "baoyangZaishen")).toBe(true);
    expect(run("jinxiXiangzhu").qingyu).toBe(6); // 小产 -1, 槿汐 -1
    expect(run("wenTaiyiZhenzhi").qingyu).toBe(7);
    expect(run("shoulongRenxin").shengchong).toBe(8); // 小产 -1, 飞报皇上 +1
  });

  it("罚跪（未有孕）陵容送药: 身子 -2、清誉 -1 照扣；生分时多一句风凉话", () => {
    let s = newStage2(15, null);
    s.relation = 0;
    s.shenzi = 3;
    s.qingyu = 8;
    s.fakuiHarsh = false;
    openStory(s, "fakuiPlain");
    onlyEvents(s, {});
    const [l] = setHand(s, ["lingrongXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: l! });
    expect(s.qingyu).toBe(7);
    expect(s.shenzi).toBe(1);
    expect(s.statuses.some((x) => x.id === "baoyangZaishen")).toBe(false); // 陵容送药 does not leave you 抱恙
    expect(s.log.some((e) => e.text.includes("何苦与华妃硬碰"))).toBe(true);

    let j = newStage2(15, null);
    j.shenzi = 3;
    j.qingyu = 8;
    j.fakuiHarsh = false;
    openStory(j, "fakuiPlain");
    onlyEvents(j, {});
    const [h] = setHand(j, ["jinxiXiangzhu"]);
    j = act(j, { type: "playCard", cardUid: h! });
    expect(j.shenzi).toBe(2); // 槿汐护膝: 身子 -1
    expect(j.qingyu).toBe(8);
    expect(j.statuses.some((x) => x.id === "baoyangZaishen")).toBe(true);

    let k = newStage2(15, null);
    k.shenzi = 3;
    k.qingyu = 8;
    k.shengchong = 6;
    k.fakuiHarsh = false;
    openStory(k, "fakuiPlain");
    onlyEvents(k, {});
    const [r] = setHand(k, ["shoulongRenxin"]);
    k = act(k, { type: "playCard", cardUid: r! });
    expect(k.stories[0]!.chosenOptionId).toBe("feibaoHuangshangPlain");
    expect(k.shenzi).toBe(1); // 身子 -2
    expect(k.qingyu).toBe(8); // no 清誉 loss
    expect(k.shengchong).toBe(7); // 圣宠 +1
    expect(k.statuses.some((x) => x.id === "baoyangZaishen")).toBe(true);
  });

  it("怨怼 陵容 that 失效 still nudges the relation up by 1", () => {
    let s = newStage2(17, null);
    s.relation = -3;
    s.stories = [];
    onlyEvents(s, { crisis: "gongzhongLiuyan" });
    const [l] = setHand(s, ["lingrongXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: l! });
    expect(s.crisis!.resolved).toBe(false);
    expect(s.relation).toBe(-2);
  });

  it("御前密语: 槿汐相助 resolves it and brings 卖官鬻爵; 陵容相助 cannot", () => {
    let s = newStage2(42, null);
    s.stories = [];
    s.evidence = [];
    onlyEvents(s, { opportunity: "supeishengToufeng" });
    const [j] = setHand(s, ["jinxiXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: j! });
    expect(s.opportunity?.resolved).toBe(true);
    expect(s.evidence).toContain("maiguanYujue");

    let t = newStage2(42, null);
    t.stories = [];
    onlyEvents(t, { opportunity: "supeishengToufeng" });
    const [l] = setHand(t, ["lingrongXiangzhu"]);
    t = act(t, { type: "playCard", cardUid: l! });
    expect(t.opportunity?.resolved).toBe(false);
    expect(t.evidence).not.toContain("maiguanYujue");
  });

  it("殿前风雨 never opens on the last turn, even at 恨意 10", () => {
    const run = (turn: number) => {
      const s = newStage2(49, null);
      s.rank = "pin";
      s.turn = turn - 1;
      s.hate = 10;
      s.stories = [];
      s.evidence = ["yuyingerYiyan", "liuweiqingYaofang", "fuziZhisi", "maiguanYujue", "kekouZhangce", "lanyongSixing", "duanfeiHonghua"];
      s.qingyu = 12;
      s.shengchong = 12;
      return act(s, { type: "endTurn" });
    };
    expect(run(12).stories.some((x) => x.id === "huafeiFanan")).toBe(true);
    const last = run(30);
    expect(last.turn).toBe(30);
    expect(last.stories.some((x) => x.id === "huafeiFanan")).toBe(false);
  });

  it("凤鸾承恩 never appears on the last turn", () => {
    const run = (turn: number) => {
      const s = newStage2(50, null);
      s.rank = "pin";
      s.turn = turn - 1;
      s.hate = 3;
      s.stories = [];
      s.summonLast = null;
      s.evidence = ["yuyingerYiyan", "liuweiqingYaofang", "fuziZhisi", "maiguanYujue", "kekouZhangce", "lanyongSixing", "duanfeiHonghua"];
      s.qingyu = 12;
      s.shengchong = 14;
      return act(s, { type: "endTurn" });
    };
    expect(run(12).stories.some((x) => x.id === "zhaoxing")).toBe(true);
    const last = run(30);
    expect(last.turn).toBe(30);
    expect(last.stories.some((x) => x.id === "zhaoxing")).toBe(false);
  });

  it("凤鸾承恩 never appears on the 菊残霜冷 turn (turn 8), but comes back the next turn", () => {
    const at = (turn: number) => {
      const s = newStage2(48, null);
      s.rank = "guiren";
      s.turn = turn - 1;
      s.shengchong = 12;
      s.qingyu = 12;
      s.hate = 3;
      s.stories = [];
      s.summonLast = null;
      return act(s, { type: "endTurn" });
    };
    const t8 = at(8);
    expect(t8.turn).toBe(8);
    expect(t8.stories.some((x) => x.id === "jiaYunFengbo")).toBe(true);
    expect(t8.stories.some((x) => x.id === "zhaoxing")).toBe(false);
    expect(at(9).stories.some((x) => x.id === "zhaoxing")).toBe(true);
  });

  it("宝华祈福: 温太医相助 gives only 身子 (no 清誉)", () => {
    let s = newStage2(43, null);
    s.stories = [];
    s.qingyu = 5;
    s.shenzi = 2;
    onlyEvents(s, { opportunity: "baohuadianQifu" });
    const [w] = setHand(s, ["wenTaiyiZhenzhi"]);
    s = act(s, { type: "playCard", cardUid: w! });
    expect(s.opportunity?.resolved).toBe(true);
    expect(s.qingyu).toBe(5);
    expect(s.shenzi).toBe(4); // event +1, 温太医相助's own +1
  });

  it("静心调养: 静观其变 gives 身子 +2 and no 清誉", () => {
    let s = newStage2(47, null);
    s.stories = [];
    s.qingyu = 5;
    s.shenzi = 2;
    onlyEvents(s, { opportunity: "jingxinTiaoyang" });
    const [q] = setHand(s, ["jingguanQibian"]);
    s = act(s, { type: "playCard", cardUid: q! });
    expect(s.opportunity?.resolved).toBe(true);
    expect(s.qingyu).toBe(5);
    expect(s.shenzi).toBe(4);
  });

  it("莺儿伏罪 / 圆明伴驾 / 翊坤长跪: the new 谨言慎行 / 温太医相助 options", () => {
    let a = newStage2(44, null);
    a.qingyu = 5;
    onlyEvents(a, {});
    openStory(a, "yuyingerShishi");
    const [j] = setHand(a, ["jinyanShenxing"]);
    a = act(a, { type: "playCard", cardUid: j! });
    expect(a.stories[0]!.chosenOptionId).toBe("jiansuZhai");
    expect(a.qingyu).toBe(7); // option +1, 谨言慎行's own +1

    let b = newStage2(45, null);
    b.shenzi = 2;
    b.hate = 3;
    onlyEvents(b, {});
    openStory(b, "yuanmingyuan");
    const [w] = setHand(b, ["wenTaiyiZhenzhi"]);
    b = act(b, { type: "playCard", cardUid: w! });
    expect(b.stories[0]!.chosenOptionId).toBe("tiaoyangShengti");
    expect(b.shenzi).toBe(4);
    expect(b.pregnant).toBe(false);

    let c = newStage2(46, null);
    c.shenzi = 3;
    c.qingyu = 6;
    onlyEvents(c, {});
    openStory(c, "fakuiPlain");
    const [w2] = setHand(c, ["wenTaiyiZhenzhi"]);
    c = act(c, { type: "playCard", cardUid: w2! });
    expect(c.stories[0]!.chosenOptionId).toBe("huTiTangyao");
    expect(c.qingyu).toBe(5);
    expect(c.shenzi).toBe(4); // 温太医相助's own +1, no 身子 -1
    expect(c.statuses.some((x) => x.id === "baoyangZaishen")).toBe(false);
  });

  it("御前密语 joins the opportunity pool only after turn 10", () => {
    let s = newStage2(18, null);
    s.rank = "guiren"; // skip the 贵人考验
    const has = (x: Z2State) => [...x.opportunityPool, ...x.opportunityUsed, x.opportunity?.id].includes("supeishengToufeng");
    expect(has(s)).toBe(false);
    s = advanceTo(s, 10);
    expect(has(s)).toBe(false);
    s = advanceTo(s, 11);
    expect(s.outcome).toBe("playing");
    expect(has(s)).toBe(true);
  });

  it("no 召幸 on the 圆明伴驾 turn (14), every turn after it in the garden (15, 16)", () => {
    const s = newStage2(19, null);
    s.rank = "guiren";
    s.shengchong = 14;
    s.summonLast = null;
    s.stories = [];
    s.turn = 13;
    s.qingyu = 10;
    s.crisis = null;
    s.huafei = [];
    const t = act(s, { type: "endTurn" });
    expect(t.turn).toBe(14);
    expect(t.stories.some((x) => x.id === "yuanmingyuan")).toBe(true);
    expect(t.stories.some((x) => x.id === "zhaoxing")).toBe(false);
    t.huafei = [];
    t.crisis = null;
    const u = act(t, { type: "endTurn" });
    expect(u.turn).toBe(15);
    expect(u.pregnant).toBe(false); // 安分随侍 by default
    expect(u.stories.some((x) => x.id === "zhaoxing")).toBe(true);
  });

  it("no 召幸 on the 罚跪 turn (17)", () => {
    const s = newStage2(19, null);
    s.rank = "guiren";
    s.shengchong = 14;
    s.summonLast = null;
    s.stories = [];
    s.turn = 16;
    s.qingyu = 10;
    s.crisis = null;
    s.huafei = [];
    const t = act(s, { type: "endTurn" });
    expect(t.turn).toBe(17);
    expect(t.stories.some((x) => x.id === "zhaoxing")).toBe(false);
    expect(t.stories.some((x) => x.id === "fakuiPlain")).toBe(true);
  });

  it("惜别: first draw of a 温太医 culls the other copy; unplayed it reshuffles and stays usable", () => {
    let s = advanceTo(newStage2(20, null), 8);
    // keep 温太医 out of the hand so the cull waits for a draw
    s.discard.push(...s.hand.filter((c) => c.id === "wenTaiyiZhenzhi"));
    s.hand = s.hand.filter((c) => c.id !== "wenTaiyiZhenzhi");
    s = act(s, { type: "chooseStory", storyId: "jiaYunFengbo", optionId: "chumianLibao" });
    expect(s.xibie).toBe("wenTaiyiZhenzhi");
    expect(s.xibieCulled).toBe(false);
    const all = (x: Z2State) => [...x.drawPile, ...x.hand, ...x.discard].filter((c) => c.id === "wenTaiyiZhenzhi");
    expect(all(s)).toHaveLength(2);
    // force both copies to the top of the draw pile and end the turn
    const wens = all(s);
    s.discard = s.discard.filter((c) => c.id !== "wenTaiyiZhenzhi");
    s.hand = s.hand.filter((c) => c.id !== "wenTaiyiZhenzhi");
    s.drawPile = [...wens, ...s.drawPile.filter((c) => c.id !== "wenTaiyiZhenzhi")];
    s.crisis = null;
    s.huafei = [];
    s.qingyu = 9;
    s.shengchong = 9;
    s.trial.summoned = true;
    s = act(s, { type: "endTurn" });
    expect(s.xibieCulled).toBe(true);
    expect(s.hand.filter((c) => c.id === "wenTaiyiZhenzhi")).toHaveLength(1);
    expect(all(s)).toHaveLength(1);
    expect(s.departed.filter((c) => c.id === "wenTaiyiZhenzhi")).toHaveLength(1);
    // not played: it goes back to the discard pile and can still be used later
    s.crisis = null;
    s.huafei = [];
    s.stories = [];
    s = act(s, { type: "endTurn" });
    expect(all(s)).toHaveLength(1);
    expect(s.xibieDone).toBe(false);
  });

  it("惜别: playing 温太医 to answer 菊残霜冷 (查验药方) does not leave a second copy behind", () => {
    let s = advanceTo(newStage2(20, null), 8);
    s.stories = [];
    const [played] = setHand(s, ["wenTaiyiZhenzhi", "wenTaiyiZhenzhi"]);
    s.discard = s.discard.filter((c) => c.id !== "wenTaiyiZhenzhi");
    s.drawPile = s.drawPile.filter((c) => c.id !== "wenTaiyiZhenzhi");
    openStory(s, "jiaYunFengbo");
    s = act(s, { type: "playCard", cardUid: played! });
    expect(s.xibie).toBe("wenTaiyiZhenzhi");
    const all = [...s.drawPile, ...s.hand, ...s.discard].filter((c) => c.id === "wenTaiyiZhenzhi");
    expect(all).toHaveLength(1);
    expect(s.departed.filter((c) => c.id === "wenTaiyiZhenzhi")).toHaveLength(1);
  });

  it("欢宜香浓 only shows up on a turn with 召幸", () => {
    for (let seed = 1; seed <= 40; seed++) {
      let s = newStage2(seed, null);
      s.rank = "guiren";
      s.turn = 12;
      s.hate = 9;
      s.shengchong = 8; // ≥ threshold: 召幸 every 4 turns
      s.summonLast = 12;
      s.qingyu = 10;
      s.stories = [];
      s.crisis = null;
      s.huafei = [];
      s = act(s, { type: "endTurn" }); // turn 13: no 召幸 (interval 4)
      const summon = s.stories.some((x) => x.id === "zhaoxing");
      if (!summon) expect(s.huafei.some((e) => e.id === "huanyixiangZhuanchong")).toBe(false);
    }
  });

  it("闭门思过 stacks: each -1 play, never below 1; 静观其变 still adds", () => {
    let s = newStage2(22, null);
    expect(playLimit2(s)).toBe(2);
    withStatus(s, "bimenSiguo");
    expect(playLimit2(s)).toBe(1);
    withStatus(s, "bimenSiguo");
    expect(playLimit2(s)).toBe(1);
    s.stories = [];
    onlyEvents(s, {});
    const [j] = setHand(s, ["jingguanQibian"]);
    s = act(s, { type: "playCard", cardUid: j! });
    expect(playLimit2(s)).toBe(2);
  });

  it("槿汐相助: 诸事妥帖 gives +1 play next turn only; she answers 克扣份例 for 清誉 -1", () => {
    let s = newStage2(24, null);
    expect([...s.drawPile, ...s.hand].filter((c) => c.id === "jinxiXiangzhu")).toHaveLength(2);
    s.stories = [];
    onlyEvents(s, { huafei: ["kekouFenli"] });
    const [qy, sc] = [s.qingyu, s.shengchong];
    const [j] = setHand(s, ["jinxiXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: j! });
    expect(s.huafei[0]!.resolved).toBe(true);
    expect(s.qingyu).toBe(qy - 1);
    expect(s.shengchong).toBe(sc);
    expect(CARDS2.jinxiXiangzhu.matches).not.toContain("liyiShiwu");
    expect(playLimit2(s)).toBe(2);
    s = act(s, { type: "endTurn" });
    expect(playLimit2(s)).toBe(3);
    s = act(s, { type: "endTurn" });
    expect(playLimit2(s)).toBe(2);
  });

  it("抱恙在身 blocks 仪容整肃 / 谨言慎行 and 侍寝; 温太医 can remove it", () => {
    let s = newStage2(23, null);
    withStatus(s, "baoyangZaishen");
    onlyEvents(s, {});
    s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
    s.relation = 3;
    const [y, l, w] = setHand(s, ["yirongZhengsu", "lingrongXiangzhu", "wenTaiyiZhenzhi"]);
    expect(canPlayCard(s, y!)).toBe(false);
    expect(storyResponsesFor(s, "lingrongXiangzhu")).toHaveLength(0);
    s = act(s, { type: "playCard", cardUid: w! });
    expect(s.statuses.some((x) => x.id === "baoyangZaishen")).toBe(false);
    expect(canPlayCard(s, l!)).toBe(true);
  });

  it("翊坤立威 unresolved → 闭门思过 (眉庄嘱托 blocks it); 膳食有异 → 抱恙在身 even when 留方 absorbs the 伤胎", () => {
    let s = newStage2(24, null);
    s.stories = [];
    onlyEvents(s, { huafei: ["yikungongLiGuiju", "shanshiYouyi"] });
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.statuses.some((x) => x.id === "bimenSiguo")).toBe(true);
    expect(s.statuses.some((x) => x.id === "baoyangZaishen")).toBe(true);

    let t = newStage2(24, null);
    t.stories = [];
    withStatus(t, "meizhuangZhutuo", 1, 0);
    withStatus(t, "wentaiyiLiufang", 1, 0);
    onlyEvents(t, { huafei: ["yikungongLiGuiju", "shanshiYouyi"] });
    setHand(t, []);
    t = act(t, { type: "endTurn" });
    expect(t.statuses.some((x) => x.id === "bimenSiguo")).toBe(false);
    expect(t.statuses.some((x) => x.id === "wentaiyiLiufang")).toBe(false);
    expect(t.statuses.some((x) => x.id === "baoyangZaishen")).toBe(true);
  });

  it("年氏倾颓 (turn 24) changes hate; an owed 曹贵人 brings 琴默陈情 once", () => {
    const toNian = (seed: number, owed: boolean) => {
      let s = newStage2(seed, null);
      s.rank = "guiren";
      s.turn = 23;
      s.qingyu = 10;
      s.shengchong = 10;
      s.hate = 4;
      s.caoOwed = owed;
      s.stories = [];
      s.crisis = null;
      s.huafei = [];
      s = act(s, { type: "endTurn" });
      return s;
    };
    let s = toNian(27, true);
    expect(s.turn).toBe(24);
    expect(s.stories.some((x) => x.id === "nianShiQingtui")).toBe(true);
    const h = s.hate;
    s = act(s, { type: "chooseStory", storyId: "nianShiQingtui", optionId: "luojingXiashi" });
    expect(s.hate).toBe(h + 2);
    expect(s.evidence.includes("caoguirenGaofa")).toBe(false);
    s.crisis = null;
    s.huafei = [];
    s = act(s, { type: "endTurn" });
    expect(s.opportunity?.id).toBe("qinmoChenqing");
    s.stories = [];
    const [r] = setHand(s, ["shoulongRenxin"]);
    s = act(s, { type: "playCard", cardUid: r! });
    expect(s.evidence.includes("caoguirenGaofa")).toBe(true);

    // unresolved: gone for good
    let t = toNian(28, true);
    t.crisis = null;
    t.huafei = [];
    t = act(t, { type: "endTurn" });
    expect(t.opportunity?.id).toBe("qinmoChenqing");
    t.stories = [];
    t.crisis = null;
    t.huafei = [];
    setHand(t, []);
    t = act(t, { type: "endTurn" });
    expect([...t.opportunityPool, ...t.opportunityUsed, t.opportunity?.id].includes("qinmoChenqing")).toBe(false);

    // not owed: never comes
    let u = toNian(29, false);
    u.crisis = null;
    u.huafei = [];
    u = act(u, { type: "endTurn" });
    expect([...u.opportunityPool, u.opportunity?.id].includes("qinmoChenqing")).toBe(false);
  });

  it("华妃事件 always cost something: each answering card swaps the full penalty for one lighter one", () => {
    // 翊坤立威 + 眉庄相助 → only 恨意 +1, no 清誉 loss, no 闭门思过
    let s = newStage2(30, null);
    s.stories = [];
    s.hate = 4;
    s.qingyu = 8;
    onlyEvents(s, { huafei: ["yikungongLiGuiju"] });
    const [m] = setHand(s, ["meizhuangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: m! });
    expect(s.huafei[0]!.resolved).toBe(true);
    expect(s.qingyu).toBe(9); // 眉庄相助's own 清誉 +1
    expect(s.hate).toBe(5);
    expect(s.statuses.some((x) => x.id === "bimenSiguo")).toBe(false);
    s = act(s, { type: "endTurn" });
    expect(s.hate).toBeLessThanOrEqual(5);

    // 膳食有异 + 收拢人心 → only 圣宠 -1, no 伤胎 / 抱恙
    let t = newStage2(31, null);
    t.stories = [];
    t.shengchong = 8;
    t.shenzi = 3;
    onlyEvents(t, { huafei: ["shanshiYouyi"] });
    const [r] = setHand(t, ["shoulongRenxin"]);
    t = act(t, { type: "playCard", cardUid: r! });
    expect(t.shengchong).toBe(7);
    expect(t.shenzi).toBe(3);
    expect(t.statuses.some((x) => x.id === "baoyangZaishen")).toBe(false);

    // 膳食有异 + 温太医相助 → only 清誉 -1 (身子 untouched)
    let w = newStage2(33, null);
    w.stories = [];
    w.qingyu = 8;
    w.shenzi = 3;
    onlyEvents(w, { huafei: ["shanshiYouyi"] });
    const [d] = setHand(w, ["wenTaiyiZhenzhi"]);
    w = act(w, { type: "playCard", cardUid: d! });
    expect(w.qingyu).toBe(7);
    expect(w.shenzi).toBe(4); // only 温太医相助's own base 身子 +1; no 伤胎 / 身子 penalty
    expect(w.statuses.some((x) => x.id === "baoyangZaishen")).toBe(false);

    // 一丈红: one card → 清誉 -1、噤若寒蝉 1 回合 at end of turn, no 出气
    let u = newStage2(32, null);
    u.stories = [];
    u.qingyu = 8;
    u.shengchong = 8;
    u.hate = 6;
    onlyEvents(u, { huafei: ["yizhangHong"] });
    const [y] = setHand(u, ["yirongZhengsu"]);
    u = act(u, { type: "playCard", cardUid: y! });
    const q = u.qingyu;
    const c = u.shengchong;
    u.crisis = null;
    u = act(u, { type: "endTurn" });
    expect(u.qingyu).toBe(q - 1);
    expect(u.shengchong).toBe(c);
    expect(u.hate).toBe(6);
    expect(u.statuses.filter((x) => x.id === "jinruoHanchan").map((x) => x.remaining)).toEqual([1]);
  });

  it("一丈红 unresolved: 清誉 -2、噤若寒蝉 2 回合 (no 收拢人心 / 槿汐相助)、出气", () => {
    let s = newStage2(34, null);
    s.stories = [];
    s.qingyu = 8;
    s.shengchong = 8;
    s.hate = 6;
    onlyEvents(s, { huafei: ["yizhangHong"] });
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.qingyu).toBe(6);
    expect(s.shengchong).toBe(8);
    expect(s.hate).toBe(5);
    expect(s.statuses.filter((x) => x.id === "jinruoHanchan").map((x) => x.remaining)).toEqual([2]);
    s.stories = [];
    onlyEvents(s, { crisis: "neiwufuDiaonan" });
    const [r, j, y] = setHand(s, ["shoulongRenxin", "jinxiXiangzhu", "yirongZhengsu"]);
    expect(canPlayCard(s, r!)).toBe(false);
    expect(canPlayCard(s, j!)).toBe(false);
    expect(canPlayCard(s, y!)).toBe(true);
  });

  it("琴默叩门 comes only from turn 10, once 恨意 > 5", () => {
    const at = (turn: number) => {
      let s = newStage2(33, null);
      s.rank = "guiren";
      s.turn = turn - 1;
      s.hate = 7;
      s.qingyu = 10;
      s.shengchong = 10;
      s.stories = [];
      s.crisis = null;
      s.huafei = [];
      s = act(s, { type: "endTurn" });
      return s.stories.some((x) => x.id === "caoGuirenLaifang");
    };
    expect(at(7)).toBe(false);
    expect(at(10)).toBe(true);
  });

  it("伤胎 events: 抱恙在身 only when not pregnant; a 小产 does not add it", () => {
    let s = newStage2(34, null);
    s.pregnant = true;
    s.statuses.push({ uid: "p", id: "shenhuaiLongyi", appliesFromTurn: 1, remaining: 0 });
    s.shenzi = 5;
    s.stories = [];
    onlyEvents(s, { crisis: "hanliangZhiwu" });
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.miscarriages).toBe(1);
    expect(s.statuses.some((x) => x.id === "baoyangZaishen")).toBe(false);
  });

  it("凤鸾承恩 on a crowded turn (≥ 4 other events) pushes out the opportunity event", () => {
    const next = (hate: number) => {
      let s = newStage2(35, null);
      s.rank = "guiren";
      s.turn = 12;
      s.hate = hate;
      s.qingyu = 10;
      s.shengchong = 10;
      s.summonLast = null;
      s.caoTriggered = true;
      s.stories = [];
      s.crisis = null;
      s.huafei = [];
      s = act(s, { type: "endTurn" });
      expect(s.stories.some((x) => x.id === "zhaoxing")).toBe(true);
      return s;
    };
    const crowded = next(9); // 机会 + 危机 + 2 华妃 = 4
    expect(crowded.huafei).toHaveLength(2);
    expect(crowded.opportunity).toBeNull();
    const calm = next(0); // 机会 + 危机 only
    expect(calm.opportunity).not.toBeNull();
  });

  it("卧床静养 also rules out 侍寝: 召幸 has no card answers", () => {
    const s = newStage2(36, null);
    withStatus(s, "wochuangJingyang");
    s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
    onlyEvents(s, {});
    setHand(s, ["yirongZhengsu"]);
    expect(storyResponsesFor(s, "yirongZhengsu")).toHaveLength(0);
    const t = act(s, { type: "chooseStory", storyId: "zhaoxing", optionId: "chengbingBichong" });
    expect(t.stories[0]!.chosenOptionId).toBe("chengbingBichong");
  });

  it("小产 records what it actually cost (for the notice)", () => {
    let s = newStage2(37, null);
    s.pregnant = true;
    s.statuses.push({ uid: "p", id: "shenhuaiLongyi", appliesFromTurn: 1, remaining: 0 });
    s.shenzi = 5;
    s.qingyu = 6;
    s.shengchong = 6;
    s.hate = 2;
    s.stories = [];
    onlyEvents(s, { crisis: "hanliangZhiwu" });
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.miscarriageCost).toEqual({ shenzi: -3, qingyu: -1, shengchong: -1, hate: -2 });
  });

  it("身怀龙裔: 华妃恨意 +1 at every turn start", () => {
    let s = newStage2(38, null);
    s.rank = "guiren";
    s.turn = 12;
    s.pregnant = true;
    s.statuses.push({ uid: "p", id: "shenhuaiLongyi", appliesFromTurn: 1, remaining: 0 });
    s.hate = 3;
    s.shengchong = 8;
    s.qingyu = 8;
    s.stories = [];
    onlyEvents(s, {});
    s = act(s, { type: "endTurn" });
    expect(s.hate).toBe(4);
  });

  it("陵容 played with nothing to answer: 情分 +1 (怨怼 still 微词)", () => {
    const run = (relation: number) => {
      let s = newStage2(41, null);
      s.relation = relation;
      s.shengchong = 8;
      s.stories = [];
      onlyEvents(s, {});
      const [l] = setHand(s, ["lingrongXiangzhu"]);
      s = act(s, { type: "playCard", cardUid: l! });
      return s;
    };
    const distant = run(0);
    expect(distant.relation).toBe(1);
    expect(distant.shengchong).toBe(8);
    const resentful = run(-3);
    expect(resentful.relation).toBe(-2);
    expect(resentful.shengchong).toBe(7);
  });

  it("圣宠 helpers: 侍寝 +1; 谨言慎行 on 太后垂询 +1; 欢宜香浓 unanswered only -1", () => {
    let s = newStage2(39, null);
    s.shengchong = 6;
    s.hate = 0;
    s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
    onlyEvents(s, { opportunity: "taihouChuixun" });
    s.extraPlays = 2;
    const [y, j] = setHand(s, ["yirongZhengsu", "jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: y! }); // 仪容整肃 +1, 侍寝 +1
    expect(s.shengchong).toBe(8);
    s = act(s, { type: "playCard", cardUid: j! }); // 太后垂询 via 谨言慎行: +1
    expect(s.shengchong).toBe(9);

    let t = newStage2(40, null);
    t.shengchong = 6;
    t.stories = [];
    onlyEvents(t, { huafei: ["huanyixiangZhuanchong"] });
    setHand(t, []);
    t = act(t, { type: "endTurn" });
    expect(t.shengchong).toBe(5);
  });

  it("隔墙有耳: unanswered → 清誉 -1 and a 2-turn 流言缠身; 静观其变 → only 恨意 +1", () => {
    let s = newStage2(43, null);
    s.qingyu = 8;
    s.stories = [];
    onlyEvents(s, { huafei: ["songzhiKuisi"] });
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.qingyu).toBeLessThanOrEqual(7);
    const st = s.statuses.find((x) => x.id === "liuyanChanshen");
    expect(st?.remaining).toBe(2);

    let t = newStage2(44, null);
    t.hate = 2;
    t.stories = [];
    onlyEvents(t, { huafei: ["songzhiKuisi"] });
    const [j] = setHand(t, ["jingguanQibian"]);
    t = act(t, { type: "playCard", cardUid: j! });
    expect(t.huafei[0]!.resolved).toBe(true);
    expect(t.hate).toBe(3);

    let u = newStage2(45, null);
    u.qingyu = 8;
    u.shengchong = 8;
    u.hate = 2;
    u.stories = [];
    onlyEvents(u, { huafei: ["songzhiKuisi"] });
    const [m] = setHand(u, ["meizhuangXiangzhu"]);
    u = act(u, { type: "playCard", cardUid: m! });
    expect(u.huafei[0]!.resolved).toBe(true);
    expect([u.qingyu, u.shengchong, u.hate]).toEqual([9, 8, 2]); // only 眉庄相助's own 清誉 +1
  });

  it("殿前风雨·求皇后庇护 via 陵容: story follows her 情分", () => {
    const run = (relation: number) => {
      let s = newStage2(42, null);
      s.relation = relation;
      s.stories = [{ id: "huafeiFanan", chosenOptionId: null }];
      onlyEvents(s, {});
      const [l] = setHand(s, ["lingrongXiangzhu"]);
      s = act(s, { type: "playCard", cardUid: l! });
      return s.stories[0]!.story ?? "";
    };
    expect(run(3)).toContain("姐姐别怕");
    expect(run(-3)).toContain("并不是为你");
  });

  it("惊鸿舞: 眉庄 + a non-怨怼 陵容 during the 贵人考验 → 圣宠 +1 for 3 turns", () => {
    const run = (relation: number) => {
      let s = newStage2(46, null);
      s.turn = 5;
      s.trial = { active: true, summoned: false };
      s.relation = relation;
      s.shengchong = 5;
      s.qingyu = 5;
      s.hate = 3;
      s.stories = [];
      onlyEvents(s, {});
      s.extraPlays = 2;
      const [m, x, l] = setHand(s, ["meizhuangXiangzhu", "yirongZhengsu", "lingrongXiangzhu"]);
      s = act(s, { type: "playCard", cardUid: m! });
      void x;
      s = act(s, { type: "playCard", cardUid: l! });
      return s;
    };
    let s = run(0);
    expect(s.statuses.some((x) => x.id === "jinghongWu")).toBe(true);
    const c = s.shengchong;
    s.stories = [];
    s.crisis = null;
    s.huafei = [];
    s = act(s, { type: "endTurn" });
    expect(s.shengchong).toBe(c + 1);
    expect(run(-3).statuses.some((x) => x.id === "jinghongWu")).toBe(false);

    // across turns counts too
    let t = newStage2(47, null);
    t.turn = 5;
    t.trial = { active: true, summoned: false };
    t.relation = 3;
    t.stories = [];
    onlyEvents(t, {});
    const [m2] = setHand(t, ["meizhuangXiangzhu"]);
    t = act(t, { type: "playCard", cardUid: m2! });
    t.stories = [];
    t.crisis = null;
    t.huafei = [];
    t = act(t, { type: "endTurn" });
    t.stories = [];
    onlyEvents(t, {});
    const [l2] = setHand(t, ["lingrongXiangzhu"]);
    t = act(t, { type: "playCard", cardUid: l2! });
    expect(t.statuses.some((x) => x.id === "jinghongWu")).toBe(true);
    expect(t.log.some((e) => e.text.includes("惊鸿舞"))).toBe(true);
  });

  it("闲月阁: hint hidden on the 菊残霜冷 turn itself, shown from the next turn", () => {
    const s = newStage2(48, null);
    s.xibie = "meizhuangXiangzhu";
    s.turn = 8;
    expect(xianyuegeHintVisible(s)).toBe(false);
    s.turn = 9;
    expect(xianyuegeHintVisible(s)).toBe(true);
    s.xibie = null;
    expect(xianyuegeHintVisible(s)).toBe(false);
  });

  it("闲月阁: 槿汐 + 眉庄 + 收拢人心 in one turn with 隔墙有耳 on the board → 恨意 capped at 6 for 3 more turns, once per run", () => {
    const setup = (seed: number) => {
      const s = newStage2(seed, null);
      s.turn = 12;
      s.rank = "guiren";
      s.turnRank = "guiren";
      s.qingyu = 10;
      s.shengchong = 10;
      s.hate = 8;
      s.stories = [];
      s.extraPlays = 1;
      s.xibie = "wenTaiyiZhenzhi";
      onlyEvents(s, { huafei: ["songzhiKuisi"] });
      return s;
    };
    let s = setup(48);
    const [j, m, r] = setHand(s, ["jinxiXiangzhu", "meizhuangXiangzhu", "shoulongRenxin"]);
    s = act(s, { type: "playCard", cardUid: j! });
    s = act(s, { type: "playCard", cardUid: m! });
    expect(s.xianyuege.done).toBe(false);
    expect(s.xianyuege.played).toEqual(["jinxiXiangzhu", "meizhuangXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: r! });
    expect(s.xianyuege.done).toBe(true);
    expect(s.hate).toBe(6);
    expect(hateCap(s)).toBe(6);
    expect(s.statuses.find((x) => x.id === "jiaoyanZanlian")?.remaining).toBe(3);
    expect(s.log.some((e) => e.text.includes("浣碧"))).toBe(true);

    // 宠冠六宫 would push it to 7: capped
    s.shengchong = 15;
    s.stories = [];
    s = act(s, { type: "endTurn" });
    expect(s.hate).toBeLessThanOrEqual(6);
    for (let i = 0; i < 3; i++) {
      s.stories = [];
      s.qingyu = 10;
      s.huafei = [];
      s.crisis = null;
      s = act(s, { type: "endTurn" });
    }
    expect(s.statuses.some((x) => x.id === "jiaoyanZanlian")).toBe(false);
    expect(hateCap(s)).toBe(10);

    // no 隔墙有耳 on the board: nothing counts
    let t = setup(49);
    onlyEvents(t, {});
    for (const uid of setHand(t, ["jinxiXiangzhu", "meizhuangXiangzhu", "shoulongRenxin"])) t = act(t, { type: "playCard", cardUid: uid });
    expect(t.xianyuege.done).toBe(false);
    expect(t.xianyuege.played).toEqual([]);

    // before 菊残霜冷 (眉庄 not yet 禁足): nothing counts
    let v = setup(51);
    v.xibie = null;
    for (const uid of setHand(v, ["jinxiXiangzhu", "meizhuangXiangzhu", "shoulongRenxin"])) v = act(v, { type: "playCard", cardUid: uid });
    expect(v.xianyuege.done).toBe(false);
    expect(v.xianyuege.played).toEqual([]);

    // split across turns: progress resets
    let u = setup(50);
    for (const uid of setHand(u, ["jinxiXiangzhu", "meizhuangXiangzhu"])) u = act(u, { type: "playCard", cardUid: uid });
    u.stories = [];
    u = act(u, { type: "endTurn" });
    expect(u.xianyuege.played).toEqual([]);
  });

  it("眉庄相助's event lines switch to the 禁足 version after 菊残霜冷, whoever left", () => {
    const withConfined = (Object.keys(EVENTS2) as EventId2[]).filter((id) => EVENTS2[id].confinedStory?.meizhuangXiangzhu);
    expect(withConfined.sort()).toEqual(["gongzhongLiuyan", "neiwufuDiaonan", "songzhiKuisi", "taihouChuixun", "yikungongLiGuiju"]);
    for (const id of withConfined) {
      const run = (xibie: Z2State["xibie"]) => {
        let s = newStage2(52, null);
        s.stories = [];
        s.xibie = xibie;
        s.hate = 3;
        const kind = EVENTS2[id].kind;
        onlyEvents(s, kind === "opportunity" ? { opportunity: id } : kind === "crisis" ? { crisis: id } : { huafei: [id] });
        const [m] = setHand(s, ["meizhuangXiangzhu"]);
        s = act(s, { type: "playCard", cardUid: m! });
        return [s.opportunity, s.crisis, ...s.huafei].find((e) => e?.id === id)!;
      };
      const before = run(null);
      expect(before.resolved, id).toBe(true);
      expect(before.story, id).toBe(EVENTS2[id].resolvedStory.meizhuangXiangzhu);
      for (const who of ["meizhuangXiangzhu", "wenTaiyiZhenzhi"] as const) {
        const after = run(who);
        expect(after.resolved, id).toBe(true);
        expect(after.story, id).toBe(EVENTS2[id].confinedStory!.meizhuangXiangzhu);
      }
    }
  });

  it("华妃事件 come from a shuffled deck: locked ones wait, used ones are reshuffled once nothing drawable is left", () => {
    const setup = (seed: number) => {
      const s = newStage2(seed, null);
      s.turn = 10;
      s.hate = 5; // 1 华妃事件 a turn
      s.shengchong = 6;
      s.qingyu = 10;
      s.stories = [];
      s.caoTriggered = true;
      onlyEvents(s, {});
      setHand(s, []);
      return s;
    };
    const fresh = (s: Z2State) => s.huafei.filter((e) => !e.burning).map((e) => e.id);

    // 欢宜香浓 is locked (恨意 < 7): skipped but kept in the deck
    let s = setup(60);
    s.huafeiPool = ["huanyixiangZhuanchong", "songzhiKuisi", "yizhangHong"];
    s.huafeiUsed = [];
    s = act(s, { type: "endTurn" });
    expect(fresh(s)).toEqual(["songzhiKuisi"]);
    expect(s.huafeiPool).toEqual(["huanyixiangZhuanchong", "yizhangHong"]);
    expect(s.huafeiUsed).toEqual(["songzhiKuisi"]);

    // only locked ones left → the used ones are shuffled back in
    let t = setup(61);
    t.huafeiPool = ["huanyixiangZhuanchong"];
    t.huafeiUsed = ["kekouFenli"];
    t = act(t, { type: "endTurn" });
    expect(fresh(t)).toEqual(["kekouFenli"]);
    expect(t.log.some((e) => e.text.includes("重新洗匀"))).toBe(true);

    // a full round of the 5 unlocked events before any repeats
    let u = setup(62);
    const seen: string[] = [];
    for (let i = 0; i < 5; i++) {
      u.hate = 5;
      u.huafei = [];
      u.stories = [];
      u.qingyu = 10;
      u.shengchong = 6;
      u = act(u, { type: "endTurn" });
      seen.push(...fresh(u));
    }
    expect([...seen].sort()).toEqual(["kekouFenli", "shanshiYouyi", "songzhiKuisi", "yikungongLiGuiju", "yizhangHong"]);
  });

  it("a 延烧 克扣份例 kept from last turn takes no slot of this turn's 华妃事件", () => {
    let s = newStage2(63, null);
    s.turn = 10;
    s.hate = 5;
    s.shengchong = 6;
    s.qingyu = 10;
    s.stories = [];
    s.caoTriggered = true;
    onlyEvents(s, { huafei: ["kekouFenli"] });
    setHand(s, []);
    s.huafeiPool = ["songzhiKuisi", "yizhangHong"];
    s.huafeiUsed = ["kekouFenli"];
    s = act(s, { type: "endTurn" });
    expect(s.huafei.map((e) => [e.id, !!e.burning])).toEqual([
      ["kekouFenli", true],
      ["songzhiKuisi", false],
    ]);
  });

  it("ending lines cover the pregnancy outcome", () => {
    const s = newStage2(16, null);
    expect(endingLines(s).some((l) => l.includes("始终没有动静"))).toBe(true);
    s.pregnancies = 2;
    s.miscarriages = 1;
    s.pregnant = true;
    const lines = endingLines(s);
    expect(lines.some((l) => l.includes("没能保住"))).toBe(true);
    expect(lines.some((l) => l.includes("又有了龙裔"))).toBe(true);
  });

  it("伤胎 while pregnant → miscarriage; 留方 absorbs it once", () => {
    let s = newStage2(14, null);
    s.pregnant = true;
    s.statuses.push({ uid: "p", id: "shenhuaiLongyi", appliesFromTurn: 1, remaining: 0 });
    withStatus(s, "wentaiyiLiufang", 1, 0);
    s.stories = [];
    onlyEvents(s, { crisis: "hanliangZhiwu" });
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.pregnant).toBe(true);
    s.stories = [];
    s.huafei = [];
    s.opportunity = null;
    s.crisis = ev(s, "hanliangZhiwu");
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.pregnant).toBe(false);
    expect(s.miscarriages).toBe(1);
  });

  it("身子 0 → 卧床静养: 1 play per turn, then 身子 back to 1", () => {
    let s = newStage2(15, null);
    s.shenzi = 1;
    s.stories = [];
    onlyEvents(s, { crisis: "hanliangZhiwu" });
    setHand(s, []);
    s = act(s, { type: "endTurn" });
    expect(s.shenzi).toBe(0);
    expect(s.statuses.some((x) => x.id === "wochuangJingyang")).toBe(true);
    expect(playLimit2(s)).toBe(1);
    for (let i = 0; i < 2; i++) {
      s.stories = [];
      onlyEvents(s, {});
      s.huafei = [];
      s = act(s, { type: "endTurn" });
    }
    expect(s.statuses.some((x) => x.id === "wochuangJingyang")).toBe(false);
    expect(s.shenzi).toBe(1);
  });

  it("舒痕胶 never takes 身子 below 1; 亲厚 gives 圣宠 +1", () => {
    let s = newStage2(16, null);
    s.relation = 3;
    s.stories = [];
    onlyEvents(s, { crisis: "liyiShiwu" });
    let [l] = setHand(s, ["lingrongXiangzhu"]);
    s.shengchong = 5;
    s = act(s, { type: "playCard", cardUid: l! });
    expect(s.crisis?.resolved).toBe(true);
    expect(s.shengchong).toBe(6);
    // 怨怼 at 身子 1: harmless either way
    let t = newStage2(17, null);
    t.relation = -4;
    t.shenzi = 1;
    t.stories = [];
    onlyEvents(t, { crisis: "liyiShiwu" });
    [l] = setHand(t, ["lingrongXiangzhu"]);
    t = act(t, { type: "playCard", cardUid: l! });
    expect(t.shenzi).toBe(1);
  });

  it("舒痕胶 when 生分: sometimes harmful, sometimes 疤痕尽消 (圣宠 +1), sometimes nothing", () => {
    const seen = { harm: 0, heal: 0, none: 0 };
    for (let seed = 100; seed < 160; seed++) {
      let s = newStage2(seed, null);
      s.relation = 0;
      expect(tierOf(s)).toBe("distant");
      s.shenzi = 3;
      s.shengchong = 5;
      s.stories = [];
      onlyEvents(s, { crisis: "liyiShiwu" });
      const [l] = setHand(s, ["lingrongXiangzhu"]);
      s = act(s, { type: "playCard", cardUid: l! });
      if (s.shenzi === 2) seen.harm++;
      else if (s.shengchong === 6) seen.heal++;
      else seen.none++;
    }
    expect(seen.harm).toBeGreaterThan(0);
    expect(seen.heal).toBeGreaterThan(0);
    expect(seen.none).toBeGreaterThan(0);
  });

  it("莺儿伏罪 · 陵容探视: 亲厚 / 生分 gets 余莺儿遗言, 怨怼 comes back empty-handed", () => {
    for (const [start, gets] of [
      [3, true],
      [0, true],
      [-3, false],
    ] as const) {
      let s = newStage2(41, null);
      s.relation = start;
      s.evidence = [];
      onlyEvents(s, {});
      openStory(s, "yuyingerShishi");
      const [l] = setHand(s, ["lingrongXiangzhu"]);
      s = act(s, { type: "playCard", cardUid: l! });
      expect(s.stories[0]!.chosenOptionId, `@${start}`).toBe("lingrongTanshi");
      expect(s.evidence.includes("yuyingerYiyan"), `@${start}`).toBe(gets);
    }
  });

  it("殿前风雨 · 求皇后庇护: 陵容 亲厚 / 生分 costs 情分 -1, 怨怼 unchanged", () => {
    for (const [start, after] of [
      [3, 2],
      [0, -1],
      [-3, -3],
    ] as const) {
      let s = newStage2(41, null);
      s.relation = start;
      s.qingyu = 9;
      s.shengchong = 9;
      s.shenzi = 3;
      onlyEvents(s, {});
      openStory(s, "huafeiFanan");
      const [l] = setHand(s, ["lingrongXiangzhu"]);
      s = act(s, { type: "playCard", cardUid: l! });
      expect(s.stories[0]!.chosenOptionId, `@${start}`).toBe("qiuHuanghou");
      expect(s.relation, `@${start}`).toBe(after);
    }
  });

  it("陵容 answering 欢宜香浓 / 克扣份例 costs 情分 -1; a 怨怼 no-show still warms +1", () => {
    for (const id of ["huanyixiangZhuanchong", "kekouFenli"] as const) {
      for (const [start, after, resolved] of [
        [3, 2, true],
        [0, -1, true],
        [-3, -2, false],
      ] as const) {
        let s = newStage2(40, null);
        s.relation = start;
        s.stories = [];
        onlyEvents(s, { huafei: [id] });
        const [l] = setHand(s, ["lingrongXiangzhu"]);
        s = act(s, { type: "playCard", cardUid: l! });
        expect(s.huafei[0]!.resolved, `${id} @${start}`).toBe(resolved);
        expect(s.relation, `${id} @${start}`).toBe(after);
      }
    }
  });

  it("恨意 10 opens 殿前风雨; resolving it drops hate to 6", () => {
    let s = newStage2(18, null);
    s.stories = [];
    onlyEvents(s, {});
    s.hate = 9;
    s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
    const [y] = setHand(s, ["yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: y! }); // 侍寝 +1 → 10
    expect(s.shenziRevealedBy).toBe("summon");
    expect(s.stories.some((x) => x.id === "huafeiFanan")).toBe(true);
    const before = { q: s.qingyu, c: s.shengchong, z: s.shenzi };
    // 求皇后庇护 is only offered through 陵容相助 now
    expect(reduce2(s, { type: "chooseStory", storyId: "huafeiFanan", optionId: "qiuHuanghou" })).toBe(s);
    s.stories = s.stories.filter((x) => x.id === "huafeiFanan");
    s.extraPlays = 2;
    const [l] = setHand(s, ["lingrongXiangzhu"]);
    s = act(s, { type: "playCard", cardUid: l! });
    expect(s.hate).toBe(6);
    expect(s.qingyu).toBe(before.q);
    expect(s.shengchong).toBe(before.c - 1);
    expect(s.shenzi).toBe(Math.max(0, before.z - 2));
    expect(s.stories.find((x) => x.id === "huafeiFanan")?.story).toBeUndefined(); // no 陵容 relation yet → generic story
  });

  it("殿前风雨 温太医 costs 清誉 -1 / 圣宠 -1 and spares 身子", () => {
    let s = newStage2(21, null);
    onlyEvents(s, {});
    s.qingyu = 8;
    s.shengchong = 8;
    s.shenzi = 3;
    s.stories = [{ id: "huafeiFanan", chosenOptionId: null }];
    const [w] = setHand(s, ["wenTaiyiZhenzhi"]);
    s = act(s, { type: "playCard", cardUid: w! });
    expect(s.qingyu).toBe(7);
    expect(s.shengchong).toBe(7);
    expect(s.shenzi).toBe(4); // not hit, plus 温太医's own 身子 +1
  });

  it("贵人考验 (第 5—9 回合) needs 圣宠 ≥ 9, 清誉 ≥ 9 and a 侍寝 during the trial", () => {
    let s = advanceTo(newStage2(19, null), 5);
    expect(s.trial.active).toBe(true);
    s.trial.summoned = false;
    s.qingyu = 9;
    s.shengchong = 9;
    s.stories = [];
    onlyEvents(s, {});
    s = act(s, { type: "endTurn" });
    expect(s.rank).toBe("changzai"); // no 侍寝 yet
    s.qingyu = 9;
    s.shengchong = 9;
    s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
    onlyEvents(s, {});
    const [y] = setHand(s, ["yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: y! });
    expect(s.trial.summoned).toBe(true);
    s.shengchong = 9;
    s = act(s, { type: "endTurn" });
    expect(s.rank).toBe("guiren");
  });

  it("初谒翊坤 comes on turn 3; 召幸 only from turn 5 (贵人考验)", () => {
    let s = newStage2(23, null);
    expect(s.shengchong).toBe(8);
    expect(s.stories.some((x) => x.id === "chuQingan")).toBe(false);
    expect(s.stories.some((x) => x.id === "zhaoxing")).toBe(false);
    s = advanceTo(s, 3);
    expect(s.stories.some((x) => x.id === "chuQingan")).toBe(true);
    expect(s.stories.some((x) => x.id === "zhaoxing")).toBe(false);
    s = advanceTo(s, 4);
    expect(s.stories.some((x) => x.id === "yuyingerShishi")).toBe(true);
    s = advanceTo(s, 5);
    expect(s.stories.some((x) => x.id === "zhaoxing")).toBe(true);
    expect(s.stories.some((x) => x.id === "yuyingerShishi")).toBe(false);
  });

  it("陵容 on 召幸 by tier: 亲厚 侍寝; 生分 夺功 (+1 关系, no 侍寝); 怨怼 截走 (圣宠 -1)", () => {
    const run = (relation: number) => {
      let s = newStage2(31, null);
      s.relation = relation;
      s.hate = 0;
      s.stories = [{ id: "zhaoxing", chosenOptionId: null }];
      onlyEvents(s, {});
      s.trial = { active: true, summoned: false };
      s.shengchong = 8;
      const [l] = setHand(s, ["lingrongXiangzhu"]);
      s = act(s, { type: "playCard", cardUid: l! });
      return s;
    };
    const close = run(3);
    expect(close.trial.summoned).toBe(true);
    expect(close.stories[0]!.chosenOptionId).toBe("lingrongXiezhuang");
    const distant = run(0);
    expect(distant.trial.summoned).toBe(false);
    expect(distant.relation).toBe(1);
    const resentful = run(-3);
    expect(resentful.trial.summoned).toBe(false);
    expect(resentful.shengchong).toBe(7); // 截走 -1, no 微词 on top
  });

  it("翊坤落幕 (turn 30): ≤ 1 evidence loses at once; 2–3 → 3 cards, 4–6 → 2, ≥ 7 → 1", () => {
    const ALL = ["yuyingerYiyan", "liuweiqingYaofang", "fuziZhisi", "maiguanYujue", "kekouZhangce", "lanyongSixing", "duanfeiHonghua"] as const;
    const to30 = (n: number) => {
      let s = newStage2(20, null);
      s.turn = 29;
      s.rank = "guiren";
      s.qingyu = 10;
      s.shengchong = 10;
      s.stories = [];
      s.crisis = null;
      s.huafei = [];
      s.hate = 9;
      s.evidence = ALL.slice(0, n);
      return act(s, { type: "endTurn" });
    };
    const at30 = (n: number, cards: CardId2[]) => {
      let s = to30(n);
      expect(s.turn).toBe(30);
      expect(s.huafei).toHaveLength(0); // no 华妃 events on the last turn
      expect(s.finale?.needed).toBe(n >= 7 ? 1 : n >= 4 ? 2 : 3);
      s.stories = [];
      onlyEvents(s, {});
      s.extraPlays = 5;
      for (const uid of setHand(s, cards)) s = act(s, { type: "playCard", cardUid: uid });
      return reduce2(s, { type: "endTurn" });
    };
    expect(to30(1).outcome).toBe("lost");
    expect(at30(7, ["jinyanShenxing"]).victory).toBe("full");
    expect(at30(5, ["jinyanShenxing"]).outcome).toBe("lost");
    expect(at30(5, ["jinyanShenxing", "shoulongRenxin"]).victory).toBe("full");
    expect(at30(4, ["jinyanShenxing", "shoulongRenxin"]).victory).toBe("narrow");
    expect(at30(2, ["jinyanShenxing", "shoulongRenxin", "jingguanQibian"]).outcome).toBe("lost"); // 静观其变 does not count
    expect(at30(2, ["jinyanShenxing", "shoulongRenxin", "wenTaiyiZhenzhi"]).victory).toBe("narrow");
    expect(at30(7, ["lingrongXiangzhu"]).victory).toBe("full"); // 陵容 counts too
    const extra = at30(7, ["jinyanShenxing", "jinyanShenxing", "shoulongRenxin"]); // more than needed is fine
    expect(extra.finale?.played).toHaveLength(3);
    expect(extra.victory).toBe("full");
  });

  it("完美结局: ≥ 7 evidence, ≥ 3 解牌 on 第 30 回合, one of them the 惜别 card", () => {
    const ALL = ["yuyingerYiyan", "liuweiqingYaofang", "fuziZhisi", "maiguanYujue", "kekouZhangce", "lanyongSixing", "duanfeiHonghua", "caoguirenGaofa"] as const;
    const finish = (n: number, cards: CardId2[], xibie: "meizhuangXiangzhu" | "wenTaiyiZhenzhi" | null) => {
      let s = newStage2(20, null);
      s.turn = 29;
      s.rank = "guiren";
      s.qingyu = 10;
      s.shengchong = 10;
      s.stories = [];
      s.crisis = null;
      s.huafei = [];
      s.hate = 9;
      s.evidence = ALL.slice(0, n);
      s.xibie = xibie;
      s = act(s, { type: "endTurn" });
      expect(s.turn).toBe(30);
      s.stories = [];
      onlyEvents(s, {});
      s.extraPlays = 5;
      for (const uid of setHand(s, cards)) s = act(s, { type: "playCard", cardUid: uid });
      return reduce2(s, { type: "endTurn" });
    };
    const three: CardId2[] = ["meizhuangXiangzhu", "jinyanShenxing", "shoulongRenxin"];
    expect(finish(7, three, "meizhuangXiangzhu").victory).toBe("perfect");
    expect(finish(7, ["wenTaiyiZhenzhi", "jinyanShenxing", "shoulongRenxin"], "wenTaiyiZhenzhi").victory).toBe("perfect");
    expect(finish(6, three, "meizhuangXiangzhu").victory).toBe("full"); // too little evidence
    expect(finish(7, three.slice(0, 2), "meizhuangXiangzhu").victory).toBe("full"); // only 2 cards
    expect(finish(7, ["jinyanShenxing", "shoulongRenxin", "jinxiXiangzhu"], "meizhuangXiangzhu").victory).toBe("full"); // 惜别 card not played
    expect(finish(7, three, null).victory).toBe("full"); // no 惜别 at all
    const p = finish(7, three, "meizhuangXiangzhu");
    expect(endingLines(p).some((l) => l.includes("欢宜香"))).toBe(true);
  });

  it("翊坤落幕: every 解牌 testifies to a different evidence you hold", () => {
    const play = (evidence: EvidenceId[], cards: CardId2[], xibie: "meizhuangXiangzhu" | "wenTaiyiZhenzhi" | null = null, relation = 0) => {
      let s = newStage2(20, null);
      s.turn = 29;
      s.rank = "guiren";
      s.qingyu = 10;
      s.shengchong = 10;
      s.stories = [];
      s.crisis = null;
      s.huafei = [];
      s.hate = 9;
      s.evidence = evidence;
      s.xibie = xibie;
      s.relation = relation;
      s = act(s, { type: "endTurn" });
      s.stories = [];
      onlyEvents(s, {});
      s.extraPlays = 6;
      for (const uid of setHand(s, cards)) s = act(s, { type: "playCard", cardUid: uid });
      return s.finale!;
    };
    // 槿汐 and 收拢人心 both prefer 克扣账册 here; whoever goes second picks another one
    const f = play(["kekouZhangce", "fuziZhisi", "liuweiqingYaofang"], ["jinxiXiangzhu", "shoulongRenxin"]);
    expect(f.cited).toEqual(["kekouZhangce", "fuziZhisi"]);
    expect(f.stories[0]).toContain("内务府");
    expect(f.stories[1]).toContain("福子");
    // 眉庄 and 温太医 both lead with 刘畏卿药方 — the second one moves on
    const g = play(["liuweiqingYaofang", "duanfeiHonghua"], ["meizhuangXiangzhu", "wenTaiyiZhenzhi"]);
    expect(g.cited).toEqual(["liuweiqingYaofang", "duanfeiHonghua"]);
    // nothing left to speak to → the general line
    const h = play(["liuweiqingYaofang", "caoguirenGaofa"], ["wenTaiyiZhenzhi", "jinxiXiangzhu"]);
    expect(h.stories[1]).toContain(FINALE.cardStory.jinxiXiangzhu!);
    // the default lines name no evidence, so they never repeat someone else's
    const d = play(["liuweiqingYaofang", "caoguirenGaofa"], ["wenTaiyiZhenzhi", "meizhuangXiangzhu", "lingrongXiangzhu"], null, 3);
    expect(d.cited).toEqual(["liuweiqingYaofang"]);
    expect(d.stories[1]).toContain(FINALE.cardStory.meizhuangXiangzhu!);
    expect(d.stories[1]).not.toContain("假孕");
    expect(d.stories[2]).toContain(FINALE.lingrongStory.close);
    // 温太医 left: 眉庄 was still 禁足, so her lines are the same
    const m = play(["liuweiqingYaofang", "kekouZhangce"], ["meizhuangXiangzhu", "jinyanShenxing"], "wenTaiyiZhenzhi");
    expect(m.stories[0]).toContain("假孕失宠");
    // 陵容 keeps her tone and speaks to her own evidence
    const l = play(["fuziZhisi", "lanyongSixing"], ["shoulongRenxin", "lingrongXiangzhu"], null, 3);
    expect(l.cited).toEqual(["lanyongSixing", "fuziZhisi"]);
    expect(l.stories[1]).toContain(FINALE.lingrongManner.close);
  });

  it("replay reproduces a run exactly", () => {
    let s = newStage2(21, { qingyu: 6, shengchong: 7 });
    for (let i = 0; i < 6 && s.outcome === "playing"; i++) {
      const playable = s.hand.find((c) => canPlayCard(s, c.uid));
      if (playable) {
        const next = reduce2(s, { type: "playCard", cardUid: playable.uid });
        if (next !== s && !next.pending) s = next;
      }
      s = reduce2(s, { type: "endTurn" });
    }
    const again = replay2(21, { qingyu: 6, shengchong: 7 }, s.actions);
    expect(again.turn).toBe(s.turn);
    expect(again.qingyu).toBe(s.qingyu);
    expect(again.hand.map((c) => c.uid)).toEqual(s.hand.map((c) => c.uid));
  });
});

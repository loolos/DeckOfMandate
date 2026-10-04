import { describe, expect, it } from "vitest";
import { CARDS2, EVENTS2, LINGRONG_EVENT, STORIES2, type CardId2, type EventId2, type StatusId2, type StoryId2 } from "../data/stage2Content";
import {
  blockedByChezhou,
  canPlayCard,
  endingLines,
  isFreeByLianmei,
  newStage2,
  playLimit2,
  reduce2,
  replay2,
  storyResponsesFor,
  summonBlocked,
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
    const s = newStage2(1, { qingyu: 3, shengchong: 12 });
    expect(s.qingyu).toBe(3);
    expect(s.shengchong).toBe(10);
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
    expect(t.shengchong).toBe(before - 1); // 反噬
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

  it("陵容 by tier on 宫中流言: 怨怼 失效 and doubles 流言缠身", () => {
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

  it("罚跪（未有孕）陵容送药: 免身子 -1；生分时多一句风凉话", () => {
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
    expect(s.shenzi).toBeGreaterThanOrEqual(2);
    expect(s.log.some((e) => e.text.includes("何苦与华妃硬碰"))).toBe(true);
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

    // 一丈红: one card → 清誉 -1、圣宠 -1 at end of turn, no 出气
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
    expect(u.shengchong).toBe(c - 1);
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

  it("陵容 played with nothing to answer: 情分 +1 (怨怼 still 反噬)", () => {
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

  it("颂芝窥伺: unanswered → 清誉 -1 and a 2-turn 流言缠身; 静观其变 → only 恨意 +1", () => {
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

  it("恨意 10 opens 华妃发难; resolving it drops hate to 6", () => {
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
    s = act(s, { type: "chooseStory", storyId: "huafeiFanan", optionId: "qiuHuanghou" });
    expect(s.hate).toBe(6);
    expect(s.qingyu).toBe(before.q - 2);
    expect(s.shengchong).toBe(before.c - 4);
    expect(s.shenzi).toBe(Math.max(0, before.z - 2));
  });

  it("华妃发难 card responses each spare one resource: 温太医 keeps 身子", () => {
    let s = newStage2(21, null);
    onlyEvents(s, {});
    s.qingyu = 8;
    s.shengchong = 8;
    s.shenzi = 3;
    s.stories = [{ id: "huafeiFanan", chosenOptionId: null }];
    const [w] = setHand(s, ["wenTaiyiZhenzhi"]);
    s = act(s, { type: "playCard", cardUid: w! });
    expect(s.qingyu).toBe(5);
    expect(s.shengchong).toBe(5);
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
    expect(resentful.shengchong).toBe(7); // 截走 -1, no 反噬 on top
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

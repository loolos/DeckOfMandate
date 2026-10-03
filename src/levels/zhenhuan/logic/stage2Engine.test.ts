import { describe, expect, it } from "vitest";
import { CARDS2, EVENTS2, LINGRONG_EVENT, STORIES2, type CardId2, type EventId2, type StatusId2, type StoryId2 } from "../data/stage2Content";
import {
  blockedByChezhou,
  canPlayCard,
  isFreeByLianmei,
  newStage2,
  playLimit2,
  reduce2,
  replay2,
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
    s.qingyu = Math.max(s.qingyu, 8);
    s.shengchong = Math.max(s.shengchong, 8);
    s.trial.summoned = true;
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
  it("standalone start: 常在, 8/8, 身子 2 hidden, 初请安 open", () => {
    const s = newStage2(1, null);
    expect(s.turn).toBe(1);
    expect(s.rank).toBe("changzai");
    expect(s.qingyu).toBe(8);
    expect(s.shengchong).toBe(8);
    expect(s.shenzi).toBe(2);
    expect(s.shenziRevealed).toBe(false);
    expect(s.stories.map((x) => x.id)).toContain("chuQingan");
    expect(s.hand).toHaveLength(3);
    expect(s.relation).toBeNull();
  });

  it("carry-over values are used and capped at the 常在 cap", () => {
    const s = newStage2(1, { qingyu: 3, shengchong: 12 });
    expect(s.qingyu).toBe(3);
    expect(s.shengchong).toBe(10);
  });

  it("初请安 sets the starting hate; 陵容侍寝被退回 sets relation and shuffles 3 陵容 in", () => {
    let s = newStage2(2, null);
    s = act(s, { type: "chooseStory", storyId: "chuQingan", optionId: "chuyanDingzhuang" });
    expect(s.hate).toBe(3);
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

  it("欢宜香专宠 blocks 召幸 until resolved; unresolved voids it", () => {
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

  it("一丈红: two of the set in one turn resolve it; 收拢人心 among them gives 滥用私刑", () => {
    let s = newStage2(9, null);
    s.stories = [];
    s.extraPlays = 1;
    onlyEvents(s, { huafei: ["yizhangHong"] });
    const [a, b] = setHand(s, ["shoulongRenxin", "jinyanShenxing"]);
    s = act(s, { type: "playCard", cardUid: a! });
    expect(s.huafei[0]!.resolved).toBe(false);
    s = act(s, { type: "playCard", cardUid: b! });
    expect(s.huafei[0]!.resolved).toBe(true);
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

  it("圆明园 card response: 必定有孕; 贵人 → 嫔, 恨意 +5, relation -2", () => {
    let s = newStage2(12, null);
    s.rank = "guiren";
    s.relation = 3;
    s.hate = 0;
    openStory(s, "yuanmingyuan");
    onlyEvents(s, {});
    const [y] = setHand(s, ["yirongZhengsu"]);
    s = act(s, { type: "playCard", cardUid: y! });
    expect(s.pregnant).toBe(true);
    expect(s.rank).toBe("pin");
    expect(s.hate).toBe(5);
    expect(s.relation).toBe(1);
    expect(s.turnRank).toBe("changzai"); // plays follow the turn-start rank until next turn
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
    s = act(s, { type: "chooseStory", storyId: "huafeiFanan", optionId: "qiuHuanghou" });
    expect(s.hate).toBe(6);
  });

  it("贵人考验 needs 侍寝 during the trial", () => {
    let s = advanceTo(newStage2(19, null), 9);
    expect(s.trial.active).toBe(true);
    s.trial.summoned = false;
    s.qingyu = 8;
    s.shengchong = 8;
    s.stories = [];
    onlyEvents(s, {});
    s = act(s, { type: "endTurn" });
    expect(s.rank).toBe("changzai");
    s.trial.summoned = true;
    s.stories = [];
    onlyEvents(s, {});
    s = act(s, { type: "endTurn" });
    expect(s.rank).toBe("guiren");
  });

  it("第 30 回合末按罪证结算：≤ 2 失败，3–4 险胜，≥ 5 完胜", () => {
    const base = newStage2(20, null);
    const at30 = (n: number) => {
      const s = structuredClone(base);
      s.turn = 30;
      s.rank = "guiren";
      s.stories = [];
      onlyEvents(s, {});
      s.evidence = (["yuyingerYiyan", "liuweiqingYaofang", "fuziZhisi", "maiguanYujue", "kekouZhangce"] as const).slice(0, n);
      return reduce2(s, { type: "endTurn" });
    };
    expect(at30(2).outcome).toBe("lost");
    expect(at30(3).victory).toBe("narrow");
    expect(at30(5).victory).toBe("full");
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

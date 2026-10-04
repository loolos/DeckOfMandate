import { describe, expect, it } from "vitest";
import type { CardId, StatusId } from "../data/content";
import { CARDS, EVENTS, STATUSES, STORIES } from "../data/content";
import {
  drawCountForTurn,
  newGame,
  playLimit,
  reduce,
  replay,
  type ZhAction,
  type ZhState,
} from "./engine";
import { decodeRunCode, encodeRunCode } from "./persistence";

function uidOf(s: ZhState, id: CardId): string {
  const c = s.hand.find((x) => x.id === id);
  if (!c) throw new Error(`no ${id} in hand`);
  return c.uid;
}

/** Puts a card of `id` into hand (taken from wherever it is). */
function giveCard(s: ZhState, id: CardId): string {
  for (const pile of [s.drawPile, s.discard]) {
    const i = pile.findIndex((c) => c.id === id);
    if (i >= 0) {
      const [c] = pile.splice(i, 1);
      s.hand.push(c!);
      return c!.uid;
    }
  }
  return uidOf(s, id);
}

function withStatus(s: ZhState, id: StatusId, appliesFromTurn = s.turn): void {
  s.statuses.push({ uid: `s${s.nextUid++}`, id, appliesFromTurn, remaining: 3 });
}

function act(s: ZhState, a: ZhAction): ZhState {
  const next = reduce(s, a);
  expect(next).not.toBe(s);
  return next;
}

function totalCards(s: ZhState): number {
  return s.drawPile.length + s.hand.length + s.discard.length;
}

describe("zhenhuan engine", () => {
  it("every card that can resolve an event has its resolution story text", () => {
    for (const card of Object.values(CARDS)) {
      for (const eventId of card.matches) {
        expect(EVENTS[eventId].resolvedStory[card.id], `${eventId} × ${card.id}`).toBeTruthy();
      }
    }
  });

  it("logs the resolution story text of each event a card resolves", () => {
    let s = newGame(1);
    s = act(s, { type: "playCard", cardUid: uidOf(s, "yirongZhengsu") });
    const texts = s.log.map((l) => l.text);
    expect(texts).toContain(EVENTS.huanghouShangshi.resolvedStory.yirongZhengsu);
    expect(texts).toContain(EVENTS.liyiShiwu.resolvedStory.yirongZhengsu);
  });

  it("starts with the fixed opening", () => {
    const s = newGame(42);
    expect(s.turn).toBe(1);
    expect(s.qingyu).toBe(2);
    expect(s.shengchong).toBe(2);
    expect(s.hand.map((c) => c.id)).toEqual(["shoulongRenxin", "yirongZhengsu", "jingguanQibian"]);
    expect(s.opportunity?.id).toBe("huanghouShangshi");
    expect(s.crisis?.id).toBe("liyiShiwu");
    expect(s.drawPile).toHaveLength(9);
    expect(s.opportunityPool).toHaveLength(5);
    expect(s.crisisPool).toHaveLength(5);
    expect(playLimit(s)).toBe(1);
  });

  it("one card resolves both matching events for one play", () => {
    let s = newGame(1);
    s = act(s, { type: "playCard", cardUid: uidOf(s, "yirongZhengsu") });
    expect(s.shengchong).toBe(4); // 2 + base 1 + 皇后赏识 1
    expect(s.opportunity?.resolved).toBe(true);
    expect(s.crisis?.resolved).toBe(true);
    expect(s.playsUsed).toBe(1);
    expect(s.opportunity?.resolvedBy).toBe("yirongZhengsu");
    expect(s.crisis?.resolvedBy).toBe("yirongZhengsu");
    expect(s.opportunity?.rewardDoubled).toBeUndefined();
    // no plays left
    expect(reduce(s, { type: "playCard", cardUid: uidOf(s, "shoulongRenxin") })).toBe(s);
    s = act(s, { type: "endTurn" });
    expect(s.qingyu).toBe(2); // 礼仪失误 resolved → no penalty
    expect(s.turn).toBe(2);
    expect(totalCards(s)).toBe(12);
  });

  it("unresolved crisis applies its penalty and can defeat immediately", () => {
    let s = newGame(1);
    s = act(s, { type: "endTurn" });
    expect(s.qingyu).toBe(1);
    expect(s.shengchong).toBe(1);
    const t = structuredClone(s);
    t.crisis = { uid: "x", id: "liyiShiwu", resolved: false };
    t.opportunity = null;
    const after = act(t, { type: "endTurn" });
    expect(after.outcome).toBe("lost");
    expect(after.qingyu).toBe(0);
    expect(after.shengchong).toBe(1); // stopped after the first effect hit 0
  });

  it("gains are capped by rank", () => {
    let s = newGame(1);
    s.shengchong = 7;
    s = act(s, { type: "playCard", cardUid: uidOf(s, "yirongZhengsu") });
    expect(s.shengchong).toBe(8);
  });

  it("静观其变 draws, adds a play, and stacks", () => {
    let s = newGame(3);
    const second = giveCard(s, "jingguanQibian");
    const handBefore = s.hand.length;
    s = act(s, { type: "playCard", cardUid: uidOf(s, "jingguanQibian") });
    expect(s.hand.length).toBe(handBefore + 1); // -1 played +2 drawn
    expect(playLimit(s)).toBe(2);
    s = act(s, { type: "playCard", cardUid: second });
    expect(playLimit(s)).toBe(3);
    expect(s.playsUsed).toBe(2);
  });

  it("流言缠身 applies from next turn for 3 turns, stacks, and draw stays ≥ 1", () => {
    let s = newGame(5);
    s = act(s, { type: "playCard", cardUid: uidOf(s, "yirongZhengsu") });
    s.crisis = { uid: "x", id: "gongzhongLiuyan", resolved: false };
    s = act(s, { type: "endTurn" });
    expect(s.statuses).toHaveLength(1);
    expect(s.drawnThisTurn).toBe(2); // turn 2: 3 - 1
    withStatus(s, "liuyanChanshen", 3);
    withStatus(s, "liuyanChanshen", 3);
    expect(drawCountForTurn(s, 3)).toBe(1); // 3 - 3 → clamped to 1
    // first instance: turns 2,3,4 then gone
    s.statuses = s.statuses.slice(0, 1);
    for (let i = 0; i < 3 && s.outcome === "playing"; i++) {
      s.qingyu = 6;
      s.shengchong = 6;
      if (s.crisis) s.crisis.resolved = true;
      if (s.envy) s.envy.resolved = true;
      s = act(s, { type: "endTurn" });
    }
    expect(s.turn).toBe(5);
    expect(s.statuses).toHaveLength(0);
  });

  it("温太医相助: no status → no extra; one → auto remove; many → pick or cancel", () => {
    let s = newGame(7);
    let uid = giveCard(s, "wenTaiyiZhenzhi");
    s = act(s, { type: "playCard", cardUid: uid });
    expect(s.qingyu).toBe(2); // no 清誉 / 圣宠 effect of its own
    expect(s.shengchong).toBe(2);
    expect(s.pending).toBeNull();

    s = newGame(7);
    withStatus(s, "liuyanChanshen");
    withStatus(s, "gongrenChuifeng");
    uid = giveCard(s, "wenTaiyiZhenzhi");
    s = act(s, { type: "playCard", cardUid: uid });
    expect(s.statuses.map((x) => x.id)).toEqual(["gongrenChuifeng"]);

    s = newGame(7);
    withStatus(s, "liuyanChanshen");
    withStatus(s, "liuyanChanshen");
    uid = giveCard(s, "wenTaiyiZhenzhi");
    s = act(s, { type: "playCard", cardUid: uid });
    expect(s.pending).not.toBeNull();
    expect(s.qingyu).toBe(2); // nothing resolved yet
    expect(reduce(s, { type: "endTurn" })).toBe(s);
    s = act(s, { type: "cancelPending" });
    expect(s.playsUsed).toBe(0);
    expect(s.hand.some((c) => c.uid === uid)).toBe(true);
    s = act(s, { type: "playCard", cardUid: uid });
    const target = s.statuses[1]!.uid;
    s = act(s, { type: "removeStatus", statusUid: target });
    expect(s.statuses.map((x) => x.uid)).not.toContain(target);
    expect(s.statuses).toHaveLength(1);
    expect(s.qingyu).toBe(2);
  });

  it("恩赏结心 draws when it resolves 内务府刁难; 眉庄相助 doubles opportunity rewards", () => {
    let s = newGame(9);
    s.crisis = { uid: "x", id: "neiwufuDiaonan", resolved: false };
    const handBefore = s.hand.length;
    s = act(s, { type: "playCard", cardUid: uidOf(s, "shoulongRenxin") });
    expect(s.hand.length).toBe(handBefore); // -1 played +1 linkage draw
    expect(s.crisis?.resolved).toBe(true);

    s = newGame(9);
    s.opportunity = { uid: "y", id: "taihouChuixun", resolved: false };
    const mz = giveCard(s, "meizhuangXiangzhu");
    s = act(s, { type: "playCard", cardUid: mz });
    expect(s.qingyu).toBe(5); // 2 + 1 base + 1 reward + 1 doubled
    expect(s.opportunity?.resolvedBy).toBe("meizhuangXiangzhu");
    expect(s.opportunity?.rewardDoubled).toBe(true);
    expect(s.shengchong).toBe(2); // 眉庄相助 base is 清誉 only;
  });

  function advanceTo(s: ZhState, turn: number): ZhState {
    while (s.turn < turn) {
      s.qingyu = 6;
      s.shengchong = 6;
      if (s.crisis) s.crisis.resolved = true;
      if (s.envy) s.envy.resolved = true;
      s = act(s, { type: "endTurn" });
    }
    return s;
  }

  /** Ends the turn with every event handled and 圣宠 set for the next turn-start check. */
  function endTurnWith(s: ZhState, shengchong: number): ZhState {
    s.qingyu = 6;
    s.shengchong = shengchong;
    s.story = null;
    if (s.crisis) s.crisis.resolved = true;
    if (s.envy) s.envy.resolved = true;
    return act(s, { type: "endTurn" });
  }

  it("嫉妒事件: never before turn 6; then first turn at 圣宠 ≥ 5 triggers, every other turn after; dropping below resets", () => {
    let s = newGame(21);
    const fired: number[] = [];
    const plan = [5, 5, 5, 5, 5, 5, 4, 5, 6, 3, 5];
    for (const sc of plan) {
      s = endTurnWith(s, sc);
      if (s.envy) fired.push(s.turn);
    }
    // turns 2..12 start with 圣宠 5,5,5,5,5,5,4,5,6,3,5
    expect(fired).toEqual([6, 9, 12]);
    expect(s.envyPool.length + s.envyUsed.length + (s.envy ? 1 : 0)).toBe(3);
  });

  it("嫉妒事件: matching cards resolve them; unresolved ones apply their penalty", () => {
    let s = newGame(23);
    s.envy = { uid: "e", id: "yuDayingZhengchong", resolved: false };
    s = act(s, { type: "playCard", cardUid: uidOf(s, "shoulongRenxin") });
    expect(s.envy?.resolved).toBe(true);
    expect(s.envy?.resolvedBy).toBe("shoulongRenxin");

    s = newGame(23);
    s.crisis!.resolved = true;
    s.qingyu = 5;
    s.envy = { uid: "e", id: "shichongErjiao", resolved: false };
    s = act(s, { type: "endTurn" });
    expect(s.qingyu).toBe(3);
    expect(s.envyUsed).toContain("shichongErjiao");
  });

  it("暗中下绊 → 抱恙在身 blocks 仪容整肃 / 谨言慎行 from next turn; 温太医相助 removes it", () => {
    let s = newGame(25);
    s.crisis!.resolved = true;
    s.envy = { uid: "e", id: "anzhongXiaban", resolved: false };
    s = act(s, { type: "endTurn" });
    expect(s.statuses.map((x) => x.id)).toEqual(["baoyangZaishen"]);

    const blocked = giveCard(s, "yirongZhengsu");
    const blocked2 = giveCard(s, "jinyanShenxing");
    expect(reduce(s, { type: "playCard", cardUid: blocked })).toBe(s);
    expect(reduce(s, { type: "playCard", cardUid: blocked2 })).toBe(s);
    s.extraPlays = 1;
    s = act(s, { type: "playCard", cardUid: giveCard(s, "wenTaiyiZhenzhi") });
    expect(s.statuses).toHaveLength(0);
    s = act(s, { type: "playCard", cardUid: blocked });

    // 眉庄相助 resolves 暗中下绊 so no status is gained
    s = newGame(25);
    s.envy = { uid: "e", id: "anzhongXiaban", resolved: false };
    s = act(s, { type: "playCard", cardUid: giveCard(s, "meizhuangXiangzhu") });
    expect(s.envy?.resolved).toBe(true);
  });

  it("story events: playing a listed card from hand resolves the story and matching events", () => {
    let s = advanceTo(newGame(11), 8);
    expect(s.story?.id).toBe("xinghuaWeiyu");
    s.qingyu = 3;
    s.shengchong = 3;
    s.opportunity = null;
    s.envy = null;
    s.crisis = { uid: "c", id: "gongzhongLiuyan", resolved: false };
    s = act(s, { type: "playCard", cardUid: giveCard(s, "jinyanShenxing") });
    expect(s.story?.chosenOptionId).toBe("yishiXianghe");
    expect(s.crisis?.resolved).toBe(true);
    expect(s.shengchong).toBe(4); // 以诗相和 圣宠 +1
    expect(s.qingyu).toBe(5); // 清誉 +1 (story) + 1 (谨言慎行 base, still applies)
    expect(s.playsUsed).toBe(1);
    expect(s.log.some((l) => l.text.includes("倚梅园念“逆风如解意”的人"))).toBe(true);
  });

  it("杏花微雨: 静观其变 adds 清誉 +2 and still draws 2 and grants an extra play", () => {
    let s = advanceTo(newGame(11), 8);
    s.qingyu = 3;
    const limit = playLimit(s);
    const handBefore = s.hand.length;
    s = act(s, { type: "playCard", cardUid: giveCard(s, "jingguanQibian") });
    expect(s.story?.chosenOptionId).toBe("kanpoBushuopo");
    expect(s.qingyu).toBe(5);
    expect(s.hand.length).toBe(handBefore + 2);
    expect(playLimit(s)).toBe(limit + 1);
  });

  it("story events: card responses cannot be chosen on the event; basic options can", () => {
    const s = advanceTo(newGame(11), 8);
    s.opportunity = null;
    s.crisis = null;
    s.envy = null;
    s.qingyu = 3;
    giveCard(s, "jinyanShenxing");
    expect(reduce(s, { type: "chooseStory", optionId: "yishiXianghe" })).toBe(s);
    const t = act(s, { type: "chooseStory", optionId: "yuWangyeChangtan" });
    expect(t.playsUsed).toBe(0);
    // once chosen, a matching card falls back to its base effect
    const before = t.qingyu;
    const u = act(t, { type: "playCard", cardUid: t.hand.find((c) => c.id === "jinyanShenxing")!.uid });
    expect(u.story?.chosenOptionId).toBe("yuWangyeChangtan");
    expect(u.qingyu).toBe(Math.min(8, before + 1));
    expect(u.log.some((l) => l.text.includes("倚梅园念“逆风如解意”的人"))).toBe(false);
  });

  it("story events: every option has its own log text, and no-card options cost something", () => {
    for (const story of Object.values(STORIES)) {
      const texts = story.options.map((o) => o.story);
      expect(new Set(texts).size).toBe(texts.length);
      for (const o of story.options) {
        expect(o.story.length).toBeGreaterThan(0);
        if (!o.card) expect(o.effects.some((d) => d.amount < 0)).toBe(true);
      }
    }
  });

  it("story events: a chosen basic option writes its story text to the log", () => {
    const s = advanceTo(newGame(11), 4);
    const t = act(s, { type: "chooseStory", optionId: "dangzhongShuopo" });
    const story = STORIES.yimeiYuan.options.find((o) => o.id === "dangzhongShuopo")!.story;
    expect(t.log.some((l) => l.text === story)).toBe(true);
  });

  it("tag explanations go to the log without being recorded", () => {
    const s = newGame(3);
    const t = act(s, { type: "explainTag", tag: "crisis" });
    expect(t.log.length).toBe(s.log.length + 2);
    expect(t.actions).toHaveLength(0);
  });

  it("story events: default option when nothing chosen", () => {
    let t = advanceTo(newGame(11), 4);
    t.qingyu = 3;
    t.shengchong = 3;
    if (t.crisis) t.crisis.resolved = true;
    if (t.envy) t.envy.resolved = true;
    t = act(t, { type: "endTurn" });
    expect(t.log.some((l) => l.text.includes("默认选项【隐忍不言】"))).toBe(true);
    expect(t.log.some((l) => l.text.includes("那句诗成了别人的恩典"))).toBe(true);
    expect(t.qingyu).toBe(3);
    expect(t.shengchong).toBe(2); // no-card options carry a small cost
  });

  it("恩赏结心: base effect is 耳目灵通 (draw +1 for the next 2 turns), not 圣宠", () => {
    let s = newGame(5);
    const before = s.shengchong;
    s = act(s, { type: "playCard", cardUid: uidOf(s, "shoulongRenxin") });
    expect(s.shengchong).toBe(before);
    expect(s.statuses.map((x) => x.id)).toEqual(["ermuLingtong"]);
    s = advanceTo(s, 2);
    expect(s.drawnThisTurn).toBe(4);
    s = advanceTo(s, 4);
    expect(s.statuses.some((x) => x.id === "ermuLingtong")).toBe(false);
  });

  it("倚梅园: 恩赏结心 grants 宫人吹风 (圣宠 +1 for 2 turns) on top of its own 耳目灵通", () => {
    let s = advanceTo(newGame(13), 4);
    expect(s.story?.id).toBe("yimeiYuan");
    s = act(s, { type: "playCard", cardUid: giveCard(s, "shoulongRenxin") });
    expect(s.statuses.map((x) => x.id)).toEqual(["gongrenChuifeng", "ermuLingtong"]);
    s = advanceTo(s, 5);
    expect(s.drawnThisTurn).toBe(4); // 耳目灵通 only
    expect(s.shengchong).toBe(7); // advanceTo leaves 6, then 宫人吹风 +1
    s = advanceTo(s, 6);
    expect(s.log.filter((l) => l.turn === 6).some((l) => l.text.startsWith("宫人吹风：圣宠 +1"))).toBe(true);
    s = advanceTo(s, 7);
    expect(s.statuses.some((x) => x.id === "gongrenChuifeng")).toBe(false);
    expect(s.log.map((l) => l.text)).toContain(STATUSES.gongrenChuifeng.endStory);
    expect(s.log.filter((l) => l.turn === 7).some((l) => l.text.startsWith("宫人吹风"))).toBe(false);
  });

  it("promotion trial is judged at end of turn; game continues to turn 15", () => {
    let s = advanceTo(newGame(17), 10);
    expect(s.trial.active).toBe(true);
    s.qingyu = 5;
    s.shengchong = 5;
    if (s.crisis) s.crisis.resolved = true;
    if (s.envy) s.envy.resolved = true;
    s.opportunity = { uid: "o", id: "huanghouShangshi", resolved: false };
    s = act(s, { type: "playCard", cardUid: giveCard(s, "jinyanShenxing") });
    expect(s.trial.keyCardPlayed).toBe(true);
    expect(s.rank).toBe("daying"); // not before end of turn
    s = act(s, { type: "endTurn" });
    expect(s.promoted).toBe(true);
    expect(s.rank).toBe("changzai");
    expect(s.outcome).toBe("playing");
    expect(playLimit(s)).toBe(2);
    s = advanceTo(s, 15);
    if (s.crisis) s.crisis.resolved = true;
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("won");
  });

  it("谨言慎行 during the 晋封考验 counts for the trial and still resolves 恃宠而骄 (only that envy event)", () => {
    for (const [envyId, resolved] of [
      ["shichongErjiao", true],
      ["yuDayingZhengchong", false],
      ["anzhongXiaban", false],
    ] as const) {
      let s = advanceTo(newGame(17), 10);
      expect(s.trial.active).toBe(true);
      s.trial.keyCardPlayed = false;
      s.envy = { uid: "e", id: envyId, resolved: false };
      s = act(s, { type: "playCard", cardUid: giveCard(s, "jinyanShenxing") });
      expect(s.trial.keyCardPlayed).toBe(true);
      expect(s.envy?.resolved).toBe(resolved);
    }
  });

  it("温太医相助 resolves 礼仪失误 (and still removes a negative status)", () => {
    let s = newGame(9);
    expect(s.crisis?.id).toBe("liyiShiwu");
    s.statuses.push({ uid: "neg", id: "liuyanChanshen", appliesFromTurn: 1, remaining: 2 });
    s = act(s, { type: "playCard", cardUid: giveCard(s, "wenTaiyiZhenzhi") });
    expect(s.crisis?.resolved).toBe(true);
    expect(s.crisis?.resolvedBy).toBe("wenTaiyiZhenzhi");
    expect(s.statuses).toHaveLength(0);
  });

  it("failing the trial by end of turn 12 loses", () => {
    let s = advanceTo(newGame(19), 12);
    if (s.crisis) s.crisis.resolved = true;
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("lost");
    expect(s.lossReason).toContain("晋封考验");
  });

  it("random playthroughs keep invariants and replay from run codes", () => {
    for (let seed = 1; seed <= 60; seed++) {
      let s = newGame(seed);
      let guard = 0;
      while (s.outcome === "playing" && guard++ < 200) {
        const story = s.story && s.story.chosenOptionId == null;
        let next: ZhState = s;
        if (s.pending) {
          const neg = s.statuses.find((x) => STATUSES[x.id].tag === "negative")!;
          next = reduce(s, { type: "removeStatus", statusUid: neg.uid });
        } else if (story && seed % 2 === 0) {
          next = reduce(s, { type: "chooseStory", optionId: seed % 4 === 0 ? "yinrenBuyan" : "bixianGaotui" });
          if (next === s) next = reduce(s, { type: "chooseStory", optionId: "bixianGaotui" });
          if (next === s) next = reduce(s, { type: "chooseStory", optionId: "yinrenBuyan" });
        } else if (s.hand.length > 0 && s.playsUsed < playLimit(s)) {
          next = reduce(s, { type: "playCard", cardUid: s.hand[(seed + s.turn) % s.hand.length]!.uid });
        }
        if (next === s) next = reduce(s, { type: "endTurn" });
        expect(next).not.toBe(s);
        s = next;
        expect(totalCards(s)).toBe(12);
        expect(s.opportunityPool.length + s.opportunityUsed.length + (s.opportunity ? 1 : 0)).toBe(6);
        expect(s.crisisPool.length + s.crisisUsed.length + (s.crisis ? 1 : 0)).toBe(6);
        expect(s.envyPool.length + s.envyUsed.length + (s.envy ? 1 : 0)).toBe(3);
        expect(s.qingyu).toBeLessThanOrEqual(10);
        expect(s.shengchong).toBeLessThanOrEqual(10);
      }
      expect(s.outcome).not.toBe("playing");
      const decoded = decodeRunCode(encodeRunCode(s));
      expect(decoded.ok).toBe(true);
      if (decoded.ok) expect(decoded.state).toEqual(s);
      expect(replay(seed, s.actions)).toEqual(s);
    }
  });

  it("rejects foreign or corrupted run codes", () => {
    expect(decodeRunCode("abc").ok).toBe(false);
    expect(decodeRunCode("ZH1-!!!").ok).toBe(false);
  });
});

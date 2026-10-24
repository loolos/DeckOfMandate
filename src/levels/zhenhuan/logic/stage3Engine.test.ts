import { describe, expect, it } from "vitest";
import {
  CARDS3,
  CONFRONT,
  EVENTS3,
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
  feilaoBaseTier,
  feilaoCurrentTier,
  matchedEvents3,
  newStage3,
  pairLocked,
  presentedSecrets,
  reduce3,
  replay3,
  storyBasicOptions3,
  xiayuCost,
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
      const pairShared = def.pair ? PAIRS[def.pair].shared : null;
      for (const c of cards) if (c !== "lingrongXiangzhu" && c !== pairShared) expect(def.resolvedStory[c], `${id} / ${c}`).toBeTruthy();
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
    expect([0, 1, 3, 4, 8, 9, 13, 14, 20].map(confrontNeeded)).toEqual([0, 1, 1, 2, 2, 2, 2, 3, 3]);
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
  it("standalone start: 嫔, not pregnant, 10/10, 身子 2, three carried 把柄, opening popup", () => {
    const s = newStage3(11, null);
    expect(s.turn).toBe(1);
    expect(s.rank).toBe("pin");
    expect(s.pregnant).toBe(false);
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

  it("海棠春睡 (turn 3) makes a 未孕 player pregnant whatever is chosen", () => {
    let s = advanceTo(newStage3(8, null), 3);
    expect(s.stories.map((x) => x.id)).toContain(FIXED_STORIES3[3]);
    s = act(s, { type: "endTurn" });
    expect(s.pregnant).toBe(true);
  });

  it("连环: the opportunity half is locked until its crisis is cleared; the shared card does both and 打压", () => {
    const s = newStage3(2, CARRY);
    clearBoard(s);
    s.crisis = ev(s, "yuhuayuanQi");
    s.opportunity = ev(s, "yuhuayuanXin");
    expect(pairLocked(s, s.opportunity)).toBe(true);
    const [uid] = setHand(s, ["jinyanShenxing"]);
    expect(matchedEvents3(s, "jinyanShenxing").map((e) => e.id).sort()).toEqual(["yuhuayuanQi", "yuhuayuanXin"]);
    const t = act(s, { type: "playCard", cardUid: uid! });
    expect(t.crisis!.resolved && t.opportunity!.resolved).toBe(true);
    expect(t.suppressed.qifei).toBe(true);
    expect(t.allies.xin).toBe(true);
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

  it("移花接木: 引驾 → 偶遇 (圣宠 restored) → 改脉 brings 疑点 to 0; perfect needs all relics burned and 对食", () => {
    let s = advanceTo(newStage3(13, CARRY), 26);
    s.exitShengchong = 9;
    s.extraPlays = 9;
    clearBoard(s);
    s.discard.push(...s.drawPile);
    s.drawPile = [];
    const relicUids = ["yiwuGengtie", "yiwuDi", "yiwuPifeng"].map((id) => {
      s.discard.push({ uid: `r-${id}`, id: id as CardId3 });
      return `r-${id}`;
    });
    s.discard = s.discard.filter((c) => !c.id.startsWith("yiwu") || relicUids.includes(c.uid));
    s.yihua!.doubt = 2;
    const [jinxi, chanyu, wen] = setHand(s, ["jinxiXiangzhu", "chanyuXiushen", "wenTaiyiZhenzhi"]);
    s = act(s, { type: "playCard", cardUid: jinxi! });
    expect(s.yihua!.step).toBe(2);
    expect(s.yihua!.duishi).toBe(true);
    s = act(s, { type: "playCard", cardUid: chanyu! });
    expect(s.yihua!.step).toBe(3);
    expect(s.shengchong).toBe(9);
    s = act(s, { type: "playCard", cardUid: wen! });
    expect(s.yihua!.doubt).toBe(1);
    // relics: burn them all (pending → choice)
    for (const uid of relicUids) {
      takeToHand(s, uid);
      s = act(s, { type: "playCard", cardUid: uid });
      expect(s.pending?.kind).toBe("relic");
      s = act(s, { type: "relicChoice", choice: "burn" });
    }
    expect(s.relicsBurned).toBe(3);
    expect(s.yihua!.step).toBe(4);
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("won");
    expect(s.victory).toBe("perfect");
  });

  it("疑点 rises each turn before 偶遇; at 5 the run is lost", () => {
    let s = advanceTo(newStage3(14, CARRY), 26);
    s.yihua!.doubt = 4;
    clearBoard(s);
    s = act(s, { type: "endTurn" });
    expect(s.outcome).toBe("lost");
    expect(s.lossKind).toBe("doubt");
  });

  it("a hidden relic in hand at 偶遇 raises 疑点 (睹物生疑)", () => {
    let s = advanceTo(newStage3(15, CARRY), 26);
    s.extraPlays = 5;
    clearBoard(s);
    const [, chanyu] = setHand(s, ["yiwuPifeng", "chanyuXiushen"]);
    s.yihua!.step = 2;
    const before = s.yihua!.doubt;
    s = act(s, { type: "playCard", cardUid: chanyu! });
    expect(s.yihua!.dushu).toBe(true);
    expect(s.yihua!.doubt).toBe(before + 1);
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
          s = reduce3(s, s.pending.kind === "relic" ? { type: "relicChoice", choice: i % 3 ? "burn" : "hide" } : { type: "cancelPending" });
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

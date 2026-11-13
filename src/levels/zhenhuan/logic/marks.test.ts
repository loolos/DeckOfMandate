import { describe, expect, it } from "vitest";
import { newGame } from "./engine";
import { continueToStage2, decodeSessionCode, encodeSessionCode } from "./session";
import { newStage2, reduce2, storyBasicOptions2, storyCardResponses2, storyPreface2, type Carry, type Z2State } from "./stage2Engine";
import { STORIES2 } from "../data/stage2Content";

const carry = (yimei: Carry["yimei"], xinghua: Carry["xinghua"]): Carry => ({ qingyu: 8, shengchong: 8, yimei, xinghua });

function atStory(c: Carry | null, id: "chuQingan" | "yuyingerShishi", turn: number): Z2State {
  const s = newStage2(2, c);
  s.turn = turn;
  s.stories = [{ id, chosenOptionId: null }];
  s.opportunity = null;
  s.crisis = null;
  s.huafei = [];
  return s;
}

describe("第一关旧事印记 → 第二关", () => {
  it("continueToStage2 carries the two 第一关 choices", () => {
    const s1 = newGame(7);
    s1.outcome = "won";
    s1.storyChoices = { yimeiYuan: "jiemeiChafang", xinghuaWeiyu: "kanpoBushuopo" };
    const st = continueToStage2(s1, 9).state;
    expect(st.carry).toMatchObject({ yimei: "jiemeiChafang", xinghua: "kanpoBushuopo" });
    expect(st.log.some((l) => l.text.includes("旧事未了"))).toBe(true);
  });

  it("marks round-trip through the run code; old codes without marks still read", () => {
    const s1 = newGame(7);
    s1.outcome = "won";
    s1.storyChoices = { yimeiYuan: "gongrenToudi" };
    const session = continueToStage2(s1, 9);
    const r = decodeSessionCode(encodeSessionCode(session));
    expect(r.ok && r.session.stage === 2 && r.session.state.carry).toMatchObject({ yimei: "gongrenToudi", xinghua: null });
    const plain = newGame(7);
    plain.outcome = "won";
    const old = decodeSessionCode(encodeSessionCode(continueToStage2(plain, 9)));
    expect(old.ok && old.session.stage === 2 && old.session.state.carry).toEqual({ qingyu: plain.qingyu, shengchong: plain.shengchong });
  });

  it("初谒翊坤: 恨意初值随旧事增减，与王爷畅谈另扣清誉", () => {
    const hate = (c: Carry | null) => reduce2(atStory(c, "chuQingan", 3), { type: "chooseStory", storyId: "chuQingan", optionId: "bubeiBukang" });
    expect(hate(null).hate).toBe(2);
    expect(hate(carry("dangzhongShuopo", null)).hate).toBe(3);
    expect(hate(carry("yinrenBuyan", "bixianGaotui")).hate).toBe(2); // 没有后续影响的分支：与无印记完全一样
    const t = hate(carry(null, "yuWangyeChangtan"));
    expect(t.hate).toBe(3);
    expect(t.qingyu).toBe(7);
  });

  it("莺儿伏罪: 印记解锁额外选项，没有印记时不出现", () => {
    const plain = atStory(null, "yuyingerShishi", 4);
    const def = STORIES2.yuyingerShishi;
    expect(storyBasicOptions2(def, plain).some((o) => o.id === "tuoJiushi")).toBe(false);
    expect(storyCardResponses2(def, plain).some((o) => o.id === "jiuriPozhan")).toBe(false);
    const g = atStory(carry("gongrenToudi", null), "yuyingerShishi", 4);
    expect(storyBasicOptions2(def, g).some((o) => o.id === "tuoJiushi")).toBe(true);
    const after = reduce2(g, { type: "chooseStory", storyId: "yuyingerShishi", optionId: "tuoJiushi" });
    expect(after.evidence).toContain("yuyingerYiyan");
    expect(after.qingyu).toBe(7);
    expect(storyCardResponses2(def, atStory(carry("jiemeiChafang", null), "yuyingerShishi", 4)).some((o) => o.id === "jiuriPozhan")).toBe(true);
  });

  it("每个有后果的旧事都有前置剧情文本", () => {
    expect(storyPreface2(atStory(carry("dangzhongShuopo", "yuWangyeChangtan"), "chuQingan", 3), "chuQingan")?.lines).toHaveLength(2);
    expect(storyPreface2(atStory(carry("jiemeiChafang", null), "yuyingerShishi", 4), "yuyingerShishi")?.notes).toHaveLength(1);
    expect(storyPreface2(atStory(null, "chuQingan", 3), "chuQingan")).toBeNull();
    expect(storyPreface2(atStory(carry("yinrenBuyan", "bixianGaotui"), "chuQingan", 3), "chuQingan")).toBeNull();
    expect(storyPreface2(atStory(carry("yinrenBuyan", "bixianGaotui"), "yuyingerShishi", 4), "yuyingerShishi")).toBeNull();
  });
});

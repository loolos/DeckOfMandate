/**
 * 甄嬛传 · 第三关「青灯凤阙」 rules engine. Pure and deterministic like the 第一 / 第二关 engines: the same
 * seed, carry-over and action list always yield the same state. Rules: `../docs/design-stage3.md`.
 *
 * Three acts in one run: 第一幕 in the palace (turns 1–10, ending with 景仁宫对质), 第二幕 at 甘露寺 / 凌云峰
 * (11–25, 修行 identity and the temple deck), 第三幕 移花接木 (26–33).
 *
 * This file holds the public entry points (newStage3 / reduce3 / replay3) and re-exports the rest.
 * The engine itself lives in `./stage3/`: `state` (types), `queries` (pure reads), `mutations`
 * (resources, statuses, pools, pregnancy, allies), `resolution` (playing cards, story options),
 * `turnFlow` (turn start / end, act changes) and `ending` (对质 / ending text).
 */
import { createRngFromSeed, shuffle } from "../../../logic/rng";
import {
  ACT1_CRISES,
  ACT1_OPPORTUNITIES,
  type CrisisId3,
  type OpportunityId3,
  RANKS,
  RELIC_DOUBT_RULE,
  type RankId,
  SHENZI,
  STAGE2_SECRETS,
  STAGE3,
  STAGE3_ACT1_DECK,
  STORIES3,
  type Stage2SecretId,
  TAG3_INFO,
} from "../data/stage3Content";
import { alive, log, shuffleInto } from "./engineCommon";
import { addPinEvent, changeRelation, popup } from "./stage3/mutations";
import { canEndTurn3, canPlayCard3, removableNegatives3, storyBasicOptions3 } from "./stage3/queries";
import { applyStoryOption, resolvePlay3 } from "./stage3/resolution";
import type { CardInst3, Carry3, Z3Action, Z3State } from "./stage3/state";
import { beginTurn3, endTurn3 } from "./stage3/turnFlow";

export type {
  CardInst3,
  EventInst3,
  StoryInst3,
  StatusInst3,
  LogEntry,
  LogTone,
  Notice3,
  Carry3,
  Z3Action,
  Z3Outcome,
  Yihua,
  Z3State,
} from "./stage3/state";
export {
  actOf,
  rankCap3,
  rankName3,
  hasStatus3,
  playLimit3,
  playsLeft3,
  drawModifier3,
  drawCount3,
  isSpentStatus3,
  removableNegatives3,
  blockingStatusName3,
  summonUnwell3,
  tierOf3,
  relicsKept,
  isRelic,
  storyBasicOptions3,
  storyCardResponses3,
  openStories3,
  storyResponsesFor3,
  boardEvents3,
  pairLocked,
  solveCount,
  lizigaoOpen,
  cardAffectsEvent3,
  matchedEvents3,
  lianmeiLit3,
  isFreeByLianmei3,
  blockedByChezhou3,
  lingrongAbsent,
  canPlayCard3,
  canEndTurn3,
  confrontAccepts,
  feilaoAccepts,
  feilaoBaseTier,
  feilaoCurrentTier,
  chunyuanChecked,
  chunyuanAccepts,
  yihuaAccepts,
  dengmenNeeded,
  xiayuS,
  xiayuCost,
  secretsHeld,
  presentedSecrets,
  qinseReady,
} from "./stage3/queries";
export { type ConfrontLine3, confrontLines, endingStory3, endingLines3 } from "./stage3/ending";

// ---------------------------------------------------------------- public API

function randomSecrets(s: Z3State, n: number): Stage2SecretId[] {
  return shuffleInto(s, STAGE2_SECRETS).slice(0, n);
}

export function newStage3(seed: number, carry: Carry3 | null): Z3State {
  let rng = createRngFromSeed(seed);
  let nextUid = 1;
  const deck: CardInst3[] = STAGE3_ACT1_DECK.map((id) => ({ uid: `c${nextUid++}`, id }));
  let drawPile: CardInst3[];
  [rng, drawPile] = shuffle(rng, deck);
  let opportunityPool: OpportunityId3[];
  let crisisPool: CrisisId3[];
  [rng, opportunityPool] = shuffle(rng, ACT1_OPPORTUNITIES);
  [rng, crisisPool] = shuffle(rng, ACT1_CRISES);
  const rank: RankId = carry?.rank ?? STAGE3.standaloneRank;
  const cap = RANKS[rank].cap;
  const s: Z3State = {
    stage: 3,
    seed,
    carry,
    rng,
    turn: 0,
    act: 1,
    rank,
    turnRank: rank,
    qingyu: Math.min(cap, carry?.qingyu ?? STAGE3.standaloneQingyu),
    shengchong: Math.min(cap, carry?.shengchong ?? STAGE3.standaloneShengchong),
    shenzi: Math.max(1, Math.min(SHENZI.max, carry?.shenzi ?? STAGE3.standaloneShenzi)),
    relation: carry?.relation ?? 0,
    lingrongGone: false,
    drawPile,
    hand: [],
    discard: [],
    departed: [],
    opportunityPool,
    opportunityUsed: [],
    crisisPool,
    crisisUsed: [],
    huanghouPool: [],
    huanghouUsed: [],
    opportunity: null,
    crisis: null,
    huanghou: null,
    stories: [],
    notices: [],
    popups: [],
    pregnant: false,
    childBorn: false,
    summonLast: null,
    secrets: {},
    allies: { duanfei: false, jingfei: false, xin: false },
    suppressed: { qifei: false, guaerjia: false },
    lizigao: false,
    renxinPlays: 0,
    guoMeet: null,
    chunyuan: null,
    chunyuanPassed: false,
    chunyuanResult: null,
    confront: null,
    exitTier: null,
    exitShengchong: null,
    exitRank: null,
    exitTierLingrong: null,
    arrogance: 0,
    feilao: null,
    feilaoTier: null,
    atPeak: false,
    luofa: false,
    gengtie: false,
    songxing: false,
    keepsakes: [],
    changxiangsi: null,
    yihua: null,
    relicsBurned: 0,
    statuses: [],
    playsUsed: 0,
    extraPlays: 0,
    drawnThisTurn: 0,
    lianmeiSpent: [],
    playedThisTurn: [],
    pending: null,
    outcome: "playing",
    lossReason: null,
    lossKind: null,
    victory: null,
    log: [],
    actions: [],
    turnStartActionCount: 0,
    nextUid,
  };
  for (const id of carry ? carry.secrets : randomSecrets(s, STAGE3.standaloneSecrets)) s.secrets[id] = 1;
  if (carry ? carry.pregnant : STAGE3.standalonePregnant) {
    s.pregnant = true;
    s.statuses.push({ uid: `s${s.nextUid++}`, id: "shenhuaiLongyi", appliesFromTurn: 0, remaining: 0 });
    if (rank === "guiren") addPinEvent(s);
  }
  log(
    s,
    carry
      ? `承接第二关：${RANKS[rank].name}${carry.pregnant ? "，身怀龙裔" : ""}；清誉 ${s.qingyu}、圣宠 ${s.shengchong}、身子 ${s.shenzi}。`
      : `单独开始第三关：${RANKS[rank].name}${s.pregnant ? "，身怀龙裔" : "，未孕"}；清誉 ${s.qingyu}、圣宠 ${s.shengchong}、身子 ${s.shenzi}。`,
  );
  popup(s, "opening");
  beginTurn3(s, 1);
  return s;
}

export function reduce3(state: Z3State, action: Z3Action): Z3State {
  if (state.outcome !== "playing" && action.type !== "explainTag") return state;
  const s = structuredClone(state);
  switch (action.type) {
    case "playCard": {
      if (!canPlayCard3(s, action.cardUid)) return state;
      const card = s.hand.find((c) => c.uid === action.cardUid)!;
      if (card.id === "wenTaiyiZhenzhi" && removableNegatives3(s).length > 1) {
        s.pending = { kind: "wentaiyi", cardUid: card.uid };
        log(s, "温太医相助：请选择要移除的负面状态（可取消）。");
      } else resolvePlay3(s, card.uid);
      break;
    }
    case "removeStatus": {
      if (s.pending?.kind !== "wentaiyi") return state;
      const st = removableNegatives3(s).find((x) => x.uid === action.statusUid);
      if (!st) return state;
      const cardUid = s.pending.cardUid;
      s.pending = null;
      resolvePlay3(s, cardUid, st.uid);
      break;
    }
    case "cancelPending": {
      if (!s.pending) return state;
      s.pending = null;
      log(s, "已取消。");
      break;
    }
    case "chooseStory": {
      if (s.pending) return state;
      const inst = s.stories.find((st) => st.id === action.storyId && st.chosenOptionId == null);
      if (!inst) return state;
      const option = storyBasicOptions3(STORIES3[inst.id]).find((o) => o.id === action.optionId);
      if (!option) return state;
      const delta = applyStoryOption(s, inst, option, `【${STORIES3[inst.id].name}】选择：${option.name}`, null);
      if (alive(s) && delta) changeRelation(s, delta);
      break;
    }
    case "explainTag": {
      const info = TAG3_INFO[action.tag];
      s.log.push({ turn: s.turn, text: `【${info.label}】${info.lore}`, tone: "info" });
      const relicDoubt = action.tag === "relic" && s.yihua ? RELIC_DOUBT_RULE : "";
      s.log.push({ turn: s.turn, text: `机制：${info.rules}${relicDoubt}`, tone: "info" });
      return s;
    }
    case "endTurn": {
      if (!canEndTurn3(s)) return state;
      s.actions.push(action);
      endTurn3(s);
      s.turnStartActionCount = s.actions.length;
      return s;
    }
  }
  s.actions.push(action);
  return s;
}

export function replay3(seed: number, carry: Carry3 | null, actions: readonly Z3Action[]): Z3State {
  let s = newStage3(seed, carry);
  for (const [i, a] of actions.entries()) {
    const next = reduce3(s, a);
    if (next === s) throw new Error(`第三关第 ${i + 1} 步操作无法复现`);
    s = next;
  }
  return s;
}

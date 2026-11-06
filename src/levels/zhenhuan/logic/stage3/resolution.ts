import {
  CARDS3,
  CHANGXIANGSI,
  CHUNYUAN,
  CONFRONT,
  type CardId3,
  DOUBT,
  type Delta3,
  ENVY_LINE3,
  EVENTS3,
  EVENT_KIND3_LABEL,
  type EventDef3,
  FEILAO,
  GONGZHONG_LAIXIN_HIDDEN_JINGFEI_STORY,
  GONGZHONG_LAIXIN_HIDDEN_STORY,
  GONGZHONG_LAIXIN_JINGFEI_STORY,
  HAITANG_COOL_TEXT,
  LINGRONG_COLD_TEXT,
  LINGRONG_EVENT3,
  LINGRONG_IDLE_TEXT3,
  LINGRONG_SUMMON,
  type LingrongTier,
  PAIRS,
  POPUP_TEXT,
  RELIC_TEXT,
  RESOURCE3_LABEL,
  SECRETS,
  STAGE3,
  STATUSES3,
  STORIES3,
  type SecretId,
  type StoryOption3,
  YIHUA,
  dengmenCloseText,
  dengmenOpenText,
  lingrongTier,
  longyueHidden3,
  statusText3,
} from "../../data/stage3Content";
import { alive, log, removeStatusById, roll, shuffleInto } from "../engineCommon";
import { confrontLines } from "./ending";
import {
  PIN_EVENT,
  addCardToDeck,
  addSecret,
  addStatus3,
  applyDelta3,
  applyDeltas3,
  becomePregnant,
  befriend,
  changeRelation,
  drawCards3,
  lizigao,
  lose,
  popup,
  promoteToPin,
  removeFromPools,
  removeNegatives,
  removeStatus3,
  summonSuccess,
  suppress,
} from "./mutations";
import {
  RENXIN_SECRET_PLAYS,
  ZHOUFU_TURN,
  cardAffectsEvent3,
  chunyuanAccepts,
  confrontAccepts,
  dengmenNeeded,
  feilaoAccepts,
  feilaoCurrentTier,
  hasStatus3,
  isRelic,
  lianmeiSourceFor,
  lingrongAnswers3,
  matchedEvents3,
  openStories3,
  playLimit3,
  qinseReady,
  relicsKept,
  removableNegatives3,
  solveCount,
  storyResponsesFor3,
  tierOf3,
  xiayuCost,
  xiayuS,
  yihuaAccepts,
} from "./queries";
import type { EventInst3, StoryInst3, Z3State } from "./state";

// ---------------------------------------------------------------- resolution

function verb(kind: string): string {
  return kind === "opportunity" ? "把握" : kind === "huanghou" ? "领受" : "化解";
}

const ENVY_STORIES = [
  "皇上又只往碎玉轩去，各宫的灯一盏盏暗下去。有人在背后说你狐媚专宠，这话一传十、十传百，你的名声难免受了些累。",
  "请安散后，几位嫔妃凑在廊下低声议论碎玉轩的恩宠，话里话外都是酸意。传到你耳中，已不大好听。",
  "宫里都说莞嫔如今风头太盛，连赏赐都比旁人多一份。树大招风，你的清誉在人言里又薄了一层。",
] as const;

/** 第一幕盛宠招妒：圣宠不低于 ENVY_LINE3 时，带 envyCost 的事件了结后另扣清誉。 */
export function applyEnvy(s: Z3State, def: EventDef3): void {
  if (s.act !== 1 || !def.envyCost || !alive(s) || s.shengchong < ENVY_LINE3) return;
  log(s, ENVY_STORIES[s.turn % ENVY_STORIES.length]!);
  applyDeltas3(s, def.envyCost, `盛宠招妒（圣宠 ≥ ${ENVY_LINE3}，${def.name}了结后另有折损）`);
}

function resolveEventByCard(s: Z3State, ev: EventInst3, card: CardId3, doubleReward: boolean): void {
  const def = EVENTS3[ev.id];
  ev.resolved = true;
  ev.resolvedBy = card;
  log(s, `${verb(def.kind)}${EVENT_KIND3_LABEL[def.kind]}事件【${def.name}】`, "good");
  const story =
    (ev.id === "gongzhongLaixin" ? gongzhongLaixinStory(s, card) : undefined) ??
    (s.lizigao ? POPUP_TEXT.lizigaoStory[ev.id]?.[card] : undefined) ??
    def.resolvedStory[card];
  if (story) {
    ev.story = story;
    log(s, story);
  }
  if (def.kind === "opportunity") {
    const reward = def.cardReward?.[card] ?? def.reward;
    applyDeltas3(s, reward, def.name);
    if (doubleReward && reward.length > 0 && alive(s)) {
      ev.rewardDoubled = true;
      applyDeltas3(s, reward, "眉庄相助联动：奖励翻倍");
    }
    opportunityExtras(s, ev, card);
  }
  if (def.kind === "huanghou") {
    for (const c of new Set(ev.progress ?? [card])) applyDeltas3(s, def.cardReward?.[c] ?? [], def.name);
  }
  applyEnvy(s, def);
  if (def.kind === "crisis") {
    if (def.resolveCost && alive(s)) applyDeltas3(s, def.resolveCost, `${def.name}（化解了，仍有些折损）`);
    if (def.rival && def.suppressCard && (ev.progress ?? [card]).includes(def.suppressCard) && !def.pair) {
      ev.suppressed = true;
      suppress(s, def.rival);
    }
  }
  if (card === "jingchaiBuqun" && alive(s)) {
    log(s, "荆钗布裙联动：静白一时挑不出错。", "good");
    addStatus3(s, "yishiWucuo");
  }
  if (card === "shoulongRenxin" && ev.id === "neiwufuDiaonan" && alive(s)) {
    log(s, "收拢人心联动：额外抽 1 张牌。", "good");
    drawCards3(s, 1);
  }
}

/** 宫中来信的解牌剧情：按有无【敬妃之谊】、是否已知胧月下落分四版。 */
function gongzhongLaixinStory(s: Z3State, card: CardId3): string | undefined {
  const jingfei = hasStatus3(s, "jingfeiZhiyi");
  if (longyueHidden3(s.exitTier, s.turn)) return (jingfei ? GONGZHONG_LAIXIN_HIDDEN_JINGFEI_STORY : GONGZHONG_LAIXIN_HIDDEN_STORY)[card];
  return jingfei ? GONGZHONG_LAIXIN_JINGFEI_STORY[card] : undefined;
}

const JINGFEI_LETTER_NOTE =
  "山下捎来的信里，另夹着敬妃的小笺：她让人送了米面、炭火和补药，又说胧月在她身边养得很好，前几日会叫「额娘」了。你把小笺看了又看，悬了许久的心总算落下一半。";
const JINGFEI_LETTER_NOTE_HIDDEN =
  "山下有人捎来一个包袱，是敬妃让人送的米面、炭火和补药，另附一张小笺，只叮嘱你保重身子，旁的一字未提。";

/** 敬妃之谊: the 宫中来信 bonus lands whether or not the letter itself was taken up. */
export function jingfeiLetter(s: Z3State, ev: EventInst3): void {
  if (!hasStatus3(s, "jingfeiZhiyi")) return;
  if (!ev.resolved || !ev.story) log(s, longyueHidden3(s.exitTier, s.turn) ? JINGFEI_LETTER_NOTE_HIDDEN : JINGFEI_LETTER_NOTE);
  applyDelta3(s, { resource: "shenzi", amount: 1 }, "敬妃之谊：胧月的消息");
}

function opportunityExtras(s: Z3State, ev: EventInst3, card: CardId3 | "lingrong"): void {
  if (!alive(s)) return;
  const def = EVENTS3[ev.id];
  if (def.ally) befriend(s, def.ally);
  switch (ev.id) {
    case PIN_EVENT:
      promoteToPin(s);
      break;
    case "gongzhongLaixin":
      jingfeiLetter(s, ev);
      break;
    case "foqianGongdeng":
      addStatus3(s, "zhushiTuotie");
      break;
    case "jinganChuilian":
      if (!hasStatus3(s, "shitaiBihu")) addStatus3(s, "shitaiBihu");
      break;
    case "shanzhongCaiyao":
      removeNegatives(s, 1, def.name);
      break;
    case "chanfangChaojing":
      addStatus3(s, "xinruZhishui");
      break;
    case "moyanYuanshou":
      s.extraPlays++;
      log(s, `默然分劳：本回合出牌 +1（现为 ${playLimit3(s)}）。`, "good");
      break;
    case "yuexiaDuitan":
      if (card === "guojunwangXiangzhu") drawCards3(s, 1);
      break;
  }
}

/** 陵容 on an event; returns the relation change to apply afterwards. */
function resolveEventByLingrong(s: Z3State, ev: EventInst3, tier: LingrongTier): number {
  const def = EVENTS3[ev.id];
  const o = LINGRONG_EVENT3[ev.id]?.[tier];
  if (!o) return 0;
  ev.lingrong = tier;
  log(s, `陵容：${o.story}`, tier === "resentful" ? "bad" : "info");
  if (!o.resolves) {
    ev.lingrongFailed = true;
    log(s, `【${def.name}】失效：陵容没有帮上忙。`, "bad");
    if (o.aggravate) ev.aggravated = true;
    if (o.effects) applyDeltas3(s, o.effects as readonly Delta3[], "陵容");
    return o.relation ?? 0;
  }
  ev.resolved = true;
  ev.resolvedBy = "lingrongXiangzhu";
  log(s, `${verb(def.kind)}${EVENT_KIND3_LABEL[def.kind]}事件【${def.name}】`, "good");
  if (o.effects) applyDeltas3(s, o.effects as readonly Delta3[], `${def.name}（陵容）`);
  if (o.extraDraw && alive(s)) drawCards3(s, o.extraDraw);
  if (o.shuhenjiao) shuhenjiao(s, tier);
  if (def.lingrongSecret) addSecret(s, def.lingrongSecret, tier);
  if (def.kind === "opportunity") opportunityExtras(s, ev, "lingrong");
  if (ev.id === "sanAgeYaochong") lizigao(s);
  return o.relation ?? 0;
}

/** 第一幕的舒痕胶不伤胎：有害时改为【抱恙在身】。 */
function shuhenjiao(s: Z3State, tier: LingrongTier): void {
  if (!alive(s)) return;
  log(s, "🧴 陵容送来了舒痕胶。");
  if (tier === "close") {
    applyDelta3(s, { resource: "shengchong", amount: 1 }, "舒痕胶（疤痕尽消）");
    return;
  }
  const harm = tier === "distant" ? 0.3 : 0.6;
  const heal = tier === "distant" ? 0.3 : 0;
  const r = roll(s);
  if (r < harm) {
    log(s, "药膏香气浓得有些异样，你只当是好药。", "bad");
    addStatus3(s, "baoyangZaishen");
  } else if (r < harm + heal) applyDelta3(s, { resource: "shengchong", amount: 1 }, "舒痕胶（疤痕尽消）");
  else log(s, "药膏清凉，伤处好得很快。");
}

/** 甄远道下狱：每打出一张解牌局势 s -1，并给出这张牌的剧情；s 归零即完美解决。 */
function xiayuStep(s: Z3State, inst: StoryInst3, option: StoryOption3, tier: LingrongTier | null, name: string): number {
  inst.solved = (inst.solved ?? 0) + 1;
  const told = option.tierStory && tier ? option.tierStory[tier] : option.story;
  (inst.steps ??= []).push(told);
  log(s, `【${name}】·${option.name}`);
  log(s, told);
  if (option.secret && tier) addSecret(s, option.secret, tier);
  const left = xiayuS(s, inst.solved);
  if (left > 0) {
    log(s, `【${name}】尚未了结，局势还差 ${left} 档。`, "info");
    return 0;
  }
  inst.chosenOptionId = option.id;
  inst.viaCard = option.card;
  inst.story = told;
  inst.result = "完美解决，没有代价";
  log(s, `【${name}】完美解决。`, "good");
  removeStatusById(s, "fuxiongMengchen");
  return 0;
}

export function applyStoryOption(s: Z3State, inst: StoryInst3, option: StoryOption3, source: string, tier: LingrongTier | null): number {
  const def = STORIES3[inst.id];
  // 海棠春睡：陵容暗中心冷，情分 -2，不写进日志
  if (!inst.chosenOptionId && (inst.id === "haitangChunshui" || inst.id === "haitangYeyu")) {
    const before = lingrongTier(s.relation);
    changeRelation(s, -2, true);
    const after = lingrongTier(s.relation);
    if (after !== before && after !== "close" && !s.lingrongGone) log(s, HAITANG_COOL_TEXT[after], "bad");
  }
  inst.chosenOptionId = option.id;
  if (option.card) inst.viaCard = option.card;
  log(s, source);

  if (inst.id === "zhaoxing" && option.card === "lingrongXiangzhu" && tier) {
    const o = LINGRONG_SUMMON[tier];
    log(s, o.story, tier === "close" ? "good" : "bad");
    inst.story = o.story;
    inst.result = o.result === "success" ? "侍寝成功" : o.result === "stolen" ? "陵容夺功，你未侍寝" : "召幸被截走";
    if (o.effects) applyDeltas3(s, o.effects as readonly Delta3[], "陵容截宠");
    if (o.result !== "lost") addSecret(s, "shiqinNeiqing", tier);
    if (o.result === "success") summonSuccess(s);
    return o.relation ?? 0;
  }

  const told = option.tierStory && tier ? option.tierStory[tier] : option.story;
  if (option.tierStory && tier) inst.story = told;
  log(s, told);

  if (option.xiayu) {
    const cost = xiayuCost(s, option.xiayu, inst.solved ?? 0);
    inst.result = cost.length ? cost.map((d) => `${RESOURCE3_LABEL[d.resource]} ${d.amount}`).join("、") : "没有代价";
    applyDeltas3(s, cost, def.name);
    removeStatusById(s, "fuxiongMengchen");
  }
  if (option.shenziFloor != null) {
    for (const d of option.effects) {
      if (d.resource !== "shenzi") applyDelta3(s, d, `${def.name}·${option.name}`);
      else if (s.shenzi + d.amount < option.shenziFloor) {
        const amount = Math.min(0, option.shenziFloor - s.shenzi);
        if (amount !== 0) applyDelta3(s, { resource: "shenzi", amount }, `${def.name}·${option.name}（最少扣到 ${option.shenziFloor}）`);
      } else applyDelta3(s, d, `${def.name}·${option.name}`);
    }
  } else applyDeltas3(s, option.effects, `${def.name}·${option.name}`);
  if (!alive(s)) return 0;

  if (def.id === "wentaiyiTanshi" && hasStatus3(s, "jingfeiZhiyi")) {
    log(s, "敬妃托果郡王带来了不少物资，山居的日子打点得宽裕了些。", "good");
    addStatus3(s, "jingfeiZhouji");
  }
  if (option.removeNegatives) removeNegatives(s, option.removeNegatives, option.name);
  if (option.status) addStatus3(s, option.status);
  if (option.drawCards) drawCards3(s, option.drawCards);
  if (option.extraPlays) {
    s.extraPlays += option.extraPlays;
    log(s, `${def.name}·${option.name}：本回合出牌 +${option.extraPlays}（现为 ${playLimit3(s)}）。`, "good");
  }
  if (option.pregnancy) becomePregnant(s, def.name);
  if (option.summon) {
    inst.result = "侍寝成功";
    summonSuccess(s);
  }
  if (option.secret && tier) addSecret(s, option.secret, tier);
  if (option.relic && !s.keepsakes.includes(option.relic)) s.keepsakes.push(option.relic);
  switch (option.flag) {
    case "li":
    case "di":
    case "lingrong":
      s.guoMeet = option.flag;
      break;
    case "luofa":
      s.luofa = true;
      break;
    case "gengtie":
      s.gengtie = true;
      if (qinseReady(s)) {
        s.statuses.push({ uid: `s${s.nextUid++}`, id: "qinseHeming", appliesFromTurn: ZHOUFU_TURN + 1, remaining: 0 });
        log(s, `获得状态【${STATUSES3.qinseHeming.name}】（${statusText3(STATUSES3.qinseHeming, s.turn).effectText}）`, "good");
        popup(s, "qinse");
      }
      break;
    case "songxing":
      s.songxing = true;
      break;
    case "ouyu":
      if (s.yihua?.step === 2) advanceYihua(s, option.card ?? "chanyuXiushen");
      break;
  }
  if (inst.id === "tonghuataiChuyu") afterTonghuatai(s);
  if (inst.id === "taxueWenji" && option.card) s.taxueByCard = true;
  if (inst.id === "shanmenOuyu" || (inst.id === "taxueWenji" && option.id !== "bimenXieke")) {
    addCardToDeck(s, "guojunwangXiangzhu");
    log(s, "牌库加入 1 张【果郡王相助】。", "good");
  }
  if (inst.id === "wanwanLeiqing") {
    s.wanwanOption = option.id;
    birth(s);
  }
  return 0;
}

function afterTonghuatai(s: Z3State): void {
  addCardToDeck(s, "guojunwangXiangzhu");
  log(s, "牌库加入第 1 张【果郡王相助】。", "good");
  s.opportunityPool = shuffleInto(s, [...s.opportunityPool, "wangyeXiantan"]);
  log(s, "【王爷闲谈】洗入机会池。");
  popup(s, "tonghuatai");
}

function birth(s: Z3State): void {
  if (!alive(s)) return;
  s.pregnant = false;
  s.childBorn = true;
  removeStatusById(s, "shenhuaiLongyi");
  removeFromPools(s, [PIN_EVENT]);
  log(s, "当夜早产，你生下一个女儿，皇上赐名胧月。", "good");
  popup(s, "wanwan");
}

export function resolvePlay3(s: Z3State, cardUid: string, removeStatusUid?: string): void {
  const idx = s.hand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return;
  const lianmei = lianmeiSourceFor(s, idx);
  const card = s.hand[idx]!;
  const def = CARDS3[card.id];
  const tier = tierOf3(s);
  const isLingrong = card.id === "lingrongXiangzhu";

  const responses = storyResponsesFor3(s, card.id);
  const events = matchedEvents3(s, card.id);
  const yihuaStep = yihuaAccepts(s, card.id);

  s.hand.splice(idx, 1);
  if (lianmei) {
    s.lianmeiSpent.push(lianmei.uid);
    log(s, `打出【${def.name}】（联袂：不占出牌名额）`, "good");
  } else {
    s.playsUsed++;
    log(s, `打出【${def.name}】`);
  }
  s.playedThisTurn.push(card.id);
  if (card.id === "shoulongRenxin" && s.act === 1 && s.turn < STAGE3.confrontTurn && ++s.renxinPlays === RENXIN_SECRET_PLAYS) addSecret(s, "shoulongMairen", null);
  let relationDelta = 0;
  let answered = responses.length > 0;

  // 1. story responses
  const startedNow = new Set<StoryInst3>();
  for (const { story, option } of responses) {
    if (!alive(s)) break;
    if (option.xiayu && option.card) {
      relationDelta += xiayuStep(s, story, option, isLingrong ? tier : null, STORIES3[story.id].name);
      continue;
    }
    if (option.two) {
      if (!story.pendingOptionId) {
        story.pendingOptionId = option.id;
        startedNow.add(story);
        log(s, `【${STORIES3[story.id].name}】·${option.name} 1/2：还需再打出一张牌。`);
      }
      continue;
    }
    relationDelta += applyStoryOption(s, story, option, `【${STORIES3[story.id].name}】·${option.name}（打出【${def.name}】）`, isLingrong ? tier : null);
  }

  for (const st of openStories3(s)) {
    if (!alive(s)) break;
    if (!st.pendingOptionId || startedNow.has(st)) continue;
    if (!STORIES3[st.id].options.some((o) => o.two && o.card === card.id)) continue;
    // 第二张须是这件事的某个卡牌应对（温太医相助之类不相干的牌不算）
    if (!STORIES3[st.id].options.some((o) => o.card === card.id)) continue;
    const opt = STORIES3[st.id].options.find((o) => o.id === st.pendingOptionId)!;
    if (opt.distinct && opt.card === card.id) continue;
    st.pendingOptionId = undefined;
    answered = true;
    relationDelta += applyStoryOption(s, st, opt, `【${STORIES3[st.id].name}】·${opt.name}（再打出【${def.name}】）`, opt.card === "lingrongXiangzhu" ? lingrongTier(s.relation) : null);
  }

  // 2. card's own effect
  if (alive(s)) {
    if (card.id === "meizhuangXiangzhu" && s.act >= 2) {
      addStatus3(s, "meizhuangDadian");
    } else {
      applyDeltas3(s, def.base, def.name);
      if (def.baseStatus && alive(s)) addStatus3(s, def.baseStatus);
      if (def.baseDraw > 0 && alive(s)) drawCards3(s, def.baseDraw);
    }
    const solving =
      events.length > 0 || answered || yihuaStep || (!!s.confront && confrontAccepts(s, card.id)) || (!!s.feilao && feilaoAccepts(s, card.id));
    if (def.extraPlays && alive(s) && (!def.extraPlaysOnlyWhenSolving || solving)) {
      s.extraPlays += def.extraPlays;
      log(s, `${def.name}：本回合出牌 +${def.extraPlays}（现为 ${playLimit3(s)}）。`, "good");
    }
    if (card.id === "wenTaiyiZhenzhi") {
      const negatives = removableNegatives3(s);
      const target = removeStatusUid ?? (negatives.length === 1 ? negatives[0]!.uid : undefined);
      if (target) removeStatus3(s, target, def.name);
      else applyDelta3(s, { resource: "shenzi", amount: 1 }, `${def.name}（没有负面状态）`);
    }
  }

  // 3. events: 连环 crisis first, then opportunity, then the rest; each checked again right before
  const ordered = [...events].sort((a, b) => rankEvent(a) - rankEvent(b));
  const resolvedNow: EventInst3[] = [];
  for (const ev of ordered) {
    if (!alive(s)) break;
    if (ev.resolved || !cardAffectsEvent3(s, ev, card.id)) continue;
    answered = true;
    const d = EVENTS3[ev.id];
    if (d.double) {
      ev.progress = [...(ev.progress ?? []), card.id];
      if (ev.progress.length >= 2) resolveEventByCard(s, ev, card.id, false);
      else log(s, `【${d.name}】双牌进度 1/2。`);
      continue;
    }
    if (d.needTwo) {
      ev.progress = [...(ev.progress ?? []), card.id];
      if (ev.progress.length >= solveCount(ev)) {
        // 两张解牌里有陵容（不论先后），就按陵容化解（家宴献艺、栗糕清苦都一样）
        const lingrongTier3 = ev.progress.includes("lingrongXiangzhu") && lingrongAnswers3(s, ev) ? tierOf3(s) : null;
        if (lingrongTier3) relationDelta += resolveEventByLingrong(s, ev, lingrongTier3);
        else {
          // 连环: with the shared card among the two, its story always wins
          const shared = d.pair ? PAIRS[d.pair].shared : undefined;
          resolveEventByCard(s, ev, shared && ev.progress.includes(shared) ? shared : card.id, false);
        }
        if (ev.resolved) resolvedNow.push(ev);
      } else log(s, `【${d.name}】解牌 1/${solveCount(ev)}。`);
      continue;
    }
    if (isLingrong && tier) relationDelta += resolveEventByLingrong(s, ev, tier);
    else resolveEventByCard(s, ev, card.id, card.id === "meizhuangXiangzhu");
    if (ev.resolved) resolvedNow.push(ev);
  }
  // 连环 crisis cleared with the shared card among its two cards: the opportunity half is taken along
  for (const ev of [...resolvedNow]) {
    const pairId = EVENTS3[ev.id].pair;
    if (!pairId || EVENTS3[ev.id].kind !== "crisis" || !alive(s)) continue;
    const p = PAIRS[pairId];
    const opp = s.opportunity;
    if (!ev.progress?.includes(p.shared) || !opp || opp.id !== p.opportunity || opp.resolved) continue;
    resolveEventByCard(s, opp, p.shared, p.shared === "meizhuangXiangzhu");
    resolvedNow.push(opp);
    sharedPairCheck(s, p.shared, resolvedNow);
  }
  sharedPairCheck(s, card.id, resolvedNow);

  // 4. special cards of this turn
  if (alive(s) && s.chunyuan) {
    const step = chunyuanAccepts(s, card.id);
    if (step === 1) {
      s.chunyuan.first = card.id;
      log(s, `【${CHUNYUAN.name}】① 起疑：${CHUNYUAN.firstStory[card.id]}`, "good");
    } else if (step === 2) {
      s.chunyuan.second = card.id;
      log(s, `【${CHUNYUAN.name}】② 查实：${CHUNYUAN.checkStory[card.id]}`, "good");
    }
    if (isLingrong && tier) {
      // 纯元故衣已查完后再打陵容，仍是普通的陪伴（情分 +1），不算应对了这件事
      if (step) answered = true;
      addSecret(s, "guyiYuanyan", tier);
    }
  }
  if (alive(s) && s.confront && confrontAccepts(s, card.id)) {
    const c = s.confront;
    const first = !c.played.includes(card.id);
    c.played.push(card.id);
    if (first) {
      // 先挑一条这张牌能专门辩解的、还没被驳过的指控；没有就用通用的作证表忠心
      const target = confrontLines(s).find((l) => !l.withheld && !l.qifei && !c.rebutted.includes(l.id) && CONFRONT.pleas[l.id]?.[card.id]);
      if (target) c.rebutted.push(target.id);
      const text = target ? CONFRONT.pleas[target.id]![card.id]! : CONFRONT.cardStory[card.id];
      const topic = target ? `回应「${target.id === "fabricated" ? "凭空编造的话" : SECRETS[target.id as SecretId].name.replace("恩赏为凭·", "")}」：` : "";
      if (text) c.stories.push(`${def.emoji} ${topic}${text}`);
    }
    log(s, `【景仁宫对质】辩白 ${c.played.length}/${c.needed}`, "good");
  }
  if (alive(s) && s.feilao && feilaoAccepts(s, card.id)) {
    const seen = s.feilao.played.includes(card.id);
    s.feilao.played.push(card.id);
    // 同一张解牌再打出时不重复整段剧情，只记减轻一档
    const story = seen ? `又一张「${FEILAO.cardStory[card.id]!.slice(1, FEILAO.cardStory[card.id]!.indexOf("」"))}」。` : FEILAO.cardStory[card.id];
    log(s, `【${FEILAO.name}】${story}（减轻一档，现为 ${FEILAO.tiers[feilaoCurrentTier(s)]!.name}）`, "good");
  }
  if (alive(s) && s.changxiangsi && !s.changxiangsi.done) {
    s.changxiangsi.played.push(card.id);
    if (s.changxiangsi.played.includes("guojunwangXiangzhu") && s.changxiangsi.played.includes("chanyuXiushen")) {
      s.changxiangsi.done = true;
      s.changxiangsiDone = true;
      log(s, `【${CHANGXIANGSI.name}】${CHANGXIANGSI.story}`, "good");
      applyDelta3(s, { resource: "qingyu", amount: 2 }, "琴笛合奏");
    }
  }
  if (alive(s) && yihuaStep && s.yihua!.step !== 4) advanceYihua(s, card.id);
  if (alive(s) && yihuaStep && s.yihua?.step === 4 && s.yihua.dengmen) {
    const d = s.yihua.dengmen;
    d.played.push(card.id);
    log(s, `④ 登门：${YIHUA.dengmenStory[card.id]}（解牌 ${Math.min(d.played.length, d.needed)}/${d.needed}）`, "good");
    if (d.played.length >= d.needed) finishDengmen(s);
  }
  if (alive(s) && s.yihua && s.yihua.step < 5 && YIHUA.doubtCards.includes(card.id)) changeDoubt(s, -1, def.name);

  // 5. 陵容 with nothing to answer: her company, 情分 +1 (after 纯元故衣, a cold word)
  if (alive(s) && isLingrong && tier && !answered) {
    if (s.chunyuanPassed) {
      log(s, LINGRONG_COLD_TEXT);
      addSecret(s, "xinlengZhiyu", tier);
    } else log(s, LINGRONG_IDLE_TEXT3[tier], tier === "resentful" ? "bad" : "good");
    if (tier === "resentful") applyDelta3(s, { resource: "shengchong", amount: -1 }, "陵容微词");
    relationDelta += 1;
  }

  if (alive(s) && relationDelta !== 0) changeRelation(s, relationDelta);

  // 6. where the card goes
  if (isRelic(card.id)) {
    s.departed.push(card);
    s.relicsBurned++;
    log(s, `🕯️ 焚毁【${def.name}】：${RELIC_TEXT[card.id]}`);
  } else s.discard.push(card);
}

function rankEvent(ev: EventInst3): number {
  const d = EVENTS3[ev.id];
  if (d.pair && d.kind === "crisis") return 0;
  if (d.kind === "opportunity") return 1;
  return 2;
}

/** The 连环 shared card cleared both halves in one play: ally + 打压. */
function sharedPairCheck(s: Z3State, card: CardId3, resolvedNow: EventInst3[]): void {
  for (const pairId of Object.keys(PAIRS) as (keyof typeof PAIRS)[]) {
    const p = PAIRS[pairId];
    if (p.shared !== card) continue;
    const both = resolvedNow.some((e) => e.id === p.crisis) && resolvedNow.some((e) => e.id === p.opportunity);
    if (!both || !alive(s)) continue;
    log(s, `🔗 ${p.name}·一石二鸟：一张【${CARDS3[card].name}】两头都顾上了。`, "good");
    const crisis = resolvedNow.find((e) => e.id === p.crisis)!;
    if (crisis.suppressed) continue;
    crisis.suppressed = true;
    suppress(s, p.rival);
  }
}

export function changeDoubt(s: Z3State, delta: number, source: string): void {
  const y = s.yihua;
  if (!y || !alive(s) || delta === 0) return;
  const next = Math.max(0, Math.min(DOUBT.max, y.doubt + delta));
  if (next === y.doubt) return;
  y.doubt = next;
  log(s, `${source}：📜疑点 ${delta > 0 ? "+" : ""}${delta} → ${next}`, delta > 0 ? "bad" : "good");
  if (next >= DOUBT.max) {
    lose(s, "疑点到 5，胎象再也瞒不住", "doubt");
    return;
  }
}

function advanceYihua(s: Z3State, card: CardId3): void {
  const y = s.yihua!;
  if (y.step === 1) {
    y.yinjia.push(card);
    log(s, `① 引驾：${YIHUA.yinjiaStory[card] ?? ""}`, "good");
    if (card === "jinxiXiangzhu") y.duishi = true;
    if (y.yinjia.length >= y.yinjiaNeed && y.yinjia.includes("jinxiXiangzhu")) {
      y.step = 2;
      y.yinjiaTurn = s.turn;
      y.ouyuDue = s.turn + YIHUA.ouyuDelay;
      log(s, `引驾完成：皇上要来甘露寺了（第 ${y.ouyuDue} 回合偶遇）。`, "good");
    } else log(s, `你已落发，皇上未必肯来：引驾还差 ${y.yinjiaNeed - y.yinjia.length} 张${y.yinjia.includes("jinxiXiangzhu") ? "（槿汐相助或眉庄相助）" : "槿汐相助"}。`);
    return;
  }
  if (y.step === 2) {
    y.step = 3;
    y.ouyuCard = card;
    popup(s, "ouyu");
    log(s, `② 偶遇：${YIHUA.ouyuStory}`, "good");
    if (s.exitShengchong != null) {
      s.shengchong = s.exitShengchong;
      log(s, `圣宠恢复为 ${s.shengchong}。`, "good");
    }
    y.ouyuTurn = s.turn;
    return;
  }
  if (y.step === 3) {
    y.step = 4;
    log(s, `③ 改脉：${YIHUA.maiDone}脉案上的月份对上了。只是皇上明日要亲自登门。`, "good");
  }
}

function finishDengmen(s: Z3State): void {
  const y = s.yihua!;
  y.step = 5;
  y.doneTurn = s.turn;
  log(s, `④ 登门：${dengmenCloseText(y.dengmen!.needed === 0 ? "none" : s.exitTier === 3 ? "narrow" : "done", s.exitTier)}移花接木，四步俱成。`, "good");
}

export function openDengmen(s: Z3State): void {
  const y = s.yihua!;
  const relics = relicsKept(s);
  const needed = dengmenNeeded(s, y.doubt, relics);
  y.dengmen = { doubt: y.doubt, relics, needed, played: [], openTurn: s.turn };
  popup(s, "dengmen");
  log(s, `皇上亲自登门：${dengmenOpenText(y.doubt, relics, s.exitTier)}`, "info");
  if (needed === 0) finishDengmen(s);
  else log(s, `登门需打出 ${needed} 张解牌（📜疑点 ${y.doubt}、遗物 ${relics} 件${s.exitTier === 1 ? "" : "，非体面自请多 1 张"}），须在本回合与下一回合内打够（一回合内打够才可能完胜，少 1 张为险胜）。`, "info");
}

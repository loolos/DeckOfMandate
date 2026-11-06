import {
  CHANGXIANGSI,
  CHUNYUAN,
  CONFRONT,
  type CrisisId3,
  DOUBT,
  EVENTS3,
  EXIT,
  FEILAO,
  FIXED_STORIES3,
  HUANGHOU_EVENTS,
  type HuanghouId,
  LINGRONG_FAREWELL,
  LINGRONG_TRUTH,
  type OpportunityId3,
  PAIRS,
  PEAK_ADD_CRISES,
  PEAK_ADD_OPPORTUNITIES,
  POPUP_TEXT,
  RELICS,
  type RelicId,
  STAGE3,
  STAGE3_TEMPLE_DECK,
  STATUSES3,
  STORIES3,
  SUPPRESS_STATUS,
  TEMPLE_CRISES,
  TEMPLE_OPPORTUNITIES,
  XIUXING,
  YIHUA,
  ZHOUFU,
  confrontNeeded,
  confrontOutcome,
  dengmenCloseText,
  lingrongTier,
  longyueHidden3,
  statusText3,
  unresolvedText3,
} from "../../data/stage3Content";
import { alive, log, newEvent, removeStatusById, shuffleInto } from "../engineCommon";
import {
  PIN_EVENT,
  addCardToDeck,
  addSecret,
  addStatus3,
  applyDelta3,
  applyDeltas3,
  changeRelation,
  checkSummon,
  drawCards3,
  drawFromPool,
  lose,
  openStory,
  popup,
  removeFromPools,
} from "./mutations";
import {
  ZHOUFU_TURN,
  actOf,
  activeStatuses,
  drawCount3,
  feilaoBaseTier,
  feilaoCurrentTier,
  hasStatus3,
  isRelic,
  presentedSecrets,
  relicsKept,
  tierOf3,
} from "./queries";
import { applyEnvy, applyStoryOption, changeDoubt, jingfeiLetter, openDengmen } from "./resolution";
import type { CardInst3, EventInst3, Z3State } from "./state";

// ---------------------------------------------------------------- turn flow

function enterTemple(s: Z3State): void {
  s.act = 2;
  s.lingrongGone = true;
  const guo = [...s.hand, ...s.drawPile, ...s.discard].filter((c) => c.id === "guojunwangXiangzhu");
  s.departed.push(...[...s.hand, ...s.drawPile, ...s.discard].filter((c) => c.id !== "guojunwangXiangzhu"));
  const ids = [...STAGE3_TEMPLE_DECK];
  const deck: CardInst3[] = [...ids.map((id) => ({ uid: `c${s.nextUid++}`, id })), ...guo];
  s.hand = [];
  s.discard = [];
  s.drawPile = shuffleInto(s, deck);
  s.statuses = s.statuses.filter((st) => st.id === "lingrongDeXiang" || st.id === "jingfeiZhiyi");
  if (s.shenzi < 1) s.shenzi = 1; // 卧床静养 ends with 第一幕
  if (s.qingyu > XIUXING.cap) {
    s.qingyu = XIUXING.cap;
    log(s, `修行之人，清誉上限 ${XIUXING.cap}：清誉记为 ${s.qingyu}。`);
  }
  s.opportunityPool = shuffleInto(s, TEMPLE_OPPORTUNITIES);
  s.opportunityUsed = [];
  s.crisisPool = shuffleInto(s, TEMPLE_CRISES);
  s.crisisUsed = [];
  s.huanghouPool = [];
  s.huanghouUsed = [];
  s.summonLast = null;
  log(s, `—— ${"第二幕 · 青灯古佛"} ——你成了甘露寺里带发修行的莫愁。宫中的牌封存，换成寺中牌库（${deck.length} 张）；每回合抓 ${XIUXING.draw} 打 ${XIUXING.plays}。`, "info");
}

function moveToPeak(s: Z3State): void {
  s.atPeak = true;
  removeFromPools(s, ["fazuoCuhuo", "wutouXiangyou"]);
  s.opportunityPool = shuffleInto(s, [...s.opportunityPool, ...PEAK_ADD_OPPORTUNITIES]);
  s.crisisPool = shuffleInto(s, [...s.crisisPool, ...PEAK_ADD_CRISES]);
  log(s, "迁居凌云峰：杂役磋磨、功德蒙尘移出；月下对谈、夜半惊扰、耳目窥伺加入。");
}

function zhoufu(s: Z3State): void {
  const have = new Set<RelicId>(s.keepsakes);
  if (s.gengtie) have.add("yiwuGengtie");
  if (s.songxing) have.add("yiwuDi");
  const relics = RELICS.filter((r) => have.has(r));
  let i = 0;
  const convert = (pile: CardInst3[]): CardInst3[] =>
    pile.map((c) => (c.id === "guojunwangXiangzhu" ? { uid: c.uid, id: relics[i++] ?? "yiwuPifeng" } : c));
  s.drawPile = convert(s.drawPile);
  s.discard = convert(s.discard);
  s.hand = convert(s.hand);
  log(s, `🌊 ${ZHOUFU.text}【果郡王相助】都变成了 🕯️遗物。`, "bad");
  popup(s, "zhoufu");
}

function enterYihua(s: Z3State): void {
  s.act = 3;
  s.pregnant = true;
  s.statuses.push({ uid: `s${s.nextUid++}`, id: "shenhuaiLongyi", appliesFromTurn: s.turn, remaining: 0 });
  addCardToDeck(s, "wenTaiyiZhenzhi");
  removeFromPools(s, ["yuexiaDuitan"]);
  if (s.exitTierLingrong === "resentful") {
    s.crisisPool = shuffleInto(s, [...s.crisisPool, "jingrenLairen"]);
    log(s, "景仁宫还在打听你的消息：【景仁宫来人】洗入危机池。", "bad");
  }
  s.yihua = { step: 1, yinjia: [], yinjiaNeed: s.luofa ? 2 : 1, duishi: false, doubt: DOUBT.start, doneTurn: null, ouyuDue: null, ouyuTurn: null, yinjiaTurn: null, dushu: false, dengmen: null };
  log(s, "—— 第三幕 · 移花接木 —— 温太医诊出喜脉，牌库加入 1 张【温太医相助】。持续事件【🎎移花接木】开始，📜疑点为 1。", "info");
  popup(s, "ximai");
}

function drawEvents(s: Z3State): void {
  const ease = (ev: EventInst3) => {
    const rival = EVENTS3[ev.id].rival;
    if (rival === "qifei" && hasStatus3(s, "dayaQifeiLizi")) {
      ev.eased = true;
      log(s, `【打压·齐妃】齐妃有把柄在皇后手里，不敢闹大：【${EVENTS3[ev.id].name}】少需要 1 张解牌。`, "good");
      return;
    }
    const daya = rival ? SUPPRESS_STATUS[rival] : undefined;
    if (!daya || !removeStatusById(s, daya)) return;
    ev.eased = true;
    log(s, `【${STATUSES3[daya].name}】上回吃了亏，这回没敢闹大：【${EVENTS3[ev.id].name}】少需要 1 张解牌。`, "good");
  };
  let opp = drawFromPool<OpportunityId3>(s, "opportunityPool", "opportunityUsed");
  let crisis = drawFromPool<CrisisId3>(s, "crisisPool", "crisisUsed");
  const oppPair = opp ? EVENTS3[opp].pair : undefined;
  const crisisPair = crisis ? EVENTS3[crisis].pair : undefined;
  if (oppPair) {
    const partner = PAIRS[oppPair].crisis;
    if (crisis !== partner) {
      if (crisis) s.crisisPool = shuffleInto(s, [...s.crisisPool, crisis]);
      removeFromPools(s, [partner]);
      crisis = partner;
    }
  } else if (crisisPair) {
    const partner = PAIRS[crisisPair].opportunity;
    if (opp !== partner) {
      if (opp) s.opportunityPool = shuffleInto(s, [...s.opportunityPool, opp]);
      removeFromPools(s, [partner]);
      opp = partner;
    }
  }
  if (opp) {
    s.opportunity = newEvent(s, opp);
    log(s, `机会事件：【${EVENTS3[opp].name}】`);
  }
  if (crisis) {
    s.crisis = newEvent(s, crisis);
    log(s, `危机事件：【${EVENTS3[crisis].name}】${EVENTS3[crisis].pair ? "（连环）" : ""}`);
    ease(s.crisis);
  }
}

export function beginTurn3(s: Z3State, turn: number): void {
  s.turn = turn;
  s.act = actOf(turn) === 1 ? 1 : s.act;
  s.turnRank = s.rank;
  s.playsUsed = 0;
  s.extraPlays = 0;
  s.drawnThisTurn = 0;
  s.lianmeiSpent = [];
  s.playedThisTurn = [];
  s.notices = [];
  s.chunyuan = null;
  s.confront = null;
  s.feilao = null;
  s.changxiangsi = null;
  log(s, `—— 第 ${turn} 回合 ——`);

  if (turn === STAGE3.act2Start) enterTemple(s);
  if (turn === STAGE3.act3Start) enterYihua(s);
  for (const st of s.statuses) {
    const v = STATUSES3[st.id].veiled;
    if (v?.untilTurn === turn) log(s, `【${STATUSES3[st.id].name}】${statusText3(STATUSES3[st.id], turn, longyueHidden3(s.exitTier, turn)).flavor}（${STATUSES3[st.id].effectText}）`, "good");
  }
  if (s.yihua?.step === 2 && s.yihua.ouyuDue === turn) {
    log(s, "皇上驾临甘露寺：本回合解决【圣驾偶遇】才算偶遇成功。", "info");
    openStory(s, "yihuaOuyu");
  }

  if (s.yihua?.step === 4 && !s.yihua.dengmen) openDengmen(s);

  const fixed = FIXED_STORIES3[turn];
  // 嫔位已报过喜脉：海棠春睡只是留宿夜谈
  if (fixed) openStory(s, fixed === "haitangChunshui" && s.pregnant && s.rank === "pin" ? "haitangYeyu" : fixed);
  if (turn === 6) {
    s.chunyuan = { first: null, second: null };
    log(s, `剧情事件：【${CHUNYUAN.name}】${CHUNYUAN.rule}`);
  }
  if (turn === STAGE3.confrontTurn) {
    const presented = presentedSecrets(s);
    const needed = confrontNeeded(presented) + (s.rank === "guiren" ? 1 : 0);
    s.confront = { presented, needed, played: [], stories: [], rebutted: [] };
    popup(s, "confront");
    log(s, `剧情事件：【${CONFRONT.name}】被人抓住的把柄有 ${presented} 项。本回合须打出 ${needed} 张辩白牌${s.rank === "guiren" ? "（贵人多 1 张）" : ""}。陵容称病没来，她的牌打不出。`, "bad");
  }
  if (turn === STAGE3.templeLastTurn) {
    if (hasStatus3(s, "hanzheng")) applyDelta3(s, { resource: "shenzi", amount: -1 }, "带着寒疾缠身病倒");
    if (!alive(s)) return;
    const base = feilaoBaseTier(s.arrogance);
    s.feilao = { base, played: [] };
    log(s, `剧情事件：【${FEILAO.name}】初始档位：${FEILAO.tiers[base]!.name}。本回合每打出 1 张槿汐相助 / 禅语修身 / 眉庄相助，减轻一档。`, "bad");
  }
  if (turn === 21) {
    s.changxiangsi = { played: [], done: false };
    log(s, `剧情事件：【${CHANGXIANGSI.name}】${CHANGXIANGSI.rule}`);
  }
  if (turn === ZHOUFU_TURN) {
    zhoufu(s);
    // 噩耗当回合起不再有月下对谈（该回合的机会事件在此之后才抽）。
    removeFromPools(s, ["yuexiaDuitan"]);
  }

  if (turn !== STAGE3.confrontTurn) {
    drawEvents(s);
    if (s.act === 1 && turn >= 3) drawHuanghou(s);
    checkSummon(s);
  }

  const kept = s.hand.length;
  const base = drawCount3(s, turn);
  const n = Math.max(0, base - kept);
  drawCards3(s, n);
  log(s, `抓 ${n} 张牌${kept > 0 ? `（依依留下 ${kept} 张陵容，少抓 ${base - n} 张）` : ""}。`);
}

function drawHuanghou(s: Z3State): void {
  const id = drawFromPool<HuanghouId>(s, "huanghouPool", "huanghouUsed", (x) => x !== "antaiBupin" || s.pregnant);
  if (!id) return;
  s.huanghou = newEvent(s, id);
  log(s, `皇后事件：【${EVENTS3[id].name}】`, "info");
}

function settleCrisis(s: Z3State, ev: EventInst3): void {
  const def = EVENTS3[ev.id];
  const jingbai = def.jingbai && s.act === 2 && !s.atPeak;
  if (jingbai) s.arrogance++; // hidden
  if (removeStatusById(s, "shitaiBihu")) {
    log(s, `【佛门庇荫】静岸师太替你挡下了【${def.name}】。`, "good");
    return;
  }
  if (def.rival && removeStatusById(s, "xinGuirenZhangyi")) {
    ev.byXin = true;
    log(s, `【欣贵人解围】【${def.name}】没化解，欣贵人替你挡下了惩罚。${(s.lizigao ? POPUP_TEXT.lizigaoXinCover[ev.id] : undefined) ?? def.xinCover ?? "她当众顶了回去。"}`, "good");
    if (def.pair) log(s, `连环：【${EVENTS3[PAIRS[def.pair].opportunity].name}】随之作废。`, "bad");
    return;
  }
  log(s, `危机事件【${def.name}】未化解：${unresolvedText3(def, s.turn)}。`, "bad");
  const half = def.needTwo === true && (ev.progress ?? []).length === 1;
  if (half) log(s, `只凑了一张解牌，【${def.name}】的惩罚减轻了。`, "info");
  applyDeltas3(s, half && def.halfPenalty ? def.halfPenalty : def.penalty, def.name);
  if (ev.id === "xianrenKuitan" && s.playedThisTurn.includes("guojunwangXiangzhu")) applyDelta3(s, { resource: "qingyu", amount: -1 }, "被撞见");
  if (def.penaltyStatus && alive(s)) {
    const turns = half ? def.halfStatusTurns : undefined;
    addStatus3(s, def.penaltyStatus, turns);
    if (ev.aggravated && alive(s)) addStatus3(s, def.penaltyStatus, turns);
  }
  if (def.secret) addSecret(s, def.secret, null);
  if (ev.id === "jingrenLairen") changeDoubt(s, 1, "景仁宫来人");
  if (def.pair) log(s, `连环：【${EVENTS3[PAIRS[def.pair].opportunity].name}】随之作废。`, "bad");
}

function settleConfront(s: Z3State): void {
  const c = s.confront!;
  const short = Math.max(0, c.needed - c.played.length);
  const tier = confrontOutcome(c.presented, short);
  const ltier = lingrongTier(s.relation);
  const exit = EXIT[tier];
  s.exitTier = tier;
  s.exitTierLingrong = ltier;
  log(s, `景仁宫对质：辩白 ${c.played.length}/${c.needed}。${exit.emperor}`, tier >= 3 ? "bad" : "info");
  log(s, `${LINGRONG_TRUTH[ltier]}`);
  if (tier === 4) {
    lose(s, "景仁宫对质落到“打入冷宫”", "lenggong");
    return;
  }
  log(s, `${exit.emoji} ${exit.name}：${exit.story}${exit.longyue}`, tier === 1 ? "good" : "bad");
  // 出宫清誉按皇后呈上的把柄条数扣，从修行上限起算（先封顶，否则宫中攒的高清誉会把扣减吞掉）；至少留 1
  if (s.qingyu > XIUXING.cap) s.qingyu = XIUXING.cap;
  const loss = Math.min(c.presented, s.qingyu - 1);
  if (loss > 0) applyDelta3(s, { resource: "qingyu", amount: -loss }, `皇后呈上 ${c.presented} 条把柄`);
  applyDeltas3(s, exit.effects, exit.name);
  if (!alive(s)) {
    s.lossKind = "lenggong";
    return;
  }
  s.exitShengchong = s.shengchong;
  s.exitRank = s.rank;
  if (tier === 3) s.arrogance = Math.max(s.arrogance, 1);
  log(s, LINGRONG_FAREWELL[ltier]);
  if (ltier === "close") addStatus3(s, "lingrongDeXiang");
  popup(s, "exit");
}

export function endTurn3(s: Z3State): void {
  s.popups = [];
  // stories → default option
  for (const inst of s.stories) {
    if (inst.chosenOptionId != null || !alive(s)) continue;
    const def = STORIES3[inst.id];
    const option = def.options.find((o) => o.id === def.defaultOptionId)!;
    const msg = option.hidden ? `【${def.name}】未处理，${option.story}` : `未作选择，已按默认选项【${option.name}】处理【${def.name}】。`;
    const delta = applyStoryOption(s, inst, option, msg, null);
    if (delta) changeRelation(s, delta);
  }
  if (!alive(s)) return;

  // 纯元故衣
  if (s.chunyuan) {
    const c = s.chunyuan;
    const result = c.second ? "seen" : c.first ? "half" : "fail";
    s.chunyuanResult = result;
    if (result === "seen") log(s, `【${CHUNYUAN.name}】识破：${CHUNYUAN.successStory}`, "good");
    else {
      log(s, `【${CHUNYUAN.name}】${result === "half" ? "只起了疑" : "没识破"}：${result === "half" ? CHUNYUAN.halfStory : CHUNYUAN.failStory}`, "bad");
      applyDelta3(s, { resource: "shengchong", amount: -(result === "half" ? CHUNYUAN.halfPenalty : CHUNYUAN.failPenalty) }, CHUNYUAN.name);
    }
    popup(s, "chunyuan");
    s.chunyuanPassed = true;
    if (!alive(s)) return;
  }

  // events
  if (s.opportunity && !s.opportunity.resolved) log(s, `机会事件【${EVENTS3[s.opportunity.id].name}】未把握，直接离场。`);
  if (s.opportunity && !s.opportunity.resolved) {
    if (s.opportunity.id === "gongzhongLaixin") jingfeiLetter(s, s.opportunity);
    const secret = EVENTS3[s.opportunity.id].secret;
    if (secret) addSecret(s, secret, null);
  }
  if (s.crisis && !s.crisis.resolved) settleCrisis(s, s.crisis);
  if (!alive(s)) return;
  if (s.huanghou && !s.huanghou.resolved) {
    const def = EVENTS3[s.huanghou.id];
    log(s, `皇后事件【${def.name}】按默认结算。`);
    applyDeltas3(s, def.reward, def.name);
    applyEnvy(s, def);
    addSecret(s, `enshang.${s.huanghou.id as HuanghouId}`, null);
  }
  if (!alive(s)) return;

  // 睹物生疑: every 遗物 still in hand at the end of any turn between 引驾 and 回宫 (and the 偶遇 turn itself)
  const yh = s.yihua;
  if (yh && ((yh.yinjiaTurn != null && yh.step < 5 && s.turn > yh.yinjiaTurn) || yh.ouyuTurn === s.turn)) {
    const n = s.hand.filter((c) => isRelic(c.id)).length;
    if (n > 0) {
      yh.dushu = true;
      log(s, `睹物生疑：${yh.ouyuTurn === s.turn ? YIHUA.dushuStory : YIHUA.dushuNote}`, "bad");
      changeDoubt(s, n, `睹物生疑（手里 ${n} 件遗物）`);
      if (!alive(s)) return;
    }
  }

  // events leave
  if (s.opportunity?.id === PIN_EVENT) {
    if (!s.opportunity.resolved && s.pregnant && s.rank === "guiren") {
      s.opportunityPool = shuffleInto(s, [...s.opportunityPool, PIN_EVENT]);
      log(s, "【请脉报喜】没能稳妥报喜，洗回机会牌池。");
    }
  } else if (s.opportunity) s.opportunityUsed.push(s.opportunity.id as OpportunityId3);
  if (s.crisis && !(s.lizigao && s.crisis.id === "sanAgeYaochong")) s.crisisUsed.push(s.crisis.id as CrisisId3);
  if (s.huanghou) s.huanghouUsed.push(s.huanghou.id as HuanghouId);
  s.opportunity = null;
  s.crisis = null;
  s.huanghou = null;
  s.stories = [];

  // hand: 依依 keeps 陵容 (生分); 冷落
  const tier = tierOf3(s);
  const lingrongLeft = s.hand.some((c) => c.id === "lingrongXiangzhu");
  const keep = tier === "distant" && s.turn < STAGE3.confrontTurn ? s.hand.filter((c) => c.id === "lingrongXiangzhu") : [];
  s.discard.push(...s.hand.filter((c) => !keep.includes(c)));
  s.hand = keep;
  if (keep.length > 0) log(s, `依依：${keep.length} 张【陵容相助】留在手牌中，下回合少抓 ${keep.length} 张。`);
  if (lingrongLeft && tier && s.turn < STAGE3.confrontTurn) {
    if (s.relation > -1) {
      log(s, "陵容来碎玉轩候了半日，宫人说小主正忙着，她没能见上一面。", "bad");
      changeRelation(s, -1);
    } else log(s, "陵容又扑了个空，眼里的光淡了些。", "bad");
  }

  // 肺痨之诬: after the crises (静白嚣张 counted)
  if (s.feilao) {
    const t = feilaoCurrentTier(s);
    s.feilaoTier = t;
    const tierDef = FEILAO.tiers[t]!;
    log(s, `【${FEILAO.name}】${tierDef.name}：${tierDef.story}`, t === 0 ? "info" : "bad");
    // 清誉 -(档位+1)：甲 -1、乙 -2、丙 -3
    const shenzi = t === 0 ? [] : [{ resource: "shenzi" as const, amount: t === 1 ? -1 : -2 }];
    applyDeltas3(s, [...shenzi, { resource: "qingyu", amount: -(t + 1) }], tierDef.name);
    if (alive(s)) {
      if (t === 0) {
        if (!hasStatus3(s, "shitaiBihu")) addStatus3(s, "shitaiBihu");
      } else addStatus3(s, "hanzheng");
    }
    if (!alive(s)) return;
    moveToPeak(s);
    popup(s, "feilao");
  }

  // statuses: end-of-turn effects, then tick
  for (const st of activeStatuses(s)) {
    const fx = STATUSES3[st.id].turnEnd;
    if (fx && alive(s)) applyDeltas3(s, fx, STATUSES3[st.id].name);
  }
  if (!alive(s)) return;
  for (const st of s.statuses) if (!STATUSES3[st.id].permanent && st.appliesFromTurn <= s.turn) st.remaining--;
  for (const st of s.statuses.filter((x) => !STATUSES3[x.id].permanent && x.remaining <= 0)) {
    log(s, `状态【${STATUSES3[st.id].name}】结束。`);
    if (st.id === "wochuangJingyang") s.shenzi = Math.max(s.shenzi, 1);
  }
  s.statuses = s.statuses.filter((x) => STATUSES3[x.id].permanent || x.remaining > 0);
  if (hasStatus3(s, "lingrongDeXiang") && STAGE3.fragranceTurns.includes(s.turn)) applyDelta3(s, { resource: "shenzi", amount: 1 }, "暗香盈袖");
  if (!alive(s)) return;

  // scheduled additions
  if (s.turn === 2) {
    s.huanghouPool = shuffleInto(s, HUANGHOU_EVENTS);
    log(s, "🏵️ 从下一回合起，每回合会有一张皇后事件。");
    popup(s, "huanghou");
  }
  if (s.turn === 5) {
    s.crisisPool = shuffleInto(s, [...s.crisisPool, "emingCanben"]);
    log(s, "前朝起了风波：【鄂敏参本】洗入危机池。", "bad");
  }
  // 甄远道已在第 8 回合下狱，折子的事有了定论，不会再出现。
  if (s.turn === 9) removeFromPools(s, ["emingCanben"]);

  // 景仁宫对质
  if (s.confront) {
    settleConfront(s);
    if (!alive(s)) return;
  }

  // 移花接木
  const y = s.yihua;
  if (y) {
    if (y.step === 5) {
      s.outcome = "won";
      const perfect = y.doneTurn != null && y.doneTurn < STAGE3.perfectBefore && relicsKept(s) === 0 && s.exitTier === 1 && y.dengmen?.openTurn === y.doneTurn;
      const narrow = s.exitTier === 3;
      s.victory = narrow ? "narrow" : perfect ? "perfect" : "return";
      log(s, narrow ? "凤阙归来（险胜）：皇上心存疑虑，仍下旨接你回宫。" : perfect ? "凤阙归来：完胜！" : "凤阙归来：钮祜禄氏，封熹妃，即日回宫。", "good");
      return;
    }
    const dm = y.dengmen;
    if (y.step === 4 && dm && s.turn >= Math.min(dm.openTurn + 1, STAGE3.totalTurns)) {
      if (dm.needed - dm.played.length === 1) {
        y.step = 5;
        y.doneTurn = s.turn;
        s.outcome = "won";
        s.victory = "narrow";
        log(s, `④ 登门：${dengmenCloseText("narrow", s.exitTier)}`, "good");
        log(s, "凤阙归来（险胜）：皇上心存疑虑，仍下旨接你回宫。", "good");
      } else lose(s, "登门两回合内解牌不足，皇上拂袖而去", "deadline");
      return;
    }
    if (y.step === 2 && y.ouyuDue === s.turn) {
      y.ouyuDue = s.turn + YIHUA.ouyuRetry;
      log(s, `偶遇没成：皇上这回没见着你，隔一回合还会再来（第 ${y.ouyuDue} 回合）。`, "bad");
    }
    if (y.step < 3) changeDoubt(s, 1, "召幸迟迟未成，月份越差越多");
    if (!alive(s)) return;
    if (s.turn >= STAGE3.totalTurns) {
      lose(s, "第 33 回合末移花接木仍未完成", "deadline");
      return;
    }
  }

  beginTurn3(s, s.turn + 1);
}

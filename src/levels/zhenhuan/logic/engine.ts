/**
 * 甄嬛传 · 第一关 rules engine. Pure and deterministic: the same seed + action list always
 * yields the same state (used for autosave and run codes). Rules: `../docs/design.md`.
 */
import { createRngFromSeed, shuffle } from "../../../logic/rng";
import type { RngSerialized } from "../../../types/game";
import {
  CARDS,
  CHAPTER,
  CRISIS_POOL,
  ENVY_POOL,
  ENVY_TRIGGER,
  EVENT_KIND_LABEL,
  EVENTS,
  OPENING,
  OPPORTUNITY_POOL,
  PROMOTION_TRIAL,
  RANKS,
  RESOURCE_LABEL,
  STARTING_DECK,
  STATUSES,
  STORIES,
  type CardId,
  type CrisisId,
  type EnvyId,
  type EventId,
  type EventKind,
  type OpportunityId,
  type RankId,
  type ResourceDelta,
  type StatusId,
  type StoryDef,
  type StoryId,
  type StoryOptionDef,
  type TagId,
  TAG_INFO,
} from "../data/content";

export type CardInst = { readonly uid: string; readonly id: CardId };
export type EventInst = {
  readonly uid: string;
  readonly id: EventId;
  resolved: boolean;
  /** Card that resolved it (for the resolved mark). */
  resolvedBy?: CardId;
  /** 眉庄相助 doubled the opportunity reward. */
  rewardDoubled?: boolean;
};
export type StatusInst = {
  readonly uid: string;
  readonly id: StatusId;
  /** First turn whose draw the status modifies (the turn after it was gained). */
  readonly appliesFromTurn: number;
  /** Turns of effect left; ticks at end of each turn it applied to. */
  remaining: number;
};
export type LogTone = "info" | "good" | "bad";
export type LogEntry = { readonly turn: number; readonly text: string; readonly tone: LogTone };

export type ZhAction =
  | { readonly type: "playCard"; readonly cardUid: string }
  | { readonly type: "chooseStory"; readonly optionId: string }
  | { readonly type: "removeStatus"; readonly statusUid: string }
  | { readonly type: "cancelPending" }
  | { readonly type: "endTurn" }
  /** UI-only: explains a clicked tag in the log. Not recorded (no effect on the run). */
  | { readonly type: "explainTag"; readonly tag: TagId };

export type ZhOutcome = "playing" | "won" | "lost";

export type ZhState = {
  seed: number;
  rng: RngSerialized;
  turn: number;
  rank: RankId;
  qingyu: number;
  shengchong: number;
  drawPile: CardInst[];
  hand: CardInst[];
  discard: CardInst[];
  opportunityPool: OpportunityId[];
  opportunityUsed: OpportunityId[];
  crisisPool: CrisisId[];
  crisisUsed: CrisisId[];
  envyPool: EnvyId[];
  envyUsed: EnvyId[];
  opportunity: EventInst | null;
  crisis: EventInst | null;
  /** 嫉妒事件 (extra third event while 圣宠 is high). */
  envy: EventInst | null;
  /** Turn the current ≥ 5 streak last drew a 嫉妒事件; null when the streak is broken. */
  envyLastTurn: number | null;
  story: { id: StoryId; chosenOptionId: string | null } | null;
  trial: { active: boolean; keyCardPlayed: boolean };
  promoted: boolean;
  statuses: StatusInst[];
  playsUsed: number;
  extraPlays: number;
  drawnThisTurn: number;
  /** 温太医相助 waiting for the player to pick which negative status to remove. */
  pending: { cardUid: string } | null;
  outcome: ZhOutcome;
  lossReason: string | null;
  log: LogEntry[];
  actions: ZhAction[];
  /** `actions.length` at the start of the current turn (autosave point). */
  turnStartActionCount: number;
  nextUid: number;
};

// ---------------------------------------------------------------- queries

export function playLimit(s: ZhState): number {
  return RANKS[s.rank].plays + s.extraPlays;
}

export function playsLeft(s: ZhState): number {
  return Math.max(0, playLimit(s) - s.playsUsed);
}

export function cap(s: ZhState): number {
  return RANKS[s.rank].cap;
}

export function negativeStatuses(s: ZhState): StatusInst[] {
  return s.statuses.filter((st) => STATUSES[st.id].tag === "negative");
}

export function drawModifierForTurn(s: ZhState, turn: number): number {
  return s.statuses
    .filter((st) => st.appliesFromTurn <= turn)
    .reduce((sum, st) => sum + STATUSES[st.id].drawModifier, 0);
}

export function drawCountForTurn(s: ZhState, turn: number): number {
  return Math.max(1, RANKS[s.rank].draw + drawModifierForTurn(s, turn));
}

export function currentStory(s: ZhState): StoryDef | null {
  return s.story ? STORIES[s.story.id] : null;
}

/** Statuses that block `cardId` from being played this turn. */
export function blockingStatuses(s: ZhState, cardId: CardId): StatusInst[] {
  return s.statuses.filter((st) => st.appliesFromTurn <= s.turn && (STATUSES[st.id].blocksCards ?? []).includes(cardId));
}

/** Events in play that `cardId` would resolve if played now. */
export function matchedEvents(s: ZhState, cardId: CardId): EventInst[] {
  const matches = CARDS[cardId].matches;
  return [s.opportunity, s.crisis, s.envy].filter(
    (e): e is EventInst => e != null && !e.resolved && matches.includes(e.id),
  );
}

export type TrialProgress = { shengchong: boolean; qingyu: boolean; keyCard: boolean; all: boolean };

export function trialProgress(s: ZhState): TrialProgress {
  const shengchong = s.shengchong >= PROMOTION_TRIAL.minShengchong;
  const qingyu = s.qingyu >= PROMOTION_TRIAL.minQingyu;
  const keyCard = s.trial.keyCardPlayed;
  return { shengchong, qingyu, keyCard, all: shengchong && qingyu && keyCard };
}

/** Basic (no-card) options of a story event: the only ones chosen on the event itself. */
export function storyBasicOptions(story: StoryDef): StoryOptionDef[] {
  return story.options.filter((o) => !o.card);
}

/** Card responses of a story event: resolved by playing that card from hand. */
export function storyCardResponses(story: StoryDef): StoryOptionDef[] {
  return story.options.filter((o) => o.card);
}

/** The open story's response to `cardId`, if playing it now would resolve the story. */
export function storyResponseFor(s: ZhState, cardId: CardId): StoryOptionDef | undefined {
  const story = currentStory(s);
  if (!story || s.story?.chosenOptionId != null) return undefined;
  return story.options.find((o) => o.card === cardId);
}

export function canEndTurn(s: ZhState): boolean {
  return s.outcome === "playing" && s.pending == null;
}

// ---------------------------------------------------------------- mutation helpers (operate on a draft)

function log(s: ZhState, text: string, tone: LogTone = "info"): void {
  s.log.push({ turn: s.turn, text, tone });
}

function lose(s: ZhState, reason: string): void {
  if (s.outcome !== "playing") return;
  s.outcome = "lost";
  s.lossReason = reason;
  log(s, `失败：${reason}`, "bad");
}

function applyDelta(s: ZhState, d: ResourceDelta, source: string): void {
  if (s.outcome !== "playing" || d.amount === 0) return;
  const label = RESOURCE_LABEL[d.resource];
  const cur = s[d.resource];
  if (d.amount > 0) {
    const next = Math.min(cap(s), cur + d.amount);
    s[d.resource] = next;
    const capped = next - cur < d.amount ? `（上限 ${cap(s)}，溢出部分忽略）` : "";
    log(s, `${source}：${label} +${d.amount}${capped} → ${next}`, "good");
    return;
  }
  const next = Math.max(0, cur + d.amount);
  s[d.resource] = next;
  log(s, `${source}：${label} ${d.amount} → ${next}`, "bad");
  if (next <= 0) lose(s, `${label}降至 0`);
}

function applyDeltas(s: ZhState, deltas: readonly ResourceDelta[], source: string): void {
  for (const d of deltas) {
    if (s.outcome !== "playing") return;
    applyDelta(s, d, source);
  }
}

function drawCards(s: ZhState, n: number): void {
  for (let i = 0; i < n; i++) {
    if (s.drawPile.length === 0) {
      if (s.discard.length === 0) {
        log(s, "抽牌堆与弃牌堆都已空，无法继续抽牌。");
        return;
      }
      const [rng, shuffled] = shuffle(s.rng, s.discard);
      s.rng = rng;
      s.drawPile = shuffled;
      s.discard = [];
      log(s, `弃牌堆洗回抽牌堆（${s.drawPile.length} 张）。`);
    }
    const card = s.drawPile.shift()!;
    s.hand.push(card);
    s.drawnThisTurn++;
  }
}

const POOL_KEYS = {
  opportunity: ["opportunityPool", "opportunityUsed"],
  crisis: ["crisisPool", "crisisUsed"],
  envy: ["envyPool", "envyUsed"],
} as const;

function drawEvent<T extends EventId>(s: ZhState, kind: EventKind): T {
  const [poolKey, usedKey] = POOL_KEYS[kind];
  if (s[poolKey].length === 0) {
    const [rng, shuffled] = shuffle(s.rng, s[usedKey] as EventId[]);
    s.rng = rng;
    (s[poolKey] as EventId[]) = shuffled;
    (s[usedKey] as EventId[]) = [];
    log(s, `${EVENT_KIND_LABEL[kind]}牌池已抽完，已用事件重新洗匀。`);
  }
  return (s[poolKey] as EventId[]).shift() as T;
}

function addStatus(s: ZhState, id: StatusId): void {
  const def = STATUSES[id];
  s.statuses.push({ uid: `s${s.nextUid++}`, id, appliesFromTurn: s.turn + 1, remaining: def.duration });
  log(s, `获得状态【${def.name}】（${def.effectText}）`, def.tag === "negative" ? "bad" : "good");
}

function removeStatus(s: ZhState, uid: string, source: string): void {
  const st = s.statuses.find((x) => x.uid === uid);
  if (!st) return;
  s.statuses = s.statuses.filter((x) => x.uid !== uid);
  log(s, `${source}：移除状态【${STATUSES[st.id].name}】`, "good");
}

function setEvent(s: ZhState, kind: EventKind, id: EventId): void {
  const inst: EventInst = { uid: `${kind}-${s.turn}`, id, resolved: false };
  s[kind] = inst;
  log(s, `${EVENT_KIND_LABEL[kind]}事件：【${EVENTS[id].name}】`, kind === "envy" ? "bad" : "info");
}

/** 剧情文本 for how `cardId` resolved event `id`. */
export function eventResolvedStory(id: EventId, cardId: CardId | undefined): string | undefined {
  return cardId ? EVENTS[id].resolvedStory[cardId] : undefined;
}

function logResolvedStory(s: ZhState, id: EventId, cardId: CardId): void {
  const text = eventResolvedStory(id, cardId);
  if (text) log(s, text);
}

/**
 * Resolves one played card (design.md §4 order): base effect (or story option), opportunity
 * reward, crisis, linkage, extra effect. Each step is defeat-checked.
 */
function resolvePlay(
  s: ZhState,
  cardUid: string,
  opts: { storyOption?: StoryOptionDef; removeStatusUid?: string } = {},
): void {
  const idx = s.hand.findIndex((c) => c.uid === cardUid);
  if (idx < 0) return;
  const [card] = s.hand.splice(idx, 1) as [CardInst];
  const def = CARDS[card.id];
  s.playsUsed++;

  const opp = s.opportunity && !s.opportunity.resolved && def.matches.includes(s.opportunity.id) ? s.opportunity : null;
  const crisis = s.crisis && !s.crisis.resolved && def.matches.includes(s.crisis.id) ? s.crisis : null;
  const envy = s.envy && !s.envy.resolved && def.matches.includes(s.envy.id) ? s.envy : null;

  const option = opts.storyOption;
  const story = currentStory(s);
  log(s, option && story ? `打出【${def.name}】用于【${story.name}】·${option.name}` : `打出【${def.name}】`);

  if (s.trial.active && PROMOTION_TRIAL.keyCards.includes(card.id) && !s.trial.keyCardPlayed) {
    s.trial.keyCardPlayed = true;
    log(s, `晋封考验：已打出【${def.name}】，条件达成。`, "good");
  }

  // 1. story option (if this card answers the open story), then the card's own base effect
  if (option && story) {
    s.story = { id: story.id, chosenOptionId: option.id };
    log(s, option.story);
    applyDeltas(s, option.effects, `${story.name}·${option.name}`);
    if (option.gainStatus && s.outcome === "playing") addStatus(s, option.gainStatus);
    if (option.epilogue && s.outcome === "playing") log(s, option.epilogue, "good");
  }
  if (s.outcome === "playing") {
    applyDeltas(s, def.base, def.name);
    if (def.baseStatus && s.outcome === "playing") addStatus(s, def.baseStatus);
    if (def.baseDraw > 0 && s.outcome === "playing") drawCards(s, def.baseDraw);
  }

  // 2. opportunity reward
  if (opp && s.outcome === "playing") {
    opp.resolved = true;
    opp.resolvedBy = card.id;
    log(s, `解决机会事件【${EVENTS[opp.id].name}】`, "good");
    logResolvedStory(s, opp.id, card.id);
    applyDeltas(s, EVENTS[opp.id].reward, EVENTS[opp.id].name);
  }

  // 3. crisis and 嫉妒事件
  for (const ev of [crisis, envy]) {
    if (!ev || s.outcome !== "playing") continue;
    ev.resolved = true;
    ev.resolvedBy = card.id;
    log(s, `解决${EVENT_KIND_LABEL[EVENTS[ev.id].kind]}事件【${EVENTS[ev.id].name}】`, "good");
    logResolvedStory(s, ev.id, card.id);
  }

  // 4. linkage
  if (s.outcome === "playing") {
    if (card.id === "shoulongRenxin" && crisis?.id === "neiwufuDiaonan") {
      log(s, "收拢人心联动：额外抽 1 张牌。", "good");
      drawCards(s, 1);
    }
    if (card.id === "meizhuangXiangzhu" && opp) {
      opp.rewardDoubled = true;
      applyDeltas(s, EVENTS[opp.id].reward, "眉庄相助联动：奖励翻倍");
    }
  }

  // 5. extra effect
  if (s.outcome === "playing") {
    if (card.id === "jingguanQibian") {
      s.extraPlays++;
      log(s, `静观其变：本回合最多出牌数 +1（现为 ${playLimit(s)}）。`, "good");
    }
    if (card.id === "wenTaiyiZhenzhi") {
      const negatives = negativeStatuses(s);
      const target = opts.removeStatusUid ?? (negatives.length === 1 ? negatives[0]!.uid : undefined);
      if (target) removeStatus(s, target, def.name);
      else log(s, "温太医相助：没有负面状态可移除。");
    }
  }

  s.discard.push(card);
}

function applyStoryBasicOption(s: ZhState, story: StoryDef, option: StoryOptionDef, source: string): void {
  s.story = { id: story.id, chosenOptionId: option.id };
  log(s, source);
  log(s, option.story);
  applyDeltas(s, option.effects, `${story.name}·${option.name}`);
  if (option.gainStatus && s.outcome === "playing") addStatus(s, option.gainStatus);
  if (option.epilogue && s.outcome === "playing") log(s, option.epilogue, "good");
}

function beginTurn(s: ZhState, turn: number): void {
  s.turn = turn;
  s.playsUsed = 0;
  s.extraPlays = 0;
  s.drawnThisTurn = 0;
  const drawCount = drawCountForTurn(s, turn);
  const mod = drawModifierForTurn(s, turn);
  log(s, `—— 第 ${turn} 回合 ——`);

  const story = Object.values(STORIES).find((st) => st.turn === turn);
  if (story) {
    s.story = { id: story.id, chosenOptionId: null };
    log(s, `剧情事件：【${story.name}】`);
  }
  if (turn === PROMOTION_TRIAL.firstTurn && !s.promoted) {
    s.trial = { active: true, keyCardPlayed: false };
    log(s, `剧情事件：【${PROMOTION_TRIAL.name}】开始（第 ${PROMOTION_TRIAL.firstTurn}—${PROMOTION_TRIAL.lastTurn} 回合）`);
  }

  setEvent(s, "opportunity", drawEvent(s, "opportunity"));
  setEvent(s, "crisis", drawEvent(s, "crisis"));
  checkEnvy(s);

  drawCards(s, drawCount);
  log(s, `抓 ${drawCount} 张牌${mod !== 0 ? `（状态修正 ${mod > 0 ? "+" : ""}${mod}，最低 1 张）` : ""}。`);
}

/** 嫉妒事件 trigger, at turn start (design.md §7.4). */
function checkEnvy(s: ZhState): void {
  if (s.turn < ENVY_TRIGGER.firstTurn || s.shengchong < ENVY_TRIGGER.minShengchong) {
    s.envyLastTurn = null;
    return;
  }
  if (s.envyLastTurn != null && s.turn - s.envyLastTurn < ENVY_TRIGGER.interval) return;
  s.envyLastTurn = s.turn;
  log(s, `圣宠 ≥ ${ENVY_TRIGGER.minShengchong}，树大招风：`, "bad");
  setEvent(s, "envy", drawEvent(s, "envy"));
}

function endTurn(s: ZhState): void {
  // 9. single-choice story not chosen → default option
  const story = currentStory(s);
  if (story && s.story && s.story.chosenOptionId == null) {
    const option = story.options.find((o) => o.id === story.defaultOptionId)!;
    applyStoryBasicOption(s, story, option, `未作选择，已按默认选项【${option.name}】处理【${story.name}】。`);
    if (s.outcome !== "playing") return;
  }

  // 10. unresolved ordinary events
  if (s.opportunity && !s.opportunity.resolved) {
    log(s, `机会事件【${EVENTS[s.opportunity.id].name}】未处理，直接离场。`);
  }
  for (const ev of [s.crisis, s.envy]) {
    if (!ev || ev.resolved || s.outcome !== "playing") continue;
    const def = EVENTS[ev.id];
    log(s, `${EVENT_KIND_LABEL[def.kind]}事件【${def.name}】未处理：${def.unresolvedText}。`, "bad");
    applyDeltas(s, def.penalty, def.name);
    if (def.penaltyStatus && s.outcome === "playing") addStatus(s, def.penaltyStatus);
  }
  if (s.outcome !== "playing") return;

  // 11. events to used areas
  if (s.opportunity) s.opportunityUsed.push(s.opportunity.id as OpportunityId);
  if (s.crisis) s.crisisUsed.push(s.crisis.id as CrisisId);
  if (s.envy) s.envyUsed.push(s.envy.id as EnvyId);
  s.opportunity = null;
  s.crisis = null;
  s.envy = null;
  s.story = null;

  // 12. hand to discard
  s.discard.push(...s.hand);
  s.hand = [];

  // 13. tick statuses that applied this turn
  for (const st of s.statuses) {
    if (st.appliesFromTurn <= s.turn) st.remaining--;
  }
  for (const st of s.statuses.filter((x) => x.remaining <= 0)) {
    log(s, `状态【${STATUSES[st.id].name}】结束。`);
  }
  s.statuses = s.statuses.filter((x) => x.remaining > 0);

  // 14. promotion trial
  if (s.trial.active) {
    if (trialProgress(s).all) {
      s.trial.active = false;
      s.promoted = true;
      s.rank = PROMOTION_TRIAL.promoteTo;
      const rank = RANKS[s.rank];
      log(
        s,
        `晋封成功！位分晋升为【${rank.name}】：每回合抓 ${rank.draw} 打 ${rank.plays}，清誉 / 圣宠上限 ${rank.cap}。坚持到第 ${CHAPTER.totalTurns} 回合结束即可通关。`,
        "good",
      );
    } else if (s.turn >= PROMOTION_TRIAL.lastTurn) {
      s.trial.active = false;
      lose(s, `第 ${PROMOTION_TRIAL.lastTurn} 回合结束时仍未通过晋封考验`);
      return;
    }
  }

  // 15. chapter end
  if (s.turn >= CHAPTER.totalTurns) {
    s.outcome = "won";
    log(s, `第 ${CHAPTER.totalTurns} 回合结束，第一关胜利！`, "good");
    return;
  }

  beginTurn(s, s.turn + 1);
}

// ---------------------------------------------------------------- public API

function takeFirst<T>(arr: T[], value: T): T {
  const i = arr.indexOf(value);
  if (i < 0) throw new Error(`missing ${String(value)}`);
  return arr.splice(i, 1)[0]!;
}

export function newGame(seed: number): ZhState {
  let rng = createRngFromSeed(seed);
  let nextUid = 1;
  const deck: CardInst[] = STARTING_DECK.map((id) => ({ uid: `c${nextUid++}`, id }));
  const hand: CardInst[] = OPENING.hand.map((id) => {
    const i = deck.findIndex((c) => c.id === id);
    return deck.splice(i, 1)[0]!;
  });
  let drawPile: CardInst[];
  [rng, drawPile] = shuffle(rng, deck);

  const oppRest = [...OPPORTUNITY_POOL];
  takeFirst(oppRest, OPENING.opportunity);
  const crisisRest = [...CRISIS_POOL];
  takeFirst(crisisRest, OPENING.crisis);
  let opportunityPool: OpportunityId[];
  let crisisPool: CrisisId[];
  [rng, opportunityPool] = shuffle(rng, oppRest);
  [rng, crisisPool] = shuffle(rng, crisisRest);
  let envyPool: EnvyId[];
  [rng, envyPool] = shuffle(rng, [...ENVY_POOL]);

  const s: ZhState = {
    seed,
    rng,
    turn: 1,
    rank: CHAPTER.startRank,
    qingyu: CHAPTER.startQingyu,
    shengchong: CHAPTER.startShengchong,
    drawPile,
    hand,
    discard: [],
    opportunityPool,
    opportunityUsed: [],
    crisisPool,
    crisisUsed: [],
    envyPool,
    envyUsed: [],
    opportunity: null,
    crisis: null,
    envy: null,
    envyLastTurn: null,
    story: null,
    trial: { active: false, keyCardPlayed: false },
    promoted: false,
    statuses: [],
    playsUsed: 0,
    extraPlays: 0,
    drawnThisTurn: hand.length,
    pending: null,
    outcome: "playing",
    lossReason: null,
    log: [],
    actions: [],
    turnStartActionCount: 0,
    nextUid,
  };
  log(s, "—— 第 1 回合 ——");
  setEvent(s, "opportunity", OPENING.opportunity);
  setEvent(s, "crisis", OPENING.crisis);
  log(s, "开局固定手牌：收拢人心、仪容整肃、静观其变。");
  return s;
}

/** Returns the next state, or the same object when the action is not legal right now. */
export function reduce(state: ZhState, action: ZhAction): ZhState {
  if (state.outcome !== "playing" && action.type !== "explainTag") return state;
  const s = structuredClone(state);
  switch (action.type) {
    case "playCard": {
      if (s.pending) return state;
      const card = s.hand.find((c) => c.uid === action.cardUid);
      if (!card || playsLeft(s) <= 0 || blockingStatuses(s, card.id).length > 0) return state;
      if (card.id === "wenTaiyiZhenzhi" && negativeStatuses(s).length > 1) {
        s.pending = { cardUid: card.uid };
        log(s, "温太医相助：请选择要移除的负面状态（可取消）。");
      } else {
        resolvePlay(s, card.uid, { storyOption: storyResponseFor(s, card.id) });
      }
      break;
    }
    case "removeStatus": {
      if (!s.pending) return state;
      const st = negativeStatuses(s).find((x) => x.uid === action.statusUid);
      if (!st) return state;
      const cardUid = s.pending.cardUid;
      const pendingCard = s.hand.find((c) => c.uid === cardUid);
      s.pending = null;
      resolvePlay(s, cardUid, {
        removeStatusUid: st.uid,
        storyOption: pendingCard ? storyResponseFor(s, pendingCard.id) : undefined,
      });
      break;
    }
    case "cancelPending": {
      if (!s.pending) return state;
      s.pending = null;
      log(s, "已取消打出温太医相助。");
      break;
    }
    case "chooseStory": {
      if (s.pending) return state;
      const story = currentStory(s);
      if (!story || !s.story || s.story.chosenOptionId != null) return state;
      // Cards are always played from hand; only basic options are chosen on the event.
      const option = storyBasicOptions(story).find((o) => o.id === action.optionId);
      if (!option) return state;
      applyStoryBasicOption(s, story, option, `【${story.name}】选择：${option.name}`);
      break;
    }
    case "explainTag": {
      const info = TAG_INFO[action.tag];
      s.log.push({ turn: s.turn, text: `【${info.label}】${info.lore}`, tone: "info" });
      s.log.push({ turn: s.turn, text: `机制：${info.rules}`, tone: "info" });
      return s;
    }
    case "endTurn": {
      if (!canEndTurn(s)) return state;
      s.actions.push(action);
      endTurn(s);
      s.turnStartActionCount = s.actions.length;
      return s;
    }
  }
  s.actions.push(action);
  return s;
}

/** Rebuilds a run from its seed and action list; fails if any action is rejected. */
export function replay(seed: number, actions: readonly ZhAction[]): ZhState {
  let s = newGame(seed);
  for (const [i, a] of actions.entries()) {
    const next = reduce(s, a);
    if (next === s) throw new Error(`第 ${i + 1} 步操作无法复现`);
    s = next;
  }
  return s;
}

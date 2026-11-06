import { RunCodePanel } from "../../../components/RunCodePanel";
import { useSmallScreen } from "../../../logic/useSmallScreen";
import { CAMPAIGN_TITLE } from "../data/content";
import {
  ACT_TITLE,
  PLAYS_INFO3,
  POPUP_TEXT,
  type PopupId,
  RANKS,
  RESOURCE_INFO3,
  SHENZI,
  STAGE3,
  TAG3_INFO,
  XIUXING,
} from "../data/stage3Content";
import { canEndTurn3, openStories3, playLimit3, rankCap3, rankName3 } from "../logic/stage3Engine";
import { useEffect, useRef, useState } from "react";
import { type Fold, GameHeader, LogView, Pile, PileGroup, ScrollRow, StatChip, isTypingTarget } from "./common";
import { EventCard, StoryCard } from "./stage3/EventCards";
import { HandCard, Statuses, endTurnHints } from "./stage3/HandArea";
import { Notice, OutcomeModal, PopupBody, popupTitle } from "./stage3/Popups";
import { ChangxiangsiCard, ChunyuanCard, ConfrontCard, FeilaoCard, NoticeCard, YihuaCard } from "./stage3/SpecialCards";
import { CardList, EventList, type Props } from "./stage3/parts";
import styles from "./zhenhuan.module.css";


// ---------------------------------------------------------------- game

export function Stage3Rules() {
  return (
    <ul>
      <li>
        华妃倒了，翊坤宫的门关上了。你在碎玉轩，是六宫里最得宠的那一个；眉庄的冤屈也洗清了，复了位分。可景仁宫的<strong>皇后</strong>，从来不是表面上那样温和。
      </li>
      <li>守住 🪷清誉 与 👑圣宠，任一项降到 0 即失败。</li>
      {POPUP_TEXT.eventRules.map((l) => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  );
}

type Shown = { seed: number; ids: PopupId[] };

export function Stage3Game({ state, dispatch, runCode, showRules, onShowRules, onRestart, onMenu, onLoadCode }: Props) {
  const compact = useSmallScreen();
  const hints = endTurnHints(state);

  // Story popups raised by the latest action (shown once; not when a save or code is loaded mid-run).
  const [queue, setQueue] = useState<PopupId[]>(() => (state.actions.length === 0 ? [...state.popups] : []));
  const prev = useRef<{ seed: number; actions: number; popups: PopupId[] } | null>(null);
  const shown = useRef<Shown>({ seed: state.seed, ids: state.actions.length === 0 ? [...state.popups] : [] });
  useEffect(() => {
    const p = prev.current;
    prev.current = { seed: state.seed, actions: state.actions.length, popups: state.popups };
    if (!p || p.seed !== state.seed) {
      if (p && p.seed !== state.seed) {
        shown.current = { seed: state.seed, ids: state.actions.length === 0 ? [...state.popups] : [] };
        setQueue(state.actions.length === 0 ? [...state.popups] : []);
      }
      return;
    }
    if (state.actions.length <= p.actions) return;
    const fresh = state.popups.filter((id) => !shown.current.ids.includes(id) && !p.popups.includes(id));
    if (fresh.length === 0) return;
    shown.current.ids.push(...fresh);
    setQueue((q) => [...q, ...fresh]);
  }, [state]);
  const popup = queue[0] ?? null;

  const endTurnReady = canEndTurn3(state) && !showRules && popup == null;
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== " " && event.code !== "Space") return;
      if (event.defaultPrevented || isTypingTarget(event.target)) return;
      if (!endTurnReady) return;
      event.preventDefault();
      dispatch({ type: "endTurn" });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [endTurnReady, dispatch]);

  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const fold = (key: string): Fold => ({
    compact,
    expanded: expandedKey === key,
    onToggle: () => setExpandedKey((cur) => (cur === key ? null : key)),
  });

  const draw = state.act === 1 ? RANKS[state.turnRank].draw : XIUXING.draw;
  const plays = state.act === 1 ? RANKS[state.turnRank].plays : XIUXING.plays;
  const shengchongShown = state.act === 1 || (state.yihua != null && state.yihua.step >= 3);
  const badges = compact ? [] : [{ text: ACT_TITLE[state.act] }];
  const boardCount = [state.crisis, state.opportunity, state.huanghou].filter((e) => e != null);
  const unresolved = boardCount.filter((e) => !e.resolved).length + openStories3(state).length;

  return (
    <div className={[styles.page, compact && styles.compact].filter(Boolean).join(" ")}>
      <GameHeader
        compact={compact}
        campaignTitle={CAMPAIGN_TITLE}
        stageTitle={STAGE3.title}
        turn={state.turn}
        totalTurns={STAGE3.totalTurns}
        rankName={rankName3(state)}
        rankDetail={`抓 ${draw} · 打 ${plays} · 上限 ${rankCap3(state)}`}
        badges={badges}
        onRules={() => onShowRules(true)}
        onRestart={onRestart}
        onMenu={onMenu}
      />

      <div id="zh-tut-stats" className={styles.topStrip}>
        <ScrollRow className={styles.stats}>
          <StatChip icon="🪷" label="清誉" hint="（归 0 即失败）" info={RESOURCE_INFO3.qingyu} value={state.qingyu} max={rankCap3(state)} danger={state.qingyu <= 1} />
          {shengchongShown ? (
            <StatChip
              icon="👑"
              label="圣宠"
              hint={state.act === 1 ? "（归 0 即失败）" : undefined}
              info={RESOURCE_INFO3.shengchong}
              value={state.shengchong}
              max={state.act === 1 ? rankCap3(state) : undefined}
              danger={state.act === 1 && state.shengchong <= 1}
            />
          ) : null}
          <StatChip icon="🌱" label="身子" info={RESOURCE_INFO3.shenzi} value={state.shenzi} max={SHENZI.max} danger={state.shenzi <= 1} />
          <span className={styles.stripDivider} aria-hidden="true" />
          <StatChip icon="🀄" label="本回合出牌" info={PLAYS_INFO3} value={state.playsUsed} max={playLimit3(state)} meter={false} />
          <PileGroup compact={compact}>
            <Pile icon="🎴" label="抽牌堆" count={state.drawPile.length}>
              <p className={styles.popoverTitle}>抽牌堆剩余（顺序未知）</p>
              <CardList ids={state.drawPile.map((c) => c.id)} empty="已空，需要时将弃牌堆洗回。" />
            </Pile>
            <Pile icon="🗑️" label="弃牌堆" count={state.discard.length}>
              <p className={styles.popoverTitle}>弃牌堆</p>
              <CardList ids={state.discard.map((c) => c.id)} empty="空" />
            </Pile>
            {state.departed.length > 0 ? (
              <Pile icon="🕯️" label="已离场" count={state.departed.length}>
                <p className={styles.popoverTitle}>已离场（含封存的宫中牌）</p>
                <CardList ids={state.departed.map((c) => c.id)} empty="无" />
              </Pile>
            ) : null}
            <Pile icon="🌸" label="机会牌池" tag={TAG3_INFO.opportunity} count={state.opportunityPool.length}>
              <p className={styles.popoverTitle}>剩余机会事件</p>
              <EventList ids={state.opportunityPool} empty="已抽完，下次将把已用事件重新洗匀。" />
              <p className={styles.popoverTitle}>本轮已出现</p>
              <EventList ids={state.opportunity ? [...state.opportunityUsed, state.opportunity.id] : state.opportunityUsed} empty="无" />
            </Pile>
            <Pile icon="⚡" label="危机牌池" tag={TAG3_INFO.crisis} count={state.crisisPool.length}>
              <p className={styles.popoverTitle}>剩余危机事件</p>
              <EventList ids={state.crisisPool} empty="已抽完，下次将把已用事件重新洗匀。" />
              <p className={styles.popoverTitle}>本轮已出现</p>
              <EventList ids={state.crisis ? [...state.crisisUsed, state.crisis.id] : state.crisisUsed} empty="无" />
            </Pile>
            {state.act === 1 && state.turn >= 2 ? (
              <Pile icon="🏵️" label="皇后事件" tag={TAG3_INFO.huanghou} count={state.huanghouPool.length}>
                <p className={styles.popoverTitle}>本轮还没出现</p>
                <EventList ids={state.huanghouPool} empty="已轮过一遍。" />
                <p className={styles.popoverTitle}>本轮已出现</p>
                <EventList ids={state.huanghouUsed} empty="无" />
              </Pile>
            ) : null}
          </PileGroup>
        </ScrollRow>
        <Statuses state={state} dispatch={dispatch} />
      </div>

      <h2 className={styles.sectionTitle}>
        本回合事件 <span title="未解决的事件与剧情">{unresolved}</span>
      </h2>
      <ScrollRow id="zh-tut-events" className={styles.events}>
        <YihuaCard state={state} fold={fold("yihua")} dispatch={dispatch} />
        {state.notices.map((n) => (
          <NoticeCard key={n.name} emoji={n.emoji} name={n.name} text={n.text} fold={fold(`notice-${n.name}`)} />
        ))}
        <ConfrontCard state={state} fold={fold("confront")} dispatch={dispatch} />
        <FeilaoCard state={state} fold={fold("feilao")} dispatch={dispatch} />
        <ChunyuanCard state={state} fold={fold("chunyuan")} dispatch={dispatch} />
        <ChangxiangsiCard state={state} fold={fold("changxiangsi")} dispatch={dispatch} />
        {state.stories.map((inst, i) => (
          <StoryCard key={`${inst.id}-${i}`} state={state} inst={inst} dispatch={dispatch} fold={fold(`story-${inst.id}-${i}`)} />
        ))}
        {state.crisis ? <EventCard state={state} inst={state.crisis} fold={fold(state.crisis.uid)} dispatch={dispatch} /> : null}
        {state.opportunity ? <EventCard state={state} inst={state.opportunity} fold={fold(state.opportunity.uid)} dispatch={dispatch} /> : null}
        {state.huanghou ? <EventCard state={state} inst={state.huanghou} fold={fold(state.huanghou.uid)} dispatch={dispatch} /> : null}
      </ScrollRow>

      <h2 className={styles.sectionTitle}>
        手牌（{state.hand.length}）· 按抓牌顺序排列
        <span className={styles.muted}>{compact ? " · 点击展开，双击打出" : " · 双击打出"}</span>
      </h2>
      <ScrollRow id="zh-tut-hand" className={styles.hand}>
        {state.hand.length === 0 ? <p className={styles.muted}>没有手牌。</p> : null}
        {state.hand.map((card) => (
          <HandCard key={card.uid} state={state} card={card} dispatch={dispatch} fold={fold(card.uid)} />
        ))}
      </ScrollRow>

      <div id="zh-tut-endturn" className={styles.endTurnRow}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!canEndTurn3(state)} onClick={() => dispatch({ type: "endTurn" })}>
          结束回合（空格）
        </button>
        {hints.map((h) => (
          <span key={h} className={styles.endHint}>
            {h}
          </span>
        ))}
      </div>

      <div id="zh-tut-log" className={styles.bottom}>
        <LogView entries={state.log} />
        <RunCodePanel code={runCode} onLoad={onLoadCode} />
      </div>

      {showRules ? (
        <Notice title="规则说明 · 第三关" onClose={() => onShowRules(false)} button="谨记在心">
          <Stage3Rules />
        </Notice>
      ) : null}
      {!showRules && popup ? (
        <Notice title={popupTitle(state, popup)} onClose={() => setQueue((q) => q.slice(1))}>
          <PopupBody state={state} id={popup} />
        </Notice>
      ) : null}
      {popup == null ? <OutcomeModal state={state} onRestart={onRestart} onMenu={onMenu} /> : null}
    </div>
  );
}

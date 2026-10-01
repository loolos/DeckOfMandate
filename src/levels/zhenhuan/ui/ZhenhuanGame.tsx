import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { RunCodePanel } from "../../../components/RunCodePanel";
import {
  CARDS,
  CHAPTER,
  EVENTS,
  PROMOTION_TRIAL,
  RANKS,
  RESOURCE_EMOJI,
  RESOURCE_LABEL,
  STATUSES,
  STATUS_TAG_LABEL,
  type CardId,
  type EventDef,
  type EventId,
  type Resource,
} from "../data/content";
import {
  canEndTurn,
  cap,
  currentStory,
  matchedEvents,
  negativeStatuses,
  playLimit,
  playsLeft,
  storyOptionAvailability,
  trialProgress,
  type CardInst,
  type EventInst,
  type ZhAction,
  type ZhState,
} from "../logic/engine";
import { decodeRunCode, encodeRunCode } from "../logic/persistence";
import { RulesSummary } from "./RulesSummary";
import styles from "./zhenhuan.module.css";

type Props = {
  state: ZhState;
  dispatch: (action: ZhAction) => void;
  showRules: boolean;
  onShowRules: (open: boolean) => void;
  onRestart: () => void;
  onMenu: () => void;
  onLoadState: (state: ZhState) => void;
};

function countBy<T extends string>(ids: readonly T[]): [T, number][] {
  const m = new Map<T, number>();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return [...m.entries()];
}

function CardCountList({ ids, empty }: { ids: readonly CardId[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {CARDS[id].emoji} {CARDS[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

function EventCountList({ ids, empty }: { ids: readonly EventId[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {EVENTS[id].emoji} {EVENTS[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

function Pile({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <div className={styles.pile} tabIndex={0}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{count}</div>
      <div className={styles.popover} role="tooltip">
        {children}
      </div>
    </div>
  );
}

function ResourceStat({ state, resource }: { state: ZhState; resource: Resource }) {
  const value = state[resource];
  const max = cap(state);
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>
        {RESOURCE_EMOJI[resource]} {RESOURCE_LABEL[resource]}（归 0 即失败）
      </div>
      <div className={[styles.statValue, value <= 1 && styles.statDanger].filter(Boolean).join(" ")}>
        {value} / {max}
      </div>
      <div className={styles.meter}>
        <div className={styles.meterFill} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function MatchChips({ state, def }: { state: ZhState; def: EventDef }) {
  const handIds = new Set(state.hand.map((c) => c.id));
  const matching = (Object.keys(CARDS) as CardId[]).filter((id) => CARDS[id].matches.includes(def.id));
  return (
    <p className={styles.rule}>
      <span className={styles.ruleLabel}>匹配牌：</span>
      {matching.map((id) => (
        <span
          key={id}
          className={[styles.matchChip, handIds.has(id) && styles.matchChipInHand].filter(Boolean).join(" ")}
          title={handIds.has(id) ? "手牌中有这张牌" : undefined}
        >
          {CARDS[id].emoji} {CARDS[id].name}
        </span>
      ))}
    </p>
  );
}

function EventCard({ state, inst }: { state: ZhState; inst: EventInst }) {
  const def = EVENTS[inst.id];
  const isOpp = def.kind === "opportunity";
  return (
    <div
      className={[styles.card, isOpp ? styles.cardOpportunity : styles.cardCrisis, inst.resolved && styles.cardResolved]
        .filter(Boolean)
        .join(" ")}
    >
      {inst.resolved ? <span className={styles.resolvedStamp}>已解决</span> : null}
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{def.emoji}</span>
          {def.name}
        </span>
        <span className={[styles.cardKind, isOpp ? styles.kindOpportunity : styles.kindCrisis].join(" ")}>
          {isOpp ? "机会" : "危机"}
        </span>
      </div>
      <p className={styles.flavor}>{def.flavor}</p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>处理：</span>
        {def.resolvedText}
      </p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>未处理（回合末）：</span>
        {def.unresolvedText}
      </p>
      <MatchChips state={state} def={def} />
      <p className={styles.flavor}>只能通过打出匹配牌解决；本回合结束时离场。</p>
    </div>
  );
}

function StoryCard({ state, dispatch }: { state: ZhState; dispatch: (a: ZhAction) => void }) {
  const story = currentStory(state);
  if (!story || !state.story) return null;
  const chosen = state.story.chosenOptionId;
  const defaultOption = story.options.find((o) => o.id === story.defaultOptionId)!;
  const locked = chosen != null || state.pending != null || state.outcome !== "playing";
  return (
    <div className={[styles.card, styles.cardStory, chosen && styles.cardResolved].filter(Boolean).join(" ")}>
      {chosen ? <span className={styles.resolvedStamp}>已选择</span> : null}
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{story.emoji}</span>
          {story.name}
        </span>
        <span className={[styles.cardKind, styles.kindStory].join(" ")}>剧情 · 第 {story.turn} 回合</span>
      </div>
      <p className={styles.flavor}>{story.flavor}</p>
      <p className={styles.rule}>
        必须且只能选择 1 项。基础选项不消耗出牌次数；卡牌选项需打出对应手牌并消耗 1 次出牌，其数值替代该牌的基础效果，但该牌仍会同时解决匹配的普通事件。
      </p>
      {story.options.map((option) => {
        const avail = storyOptionAvailability(state, option);
        const isChosen = chosen === option.id;
        return (
          <div key={option.id} className={[styles.option, isChosen && styles.optionChosen].filter(Boolean).join(" ")}>
            <span>
              <strong>{option.card ? `【${CARDS[option.card].name}】${option.name}` : option.name}</strong>
              {option.id === story.defaultOptionId ? <span className={styles.muted}>（默认）</span> : null}
              ：{option.text}
              {!avail.available && !locked ? <span className={styles.muted}>（{avail.reason}）</span> : null}
            </span>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSmall}`}
              disabled={locked || !avail.available}
              onClick={() => dispatch({ type: "chooseStory", optionId: option.id, cardUid: avail.cardUid })}
            >
              {isChosen ? "已选" : "选择"}
            </button>
          </div>
        );
      })}
      {!chosen ? (
        <p className={styles.flavor}>未作选择就结束回合时，按默认选项【{defaultOption.name}】处理。</p>
      ) : null}
    </div>
  );
}

function TrialCard({ state }: { state: ZhState }) {
  if (!state.trial.active) return null;
  const p = trialProgress(state);
  const mark = (ok: boolean) => <span className={ok ? styles.ok : styles.no}>{ok ? "✓" : "✗"}</span>;
  return (
    <div className={[styles.card, styles.cardStory].join(" ")}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{PROMOTION_TRIAL.emoji}</span>
          {PROMOTION_TRIAL.name}
        </span>
        <span className={[styles.cardKind, styles.kindStory].join(" ")}>
          持续 · 第 {PROMOTION_TRIAL.firstTurn}—{PROMOTION_TRIAL.lastTurn} 回合
        </span>
      </div>
      <p className={styles.flavor}>{PROMOTION_TRIAL.flavor}</p>
      <p className={styles.check}>
        {mark(p.shengchong)} 圣宠 ≥ {PROMOTION_TRIAL.minShengchong}（当前 {state.shengchong}）
      </p>
      <p className={styles.check}>
        {mark(p.qingyu)} 清誉 ≥ {PROMOTION_TRIAL.minQingyu}（当前 {state.qingyu}）
      </p>
      <p className={styles.check}>
        {mark(p.keyCard)} 考验期间打出过【仪容整肃】或【谨言慎行】
      </p>
      <p className={styles.rule}>
        每回合<strong>回合末</strong>判定：三项全部满足即晋封为常在，游戏继续到第 {CHAPTER.totalTurns} 回合；第{" "}
        {PROMOTION_TRIAL.lastTurn} 回合末仍未满足则失败。
      </p>
    </div>
  );
}

function HandCard({ state, card, dispatch }: { state: ZhState; card: CardInst; dispatch: (a: ZhAction) => void }) {
  const def = CARDS[card.id];
  const solves = matchedEvents(state, card.id);
  const isPending = state.pending?.cardUid === card.uid;
  const canPlay = state.outcome === "playing" && state.pending == null && playsLeft(state) > 0;
  return (
    <div
      className={[styles.handCard, solves.length > 0 && styles.handCardMatch, isPending && styles.handCardPending]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{def.emoji}</span>
          {def.name}
        </span>
      </div>
      <p className={styles.flavor}>{def.flavor}</p>
      {def.rulesText.map((line) => (
        <p key={line} className={styles.rule}>
          {line}
        </p>
      ))}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>匹配事件：</span>
        {def.matches.length > 0 ? def.matches.map((id) => EVENTS[id].name).join("、") : "无"}
      </p>
      {solves.length > 0 ? (
        <p className={styles.solves}>打出将同时解决：{solves.map((e) => `【${EVENTS[e.id].name}】`).join("")}</p>
      ) : null}
      <div className={styles.cardActions}>
        {isPending ? (
          <>
            <span className={styles.solves}>请在上方状态上点「移除」</span>
            <button type="button" className={`${styles.btn} ${styles.btnSmall}`} onClick={() => dispatch({ type: "cancelPending" })}>
              取消
            </button>
          </>
        ) : (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
            disabled={!canPlay}
            onClick={() => dispatch({ type: "playCard", cardUid: card.uid })}
          >
            打出
          </button>
        )}
      </div>
    </div>
  );
}

function Statuses({ state, dispatch }: { state: ZhState; dispatch: (a: ZhAction) => void }) {
  const removable = new Set(state.pending ? negativeStatuses(state).map((s) => s.uid) : []);
  return (
    <div className={styles.statusRow}>
      <span className={styles.muted}>状态：</span>
      {state.statuses.length === 0 ? <span className={styles.muted}>无</span> : null}
      {state.statuses.map((st) => {
        const def = STATUSES[st.id];
        const notYet = st.appliesFromTurn > state.turn;
        return (
          <div
            key={st.uid}
            className={[styles.status, def.tag === "negative" ? styles.statusNegative : styles.statusPositive].join(" ")}
            title={def.effectText}
          >
            <span>
              {def.emoji} {def.name}
            </span>
            <span className={styles.tag}>{STATUS_TAG_LABEL[def.tag]}</span>
            <span className={styles.muted}>
              抓牌 {def.drawModifier > 0 ? "+" : ""}
              {def.drawModifier} · {notYet ? `下回合起生效，共 ${st.remaining} 回合` : `剩余 ${st.remaining} 回合`}
            </span>
            {removable.has(st.uid) ? (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                onClick={() => dispatch({ type: "removeStatus", statusUid: st.uid })}
              >
                移除
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function endTurnHints(state: ZhState): string[] {
  const hints: string[] = [];
  if (state.pending) hints.push("请先选择要移除的负面状态，或取消温太医诊治。");
  const left = playsLeft(state);
  if (left > 0 && state.hand.length > 0) hints.push(`还可出 ${left} 张牌。`);
  const story = currentStory(state);
  if (story && state.story?.chosenOptionId == null) {
    const def = story.options.find((o) => o.id === story.defaultOptionId)!;
    hints.push(`【${story.name}】未选择，将按默认【${def.name}】处理。`);
  }
  if (state.crisis && !state.crisis.resolved) {
    const def = EVENTS[state.crisis.id];
    hints.push(`危机【${def.name}】未处理：${def.unresolvedText}。`);
  }
  return hints;
}

function Log({ state }: { state: ZhState }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.log.length]);
  return (
    <div className={styles.log} ref={ref} aria-label="日志">
      {state.log.map((entry, i) => (
        <p
          key={i}
          className={[
            styles.logLine,
            entry.text.startsWith("——") && styles.logTurn,
            entry.tone === "good" && styles.logGood,
            entry.tone === "bad" && styles.logBad,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {entry.text}
        </p>
      ))}
    </div>
  );
}

function OutcomeModal({ state, onRestart, onMenu }: { state: ZhState; onRestart: () => void; onMenu: () => void }) {
  if (state.outcome === "playing") return null;
  const won = state.outcome === "won";
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zh-outcome-title">
      <div className={styles.modal}>
        <h2 id="zh-outcome-title">{won ? "🎉 第一关胜利" : "🥀 功亏一篑"}</h2>
        {won ? (
          <p>你从答应晋为常在，在这深宫里站稳了第一步。后面的路还长，敬请期待。</p>
        ) : (
          <p>
            {state.lossReason}。紫禁城里一步走错，便再难回头。
          </p>
        )}
        <p className={styles.muted}>
          最终：第 {state.turn} 回合 · {RANKS[state.rank].name} · 清誉 {state.qingyu} · 圣宠 {state.shengchong}
        </p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onMenu}>
            返回主菜单
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onRestart}>
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}

export function ZhenhuanGame({ state, dispatch, showRules, onShowRules, onRestart, onMenu, onLoadState }: Props) {
  const rank = RANKS[state.rank];
  const runCode = useMemo(() => encodeRunCode(state), [state]);
  const hints = endTurnHints(state);
  const usedOpp = state.opportunityUsed;
  const usedCrisis = state.crisisUsed;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>甄嬛传 · {CHAPTER.title}</h1>
          <div className={styles.headerMeta}>
            <span className={`${styles.badge} ${styles.badgeGold}`}>
              第 {state.turn} / {CHAPTER.totalTurns} 回合
            </span>
            <span className={styles.badge}>
              位分：{rank.name}（抓 {rank.draw} · 打 {rank.plays} · 上限 {rank.cap}）
            </span>
            {state.promoted ? <span className={`${styles.badge} ${styles.badgeGold}`}>已晋封</span> : null}
          </div>
        </div>
        <div className={styles.headerMeta}>
          <button type="button" className={styles.btn} onClick={() => onShowRules(true)}>
            规则说明
          </button>
          <button type="button" className={styles.btn} onClick={onMenu}>
            主菜单
          </button>
        </div>
      </header>

      <div className={styles.bar}>
        <ResourceStat state={state} resource="qingyu" />
        <ResourceStat state={state} resource="shengchong" />
        <div className={styles.stat}>
          <div className={styles.statLabel}>🀄 本回合出牌</div>
          <div className={styles.statValue}>
            {state.playsUsed} / {playLimit(state)}
          </div>
        </div>
      </div>

      <div className={styles.bar}>
        <Pile label="🎴 抽牌堆" count={state.drawPile.length}>
          <p className={styles.popoverTitle}>抽牌堆剩余（顺序未知）</p>
          <CardCountList ids={state.drawPile.map((c) => c.id)} empty="已空，需要时将弃牌堆洗回。" />
        </Pile>
        <Pile label="🗑️ 弃牌堆" count={state.discard.length}>
          <p className={styles.popoverTitle}>弃牌堆</p>
          <CardCountList ids={state.discard.map((c) => c.id)} empty="空" />
        </Pile>
        <Pile label="🌸 机会牌池" count={state.opportunityPool.length}>
          <p className={styles.popoverTitle}>剩余机会事件</p>
          <EventCountList ids={state.opportunityPool} empty="已抽完，下次将把已用事件重新洗匀。" />
          <p className={styles.popoverTitle}>本轮已出现</p>
          <EventCountList ids={state.opportunity ? [...usedOpp, state.opportunity.id] : usedOpp} empty="无" />
        </Pile>
        <Pile label="⚡ 危机牌池" count={state.crisisPool.length}>
          <p className={styles.popoverTitle}>剩余危机事件</p>
          <EventCountList ids={state.crisisPool} empty="已抽完，下次将把已用事件重新洗匀。" />
          <p className={styles.popoverTitle}>本轮已出现</p>
          <EventCountList ids={state.crisis ? [...usedCrisis, state.crisis.id] : usedCrisis} empty="无" />
        </Pile>
      </div>

      <Statuses state={state} dispatch={dispatch} />

      <h2 className={styles.sectionTitle}>本回合事件</h2>
      <div className={styles.events}>
        {state.opportunity ? <EventCard state={state} inst={state.opportunity} /> : null}
        {state.crisis ? <EventCard state={state} inst={state.crisis} /> : null}
        <StoryCard state={state} dispatch={dispatch} />
        <TrialCard state={state} />
      </div>

      <h2 className={styles.sectionTitle}>
        手牌（{state.hand.length}）· 回合结束时全部弃置
      </h2>
      <div className={styles.hand}>
        {state.hand.length === 0 ? <p className={styles.muted}>没有手牌。</p> : null}
        {state.hand.map((card) => (
          <HandCard key={card.uid} state={state} card={card} dispatch={dispatch} />
        ))}
      </div>

      <div className={styles.endTurnRow}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!canEndTurn(state)}
          onClick={() => dispatch({ type: "endTurn" })}
        >
          结束回合
        </button>
        {hints.map((h) => (
          <span key={h} className={styles.endHint}>
            {h}
          </span>
        ))}
      </div>

      <div className={styles.bottom}>
        <Log state={state} />
        <RunCodePanel
          code={runCode}
          onLoad={(raw) => {
            const result = decodeRunCode(raw);
            if (!result.ok) return { ok: false, error: result.error };
            onLoadState(result.state);
            return { ok: true };
          }}
        />
      </div>

      {showRules ? (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zh-rules-title">
          <div className={styles.modal}>
            <h2 id="zh-rules-title">规则说明</h2>
            <RulesSummary />
            <div className={styles.modalActions}>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onShowRules(false)}>
                知道了
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <OutcomeModal state={state} onRestart={onRestart} onMenu={onMenu} />
    </div>
  );
}

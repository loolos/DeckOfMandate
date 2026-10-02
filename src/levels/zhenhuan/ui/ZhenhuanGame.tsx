import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { RunCodePanel } from "../../../components/RunCodePanel";
import { useSmallScreen } from "../../../logic/useSmallScreen";
import {
  CARDS,
  CHAPTER,
  ENVY_TRIGGER,
  EVENT_KIND_LABEL,
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
  type TagId,
} from "../data/content";
import {
  blockingStatuses,
  canEndTurn,
  cap,
  currentStory,
  matchedEvents,
  negativeStatuses,
  playLimit,
  playsLeft,
  storyBasicOptions,
  storyCardResponses,
  storyResponseFor,
  trialProgress,
  type CardInst,
  type EventInst,
  type ZhAction,
  type ZhState,
} from "../logic/engine";
import { decodeRunCode, encodeRunCode } from "../logic/persistence";
import { CompactModeToggle } from "./CompactModeToggle";
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

/**
 * Pile tile with a hover/focus popover. The popover is `position: fixed` (placed from the tile's
 * rect) so the sideways-scrolling pile row cannot clip it; it closes when anything scrolls.
 */
function Pile({ icon, label, count, children }: { icon: string; label: string; count: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 328)) });
  };
  useEffect(() => {
    if (!pos) return;
    const hide = () => setPos(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [pos]);
  return (
    <div
      ref={ref}
      className={styles.pile}
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={() => {
        if (document.activeElement !== ref.current) setPos(null);
      }}
      onFocus={show}
      onBlur={() => setPos(null)}
    >
      <div className={styles.statLabel}>
        <span className={styles.pileIcon}>{icon} </span>
        {label}
      </div>
      <div className={styles.statValue}>{count}</div>
      {pos ? (
        <div className={styles.popover} role="tooltip" style={pos}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

function ResourceStat({ state, resource }: { state: ZhState; resource: Resource }) {
  const value = state[resource];
  const max = cap(state);
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>
        {RESOURCE_EMOJI[resource]} {RESOURCE_LABEL[resource]}
        <span className={styles.statHint}>（归 0 即失败）</span>
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

/**
 * One horizontal row of cards. Overflow scrolls sideways: swipe on touch, trackpad/shift+wheel,
 * or press-and-drag with a mouse (a drag never counts as a click on the card under it).
 */
function ScrollRow({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  return (
    <div
      ref={ref}
      className={[styles.scrollRow, className, dragging && styles.scrollRowDragging].filter(Boolean).join(" ")}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
        drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false, id: e.pointerId };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || !ref.current) return;
        const dx = e.clientX - d.x;
        if (!d.moved && Math.abs(dx) < 6) return;
        if (!d.moved) {
          d.moved = true;
          setDragging(true);
          ref.current.setPointerCapture(d.id);
        }
        ref.current.scrollLeft = d.left - dx;
      }}
      onPointerUp={() => {
        if (!drag.current?.moved) {
          drag.current = null;
          return;
        }
        setDragging(false);
        // keep the drag marker until the trailing click (same task) has been swallowed
        window.setTimeout(() => {
          drag.current = null;
        }, 0);
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDragging(false);
      }}
      onClickCapture={(e) => {
        // swallow the click that ends a drag
        if (drag.current?.moved) {
          e.stopPropagation();
          e.preventDefault();
        }
        drag.current = null;
      }}
    >
      {children}
    </div>
  );
}

/** 略缩模式 (thumbnail mode): cards collapse to a one-line strip; tap to expand. */
type Fold = { compact: boolean; expanded: boolean; onToggle: () => void };

function activateOnKey(e: KeyboardEvent, fn: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
}

const INTERACTIVE = "button, a, input, textarea, select, label";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;
}

/**
 * Card container. In 略缩模式 the whole card toggles collapsed/expanded with a single click
 * (clicks on its own buttons don't toggle). With `onDouble` (hand cards) the toggle waits a
 * moment so a double-click plays the card instead.
 */
function FoldBox({
  fold,
  className,
  onDouble,
  children,
}: {
  fold: Fold;
  className: string;
  onDouble?: () => void;
  children: ReactNode;
}) {
  const timer = useRef<number | null>(null);
  if (!fold.compact) {
    // Desktop layout: double-click a hand card to play it (same as the Sun King campaign).
    return (
      <div
        className={onDouble ? `${className} ${styles.playableByDouble}` : className}
        onDoubleClick={
          onDouble
            ? (e) => {
                if (!(e.target as HTMLElement).closest(INTERACTIVE)) onDouble();
              }
            : undefined
        }
      >
        {children}
      </div>
    );
  }
  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };
  return (
    <div
      className={`${className} ${fold.expanded ? styles.expandedCard : styles.compactCard}`}
      role="button"
      tabIndex={0}
      aria-expanded={fold.expanded}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
        if (!onDouble) {
          fold.onToggle();
          return;
        }
        clearTimer();
        timer.current = window.setTimeout(() => {
          timer.current = null;
          fold.onToggle();
        }, 220);
      }}
      onDoubleClick={(e) => {
        if (!onDouble || (e.target as HTMLElement).closest(INTERACTIVE)) return;
        clearTimer();
        onDouble();
      }}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget) activateOnKey(e, fold.onToggle);
      }}
    >
      {children}
    </div>
  );
}

type Dispatch = (a: ZhAction) => void;

/** Clickable tag: writes its lore + mechanic explanation to the log (does not expand strips). */
function TagButton({ tag, tone, dispatch, children }: { tag: TagId; tone?: string; dispatch: Dispatch; children: ReactNode }) {
  return (
    <button
      type="button"
      className={[styles.cardKind, tone, styles.tagButton].filter(Boolean).join(" ")}
      title="点击在日志中查看说明"
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: "explainTag", tag });
      }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {children}
    </button>
  );
}

/** Resolved banner: distinct mark per event kind, plus which card handled it. */
function ResolvedBanner({ icon, label, detail }: { icon: string; label: string; detail: string }) {
  return (
    <div className={styles.resolvedBanner} role="status">
      <span className={styles.resolvedBadge}>
        {icon} {label}
      </span>
      <span className={styles.resolvedDetail}>{detail}</span>
    </div>
  );
}

function eventResolvedDetail(inst: EventInst): string {
  const def = EVENTS[inst.id];
  const by = inst.resolvedBy ? `由【${CARDS[inst.resolvedBy].name}】` : "";
  if (def.kind !== "opportunity") return `${by}化解，回合末不受惩罚。`;
  return `${by}把握，已获得${def.resolvedText}${inst.rewardDoubled ? "（眉庄相助：奖励翻倍）" : ""}。`;
}

function EventCard({ state, inst, fold, dispatch }: { state: ZhState; inst: EventInst; fold: Fold; dispatch: Dispatch }) {
  const def = EVENTS[inst.id];
  const isOpp = def.kind === "opportunity";
  const kindTone = { opportunity: styles.kindOpportunity, crisis: styles.kindCrisis, envy: styles.kindEnvy }[def.kind];
  const cardTone = { opportunity: styles.cardOpportunity, crisis: styles.cardCrisis, envy: styles.cardEnvy }[def.kind];
  const kindTag = (
    <TagButton tag={def.kind} tone={kindTone} dispatch={dispatch}>
      {EVENT_KIND_LABEL[def.kind]}
    </TagButton>
  );
  const className = [styles.card, cardTone, inst.resolved && styles.cardResolved]
    .filter(Boolean)
    .join(" ");
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {def.emoji} {def.name}
          {inst.resolved ? " 🆗" : ""}
          {kindTag}
        </div>
        <div className={styles.compactSummary}>
          {inst.resolved
            ? `${isOpp ? "✅ 已把握" : "🛡️ 已化解"} · ${eventResolvedDetail(inst)}`
            : `处理：${def.resolvedText} · 未处理：${def.unresolvedText}`}
        </div>
      </FoldBox>
    );
  }
  return (
    <FoldBox fold={fold} className={className}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{def.emoji}</span>
          {def.name}
          {inst.resolved ? " 🆗" : null}
        </span>
        {kindTag}
      </div>
      {inst.resolved ? (
        <ResolvedBanner
          icon={isOpp ? "✅" : "🛡️"}
          label={isOpp ? "已把握" : "已化解"}
          detail={eventResolvedDetail(inst)}
        />
      ) : null}
      <p className={styles.flavor}>{def.flavor}</p>
      {def.kind === "envy" ? (
        <p className={styles.flavor}>圣宠 ≥ {ENVY_TRIGGER.minShengchong} 引来的额外事件。</p>
      ) : null}
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
    </FoldBox>
  );
}

function StoryCard({ state, dispatch, fold }: { state: ZhState; dispatch: Dispatch; fold: Fold }) {
  const story = currentStory(state);
  if (!story || !state.story) return null;
  const chosen = state.story.chosenOptionId;
  const defaultOption = story.options.find((o) => o.id === story.defaultOptionId)!;
  const locked = chosen != null || state.pending != null || state.outcome !== "playing";
  const chosenOption = chosen ? story.options.find((o) => o.id === chosen) : undefined;
  const className = [styles.card, styles.cardStory, chosen && styles.cardResolved].filter(Boolean).join(" ");
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {story.emoji} {story.name}
          {chosen ? " 🆗" : ""}
          <TagButton tag="story" tone={styles.kindStory} dispatch={dispatch}>
            剧情
          </TagButton>
        </div>
        <div className={styles.compactSummary}>
          {chosenOption
            ? `📝 已抉择「${chosenOption.name}」：${chosenOption.text}`
            : `选 1 个基础选项或从手牌打出对应牌（不处理按默认「${defaultOption.name}」）`}
        </div>
      </FoldBox>
    );
  }
  return (
    <FoldBox fold={fold} className={className}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{story.emoji}</span>
          {story.name}
          {chosen ? " 🆗" : null}
        </span>
        <TagButton tag="story" tone={styles.kindStory} dispatch={dispatch}>
          剧情 · 第 {story.turn} 回合
        </TagButton>
      </div>
      {chosenOption ? (
        <ResolvedBanner
          icon="📝"
          label="已抉择"
          detail={`${chosenOption.card ? `打出【${CARDS[chosenOption.card].name}】：` : "选择"}「${chosenOption.name}」：${chosenOption.text}。`}
        />
      ) : null}
      <p className={styles.flavor}>{story.flavor}</p>
      <p className={styles.rule}>
        二选一处理：选择 1 个基础选项（不消耗出牌次数），或从手牌打出下列牌之一（消耗 1 次出牌，按剧情效果结算，除注明外替代该牌的基础效果，同时解决匹配的普通事件）。
      </p>
      {storyBasicOptions(story).map((option) => {
        const isChosen = chosen === option.id;
        return (
          <div key={option.id} className={[styles.option, isChosen && styles.optionChosen].filter(Boolean).join(" ")}>
            <span>
              <strong>{option.name}</strong>
              {option.id === story.defaultOptionId ? <span className={styles.muted}>（默认）</span> : null}
              ：{option.text}
            </span>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSmall}`}
              disabled={locked}
              onClick={() => dispatch({ type: "chooseStory", optionId: option.id })}
            >
              {isChosen ? "已选" : "选择"}
            </button>
          </div>
        );
      })}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>可由手牌打出解决：</span>
      </p>
      {storyCardResponses(story).map((option) => {
        const inHand = state.hand.some((c) => c.id === option.card);
        const isChosen = chosen === option.id;
        return (
          <p key={option.id} className={[styles.rule, isChosen && styles.optionChosen].filter(Boolean).join(" ")}>
            <span
              className={[styles.matchChip, inHand && !locked && styles.matchChipInHand].filter(Boolean).join(" ")}
              title={inHand ? "手牌中有这张牌，直接从手牌打出即可" : undefined}
            >
              {CARDS[option.card!].emoji} {CARDS[option.card!].name}
            </span>
            {option.name}：{option.text}
          </p>
        );
      })}
      {!chosen ? (
        <p className={styles.flavor}>未作选择就结束回合时，按默认选项【{defaultOption.name}】处理。</p>
      ) : null}
    </FoldBox>
  );
}

function TrialCard({ state, fold, dispatch }: { state: ZhState; fold: Fold; dispatch: Dispatch }) {
  if (!state.trial.active) return null;
  const p = trialProgress(state);
  const mark = (ok: boolean) => <span className={ok ? styles.ok : styles.no}>{ok ? "✓" : "✗"}</span>;
  const className = [styles.card, styles.cardStory, p.all && styles.cardReady].filter(Boolean).join(" ");
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {PROMOTION_TRIAL.emoji} {PROMOTION_TRIAL.name}
          {p.all ? " 🏮" : ""}
          <TagButton tag="trial" tone={styles.kindStory} dispatch={dispatch}>
            第 {PROMOTION_TRIAL.firstTurn}—{PROMOTION_TRIAL.lastTurn} 回合
          </TagButton>
        </div>
        <div className={styles.compactSummary}>
          {mark(p.shengchong)} 圣宠 {state.shengchong}/{PROMOTION_TRIAL.minShengchong} · {mark(p.qingyu)} 清誉 {state.qingyu}/
          {PROMOTION_TRIAL.minQingyu} · {mark(p.keyCard)} 考验牌
        </div>
      </FoldBox>
    );
  }
  return (
    <FoldBox fold={fold} className={className}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{PROMOTION_TRIAL.emoji}</span>
          {PROMOTION_TRIAL.name}
        </span>
        <TagButton tag="trial" tone={styles.kindStory} dispatch={dispatch}>
          持续 · 第 {PROMOTION_TRIAL.firstTurn}—{PROMOTION_TRIAL.lastTurn} 回合
        </TagButton>
      </div>
      {p.all ? (
        <ResolvedBanner icon="🏮" label="条件已满足" detail="保持到回合末（危机惩罚结算之后）即可晋封为常在。" />
      ) : null}
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
    </FoldBox>
  );
}

function HandCard({
  state,
  card,
  dispatch,
  fold,
}: {
  state: ZhState;
  card: CardInst;
  dispatch: (a: ZhAction) => void;
  fold: Fold;
}) {
  const def = CARDS[card.id];
  const solves = matchedEvents(state, card.id);
  const storyResponse = storyResponseFor(state, card.id);
  const story = currentStory(state);
  const solveNames = [
    ...(storyResponse && story ? [`${story.name}·${storyResponse.name}`] : []),
    ...solves.map((e) => EVENTS[e.id].name),
  ];
  const isPending = state.pending?.cardUid === card.uid;
  const isTrialCard = state.trial.active && PROMOTION_TRIAL.keyCards.includes(card.id);
  const blockers = blockingStatuses(state, card.id);
  const canPlay = state.outcome === "playing" && state.pending == null && playsLeft(state) > 0 && blockers.length === 0;
  const blockedNote =
    blockers.length > 0 ? (
      <div className={styles.endHint}>【{STATUSES[blockers[0]!.id].name}】期间不能打出</div>
    ) : null;
  const play = () => {
    if (canPlay) dispatch({ type: "playCard", cardUid: card.uid });
  };
  const className = [
    styles.handCard,
    solveNames.length > 0 && styles.handCardMatch,
    isPending && styles.handCardPending,
    fold.compact && !canPlay && !isPending && styles.handCardDisabled,
  ]
    .filter(Boolean)
    .join(" ");
  const trialTag = isTrialCard ? (
    <TagButton tag="trialCard" tone={styles.kindTrial} dispatch={dispatch}>
      考验{state.trial.keyCardPlayed ? " ✓" : ""}
    </TagButton>
  ) : null;
  if (fold.compact && !fold.expanded && !isPending) {
    return (
      <FoldBox fold={fold} className={className} onDouble={play}>
        <div className={styles.compactTitle}>
          {def.emoji} {def.name}
          {trialTag}
        </div>
        <div className={styles.compactSummary}>{def.rulesText[0]}</div>
        {solveNames.length > 0 ? <div className={styles.solves}>可解决：{solveNames.join("、")}</div> : null}
        {blockedNote}
      </FoldBox>
    );
  }
  return (
    <FoldBox fold={fold} className={className} onDouble={play}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{def.emoji}</span>
          {def.name}
        </span>
        {trialTag}
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
      {storyResponse && story ? (
        <p className={styles.solves}>
          打出将解决剧情【{story.name}】·{storyResponse.name}：{storyResponse.text}
          {storyResponse.keepCardEffect ? "" : "（替代基础效果）"}
        </p>
      ) : null}
      {solves.length > 0 ? (
        <p className={styles.solves}>打出将同时解决：{solves.map((e) => `【${EVENTS[e.id].name}】`).join("")}</p>
      ) : null}
      {blockedNote}
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
    </FoldBox>
  );
}

/** Status chips: collapsed to one line by default; click to expand lore, mechanics and source. */
function Statuses({ state, dispatch }: { state: ZhState; dispatch: Dispatch }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const removable = new Set(state.pending ? negativeStatuses(state).map((s) => s.uid) : []);
  const toggle = (uid: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  return (
    <div className={styles.statusRow}>
      <span className={styles.muted}>状态：</span>
      {state.statuses.length === 0 ? <span className={styles.muted}>无</span> : null}
      {state.statuses.length > 0 ? (
        <ScrollRow className={styles.statuses}>
          {state.statuses.map((st) => {
            const def = STATUSES[st.id];
            const notYet = st.appliesFromTurn > state.turn;
            const expanded = open.has(st.uid);
            return (
              <div
                key={st.uid}
                className={[
                  styles.status,
                  def.tag === "negative" ? styles.statusNegative : styles.statusPositive,
                  expanded && styles.statusExpanded,
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                title={expanded ? "点击收起" : "点击展开"}
                onClick={() => toggle(st.uid)}
                onKeyDown={(e) => activateOnKey(e, () => toggle(st.uid))}
              >
                <div className={styles.statusLine}>
                  <span>
                    {def.emoji} {def.name}
                  </span>
                  <button
                    type="button"
                    className={`${styles.tag} ${styles.tagButton}`}
                    title="点击在日志中查看说明"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "explainTag", tag: def.tag });
                    }}
                  >
                    {STATUS_TAG_LABEL[def.tag]}
                  </button>
                  <span className={styles.muted}>
                    {def.blocksCards
                      ? `不能打出${def.blocksCards.map((id) => CARDS[id].name).join("、")}`
                      : `抓牌 ${def.drawModifier > 0 ? "+" : ""}${def.drawModifier}`}{" "}
                    · {notYet ? `下回合起生效，共 ${st.remaining} 回合` : `剩余 ${st.remaining} 回合`}
                  </span>
                  {removable.has(st.uid) ? (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: "removeStatus", statusUid: st.uid });
                      }}
                    >
                      移除
                    </button>
                  ) : null}
                </div>
                {expanded ? (
                  <div className={styles.statusDetail}>
                    <p className={styles.flavor}>{def.flavor}</p>
                    <p className={styles.rule}>
                      <span className={styles.ruleLabel}>机制：</span>
                      {def.effectText}从获得后的下一回合开始生效。
                      {def.tag === "negative" ? "可被【温太医诊治】移除。" : ""}
                    </p>
                    <p className={styles.rule}>
                      <span className={styles.ruleLabel}>来源：</span>
                      {def.source}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </ScrollRow>
      ) : null}
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
  for (const ev of [state.crisis, state.envy]) {
    if (!ev || ev.resolved) continue;
    const def = EVENTS[ev.id];
    hints.push(`${EVENT_KIND_LABEL[def.kind]}【${def.name}】未处理：${def.unresolvedText}。`);
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

/** Shown once when the promotion trial is passed; the run continues afterwards. */
function PromotionModal({ state, onClose }: { state: ZhState; onClose: () => void }) {
  const rank = RANKS[state.rank];
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zh-promotion-title">
      <div className={styles.modal}>
        <h2 id="zh-promotion-title">🏮 晋封成功</h2>
        <p>恭喜小主晋为{rank.name}！只是位分越高，盯着你的人就越多，后面还有更大的风浪。</p>
        <p>
          接下来只要撑到<strong>第 {CHAPTER.totalTurns} 回合结束</strong>，清誉与圣宠都不降到 0，即可通过第一关。
        </p>
        <p className={styles.muted}>
          从下一回合起每回合抓 {rank.draw} 张、最多打 {rank.plays} 张，清誉 / 圣宠上限提高到 {rank.cap}。
        </p>
        <div className={styles.modalActions}>
          {/* Takes focus so Space closes the notice instead of re-pressing 结束回合 underneath. */}
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onClose} autoFocus>
            谨记在心
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
  const usedEnvy = state.envyUsed;
  const compact = useSmallScreen();

  // Pop the promotion notice only when it happens during play, not when loading a promoted save.
  const [showPromotion, setShowPromotion] = useState(false);
  const wasPromoted = useRef(state.promoted);
  useEffect(() => {
    if (state.promoted && !wasPromoted.current && state.outcome === "playing") setShowPromotion(true);
    if (!state.promoted) setShowPromotion(false);
    wasPromoted.current = state.promoted;
  }, [state.promoted, state.outcome]);

  // Space ends the turn (same shortcut as the Sun King campaign); ignored while typing.
  const endTurnReady = canEndTurn(state) && !showRules && !showPromotion;
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

  return (
    <div className={[styles.page, compact && styles.compact].filter(Boolean).join(" ")}>
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
          <CompactModeToggle />
          <button type="button" className={styles.btn} onClick={() => onShowRules(true)}>
            规则说明
          </button>
          <button type="button" className={styles.btn} onClick={onMenu}>
            主菜单
          </button>
        </div>
      </header>

      <ScrollRow className={`${styles.bar} ${styles.resources}`}>
        <ResourceStat state={state} resource="qingyu" />
        <ResourceStat state={state} resource="shengchong" />
      </ScrollRow>

      <ScrollRow className={`${styles.bar} ${styles.piles}`}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>
            <span className={styles.pileIcon}>🀄 </span>本回合出牌
          </div>
          <div className={styles.statValue}>
            {state.playsUsed} / {playLimit(state)}
          </div>
        </div>
        <Pile icon="🎴" label="抽牌堆" count={state.drawPile.length}>
          <p className={styles.popoverTitle}>抽牌堆剩余（顺序未知）</p>
          <CardCountList ids={state.drawPile.map((c) => c.id)} empty="已空，需要时将弃牌堆洗回。" />
        </Pile>
        <Pile icon="🗑️" label="弃牌堆" count={state.discard.length}>
          <p className={styles.popoverTitle}>弃牌堆</p>
          <CardCountList ids={state.discard.map((c) => c.id)} empty="空" />
        </Pile>
        <Pile icon="🌸" label="机会牌池" count={state.opportunityPool.length}>
          <p className={styles.popoverTitle}>剩余机会事件</p>
          <EventCountList ids={state.opportunityPool} empty="已抽完，下次将把已用事件重新洗匀。" />
          <p className={styles.popoverTitle}>本轮已出现</p>
          <EventCountList ids={state.opportunity ? [...usedOpp, state.opportunity.id] : usedOpp} empty="无" />
        </Pile>
        <Pile icon="⚡" label="危机牌池" count={state.crisisPool.length}>
          <p className={styles.popoverTitle}>剩余危机事件</p>
          <EventCountList ids={state.crisisPool} empty="已抽完，下次将把已用事件重新洗匀。" />
          <p className={styles.popoverTitle}>本轮已出现</p>
          <EventCountList ids={state.crisis ? [...usedCrisis, state.crisis.id] : usedCrisis} empty="无" />
        </Pile>
        <Pile icon="👀" label="嫉妒牌池" count={state.envyPool.length}>
          <p className={styles.popoverTitle}>
            第 {ENVY_TRIGGER.firstTurn} 回合起，回合开始时圣宠 ≥ {ENVY_TRIGGER.minShengchong}：首次必出，之后每隔一回合出现一次
          </p>
          <p className={styles.popoverTitle}>剩余嫉妒事件</p>
          <EventCountList ids={state.envyPool} empty="已抽完，下次将把已用事件重新洗匀。" />
          <p className={styles.popoverTitle}>本轮已出现</p>
          <EventCountList ids={state.envy ? [...usedEnvy, state.envy.id] : usedEnvy} empty="无" />
        </Pile>
      </ScrollRow>

      <Statuses state={state} dispatch={dispatch} />

      <h2 className={styles.sectionTitle}>本回合事件</h2>
      <ScrollRow className={styles.events}>
        {state.opportunity ? (
          <EventCard state={state} inst={state.opportunity} fold={fold(state.opportunity.uid)} dispatch={dispatch} />
        ) : null}
        {state.crisis ? (
          <EventCard state={state} inst={state.crisis} fold={fold(state.crisis.uid)} dispatch={dispatch} />
        ) : null}
        {state.envy ? (
          <EventCard state={state} inst={state.envy} fold={fold(state.envy.uid)} dispatch={dispatch} />
        ) : null}
        <StoryCard state={state} dispatch={dispatch} fold={fold("story")} />
        <TrialCard state={state} fold={fold("trial")} dispatch={dispatch} />
      </ScrollRow>

      <h2 className={styles.sectionTitle}>
        手牌（{state.hand.length}）· 回合结束时全部弃置
        <span className={styles.muted}>{compact ? " · 点击展开，双击打出" : " · 双击打出"}</span>
      </h2>
      <ScrollRow className={styles.hand}>
        {state.hand.length === 0 ? <p className={styles.muted}>没有手牌。</p> : null}
        {state.hand.map((card) => (
          <HandCard key={card.uid} state={state} card={card} dispatch={dispatch} fold={fold(card.uid)} />
        ))}
      </ScrollRow>

      <div className={styles.endTurnRow}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnPrimary}`}
          disabled={!canEndTurn(state)}
          onClick={() => dispatch({ type: "endTurn" })}
        >
          结束回合（空格）
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

      {showPromotion ? <PromotionModal state={state} onClose={() => setShowPromotion(false)} /> : null}
      <OutcomeModal state={state} onRestart={onRestart} onMenu={onMenu} />
    </div>
  );
}

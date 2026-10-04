import { useEffect, useRef, useState, type ReactNode } from "react";
import { RunCodePanel } from "../../../components/RunCodePanel";
import { useSmallScreen } from "../../../logic/useSmallScreen";
import {
  CARDS2,
  EVENT_KIND2_LABEL,
  EVENTS2,
  EVIDENCE,
  EVIDENCE_THRESHOLDS,
  GUIREN_TRIAL,
  HATE,
  HUAFEI_EVENTS,
  LINGRONG_EVENT,
  RANKS,
  SHENZI,
  LINGRONG_PROMOTION_TEXT,
  STAGE2,
  STATUSES2,
  STORIES2,
  TIER_EMOJI,
  TIER_LABEL,
  XIBIE,
  hateTierLabel,
  HATE_REVEAL_TURN,
  FINALE,
  huafeiDrawPlan,
  type CardId2,
  type EventId2,
  type TagId2,
} from "../data/stage2Content";
import {
  blockedByChezhou,
  blockedByStatus,
  summonUnwell,
  finaleAccepts,
  finaleTier,
  finaleDoneStory,
  canEndTurn2,
  canPlayCard,
  endingLines,
  guirenTrialProgress,
  isFreeByLianmei,
  isXibieCard,
  lianmeiLit,
  matchedEvents2,
  openStories,
  playLimit2,
  playsLeft2,
  rankCap,
  removableNegatives,
  storyBasicOptions2,
  storyCardResponses2,
  storyResponsesFor,
  summonBlocked,
  tierOf,
  type CardInst2,
  type EventInst2,
  type StoryInst2,
  type Z2Action,
  type Z2State,
} from "../logic/stage2Engine";
import { CompactModeToggle } from "./CompactModeToggle";
import { FoldBox, LogView, Pile, ResolvedBanner, ScrollRow, TagChip, activateOnKey, countBy, isTypingTarget, type Fold } from "./common";
import { compactEffect2, expandedEffect2 } from "./effectText2";
import styles from "./zhenhuan.module.css";

type Dispatch = (a: Z2Action) => void;

type Props = {
  state: Z2State;
  dispatch: Dispatch;
  runCode: string;
  showRules: boolean;
  onShowRules: (open: boolean) => void;
  onRestart: () => void;
  onMenu: () => void;
  onLoadCode: (raw: string) => { ok: true } | { ok: false; error: string };
};

function Tag({ tag, tone, dispatch, dim, children }: { tag: TagId2; tone?: string; dispatch: Dispatch; dim?: boolean; children: ReactNode }) {
  return (
    <TagChip tone={[tone, dim && styles.tagDim].filter(Boolean).join(" ")} onExplain={() => dispatch({ type: "explainTag", tag })}>
      {children}
    </TagChip>
  );
}

function Stat({ label, value, max, hint, danger }: { label: string; value: number; max: number; hint?: string; danger?: boolean }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>
        {label}
        {hint ? <span className={styles.statHint}>{hint}</span> : null}
      </div>
      <div className={[styles.statValue, danger && styles.statDanger].filter(Boolean).join(" ")}>
        {value} / {max}
      </div>
      <div className={styles.meter}>
        <div className={styles.meterFill} style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%` }} />
      </div>
    </div>
  );
}

function CardList({ ids, empty }: { ids: readonly CardId2[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {CARDS2[id].emoji} {CARDS2[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

function EventList({ ids, empty }: { ids: readonly EventId2[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {EVENTS2[id].emoji} {EVENTS2[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

const KIND_TONE = { opportunity: styles.kindOpportunity, crisis: styles.kindCrisis, huafei: styles.kindEnvy };
const CARD_TONE = { opportunity: styles.cardOpportunity, crisis: styles.cardCrisis, huafei: styles.cardEnvy };

/** Cards that can answer an event: single matches plus 双牌 cards. */
function answeringCards(id: EventId2): CardId2[] {
  const def = EVENTS2[id];
  const singles = (Object.keys(CARDS2) as CardId2[]).filter((c) => CARDS2[c].matches.includes(id));
  return [...singles, ...(def.double?.cards ?? []).filter((c) => !singles.includes(c))];
}

function resolvedDetail(inst: EventInst2): string {
  const def = EVENTS2[inst.id];
  const by = inst.resolvedBy ? `由【${CARDS2[inst.resolvedBy].name}】` : "";
  const tier = inst.lingrong ? `（陵容·${TIER_LABEL[inst.lingrong]}）` : "";
  const ev = inst.evidence ? `；得到罪证【${EVIDENCE[inst.evidence].name}】` : "";
  if (def.kind === "huafei") return `${by}应对${tier}，只付出了应对的代价${ev}。`;
  if (def.kind !== "opportunity") return `${by}化解${tier}，回合末不受惩罚${ev}。`;
  return `${by}把握${tier}${inst.rewardDoubled ? "（眉庄相助：奖励翻倍）" : ""}${ev}。`;
}

function EventCard({ state, inst, fold, dispatch }: { state: Z2State; inst: EventInst2; fold: Fold; dispatch: Dispatch }) {
  const def = EVENTS2[inst.id];
  const isOpp = def.kind === "opportunity";
  const handIds = new Set(inst.resolved ? [] : state.hand.map((c) => c.id));
  const className = [styles.card, CARD_TONE[def.kind], inst.resolved && styles.cardResolved].filter(Boolean).join(" ");
  const tags = (
    <span className={styles.tagGroup}>
      <Tag tag={def.kind} tone={KIND_TONE[def.kind]} dispatch={dispatch}>
        {EVENT_KIND2_LABEL[def.kind]}
      </Tag>
      {def.harmsPregnancy ? (
        <Tag tag="harm" tone={styles.kindCrisis} dispatch={dispatch}>
          伤胎
        </Tag>
      ) : null}
      {def.burnPenalty ? (
        <Tag tag="burn" tone={styles.kindCrisis} dispatch={dispatch}>
          延烧{inst.burning ? "中" : ""}
        </Tag>
      ) : null}
      {def.double ? (
        <Tag tag="double" tone={styles.kindStory} dispatch={dispatch}>
          双牌 {(inst.progress ?? []).length}/2
        </Tag>
      ) : null}
    </span>
  );
  const story = inst.resolved && inst.resolvedBy && inst.resolvedBy !== "lingrongXiangzhu" ? def.resolvedStory[inst.resolvedBy] : undefined;
  const lingrongStory = inst.lingrong ? LINGRONG_EVENT[inst.id]?.[inst.lingrong]?.story : undefined;
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {def.emoji} {def.name}
          {inst.resolved ? " 🆗" : ""}
          {tags}
        </div>
        <div className={styles.compactSummary}>
          {inst.resolved
            ? `${isOpp ? "✅" : "🛡️"} ${inst.resolvedBy ? CARDS2[inst.resolvedBy].emoji : ""}`
            : isOpp
              ? `✅ ${def.resolvedCompact ?? compactEffect2(def.resolvedText)}`
              : `❌ ${inst.burning ? "👑-2 🤒×2" : (def.unresolvedCompact ?? compactEffect2(def.unresolvedText))}${def.kind === "huafei" ? ` ｜ ⚔️ ${def.resolvedCompact ?? compactEffect2(def.resolvedText)}` : ""}`}
        </div>
      </FoldBox>
    );
  }
  const lingrongTable = LINGRONG_EVENT[inst.id];
  return (
    <FoldBox fold={fold} className={className}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{def.emoji}</span>
          {def.name}
          {inst.resolved ? " 🆗" : null}
        </span>
        {tags}
      </div>
      {inst.resolved ? (
        <ResolvedBanner icon={isOpp ? "✅" : "🛡️"} label={isOpp ? "已把握" : def.kind === "huafei" ? "已应对" : "已化解"} detail={resolvedDetail(inst)} story={story ?? lingrongStory} />
      ) : null}
      {!inst.resolved && inst.lingrongFailed ? <p className={styles.endHint}>陵容失效：{lingrongStory}</p> : null}
      <p className={styles.flavor}>{def.flavor}</p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>{def.kind === "huafei" ? "应对（仍有代价）：" : "处理："}</span>
        {expandedEffect2(def.resolvedText)}
      </p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>{def.kind === "huafei" ? "不应对（回合末）：" : "未处理（回合末）："}</span>
        {expandedEffect2(inst.burning ? "延烧未止：圣宠 -2 后离场" : def.unresolvedText)}
      </p>
      {def.note ? <p className={styles.rule}>{def.note}</p> : null}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>匹配牌：</span>
        {answeringCards(inst.id).map((id) => (
          <span key={id} className={[styles.matchChip, handIds.has(id) && styles.matchChipInHand].filter(Boolean).join(" ")}>
            {CARDS2[id].emoji} {CARDS2[id].name}
          </span>
        ))}
      </p>
      {lingrongTable ? (
        <p className={styles.rule}>
          🎶 也可用【陵容相助】解决，效果视你与陵容的情分而定{Object.values(lingrongTable).some((o) => o.shuhenjiao) ? "；她会送来🧴舒痕胶" : ""}。
        </p>
      ) : null}
    </FoldBox>
  );
}

function StoryCard({ state, inst, dispatch, fold }: { state: Z2State; inst: StoryInst2; dispatch: Dispatch; fold: Fold }) {
  const def = STORIES2[inst.id];
  const chosen = inst.chosenOptionId;
  const blocked = inst.id === "zhaoxing" && summonBlocked(state);
  // 抱恙在身: no 侍寝, so the card answers are hidden until it is removed
  const cardResponses = inst.id === "zhaoxing" && chosen == null && summonUnwell(state) ? [] : storyCardResponses2(def);
  const locked = chosen != null || state.pending != null || state.outcome !== "playing" || blocked;
  const chosenOption = chosen ? def.options.find((o) => o.id === chosen) : undefined;
  const defaultOption = def.options.find((o) => o.id === def.defaultOptionId)!;
  const tier = tierOf(state);
  const className = [styles.card, styles.cardStory, chosen && styles.cardResolved].filter(Boolean).join(" ");
  const tag = (
    <Tag tag="story" tone={styles.kindStory} dispatch={dispatch}>
      剧情
    </Tag>
  );
  const resultText = inst.result ?? (chosenOption ? chosenOption.text : "");
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {def.emoji} {def.name}
          {chosen ? " 🆗" : ""}
          {tag}
        </div>
        <div className={styles.compactSummary}>
          {chosenOption
            ? `📝 ${inst.viaCard ? CARDS2[inst.viaCard].emoji : chosenOption.name} ${inst.result ? compactEffect2(inst.result) : (chosenOption.compact ?? compactEffect2(resultText))}`
            : blocked
              ? "🌺 先应对欢宜香浓"
              : `⏳ 默认「${defaultOption.name}」`}
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
          {chosen ? " 🆗" : null}
        </span>
        {tag}
      </div>
      {chosenOption ? (
        <ResolvedBanner
          icon="📝"
          label="已抉择"
          detail={`${inst.viaCard ? `打出【${CARDS2[inst.viaCard].name}】：` : "选择"}「${chosenOption.name}」：${expandedEffect2(resultText)}。`}
          story={inst.story ?? chosenOption.story}
        />
      ) : null}
      <p className={styles.flavor}>{def.flavor}</p>
      {def.note ? <p className={styles.rule}>{def.note}</p> : null}
      {blocked ? <p className={styles.endHint}>皇上在翊坤宫，须先化解【欢宜香浓】才能处理召幸。</p> : null}
      {inst.id === "zhaoxing" && chosen == null && summonUnwell(state) ? <p className={styles.endHint}>{summonUnwell(state)}，不能侍寝：只能称病避宠或错过。</p> : null}
      {storyBasicOptions2(def).map((option) => (
        <div key={option.id} className={[styles.option, chosen === option.id && styles.optionChosen].filter(Boolean).join(" ")}>
          <span>
            <strong>{option.name}</strong>
            {option.id === def.defaultOptionId ? <span className={styles.muted}>（默认）</span> : null}：{expandedEffect2(option.text)}
          </span>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSmall}`}
            disabled={locked}
            onClick={() => dispatch({ type: "chooseStory", storyId: inst.id, optionId: option.id })}
          >
            {chosen === option.id ? "已选" : "选择"}
          </button>
        </div>
      ))}
      {cardResponses.length > 0 ? (
        <p className={styles.rule}>
          <span className={styles.ruleLabel}>可由手牌打出解决：</span>
        </p>
      ) : null}
      {cardResponses.map((option) => {
        const inHand = state.hand.some((c) => c.id === option.card);
        const lingrongNote = option.card === "lingrongXiangzhu" && tier ? `（当前情分：${TIER_EMOJI[tier]}${TIER_LABEL[tier]}）` : "";
        return (
          <p key={option.id} className={[styles.rule, chosen === option.id && styles.optionChosen].filter(Boolean).join(" ")}>
            <span className={[styles.matchChip, inHand && !locked && styles.matchChipInHand].filter(Boolean).join(" ")}>
              {CARDS2[option.card!].emoji} {CARDS2[option.card!].name}
            </span>
            {option.name}：{expandedEffect2(option.text)}
            {lingrongNote}
          </p>
        );
      })}
      {!chosen && !defaultOption.hidden ? <p className={styles.flavor}>未作选择就结束回合时，按默认选项【{defaultOption.name}】处理。</p> : null}
      {!chosen && defaultOption.hidden ? <p className={styles.flavor}>不处理则错过，无其他影响。</p> : null}
    </FoldBox>
  );
}

function FinaleCard({ state, fold, dispatch }: { state: Z2State; fold: Fold; dispatch: Dispatch }) {
  const f = state.finale;
  if (!f) return null;
  const done = f.played.length >= f.needed;
  const tier = finaleTier(state.evidence.length);
  const handIds = new Set(done ? [] : state.hand.map((c) => c.id));
  const className = [styles.card, styles.cardStory, done && styles.cardReady].filter(Boolean).join(" ");
  const tags = (
    <span className={styles.tagGroup}>
      <Tag tag="story" tone={styles.kindStory} dispatch={dispatch}>
        剧情
      </Tag>
      <span className={styles.muted}>
        {f.played.length}/{f.needed}
      </span>
    </span>
  );
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {FINALE.emoji} {FINALE.name}
          {done ? " 🆗" : ""}
          {tags}
        </div>
        <div className={styles.compactSummary}>{done ? "✅ 华妃已倒" : `🃏×${f.needed - f.played.length} ❌ 失败`}</div>
      </FoldBox>
    );
  }
  return (
    <FoldBox fold={fold} className={className}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{FINALE.emoji}</span>
          {FINALE.name}
          {done ? " 🆗" : null}
        </span>
        {tags}
      </div>
      {done ? <ResolvedBanner icon="👑" label="大局已定" detail={finaleDoneStory(state.evidence.length)} /> : null}
      <p className={styles.flavor}>{FINALE.flavor[tier]}</p>
      {f.played.map((id, i) => (
        <p key={`${id}-${i}`} className={styles.rule}>
          {CARDS2[id].emoji} {FINALE.cardStory[id]}
        </p>
      ))}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>扳倒华妃：</span>本回合打出 <strong>{f.needed}</strong> 张牌（罪证越多，需要的越少；陵容相助不算）。回合末仍未凑够即关卡失败。
      </p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>可用牌：</span>
        {FINALE.cards.map((id) => (
          <span key={id} className={[styles.matchChip, handIds.has(id) && styles.matchChipInHand].filter(Boolean).join(" ")}>
            {CARDS2[id].emoji} {CARDS2[id].name}
          </span>
        ))}
      </p>
    </FoldBox>
  );
}

function TrialCard({ state, fold, dispatch }: { state: Z2State; fold: Fold; dispatch: Dispatch }) {
  if (!state.trial.active) return null;
  const p = guirenTrialProgress(state);
  const mark = (ok: boolean) => <span className={ok ? styles.ok : styles.no}>{ok ? "✓" : "✗"}</span>;
  const className = [styles.card, styles.cardStory, p.all && styles.cardReady].filter(Boolean).join(" ");
  const tags = (
    <span className={styles.tagGroup}>
      <Tag tag="story" tone={styles.kindStory} dispatch={dispatch}>
        剧情
      </Tag>
      <Tag tag="trial" tone={styles.kindStory} dispatch={dispatch}>
        持续 {GUIREN_TRIAL.lastTurn - state.turn + 1}
      </Tag>
    </span>
  );
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {GUIREN_TRIAL.emoji} {GUIREN_TRIAL.name}
          {tags}
        </div>
        <div className={styles.compactSummary}>
          {mark(p.shengchong)} 👑{state.shengchong}/{GUIREN_TRIAL.minShengchong} · {mark(p.qingyu)} 🪷{state.qingyu}/{GUIREN_TRIAL.minQingyu} · {mark(p.summoned)} 🌙
        </div>
      </FoldBox>
    );
  }
  return (
    <FoldBox fold={fold} className={className}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{GUIREN_TRIAL.emoji}</span>
          {GUIREN_TRIAL.name}
        </span>
        {tags}
      </div>
      {p.all ? <ResolvedBanner icon="🏮" label="条件已满足" detail="保持到回合末即可晋为贵人。" /> : null}
      <p className={styles.flavor}>{GUIREN_TRIAL.flavor}</p>
      <p className={styles.check}>
        {mark(p.shengchong)} 👑圣宠 ≥ {GUIREN_TRIAL.minShengchong}（当前 {state.shengchong}）
      </p>
      <p className={styles.check}>
        {mark(p.qingyu)} 🪷清誉 ≥ {GUIREN_TRIAL.minQingyu}（当前 {state.qingyu}）
      </p>
      <p className={styles.rule}>
        每回合<strong>回合末</strong>判定，三项全部满足即晋为贵人；第 {GUIREN_TRIAL.lastTurn} 回合末仍未满足则失败。
      </p>
    </FoldBox>
  );
}

function NoticeCard({ emoji, name, text, fold }: { emoji: string; name: string; text: string; fold: Fold }) {
  return (
    <FoldBox fold={fold} className={`${styles.card} ${styles.cardStory}`}>
      <div className={fold.compact && !fold.expanded ? styles.compactTitle : styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{emoji}</span>
          {name}
        </span>
      </div>
      {fold.compact && !fold.expanded ? (
        <div className={styles.compactSummary}>剧情 · 无需处理</div>
      ) : (
        <>
          <p className={styles.flavor}>{text}</p>
          <p className={styles.muted}>仅为剧情交代，没有选项、不影响数值，无需处理。</p>
        </>
      )}
    </FoldBox>
  );
}

function cardCompact(state: Z2State, card: CardInst2): string {
  if (isXibieCard(state, card.id)) return XIBIE[card.id as keyof typeof XIBIE].compact;
  const def = CARDS2[card.id];
  return def.rulesCompact ?? def.rulesText.map(compactEffect2).join(" ");
}

function cardRules(state: Z2State, card: CardInst2): string[] {
  if (isXibieCard(state, card.id)) return [XIBIE[card.id as keyof typeof XIBIE].rulesText];
  return [...CARDS2[card.id].rulesText];
}

function HandCard({ state, card, dispatch, fold }: { state: Z2State; card: CardInst2; dispatch: Dispatch; fold: Fold }) {
  const def = CARDS2[card.id];
  const tier = tierOf(state);
  const isLingrong = card.id === "lingrongXiangzhu";
  const xibie = isXibieCard(state, card.id);
  const canPlay = canPlayCard(state, card.uid);
  const free = isFreeByLianmei(state, card.uid);
  const blocked = blockedByChezhou(state, card.uid);
  const unwell = blockedByStatus(state, card.id);
  const responses = storyResponsesFor(state, card.id);
  const events = matchedEvents2(state, card.id);
  const isPending = state.pending?.cardUid === card.uid;
  const play = () => {
    if (canPlay) dispatch({ type: "playCard", cardUid: card.uid });
  };
  const tags = (
    <span className={styles.tagGroup}>
      {isLingrong && tier ? (
        <span className={styles.muted}>
          {TIER_EMOJI[tier]}
          {TIER_LABEL[tier]}
        </span>
      ) : null}
      {isLingrong && tier === "close" ? (
        <Tag tag="lianmei" tone={styles.kindOpportunity} dispatch={dispatch} dim={!lianmeiLit(state, card)}>
          联袂
        </Tag>
      ) : null}
      {isLingrong && tier === "distant" ? (
        <Tag tag="yiyi" tone={styles.kindStory} dispatch={dispatch}>
          依依
        </Tag>
      ) : null}
      {isLingrong && tier === "resentful" ? (
        <Tag tag="chezhou" tone={styles.kindCrisis} dispatch={dispatch}>
          掣肘
        </Tag>
      ) : null}
      {xibie ? (
        <Tag tag="xibie" tone={styles.kindTrial} dispatch={dispatch}>
          🕯️惜别
        </Tag>
      ) : null}
    </span>
  );
  const notes = (
    <>
      {free ? <div className={styles.solves}>联袂：可不占出牌名额打出</div> : null}
      {blocked ? <div className={styles.endHint}>被陵容掣肘，不能打出</div> : null}
      {unwell ? <div className={styles.endHint}>抱恙在身，不能打出</div> : null}
    </>
  );
  const className = [
    styles.handCard,
    isPending && styles.handCardPending,
    fold.compact && !canPlay && !isPending && styles.handCardDisabled,
  ]
    .filter(Boolean)
    .join(" ");
  const answers = [
    ...responses.map((r) => `${STORIES2[r.story.id].name}·${r.option.name}`),
    ...events.map((e) => EVENTS2[e.id].name + (EVENTS2[e.id].double && !CARDS2[card.id].matches.includes(e.id) ? "（双牌）" : "")),
    ...(finaleAccepts(state, card.id) ? [FINALE.name] : []),
  ];
  if (fold.compact && !fold.expanded && !isPending) {
    return (
      <FoldBox fold={fold} className={className} onDouble={play}>
        <div className={styles.compactTitle}>
          {def.emoji} {def.name}
          {tags}
        </div>
        <div className={styles.compactSummary}>{cardCompact(state, card)}</div>
        {notes}
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
        {tags}
      </div>
      <p className={styles.flavor}>{def.flavor}</p>
      {cardRules(state, card).map((line) => (
        <p key={line} className={styles.rule}>
          {expandedEffect2(line)}
        </p>
      ))}
      {isLingrong && tier === "resentful" ? <p className={styles.rule}>没有可解决的事件时打出：圣宠 -1（反噬）</p> : null}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>匹配事件：</span>
        {def.matches.length > 0
          ? def.matches.map((id) => (
              <span key={id} className={[styles.matchChip, events.some((e) => e.id === id) && styles.matchChipInHand].filter(Boolean).join(" ")}>
                {EVENTS2[id].emoji} {EVENTS2[id].name}
              </span>
            ))
          : "无"}
      </p>
      {answers.length > 0 ? <p className={styles.solves}>打出将解决：{answers.map((a) => `【${a}】`).join("")}</p> : null}
      {notes}
      <div className={styles.cardActions}>
        {isPending ? (
          <>
            <span className={styles.solves}>请在上方状态上点「移除」</span>
            <button type="button" className={`${styles.btn} ${styles.btnSmall}`} onClick={() => dispatch({ type: "cancelPending" })}>
              取消
            </button>
          </>
        ) : (
          <button type="button" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} disabled={!canPlay} onClick={play}>
            {free ? "打出（联袂）" : "打出"}
          </button>
        )}
      </div>
    </FoldBox>
  );
}

function Statuses({ state, dispatch }: { state: Z2State; dispatch: Dispatch }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const removable = new Set(state.pending ? removableNegatives(state).map((s) => s.uid) : []);
  const toggle = (uid: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  const evidenceOpen = open.has("evidence");
  return (
    <div className={styles.statusRow}>
      <span className={styles.muted}>状态：</span>
      <ScrollRow className={styles.statuses}>
        {state.turn < HATE_REVEAL_TURN && state.statuses.length === 0 ? <span className={styles.muted}>无</span> : null}
        {state.turn >= HATE_REVEAL_TURN ? (
        <div
          className={[styles.status, styles.statusPositive, evidenceOpen && styles.statusExpanded].filter(Boolean).join(" ")}
          role="button"
          tabIndex={0}
          onClick={() => toggle("evidence")}
          onKeyDown={(e) => activateOnKey(e, () => toggle("evidence"))}
        >
          <div className={styles.statusLine}>
            <span>🗂️ 搜集华妃罪证（{state.evidence.length}）</span>
            <button
              type="button"
              className={`${styles.tag} ${styles.tagButton}`}
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "explainTag", tag: "evidence" });
              }}
            >
              线索
            </button>
          </div>
          {evidenceOpen ? (
            <div className={styles.statusDetail}>
              {state.evidence.length === 0 ? <p className={styles.muted}>尚未找到罪证。</p> : null}
              {state.evidence.map((id) => (
                <p key={id} className={styles.rule}>
                  · {EVIDENCE[id].emoji} {EVIDENCE[id].name}：{EVIDENCE[id].line}
                </p>
              ))}
              <p className={styles.rule}>
                第 30 回合【{FINALE.name}】：≤ 1 条直接失败；2–3 条须打出 3 张牌，4–6 条 2 张，≥ 7 条 1 张。罪证 ≥ {EVIDENCE_THRESHOLDS.fullWin} 条为完胜。
              </p>
            </div>
          ) : null}
        </div>
        ) : null}
        {state.statuses.map((st) => {
          const def = STATUSES2[st.id];
          const notYet = !def.permanent && st.appliesFromTurn > state.turn;
          const expanded = open.has(st.uid);
          return (
            <div
              key={st.uid}
              className={[styles.status, def.tag === "negative" ? styles.statusNegative : styles.statusPositive, expanded && styles.statusExpanded]
                .filter(Boolean)
                .join(" ")}
              role="button"
              tabIndex={0}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "explainTag", tag: def.tag });
                  }}
                >
                  {def.tag === "negative" ? "负面" : "正面"}
                  {def.unremovable ? "·不可移除" : ""}
                </button>
                <span className={styles.muted}>
                  {def.permanent ? "触发 / 结束前一直保留" : notYet ? `下回合起生效，共 ${st.remaining} 回合` : `剩余 ${st.remaining} 回合`}
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
                    {def.effectText}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </ScrollRow>
    </div>
  );
}

function endTurnHints(state: Z2State): string[] {
  const hints: string[] = [];
  if (state.pending) hints.push("请先选择要移除的负面状态，或取消温太医相助。");
  const left = playsLeft2(state);
  if (left > 0 && state.hand.length > 0) hints.push(`还可出 ${left} 张牌。`);
  if (state.finale && state.finale.played.length < state.finale.needed) {
    hints.push(`【${FINALE.name}】还差 ${state.finale.needed - state.finale.played.length} 张牌：回合末不够就会失败！`);
  }
  for (const inst of openStories(state)) {
    const def = STORIES2[inst.id];
    const option = def.options.find((o) => o.id === def.defaultOptionId)!;
    hints.push(option.hidden ? `【${def.name}】未处理将错过。` : `【${def.name}】未选择，将按默认【${option.name}】处理。`);
  }
  for (const ev of [state.crisis, ...state.huafei]) {
    if (!ev || ev.resolved) continue;
    const def = EVENTS2[ev.id];
    hints.push(`【${def.name}】未化解：${ev.burning ? "圣宠 -2" : def.unresolvedText}。`);
  }
  const lingrongInHand = state.hand.filter((c) => c.id === "lingrongXiangzhu").length;
  if (state.relation != null && lingrongInHand > 0) {
    hints.push("手里的陵容没打出：冷落，她会和你生分些。");
    if (tierOf(state) === "distant") hints.push(`依依：${lingrongInHand} 张陵容会留在手里，下回合少抓 ${lingrongInHand} 张。`);
  }
  return hints;
}

function OutcomeModal({ state, onRestart, onMenu }: { state: Z2State; onRestart: () => void; onMenu: () => void }) {
  if (state.outcome === "playing") return null;
  const won = state.outcome === "won";
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zh2-outcome-title">
      <div className={styles.modal}>
        <h2 id="zh2-outcome-title">{won ? (state.victory === "full" ? "🎉 完胜：华妃打入冷宫" : "🎉 险胜：华妃失势") : "🥀 功亏一篑"}</h2>
        {won ? null : <p>{state.lossReason}。</p>}
        {state.turn >= STAGE2.totalTurns || won ? endingLines(state).map((line) => <p key={line}>{line}</p>) : null}
        <p className={styles.muted}>
          最终：第 {state.turn} 回合 · {RANKS[state.rank].name} · 清誉 {state.qingyu} · 圣宠 {state.shengchong} · 罪证 {state.evidence.length}
        </p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onMenu}>
            返回主菜单
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onRestart}>
            重新开始第二关
          </button>
        </div>
      </div>
    </div>
  );
}

function Notice({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zh2-notice-title">
      <div className={styles.modal}>
        <h2 id="zh2-notice-title">{title}</h2>
        {children}
        <div className={styles.modalActions}>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onClose} autoFocus>
            谨记在心
          </button>
        </div>
      </div>
    </div>
  );
}

export function Stage2Rules() {
  return (
    <ul>
      <li>
        你如今是<strong>常在</strong>。守住 🪷清誉 与 👑圣宠：任一项降到 0 立即失败。
      </li>
      <li>
        第 5—9 回合是<strong>贵人考验</strong>：圣宠 ≥ 9、清誉 ≥ 9，且考验期间侍寝成功过。第 9 回合末仍未晋为贵人则失败。召幸（侍寝）从考验开始后才会出现。
      </li>
      <li>
        🔥<strong>华妃恨意</strong>越高，华妃事件越多越狠。侍寝、晋封、有孕都会让她更恨你；失宠、出气、小产会让她消气。恨意到 10 会触发【华妃发难】。
      </li>
      <li>
        🎶<strong>陵容相助</strong>的效果取决于你与她的情分：亲厚时她身边的牌可以联袂免费打出；生分时会依依留在手里（留几张，下回合就少抓几张）；怨怼时会掣肘身边的牌。
      </li>
      <li>
        🌱<strong>身子</strong>决定能否有孕（贵人以后，侍寝后按身子 ÷ 5 判定）。贵人有孕后，机会事件【请脉报喜】会出现，同一回合打出两张相关的牌请太医确诊，才能晋为嫔；伤胎事件和翊坤长跪都可能让你小产。
      </li>
      <li>
        一路搜集 🗂️<strong>华妃罪证</strong>（都要打出特定的牌才能拿到）。罪证越多，第 30 回合扳倒华妃需要打出的牌越少（≤ 1 条直接失败）；5 条以上完胜。
      </li>
      <li>手牌按抓牌顺序排列，不能调整；回合结束时手牌全部弃置（依依的陵容除外，且会占掉下回合的抓牌数）。</li>
    </ul>
  );
}

function countEvents(state: Z2State): { unresolved: number; total: number } {
  const done = boardDone(state);
  return { unresolved: done.filter((d) => !d).length, total: done.length };
}

function boardDone(state: Z2State): boolean[] {
  const done = [state.opportunity, state.crisis, ...state.huafei].filter((e) => e != null).map((e) => e.resolved);
  for (const st of state.stories) done.push(st.chosenOptionId != null);
  if (state.trial.active) done.push(guirenTrialProgress(state).all);
  if (state.finale) done.push(state.finale.played.length >= state.finale.needed);
  return done;
}

export function Stage2Game({ state, dispatch, runCode, showRules, onShowRules, onRestart, onMenu, onLoadCode }: Props) {
  const rank = RANKS[state.turnRank];
  const compact = useSmallScreen();
  const hints = endTurnHints(state);
  const eventCount = countEvents(state);
  const tier = tierOf(state);

  // One-off notices during play (not when loading a save): promotion and 身子 appearing.
  const [notice, setNotice] = useState<"guiren" | "pin" | "shenzi" | "hate" | "miscarriage" | null>(null);
  const prev = useRef({ rank: state.rank, shenzi: state.shenziRevealed, turn: state.turn, seed: state.seed, miscarriages: state.miscarriages });
  useEffect(() => {
    const p = prev.current;
    const sameRun = p.seed === state.seed && state.actions.length > 0;
    if (sameRun && state.outcome === "playing") {
      if (p.miscarriages === 0 && state.miscarriages > 0) setNotice("miscarriage"); // first time only
      else if (state.rank !== p.rank && (state.rank === "guiren" || state.rank === "pin")) setNotice(state.rank);
      else if (state.shenziRevealed && !p.shenzi) setNotice("shenzi");
      else if (p.turn < HATE_REVEAL_TURN && state.turn >= HATE_REVEAL_TURN) setNotice("hate");
    }
    prev.current = { rank: state.rank, shenzi: state.shenziRevealed, turn: state.turn, seed: state.seed, miscarriages: state.miscarriages };
  }, [state]);

  const endTurnReady = canEndTurn2(state) && !showRules && notice == null;
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

  const hateShown = state.turn >= HATE_REVEAL_TURN;
  const plan = huafeiDrawPlan(state.hate);
  const unlocked = HUAFEI_EVENTS.filter((id) => state.hate >= (EVENTS2[id].unlockHate ?? 0));

  return (
    <div className={[styles.page, compact && styles.compact].filter(Boolean).join(" ")}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>甄嬛传 · {STAGE2.title}</h1>
          <div className={styles.headerMeta}>
            <span className={`${styles.badge} ${styles.badgeGold}`}>
              第 {state.turn} / {STAGE2.totalTurns} 回合
            </span>
            <span className={styles.badge}>
              位分：{RANKS[state.rank].name}（抓 {rank.draw} · 打 {rank.plays} · 上限 {rankCap(state)}）
            </span>
            {state.pregnant ? <span className={`${styles.badge} ${styles.badgeGold}`}>👶 身怀龙裔</span> : null}
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
        <Stat label="🪷 清誉" hint="（归 0 即失败）" value={state.qingyu} max={rankCap(state)} danger={state.qingyu <= 1} />
        <Stat label="👑 圣宠" hint="（归 0 即失败）" value={state.shengchong} max={rankCap(state)} danger={state.shengchong <= 1} />
        {state.shenziRevealed ? <Stat label="🌱 身子" value={state.shenzi} max={SHENZI.max} danger={state.shenzi <= 1} /> : null}
        {hateShown ? <Stat label={`🔥 华妃恨意 · ${hateTierLabel(state.hate)}`} value={state.hate} max={HATE.max} danger={state.hate >= 9} /> : null}
      </ScrollRow>

      <ScrollRow className={`${styles.bar} ${styles.piles}`}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>
            <span className={styles.pileIcon}>🀄 </span>本回合出牌
          </div>
          <div className={styles.statValue}>
            {state.playsUsed} / {playLimit2(state)}
          </div>
        </div>
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
            <p className={styles.popoverTitle}>已离场</p>
            <CardList ids={state.departed.map((c) => c.id)} empty="无" />
          </Pile>
        ) : null}
        <Pile icon="🌸" label="机会牌池" count={state.opportunityPool.length}>
          <p className={styles.popoverTitle}>剩余机会事件</p>
          <EventList ids={state.opportunityPool} empty="已抽完，下次将把已用事件重新洗匀。" />
          <p className={styles.popoverTitle}>本轮已出现</p>
          <EventList ids={state.opportunity ? [...state.opportunityUsed, state.opportunity.id] : state.opportunityUsed} empty="无" />
        </Pile>
        <Pile icon="⚡" label="危机牌池" count={state.crisisPool.length}>
          <p className={styles.popoverTitle}>剩余危机事件</p>
          <EventList ids={state.crisisPool} empty="已抽完，下次将把已用事件重新洗匀。" />
          <p className={styles.popoverTitle}>本轮已出现</p>
          <EventList ids={state.crisis ? [...state.crisisUsed, state.crisis.id] : state.crisisUsed} empty="无" />
        </Pile>
        {hateShown ? (
        <Pile icon="🏯" label="华妃事件" count={unlocked.length}>
          <p className={styles.popoverTitle}>
            恨意 {state.hate}：每回合 {plan.fixed} 张{plan.chance > 0 ? `，再 ${plan.chance * 100}% 加 1 张` : ""}（按回合开始时计算）
          </p>
          <p className={styles.popoverTitle}>已解锁</p>
          <EventList ids={unlocked} empty="恨意不足 3，暂无华妃事件。" />
          {unlocked.includes("huanyixiangZhuanchong") ? <p className={styles.muted}>【欢宜香浓】只在有召幸的回合出现。</p> : null}
        </Pile>
        ) : null}
      </ScrollRow>

      <Statuses state={state} dispatch={dispatch} />

      <h2 className={styles.sectionTitle}>
        本回合事件 <span title="未解决 / 事件总数">{eventCount.unresolved}/{eventCount.total}</span>
      </h2>
      <ScrollRow className={styles.events}>
        {state.notices.map((n) => (
          <NoticeCard key={n.name} emoji={n.emoji} name={n.name} text={n.text} fold={fold(`notice-${n.name}`)} />
        ))}
        {state.stories.map((inst) => (
          <StoryCard key={inst.id} state={state} inst={inst} dispatch={dispatch} fold={fold(`story-${inst.id}`)} />
        ))}
        <FinaleCard state={state} fold={fold("finale")} dispatch={dispatch} />
        <TrialCard state={state} fold={fold("trial")} dispatch={dispatch} />
        {state.opportunity ? <EventCard state={state} inst={state.opportunity} fold={fold(state.opportunity.uid)} dispatch={dispatch} /> : null}
        {state.crisis ? <EventCard state={state} inst={state.crisis} fold={fold(state.crisis.uid)} dispatch={dispatch} /> : null}
        {state.huafei.map((ev) => (
          <EventCard key={ev.uid} state={state} inst={ev} fold={fold(ev.uid)} dispatch={dispatch} />
        ))}
      </ScrollRow>

      <h2 className={styles.sectionTitle}>
        手牌（{state.hand.length}）· 按抓牌顺序排列
        <span className={styles.muted}>{compact ? " · 点击展开，双击打出" : " · 双击打出"}</span>
      </h2>
      <ScrollRow className={styles.hand}>
        {state.hand.length === 0 ? <p className={styles.muted}>没有手牌。</p> : null}
        {state.hand.map((card) => (
          <HandCard key={card.uid} state={state} card={card} dispatch={dispatch} fold={fold(card.uid)} />
        ))}
      </ScrollRow>

      <div className={styles.endTurnRow}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!canEndTurn2(state)} onClick={() => dispatch({ type: "endTurn" })}>
          结束回合（空格）
        </button>
        {hints.map((h) => (
          <span key={h} className={styles.endHint}>
            {h}
          </span>
        ))}
      </div>

      <div className={styles.bottom}>
        <LogView entries={state.log} />
        <RunCodePanel code={runCode} onLoad={onLoadCode} />
      </div>

      {showRules ? (
        <Notice title="规则说明 · 第二关" onClose={() => onShowRules(false)}>
          <Stage2Rules />
        </Notice>
      ) : null}
      {notice === "guiren" || notice === "pin" ? (
        <Notice title={`🏮 晋为${RANKS[notice].name}`} onClose={() => setNotice(null)}>
          <p>恭喜小主晋为{RANKS[notice].name}！只是位分越高，华妃的眼睛就盯得越紧。</p>
          {LINGRONG_PROMOTION_TEXT[notice] && tier ? (
            <p>
              🎶 {LINGRONG_PROMOTION_TEXT[notice]}
              <span className={styles.muted}>
                （陵容与你生分了些，如今情分：{TIER_EMOJI[tier]}
                {TIER_LABEL[tier]}）
              </span>
            </p>
          ) : null}
          <p className={styles.muted}>
            从下一回合起每回合抓 {RANKS[notice].draw} 张、最多打 {RANKS[notice].plays} 张，清誉 / 圣宠上限提高到 {RANKS[notice].cap}。
          </p>
        </Notice>
      ) : null}
      {notice === "miscarriage" ? (
        <Notice title="🥀 小产" onClose={() => setNotice(null)}>
          <p>
            {state.miscarriageCause === "翊坤长跪"
              ? "烈日下跪了这许久，腹中一阵绞痛。太医赶到时，孩子已经保不住了。"
              : state.miscarriageCause === "身子亏空"
                ? "身子亏空到了极处，再也护不住腹中的孩子。太医跪在榻前，只说了一句「小主节哀」。"
                : `「${state.miscarriageCause ?? "暗手"}」伤了胎气。太医跪在榻前，只说了一句「小主节哀」。`}
          </p>
          <p>
            失去了【身怀龙裔】；身子大伤，清誉、圣宠也跟着下降。位分不降，华妃的恨意倒是消了些。身子若亏空到 0，还得卧床静养。
          </p>
          <p className={styles.muted}>召幸会重新出现。要再有身孕，只能等下一次侍寝了。</p>
        </Notice>
      ) : null}
      {notice === "hate" ? (
        <Notice title="🔥 华妃恨意 · 🗂️ 罪证" onClose={() => setNotice(null)}>
          <p>你新晋常在，入了华妃的眼。今日去翊坤宫请安，你的应对决定她的初始恨意。</p>
          <p>
            <strong>🔥 华妃恨意</strong>（0–10）越高，华妃事件越多越狠，到 10 她当场发难。侍寝、晋封、有孕会让她更恨你；失宠、避宠、让她出气、小产会让她消气。
          </p>
          <p>
            <strong>🗂️ 搜集华妃罪证</strong>：从今日起留心华妃的罪状。罪证越多，第 30 回合扳倒华妃越容易；只有 1 条或更少则必败。
          </p>
        </Notice>
      ) : null}
      {notice === "shenzi" ? (
        <Notice title="🌱 身子" onClose={() => setNotice(null)}>
          <p>
            {state.shenziRevealedBy === "summon" ? "因为侍寝，新出现了一项资源：" : "新出现了一项资源："}
            <strong>🌱 身子</strong>。它关系到能否怀上龙裔，以及能否平安生产。
          </p>
          <p>贵人以后，每次侍寝成功都按「身子 ÷ 5」判定能否有喜（5 以上必定有孕）。身子降到 0 时须卧床静养两回合。</p>
          <p className={styles.muted}>
            当前身子 {state.shenzi} / {SHENZI.max}。
          </p>
        </Notice>
      ) : null}
      <OutcomeModal state={state} onRestart={onRestart} onMenu={onMenu} />
    </div>
  );
}


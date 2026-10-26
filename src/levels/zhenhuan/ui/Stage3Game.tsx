import { useEffect, useRef, useState, type ReactNode } from "react";
import { RunCodePanel } from "../../../components/RunCodePanel";
import { useSmallScreen } from "../../../logic/useSmallScreen";
import { CAMPAIGN_TITLE } from "../data/content";
import { TIER_EMOJI, TIER_LABEL } from "../data/stage2Content";
import {
  ACT_TITLE,
  CARDS3,
  CHANGXIANGSI,
  CHUNYUAN,
  CONFRONT,
  FABRICATED_SECRET,
  DOUBT,
  EVENT_KIND3_LABEL,
  EVENTS3,
  EXIT,
  FEILAO,
  HOMECOMING,
  LENGGONG_LINGRONG,
  LINGRONG_FAREWELL,
  LINGRONG_EVENT3,
  LOSS3_STORY,
  PAIRS,
  PLAYS_INFO3,
  POPUP_TEXT,
  RANKS,
  RESOURCE_INFO3,
  RESOURCE3_LABEL,
  RIVALS,
  SHENZI,
  STAGE3,
  matchesInAct,
  cardRules3,
  unresolvedText3,
  STATUSES3,
  statusText3,
  STORIES3,
  TAG3_INFO,
  RELIC_DOUBT_RULE,
  XIUXING,
  YIHUA,
  confrontOutcome,
  type CardId3,
  type EventId3,
  type PopupId,
  type TagId3,
  dengmenOpenText,
} from "../data/stage3Content";
import {
  blockedByChezhou3,
  blockingStatusName3,
  canEndTurn3,
  canPlayCard3,
  chunyuanAccepts,
  chunyuanChecked,
  confrontAccepts,
  confrontLines,
  endingLines3,
  endingStory3,
  feilaoAccepts,
  feilaoCurrentTier,
  hasStatus3,
  qinseReady,
  isFreeByLianmei3,
  isRelic,
  lianmeiLit3,
  lingrongAbsent,
  matchedEvents3,
  openStories3,
  pairLocked,
  solveCount,
  playLimit3,
  playsLeft3,
  rankCap3,
  rankName3,
  removableNegatives3,
  storyBasicOptions3,
  storyCardResponses3,
  storyResponsesFor3,
  summonUnwell3,
  tierOf3,
  xiayuCost,
  xiayuS,
  yihuaAccepts,
  type CardInst3,
  type EventInst3,
  type StoryInst3,
  type Z3Action,
  type Z3State,
} from "../logic/stage3Engine";
import { cardArtUrl, eventArtUrl, specialArtUrl, storyArtUrl } from "./art";
import { CardArt, FoldBox, GameHeader, LogView, Pile, PileGroup, ResolvedBanner, ScrollRow, StatChip, TagChip, activateOnKey, countBy, groupStatuses, isTypingTarget, type Fold } from "./common";
import { compactEffect3, expandedEffect3 } from "./effectText3";
import styles from "./zhenhuan.module.css";

type Dispatch = (a: Z3Action) => void;

type Props = {
  state: Z3State;
  dispatch: Dispatch;
  runCode: string;
  showRules: boolean;
  onShowRules: (open: boolean) => void;
  onRestart: () => void;
  onMenu: () => void;
  onLoadCode: (raw: string) => { ok: true } | { ok: false; error: string };
};

function Tag({ tag, tone, dispatch, dim, children }: { tag: TagId3; tone?: string; dispatch: Dispatch; dim?: boolean; children: ReactNode }) {
  return (
    <TagChip tone={[tone, dim && styles.tagDim].filter(Boolean).join(" ")} onExplain={() => dispatch({ type: "explainTag", tag })}>
      {children}
    </TagChip>
  );
}

function CardList({ ids, empty }: { ids: readonly CardId3[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {CARDS3[id].emoji} {CARDS3[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

function EventList({ ids, empty }: { ids: readonly EventId3[]; empty: string }) {
  if (ids.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.popoverList}>
      {countBy(ids).map(([id, n]) => (
        <li key={id}>
          {EVENTS3[id].emoji} {EVENTS3[id].name} ×{n}
        </li>
      ))}
    </ul>
  );
}

function Chips({ ids, lit }: { ids: readonly CardId3[]; lit: (id: CardId3) => boolean }) {
  return (
    <>
      {ids.map((id) => (
        <span key={id} className={[styles.matchChip, lit(id) && styles.matchChipInHand].filter(Boolean).join(" ")}>
          {CARDS3[id].emoji} {CARDS3[id].name}
        </span>
      ))}
    </>
  );
}

const KIND_TONE = { opportunity: styles.kindOpportunity, crisis: styles.kindCrisis, huanghou: styles.kindHuanghou };
const CARD_TONE = { opportunity: styles.cardOpportunity, crisis: styles.cardCrisis, huanghou: styles.cardHuanghou };

/** 连环事件的两半在手牌上只列一项：共同前缀（如「御花园赏花」）。 */
function collapsePairs<T extends { id: EventId3 }>(items: readonly T[]): { key: string; emoji: string; name: string; items: T[] }[] {
  const out: { key: string; emoji: string; name: string; items: T[] }[] = [];
  for (const it of items) {
    const pair = EVENTS3[it.id].pair;
    const key = pair ? `pair:${pair}` : it.id;
    const hit = out.find((o) => o.key === key);
    if (hit) hit.items.push(it);
    else out.push({ key, emoji: pair ? PAIRS[pair].emoji : EVENTS3[it.id].emoji, name: pair ? PAIRS[pair].name : EVENTS3[it.id].name, items: [it] });
  }
  return out;
}


function answeringCards(id: EventId3): CardId3[] {
  const def = EVENTS3[id];
  const singles = (Object.keys(CARDS3) as CardId3[]).filter((c) => CARDS3[c].matches.includes(id));
  return [...singles, ...(def.double ?? []).filter((c) => !singles.includes(c))];
}

function resolvedDetail(inst: EventInst3): string {
  const def = EVENTS3[inst.id];
  const by = inst.resolvedBy ? `由【${CARDS3[inst.resolvedBy].name}】` : "";
  const tier = inst.lingrong && inst.resolvedBy === "lingrongXiangzhu" ? `（陵容·${TIER_LABEL[inst.lingrong]}）` : "";
  const suppressed = inst.suppressed && def.rival ? `；打压了${RIVALS[def.rival].name}` : "";
  if (def.kind === "huanghou") return `${by}领受${tier}。`;
  if (def.kind !== "opportunity") return `${by}化解${tier}，回合末不受惩罚${suppressed}。`;
  return `${by}把握${tier}${inst.rewardDoubled ? "（眉庄相助：奖励翻倍）" : ""}。`;
}

function EventCard({ state, inst, fold, dispatch }: { state: Z3State; inst: EventInst3; fold: Fold; dispatch: Dispatch }) {
  const def = EVENTS3[inst.id];
  const isOpp = def.kind === "opportunity";
  const locked = pairLocked(state, inst);
  const handIds = new Set(inst.resolved ? [] : state.hand.map((c) => c.id));
  const className = [styles.card, CARD_TONE[def.kind], inst.resolved && styles.cardResolved, locked && styles.cardLocked].filter(Boolean).join(" ");
  const tags = (
    <span className={styles.tagGroup}>
      <Tag tag={def.kind} tone={KIND_TONE[def.kind]} dispatch={dispatch}>
        {EVENT_KIND3_LABEL[def.kind]}
      </Tag>
      {def.ally ? (
        <Tag tag="ally" tone={styles.kindOpportunity} dispatch={dispatch}>
          盟友
        </Tag>
      ) : null}
      {def.rival ? (
        <Tag tag="rival" tone={styles.kindCrisis} dispatch={dispatch}>
          对头·{RIVALS[def.rival].name}
        </Tag>
      ) : null}
      {def.pair ? (
        <Tag tag="pair" tone={styles.kindTrial} dispatch={dispatch}>
          🔗连环{locked ? "·锁" : ""}
        </Tag>
      ) : null}
      {def.jingbai && state.act === 2 && !state.atPeak ? (
        <Tag tag="jingbai" tone={styles.kindCrisis} dispatch={dispatch}>
          🧹静白
        </Tag>
      ) : null}
      {def.double || def.needTwo ? (
        <Tag tag="double" tone={styles.kindStory} dispatch={dispatch}>
          双牌{def.needTwo && inst.eased ? "·打压" : ""} {(inst.progress ?? []).length}/{def.needTwo ? solveCount(inst) : 2}
        </Tag>
      ) : null}
    </span>
  );
  const story = inst.resolved && inst.resolvedBy && inst.resolvedBy !== "lingrongXiangzhu" ? (inst.story ?? def.resolvedStory[inst.resolvedBy]) : undefined;
  const lingrongStory = inst.lingrong && (!inst.resolved || inst.resolvedBy === "lingrongXiangzhu") ? LINGRONG_EVENT3[inst.id]?.[inst.lingrong]?.story : undefined;
  const resolvedLabel = isOpp ? "已把握" : def.kind === "huanghou" ? "已领受" : "已化解";
  const okLabel = def.kind === "huanghou" ? "打出特定牌：" : "处理：";
  const noLabel = def.kind === "huanghou" ? "默认（回合末）：" : "未处理（回合末）：";
  const flavor = state.atPeak && def.peakFlavor ? def.peakFlavor : def.flavor;
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
            ? `${isOpp ? "✅" : "🛡️"} ${inst.resolvedBy ? CARDS3[inst.resolvedBy].emoji : ""}`
            : def.kind === "huanghou"
              ? `⏳ ${compactEffect3(unresolvedText3(def, state.turn))} ｜ 🛡️ ${compactEffect3(def.resolvedText)}`
              : isOpp
                ? `✅ ${compactEffect3(def.resolvedText)}${locked ? " 🔒" : ""}`
                : `❌ ${compactEffect3(unresolvedText3(def, state.turn))}`}
        </div>
      </FoldBox>
    );
  }
  const lingrongTable = LINGRONG_EVENT3[inst.id];
  const tier = tierOf3(state);
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
      <CardArt src={eventArtUrl(inst.id)} emoji={def.emoji} />
      {inst.resolved ? <ResolvedBanner icon={isOpp ? "✅" : "🛡️"} label={resolvedLabel} detail={resolvedDetail(inst)} story={story ?? lingrongStory} /> : null}
      {!inst.resolved && inst.lingrongFailed ? <p className={styles.endHint}>陵容失效：{lingrongStory}</p> : null}
      <p className={styles.flavor}>{flavor}</p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>{okLabel}</span>
        {expandedEffect3(def.resolvedText)}
      </p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>{noLabel}</span>
        {expandedEffect3(unresolvedText3(def, state.turn))}
      </p>
      {def.note ? <p className={styles.rule}>{def.note}</p> : null}
      {def.rival && def.suppressCard && !def.pair ? (
        <p className={styles.rule}>
          ⚔️ 两张解牌中有【{CARDS3[def.suppressCard].emoji}
          {CARDS3[def.suppressCard].name}】即算打压{RIVALS[def.rival].name}：获得【打压·{RIVALS[def.rival].name}】，她的危机下次出现时少需要 1 张解牌。
        </p>
      ) : null}
      {def.rival && !inst.resolved && state.statuses.some((st) => st.id === "xinGuirenZhangyi") ? (
        <p className={styles.rule}>🗣️ 没化解的话，【欣贵人解围】会替你挡下这次惩罚。</p>
      ) : null}
      {def.pair ? (
        <p className={styles.rule}>
          🔗 一石二鸟：【{CARDS3[PAIRS[def.pair].shared].emoji}
          {CARDS3[PAIRS[def.pair].shared].name}】
        </p>
      ) : null}
      {locked ? <p className={styles.endHint}>🔒 连环危机还没化解，这张机会暂时锁着。</p> : null}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>匹配牌：</span>
        <Chips ids={answeringCards(inst.id)} lit={(id) => handIds.has(id)} />
      </p>
      {lingrongTable && tier ? (
        <p className={styles.rule}>
          🎶 也可用【陵容相助】，效果视你与陵容的情分而定（当前：{TIER_EMOJI[tier]}
          {TIER_LABEL[tier]}）{Object.values(lingrongTable).some((o) => o.shuhenjiao) ? "；她会送来🧴舒痕胶" : ""}。
        </p>
      ) : null}
    </FoldBox>
  );
}

function StoryCard({ state, inst, dispatch, fold }: { state: Z3State; inst: StoryInst3; dispatch: Dispatch; fold: Fold }) {
  const def = STORIES3[inst.id];
  const chosen = inst.chosenOptionId;
  const unwell = inst.id === "zhaoxing" && chosen == null ? summonUnwell3(state) : null;
  const cardResponses = unwell ? [] : storyCardResponses3(def);
  const locked = chosen != null || state.pending != null || state.outcome !== "playing";
  const chosenOption = chosen ? def.options.find((o) => o.id === chosen) : undefined;
  const defaultOption = def.options.find((o) => o.id === def.defaultOptionId)!;
  const tier = tierOf3(state);
  const className = [styles.card, styles.cardStory, chosen && styles.cardResolved].filter(Boolean).join(" ");
  const tag = (
    <span className={styles.tagGroup}>
      <Tag tag="story" tone={styles.kindStory} dispatch={dispatch}>
        剧情
      </Tag>
      {def.options.some((o) => o.two) ? (
        <Tag tag="double" tone={styles.kindStory} dispatch={dispatch}>
          双牌 {inst.pendingOptionId ? 1 : 0}/2
        </Tag>
      ) : null}
    </span>
  );
  const costNote = (o: (typeof def.options)[number]) => {
    if (!o.xiayu) return "";
    const cost = xiayuCost(state, o.xiayu, inst.solved ?? 0);
    return `（眼下的代价：${cost.length ? cost.map((d) => `${RESOURCE3_LABEL[d.resource]} ${d.amount}`).join("、") : "没有代价"}）`;
  };
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
            ? `📝 ${inst.viaCard ? CARDS3[inst.viaCard].emoji : chosenOption.name} ${chosenOption.compact ?? compactEffect3(resultText)}`
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
      <CardArt src={storyArtUrl(inst.id)} emoji={def.emoji} />
      {chosenOption ? (
        <ResolvedBanner
          icon="📝"
          label="已抉择"
          detail={`${inst.viaCard ? `打出【${CARDS3[inst.viaCard].name}】：` : "选择"}「${chosenOption.name}」：${expandedEffect3(resultText)}。`}
          story={inst.story ?? chosenOption.story}
        />
      ) : null}
      <p className={styles.flavor}>{def.flavor}</p>
      {def.note ? <p className={styles.rule}>{def.note}</p> : null}
      {def.options.some((o) => o.xiayu) && !chosen ? (
        <p className={styles.rule}>局势 {xiayuS(state, inst.solved ?? 0)}：再打出 {xiayuS(state, inst.solved ?? 0)} 张解牌即可完美解决。</p>
      ) : null}
      {(inst.steps ?? []).map((t, i) => (
        <p key={i} className={styles.flavor}>{t}</p>
      ))}
      {unwell ? <p className={styles.endHint}>{unwell}，不能侍寝。</p> : null}
      {storyBasicOptions3(def).map((option) => (
        <div key={option.id} className={[styles.option, chosen === option.id && styles.optionChosen].filter(Boolean).join(" ")}>
          <span>
            <strong>{option.name}</strong>
            {option.id === def.defaultOptionId ? <span className={styles.muted}>（默认）</span> : null}：{expandedEffect3(option.text)}
            {chosen == null ? costNote(option) : ""}
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
      {cardResponses.map((option, i) => {
        // 双牌各打一张的选项合写一行
        if (option.distinct && cardResponses.findIndex((o) => o.distinct) !== i) return null;
        const partners = option.distinct ? cardResponses.filter((o) => o.distinct) : [option];
        const lingrongNote = option.card === "lingrongXiangzhu" && tier ? `（当前情分：${TIER_EMOJI[tier]}${TIER_LABEL[tier]}）` : "";
        return (
          <p key={option.id} className={[styles.rule, partners.some((o) => chosen === o.id) && styles.optionChosen].filter(Boolean).join(" ")}>
            {partners.map((o) => {
              const inHand = state.hand.some((c) => c.id === o.card);
              return (
                <span key={o.id} className={[styles.matchChip, inHand && !locked && styles.matchChipInHand].filter(Boolean).join(" ")}>
                  {CARDS3[o.card!].emoji} {CARDS3[o.card!].name}
                </span>
              );
            })}
            {option.name}：{expandedEffect3(option.text)}
            {chosen == null ? qinseNote(state, option) : ""}
            {chosen == null ? costNote(option) : ""}
            {lingrongNote}
          </p>
        );
      })}
      {!chosen && inst.pendingOptionId ? (
        <p className={styles.endHint}>
          ⏳ 【{def.options.find((o) => o.id === inst.pendingOptionId)?.name}】1/2：本回合再打出另一张能应对此事的牌。
        </p>
      ) : null}
      {!chosen && !defaultOption.hidden ? <p className={styles.flavor}>未作选择就结束回合时，按默认选项【{defaultOption.name}】处理。</p> : null}
      {!chosen && defaultOption.hidden ? <p className={styles.flavor}>不处理：{defaultOption.text}</p> : null}
    </FoldBox>
  );
}

/** A story-area card with a progress line (纯元故衣 / 对质 / 肺痨之诬 / 月下琴笛 / 移花接木). */
/** 合婚庚帖：踏雪问疾与月下琴笛都已完成时，才写下这一笔的后续效果。 */
function qinseNote(state: Z3State, option: { readonly flag?: string }): string {
  return option.flag === "gengtie" && qinseReady(state) ? "；此后每回合抓牌 +1（舟覆之后起）" : "";
}

function SpecialCard({
  emoji,
  name,
  art,
  done,
  tag,
  summary,
  fold,
  dispatch,
  children,
}: {
  emoji: string;
  name: string;
  art: Parameters<typeof specialArtUrl>[0];
  done: boolean;
  tag?: ReactNode;
  summary: string;
  fold: Fold;
  dispatch: Dispatch;
  children: ReactNode;
}) {
  const className = [styles.card, styles.cardStory, done && styles.cardReady].filter(Boolean).join(" ");
  const tags = (
    <span className={styles.tagGroup}>
      <Tag tag="story" tone={styles.kindStory} dispatch={dispatch}>
        剧情
      </Tag>
      {tag}
    </span>
  );
  if (fold.compact && !fold.expanded) {
    return (
      <FoldBox fold={fold} className={className}>
        <div className={styles.compactTitle}>
          {emoji} {name}
          {done ? " 🆗" : ""}
          {tags}
        </div>
        <div className={styles.compactSummary}>{summary}</div>
      </FoldBox>
    );
  }
  return (
    <FoldBox fold={fold} className={className}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{emoji}</span>
          {name}
          {done ? " 🆗" : null}
        </span>
        {tags}
      </div>
      <CardArt src={specialArtUrl(art)} emoji={emoji} />
      {children}
    </FoldBox>
  );
}

const mark = (ok: boolean) => <span className={ok ? styles.ok : styles.no}>{ok ? "✓" : "✗"}</span>;

function ChunyuanCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
  const c = state.chunyuan;
  if (!c) return null;
  const done = chunyuanChecked(state);
  const inHand = (id: CardId3) => chunyuanAccepts(state, id) != null && state.hand.some((x) => x.id === id);
  const outlook = done ? "识破" : c.first ? `只起疑：👑-${CHUNYUAN.halfPenalty}` : `❌ 👑-${CHUNYUAN.failPenalty}`;
  return (
    <SpecialCard
      emoji={CHUNYUAN.emoji}
      name={CHUNYUAN.name}
      art="chunyuan"
      done={done}
      summary={`${c.first ? "✓" : "✗"}① ${c.second ? "✓" : "✗"}② ${outlook}`}
      fold={fold}
      dispatch={dispatch}
    >
      {done ? <ResolvedBanner icon="👗" label="已识破" detail="免祸。" story={CHUNYUAN.successStory} /> : null}
      <p className={styles.flavor}>{CHUNYUAN.flavor}</p>
      <p className={styles.rule}>{expandedEffect3(CHUNYUAN.rule)}</p>
      <p className={styles.check}>
        {mark(c.first != null)} ① 起疑：<Chips ids={CHUNYUAN.firstCards} lit={inHand} />
      </p>
      {c.first ? <p className={styles.stepStory}>{CHUNYUAN.firstStory[c.first]}</p> : null}
      <p className={styles.check}>
        {mark(c.second != null)} ② 查实（须先起疑）：<Chips ids={CHUNYUAN.checkCards} lit={inHand} />
      </p>
      {c.second ? <p className={styles.stepStory}>{CHUNYUAN.checkStory[c.second]}</p> : null}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>照现在：</span>
        {done ? "识破，免祸。" : c.first ? `只起疑，回合末圣宠 -${CHUNYUAN.halfPenalty}。` : `没识破，回合末圣宠 -${CHUNYUAN.failPenalty}。`}
      </p>
    </SpecialCard>
  );
}

function ConfrontCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
  const c = state.confront;
  if (!c) return null;
  const short = Math.max(0, c.needed - c.played.length);
  const exit = EXIT[confrontOutcome(c.presented, short)];
  const inHand = (id: CardId3) => state.hand.some((x) => x.id === id);
  return (
    <SpecialCard
      emoji={CONFRONT.emoji}
      name={CONFRONT.name}
      art="confront"
      done={short === 0}
      tag={
        <span className={styles.muted}>
          辩白 {c.played.length}/{c.needed}
        </span>
      }
      summary={`🗂️${c.presented} 🃏${c.played.length}/${c.needed} → ${exit.emoji}${exit.name}`}
      fold={fold}
      dispatch={dispatch}
    >
      <p className={styles.flavor}>{CONFRONT.flavor}</p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>皇后拿出了 {c.presented} 件事：</span>本回合须打出 <strong>{c.needed}</strong> 张辩白牌
        {state.rank === "guiren" ? "（贵人位分低，多 1 张）" : ""}。少打一张，结果就差一档。陵容称病没来，她的牌打不出。
      </p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>照现在的辩白：</span>
        {exit.emoji} {exit.name}
        {exit.effects.length ? `（${exit.effects.map((d) => `${RESOURCE3_LABEL[d.resource]} ${d.amount}`).join("、")}）` : ""}
        {exit.name === EXIT[4].name ? "：关卡失败" : ""}
      </p>
      {c.stories.map((line) => (
        <p key={line} className={styles.stepStory}>
          {line}
        </p>
      ))}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>辩白牌：</span>
        <Chips ids={CONFRONT.cards} lit={inHand} />
      </p>
    </SpecialCard>
  );
}

function FeilaoCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
  const f = state.feilao;
  if (!f) return null;
  const t = feilaoCurrentTier(state);
  const tierDef = FEILAO.tiers[t]!;
  const inHand = (id: CardId3) => state.hand.some((x) => x.id === id);
  return (
    <SpecialCard emoji={FEILAO.emoji} name={FEILAO.name} art="feilao" done={t === 0} summary={`${tierDef.name} · ${compactEffect3(tierDef.text)}`} fold={fold} dispatch={dispatch}>
      <p className={styles.flavor}>{FEILAO.flavor}</p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>眼下：</span>
        {tierDef.name}：{expandedEffect3(tierDef.text)}
      </p>
      {f.played.filter((id, i) => f.played.indexOf(id) === i).map((id) => (
        <p key={id} className={styles.stepStory}>
          {FEILAO.cardStory[id]}
        </p>
      ))}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>每张减轻一档：</span>
        <Chips ids={FEILAO.cards} lit={inHand} />
      </p>
      <p className={styles.muted}>回合末结算，之后迁居凌云峰。</p>
    </SpecialCard>
  );
}

function ChangxiangsiCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
  const c = state.changxiangsi;
  if (!c) return null;
  const guo = c.played.includes("guojunwangXiangzhu");
  const chan = c.played.includes("chanyuXiushen");
  const inHand = (id: CardId3) => !c.done && state.hand.some((x) => x.id === id);
  return (
    <SpecialCard
      emoji={CHANGXIANGSI.emoji}
      name={CHANGXIANGSI.name}
      art="changxiangsi"
      done={c.done}
      tag={
        <Tag tag="double" tone={styles.kindStory} dispatch={dispatch}>
          双牌 {c.done ? 2 : Number(guo) + Number(chan)}/2
        </Tag>
      }
      summary={c.done ? "🎶 笛箫合奏 🪷+2" : `${guo ? "✓" : "✗"}🎐 ${chan ? "✓" : "✗"}📿 → 🪷+2`}
      fold={fold}
      dispatch={dispatch}
    >
      {c.done ? <ResolvedBanner icon="🎶" label="笛箫合奏" detail="清誉 +2。" story={CHANGXIANGSI.story} /> : null}
      <p className={styles.flavor}>{CHANGXIANGSI.flavor}</p>
      <p className={styles.rule}>{expandedEffect3(CHANGXIANGSI.rule)}</p>
      <p className={styles.rule}>
        <Chips ids={["guojunwangXiangzhu", "chanyuXiushen"]} lit={inHand} />
      </p>
    </SpecialCard>
  );
}

/** 移花接木第 n 步解完后的结果文本，按落发、所用解牌而不同。 */
function yihuaDoneText(state: Z3State, n: number): string {
  const y = state.yihua!;
  switch (n) {
    case 1:
      return y.yinjia.map((id) => YIHUA.yinjiaStory[id] ?? "").join("") + (y.yinjiaNeed > 1 ? YIHUA.luofaDone : "");
    case 2:
      return `${YIHUA.ouyuDone[y.ouyuCard ?? "chanyuXiushen"] ?? ""}${YIHUA.ouyuStory}`;
    case 3:
      return YIHUA.maiDone;
    default: {
      const d = y.dengmen;
      if (!d) return "";
      const closing = d.needed === 0 ? YIHUA.dengmenNoneDone : state.victory === "narrow" || state.exitTier === 3 ? YIHUA.dengmenNarrow : YIHUA.dengmenDone;
      return d.played.map((id) => YIHUA.dengmenStory[id] ?? "").join("") + closing;
    }
  }
}

function YihuaCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
  const y = state.yihua;
  if (!y) return null;
  const inHand = (id: CardId3) => state.hand.some((x) => x.id === id && yihuaAccepts(state, id));
  const stepCards: readonly (readonly CardId3[])[] = [y.yinjiaNeed > 1 ? [...YIHUA.yinjiaCards, YIHUA.luofaExtra] : YIHUA.yinjiaCards, ["chanyuXiushen", "jingchaiBuqun"], ["wenTaiyiZhenzhi"], YIHUA.dengmenCards];
  const relicCount = state.hand.filter((c) => isRelic(c.id)).length;
  return (
    <SpecialCard
      emoji={YIHUA.emoji}
      name={YIHUA.name}
      art="yihua"
      done={y.step === 5}
      tag={
        <>
          <Tag tag="yihua" tone={styles.kindTrial} dispatch={dispatch}>
            持续
          </Tag>
        </>
      }
      summary={`${YIHUA.steps.map((s, i) => `${y.step > i + 1 ? "✓" : y.step === i + 1 ? "▶" : "·"}${s.emoji}`).join(" ")}`}
      fold={fold}
      dispatch={dispatch}
    >
      {y.step === 5 ? <ResolvedBanner icon="👑" label="四步俱成" detail="回合末回宫。" /> : null}
      <p className={styles.flavor}>{YIHUA.flavor}</p>
      {YIHUA.steps.map((s, i) => {
        const n = i + 1;
        if (y.step < n) return null;
        const state_ = y.step > n ? "done" : "now";
        return (
          <div key={s.name} className={[styles.option, state_ === "now" && styles.optionChosen, state_ === "done" && styles.stepStory].filter(Boolean).join(" ")}>
            <span>
              {mark(state_ === "done")} <strong>
                {["①", "②", "③", "④"][i]} {s.emoji} {s.name}
              </strong>
              ：{state_ === "done" ? yihuaDoneText(state, n) : s.todo}
              {state_ === "now" && n === 1 && y.yinjiaNeed > 1 ? ` （已落发：要打 ${y.yinjiaNeed} 张，至少 1 张槿汐，另一张可以是眉庄；已打 ${y.yinjia.length} 张）` : ""}
              {state_ === "now" && n === 2 && y.ouyuDue != null ? (y.ouyuDue === state.turn ? "（皇上今日驾临：本回合解决【圣驾偶遇】）" : `（第 ${y.ouyuDue} 回合皇上驾临）`) : ""}
              {state_ === "now" && n === 4 ? (y.dengmen ? `（皇上已登门：须在第 ${y.dengmen.openTurn}–${y.dengmen.openTurn + 1} 回合内打出 ${y.dengmen.needed} 张解牌${y.dengmen.needed === 0 ? "，只需过剧情" : `，已打 ${Math.min(y.dengmen.played.length, y.dengmen.needed)} 张；疑点 ${y.dengmen.doubt}、遗物 ${y.dengmen.relics} 件${state.exitTier === 1 ? "" : "，非体面自请多 1 张"}`}）` : "（下一回合到来：按当时的疑点与未焚的遗物定解牌张数，两回合内打够）") : ""}
              {state_ === "now" ? (
                <>
                  <br />
                  <Chips ids={stepCards[i]!} lit={inHand} />
                </>
              ) : null}
            </span>
          </div>
        );
      })}
      {relicCount > 0 && y.step >= 2 && y.step < 5 ? (
        <p className={styles.endHint}>手里有 {relicCount} 件遗物：回合结束时还在手里，疑点 +{relicCount}（睹物生疑）。</p>
      ) : null}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>📜 疑点 {y.doubt}/{DOUBT.max}：</span>
        {y.step < 3 ? "偶遇完成之前每回合末 +1。" : "已止住上涨。"}每打出一张槿汐相助或眉庄相助 -1。到 {DOUBT.max} 即失败；第 {STAGE3.totalTurns} 回合末仍未完成也失败。
      </p>
    </SpecialCard>
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
          <p className={styles.muted}>仅为剧情交代，没有选项，无需处理。</p>
        </>
      )}
    </FoldBox>
  );
}

function HandCard({ state, card, dispatch, fold }: { state: Z3State; card: CardInst3; dispatch: Dispatch; fold: Fold }) {
  const def = CARDS3[card.id];
  const rules = cardRules3(def, state.act);
  const tier = tierOf3(state);
  const isLingrong = card.id === "lingrongXiangzhu";
  const relic = isRelic(card.id);
  const canPlay = canPlayCard3(state, card.uid);
  const free = isFreeByLianmei3(state, card.uid);
  const blocked = blockedByChezhou3(state, card.uid);
  const blocker = blockingStatusName3(state, card.id);
  const absent = lingrongAbsent(state, card.id);
  const responses = storyResponsesFor3(state, card.id);
  const events = matchedEvents3(state, card.id);
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
        <Tag tag="lianmei" tone={styles.kindOpportunity} dispatch={dispatch} dim={!lianmeiLit3(state, card)}>
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
      {absent ? (
        <Tag tag="chengbing" tone={styles.kindCrisis} dispatch={dispatch}>
          称病
        </Tag>
      ) : null}
      {relic ? (
        <Tag tag="relic" tone={styles.kindTrial} dispatch={dispatch}>
          🕯️遗物
        </Tag>
      ) : null}
    </span>
  );
  const notes = (
    <>
      {free ? <div className={styles.solves}>联袂：可不占出牌名额打出</div> : null}
      {blocked ? <div className={styles.endHint}>被陵容掣肘，不能打出</div> : null}
      {blocker ? <div className={styles.endHint}>{blocker}，不能打出</div> : null}
      {absent ? <div className={styles.endHint}>陵容称病没来，打不出</div> : null}
    </>
  );
  const className = [styles.handCard, isPending && styles.handCardPending, fold.compact && !canPlay && !isPending && styles.handCardDisabled].filter(Boolean).join(" ");
  const answers = [
    ...responses.map((r) => `${STORIES3[r.story.id].name}·${r.option.name}`),
    ...collapsePairs(events).map((g) =>
      g.key.startsWith("pair:") ? g.name : EVENTS3[g.items[0]!.id].name + (EVENTS3[g.items[0]!.id].double && !def.matches.includes(g.items[0]!.id) ? "（双牌）" : ""),
    ),
    ...(confrontAccepts(state, card.id) ? ["景仁宫对质"] : []),
    ...(feilaoAccepts(state, card.id) ? [FEILAO.name] : []),
    ...(chunyuanAccepts(state, card.id) ? [`${CHUNYUAN.name}·${chunyuanAccepts(state, card.id) === 1 ? "起疑" : "查实"}`] : []),
    ...(state.changxiangsi && !state.changxiangsi.done && (card.id === "guojunwangXiangzhu" || card.id === "chanyuXiushen") ? [CHANGXIANGSI.name] : []),
    ...(yihuaAccepts(state, card.id) ? [`${YIHUA.name}·${YIHUA.steps[state.yihua!.step - 1]?.name ?? ''}`] : []),
  ];
  if (fold.compact && !fold.expanded && !isPending) {
    return (
      <FoldBox fold={fold} className={className} onDouble={play}>
        <div className={styles.compactTitle}>
          {def.emoji} {def.name}
          {tags}
        </div>
        <div className={styles.compactSummary}>{rules.rulesCompact ?? rules.rulesText.map(compactEffect3).join(" ")}</div>
        {notes}
      </FoldBox>
    );
  }
  const shownMatches = matchesInAct(def.matches, state.act, state.turn);
  return (
    <FoldBox fold={fold} className={className} onDouble={play}>
      <div className={styles.cardHead}>
        <span className={styles.cardName}>
          <span className={styles.cardEmoji}>{def.emoji}</span>
          {def.name}
        </span>
        {tags}
      </div>
      <CardArt src={cardArtUrl(card.id, state.act === 1 ? undefined : "temple")} emoji={def.emoji} />
      <p className={styles.flavor}>{def.flavor}</p>
      {[...rules.rulesText, ...(relic && state.yihua ? [RELIC_DOUBT_RULE] : [])].map((line) => (
        <p key={line} className={styles.rule}>
          {expandedEffect3(line)}
        </p>
      ))}
      {shownMatches.length > 0 ? (
        <p className={styles.rule}>
          <span className={styles.ruleLabel}>匹配事件：</span>
          {collapsePairs(shownMatches.map((id) => ({ id }))).map((g) => (
            <span key={g.key} className={[styles.matchChip, g.items.some((m) => events.some((e) => e.id === m.id)) && styles.matchChipInHand].filter(Boolean).join(" ")}>
              {g.emoji} {g.name}
            </span>
          ))}
        </p>
      ) : null}
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
            {relic ? "🔥 焚毁" : free ? "打出（联袂）" : "打出"}
          </button>
        )}
      </div>
    </FoldBox>
  );
}

function Statuses({ state, dispatch }: { state: Z3State; dispatch: Dispatch }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const removable = new Set(state.pending?.kind === "wentaiyi" ? removableNegatives3(state).map((s) => s.uid) : []);
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
      <ScrollRow className={styles.statuses}>
        {state.statuses.length === 0 && !state.yihua ? <span className={styles.muted}>无</span> : null}
        {groupStatuses(state.statuses).map(({ st, count }) => {
          const def = STATUSES3[st.id];
          const notYet = !def.permanent && st.appliesFromTurn > state.turn;
          const expanded = open.has(st.uid);
          return (
            <div
              key={st.uid}
              className={[styles.status, def.tag === "negative" ? styles.statusNegative : styles.statusPositive, expanded && styles.statusExpanded].filter(Boolean).join(" ")}
              role="button"
              tabIndex={0}
              onClick={() => toggle(st.uid)}
              onKeyDown={(e) => activateOnKey(e, () => toggle(st.uid))}
            >
              <div className={styles.statusLine}>
                <span>
                  {def.emoji}
                  <span className={styles.statusFull}> {def.name}</span>
{count > 1 ? <span>×{count}</span> : null}
                </span>
                <span className={styles.statusBrief}>
                  {def.permanent ? "" : `⏳${st.remaining}`}
                </span>
                <button
                  type="button"
                  className={`${styles.tag} ${styles.tagButton} ${styles.statusFull}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: "explainTag", tag: def.tag });
                  }}
                >
                  {def.tag === "negative" ? "负面" : "正面"}
                  {def.unremovable ? "·不可移除" : ""}
                </button>
                <span className={`${styles.muted} ${styles.statusFull}`}>
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
                  <p className={styles.flavor}>{statusText3(def, state.turn).flavor}</p>
                  <p className={styles.rule}>
                    <span className={styles.ruleLabel}>机制：</span>
                    {statusText3(def, state.turn).effectText}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
        {state.yihua ? (
          <div
            className={[styles.status, styles.statusNegative].join(" ")}
            role="button"
            tabIndex={0}
            onClick={() => dispatch({ type: "explainTag", tag: "doubt" })}
            onKeyDown={(e) => activateOnKey(e, () => dispatch({ type: "explainTag", tag: "doubt" }))}
          >
            <div className={styles.statusLine}>
              <span>
                📜<span className={styles.statusFull}> 疑点</span>
              </span>
              <span className={styles.statusBrief}>
                {state.yihua.doubt}/{DOUBT.max}
              </span>
              <span className={`${styles.muted} ${styles.statusFull}`}>到 {DOUBT.max} 即失败</span>
            </div>
          </div>
        ) : null}
      </ScrollRow>
    </div>
  );
}

function endTurnHints(state: Z3State): string[] {
  const hints: string[] = [];
  if (state.pending?.kind === "wentaiyi") hints.push("请先选择要移除的负面状态，或取消温太医相助。");
  const left = playsLeft3(state);
  if (left > 0 && state.hand.length > 0) hints.push(`还可出 ${left} 张牌。`);
  const c = state.confront;
  if (c && c.played.length < c.needed) hints.push(`【景仁宫对质】还差 ${c.needed - c.played.length} 张辩白牌。`);
  if (state.chunyuan && !chunyuanChecked(state)) {
    hints.push(state.chunyuan.first ? `【${CHUNYUAN.name}】只起了疑：回合末圣宠 -${CHUNYUAN.halfPenalty}。` : `【${CHUNYUAN.name}】还没识破：回合末圣宠 -${CHUNYUAN.failPenalty}。`);
  }
  if (state.feilao && feilaoCurrentTier(state) > 0) hints.push(`【${FEILAO.name}】现为 ${FEILAO.tiers[feilaoCurrentTier(state)]!.name}。`);
  if (state.yihua && state.yihua.step < 3) hints.push(`偶遇还没完成：回合末📜疑点 +1（现为 ${state.yihua.doubt}）。`);
  for (const inst of openStories3(state)) {
    const def = STORIES3[inst.id];
    const option = def.options.find((o) => o.id === def.defaultOptionId)!;
    hints.push(option.hidden ? `【${def.name}】未处理：${option.text}。` : `【${def.name}】未选择，将按默认【${option.name}】处理。`);
  }
  if (state.crisis && !state.crisis.resolved) hints.push(`【${EVENTS3[state.crisis.id].name}】未化解：${unresolvedText3(EVENTS3[state.crisis.id], state.turn)}。`);
  if (state.huanghou && !state.huanghou.resolved) hints.push(`【${EVENTS3[state.huanghou.id].name}】回合末按默认结算。`);
  const tier = tierOf3(state);
  const lingrongInHand = state.hand.filter((c) => c.id === "lingrongXiangzhu").length;
  if (tier && lingrongInHand > 0 && state.turn < STAGE3.confrontTurn) {
    hints.push("手里的陵容没打出：冷落，她会和你生分些。");
    if (tier === "distant") hints.push(`依依：${lingrongInHand} 张陵容会留在手里，下回合少抓 ${lingrongInHand} 张。`);
  }
  return hints;
}

function Notice({ title, children, onClose, button = "知道了" }: { title: string; children: ReactNode; onClose: () => void; button?: string }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zh3-notice-title">
      <div className={styles.modal}>
        <h2 id="zh3-notice-title">{title}</h2>
        {children}
        <div className={styles.modalActions}>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onClose} autoFocus>
            {button}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 对质开始：列出所有把柄，陵容瞒下的单独标出。 */
function ConfrontEvidence({ state }: { state: Z3State }) {
  const lines = confrontLines(state);
  if (lines.length === 0) return <p className={styles.muted}>{POPUP_TEXT.confrontNone}</p>;
  const shown = lines.filter((l) => !l.withheld);
  const withheld = lines.filter((l) => l.withheld);
  const exposed = shown.some((l) => l.lingrong);
  const summary = POPUP_TEXT.confrontSummary;
  const entry = (l: (typeof lines)[number], i: number) => (
    <p key={`${l.line}-${i}`}>
      {l.line}
      {(l.lingrong && l.line !== FABRICATED_SECRET) || !l.hint ? null : (
        <>
          <br />
          <span className={styles.muted}>（{l.hint}）</span>
        </>
      )}
      {l.duanfei ? (
        <>
          <br />
          <span className={styles.muted}>端妃在一旁淡淡说道：「{l.duanfei}」皇后便略过了这一桩。</span>
        </>
      ) : null}
    </p>
  );
  return (
    <>
      {shown.length > 0 ? <p className={styles.muted}>{POPUP_TEXT.confrontIntro}</p> : null}
      {shown.map(entry)}
      {hasStatus3(state, "duanfeiXianghu") && !shown.some((l) => l.duanfei) ? <p className={styles.muted}>{POPUP_TEXT.confrontDuanfei}</p> : null}
      {exposed ? <p>{summary.exposed}</p> : null}
      {withheld.length > 0 ? <p>{exposed ? summary.withheld : summary.withheldOnly}</p> : null}
      {withheld.map((l, i) => (
        <p key={`${l.line}-${i}`} className={styles.muted}>
          · {l.hint}
        </p>
      ))}
    </>
  );
}

/** 对质之后：不再列证据，只写甄嬛明白过来的那一刻。 */
function ConfrontRealize({ state }: { state: Z3State }) {
  const lines = confrontLines(state);
  const exposed = lines.some((l) => l.lingrong && !l.withheld);
  const withheld = lines.some((l) => l.withheld);
  const fabricated = lines.some((l) => l.line === FABRICATED_SECRET);
  const text = POPUP_TEXT.confrontRealize;
  return (
    <>
      {exposed ? <p>{text.exposed}</p> : withheld ? <p>{text.withheldOnly}</p> : null}
      {exposed && withheld ? <p>{text.withheld}</p> : null}
      {fabricated ? <p>{text.fabricated}</p> : null}
    </>
  );
}

function PopupBody({ state, id }: { state: Z3State; id: PopupId }) {
  switch (id) {
    case "opening": {
      const tail = POPUP_TEXT.openingTail[`${state.rank === "pin" ? "pin" : "guiren"}${state.pregnant ? "Pregnant" : "Plain"}` as keyof typeof POPUP_TEXT.openingTail];
      const returned = state.carry?.returned ? POPUP_TEXT.returned[state.carry.returned] : null;
      return (
        <>
          <p>{POPUP_TEXT.opening}</p>
          <p>{tail}</p>
          <p>{POPUP_TEXT.meizhuang}</p>
          {returned ? <p>{returned}</p> : null}
          {POPUP_TEXT.people.map((p) => (
            <p key={p.name}>{p.text}</p>
          ))}
          {POPUP_TEXT.openingRules.map((l) => (
            <p key={l} className={styles.muted}>
              {l}
            </p>
          ))}
        </>
      );
    }
    case "huanghou":
      return (
        <>
          <p>{POPUP_TEXT.huanghou}</p>
          <p>{POPUP_TEXT.huanghouIntro}</p>
          <ul>
            {POPUP_TEXT.huanghouPeople.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>：{p.text}
              </li>
            ))}
          </ul>
          {POPUP_TEXT.huanghouRules.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </>
      );
    case "ouyu": {
      const lines = YIHUA.ouyuPopup[state.yihua?.ouyuCard ?? "chanyuXiushen"] ?? YIHUA.ouyuPopup.chanyuXiushen!;
      return (
        <>
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </>
      );
    }
    case "dengmen": {
      const d = state.yihua?.dengmen;
      return (
        <>
          <p>{d ? dengmenOpenText(d.doubt, d.relics, state.exitTier) : null}</p>
          <p className={styles.muted}>
            {d && d.needed === 0 ? "皇上没有起疑，只需过完剧情。" : `${POPUP_TEXT.dengmenRules}本次需要 ${d?.needed ?? 0} 张。`}
          </p>
        </>
      );
    }
    case "tonghuatai": {
      const meet = state.guoMeet ?? "di";
      return (
        <>
          <p>{POPUP_TEXT.tonghuatai.open[meet]}</p>
          <p>{POPUP_TEXT.tonghuatai.bio}</p>
          <p>{POPUP_TEXT.tonghuatai.close[meet]}</p>
          <p className={styles.muted}>{POPUP_TEXT.tonghuataiRules}</p>
        </>
      );
    }
    case "chunyuan": {
      const r = state.chunyuanResult ?? "fail";
      return (
        <>
          <p>{CHUNYUAN.popup[r]}</p>
          <p className={styles.muted}>{CHUNYUAN.popupRules[r]}</p>
        </>
      );
    }
    case "wanwan": {
      const birth = POPUP_TEXT.wanwanBirth[(state.wanwanOption ?? "shihun") as keyof typeof POPUP_TEXT.wanwanBirth] ?? POPUP_TEXT.wanwanBirth.shihun;
      return (
        <>
          {POPUP_TEXT.wanwan.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <p>{birth}</p>
        </>
      );
    }
    case "confront":
      return (
        <>
          {POPUP_TEXT.confrontScene.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <ConfrontEvidence state={state} />
          <p className={styles.muted}>
            本回合须打出 {state.confront?.needed ?? 0} 张辩白牌{state.rank === "guiren" ? "（贵人多 1 张）" : ""}。陵容称病没来，她的牌本回合打不出。
          </p>
        </>
      );
    case "exit": {
      const exit = state.exitTier ? EXIT[state.exitTier] : null;
      return (
        <>
          <ConfrontRealize state={state} />
          {exit ? (
            <p>
              <strong>
                {exit.emoji} {exit.name}
              </strong>
              ：{exit.story}
              {exit.longyue}
              {exit.effects.length ? `（${exit.effects.map((d) => `${RESOURCE3_LABEL[d.resource]} ${d.amount}`).join("、")}）` : ""}
            </p>
          ) : null}
          {state.exitTierLingrong ? <p>{LINGRONG_FAREWELL[state.exitTierLingrong]}</p> : null}
          <p>{POPUP_TEXT.exitHeart}</p>
          <p>{POPUP_TEXT.exitGate}</p>
          <p className={styles.muted}>{POPUP_TEXT.exitRules}</p>
        </>
      );
    }
    case "feilao":
      return (
        <>
          <p>{POPUP_TEXT.feilao}</p>
          <p className={styles.muted}>{POPUP_TEXT.feilaoRules}</p>
        </>
      );
    case "zhoufu":
      return (
        <>
          <p>{POPUP_TEXT.zhoufu}</p>
          {hasStatus3(state, "qinseHeming") ? <p>{POPUP_TEXT.zhoufuQinse}</p> : null}
          <p className={styles.muted}>{POPUP_TEXT.zhoufuRules}</p>
          {hasStatus3(state, "qinseHeming") ? <p className={styles.muted}>{POPUP_TEXT.zhoufuQinseRules}</p> : null}
        </>
      );
    case "qinse":
      return (
        <>
          {POPUP_TEXT.qinse.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </>
      );
    case "ximai":
      return (
        <>
          {state.exitTier && state.exitTier <= 3 ? <p>{POPUP_TEXT.ximaiRecall[state.exitTier as 1 | 2 | 3]}</p> : null}
          <p>{POPUP_TEXT.ximaiBridge}</p>
          {POPUP_TEXT.ximai.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <p className={styles.muted}>{POPUP_TEXT.ximaiRules}</p>
        </>
      );
  }
}

const POPUP_TITLE: Record<PopupId, string> = {
  opening: "🏮 第一幕 · 凤仪之下",
  huanghou: "🏵️ 皇后笑意",
  tonghuatai: "🎐 桐花台",
  chunyuan: "👗 纯元故衣",
  wanwan: "💔 菀菀类卿",
  confront: "⚖️ 景仁宫对质",
  exit: "⚖️ 景仁宫对质 · 自请出宫",
  feilao: "🤒 迁居凌云峰",
  zhoufu: "🌊 舟覆噩耗",
  qinse: "🎼 琴瑟和鸣",
  ximai: "💗 喜脉惊心",
  ouyu: "🌸 圣驾偶遇",
  dengmen: "🚪 皇上登门",
};

function OutcomeModal({ state, onRestart, onMenu }: { state: Z3State; onRestart: () => void; onMenu: () => void }) {
  if (state.outcome === "playing") return null;
  const won = state.outcome === "won";
  const tier = state.exitTierLingrong;
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="zh3-outcome-title">
      <div className={styles.modal}>
        <h2 id="zh3-outcome-title">{won ? (state.victory === "perfect" ? `🌟 完胜：${HOMECOMING.name}` : state.victory === "narrow" ? `${HOMECOMING.emoji} 险胜：${HOMECOMING.name}` : `${HOMECOMING.emoji} 大胜：${HOMECOMING.name}`) : "🥀 功亏一篑"}</h2>
        {won ? (
          <>
            {endingStory3(state).map((line) => (
              <p key={line}>{line}</p>
            ))}
          </>
        ) : (
          <>
            <p>{state.lossReason}。</p>
            {state.lossKind ? <p>{LOSS3_STORY[state.lossKind]}</p> : null}
            {state.lossKind === "lenggong" ? (
              <>
                <ConfrontRealize state={state} />
                {tier ? <p className={styles.muted}>{LENGGONG_LINGRONG[tier]}</p> : null}
              </>
            ) : null}
          </>
        )}
        {won
          ? null
          : endingLines3(state).map((line) => (
              <p key={line}>{line}</p>
            ))}
        <p className={styles.muted}>
          最终：第 {state.turn} 回合 · {won ? "熹妃" : rankName3(state)} · 清誉 {state.qingyu} · 身子 {state.shenzi}
          {state.yihua ? ` · 疑点 ${state.yihua.doubt}` : ""}
        </p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.btn} onClick={onMenu}>
            返回主菜单
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onRestart}>
            重新开始第三关
          </button>
        </div>
      </div>
    </div>
  );
}

export function Stage3Rules() {
  return (
    <ul>
      <li>
        🚧 <strong>试玩版</strong>：本关还在开发中，机制和数值都可能还不完善，之后也可能调整。
      </li>
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

      <div className={styles.topStrip}>
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
      <ScrollRow className={styles.events}>
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
      <ScrollRow className={styles.hand}>
        {state.hand.length === 0 ? <p className={styles.muted}>没有手牌。</p> : null}
        {state.hand.map((card) => (
          <HandCard key={card.uid} state={state} card={card} dispatch={dispatch} fold={fold(card.uid)} />
        ))}
      </ScrollRow>

      <div className={styles.endTurnRow}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!canEndTurn3(state)} onClick={() => dispatch({ type: "endTurn" })}>
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
        <Notice title="规则说明 · 第三关" onClose={() => onShowRules(false)} button="谨记在心">
          <Stage3Rules />
        </Notice>
      ) : null}
      {!showRules && popup ? (
        <Notice title={POPUP_TITLE[popup]} onClose={() => setQueue((q) => q.slice(1))}>
          <PopupBody state={state} id={popup} />
        </Notice>
      ) : null}
      {popup == null ? <OutcomeModal state={state} onRestart={onRestart} onMenu={onMenu} /> : null}
    </div>
  );
}

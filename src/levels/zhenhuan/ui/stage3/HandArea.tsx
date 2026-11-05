import { TIER_EMOJI, TIER_LABEL } from "../../data/stage2Content";
import {
  CARDS3,
  CHANGXIANGSI,
  CHUNYUAN,
  DOUBT,
  EVENTS3,
  FEILAO,
  RELIC_DOUBT_RULE,
  STAGE3,
  STATUSES3,
  STORIES3,
  YIHUA,
  cardFlavor3,
  cardRules3,
  longyueHidden3,
  matchesInAct,
  statusText3,
  unresolvedText3,
} from "../../data/stage3Content";
import {
  type CardInst3,
  type Z3State,
  blockedByChezhou3,
  blockingStatusName3,
  canPlayCard3,
  chunyuanAccepts,
  chunyuanChecked,
  confrontAccepts,
  feilaoAccepts,
  feilaoCurrentTier,
  isFreeByLianmei3,
  isRelic,
  isSpentStatus3,
  lianmeiLit3,
  lingrongAbsent,
  matchedEvents3,
  openStories3,
  playsLeft3,
  removableNegatives3,
  storyResponsesFor3,
  tierOf3,
  yihuaAccepts,
} from "../../logic/stage3Engine";
import { cardArtUrl } from "../art";
import { CardArt, type Fold, FoldBox, ScrollRow, activateOnKey, groupStatuses } from "../common";
import { compactEffect3, expandedEffect3 } from "../effectText.stage3";
import { useState } from "react";
import styles from "../zhenhuan.module.css";
import { type Dispatch, Tag, collapsePairs } from "./parts";

// ---------------------------------------------------------------- hand and statuses

export function HandCard({ state, card, dispatch, fold }: { state: Z3State; card: CardInst3; dispatch: Dispatch; fold: Fold }) {
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
      <p className={styles.flavor}>{cardFlavor3(def, state.act)}</p>
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

export function Statuses({ state, dispatch }: { state: Z3State; dispatch: Dispatch }) {
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const [showSpent, setShowSpent] = useState(false);
  const spentCount = state.statuses.filter((st) => isSpentStatus3(state, st)).length;
  const live = state.statuses.filter((st) => !isSpentStatus3(state, st));
  const shown = showSpent ? [...live, ...state.statuses.filter((st) => isSpentStatus3(state, st))] : live;
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
        {shown.length === 0 && !state.yihua ? <span className={styles.muted}>无</span> : null}
        {groupStatuses(shown).map(({ st, count }) => {
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
                  {def.permanent ? "触发 / 结束前一直保留" : notYet ? `下回合起生效，共 ${st.remaining} 回合` : isSpentStatus3(state, st) ? "本回合已生效，回合末结束" : `剩余 ${st.remaining} 回合`}
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
                  <p className={styles.flavor}>{statusText3(def, state.turn, longyueHidden3(state.exitTier, state.turn)).flavor}</p>
                  <p className={styles.rule}>
                    <span className={styles.ruleLabel}>机制：</span>
                    {statusText3(def, state.turn, longyueHidden3(state.exitTier, state.turn)).effectText}
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
        {spentCount > 0 ? (
          <button type="button" className={`${styles.btn} ${styles.btnSmall}`} onClick={() => setShowSpent((v) => !v)}>
            {showSpent ? "收起已生效" : `已生效 ${spentCount} ▸`}
          </button>
        ) : null}
      </ScrollRow>
    </div>
  );
}

export function endTurnHints(state: Z3State): string[] {
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

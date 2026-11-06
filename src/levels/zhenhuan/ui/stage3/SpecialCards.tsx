import {
  CHANGXIANGSI,
  CHUNYUAN,
  CONFRONT,
  type CardId3,
  DOUBT,
  EXIT,
  FEILAO,
  RESOURCE3_LABEL,
  STAGE3,
  YIHUA,
  confrontOutcome,
  dengmenCloseText,
} from "../../data/stage3Content";
import {
  type Z3State,
  chunyuanAccepts,
  chunyuanChecked,
  feilaoCurrentTier,
  isRelic,
  qinseReady,
  yihuaAccepts,
} from "../../logic/stage3Engine";
import { specialArtUrl } from "../art";
import { CardArt, type Fold, FoldBox, ResolvedBanner } from "../common";
import { compactEffect3, expandedEffect3 } from "../effectText.stage3";
import styles from "../zhenhuan.module.css";
import type { ReactNode } from "react";
import { Chips, type Dispatch, Tag } from "./parts";

// ---------------------------------------------------------------- special story cards

/** A story-area card with a progress line (纯元故衣 / 对质 / 肺痨之诬 / 月下琴笛 / 移花接木). */
/** 合婚庚帖：踏雪问疾与月下琴笛都已完成时，才写下这一笔的后续效果。 */
export function qinseNote(state: Z3State, option: { readonly flag?: string }): string {
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

export function ChunyuanCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
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
      {c.first ? <ResolvedBanner icon="🛡️" label="已打出解牌" detail="" story={CHUNYUAN.firstStory[c.first]} /> : null}
      <p className={styles.check}>
        {mark(c.second != null)} ② 查实（须先起疑）：<Chips ids={CHUNYUAN.checkCards} lit={inHand} />
      </p>
      {c.second ? <ResolvedBanner icon="🛡️" label="已打出解牌" detail="" story={CHUNYUAN.checkStory[c.second]} /> : null}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>照现在：</span>
        {done ? "识破，免祸。" : c.first ? `只起疑，回合末圣宠 -${CHUNYUAN.halfPenalty}。` : `没识破，回合末圣宠 -${CHUNYUAN.failPenalty}。`}
      </p>
    </SpecialCard>
  );
}

export function ConfrontCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
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
        <span className={styles.ruleLabel}>被人抓住的把柄有 {c.presented} 项：</span>本回合须打出 <strong>{c.needed}</strong> 张辩白牌
        {state.rank === "guiren" ? "（贵人位分低，多 1 张）" : ""}。少打一张，结果就差一档。陵容称病没来，她的牌打不出。
      </p>
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>照现在的辩白：</span>
        {exit.emoji} {exit.name}
        {exit.effects.length ? `（${exit.effects.map((d) => `${RESOURCE3_LABEL[d.resource]} ${d.amount}`).join("、")}）` : ""}
        {exit.name === EXIT[4].name ? "：关卡失败" : ""}
      </p>
      {c.stories.map((line) => (
        <ResolvedBanner key={line} icon="🛡️" label="已打出解牌" detail="" story={line} />
      ))}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>辩白牌：</span>
        <Chips ids={CONFRONT.cards} lit={inHand} />
      </p>
    </SpecialCard>
  );
}

export function FeilaoCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
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
        <ResolvedBanner key={id} icon="🛡️" label="已打出解牌" detail="" story={FEILAO.cardStory[id]} />
      ))}
      <p className={styles.rule}>
        <span className={styles.ruleLabel}>每张减轻一档：</span>
        <Chips ids={FEILAO.cards} lit={inHand} />
      </p>
      <p className={styles.muted}>回合末结算，之后迁居凌云峰。</p>
    </SpecialCard>
  );
}

export function ChangxiangsiCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
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
      summary={c.done ? "🎶 琴笛合奏 🪷+2" : `${guo ? "✓" : "✗"}🎐 ${chan ? "✓" : "✗"}📿 → 🪷+2`}
      fold={fold}
      dispatch={dispatch}
    >
      {c.done ? <ResolvedBanner icon="🎶" label="琴笛合奏" detail="清誉 +2。" story={CHANGXIANGSI.story} /> : null}
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
      const closing = dengmenCloseText(d.needed === 0 ? "none" : state.victory === "narrow" || state.exitTier === 3 ? "narrow" : "done", state.exitTier);
      return d.played.map((id) => YIHUA.dengmenStory[id] ?? "").join("") + closing;
    }
  }
}

export function YihuaCard({ state, fold, dispatch }: { state: Z3State; fold: Fold; dispatch: Dispatch }) {
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
        if (state_ === "done") {
          return <ResolvedBanner key={s.name} icon="✅" label={`${["①", "②", "③", "④"][i]} ${s.emoji} ${s.name}`} detail="" story={yihuaDoneText(state, n)} />;
        }
        return (
          <div key={s.name} className={`${styles.option} ${styles.optionChosen}`}>
            <span>
              {mark(false)} <strong>
                {["①", "②", "③", "④"][i]} {s.emoji} {s.name}
              </strong>
              ：{s.todo}
              {state_ === "now" && n === 1 && y.yinjiaNeed > 1 ? ` （因此前已落发，皇上未必肯为出家人动身：要打 ${y.yinjiaNeed} 张，至少 1 张槿汐，另一张可以是眉庄；已打 ${y.yinjia.length} 张）` : ""}
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

export function NoticeCard({ emoji, name, text, fold }: { emoji: string; name: string; text: string; fold: Fold }) {
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

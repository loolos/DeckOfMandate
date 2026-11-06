import { TIER_EMOJI, TIER_LABEL } from "../../data/stage2Content";
import {
  CHUNYUAN,
  EXIT,
  FABRICATED_SECRET,
  HOMECOMING,
  LENGGONG_LINGRONG,
  LINGRONG_FAREWELL,
  LOSS3_STORY,
  POPUP_TEXT,
  type PopupId,
  RANKS,
  RESOURCE3_LABEL,
  YIHUA,
  dengmenOpenText,
} from "../../data/stage3Content";
import { type Z3State, confrontLines, endingLines3, endingStory3, hasStatus3, rankName3, tierOf3 } from "../../logic/stage3Engine";
import { BriefDetail } from "../common";
import styles from "../zhenhuan.module.css";
import type { ReactNode } from "react";

// ---------------------------------------------------------------- notices and popups

export function Notice({ title, children, onClose, button = "知道了" }: { title: string; children: ReactNode; onClose: () => void; button?: string }) {
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
      {l.qifei ? (
        <>
          <br />
          <span className={styles.muted}>{POPUP_TEXT.confrontQifeiTail}</span>
        </>
      ) : null}
      {l.duanfei ? (
        <>
          <br />
          <span className={styles.muted}>{POPUP_TEXT.confrontDuanfeiLead}{l.duanfei}{POPUP_TEXT.confrontDuanfeiTail}</span>
        </>
      ) : null}
    </p>
  );
  return (
    <>
      {shown.length > 0 ? <p className={styles.muted}>{POPUP_TEXT.confrontIntro}</p> : null}
      {shown.map(entry)}
      {state.lizigao && !shown.some((l) => l.qifei) ? <p className={styles.muted}>{POPUP_TEXT.confrontQifei}</p> : null}
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
      {state.lizigao ? <p>{text.lizigao}</p> : null}
    </>
  );
}

export function PopupBody({ state, id }: { state: Z3State; id: PopupId }) {
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
            {d && d.needed === 0 ? "你的安排天衣无缝，只需过完剧情。" : `${POPUP_TEXT.dengmenRules}本次需要 ${d?.needed ?? 0} 张。`}
          </p>
        </>
      );
    }
    case "tonghuatai": {
      const meet = state.guoMeet ?? "di";
      return (
        <>
          <BriefDetail brief={POPUP_TEXT.tonghuataiBrief[meet]}>
            <p>{POPUP_TEXT.tonghuatai.open[meet]}</p>
            <p>{POPUP_TEXT.tonghuatai.bio}</p>
            <p>{POPUP_TEXT.tonghuatai.close[meet]}</p>
          </BriefDetail>
          <p className={styles.muted}>{POPUP_TEXT.tonghuataiRules}</p>
        </>
      );
    }
    case "chunyuan": {
      const r = state.chunyuanResult ?? "fail";
      return (
        <>
          {(() => {
            const paras = CHUNYUAN.popup[r].map((para, i) => <p key={i}>{para}</p>);
            const brief = CHUNYUAN.popupBrief[r];
            return brief ? <BriefDetail brief={brief}>{paras}</BriefDetail> : paras;
          })()}
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
    case "lizigao":
      return (
        <>
          <BriefDetail brief={POPUP_TEXT.lizigaoBrief}>
            {POPUP_TEXT.lizigao.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </BriefDetail>
          <p className={styles.muted}>{POPUP_TEXT.lizigaoRules}</p>
        </>
      );
    case "pin": {
      const tier = tierOf3(state);
      return (
        <>
          <p>{POPUP_TEXT.pin.story}</p>
          <p>恭喜小主晋为{RANKS.pin.name}！</p>
          {tier ? (
            <p>
              🎶 {POPUP_TEXT.pin.lingrong}
              <span className={styles.muted}>
                （{POPUP_TEXT.pin.lingrongTail}
                {TIER_EMOJI[tier]}
                {TIER_LABEL[tier]}）
              </span>
            </p>
          ) : null}
          <p className={styles.muted}>
            从下一回合起每回合抓 {RANKS.pin.draw} 张、最多打 {RANKS.pin.plays} 张，清誉 / 圣宠上限提高到 {RANKS.pin.cap}。
          </p>
        </>
      );
    }
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
          <BriefDetail brief={POPUP_TEXT.ximaiBrief[(state.exitTier && state.exitTier <= 3 ? state.exitTier : 1) as 1 | 2 | 3]}>
            {state.exitTier && state.exitTier <= 3 ? <p>{POPUP_TEXT.ximaiRecall[state.exitTier as 1 | 2 | 3]}</p> : null}
            <p>{POPUP_TEXT.ximaiBridge}</p>
            {POPUP_TEXT.ximai.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </BriefDetail>
          {state.exitTier === 2 || state.exitTier === 3 ? <p>{POPUP_TEXT.ximaiTierHint[state.exitTier]}</p> : null}
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
  exit: "⚖️ 景仁宫对质",
  feilao: "🤒 迁居凌云峰",
  zhoufu: "🌊 舟覆噩耗",
  qinse: "🎼 长相厮守",
  ximai: "💗 喜脉惊心",
  ouyu: "🌸 圣驾偶遇",
  dengmen: "🚪 皇上登门",
  lizigao: "🥮 栗糕清苦",
  pin: "🏮 晋为嫔",
};

export function popupTitle(state: Z3State, id: PopupId): string {
  if (id === "exit" && state.exitTier) return `${POPUP_TITLE.exit} · ${EXIT[state.exitTier].name}`;
  return POPUP_TITLE[id];
}

export function OutcomeModal({ state, onRestart, onMenu }: { state: Z3State; onRestart: () => void; onMenu: () => void }) {
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

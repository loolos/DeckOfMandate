import { TIER_EMOJI, TIER_LABEL } from "../../data/stage2Content";
import {
  CARDS3,
  EVENTS3,
  EVENT_KIND3_LABEL,
  LINGRONG_EVENT3,
  PAIRS,
  RESOURCE3_LABEL,
  RIVALS,
  STORIES3,
  answeringCards3,
  unresolvedText3,
} from "../../data/stage3Content";
import {
  type EventInst3,
  type StoryInst3,
  type Z3State,
  pairLocked,
  solveCount,
  storyBasicOptions3,
  storyCardResponses3,
  summonUnwell3,
  tierOf3,
  xiayuCost,
  xiayuS,
} from "../../logic/stage3Engine";
import { eventArtUrl, storyArtUrl } from "../art";
import { CardArt, type Fold, FoldBox, ResolvedBanner } from "../common";
import { compactEffect3, expandedEffect3 } from "../effectText.stage3";
import styles from "../zhenhuan.module.css";
import { qinseNote } from "./SpecialCards";
import { CARD_TONE, Chips, type Dispatch, KIND_TONE, Tag, resolvedDetail } from "./parts";

// ---------------------------------------------------------------- events and stories

export function EventCard({ state, inst, fold, dispatch }: { state: Z3State; inst: EventInst3; fold: Fold; dispatch: Dispatch }) {
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
  const flavor = state.atPeak && def.peakFlavor ? def.peakFlavor : def.jingfeiFlavor && state.statuses.some((x) => x.id === "jingfeiZhiyi") ? def.jingfeiFlavor : def.flavor;
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
        <Chips ids={answeringCards3(inst.id, state.turn)} lit={(id) => handIds.has(id)} />
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

export function StoryCard({ state, inst, dispatch, fold }: { state: Z3State; inst: StoryInst3; dispatch: Dispatch; fold: Fold }) {
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
      <p className={styles.flavor}>{state.exitTier === 3 && def.feichuFlavor ? def.feichuFlavor : def.flavor}</p>
      {def.note ? <p className={styles.rule}>{def.note}</p> : null}
      {def.options.some((o) => o.xiayu) && !chosen ? (
        <p className={styles.rule}>局势 {xiayuS(state, inst.solved ?? 0)}：再打出 {xiayuS(state, inst.solved ?? 0)} 张解牌即可完美解决。</p>
      ) : null}
      {(inst.steps ?? []).map((t, i, all) =>
        chosenOption && i === all.length - 1 && t === inst.story ? null : <ResolvedBanner key={i} icon="🛡️" label="已打出解牌" detail="" story={t} />,
      )}
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

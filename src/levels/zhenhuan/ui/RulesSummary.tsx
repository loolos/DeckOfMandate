import { CHAPTER, PROMOTION_TRIAL } from "../data/content";

/** Short opening rules (design.md §12: no step-by-step tutorial in v1). */
export function RulesSummary() {
  return (
    <ul>
      <li>
        你是刚入宫的<strong>答应</strong>。守住 🪷<strong>清誉</strong> 与 👑<strong>圣宠</strong>：任一项降到 0 立即失败。
      </li>
      <li>每回合抓牌、出牌的数量由位分决定（答应：抓 3 打 1）。回合结束时手牌全部弃置。</li>
      <li>
        每回合出现 1 个<strong>机会事件</strong>和 1 个<strong>危机事件</strong>，只能打出卡面上的<strong>匹配牌</strong>来解决。
        一张牌可以同时解决两个匹配事件。未解决的危机会在回合末造成惩罚。
      </li>
      <li>第 4、8 回合有剧情事件：在事件上选 1 个基础选项，或从手牌打出事件卡上列出的牌来解决；都不做则按默认选项处理。卡牌永远从手牌打出。</li>
      <li>点击事件、手牌或状态上的标签，可以在日志里查看它的说明。</li>
      <li>
        第 {PROMOTION_TRIAL.firstTurn}—{PROMOTION_TRIAL.lastTurn} 回合是<strong>晋封考验</strong>：回合末圣宠 ≥{" "}
        {PROMOTION_TRIAL.minShengchong}、清誉 ≥ {PROMOTION_TRIAL.minQingyu}，且考验期间打出过仪容整肃或谨言慎行，即晋封为常在。
      </li>
      <li>晋封后坚持到第 {CHAPTER.totalTurns} 回合结束即通关。</li>
      <li>悬浮在抽牌堆、弃牌堆和事件牌池上可以查看其中剩余的内容。</li>
    </ul>
  );
}

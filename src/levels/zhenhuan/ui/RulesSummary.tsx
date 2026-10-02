import { CHAPTER } from "../data/content";

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
        一张牌可以同时解决多个匹配事件。未解决的危机会在回合末造成惩罚。
      </li>
      <li>
        <strong>晋封为常在</strong>，并坚持到第 {CHAPTER.totalTurns} 回合结束即通关。
      </li>
      <li>悬浮在抽牌堆、弃牌堆和事件牌池上可以查看其中剩余的内容。</li>
    </ul>
  );
}

# bugreport

本文件汇总本轮全库巡检发现的 bug 与重构建议，并标记处理状态。

## 1) 已确认 bug

### BUG-001: campaign 报表均值被空值静默污染（已修复）

- **严重度**: high
- **文件**: `src/levels/sunking/sim/aiStrategySimulation.ts`
- **问题**:
  - `averageChapter2EndTurnOnReached` / `averageChapter2EndTurnOnWin` / `averageChapter3EndTurnOnReached` / `averageChapter3EndTurnOnWin` 使用 `?? 0` 参与均值计算。
  - 当 endTurn 为 null/undefined 时被计为 0，统计结果会向下偏移且不报错。
- **修复**:
  - 新增 `averageNullable()`，只对非空数值求平均。
    执行
  - 调整上述四个均值字段计算逻辑，空样本时返回 `null`。
- **验证**:
  - `npm run build` 通过
  - `npm test` 通过

## 2) 可疑项（本轮已处理）

### BUG-002: chapter-3 防卡死逻辑只覆盖 standalone 路径（已修复）

- **严重度**: medium
- **文件**: `src/levels/sunking/sim/aiStrategySimulation.ts`
- **现象**:
  - `forceEndYear` 目前只在 label 为 `thirdMandateStandalone` 时生效。
  - `campaign:thirdMandate` 仍可能出现同类死循环并抛 `strategy got stuck`。
- **建议**:
  - 将触发条件改为基于 `state.levelId === "thirdMandate"`，或显式覆盖 campaign 标签。
- **修复**:
  - 已将 `forceEndYear` 触发条件改为 `state.levelId === "thirdMandate"`，覆盖 standalone 与 campaign 两条路径。
    执行

### BUG-003: 对手选牌子集枚举存在指数开销风险（已缓解）

- **严重度**: medium
- **文件**: `src/levels/sunking/logic/opponentHabsburg.ts`
- **现象**:
  - `enumerateNonEmptySubsets` 使用 `2^n` 枚举手牌子集，后续扩手牌规模时性能风险上升。
- **建议**:
  - 增加 hand size 阈值与降级策略（贪心/剪枝/DP）。
- **修复**:
  - 新增枚举阈值 `OPPONENT_SUBSET_ENUMERATION_LIMIT = 16`。
  - 当手牌超过阈值时，降级为单卡候选策略，避免 `2^n` 子集爆炸。
    执行

## 3) 值得重构（refactor）候选

### REF-001: `gameReducer` 复杂度过高，仍有 campaign 语义泄漏（本轮已完成一阶段）
- **文件**: `src/app/gameReducer.ts`
- **建议方向**:
  - action handler map 化
  - 通用 guard 提取
  - campaign 接口命名中性化
- **工作量**: L
- **本轮完成**:
  - 在 `src/app/gameReducer.ts` 提取 `isPlayingActionPhase` / `isPlayingActionPhaseWithoutPendingInteraction`，替换多处分散的重复条件判断，降低分支噪音。
  - 将 `applySunkingPlayCardExtras` 在 bundle 层中性化为 `applyCampaignPlayCardExtras` 并在 reducer 使用，减少 campaign 语义泄漏。
  - 将 `PLAY_CARD` / `SOLVE_EVENT` / `SCRIPTED_EVENT_ATTACK` / `CRACKDOWN_TARGET` / `END_YEAR` / `CONFIRM_RETENTION` 抽为独立 handler 函数，主 `switch` 保留分发职责，显著降低单 case 体积与认知负担。
  - 行为保持不变，`npm run build` 与 `npm test` 全量通过。

### REF-002: campaign bridge 仍用硬编码 level 集合
- **文件**: `src/levels/sunking/logic/campaignReducerBridgeImpl.ts`
- **建议方向**:
  - 改为注册式 predicate + action handler
- **工作量**: M

### REF-003: fund solve 分支重复、模板特例分散
- **文件**: `src/levels/sunking/logic/fundSolve.ts`
- **建议方向**:
  - 统一扣费流水线 + template hook
- **工作量**: M

### REF-004: 测试分层可继续下沉到 campaign
- **文件**: `src/app/gameReducer.test.ts`, `src/app/levelTransitions.test.ts`
- **建议方向**:
  - 内容重断言迁移到 `src/levels/sunking/logic/*.test.ts`
  - app 层保留 smoke
- **工作量**: M-L
- **本轮完成（阶段 1）**:
  - 新增 `src/levels/sunking/logic/gameReducer.sunking.test.ts`，迁入一批 Sun King 内容重断言（第三章王位线、对手即时摸牌、`localizedSuccessionWar` / `localWar` 选择分支等）。
  - 从 `src/app/gameReducer.test.ts` 删除对应内容重测试，收敛 app 层职责到更通用的 reducer smoke / wiring 验证。
  - 回归验证通过：`npm run build`、`npm test` 全量通过。
- **本轮完成（阶段 2）**:
  - 继续将 chapter 2 / sunking 内容重断言下沉到 `src/levels/sunking/logic/gameReducer.sunking.test.ts`，包含 `leagueOfAugsburg`、`SCRIPTED_EVENT_ATTACK`、`ryswickPeace`、`revocationNantes`、`huguenotContainment` 等行为。
  - 从 `src/app/gameReducer.test.ts` 删除已下沉的对应断言，进一步收敛 app 层到通用 smoke 用例。
  - 回归验证通过：`npm run build`、`npm test` 全量通过。

## 4) Decouple 本轮已完成

### DEC-001: `cardArt` 从通用逻辑层下沉为 campaign façade（已完成）

- **改动文件**:
  - 新增 `src/levels/sunking/logic/cardArt.ts`
  - 新增 `src/levels/campaignCardArt.ts`
  - 修改 `src/logic/cardArt.ts`（改为薄 façade，转调 campaign 层）
- **收益**:
  - `src/logic` 不再直接 import Sun King 资源文件，符合 `decouple.md` 方向。


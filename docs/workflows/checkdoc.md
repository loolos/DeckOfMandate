# Workflow: checkdoc

> 用途：核对 **代码实现** 与 **文档** 是否一致；核对 **三种语言**（中 / 英 / 法）的剧情/UI 文案是否含义对齐；并 **通读各语言** 的剧情与叙事向文案，查 **语句是否通顺**（语病、歧义、截断、时代感与语气明显违和等）。
> 冲突仲裁：
> 1. **机制 vs 文档**：以 **代码实现** 为准，更新文档。
> 2. **语言间含义不一致**：以 **中文版本** 为准，调整 `en` / `fr`。
> 3. 中文文案本身有歧义或与代码冲突时，先解决"代码 vs 中文"，再让其它语言对齐到修正后的中文。

---

## 0. 适用范围

- 机制文档：
  - `docs/gameplay.md`（核心机制 / 回合管线）
  - `docs/card.md`（卡牌系统）
  - `docs/design.md`（设计目标）
  - `docs/太阳王战役.md`（按关卡顺序的机制 / 事件 / 卡牌 / 状态总表）
- 代码事实源（authoritative source）：
  - `src/app/*`：`gameReducer.ts`、`initialState.ts`、`level2Transition.ts`
  - `src/logic/*`：`turnFlow.ts`、`actionLog.ts`、`aiStrategySimulation.ts`、`cardUsage.ts`、`icons.ts`、`normalizeGameState.ts`
  - `src/data/*`：`cards.ts`、`events.ts`、`levelContent.ts`
  - 太阳王战役平衡断言：`src/levels/sunking/secondMandateBalance.test.ts`
  - `src/levels/types/*`：卡牌 / 事件 / 效果 / 标签 / 状态模板类型（与战役数据同源）
  - `src/types/game.ts`：运行时状态与日志条目类型
- 三语文案：
  - 核心：`src/locales/{zh,en,fr}.core.ts`
  - 关卡剧情：`src/locales/levels/<level>/{zh,en,fr}.ts`
  - 入口：`src/locales/index.tsx`、`src/locales/{zh,en,fr}.ts`

---

## 1. 触发方式

在对话里直接说：

> "跑一遍 checkdoc"
> 或："checkdoc：第二关剧情 + 通胀机制"

可选范围参数：
- `--scope=mechanics`：只核对机制 vs 文档
- `--scope=i18n`：只核对三语含义对齐
- `--scope=prose`：只跑第 4 节「全语言剧情文本通顺性」
- `--scope=all`（默认）：机制 + 三语含义对齐 + 剧情文本人读通顺
- `--target=<chapter|file|key 前缀>`：限定到某一关 / 某文件 / 某 i18n key 前缀（例如 `--target=secondMandate` 或 `--target=status.europeAlert`）

---

## 2. 步骤 A：机制 ↔ 文档 一致性

对每个文档段落，执行以下步骤：

1. **抽取断言**
   - 从文档里挑出可验证的"硬断言"（数值、公式、阈值、条件分支、触发顺序、卡牌 cost / tags / 效果、事件 weight、状态时长、胜负条件）。
   - 忽略叙事性 / 风味文字。

2. **定位代码事实**
   - 用 `Grep` / `SemanticSearch` 在 `src/data`、`src/logic`、`src/app` 中找到对应实现。
   - 注意：
     - 卡牌定义 → `src/data/cards.ts`
     - 事件 / 历史脚本 / 关卡填充 → `src/data/events.ts`、`src/data/levelContent.ts`
     - 回合管线 / 抽牌 / 留任 → `src/logic/turnFlow.ts`
     - 关卡过渡 → `src/app/level2Transition.ts`
     - 派发与状态结算 → `src/app/gameReducer.ts`

3. **判定**
   - ✅ 一致：跳过。
   - ⚠️ 表述模糊但不矛盾：建议精确化文档，但不强制。
   - ❌ 与代码不一致：**以代码为准**，记录"文档需要怎么改"。

4. **特别核查清单**（高风险点）
   - 起手资源、胜负阈值、回合数。
   - 抽牌公式（`drawAttemptsFromPower` 阈值、各种修正叠加顺序）。
   - 年初 / 年末状态结算的顺序。
   - 欧洲警觉漂移公式 `k = x - 12 - y*3`、双事件阈值。
   - 通胀触发条件（如 `财政+权力+合法性 >= 12`）与叠加规则（"弃牌回洗入牌库时按实例叠加费用"）。
   - 有限耐久卡（`royalLevy` / `royalIntervention` / `jesuitCollege` 等）剩余次数与耗尽惩罚。
   - 关卡过渡保留 / 清理的卡与状态（`level2Transition.ts`）。
   - AI 模拟 / 平衡测试里的硬编码假设（`secondMandateBalance.test.ts`）是否仍与 `events.ts` 同步。

---

## 3. 步骤 B：三语文案含义对齐（zh ↔ en ↔ fr）

权威语言：**中文**（`zh.core.ts` + `levels/*/zh.ts`）。

1. **配对 key**
   - 以 `zh` 文件为基准遍历所有 key。
   - 对每个 key 在 `en.core.ts` / `fr.core.ts`（或对应关卡 `en.ts` / `fr.ts`）中找同名 key。
   - 缺失 key：标记 `MISSING(en|fr)`，需补齐。
   - 多余 key（en/fr 有但 zh 没有）：标记 `ORPHAN(en|fr)`，确认是否过期，原则上删除或在 zh 补上。

2. **语义比对**
   - 对每个三语对齐的 key，比较：
     - 核心信息（数值、机制名、触发条件、因果链）是否一致。
     - 语气 / 历史时代感是否仍然贴合（次要，但显著漂移要标注）。
     - 专有名词翻译是否与项目其他位置一致（例：`欧洲警觉 / Europe Alert / Alerte européenne`）。
   - 允许的差异：
     - 句式、修辞、文化贴近度的本地化改写。
     - 数字格式（`50%` vs `50 %` 法语空格）。
   - 不允许的差异：
     - 数值不同（中：50%，英：40% → ❌）。
     - 机制描述方向相反（中：增加，英：减少 → ❌）。
     - 关键名词错配（中："胡格诺"，英："Catholics" → ❌）。

3. **裁定**
   - 任何"不允许的差异" → 以中文版为准，重写 en / fr。
   - 翻译质量问题（无歧义但生硬）→ 给出建议改写，不强制。

4. **常见踩坑**
   - 关卡剧情结尾分支文本（`ending.victory*` / `ending.defeat*`）三语必须同步。
   - 状态阶段（`status.europeAlert.stage.*.name/.desc`）：阶段区间（如"3-4"）和描述要数对得上。
   - 事件 / 卡牌的 `name` 与 `description` 要一对一翻译，不能英文版多写一句解释、中文版没有。
   - 标点：法语的 `« »`、不间断空格（` `）只是排版，不算语义差异。

---

## 4. 步骤 C：全语言剧情文本通顺性（人读通顺，不单测「对齐」）

在 **步骤 B** 的 key 集合与语料范围内，对 **以叙事 / 剧情为主** 的字符串逐条通读（**zh / en / fr 各读各的**），不替代步骤 B 的「含义对齐」——步骤 C 专门抓 **单语层面** 是否顺、是否易误解。

1. **覆盖范围（剧情向为主）**
   - 核心：`src/locales/{zh,en,fr}.core.ts` 中带剧情色彩的段落（事件叙事、过场、结局分支、长描述等）；UI 里纯标签式短名可快扫，**重点**是会出现完整句子的 key。
   - 关卡：`src/locales/levels/<level>/{zh,en,fr}.ts` 中 **剧情对话、过场、结局、关卡内说明性长句**（与步骤 B 同一批文件，按 `--target` 可缩小范围）。

2. **检查项（每语独立）**
   - **通顺**：是否病句、缺主谓、成分残缺、时态/性数一致（英 / 法尤其注意）。
   - **歧义**：代词、否定、比较级是否可误读；是否与技术含义矛盾（若与机制冲突，按上文仲裁：先对齐代码与中文，再改译）。
   - **完整性**：无半截句、无多余逗号/句号导致的断裂；占位符、换行、引号成对、变量插值未被译坏。
   - **风格一致**：同关卡 / 同角色语气是否忽高忽低可接受，但**明显**跳戏或机翻感 → 标出并润色该语（不改变步骤 B 已锁定的含义）。

3. **与其它步骤的关系**
   - 与 **步骤 A** 无直接冲突；若发现「文案说 A、代码是 B」→ 先走步骤 A 的文档/中文仲裁，再回到步骤 C 润色表述。
   - 与 **步骤 B** 的次序建议：**先 B 后 C**（先保证三语同义，再各语润色通顺），但若用户只跑 `--scope=prose`，可单独通读，仍须遵守「禁止在润色中偷偷改义」；若与 zh 义冲突，以 zh + 步骤 B 为准，再重跑该条 en/fr。

4. **产出**
   - 在「checkdoc 结果」汇报中，若跑了步骤 C，增加小节 **C. 剧情通顺**（列出已改文件 + key 或「某关卡全量润色」摘要）；仅润色、无数值/机制变更时，自检仍以 `npm run build` 为主。

---

## 5. 中间分析（仅自用，不必汇报全部）

在动手改之前，对每个 ❌ 项**内部**整理：

- A 类：`docs/<file>.md §<section>` ← 代码事实 `src/...:line` → 决定改 `docs/<file>.md` 哪几行。
- B 类：`key=<i18n.key>` zh / en / fr 三语原文 → 决定改 `en` / `fr`（默认）或 `zh`（仅当 zh ↔ 代码冲突）。

整理完直接落盘改文件，不要把"差异列表 + 建议改写"作为最终回复抛给用户等确认。最终汇报使用第 6 节的"已改清单"格式。

---

## 6. 修改约定

- **本工作流是"读 → 直接改 → 报告"**：发现 ❌ 必改项时不要问用户、不要列"建议改写"等待确认，直接落盘。
- 改动方向（强制）：
  - **机制冲突** → 改 `docs/*.md`，**不要**改代码迁就文档。
  - **语义冲突（en/fr 与 zh 不一致）** → 改 `src/locales/**/{en,fr}.*`，**不要**改 `zh`。
  - **中文本身和代码冲突** → 改中文（`zh.core.ts` / `levels/*/zh.ts`）以对齐代码，再级联更新 en/fr。
  - 任何 ❌ 项归到上述其中一种，自行决定后直接改。
- ⚠️ 项（模糊但不矛盾）默认**不动**，仅在报告里列出；如果用户希望连 ⚠️ 也一起精确化，再追加一轮。
- 不允许改的范围（除非用户显式要求）：
  - `src/app/*`、`src/logic/*`、`src/data/*`、`src/types/*`（任何 `.ts` 业务代码）。
  - `zh.core.ts` / `levels/*/zh.ts`（除非命中"中文本身和代码冲突"分支）。
- 改完后必须跑：
  - `npm run build`（含 `tsc --noEmit`）确认 i18n key 类型仍然对齐。
  - 若改动涉及关卡机制描述：`npm test`（特别是 `secondMandateBalance.test.ts`、`turnFlow.test.ts`、`aiStrategySimulation.test.ts`）。
- 报告格式简化为"已改清单"：

```
## checkdoc 结果（scope=<...>, target=<...>）

### A. 机制 ↔ 文档 — 已改
- docs/<file>.md §<section>：<一句话改动摘要>（代码依据：`src/...:line`）

### B. 三语对齐 — 已改
- key=`<...>` (en|fr|zh)：<一句话改动摘要>

### C. 剧情通顺（若跑了步骤 C）— 已改
- `src/locales/...` key=`<...>` (zh|en|fr)：<一句话润色摘要>（未改义 / 与步骤 B 一致）

### ⚠️ 未动（留作后续决定）
- ...

### 自检
- npm run build：<pass|fail + 摘要>
- npm test：<pass|fail + 摘要>（若跑了）

### 摘要
- A 类已改：<n>；B 类已改：<n>；C 类已改：<n>（若未跑步骤 C 则写 0 或略去）；⚠️ 留作后续：<n>
```

---

## 7. 备注

- `npm install` 在本仓库需要 `--legacy-peer-deps`（见 `AGENTS.md`）。
- 仓库无 lint，类型检查走 `tsc --noEmit`。
- 三语 key 的真源是 `zh.core.ts` 的对象字面量；`en` / `fr` 必须是同一 key 集合的子集 + 同义翻译。

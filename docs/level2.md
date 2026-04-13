# Deck of Mandate

## Level 2 Design Document — *Glory Under Strain*

---

## 关卡定位 / Level Pillars

第二关不是继续扩张冲高，而是“在高压下维持霸权”。核心体验：

- 维持霸权（Hold hegemony）
- 消化第一章扩张遗产（Absorb expansion costs）
- 在宗教、财政、外交、战争压力中做取舍
- 承接第一章分支后果（path dependency）

---

## 时间与胜利框架（草案）

- 历史段：**1676–1700**
- 建议回合尺度：**1 回合 = 1 年**
- 建议流程：
  - 阶段 1：1676–1682（收束扩张）
  - 阶段 2：1683–1688（宗教与内政压力）
  - 阶段 3：1688–1694（同盟围堵与大战）
  - 阶段 4：1694–1700（战后修复与秩序重建）

> 注：这是机制文档，数值可在平衡阶段微调。

---

## 入口机制：第二关两种开局模式

第二关支持两种进入方式，用于“剧情连续性”和“单关体验”兼容。

### 模式 A：承接第一关存档（Continuity Start）

当玩家从第一关胜利后直接进入第二关：

- **继承年份与状态快照**（至少包括：Treasury stat、Power、Legitimacy、关键长期状态、关键剧情标记）
- **继承部分资源**（建议：保留统计值与关键状态，不继承临时 funding）
- **继承第一关关键选择标记**（尤其“是否发动遗产战争”）

设计目的：
- 让第一关决策在第二关持续生效
- 强化战役感与历史连贯性

### 模式 B：主菜单直接进入第二关（Standalone Start）

当玩家从主菜单直接选第二关：

- 以“**预定资源数（近似历史事实）**”开局
- 默认剧情标记使用“历史中位设定”（见下表）

建议预设开局（可调）：

| 项目 | 预设值（建议） | 说明 |
| --- | --- | --- |
| 开局年份 | 1676 | 与章节起点一致 |
| Treasury stat | 3 | 相比第一关起点更强，但有后续高压 |
| Power | 3 | 行政能力提升 |
| Legitimacy | 3 | 王权处于高位但并非绝对安全 |
| 遗产战争标记 | `false`（默认保守） | 作为“中位难度”默认值 |
| 关键长期状态 | 无 | 避免主菜单开局过载 |

> 可选：在“新游戏→第二关”提供“历史倾向预设”：
> - 强势扩张后遗症（更难）
> - 保守延续（标准）

---

## 过章卡池整编机制（Chapter Transition Deck Refit）

为了承接第一关到第二关的玩法变化，新增一个**卡池整编阶段**，发生在第二关正式开始前。

### 目标

- 让玩家把第一关的“成长牌组”转成第二关“高压治理牌组”
- 提供明确的策略重构窗口，而不是被动继承
- 通过“移除旧卡 + 引入新卡”的组合，体现时代重心变化

### 触发时机

#### 路径 A：第一关胜利后继续

- 在第一关结算文案（胜利叙事）之后，**立即进入“卡池整编界面”**
- 玩家完成整编确认后，进入第二关首回合

#### 路径 B：主菜单直接进入第二关

- 进入第二关后，在正式开局前，**先进入“卡池整编界面”**
- 玩家可先选卡池结构，再开始第二关

### 整编规则（机制草案）

#### 1) 数量调整（对现有卡）

玩家可对“可调整模板”进行数量增减（有上下限）：

- 示例：`funding`、`crackdown`、`reform`、`ceremony`
- 每种卡的最小/最大张数由第二关规则限定

建议约束（首版）：

- 每个可调整模板至少保留 1 张（防止功能断层）
- 每个可调整模板最多 +2 张（防止极端堆叠）
- 总牌组张数必须落在合法区间（例如 12–18）

#### 2) 强制退场（移除部分旧卡）

部分第一关卡牌在第二关默认退场，不再可选：

- 典型示例：`development`（王家工场）

设计含义：

- 第二关强调“维持与修补”而非单纯滚雪球发展
- 避免第一关经济成长卡在第二关持续主导

#### 3) 新牌引入（新增模板）

整编阶段开放第二关新牌模板，玩家可决定加入几张：

- `grainRelief`（粮食赈济）
- `taxRebalance`（税制重估）
- `diplomaticCongress`（外交会议）
- `patronageOffice`（王室荐任）
- `warBond`（战时公债）

建议规则（首版）：

- 每个新模板可加入 0–2 张
- 新牌总加入上限（例如最多 4 张）
- 若玩家未加入任何新牌，可给出“高风险提示”但允许继续

#### 4) 成本预算（可选高级规则）

可为整编提供“整编点数 Refit Points”：

- 增加强力牌消耗点数
- 移除低效牌返还少量点数
- 在总点数内完成构筑

> 首版可先不启用点数，仅用“数量上限 + 总牌组区间”控制复杂度。

### UI 流程建议

卡池整编界面最少包含：

1. **当前牌组列表**（显示每张卡当前数量）
2. **禁用/退场提示区**（明确哪些第一关卡不可继续使用）
3. **第二关新牌区**（可添加按钮与数量步进）
4. **合法性校验区**（总张数、每卡上下限、是否满足必备功能）
5. **确认按钮**（进入第二关）

建议额外提供：

- “历史推荐构筑”一键方案（偏稳健）
- “战争压力构筑”一键方案（偏控制）
- “重置为默认”按钮

### 默认方案（用于快速开始）

当玩家不想手动细调时，提供自动整编结果：

- 移除：`development` 全部
- 保留基础：`funding` / `crackdown` / `reform` / `ceremony`
- 自动加入：`grainRelief` ×1、`taxRebalance` ×1、`diplomaticCongress` ×1

这样能保证“可直接开局”与“具备第二关应对工具”。

---

## 第一关分支承接（跨章状态）

### 分支 A：第一章发动了遗产战争

- 开局收益：`Legitimacy +1`（或 `Treasury +1` 二选一）
- 隐藏状态：**Europe Alert（欧洲警觉）**
- 第二关影响：
  - “奥格斯堡同盟形成”提前或增强
  - 反法同盟相关负面权重 +1
  - 九年战争阶段压力更高

设计感：第一章赢得越猛，第二章越易被围堵。

### 分支 B：第一章没有发动遗产战争

- 开局无额外强势加成
- 第二关影响：
  - 奥格斯堡同盟形成稍晚或强度较低
  - 反法同盟类事件权重较低
  - 商业扩张类机会更容易出现

设计感：第一章更克制，第二章外部环境略宽松。

---

## 第二关主线事件（非随机池，精简版）

这些事件由年份/条件触发，不进入常规随机事件池。为降低实现复杂度，主线收敛到 5 个核心事件。

| ID | 中文名 | English Name | 触发建议 | 事件性质 |
| --- | --- | --- | --- | --- |
| `nymwegenSettlement` | 奈梅亨和约 | Treaties of Nijmegen | 开章前期 | 收束型主线 |
| `revocationNantes` | 撤销南特敕令 | Revocation of the Edict of Nantes | 中期固定 | 重大分歧 |
| `leagueOfAugsburg` | 奥格斯堡同盟形成 | League of Augsburg Forms | 中后期固定 | 外交危机 |
| `nineYearsWar` | 九年战争爆发 | The Nine Years’ War | 中后期固定 | 战争阶段切换 |
| `ryswickPeace` | 里斯维克和约 | Peace of Ryswick | 尾声阶段 | 收束主线 |

> `versaillesCourt` 与 `greatFamine` 建议转为“条件支线/增强事件”，首版不作为必经主线。

---

## 主线连续事件链（精简实现）

### 链 A：霸权的代价（短链）

1. `nymwegenSettlement`
   - 效果：`Treasury +1`, `Legitimacy +1`
2. 若 `nobleResentment` 连续 2 次未处理
   - 升级事件：`courtFactionAlliance`（宫廷派系结盟）
   - 未处理：`Power -1`, `Legitimacy -1`

### 链 B：宗教统一与人才流失

1. `revocationNantes` 二选一：
   - **强制执行**：立即 `Legitimacy +1` 或 `Power +1`，并获得长期负面 `huguenotExodus`
   - **有限宽容**：无即时增益，但不触发 `huguenotExodus`
2. `huguenotExodus`（连续型）
   - 周期触发，未处理 `Treasury -1`
   - 同时降低商业类机会收益
3. `foreignCondemnation`
   - 若已有 `huguenotExodus`，则在 `leagueOfAugsburg` 时额外提高难度

### 链 C：围堵法国（短链）

1. `leagueOfAugsburg`
   - 后续战争类负面事件权重上升
2. 开放边境危机子池
   - `frontierGarrisons` / `tradeDisruption` / `warWeariness`
3. `nineYearsWar`
   - 持续状态：每回合额外 +1 有害事件
   - 财政类负面权重提高
4. `ryswickPeace`
   - 结束战争强化状态，移除部分战争加成
   - 但不自动恢复已损失属性

> `greatFamine` 作为可选增强危机：仅在“高压模式”或后续版本启用。

---

## 第二关常规随机事件池

| ID | 中文名 | English Name | 类型 | 有害 | 权重 | 解决方式（概要） | 未处理后果 |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| `versaillesExpenditure` | 凡尔赛开支 | Versailles Expenditure | 财政 | 是 | 3 | 支付 2 funding | Treasury -1 |
| `nobleResentment` | 贵族怨气 | Noble Resentment | 政治 | 是 | 2 | 支付 1 funding 或典礼类牌 | 获得 `powerLeak` 2 回合 |
| `provincialNoncompliance` | 地方消极执行 | Provincial Noncompliance | 行政 | 是 | 2 | 支付 1 funding | 下回合抽牌尝试 -1 |
| `risingGrainPrices` | 粮价上涨 | Rising Grain Prices | 社会 | 是 | 3 | 支付 2 funding | Legitimacy -1 |
| `taxResistance` | 税收反弹 | Tax Resistance | 财政/社会 | 是 | 2 | 支付 1 funding 或危机干预 | Treasury -1 |
| `frontierGarrisons` | 边境驻军消耗 | Frontier Garrisons | 军事/财政 | 是 | 2 | 支付 1 funding | Treasury -1 |
| `tradeDisruption` | 海贸受阻 | Trade Disruption | 贸易 | 是 | 1 | 支付 1 funding | 本回合贸易类奖励失效 |
| `courtScandal` | 宫廷丑闻 | Court Scandal | 宫廷/合法性 | 是 | 1 | 支付 1 funding 或典礼类牌 | Legitimacy -1 |
| `militaryPrestige` | 军事声望 | Military Prestige | 机会 | 否 | 1 | 可支付 1 funding | 支付则 Legitimacy +1 |
| `commercialExpansion` | 商业扩张 | Commercial Expansion | 机会 | 否 | 2 | 可支付 1 funding | 支付则 Treasury +1 |
| `talentedAdministrator` | 能臣举荐 | Talented Administrator | 机会 | 否 | 1 | 可支付 1 funding | 支付则 Power +1 |
| `warWeariness` | 战争疲劳 | War Weariness | 社会/合法性 | 是 | 2 | 支付 1 funding + 危机干预 | Legitimacy -1 |

---

## 第二关推荐手牌（新增与适配）

> 目标：保留第一关核心操作手感，同时增加“高压治理”工具。

### A. 沿用基础牌（建议继续可用）

| ID | 中文名 | 英文名 | 成本 | 效果定位 |
| --- | --- | --- | ---: | --- |
| `funding` | 王室征收 | Royal Levy | 0 | +1 当回合 funding |
| `crackdown` | 王室干预 | Royal Intervention | 1 | 解决 1 个有害事件 |
| `reform` | 行政改革 | Administrative Reform | 2 | Power +1，抽 1 |
| `ceremony` | 凡尔赛典礼 | Versailles Ceremony | 2 | Legitimacy +1 |

> 注：`development` 在第二关默认退场，见“过章卡池整编机制”。

### B. 第二关新增牌（建议首版）

| ID | 中文名 | 英文名 | 成本 | 效果（机制草案） | 设计目的 |
| --- | --- | --- | ---: | --- | --- |
| `grainRelief` | 粮食赈济 | Grain Relief Program | 2 | 立即解决 1 个粮食/社会类事件；若无目标则 Legitimacy +1 | 对抗粮价与饥荒链 |
| `taxRebalance` | 税制重估 | Tax Rebalancing | 2 | 本回合财政类事件解决成本 -1（最低 0） | 应对税收反弹与财政挤压 |
| `diplomaticCongress` | 外交会议 | Diplomatic Congress | 2 | 降低战争类负面事件权重 2 回合 | 对冲同盟围堵 |
| `patronageOffice` | 王室荐任 | Patronage Office | 1 | 解决 `nobleResentment`/`provincialNoncompliance` 时额外 +1 Power（每回合一次） | 缓和内政阻力 |
| `warBond` | 战时公债 | War Bond | 0 | +2 funding，本回合结束时 Treasury -1（延期代价） | 高压回合救急 |

### C. 第二关起始牌组建议

- 继承模式：在第一关最终牌组基础上，加入 3–5 张“第二关新增牌”（按剧情发放）
- 主菜单直开模式：
  - 基础牌组（第一关标准，但移除 `development`）
  - 额外加入：`grainRelief` ×1、`taxRebalance` ×1、`diplomaticCongress` ×1

---

## 事件与手牌标签建议（便于后续实现）

为第二关建议引入标签系统，便于卡牌定向生效：

- 事件标签：`fiscal` `social` `religious` `diplomatic` `war` `court` `trade`
- 卡牌标签：`stability` `economic` `control` `diplomacy` `emergency`

最小规则：
- `grainRelief` 目标标签：`social`（可含 `fiscal`）
- `diplomaticCongress` 影响标签：`war` / `diplomatic`
- `taxRebalance` 影响标签：`fiscal`

---

## 精简可玩版（MVP for Chapter 2）

如果先做一版可玩原型，建议最小范围：

- 常规随机事件 8 个：
  - `versaillesExpenditure`, `nobleResentment`, `provincialNoncompliance`, `risingGrainPrices`, `taxResistance`, `frontierGarrisons`, `warWeariness`, `commercialExpansion`
- 机会事件 2 个：
  - `militaryPrestige`, `talentedAdministrator`
- 主线事件 5 个：
  - `nymwegenSettlement`, `revocationNantes`, `leagueOfAugsburg`, `nineYearsWar`, `ryswickPeace`
- 第一章分支事件 2 个：
  - `expansionRemembered`（打过遗产战争）
  - `cautiousCrown`（未打遗产战争）

---

## 验收标准（文档阶段）

该机制文档完成后，团队应能直接回答：

1. 第二关如何从第一关“连续进入”以及如何“主菜单直开”。
2. 第二关主线事件、随机事件、分支状态的触发关系。
3. 第二关需要新增哪些牌，以及它们分别对抗什么压力。
4. 哪一组是“最小可玩版本”，可直接进入数据配置与实现阶段。

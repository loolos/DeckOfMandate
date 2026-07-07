# 内容文案规范：历史背景 + 游戏机制（Content copy guidelines）

每一个玩家可见的内容条目（卡牌、事件、状态、标签、资源）都必须同时提供两段文案，并覆盖全部三种语言（en / zh / fr）：

1. **历史背景（history / background）**——一段以史实或时代语境为锚点的叙事文字；
2. **游戏机制（desc / hint）**——只讲规则的简短说明（几句话以内：费用、效果、惩罚、时限）。

两段文案必须**分键存放**，不得混写在同一条字符串里。

## 键名约定（Key convention）

| 条目类型 | 历史背景键 | 机制键 | 模板字段 |
|---|---|---|---|
| 卡牌 | `card.<id>.background` | `card.<id>.desc` | `CardTemplate.backgroundKey` / `descriptionKey` |
| 事件 | `event.<id>.history` | `event.<id>.desc` | `EventTemplate.historyKey` / `descriptionKey`（均必填） |
| 状态 | `status.<id>.history` | `status.<id>.desc`（或既有 detail/hint 键） | `StatusTemplate.historyKey` / `descKey`（均必填） |
| 卡牌标签 | `log.info.cardTag.<tag>.history` | `log.info.cardTag.<tag>` | `CARD_TAGS` |
| 「剩余」手牌标记 | `log.info.cardUse.remainingUses.history` | `log.info.cardUse.remainingUses` | — |
| 事件标签（反法同盟） | 合并于 `log.info.eventTag.antiFrenchAlliance` | 同左 | `EVENT_TAGS` |
| 资源 | `resource.<key>.history` | `resource.<key>.hint` | `Resources` 四项 |

说明：

- 状态模板中即使数值 delta 为 0（真实效果在引擎钩子里，例如「宗教宽容」「合法性危机」），也必须用 `descKey` 写清实际机制。
- 事件的「有害 / 机遇 / 史实 / 持续 / 已解决」徽章是框架级状态标记，只需机制说明（`log.info.eventTag.*`），不要求历史背景。
- 机制文案中**禁止**出现“背景：/ Context: / Contexte :”式的历史混排，也禁止出现反引号包裹的代码标识符（如 `getEventSolveFundingAmount`）；玩家文案里描述公式请用自然语言（如「⌈财政÷4⌉」）。

## 展示位置（Where each half renders）

- 卡牌：手牌与牌库视图分行显示 `background`（斜体弱化）与 `desc`。
- 事件：`EventPanel` 在机制文本上方渲染 `history`（`.eventHistory` 样式）。
- 状态：`StatusBar` 详情 = 机制（`descKey` 或按 kind 生成的通用说明）+ 历史。
- 标签：点击标签徽章写入行动日志；`ActionLog` 会为任何带 `.history` 伴随键的 info 条目追加一行弱化的历史背景。
- 资源：悬停资源提示行可见历史背景（`title`）。

## 保证机制（Enforcement）

`src/locales/contentCompleteness.test.ts` 是专门的守护测试，会遍历全部卡牌 / 事件 / 状态模板、`CARD_TAGS`、事件标签与资源，对三种语言逐一断言：

- 历史背景键存在、非空，且达到最小长度（zh ≥ 16 字，en/fr ≥ 30 字符）——防止用两三个字的标签充当历史背景；
- 机制键存在、非空，且不含历史混排标记与反引号代码标识符；
- 历史文案中不得混入“机制：/ Mechanic: / Mécanique :”式的规则段落。

新增任何卡牌、事件、状态、标签或资源时，先补齐上述键，否则 `npm test` 会失败。

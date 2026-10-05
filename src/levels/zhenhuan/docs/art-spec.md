# 甄嬛传 · 配图规格

本文规定甄嬛传战役（`src/levels/zhenhuan/`）的手牌配图、事件配图与关卡背景的**比例、尺寸、格式、命名和显示方式**。原图来源、画风与提示词另行讨论（见文末「待定」）。

## 1. 总览

| 类别 | 比例 | 交付尺寸 | 格式 / 体积上限 | 数量 |
|---|---|---|---|---|
| 手牌配图 | **4:3**（横） | 1024 × 768 | WebP，≤ 100 KiB | 8 |
| 事件配图 | **4:3**（横） | 1024 × 768 | WebP，≤ 100 KiB | 23 |
| 关卡背景 | **16:9**（横） | 1920 × 1080 | WebP，≤ 300 KiB | 2（第一关、第二关各一张） |

- 原图分辨率不低于交付尺寸（手牌 / 事件建议 ≥ 1600 × 1200，背景建议 ≥ 2560 × 1440），比例必须与上表一致；比例不对的原图先裁好再压缩，不要靠拉伸。
- 卡牌原图用现有脚本压缩：`npm run img:card1024 -- <原图> -o <输出路径>`（`scripts/compressCardArt1024.mjs`，固定宽 1024、保持原比例、默认 ≤ 100 KiB），4:3 原图输出即为 1024 × 768。
- 背景压缩复用 `scripts/compressAssets.mjs` 的同一套流程（宽度 1920 起逐级下调，二分 WebP 质量），届时给它加一个甄嬛传目标。
- 压缩前的原图（PNG / JPG）不提交进仓库。

## 2. 文件位置与命名

文件名即 id，放进对应文件夹即生效，无需改代码：

```
src/levels/zhenhuan/assets/
  cards/<CardId2>.webp        手牌，如 cards/yirongZhengsu.webp
  events/<EventId2>.webp      事件，如 events/yizhangHong.webp
  backdrops/stage1.webp       第一关背景（同时用作开始菜单背景）
  backdrops/stage2.webp       第二关背景
```

- id 大小写须与 `data/content.ts` / `data/stage2Content.ts` 中完全一致。
- 两关共用的事件 id（如 `huanghouShangshi`、`gongzhongLiuyan`）共用同一张图。
- 单元测试 `ui/art.test.ts` 校验 `cards/`、`events/`、`backdrops/` 下的每个文件名都必须是已存在的 id（或 `stage1` / `stage2`），防止拼错后静默不显示。

## 3. 构图要求

### 手牌 / 事件（4:3）

- 显示框固定为 4:3、`object-fit: cover`，交付 4:3 时不会被裁切。
- 卡框有圆角（约 8px），**四边各留约 5% 安全边距**，主体不要贴边。
- 实际显示宽度：事件卡约 234px，手牌约 194px（桌面端，非略缩模式）。构图要在这个尺寸下仍能一眼认出主体：**单一主体、轮廓清晰、避免细碎小物件**。
- 画面内**不放文字**（卡名、效果都由界面渲染）。
- 同一类事件的色调可略有倾向，便于扫一眼区分：机会偏暖亮，危机偏冷暗，嫉妒偏粉紫，华妃偏金红（仅为建议，不强制）。

### 关卡背景（16:9）

- 界面会在背景上叠一层深色渐变以保证文字可读，**原图不要预先压暗**。
- 显示方式为 `background-size: cover; background-position: center`。手机竖屏下左右会被大幅裁掉，**关键元素放在画面中央约 1/3 宽度的竖条内**。
- 背景中央大部分会被半透明面板遮挡，适合用氛围性的场景（宫殿、庭院、室内陈设），不要把重要细节放在正中心。
- 第一关与第二关使用不同的背景；开始菜单沿用第一关背景。

## 4. 界面显示规则

实现：`ui/art.ts`（按文件名查图）、`ui/common.tsx` 的 `CardArt` / `Backdrop`、样式在 `zhenhuan.module.css` 的 `.cardArt` / `.backdrop`。

- **展开的卡显示配图，收起的略缩卡不显示**：桌面端卡牌默认展开，所以都有图；略缩模式（含手机端）下收起的卡保持现有紧凑样式，点开展开后才显示图片（与太阳王战役一致）。
- 手牌（`HandCard`）与事件（`EventCard`，两关的 `ZhenhuanGame.tsx` / `Stage2Game.tsx` 都适用）在卡头下方插入 4:3 配图框。
- **缺图时显示占位框**：同样 4:3，深色渐变底 + 居中的大号 emoji（取卡牌 / 事件已有的 `emoji` 字段），保证有图无图的卡片高度一致，配图可以逐张补齐。
- 图片使用 `loading="lazy"` 与 `decoding="async"`；卡名已在卡头显示，图片按装饰图处理（`alt=""`）。
- 背景固定在视口上（页面滚动时不拉伸），上方叠一层深色渐变；卡片、数值等面板保持不透明，不受背景影响。缺背景图时沿用原来的纯色背景。
- 剧情卡、晋封考验、惜别卡本期不配图，仍为纯文字卡。

## 5. 清单

### 手牌（8）

| id | 名称 |
|---|---|
| `yirongZhengsu` | 🪞 仪容整肃 |
| `jinyanShenxing` | 🤐 谨言慎行 |
| `wenTaiyiZhenzhi` | 💊 温太医相助 |
| `shoulongRenxin` | 🤝 收拢人心 |
| `jingguanQibian` | 🍵 静观其变 |
| `meizhuangXiangzhu` | 👭 眉庄相助 |
| `lingrongXiangzhu` | 🎶 陵容相助（第二关） |
| `jinxiXiangzhu` | 🏮 槿汐相助（第二关） |

### 事件（23）

| id | 名称 | 类别 | 出现关卡 |
|---|---|---|---|
| `huanghouShangshi` | 🏮 皇后赏识（第二关名为「中宫垂青」） | 机会 | 一、二 |
| `taihouChuixun` | 🪭 太后垂询 | 机会 | 一、二 |
| `wenTaiyiQingmai` | 🩺 温太医请脉 | 机会 | 一 |
| `jingxinTiaoyang` | 🌿 静心调养 | 机会 | 二 |
| `baohuadianQifu` | 🙏 宝华祈福 | 机会 | 二 |
| `supeishengToufeng` | 🗝️ 御前密语 | 机会 | 二 |
| `liPinJingmeng` | 👻 丽嫔惊梦 | 机会 | 二 |
| `wenyiBaoyang` | 🤒 温宜抱恙 | 机会 | 二 |
| `qingmaiBaoxi` | 💗 请脉报喜 | 机会 | 二 |
| `qinmoChenqing` | 🍵 琴默陈情 | 机会 | 二 |
| `gongzhongLiuyan` | 🗣️ 宫中流言 | 危机 | 一、二 |
| `neiwufuDiaonan` | 📦 内务府刁难 | 危机 | 一、二 |
| `liyiShiwu` | 🎎 礼仪失误 | 危机 | 一、二 |
| `hanliangZhiwu` | 🧊 寒凉之物 | 危机 | 二 |
| `yuDayingZhengchong` | 🎶 梅影争春 | 嫉妒 | 一 |
| `shichongErjiao` | 💍 恃宠而骄 | 嫉妒 | 一 |
| `anzhongXiaban` | 🪤 暗中下绊 | 嫉妒 | 一 |
| `songzhiKuisi` | 👁️ 隔墙有耳 | 华妃 | 二 |
| `yikungongLiGuiju` | 🏯 翊坤立威 | 华妃 | 二 |
| `kekouFenli` | 🍚 克扣份例 | 华妃 | 二 |
| `shanshiYouyi` | 🍲 膳食有异 | 华妃 | 二 |
| `yizhangHong` | 🩸 一丈红 | 华妃 | 二 |
| `huanyixiangZhuanchong` | 🌺 欢宜香浓 | 华妃 | 二 |

### 背景（2）

| 文件 | 用途 |
|---|---|
| `backdrops/stage1.webp` | 第一关对局 + 开始菜单 |
| `backdrops/stage2.webp` | 第二关对局 |

## 6. 出图

- 用 ChatGPT 逐张生成，风格设定、每张图的 prompt 与短编号（C01–C08、E01–E23、B1–B2）见 [art-prompts.md](./art-prompts.md)。
- 选定的原图按短编号命名放进 `art-inbox/`，导入时改名为游戏 id、裁切并压缩到本文第 2 节的位置。

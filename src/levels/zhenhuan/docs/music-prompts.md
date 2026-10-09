# 背景音乐规格与 AI 提示词

背景音乐全部用原创曲目，**不要**用《甄嬛传》原曲或其变调版（改编权仍属原作者与出品方）。
共四种情绪，每种一段提示词，可直接贴进 AI 作曲工具。

## 统一格式

四首曲子用同一套格式，换曲时才接得上。

| 项目 | 规定 |
|---|---|
| 编号 / 文件名 | M01 `calm`、M02 `tension`、M03 `sorrow`、M04 `climax`；放进 `assets/music/`，`.mp3` / `.ogg` / `.m4a` / `.wav` 均可 |
| 时长 | 每首 **30–40 秒**，不要超过 45 秒。曲子放完才换下一首，短一些，换曲才跟得上回合推进；同一阶段会重播 |
| 开头 | **从静音起**：开头约 0.5 秒静音，再轻轻进入（淡入），不要一上来就是满强度 |
| 结尾 | **以静音收**：最后一个音自然衰减，尾部留约 1.5 秒静音；不要突然截断，也不要循环式收尾 |
| 编制 | 纯器乐，无人声，无歌词；古筝 / 古琴 / 笛箫 / 二胡 / 琵琶为主，可垫少量弦乐与鼓 |
| 响度 | 四首响度接近（约 -16 LUFS），避免换曲时忽大忽小；游戏内音量固定 50% |
| 体积 | 单首 ≤ 1 MB（128 kbps mp3 即可） |
| 版权 | 原创，不要引用《甄嬛传》原曲旋律 |

两首之间因此一定隔着一小段静音（上一首的尾 + 下一首的头，约 2 秒），像翻页一样自然，不需要做交叉淡化。
AI 工具往往做不到精确的静音首尾，生成后用 Audacity 修一下：开头加 0.5 秒静音并做 1–2 秒淡入，结尾做 2–3 秒淡出并留 1.5 秒静音，再统一响度。

## 播放规则

每关一张「从第几回合起，下一首放什么」的表（`ui/music.ts` 里的 `MUSIC_SCHEDULE`），和剧情推进对应；不要求每关四种都用。

**一首放完才换下一首**：回合推进时不打断正在放的曲子；曲子结束的那一刻游戏在第几回合，就按表挑下一首（还在同一阶段就重播同一首）。开始菜单放 `calm`。

| 回合 | 第一关（15 回合） | 第二关（30 回合） |
|---|---|---|
| 1 | `calm`（初入宫门） | `calm`（凤鸾空返） |
| 3 | | `tension`（初谒翊坤） |
| 4 | `tension`（逆风解意） | |
| 8 | `calm`（杏花微雨） | `sorrow`（菊残霜冷，眉庄 / 温太医退场） |
| 10 | `tension`（晋封考验） | `calm`（贵人之后） |
| 13 | `calm`（尘埃落定） | |
| 17 | | `sorrow`（翊坤长跪） |
| 20 | | `tension`（端妃旧事） |
| 24 | | `climax`（年氏倾颓，直到翊坤落幕） |

第一关没有用到 `sorrow` 和 `climax`。这张表是我按剧情节点草拟的，随时可以改。

## 提示词

每条 prompt 都由「统一开头 + 本曲描述 + 统一结尾」拼成，整段直接复制。English 效果更稳。

**统一开头**（每条都带）
> Original instrumental piece in ancient Chinese court style, no vocals, no lyrics. Duration about 35 seconds. Starts from silence with a very soft gentle fade-in, and ends by naturally decaying to silence with a long quiet tail; no abrupt cut, no loop.

**统一结尾**（每条都带）
> Clean studio recording, warm and refined, consistent loudness, avoid copying any existing TV drama melody.

**M01 calm 日常欢快**
> Light, cheerful palace afternoon. Plucked guzheng arpeggios, playful bamboo flute melody, soft pipa accents, warm and lively, around 90 BPM, pentatonic, graceful and a little mischievous. Steady gentle energy throughout.

**M02 tension 紧张**
> Suspenseful palace intrigue. Low sustained erhu and cello, muted pizzicato guzheng plucks, restrained hand-drum pulse, a few dissonant touches, building unease around 84 BPM, whispering and hidden menace. Stays tense and restrained; no big climax.

**M03 sorrow 哀婉**
> Sorrowful and tender. Expressive solo erhu with soft guqin and slow strings, bittersweet pentatonic melody, free rubato feel, around 54 BPM, quiet grief and resignation, delicate and moving. Sparse and spacious.

**M04 climax 高潮**
> Dramatic climax of a palace confrontation. Pounding taiko-style drums, urgent guzheng runs, erhu and strings rising in intensity, around 100 BPM, fateful and decisive, powerful but still elegant. Builds quickly to a peak in the last third, then resolves and fades to silence.

## 工具与授权

下列工具都能生成纯器乐，但**商用授权取决于你的套餐和当时的条款**，生成前请自己确认：

- Suno：付费套餐生成的曲目可商用，免费套餐不行。
- Udio / Stable Audio / ElevenLabs Music：看各自当前的商用条款。
- 保存好每首曲子的生成记录（页面截图或导出），以备授权核查。

小技巧：每种情绪多生成几条，挑结尾最自然的。

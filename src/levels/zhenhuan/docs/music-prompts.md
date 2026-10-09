# 背景音乐规格与 AI 提示词

背景音乐全部用原创曲目，**不要**用《甄嬛传》原曲或其变调版（改编权仍属原作者与出品方）。
共五种情绪，每种一段提示词，可直接贴进 AI 作曲工具。

## 统一格式

五首曲子用同一套格式，换曲时才接得上。

| 项目 | 规定 |
|---|---|
| 编号 / 文件名 | M01 `calm`、M02 `tension`、M03 `sorrow`、M04 `climax`、M05 `tender`；放进 `assets/music/`，`.mp3` / `.ogg` / `.m4a` / `.wav` 均可 |
| 时长 | 每首 **30–40 秒**，不要超过 45 秒。曲子放完才换下一首，短一些，换曲才跟得上回合推进；同一阶段会重播 |
| 开头 | **从静音起**：开头约 0.5 秒静音，再轻轻进入（淡入），不要一上来就是满强度 |
| 结尾 | **以静音收**：最后一个音自然衰减，尾部留约 1.5 秒静音；不要突然截断，也不要循环式收尾 |
| 编制 | 纯器乐，无人声，无歌词；古筝 / 古琴 / 笛箫 / 二胡 / 琵琶为主，可垫少量弦乐与鼓 |
| 响度 | 五首响度接近（约 -16 LUFS），避免换曲时忽大忽小；游戏内音量固定 50% |
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
| 8 | `tender`（杏花微雨） | `sorrow`（菊残霜冷，眉庄 / 温太医退场） |
| 10 | `tension`（晋封考验） | `calm`（贵人之后） |
| 13 | `calm`（尘埃落定） | |
| 14 | | `tender`（圆明伴驾） |
| 17 | | `sorrow`（翊坤长跪） |
| 20 | | `tension`（端妃旧事） |
| 24 | | `climax`（年氏倾颓，直到翊坤落幕） |

第一关没有用到 `sorrow` 和 `climax`。这张表是我按剧情节点草拟的，随时可以改。

## 使用方法

1. **每首一条完整 prompt，整段复制。** 每段已经包含时长、静音首尾、编制和版权要求，不用再拼。
2. **工具里打开「纯音乐 / Instrumental」。** 以 Suno 为例：Custom 模式，打开 Instrumental，把 prompt 贴进 Style of Music（或 Song Description），Title 填编号即可。
3. **每首生成 3–4 条，挑一条。** 首选标准：时长在 30–40 秒内，开头和结尾是静的，结尾收得自然、重播不突兀。
4. **时长没卡住的不用重来**：长了就在 Audacity 里截到 40 秒内，并按上面的「统一格式」补静音和淡出。
5. **下载后按编号重命名**，例如 `M01.mp3`；交回时上传到 `art-inbox/` 或直接放进 `assets/music/` 并改成英文文件名（M01 → `calm.mp3`，见下表）。

| 编号 | 文件名 | 情绪 |
|---|---|---|
| M01 | `calm` | 日常欢快 |
| M02 | `tension` | 紧张 |
| M03 | `sorrow` | 哀婉 |
| M04 | `climax` | 高潮 |
| M05 | `tender` | 柔情 |

## 提示词（M01–M05）

每段整段复制，一次生成一首。括号里是这首在游戏里什么时候放，供试听时对照。

**M01 日常欢快**（在宫里过日子的平常回合：开局、阶段之间的喘息、尘埃落定）

```text
Original instrumental piece in ancient Chinese imperial court style, for a palace drama card game. No vocals, no lyrics, no choir. Length 30 to 40 seconds, about 35 seconds. Begins with half a second of silence, then a very soft fade-in; ends by letting the last note decay naturally into about 1.5 seconds of silence. No abrupt cut, no loop-style ending.
Mood: light and cheerful, a bright afternoon in the palace gardens, graceful and a little mischievous. Instruments: plucked guzheng arpeggios, playful dizi bamboo flute melody, soft pipa accents, a light wood block. Tempo around 90 BPM, pentatonic major, steady gentle energy throughout.
Clean studio recording, warm and refined, moderate consistent loudness. Entirely original melody; do not quote or imitate any existing TV drama theme.
```

**M02 紧张**（暗流涌动：初谒翊坤、晋封考验、端妃旧事这类处处要提防的阶段）

```text
Original instrumental piece in ancient Chinese imperial court style, for a palace drama card game. No vocals, no lyrics, no choir. Length 30 to 40 seconds, about 35 seconds. Begins with half a second of silence, then a very soft fade-in; ends by letting the last note decay naturally into about 1.5 seconds of silence. No abrupt cut, no loop-style ending.
Mood: suspenseful palace intrigue, whispering and hidden menace, someone is watching. Instruments: low sustained erhu and cello drone, muted pizzicato guzheng plucks, restrained frame-drum pulse, a few dissonant bends. Tempo around 84 BPM, minor pentatonic, unease builds a little but stays restrained, no big climax.
Clean studio recording, warm and refined, moderate consistent loudness. Entirely original melody; do not quote or imitate any existing TV drama theme.
```

**M03 哀婉**（失去与委屈：眉庄或温太医退场、翊坤长跪）

```text
Original instrumental piece in ancient Chinese imperial court style, for a palace drama card game. No vocals, no lyrics, no choir. Length 30 to 40 seconds, about 35 seconds. Begins with half a second of silence, then a very soft fade-in; ends by letting the last note decay naturally into about 1.5 seconds of silence. No abrupt cut, no loop-style ending.
Mood: sorrowful and tender, quiet grief and resignation, delicate and moving. Instruments: expressive solo erhu, soft guqin harmonics, sparse slow strings underneath. Tempo around 54 BPM with free rubato, bittersweet minor pentatonic melody, sparse and spacious.
Clean studio recording, warm and refined, moderate consistent loudness. Entirely original melody; do not quote or imitate any existing TV drama theme.
```

**M04 高潮**（决战：年氏倾颓到翊坤落幕）

```text
Original instrumental piece in ancient Chinese imperial court style, for a palace drama card game. No vocals, no lyrics, no choir. Length 30 to 40 seconds, about 35 seconds. Begins with half a second of silence, then a very soft fade-in; ends by letting the last note decay naturally into about 1.5 seconds of silence. No abrupt cut, no loop-style ending.
Mood: dramatic climax of a palace confrontation, fateful and decisive, powerful but still elegant. Instruments: pounding taiko-style war drums, urgent guzheng runs, erhu and strings rising in intensity, a bronze gong hit at the peak. Tempo around 100 BPM, builds quickly to a peak in the last third, then resolves and fades to silence.
Clean studio recording, warm and refined, moderate consistent loudness. Entirely original melody; do not quote or imitate any existing TV drama theme.
```

**M05 柔情**（恩宠与心动：杏花微雨、圆明伴驾）

```text
Original instrumental piece in ancient Chinese imperial court style, for a palace drama card game. No vocals, no lyrics, no choir. Length 30 to 40 seconds, about 35 seconds. Begins with half a second of silence, then a very soft fade-in; ends by letting the last note decay naturally into about 1.5 seconds of silence. No abrupt cut, no loop-style ending.
Mood: tender and romantic, a shy first heartbeat under spring blossoms, intimate and gentle, a hint of longing. Instruments: soft pipa tremolo melody answered by a breathy xiao flute, warm guzheng harmonies, faint wind chimes. Tempo around 66 BPM, pentatonic, flowing and lyrical, gentle swells, no drums.
Clean studio recording, warm and refined, moderate consistent loudness. Entirely original melody; do not quote or imitate any existing TV drama theme.
```

## 工具与授权

下列工具都能生成纯器乐，但**商用授权取决于你的套餐和当时的条款**，生成前请自己确认：

- Suno：付费套餐生成的曲目可商用，免费套餐不行。
- Udio / Stable Audio / ElevenLabs Music：看各自当前的商用条款。
- 保存好每首曲子的生成记录（页面截图或导出），以备授权核查。

小技巧：每种情绪多生成几条，挑结尾最自然的。

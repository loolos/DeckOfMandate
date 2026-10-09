# 背景音乐规格与 AI 提示词

背景音乐全部用原创曲目，**不要**用《甄嬛传》原曲或其变调版（改编权仍属原作者与出品方）。
共四种情绪，每种一段提示词，可直接贴进 AI 作曲工具。

## 文件规格

- 放在 `src/levels/zhenhuan/assets/music/<情绪>.mp3`（也可用 `.ogg` / `.m4a` / `.wav`）。
- 文件名即情绪名，缺哪个文件，那个情绪就静音，不会报错。
- 每首完整播放一遍，**结尾要收得自然**（不必循环衔接）；纯器乐，无人声。建议 1.5–3 分钟，≤ 3 MB（128 kbps mp3）。
- 游戏内音量固定为 50%；右上角按钮可静音（记在本机）。

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

## 提示词（英文效果更稳，可直接粘贴）

通用后缀：`instrumental only, no vocals, original composition, Chinese classical court style`

**calm 日常欢快**
> Light, cheerful ancient Chinese court music for a bright palace afternoon. Plucked guzheng arpeggios, playful bamboo flute melody, soft pipa accents, warm and lively, around 90 BPM, pentatonic, graceful and a little mischievous.

**tension 紧张**
> Suspenseful Chinese palace intrigue. Low sustained erhu and cello, muted pizzicato guzheng plucks, restrained hand drum pulse, dissonant touches, slowly building unease around 84 BPM, whispering and hidden menace, no big climax.

**climax 高潮**
> Dramatic climax of a palace confrontation. Pounding taiko-style drums, urgent guzheng runs, erhu and strings rising in intensity, 100 BPM, fateful and decisive, powerful but still elegant, strong definite ending.

**sorrow 哀婉**
> Sorrowful and tender Chinese classical piece. Expressive solo erhu with soft guqin and slow strings, bittersweet pentatonic melody, rubato, 54 BPM, quiet grief and resignation, delicate and moving.

## 工具与授权

下列工具都能生成纯器乐，但**商用授权取决于你的套餐和当时的条款**，生成前请自己确认：

- Suno：付费套餐生成的曲目可商用，免费套餐不行。
- Udio / Stable Audio / ElevenLabs Music：看各自当前的商用条款。
- 保存好每首曲子的生成记录（页面截图或导出），以备授权核查。

小技巧：每种情绪多生成几条，挑结尾最自然的；结尾太突兀的，用 Audacity 等软件加一小段淡出。

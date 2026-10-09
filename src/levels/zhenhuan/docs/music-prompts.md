# 背景音乐规格与 AI 提示词

背景音乐全部用原创曲目，**不要**用《甄嬛传》原曲或其变调版（改编权仍属原作者与出品方）。
共四种情绪，每种一段提示词，可直接贴进 AI 作曲工具。

## 文件规格

- 放在 `src/levels/zhenhuan/assets/music/<情绪>.mp3`（也可用 `.ogg` / `.m4a` / `.wav`）。
- 文件名即情绪名，缺哪个文件，那个情绪就静音，不会报错。
- 每首完整播放一遍，**结尾要收得自然**（不必循环衔接）；纯器乐，无人声。建议 1.5–3 分钟，≤ 3 MB（128 kbps mp3）。
- 游戏内音量固定为 50%；右上角按钮可静音（记在本机）。

## 播放规则

只看回合数，不看具体事件。进度按「当前回合 / 本关总回合」算：

| 文件名 | 情绪 | 进度 | 第一关（15 回合） | 第二关（30 回合） |
|---|---|---|---|---|
| `calm` | 日常欢快 | ≤ 25% | 1–3 | 1–7 |
| `tension` | 紧张 | 25%–60% | 4–9 | 8–18 |
| `sorrow` | 哀婉 | 60%–85% | 10–12 | 19–25 |
| `climax` | 高潮 | 85%–100% | 13–15 | 26–30 |

开始菜单放 `calm`。**一首放完才会换下一首**：回合推进到新阶段时不打断正在放的曲子，等它结束后，再按那时的回合挑下一首（同一阶段就重播同一首）。

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

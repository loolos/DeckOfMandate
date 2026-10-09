# 背景音乐规格与 AI 提示词

背景音乐全部用原创曲目，**不要**用《甄嬛传》原曲或其变调版（改编权仍属原作者与出品方）。
共四种情绪，每种一段提示词，可直接贴进 AI 作曲工具。

## 文件规格

- 放在 `src/levels/zhenhuan/assets/music/<情绪>.mp3`（也可用 `.ogg` / `.m4a` / `.wav`）。
- 文件名即情绪名，缺哪个文件，那个情绪就静音，不会报错。
- 四首都是循环曲：1.5–3 分钟，**首尾要能无缝衔接**，不要渐弱收尾；纯器乐，无人声。
- 体积建议每首 ≤ 3 MB（128 kbps mp3 即可）。
- 游戏内音量固定为 50%，切换时淡入淡出约 1.2 秒；右上角按钮可静音（记在本机）。

## 什么时候放哪首

| 文件名 | 情绪 | 触发时机 |
|---|---|---|
| `calm` | 日常欢快 | 开始菜单、平常回合（没有未解的危机 / 剧情事件）、通关 |
| `tension` | 紧张 | 有未解决的危机 / 嫉妒 / 华妃事件，晋封考验进行中 |
| `climax` | 高潮 | 第二关第 30 回合【翊坤落幕】终局 |
| `sorrow` | 哀婉 | 有等待选择的剧情事件、失败 |

## 提示词（英文效果更稳，可直接粘贴）

通用后缀：`instrumental only, no vocals, seamless loop, original composition, Chinese classical court style`

**calm 日常欢快**
> Light, cheerful ancient Chinese court music for a bright palace afternoon. Plucked guzheng arpeggios, playful bamboo flute melody, soft pipa accents, warm and lively, around 90 BPM, pentatonic, graceful and a little mischievous.

**tension 紧张**
> Suspenseful Chinese palace intrigue. Low sustained erhu and cello, muted pizzicato guzheng plucks, restrained hand drum pulse, dissonant touches, slowly building unease around 84 BPM, whispering and hidden menace, no big climax.

**climax 高潮**
> Dramatic climax of a palace confrontation. Pounding taiko-style drums, urgent guzheng runs, erhu and strings rising in intensity, 100 BPM, fateful and decisive, powerful but still elegant, loopable ending.

**sorrow 哀婉**
> Sorrowful and tender Chinese classical piece. Expressive solo erhu with soft guqin and slow strings, bittersweet pentatonic melody, rubato, 54 BPM, quiet grief and resignation, delicate and moving.

## 工具与授权

下列工具都能生成纯器乐，但**商用授权取决于你的套餐和当时的条款**，生成前请自己确认：

- Suno：付费套餐生成的曲目可商用，免费套餐不行。
- Udio / Stable Audio / ElevenLabs Music：看各自当前的商用条款。
- 保存好每首曲子的生成记录（页面截图或导出），以备授权核查。

小技巧：每种情绪多生成几条，挑首尾衔接最自然的；循环听不顺的，用 Audacity 等软件做首尾交叉淡化。

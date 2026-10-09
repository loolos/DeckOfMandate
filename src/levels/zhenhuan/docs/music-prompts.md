# 背景音乐规格与 AI 提示词

背景音乐全部用原创曲目，**不要**用《甄嬛传》原曲或其变调版（改编权仍属原作者与出品方）。
下面每种情绪一段提示词，可直接贴进 AI 作曲工具。

## 文件规格

- 放在 `src/levels/zhenhuan/assets/music/<情绪>.mp3`（也可用 `.ogg` / `.m4a` / `.wav`）。
- 文件名即情绪名，缺哪个文件，那个情绪就静音，不会报错。
- 循环曲（menu / calm / tension / story / trial / finale）：1.5–3 分钟，**首尾要能无缝衔接**，不要渐弱收尾；纯器乐，无人声。
- 一次性曲（victory / defeat）：20–40 秒，有明确的收尾，不循环。
- 体积：循环曲建议 ≤ 3 MB（128 kbps mp3 即可），整套 ≤ 15 MB。
- 游戏内音量固定为 50%，切换时淡入淡出约 1.2 秒；右上角按钮可静音（记在本机）。

## 什么时候放哪首

| 文件名 | 情绪 | 触发时机 |
|---|---|---|
| `menu` | 宫门初启 | 开始菜单、关卡开场 |
| `calm` | 深宫日常 | 平常回合：没有未解的危机 / 剧情事件 |
| `tension` | 暗流涌动 | 有未解决的危机事件、嫉妒事件、华妃事件 |
| `story` | 哀婉 | 有等待选择的剧情事件 |
| `trial` | 晋封考验 | 晋封 / 贵人考验进行中 |
| `finale` | 翊坤落幕 | 第二关第 30 回合终局 |
| `victory` | 得偿所愿 | 通关 |
| `defeat` | 黯然失势 | 失败 |

第三关（见 `/zhenhuan-stage3/ideas.md`）上线后可再加：`ganlusi`（甘露寺，清冷空灵）、`lingyunfeng`（凌云峰，旷远温柔）、`fengque`（回宫，庄重而暗藏锋芒）。

## 提示词（英文效果更稳，可直接粘贴）

通用后缀：`instrumental only, no vocals, seamless loop, original composition, Chinese classical court style`

**menu 宫门初启**
> Solemn and spacious Chinese palace atmosphere at dawn. Solo guqin with sparse notes, soft low drum, faint temple bell, long reverb, slow tempo around 60 BPM, mysterious and elegant, melancholic beauty.

**calm 深宫日常**
> Gentle ancient Chinese court music for a quiet palace afternoon. Plucked guzheng arpeggios, soft bamboo flute melody, warm and refined, unhurried around 72 BPM, pentatonic, light and slightly wistful, subtle strings underneath.

**tension 暗流涌动**
> Suspenseful Chinese palace intrigue. Low sustained erhu and cello, muted pizzicato guzheng plucks, restrained hand drum pulse, dissonant touches, slowly building unease around 84 BPM, whispering and hidden menace, no big climax.

**story 哀婉**
> Sorrowful and tender Chinese classical piece. Expressive solo erhu with soft guqin and slow strings, bittersweet pentatonic melody, rubato, 54 BPM, quiet grief and resignation, delicate and moving.

**trial 晋封考验**
> Ceremonial yet nervous Chinese court music. Slow bronze bell and drum, solemn guzheng chords, bamboo flute holding long notes, dignified and tense, 66 BPM, sense of being watched and judged.

**finale 翊坤落幕**
> Dramatic climax of palace confrontation. Pounding taiko-style drums, urgent guzheng runs, erhu and strings rising in intensity, 100 BPM, fateful and decisive, powerful but still elegant, loopable ending.

**victory 得偿所愿**（一次性，约 30 秒）
> Short triumphant yet bittersweet Chinese classical resolution. Flute and guzheng rising to a calm major cadence, soft bells, warm strings, gentle sense of victory won at a cost, clear final chord, 30 seconds, no loop.

**defeat 黯然失势**（一次性，约 30 秒）
> Short desolate Chinese classical lament. Lone guqin and distant erhu fading into silence, descending melody, cold and hollow, final low chord ringing out, 30 seconds, no loop.

## 工具与授权

下列工具都能生成纯器乐，但**商用授权取决于你的套餐和当时的条款**，生成前请自己确认：

- Suno：付费套餐生成的曲目可商用，免费套餐不行。
- Udio / Stable Audio / ElevenLabs Music：看各自当前的商用条款。
- 保存好每首曲子的生成记录（页面截图或导出），以备授权核查。

一个小技巧：每种情绪多生成几条，挑首尾衔接最自然的；循环听不顺的，用音频编辑软件（如 Audacity）做首尾交叉淡化。

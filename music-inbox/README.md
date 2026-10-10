# 背景音乐收件箱

AI 生成的背景音乐（M01–M05）先传到这里，处理后移进 `src/levels/zhenhuan/assets/music/` 并从这里删掉。
提示词与规格见 `src/levels/zhenhuan/docs/music-prompts.md`。

- **上传**：把文件直接发在项目对话里，或在 GitHub 上传到这个文件夹。文件名用编号，例如 `M01.mp3`（`M1.mp3`、`M01 (2).m4a` 也认）；mp3 / m4a / ogg / wav 均可，wav 会转成 mp3。
- **处理**：`npm run music:import`（即 `node scripts/importMusic.mjs`），改名入库并刷新下表。只刷新表：加 `--status`。
- 同一编号再传一次就是替换旧版本。

## 当前状态

<!-- status:start -->
| 编号 | 情绪 | 状态 | 游戏文件 | 大小 · 时长 | 问题 |
|---|---|---|---|---|---|
| M01 | 日常欢快 | ✅ 已入库 | `calm.mp3` | 633 KB · 40.5 秒 | — |
| M02 | 紧张 | ✅ 已入库 | `tension.mp3` | 544 KB · 34.8 秒 | — |
| M03 | 哀婉 | ✅ 已入库 | `sorrow.mp3` | 631 KB · 40.3 秒 | — |
| M04 | 高潮 | ✅ 已入库 | `climax.mp3` | 610 KB · 39.0 秒 | — |
| M05 | 柔情 | ✅ 已入库 | `tender.mp3` | 625 KB · 40.0 秒 | — |
<!-- status:end -->

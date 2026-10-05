Raw AI-generated art (C01.png, E22.png, B1.png ...). Processed into src/levels/zhenhuan/assets/ and then removed; see src/levels/zhenhuan/docs/art-prompts.md.

If a picture has a light caption strip at the bottom (e.g. "文件 s14.png"), cut it first:
`node scripts/trimArtBar.mjs art-inbox/*.png --in-place --ratio 4:3` (use `--ratio 16:9` for backdrops).

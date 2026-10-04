# Deck of Mandate

A single-player, turn-based strategy card game that runs entirely in the browser. Each turn you draw a hand, play cards against the events on the table, and try to keep your position until the chapter's goal is met. The game ships with two campaigns, chosen from the start menu.

[**Play Online**](https://loolos.github.io/DeckOfMandate)

## Campaigns

### The Sun King (太阳王)

Govern France as Louis XIV. You manage **Treasury / Funding / Power / Legitimacy**, resolve procedural and scripted events, and race each chapter's objectives before your mandate collapses.

| Chapter | Id | Span | Turns |
| --- | --- | --- | --- |
| The Rising Sun | `firstMandate` | 1661–1675 | 15 |
| Long Shadows at Noon | `secondMandate` | 1676–1700 | 25 |
| Waning Sun, Vacant Crown | `thirdMandate` | 1701–1720 (Spanish Succession) | 20 |

Chapters can be played in sequence (carrying state forward) or started on their own. Available in English, 中文 and Français.

### 甄嬛传 (Empresses in the Palace)

A palace-intrigue campaign in Chinese, based on the TV drama. You play 甄嬛, rising through the ranks of the harem. Everything is drawn with emoji. There are no resources to spend; you survive on two meters, **🪷 清誉** (reputation) and **👑 圣宠** (imperial favour). If either drops to 0, you lose on the spot.

Your rank sets how many cards you draw and play each turn, and caps both meters. Each turn brings an opportunity event and a crisis event, plus fixed or conditional story events. Each card answers specific events. Statuses such as 流言缠身, 抱恙在身 and 闭门思过 carry over between turns.

**Stage 1** (15 turns): start as 答应. You have to pass the promotion trial on turns 10–12 to become 常在, then hold on until turn 15. Story beats include 倚梅园 and 杏花微雨.

**Stage 2 · 华妃跋扈** (30 turns): start as 常在, keeping 清誉 / 圣宠 from stage 1 (or 8 / 8 when started from the menu). New systems:

- **🔥 华妃恨意** (0–10). It appears at 初谒翊坤 on turn 3. The higher it is, the more and harsher 华妃 events you face. These events are never free: leave them alone and you take the full set of penalties, or answer with a matching card and pay one lighter cost instead. At 10, 华妃 lashes out (华妃发难).
- **🎶 安陵容**. Her cards change with your hidden bond: 亲厚 lets a neighbouring card be played free (联袂), 生分 makes her linger in hand (依依), and 怨怼 blocks her neighbours (掣肘). Tasks she helps with can carry hidden costs, such as 舒痕胶.
- **🌱 身子, 召幸 and pregnancy.** Pass the 贵人 trial (turns 5–9). After that, 召幸 can lead to pregnancy, and 请脉报喜 confirms it and promotes you to 嫔. The 翊坤长跪 on turn 17 and harmful events can end in miscarriage.
- **🕯️ 惜别.** At the 假孕风波 on turn 8, either 眉庄 or 温太医 leaves you, and only one last card of theirs stays in your deck.
- **🗂️ Evidence against 华妃.** Evidence comes from specific cards on specific events. Its source stays hidden until you collect it. On turn 30, 👑 翊坤落幕 needs 1–3 cards to bring 华妃 down, and the more evidence you hold, the fewer cards it takes.

Both stages save automatically and share **run codes** (`ZH1-` / `ZH2-`) that replay a run exactly, from stage 1 through stage 2.

## Run locally

Prerequisites: **Node.js 22** (matches CI).

```bash
npm install --legacy-peer-deps
npm run dev        # Vite dev server on port 5173 (add -- --host 0.0.0.0 to expose it)
npm test           # Vitest
npm run build      # tsc --noEmit + production bundle
npm run preview    # serve the production build
```

Balance and strategy simulations:

```bash
npm run sim:zhenhuan             # 甄嬛传 stage 1, 1000 runs
npm run sim:zhenhuan2            # 甄嬛传 stage 2, 200 runs (careful vs. casual player)
npm run test:ai:first-mandate:1000
npm run test:ai:a-strategy-i:1000
```

## Tech and layout

- **React 18 + TypeScript + Vite 8**, fully client-side: no backend, database or external API. Saves live in `localStorage`.
- **Deterministic engines.** Each run is a seed plus an action list, so a run code always reproduces the same game.
- **Campaign packs** live under `src/levels/<campaignId>/`:
  - `campaignEntry.tsx` registers a campaign in the start-menu picker (`src/levels/campaignEntries.ts`, `src/components/CampaignSwitcher.tsx`).
  - **The Sun King** (`src/levels/sunking/`) plugs into the shared framework through `registerCampaign.ts` (see [docs/design.md](docs/design.md)).
  - **甄嬛传** (`src/levels/zhenhuan/`) is self-contained, with its own data, rules engines (`logic/engine.ts`, `logic/stage2Engine.ts`), sessions and run codes (`logic/session.ts`), UI and simulators.

## Documentation

| Document | Scope |
| --- | --- |
| [docs/gameplay.md](docs/gameplay.md) | Sun King rules reference: resources, turn order, win/lose checks, statuses |
| [docs/card.md](docs/card.md) | Sun King card catalog, tags, limited-use lifecycle |
| [src/levels/sunking/docs/太阳王战役.md](src/levels/sunking/docs/太阳王战役.md) | Sun King full campaign reference (Chinese) |
| [src/levels/zhenhuan/docs/design.md](src/levels/zhenhuan/docs/design.md) | 甄嬛传 stage 1 design spec (Chinese) |
| [src/levels/zhenhuan/docs/design-stage2.md](src/levels/zhenhuan/docs/design-stage2.md) | 甄嬛传 stage 2 design spec (Chinese) |
| [docs/design.md](docs/design.md) | Architecture, state model, data flow, testing strategy |

## Notes

- There is no lint script. Quality checks are `npm test` and `npm run build`, which runs `tsc --noEmit`.
- `npm install` may need `--legacy-peer-deps` because of Vite/plugin peer resolution.
- Vite 8 may log deprecation notices for `esbuild` / `optimizeDeps.rollupOptions`. They are cosmetic.

# Deck of Mandate

A single-player, turn-based strategy card game that runs entirely in the browser. Each turn you draw a hand, play cards against the events on the table, and try to keep your position until the chapter's goal is met. The game ships with two campaigns, chosen from the start menu.

[**Play Online**](https://loolos.github.io/DeckOfMandate)

## Campaigns

### The Sun King (`sunking`)

Govern France as Louis XIV. You manage **Treasury / Funding / Power / Legitimacy**, resolve procedural and scripted events, and race each chapter's objectives before your mandate collapses.

| Chapter | Id | Span | Turns |
| --- | --- | --- | --- |
| The Rising Sun | `firstMandate` | 1661–1675 | 15 |
| Long Shadows at Noon | `secondMandate` | 1676–1700 | 25 |
| Waning Sun, Vacant Crown | `thirdMandate` | 1701–1720 (Spanish Succession) | 20 |

Chapters can be played in sequence (carrying state forward) or started on their own. Available in English, Chinese and French.

### Empresses in the Palace (甄嬛传, `zhenhuan`)

A palace-intrigue campaign based on the Chinese TV drama. The UI and in-game text are Chinese only. You play Zhen Huan (甄嬛), rising through the ranks of the imperial harem. Everything is drawn with emoji. There are no resources to spend; you survive on two meters, **🪷 Reputation** (清誉) and **👑 Imperial Favour** (圣宠). If either drops to 0, you lose on the spot.

Your rank sets how many cards you draw and play each turn, and caps both meters. Each turn brings an opportunity event and a crisis event, plus fixed or conditional story events. Each card answers specific events. Statuses such as Slandered, Ill and Confined carry over between turns.

**Stage 1** (15 turns): start as a Low-ranking Concubine (答应). You have to pass the promotion trial on turns 10–12 to become a Frequent Attendant (常在), then hold on until turn 15. Story beats include the Plum Garden (倚梅园) and the Apricot Blossom Rain (杏花微雨).

**Stage 2 · The Domineering Consort Hua (华妃跋扈)** (30 turns): start as a Frequent Attendant, keeping Reputation / Favour from stage 1 (or 8 / 8 when started from the menu). New systems:

- **🔥 Consort Hua's Hatred** (0–10). It appears at the first visit to Yikun Palace on turn 3. The higher it is, the more and harsher Consort Hua events you face. These events are never free: leave them alone and you take the full set of penalties, or answer with a matching card and pay one lighter cost instead. At 10, she lashes out.
- **🎶 An Lingrong.** Her cards change with your hidden bond: *close* lets a neighbouring card be played free, *distant* makes her linger in hand, and *resentful* blocks her neighbours. Tasks she helps with can carry hidden costs, such as the scar-removing ointment.
- **🌱 Health, summons and pregnancy.** Pass the Noble Lady (贵人) trial (turns 5–9). After that, being summoned to the emperor's bed can lead to pregnancy, and the physician's pulse check confirms it and promotes you to Consort (嫔). The kneeling punishment at Yikun Palace on turn 17 and harmful events can end in miscarriage.
- **🕯️ Parting.** At the false-pregnancy scandal on turn 8, either Shen Meizhuang or Dr. Wen leaves you, and only one last card of theirs stays in your deck.
- **🗂️ Evidence against Consort Hua.** Evidence comes from specific cards on specific events. Its source stays hidden until you collect it. On turn 30, the final showdown needs 1–3 cards to bring her down, and the more evidence you hold, the fewer cards it takes.

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
npm run sim:zhenhuan             # Zhenhuan stage 1, 1000 runs
npm run sim:zhenhuan2            # Zhenhuan stage 2, 200 runs (careful vs. casual player)
npm run test:ai:first-mandate:1000
npm run test:ai:a-strategy-i:1000
```

## Tech and layout

- **React 18 + TypeScript + Vite 8**, fully client-side: no backend, database or external API. Saves live in `localStorage`.
- **Deterministic engines.** Each run is a seed plus an action list, so a run code always reproduces the same game.
- **Campaign packs** live under `src/levels/<campaignId>/`:
  - `campaignEntry.tsx` registers a campaign in the start-menu picker (`src/levels/campaignEntries.ts`, `src/components/CampaignSwitcher.tsx`).
  - **The Sun King** (`src/levels/sunking/`) plugs into the shared framework through `registerCampaign.ts` (see [docs/design.md](docs/design.md)).
  - **Empresses in the Palace** (`src/levels/zhenhuan/`) is self-contained, with its own data, rules engines (`logic/engine.ts`, `logic/stage2Engine.ts`), sessions and run codes (`logic/session.ts`), UI and simulators.

## Documentation

| Document | Scope |
| --- | --- |
| [docs/gameplay.md](docs/gameplay.md) | Sun King rules reference: resources, turn order, win/lose checks, statuses |
| [docs/card.md](docs/card.md) | Sun King card catalog, tags, limited-use lifecycle |
| [src/levels/sunking/docs/太阳王战役.md](src/levels/sunking/docs/太阳王战役.md) | Sun King full campaign reference (Chinese) |
| [src/levels/zhenhuan/docs/design.md](src/levels/zhenhuan/docs/design.md) | Empresses in the Palace stage 1 design spec (Chinese) |
| [src/levels/zhenhuan/docs/design-stage2.md](src/levels/zhenhuan/docs/design-stage2.md) | Empresses in the Palace stage 2 design spec (Chinese) |
| [docs/design.md](docs/design.md) | Architecture, state model, data flow, testing strategy |

## Notes

- There is no lint script. Quality checks are `npm test` and `npm run build`, which runs `tsc --noEmit`.
- `npm install` may need `--legacy-peer-deps` because of Vite/plugin peer resolution.
- Vite 8 may log deprecation notices for `esbuild` / `optimizeDeps.rollupOptions`. They are cosmetic.

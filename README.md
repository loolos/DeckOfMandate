# Deck of Mandate

A single-player, turn-based strategy card game that runs entirely in the browser. Each turn you draw a hand, play cards against the events on the table, and try to keep your position until the chapter's goal is met. The game ships with two campaigns, chosen from the start menu.

[**Play Online**](https://loolos.github.io/DeckOfMandate)

## Campaigns

### The Sun King (`sunking`)

Govern France as Louis XIV across three chapters (1661–1720), managing Treasury, Funding, Power and Legitimacy while resolving scripted events and chasing each chapter's objectives. Chapters can be played in sequence or on their own. Available in English, Chinese and French.

### Empresses in the Palace (`zhenhuan`)

A palace-intrigue campaign based on the Chinese TV drama *Empresses in the Palace* (甄嬛传). Rise through the imperial harem across two stages, balancing Reputation and Imperial Favour while answering events with the right cards. Chinese only. Runs save automatically and can be replayed from a shareable run code.

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

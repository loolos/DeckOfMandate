# Deck of Mandate

Single-player, turn-based strategy card game about governance under pressure. The player manages **Treasury / Funding / Power / Legitimacy**, resolves procedural + scripted events, and races chapter objectives before mandate collapse.

[**Play Online**](https://loolos.github.io/DeckOfMandate)

## Current implementation snapshot (code-aligned)

- **Tech**: React 18 + TypeScript + Vite 8, fully client-side, no backend/database/API.
- **State**: centralized reducer state + deterministic RNG (`runSeed`) for reproducible runs.
- **Content**: campaign packs under `src/levels/<campaignId>/` (each exposes `registerCampaign.ts`; `registerAll.ts` discovers campaigns via `import.meta.glob`). Level registry and thin template re-exports live in `src/data/` (details in [docs/design.md](docs/design.md) under “Code organization” and “Content architecture”).
- **Modes**:
  - Chapter 1: **The Rising Sun** (`firstMandate`, 1661–1675, 15 turns)
  - Chapter 2: **Long Shadows at Noon** (`secondMandate`, 1676–1700, 25 turns)
- **Localization**: English / 中文 / Français.

## Run locally

Prerequisites: **Node.js 22** (matches CI). Install and run:

```bash
npm install --legacy-peer-deps
npm run dev
npm test
npm run build
npm run preview
```

- **`npm run dev`** — Vite dev server (default port 5173). Use `npm run dev -- --host 0.0.0.0` to listen on all interfaces.
- **`npm run preview`** — serve the production build locally after `npm run build`.

Optional Monte Carlo / strategy report scripts (see `package.json`):

```bash
npm run test:ai:first-mandate:1000
npm run test:ai:a-strategy-i:1000
```

## Documentation

| Document | Scope |
| --- | --- |
| [docs/gameplay.md](docs/gameplay.md) | Rules reference: resources, turn order, win/lose checks, draw scaling, statuses |
| [docs/card.md](docs/card.md) | Card catalog, tags, inflation, limited-use lifecycle |
| [docs/太阳王战役.md](docs/太阳王战役.md) | Chinese full campaign reference (Chapter 1 + Chapter 2) |
| [docs/design.md](docs/design.md) | Architecture, state model, data flow, testing strategy |

## Notes

- There is no lint script in this repo; quality checks are primarily `npm test` and `npm run build` (which runs `tsc --noEmit`).
- `npm install` may require `--legacy-peer-deps` due to Vite/plugin peer resolution in some environments.
- Vite 8 may log deprecation notices for `esbuild` / `optimizeDeps.rollupOptions`; they are cosmetic and do not affect gameplay.

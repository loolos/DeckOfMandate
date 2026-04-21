# Deck of Mandate

Single-player, turn-based strategy card game about governance under pressure. The player manages **Treasury / Funding / Power / Legitimacy**, resolves procedural + scripted events, and races chapter objectives before mandate collapse.

[**Play Online**](https://loolos.github.io/DeckOfMandate)

## Current implementation snapshot (code-aligned)

- **Tech**: React 18 + TypeScript + Vite 8, fully client-side, no backend/database/API.
- **State**: centralized reducer state + deterministic RNG (`runSeed`) for reproducible runs.
- **Content model**: typed card/event/status templates under `src/data/*`.
- **Modes**:
  - Chapter 1: **The Rising Sun** (`firstMandate`, 1661–1675, 15 turns)
  - Chapter 2: **Long Shadows at Noon** (`secondMandate`, 1676–1700, 25 turns)
- **Localization**: English / 中文 / Français.

## Run locally

```bash
npm install --legacy-peer-deps
npm run dev
npm test
npm run build
```

## Documentation

| Document | Scope |
| --- | --- |
| [docs/gameplay.md](docs/gameplay.md) | Rules reference: resources, turn order, win/lose checks, draw scaling, statuses |
| [docs/card.md](docs/card.md) | Card catalog, tags, inflation, limited-use lifecycle |
| [docs/太阳王战役.md](docs/太阳王战役.md) | Chinese full campaign reference (Chapter 1 + Chapter 2) |
| [docs/design.md](docs/design.md) | Architecture, state model, data flow, testing strategy |

## Notes

- There is no lint script in this repo; quality checks are primarily `npm test` and `npm run build`.
- `npm install` may require `--legacy-peer-deps` due to Vite/plugin peer resolution in some environments.

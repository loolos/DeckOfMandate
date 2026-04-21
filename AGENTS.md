# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Deck of Mandate is a fully client-side, single-player, turn-based strategy card game (React + TypeScript + Vite). There is no backend, database, or external API — all state lives in-memory and optionally in browser LocalStorage.

Playable **levels** load via `src/levels/registerAll.ts`, which discovers `src/levels/<campaignId>/registerCampaign.ts` (one file per campaign folder). Each campaign’s `registerCampaign.ts` merges chapter modules from that folder (e.g. `sunking/chapters/*.ts`). **Template-related TypeScript types** (`CardTemplateId`, events, effects, tags, statuses) live in `src/levels/types/`. Sun King **card/event/status template data** lives under `src/levels/sunking/templates/` (re-exported from `src/data/`). Campaign i18n is merged from `src/levels/sunking/` (e.g. `sunkingLocales.ts`, `locales/*`). Vitest preloads the same registration through `src/test/setupLevels.ts`.

### Running the app

Standard npm scripts are defined in `package.json`:

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server (hot-reload) on port 5173 |
| `npm test` | Run Vitest unit tests |
| `npm run build` | Type-check (`tsc --noEmit`) then production bundle |
| `npm run preview` | Preview the production build locally |

### Non-obvious caveats

- **Peer dependency conflict**: `npm install` may fail with an `ERESOLVE` error due to `@vitejs/plugin-react` peer dependency on vite. Use `npm install --legacy-peer-deps` to work around this.
- **Deprecation warnings**: Vite 8 emits warnings about `esbuild` option and `optimizeDeps.rollupOptions` being deprecated. These are cosmetic and do not affect functionality.
- **No lint script**: There is no dedicated ESLint configuration or `npm run lint` script. Type-checking is done via `tsc --noEmit` (included in the `build` script).
- **Node.js version**: CI uses Node 22. The VM already has Node 22 available.
- **Dev server host binding**: To access from outside the container, use `npm run dev -- --host 0.0.0.0`.

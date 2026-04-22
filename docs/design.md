# Deck of Mandate — Technical Design (Current)

## 1. Product scope

- Browser-only, single-player strategy card game.
- No backend, no server authority, no external gameplay API.
- All game logic is deterministic in-client from serialized state + RNG seed.

## 2. Stack

- **Runtime/UI**: React 18
- **Language**: TypeScript
- **Build/dev**: Vite 8
- **Tests**: Vitest

## 3. Code organization

- `src/app/`: reducer, initialization, main game composition; `levelTransitions.ts` re-exports chapter-2/3 transition builders from the campaign pack (`campaignChapterTransitions`).
- `src/data/`: **level registry** (`levelRegistry.ts`, `levelTypes.ts`) and thin re-exports (`levels.ts`, `levelContent.ts`, `cards.ts`, `events.ts`, `statusTemplates.ts` → Sun King pack); playable levels are registered at startup, not hardcoded here. Each `LevelDef` carries calendar pacing (`yearsPerTurn`), win/victory rules, turn-limit rule, and optional UI keys for goals / turn counter / time-step hint.
- `src/levels/`: **campaign packs** plus **template type shapes** (`levels/types/` — `CardTemplateId`, `EventTemplateId`, `Effect`, tags, status templates; current unions match the Sun King data). Each top-level subdirectory `<campaignId>/` ships `registerCampaign.ts`; `registerAll.ts` uses `import.meta.glob("./*/registerCampaign.ts")` so new campaigns are picked up without editing `main.tsx`. Chapters are discovered within a campaign (e.g. Sun King `sunking/chapters/*.ts`). The Sun King campaign lives under `src/levels/sunking/` (chapter-2 transition, **card/event/status template data** under `templates/`, and merged locale fragments under `locales/`).
- `src/logic/`: pure-ish gameplay operations (draw, effects, event resolution, scripted calendar, scaling).
- `src/components/`: presentational + interaction components.
- `src/locales/`: framework UI strings (`*.core.ts`) plus merged bundles (`en.ts` / `fr.ts` / `zh.ts`) that spread campaign copy from `src/levels/sunking/sunkingLocales.ts` (which composes `locales/firstMandate.*`, `secondMandate.*`, and `coreGameContent.*` inside the sunking folder).
- `src/types/`: **runtime** domain types only (`game.ts` — `GameState`, `ActionLogEntry`, resources, phase, etc.); it imports template ids from `src/levels/types/`.

## 4. State architecture

Core state lives in `GameState` and includes:

- resources, phase, turn/outcome
- deck/hand/discard + card instance registry
- per-instance inflation and limited-use trackers
- event slots + pending transforms
- status list
- chapter flags (`warOfDevolutionAttacked`, `europeAlert`, `europeAlertProgress`, `nymwegenSettlementAchieved`)
- deterministic RNG internal state
- procedural event sequence queue
- append-only action log

Reducer entrypoint: `src/app/gameReducer.ts`.

## 5. Determinism strategy

- PRNG state is persisted in save state.
- Random consumers (draw shuffles, event picks, branch rolls) all derive from that PRNG.
- Procedural events use a persistent weighted sequence queue to stabilize long-run frequency and reproducibility.

## 6. Content architecture

### Templates (static)

- Cards / events / statuses (Sun King): `src/levels/sunking/templates/` — `src/data/cards.ts`, `events.ts`, `statusTemplates.ts` re-export for stable imports.
- Level definitions & per-level wiring: registered via `src/data/levelRegistry.ts` from campaign modules under `src/levels/**` (see `levels.ts` / `levelContent.ts` for re-exports).

### Level registration & i18n

- **Registry**: `registerLevel(def, content)` adds a level; `getDefaultLevelId()` / `getRegisteredLevelIds()` drive menus. Removing a campaign folder (and its `registerCampaign.ts`) leaves the engine running with whatever levels remain.
- **Chapter 2 bootstrap**: `registerChapter2StandaloneFactory(levelId, factory)` connects “standalone chapter 2” menu flows to a draft builder (`levelBootstrap.ts`).
- **Locales**: Framework strings live in `en.core.ts` / `fr.core.ts` / `zh.core.ts` (no longer holding `card.*` / `event.*` / `status.*` template copy for the current campaign). Sun King text — level intros, scripted events, and those template keys — lives under `src/levels/sunking/locales/` and is merged via `sunkingLocales.ts` into `en.ts` / `fr.ts` / `zh.ts`. Each `LevelDef` lists `supportedLocales`; the start menu shows `ui.levelLocaleFallback` when the UI language is not listed for the selected level.

### Runtime composition

Templates are immutable references. Runtime uses **instances** (cards/events/statuses) with IDs and mutable fields (resolved flags, remaining turns, inflation stack per card instance, remaining uses, etc.).

## 7. Chapter mechanics hooks

- Scripted calendar windows and overflow slots.
- Escalation transforms (`powerVacuum` to `majorCrisis`).
- Branch persistence into chapter 2 (war branch -> Europe Alert).
- Europe Alert yearly base drift at begin-year (`k = x - 12 - y*3`) and progress-gated supplemental event injection.
- Additional chapter-2 win gates.

## 8. Persistence

- Save/load support is local-state oriented (`src/logic/saveLoad.ts`).
- State normalization helpers tolerate schema evolution by rebuilding derived/optional fields when needed.

## 9. Testing strategy

Vitest loads `src/test/setupLevels.ts` first so `src/levels/registerAll.ts` runs before tests that need registered levels.

Current automated coverage includes:

- draw system and scaling
- RNG behavior
- event resolution and scripted calendar timing
- chapter-2 balance and transition constraints
- inflation and card-runtime edge cases
- turn-flow and reducer behaviors
- run codes (v2 wire format with UTF-8 level ids; v1 legacy decode still supported)

Run with:

```bash
npm test
npm run build
```

## 10. Non-goals (current codebase)

- multiplayer / PvP
- backend persistence
- server-authoritative anti-cheat model
- real-time combat or physics systems

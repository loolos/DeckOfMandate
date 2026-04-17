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

- `src/app/`: reducer, initialization, chapter transition builders, main game composition.
- `src/data/`: declarative card/event/status/level templates and chapter content tables.
- `src/logic/`: pure-ish gameplay operations (draw, effects, event resolution, scripted calendar, scaling).
- `src/components/`: presentational + interaction components.
- `src/locales/`: i18n bundles by language and chapter namespace.
- `src/types/`: domain models for cards, events, effects, statuses, game state.

## 4. State architecture

Core state lives in `GameState` and includes:

- resources, phase, turn/outcome
- deck/hand/discard + card instance registry
- per-instance inflation and limited-use trackers
- event slots + pending transforms
- status list
- chapter flags (`warOfDevolutionAttacked`, `europeAlert`, `nymwegenSettlementAchieved`)
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

- Cards: `src/data/cards.ts`
- Events: `src/data/events.ts`
- Statuses: `src/data/statusTemplates.ts`
- Level defs: `src/data/levels.ts`
- Level content wiring: `src/data/levelContent.ts`

### Runtime composition

Templates are immutable references. Runtime uses **instances** (cards/events/statuses) with IDs and mutable fields (resolved flags, remaining turns, inflation stack per card instance, remaining uses, etc.).

## 7. Chapter mechanics hooks

- Scripted calendar windows and overflow slots.
- Escalation transforms (`powerVacuum` to `majorCrisis`).
- Branch persistence into chapter 2 (war branch -> Europe Alert).
- Additional chapter-2 win gates.

## 8. Persistence

- Save/load support is local-state oriented (`src/logic/saveLoad.ts`).
- State normalization helpers tolerate schema evolution by rebuilding derived/optional fields when needed.

## 9. Testing strategy

Current automated coverage includes:

- draw system and scaling
- RNG behavior
- event resolution and scripted calendar timing
- chapter-2 balance and transition constraints
- inflation and card-runtime edge cases
- turn-flow and reducer behaviors

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


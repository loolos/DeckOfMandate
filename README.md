# Deck of Mandate

Single-player, turn-based strategy card game about governance, crisis management, and political growth: manage resources, respond to events, and strengthen the regime before legitimacy collapses.
[**Play Online**](https://loolos.github.io/DeckOfMandate)

## Language policy (project)

**Source and repo conventions** stay in **English**:

- **Source code** identifiers, file names, and structure
- **Comments** and inline documentation in the codebase
- **Commit messages** and technical change descriptions
- **Authoritative design and rules text** under `docs/` (English)

**Player-facing UI copy** is **localized**: the shipped app supports **English** and **Chinese** for all user-visible strings (labels, card text, event text, onboarding or rules summaries shown in the UI). Copy is **not** hard-coded in components; it lives in **central locale bundles** (see [docs/design.md](docs/design.md) — **Localization**). The player can **switch language at any time** from an in-game control; the chosen locale should be **remembered** (for example LocalStorage).

Informal design discussion may use other languages if your team prefers.

## Documentation

| Document | Description |
| --- | --- |
| [docs/design.md](docs/design.md) | Tech stack, architecture, prototype scope |
| [docs/gameplay.md](docs/gameplay.md) | Core loop, resources (Treasury stat vs funding), turn flow, win/lose |
| [docs/card.md](docs/card.md) | Starter deck (prototype) |
| [docs/levels.md](docs/levels.md) | Level 1 — *The Rising Sun* (Louis XIV, 1661–1675 campaign calendar), events, pacing |
| [docs/RisingSun.md](docs/RisingSun.md) | Theme notes, bilingual event/card tables, War of Devolution background |

## Intended tech stack (MVP)

React, TypeScript, Vite, CSS Modules, central `useReducer` game state, **typed discriminated-union effects in content data**, **seeded RNG (`runSeed`) aligned with saves**, optional LocalStorage persistence, static hosting (for example GitHub Pages). See [docs/design.md](docs/design.md) for detail.

## Status

Design docs and rules are in place. A playable **MVP web client** (Vite + React + TypeScript) lives under `src/` — run `npm install`, `npm run dev`, `npm test`, and `npm run build` as needed.

**MVP app shell:** opening the app shows a **start menu** (new run with optional seed, level choice, resume save). After starting, the run auto-saves to LocalStorage; see [docs/design.md](docs/design.md) (**MVP product shell**).

**Player-facing copy:** strings are localized (**English** / **Chinese**). Shared UI text lives in [`src/locales/en.core.ts`](src/locales/en.core.ts) / [`zh.core.ts`](src/locales/zh.core.ts); level *firstMandate* narrative (intro, endings, War of Devolution, anti-coalition logs) lives under [`src/locales/levels/firstMandate/`](src/locales/levels/firstMandate/).

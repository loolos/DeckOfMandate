# Deck of Mandate

Single-player, turn-based strategy card game about governance, crisis management, and political growth: manage resources, respond to events, and strengthen the regime before legitimacy collapses.

## Language policy (project)

All **implementation-facing** work is in **English**, including:

- In-game **UI copy**
- **Source code** identifiers, file names, and structure
- **Comments** and inline documentation in the codebase
- **Commit messages** and technical change descriptions
- **Design and rules text** that ships with or is maintained for the build (aligned with the English docs under `docs/`)

Informal design discussion may use other languages if your team prefers; the shipped product and repository conventions above stay English.

## Documentation

| Document | Description |
| --- | --- |
| [docs/design.md](docs/design.md) | Tech stack, architecture, prototype scope |
| [docs/gameplay.md](docs/gameplay.md) | Core loop, resources (Treasury stat vs funding), turn flow, win/lose |
| [docs/card.md](docs/card.md) | Starter deck (prototype) |
| [docs/levels.md](docs/levels.md) | Level 1 — *The First Mandate*, events, pacing |

## Intended tech stack (MVP)

React, TypeScript, Vite, CSS Modules, central `useReducer` game state, **typed discriminated-union effects in content data**, **seeded RNG (`runSeed`) aligned with saves**, optional LocalStorage persistence, static hosting (for example GitHub Pages). See [docs/design.md](docs/design.md) for detail.

## Status

Design docs and rules are in place; application code is not included in this repository yet.

**MVP app shell:** first build can **start a run on load** (no main menu required); see [docs/design.md](docs/design.md) (**MVP product shell**).

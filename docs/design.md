# Deck of Mandate / Deck of Power

## Recommended Tech Stack (Web-based Single Player Static Game)

## Project Goal

Build a browser-based, single-player strategy card game with:

- No multiplayer
- No backend required
- Static deployment
- Fast iteration speed
- Easy content expansion
- Clean UI for cards, events, resources, and turn-based gameplay

This is primarily a **state-driven strategy game**, not a physics-heavy action game.

---

## Core Recommendation

Use:

- **React**
- **TypeScript**
- **Vite**
- **CSS Modules**
- **LocalStorage**
- **GitHub Pages** (or Netlify)

This stack is lightweight, modern, and ideal for a static browser game.

---

## Tech Stack Details

### 1. Frontend Framework — React

Use React for UI rendering and component structure.

**Why:**

- Excellent for card UI
- Easy to build reusable components
- Great for turn-based state updates
- Fast iteration for prototypes

**Examples of components:**

- Card
- Event Panel
- Hand Area
- Resource Bar
- **Campaign date banner** (granularity from level data: *The Rising Sun* is **year-only** because **1 turn = 1 year**; a **monthly** cadence level would show **year + month**—see `gameplay.md` / `levels.md`)
- Turn Button
- Game Over Screen
- **Language toggle** (switch `en` / `zh`; see **Localization**)

---

### 2. Language — TypeScript

Use TypeScript instead of plain JavaScript.

**Why:**

- Strong typing for game systems
- Easier scaling when game grows
- Safer refactoring
- Better editor autocomplete

**Examples:**

```ts
type Card = { /* ... */ };
type Event = { /* ... */ };
type GameState = { /* ... */ };
type ResourceState = { treasuryStat: number; funding: number; power: number; legitimacy: number };
type Action = { /* ... */ };
```

---

### 3. Build Tool — Vite

Use Vite as the dev server and bundler.

**Why:**

- Extremely fast startup
- Fast hot reload
- Simple static build
- Better modern default than CRA

**Commands:**

```bash
npm create vite@latest
npm install
npm run dev
npm run build
```

---

### 4. Styling — CSS Modules

Recommended for first version.

**Why:**

- Simple
- Scoped styles
- No dependency bloat
- Easy maintenance

**Alternative:**

- Tailwind CSS (optional)

Do **not** overengineer styling early.

---

### 5. State Management — React useReducer

Use one central reducer for all game logic.

**Recommended pattern:**

```ts
const [state, dispatch] = useReducer(gameReducer, initialState);
```

**Why:**

- Perfect for turn-based logic
- Predictable updates
- Easy debugging
- No Redux needed initially

---

### 6. Persistence — LocalStorage

Use browser LocalStorage for:

- Save game
- Continue run
- Settings
- Unlock progress

No backend needed. Saves must carry **`runSeed` and RNG stream progress** together with the rest of `GameState` so random outcomes stay consistent after reload (see **Randomness and persistence** under **Core Architecture**).

**Example:**

```ts
localStorage.setItem("save", JSON.stringify(state));
```

---

### 7. Deployment — GitHub Pages

Best free option for static site deployment.

**Alternatives:**

- Netlify
- Vercel (static mode)

**Deploy flow:**

```bash
npm run build
```

Upload `dist/`.

---

## Recommended Project Structure

```text
deck-of-mandate/
  src/
    app/
      Game.tsx
      gameReducer.ts
      initialState.ts

    components/
      Card.tsx
      EventCard.tsx
      Hand.tsx
      ResourceBar.tsx
      EndTurnButton.tsx
      Modal.tsx

    data/
      cards.ts
      events.ts
      levels.ts
      levelContent.ts

    logic/
      rng.ts
      draw.ts
      resolveCard.ts
      resolveEvents.ts
      turnFlow.ts
      scriptedCalendar.ts
      saveLoad.ts

    types/
      card.ts
      event.ts
      game.ts

    locales/
      index.tsx
      en.ts
      zh.ts
      en.core.ts
      zh.core.ts
      levels/
        firstMandate/
          en.ts
          zh.ts

    styles/
      Card.module.css
      Game.module.css

    main.tsx
```

---

## Core Architecture

### Separate content from logic

#### Data layer

Cards / events / levels are stored as JSON-like objects in `data/*.ts`, but **effects are not free-form strings**. Each effect is a **typed discriminated union** (a `kind` field plus payload) so the rules engine can exhaustively handle every case.

**Level-driven lists:** [`src/data/levelContent.ts`](src/data/levelContent.ts) holds per-`levelId` **starter deck order**, **event roll pool**, **escalation rules** (slot transforms and year-end “schedule next crisis” hooks), and **`scriptedCalendarEvents`** (calendar inject / scripted military / anti-coalition tuning). The engine reads `GameState.levelId` and `getLevelContent(levelId)` in `initialState.ts`, `turnFlow.ts` (weighted rolls, scripted phase, scheduled slot transforms), and `resolveEvents.ts` (escalation schedulers). Shared **templates** (card/event ids and locale keys) remain in `cards.ts` / `events.ts`; **scripted balance** for a row is authored in `levelContent` for that level.

**Example (TypeScript shape, not a string DSL):**

```ts
type Effect =
  | { kind: "modResource"; resource: "power" | "legitimacy" | "treasuryStat"; delta: number }
  | { kind: "gainFunding"; amount: number }
  | { kind: "drawCards"; count: number };

const reformCard = {
  id: "reform",
  cost: 2,
  effects: [
    { kind: "modResource", resource: "power", delta: 1 },
    { kind: "drawCards", count: 1 },
  ],
};
```

`cost` is paid in **funding** (spendable this turn), not by reducing **Treasury stat**.

#### Logic layer

Rules engine handles:

- Draw cards (using the shared RNG; see **Randomness and persistence** below), including optional **anti-coalition** draw adjustment at **beginYear**
- Spend **funding** (and adjust **Treasury stat** when effects say so)
- Interpret and apply **typed** card/event effects (`resolveCard.ts`, `resolveEvents.ts`, and related helpers)
- **Scripted calendar** inject / expiry and **scripted military** resolution (`scriptedCalendar.ts`, `gameReducer`)
- Resolve event penalties
- Turn transitions
- Victory check

#### UI layer

React components only display state.

### Localization (MVP)

The prototype supports **two player-facing languages**: **English (`en`)** and **Chinese (`zh`)**.

**Requirements:**

- **Single source of truth for display text:** all strings the player reads (chrome labels, buttons, phase hints, **card names and descriptions**, **event titles and descriptions**, solve-button labels, win/lose copy, retention instructions, and any short **mechanism help** text shown in the UI) live in **locale modules**, not scattered as literals inside components.
- **Stable keys:** content data (`data/cards.ts`, `data/events.ts`, and similar) should reference **message keys** (for example `titleKey: "card.funding.name"`) or equivalent typed keys. Components resolve text with **`t(key)`** (or a small hook) for the **active locale**.
- **Runtime switch:** the game exposes a **always-visible or easy-to-reach control** (for example a header **Language** / **语言** toggle) to switch between `en` and `zh` **without restarting** the app.
- **Persistence:** store the selected locale in **LocalStorage** (separate from run save is fine) so the choice survives reload.
- **Implementation shape:** [`src/locales/en.core.ts`](../src/locales/en.core.ts) / [`zh.core.ts`](../src/locales/zh.core.ts) hold **shared** UI strings; [`src/locales/levels/firstMandate/`](../src/locales/levels/firstMandate/) holds **level-scoped** copy (intro, endings, War of Devolution, coalition logs). [`src/locales/en.ts`](../src/locales/en.ts) and [`zh.ts`](../src/locales/zh.ts) **merge** core + level bundles and export `MessageKey`. [`src/locales/index.tsx`](../src/locales/index.tsx) provides `{ locale, setLocale, t }`.
- **What stays English:** **identifiers** in code (`cardId`, effect kinds), file paths, commit messages, and the canonical **`docs/`** rules remain English. Only **player-visible** strings are translated in locale files.

### Content effects (typed)

- Define effect unions in `types/` (for example `effect.ts` or alongside `card.ts` / `event.ts`).
- Card and event definitions in `data/` hold **`effects` as an array of effect objects** (or a single object where one effect is enough).
- **`resolveCard` / `resolveEvents` / `turnFlow`** branch on `kind` and apply state updates; avoid parsing ad-hoc strings so refactors stay safe as content grows.

### Randomness and persistence

- **Seeded runs:** each run has a **`runSeed`** (for example a 32-bit integer) created when a new game starts. **Game state** stores `runSeed` plus whatever the implementation needs to **resume the same pseudo-random stream** after a save (for example a small **RNG cursor** or equivalent—pick one approach in `saveLoad.ts` and keep it stable across versions where possible).
- **Single PRNG module:** put a **fixed-algorithm** PRNG in `logic/rng.ts`. All shuffles, weighted event picks, and other random draws go through it so behavior is **testable** and **reproducible** for the same seed and player action sequence.
- **LocalStorage:** when persistence is enabled, serialized saves should include **full `GameState`** (including `runSeed` and RNG progress fields) so mid-run reloads do not desync random outcomes.

---

## Minimum playable prototype scope

Build first version with:

### Resources

- **Treasury stat** (persistent fiscal capacity; drives per-turn income)
- **Funding** (spendable **this turn**; pays card costs and most event spends — see `gameplay.md`)
- Power
- Legitimacy

### Systems

- Draw cards each turn (**Power** at **Draw phase** start; optional **Anti-French coalition** hazard after scripted war choice; **hand cap 10**; extra draws **skipped** if full—see `gameplay.md`)
- **Event phase:** weighted fills on procedural slots **`A`–`C`**, plus **scripted calendar** hooks and variable **1–3** fills when the full board is empty (see `levels.md`)
- Play cards to solve events; **resolved** slots cannot be targeted again that turn
- End turn discard; **player chooses** which cards to **retain** (up to **Legitimacy**)

### MVP product shell

- **Start menu:** new run (optional seed, level id), resume save, locale toggle, optional level-entry tutorial flag.
- **Persistence:** **LocalStorage** auto-save during a run (and resume path from the menu).
- **Localization:** player-facing copy in **English and Chinese** from **central locale bundles**; in-game **language switch** and **remembered locale** (see **Localization** above).

### Content

- Starter deck: **13** cards across **5** card templates (counts in `levelContent.starterDeckTemplateOrder`—see `levels.md` / `card.md`)
- Weighted **event** pool plus **scripted** War of Devolution row (*firstMandate*)
- 1 playable level (`firstMandate`)

### Win / lose conditions

Authoritative **win / lose rules, ordering, and level 1 targets** are in [gameplay.md](gameplay.md) (not duplicated here). This section only scopes the prototype; implement checks in the logic layer from that document.

---

## What not to use initially

### Do not use a backend

No server needed.

### Do not use Phaser yet

Phaser is useful later if adding:

- Animations
- Board movement
- Drag effects
- Richer game feel

But not needed now.

### Do not use Redux

Too heavy for prototype.

### Do not use a database

LocalStorage is enough.

---

## Future upgrade path

If prototype succeeds:

### Phase 2

Add:

- Animations
- Sound
- Save slots
- More cards
- More levels

### Phase 3

Hybrid stack:

- React for UI
- Phaser for battlefield/card animations

### Phase 4

Optional backend:

- Cloud saves
- Achievements
- Analytics

---

## Final recommendation summary

Use this stack:

- React
- TypeScript
- Vite
- CSS Modules
- `useReducer`
- Typed content effects (discriminated unions) + `logic/rng.ts` (**runSeed**, reproducible draws)
- LocalStorage
- GitHub Pages

This is the fastest and safest path to build a polished browser prototype.

---

## Development priority

1. Core game loop
2. Card interactions
3. Event pressure system
4. UI clarity
5. Balance tuning
6. Theme/art later

Build gameplay first.

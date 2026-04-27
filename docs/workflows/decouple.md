# Workflow: campaign decoupling & unified level entry

> **Purpose:** Keep the **engine** (`src/app`, generic `src/logic` scheduling) independent of **Sun King** (or any other campaign) rules, data, and tests—while maintaining a **single, predictable path** for registering levels, hooks, and campaign-specific logic.

---

## 0. Goals

1. **Decoupling:** No hard-coded Sun King template ids, chapter rules, or level ids inside generic engine modules unless they are pure dispatch (and even then, prefer campaign-provided predicates or moved functions).
2. **Unified level entry:** All playable levels and campaign wiring are discovered through one registration pattern; the app and tests never assume a specific campaign except via explicit imports or preloaded registration.

---

## 1. Authoritative entry points (read this first)

| Concern | Where it lives | Notes |
|--------|----------------|--------|
| Discover campaigns | `src/levels/registerAll.ts` | `import.meta.glob("./*/registerCampaign.ts", { eager: true })` — add a folder + `registerCampaign.ts` to participate. |
| Per-campaign bootstrap | `src/levels/<campaignId>/registerCampaign.ts` | Should call `registerLevel` / `setDefaultLevelId`, optional `registerCampaignReducerBridge`, `registerSunkingInitialStateHooks`-style hooks, chapter-2 factories, etc. |
| Level defs & content | `src/data/levelRegistry.ts` | `registerLevel(def, content)` — **only** path that makes a `LevelId` valid at runtime. |
| Default menu level | `setDefaultLevelId` from campaign registration | Falls back to first registered id if unset (`getDefaultLevelId`). |
| Campaign logic façade | `src/levels/campaignLogicBundle.ts` | Single merge point re-exporting implementations from `src/levels/sunking/logic/*` (extend with more campaigns later). |
| Tests preload levels | `src/test/setupLevels.ts` | Must mirror production registration so Vitest sees the same `LevelId` universe. |

**Rule of thumb:** If code needs “which campaign am I?”, prefer `state.levelId` + `getLevelDef` / content hooks, or a **registered bridge**, not string literals scattered in the engine.

---

## 2. What belongs where

### Engine (keep generic)

- `src/app/gameReducer.ts`: Turn flow, retention, generic action shapes, dispatch to **registered** campaign bridges and **imported** campaign fund-solve helpers where the whole feature is campaign-owned.
- `src/logic/*` files that contain **algorithms** with no template ids (e.g. draw scaling, RNG helpers).
- `src/levels/types/*`: Shared template id **types** (not data).

### Campaign pack (Sun King today: `src/levels/sunking/`)

- Template data, locales, chapter modules, balance tests tied to content.
- **Campaign-specific reducer slices:** `logic/campaignReducerBridgeImpl.ts` (Nantes picks, chapter-3 picks, …).
- **Campaign-specific event/card resolution:** e.g. `logic/fundSolve.ts`, `logic/playCardExtras.ts`, `logic/playedCardTemplatePolicy.ts`, `logic/applyEffectsSuccessionGate.ts`.
- **Content-heavy tests:** `src/levels/sunking/logic/*.test.ts` (prefer this over `src/logic` for assertions that name real levels or event ids).

### Thin façades (`src/logic` + `src/levels/campaign*.ts` re-exports)

Some `src/logic/*.ts` files **only** re-export from `campaignLogicBundle` so the rest of the app keeps stable import paths. That is intentional; see `AGENTS.md`. Do not duplicate implementation there.

Likewise, several `src/levels/campaign*.ts` files are campaign façades (`campaignTurnFlow.ts`, `campaignCardRuntime.ts`, `campaignAiStrategySimulation.ts`, `campaignCardCost.ts`, `campaignCardTags.ts`, `campaignCardUsage.ts`, `campaignQuickOutcomeFrame.ts`, `eventTemplateApi.ts`, `campaignCardArt.ts`). They should remain pure dispatch/re-export surfaces, not where campaign rules are re-implemented.

---

## 3. When you add or change a level

Work through this checklist in order:

1. **Chapter module** under `src/levels/<campaign>/chapters/*.ts` exports `levelDef` + `levelContent` (and optional `registerAsDefaultLevel` / `chapter2StandaloneFactory`).
2. **Registration:** Campaign `registerCampaign.ts` merges globbed chapters and calls `registerLevel` for each.
3. **Initial state:** If the level needs non-generic setup, use `levelInitialStateRegistry` + campaign hooks (pattern: `sunkingInitialStateHooks.ts`).
4. **Reducer / effects:** If the level introduces new player actions or special event resolution, extend the **campaign reducer bridge** or move logic into `src/levels/<campaign>/logic/*` and export via `campaignLogicBundle.ts`.
5. **Tests:** Add or move specs next to the campaign; keep `src/logic/*.test.ts` to **smoke** façade / wire format only when needed.
6. **Docs:** Update gameplay / design docs if player-visible rules change (separate workflow: `checkdoc.md`).

---

## 4. Decoupling patterns (prefer these refactors)

| Smell | Preferred direction |
|-------|------------------------|
| Named `EventTemplateId` / `CardTemplateId` branches in `gameReducer` | Move body to `src/levels/<campaign>/logic/*.ts`, call from reducer via bundle export or bridge. |
| Nantes / Utrecht-style **pick actions** | Handle in `tryCampaignReducerBridge` (or equivalent) with level-id guard set owned by the campaign. |
| `applyEffects` importing chapter constants | Replace with a bundle predicate, e.g. `shouldBlockModSuccessionTrackWhenWarEnded(state)`. |
| `resolveCard` short-circuiting specific templates | `shouldDeferPlayedCardEffectApplication` (or similar) from the bundle. |
| `src/logic` tests asserting Sun King ids | Move to `src/levels/sunking/logic/*.test.ts`; leave a one-case smoke in `src/logic` if the façade path must stay covered. |
| Legacy **run code v1** level-bit mapping | No silent fallback to hard-coded level ids; fail decode if the registry does not expose two compatible bootstrap levels. |
| `src/app/Game.tsx` importing `src/levels/sunking/*` directly | Move to campaign metadata / façade APIs (e.g. campaign shell resolver, backdrop resolver) so app shell does not hard-code one campaign. |
| `isSunkingLevelId` checks in app UI flow | Prefer generic “campaign capabilities by levelId” lookup instead of campaign-name checks in app components. |
| `src/levels/load/content.ts` type narrowed to one campaign (`sunkingLocales`) | Keep merge path campaign-agnostic; avoid type coupling that blocks adding a second campaign pack. |
| i18n fallback copy mentions “level-specific” behavior but loader assumptions differ | Verify `src/locales/*.core.ts` fallback messaging and actual merged campaign locale loading stay consistent. |

---

## 5. Run before merge

```bash
npm test
npm run build
```

Ensure `src/test/setupLevels.ts` still loads every campaign that production loads.

Additional must-check files during decouple review:

- `src/app/Game.tsx` (campaign shell / backdrop / campaign-id checks).
- `src/levels/sunking/sunkingLevelIds.ts` (campaign id grouping exposed to app).
- `src/levels/load/content.ts` (cross-campaign content merge and typing).
- `src/logic/runCode.ts` (legacy level mapping compatibility behavior).
- `src/levels/campaign*.ts` façades + `src/logic/*.ts` façades (re-export only; no duplicated rules).

---

## 6. How to invoke this workflow in chat

This file is **`docs/workflows/decouple.md`** (short name: **decouple**).

Examples:

> “Run decouple review on this PR.”  
> “decouple: new chapter module + bridge hook.”

Scope hints (optional):

- `--scope=entry` — registration, default level, setupLevels only.  
- `--scope=reducer` — `gameReducer` + bridges + fund solve.  
- `--scope=logic-facades` — `src/logic/*.ts` and `src/levels/campaign*.ts` re-exports vs bundle/pack implementations.  
- `--scope=ui-shell` — app UI campaign assumptions (`Game.tsx`, campaign backdrop/shell branches, level-id campaign checks).  
- `--scope=load-i18n` — `levels/load/content.ts` merge path + locale fallback messaging consistency.  
- `--scope=tests` — test file locations and campaign binding.  
- `--scope=all` — full checklist above.

---

## 7. Related references

- `AGENTS.md` — product overview, façade note, npm scripts.  
- `src/levels/campaignLogicBundle.ts` — merged campaign API surface.  
- Plan inventory (local): “解耦剩余项盘点” — remaining coupling ideas; **do not** treat the plan file as something to edit during implementation unless the user asks.

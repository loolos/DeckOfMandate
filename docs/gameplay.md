# Deck of Mandate — Gameplay Rules (Code-Aligned)

This document reflects current runtime behavior in `src/app/*`, `src/logic/*`, and `src/data/*`.

## 1. Core resources

- **Treasury stat**: persistent economic strength.
- **Funding**: spendable money this turn only; cleared at year-end.
- **Power**: governs draw attempts via threshold scaling, and chapter objectives.
- **Legitimacy**: political stability, retention capacity baseline, and hard fail resource.

### Starting values (from `src/data/levels.ts`)

| Mode | Treasury | Funding | Power | Legitimacy |
| --- | ---: | ---: | ---: | ---: |
| Chapter 1 (`firstMandate`) | 2 | 0 | 2 | 2 |
| Chapter 1 standalone | 2 | 0 | 2 | 2 |
| Chapter 2 (`secondMandate`, continuity carry-in) | 3 | 0 | 3 | 3 |
| Chapter 2 standalone | 7 | 0 | 7 | 5 |

Continuity-mode Chapter 2 in practice carries the Chapter 1 final resources rather than these baseline `3 / 3 / 3` numbers (the baseline only matters when carry-over is missing); see §8 for the `warOfDevolutionAttacked` `legitimacy +1` bump.

At begin-year:

```text
funding += max(0, treasuryStat - localWarIncomePenalty)
```

`localWarIncomePenalty` is `2` while an unresolved `localWar` event remains on the board (Chapter 2), otherwise `0`. The transferred amount is clamped at `0`.

## 2. Turn pipeline (beginYear + action + retention)

Each turn is one year in both current chapters.

1. **Begin-year status effects**: `beginYearResourceDelta` statuses apply first (e.g. temporary legitimacy boost).
2. **Europe Alert base drift (Chapter 2 only, if active)**:
   - Let `x = treasuryStat + power + legitimacy`, `y = europeAlertProgress`, `k = x - 12 - y*3`.
   - If `k > 0`, progress increases by 1 with probability `min(100%, k*10%)`.
   - If `k < 0`, progress decreases by 1 with probability `min(100%, (-k)*10%)`.
   - Drift result is logged when it actually changes.
3. **Income**: add funding from current treasury stat.
4. **Draw attempts calculation**:
   - base = `drawAttemptsFromPower(power)` (threshold ladder)
   - plus `nextTurnDrawModifier`
   - plus first queued `scheduledDrawModifiers[0]` (then queue shifts)
   - plus sum of active `drawAttemptsDelta` statuses
   - plus possible anti-coalition yearly roll adjustment
   - final attempts clamped to at least 1
5. **Draw resolution**:
   - draw attempts run with hand cap 12
   - overflow draws are discarded and logged
   - if deck empties, refill from discard (shuffle) and continue
   - on deck refill, inflation stacks may increase for qualifying instances. Activation differs by chapter: **Chapter 2 always** applies inflation; **Chapter 1 only** activates once `treasuryStat + power + legitimacy >= 12`. Until activation in Chapter 1, the `inflation` tag is hidden on `reform` / `ceremony` / `development` and refills do not stack.
6. **Status tick-down**: most timed statuses decrement after draw; long-lived branch statuses do not auto-tick.
7. **Event phase**:
   - apply scheduled slot transforms (e.g. `powerVacuum -> majorCrisis`)
   - clear resolved events from slots
   - inject scripted calendar rows for this year
   - fill empty procedural slots (`A–C`) from deterministic weighted sequence
   - optional extra injections (Europe Alert pool, religious tension, anti-French-sentiment extras)
8. **Action phase**:
   - play cards, solve events by funding, crackdowns, scripted attacks, policy choices
9. **End-year click → pre-retention checks**:
   - unspent funding is cleared first
   - victory is evaluated **before** the retention UI; if it triggers here the run ends without showing retention
   - if hand size <= retention capacity, the retention UI is skipped and the year completes directly
10. **Retention phase (only if needed)**:
   - player chooses cards to keep (up to retention capacity)
   - unkept hand cards discard
11. **End-of-year penalties**: unresolved harmful events strike in slot order; `antiFrenchContainment` injection (if active) happens here, after retention but before penalties.
12. **Outcome checks**:
   - immediate fail if `legitimacy <= 0`, `treasuryStat <= 0`, or `power <= 0` at any enforced point
   - then victory check
   - then time defeat on last turn if not victorious
   - otherwise `turn + 1` and repeat

## 3. Draw scaling (Power -> base draw attempts)

Current threshold progression:

- Power `1` => 1 attempt
- Power `2-3` => 2 attempts
- Power `4-6` => 3 attempts
- Power `7-10` => 4 attempts
- Power `11-15` => 5 attempts
- Power `16+` => 6+ by same pattern

Equivalent thresholds: `1, 2, 4, 7, 11, 16, ...`.

## 4. Event generation model

### Procedural pool

- Built from level `rollableEventIds` and template weights.
- Engine creates shuffled sequence blocks with each template repeated by weight.
- Sequence persists in state; draws consume head entries.
- Same refill batch avoids duplicate template picks.

### Chapter 1 opening bias

Turn 1 first block is prefixed with:
1) `tradeOpportunity`
2) `administrativeDelay`

### All-empty board count rules

When all slots are empty, event count depends on `treasuryStat + power + legitimacy` with weighted bands.

- **Chapter 1 turn 1** is forced to 2 events with the fixed prefix `tradeOpportunity` + `administrativeDelay`.
- **Chapter 2 standalone start** (turn 1, when launched directly from the menu rather than continuity from Chapter 1) force-places exactly two opening events — `versaillesExpenditure` in slot A and `taxResistance` in slot B — and skips the regular procedural fill that turn.

### Extra injections

- **Europe Alert (Chapter 2)**:
  - Supplemental pool: `{frontierGarrisons, tradeDisruption, embargoCoalition, mercenaryRaiders, localWar}`.
  - Progress-gated yearly injection:
    - progress `1..5`: chance `progress * 20%` to inject **1** supplemental event
    - progress `6..10`: guaranteed **1**, plus chance `(progress-5) * 20%` to inject a **2nd** supplemental event
  - `Treaties of Nijmegen` funding solve amount is dynamic: `europeAlertProgress + 3`.
- **Religious Tolerance status**: each turn one mutually-exclusive roll injects at most one of `jansenistTension` / `arminianTension` / `huguenotTension` at 15% / 15% / 15% (45% combined); skipped if any of the three is already on the board or no event slot is free. Resolving `arminianTension` or `huguenotTension` (each costs 1 Funding) inserts one `religiousTensionCard` into the draw pile (cost 2; played card is purged from the deck rather than discarded).
- **Jesuit Patronage opportunity**: paying 2 Funding to resolve `jesuitPatronage` (random pool, weight 1) inserts 2 `jesuitCollege` cards (cost 2, Remaining 1/1, legitimacy +1, on play also auto-resolves one unresolved `jansenistTension` if present) and 1 `religiousTensionCard` into the draw pile. If unresolved, no penalty.
- **Anti-French Sentiment status**: triggers as soon as `power + treasuryStat > 20`; clears once that sum drops back to 20 or below. While active:
  - Europe-Alert-linked event solve costs gain a surcharge: **+1 the moment Power + TreasuryStat goes over 20**, and **another +1 every time the sum crosses an additional +5 line** — so +1 in the 21–25 range, +2 in 26–30, +3 in 31–35, and so on.
  - Once per year — during the year-end flow, **after** retention is confirmed but **before** `resolveEndOfYearPenalties` — one `antiFrenchContainment` card is injected into the deck (draw penalty: 50/50 lose 1 power or 1 legitimacy; playable purge cost `max(1, floor(europeAlertProgress / 2))`).

### Event badges (UI tags)

- **Harmful**: unresolved at year-end can apply penalties.
- **Opportunity**: optional upside event, usually low/no ignore penalty.
- **Historical**: shown on mainline scripted-history events (e.g. War of Devolution / Revocation of Nantes / Treaties of Nijmegen). This badge itself has **no extra gameplay effect**; it is narrative classification only.
- **Continued**: unresolved event can persist into the next year.
- **Resolved**: already handled this year.

## 5. Solving events

Supported solve channels in current build:

- funding
- funding-or-crackdown
- crackdown-only
- scripted attack
- Nantes policy choice (tolerance vs crackdown)

`crackdown` and `diplomaticIntervention` only target unresolved **harmful** events (`nineYearsWar` and `localWar` are not valid targets).

## 6. Win / lose checks

### Global lose

Any of the three persistent resources hitting zero or below at an enforced check ends the run:

- `legitimacy <= 0` => immediate defeat
- `treasuryStat <= 0` => immediate defeat
- `power <= 0` => immediate defeat

### Chapter 1 victory (`firstMandate`)

By end-of-year checks within 15 turns:

- Treasury >= 6
- Power >= 6
- Legitimacy >= 5

### Chapter 2 victory (`secondMandate`)

Need all of the following:

- Current calendar year >= 1696
- `europeAlert === false` (typically cleared by resolving `ryswickPeace`)
- No `huguenotContainment` status remains in `playerStatuses` (i.e. the harsh-crackdown branch must be fully wound down — remnants reduced to zero)
- `legitimacy >= victoryRule.minLegitimacy` (currently **6** in the `secondMandate` level definition)

If last turn ends without victory => time defeat.

## 7. Retention and hand rules

- Hard hand cap: **12**.
- Retention capacity = `legitimacy + retentionCapacityDelta statuses`, minimum 0.
- End-year: player picks retained hand cards (up to capacity), rest discard.
- Unspent funding is always cleared before retention confirmation.

## 8. Chapter transition behavior (to Chapter 2)

Two start modes:

1. **Standalone Chapter 2**
   - Uses transformed Chapter 1-style carryover baseline + fixed Chapter 2 additions.
   - Starts with Europe Alert on and war branch treated as taken.
2. **Continuity from Chapter 1 victory**
   - Carries real card instances, inflation stacks, and remaining uses.
   - The carry-over snapshot **excludes** any card with the `temp` or `extra` tag.
   - Refit is remove-only, max 3 removals.
   - Adds fixed Chapter 2 new cards.
   - If Chapter 1 took the `warOfDevolutionAttacked` branch, Chapter 2 starting `legitimacy` is bumped by `+1`.

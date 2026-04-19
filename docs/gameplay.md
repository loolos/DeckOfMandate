# Deck of Mandate — Gameplay Rules (Code-Aligned)

This document reflects current runtime behavior in `src/app/*`, `src/logic/*`, and `src/data/*`.

## 1. Core resources

- **Treasury stat**: persistent economic strength.
- **Funding**: spendable money this turn only; cleared at year-end.
- **Power**: governs draw attempts via threshold scaling, and chapter objectives.
- **Legitimacy**: political stability, retention capacity baseline, and hard fail resource.

At begin-year:

```text
funding += treasuryStat
```

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
   - on deck refill, inflation stacks may increase for qualifying instances
6. **Status tick-down**: most timed statuses decrement after draw; long-lived branch statuses do not auto-tick.
7. **Event phase**:
   - apply scheduled slot transforms (e.g. `powerVacuum -> majorCrisis`)
   - clear resolved events from slots
   - inject scripted calendar rows for this year
   - fill empty procedural slots (`A–C`) from deterministic weighted sequence
   - optional extra injections (Europe Alert pool, religious tension, anti-French-sentiment extras)
8. **Action phase**:
   - play cards, solve events by funding, crackdowns, scripted attacks, policy choices
9. **Retention phase trigger**:
   - player ends year manually
   - choose cards to keep (up to retention capacity)
   - unkept hand cards discard
10. **End-of-year penalties**: unresolved harmful events strike in slot order.
11. **Outcome checks**:
   - immediate fail if legitimacy <= 0 at any enforced point
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

When all slots are empty, event count depends on `treasuryStat + power + legitimacy` with weighted bands; Chapter 1 turn 1 is forced to 2 events.

### Extra injections

- **Europe Alert (Chapter 2)**:
  - Supplemental pool: `{frontierGarrisons, tradeDisruption, embargoCoalition, mercenaryRaiders}`.
  - Progress-gated yearly injection:
    - progress `1..5`: chance `progress * 20%` to inject **1** supplemental event
    - progress `6..10`: guaranteed **1**, plus chance `(progress-5) * 20%` to inject a **2nd** supplemental event
  - `Treaties of Nijmegen` funding solve amount is dynamic: `europeAlertProgress + 3`.
- **Religious Tolerance status**: each year 30% chance to inject `religiousTension` if absent and space exists.
- **Anti-French Sentiment status**: if `power + treasuryStat > 20`, apply status marker; while active, every full `+5` overflow above 20 increases all funding-based event solve costs by `+1`, and each turn-end injects one `antiFrenchContainment` card into deck (draw penalty: 50/50 lose 1 power or 1 legitimacy; playable purge cost `floor(europeAlertProgress/2)`; removed once `power + treasuryStat <= 20`).

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

`crackdown` and `diplomaticIntervention` only target unresolved **harmful** events.

## 6. Win / lose checks

### Global lose

- **Legitimacy <= 0** => immediate defeat.

### Chapter 1 victory (`firstMandate`)

By end-of-year checks within 15 turns:

- Treasury >= 6
- Power >= 6
- Legitimacy >= 5

### Chapter 2 victory (`secondMandate`)

Need both:

- Current calendar year >= 1696
- `europeAlert === false` (typically cleared by resolving `ryswickPeace`)

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
   - Refit is remove-only, max 3 removals.
   - Adds fixed Chapter 2 new cards.

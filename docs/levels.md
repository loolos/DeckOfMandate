# Deck of Mandate

## Level 1 Design Document — *The Rising Sun*

---

## Level name

```text
The Rising Sun
```

**Campaign frame:** early personal rule of **Louis XIV** in **France**, **1661–1676** (compressed into a **15-year** prototype run on the calendar; see **Turn scale and calendar**).

### Level content (code)

Per-level **playable lists** live in [`src/data/levelContent.ts`](src/data/levelContent.ts) as `LevelContent`: **starter deck order**, **weighted event roll pool** (`rollableEventIds`), **slot escalations** (for example unresolved governor → royal crisis next year), **year-end escalation schedulers** (events that arm `pendingMajorCrisis` without applying immediate penalty lists), and **`scriptedCalendarEvents`** (calendar-driven events—inject year, window, scripted attack economics, anti-coalition draw hazard; see [`src/logic/scriptedCalendar.ts`](../src/logic/scriptedCalendar.ts)).

**Template definitions** (card/event ids, `titleKey` / `descriptionKey`, baseline `solve` *shape*) stay in [`src/data/events.ts`](../src/data/events.ts) and [`src/data/cards.ts`](../src/data/cards.ts). **Scripted attack numbers** for *firstMandate* live in `levelContent.scriptedCalendarEvents`, not duplicated in engine literals.

**Level epilogue** (victory / defeat prose, optional extra if the player attacked in the War of Devolution) is wired through `ending` keys on [`src/data/levels.ts`](../src/data/levels.ts) and copy under [`src/locales/levels/firstMandate/`](../src/locales/levels/firstMandate/).

**Adding a new historical level:** (1) add a row to `levelDefs` in [`src/data/levels.ts`](../src/data/levels.ts) (optional `ending`); (2) add `levelContentByLevelId` in `levelContent.ts` (use `scriptedCalendarEvents: []` if none); (3) add `src/locales/levels/<levelId>/en.ts` + `zh.ts` and merge in [`src/locales/en.ts`](../src/locales/en.ts) / [`zh.ts`](../src/locales/zh.ts); (4) extend `EventTemplateId` / `CardTemplateId` if needed.

---

## Historical background

In **1661**, after the death of Cardinal Mazarin, Louis XIV began his personal rule and turned France into the most ambitious monarchy in Europe. Refusing another chief minister, he centralized authority around the crown and made royal power the center of political life.

His government relied on ministers such as **Jean-Baptiste Colbert**, who reorganized finances, promoted manufacturing, expanded trade, and strengthened the navy. Roads, ports, and royal industries were developed to build national wealth. The monarchy expanded its bureaucracy and reduced the independence of regional elites.

Louis XIV also began shaping the **court culture** that would later define Versailles: nobles were drawn into ceremony, competition for favor, and life at court, weakening their ability to challenge the crown.

Abroad, France sought influence through war and diplomacy. The **War of Devolution (1667–1668)** brought territorial gains; by the early **1670s**, conflict with the **Dutch Republic** widened into a larger European struggle.

This was an age of **rising glory and rising cost**: France grew stronger, richer, and more centralized—yet the burden of war, court spending, and political rivalry was already building beneath the surface.

**Design themes:** centralization of royal power; court politics and noble control; Colbert-era economic reform; army and state capacity; elite and provincial resistance; France’s ascent in Europe.

---

## Purpose of this level

This is the **tutorial / prototype** level.

Goals:

- Teach core systems
- Test card economy
- Test event pressure
- Test growth vs survival decisions
- Verify win condition pacing

The level should feel **challenging but fair**, with flavor anchored in the Sun King’s early reign.

---

## Turn scale and calendar

**1 turn = 1 calendar year** for this level (same global rule as in `gameplay.md`).

### Starting time and progression (MVP)

| Field | Value |
| --- | --- |
| **First in-game year (turn 1)** | **1661** |
| **Length of each turn** | **1 year** |
| **Year during turn** (1-based index **t** = 1 … **15**) | **1660 + t** → turn **1** = **1661**, turn **15** = **1675** |

**Flavor:** the year is a **campaign calendar** anchor for UI and tone, not a month-by-month simulation of every historical event in 1661–1676.

Future levels may change cadence (for example 1 turn = 1 month) by supplying their own **calendar start** and **step per turn** in level data.

### UI — date line vs turn length (MVP)

The **headline date** must use the **same granularity as one turn** on that level (see `gameplay.md`, **Calendar display**):

- **This level:** **1 turn = 1 full year** → show **year only** (for example **1663**), not a fake month/day.
- **Turn index** (`t` of **15**) remains optional next to the level title.

---

## Turn limit

**15 turns**

Reason:

- Enough time to scale and recover from mistakes
- Calendar span **1661–1675** matches the level data (`calendarStartYear` + `turnLimit − 1`)
- Still bounded for replayability

---

## Starting conditions

| Stat | Value |
| --- | --- |
| Treasury stat | 2 |
| Power | 2 |
| Legitimacy | 2 |

**Funding (MVP):** Each turn, **Income** adds **funding** equal to the **Treasury stat**. **Unspent funding is cleared at End phase** (see `gameplay.md`). There is no separate “starting funding” number: turn 1 begins with the normal turn flow (**Income → …**).

### Deck (starter)

Order and counts match [`src/data/levelContent.ts`](src/data/levelContent.ts) (`starterDeckTemplateOrder` for this level) — **13 cards** total:

| Card ID (data) | English name (UI) | Copies |
| --- | --- | --- |
| `funding` | Royal Levy | 4 |
| `crackdown` | Royal Intervention | 3 |
| `reform` | Administrative Reform | 2 |
| `ceremony` | Versailles Ceremony | 2 |
| `development` | Royal Manufactories | 2 |

---

## Win condition

Before the run fails the **turn limit** (see **Defeat** below), reach **all** targets **simultaneously** on an **end-of-turn** check (including **after turn 15’s End phase** if needed):

- **Treasury stat ≥ 4**
- **Power ≥ 4**
- **Legitimacy ≥ 5**

All three must be true at the same check → **Victory**. Stats **may exceed** these numbers.

---

## Defeat (turn limit)

**MVP (*The Rising Sun*):** After **turn 15’s End phase** win check, if **not** all targets are met, the run ends in **defeat** (time’s up / mandate not secured). See `gameplay.md` (**Turn structure**).

---

## Lose condition

**Legitimacy ≤ 0** at **any** time (immediate game over). **Lose-first** if a rare rules edge would touch both loss and win in the same step—see `gameplay.md`.

Represents: collapse of royal authority, removal, coup, or regime failure.

---

## Event rules

Each turn:

- **Event phase:** apply **scheduled transforms** (for example **Provincial Governor Ascendant** → **Royal Crisis**), **clear resolved** instances, run **scripted calendar hooks** (inject / expire scripted rows), then **fill procedural slots `A`–`C`** with weighted rolls (see `gameplay.md` for the “all empty → 1–3 events” rule and turn thresholds). **Duplicate** templates across `A`–`C` are **allowed**.
- Unresolved **harmful** events trigger penalties at **Event resolution** (end of turn), in **fixed slot order** along **all** columns **`A` → `J`** (implementation order in [`resolveEndOfYearPenalties`](../src/logic/resolveEvents.ts)).

**Harmful event (MVP):** Any event that applies a **penalty if left unresolved**, or that **escalates** into a penalized state (for example **Provincial Governor Ascendant** → **Royal Crisis**). **Colonial Trade Boom** is **not harmful** (no penalty if ignored). **War of Devolution** is **not harmful** (no year-end auto-penalty; it persists until the window ends or the player uses the **scripted attack** path).

**Royal Intervention (`Crackdown`) (MVP):** Each play may resolve **one harmful event** among the current harmful events. **Cannot** target **Colonial Trade Boom**. A slot **already resolved** this turn (by **funding** solve or **Royal Intervention**) **cannot** be targeted again.

**Scripted military (`War of Devolution`):** Uses the dedicated reducer action (not the generic **Solve (funding)** button). Costs and rewards are read from `scriptedCalendarEvents` for this level.

**After resolution:** On a later turn’s **Event phase**, that slot is **empty** and can receive a **new random** procedural pick (including after **Royal Crisis** is resolved). See `gameplay.md` (**Resolved events and next turn’s slots**).

### Deck / draw pile (MVP)

If the draw pile is empty when a draw is required, **shuffle the discard pile** into a new draw pile and continue (see `gameplay.md`).

---

## Event pool (IDs and English names)

**Weighted roll pool** (`rollableEventIds`): **Royal Crisis** is **transform-only** (weight **0** in data). **`warOfDevolution`** is **not** in this pool; see **Scripted calendar** below.

| ID | English name | Type (flavor) | Harmful | Weight | Solve (MVP) | If unresolved |
| --- | --- | --- | --- | ---: | --- | --- |
| `budgetStrain` | Court Overspending | Fiscal | yes | 3 | Pay **2** funding | Treasury stat **−1** |
| `publicUnrest` | Paris Unrest | Social | yes | 3 | **Royal Intervention** only | Legitimacy **−1** |
| `administrativeDelay` | Bureaucratic Delay | Administrative | yes | 2 | Pay **1** funding | Next turn: **one fewer draw attempt** (see engine: `nextTurnDrawModifier`; minimum **1** attempt) |
| `tradeOpportunity` | Colonial Trade Boom | Opportunity | no | 2 | Pay **1** funding (optional) | None; if paid → Treasury stat **+1** |
| `politicalGridlock` | Noble Resistance | Political | yes | 2 | Pay **1** funding | Gain status **Loss of Authority** for **3** turns (−1 draw attempt while active, stacking with other modifiers; floor **1** attempt) |
| `powerVacuum` | Provincial Governor Ascendant | Crisis | yes | 1 | Pay **2** funding **or** **Royal Intervention** | Next **Event** phase on that slot: becomes **Royal Crisis** |
| `majorCrisis` | Royal Crisis | Crisis | yes | 0 | **Royal Intervention** only | Legitimacy **−1**; next turn draw penalty (same modifier pipeline as **Bureaucratic Delay**) |

### Scripted calendar (*firstMandate*)

| Template ID | Role | Notes |
| --- | --- | --- |
| `warOfDevolution` | War of Devolution (1667–1669 window) | Injected on **1667**; **not** harmful; persists until **attack** (scripted action) or calendar **after 1669** clears unresolved copy. **Attack**: pay configured **funding**, **Power +1**, **50%** chance **Treasury stat +1** (see `levelContent.ts`). Triggers **Anti-French coalition**: each eligible year, configured **%** chance **−1** draw (still **≥ 1**). Action log records coalition hits and war outcome (localized). |

**Flavor examples (writing reference):**

- **Court Overspending:** Versailles expansion and court ritual push spending past the budget again.
- **Paris Unrest:** Bread prices rise; crowds gather in the Paris streets.
- **Bureaucratic Delay:** Provincial officials slow-walk new orders from the court.
- **Colonial Trade Boom:** Sea lanes reopen; merchants ask the crown for support.
- **Noble Resistance:** Great nobles quietly unite against a new fiscal scheme.
- **Provincial Governor Ascendant:** a provincial governor begins issuing orders that bypass the court.
- **Royal Crisis:** factions question royal authority; the situation turns dangerous fast.

---

## Player cards (IDs and English names)

| ID | English name | Funding cost | Effect (MVP) |
| --- | --- | ---: | --- |
| `funding` | Royal Levy | 0 | +1 **funding** this turn |
| `crackdown` | Royal Intervention | 1 | Resolve **one** harmful event (not **Colonial Trade Boom**) |
| `reform` | Administrative Reform | 2 | Power **+1**; **draw 1** immediately |
| `ceremony` | Versailles Ceremony | 2 | Legitimacy **+1** |
| `development` | Royal Manufactories | 3 | Treasury stat **+1** |

---

## Status effects

| Status ID | English name | Effect (MVP) |
| --- | --- | --- |
| `powerLeak` | Loss of Authority | **3** turns: **−1** draw attempt (combined with Power and other modifiers; minimum **1** attempt) |

**Runtime UI (not a `statusTemplates` row):** **Anti-French coalition** appears in the status list while active; each **beginYear** rolls the configured hazard for a one-year draw reduction (see `scriptedCalendar.ts` / action log).

---

## Procedural fill (engine summary)

- **Slots `A`–`C`** receive routine weighted events when empty after scripted hooks.
- If **every** slot `A`–`J` is empty at **Event phase** start: turns **1–5** roll **one** event with probability **0.3**, else **two** (`A`+`B`); from turn **6** onward, **three** events with probability **0.1**, else the same **0.3 / two** split as early turns.
- **`D`–`J`** are reserved (script overflow / future use); routine fill does not target them.

---

## Event frequency (design intent)

| Event | Weight |
| --- | ---: |
| Court Overspending | 3 |
| Paris Unrest | 3 |
| Bureaucratic Delay | 2 |
| Colonial Trade Boom | 2 |
| Noble Resistance | 2 |
| Provincial Governor Ascendant | 1 |
| Royal Crisis | 0 (escalation only) |

Weighted random with replacement when filling empty procedural slots; duplicates across **`A`–`C`** are allowed.

---

## Intended gameplay flow

### Turns 1–3

Learn systems. Priorities: contain **Paris Unrest**; avoid losing Treasury stat and Legitimacy; do not ignore **Provincial Governor Ascendant**.

### Mid-run

Growth phase. Priorities: **Administrative Reform** and **Royal Manufactories**; stabilize income.

### Late run

Push for victory. Priorities: **Versailles Ceremony** for Legitimacy; hit all three win thresholds before **turn 15** ends.

---

## Example tension

**State:** Treasury stat 3, Power 3, Legitimacy 2; events **Paris Unrest** + **Colonial Trade Boom**; hand includes **Administrative Reform**, **Versailles Ceremony**, **Royal Levy**.

**Decision:** safe line clears unrest and buys legitimacy; greedy line takes the trade boom and reforms—both are viable reads on risk.

---

## Difficulty targets

A typical first-time player should lose once or twice, grasp growth, and improve quickly. A skilled player should win consistently.

---

## Success metrics

The level works if players report:

- needing more economy earlier;
- ignoring unrest too long;
- almost stabilizing;
- wanting one more run.

---

## Prototype balance notes

**If too hard:** raise turn limit slightly; start Treasury stat at 3; slightly reduce unrest weights.

**If too easy:** more **Paris Unrest**; shorten turn limit; raise **Versailles Ceremony** cost in data (future tuning).

---

## Final summary

| Item | Value |
| --- | --- |
| Level name | **The Rising Sun** |
| Theme | Louis XIV, France **1661–1676** (flavor) |
| Turns | **15** |
| Calendar | Starts **1661**; **+1 year** per turn (turn **15** = **1675**); **UI: year only** |
| Start | Treasury stat **2** / Power **2** / Legitimacy **2** |
| Procedural event slots | **`A`–`C`** (typically **1–2** fills; **3** possible when board empty from turn **6**) |
| Win | Treasury stat **≥ 4**, Power **≥ 4**, Legitimacy **≥ 5** (same end-of-turn check) |
| Lose | Legitimacy **≤ 0** anytime, or turn-limit defeat after turn **15** |

This level proves the core loop while carrying a specific historical lens: **glory is expensive**, **Paris is restless**, and **nobles never truly surrender**.

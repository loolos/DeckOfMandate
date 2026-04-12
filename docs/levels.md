# Deck of Mandate

## Level 1 Design Document (Prototype Stage)

---

## Level Name

```text
The First Mandate
```

**Alternative names:** First Term, Fragile Order, Founding Year

**Recommended final prototype name:** The First Mandate

---

## Purpose of This Level

This is the tutorial / prototype level.

Goals:

- Teach core systems
- Test card economy
- Test event pressure
- Test growth vs survival decisions
- Verify win condition pacing

This level should feel challenging but fair.

---

## Core Theme

The player begins with a weak but functioning regime.

The government is unstable, underdeveloped, and vulnerable to recurring problems.

The player must strengthen the state before legitimacy collapses.

---

## Turn scale and calendar

**1 Turn = 1 calendar year** for this level (same as the global prototype rule in `gameplay.md`).

### Starting time and progression (MVP)

| Field | Value |
| --- | --- |
| **First in-game year (turn 1)** | **1518** |
| **Length of each turn** | **1 year** |
| **Year during turn** (1-based index **t** = 1 … 8) | **1517 + t** → turn **1** = **1518**, turn **8** = **1525** |

**Flavor:** the year is a **fictional campaign calendar** anchor for UI and tone, not a strict historical simulation requirement.

Future levels may change cadence to, for example:

- 1 Turn = 1 Month
- 1 Turn = 1 Season
- 1 Turn = 5 Years

…by supplying their own **calendar start** and **calendar step per turn** (months, years, and so on) in level data.

### UI — date line vs turn length (MVP)

The **headline date** must use the **same granularity as one turn** on that level (see `gameplay.md`, **Calendar display**):

- **This level:** **1 turn = 1 full year** → show **year only** (for example **1518**), not a fake month/day.
- **If a level used 1 turn = 1 month:** show a **month-level** label (year + month, or ISO month **1518-04**, and so on—pick one style per product).
- **Turn index** (`t` of **8**) remains optional for any cadence.

For *The First Mandate*, keep the **year-only** banner next to the level title; optional **Turn t / 8**.

---

## Turn Limit

**8 turns**

Reason:

- Enough time to scale
- Enough time for mistakes
- Short enough for replayability

---

## Starting Conditions

| Stat | Value |
| --- | --- |
| Treasury stat | 2 |
| Power | 2 |
| Legitimacy | 2 |

**Funding (MVP):** Each turn, **Income** adds **funding** equal to the **Treasury stat**. **Unspent funding is cleared at End phase** (see `gameplay.md`). There is no separate “starting funding” number: turn 1 begins with the normal turn flow (**Income → …**).

### Deck

Starter deck only:

- Funding ×3
- Crackdown ×3
- Reform ×3
- Ceremony ×3

**Total:** 12 cards

---

## Win Condition

Before the run fails the **turn limit** (see **Defeat** below), reach **all** targets **simultaneously** on an **end-of-turn** check (including **after turn 8’s End phase** if needed):

- **Treasury stat ≥ 4**
- **Power ≥ 4**
- **Legitimacy ≥ 5**

All three must be true at the same check → **Victory**. Stats **may exceed** these numbers.

---

## Defeat (turn limit)

**MVP (*The First Mandate*):** After **turn 8’s End phase** win check, if **not** all targets are met, the run ends in **defeat** (time’s up / mandate not secured). See `gameplay.md` (**Turn structure**).

---

## Lose Condition

**Legitimacy ≤ 0** at **any** time (immediate game over). **Lose-first** if a rare rules edge would touch both loss and win in the same step—see `gameplay.md`.

Represents: collapse, removal from office, coup, regime failure.

---

## Event Rules

Each turn:

- **Event phase:** apply **scheduled transforms** (for example **Power Vacuum** → **Major Crisis**), then **roll new events** from the level pool for **each slot that has no active event** (see `gameplay.md`). **Duplicate** templates in slot A and B are **allowed**.
- Unresolved **harmful** events trigger penalties at **Event resolution** (end of turn), in **fixed slot order**: **slot A (left/first), then slot B (right/second)** (MVP)

**Harmful event (MVP):** Any event that applies a **penalty if left unresolved**, or that **escalates** into a penalized state (for example **Power Vacuum → Major Crisis**). **Trade Opportunity** is **not harmful** (no penalty if ignored).

**Crackdown (MVP):** Each play may resolve **one harmful event** among the current harmful events. **Cannot** target **Trade Opportunity**. A slot **already resolved** this turn (by **funding** solve or **Crackdown**) **cannot** be targeted again.

**After resolution:** On a later turn’s **Event phase**, that slot is **empty** and receives a **new random** event (including after **Major Crisis** is resolved). See `gameplay.md` (**Resolved events and next turn’s slots**).

### Deck / draw pile (MVP)

If the draw pile is empty when a draw is required, **shuffle the discard pile** into a new draw pile and continue (see `gameplay.md`).

---

## Event Pool (Prototype)

Use only **5 events** for clean testing.

### 1. Budget Strain

| Field | Value |
| --- | --- |
| **Type** | Economic pressure |
| **Description** | Unexpected spending increases. |
| **Solve options** | Pay **2 funding**; other cards may be added in expansions |
| **If unresolved** | **Treasury stat -1** |
| **Design purpose** | Forces economy management. |

### 2. Public Unrest

| Field | Value |
| --- | --- |
| **Type** | Stability threat |
| **Description** | Local disorder spreads. |
| **Solve options** | **Crackdown** (MVP); future cards may add alternate solves |
| **If unresolved** | Legitimacy -1 |
| **Design purpose** | Direct survival pressure. |

### 3. Administrative Delay

| Field | Value |
| --- | --- |
| **Type** | Efficiency threat |
| **Description** | Orders are ignored or delayed. |
| **Solve options** | Spend **1 funding**; play future governance cards |
| **If unresolved** | Power -1 next turn (minimum Power remains 1); applied **before** that turn’s **Draw phase** (see `gameplay.md`) |
| **Design purpose** | Attacks draw engine. |

### 4. Trade Opportunity

| Field | Value |
| --- | --- |
| **Type** | Positive opportunity |
| **Description** | A short economic opening appears. |
| **Solve options** | Spend **1 funding** (per **slot**; two **Trade Opportunity** rolls the same turn are **two** independent purchases if the player can pay) |
| **Reward** | **Treasury stat +1** |
| **If ignored** | No penalty |
| **Design purpose** | Encourages proactive growth. |

### 5. Power Vacuum

| Field | Value |
| --- | --- |
| **Type** | Delayed crisis |
| **Description** | Weak control creates future danger. |
| **Solve options** | Spend **2 funding** **or** play **Crackdown** |
| **If unresolved** | Transforms next turn into **Major Crisis** |

**Major Crisis** (if unresolved): Legitimacy -1; Power -1 (Power minimum remains 1)

**MVP replacement rule:** If **Power Vacuum** is unresolved, **replace** that event slot’s pressure at the next **Event phase** with **Major Crisis** (same slot; engine may implement this as a pending transform flag).

**Design purpose:** Punishes repeated neglect.

---

## Event Frequency Recommendation

Weighted spawn rates (design intent):

| Event | Weight |
| --- | --- |
| Budget Strain | High |
| Public Unrest | High |
| Administrative Delay | Medium |
| Trade Opportunity | Medium |
| Power Vacuum | Low |

This prevents overly punishing starts.

**Implementation (MVP):** Store **numeric weights** in data or config (for example map **High / Medium / Low** to integers such as **3 / 2 / 1**—exact numbers are **tunable parameters**, not fixed by prose). When rolling a **new** event for a slot, **weighted random choice with replacement** across the pool; **duplicate types** in slot A and slot B the same turn are **allowed**.

---

## Intended Gameplay Flow

### Turn 1–2

Player learns systems. Likely priorities: survive unrest; avoid losing **Treasury stat** and **Legitimacy**.

### Turn 3–5

Player starts growth. Likely priorities: play Reform; increase **Treasury stat** and income stability.

### Turn 6–8

Push for victory. Likely priorities: Ceremony for legitimacy; final resource targets.

---

## Example Good Tension

**Turn state:**

- Treasury stat = 3 (income adds **3 funding** this turn, before other effects)
- Funding available this turn: example **3** after income
- Power = 3
- Legitimacy = 2

**Events:** Public Unrest, Trade Opportunity

**Hand:** Reform, Ceremony, Funding

**Decision:**

- **Safe path:** Solve unrest + Ceremony
- **Greedy path:** Trade Opportunity + Reform

This is intended strategic tension.

---

## Difficulty Targets

A typical first-time player should:

- lose once or twice
- understand growth importance
- improve quickly

A skilled player should win consistently.

---

## Success Metrics

Level is successful if players say:

- I needed more economy earlier.
- I ignored unrest too long.
- I almost stabilized.
- One more run.

---

## Prototype Balance Notes

**If level too hard:**

- Turn limit = 10
- Start **Treasury stat** = 3
- Fewer unrest events

**If too easy:**

- More Public Unrest
- Turn limit = 7
- Ceremony **funding** cost = 3

---

## Final Summary

| Item | Value |
| --- | --- |
| Level name | The First Mandate |
| Turns | 8 |
| Calendar | Starts **1518**; **+1 year** per turn (turn 8 = **1525**); **UI: year only** (no month) |
| Start | Treasury stat 2 / Power 2 / Legitimacy 2 |
| Events per turn | 2 |
| Win | Treasury stat ≥ 4, Power ≥ 4, Legitimacy ≥ 5 (same end-of-turn check) |
| Lose | Legitimacy ≤ 0 anytime, or turn-limit defeat after turn 8 |

This level exists to prove the core loop works.

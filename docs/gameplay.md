# Deck of Mandate

## Core Gameplay Design Document

---

## Game Summary

Deck of Mandate is a single-player turn-based strategy card game about governance, crisis management, and political growth.

The player leads a political entity and must manage limited resources while responding to recurring internal and external events.

Victory is achieved by strengthening the regime and reaching development milestones.

Failure occurs when legitimacy collapses.

---

## Core Design Philosophy

This is **not** a combat game.

Instead of fighting monsters, the player fights:

- instability
- shortages
- unrest
- inefficiency
- political crises
- missed opportunities

Cards represent actions, reforms, policies, and emergency responses.

Events represent real pressures placed on leadership.

---

## Core Resources

The economy uses **two linked values** (do not conflate them in code or UI labels):

### Treasury (stat)

A **persistent** value: long-term financial capacity and fiscal base.

- **Income:** At the start of each turn’s **Income phase**, add **funding** equal to the current **Treasury stat**.
- **Growth / shocks:** Some effects raise or lower the **Treasury stat** (for example, event rewards or penalties).
- **Floor (MVP):** **Treasury stat** may reach **0** (income then adds **0 funding** from that stat until it rises again).
- **Victory (level 1):** One win target is **Treasury stat ≥ 4** (see **Win condition**).

```text
Income funding gained = current Treasury stat
```

**Example:** Treasury stat = 3 → this turn’s income adds **3 funding** (before card effects such as the **Funding** card).

### Funding (spendable)

**Temporary money available this turn**, used for:

- Paying **card costs**
- Paying **event solve** costs (treasury/fiscal spends written on events)

**MVP rule:** Funding is granted by the **Income phase** (and by a few **this-turn** effects such as the **Funding** card). **Unspent funding is lost at end of turn** (it does not carry to the next year). The **Treasury stat** persists.

In short: **Treasury stat** sets how much **funding** you receive each turn; **funding** is what you actually **spend**.

### Power

Represents governing authority and decision-making capacity.

**Uses:**

- **Draw phase:** how many **draw attempts** the player gets **this turn** (see **Turn structure** for timing vs deferred penalties).

**Example:** Power = 2 → up to **2** successful draws in the **Draw phase**, each skipped if the **hand cap** is already reached.

Higher Power means more options and flexibility.

**MVP timing:** **Power** at the **start of the Draw phase** (after applying **scheduled Power changes** from the previous turn, such as **Administrative Delay**) determines that turn’s draw count. **Reform** is played later in the **Action phase**: its **Power +1** applies immediately to the stat and therefore affects **the next turn’s** Draw phase size; its **Draw 1** is resolved **immediately** when the card is played (same turn), not in the Draw phase.

### Legitimacy

Represents political acceptance and regime stability.

**Uses:**

- Number of cards that may be retained at end of turn
- Lose condition when reduced to **0** or below
- Win condition when raised to target level

**Example:** Legitimacy = 2 → at end of turn, player may keep up to 2 cards.

If Legitimacy reaches **0** or below: **Game Over** **immediately** (any phase—after a penalty, card effect, or any rules step). **Lose-first** vs **Victory** is defined under **Lose condition**.

---

## Turn Structure

Each turn represents **one year** unless a level overrides the cadence (see `levels.md` — **calendar** and **years per turn**).

**Calendar display (MVP):** Each level declares **how much calendar time one turn represents** (for example **1 year** or **1 month** per turn) and a **campaign start** instant on that same scale.

**UI granularity rule:** The **date line must match the turn length**, not a fixed format for every level.

| Turn length (example) | What the player should see |
| --- | --- |
| **1 turn = 1 year** | **Year only** (no month/day fiction). Example: **1518**, **1519**, … |
| **1 turn = 1 month** | **At least year + month** (month-level date). Example: **April 1518**, **May 1518**, or a locale-appropriate **1518-04** style. |
| **1 turn = 1 season** | **Year + season** (or equivalent quarter label). |
| **1 turn = multiple years** | Advance the calendar by that span; show **year** (or a **year range** if clearer). |

For *The First Mandate*: **1 turn = 1 year**, start **1518**, so the banner shows **only the current campaign year** (**1525** on turn **8**). Optionally also **turn `t` of limit**.

Exact string format is an implementation detail; the requirement is **correct granularity** for the level’s **turn duration**.

**Turn index:** There is **no separate “setup year 0”** — the first **Income → … → End** cycle is **turn 1** and uses the level’s **first** campaign year.

1. **Income phase** — Add **funding** equal to the current **Treasury stat**. (Then apply any “this turn” grants from effects that trigger at income, if the implementation uses that ordering.)
2. **Draw phase** — **Scheduled Power modifiers** from the **previous** turn (for example **Administrative Delay**’s “Power -1 next turn”) are applied **before** counting draws, respecting **Power minimum 1**. Then perform **up to `Power` draw attempts**: for each attempt, if the hand has **fewer than 10** cards (**hand cap**), draw one card from the draw pile; otherwise **skip** further draws for that turn (remaining attempts are wasted).
3. **Event phase** — **First**, apply any **scheduled slot transforms** (for example **Power Vacuum** → **Major Crisis** on the same slot; see `levels.md`). **Then**, for every slot that has **no active event** after transforms, **roll a new event** from the level pool (see `levels.md` for weights). **Slots keep identity** (slot A / slot B): resolving or transforming one slot does not erase the other. **Duplicate templates** in both slots the same turn are **allowed** (independent rolls where both get a new roll).
4. **Action phase** — Player may play cards by paying **funding** costs, pay **funding** to solve events where allowed, and play **Crackdown** to resolve one **harmful** event per **Crackdown** played. **A given event instance may be resolved at most once**; once resolved, it cannot be targeted again this turn. **Solving** and **Crackdown** are separate valid actions; order is player-chosen within the phase budget of **funding** / rules. The player may **end the Action phase at any time** (for example an **End year** / **Proceed** control), even if **funding** remains or further plays are legal—then continue to **Event resolution**.
5. **Event resolution** — Any **still-unresolved harmful** events apply their penalties in **MVP order**: **slot A, then slot B**. Penalties that set **Legitimacy** to **0** end the game **immediately** (see **Lose condition**).
6. **End phase** — Clear unspent **funding**. **Retention:** the player **chooses** which **up to `Legitimacy`** cards from the current **hand** to **retain** for next turn; **every other card still in hand** is discarded. (Cards played earlier this turn are already in the discard pile.) Then begin next turn.

**Win check (MVP):** After **End phase**, if **Legitimacy** is still **above 0** and the turn is still within the level’s **turn limit**, evaluate **Victory** if **Treasury stat**, **Power**, and **Legitimacy** are all **≥** their targets (see **Win condition**). For *The First Mandate*, this includes the **end of turn 8** check.

**Defeat (MVP, turn limit):** If the **End phase** win check runs on the **last allowed turn** (for example **turn 8** on *The First Mandate*) and **not** all targets are met, the run ends in **defeat** (“time’s up” / mandate failed).

### Deck / draw pile (MVP)

If the **draw pile** is empty when a card must be drawn, **shuffle the discard pile** (excluding cards currently in hand or retained, per your engine’s piles) to form a new draw pile, then continue drawing. **Hand cap still applies** after a reshuffle.

### Hand size (MVP)

- **Maximum cards in hand:** **10**.
- **Draw phase** and **immediate draws** (for example from **Reform**) **cannot** raise the hand above **10**; excess draws are **skipped** (no mill / no damage for overdraw in MVP).
- **Retention** cannot end the turn with more than **10** cards in hand (with cap 10 and retain ≤ Legitimacy, this normally binds only on draws).

### Resolved events and next turn’s slots (MVP)

- An event slot that was **fully resolved** this turn (paid solve, **Crackdown**, or other allowed resolution) is **empty** when the next **Event phase** begins and must be **filled with a new random** pick from the pool (same rules as other empty slots). This applies to **Major Crisis** as well: if resolved, next year that slot is a normal new roll—not a lingering crisis state.

---

## Win Condition

For the first level: reach **all three** targets **at or above** the stated thresholds **before** you fail the **turn limit** check (see **Turn structure** — *The First Mandate*: **8** turns).

- Legitimacy **≥ 5**
- Treasury stat **≥ 4**
- Power **≥ 4**

If all are true on the **end-of-turn** check: **Victory**. Values **may exceed** targets; there is no “exactly equal” requirement in MVP.

---

## Lose Condition

**Legitimacy ≤ 0** at **any** time.

Represents: collapse, removal from office, coup, revolution, regime failure.

**MVP:** As soon as Legitimacy hits **0** or below, stop the run (**game over**). **Lose-first:** if **Legitimacy** and **Victory** could both be evaluated in the same step, **resolve the loss** and **do not** award **Victory**.

---

## Core Gameplay Loop

1. Face pressure
2. Spend resources
3. Improve systems
4. Survive instability
5. Reach strength targets

---

## Card System

Cards are the player's tools.

**Initial prototype deck:** 4 card types × 3 copies each = **12 total cards**.

### Example cards

**Funding**

- **Cost:** 0 **funding**
- **Effect:** Gain +1 **funding** this turn (spendable pool only; does not change **Treasury stat**)
- **Purpose:** Starter economy card.

**Crackdown**

- **Cost:** 1 **funding**
- **Effect (MVP):** Resolve **one harmful event** you choose among the two current events. **Trade Opportunity** cannot be chosen (it is not harmful: no penalty if ignored).
- **Purpose:** Short-term control tool. Later versions may narrow this to tag-based targeting (Unrest/Crisis, and so on).

**Reform**

- **Cost:** 2 **funding**
- **Effect:** **Power +1** (stat updates immediately; each **+1** stacks and counts toward **next** turn’s **Draw phase** size). **Draw 1** **immediately** when played (**Action phase**), respecting the **hand cap** (if the hand is already full, **no card** is drawn; Power +1 still applies).
- **Stacking (MVP):** Playing **multiple Reform** cards in the **same** Action phase is allowed: resolve each card in order—each grants **Power +1** (all stack for **next** turn’s draw count) and each **Draw 1** now (each skipped independently if the hand is already at **10** cards).
- **Purpose:** Long-term scaling plus occasional **same-turn** tempo from the bonus draw.

**Ceremony**

- **Cost:** 2 **funding**
- **Effect:** Legitimacy +1
- **Purpose:** Progress toward victory and card retention.

---

## Event System

Events are the main source of challenge.

- Each turn generates **2 events**.
- Events force prioritization.

### Example events

**Budget Strain**

- If unresolved: **Treasury stat -1**

**Public Unrest**

- If unresolved: Legitimacy -1

**Administrative Delay**

- If unresolved: **Power -1** on the **following** turn. **MVP:** treat this as a **scheduled modifier** applied **at the start of the next turn**, **before** the **Draw phase**, so it changes how many cards that turn’s **Draw phase** may draw (still respecting **Power minimum 1**).

**Trade Opportunity**

- Resolve by spending **funding** → reward **Treasury stat +1** (see level doc for exact cost). **Each slot is independent:** two **Trade Opportunity** rolls the same turn mean **two** optional purchases if the player can pay.
- No penalty if ignored (not a **harmful** event).

**Power Vacuum**

- If unresolved: transforms into stronger crisis next turn.

---

## Strategic Decisions

The player constantly chooses between:

- **Short-term survival** — Use cards to remove dangerous events now.
- **Long-term growth** — Increase **Treasury stat** and Power for future turns.
- **Political stability** — Raise Legitimacy to avoid collapse and retain more cards.
- **Opportunity cost** — Every **funding** spent on one problem cannot be spent elsewhere this year.

---

## Intended Game Feel

The player should feel:

- pressured but not helpless
- weak early, stronger later
- punished for greed
- rewarded for planning
- constantly choosing priorities

---

## First Level Flow

### Early game

Low Power, low **Treasury stat** and tight **funding**. Main goal: survive events and stabilize.

### Mid game

Use Reform and economy cards; increase Power and **Treasury stat**.

### Late game

Use Ceremony and efficient plays; reach all victory targets before deadline.

---

## Difficulty Sources

Difficulty should come from:

- too many simultaneous problems
- limited card draw
- expensive choices
- timing mistakes

Not from randomness alone.

---

## Expansion Possibilities

Later versions may add:

- factions
- ideology systems
- different governments
- historical campaigns
- leader traits
- persistent upgrades
- branching maps
- card upgrades

---

## Minimum Prototype Goal

The prototype succeeds if players say:

- One more run.
- I almost stabilized.
- Next time I’ll build economy earlier.

That means the core loop works.

---

## Final Summary

Deck of Mandate is a governance strategy card game where:

- **Treasury stat** sets yearly **funding** income; **funding** pays for actions this turn
- **Power** controls options
- **Legitimacy** controls survival and planning

The player grows a fragile regime into a stable state while surviving yearly crises.

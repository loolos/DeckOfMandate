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

**MVP timing:** **Power** at the **start of the Draw phase** (after applying **scheduled draw-attempt modifiers** from the previous turn—such as **Bureaucratic Delay** or **Royal Crisis**—and ongoing status effects like **Loss of Authority**) determines how many **draw attempts** that turn allows (still **minimum 1**). If the player previously launched the **War of Devolution** military option, **Anti-French coalition** pressure may apply: each year the engine rolls a **level-configured hazard** (for *The Rising Sun*: chance each year while the effect lasts); on success, **one fewer draw attempt** for that year, still **clamped to at least 1**. **Administrative Reform** is played later in the **Action phase**: its **Power +1** applies immediately to the stat and therefore affects **the next turn’s** Draw phase size; its **Draw 1** is resolved **immediately** when the card is played (same turn), not in the Draw phase.

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
| **1 turn = 1 year** | **Year only** (no month/day fiction). Example: **1661**, **1662**, … |
| **1 turn = 1 month** | **At least year + month** (month-level date). Example: **April 1661**, **May 1661**, or a locale-appropriate **1661-04** style. |
| **1 turn = 1 season** | **Year + season** (or equivalent quarter label). |
| **1 turn = multiple years** | Advance the calendar by that span; show **year** (or a **year range** if clearer). |

For *The Rising Sun* (level 1): **1 turn = 1 year**, start **1661**, so the banner shows **only the current campaign year** (**1675** on turn **15**). Optionally also **turn `t` of limit**.

Exact string format is an implementation detail; the requirement is **correct granularity** for the level’s **turn duration**.

**Turn index:** There is **no separate “setup year 0”** — the first **Income → … → End** cycle is **turn 1** and uses the level’s **first** campaign year.

1. **Income phase** — Add **funding** equal to the current **Treasury stat**. (Then apply any “this turn” grants from effects that trigger at income, if the implementation uses that ordering.)
2. **Draw phase** — Apply **scheduled draw-attempt modifiers** from the **previous** turn’s unresolved penalties (for example **Bureaucratic Delay** or **Royal Crisis**) and **ongoing status** effects (for example **Loss of Authority**), then compute a base **draw attempts** = `max(1, Power + modifiers + status deltas)`. If **Anti-French coalition** is active for this year, roll the configured hazard; on hit, apply the configured draw delta (still re-clamp so **attempts ≥ 1**). Perform **up to that many** draw attempts: for each attempt, if the hand has **fewer than 10** cards (**hand cap**), draw one card from the draw pile; otherwise **skip** further draws for that turn (remaining attempts are wasted).
3. **Event phase** — **First**, apply any **scheduled slot transforms** (for example **Provincial Governor Ascendant** → **Royal Crisis** on the same slot; see `levels.md`). **Then**, clear **resolved** instances from slots. **Then**, apply **scripted calendar events** from `levelContent.scriptedCalendarEvents` (calendar inject / expiry; not part of the weighted pool). **Then**, **fill empty procedural slots** (`A`–`C` only): if **all** procedural slots are empty, the engine rolls **1**, **2**, or **3** new weighted events (rules vary by turn index—see `levels.md`); otherwise each empty slot among `A`–`C` gets an independent weighted roll. Slots **D**–**J** exist for future/script overflow but are **not** filled by routine random rolls. **Duplicate templates** across slots the same turn are **allowed**.
4. **Action phase** — Player may play cards by paying **funding** costs, pay **funding** to solve events where allowed, use **scripted attack** buttons on events that define them (for example **War of Devolution**—costs and rewards come from `scriptedCalendarEvents`, not from the generic funding-solve path), and play **Royal Intervention** (the **Crackdown**-class card) to resolve one **harmful** event per **Royal Intervention** played. **A given event instance may be resolved at most once**; once resolved, it cannot be targeted again this turn. **Funding solves**, **scripted attacks**, and **Royal Intervention** are separate valid actions; order is player-chosen within the phase budget of **funding** / rules. The player may **end the Action phase at any time** (for example an **End year** / **Proceed** control), even if **funding** remains or further plays are legal—then continue to **Event resolution**.
5. **Event resolution** — Any **still-unresolved harmful** events apply their penalties in **fixed slot order** along the full column list (**A** through **J** as implemented). Penalties that set **Legitimacy** to **0** end the game **immediately** (see **Lose condition**).
6. **End phase** — Clear unspent **funding**. **Retention:** the player **chooses** which **up to `Legitimacy`** cards from the current **hand** to **retain** for next turn; **every other card still in hand** is discarded. (Cards played earlier this turn are already in the discard pile.) Then begin next turn.

**Win check (MVP):** After **End phase**, if **Legitimacy** is still **above 0** and the turn is still within the level’s **turn limit**, evaluate **Victory** if **Treasury stat**, **Power**, and **Legitimacy** are all **≥** their targets (see **Win condition**). For *The Rising Sun*, this includes the **end of turn 15** check. The **game-over modal** shows a short outcome headline plus **level-authored epilogue** text from locale keys declared on the level def (for *The Rising Sun*, victory includes an **extra paragraph** if the player chose the **War of Devolution** military option during the run).

**Defeat (MVP, turn limit):** If the **End phase** win check runs on the **last allowed turn** (for example **turn 15** on *The Rising Sun*) and **not** all targets are met, the run ends in **defeat** (“time’s up” / mandate failed).

### Deck / draw pile (MVP)

If the **draw pile** is empty when a card must be drawn, **shuffle the discard pile** (excluding cards currently in hand or retained, per your engine’s piles) to form a new draw pile, then continue drawing. **Hand cap still applies** after a reshuffle.

### Hand size (MVP)

- **Maximum cards in hand:** **10**.
- **Draw phase** and **immediate draws** (for example from **Administrative Reform**) **cannot** raise the hand above **10**; excess draws are **skipped** (no mill / no damage for overdraw in MVP).
- **Retention** cannot end the turn with more than **10** cards in hand (with cap 10 and retain ≤ Legitimacy, this normally binds only on draws).

### Resolved events and next turn’s slots (MVP)

- An event slot that was **fully resolved** this turn (paid solve, **Royal Intervention**, or other allowed resolution) is **empty** when the next **Event phase** begins and must be **filled with a new random** pick from the pool (same rules as other empty slots). This applies to **Royal Crisis** as well: if resolved, next year that slot is a normal new roll—not a lingering crisis state.

---

## Win Condition

For the first level: reach **all three** targets **at or above** the stated thresholds **before** you fail the **turn limit** check (see **Turn structure** — *The Rising Sun*: **15** turns).

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

**Initial prototype deck (level 1 implementation):** **13** cards — **Royal Levy** ×4, **Royal Intervention** ×3, **Administrative Reform** ×2, **Versailles Ceremony** ×2, **Royal Manufactories** ×2 (see `levels.md` / `src/data/levelContent.ts` — `starterDeckTemplateOrder` for `firstMandate`).

### Example cards

**Royal Levy**

- **Cost:** 0 **funding**
- **Effect:** Gain +1 **funding** this turn (spendable pool only; does not change **Treasury stat**)
- **Purpose:** Starter economy card.

**Royal Intervention** (implementation id: `crackdown`)

- **Cost:** 1 **funding**
- **Effect (MVP):** Resolve **one harmful event** you choose among the two current events. **Colonial Trade Boom** cannot be chosen (it is not harmful: no penalty if ignored).
- **Purpose:** Short-term control tool. Later versions may narrow this to tag-based targeting (Unrest/Crisis, and so on).

**Administrative Reform** (implementation id: `reform`)

- **Cost:** 2 **funding**
- **Effect:** **Power +1** (stat updates immediately; each **+1** stacks and counts toward **next** turn’s **Draw phase** size). **Draw 1** **immediately** when played (**Action phase**), respecting the **hand cap** (if the hand is already full, **no card** is drawn; Power +1 still applies).
- **Stacking (MVP):** Playing **multiple Administrative Reform** cards in the **same** Action phase is allowed: resolve each card in order—each grants **Power +1** (all stack for **next** turn’s draw count) and each **Draw 1** now (each skipped independently if the hand is already at **10** cards).
- **Purpose:** Long-term scaling plus occasional **same-turn** tempo from the bonus draw.

**Versailles Ceremony** (implementation id: `ceremony`)

- **Cost:** 2 **funding**
- **Effect:** Legitimacy +1
- **Purpose:** Progress toward victory and card retention.

**Royal Manufactories** (implementation id: `development`)

- **Cost:** 3 **funding**
- **Effect:** **Treasury stat +1**
- **Purpose:** Long-term fiscal growth.

---

## Event System

Events are the main source of challenge.

- Each **Event phase** refills **empty procedural slots** `A`–`C` with **weighted** picks from the level pool (and may place **1–3** events when the board was completely empty—see `levels.md`). **Scripted** rows (for example **War of Devolution**) are **not** in the weighted pool; they are injected by **calendar rules** in `levelContent.scriptedCalendarEvents`.
- Multiple simultaneous events force prioritization.

### Example events

**Court Overspending** (implementation id: `budgetStrain`)

- If unresolved: **Treasury stat -1**

**Paris Unrest** (implementation id: `publicUnrest`)

- If unresolved: Legitimacy -1

**Bureaucratic Delay** (implementation id: `administrativeDelay`)

- If unresolved: **one fewer draw attempt** on the **following** turn. **MVP:** treat this as a **scheduled draw-attempt modifier** applied **at the start of the next turn**, **before** the **Draw phase** (still **minimum 1** draw attempt).

**Colonial Trade Boom** (implementation id: `tradeOpportunity`)

- Resolve by spending **funding** → reward **Treasury stat +1** (see level doc for exact cost). **Each slot is independent:** two **Colonial Trade Boom** rolls the same turn mean **two** optional purchases if the player can pay.
- No penalty if ignored (not a **harmful** event).

**Provincial Governor Ascendant** (implementation id: `powerVacuum`)

- If unresolved: transforms into **Royal Crisis** on that slot next turn.

**Noble Resistance** (implementation id: `politicalGridlock`)

- If unresolved: applies **Loss of Authority** for **3** turns (reduces draw attempts while active; still **minimum 1** per turn).

**Royal Crisis** (implementation id: `majorCrisis`)

- Usually reached by escalation from **Provincial Governor Ascendant**. If unresolved: Legitimacy **-1** and a **draw-attempt penalty** next turn (same modifier pipeline as **Bureaucratic Delay**). **Royal Intervention** only for the MVP solve path (see `levels.md`).

**War of Devolution** (implementation id: `warOfDevolution`; *The Rising Sun*)

- **Not** in `rollableEventIds`. Injected once on the configured **campaign start year** (see `levelContent.ts` / `scriptedCalendar.ts`); stays on the board through the configured **presence window** unless the player resolves it via the **scripted military** action (pays **funding** from level data, gains **Power** and a **chance** at extra **Treasury stat**). That choice sets **Anti-French coalition** pressure (probabilistic **−1 draw** per eligible year while active, still **≥ 1** draw). **Royal Intervention** does not apply to this row (it is not flagged **harmful**).

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

Use **Administrative Reform** and economy cards; increase Power and **Treasury stat**.

### Late game

Use **Versailles Ceremony** and efficient plays; reach all victory targets before deadline.

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

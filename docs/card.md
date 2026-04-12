# Deck of Mandate

## Starter Card Design Document (Prototype Version)

---

## Purpose of This Document

This document defines the first minimal player card set for the prototype.

Goals:

- Keep the card pool small
- Support core gameplay loop
- Allow meaningful decisions
- Test economy / scaling / crisis management
- Easy to balance

---

## Prototype Deck Size

Initial deck:

```text
4 Card Types
3 Copies Each
12 Total Cards
```

This is enough for early testing.

---

## Economy terms (prototype)

- **Treasury stat:** persistent fiscal capacity; each **Income phase** adds **funding** equal to this stat.
- **Funding:** spendable money **this turn** only (MVP: unspent funding is cleared at **End phase**). **Card costs** and most **event solve** spends use **funding**.
- **Hand cap (MVP):** **10** cards max in hand; draws that would exceed the cap are **skipped** (see `gameplay.md`).

---

## Core Card Design Philosophy

Each card should belong to one of four roles:

- **Economy**
- **Control**
- **Growth**
- **Stability**

This ensures strategic diversity even with a small deck.

---

## Starter Cards

### 1. Funding

| Field | Value |
| --- | --- |
| **Role** | Economy |
| **Cost** | 0 funding |
| **Effect** | Gain +1 funding this turn (not +1 Treasury stat) |
| **Copies** | 3 |
| **Purpose** | Prevent dead turns; enable combo turns; smooth bad draws; helps expensive cards |
| **Notes** | Simple and necessary starter resource card. |

### 2. Crackdown

| Field | Value |
| --- | --- |
| **Role** | Control |
| **Cost** | 2 funding |
| **Effect** | **MVP:** Resolve **one harmful event** among the two current events (**Trade Opportunity** cannot be chosen) |
| **Copies** | 3 |
| **Purpose** | Immediate danger removal; protect Legitimacy; strong against pressure turns |
| **Notes** | Later versions may restrict this to tag-based events (Unrest/Crisis, and so on). |

### 3. Reform

| Field | Value |
| --- | --- |
| **Role** | Growth |
| **Cost** | 2 funding |
| **Effect** | **Power +1** (immediate; affects **next** turn’s **Draw phase** size). **Draw 1** **immediately** when played (**Action phase**), respecting **hand cap 10** (no draw if the hand is full). |
| **Copies** | 3 |
| **Purpose** | Long-term scaling; better future turns; improves consistency |
| **Notes** | Key strategic card. **Multiple Reform** plays in one Action phase **stack** **Power +1** for the **next** turn’s draws and each triggers its own **immediate Draw 1** in play order (hand cap). See `gameplay.md` (**Turn structure**, **Hand size**). |

### 4. Ceremony

| Field | Value |
| --- | --- |
| **Role** | Stability / Victory |
| **Cost** | 2 funding |
| **Effect** | Legitimacy +1 |
| **Copies** | 3 |
| **Purpose** | Progress toward win condition; increase retained hand size; recover after crises |
| **Notes** | Slow but essential card. |

---

## Full Starter Deck Summary

| Card Name | Cost | Effect | Role | Copies |
| --- | --- | --- | --- | --- |
| Funding | 0 | Gain +1 funding this turn | Economy | 3 |
| Crackdown | 2 | MVP: resolve one harmful event (not Trade Opportunity) | Control | 3 |
| Reform | 2 | Power +1 (next turn draw size); Draw 1 now (hand cap 10) | Growth | 3 |
| Ceremony | 2 | Legitimacy +1 | Stability | 3 |

---

## Intended Strategic Tension

The player should constantly choose:

### Use funding for immediate survival

Play **Crackdown** or pay event solve costs to defuse harmful events.

### Use funding for long-term growth

Play **Reform** to improve future turns.

### Use funding for political stability

Play **Ceremony** to move toward victory and retain more cards.

### Use funding for tempo

Play **Funding** to enable bigger turns.

---

## Example Turn Decisions

**Current state:**

- Treasury stat = 3 (so income adds **3 funding** this turn, before other effects)
- Funding available this turn: assume **3** after income (example)
- Power = 2
- Legitimacy = 2

**Hand:** Funding, Reform, Ceremony

**Events:** Public Unrest, Budget Strain

**Choices:**

- **Safe play:** Funding → Ceremony (protect legitimacy).
- **Greedy play:** Funding → Reform (risk event penalty, scale future turns).

This is desired gameplay tension.

---

## Balance Notes

### Funding

- If too weak: gain +2 **funding** this turn instead.
- If too strong: exhaust after use.

### Crackdown

- If mandatory every turn: lower event pressure or reduce copies.

### Reform

- Very important benchmark card.
- If too strong: remove draw 1.
- If too weak: cost becomes 1.

### Ceremony

- Should feel valuable but not automatic.
- If weak: add draw 1.
- If too strong: cap legitimacy gain per turn.

---

## Why Only Four Cards?

Small pools reveal system quality.

- If four cards are fun: game foundation works.
- If four cards are boring: need system redesign before adding content.

---

## Future Card Expansion Categories

Later add cards such as:

**Economy:** Taxation, Investment, Loan, Trade Deal

**Control:** Surveillance, Martial Law, Emergency Decree

**Growth:** Bureaucratic Reform, Education Program, Infrastructure

**Stability:** Festival, Public Speech, Election Victory

**Manipulation:** Propaganda, Bribery, Scandal

---

## Prototype Success Test

The starter deck succeeds if players naturally say:

- I need more economy first.
- I should have used Reform earlier.
- I got greedy and legitimacy collapsed.

That means cards are creating decisions.

---

## Final Summary

Starter deck intentionally uses only four cards: **Funding**, **Crackdown**, **Reform**, **Ceremony**.

These four cards test the entire strategic loop: economy, survival, scaling, victory progress.

If this works, larger card systems can be built safely.

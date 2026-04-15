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

## Chapter 1 Deck Size

Initial deck for **level `firstMandate`** (see [`src/data/levelContent.ts`](../src/data/levelContent.ts) `starterDeckTemplateOrder`):

```text
13 cards total
5 card templates (Royal Levy ×4, Royal Intervention ×3, Administrative Reform ×2, Versailles Ceremony ×2, Royal Manufactories ×2)
```

This is the baseline chapter deck.

---

## Chapter 2 deck differences (current implementation)

- **Standalone Chapter 2** starts from a 14-card list:
  - `funding×4`, `crackdown×3`, `reform×2`, `ceremony×2`, `grainRelief×1`, `taxRebalance×1`, `diplomaticCongress×1`.
- **Continuity Chapter 2** (after Chapter 1 victory) carries over card **instances** from Chapter 1, keeps their per-instance inflation stacks, and allows **remove-only refit** (remove 0–3 cards, no additions).
- `diplomaticCongress` adds one temporary `diplomaticIntervention` directly to hand.
- `suppressHuguenots` and `fiscalBurden` are scripted cards injected by Chapter 2 events, not starter cards.

---

## Economy terms (prototype)

- **Treasury stat:** persistent fiscal capacity; each **Income phase** adds **funding** equal to this stat.
- **Funding:** spendable money **this turn** only (MVP: unspent funding is cleared at **End phase**). **Card costs** and most **event solve** spends use **funding**.
- **Hand cap (MVP):** **12** cards max in hand; draws that would exceed the cap are **skipped** (see `gameplay.md`).

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

### 1. Funding (Royal Levy)

| Field | Value |
| --- | --- |
| **Role** | Economy |
| **Cost** | 0 funding |
| **Effect** | Gain +1 funding this turn (not +1 Treasury stat) |
| **Copies** | 4 |
| **Purpose** | Prevent dead turns; enable combo turns; smooth bad draws; helps expensive cards |
| **Notes** | Simple and necessary starter resource card. |

### 2. Crackdown (Royal Intervention)

| Field | Value |
| --- | --- |
| **Role** | Control |
| **Cost** | 1 funding |
| **Effect** | **MVP:** Resolve **one harmful** event among those currently shown (**Colonial Trade Boom** cannot be chosen) |
| **Copies** | 3 |
| **Purpose** | Immediate danger removal; protect Legitimacy; strong against pressure turns |
| **Notes** | Later versions may restrict this to tag-based events (Unrest/Crisis, and so on). |

### 3. Reform (Administrative Reform)

| Field | Value |
| --- | --- |
| **Role** | Growth |
| **Cost** | 2 funding |
| **Effect** | **Power +1** (immediate; affects **next** turn’s **Draw phase** size). **Draw 1** **immediately** when played (**Action phase**), respecting **hand cap 12** (no draw if the hand is full). |
| **Copies** | 2 |
| **Purpose** | Long-term scaling; better future turns; improves consistency |
| **Notes** | Key strategic card. **Multiple Reform** plays in one Action phase **stack** **Power +1** for the **next** turn’s draws and each triggers its own **immediate Draw 1** in play order (hand cap). See `gameplay.md` (**Turn structure**, **Hand size**). |

### 4. Ceremony (Versailles Ceremony)

| Field | Value |
| --- | --- |
| **Role** | Stability / Victory |
| **Cost** | 2 funding |
| **Effect** | Legitimacy +1 |
| **Copies** | 2 |
| **Purpose** | Progress toward win condition; increase retained hand size; recover after crises |
| **Notes** | Slow but essential card. |

### 5. Development (Royal Manufactories)

| Field | Value |
| --- | --- |
| **Role** | Economy / growth |
| **Cost** | 3 funding |
| **Effect** | **Treasury stat +1** |
| **Copies** | 2 |
| **Purpose** | Long-term fiscal scaling toward the Treasury win target |
| **Notes** | Matches `development` in `levelContent` / `cards.ts`. |

---

## Full Starter Deck Summary

| Card name (UI) | Cost | Effect | Role | Copies |
| --- | --- | --- | --- | --- |
| Royal Levy | 0 | Gain +1 funding this turn | Economy | 4 |
| Royal Intervention | 1 | MVP: resolve one harmful event (not Colonial Trade Boom) | Control | 3 |
| Administrative Reform | 2 | Power +1 (next turn draw size); Draw 1 now (hand cap 12) | Growth | 2 |
| Versailles Ceremony | 2 | Legitimacy +1 | Stability | 2 |
| Royal Manufactories | 3 | Treasury stat +1 | Economy | 2 |

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

Starter deck uses **five** templates (**Royal Levy**, **Royal Intervention**, **Administrative Reform**, **Versailles Ceremony**, **Royal Manufactories**) totaling **13** cards—enough to test economy, survival, scaling, legitimacy, and Treasury growth.

If this works, larger card systems can be built safely.

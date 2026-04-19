# Deck of Mandate — Card System Reference (Current)

## 1. Card templates in current code

| ID | Cost | Tags | Core effect |
| --- | ---: | --- | --- |
| `funding` | 0 | `royal` | gain funding +1 |
| `crackdown` | 1 | `royal` | enter harmful-event target selection |
| `reform` | 2 | `inflation` | power +1, draw 1 |
| `ceremony` | 2 | `inflation` | legitimacy +1 |
| `development` | 3 | `inflation` | treasuryStat +1 |
| `grainRelief` | 3 | `inflation` | add 1-turn draw+ and legitimacy+ statuses; may auto-resolve one `risingGrainPrices` |
| `taxRebalance` | 2 | `inflation` | treasuryStat +1, add 2-turn draw penalty status |
| `diplomaticCongress` | 3 | *(none)* | power +1, also generates `diplomaticIntervention` to hand |
| `diplomaticIntervention` | 0 | `extra` | harmful-event target selection (like crackdown channel) |
| `fiscalBurden` | 2 | *(none)* | on draw: funding -1; can be played to purge itself |
| `antiFrenchContainment` | 2 | *(none)* | on draw: legitimacy -1; can be played to purge itself |
| `suppressHuguenots` | 3 | `temp` | consumes huguenot containment stacks; may clear self-family cards when finished |

## 2. Tags semantics

- `royal`: can be blocked by `royalBan` status.
- `inflation`: eligible for per-instance inflation cost growth (with chapter-specific activation rules).
- `temp`: temporary card type; generally not retained/discard-cycled like normal permanent pool cards.
- `extra`: generated helper cards, cleaned when level ends.

## 3. Limited-use system

Limited-use templates:

- `funding`
- `crackdown`
- `diplomaticIntervention`
- `development`

Usage rules:

- Each instance stores `remaining/total`.
- Playing decrements remaining.
- At 0 remaining, instance is exhausted and removed from future use.
- Depletion side-effects:
  - exhausted `crackdown` => power -1
  - exhausted `funding` => treasuryStat -1
  - exhausted `diplomaticIntervention` => no stat penalty (log only)

Chapter defaults:

- Chapter 1: `funding` and `crackdown` total uses = 4; `development` total uses = 2.
- Chapter 2 defaults for these templates initialize with reduced remaining uses (notably many royal/economic carry-ins start at remaining 1 unless overridden by carried state).

## 4. Inflation system

- Inflation tracked **per card instance**.
- Trigger: when discard is reshuffled into deck, qualifying instance gets +1 inflation stack.
- Playable cost:

```text
effectiveCost = baseCost + inflationStack(instance)
```

Activation:

- Chapter 2: always active.
- Chapter 1: activates once `power + treasuryStat + legitimacy >= 12`.

## 5. Chapter starter composition

### Chapter 1 (`firstMandate`)

`funding x4`, `crackdown x3`, `reform x2`, `ceremony x2`, `development x2`.

### Chapter 2 (`secondMandate`, fixed added package)

`grainRelief x2`, `taxRebalance x2`, `diplomaticCongress x1` are always added to the chapter-2 pool build.

(Continuity mode also carries chapter-1 instances, subject to remove-only refit and max 3 removals.)

## 6. Special runtime card interactions

- `fiscalBurden`: draw-time funding drain is immediate on draw, not on play.
- `antiFrenchContainment`: draw-time legitimacy drain is immediate on draw, not on play.
- `diplomaticCongress`: besides template effects, reducer adds one `diplomaticIntervention` into hand.
- `grainRelief`: besides status adds, reducer resolves one unresolved `risingGrainPrices` if present.
- `suppressHuguenots`: decrements `huguenotContainment` status counter and cleans related temporary cards when counter finishes.

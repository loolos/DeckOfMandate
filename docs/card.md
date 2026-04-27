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
| `diplomaticCongress` | 4 | *(none)* | power +1, also generates `diplomaticIntervention` to hand |
| `diplomaticIntervention` | 0 | `extra` | harmful-event target selection (like crackdown channel) |
| `fiscalBurden` | 2 | *(none)* | on draw: funding -1; can be played to purge itself |
| `antiFrenchContainment` | dynamic | *(none)* | on draw: 50/50 lose 1 power or legitimacy; play cost = `max(1, floor(Europe Alert progress / 2))` (never below 1); can be played to purge itself |
| `suppressHuguenots` | 3 | `extra` | consumes huguenot containment stacks; may clear self-family cards when finished. Implementation note: it does **not** rely on the `temp` tag for the no-discard behavior — a dedicated `PLAY_CARD` branch removes it from hand without pushing to discard. |
| `religiousTensionCard` | 2 | `extra` | draw has no immediate effect; can be played to purge itself (removed, not discarded). Inserted into draw pile when `arminianTension`, `huguenotTension`, or `jesuitPatronage` is resolved |
| `jesuitCollege` | 2 | `extra` | limited use (Remaining 1/1); on play: legitimacy +1, plus auto-resolves one unresolved `jansenistTension` if any; exhaustion removes it from circulation with **no** stat penalty; purged at chapter end. Inserted into draw pile (×2) together with one `religiousTensionCard` when `jesuitPatronage` is resolved |

## 2. Tags semantics

- `royal`: can be blocked by `royalBan` status.
- `inflation`: eligible for per-instance inflation cost growth (with chapter-specific activation rules).
- `temp`: temporary card type. The runtime helper `isTemporaryCardInstance` only matches this tag (no other tag substitutes for it).
- `extra`: generated helper cards, cleaned when level ends. Note: `suppressHuguenots` is `extra`; its "does not enter discard" behavior comes from a dedicated reducer branch, **not** from the `temp` tag.

## 3. Limited-use system

Limited-use templates:

- `funding`
- `crackdown`
- `diplomaticIntervention`
- `development`
- `jesuitCollege` (Remaining 1/1, single-use)

Usage rules:

- Each instance stores `remaining/total`.
- Playing decrements remaining.
- At 0 remaining, instance is exhausted and removed from future use.
- Depletion side-effects:
  - exhausted `crackdown` => power -1
  - exhausted `funding` => treasuryStat -1
  - exhausted `diplomaticIntervention` => no stat penalty (log only)
  - exhausted `development` => no stat penalty (log only)
  - exhausted `jesuitCollege` => no stat penalty; instance does not enter discard, and any remaining `extra`-tagged copies are purged at chapter end

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
- Chapters 1 and 3: activate once `power + treasuryStat + legitimacy >= 12` (pressure-threshold inflation).

## 5. Chapter starter composition

### Chapter 1 (`firstMandate`)

`funding x4`, `crackdown x3`, `reform x2`, `ceremony x2`, `development x2`.

### Chapter 2 (`secondMandate`, fixed added package)

`grainRelief x2`, `taxRebalance x2`, `diplomaticCongress x1` are always added to the chapter-2 pool build.

(Continuity mode also carries chapter-1 instances, subject to remove-only refit and max 3 removals.)

### Chapter 3 (`thirdMandate`)

Core library matches Chapter 2’s sixteen-template `starterDeckTemplateOrder` in `thirdMandate.ts` (`reform`×2, `ceremony`×2, `grainRelief`×2, `taxRebalance`×2, `diplomaticCongress`×2), plus **eight** chapter-3-only copies shuffled into the full deck (two each):

| ID | Cost | Tags | Core effect (high level) |
| --- | ---: | --- | --- |
| `bourbonMarriageProclamation` | 3 | `successionContest` | power +1, succession track +1, adds short `bourbonMarriageRetention` status |
| `grandAllianceInfiltrationDiplomacy` | 3 | `successionContest` | succession track +1, draw 1; also sets one-turn opponent cost discount (see reducer) |
| `italianTheaterTroopRedeploy` | 3 | `successionContest` | succession track +2, injects `fiscalBurden` into deck |
| `usurpationEdict` | 3 | `successionContest` | succession track +2, draw 1, adds temporary `legitimacyCrisis` status |

Nantes carryover may inject four `religiousTensionCard` or four `jansenistReservation` instead (`thirdMandateStart.ts`). `limitedUseByTemplateId` on the level bumps several templates (e.g. `funding` / `crackdown` / `development` total **3**, `diplomaticIntervention` **2**); see `src/levels/sunking/chapters/thirdMandate.ts`.

## 6. Special runtime card interactions

- `fiscalBurden`: draw-time funding drain is immediate on draw, not on play.
- `antiFrenchContainment`: draw-time penalty is immediate on draw (50/50: power -1 or legitimacy -1), not on play; play cost is `max(1, floor(europeAlertProgress / 2))` (always at least 1, including when progress is 0).
- `diplomaticCongress`: besides template effects, reducer adds one `diplomaticIntervention` into hand.
- `grainRelief`: besides status adds, reducer resolves one unresolved `risingGrainPrices` if present.
- `suppressHuguenots`: decrements `huguenotContainment` status counter and cleans related temporary cards when counter finishes.
- `religiousTensionCard`: drawing it has no effect; on play it is removed from hand without entering the discard pile (purged from the deck cycle).

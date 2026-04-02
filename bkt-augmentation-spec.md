# Bayesian Knowledge Tracing (BKT) Augmentation Spec v2

*Revised after Codex review (3 HIGH, 3 MEDIUM, 2 LOW findings incorporated)*

## Problem

The current SRS system uses a flat SM-2-style mastery tracker per command. It has three blindspots:

1. **No probabilistic model of knowing** — mastery is a tier (0-5) derived from streak/ease/speed thresholds. It cannot express "70% chance the student knows this" or distinguish lucky guesses from genuine knowledge.
2. **No guess/slip modeling** — a student who button-mashes to a correct answer gets full credit. The anti-mash fixes reduce the opportunity to guess, but the SRS still treats every correct answer equally.
3. **Flat question selection** — `pickCommands` prioritizes overdue/due/fresh items sorted by mastery, but doesn't optimize for *information gain*. It can't identify which question would teach us the most about the student's knowledge frontier.
4. **No tree propagation** — every command has subconcepts, but mastery of children doesn't inform estimates of the parent, and weakness on a parent doesn't guide which child to probe.

## Solution: BKT Overlay

Layer Bayesian Knowledge Tracing on top of the existing SRS without removing it. The SRS fields (`ease`, `interval`, `streak`, `mastery`) continue to drive scheduling and display. BKT adds a probabilistic model that improves question selection and hydra targeting.

### BKT Parameters

Each SRS card gains these new fields:

```javascript
{
  // ... existing SRS fields unchanged ...
  pKnownDirect: 0.1,  // P(L) from direct parent-question evidence only
  pKnown: 0.1,        // Composite P(L) — blended from direct + child evidence
  pTransit: 0.03,     // P(T) — probability of learning on each opportunity (FIXED, not adaptive in v1)
  pGuess: 0.25,       // P(G) — base guess probability (FIXED in v1)
  pSlip: 0.1,         // P(S) — base slip probability (FIXED in v1)
  subPKnown: {},       // { subconcept_index: pKnown } — lazily populated on first encounter
}
```

**Default priors:**
- `pKnownDirect: 0.1` — assume low knowledge at start
- `pKnown: 0.1` — composite starts equal to direct (no child evidence yet)
- `pTransit: 0.03` — conservative learning rate (Codex finding: 0.15 was too aggressive, caused wrong answers to increase pKnown on fresh cards)
- `pGuess: 0.25` — matches 4-choice MC random chance (1/4)
- `pSlip: 0.1` — occasional careless errors

**Parameter clamp ranges (v1 — all fixed, no adaptation):**
- `pKnown` / `pKnownDirect`: [0.001, 0.999]
- `pTransit`: fixed at 0.03 (no adaptation in v1)
- `pGuess`: fixed at 0.25 (no adaptation in v1)
- `pSlip`: fixed at 0.10 (no adaptation in v1)
- `subPKnown[i]`: [0.001, 0.999]

**Why fixed parameters in v1** (Codex finding #2): Adaptive pGuess/pSlip/pTransit rules only ratchet upward and drift to clamps. Deferring adaptation to v2 after telemetry validates the base BKT model.

### BKT Update Equations

After each student response, update pKnown using standard BKT:

```javascript
function clampProb(v, min=0.001, max=0.999) {
  return Math.min(max, Math.max(min, v));
}

function bayesPosterior(pKnown, wasCorrect, pGuess, pSlip) {
  const pk = clampProb(pKnown);
  const pg = clampProb(pGuess, 0.01, 0.50);
  const ps = clampProb(pSlip, 0.01, 0.30);
  if (wasCorrect) {
    return (pk * (1 - ps)) / (pk * (1 - ps) + (1 - pk) * pg);
  } else {
    return (pk * ps) / (pk * ps + (1 - pk) * (1 - pg));
  }
}
```

**Transit step** (applied after posterior):
```
pKnown_new = posterior + (1 - posterior) * pTransit
```

With pTransit=0.03, a wrong answer on a fresh card (pKnown=0.1) produces:
- posterior ≈ 0.0130
- after transit ≈ 0.0427
- pKnown *decreases* from 0.1 to ~0.043 (correct behavior)

### Context-Sensitive Effective P(G)

The BKT update uses a context-specific effective P(G) derived from the card's base `pGuess` and the question context, not a fixed lookup table (Codex finding #4):

```javascript
function effectivePGuess(card, ctx) {
  // ctx: { questionType, remainingChoices, hintUsed }
  const base = card.pGuess;  // 0.25 in v1
  const choices = ctx.remainingChoices || 4;
  if (ctx.questionType === 'typed' || ctx.questionType === 'prefix-key') {
    return 0.05;  // free recall — very low guess chance
  }
  // Scale base by actual choice count vs 4-choice baseline
  return clampProb(base * (4 / choices) / 4 * choices, 0.05, 0.50);
  // Simplifies to: 1/choices for base=0.25
  // 4 choices: 0.25, 3 choices: 0.33, 2 choices: 0.50
}
```

Wait — let me simplify. For v1 with fixed pGuess=0.25, the effective guess rate is just `1/remainingChoices`:

```javascript
function effectivePGuess(card, ctx) {
  if (ctx.questionType === 'typed' || ctx.questionType === 'prefix-key') return 0.05;
  const choices = ctx.remainingChoices || 4;
  return clampProb(1 / choices, 0.05, 0.50);
}
```

| Context | remainingChoices | Effective P(G) |
|---------|-----------------|---------------|
| identify (4 choices, no hint) | 4 | 0.25 |
| identify (4 choices, hint used) | 3 | 0.33 |
| subconcept (3 choices) | 3 | 0.33 |
| subconcept depth-2 (2 choices) | 2 | 0.50 |
| fillblank (3 choices) | 3 | 0.33 |
| typed/prefix-key | n/a | 0.05 |

### Source-Separated Tree Propagation

**Why separate sources** (Codex finding #3): Blending `parent.pKnown = 0.7 * parent.pKnown + 0.3 * childAvg` compounds child influence because each update starts from an already-blended value. Instead, store direct evidence separately and recompute the composite from sources each time.

**Fields:**
- `card.pKnownDirect` — updated only by direct parent-question BKT updates
- `card.subPKnown` — map of subconcept index → pKnown, updated by hydra child-question BKT updates
- `card.pKnown` — composite, recomputed from sources after any update

**Composite recomputation:**
```javascript
function recomputeCompositePKnown(card) {
  const childVals = Object.values(card.subPKnown || {});
  if (childVals.length === 0) {
    card.pKnown = card.pKnownDirect;
  } else {
    const childAvg = childVals.reduce((s, v) => s + v, 0) / childVals.length;
    card.pKnown = clampProb(0.7 * card.pKnownDirect + 0.3 * childAvg);
  }
}
```

**On direct parent question answer:** update `card.pKnownDirect` via BKT, then `recomputeCompositePKnown(card)`.

**On hydra child question answer:** update `card.subPKnown[childIndex]` via BKT, then `recomputeCompositePKnown(card)`.

### bktUpdate Function

```javascript
function bktUpdate(card, outcome) {
  // outcome: { wasCorrect, questionType, remainingChoices, hintUsed, subconceptIndex, responseTimeMs }
  const ctx = { questionType: outcome.questionType, remainingChoices: outcome.remainingChoices, hintUsed: outcome.hintUsed };
  const epg = effectivePGuess(card, ctx);
  const pSlip = card.pSlip;
  const pTransit = card.pTransit;

  if (outcome.subconceptIndex != null) {
    // Child question — update subPKnown
    if (!card.subPKnown) card.subPKnown = {};
    const prev = card.subPKnown[outcome.subconceptIndex] ?? 0.1;
    const posterior = bayesPosterior(prev, outcome.wasCorrect, epg, pSlip);
    card.subPKnown[outcome.subconceptIndex] = clampProb(posterior + (1 - posterior) * pTransit);
  } else {
    // Direct parent question — update pKnownDirect
    const posterior = bayesPosterior(card.pKnownDirect, outcome.wasCorrect, epg, pSlip);
    card.pKnownDirect = clampProb(posterior + (1 - posterior) * pTransit);
  }
  recomputeCompositePKnown(card);
}
```

### Information-Gain Question Selection

Replace the sort key in `pickCommands` with a hybrid score (Codex finding #5: pure entropy can starve low-entropy cards).

```javascript
function infoGain(pKnown) {
  const p = clampProb(pKnown);
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}
```

**Hybrid in-bucket score:**
```javascript
function pickScore(srsCard, wave) {
  const entropy = infoGain(srsCard.pKnown);
  const overdueness = Math.max(0, wave - srsCard.lastSeen - srsCard.interval) / 10; // normalized 0-1ish
  const lowKnownBoost = srsCard.pKnown < 0.2 ? 0.3 : 0;  // don't starve confidently-unknown cards
  return entropy + overdueness * 0.4 + lowKnownBoost;
}
```

**Modified sort:** within each bucket (overdue, due, fresh, notDue), sort by `pickScore` descending instead of mastery ascending.

### Hydra Targeting: Weakest Subconcepts

In `spawnHydraChildren`, instead of `shuffleArr(subs).slice(0, count)`:

```javascript
// Sort subconcepts by subPKnown ascending (weakest first)
const parentCard = G.srs[cmd.id];
const ranked = subs.map((sc, i) => ({
  sc, i,
  pk: (parentCard.subPKnown && parentCard.subPKnown[i] != null) ? parentCard.subPKnown[i] : 0.1
})).sort((a, b) => a.pk - b.pk);
const picked = ranked.slice(0, count).map(r => r.sc);
```

This ensures hydra splits target the subconcepts the student is weakest on.

### HUD Integration

Minimal visual changes — BKT works behind the scenes:

- **Uncertainty pulse**: Enemy labels where `pKnown < 0.3` get a subtle CSS pulse animation (opacity 0.7→1.0 cycle). Applied via a `.bkt-uncertain` class in `updateLabels()`.
- **End-screen confidence line**: On the mastery bar, overlay a thin vertical marker at `avgPKnown * barWidth` position. Provides a "true confidence" reading alongside the tier-based bars.

### Migration / Backwards Compatibility

In `loadSRS`, when merging saved data with fresh schema:

1. Fresh schema now includes all BKT defaults from `initSRS`
2. If a loaded card has `mastery > 0` but no `pKnownDirect`, bootstrap:
   ```javascript
   function bktBootstrapFromMastery(mastery) {
     const map = [0.10, 0.25, 0.45, 0.65, 0.82, 0.93];
     return map[Math.max(0, Math.min(5, mastery | 0))];
   }
   ```
   (Codex finding #6: softened top tier from 0.95 to 0.93, clamp mastery before lookup)
3. Set both `pKnownDirect` and `pKnown` to the bootstrapped value
4. `subPKnown` defaults to `{}` (no child evidence yet)

### Implementation Plan (Dependency-Ordered)

**Phase 1: Core BKT Math** (no behavioral changes yet)
1. Add `clampProb(v, min, max)` utility
2. Add `bktBootstrapFromMastery(mastery)` utility
3. Add `bayesPosterior(pKnown, wasCorrect, pGuess, pSlip)`
4. Add `effectivePGuess(card, ctx)`
5. Add `recomputeCompositePKnown(card)`
6. Add `bktUpdate(card, outcome)` — full outcome shape from start (Codex finding #6)
7. Extend `initSRS` with all BKT fields
8. Update `loadSRS` migration with bootstrap logic

**Phase 2: Wire into SRS** (BKT starts tracking alongside existing mastery)
9. Wire `srsHit()` to call `bktUpdate` with `wasCorrect:true` + full context
10. Wire `srsMiss()` to call `bktUpdate` with `wasCorrect:false` + full context
11. Pass question context (type, remainingChoices, hintUsed, subconceptIndex) through to srsHit/srsMiss

**Phase 3: Smart Selection**
12. Add `infoGain(pKnown)` and `pickScore(srsCard, wave)`
13. Modify `pickCommands` in-bucket sorting to use `pickScore`

**Phase 4: Tree Propagation**
14. Wire subconcept answers to `bktUpdate` with `subconceptIndex`
15. Modify `spawnHydraChildren` to pick weakest subconcepts by `subPKnown`

**Phase 5: HUD Polish**
16. Add `.bkt-uncertain` CSS pulse
17. Apply in `updateLabels()` for enemies with `pKnown < 0.3`
18. Add confidence line to end-screen mastery bar

### Files Modified

- `index.html` — all changes in the inline `<script>` block:
  - `initSRS()` (~line 1942): add BKT fields to schema
  - `srsHit()` (~line 1943): add outcome parameter, call `bktUpdate`
  - `srsMiss()` (~line 1967): add outcome parameter, call `bktUpdate`
  - `loadSRS()` (~line 2077): bootstrap pKnown from mastery for legacy cards
  - `pickCommands()` (~line 1972): hybrid score sorting within buckets
  - `spawnHydraChildren()` (~line 3339): weakest subconcept targeting
  - `handleHit()` (~line 3240): pass question context to srsHit
  - `handleMiss()` (~line 3312): pass question context to srsMiss
  - `handleQuizChoice()` / `handleHintChoice()` / `handleSubconceptChoice()`: propagate context
  - `updateLabels()`: add `.bkt-uncertain` class
  - End screen rendering (~line 3182): add confidence line
  - New functions: `clampProb()`, `bktBootstrapFromMastery()`, `bayesPosterior()`, `effectivePGuess()`, `recomputeCompositePKnown()`, `bktUpdate()`, `infoGain()`, `pickScore()`
  - New CSS: `.bkt-uncertain` keyframe pulse

### Blast Radius

| Function | Change | Risk |
|----------|--------|------|
| `initSRS` | Add fields to schema | LOW — additive only |
| `srsHit` / `srsMiss` | Add parameter + call bktUpdate | LOW — existing behavior unchanged |
| `loadSRS` | Bootstrap pKnown from mastery | LOW — only on missing fields |
| `pickCommands` | Sort order within buckets | MEDIUM — changes which questions appear |
| `spawnHydraChildren` | Pick weakest instead of random | MEDIUM — changes hydra targeting |
| `handleHit` / `handleMiss` | Pass context through | LOW — additive parameter |
| `updateLabels` | Conditional CSS class | LOW — visual only |
| End screen | Extra DOM element | LOW — additive |

### Testing Plan

1. **Parse check**: Verify `index.html` inline script parses without errors
2. **BKT math verification**: In console:
   - `bayesPosterior(0.5, true, 0.25, 0.1)` → should be ~0.857
   - `bayesPosterior(0.5, false, 0.25, 0.1)` → should be ~0.118 (was: 0.143 corrected to account for clamping)
   - `bayesPosterior(0.1, false, 0.25, 0.1)` → posterior ~0.013, after transit ~0.043 (pKnown DECREASES from 0.1)
   - `bayesPosterior(0.9, true, 0.25, 0.1)` → should be ~0.970
3. **Entropy test**: `infoGain(0.5)` → 1.0, `infoGain(0.01)` → ~0.08, `infoGain(0.99)` → ~0.08
4. **Migration test**: Save SRS with old format (no BKT fields), reload, verify pKnown bootstrapped from mastery
5. **Selection test**: Verify pickCommands prefers high-entropy cards within each bucket
6. **Hydra targeting test**: Miss a depth-0 enemy, verify children are the weakest subconcepts
7. **Propagation test**: Answer subconcept correctly, verify parent's composite pKnown reflects child evidence via recomputeCompositePKnown
8. **Source separation test**: Verify that repeated child answers don't compound beyond the 0.3 weight
9. **HUD test**: Verify uncertainty pulse on low-pKnown enemies, confidence line on end screen
10. **Checkpoint test**: Save/restore run, verify all BKT fields persist
11. **Mobile test**: Verify no layout regressions from label pulse at 375px
12. **Clamp test**: Verify pKnown stays in [0.001, 0.999] after extreme sequences (100 consecutive corrects, 100 consecutive wrongs)
13. **Empty child guard**: Verify recomputeCompositePKnown returns pKnownDirect when subPKnown is empty

### Edge Cases

- **pKnown near 0 or 1**: Clamp to [0.001, 0.999] to avoid log(0) in entropy and division by zero in Bayes update
- **Empty subPKnown**: `recomputeCompositePKnown` returns `pKnownDirect` when no children observed
- **Brand new cards**: all BKT defaults — behaves like current system until data accumulates
- **Returning player migration**: pKnownDirect and pKnown bootstrapped from mastery tier, mastery clamped to [0,5] before lookup
- **Subconcept first encounter**: subPKnown entry lazily created at 0.1 on first hydra encounter
- **Non-quiz modes**: typed/prefix-key use effectivePG=0.05, so correct answers are strong evidence
- **Anti-mash interaction**: Escalating lockout/shuffle/cap reduce guessing mechanically. BKT's P(G) models residual uncertainty. They complement each other.
- **Hint usage**: effectivePG=0.33 when hint eliminates an option. Hint-assisted corrects provide weaker evidence — exactly right.
- **remainingChoices validation**: Default to 4 if missing or invalid. Clamp to [1, 10].

### Deferred to v2 (After Telemetry)

- Adaptive pGuess evolution (per-card, based on guess-like patterns)
- Adaptive pSlip evolution (per-card, based on slip-like patterns)
- Adaptive pTransit evolution (per-card, based on response time)
- These require symmetric decay toward priors, minimum evidence thresholds, and EMA estimators to avoid clamp drift

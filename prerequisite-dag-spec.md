# Prerequisite DAG Spec — Fractal Knowledge Decomposition

*Replaces flat `subconcepts[]` with a recursive prerequisite graph. Wrong answers fractal-unfold into builder concepts down to Algebra 1.*

*Revised after review (3 HIGH, 11 MEDIUM findings incorporated)*

## Problem

The current hydra system has a fixed two-level ceiling:

1. **Depth 0** (parent formula) → miss → splits into **depth 1** (3 subconcept MC questions) → miss → splits into **depth 2** (2 binary true/false)
2. Every subconcept is *explanatory* ("Why divide by n?") — tests reasoning about the formula, not component skills
3. Subconcepts are flat lists per command — no sharing across commands, no deeper decomposition
4. A student who can't answer "Why divide by n?" gets the same binary re-ask. The system can't diagnose whether the gap is "doesn't understand division," "doesn't understand averaging," or "doesn't know what n represents"
5. All 66 commands have 3 subconcepts each (198 total), but they're all at the same depth — no deeper diagnostic path

## Solution: Prerequisite DAG

Replace `subconcepts[]` with a **Directed Acyclic Graph** of prerequisite knowledge nodes. Each node represents a testable concept that can itself decompose into deeper prerequisites. The hydra mechanic becomes recursive: miss a node → its prerequisites spawn, down to Algebra 1 foundations.

### Design Principles

1. **Fractal unfolding, not cascade explosion** — one level at a time. First miss spawns L1. L1 must be encountered and missed again before L2 spawns.
2. **Shared conceptual nodes** — "What does SE measure?" is one node referenced by CI, hypothesis test, and regression commands.
3. **Two node types** — *conceptual* ("What does X represent?") and *computational* ("Compute X given these values").
4. **Five depth levels** — L0 (AP Stats formula) → L1 (major components) → L2 (building blocks) → L3 (algebra foundations) → L4 (arithmetic).
5. **BKT-tracked** — each DAG node has its own `pKnown` in the parent command's SRS card, enabling weakest-first targeting.

---

## DAG Node Format

**`level` vs `splitDepth`**: The `level` field is **advisory** (authored metadata for documentation/tooling). Runtime behavior — speed, color, mesh scale, MC option count — is governed by `splitDepth` (dynamic, computed as `parent.splitDepth + 1` when an enemy spawns). A build-time `validateDAG()` check warns if `level` doesn't match actual graph depth, but mismatches don't break gameplay.

**Wrong-answer authoring rule**: Each node provides exactly **2 wrong answers** in its `wrong` array. At runtime:
- `splitDepth` 1-2 → 3-option MC (correct + 2 wrong)
- `splitDepth` 3-4 → 2-option MC (correct + 1 wrong, randomly picked from array)

```javascript
// Flat lookup table — all nodes live here
const PREREQ_DAG = {
  'se-concept': {
    id: 'se-concept',
    type: 'conceptual',          // 'conceptual' | 'computational'
    level: 1,                    // Advisory — actual depth from splitDepth at runtime
    q: 'What does Standard Error measure?',
    correct: 'How much a statistic varies across repeated samples',
    wrong: ['The average error in each measurement', 'The distance between sample and population'],
    prereqs: ['sampling-variability', 'sd-vs-se'],  // DAG edges → deeper nodes
  },

  'sampling-variability': {
    id: 'sampling-variability',
    type: 'conceptual',
    level: 2,
    q: 'Why do different random samples give different statistics?',
    correct: 'Random selection creates natural variation',
    wrong: ['Measurement error', 'Biased sampling methods'],
    prereqs: ['randomness-concept'],
  },

  'sqrt-n-effect': {
    id: 'sqrt-n-effect',
    type: 'computational',
    level: 2,
    q: 'If SD = 10 and n = 25, what is SD/sqrt(n)?',
    correct: '2',
    wrong: ['0.4', '5'],
    prereqs: ['sqrt-compute', 'division-concept'],
  },

  'sqrt-compute': {
    id: 'sqrt-compute',
    type: 'computational',
    level: 3,
    q: 'sqrt(25) = ?',
    correct: '5',
    wrong: ['12.5', '25'],
    prereqs: ['perfect-squares'],
  },

  'perfect-squares': {
    id: 'perfect-squares',
    type: 'computational',
    level: 4,
    q: '5 x 5 = ?',
    correct: '25',
    wrong: ['10', '20'],
    prereqs: [],  // Leaf node — no further decomposition
  },
};
```

### Command Integration

Each command replaces `subconcepts: [...]` with `prereqs: [...]` referencing DAG node IDs:

```javascript
// Before (current):
{
  id: 'ci-formula',
  action: 'Confidence Interval Formula',
  // ...
  subconcepts: [
    { q: 'What is the critical value?', correct: '...', wrong: ['...'] },
    { q: 'What does +/- margin of error create?', correct: '...', wrong: ['...'] },
    { q: 'What does O represent?', correct: '...', wrong: ['...'] },
  ]
}

// After (DAG):
{
  id: 'ci-formula',
  action: 'Confidence Interval Formula',
  // ...
  prereqs: ['se-concept', 'critical-value-concept', 'margin-of-error'],
  // subconcepts: [] — removed, replaced by prereqs
}
```

### Node Counts (Estimated)

All 66 commands have 3 subconcepts each (198 total subconcept questions). Many are command-specific but some can be shared after migration.

| Level | Description | Est. Nodes | Shared? |
|-------|-------------|-----------|---------|
| L0 | AP Stats formulas | 66 (existing commands) | No — each is unique |
| L1 | Major components | ~120 | Moderate — SE, df, critical value shared, but many are command-specific |
| L2 | Building blocks | ~50 | Yes — sqrt(n), proportion arithmetic |
| L3 | Algebra foundations | ~25 | Heavy sharing — basic ops |
| L4 | Arithmetic/number sense | ~10 | Heavy sharing — multiplication, fractions |
| **Total** | | **~205 new nodes** | |

### Startup Validation

On page load, `validateDAG()` runs once and logs a summary:

```javascript
function validateDAG() {
  let danglingRefs = 0, cycles = 0;
  const visited = new Set(), inStack = new Set();

  function dfs(id) {
    if (inStack.has(id)) { cycles++; return; }
    if (visited.has(id)) return;
    visited.add(id); inStack.add(id);
    const node = PREREQ_DAG[id];
    if (!node) { danglingRefs++; inStack.delete(id); return; }
    (node.prereqs || []).forEach(pid => dfs(pid));
    inStack.delete(id);
  }

  // Check all command prereqs resolve
  COMMANDS.forEach(cmd => (cmd.prereqs || []).forEach(id => dfs(id)));
  // Check all internal prereqs resolve
  Object.values(PREREQ_DAG).forEach(n => (n.prereqs || []).forEach(id => dfs(id)));

  if (danglingRefs) console.warn(`[DAG] ${danglingRefs} dangling prereq refs`);
  if (cycles) console.error(`[DAG] ${cycles} cycles detected!`);
  if (!danglingRefs && !cycles) console.log('[DAG] validation passed');
}
```

---

## Recursive Hydra: One-Level-at-a-Time Unfolding

### Core Rule

A DAG node **can split** only if it has been **previously encountered and missed** (its `pKnown < 0.3`). On first encounter, a missed node gets the speed-boost fallback — no split.

This prevents cascade explosion: one miss at L0 produces at most 2-3 L1 enemies. Those L1 enemies can only split in a *future* encounter (same run or later run) if they were missed before.

### State Machine

```
Miss L0 parent (first or any time)
  │
  ├─ Parent has prereqs? ──NO──► Speed-boost fallback (current behavior)
  │
  YES
  │
  ├─ Select weakest 1-2 prereqs by pKnown
  │   (BKT targeting, same as current spawnHydraChildren)
  │
  ├─ For each selected prereq node:
  │   │
  │   ├─ Has this node been encountered before AND pKnown < 0.3?
  │   │     │
  │   │   YES → node CAN split on miss (recursive)
  │   │     │
  │   │    NO → node is a LEAF for this encounter
  │   │         (miss = speed-boost only, pKnown updated)
  │   │
  │   └─ Spawn as enemy with splitDepth = parent.splitDepth + 1
  │
  └─ Remove parent enemy, play split SFX
```

### Encounter Tracking

Each DAG node needs a `timesEncountered` counter to implement the "previously encountered" gate. This lives in the SRS card's `dagState` map:

```javascript
// Extension to SRS card for parent command
{
  // ... existing SRS fields ...
  dagState: {
    'se-concept': { pKnown: 0.15, encounters: 2, lastEncounterWave: 4 },
    'critical-value-concept': { pKnown: 0.72, encounters: 1, lastEncounterWave: 3 },
    // ... one entry per DAG node the student has encountered
  }
}
```

**Why `dagState` instead of extending `subPKnown`?**
- `subPKnown` is indexed by integer (subconcept array index). DAG nodes have string IDs and are shared across commands.
- `dagState` stores per-node pKnown, encounter count, and last wave — richer than a bare probability.
- `subPKnown` is kept for backwards compatibility but not used by the DAG system.

### Split Decision Logic

**Critical timing**: `canNodeSplit` must be checked **before** `bktUpdateDAG` increments `encounters`. Otherwise a node's first encounter (encounters goes 0→1 inside bktUpdate) would pass the gate. The call order is:

1. Check `canNodeSplit(cmdSrs, nodeId)` — reads encounters BEFORE update
2. Make split/no-split decision
3. Call `bktUpdateDAG(cmdSrs, nodeId, wasCorrect, ctx)` — increments encounters

```javascript
function canNodeSplit(cmdSrs, nodeId) {
  const node = PREREQ_DAG[nodeId];
  if (!node || !node.prereqs || node.prereqs.length === 0) return false;  // Leaf
  const state = cmdSrs.dagState?.[nodeId];
  if (!state || state.encounters < 1) return false;  // Never seen before THIS encounter
  if (state.pKnown >= 0.3) return false;             // Student probably knows it
  return true;
}
```

### Ancestor Spawn Budget

To prevent multiplicative fan-out from producing too many enemies from a single L0 miss, each L0 ancestor tracks a **spawn budget**:

- **Max 4 total living descendants** from any single L0 ancestor at any time
- Tracked via `enemy.ancestorId` (set to the L0 enemy's `id` on first split, inherited by all descendants)
- Before spawning children, check: `G.enemies.filter(e => e.ancestorId === enemy.ancestorId).length < 4`
- If budget exhausted, deferred to next encounter (speed-boost fallback)

This caps the worst case at 1 parent + 4 descendants = 5 enemies per L0 miss, regardless of depth.

### Worked Example: Full Fractal Unfolding Across a Run

```
Wave 3: CI formula appears. Student misses.
  → Spawns L1: "What is SE?" and "What is z*?"
  → Student gets "z*" correct ✓ (branch resolved)
  → Student misses "SE" ✗ (dagState['se-concept'].pKnown drops, encounters=1)
  → SE gets speed-boost (no split — first encounter)

Wave 5: CI formula appears again. Student misses again.
  → System selects weakest prereqs: 'se-concept' is weakest (pKnown=0.12)
  → SE has encounters=1 AND pKnown < 0.3 → CAN SPLIT
  → SE splits into L2: "What does dividing by sqrt(n) do?" and "What is SD?"
  → Student gets "SD" correct ✓
  → Student misses "sqrt(n) effect" ✗ (encounters=1, no split yet)

Wave 7: CI formula appears. Student misses.
  → 'se-concept' still weak, gets selected
  → SE splits again (encounters >= 1, pKnown still low)
  → This time 'sqrt-n-effect' has encounters=1 AND pKnown < 0.3
  → 'sqrt-n-effect' CAN SPLIT → spawns L3: "sqrt(25) = ?"
  → Student gets it right ✓ → foundational gap located and resolved
```

### Explosion Control

| Guard | Value | Rationale |
|-------|-------|-----------|
| Max enemies on screen | 20 (unchanged) | Hard cap prevents visual chaos |
| Max prereqs spawned per split | 2 | Down from 3 — DAG is deeper, so fan-out must be narrower |
| Node can split only if | encounters >= 1 AND pKnown < 0.3 | Prevents first-encounter cascade |
| Max active splitDepth | 5 | Hard cap matching our 5-level design |
| Breach proximity gate | t > 0.80 at any depth | Skip spawning if enemy is about to breach |

### Speed Multipliers by Depth

| Depth | Speed Mult | Rationale |
|-------|-----------|-----------|
| L0 (parent) | 1.0x | Base speed |
| L1 | parent * 1.35 | Current behavior |
| L2 | parent * 1.25 | Slower escalation than current 1.6x — more levels to traverse |
| L3 | parent * 1.15 | Gentle — these are foundational |
| L4 | parent * 1.10 | Near-stationary — arithmetic should be trivial |

---

## BKT Integration

### DAG-Aware bktUpdate

Parameter naming: `card` is the SRS card object (`G.srs[cmd.id]`), consistent with existing BKT function signatures.

**Callers must pass `{ wave: G.wave }` in ctx** so `lastEncounterWave` is populated.

```javascript
function bktUpdateDAG(card, nodeId, wasCorrect, ctx) {
  if (!card.dagState) card.dagState = {};
  if (!card.dagState[nodeId]) {
    card.dagState[nodeId] = { pKnown: 0.1, encounters: 0, lastEncounterWave: 0 };
  }

  const state = card.dagState[nodeId];
  state.encounters++;
  state.lastEncounterWave = ctx.wave || 0;

  const epg = effectivePGuess(card, ctx);
  const pSlip = card.pSlip || 0.1;
  const pTransit = card.pTransit || 0.03;

  const posterior = bayesPosterior(state.pKnown, wasCorrect, epg, pSlip);
  state.pKnown = clampProb(posterior + (1 - posterior) * pTransit);

  // Recompute parent's composite pKnown from DAG evidence
  recomputeDAGComposite(card);
}
```

### Composite pKnown from DAG

**Only L1 (direct prereq) nodes contribute to the composite.** Deeper nodes influence the parent indirectly through their effect on L1 pKnown values over time. This prevents foundation nodes (L3-L4) from dominating the composite.

```javascript
function recomputeDAGComposite(card, cmd) {
  // Only average nodes that are direct prereqs of this command
  const directIds = cmd.prereqs || [];
  const directVals = directIds
    .map(id => card.dagState?.[id]?.pKnown)
    .filter(v => v != null);

  if (directVals.length === 0) {
    card.pKnown = card.pKnownDirect;
  } else {
    const avg = directVals.reduce((s, v) => s + v, 0) / directVals.length;
    card.pKnown = clampProb(0.7 * card.pKnownDirect + 0.3 * avg);
  }
}
```

This replaces `recomputeCompositePKnown` — same 70/30 blend, but reads from `dagState` (L1 nodes only) instead of `subPKnown`.

### Weakest Prereq Selection

**Design note — breadth-first exploration**: Default `pKnown=0.1` for unseen nodes means they're always prioritized over partially-known nodes (pKnown 0.2-0.3). This is intentional: all prereqs are encountered as leaves before any can recursively split. The system naturally explores breadth-first, then drills depth on repeated misses.

```javascript
function selectWeakestPrereqs(card, prereqIds, count) {
  const ranked = prereqIds.map(id => ({
    id,
    pKnown: card.dagState?.[id]?.pKnown ?? 0.1  // Default 0.1 for unseen
  })).sort((a, b) => a.pKnown - b.pKnown);

  return ranked.slice(0, count).map(r => r.id);
}
```

---

## Shared Node Handling

### The Problem

`'se-concept'` is a prereq of both `ci-formula` and `one-prop-z`. If a student masters SE via the CI path, should the one-prop-z path benefit?

### Solution: Per-Command DAG State

Each command maintains its own `dagState`. A shared node like `'se-concept'` has independent pKnown values under each parent command's SRS card:

```javascript
G.srs['ci-formula'].dagState['se-concept']     = { pKnown: 0.85, encounters: 4, ... }
G.srs['one-prop-z'].dagState['se-concept']      = { pKnown: 0.10, encounters: 0, ... }
```

**Why per-command, not global?**
- Avoids false transfer: understanding SE in one context doesn't guarantee understanding in another
- Simpler implementation: no cross-command state coordination
- If the student truly understands SE, they'll answer it correctly when it spawns from one-prop-z too — the system converges naturally

**V1 transfer seed**: To prevent tedium on heavily-shared L3-L4 nodes (a student who proves they can compute sqrt(25) shouldn't re-prove it 10 times), when a `dagState` entry is first created for a node, check if any other command's dagState has the same node with `pKnown > 0.5`. If so, seed the new entry at `0.3` instead of `0.1`:

```javascript
function getTransferSeed(nodeId, excludeCmdId) {
  for (const cmdId of Object.keys(G.srs)) {
    if (cmdId === excludeCmdId) continue;
    const pk = G.srs[cmdId]?.dagState?.[nodeId]?.pKnown;
    if (pk != null && pk > 0.5) return 0.3;
  }
  return 0.1;  // No prior evidence from other commands
}
```

This gives partial credit (not full transfer) and is cheap to compute.

---

## Visual Presentation

### Enemy Labels by Depth

| Depth | Label | Color | Mesh Scale |
|-------|-------|-------|-----------|
| L0 | (formula name) | Amber (current) | 1.0 |
| L1 | Prereq | Blue #4488ff (current) | 0.8 |
| L2 | Builder | Cyan #44bbcc | 0.65 |
| L3 | Foundation | Green #44cc66 | 0.55 |
| L4 | Basic | White #cccccc | 0.45 |

### Question Display

All DAG nodes use the existing subconcept MC format:
- L1-L2: 3-option MC (A/B/C) — same as current depth 1
- L3-L4: 2-option MC (A/B) — same as current depth 2

Computational nodes at L3-L4 (like "sqrt(25) = ?") stay MC in v1. Typed input for arithmetic is a v2 enhancement.

### Split Flash Messages

| Depth | Message |
|-------|---------|
| 0 → 1 | `SPLIT! PREREQS INCOMING` (blue) |
| 1 → 2 | `DEEPER! BUILDER CONCEPTS` (cyan) |
| 2 → 3 | `FOUNDATIONS EXPOSED` (green) |
| 3 → 4 | `BACK TO BASICS` (white) |

---

## Migration Plan

### Data Migration

1. **`subconcepts[]` → `prereqs[]`**: All 66 commands have 3 subconcepts each. Create L1 DAG nodes from each, assigning IDs like `'{cmdId}-sub-{i}'` (e.g., `'ci-formula-sub-0'`). Set each command's `prereqs` to point at those 3 node IDs. Manual curation for sharing happens after the mechanical migration.
2. **Keep `subconcepts` as fallback during transition**: `if (cmd.prereqs && cmd.prereqs.some(id => PREREQ_DAG[id])) { use DAG } else if (cmd.subconcepts) { use old system }`. Removed only after full DAG authoring is confirmed.
3. **`subPKnown` → `dagState`**: On SRS load, if a card has `subPKnown` data but no `dagState`, bootstrap. **Note**: Index-to-ID mapping is fragile if prereq count differs from old subconcept count. Unmatched indices are silently discarded; new prereqs get default pKnown (or transfer seed).
   ```javascript
   function migrateToDagState(card, cmd) {
     if (card.dagState) return;  // Already migrated
     card.dagState = {};
     if (card.subPKnown && cmd.prereqs) {
       // Map old integer indices to new DAG node IDs
       // Only works for L1 nodes that were direct subconcept migrations
       cmd.prereqs.forEach((nodeId, i) => {
         if (card.subPKnown[i] != null) {
           card.dagState[nodeId] = {
             pKnown: card.subPKnown[i],
             encounters: card.subPKnown[i] > 0.1 ? 1 : 0,
             lastEncounterWave: 0
           };
         }
       });
     }
   }
   ```

### dagState Sanitization

Add to `sanitizeSrsCard()` alongside existing `subPKnown` sanitization:

```javascript
if (card.dagState) {
  for (const [nodeId, state] of Object.entries(card.dagState)) {
    state.pKnown = clampProb(Number(state.pKnown) || 0.1);
    state.encounters = Math.max(0, Math.floor(Number(state.encounters) || 0));
    state.lastEncounterWave = Math.max(0, Math.floor(Number(state.lastEncounterWave) || 0));
  }
}
```

### Code Migration

| Current Function | Change | Risk |
|-----------------|--------|------|
| `spawnHydraChildren()` | Rewrite: read from `PREREQ_DAG` + `dagState`, recursive depth support | HIGH — core mechanic |
| `handleMiss()` | Update depth guard from `depth < 2` to use `canNodeSplit()` + `splitDepth < 5`; pass `nodeId` + `wave` in context | MEDIUM |
| `handleHit()` | Update context to pass `nodeId` + `wave` | MEDIUM |
| `bktUpdate()` | Replace with `bktUpdateDAG()` | MEDIUM |
| `recomputeCompositePKnown()` | Replace with `recomputeDAGComposite()` | LOW |
| `findSubconceptIndex()` | Replace with `findNodeId(enemy)` | LOW |
| `initSRS()` | Add `dagState: {}` to schema | LOW |
| `loadSRS()` | Add migration from `subPKnown` to `dagState` | LOW |
| `handleSubconceptChoice()` | Rename to `handlePrereqChoice()`, same logic | LOW |

### Authoring Strategy

**Phase 1 (ship with spec):** Migrate existing 39 commands' subconcepts as L1 nodes. Author ~20 shared L2 nodes for the most common building blocks (SE, SD, sqrt(n), proportions, means). No L3-L4 yet.

**Phase 2 (follow-up):** Author full L2-L4 trees. Target the 15-20 most-missed commands first (based on SRS data). Estimated ~100 additional nodes.

**Phase 3 (aspirational):** Typed input for L4 computational nodes. Transfer priors for shared nodes.

---

## Implementation Plan (Dependency-Ordered)

**Note: Phases 1-3 must ship as a single atomic change.** Keep `subconcepts` alongside `prereqs` with the runtime fallback during development; remove only after verification.

### Phase 1: DAG Data Structure
1. Define `PREREQ_DAG` constant — auto-generate L1 nodes from existing subconcepts (IDs: `'{cmdId}-sub-{i}'`)
2. Add ~20 shared L2 nodes for common building blocks
3. Add `prereqs: [...]` to all 66 commands (keep `subconcepts` as fallback)
4. Add `validateDAG()` startup check
5. Add `getTransferSeed()` for shared node seeding

### Phase 2: SRS/BKT Changes
6. Add `dagState: {}` to `initSRS()` schema
7. Add `migrateToDagState()` in `loadSRS()`
8. Add dagState sanitization to `sanitizeSrsCard()`
9. Replace `bktUpdate()` with `bktUpdateDAG()`
10. Replace `recomputeCompositePKnown()` with `recomputeDAGComposite()` (L1-only averaging)
11. Replace `findSubconceptIndex()` with `findNodeId()`
12. Add `canNodeSplit()` and `selectWeakestPrereqs()`

### Phase 3: Hydra Rewrite
13. Rewrite `spawnHydraChildren()` for recursive DAG traversal with ancestor spawn budget
14. Add depth-based speed multipliers, mesh scales, colors, labels
15. Update `handleMiss()`: change depth guard from `depth < 2` to `canNodeSplit()` + `splitDepth < 5`; pass `nodeId` + `wave` in context; check `canNodeSplit` BEFORE calling `bktUpdateDAG`
16. Update `handleHit()` to pass `nodeId` + `wave` context
17. Rename `handleSubconceptChoice()` → `handlePrereqChoice()` (identical input flow — same key bindings, answer feedback, UI)

### Phase 4: Visual Polish
18. Add depth-based enemy colors and flash messages
19. Update `updateLabels()` for new label hierarchy

### Phase 5: Verification
20. Parse check
21. Console math verification
22. Gameplay test: verify one-level-at-a-time unfolding
23. Verify no cascade explosion (max enemies guard + ancestor budget)
24. Verify SRS migration from old subconcept data
25. Remove `subconcepts` fallback after all tests pass

---

## Blast Radius

| Function | Change | Risk |
|----------|--------|------|
| `COMMANDS` array | Replace `subconcepts` with `prereqs` on all 66 entries | HIGH — all question generation depends on this |
| `spawnHydraChildren()` | Full rewrite for recursive DAG | HIGH — core gameplay mechanic |
| `bktUpdate()` | Replace with DAG-aware version | MEDIUM — probabilistic model changes |
| `recomputeCompositePKnown()` | New data source (dagState vs subPKnown) | LOW — same formula, different input |
| `handleMiss()` / `handleHit()` | Context parameter change | MEDIUM — touches every answer path |
| `initSRS()` / `loadSRS()` | Schema addition + migration | LOW — additive |
| `pickCommands()` | No change — still reads composite pKnown | NONE |
| `handleSubconceptChoice()` | Rename only | LOW |

---

## Testing Plan

1. **Parse check**: Inline JS parses without errors
2. **DAG integrity**: `validateDAG()` logs no warnings on startup — no dangling refs, no cycles
3. **BKT math**: `bktUpdateDAG` produces same results as old `bktUpdate` for L1 nodes
4. **Migration**: Save SRS with old `subPKnown` format, reload, verify `dagState` populated correctly
5. **One-level gate (critical)**: Miss L0 → L1 spawns. Miss L1 on first encounter → NO split (speed boost only). Verify: after first miss on unseen L1, `dagState[nodeId].encounters === 1` AND `canNodeSplit()` returns false. This confirms the gate works with `bktUpdateDAG` called AFTER the split decision.
6. **Explosion guard**: Rapid misses at all levels never exceed 20 enemies
7. **Ancestor budget**: Miss L0, both L1 children miss and split, verify total descendants from that L0 ancestor never exceeds 4
8. **Shared nodes**: Same DAG node encountered via two different parent commands maintains independent dagState
9. **Transfer seed**: Master a shared node (pKnown > 0.5) under command A, verify new dagState entry under command B seeds at 0.3 instead of 0.1
10. **Leaf nodes**: L4 nodes with empty prereqs never attempt to split
11. **Speed multipliers**: Verify depth-based speed scaling — worst-case compound at L4 is ~2.13x, well under 4.5x cap
12. **Composite pKnown (L1 only)**: Command with 3 L1 prereqs all mastered (pKnown > 0.8), but one L3 grandchild encountered and missed (pKnown 0.05). Verify composite is dominated by L1 evidence, not pulled down by deep node
13. **Backwards compat**: Old save data (pre-DAG) loads without errors, bootstraps dagState
14. **Concurrent parents**: Two L0 enemies from different commands missed in same wave — total enemies stays under cap, each command's dagState updated independently
15. **dagState sanitization**: Corrupt dagState in localStorage (NaN pKnown, negative encounters) is cleaned on load
16. **Fallback**: Command whose prereq IDs are not in PREREQ_DAG falls back to old subconcept system
17. **Mobile**: No layout regressions from new label/color system at 375px

---

## Edge Cases

- **Node referenced but not in PREREQ_DAG**: Skip silently, log warning. Command with dangling prereq ID behaves as if it has no prereqs.
- **Circular reference**: Should never happen (DAG), but guard with a visited-set in traversal.
- **All prereqs already mastered (pKnown > 0.3)**: No split — speed-boost fallback. The student knows the components but is struggling to integrate them.
- **Max depth reached (splitDepth = 5)**: No further splitting regardless of pKnown.
- **Enemy at t > 0.80**: Skip child spawning (existing guard, extended to all depths).
- **20-enemy cap hit during recursive spawn**: Stop spawning, remaining prereqs deferred to next encounter.
- **Brand new player**: All dagState empty, pKnown defaults to 0.1. First encounter of any node is always leaf behavior.
- **subPKnown data exists but no matching prereq IDs**: Ignored during migration (orphaned data, no harm).

---

## Deferred to v2

- **Typed input for L4 arithmetic nodes** — leverage existing `typed` input mode
- **Full transfer priors** — richer cross-command knowledge sharing beyond the v1 seed
- **Adaptive BKT parameters** — per-node pGuess/pSlip/pTransit based on telemetry
- **Visual prereq tree** — show the student their knowledge tree on end screen
- **Auto-authoring** — LLM-generated prereq nodes for commands that lack them
- **Deep-node influence on L1 pKnown** — currently L2+ nodes only affect composite indirectly; v2 could propagate evidence upward through the DAG

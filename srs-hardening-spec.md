# SRS/BKT Persistence Hardening Spec

## Problem Statement

The SRS + BKT comprehension tracking system has four identified risks:

1. **Run checkpoint desync**: `continueGame()` blindly overlays stale snapshot SRS onto fresh persistent SRS, potentially reverting mastery progress.
2. **No range validation**: Loaded SRS data isn't clamped — tampered or corrupted values for ease, mastery, pKnown, etc. could cause unexpected behavior.
3. **Silent save failure**: `localStorage.setItem()` failures (quota exceeded) are silently caught, giving the player no indication their progress isn't saving.
4. **Mid-wave crash loss**: SRS only persists at wave clear/exit — a browser crash mid-wave loses that wave's answer data.

## Solution Design

### Fix 1: Timestamp-Based SRS Merge

Add a `lastUpdated` timestamp to each SRS card. When `continueGame()` merges snapshot SRS with persistent SRS, compare per-card timestamps and keep the newer one.

**Changes:**
- `srsHit()` and `srsMiss()`: set `c.lastUpdated = Date.now()`
- `continueGame()` merge logic: for each card, compare `snapshot.srs[id].lastUpdated` vs `persistent[id].lastUpdated`, keep the one with the higher timestamp
- Legacy cards without `lastUpdated` default to 0 (persistent always wins over legacy snapshot)

### Fix 2: Range Validation on Load

Add a `sanitizeSrsCard(card, defaults)` function called during `loadSRS()` that clamps all fields:

| Field | Type | Valid Range | Fallback |
|-------|------|------------|----------|
| ease | number | 1.3 – 5.0 | 2.5 |
| interval | number | 0 – 20 | 0 |
| streak | number | 0 – 100 | 0 |
| correct | number | 0 – ∞ (non-negative int) | 0 |
| wrong | number | 0 – ∞ (non-negative int) | 0 |
| totalAttempts | number | 0 – ∞ (non-negative int) | 0 |
| lastSeen | number | 0 – 100 | 0 |
| mastery | number | 0 – 5 (integer) | 0 |
| avgTimeMs | number | 0 – 60000 | 0 |
| pKnownDirect | number | 0.001 – 0.999 | 0.1 |
| pKnown | number | 0.001 – 0.999 | 0.1 |
| pTransit | number | 0.001 – 0.5 | 0.03 |
| pGuess | number | 0.01 – 0.5 | 0.25 |
| pSlip | number | 0.01 – 0.5 | 0.1 |
| subPKnown | object | values 0.001–0.999 | {} |
| lastUpdated | number | 0 – ∞ | 0 |

### Fix 3: Save Failure Warning

When `saveSRS()` or `saveRunState()` fails:
- Set a flag `G.saveError = true`
- Show a small persistent warning in the HUD: "⚠ SAVE FAILED" in red
- Clear the flag on next successful save

### Fix 4: Per-Answer SRS Save

Call `saveSRS()` after every `srsHit()` and `srsMiss()` call (lines 3490, 3506, 3419). This changes crash loss from "up to 1 wave" to "at most 1 answer".

**Performance note:** `localStorage.setItem()` is synchronous but fast for small payloads (~10-50KB for 66 cards). At quiz pace (1 answer per 3-10 seconds), this is negligible.

## Blast Radius

### Fix 1 (Timestamp merge)
- `srsHit()`: add `lastUpdated` field
- `srsMiss()`: add `lastUpdated` field
- `continueGame()`: change merge logic (lines 3275-3278)
- `initSRS()`: add `lastUpdated: 0` default

### Fix 2 (Validation)
- New function `sanitizeSrsCard(card, defaults)`
- `loadSRS()`: call sanitize after merge
- `continueGame()`: call sanitize after merge

### Fix 3 (Warning)
- `saveSRS()`: catch block sets `G.saveError`
- `saveRunState()`: catch block sets `G.saveError`
- HUD rendering: show warning when `G.saveError` is true
- Successful save: clear `G.saveError`

### Fix 4 (Per-answer save)
- Line 3490 (srsHit after correct answer): add `saveSRS()`
- Line 3506 (srsMiss after wrong answer): add `saveSRS()`
- Line 3419 (breach srsMiss): add `saveSRS()`

### No Impact On
- BKT math (clampProb, bayesPosterior, etc.)
- Question selection (pickCommands)
- Enemy spawning, game mechanics
- Music, UI, visual effects

## Implementation Plan

1. Add `lastUpdated: 0` to `initSRS()` default fields
2. Add `c.lastUpdated = Date.now()` to `srsHit()` and `srsMiss()`
3. Write `sanitizeSrsCard(card, defaults)` function
4. Update `loadSRS()` to call sanitize per card
5. Update `continueGame()` merge to use timestamp comparison
6. Update `saveSRS()` and `saveRunState()` to set/clear `G.saveError`
7. Add HUD save-error warning
8. Add `saveSRS()` calls after each srsHit/srsMiss call site
9. Parse check

## Testing Plan

- JS parse check passes
- Legacy saves without `lastUpdated` load correctly (defaults to 0)
- Cards with out-of-range values are clamped (ease=10 → 5.0, mastery=7 → 5, pKnown=2 → 0.999)
- `continueGame()` keeps newer card when persistent is fresher than snapshot
- `continueGame()` keeps newer card when snapshot is fresher than persistent
- Save failure shows HUD warning
- `saveSRS()` called after every answer

## Edge Cases

- Legacy saves: `lastUpdated` missing → treated as 0, persistent wins over equally-timestamped snapshot
- Both timestamps equal: persistent wins (tie-break favors long-term storage)
- Corrupted subPKnown values: each value clamped individually, invalid entries removed
- Empty SRS object in snapshot: merge skips, persistent used as-is

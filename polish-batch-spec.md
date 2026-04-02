# Polish Batch Spec: Perf + Mechanics + UX + Cleanup

## Fix 1: Label DOM Caching (Performance)

### Problem
`updateLabels()` runs every frame (60fps). It clears `labelsDiv.innerHTML=''` and recreates all enemy label divs via `document.createElement()` + `innerHTML` assignment + `appendChild()`. This causes 60 full DOM teardown/rebuild cycles per second, triggering layout reflows.

### Solution
Maintain a map of label DOM nodes keyed by enemy ID. On each frame:
- Reuse existing label divs for enemies that still exist
- Create new divs only for newly spawned enemies
- Remove divs for dead enemies
- Update only position, style, and content that changed

Implementation:
- Add `const labelCache = new Map()` — maps enemy ID to {div, lastHtml, lastX, lastY}
- In updateLabels(): iterate enemies, reuse or create divs, remove orphans
- Skip innerHTML update if content hash hasn't changed (use a simple key: `cmd.id + isSel + mastery + speedMult`)

## Fix 2: HUD Element Caching (Performance)

### Problem
`updateHUD()` calls `document.getElementById()` 6 times per frame for static element lookups.

### Solution
Cache all HUD element references at initialization time. Use cached refs in updateHUD().

Implementation:
- Add `const HUD_ELS = {}` populated once after DOM ready
- Replace all `document.getElementById('h-xxx')` in updateHUD with `HUD_ELS.xxx`

## Fix 3: Hydra Spawn Breach Cap (Game Mechanics)

### Problem
Hydra children spawn at `parent.t + 0.02*(i+1)`, capped at t=0.96. Combined with inherited speed multipliers (up to 1.6x), children near the breach point can breach within 1-2 seconds, giving no time to answer.

### Solution
Cap child spawn position at t=0.80 (20% of path remaining) instead of t=0.96. This guarantees at least 3-4 seconds of answer time even with high speed multipliers.

Implementation:
- Change `Math.min(.96,...)` to `Math.min(.80,...)` in spawnHydraChildren

## Fix 4: Session Stats on End Screen (UX)

### Problem
The end screen shows mastery data and weak items but not session-level statistics like total play time, average response time, or session accuracy.

### Solution
Track session start time and show a compact stats line on the end screen.

Implementation:
- Add `G.sessionStartTime = 0` to game state, set to `Date.now()` in `startGame()` and `continueGame()`
- On end screen, compute and display:
  - Session duration: `Math.round((Date.now() - G.sessionStartTime) / 60000)` minutes
  - Accuracy: `G.totalCorrect / (G.totalCorrect + G.totalWrong) * 100`
  - Average response time from SRS `avgTimeMs` of seen cards

## Fix 5: Console.log Cleanup

### Problem
Debug `console.log(err)` left in QR code generation.

### Solution
Remove or replace with silent error handling.

## Blast Radius

### Fix 1 (Labels)
- `updateLabels()` function: major rewrite
- `labelCache` map: new global
- Label click handlers: must still work (reattach onclick on content change)
- Mobile label hiding: still works (skip creating div for hidden labels)

### Fix 2 (HUD)
- `updateHUD()`: reference changes only
- No visual changes

### Fix 3 (Hydra)
- `spawnHydraChildren()`: one constant change
- Affects gameplay balance for hydra encounters

### Fix 4 (Stats)
- `G` state object: add `sessionStartTime`
- `startGame()` and `continueGame()`: set sessionStartTime
- End screen rendering: add stats line
- No impact on SRS, scoring, or persistence

### Fix 5 (Console)
- One line change, no impact

## Testing Plan
- JS parse check passes
- Labels render correctly with caching (selected state, ghost labels, mobile hiding)
- HUD updates correctly with cached refs
- Hydra children never spawn past t=0.80
- End screen shows session time and accuracy
- No console.log in QR code path

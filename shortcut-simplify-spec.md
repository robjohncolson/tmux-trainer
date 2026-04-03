# Spec: Simplify Shortcuts — Remove Hint, Promote Alt+E and Alt+W as Parallel Paths

## Problem Statement

The current shortcut system has three overlapping learning aids (Alt+E explain, Alt+H hint, Alt+W video) with confusing dependencies:
- Alt+W only works when Alt+E is already open (nested, not discoverable)
- Alt+H (hint) overlaps with Alt+E (both show `cmd.explain` text) but also has a scoring penalty and answer elimination mechanic
- Students don't discover the shortcuts because they're buried in faded `.input-help` text

The hint mechanic (half-points penalty + eliminate one wrong answer) added complexity when explanations were sparse. Now that the game has 3-sentence text explainers, 66 Manim video animations, and auto-hold wrong-answer feedback, the hint is obsolete.

## Solution

Two clean, parallel shortcuts:
- **Alt+E** — text explanation (3-sentence panel, free, no penalty)
- **Alt+W** — visual explanation (Manim animation video, standalone, no penalty)

Remove:
- Alt+H keyboard binding
- `hintUsed` / `showHint` state flags and all dependent logic
- Hint scoring penalty (half points)
- Hint answer elimination mechanic (`eliminatedIdx`)
- Mobile HINT touch button
- All "Alt+H" references in help text, instructions, HOW TO PLAY

Promote:
- Alt+W works standalone (doesn't require Alt+E to be open first)
- Both shortcuts mentioned in `.input-help` text and HOW TO PLAY

## Design

### Alt+W Independence

Currently Alt+W requires `EXPLAINER_STATE.open` (line 4399). Change to:
- If video is playing → close it
- If explainer is open with animationId → load video (current behavior)
- If explainer is NOT open → open a **video-only explainer** (set animationId from selected enemy's command, load video directly, skip text lines)

New function `openAnimationForSelectedCommand()`:
```javascript
function openAnimationForSelectedCommand(){
  const sel=G.selectedId?G.enemies.find(e=>e.id===G.selectedId):null;
  if(!sel||!sel.cmd)return;
  const entry=EXPLANATION_BANK.byId[sel.cmd.id];
  if(!entry)return;
  EXPLAINER_STATE.open=true;
  EXPLAINER_STATE.key='cmd-'+entry.id;
  EXPLAINER_STATE.title=entry.title;
  EXPLAINER_STATE.lines=entry.lines.slice(0,3);
  EXPLAINER_STATE.animationId=entry.id||null;
  EXPLAINER_STATE.videoNonce++;
  lastInputState='';
  loadAnimation(entry.id);
}
```

Alt+W handler becomes:
```javascript
if(e.key==='w'&&e.altKey){
  e.preventDefault();
  if(EXPLAINER_STATE.videoUrl) closeAnimationVideo();
  else if(EXPLAINER_STATE.animationId) loadAnimation(EXPLAINER_STATE.animationId);
  else openAnimationForSelectedCommand();
  return;
}
```

### Hint Removal — State

Remove from `G` initialization and all reset paths:
- `G.hintUsed` (flag: hint was used on current enemy)
- `G.showHint` (flag: hint UI is currently showing)

Remove from `question` objects:
- `q.eliminatedIdx` (which wrong answer was eliminated)

### Hint Removal — Scoring

Line 4193: Remove `hintPenalty` multiplier entirely. Scoring becomes:
```javascript
const pts = Math.floor((100 + Math.max(0, 50 - Math.floor(responseTime / 200))) * totalMult * childPenalty);
```

### Hint Removal — SRS/BKT

- `srsHit()` line 2431: Remove `if(usedHint) q -= 2` quality penalty
- `srsHit()` signature: Remove `usedHint` parameter (always `false` now)
- Call sites pass `false` for backward compat, or remove the parameter
- BKT context: Remove `hintUsed` field from `bktCtx` objects
- BKT choices: Remove `eliminatedIdx`-based choice count adjustment

### Hint Removal — Quiz Rendering

In `updateInput()` quiz rendering (lines ~3340-3420):
- Remove `G.showHint` from stateKey (no longer affects render)
- Remove `eliminatedIdx` computation block
- Remove `isElim` checks that strike through eliminated answers
- Remove `hint-text` div that shows `cmd.explain` when hint active
- Remove `.hint-text` CSS class (if no other callers)

In typed/prefix-key rendering (lines ~3434-3465):
- Remove `G.showHint` from stateKey
- Remove hint-text blocks

### Hint Removal — UI

- Remove `toggleHintFromButton()` function
- Remove mobile HINT touch button from `renderExplanationControls()`
- Update all `.input-help` strings: remove "Alt+H = hint (half pts)"
- Update `instructionsSub` in cartridge definition
- Update HOW TO PLAY: replace "Alt+H hint" with "Alt+W watch animation"
- Add "Alt+W watch" to `.input-help` strings

### Hint Removal — State Persistence

- `saveRunState()` line 2549-2550: Remove `hintUsed`/`showHint` from snapshot
- `loadRunState()` / `continueGame()`: Remove restoration of these fields
- `startNewWave()` / `spawnNextEnemy()`: Remove resets of these fields

### Hint Removal — Keyboard Handler

- Remove Alt+H binding (line 4403)
- Remove `eliminatedIdx` guards in MC answer handlers (lines 4419, 4427, 4435)

## Blast Radius

### Touched
| Area | What changes |
|------|-------------|
| CSS | Remove `.hint-text` if unused. No other CSS changes. |
| `EXPLAINER_STATE` | No changes (already has animationId/video fields) |
| `G` state | Remove `hintUsed`, `showHint` from init + all reset paths |
| `renderExplanationControls()` | Remove mobile HINT button |
| `updateInput()` quiz/typed/prefix | Remove hint stateKey, eliminated rendering, hint-text |
| `toggleHintFromButton()` | Delete function |
| `handleHit()` | Remove `hintPenalty`, simplify scoring |
| `handleMiss()` | Remove `hintUsed` from BKT context |
| `srsHit()` | Remove `usedHint` parameter + quality penalty |
| Keyboard handler | Remove Alt+H, update Alt+W, remove eliminatedIdx guards |
| `saveRunState()` / `continueGame()` | Remove hint fields |
| Help text | 6 `.input-help` strings, instructions, HOW TO PLAY |
| `openAnimationForSelectedCommand()` | New function for standalone Alt+W |

### NOT touched
- Explainer panel text (Alt+E) — unchanged
- Video player (loadAnimation, closeAnimationVideo) — unchanged
- Music editor, cloud sync, leaderboard — no overlap
- Three.js scene, particles, enemy movement — no overlap
- SRS persistence format — `hintUsed` was never a persisted card field

## Implementation Plan

1. Add `openAnimationForSelectedCommand()` function
2. Update Alt+W handler to work standalone
3. Remove Alt+H handler
4. Remove `toggleHintFromButton()` + mobile HINT button
5. Remove `G.hintUsed` / `G.showHint` from all init/reset paths
6. Remove hint scoring penalty from `handleHit()`
7. Remove `usedHint` from `srsHit()` + BKT contexts
8. Remove `eliminatedIdx` logic from quiz rendering + keyboard handlers
9. Remove `hint-text` rendering from all quiz modes
10. Remove `G.showHint` from stateKey computations
11. Remove hint from state persistence (save/load)
12. Update all help text strings + instructions + HOW TO PLAY
13. Parse check

## Testing Plan

- [ ] Alt+E opens text explainer (unchanged behavior)
- [ ] Alt+W opens video directly without needing Alt+E first
- [ ] Alt+W closes video if already playing
- [ ] Alt+W from open explainer loads video (existing behavior still works)
- [ ] Alt+H does nothing (removed)
- [ ] Scoring awards full points (no hint penalty)
- [ ] All 4 MC answers render without strikethrough
- [ ] No `hintUsed`/`showHint` in saved run state
- [ ] Mobile: no HINT button, explainer + WATCH still work
- [ ] `.input-help` text shows Alt+E and Alt+W, not Alt+H
- [ ] HOW TO PLAY shows Alt+W, not Alt+H
- [ ] Parse check passes

## Edge Cases

1. **Saved run with hintUsed=true** — Old snapshots may contain these fields. `continueGame()` should silently ignore them (just don't read them).
2. **Alt+W when no animation exists** — `openAnimationForSelectedCommand()` calls `loadAnimation()` which does a HEAD check for `unknown` availability. Shows "Animation not available yet" on failure. Non-breaking.
3. **Alt+W with no enemy selected** — Guard: `if(!sel||!sel.cmd) return`. Same as Alt+E.

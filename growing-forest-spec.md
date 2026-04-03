# Spec: Growing Forest — Trees Drive Music, Expand Across Waves

## Problems

1. Trees cap at depth 5 (same as musicalHealth) — correct answers past 5 add nothing visual
2. Music and trees read the same capped meter — trees should BE the meter, music should follow
3. Only 3 fixed trees — no forest expansion
4. Tree/music state resets each wave
5. Sky is static (no flow) and has a hard horizon clashing with the grid

## Solution

Five bundled changes:

### 1. Uncapped tree depth — trees ARE the state

New game-level variable `G.treeDepth` (replaces `musicalHealth` as the source of truth):
- Starts at 3 on new game
- Main formula kills (splitDepth === 0): `treeDepth += 1`
- Subconcept/deep concept kills: no change
- Wrong answer: `treeDepth = max(0, treeDepth - 1)`
- Breach: `treeDepth = max(0, treeDepth - 2)`
- Cap at 10 (performance: 1023 segments per tree max)
- Persists across waves (NOT reset on wave start)
- Reset to 3 on new game only

### 2. Music follows tree depth

`musicalHealth` inside SFX becomes derived:
```javascript
function setTreeDepth(d) { musicalHealth = Math.min(5, d); }
```

Exposed as `SFX.setTreeDepth(G.treeDepth)` — called after every depth change. The 0-5 layer gating in `seq()` stays unchanged. Tree depth > 5 just means music stays at full + groove embellishments.

Groove eligibility lowers threshold: at treeDepth 7+, groove plays even at streak 0 (the forest is so lush the music grooves by itself).

### 3. Progressive forest expansion

Pool of 10 tree positions. Trees activate based on `treeDepth`:

| treeDepth | Active trees | Layout |
|-----------|-------------|--------|
| 0 | 0 | Barren |
| 1-2 | 1 | Center sapling |
| 3-4 | 3 | Small grove |
| 5-6 | 5 | Growing forest |
| 7-8 | 7 | Dense treeline |
| 9-10 | 9-10 | Full fractal forest |

Tree pool positions (behind enemy path, spread across terrain):
```javascript
const TREE_POOL = [
  {x:0,   z:-4,  angle:0,    ba:PI/6,  ls:0.68, len:3.5},  // center (always first)
  {x:-4,  z:-5,  angle:0.15, ba:PI/5.5,ls:0.65, len:2.8},  // left near
  {x:4,   z:-4.5,angle:-0.1, ba:PI/6.5,ls:0.70, len:2.6},  // right near
  {x:-7,  z:-7,  angle:0.08, ba:PI/5,  ls:0.63, len:2.2},  // far left
  {x:6,   z:-6.5,angle:-0.12,ba:PI/6.2,ls:0.66, len:2.0},  // far right
  {x:-2,  z:-8,  angle:0.05, ba:PI/5.8,ls:0.64, len:2.4},  // back center-left
  {x:2.5, z:-7.5,angle:-0.07,ba:PI/6.3,ls:0.67, len:2.3},  // back center-right
  {x:-8,  z:-9,  angle:0.1,  ba:PI/5.2,ls:0.62, len:1.8},  // far back left
  {x:7.5, z:-8.5,angle:-0.08,ba:PI/6.8,ls:0.65, len:1.9},  // far back right
  {x:0,   z:-10, angle:0,    ba:PI/5.5,ls:0.60, len:2.0},  // far back center
];
```

Each tree's individual depth = `min(treeDepth, 10)` for the first tree, and `max(1, treeDepth - activationThreshold)` for later trees (they "catch up" but are always shorter than the pioneer).

### 4. Tree depth persists across waves

- `G.treeDepth` included in run state checkpoint (`saveRunState` / `continueGame`)
- Wave start does NOT reset it
- `startNewGame()` resets to 3
- `clearRunState()` clears it (new game)

### 5. Dynamic sky + horizon fix

**Flow:** Add wind drift to the UV: `uv + vec2(time * 0.02, time * 0.008)` — clouds flow gently

**Tree-depth-based brightness:** Add a `brightness` uniform driven by `treeDepth / 10`. Richer forest = richer sky.
```glsl
col *= 0.15 + brightness * 0.2; // range 0.15 (barren) to 0.35 (full forest)
```

**Horizon fade:** Add vertical gradient to eliminate the hard edge:
```glsl
float horizon = smoothstep(0.15, 0.55, gl_FragCoord.y / resolution.y);
col *= horizon;
```
Bottom 15% of screen = black (grid zone). Fades in through middle. Top = full sky. No clash.

## Blast Radius

| Area | Change |
|------|--------|
| `G` state | Add `treeDepth` (starts 3, persists across waves) |
| `handleHit()` | `if(!(enemy.splitDepth>=1)) G.treeDepth = min(10, G.treeDepth+1); SFX.setTreeDepth(G.treeDepth)` |
| `handleMiss()` | `G.treeDepth = max(0, G.treeDepth-1); SFX.setTreeDepth(G.treeDepth)` |
| `checkBreach()` | `G.treeDepth = max(0, G.treeDepth-2); SFX.setTreeDepth(G.treeDepth)` |
| SFX module | Add `setTreeDepth(d)` → sets `musicalHealth = min(5,d)`. Replace `musicalHit`/`musicalMiss`/`musicalBreach` with this single setter. Keep kill melody in a separate `killMelody()`. |
| `TREE_CONFIGS` → `TREE_POOL` | Expand to 10 positions |
| `TREE_MAX_SEGMENTS` | Increase to 1023 (depth 10) |
| Tree meshes | Create 10 (pre-allocated), visibility driven by treeDepth |
| `animate()` tree update | Each tree: compute individual depth, visibility, levels |
| `animate()` sky update | Pass `brightness` uniform |
| Sky shader | Add `brightness` uniform, wind drift, horizon `smoothstep` |
| `saveRunState()` / `continueGame()` | Include `treeDepth` |
| `startNewGame()` paths | Reset `treeDepth = 3` |
| Run state init | Default `treeDepth: 3` |

### NOT touched
- `generateTree()` algorithm — unchanged
- Music editor, step patterns — unchanged
- Streak groove logic — unchanged (just lower threshold at high depth)
- Game logic, SRS, explainer — no overlap (except new treeDepth bookkeeping)

## Testing

- [ ] New game starts with 3 trees at depth 3
- [ ] Main formula kill: treeDepth +1, tree grows visibly
- [ ] Subconcept/deep concept kill: no tree change
- [ ] Miss: treeDepth -1, branches wither
- [ ] Breach: treeDepth -2
- [ ] treeDepth 6: 5th tree appears
- [ ] treeDepth 10: full forest of 10 trees
- [ ] Music at full layers when treeDepth >= 5
- [ ] treeDepth persists across waves
- [ ] New game resets treeDepth to 3
- [ ] Checkpoint save/load preserves treeDepth
- [ ] Sky flows gently (wind drift)
- [ ] Sky brighter at high treeDepth
- [ ] No horizon line visible — smooth fade to grid
- [ ] Parse check passes

## Edge Cases

1. **treeDepth at cap (10) + correct answer** — stays at 10. Kill melody still plays. Forest is maxed.
2. **treeDepth at 0 + miss** — stays at 0. Miss SFX still plays. Barren wasteland.
3. **Continue from old save without treeDepth** — default to 3 if missing from snapshot.
4. **10 trees × 1023 segments = 10230 lines** — still well within GPU budget for line geometry. ~20K vertices.

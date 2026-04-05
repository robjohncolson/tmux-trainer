# ROYGBIV Death Animation

## Problem

When an enemy is killed, the cube mesh vanishes instantly (`removeEnemyMesh`) and rainbow particles spawn at that position. There's no satisfying death sequence — just a pop and particles. The transition from "cube exists" to "particles flying to score" is abrupt.

## Solution

A two-phase death animation that plays out over ~800ms before the existing rainbow score particles spawn:

### Phase 1: Chromatic Compression (~500ms)
- Cube stops moving along the path (frozen in place)
- Cube compresses: scales down from 1.0 → 0.08 (tiny dot)
- Color sweeps through ROYGBIV: amber → yellow → green → cyan → blue → violet
- Emissive intensity increases as it shrinks (gets brighter as it compresses)
- Slight spin acceleration during compression

### Phase 2: Supernova Shell (~300ms)
- At compression end, cube mesh is removed
- An expanding wireframe sphere shell spawns at the death position
- Shell starts small (radius ~0.1) and expands to radius ~2.5
- Shell color sweeps backward: violet → blue → cyan → green → yellow → red → deep red
- Shell opacity fades from 0.8 → 0 as it expands
- Shell uses additive blending for glow effect

### Phase 3: Score Particles (existing)
- After the supernova shell reaches ~60% expansion, the existing `spawnExplosion()` fires
- Rainbow particles emerge from the supernova center and funnel to score as they already do
- No changes to particle funnel, score award, or collection mechanics

## Implementation Plan

### Data structure: `dyingEnemies` array

```javascript
const dyingEnemies = [];
// Each entry:
{
  mesh,           // the original enemy mesh (kept alive during Phase 1)
  position,       // frozen world position
  startTime,      // performance.now() at death
  phase,          // 'compress' | 'nova' | 'done'
  novaShell,      // THREE.Mesh (wireframe sphere) — created at Phase 2 start
  enemyData,      // the original enemy object (for score calc)
  pts,            // pre-calculated score points
  particleCount,  // pre-calculated particle count
  award,          // pre-created score award
  originalScale,  // starting scale of the cube
}
```

### Step 1: Modify `handleHit()`

Instead of calling `removeEnemyMesh()` and `spawnExplosion()` immediately:
- Calculate score, create award, play SFX — all as before
- Remove enemy from `G.enemies` and clear selection — as before
- Do NOT call `removeEnemyMesh()` — instead push to `dyingEnemies`
- Do NOT call `spawnExplosion()` — deferred to Phase 2 completion

### Step 2: Add `updateDyingEnemies(time)` in animate loop

Called every frame, processes the `dyingEnemies` array:

**Phase 1 — Compress (0–500ms):**
- `t = elapsed / 500` (0→1)
- Scale: `lerp(originalScale, 0.08, easeInQuad(t))`
- Color: sweep through ROYGBIV array using `t` as index interpolator
- Emissive: intensity ramps from 0.2 → 1.5
- Rotation: spin speed increases with `t`

**Phase 2 — Supernova (500–800ms):**
- At `t=0` of Phase 2: remove cube mesh, create wireframe sphere
- Sphere radius: `lerp(0.1, 2.5, easeOutQuad(t))` where `t = (elapsed-500)/300`
- Color: reverse ROYGBIV sweep (violet → deep red)
- Opacity: `lerp(0.8, 0, t)`
- At `t ≈ 0.6`: fire `spawnExplosion()` with the pre-created award

**Cleanup:**
- When Phase 2 completes, remove nova shell mesh, splice from array

### Step 3: ROYGBIV color array

```javascript
const ROYGBIV_DEATH = [
  0xff8c00, // amber (starting cube color)
  0xffcc00, // yellow
  0x44ff88, // green
  0x00cccc, // cyan
  0x4488ff, // blue
  0x8844ff, // indigo
  0xcc44ff, // violet
];
const ROYGBIV_NOVA = [
  0xcc44ff, // violet (starts where compress ended)
  0x8844ff, // indigo
  0x4488ff, // blue
  0x00cccc, // cyan
  0x44ff88, // green
  0xffcc00, // yellow
  0xff4400, // orange-red
  0x880000, // deep red
];
```

### Step 4: Nova shell geometry

- `THREE.SphereGeometry(1, 12, 8)` with `wireframe: true`
- Material: `MeshBasicMaterial({ wireframe:true, transparent:true, blending:AdditiveBlending, depthWrite:false, fog:false })`
- Pre-create a pool of 4 shell meshes to avoid GC during intense kills

## Blast Radius

| Area | Impact | Action |
|------|--------|--------|
| `handleHit()` | MODIFIED | Defer mesh removal + explosion to dying queue |
| `removeEnemyMesh()` | UNCHANGED | Still used, but called from dying queue |
| `spawnExplosion()` | UNCHANGED | Still used, but called from dying queue |
| `createScoreAward()` | UNCHANGED | Called in handleHit as before |
| `updateEnemyMeshes()` | NEEDS GUARD | Skip meshes that are in `dyingEnemies` |
| `animate()` | MODIFIED | Add `updateDyingEnemies(time)` call |
| `flushPendingScoreAwards()` | UNCHANGED | Still handles edge cases |
| `checkBreach()` | NO CHANGE | Enemy already removed from G.enemies |
| `syncRunCheckpoint()` | NO CHANGE | Score already awarded at handleHit time |

## Edge Cases

- **Rapid kills**: Multiple cubes dying simultaneously — each gets its own entry in `dyingEnemies`. Nova shell pool of 4 handles typical burst.
- **Screen transition during death**: If player exits to menu during animation, cleanup all `dyingEnemies` entries (remove meshes, flush awards).
- **Wave complete during death**: `checkWaveComplete()` checks `G.enemies.length === 0`, which is correct since enemy is already removed from `G.enemies` in `handleHit()`.
- **Pause during death**: Animation should freeze when paused (use `G.paused` guard in update loop).
- **Mobile performance**: Nova shell is 12×8 wireframe sphere — very cheap. Compression is just scale+color on existing mesh. No extra particle cost.

## Testing Plan

1. Parse check passes
2. Kill an enemy — see compression through amber→violet
3. Compression ends in tiny violet dot
4. Supernova shell expands violet→red→fade
5. Rainbow particles emerge from supernova and funnel to score
6. Score still awards correctly
7. Rapid kills (3+ enemies fast) — all animate independently
8. Pause during death animation — freezes, resumes correctly
9. Exit to menu during death — no visual artifacts
10. Mobile: animation runs smoothly at 375px

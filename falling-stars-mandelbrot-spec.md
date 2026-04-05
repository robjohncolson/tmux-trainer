# Spec: Falling Stars + Mandelbrot Craters

## Problem Statement

The game needs a visual narrative for failure and recovery. Currently, misses produce speed surges and hydra splits but no lasting environmental mark. Success grows trees and births groove layers, but the sky is static.

## Solution Design

### Concept

Failures drop stars from the sky. Where they land, Mandelbrot fractals bloom on the terrain like scars/craters. Sustained success births new stars in the sky. The battlefield becomes a visual diary of the player's journey.

### Falling Stars (on failure)

- Every 3rd L0 miss (main formula, not prereq), a star detaches from the sky and falls to a terrain landing spot
- The falling star is a short-lived LineSegments trail (similar to lightning) animated from sky → ground over ~800ms
- Landing position chosen from a pre-computed Poisson disk pool on the terrain grid, avoiding the enemy path corridor
- On landing: a small Mandelbrot fractal plane spawns at that position
- Miss counter (`G.missStarCounter`) resets on star fall, persists within wave but resets on new wave

### Mandelbrot Craters (on terrain)

- Each crater is a small `PlaneGeometry(1.8, 1.8)` with a `ShaderMaterial` running a Mandelbrot fragment shader
- Plane placed flat on terrain (`rotateX(-PI/2)`) at terrain height + 0.03 (avoid z-fighting)
- Shader uniforms:
  - `iterations`: detail level (8 at spawn, responsive to performance)
  - `zoom`: magnification into the set (randomized per crater for visual variety)
  - `center`: vec2 offset into the Mandelbrot set (randomized per crater)
  - `colorBase`: vec3 amber base color
  - `opacity`: fades in on spawn, fades on removal
  - `time`: for subtle animation (slow drift into the fractal)
- **Performance response**:
  - On each miss: all craters gain +2 iterations (max 40) — fractals grow more detailed/complex
  - On each hit: all craters lose -1 iteration (min 4) — fractals simplify/heal
  - At 0 craters or iterations ≤ 4: craters fade out and are removed
- **Pool**: max 6 craters. When full, oldest crater fades out before new one spawns
- Craters cleared on wave start (clean slate each wave)

### Mandelbrot Shader (GLSL ES 1.0 compatible)

```glsl
uniform float iterations, zoom, time, opacity;
uniform vec2 center;
uniform vec3 colorBase;

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution - 0.5) * zoom + center;
  // Gentle drift
  uv += vec2(sin(time*0.1)*0.01, cos(time*0.13)*0.01);
  
  vec2 z = vec2(0.0);
  float i;
  int maxIter = int(iterations);
  for(int n = 0; n < 40; n++) {
    if(n >= maxIter) break;
    z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + uv;
    if(dot(z,z) > 4.0) { i = float(n); break; }
    i = float(n);
  }
  float t = i / iterations;
  // Amber-to-black coloring: inside the set is dark, edges are bright
  vec3 col = colorBase * pow(t, 0.6);
  // Radial fade to blend with terrain
  float dist = length((gl_FragCoord.xy / resolution - 0.5) * 2.0);
  float edge = smoothstep(1.0, 0.5, dist);
  gl_FragColor = vec4(col, t * edge * opacity);
}
```

Note: GLSL ES 1.0 doesn't support non-constant loop bounds. Use `for(int n=0; n<40; n++)` with `if(n >= maxIter) break;` — the `break` is well-supported on all mobile GPUs since it's a simple conditional exit.

### Star Birth (on success)

- Existing STAR_POOL has 13 stars with `unlockAt` thresholds tied to `treeDepth`
- New mechanic: on every 5th consecutive correct answer (streak milestones: 5, 10, 15...), a "born star" is added
- Born stars are additional entries appended to a `BORN_STARS` array (max 5)
- Each born star gets a random sky position (y: 4-8, z: -15 to -25, x: -20 to 20) and uses the same `generateFractalStar` rendering
- Born stars have a fade-in animation (opacity ramps 0 → 0.7 over 2 seconds)
- Born stars are cleared on wave start (they're rewards for the current wave performance)
- Born stars inherit the visual style of existing fractal stars (warm gold, additive blending, twinkle)

### Landing Position Pool (Poisson Disk)

Pre-computed at init using the same seeded Poisson approach as FERN_POOL:

```javascript
const CRATER_POOL = (() => {
  const minDist = 3.0, xMin = -9, xMax = 9, zMin = -10, zMax = -3;
  const pts = [], maxAttempts = 150;
  let seed = 137; // different seed from ferns
  function rng() { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; }
  // Avoid the path corridor (roughly x: -2 to 4, z: -7 to 5)
  for (let i = 0; i < maxAttempts && pts.length < 12; i++) {
    const x = xMin + rng() * (xMax - xMin);
    const z = zMin + rng() * (zMax - zMin);
    // Skip if too close to path center
    const pathDist = Math.abs(x - 1) + Math.abs(z + 1);
    if (pathDist < 4) continue;
    let ok = true;
    for (const p of pts) { if (Math.hypot(p.x - x, p.z - z) < minDist) { ok = false; break; } }
    if (ok) pts.push({ x, z });
  }
  return pts;
})();
```

12 pre-computed positions, cycled through sequentially. Avoids the enemy path corridor.

## Implementation Plan

### Step 1: Crater Pool + Mandelbrot Shader
1. Add `CRATER_POOL` Poisson positions after FERN_POOL
2. Create Mandelbrot `ShaderMaterial` (shared, uniforms per-instance via `material.clone()`)
3. Create crater mesh pool (6 PlaneGeometry meshes, initially hidden)
4. Add `craters` array to track active craters: `{ mesh, iterations, spawnTime, posIdx }`

### Step 2: Falling Star Animation
1. Add `fallingStars` array for active fall animations
2. `spawnFallingStar(fromStar, toLanding)` — creates a LineSegments trail that descends over 800ms
3. On completion: spawn crater at landing position
4. Animate in the main loop alongside lightning

### Step 3: Miss/Hit Integration
1. `handleMiss()`: increment `G.missStarCounter`. On every 3rd L0 miss, pick a landing spot and call `spawnFallingStar()`
2. `handleMiss()`: increase crater iterations (+2 each miss)
3. `handleHit()`: decrease crater iterations (-1 each hit)
4. Remove/fade craters when iterations drop to ≤ 4

### Step 4: Star Birth
1. Add `BORN_STARS` array (max 5)
2. At streak milestones (5, 10, 15, 20, 25): add a born star with random sky position
3. Born stars rendered in the existing star animation loop with fade-in
4. Wave start: clear `BORN_STARS`, clear `craters`, reset `G.missStarCounter`

### Step 5: Wave lifecycle cleanup
1. `initWave()` or wave-start path: clear craters, born stars, falling stars
2. Checkpoint save/restore: `missStarCounter` saved in run state

## Blast Radius

- `handleMiss()`: add missStarCounter logic + crater iteration bump (~5 lines)
- `handleHit()`: add crater iteration decrease (~3 lines)
- `animate()`: add falling star update + crater iteration uniform update (~15 lines)
- New code sections: CRATER_POOL, Mandelbrot shader, falling star system, born stars (~80 lines total)
- Wave init: add cleanup calls (~3 lines)
- **No changes to**: SRS, BKT, DAG, music, input panel, labels, camera, existing particles, trees, ferns, existing stars

## Edge Cases

- No stars available to fall from (all existing stars hidden due to low treeDepth): fall originates from a random sky point instead
- All 12 crater positions used: cycle back to position 0 (oldest crater replaced)
- Rapid consecutive misses: falling star animation queued, max 2 in flight at once
- `GLSL int` loop with `break` on mobile: well-supported since GLSL ES 1.0 spec allows `break` in for-loops. Fallback: if shader compilation fails, craters just don't render (no game impact)
- Checkpoint restore: missStarCounter restored, but craters/born stars are visual-only and not persisted (regenerate from wave state)

## Testing Plan

1. Parse check passes
2. Kill 3 enemies correctly → no star falls, no craters
3. Miss 3 times on L0 → star falls, crater appears at terrain
4. Miss more → craters grow more detailed (higher iterations)
5. Hit correctly → craters simplify
6. Streak hits 5 → born star appears in sky
7. Wave start → craters cleared, born stars cleared
8. Max 6 craters enforced
9. Max 5 born stars enforced
10. Mobile: shader compiles, craters render, no frame drop

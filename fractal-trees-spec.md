# Spec: Fractal Trees — Living Background That Grows With Performance

## Problem

The fBm amber noise background doesn't show perceivable complexity changes between health levels. It looks like "a cloudy amber day" at every health. Need geometric structure where recursion depth is unmistakably different per level.

## Solution

Replace the fBm shader with 2D fractal trees rendered as Three.js line geometry. Recursion depth = musical health. Trees sway gently in sync with the music tempo. Health changes animate branches growing/withering.

## Design

### Tree layout

3 trees positioned behind the game scene:
- **Center tree**: tallest, trunk at bottom-center, scale 1.0
- **Left tree**: slightly smaller (scale 0.7), offset left, slightly different branch angle
- **Right tree**: slightly smaller (scale 0.65), offset right, mirrored angle

Asymmetric, natural. Not wallpaper.

### Recursion depth = health

| Health | Depth | Segments per tree | Visual |
|--------|-------|-------------------|--------|
| 0 | 0 | 0 | Empty — darkness |
| 1 | 1 | 1 | Lone trunk — bare, stark |
| 2 | 2 | 3 | First fork — two branches |
| 3 | 3 | 7 | Recognizable tree shape |
| 4 | 4 | 15 | Filling in |
| 5 | 5 | 31 | Full canopy |

Total at health 5: 3 trees × 31 = 93 line segments. Trivial.

### Color by depth

- Trunk (depth 0): dark amber `#3d1f00` — fades into background
- Mid branches (depth 2-3): medium amber `#996622`
- Tips (depth 4-5): bright gold `#ff8c00` — the canopy glows

Implemented as vertex colors on the BufferGeometry, interpolated per-line. `THREE.LineBasicMaterial` with `vertexColors: true`.

### Beat-synced sway

Each branch's angle gets a sine offset:
```javascript
const swayAngle = baseAngle + Math.sin(time * tempoHz + depth * 0.4) * swayAmp;
```

- `tempoHz = tempo / 60 * Math.PI * 2` — derived from `SFX.getMusicConfig().tempo`, computed in the render loop via `performance.now()` (not from `seq()` timer — avoids clock desync per Tinsker's observation)
- `depth * 0.4` — phase offset, deeper branches lag behind (cascading wind ripple)
- `swayAmp = 0.03 + streak * 0.005` — gentle normally, livelier at high streak (trees dance)
- Trunk barely moves (depth 0, tiny amplitude). Tips sway most.

### Health transition animation

When health changes, don't rebuild instantly:
- **Health drops (4→3)**: outermost branches fade opacity to 0 over ~400ms, then geometry updates
- **Health rises (3→4)**: new branches start at opacity 0, fade to full over ~400ms

Implemented via a `targetDepth` vs `displayDepth` interpolation. Each frame:
```javascript
displayDepth += (targetDepth - displayDepth) * 0.05; // smooth approach
```

Branches at depth > floor(displayDepth) get opacity scaled by the fractional part. This creates smooth growth/withering.

### Streak sparkles

At streak 5+: occasional tiny amber particle drifts upward from random branch tips. Like fireflies or embers. Reuse the existing particle system if feasible, or create a small dedicated pool (8-12 particles max).

### Tree generation algorithm

2D fractal tree using complex number rotation (from the article):

```javascript
function generateTree(originX, originY, length, angle, branchAngle, scale, depth, maxDepth, time, tempoHz, swayAmp, positions, colors) {
  if(depth > maxDepth) return;
  
  // Sway: sine offset per depth, synced to tempo
  const sway = Math.sin(time * tempoHz + depth * 0.4) * swayAmp * depth;
  const a = angle + sway;
  
  // End point
  const endX = originX + Math.sin(a) * length;
  const endY = originY + Math.cos(a) * length;
  
  // Push line segment (origin → end)
  positions.push(originX, originY, 0, endX, endY, 0);
  
  // Color by depth: dark trunk → bright tips
  const t = depth / Math.max(maxDepth, 1);
  const r = 0.24 + t * 0.76; // 0.24 → 1.0
  const g = 0.12 + t * 0.22; // 0.12 → 0.34
  const b = 0.0;
  colors.push(r, g, b, r, g, b); // start and end vertex
  
  // Recurse left and right
  const childLen = length * scale;
  generateTree(endX, endY, childLen, a + branchAngle, branchAngle, scale, depth + 1, maxDepth, time, tempoHz, swayAmp, positions, colors);
  generateTree(endX, endY, childLen, a - branchAngle, branchAngle, scale, depth + 1, maxDepth, time, tempoHz, swayAmp, positions, colors);
}
```

### Scene integration

Replace the fBm fullscreen quad approach:

**Remove:**
- `fractalScene`, `fractalCamera`, `fractalMaterial`, `fractalMesh` — the shader quad
- The dual-pass render (`renderer.autoClear` toggling)
- `fractalMaterial.uniforms.resolution` update in resize handler

**Add:**
- 3 `THREE.LineSegments` objects added directly to the game `scene`
- Positioned at z = -10 (behind enemies which are at z = 0 to -8ish)
- Updated every frame in `animate()`: rebuild geometry with current sway
- `renderer.setClearColor(AMB.black)` restored (no more dual-pass needed)

### Geometry rebuild strategy

Rebuilding 93 line segments of BufferGeometry every frame is cheap. But we can optimize:
- Pre-allocate a `Float32Array` large enough for max depth (5 levels, 3 trees = 93 segments × 6 floats = 558 position floats)
- Each frame: fill the array via `generateTree()`, update `bufferGeometry.attributes.position` and set `needsUpdate = true`
- Only rebuild if `time` changed (it always does during gameplay) OR if depth changed

### Performance budget

- 93 line segments × 2 vertices = 186 vertices. Negligible.
- `generateTree()` recursion: 31 calls per tree × 3 trees = 93 function calls per frame. ~0.1ms.
- No shader, no texture, no per-pixel computation.
- Less GPU work than the fBm shader it replaces.

## Blast Radius

| Area | Change |
|------|--------|
| Fractal setup (lines 3144-3190) | Replace shader quad with tree line geometry |
| `animate()` fractal pass (lines 5009-5020) | Replace dual-pass render with tree geometry update |
| Resize handler | Remove `fractalMaterial.uniforms.resolution` update |
| Renderer setup | Restore `renderer.setClearColor(AMB.black)` |
| New: `generateTree()` | Recursive tree generation function |
| New: tree Line objects | 3 `THREE.LineSegments` in main scene |

### NOT touched
- SFX / musical health — only reads `getMusicalHealth()`, `getStreak()`, `getMusicConfig().tempo`
- Game logic, enemies, input — no overlap
- Explainer, video — no overlap

## Testing

- [ ] 3 amber trees visible behind game scene
- [ ] Health 0: no trees. Health 1: bare trunks. Health 5: full canopy.
- [ ] Each health level is obviously different at a glance
- [ ] Trees sway gently in sync with music tempo
- [ ] Sway cascades from trunk to tips (depth phase offset)
- [ ] Health drop: branches fade out smoothly
- [ ] Health rise: branches fade in smoothly
- [ ] Streak 5+: sway amplitude increases
- [ ] Color: dark trunk, bright gold tips
- [ ] Game objects (cubes, labels) render in front of trees
- [ ] Fog fades tree branches at distance
- [ ] Title screen shows idle trees at depth 5
- [ ] Parse check passes

## Edge Cases

1. **Health 0** — No tree geometry rendered. Scene shows dark background only.
2. **Rapid health changes** — `displayDepth` smoothly interpolates. No jarring pops.
3. **Wave transition** — Trees stay at current depth. Health resets to 5 in `startBGM()` → trees grow to full.
4. **Muted** — `getMusicConfig().tempo` still returns the config value. Sway works even muted.
5. **Portrait mode** — Trees may need slight position/scale adjustment. The y-axis has more room in portrait.

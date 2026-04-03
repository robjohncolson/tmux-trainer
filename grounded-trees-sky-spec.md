# Spec: Grounded Trees + fBm Amber Sky

## Problem

1. Fractal trees are floating — their bases cut through the terrain grid instead of growing from it
2. The fBm amber sky was pretty but got removed when we switched to trees for health indication

## Solution

1. **Ground the trees** on the terrain surface — trunk base at terrain height, growing upward in world y
2. **Bring back fBm amber sky** as pure atmosphere (fixed octaves, not health-driven), rendered behind everything

## Design

### Tree grounding

The terrain is a 24×24 `PlaneGeometry` in the xz plane with procedural y-height:
```javascript
function terrainHeight(x, z) {
  return Math.sin(x * 0.3) * Math.cos(z * 0.4) * 0.4 + Math.sin(x * 0.7 + z * 0.5) * 0.2;
}
```

Trees are 2D line geometry generated in a local frame where:
- x-axis = horizontal spread
- y-axis = growth direction (upward)

To place them in the 3D scene growing upward from the terrain:
- `mesh.position.set(worldX, terrainHeight(worldX, worldZ), worldZ)`
- The tree's local y-axis already aligns with world y (upward) — no rotation needed
- The tree's local x-axis spreads horizontally in world x
- The tree's local z = 0 for all vertices (flat 2D tree in the xz slice)

Tree positions (behind the main path, visible from the default camera):
- Center: `(0, h(0,-4), -4)` — behind path center
- Left: `(-5, h(-5,-6), -6)` — further back-left
- Right: `(4.5, h(4.5,-5), -5)` — further back-right

These positions place the trees behind the enemy path (which runs from z≈+6 to z≈-6) so enemies walk in front of the trees.

### Tree generation change

The current `generateTree()` generates vertices relative to origin (0,0). The mesh.position offsets them into world space. Growth starts at (0,0) going up. This is already correct — just need to update the `TREE_CONFIGS` positions.

Remove the old `y:-6` fixed positions. Compute y from terrain height.

### fBm amber sky (restored)

Bring back the fBm shader as a decorative sky behind everything:
- Same `ShaderMaterial` on a fullscreen quad in a separate `skyScene` + `OrthographicCamera`
- Fixed 5 octaves (always full detail, not health-driven)
- Gentle animation from `time`
- No `speed` or `streak` dependency — just a static living amber sky
- Rendered first, then `clearDepth()`, then game scene on top (same dual-pass as before)

This means the render order is:
1. Render sky (fBm shader quad)
2. Clear depth buffer
3. Render game scene (terrain, enemies, trees, particles, etc.)

Trees are IN the game scene so they interact correctly with terrain, fog, and camera.

### Remove stale comment

Line 3143 still says `// ── Julia set fractal background ──` — remove.

## Blast Radius

| Area | Change |
|------|--------|
| `TREE_CONFIGS` | Update positions: compute y from `terrainHeight(x,z)` |
| New: `terrainHeight()` function | Extract height formula for reuse |
| New: sky shader setup | `skyScene`, `skyCamera`, `skyMaterial`, `skyMesh` |
| `animate()` | Add sky render pass before game scene |
| `renderer.setClearColor` | Remove (sky replaces the clear) |
| Resize handler | Update sky `resolution` uniform |

### NOT touched
- `generateTree()` — already correct, generates in local y-up frame
- Tree sway, health gating, vertex colors — unchanged
- SFX, game logic, explainer — no overlap

## Testing

- [ ] Trees grow upward from the terrain surface (bases on the grid)
- [ ] Amber sky visible behind terrain and trees
- [ ] Sky is always full detail (not health-dependent)
- [ ] Trees still show health-driven recursion depth
- [ ] Trees still sway in sync with music
- [ ] Game objects render in front of sky
- [ ] Fog still affects trees but not sky
- [ ] Parse check passes

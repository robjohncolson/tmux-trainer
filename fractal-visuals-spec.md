# Fractal Visuals Pack — Spec

## Problem
The scene has fractal trees and an fBm sky but the ground, sky detail, and particle effects are plain. Four new fractal elements fill the visual gaps without competing with gameplay.

## 1. Fractal Ferns (ground level)

Small L-system ferns scattered along terrain edges, filling empty ground.

### Design
- 6-8 fern instances at fixed positions along terrain perimeter (z = -8 to -12, outside enemy path)
- Each fern: 2D branching structure built from `LineSegments` (same technique as trees)
- L-system rule: stem → stem + two curling fronds at ±40° with 0.7 length ratio
- Max depth = `min(5, floor(treeDepth * 0.6))` — ferns grow slower than trees
- Green-to-amber gradient by depth: base `#2d4400` → tips `#66aa00` (distinct from amber trees)
- Gentle sway synced to music tempo (same omega as trees, slightly faster phase offset)
- Height: 0.4–0.8 units (much smaller than trees)
- Grounded via `terrainHeight()` like trees

### Performance
- ~15 segments per fern at max depth × 8 ferns = 120 segments (trivial)
- Same pre-allocated Float32Array + DynamicDrawUsage pattern as trees

## 2. Fractal Constellations (sky level)

Dot-and-line star patterns in the upper sky that connect as health grows.

### Design
- 3 constellation clusters positioned in the upper portion of the sky shader
- Implemented as `Points` + `LineSegments` in the game scene at far z (-15 to -20), high y (8-12)
- Each cluster: 8-12 star points with predetermined positions
- Connection rule: at treeDepth N, the first N edges of each constellation are visible
- treeDepth 0: just scattered dots (no lines). treeDepth 10: full constellation connected
- Star color: warm white `#ffcc88` with slight twinkle (opacity oscillation per star, different phases)
- Line color: `#ff8c0044` (faint amber, doesn't compete with foreground)
- Lines draw progressively using `setDrawRange()` — same technique as trees
- Star point size: 2-3px, `sizeAttenuation: true`

### Constellation shapes
- Cluster 1: a simple triangle/arrow shape (3-5 stars) — upper left
- Cluster 2: a zigzag chain (5-7 stars) — upper center
- Cluster 3: a branching Y shape (4-6 stars) — upper right
- Positions hand-authored, not procedural — they're decorative, not mathematical

## 3. Fractal Particle Trails (kill effects)

Kill particles follow branching paths instead of straight radial burst.

### Design
- Current behavior: particles burst outward radially, then funnel toward score HUD
- New behavior: during the burst phase, particles split into 2 child trajectories at random intervals
- Each particle has a `branch` chance (30%) evaluated once during burst phase
- If branching: spawn 1 additional particle at the branch point with a ±30° velocity offset
- Branch children inherit the parent's color but are slightly smaller (0.7x size) and shorter-lived (0.7x life)
- Max branch depth: 2 (parent → child → grandchild, no deeper)
- Funnel phase unchanged — all particles (including branches) still converge on score HUD
- Visual effect: the radial burst looks organic/lightning-like instead of uniform

### Performance
- Branching adds ~40% more particles per kill (12 base → ~17 with branches)
- Particles are already cheap (point sprites). Mobile reduces base count, so branches scale with it.
- No new geometry types — reuses existing particle pool

## 4. Fractal Lightning (event feedback)

Branching electrical bolts on breach and high-streak events.

### Design
- **Breach lightning**: 2-3 red-orange bolts from the breached enemy position upward toward the sky, lasting 0.4s
- **Streak lightning**: at streak 10+, a single amber bolt arcs between the killed enemy and the score HUD, lasting 0.3s
- Each bolt: recursive midpoint displacement (fractal subdivision)
  - Start with a straight line from A to B
  - At each level, displace the midpoint perpendicular by `random * spread`
  - 4-5 levels of subdivision → 16-32 segments per bolt
  - Each level adds smaller side branches (30% chance, half length, ±60°)
- Rendered as `LineSegments` with `additiveBlending` for glow
- Bolt life: opacity fades from 1.0 to 0 over duration
- Color: breach = `#ff4422` → `#ff8800`, streak = `#ffcc00` → `#ffffff`
- New bolts allocated from a pool (max 6 active bolts), recycled on death

### Triggering
- `checkBreach()`: spawn 2-3 breach bolts from enemy position to `(pos.x + random*4, 10, pos.z)`
- `handleHit()`: if `G.streak >= 10`, spawn 1 streak bolt from enemy position to score HUD world position

### Performance
- Max 6 bolts × 32 segments = 192 line segments (trivial)
- Bolts are short-lived (0.3-0.4s), so typically 0-2 active at once
- Uses existing `beams` array pattern for lifecycle management

## Render Order

All four elements are in the game scene (not separate passes):
1. Terrain + wireframe
2. Ferns (on terrain, behind enemies)
3. Trees (on terrain, behind enemies)  
4. Enemies + path
5. Constellations (far background, high y)
6. Particles (including branching trails)
7. Lightning bolts (additive, on top of everything)

## Health/Event Mapping Summary

| Element | Driven by | Range |
|---------|-----------|-------|
| Ferns | treeDepth | depth 0-3 recursion levels |
| Constellations | treeDepth | 0-10 connected edges |
| Particle trails | per-kill | 30% branch chance, depth 2 max |
| Breach lightning | breach event | 2-3 bolts, 0.4s |
| Streak lightning | streak ≥ 10 | 1 bolt, 0.3s |

## Blast Radius

| Area | Impact | Risk |
|------|--------|------|
| Scene setup | Add fern meshes, constellation points/lines, lightning pool | LOW — additive |
| `animate()` | Update fern sway, constellation draw range, bolt lifecycle | LOW — additive |
| `spawnExplosion()` | Add branching logic to particle burst | MEDIUM — modifies existing particles |
| `checkBreach()` | Spawn lightning bolts | LOW — additive |
| `handleHit()` | Spawn streak bolt at high streak | LOW — additive |
| Resize | No changes needed (all in world space) | NONE |

## Implementation Order

1. Fractal ferns (most visible, fills empty ground)
2. Fractal constellations (sky reward, health-driven)
3. Fractal lightning (event feedback, dramatic)
4. Fractal particle trails (subtle enhancement, touches existing code)

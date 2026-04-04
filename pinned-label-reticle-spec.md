# Pinned Selected Label + 3D Corner-Bracket Reticle

## Problem

Floating DOM labels projected from 3D→2D coordinates don't track cubes accurately across different camera angles and zoom levels. Labels appear below or disconnected from their cubes, especially on desktop where the camera is pulled back. The projection offset (+0.6 world Y) translates to different screen positions depending on zoom.

Mobile already hides all non-selected labels — proving only the selected label matters.

## Solution

Two changes:

### 1. Pin selected label to fixed screen position

Remove all floating projected labels. The selected enemy's label becomes a fixed DOM element anchored directly above `#input-panel` (or inside `#ip-header`).

- Shows: formula name, mastery dot, speed tag, depth color, bkt-uncertain pulse
- Positioned via CSS (not projection math) — always readable, zoom-independent
- Label click-to-select is removed (canvas tap + auto-select handle targeting)
- `updateLabels()` replaced with a simpler `updateSelectedLabel()` that only updates text content
- `clearLabelCache()` simplified — just clear the one element's content
- All `.enemy-label` CSS for floating labels removed (keep styles needed for the pinned version)
- `#labels` container div either repurposed or removed

### 2. 3D corner-bracket reticle on selected cube

A white wireframe reticle built from 4 L-shaped corner brackets around the selected cube in world space.

**Geometry:**
- 4 corners of a square, each drawn as two short line segments forming an L
- Total: 8 line segments (2 per corner) → 16 vertices
- Built as `THREE.LineSegments` with a pre-allocated `Float32Array(48)` (16 verts × 3 components)
- Square size: ~1.2× the cube size, adjustable by split depth (smaller for deeper enemies)

**Visual style:**
- White (`0xffffff`) with `LineBasicMaterial`, transparent, additive blending
- Gentle expand/contract pulse: scale oscillates ±8% via `Math.sin(time * 0.004)`
- Opacity pulse: 0.7–1.0 range synced to scale
- No fog (`fog: false`) so it stays crisp at any distance
- `depthWrite: false` so it doesn't z-fight

**Tracking:**
- Updated in the animate loop alongside `updateSelectedSpotlight()`
- Copies selected enemy mesh position (x, y, z) — sits at cube center height
- Yaw-only billboarding: `reticle.lookAt(camera.position.x, reticle.position.y, camera.position.z)` — faces camera horizontally but doesn't tilt

**Lifecycle:**
- `visible = false` when no enemy selected, game not active, or paused
- No per-frame geometry rebuild — just update position, scale, rotation, opacity

## Implementation Plan

### Step 1: Add pinned label element
- Add a `#selected-label` div inside or directly above `#input-panel` in the HTML
- Style it: centered, fixed width, same visual treatment as current `.enemy-label.selected .enemy-label-inner`
- Write `updateSelectedLabel()`: reads `G.selectedId`, finds enemy, updates text content + mastery dot + depth color

### Step 2: Remove floating label system
- Delete `updateLabels()` function
- Delete `clearLabelCache()` function (or simplify to clear the pinned label)
- Remove `labelCache` Map and `_labelVec` 
- Remove the `#labels` div usage (or the div itself)
- Remove `updateLabels()` call from animate loop (line 6609) and game-start init (line 5712)
- Remove `.enemy-label` floating CSS (keep `.enemy-label-inner` visual styles if reused for pinned label)
- Remove label `onclick` handlers (selection is handled by canvas tap + auto-select)
- Remove `.sel-arrow` CSS and rendering

### Step 3: Build reticle geometry
- Create `selectionReticle` as `THREE.LineSegments` with pre-allocated buffer
- Generate corner bracket geometry once (static shape — L at each corner)
- Add to `scene`
- Style: white, transparent, additive blending, no fog, no depth write

### Step 4: Update reticle in animate loop
- New `updateSelectionReticle(time)` function near `updateSelectedSpotlight()`
- Track selected enemy mesh position
- Yaw-only billboard toward camera
- Pulse scale and opacity
- Hide when no selection or not in game

### Step 5: Cleanup
- Remove `.enemy-label-shell` related bracket CSS (the old lock-on corners in DOM)
- Remove any dead label-related code paths
- Verify `clearLabelCache` calls at screen transitions still work (now clearing pinned label)

## Blast Radius

| Area | Impact | Action |
|------|--------|--------|
| `updateLabels()` | DELETED | Replace with `updateSelectedLabel()` |
| `clearLabelCache()` | SIMPLIFIED | Just clear pinned label content |
| `labelCache`, `_labelVec` | DELETED | No longer needed |
| animate loop (line 6609) | MODIFIED | Call `updateSelectedLabel()` + `updateSelectionReticle()` |
| game start (line 5712) | MODIFIED | Call `updateSelectedLabel()` instead |
| `#labels` div | REMOVED or emptied | No floating labels |
| label `onclick` | REMOVED | Canvas tap handles selection |
| `.enemy-label` CSS | MOSTLY REMOVED | Keep inner styles for pinned label |
| `selectedSpotlight` | UNCHANGED | Keeps working as ground-level cue |
| `updateSelectedSpotlight()` | UNCHANGED | Independent system |
| canvas tap handler | UNCHANGED | Already handles selection |
| `autoSelect()` | UNCHANGED | Still sets `G.selectedId` |
| Mobile compact viewport check | SIMPLIFIED | No ghost label hiding needed |

## Edge Cases

- **No enemies on field**: pinned label shows nothing, reticle hidden
- **Enemy killed mid-view**: `autoSelect()` picks next enemy, label + reticle update next frame
- **Hydra split**: selected enemy replaced, label updates to new target
- **Pause/resume**: reticle + label hidden during pause, restored on resume
- **Screen transitions**: `clearLabelCache()` → clear pinned label, reticle hidden
- **Wave clear overlay**: reticle stays on last enemy until screen change
- **High contrast mode**: reticle white works in both normal and inverted modes

## Testing Plan

1. Parse check passes
2. Desktop: pinned label shows selected formula name above input panel
3. Desktop: reticle brackets visible around selected cube at default zoom
4. Desktop: reticle tracks cube as it moves along path
5. Desktop: reticle pulses gently (scale + opacity)
6. Desktop: zooming in/out — label stays pinned, reticle stays on cube
7. Mobile: pinned label visible above input panel
8. Mobile: reticle visible on selected cube
9. Pause/resume: both hidden during pause, restored on resume
10. Enemy death: reticle + label switch to next auto-selected enemy
11. No enemies: both hidden

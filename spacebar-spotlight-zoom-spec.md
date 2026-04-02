# Spacebar Fix + Ground Spotlight + Tighter Camera Zoom Spec

## Problem Statement

Three UX issues identified during playtesting:

1. **Spacebar restarts the game**: Pressing spacebar on the end screen or title screen auto-clicks the first `.btn` (REDEPLOY or START), causing unwanted game restarts. The root cause is twofold:
   - The keydown handler explicitly called `btn.click()` on non-game screens
   - The browser's native behavior fires a click event on any focused button when space is pressed

2. **Reticle visual clutter**: The selected target had bracket corners on the label DOM and a 3D square `LineLoop` reticle around the cube. Both add visual noise without clearly communicating selection in a way that feels integrated with the 3D scene.

3. **Camera too far from action**: The camera zoom distances were set for an overview feel (Y=11, Z=12 at parent depth), making it harder to read enemy labels and engage with the selected target.

## Solution Design

### Fix 1: Spacebar

- Call `e.preventDefault()` unconditionally for all spacebar keydown events, blocking native button activation across every screen
- Only explicitly forward the click during wave-clear (`G.screen==='game' && G.waveComplete`), targeting `#input-panel .btn` (the NEXT WAVE button)
- Return early after handling space so no other input handlers process it

### Fix 2: Ground Spotlight

- Remove all reticle infrastructure:
  - CSS: `.target-bracket` (5 rules: base + tl/tr/bl/br)
  - JS: `reticleSquareGeo`, `makeReticleLayer()`, `selectedReticle` IIFE, `updateSelectedReticle()`
  - HTML: bracket `<span>` elements from `updateLabels()`
- Add a ground-plane spotlight disc:
  - `spotlightTex`: 128x128 canvas with radial gradient (amber center fading to transparent)
  - `selectedSpotlight`: `CircleGeometry(1,32)` laid flat at `y=0.05`, using the texture with `AdditiveBlending`
  - `updateSelectedSpotlight(time)`: positions under the selected cube, pulses scale/opacity, color-tints by depth (amber/blue/purple matching existing enemy color scheme)
- Keep existing selection cues: label opacity (ghost vs full), `.sel-arrow`, emissive mesh glow

### Fix 3: Tighter Camera Zoom

- Reduce zoom distances ~35%:
  - `zoomY`: 11/9/7 -> 7.5/6/4.5 (by splitDepth 0/1/2)
  - `zoomZ`: 12/10/8 -> 8.5/7/5.5
- Increase tracking multipliers for tighter following:
  - `trackX`: 0.4/0.5/0.6 -> 0.5/0.6/0.7
  - `trackZ`: 0.3/0.4/0.5 -> 0.4/0.5/0.6
- Bump lerp speed from 0.04 to 0.055 per frame for snappier response at closer range

## Blast Radius

### Spacebar
- **Direct impact**: keydown handler spacebar branch
- **Affected screens**: title, end, pause, wave-clear
- **Risk**: Pause screen previously allowed space to click RESUME; now only `P` resumes. Acceptable since `P` is the documented pause toggle.

### Spotlight
- **Removed symbols**: `reticleSquareGeo`, `makeReticleLayer`, `selectedReticle`, `updateSelectedReticle`, `.target-bracket` CSS (5 rules), bracket HTML in `updateLabels()`
- **Added symbols**: `spotlightTex`, `selectedSpotlight`, `updateSelectedSpotlight`
- **Animate loop**: `updateSelectedReticle(time)` -> `updateSelectedSpotlight(time)` (1 call site)
- **Label rendering**: brackets variable removed from `updateLabels()`, innerHTML simplified
- **No impact on**: label click handlers, auto-select, tab cycling, enemy mesh colors, score funnel, beams, particles

### Camera
- **Direct impact**: camera lerp block inside `animate()`
- **No impact on**: label projection (uses `vector.project(camera)` which adapts), score funnel target (uses camera position dynamically), mobile portrait multipliers (still applied)
- **Monitor**: At depth-2 zoom (Y=4.5, Z=5.5), enemies at path extremes (x=10, z=-7) may be at viewport edges. Increased trackX mitigates this.

## Implementation Plan

1. Edit keydown handler: wrap spacebar in unconditional `preventDefault()` + early return, forward click only during wave-clear
2. Delete `.target-bracket` CSS rules (5 lines)
3. Delete bracket HTML generation in `updateLabels()`
4. Replace `reticleSquareGeo` with `spotlightTex` canvas texture
5. Replace `makeReticleLayer` + `selectedReticle` IIFE with `selectedSpotlight` mesh
6. Replace `updateSelectedReticle` with `updateSelectedSpotlight`
7. Update animate loop call site
8. Adjust camera zoom/track/lerp constants

## Testing Plan

- JS parse check passes
- Grep confirms zero remaining references to: `reticle`, `makeReticleLayer`, `selectedReticle`, `target-bracket`, `reticleSquareGeo`
- `#overlay .btn` CSS rules still exist (used for styling) but no longer referenced in spacebar handler
- Spacebar does nothing on title/end/pause screens
- Spacebar advances wave on wave-clear screen
- Ground spotlight visible under selected cube, pulses, follows enemy movement
- Spotlight color changes by depth (amber/blue/purple)
- Camera noticeably closer to focused enemy
- Labels still project correctly at tighter zoom
- Mobile portrait multipliers still applied

## Edge Cases

- **Wave-clear with no buttons**: Spacebar no-ops gracefully (querySelector returns null)
- **Spotlight on paused game**: Hidden (checked in updateSelectedSpotlight)
- **Spotlight on no selection**: Hidden (checked in updateSelectedSpotlight)
- **Camera during default orbit (no selection)**: Unchanged, uses original orbY/orbZ values
- **Score funnel target at closer camera**: `getScoreFunnelTarget()` uses dynamic camera position, adapts automatically

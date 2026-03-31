# Selected Reticle + Deferred Score Funnel Spec

Date: 2026-03-31
Repo: `tmux-trainer`
Primary file: `index.html`

## Goals

- Move the selected-target emphasis from the DOM label overlay into the 3D scene so the cue wraps the actual enemy cube.
- Make score increments land only when rainbow kill particles reach the score HUD area.
- Increase the visual richness of kill particles without making the board unreadable or tanking mobile performance.
- Preserve score correctness across save, continue, pause, title-return, and end-screen flows.

## Non-Goals

- No changes to enemy hitboxes, selection rules, or quiz logic.
- No large scene refactor or module split.
- No change to the existing label text beyond removing the old DOM reticle treatment.

## User-Facing Behavior

### World-Space Reticle

- The selected cube gets a subtle amber square reticle centered on the cube itself.
- The reticle is rendered in Three.js, not inside the projected label DOM.
- The reticle uses sharp-corner square outlines with layered ghost pulses.
- The motion reads as gentle outward expansion with staggered fade, not a hard flashing beacon.
- The reticle scales by enemy depth so split and deep-concept children still read cleanly.
- The label may still show the small selected arrow, but the square-outline emphasis moves off the label and onto the cube.

### Deferred Score Collection

- A correct answer still kills the enemy immediately.
- Rainbow particles burst from the enemy, then funnel to the score HUD.
- Score increments only when those particles arrive at the score target.
- The score HUD performs a small pop/flash when value arrives.
- The floating `+pts` feedback can remain immediate as local combat feedback, even though the HUD total updates later.

### Particle Polish

- Rainbow particles keep the current two-phase burst-then-funnel structure.
- Funnel particles gain more visual variety through:
  - additive glow
  - slight spiral drift during homing
  - trailing ghosts
  - a tiny score-impact burst near the HUD target
- The effect should feel brighter and more rewarding without blocking readability of prompts or enemies.

## Technical Design

### 1. Selected Reticle

- Add a dedicated `selectedReticle` Three.js group near the particle setup.
- Build the reticle from 3 square `THREE.LineLoop` layers in amber tones with transparent materials.
- Update it every frame:
  - visible only during active gameplay with a live selected enemy
  - positioned at the selected mesh center
  - camera-facing so the square reads clearly from the current camera angle
  - scaled from enemy `splitDepth`
  - each layer pulsed with staggered phase and opacity
- Remove the old `.target-reticle` DOM children from `updateLabels()`.

### 2. Deferred Score Awards

- Introduce a pending-award queue keyed by award id.
- `handleHit()` creates an award record instead of applying points directly to `G.score`.
- The rainbow explosion is tagged with that award id.
- When a tagged particle reaches the score target capture radius, one score chunk is applied.
- Chunking rules:
  - split a point award into 4 to 8 chunks depending on burst size
  - preserve exact totals by distributing remainder across early chunks
- Award completion deletes the pending award record.

### 3. Particle Dazzle

- Upgrade rainbow particle materials to brighter additive rendering with `depthWrite:false`.
- Add per-particle motion variance:
  - swirl sign
  - mild lateral drift
  - staggered burst duration
  - scale twinkle
- Emit short-lived trail ghosts during funnel travel.
- On score impact, spawn a small localized burst near the HUD target to sell the collection event.

### 4. Persistence Safety

- Pending awards cannot be left unresolved when the run is checkpointed or finalized.
- Add a `flushPendingScoreAwards()` helper that immediately banks any uncollected chunks.
- Call the flush before:
  - run snapshot save
  - high-score sync
  - title return from run
  - end-screen score summary
- This avoids score loss if the player exits before particles finish traveling.

## GitNexus Review

### Index Status

- `npx gitnexus status` reports the repo index is up to date at commit `0f1150d`.

### Limitation

- `npx gitnexus context --repo tmux-trainer handleHit`
- `npx gitnexus impact --repo tmux-trainer handleHit --direction upstream`
- `npx gitnexus impact --repo tmux-trainer spawnExplosion --direction upstream`

All return symbol-not-found for these inline `index.html` functions. This matches the existing note in `CONTINUATION_PROMPT.md`: the current GitNexus pass indexes the repo, but does not resolve the inline script functions as named symbols for `impact/context`.

### Manual Blast Radius

- `handleHit(enemy)`
  - direct gameplay entry points: quiz choice handlers and keyboard submit paths
  - downstream effects: `G.score`, streak/combo, SRS hit updates, enemy removal, chord advance, flash feedback
  - additional risk introduced by this feature: save/checkpoint/high-score flows if score is no longer immediate
  - risk: `MEDIUM`
- `spawnExplosion(...)`
  - called from hit, breach, and hydra-split flows
  - only rainbow hit explosions should participate in score collection
  - risk: `LOW-MEDIUM`
- `updateLabels()`
  - visual-only change to remove DOM reticle layers
  - risk: `LOW`
- particle loop in `animate()`
  - new collection boundary and trail effects live here
  - risk: `MEDIUM`
- persistence helpers: `syncRunCheckpoint()`, `syncHighScore()`, `showEndScreen()`, `returnToTitleFromRun()`
  - must flush pending score before state is captured or rendered
  - risk: `MEDIUM`

## Implementation Steps

1. Add the spec document.
2. Get external review of the plan through the tmux Claude pane.
3. Implement the world-space reticle.
4. Implement pending score-award chunking and collection.
5. Add particle trail, glow, and score-impact polish.
6. Flush pending awards on checkpoint/high-score/end/title transitions.
7. Remove the old label reticle DOM.
8. Verify parse, gameplay behavior, save/continue correctness, and mobile readability.
9. Get a second external review through the tmux Claude pane.
10. Update `CONTINUATION_PROMPT.md`, commit, and push.

## Verification Plan

- Parse check the inline script.
- Browser-check desktop and mobile layouts.
- Confirm the selected reticle tracks the cube rather than the label.
- Confirm score stays unchanged until particles hit the HUD.
- Confirm the full award total lands exactly once.
- Confirm save/exit and end-screen flows do not lose pending points.
- Confirm hydra split and breach explosions do not wrongly award score.

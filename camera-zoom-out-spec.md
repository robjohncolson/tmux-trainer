# Camera Zoom-Out Default + Minimize Auto-Switching — Spec

## Problem

The game starts with camera zoomed in close to the selected enemy and auto-tracks aggressively. The user wants:
- Start zoomed out at an overview angle
- Let users zoom in voluntarily (scroll wheel / pinch)
- Minimize auto-camera angle switching

## Current Behavior

### Camera modes
- `camMode='follow'` (default): Camera chases selected enemy at dist 5-8, height 2.5-4. Lerp rate 0.04. Camera snaps lookAt toward each new target.
- `camMode='cube'`: Orbit at cube height, dist 3.0. Lerp rate 0.12. Toggle via double-tap.
- Split-depth zoom: deeper prereq enemies (splitDepth 1-2) get even closer camera.

### Auto-switching triggers
- Target kill → autoSelect picks new enemy → camera lerps to new position
- Double-tap toggles follow/cube mode
- Split-depth changes camera distance

## Solution

### 1. Start zoomed out
- Change default `camZoomMult` from `1.0` to `2.0`
- This doubles the base distances (dist 16, height 8 at default) giving an overview

### 2. Keep cube mode — but it's opt-in via double-tap
- `camMode` stays as `'follow'` (default) and `'cube'` (toggle)
- Double-tap toggle preserved — users who want the close-up can still get it
- Cube mode unchanged (orbit at cube height, fast lerp)

### 3. Reduce follow-mode auto-tracking intensity
- Reduce follow position lerp from `0.04` to `0.02` — camera drifts lazily instead of chasing
- Remove split-depth camera zoom (all enemies use the same base distance regardless of depth)
- Keep lookAt lerp at same rate as position lerp for smooth transitions

### 4. Zoom bounds
- Keep existing zoom range: 0.3x to 4.0x
- Users start at 2.0x (overview) and can scroll/pinch down to 0.3x (very close) if they want

## Blast Radius

- `animate()` follow-mode camera block — simplified (no split-depth branching)
- Default zoom multiplier changed
- No effect on: cube mode, selection, scoring, question panel, labels, reticle, particles

## Implementation Plan

1. Change `camZoomMult` default from 1.0 to 2.0
2. Remove split-depth distance/height calculation — use fixed base values
3. Reduce follow-mode position lerp to 0.02
4. Parse check

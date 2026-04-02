# Music Volume Controls Spec

## Problem Statement

The chord/pad voices are too prominent during gameplay, making it hard to focus on the quiz. The music editor currently has controls for chord selection, pad rhythm, bass pattern, and tempo — but no volume controls for any part of the soundtrack. Players cannot adjust the mix balance.

## Solution Design

### Per-Part Volume Fields

Add three volume fields to each wave in `MUSIC_CONFIG`:

| Field | Range | Default | Purpose |
|-------|-------|---------|---------|
| `padVol` | 0.0 – 1.0 | 0.15 | Controls chord/pad bus gain (lowered from effective 0.35) |
| `bassVol` | 0.0 – 1.0 | 0.20 | Controls bass bus gain (unchanged from current 0.2) |
| `hihatVol` | 0.0 – 1.0 | 0.5 | Controls hi-hat noise gate peak (current hardcoded 0.02 maps to scale 0.5) |

The `padVol` default of 0.15 (vs current 0.35 bus gain) significantly reduces chord presence, addressing the "chords too loud" complaint. Players who want louder chords can slide it up in the editor.

### Volume Mapping

The stored values (0–1) map to actual Web Audio gain as follows:

- **Pad bus**: `padBus.gain = padVol * 0.5` (so 0.15 → 0.075, max 1.0 → 0.5)
- **Bass bus**: `bassBus.gain = bassVol * 0.35` (so 0.20 → 0.07, max 1.0 → 0.35)
- **Hi-hat**: `noiseGate.gain peak = hihatVol * 0.04` (so 0.5 → 0.02, max 1.0 → 0.04)

This keeps the same headroom ceiling as before while giving full range control.

### Music Editor UI

Add three range sliders to the editor panel, grouped as a "VOLUME MIX" section between the pad/bass grids and the action buttons:

```
VOLUME MIX
Pads    [========|--------] 15%
Bass    [==========|------] 20%
Hi-hat  [=========|-------] 50%
```

Each slider:
- `<input type="range" min="0" max="100" step="1">`
- Stored as 0.0–1.0 in config, displayed as 0–100%
- Updates the draft immediately (same pattern as tempo slider)
- Preview reflects the current draft volumes

### Backwards Compatibility

- `sanitizeMusicConfig()` must handle legacy saves missing volume fields
- Default to `{padVol: 0.15, bassVol: 0.20, hihatVol: 0.5}` when fields are absent
- Fields must pass `Number.isFinite()` and be clamped to 0.0–1.0

## Blast Radius

### Config/Persistence
- `DEFAULT_MUSIC_CONFIG` array: add 3 fields to each of the 12 wave objects
- `sanitizeMusicConfig()`: add validation for new fields with fallback defaults
- `loadMusicConfig()` / `saveMusicConfig()`: no changes needed (they serialize the full object)
- `cloneMusicConfig()`: no changes needed (already does full deep clone)
- `td-music-config-v1` localStorage: structure grows by 3 fields per wave

### Audio Engine
- `startBGM()`: pad bus gain ramp now uses `padVol * 0.5` instead of hardcoded 0.35
- `setProgress()`: progress-based pad swell now scales from the per-wave padVol base
- Bass scheduling: bass voice gain uses `bassVol * 0.35` scaling
- Hi-hat scheduling: noise gate peak uses `hihatVol * 0.04`
- `stopBGM()` / `stopPreview()`: unchanged (they ramp to 0 regardless)

### Editor UI
- `renderMusicEditor()`: add volume slider section
- New functions: `updatePadVol(value)`, `updateBassVol(value)`, `updateHihatVol(value)`
- Editor layout: new section between grids and action buttons

### No Impact On
- SFX bus (sound effects for hits, kills, etc.) — stays at 0.8
- Voice allocation / oscillator pool
- Chord selection, pad rhythm, bass pattern logic
- Run checkpointing, SRS, game state

## Implementation Plan

1. Add `padVol`, `bassVol`, `hihatVol` defaults to all 12 waves in `DEFAULT_MUSIC_CONFIG`
2. Update `sanitizeMusicConfig()` to validate and default the new fields
3. Update `startBGM()` to use per-wave volume values instead of hardcoded gains
4. Update `setProgress()` pad swell to use per-wave padVol as base
5. Update bass scheduling to use per-wave bassVol
6. Update hi-hat scheduling to use per-wave hihatVol
7. Add volume slider rendering in `renderMusicEditor()`
8. Add `updatePadVol()`, `updateBassVol()`, `updateHihatVol()` functions
9. Parse check

## Testing Plan

- JS parse check passes
- Legacy config without volume fields loads with correct defaults
- New config with volume fields round-trips through save/load
- Default pad volume is noticeably quieter than before
- All 3 sliders render in editor, show correct values from draft
- Moving a slider updates the draft and preview reflects the change
- Volume values persist across save/load cycle
- Mobile editor layout: sliders fit within scrollable panel

## Edge Cases

- Volume at 0: should silence the part completely (gain = 0)
- Volume at 1: should not clip or distort (mapped to safe maximums)
- Legacy config upgrade: missing fields default gracefully
- Preview with custom volumes: uses draft values
- Mid-run volume: BGM loop re-reads config each cycle, so saved changes take effect on next loop iteration
